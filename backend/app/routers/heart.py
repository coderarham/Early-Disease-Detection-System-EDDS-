from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.schemas.models import HeartDiseaseInput, PredictionResponse
from app.services.tabular_service import predict_heart_disease

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
async def predict_heart(data: HeartDiseaseInput):
    """
    Heart Disease Prediction Endpoint
    Accepts: Patient vital signs (JSON)
    Returns: Risk assessment with SHAP values
    """
    try:
        result = await predict_heart_disease(data.model_dump())
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/info")
async def get_heart_info():
    return {
        "model": "XGBoost Classifier",
        "features": ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", 
                     "thalach", "exang", "oldpeak", "slope", "ca", "thal"],
        "output": "Binary (Disease/No Disease)",
        "explainability": "SHAP values",
        "status": "ready"
    }
