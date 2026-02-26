"""

PNEUMONIA DETECTION MODEL TRAINING


NOTE: This code is designed to run in Google Colab, not locally.
The trained model (pneumonia_model.onnx) is already in backend/app/models/

To retrain the model:
1. Open Google Colab: https://colab.research.google.com/
2. Copy this code into a new notebook
3. Upload your kaggle.json file when prompted
4. Run all cells sequentially
5. Download the generated pneumonia_model.onnx file
6. Place it in backend/app/models/

Dataset: Kermany Chest X-Ray Pneumonia Dataset
Source: https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia
Model: MobileNetV3-Small with Grad-CAM
"""

# 
# # CELL 1: Install
# 
# !pip install onnx onnxruntime onnxscript kaggle

# 
# # CELL 2: Imports
# 
# import torch
# import torch.nn as nn
# import torchvision.models as models
# import torchvision.transforms as transforms
# from torch.utils.data import DataLoader, Dataset
# from PIL import Image
# import os
# import cv2
# import zipfile
# import numpy as np
# from pathlib import Path
# from sklearn.metrics import classification_report, confusion_matrix
# import onnx
# import onnxruntime as ort
# import matplotlib.pyplot as plt

# 
# # CELL 3: Kaggle Dataset Setup
# 
# def setup_kaggle_dataset():
#     dataset_zip = Path('chest-xray-pneumonia.zip')
#     extracted_path = Path('/content/chest_xray')
#     
#     if extracted_path.exists():
#         print("Dataset already extracted. Skipping download.")
#         return
#     
#     kaggle_config_path = Path('/root/.kaggle/kaggle.json')
#     local_kaggle_json = Path('/content/kaggle.json')
#     
#     if not kaggle_config_path.exists():
#         if not local_kaggle_json.exists():
#             from google.colab import files
#             print("Please upload 'kaggle.json':")
#             uploaded = files.upload()
#             for fn in uploaded.keys():
#                 !mkdir -p ~/.kaggle
#                 !cp {fn} ~/.kaggle/
#         else:
#             !mkdir -p ~/.kaggle
#             !cp /content/kaggle.json ~/.kaggle/
#         !chmod 600 ~/.kaggle/kaggle.json
#     
#     if not dataset_zip.exists():
#         print("Downloading from Kaggle...")
#         !kaggle datasets download -d paultimothymooney/chest-xray-pneumonia
#     
#     print("Unzipping...")
#     with zipfile.ZipFile('chest-xray-pneumonia.zip', 'r') as zip_ref:
#         zip_ref.extractall('/content/')
#     print("Done!")
# 
# setup_kaggle_dataset()

# 
# # CELL 4: Configuration & Dataset Class
# 
# def find_data_root(search_path="/content"):
#     for root, dirs, files in os.walk(search_path):
#         if "train" in dirs and ("NORMAL" in os.listdir(os.path.join(root, "train")) or "normal" in os.listdir(os.path.join(root, "train"))):
#             return Path(root)
#     return None
# 
# DATASET_PATH = find_data_root()
# if DATASET_PATH:
#     print(f"Data Root found at: {DATASET_PATH}")
# else:
#     print("!!! WARNING: Could not find 'train' folder with 'NORMAL' subfolder automatically. !!!")
#     DATASET_PATH = Path("/content/chest_xray/chest_xray")
# 
# MODEL_SAVE_PATH = Path("./trained_models")
# BATCH_SIZE = 32
# EPOCHS = 5
# IMG_SIZE = 224
# LEARNING_RATE = 0.001
# 
# class ChestXRayDataset(Dataset):
#     def __init__(self, root_dir, transform=None):
#         self.root_dir = Path(root_dir)
#         self.transform = transform
#         self.images = []
#         self.labels = []
#         
#         categories = {
#             'NORMAL': 0, 'normal': 0,
#             'PNEUMONIA': 1, 'pneumonia': 1
#         }
#         
#         for cat_name, label in categories.items():
#             cat_dir = self.root_dir / cat_name
#             if cat_dir.exists():
#                 for ext in ["*.jpeg", "*.jpg", "*.png"]:
#                     for img_path in cat_dir.glob(ext):
#                         self.images.append(str(img_path))
#                         self.labels.append(label)
#         
#         print(f"Loaded {len(self.images)} images from {self.root_dir}")
#     
#     def __len__(self):
#         return len(self.images)
#     
#     def __getitem__(self, idx):
#         img_path = self.images[idx]
#         try:
#             image = Image.open(img_path).convert('RGB')
#             label = self.labels[idx]
#             if self.transform: image = self.transform(image)
#             return image, label
#         except:
#             return torch.zeros((3, IMG_SIZE, IMG_SIZE)), self.labels[idx]

# 
# # CELL 5: Grad-CAM Class Logic
# 
# class GradCAM:
#     def __init__(self, model, target_layer):
#         self.model = model
#         self.target_layer = target_layer
#         self.gradients = None
#         self.activations = None
#         self.target_layer.register_forward_hook(self.save_activation)
#         self.target_layer.register_full_backward_hook(self.save_gradient)
#     
#     def save_activation(self, module, input, output):
#         self.activations = output
#     
#     def save_gradient(self, module, grad_input, grad_output):
#         self.gradients = grad_output[0]
#     
#     def generate_heatmap(self, input_image, class_idx):
#         output = self.model(input_image)
#         self.model.zero_grad()
#         loss = output[0, class_idx]
#         loss.backward()
#         pooled_gradients = torch.mean(self.gradients, dim=[0, 2, 3])
#         activated_features = self.activations.detach().clone()
#         for i in range(activated_features.shape[1]):
#             activated_features[:, i, :, :] *= pooled_gradients[i]
#         heatmap = torch.mean(activated_features, dim=1).squeeze()
#         heatmap = np.maximum(heatmap.cpu().numpy(), 0)
#         heatmap /= (np.max(heatmap) + 1e-8)
#         return heatmap

# 
# # CELL 6: Visualization Function
# 
# def visualize_gradcam(model, img_path, transform, device):
#     model.eval()
#     target_layer = model.features[-1]
#     grad_cam = GradCAM(model, target_layer)
#     raw_img = Image.open(img_path).convert('RGB')
#     input_tensor = transform(raw_img).unsqueeze(0).to(device)
#     output = model(input_tensor)
#     _, pred = torch.max(output, 1)
#     heatmap = grad_cam.generate_heatmap(input_tensor, pred.item())
#     img = np.array(raw_img)
#     img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
#     heatmap = cv2.resize(heatmap, (IMG_SIZE, IMG_SIZE))
#     heatmap = np.uint8(255 * heatmap)
#     heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
#     superimposed_img = heatmap * 0.4 + img * 0.6
#     plt.figure(figsize=(10, 5))
#     plt.subplot(1, 2, 1); plt.imshow(img); plt.title("Original X-Ray"); plt.axis('off')
#     plt.subplot(1, 2, 2); plt.imshow(superimposed_img.astype(np.uint8))
#     plt.title(f"Grad-CAM (Pred: {'PNEUMONIA' if pred.item()==1 else 'NORMAL'})")
#     plt.axis('off'); plt.show()

# 
# # CELL 7: Initialize Model & Data Loaders
# 
# MODEL_SAVE_PATH.mkdir(parents=True, exist_ok=True)
# device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
# 
# transform = transforms.Compose([
#     transforms.Resize((IMG_SIZE, IMG_SIZE)),
#     transforms.ToTensor(),
#     transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
# ])
# 
# if DATASET_PATH and (DATASET_PATH / "train").exists():
#     print(f"Loading data from detected path: {DATASET_PATH / 'train'}")
#     train_ds = ChestXRayDataset(DATASET_PATH / "train", transform=transform)
#     
#     if len(train_ds) == 0:
#         print("!!! ERROR: train_ds has 0 images. Check subfolder names. !!!")
#     else:
#         train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
#         model = models.mobilenet_v3_small(weights='DEFAULT')
#         model.classifier[3] = nn.Linear(model.classifier[3].in_features, 2)
#         model = model.to(device)
#         optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)
#         criterion = nn.CrossEntropyLoss()
#         print("Model and Loader ready.")
# else:
#     print("!!! ERROR: Data folder not found. Please run CELL 3 and check your /content folder. !!!")

# 
# # CELL 8: Initial Training Loop
# 
# if 'train_loader' in locals():
#     print(f"Training on {device}...")
#     model.train()
#     for epoch in range(EPOCHS):
#         total_loss = 0
#         for images, labels in train_loader:
#             images, labels = images.to(device), labels.to(device)
#             optimizer.zero_grad()
#             outputs = model(images)
#             loss = criterion(outputs, labels)
#             loss.backward()
#             optimizer.step()
#             total_loss += loss.item()
#         print(f"Epoch {epoch+1}/{EPOCHS}, Loss: {total_loss/len(train_loader):.4f}")

# 
# # CELL 8.1: Additional Training (Fine-tuning)
# 
# if 'model' in locals() and 'train_loader' in locals():
#     print("Continuing training with a lower learning rate...")
#     fine_tune_optimizer = torch.optim.Adam(model.parameters(), lr=0.0001)
#     ADDITIONAL_EPOCHS = 5
#     model.train()
#     for epoch in range(ADDITIONAL_EPOCHS):
#         total_loss = 0
#         for images, labels in train_loader:
#             images, labels = images.to(device), labels.to(device)
#             fine_tune_optimizer.zero_grad()
#             outputs = model(images)
#             loss = criterion(outputs, labels)
#             loss.backward()
#             fine_tune_optimizer.step()
#             total_loss += loss.item()
#         print(f"Fine-tuning Epoch {epoch+1}/{ADDITIONAL_EPOCHS}, Loss: {total_loss/len(train_loader):.4f}")

# 
# # CELL 9: Export to ONNX
# 
# def export_to_onnx(model_to_export):
#     model_to_export.eval(); model_to_export.to('cpu')
#     dummy_input = torch.randn(1, 3, IMG_SIZE, IMG_SIZE)
#     onnx_path = MODEL_SAVE_PATH / "pneumonia_model.onnx"
#     print(f"Exporting to {onnx_path}...")
#     
#     torch.onnx.export(
#         model_to_export,
#         dummy_input,
#         onnx_path,
#         export_params=True,
#         opset_version=18,
#         input_names=['input'],
#         output_names=['output'],
#         do_constant_folding=True
#     )
#     print("Export Complete!")
# 
# if 'model' in locals():
#     export_to_onnx(model)

# 
# # CELL 10: Run Grad-CAM Visualization
# 
# if 'train_ds' in locals() and len(train_ds) > 0:
#     sample_path = train_ds.images[0]
#     visualize_gradcam(model.to(device), sample_path, transform, device)
