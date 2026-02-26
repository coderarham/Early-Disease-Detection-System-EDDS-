# Backend Setup - Skin Cancer Model Integration

## ✅ Current Status
- ✅ `skin_cancer_best.pth` model placed in `app/models/`
- ⚠️ Need to convert to ONNX for production

## 🔄 Convert Model to ONNX

### Step 1: Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Convert .pth to .onnx
```bash
python convert_to_onnx.py
```

This will create `app/models/skin_cancer_model.onnx`

## 🚀 Run Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📡 Test API

### Skin Cancer Endpoint
```bash
curl -X POST "http://localhost:8000/api/skin/predict" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_image.jpg"
```

### Response Format
```json
{
  "success": true,
  "prediction": "Melanoma",
  "confidence": 0.87,
  "severity": "High",
  "type": "Malignant",
  "probabilities": {
    "Melanoma": 0.87,
    "Nevus": 0.05,
    "Basal Cell Carcinoma": 0.03,
    ...
  },
  "recommendation": "⚠️ Urgent: Consult a dermatologist immediately",
  "next_steps": [
    "Schedule dermatologist appointment ASAP",
    "Get professional biopsy examination",
    "Do not delay treatment"
  ]
}
```

## 📊 Model Details

- **Architecture**: EfficientNetV2-Small
- **Classes**: 8 (ISIC 2019)
  - Melanoma
  - Nevus
  - Basal Cell Carcinoma
  - Actinic Keratosis
  - Benign Keratosis
  - Dermatofibroma
  - Vascular Lesion
  - Squamous Cell Carcinoma
- **Input Size**: 224x224 RGB
- **Format**: ONNX (optimized for CPU inference)

## 🔧 Troubleshooting

### If ONNX conversion fails:
```bash
pip install --upgrade torch torchvision timm onnx
```

### If model not loading:
Check file paths in `app/services/image_service.py`

## 📝 API Documentation
Visit: http://localhost:8000/docs
