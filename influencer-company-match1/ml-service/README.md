# AI Chatbot ML Service

Self-hosted NLP service for intelligent chatbot responses.

## Features

- ✅ Intent Classification (pattern matching)
- ✅ Entity Extraction (emails, phones, URLs, etc.)
- ✅ Sentiment Analysis
- ✅ Response Generation (template-based)
- ✅ Zero external API dependencies
- ✅ Fast and lightweight

## Quick Start

### 1. Install Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Run the Service

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or simply:

```bash
python app/main.py
```

### 3. Test the API

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hi"}'
```

## API Endpoints

### POST /chat
Main chatbot endpoint

**Request:**
```json
{
  "message": "find me some matches",
  "context": {},
  "user_id": "user123"
}
```

**Response:**
```json
{
  "intent": "find_matches",
  "confidence": 0.95,
  "response": "I can help you find perfect matches!",
  "entities": [],
  "sentiment": {
    "sentiment": "neutral",
    "score": 0.5
  },
  "suggestions": [
    "Show me top matches",
    "Filter by industry"
  ]
}
```

### POST /classify-intent
Intent classification only

### POST /extract-entities
Entity extraction only

### POST /analyze-sentiment
Sentiment analysis only

### GET /health
Health check

## Configuration

### Adding New Intents

Edit `data/intents.json`:

```json
{
  "tag": "new_intent",
  "patterns": ["pattern1", "pattern2"],
  "responses": ["response1", "response2"]
}
```

## Docker Deployment

```bash
docker build -t chatbot-ml-service .
docker run -p 8000:8000 chatbot-ml-service
```

## Performance

- **Startup Time:** < 1 second
- **Response Time:** ~10-50ms per request
- **Memory Usage:** ~100MB
- **CPU Usage:** Minimal (no heavy models)

## Upgrading to Advanced Models

To use transformer models (DistilBERT, GPT-2):

1. Install additional dependencies:
```bash
pip install transformers torch
```

2. Replace `IntentClassifier` with transformer-based version
3. Replace `ResponseGenerator` with GPT-2 based version

See `SELF-HOSTED-AI-CHATBOT-IMPLEMENTATION-PLAN.md` for details.

## License

MIT
