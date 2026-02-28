import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.models.model_manager import ModelManager

# Load configuration
INTENTS_PATH = os.getenv('INTENTS_PATH', 'data/intents.json')

# Initialize model manager
model_manager = ModelManager(INTENTS_PATH)

app = FastAPI(title="IC Match Chatbot ML Service", version="1.0.0")

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = {}
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    intent: str
    confidence: float
    entities: Optional[Dict[str, Any]] = None
    sentiment: Optional[Dict[str, Any]] = None

class HealthResponse(BaseModel):
    status: str
    service: str

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="ok", service="ml-service")

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Extract entities (returns a list, convert to dict for easier handling)
        extracted_entities_list = model_manager.entity_extractor.extract(request.message)
        
        # Convert list of entities to dict format for response
        entities_dict = {}
        for entity in extracted_entities_list:
            if 'label' in entity and 'text' in entity:
                entities_dict[entity['label']] = entity['text']

        # Classify intent
        intent, confidence, extracted_entities = model_manager.intent_classifier.classify(request.message)
        if extracted_entities:
            entities_dict.update(extracted_entities)

        # Analyze sentiment
        sentiment = model_manager.sentiment_analyzer.analyze(request.message)

        # Generate response (using intent and context)
        context = request.context.copy()
        if sentiment:
            context['sentiment'] = sentiment['sentiment']
        response_text = model_manager.response_generator.generate(intent, entities_dict, context)

        return ChatResponse(
            response=response_text,
            intent=intent,
            confidence=confidence,
            entities=entities_dict if entities_dict else None,
            sentiment=sentiment
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)