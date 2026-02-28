# 🤖 Self-Hosted AI Chatbot Implementation Plan

## Overview

Build an in-house AI/ML chatbot using open-source NLP models instead of relying on OpenAI API. This gives you:
- ✅ No API costs
- ✅ Full data privacy
- ✅ Complete customization
- ✅ No external dependencies
- ✅ Offline capability

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         ChatbotWidget Component                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ WebSocket/REST
┌─────────────────────────────────────────────────────────────┐
│                  Backend (NestJS)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Chatbot Service (Intent Classification)             │  │
│  │  - Pattern Matching                                   │  │
│  │  - Context Management                                 │  │
│  │  - Response Generation                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│              Python ML Service (FastAPI)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  NLP Models:                                          │  │
│  │  - Intent Classification (DistilBERT)                │  │
│  │  - Named Entity Recognition (spaCy)                  │  │
│  │  - Sentiment Analysis                                 │  │
│  │  - Response Generation (GPT-2 / BLOOM)               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  - Training Data                                             │
│  - Conversation History                                      │
│  - Model Performance Metrics                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Python ML Service Setup

### 1.1 Create ML Service Structure

```
ml-service/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app
│   ├── models/
│   │   ├── __init__.py
│   │   ├── intent_classifier.py  # Intent classification
│   │   ├── entity_extractor.py   # NER
│   │   ├── response_generator.py # Response generation
│   │   └── sentiment_analyzer.py # Sentiment analysis
│   ├── training/
│   │   ├── __init__.py
│   │   ├── train_intent.py       # Train intent model
│   │   └── train_response.py     # Train response model
│   └── utils/
│       ├── __init__.py
│       └── preprocessing.py      # Text preprocessing
├── data/
│   ├── intents.json              # Training data
│   ├── responses.json            # Response templates
│   └── entities.json             # Entity definitions
├── models/                        # Saved model files
├── requirements.txt
└── Dockerfile
```

### 1.2 Technology Stack

**Core NLP Libraries:**
- `transformers` - Hugging Face transformers (DistilBERT, GPT-2)
- `spacy` - Named Entity Recognition
- `sentence-transformers` - Semantic similarity
- `torch` - PyTorch for model training
- `fastapi` - API framework
- `uvicorn` - ASGI server

**Optional Enhancements:**
- `rasa` - Full conversational AI framework
- `chatterbot` - Simple chatbot framework
- `nltk` - Natural language toolkit

---

## Phase 2: Model Selection

### Option A: Lightweight (Recommended for Start)

**Intent Classification:**
- Model: DistilBERT (66M parameters)
- Size: ~250MB
- Speed: Fast (~50ms per request)
- Accuracy: 85-90%

**Response Generation:**
- Model: GPT-2 Small (124M parameters)
- Size: ~500MB
- Speed: Medium (~200ms per request)
- Quality: Good for simple responses

**Total Resources:**
- Disk: ~1GB
- RAM: ~2GB
- GPU: Optional (CPU works fine)

### Option B: Medium Performance

**Intent Classification:**
- Model: BERT-base (110M parameters)
- Size: ~440MB

**Response Generation:**
- Model: GPT-2 Medium (355M parameters)
- Size: ~1.5GB

**Total Resources:**
- Disk: ~2GB
- RAM: ~4GB
- GPU: Recommended

### Option C: High Performance

**Intent Classification:**
- Model: RoBERTa-base (125M parameters)

**Response Generation:**
- Model: BLOOM-560M or GPT-2 Large
- Size: ~2-3GB

**Total Resources:**
- Disk: ~4GB
- RAM: ~8GB
- GPU: Required

---

## Phase 3: Implementation

### 3.1 Intent Classifier (intent_classifier.py)

```python
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
import torch
import json

class IntentClassifier:
    def __init__(self, model_path='models/intent_classifier'):
        self.tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
        self.model = DistilBertForSequenceClassification.from_pretrained(
            model_path if os.path.exists(model_path) else 'distilbert-base-uncased',
            num_labels=10  # Number of intents
        )
        self.intent_labels = self.load_intent_labels()
        
    def load_intent_labels(self):
        with open('data/intents.json', 'r') as f:
            data = json.load(f)
        return {i: intent['name'] for i, intent in enumerate(data['intents'])}
    
    def predict(self, text):
        inputs = self.tokenizer(text, return_tensors='pt', padding=True, truncation=True)
        outputs = self.model(**inputs)
        probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
        confidence, predicted_class = torch.max(probabilities, dim=1)
        
        return {
            'intent': self.intent_labels[predicted_class.item()],
            'confidence': confidence.item()
        }
```

### 3.2 Response Generator (response_generator.py)

```python
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch

class ResponseGenerator:
    def __init__(self, model_path='models/response_generator'):
        self.tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
        self.model = GPT2LMHeadModel.from_pretrained(
            model_path if os.path.exists(model_path) else 'gpt2'
        )
        self.model.eval()
        
    def generate(self, prompt, max_length=100, temperature=0.7):
        inputs = self.tokenizer.encode(prompt, return_tensors='pt')
        
        with torch.no_grad():
            outputs = self.model.generate(
                inputs,
                max_length=max_length,
                temperature=temperature,
                num_return_sequences=1,
                no_repeat_ngram_size=2,
                do_sample=True,
                top_k=50,
                top_p=0.95
            )
        
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return response.replace(prompt, '').strip()
```

### 3.3 Entity Extractor (entity_extractor.py)

```python
import spacy

class EntityExtractor:
    def __init__(self):
        self.nlp = spacy.load('en_core_web_sm')
        
    def extract(self, text):
        doc = self.nlp(text)
        entities = []
        
        for ent in doc.ents:
            entities.append({
                'text': ent.text,
                'label': ent.label_,
                'start': ent.start_char,
                'end': ent.end_char
            })
        
        return entities
```

### 3.4 FastAPI Main App (main.py)

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from models.intent_classifier import IntentClassifier
from models.response_generator import ResponseGenerator
from models.entity_extractor import EntityExtractor
from models.sentiment_analyzer import SentimentAnalyzer

app = FastAPI(title="AI Chatbot ML Service")

# Initialize models
intent_classifier = IntentClassifier()
response_generator = ResponseGenerator()
entity_extractor = EntityExtractor()
sentiment_analyzer = SentimentAnalyzer()

class ChatRequest(BaseModel):
    message: str
    context: dict = {}

class ChatResponse(BaseModel):
    intent: str
    confidence: float
    response: str
    entities: list
    sentiment: dict

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Classify intent
        intent_result = intent_classifier.predict(request.message)
        
        # Extract entities
        entities = entity_extractor.extract(request.message)
        
        # Analyze sentiment
        sentiment = sentiment_analyzer.analyze(request.message)
        
        # Generate response
        prompt = f"User intent: {intent_result['intent']}. User message: {request.message}. Response:"
        response = response_generator.generate(prompt)
        
        return ChatResponse(
            intent=intent_result['intent'],
            confidence=intent_result['confidence'],
            response=response,
            entities=entities,
            sentiment=sentiment
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## Phase 4: Training Data Format

### intents.json

```json
{
  "intents": [
    {
      "tag": "greeting",
      "patterns": [
        "Hi",
        "Hello",
        "Hey",
        "Good morning",
        "Good afternoon",
        "What's up"
      ],
      "responses": [
        "Hello! 👋 How can I help you today?",
        "Hi there! What can I do for you?",
        "Hey! Ready to find your perfect match?"
      ]
    },
    {
      "tag": "find_matches",
      "patterns": [
        "Find matches",
        "Show me matches",
        "Who can I work with",
        "Find influencers",
        "Find companies",
        "Suggest matches"
      ],
      "responses": [
        "I can help you find perfect matches! Let me check your profile and suggest the best options.",
        "Great! Based on your profile, I'll find the most compatible matches for you."
      ]
    },
    {
      "tag": "collaboration",
      "patterns": [
        "Send collaboration request",
        "Work together",
        "Start project",
        "Collaborate",
        "Partner with"
      ],
      "responses": [
        "I can help you send a collaboration request! Which match would you like to reach out to?",
        "Let's get you connected! Tell me more about the collaboration you have in mind."
      ]
    },
    {
      "tag": "performance",
      "patterns": [
        "Show stats",
        "My performance",
        "Analytics",
        "How am I doing",
        "Dashboard"
      ],
      "responses": [
        "Let me pull up your performance metrics! 📊",
        "Here's a quick overview of your performance..."
      ]
    },
    {
      "tag": "help",
      "patterns": [
        "Help",
        "How does this work",
        "What can you do",
        "Guide",
        "Support"
      ],
      "responses": [
        "I'm here to help! I can assist you with:\n• Finding perfect matches\n• Sending collaboration requests\n• Viewing your analytics\n• Managing your profile\n\nWhat would you like to know more about?"
      ]
    }
  ]
}
```

---

## Phase 5: Backend Integration

### Update chatbot-ai.service.ts

```typescript
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ChatbotAIService {
  private readonly logger = new Logger(ChatbotAIService.name);
  private readonly mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';

  async generateResponse(message: string, context: any = {}): Promise<string> {
    try {
      const response = await axios.post(`${this.mlServiceUrl}/chat`, {
        message,
        context
      });

      return response.data.response;
    } catch (error) {
      this.logger.error('ML Service error:', error.message);
      return this.getFallbackResponse(message);
    }
  }

  async classifyIntent(message: string): Promise<{ intent: string; confidence: number }> {
    try {
      const response = await axios.post(`${this.mlServiceUrl}/chat`, {
        message
      });

      return {
        intent: response.data.intent,
        confidence: response.data.confidence
      };
    } catch (error) {
      this.logger.error('Intent classification error:', error.message);
      return { intent: 'unknown', confidence: 0 };
    }
  }

  private getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
      return "Hello! 👋 How can I help you today?";
    }
    
    if (lowerMessage.includes('match')) {
      return "I can help you find matches! Let me check your profile.";
    }
    
    if (lowerMessage.includes('help')) {
      return "I'm here to help! What do you need assistance with?";
    }
    
    return "I'm here to help! Could you please rephrase that?";
  }
}
```

---

## Phase 6: Requirements & Installation

### requirements.txt

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
transformers==4.35.2
torch==2.1.1
spacy==3.7.2
sentence-transformers==2.2.2
pydantic==2.5.0
python-multipart==0.0.6
aiofiles==23.2.1
```

### Installation Commands

```bash
# Create virtual environment
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Download pre-trained models (optional - will auto-download on first use)
python -c "from transformers import DistilBertTokenizer, GPT2Tokenizer; DistilBertTokenizer.from_pretrained('distilbert-base-uncased'); GPT2Tokenizer.from_pretrained('gpt2')"
```

---

## Phase 7: Docker Deployment

### Dockerfile

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download models
RUN python -m spacy download en_core_web_sm

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml (Add to existing)

```yaml
services:
  ml-service:
    build: ./ml-service
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=/app/models
    volumes:
      - ./ml-service/models:/app/models
      - ./ml-service/data:/app/data
    restart: unless-stopped
```

---

## Phase 8: Training Your Own Model

### train_intent.py

```python
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, Trainer, TrainingArguments
import torch
from torch.utils.data import Dataset
import json

class IntentDataset(Dataset):
    def __init__(self, texts, labels, tokenizer):
        self.encodings = tokenizer(texts, truncation=True, padding=True)
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)

def train_intent_classifier():
    # Load training data
    with open('data/intents.json', 'r') as f:
        data = json.load(f)
    
    texts = []
    labels = []
    intent_to_id = {}
    
    for idx, intent in enumerate(data['intents']):
        intent_to_id[intent['tag']] = idx
        for pattern in intent['patterns']:
            texts.append(pattern)
            labels.append(idx)
    
    # Initialize tokenizer and model
    tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
    model = DistilBertForSequenceClassification.from_pretrained(
        'distilbert-base-uncased',
        num_labels=len(intent_to_id)
    )
    
    # Create dataset
    dataset = IntentDataset(texts, labels, tokenizer)
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir='./models/intent_classifier',
        num_train_epochs=10,
        per_device_train_batch_size=8,
        warmup_steps=500,
        weight_decay=0.01,
        logging_dir='./logs',
    )
    
    # Train
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
    )
    
    trainer.train()
    
    # Save model
    model.save_pretrained('./models/intent_classifier')
    tokenizer.save_pretrained('./models/intent_classifier')
    
    # Save intent mapping
    with open('./models/intent_classifier/intent_mapping.json', 'w') as f:
        json.dump(intent_to_id, f)

if __name__ == '__main__':
    train_intent_classifier()
```

---

## Phase 9: Performance Optimization

### 1. Model Quantization (Reduce size by 4x)

```python
import torch
from transformers import DistilBertForSequenceClassification

model = DistilBertForSequenceClassification.from_pretrained('models/intent_classifier')
quantized_model = torch.quantization.quantize_dynamic(
    model, {torch.nn.Linear}, dtype=torch.qint8
)
torch.save(quantized_model.state_dict(), 'models/intent_classifier_quantized.pth')
```

### 2. Caching Responses

```python
from functools import lru_cache

@lru_cache(maxsize=1000)
def get_cached_response(message: str, intent: str):
    # Cache common responses
    pass
```

### 3. Batch Processing

```python
async def process_batch(messages: List[str]):
    # Process multiple messages at once
    inputs = tokenizer(messages, return_tensors='pt', padding=True)
    outputs = model(**inputs)
    return outputs
```

---

## Phase 10: Monitoring & Analytics

### Add to ML Service

```python
from prometheus_client import Counter, Histogram
import time

request_count = Counter('chatbot_requests_total', 'Total chatbot requests')
response_time = Histogram('chatbot_response_seconds', 'Response time')

@app.post("/chat")
async def chat(request: ChatRequest):
    request_count.inc()
    start_time = time.time()
    
    # ... process request ...
    
    response_time.observe(time.time() - start_time)
    return response
```

---

## Comparison: Self-Hosted vs OpenAI

| Feature | Self-Hosted | OpenAI API |
|---------|-------------|------------|
| **Cost** | Free (after setup) | $0.002/1K tokens |
| **Privacy** | 100% private | Data sent to OpenAI |
| **Customization** | Full control | Limited |
| **Setup Time** | 2-3 days | 5 minutes |
| **Maintenance** | Self-managed | Managed |
| **Performance** | Good (85-90%) | Excellent (95%+) |
| **Offline** | Yes | No |
| **Scalability** | Manual | Automatic |

---

## Next Steps

1. **Week 1:** Set up Python ML service with basic intent classification
2. **Week 2:** Train custom models on your data
3. **Week 3:** Integrate with backend and test
4. **Week 4:** Optimize and deploy to production

---

## Estimated Resources

**Development:**
- Time: 2-4 weeks
- Team: 1 ML engineer + 1 backend developer

**Production:**
- Server: 4GB RAM, 2 CPU cores
- Storage: 5GB
- Monthly Cost: ~$20-40 (VPS hosting)

---

## Conclusion

This self-hosted solution gives you:
- ✅ Zero API costs
- ✅ Complete data ownership
- ✅ Full customization
- ✅ Production-ready architecture
- ✅ Scalable design

Ready to implement? Let me know which phase you'd like to start with!
