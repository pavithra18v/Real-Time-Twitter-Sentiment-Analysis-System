from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import make_pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib
import os
from app.config import settings

class RFModel:
    def __init__(self):
        self.model = make_pipeline(TfidfVectorizer(), RandomForestClassifier(n_estimators=100))
        self.model_path = os.path.join(settings.MODEL_SAVE_DIR, "rf_model.pkl")

    def train(self, X_train, y_train):
        self.model.fit(X_train, y_train)
        
    def evaluate(self, X_test, y_test):
        y_pred = self.model.predict(X_test)
        metrics = {
            "accuracy": accuracy_score(y_test, y_pred),
            "precision": precision_score(y_test, y_pred, average='weighted'),
            "recall": recall_score(y_test, y_pred, average='weighted'),
            "f1_score": f1_score(y_test, y_pred, average='weighted'),
            "confusion_matrix": confusion_matrix(y_test, y_pred).tolist()
        }
        return metrics

    def predict(self, texts):
        return self.model.predict(texts)

    def predict_proba(self, texts):
        return self.model.predict_proba(texts)
    
    def save(self):
        joblib.dump(self.model, self.model_path)

    def load(self):
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
        else:
            raise FileNotFoundError("Random Forest model not found")
