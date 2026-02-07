# Machine Learning Training

This folder contains all ML model training code and datasets.

## Folder Structure

```
machine_learning/
├── notebooks/           # Jupyter notebooks for training
│   ├── skin_cancer_training.ipynb
│   ├── pneumonia_training.ipynb
│   └── heart_disease_training.ipynb
├── datasets/           # Downloaded datasets (not in git)
│   ├── isic_2019/
│   ├── chest_xray/
│   └── heart_disease/
└── trained_models/     # Exported models (.onnx, .pkl)
```

## Training Steps

### 1. Skin Cancer Model
- Dataset: ISIC 2019/2020
- Model: EfficientNetV2-Small
- Output: `skin_cancer_model.onnx`

### 2. Pneumonia Model
- Dataset: Kermany Chest X-Ray
- Model: MobileNetV3 + Grad-CAM
- Output: `pneumonia_model.onnx`

### 3. Heart Disease Model
- Dataset: UCI Cleveland
- Model: XGBoost
- Output: `heart_disease_model.pkl`

## Requirements

```bash
pip install torch torchvision
pip install tensorflow
pip install xgboost scikit-learn
pip install jupyter notebook
pip install onnx onnxruntime
pip install pandas numpy matplotlib seaborn
```

## After Training

Copy trained models to:
```
../backend/app/models/
```
