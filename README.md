👗 AI Virtual Try-On System

An end-to-end Generative AI-based Virtual Try-On system that allows users to visualize outfits on their own images using Stable Diffusion, Hugging Face Diffusers, and FastAPI.

🚀 Features
👤 User Image Processing – Upload and preprocess human images
👕 Garment Integration – Apply clothing images onto user body
🧠 AI-Based Inpainting – Uses diffusion models for realistic blending
🧍 Pose Alignment – Adjusts garment placement
🎯 Region Masking – Detects clothing regions precisely
⚡ FastAPI Backend – API-based processing
📸 Realistic Output Generation
🛠️ Tech Stack

Languages

Python

AI / ML

Stable Diffusion (Inpainting)
Hugging Face Diffusers
Transformers

Computer Vision

OpenCV
NumPy
PIL

Backend

FastAPI
Uvicorn
📸 Demo (Step-by-Step)
1️⃣ Input Image (Person)

2️⃣ Garment Image

3️⃣ Output (Virtual Try-On Result)

⚙️ How It Works
Upload user image
Upload garment image
Generate mask
Apply diffusion-based inpainting
Generate final output

▶️ Run Locally
git clone https://github.com/Rashi14111/virtual-tryon.git
cd virtual-tryon

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
uvicorn main:app --reload

👉 Open: http://127.0.0.1:8000

📊 Key Highlights

✔ Generative AI project (Stable Diffusion)
✔ End-to-end ML pipeline
✔ FastAPI deployment
✔ Real-world fashion AI use case


👩‍💻 Author

Rashi Garg
📧 rashiigarg1411@gmail.com

🔗 https://github.com/Rashi14111
