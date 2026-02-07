import numpy as np
from fastapi.concurrency import run_in_threadpool

async def predict_heart_disease(data: dict):
    """Predict heart disease using XGBoost"""
    def _inference():
        # Convert to numpy array
        features = np.array([list(data.values())])
        
        # TODO: Replace with actual XGBoost model after training
        # Mock prediction
        risk_score = 0.35  # 35% risk
        
        return {
            "success": True,
            "prediction": "Low Risk" if risk_score < 0.5 else "High Risk",
            "confidence": float(1 - risk_score) if risk_score < 0.5 else float(risk_score),
            "details": {
                "risk_percentage": round(risk_score * 100, 2),
                "message": "Model not trained yet. SHAP values will be added after training.",
                "top_risk_factors": ["cholesterol", "age", "trestbps"]  # Placeholder
            }
        }
    
    return await run_in_threadpool(_inference)
