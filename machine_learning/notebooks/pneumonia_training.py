# ============================================================================
# PNEUMONIA DETECTION - TRAINING SCRIPT FOR GOOGLE COLAB

# Google Colab Link: https://colab.research.google.com/drive/1NLjvLx1dBTZDyx5iSSpcpXBhn2P5rG_B?usp=sharing
# 
# HOW TO USE IN COLAB:
# 1. Open Google Colab (link above)
# 2. Create a new notebook
# 3. Copy-paste this entire file
# 4. Uncomment all lines (remove # from start of each line)
# 5. Run cells sequentially
# ============================================================================

"""
# Pneumonia Detection - MobileNetV3 Training Script
# Kermany Chest X-Ray Dataset - Colab Ready

#  STEP 1: INSTALL LIBRARIES
import os
print("Installing required libraries...")
os.system('pip install torch torchvision timm onnx kaggle opendatasets grad-cam -q')
print("Libraries Installed Successfully!")

#  STEP 2: IMPORT LIBRARIES
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import timm
import numpy as np
from pathlib import Path
from tqdm import tqdm
import warnings
import io
import matplotlib.pyplot as plt
from google.colab import files
warnings.filterwarnings("ignore")

#  STEP 3: DOWNLOAD DATASET FROM KAGGLE
print("\n--- KAGGLE AUTHENTICATION ---")
print("Please upload your kaggle.json file:")
uploaded = files.upload()

if 'kaggle.json' in uploaded:
    os.system('mkdir -p ~/.kaggle')
    os.system('cp kaggle.json ~/.kaggle/')
    os.system('chmod 600 ~/.kaggle/kaggle.json')
    print("Downloading Kermany Chest X-Ray Dataset...")
    os.system('kaggle datasets download -d paultimothymooney/chest-xray-pneumonia')
    print("Extracting dataset... (This might take a minute)")
    os.system('unzip -q chest-xray-pneumonia.zip -d /content/chest_xray')
    print("Dataset downloaded and extracted!")
else:
    print("ERROR: kaggle.json not uploaded. Cannot download dataset.")

    #  STEP 4: CONFIG
class Config:
    DATA_DIR = "/content/chest_xray/chest_xray"
    OUTPUT_DIR = "/content/models"

    MODEL_NAME = "mobilenetv3_small_100"
    NUM_CLASSES = 2  # Normal vs Pneumonia
    IMG_SIZE = 224

    BATCH_SIZE = 32
    EPOCHS = 12       # Increased slightly, Early Stopping will manage it
    LR = 1e-4
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

    CLASSES = ['NORMAL', 'PNEUMONIA']
    PATIENCE = 3      # Early stopping patience

print(f"\nConfig setup complete. Using device: {Config.DEVICE.upper()}")

#  STEP 5: DATASET CLASS
class ChestXRayDataset(Dataset):
    def __init__(self, root_dir, split='train', transform=None):
        self.root_dir = Path(root_dir) / split
        self.transform = transform
        self.images = []
        self.labels = []

        for class_idx, class_name in enumerate(Config.CLASSES):
            class_dir = self.root_dir / class_name
            if class_dir.exists():
                # .jpeg files
                for img_path in class_dir.glob('*.jpeg'):
                    self.images.append(img_path)
                    self.labels.append(class_idx)

        print(f"{split.upper()} Set - Total images: {len(self.images)}")

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_path = self.images[idx]
        label = self.labels[idx]

        # Convert to RGB as TIMM models expect 3 channels
        image = Image.open(img_path).convert('RGB')

        if self.transform:
            image = self.transform(image)

        return image, label
    
    #  STEP 6: DATA AUGMENTATION
def get_transforms():
    train_transform = transforms.Compose([
        transforms.Resize((Config.IMG_SIZE, Config.IMG_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15), # Subtle rotation
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize((Config.IMG_SIZE, Config.IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    return train_transform, val_transform

#  STEP 7: MODEL
def create_model():
    model = timm.create_model(
        Config.MODEL_NAME,
        pretrained=True,
        num_classes=Config.NUM_CLASSES
    )
    return model

#  STEP 8: TRAINING & VALIDATION LOOPS
def train_epoch(model, loader, criterion, optimizer, device):
    model.train()
    running_loss, correct, total = 0.0, 0, 0

    pbar = tqdm(loader, desc="Training", leave=False)
    for images, labels in pbar:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

        pbar.set_postfix({'loss': f'{running_loss/len(loader):.4f}', 'acc': f'{100.*correct/total:.2f}%'})

    return running_loss / len(loader), 100. * correct / total

def validate(model, loader, criterion, device):
    model.eval()
    running_loss, correct, total = 0.0, 0, 0

    with torch.no_grad():
        for images, labels in tqdm(loader, desc="Validation", leave=False):
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

    return running_loss / len(loader), 100. * correct / total

    #  STEP 9: MAIN EXECUTION
def main():
    os.makedirs(Config.OUTPUT_DIR, exist_ok=True)

    print("\nLoading datasets...")
    train_transform, val_transform = get_transforms()

    train_dataset = ChestXRayDataset(Config.DATA_DIR, 'train', train_transform)
    val_dataset = ChestXRayDataset(Config.DATA_DIR, 'val', val_transform)
    test_dataset = ChestXRayDataset(Config.DATA_DIR, 'test', val_transform)

    train_loader = DataLoader(train_dataset, batch_size=Config.BATCH_SIZE, shuffle=True, num_workers=2, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=Config.BATCH_SIZE, shuffle=False, num_workers=2, pin_memory=True)
    test_loader = DataLoader(test_dataset, batch_size=Config.BATCH_SIZE, shuffle=False, num_workers=2, pin_memory=True)

    print("\nBuilding MobileNetV3 model...")
    model = create_model().to(Config.DEVICE)

    # CRITICAL FIX: Normal cases are ~1.3k, Pneumonia cases are ~3.8k.
    # Normal is the minority, so it needs higher weight!
    class_weights = torch.tensor([3.0, 1.0], dtype=torch.float32).to(Config.DEVICE)
    criterion = nn.CrossEntropyLoss(weight=class_weights)

    optimizer = torch.optim.AdamW(model.parameters(), lr=Config.LR, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=Config.EPOCHS)

    best_acc = 0.0

    print("\n STARTING TRAINING...")

    for epoch in range(Config.EPOCHS):
        print(f"\n--- Epoch {epoch+1}/{Config.EPOCHS} ---")

        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, Config.DEVICE)
        val_loss, val_acc = validate(model, val_loader, criterion, Config.DEVICE)
        scheduler.step()

        print(f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}%")
        print(f"Val Loss:   {val_loss:.4f} | Val Acc:   {val_acc:.2f}%")

        # Save Best Model without Early Stopping Break
        if val_acc > best_acc:
            best_acc = val_acc
            save_path = f"{Config.OUTPUT_DIR}/pneumonia_best.pth"
            torch.save(model.state_dict(), save_path)
            print(f" New Best Model Saved! Acc: {best_acc:.2f}%")
        else:
            print(f"No improvement in this epoch.")

    # Test evaluation
    print("\n--- Testing on Unseen Test Set ---")
    model.load_state_dict(torch.load(f"{Config.OUTPUT_DIR}/pneumonia_best.pth"))
    test_loss, test_acc = validate(model, test_loader, criterion, Config.DEVICE)
    print(f"🏆 Final Test Accuracy: {test_acc:.2f}%")

if __name__ == "__main__":
    main()

    #  STEP 10: EXPORT TO ONNX (BINA TRAIN KIYE)
import torch
import timm

print("\n---  Exporting to ONNX format ---")
MODEL_PATH = "/content/models/pneumonia_best.pth"
ONNX_PATH = "/content/models/pneumonia_model.onnx"

# 1. Khali model structure load karein
onnx_model = timm.create_model('mobilenetv3_small_100', pretrained=False, num_classes=2)

# 2. Aapke trained weights (jo save hue the) isme daalein
onnx_model.load_state_dict(torch.load(MODEL_PATH, map_location='cpu'))
onnx_model.eval()

dummy_input = torch.randn(1, 3, 224, 224)

# 3. ONNX mein convert karein
torch.onnx.export(
    onnx_model,
    dummy_input,
    ONNX_PATH,
    export_params=True,
    opset_version=18,  # <--- SIRF YAHI CHANGE KIYA HAI (14 se 18)
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
)
print(f" ONNX model saved successfully for Production: {ONNX_PATH}")

#  STEP 11: TEST THE MODEL WITH GRAD-CAM
import torch.nn.functional as F
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

print("\n--- Interactive Testing & Explainability (Grad-CAM) ---")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

test_model = create_model()
test_model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
test_model.to(DEVICE)
test_model.eval()

# Select target layer for Grad-CAM (MobileNetV3 blocks)
target_layers = [test_model.blocks[-1]]
cam = GradCAM(model=test_model, target_layers=target_layers)

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def predict_and_explain(image_bytes):
    original_img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    resized_img = original_img.resize((224, 224))
    img_float = np.float32(resized_img) / 255.0

    input_tensor = transform(original_img).unsqueeze(0).to(DEVICE)

    # 1. Prediction
    with torch.no_grad():
        outputs = test_model(input_tensor)
        probabilities = F.softmax(outputs, dim=1)[0]

    max_prob, predicted_idx = torch.max(probabilities, 0)
    prediction = Config.CLASSES[predicted_idx.item()]
    confidence = max_prob.item() * 100

    # 2. Grad-CAM Generation
    targets = [ClassifierOutputTarget(predicted_idx.item())]
    grayscale_cam = cam(input_tensor=input_tensor, targets=targets)[0, :]
    visualization = show_cam_on_image(img_float, grayscale_cam, use_rgb=True)

    # 3. Plotting Original vs Heatmap
    fig, axes = plt.subplots(1, 2, figsize=(10, 5))
    axes[0].imshow(resized_img)
    axes[0].set_title("Original X-Ray")
    axes[0].axis('off')

    axes[1].imshow(visualization)
    axes[1].set_title(f"Grad-CAM (Focus Area)")
    axes[1].axis('off')

    plt.suptitle(f"Prediction: {prediction} | Confidence: {confidence:.2f}%",
                 fontsize=16, color='red' if prediction == 'PNEUMONIA' else 'green', fontweight='bold')
    plt.show()

print("\nPlease upload a sample Chest X-ray image to test:")
sample_uploaded = files.upload()

for fn in sample_uploaded.keys():
    print(f"\nAnalyzing: {fn}...")
    predict_and_explain(sample_uploaded[fn])
"""