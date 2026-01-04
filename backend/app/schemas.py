from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class TrainingRequest(BaseModel):
    model_type: str  # "LSTM", "BERT", "SVM", "RF", "LR"
    explainability_method: str  # "LIME", "SHAP"
    split_ratio: float = 0.8  # 0.7 or 0.8
    dataset_filenames: List[str]

class PredictionRequest(BaseModel):
    text: str
    model_type: str

class DatasetInfo(BaseModel):
    filename: str
    row_count: int
    columns: List[str]

class ModelMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: List[List[int]]

class ExplanationResponse(BaseModel):
    method: str
    explanation: Dict[str, Any]  # Structure depends on LIME/SHAP output

class AnalysisResult(BaseModel):
    text: str
    sentiment: str
    confidence: float
    explanation: Optional[ExplanationResponse] = None
    user_id: str
    username: str
    country: str

class LiveTwitterRequest(BaseModel):
    keyword: str
    count: int = 100
    model_type: str
    explainability_method: str
