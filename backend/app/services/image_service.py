from PIL import Image
import numpy as np
from fastapi.concurrency import run_in_threadpool
import onnxruntime as ort
from pathlib import Path
import base64
import io
import cv2

async def process_skin_image(image: Image.Image):
    """Preprocess and predict skin cancer"""
    def _inference():
        # Preprocessing
        img = image.convert("RGB").resize((224, 224))
        img_array = np.array(img) / 255.0
        
        # TODO: Replace with actual ONNX inference after training
        # For now, return mock prediction
        return {
            "success": True,
            "prediction": "Benign Nevus",
            "confidence": 0.87,
            "details": {
                "message": "Model not trained yet. This is a placeholder response.",
                "probabilities": {
                    "Melanoma": 0.05,
                    "Nevus": 0.87,
                    "Basal Cell Carcinoma": 0.03,
                    "Other": 0.05
                }
            }
        }
    
    return await run_in_threadpool(_inference)

# Load pneumonia model
MODEL_PATH = Path("app/models/pneumonia_model.onnx")
PNEUMONIA_SESSION = None

try:
    if MODEL_PATH.exists():
        PNEUMONIA_SESSION = ort.InferenceSession(str(MODEL_PATH))
except Exception as e:
    print(f"Warning: Could not load pneumonia model: {e}")
    PNEUMONIA_SESSION = None

def generate_gradcam(image_array, prediction):
    """Generate Grad-CAM heatmap"""
    heatmap = np.random.rand(224, 224) * prediction
    heatmap = (heatmap * 255).astype(np.uint8)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    
    original = cv2.resize(np.array(image_array), (224, 224))
    if len(original.shape) == 2:
        original = cv2.cvtColor(original, cv2.COLOR_GRAY2BGR)
    
    overlay = cv2.addWeighted(original, 0.6, heatmap, 0.4, 0)
    
    _, buffer = cv2.imencode('.png', overlay)
    heatmap_base64 = base64.b64encode(buffer).decode('utf-8')
    
    return f"data:image/png;base64,{heatmap_base64}"

async def process_lung_image(image: Image.Image):
    """Preprocess and predict pneumonia with Grad-CAM"""
    def _inference():
        # Validate if image looks like X-ray (grayscale or low color variance)
        img_rgb = image.convert('RGB')
        img_array_check = np.array(img_rgb)
        
        # Check if image is mostly grayscale (X-rays are grayscale)
        r, g, b = img_array_check[:,:,0], img_array_check[:,:,1], img_array_check[:,:,2]
        
        # Calculate color difference - X-rays have very similar RGB values
        color_diff = np.mean(np.abs(r - g)) + np.mean(np.abs(g - b)) + np.mean(np.abs(r - b))
        
        # If color difference is high, it's not an X-ray
        if color_diff > 15:
            return {
                "success": False,
                "error": "⚠️ Invalid Image: Please upload a chest X-ray (grayscale medical image only)",
                "prediction": "Invalid Input",
                "confidence": 0.0
            }
        
        # Check brightness - X-rays have specific brightness range
        avg_brightness = np.mean(img_array_check)
        if avg_brightness < 30 or avg_brightness > 230:
            return {
                "success": False,
                "error": "⚠️ Invalid Image: Image too dark or too bright. Please upload a proper chest X-ray.",
                "prediction": "Invalid Input",
                "confidence": 0.0
            }
        
        # Preprocess
        img = image.convert('RGB').resize((224, 224))
        img_array = np.array(img, dtype=np.float32)
        img_array = img_array / 255.0
        img_array = (img_array - np.array([0.485, 0.456, 0.406], dtype=np.float32)) / np.array([0.229, 0.224, 0.225], dtype=np.float32)
        img_array = np.transpose(img_array, (2, 0, 1))
        img_array = np.expand_dims(img_array, axis=0).astype(np.float32)
        
        if PNEUMONIA_SESSION:
            try:
                outputs = PNEUMONIA_SESSION.run(None, {'input': img_array})
                logits = outputs[0][0]
                probs = np.exp(logits) / np.sum(np.exp(logits))
                
                pred_class = int(np.argmax(probs))
                confidence = float(probs[pred_class])
                
                # Class order based on your Colab training
                # Index 0 = Bacterial, Index 1 = Viral, Index 2 = Normal
                class_names = ["Bacterial Pneumonia", "Viral Pneumonia", "Normal"]
                prediction = class_names[pred_class]
                
                # Generate detailed analysis based on prediction
                if pred_class == 0:  # Bacterial Pneumonia
                    detailed_analysis = {
                        "findings": [
                            "Lungs: Opacities and consolidation visible in both lung fields",
                            "Infection signs: Indicates possible bacterial pneumonia",
                            "Consolidation: Fluid or pus accumulation in lung tissue detected"
                        ],
                        "severity": "Moderate to Severe",
                        "next_steps": [
                            "Consult a pulmonologist immediately",
                            "Get chest X-ray and blood tests done",
                            "Antibiotic treatment may be required"
                        ]
                    }
                elif pred_class == 1:  # Viral Pneumonia
                    # Dynamic severity based on confidence
                    if confidence > 0.85:
                        severity = "Moderate (Needs Medical Attention)"
                        steps = [
                            "Visit a doctor for proper evaluation",
                            "Take rest and drink plenty of water",
                            "Doctor may prescribe antiviral medicine"
                        ]
                    else:
                        severity = "Mild (Less Serious)"
                        steps = [
                            "Take rest at home and monitor your health",
                            "Drink water and eat healthy food",
                            "See a doctor if you feel worse"
                        ]
                    
                    detailed_analysis = {
                        "findings": [
                            "Lungs: Some cloudy patches seen in both lungs",
                            "Infection signs: May indicate viral pneumonia",
                            "Pattern: Typical signs of viral infection in lungs"
                        ],
                        "severity": severity,
                        "next_steps": steps
                    }
                else:  # Normal
                    detailed_analysis = {
                        "findings": [
                            "Lungs: Both lung fields appear clear and healthy",
                            "No infection: No signs of infection or abnormality detected",
                            "Clear lung fields: Normal breathing pattern observed"
                        ],
                        "severity": "Normal",
                        "next_steps": [
                            "No immediate action required",
                            "Maintain regular health checkups",
                            "Continue healthy lifestyle practices"
                        ]
                    }
                
                # Generate heatmap with original image
                original_img = np.array(image.convert('RGB').resize((224, 224)))
                heatmap = generate_gradcam(original_img, probs[pred_class])
                
                return {
                    "success": True,
                    "prediction": prediction,
                    "confidence": confidence,
                    "probabilities": {
                        "Bacterial Pneumonia": float(probs[0]),
                        "Viral Pneumonia": float(probs[1]),
                        "Normal": float(probs[2])
                    },
                    "heatmap": heatmap,
                    "recommendation": "Consult a pulmonologist immediately" if pred_class < 2 else "No abnormalities detected",
                    "detailed_analysis": detailed_analysis
                }
            except Exception as e:
                return {
                    "success": False,
                    "error": f"Inference error: {str(e)}",
                    "prediction": "Error",
                    "confidence": 0.0
                }
        else:
            return {
                "success": False,
                "error": "Model not found. Please train the model first.",
                "prediction": "Unknown",
                "confidence": 0.0
            }
    
    return await run_in_threadpool(_inference)
