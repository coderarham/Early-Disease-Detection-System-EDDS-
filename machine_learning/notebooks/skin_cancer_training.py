"""
Skin Cancer Detection - EfficientNetV2 Training Script
ISIC 2019 Dataset - Colab Ready

# Google Colab Link: https://colab.research.google.com/drive/1JufTXOiJvcncS3tMQXyoM2h0nvrxU877?usp=sharing   <-- YEH RAHA LINK

# ============= COLAB SETUP =============
# Run these cells first in Colab:
# !pip install torch torchvision timm onnx kaggle
# !mkdir -p ~/.kaggle
# Upload your kaggle.json to ~/.kaggle/
# !chmod 600 ~/.kaggle/kaggle.json


from google.colab import drive
drive.mount('/content/drive')

import os

folder_path = '/content/isic2019/ISIC_2019_Training_Input'

print(" Folder ke andar ki pehli 10 cheezein:")
try:
    items = os.listdir(folder_path)
    print(items[:10])
    print(f"\nTotal items in folder: {len(items)}")
except Exception as e:
    print("Error:", e)

# 1. Folder create karein
!mkdir -p /content/isic2019

print(" Extracting 9GB dataset from Drive to Colab local storage...")
print(" Please wait 5-10 minutes. Do NOT stop the cell.")

# 2. Unzip using the exact path you found
!unzip -q -o /content/drive/MyDrive/EDDS_Project/isic-2019.zip -d /content/isic2019

print(" Extraction Complete! Let's check the files:")

# 3. Verify the files
!ls -lh /content/isic2019 | head -n 5

# Install required libraries
!pip install torch torchvision timm onnx pandas scikit-learn tqdm pillow -q

# Import everything
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import timm
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from tqdm import tqdm
import os
import warnings
warnings.filterwarnings("ignore") # Chhoti-moti warnings ko hide karne ke liye

print(" Libraries Imported Successfully!")

# ============= CONFIG =============
class Config:
    DATA_DIR = "/content/isic2019"  # Jo folder humne abhi banaya
    OUTPUT_DIR = "/content/models"

    MODEL_NAME = "tf_efficientnetv2_s"  # Fast & Accurate model
    NUM_CLASSES = 8  # ISIC 2019 has 8 classes
    IMG_SIZE = 224

    BATCH_SIZE = 32  # Agar GPU Out of Memory error aaye, toh isko 16 kar dena
    EPOCHS = 15
    LR = 1e-4
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

    CLASSES = ['MEL', 'NV', 'BCC', 'AK', 'BKL', 'DF', 'VASC', 'SCC']

# ============= DATASET CLASS =============
class ISICDataset(Dataset):
    def __init__(self, df, img_dir, transform=None):
        self.df = df
        self.img_dir = Path(img_dir)
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img_path = self.img_dir / f"{row['image']}.jpg"

        image = Image.open(img_path).convert('RGB')
        label = row['label']

        if self.transform:
            image = self.transform(image)

        return image, label

# ============= DATA AUGMENTATION =============
def get_transforms():
    train_transform = transforms.Compose([
        transforms.Resize((Config.IMG_SIZE, Config.IMG_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(20),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize((Config.IMG_SIZE, Config.IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    return train_transform, val_transform

print(f" Config setup complete Using device: {Config.DEVICE}")

# ============= MODEL =============
def create_model():
    model = timm.create_model(
        Config.MODEL_NAME,
        pretrained=True, # Pre-trained weights for better accuracy
        num_classes=Config.NUM_CLASSES
    )
    return model

# ============= TRAINING LOOP =============
def train_epoch(model, loader, criterion, optimizer, device):
    model.train()
    running_loss, correct, total = 0.0, 0, 0

    pbar = tqdm(loader, desc="Training")
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

# ============= VALIDATION LOOP =============
def validate(model, loader, criterion, device):
    model.eval()
    running_loss, correct, total = 0.0, 0, 0

    with torch.no_grad():
        for images, labels in tqdm(loader, desc="Validation"):
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

    return running_loss / len(loader), 100. * correct / total

print(" Training functions are ready!")

# ============= MAIN EXECUTION (FIXED PATH) =============
def main():
    os.makedirs(Config.OUTPUT_DIR, exist_ok=True)

    print("Loading metadata CSV...")
    train_csv = pd.read_csv(f"{Config.DATA_DIR}/ISIC_2019_Training_GroundTruth.csv")

    # Convert one-hot encoding to single label
    train_csv['label'] = train_csv[Config.CLASSES].values.argmax(axis=1)

    # Train-Val Split (85% Train, 15% Validation)
    train_df, val_df = train_test_split(train_csv, test_size=0.15, stratify=train_csv['label'], random_state=42)
    print(f"Dataset split -> Train: {len(train_df)} images, Val: {len(val_df)} images")

    # FIX: Yahan nested folder ka path update kiya gaya hai
    img_folder_path = f"{Config.DATA_DIR}/ISIC_2019_Training_Input/ISIC_2019_Training_Input"

    # Setup DataLoaders with corrected path
    train_transform, val_transform = get_transforms()
    train_dataset = ISICDataset(train_df, img_folder_path, train_transform)
    val_dataset = ISICDataset(val_df, img_folder_path, val_transform)

    train_loader = DataLoader(train_dataset, batch_size=Config.BATCH_SIZE, shuffle=True, num_workers=2, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=Config.BATCH_SIZE, shuffle=False, num_workers=2, pin_memory=True)

    print("Building EfficientNetV2 model...")
    model = create_model().to(Config.DEVICE)

    # Handle Class Imbalance
    class_counts = train_df['label'].value_counts().sort_index().values
    class_weights = torch.tensor(1.0 / class_counts, dtype=torch.float32).to(Config.DEVICE)
    criterion = nn.CrossEntropyLoss(weight=class_weights)

    optimizer = torch.optim.AdamW(model.parameters(), lr=Config.LR)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=Config.EPOCHS)

    best_acc = 0.0
    print("\n STARTING TRAINING...")

    for epoch in range(Config.EPOCHS):
        print(f"\n--- Epoch {epoch+1}/{Config.EPOCHS} ---")

        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, Config.DEVICE)
        val_loss, val_acc = validate(model, val_loader, criterion, Config.DEVICE)
        scheduler.step()

        print(f"Result -> Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}% | Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%")

        if val_acc > best_acc:
            best_acc = val_acc
            save_path = f"{Config.OUTPUT_DIR}/skin_cancer_best.pth"
            torch.save(model.state_dict(), save_path)
            print(f" New Best Model Saved to: {save_path}")

    print(f"\n Training fully complete! Best Validation Accuracy: {best_acc:.2f}%")

if __name__ == "__main__":
    main()


# to test the model
import torch
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import timm
import matplotlib.pyplot as plt
from google.colab import files
import io

# ============= CONFIG & LABELS =============
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_PATH = "/content/skin_cancer_best.pth" 
CLASSES = ['MEL', 'NV', 'BCC', 'AK', 'BKL', 'DF', 'VASC', 'SCC']

# Medical full names for better understanding
DISEASE_NAMES = {
    'MEL': 'Melanoma (Malignant/Cancerous)',
    'NV': 'Melanocytic nevus (Benign Mole)',
    'BCC': 'Basal cell carcinoma (Cancerous)',
    'AK': 'Actinic keratosis (Pre-cancerous)',
    'BKL': 'Benign keratosis (Benign/Non-cancerous)',
    'DF': 'Dermatofibroma (Benign Lesion)',
    'VASC': 'Vascular lesion (Benign)',
    'SCC': 'Squamous cell carcinoma (Cancerous)'
}

# ============= PREPARE MODEL =============
print(" Loading your trained model...")
# 1. Create the same model architecture
model = timm.create_model('tf_efficientnetv2_s', pretrained=False, num_classes=8)

# 2. Load your hard-earned weights!
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.to(DEVICE)
model.eval() # Set to evaluation mode
print(" Model loaded successfully!\n")

# ============= IMAGE TRANSFORMS =============
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# ============= PREDICTION FUNCTION =============
def predict_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    input_tensor = transform(image).unsqueeze(0).to(DEVICE) 
    
    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = F.softmax(outputs, dim=1)[0] 
        
    max_prob, predicted_idx = torch.max(probabilities, 0)
    class_name = CLASSES[predicted_idx.item()]
    full_name = DISEASE_NAMES[class_name]
    confidence = max_prob.item() * 100
    
    plt.figure(figsize=(6, 6))
    plt.imshow(image)
    plt.axis('off')
    plt.title(f"Prediction: {full_name}\nConfidence: {confidence:.2f}%", 
              fontsize=14, color='darkred' if 'Cancerous' in full_name else 'darkgreen')
    plt.show()
    
    print("\n Detailed Probabilities:")
    for i, prob in enumerate(probabilities):
        print(f"{CLASSES[i]}: {prob.item()*100:.2f}%")

# ============= UPLOAD & TEST =============
print(" Please upload a skin lesion image to test your EDDS:")
uploaded = files.upload()

for fn in uploaded.keys():
    print(f"\n Analyzing image: {fn}...")
    predict_image(uploaded[fn])

"""