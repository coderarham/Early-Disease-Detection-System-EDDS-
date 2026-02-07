# Early Disease Detection System (EDDS)


AI-powered medical diagnosis system for **Skin Cancer**, **Pneumonia**, and **Heart Disease**.

## Project Structure

```
EDDS/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── models/       # Trained ML models (.onnx, .pkl)
│   │   ├── routers/      # API endpoints
│   │   ├── services/     # Business logic
│   │   └── schemas/      # Pydantic models
│   └── requirements.txt
├── frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── machine_learning/     # ML training code
    ├── notebooks/        # Training scripts
    ├── datasets/         # Downloaded datasets
    └── trained_models/   # Exported models
```

## Setup Instructions

### Backend Setup

1. **Create virtual environment:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Run FastAPI server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at: `http://localhost:8000`
Swagger docs: `http://localhost:8000/docs`

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Run development server:**
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## Datasets (For Training - Later)

| Disease | Dataset | Source |
|---------|---------|--------|
| Skin Cancer | ISIC 2019/2020 | https://challenge.isic-archive.com/data/ |
| Pneumonia | Kermany Chest X-Ray | https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia |
| Heart Disease | UCI Cleveland | https://archive.ics.uci.edu/dataset/45/heart+disease |

##  ML Models (To be trained)

- **Skin Cancer:** EfficientNetV2-Small (ONNX)
- **Pneumonia:** MobileNetV3 (ONNX) + Grad-CAM
- **Heart Disease:** XGBoost + SHAP

##  Tech Stack

**Backend:**
- FastAPI (Async API)
- ONNX Runtime (Fast inference)
- XGBoost (Tabular data)
- Pillow (Image processing)

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- React Router
- Recharts (Visualization)
- Axios (API calls)

##  API Endpoints

- `POST /api/skin/predict` - Skin cancer detection
- `POST /api/lung/predict` - Pneumonia detection
- `POST /api/heart/predict` - Heart disease prediction
- `GET /health` - Health check

##  Current Status

 Backend structure ready
 Frontend UI ready
 ML models need training (next step)

##  Next Steps

1. Download datasets
2. Train models in Jupyter notebooks
3. Export models to ONNX/pickle format
4. Place models in `backend/app/models/`
5. Update inference code in services
