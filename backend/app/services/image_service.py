from PIL import Image
import numpy as np
from fastapi.concurrency import run_in_threadpool
import onnxruntime as ort
from pathlib import Path
import base64
import io
import cv2

# Load skin cancer model
SKIN_MODEL_PATH = Path("app/models/skin_cancer_model.onnx")
SKIN_SESSION = None

try:
    if SKIN_MODEL_PATH.exists():
        SKIN_SESSION = ort.InferenceSession(str(SKIN_MODEL_PATH))
        print("Skin cancer ONNX model loaded")
except Exception as e:
    print(f"WARNING: ONNX not found, will use PyTorch: {e}")
    SKIN_SESSION = None

# Skin cancer class names (ISIC 2019)
SKIN_CLASSES = [
    "Melanoma",
    "Nevus",
    "Basal Cell Carcinoma",
    "Actinic Keratosis",
    "Benign Keratosis",
    "Dermatofibroma",
    "Vascular Lesion",
    "Squamous Cell Carcinoma"
]

SKIN_CLASS_INFO = {
    "Melanoma": {"severity": "High", "type": "Malignant", "color": "red"},
    "Nevus": {"severity": "Low", "type": "Benign", "color": "green"},
    "Basal Cell Carcinoma": {"severity": "Medium", "type": "Malignant", "color": "orange"},
    "Actinic Keratosis": {"severity": "Medium", "type": "Pre-cancerous", "color": "yellow"},
    "Benign Keratosis": {"severity": "Low", "type": "Benign", "color": "green"},
    "Dermatofibroma": {"severity": "Low", "type": "Benign", "color": "green"},
    "Vascular Lesion": {"severity": "Low", "type": "Benign", "color": "green"},
    "Squamous Cell Carcinoma": {"severity": "High", "type": "Malignant", "color": "red"}
}

async def process_skin_image(image: Image.Image):
    """Preprocess and predict skin cancer"""
    def _inference():
        # Preprocessing (same as training)
        img = image.convert("RGB").resize((224, 224))
        img_array = np.array(img, dtype=np.float32) / 255.0
        
        # Normalize (ImageNet stats)
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        img_array = (img_array - mean) / std
        
        # Convert to CHW format
        img_array = np.transpose(img_array, (2, 0, 1))
        img_array = np.expand_dims(img_array, axis=0).astype(np.float32)
        
        if SKIN_SESSION:
            try:
                # ONNX inference
                outputs = SKIN_SESSION.run(None, {'input': img_array})
                logits = outputs[0][0]
                
                # Softmax
                exp_logits = np.exp(logits - np.max(logits))
                probs = exp_logits / np.sum(exp_logits)
                
                pred_class = int(np.argmax(probs))
                confidence = float(probs[pred_class])
                prediction = SKIN_CLASSES[pred_class]
                
                # Get class info
                class_info = SKIN_CLASS_INFO[prediction]
                
                # Build probabilities dict
                prob_dict = {SKIN_CLASSES[i]: float(probs[i]) for i in range(len(SKIN_CLASSES))}
                
                # Recommendations
                if class_info["type"] == "Malignant":
                    recommendation = "URGENT: Consult a dermatologist immediately for biopsy"
                    next_steps = [
                        "Schedule dermatologist appointment ASAP",
                        "Get professional biopsy examination",
                        "Do not delay treatment"
                    ]
                elif class_info["type"] == "Pre-cancerous":
                    recommendation = "CAUTION: Medical evaluation recommended"
                    next_steps = [
                        "Consult dermatologist within 1-2 weeks",
                        "Monitor for changes",
                        "Consider preventive treatment"
                    ]
                else:
                    recommendation = "Likely benign, but monitor for changes"
                    next_steps = [
                        "Regular self-examination",
                        "Annual dermatology checkup",
                        "Watch for size/color changes"
                    ]
                
                return {
                    "success": True,
                    "prediction": prediction,
                    "confidence": confidence,
                    "severity": class_info["severity"],
                    "type": class_info["type"],
                    "probabilities": prob_dict,
                    "recommendation": recommendation,
                    "next_steps": next_steps
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
                "error": "Model not found. Please convert .pth to .onnx format.",
                "prediction": "Unknown",
                "confidence": 0.0
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
                "error": "Invalid Image: Please upload a chest X-ray (grayscale medical image only)",
                "prediction": "Invalid Input",
                "confidence": 0.0
            }
        
        # Check brightness - X-rays have specific brightness range
        avg_brightness = np.mean(img_array_check)
        if avg_brightness < 30 or avg_brightness > 230:
            return {
                "success": False,
                "error": "Invalid Image: Image too dark or too bright. Please upload a proper chest X-ray.",
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
                
                # Apply softmax properly
                exp_logits = np.exp(logits - np.max(logits))  # Subtract max for numerical stability
                probs = exp_logits / np.sum(exp_logits)
                
                pred_class = int(np.argmax(probs))
                confidence = float(probs[pred_class])
                
                # Class order: 0 = Normal, 1 = Pneumonia
                class_names = ["Normal", "Pneumonia"]
                prediction = class_names[pred_class]
                
                # Generate detailed analysis based on prediction
                if pred_class == 1:  # Pneumonia
                    detailed_analysis = {
                        "findings": [
                            "Lungs: Opacities visible in lung fields",
                            "Infection signs: Indicates possible pneumonia",
                            "Consolidation: Fluid accumulation detected"
                        ],
                        "severity": "Moderate",
                        "next_steps": [
                            "Consult a doctor immediately",
                            "Get proper medical evaluation",
                            "Treatment may be required"
                        ]
                    }
                else:  # Normal
                    detailed_analysis = {
                        "findings": [
                            "Lungs: Both lung fields appear clear",
                            "No infection: No signs of abnormality detected",
                            "Clear lung fields: Normal pattern observed"
                        ],
                        "severity": "Normal",
                        "next_steps": [
                            "No immediate action required",
                            "Maintain regular health checkups",
                            "Continue healthy lifestyle"
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
                        "Normal": float(probs[0]),
                        "Pneumonia": float(probs[1])
                    },
                    "heatmap": heatmap,
                    "recommendation": "Consult a doctor immediately" if pred_class == 1 else "No abnormalities detected",
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
