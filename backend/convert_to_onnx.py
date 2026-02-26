"""
Convert PyTorch .pth model to ONNX format
Run this after training: python convert_to_onnx.py
"""

import torch
import timm
from pathlib import Path

# Paths
PTH_PATH = Path("app/models/skin_cancer_best.pth")
ONNX_PATH = Path("app/models/skin_cancer_model.onnx")

# Model config (same as training)
MODEL_NAME = "tf_efficientnetv2_s"
NUM_CLASSES = 8
IMG_SIZE = 224

def convert():
    print("Converting PyTorch model to ONNX...")
    
    # Check if .pth exists
    if not PTH_PATH.exists():
        print(f"ERROR: {PTH_PATH} not found!")
        return
    
    # Load model architecture
    print("Loading model architecture...")
    model = timm.create_model(MODEL_NAME, pretrained=False, num_classes=NUM_CLASSES)
    
    # Load trained weights
    print("Loading trained weights...")
    state_dict = torch.load(PTH_PATH, map_location='cpu')
    model.load_state_dict(state_dict)
    model.eval()
    
    # Create dummy input
    dummy_input = torch.randn(1, 3, IMG_SIZE, IMG_SIZE)
    
    # Export to ONNX
    print("Exporting to ONNX...")
    torch.onnx.export(
        model,
        dummy_input,
        ONNX_PATH,
        export_params=True,
        opset_version=14,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
    )
    
    print(f"Conversion complete!")
    print(f"ONNX model saved: {ONNX_PATH}")
    print(f"Model size: {ONNX_PATH.stat().st_size / (1024*1024):.2f} MB")

if __name__ == "__main__":
    convert()
