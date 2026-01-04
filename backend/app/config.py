import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    APP_NAME: str = "Sentiment Analysis & Explainability System"
    API_V1_STR: str = "/api/v1"
    
    # Twitter API Credentials
    TWITTER_API_KEY: str = os.getenv("TWITTER_API_KEY", "")
    TWITTER_API_SECRET: str = os.getenv("TWITTER_API_SECRET", "")
    TWITTER_BEARER_TOKEN: str = os.getenv("TWITTER_BEARER_TOKEN", "")
    TWITTER_ACCESS_TOKEN: str = os.getenv("TWITTER_ACCESS_TOKEN", "")
    TWITTER_ACCESS_SECRET: str = os.getenv("TWITTER_ACCESS_SECRET", "")
    
    # Paths
    TRAINED_DATA_DIR: str = os.path.join("backend", "data", "trained")
    LIVE_DATA_DIR: str = os.path.join("backend", "data", "live")
    PREVIOUS_DATA_DIR: str = os.path.join("backend", "data", "previous")
    MODEL_SAVE_DIR: str = os.path.join("backend", "saved_models")

    class Config:
        case_sensitive = True

settings = Settings()

# Ensure directories exist
os.makedirs(settings.TRAINED_DATA_DIR, exist_ok=True)
os.makedirs(settings.LIVE_DATA_DIR, exist_ok=True)
os.makedirs(settings.PREVIOUS_DATA_DIR, exist_ok=True)
os.makedirs(settings.MODEL_SAVE_DIR, exist_ok=True)
