import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "../datasets/heart_disease/heart.csv")
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "../trained_models/heart_disease_model.pkl")

print("Process Started...")

if not os.path.exists(DATA_PATH):
    print(f"Error: Dataset file not found at: {DATA_PATH}")
    print("Please ensure 'heart.csv' is inside 'machine_learning/datasets/heart_disease/'")
    exit()

print(f"Loading Data from: {DATA_PATH}")
df = pd.read_csv(DATA_PATH)

print("\n" + "="*40)
print("DATA EXPLORATION (Student Analysis)")
print("="*40)

print("\n1. Top 5 Rows (Head):")
print(df.head())

print(f"\n2. Dataset Size: {df.shape}")
print(f"   -> Total Patients (Rows): {df.shape[0]}")
print(f"   -> Total Features (Columns): {df.shape[1]}")

missing_count = df.isnull().sum().sum()
if (df.values == '?').any():
    q_mark_count = (df == '?').sum().sum()
    print(f"\n3. Missing Values Check:")
    print(f"   Found {q_mark_count} '?' values (will be removed).")
elif missing_count > 0:
    print(f"\n3. Missing Values Check:")
    print(f"   Found {missing_count} NaN values.")
else:
    print("\n3. Missing Values Check:")
    print("   Data is clean (No missing values).")

if 'sex' in df.columns:
    gender_counts = df['sex'].value_counts()
    male_count = int(gender_counts.get(1, 0))
    female_count = int(gender_counts.get(0, 0))
    print("\n4. Gender Distribution:")
    print(f"   Male:   {male_count}")
    print(f"   Female: {female_count}")

target_col = 'num' if 'num' in df.columns else 'target'
if target_col not in df.columns: target_col = df.columns[-1]

print(f"\n5. Target Column Identified: '{target_col}'")
sick_people = df[df[target_col] > 0].shape[0]
healthy_people = df[df[target_col] == 0].shape[0]
print(f"   Healthy: {healthy_people}")
print(f"   Heart Disease: {sick_people}")

print("="*40 + "\n")

print("Data Cleaning Started...")

if 'id' in df.columns: df = df.drop('id', axis=1)
if 'dataset' in df.columns: df = df.drop('dataset', axis=1)

df = df.replace('?', np.nan).dropna()
df = df.astype(float)

X = df.drop(target_col, axis=1)
y = df[target_col].apply(lambda x: 1 if x > 0 else 0)

X = pd.get_dummies(X, drop_first=True)

print(f"Data Processed! Features used: {X.shape[1]}")

print("\nTraining XGBoost Model...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = xgb.XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=4,
    eval_metric='logloss'
)
model.fit(X_train, y_train)

predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)

print(f"\nFinal Model Accuracy: {accuracy * 100:.2f}%")
print("\nDetailed Classification Report:")
print(classification_report(y_test, predictions))

os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)

joblib.dump(model, MODEL_SAVE_PATH)
print(f"\nModel Saved Successfully!")
print(f"   Location: {MODEL_SAVE_PATH}")
