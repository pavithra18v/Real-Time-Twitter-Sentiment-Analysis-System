from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
# Import routers (placeholders for now, will be implemented)
from app.routes import train, predict, live_twitter, metrics, compare, classical_models, explain, reset, dashboard

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite default port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Sentiment Analysis & Explainability API"}

# Include routers eventually
app.include_router(train.router, prefix="/models", tags=["Training"])
app.include_router(classical_models.router, prefix="/classical", tags=["Classical Models"])
app.include_router(predict.router, prefix="/api", tags=["Prediction"])
app.include_router(live_twitter.router, prefix="/live", tags=["Live"]) 
app.include_router(metrics.router, prefix="/metrics", tags=["Metrics"])
app.include_router(compare.router, prefix="/compare", tags=["Comparison"])
app.include_router(explain.router, prefix="/api", tags=["Explainability"])
app.include_router(reset.router, prefix="/api", tags=["System"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
