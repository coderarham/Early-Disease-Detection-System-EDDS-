from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import skin, lung, heart

# Global dictionary to store loaded models
ml_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: Load models into memory"""
    print("🚀 Loading ML models...")
    # Models will be loaded here after training
    ml_models["skin_model"] = None  # Placeholder
    ml_models["lung_model"] = None  # Placeholder
    ml_models["heart_model"] = None  # Placeholder
    print("✅ Models loaded successfully")
    yield
    # Shutdown: Clear memory
    ml_models.clear()
    print("🛑 Models unloaded")

app = FastAPI(
    title="Early Disease Detection System (EDDS)",
    description="AI-powered system for Skin Cancer, Pneumonia, and Heart Disease detection",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(skin.router, prefix="/api/skin", tags=["Skin Cancer"])
app.include_router(lung.router, prefix="/api/lung", tags=["Pneumonia"])
app.include_router(heart.router, prefix="/api/heart", tags=["Heart Disease"])

@app.get("/")
async def root():
    return {"message": "EDDS API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "models_loaded": {
            "skin": ml_models.get("skin_model") is not None,
            "lung": ml_models.get("lung_model") is not None,
            "heart": ml_models.get("heart_model") is not None
        }
    }
