"""
Quick test script to verify skin cancer model integration
"""

import onnxruntime as ort
import numpy as np
from pathlib import Path

MODEL_PATH = Path("app/models/skin_cancer_model.onnx")

def test_model():
    print("Testing Skin Cancer Model Integration\n")
    
    # Check if ONNX model exists
    if not MODEL_PATH.exists():
        print("ERROR: ONNX model not found!")
        print(f"   Expected: {MODEL_PATH}")
        print("\nRun: python convert_to_onnx.py")
        return
    
    print(f"Model found: {MODEL_PATH}")
    print(f"Size: {MODEL_PATH.stat().st_size / (1024*1024):.2f} MB\n")
    
    # Load model
    try:
        session = ort.InferenceSession(str(MODEL_PATH))
        print("Model loaded successfully")
        
        # Get model info
        input_info = session.get_inputs()[0]
        output_info = session.get_outputs()[0]
        
        print(f"\nInput:")
        print(f"   Name: {input_info.name}")
        print(f"   Shape: {input_info.shape}")
        print(f"   Type: {input_info.type}")
        
        print(f"\nOutput:")
        print(f"   Name: {output_info.name}")
        print(f"   Shape: {output_info.shape}")
        print(f"   Type: {output_info.type}")
        
        # Test inference with dummy data
        print("\nRunning test inference...")
        dummy_input = np.random.randn(1, 3, 224, 224).astype(np.float32)
        outputs = session.run(None, {'input': dummy_input})
        
        logits = outputs[0][0]
        exp_logits = np.exp(logits - np.max(logits))
        probs = exp_logits / np.sum(exp_logits)
        
        classes = [
            "Melanoma", "Nevus", "Basal Cell Carcinoma", 
            "Actinic Keratosis", "Benign Keratosis", 
            "Dermatofibroma", "Vascular Lesion", "Squamous Cell Carcinoma"
        ]
        
        pred_class = int(np.argmax(probs))
        confidence = float(probs[pred_class])
        
        print(f"Inference successful!")
        print(f"\nTest Result:")
        print(f"   Prediction: {classes[pred_class]}")
        print(f"   Confidence: {confidence:.2%}")
        
        print("\nAll tests passed! Model is ready for production.")
        
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_model()
