import numpy as np
import joblib
import os
from fastapi.concurrency import run_in_threadpool

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/heart_disease_model.pkl")
model = None

try:
    model = joblib.load(MODEL_PATH)
    print(f"Model loaded from: {MODEL_PATH}")
except Exception as e:
    print(f"Failed to load model: {e}")

async def predict_heart_disease(data: dict):
    """Predict heart disease using XGBoost"""
    def _inference():
        if model is None:
            return {
                "success": False,
                "prediction": "Error",
                "confidence": 0.0,
                "details": {"message": "Model not loaded"}
            }
        
        features = np.array([list(data.values())])
        prediction = model.predict(features)[0]
        proba = model.predict_proba(features)[0]
        
        risk_score = float(proba[1])
        
        return {
            "success": True,
            "prediction": "Low Risk" if prediction == 0 else "High Risk",
            "confidence": float(max(proba)),
            "details": {
                "risk_percentage": round(risk_score * 100, 2),
                "message": "Prediction from trained XGBoost model",
                "top_risk_factors": ["cholesterol", "age", "trestbps"]
            }
        }
    
    return await run_in_threadpool(_inference)
