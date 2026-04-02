👗 AI Virtual Try-On System

An end-to-end Generative AI-based Virtual Try-On system that allows users to visualize outfits on their own images using Stable Diffusion, Hugging Face Diffusers, and FastAPI.

The system leverages image inpainting, pose estimation, and preprocessing pipelines to generate realistic clothing overlays, simulating how garments would look on a person.

🚀 Features

👤 User Image Processing – Upload and preprocess human images for try-on
👕 Garment Integration – Apply clothing images onto user body
🧠 AI-Based Inpainting – Uses diffusion models for realistic blending
🧍 Pose Alignment – Adjusts garment placement based on body posture
🎯 Region Masking – Detects and replaces clothing regions precisely
⚡ FastAPI Backend – Handles inference and API-based processing
📸 Realistic Output Generation – Produces high-quality try-on visuals

🛠️ Tech Stack

Languages: Python

AI/ML & GenAI:

Hugging Face Diffusers
Stable Diffusion (Inpainting)
Transformers

Computer Vision:

OpenCV
NumPy
PIL

Backend & Deployment:

FastAPI
Uvicorn
📂 Project Structure
virtual-tryon/
│── main.py                # FastAPI backend
│── inference.py          # Model inference pipeline
│── preprocessing.py      # Image preprocessing & masking
│── pose_estimation.py    # Body/pose alignment logic
│── utils.py              # Helper functions
│── requirements.txt      # Dependencies
│── static/               # Input/output images
│── outputs/              # Generated results
│── README.md             # Documentation
📸 Sample Workflow

1️⃣ Upload user image
2️⃣ Upload garment image
3️⃣ Generate masked region
4️⃣ Apply diffusion-based inpainting
5️⃣ Get final try-on output

▶️ Run Locally
git clone https://github.com/Rashi14111/virtual-tryon.git
cd virtual-tryon

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload

Open in browser:

http://127.0.0.1:8000
📊 Key Highlights

✔ Built using Generative AI (Stable Diffusion)
✔ Implemented end-to-end inference pipeline
✔ Integrated FastAPI for real-time serving
✔ Applied Computer Vision + Deep Learning techniques
✔ Designed for scalable AI-based fashion applications

📌 Future Improvements

🔹 Add multi-garment support
🔹 Improve pose accuracy using advanced models
🔹 Deploy on cloud (AWS/GCP)
🔹 Add frontend UI (React / Streamlit)

👩‍💻 Author

Rashi Garg
📧 rashiigarg1411@gmail.com

🔗 GitHub: https://github.com/Rashi14111

⭐ If you like this project, consider giving it a star!
