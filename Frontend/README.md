# FitAI — Virtual Try-On

A full-stack AI-powered Virtual Try-On application using **IDM-VTON** (via Hugging Face Spaces), **FastAPI**, and **React + Vite**.

---

## 📁 Project Structure

```
virtual-tryon/
├── backend/
│   ├── main.py            # FastAPI server
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUploadZone.jsx
│   │   │   ├── LoadingOverlay.jsx
│   │   │   └── ResultPanel.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |

---

### 1. Backend Setup

```bash
cd virtual-tryon/backend

# Create virtual environment (recommended)
python -m venv venv

# Activate it
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

The backend will be available at: **http://localhost:8000**

Health check: http://localhost:8000/health

---

### 2. Frontend Setup

Open a **new terminal**:

```bash
cd virtual-tryon/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend will be available at: **http://localhost:5173**

---

## 🎯 How to Use

1. **Open** http://localhost:5173 in your browser
2. **Upload a person image** — clear full-body photo works best
3. **Upload a clothing image** — garment on white/plain background
4. **Click "Try it on"** — wait 20–60 seconds for the AI to process
5. **Download** your result

---

## 🔌 API Reference

### `POST /tryon`

Accepts two images and returns a base64-encoded result.

**Request** (multipart/form-data):
| Field | Type | Description |
|-------|------|-------------|
| `person_image` | File | Person photo (JPG/PNG/WebP) |
| `cloth_image` | File | Clothing photo (JPG/PNG/WebP) |

**Response** (JSON):
```json
{
  "success": true,
  "result_image": "data:image/png;base64,...",
  "message": "Try-on completed successfully"
}
```

**Error Response**:
```json
{
  "detail": "Model inference failed: ..."
}
```

---

## ⚡ Model Details

- **Model**: [yisol/IDM-VTON](https://huggingface.co/spaces/yisol/IDM-VTON)
- **Backend**: Hugging Face Spaces via `gradio_client`
- **Parameters used**:
  - `denoise_steps`: 45
  - `is_checked`: True (use auto-generated mask)
  - `is_checked_crop`: True (use auto-crop & resize)
  - `seed`: 42

---

## 🛠 Image Preprocessing

### Person image:
- Resized maintaining aspect ratio (scale to cover 768×1024)
- Center-cropped to exactly **768 × 1024**

### Clothing image:
- Transparent pixels replaced with **white**
- Scaled to fit within 768×1024 with 15% padding (centered)
- Placed on pure white canvas

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot reach backend" | Make sure FastAPI is running on port 8000 |
| "Model inference failed" | HF Space may be sleeping — retry in 30s |
| Slow first response | Normal — Space cold start takes 30–60s |
| CORS errors | Ensure frontend runs on port 5173 or 3000 |
| `gradio_client` not found | Run `pip install gradio_client` |

---

## 📦 Building for Production

### Backend
```bash
# Run with multiple workers
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
```

### Frontend
```bash
cd frontend
npm run build
# Output is in frontend/dist/
```

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5 |
| Styling | Pure CSS with CSS Variables |
| Backend | FastAPI, Python 3.10+ |
| AI Model | IDM-VTON (Hugging Face) |
| Model Client | gradio_client |
| Image Processing | Pillow, NumPy |

---

## 📝 Notes

- The Hugging Face Space `yisol/IDM-VTON` is a **free public Space**. It may be rate-limited or slow during peak hours.
- For production use, consider hosting the model privately or using the Hugging Face Inference API.
- Results quality depends on input image quality. Use well-lit, front-facing person photos.
