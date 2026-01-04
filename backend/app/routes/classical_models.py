from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.schemas import TrainingRequest
# from app.model.svm_model import SVMModel
# from app.model.rf_model import RFModel
# from app.model.lr_model import LRModel
import pandas as pd
import os
from app.config import settings

router = APIRouter()

training_status = {}

def train_classical_task(request: TrainingRequest, task_id: str):
    try:
        training_status[task_id] = "Training"
        # Implementation similar to deep learning but with SVM/RF/LR models
        training_status[task_id] = "Completed"
    except Exception as e:
        training_status[task_id] = f"Failed: {str(e)}"

@router.post("/classical", response_model=dict)
async def train_classical_model(request: TrainingRequest, background_tasks: BackgroundTasks):
    if len(request.dataset_filenames) < 3:
        raise HTTPException(status_code=400, detail="Minimum 3 datasets are required for training")
    
    task_id = "task_classical_" + request.model_type
    background_tasks.add_task(train_classical_task, request, task_id)
    return {"message": "Training started", "task_id": task_id}
