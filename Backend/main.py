"""
Virtual Try-On Backend v4 — Production Grade
uvicorn main:app --port 8000 --timeout-keep-alive 300

pip install fastapi "uvicorn[standard]" python-multipart \
    torch torchvision \
    "diffusers>=0.27" transformers accelerate safetensors \
    controlnet-aux mediapipe rembg \
    Pillow numpy opencv-python-headless
"""

from __future__ import annotations

import base64
import io
import logging
import shutil
import uuid
from pathlib import Path
from typing import Optional, Tuple

import cv2
import numpy as np
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image, ImageEnhance

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("tryon")

# ── Constants ─────────────────────────────────────────────────────────────────
W, H = 384, 512     # SD-1.5 sweet spot; keeps VRAM under 6 GB
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED = {"image/jpeg", "image/jpg", "image/png", "image/webp"}

SD_ID = "runwayml/stable-diffusion-inpainting"
CN_ID = "lllyasviel/control_v11p_sd15_openpose"

PROMPT = (
    "high quality fashion photograph, person wearing the garment, "
    "realistic fabric texture, natural drape, correct body proportions, "
    "professional studio lighting, sharp focus, 8k"
)
NEG_PROMPT = (
    "deformed body, bad anatomy, extra limbs, floating cloth, "
    "blurry, low quality, watermark, text, cartoon, drawing, "
    "ugly, distorted, duplicate, mutated"
)

# ── Device ────────────────────────────────────────────────────────────────────
if torch.cuda.is_available():
    DEVICE, DTYPE = "cuda", torch.float16
elif torch.backends.mps.is_available():
    DEVICE, DTYPE = "mps", torch.float16
else:
    DEVICE, DTYPE = "cpu", torch.float32

log.info("device=%s  dtype=%s", DEVICE, DTYPE)

# ── Global model cache ────────────────────────────────────────────────────────
_pipe = None
_pose_detector = None
_mp_seg = None
_mp_pose = None


def _load_pipe():
    global _pipe
    if _pipe is not None:
        return _pipe

    from diffusers import (
        ControlNetModel,
        StableDiffusionControlNetInpaintPipeline,
        StableDiffusionInpaintPipeline,
    )

    if False:
        try:
            log.info("loading ControlNet …")
            cn = ControlNetModel.from_pretrained(CN_ID, torch_dtype=DTYPE)
            _pipe = StableDiffusionControlNetInpaintPipeline.from_pretrained(
                SD_ID,
                controlnet=cn,
                torch_dtype=DTYPE,
                safety_checker=None,
                requires_safety_checker=False,
            )
            log.info("ControlNet+SD pipeline ready")
        except Exception as exc:
            log.warning("ControlNet load failed (%s) — falling back to plain SD", exc)
            _pipe = None

    if _pipe is None:
        _pipe = StableDiffusionInpaintPipeline.from_pretrained(
            SD_ID,
            torch_dtype=DTYPE,
            safety_checker=None,
            requires_safety_checker=False,
        )
        log.info("plain SD inpaint pipeline ready")

    _pipe = _pipe.to(DEVICE)

    if DEVICE == "cuda":
        try:
            _pipe.enable_xformers_memory_efficient_attention()
        except Exception:
            pass
        _pipe.enable_attention_slicing()
    else:
        _pipe.enable_attention_slicing(1)

    return _pipe


def _load_pose_detector():
    global _pose_detector
    if _pose_detector is None:
        from controlnet_aux import OpenposeDetector
        _pose_detector = OpenposeDetector.from_pretrained("lllyasviel/ControlNet")
    return _pose_detector


def _load_mp_seg():
    global _mp_seg
    if _mp_seg is None:
        import mediapipe as mp
        _mp_seg = mp.solutions.selfie_segmentation.SelfieSegmentation(model_selection=1)
    return _mp_seg


def _load_mp_pose():
    global _mp_pose
    if _mp_pose is None:
        import mediapipe as mp
        _mp_pose = mp.solutions.pose.Pose(
            static_image_mode=True, model_complexity=2, enable_segmentation=False
        )
    return _mp_pose


# ─────────────────────────────────────────────────────────────────────────────
# Preprocessing
# ─────────────────────────────────────────────────────────────────────────────

def _fit_image(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    """Cover-scale → centre-crop."""
    img = img.convert("RGB")
    w, h = img.size
    s = max(target_w / w, target_h / h)
    img = img.resize((int(w * s), int(h * s)), Image.LANCZOS)
    w, h = img.size
    return img.crop(((w - target_w) // 2, (h - target_h) // 2,
                     (w + target_w) // 2, (h + target_h) // 2))


def preprocess_person(raw: Image.Image) -> Image.Image:
    img = _fit_image(raw, W, H)
    arr = np.array(img)
    lab = cv2.cvtColor(arr, cv2.COLOR_RGB2LAB)
    lab[:, :, 0] = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8, 8)).apply(lab[:, :, 0])
    return Image.fromarray(cv2.cvtColor(lab, cv2.COLOR_LAB2RGB))


def preprocess_garment(raw: Image.Image) -> Image.Image:
    try:
        from rembg import remove as rembg_remove
        buf = io.BytesIO()
        raw.save(buf, format="PNG")
        img = Image.open(io.BytesIO(rembg_remove(buf.getvalue()))).convert("RGBA")
    except Exception:
        img = raw.convert("RGBA")
        data = np.array(img)
        bg = (data[..., 3] < 30) | (
            (data[..., 0] > 220) & (data[..., 1] > 220) & (data[..., 2] > 220)
        )
        data[bg] = [255, 255, 255, 0]
        img = Image.fromarray(data)

    canvas = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    cw, ch = img.size
    s = min(W / cw, H / ch) * 0.82
    img = img.resize((int(cw * s), int(ch * s)), Image.LANCZOS)
    ox = (W - img.width) // 2
    oy = (H - img.height) // 2
    canvas.paste(img, (ox, oy), img)
    return canvas.convert("RGB")


# ─────────────────────────────────────────────────────────────────────────────
# Mask generation
# ─────────────────────────────────────────────────────────────────────────────

def _person_silhouette(img: Image.Image) -> np.ndarray:
    seg = _load_mp_seg()
    result = seg.process(np.array(img))
    return (result.segmentation_mask > 0.4).astype(np.uint8) * 255


def _torso_bbox(img: Image.Image) -> Tuple[int, int, int, int]:
    import mediapipe as mp
    pose = _load_mp_pose()
    result = pose.process(np.array(img))
    PL = mp.solutions.pose.PoseLandmark
    h, w = H, W

    if result.pose_landmarks:
        lm = result.pose_landmarks.landmark
        ys = [lm[PL.LEFT_SHOULDER].y,  lm[PL.RIGHT_SHOULDER].y,
              lm[PL.LEFT_HIP].y,        lm[PL.RIGHT_HIP].y]
        xs = [lm[PL.LEFT_SHOULDER].x,  lm[PL.RIGHT_SHOULDER].x,
              lm[PL.LEFT_HIP].x,        lm[PL.RIGHT_HIP].x]
        y1 = max(0, int(min(ys) * h) - int(0.04 * h))
        y2 = min(h, int(max(ys) * h) + int(0.06 * h))
        x1 = max(0, int(min(xs) * w) - int(0.08 * w))
        x2 = min(w, int(max(xs) * w) + int(0.08 * w))
        return y1, y2, x1, x2

    return int(h * 0.12), int(h * 0.72), int(w * 0.04), int(w * 0.96)


def generate_mask(person_img: Image.Image) -> Image.Image:
    try:
        sil = _person_silhouette(person_img)
        y1, y2, x1, x2 = _torso_bbox(person_img)

        region = np.zeros((H, W), dtype=np.uint8)
        region[y1:y2, x1:x2] = 255
        mask = cv2.bitwise_and(sil, region)

        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE,  k, iterations=2)
        mask = cv2.morphologyEx(mask, cv2.MORPH_DILATE, k, iterations=1)
        mask = cv2.GaussianBlur(mask, (21, 21), 0)
        _, mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)

        if mask.mean() < 5:
            mask = region.copy()

        return Image.fromarray(mask, mode="L")

    except Exception as exc:
        log.error("mask generation failed (%s) — heuristic fallback", exc)
        arr = np.zeros((H, W), dtype=np.uint8)
        arr[int(H * 0.12):int(H * 0.72), int(W * 0.04):int(W * 0.96)] = 255
        return Image.fromarray(arr, mode="L")


# ─────────────────────────────────────────────────────────────────────────────
# Inference
# ─────────────────────────────────────────────────────────────────────────────

def _pose_image(person_img: Image.Image) -> Optional[Image.Image]:
    try:
        return _load_pose_detector()(person_img)
    except Exception as exc:
        log.warning("pose extraction failed (%s)", exc)
        return None


def _garment_prompt(garment_img: Image.Image) -> str:
    try:
        from sklearn.cluster import MiniBatchKMeans
        arr = np.array(garment_img.convert("RGB"))
        crop = arr[arr.shape[0] // 6: 5 * arr.shape[0] // 6,
                   arr.shape[1] // 6: 5 * arr.shape[1] // 6].reshape(-1, 3)
        non_bg = crop[~np.all(crop > 230, axis=1)]
        if len(non_bg) < 50:
            return PROMPT
        km = MiniBatchKMeans(n_clusters=3, n_init=3, random_state=0).fit(non_bg)
        c = km.cluster_centers_[np.bincount(km.labels_).argmax()].astype(int)
        return f"{PROMPT}, rgb({c[0]},{c[1]},{c[2]}) coloured fabric"
    except Exception:
        return PROMPT


def run_inference(
    person_img:  Image.Image,
    mask_img:    Image.Image,
    garment_img: Image.Image,
) -> Image.Image:
    pipe  = _load_pipe()
    gen   = torch.Generator(device=DEVICE).manual_seed(42)
    prompt = _garment_prompt(garment_img)

    kwargs = dict(
        prompt=prompt,
        negative_prompt=NEG_PROMPT,
        image=person_img,
        mask_image=mask_img,
        height=H, width=W,
        num_inference_steps=15,
        guidance_scale=7.5,
        strength=0.75,
        generator=gen,
    )

    from diffusers import StableDiffusionControlNetInpaintPipeline
    if isinstance(pipe, StableDiffusionControlNetInpaintPipeline):
        pose = _pose_image(person_img)
        if pose is not None:
            kwargs["control_image"] = pose
            kwargs["controlnet_conditioning_scale"] = 0.7
        else:
            from diffusers import StableDiffusionInpaintPipeline
            plain = StableDiffusionInpaintPipeline(
                vae=pipe.vae,
                text_encoder=pipe.text_encoder,
                tokenizer=pipe.tokenizer,
                unet=pipe.unet,
                scheduler=pipe.scheduler,
                safety_checker=None,
                feature_extractor=None,
                requires_safety_checker=False,
            ).to(DEVICE)
            return plain(**kwargs).images[0]

    return pipe(**kwargs).images[0]


# ─────────────────────────────────────────────────────────────────────────────
# Postprocessing
# ─────────────────────────────────────────────────────────────────────────────

def postprocess(
    result:     Image.Image,
    person_img: Image.Image,
    mask_img:   Image.Image,
) -> Image.Image:
    mask_arr  = np.array(mask_img.convert("L"))
    soft      = cv2.GaussianBlur(mask_arr, (31, 31), 0).astype(np.float32) / 255.0
    alpha     = np.stack([soft] * 3, axis=-1)

    orig = np.array(person_img).astype(np.float32)
    gen  = np.array(result.resize(person_img.size, Image.LANCZOS)).astype(np.float32)
    out  = (gen * alpha + orig * (1 - alpha)).clip(0, 255).astype(np.uint8)

    img = Image.fromarray(out)
    img = ImageEnhance.Sharpness(img).enhance(1.15)
    img = ImageEnhance.Color(img).enhance(1.05)
    return img


# ─────────────────────────────────────────────────────────────────────────────
# Pipeline orchestrator
# ─────────────────────────────────────────────────────────────────────────────

def run_pipeline(person_path: Path, cloth_path: Path) -> str:
    person_raw  = Image.open(person_path).convert("RGB")
    garment_raw = Image.open(cloth_path).convert("RGB")

    person_img  = preprocess_person(person_raw)
    garment_img = preprocess_garment(garment_raw)
    mask_img    = generate_mask(person_img)

    result = run_inference(person_img, mask_img, garment_img)
    final  = postprocess(result, person_img, mask_img)

    buf = io.BytesIO()
    final.save(buf, format="JPEG", quality=93)
    return base64.b64encode(buf.getvalue()).decode()


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(title="Virtual Try-On API", version="4.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _save(file: UploadFile) -> Path:
    ext  = Path(file.filename or "img.jpg").suffix or ".jpg"
    dest = UPLOAD_DIR / f"{uuid.uuid4().hex}{ext}"
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    return dest


@app.get("/")
def root():
    return {"status": "ok", "device": DEVICE}


@app.get("/health")
def health():
    return {"status": "ok", "device": DEVICE}


@app.post("/tryon")
def virtual_tryon(
    person_image: UploadFile = File(...),
    cloth_image:  UploadFile = File(...),
):
    for upload, label in ((person_image, "person_image"), (cloth_image, "cloth_image")):
        if upload.content_type not in ALLOWED:
            raise HTTPException(400, detail=f"{label}: unsupported type {upload.content_type}")

    person_path = _save(person_image)
    cloth_path  = _save(cloth_image)

    try:
        result_b64 = run_pipeline(person_path, cloth_path)
    except Exception as exc:
        log.exception("pipeline error")
        raise HTTPException(500, detail=str(exc))
    finally:
        person_path.unlink(missing_ok=True)
        cloth_path.unlink(missing_ok=True)

    return JSONResponse({
        "success":      True,
        "result_image": f"data:image/jpeg;base64,{result_b64}",
        "mime":         "image/jpeg",
        "mode":         "ai-tryon",
    })