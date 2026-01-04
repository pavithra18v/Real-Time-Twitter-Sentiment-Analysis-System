import os
import shutil
from fastapi import APIRouter

router = APIRouter()

@router.post("/reset")
def reset_system():
    paths = [
        "backend/models",
        "backend/data/trained",
        "backend/data/live"
    ]

    for path in paths:
        if os.path.exists(path):
            shutil.rmtree(path)
            os.makedirs(path)
        else:
             os.makedirs(path)

    return {"status": "System reset successful"}
