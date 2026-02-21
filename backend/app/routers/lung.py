from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from app.services.image_service import process_lung_image
import io
from PIL import Image

router = APIRouter()

@router.post("/predict")
async def predict_pneumonia(file: UploadFile = File(...)):
    """
    Pneumonia Detection Endpoint
    Accepts: Chest X-Ray image
    Returns: Prediction (Normal/Bacterial/Viral) with heatmap
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        result = await process_lung_image(image)
        
        return JSONResponse(content=result)
    
    except Exception as e:
        print(f"ERROR in predict_pneumonia: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/test")
async def test_model():
    """Test if model is loaded"""
    from app.services.image_service import PNEUMONIA_SESSION
    if PNEUMONIA_SESSION:
        return {"status": "Model loaded", "ready": True}
    else:
        return {"status": "Model not found", "ready": False}

@router.get("/info")
async def get_lung_info():
    from app.services.image_service import PNEUMONIA_SESSION
    return {
        "model": "MobileNetV3",
        "classes": ["Normal", "Bacterial Pneumonia", "Viral Pneumonia"],
        "input_size": "224x224",
        "features": ["Grad-CAM heatmap"],
        "status": "ready" if PNEUMONIA_SESSION else "model not loaded"
    }
