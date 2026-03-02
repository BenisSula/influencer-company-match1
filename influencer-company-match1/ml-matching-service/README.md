# ML Matching Service

AI-powered matching prediction service for influencer-company compatibility.

## Purpose

Predicts match success probability using machine learning (Random Forest/Gradient Boosting).

## Port

**8001** (separate from chatbot ML service on port 8000)

## Setup

```bash
# Run setup (first time only)
setup.bat

# Start service
start-ml-matching.bat
```

## Endpoints

- `GET /health` - Health check
- `POST /predict` - Predict match score
- `POST /train` - Train model with outcomes
- `GET /models` - List available models

## Features

- Random Forest Classifier
- Gradient Boosting Classifier
- Feature importance analysis
- Cross-validation
- Success probability prediction

## Used By

- AI Matching Service (backend)
- Suggested Matches
- Compatibility Scores
- Match Analytics
