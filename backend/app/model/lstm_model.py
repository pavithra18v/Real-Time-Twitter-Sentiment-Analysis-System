import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import os
import numpy as np
from app.config import settings

class LSTMNet(nn.Module):
    def __init__(self, vocab_size, embedding_dim, hidden_dim, output_dim, n_layers, dropout):
        super(LSTMNet, self).__init__()
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.lstm = nn.LSTM(embedding_dim, hidden_dim, num_layers=n_layers, dropout=dropout, batch_first=True)
        self.fc = nn.Linear(hidden_dim, output_dim)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        embedded = self.embedding(x)
        out, (hidden, cell) = self.lstm(embedded)
        # Use simple last hidden state
        final_hidden = hidden[-1]
        out = self.fc(final_hidden)
        return self.sigmoid(out)

class SentimentDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.tensor(X, dtype=torch.long)
        self.y = torch.tensor(y, dtype=torch.float32)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

class LSTMModel:
    def __init__(self, vocab_size=5000, embedding_dim=100, hidden_dim=256, output_dim=1, n_layers=2, dropout=0.5):
        self.model = LSTMNet(vocab_size, embedding_dim, hidden_dim, output_dim, n_layers, dropout)
        self.criterion = nn.BCELoss()
        self.optimizer = optim.Adam(self.model.parameters())
        self.model_path = os.path.join(settings.MODEL_SAVE_DIR, "lstm_model.pth")
        self.vocab = None # Should store tokenizer/vocab mapping

    def train(self, X_train, y_train, epochs=5, batch_size=64):
        # NOTE: X_train should already be padded sequences
        dataset = SentimentDataset(X_train, y_train)
        loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
        
        self.model.train()
        for epoch in range(epochs):
            for inputs, labels in loader:
                self.optimizer.zero_grad()
                outputs = self.model(inputs)
                loss = self.criterion(outputs.squeeze(), labels)
                loss.backward()
                self.optimizer.step()
    
    def evaluate(self, X_test, y_test):
        self.model.eval()
        with torch.no_grad():
            inputs = torch.tensor(X_test, dtype=torch.long)
            outputs = self.model(inputs)
            y_pred = (outputs.squeeze() > 0.5).float().numpy()
            
        metrics = {
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "precision": float(precision_score(y_test, y_pred, average='weighted', zero_division=0)),
            "recall": float(recall_score(y_test, y_pred, average='weighted', zero_division=0)),
            "f1_score": float(f1_score(y_test, y_pred, average='weighted', zero_division=0)),
            "confusion_matrix": confusion_matrix(y_test, y_pred).tolist()
        }
        return metrics

    def predict(self, X):
        self.model.eval()
        with torch.no_grad():
            inputs = torch.tensor(X, dtype=torch.long)
            outputs = self.model(inputs)
            y_pred = (outputs.squeeze() > 0.5).int().numpy()
        return y_pred

    def save(self):
        torch.save({
            'model_state_dict': self.model.state_dict(),
            'vocab': self.vocab
        }, self.model_path)

    def load(self):
        if os.path.exists(self.model_path):
            checkpoint = torch.load(self.model_path)
            self.model.load_state_dict(checkpoint['model_state_dict'])
            self.vocab = checkpoint.get('vocab')
        else:
            raise FileNotFoundError("LSTM model not found")
