from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, AdamW
import torch
from torch.utils.data import DataLoader, Dataset
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import os
from app.config import settings

class BertDataset(Dataset):
    def __init__(self, encodings, labels=None):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        if self.labels is not None:
            item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.encodings['input_ids'])

class BertModelWrapper:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
        self.model = DistilBertForSequenceClassification.from_pretrained('distilbert-base-uncased', num_labels=2)
        self.model.to(self.device)
        self.model_path = os.path.join(settings.MODEL_SAVE_DIR, "bert_model")

    def train(self, texts, labels, epochs=3, batch_size=16):
        encodings = self.tokenizer(texts, truncation=True, padding=True)
        dataset = BertDataset(encodings, labels)
        loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
        
        optimizer = AdamW(self.model.parameters(), lr=5e-5)
        
        self.model.train()
        for epoch in range(epochs):
            for batch in loader:
                optimizer.zero_grad()
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                labels = batch['labels'].to(self.device)
                
                outputs = self.model(input_ids, attention_mask=attention_mask, labels=labels)
                loss = outputs.loss
                loss.backward()
                optimizer.step()
    
    def evaluate(self, texts, labels):
        encodings = self.tokenizer(texts, truncation=True, padding=True)
        dataset = BertDataset(encodings, labels)
        loader = DataLoader(dataset, batch_size=16)
        
        self.model.eval()
        predictions = []
        true_labels = []
        
        with torch.no_grad():
            for batch in loader:
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                labels = batch['labels'].to(self.device)
                
                outputs = self.model(input_ids, attention_mask=attention_mask)
                preds = torch.argmax(outputs.logits, dim=1)
                
                predictions.extend(preds.cpu().numpy())
                true_labels.extend(labels.cpu().numpy())
        
        metrics = {
            "accuracy": float(accuracy_score(true_labels, predictions)),
            "precision": float(precision_score(true_labels, predictions, average='weighted')),
            "recall": float(recall_score(true_labels, predictions, average='weighted')),
            "f1_score": float(f1_score(true_labels, predictions, average='weighted')),
            "confusion_matrix": confusion_matrix(true_labels, predictions).tolist()
        }
        return metrics

    def predict(self, texts):
        encodings = self.tokenizer(texts, truncation=True, padding=True)
        dataset = BertDataset(encodings)
        loader = DataLoader(dataset, batch_size=16)
        
        self.model.eval()
        predictions = []
        
        with torch.no_grad():
            for batch in loader:
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                
                outputs = self.model(input_ids, attention_mask=attention_mask)
                preds = torch.argmax(outputs.logits, dim=1)
                predictions.extend(preds.cpu().numpy())
                
        return predictions

    def save(self):
        self.model.save_pretrained(self.model_path)
        self.tokenizer.save_pretrained(self.model_path)

    def load(self):
        if os.path.exists(self.model_path):
            self.model = DistilBertForSequenceClassification.from_pretrained(self.model_path)
            self.tokenizer = DistilBertTokenizer.from_pretrained(self.model_path)
            self.model.to(self.device)
        else:
            raise FileNotFoundError("BERT model not found")
