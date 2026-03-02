"""
AI Matching ML Service
Provides machine learning predictions for influencer-company matching
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import logging
import numpy as np

from app.models.match_predictor import MatchPredictor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="IC Match ML Matching Service",
    version="1.0.0",
    description="Machine Learning service for predicting match success"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML model
match_predictor = MatchPredictor()

# Auto-train with initial sample data on startup
def initialize_model():
    """Initialize model with sample training data"""
    logger.info("Initializing ML model with sample data...")
    
    # Sample training data (realistic match scenarios)
    sample_features = [
        [0.9, 0.85, 0.8, 0.9, 0.7, 0.8, 0.85, 0.9],  # High success
        [0.85, 0.9, 0.75, 0.85, 0.8, 0.85, 0.8, 0.85],  # High success
        [0.8, 0.8, 0.85, 0.8, 0.75, 0.9, 0.9, 0.8],  # High success
        [0.75, 0.85, 0.9, 0.75, 0.85, 0.75, 0.85, 0.75],  # High success
        [0.9, 0.75, 0.8, 0.9, 0.8, 0.8, 0.75, 0.9],  # High success
        [0.4, 0.3, 0.35, 0.4, 0.3, 0.35, 0.4, 0.3],  # Low success
        [0.3, 0.4, 0.3, 0.35, 0.4, 0.3, 0.35, 0.4],  # Low success
        [0.35, 0.35, 0.4, 0.3, 0.35, 0.4, 0.3, 0.35],  # Low success
        [0.4, 0.3, 0.35, 0.4, 0.3, 0.35, 0.4, 0.3],  # Low success
        [0.3, 0.4, 0.3, 0.35, 0.4, 0.3, 0.35, 0.4],  # Low success
        [0.6, 0.65, 0.6, 0.65, 0.6, 0.65, 0.6, 0.65],  # Medium success
        [0.65, 0.6, 0.65, 0.6, 0.65, 0.6, 0.65, 0.6],  # Medium success
    ]
    
    sample_outcomes = [
        True, True, True, True, True,  # Successful matches
        False, False, False, False, False,  # Failed matches
        True, True  # Medium matches
    ]
    
    try:
        # Convert to numpy arrays
        X = np.array(sample_features)
        y = np.array(sample_outcomes)
        
        metrics = match_predictor.train(X, y)
        logger.info(f"Model initialized successfully. Accuracy: {metrics['accuracy']:.3f}")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize model: {e}")
        return False

# Initialize on startup
initialize_model()

# Request/Response Models
class MatchFeatures(BaseModel):
    nicheAlignment: float
    audienceMatch: float
    engagementRate: float
    brandFit: float
    locationMatch: Optional[float] = 0.5
    budgetAlignment: Optional[float] = 0.5
    contentQuality: Optional[float] = 0.5
    responseRate: Optional[float] = 0.5

class PredictionResponse(BaseModel):
    score: float
    confidence: float
    successProbability: float
    featureImportance: Dict[str, float]

class TrainingData(BaseModel):
    features: List[Dict[str, float]]
    outcomes: List[bool]

class TrainingResponse(BaseModel):
    status: str
    metrics: Dict[str, float]
    samples: int
    modelVersion: str
    timestamp: str

class HealthResponse(BaseModel):
    model_config = {'protected_namespaces': ()}
    
    status: str
    service: str
    model_loaded: bool

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="ml-matching-service",
        model_loaded=match_predictor.is_trained()
    )

@app.post("/predict", response_model=PredictionResponse)
async def predict_match(features: MatchFeatures):
    """
    Predict match success probability
    
    Args:
        features: Match features (niche alignment, audience match, etc.)
        
    Returns:
        Prediction with score, confidence, and feature importance
    """
    try:
        # Convert features to list format
        feature_vector = [
            features.nicheAlignment,
            features.audienceMatch,
            features.engagementRate,
            features.brandFit,
            features.locationMatch,
            features.budgetAlignment,
            features.contentQuality,
            features.responseRate
        ]
        
        # Get prediction
        prediction = match_predictor.predict([feature_vector])
        
        # Get feature importance
        importance = match_predictor.get_feature_importance()
        feature_names = [
            'nicheAlignment', 'audienceMatch', 'engagementRate', 'brandFit',
            'locationMatch', 'budgetAlignment', 'contentQuality', 'responseRate'
        ]
        
        feature_importance_dict = {}
        if importance:
            for i, name in enumerate(feature_names):
                if i < len(importance):
                    feature_importance_dict[name] = float(importance[i])
        
        # Calculate score (0-100)
        probability = prediction['probabilities'][0]
        score = probability * 100
        confidence = prediction['confidence'][0] * 100
        
        return PredictionResponse(
            score=round(score, 1),
            confidence=round(confidence, 1),
            successProbability=round(probability * 100, 1),
            featureImportance=feature_importance_dict
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/train", response_model=TrainingResponse)
async def train_model(data: TrainingData):
    """
    Train the ML model with new data
    
    Args:
        data: Training features and outcomes
        
    Returns:
        Training metrics and model version
    """
    try:
        if len(data.features) < 10:
            raise HTTPException(
                status_code=400,
                detail="At least 10 training samples required"
            )
        
        # Convert features to matrix format
        X = []
        for feature_dict in data.features:
            X.append([
                feature_dict.get('nicheAlignment', 0.5),
                feature_dict.get('audienceMatch', 0.5),
                feature_dict.get('engagementRate', 0.5),
                feature_dict.get('brandFit', 0.5),
                feature_dict.get('locationMatch', 0.5),
                feature_dict.get('budgetAlignment', 0.5),
                feature_dict.get('contentQuality', 0.5),
                feature_dict.get('responseRate', 0.5)
            ])
        
        y = data.outcomes
        
        # Train model
        metrics = match_predictor.train(X, y)
        
        from datetime import datetime
        timestamp = datetime.now().isoformat()
        
        return TrainingResponse(
            status="success",
            metrics=metrics,
            samples=len(y),
            modelVersion="1.0.0",
            timestamp=timestamp
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Training error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@app.get("/models")
async def list_models():
    """List available models"""
    return {
        "models": [
            {
                "version": "1.0.0",
                "type": match_predictor.model_type,
                "trained": match_predictor.is_trained(),
                "info": match_predictor.get_model_info()
            }
        ]
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "IC Match ML Matching Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "predict": "/predict",
            "train": "/train",
            "models": "/models"
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 8001))
    uvicorn.run(app, host="0.0.0.0", port=port, reload=True)
