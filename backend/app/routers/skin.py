from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from app.services.image_service import process_skin_image
import io
from PIL import Image

router = APIRouter()

@router.post("/predict")
async def predict_skin_cancer(file: UploadFile = File(...)):
    """
    Skin Cancer Detection Endpoint
    Accepts: JPEG/PNG image of skin lesion
    Returns: Prediction with confidence score
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Process image (preprocessing + inference)
        result = await process_skin_image(image)
        
        return JSONResponse(content=result)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/info")
async def get_skin_info():
    return {
        "model": "EfficientNetV2-Small",
        "classes": ["Melanoma", "Nevus", "Basal Cell Carcinoma", "Actinic Keratosis", 
                    "Benign Keratosis", "Dermatofibroma", "Vascular Lesion", "Squamous Cell Carcinoma"],
        "input_size": "224x224",
        "status": "ready"
    }
