"""
Pneumonia Detection Model Training
Dataset: Chest X-Ray Images (Kermany et al.)
Model: MobileNetV3-Small with Grad-CAM
"""

import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from torch.utils.data import DataLoader, Dataset
from PIL import Image
import os
from pathlib import Path
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
import onnx
import onnxruntime as ort

# Configuration
DATASET_PATH = Path("../datasets/pneumonia")
MODEL_SAVE_PATH = Path("../trained_models")
BATCH_SIZE = 32
EPOCHS = 15
IMG_SIZE = 224
LEARNING_RATE = 0.001

class ChestXRayDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = Path(root_dir)
        self.transform = transform
        self.images = []
        self.labels = []
        
        # Load NORMAL images (label 0)
        normal_dir = self.root_dir / "NORMAL"
        if normal_dir.exists():
            for img_path in normal_dir.glob("*.jpeg"):
                self.images.append(str(img_path))
                self.labels.append(0)
        
        # Load BACTERIAL PNEUMONIA images (label 1)
        bacterial_dir = self.root_dir / "BACTERIAL"
        if bacterial_dir.exists():
            for img_path in bacterial_dir.glob("*.jpeg"):
                self.images.append(str(img_path))
                self.labels.append(1)
        
        # Load VIRAL PNEUMONIA images (label 2)
        viral_dir = self.root_dir / "VIRAL"
        if viral_dir.exists():
            for img_path in viral_dir.glob("*.jpeg"):
                self.images.append(str(img_path))
                self.labels.append(2)
    
    def __len__(self):
        return len(self.images)
    
    def __getitem__(self, idx):
        img_path = self.images[idx]
        image = Image.open(img_path).convert('RGB')
        label = self.labels[idx]
        
        if self.transform:
            image = self.transform(image)
        
        return image, label

def create_model():
    """Create MobileNetV3-Small model"""
    model = models.mobilenet_v3_small(weights='DEFAULT')
    model.classifier[3] = nn.Linear(model.classifier[3].in_features, 3)  # 3 classes
    return model

def train_model():
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Data transforms
    train_transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    # Load datasets
    train_dataset = ChestXRayDataset(DATASET_PATH / "train", transform=train_transform)
    val_dataset = ChestXRayDataset(DATASET_PATH / "val", transform=val_transform)
    test_dataset = ChestXRayDataset(DATASET_PATH / "test", transform=val_transform)
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=2)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=2)
    
    print(f"Train: {len(train_dataset)}, Val: {len(val_dataset)}, Test: {len(test_dataset)}")
    
    # Model, loss, optimizer
    model = create_model().to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, 'min', patience=2)
    
    best_val_acc = 0.0
    
    # Training loop
    for epoch in range(EPOCHS):
        model.train()
        train_loss = 0.0
        train_correct = 0
        
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            train_correct += (predicted == labels).sum().item()
        
        train_acc = train_correct / len(train_dataset)
        
        # Validation
        model.eval()
        val_loss = 0.0
        val_correct = 0
        
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item()
                _, predicted = torch.max(outputs, 1)
                val_correct += (predicted == labels).sum().item()
        
        val_acc = val_correct / len(val_dataset)
        scheduler.step(val_loss)
        
        print(f"Epoch {epoch+1}/{EPOCHS} - Train Acc: {train_acc:.4f}, Val Acc: {val_acc:.4f}")
        
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), MODEL_SAVE_PATH / "pneumonia_best.pth")
    
    # Test evaluation
    model.load_state_dict(torch.load(MODEL_SAVE_PATH / "pneumonia_best.pth"))
    model.eval()
    
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            _, predicted = torch.max(outputs, 1)
            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.numpy())
    
    print("\nTest Results:")
    print(classification_report(all_labels, all_preds, target_names=['NORMAL', 'BACTERIAL', 'VIRAL']))
    print("\nConfusion Matrix:")
    print(confusion_matrix(all_labels, all_preds))
    
    return model

def export_to_onnx(model):
    """Export model to ONNX format"""
    model.eval()
    dummy_input = torch.randn(1, 3, IMG_SIZE, IMG_SIZE)
    
    onnx_path = MODEL_SAVE_PATH / "pneumonia_model.onnx"
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        export_params=True,
        opset_version=12,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
    )
    
    print(f"\nModel exported to: {onnx_path}")
    
    # Verify ONNX model
    onnx_model = onnx.load(onnx_path)
    onnx.checker.check_model(onnx_model)
    print("ONNX model verified successfully!")
    
    # Test inference
    ort_session = ort.InferenceSession(onnx_path)
    test_input = np.random.randn(1, 3, IMG_SIZE, IMG_SIZE).astype(np.float32)
    outputs = ort_session.run(None, {'input': test_input})
    print(f"ONNX inference test passed! Output shape: {outputs[0].shape}")

if __name__ == "__main__":
    MODEL_SAVE_PATH.mkdir(parents=True, exist_ok=True)
    
    print("Starting Pneumonia Detection Model Training...")
    print("=" * 60)
    
    model = train_model()
    export_to_onnx(model)
    
    print("\n" + "=" * 60)
    print("Training Complete!")
