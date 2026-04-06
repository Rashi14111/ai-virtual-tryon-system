# 👗 AI Virtual Try-On System

An **end-to-end Generative AI-based Virtual Try-On system** that allows users to visualize outfits on their own images using **Stable Diffusion, Hugging Face Diffusers, and FastAPI**.

It leverages **image inpainting, pose estimation, and masking techniques** to generate realistic clothing overlays — simulating how garments would look on a person.

---

## 🚀 Features

- 👤 **User Image Processing** – Upload and preprocess human images  
- 👕 **Garment Integration** – Apply clothing images onto user body  
- 🧠 **AI-Based Inpainting** – Uses Stable Diffusion for realistic blending  
- 🧍 **Pose Alignment** – Adjusts garment placement based on posture  
- 🎯 **Region Masking** – Detects and replaces clothing regions precisely  
- ⚡ **FastAPI Backend** – API-based real-time processing  
- 📸 **High-Quality Output** – Generates realistic try-on visuals  

---

## 🛠️ Tech Stack

**Languages**
- Python  

**AI / ML**
- Stable Diffusion (Inpainting)  
- Hugging Face Diffusers  
- Transformers  

**Computer Vision**
- OpenCV  
- NumPy  
- PIL  

**Backend**
- FastAPI  
- Uvicorn  

---

## 📂 Project Structure


virtual-tryon/
│── main.py # FastAPI backend
│── inference.py # Model inference pipeline
│── preprocessing.py # Image preprocessing & masking
│── pose_estimation.py # Pose alignment logic
│── utils.py # Helper functions
│── requirements.txt # Dependencies
│── static/ # Input images
│── outputs/ # Generated results
│── README.md # Documentation


---

## 📸 Demo Results

### 👩 Female Try-On Example

**Input (Person + Garment) → Output**

![Female Result] 

<img width="255" height="531" alt="image" src="https://github.com/user-attachments/assets/bb9ec106-3955-4f47-b35c-91b8588f019f" />
---

### 👨 Male Try-On Example

**Input (Person + Garment) → Output**

![Male Result]

<img width="258" height="508" alt="image" src="https://github.com/user-attachments/assets/520b23a7-b16e-4e49-ba9c-ec794e4aebfe" />



---

## ⚙️ How It Works

1️⃣ Upload user image  
2️⃣ Upload garment image  
3️⃣ Generate clothing mask  
4️⃣ Apply diffusion-based inpainting  
5️⃣ Generate final try-on output  

📊 Key Highlights

✔ Built using Generative AI (Stable Diffusion)
✔ End-to-end inference pipeline
✔ Real-time API with FastAPI
✔ Combines Computer Vision + Deep Learning
✔ Practical AI application in Fashion Tech


---

## ▶️ Run Locally

```bash
git clone https://github.com/Rashi14111/virtual-tryon.git
cd virtual-tryon

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
uvicorn main:app --reload

👉 Open in browser:
http://127.0.0.1:8000


👩‍💻 Author

Rashi Garg
📧 rashiigarg1411@gmail.com
🔗 https://github.com/Rashi14111
