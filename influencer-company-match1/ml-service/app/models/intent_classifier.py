import json
import os
from typing import Dict
import logging

logger = logging.getLogger(__name__)

class IntentClassifier:
    """Rule-based intent classifier with pattern matching"""
    
    def __init__(self, intents_file='data/intents.json'):
        self.intents_file = intents_file
        self.intents = self.load_intents()
        logger.info(f"Loaded {len(self.intents)} intents")
    
    def load_intents(self) -> Dict:
        """Load intents from JSON file"""
        try:
            intents_path = os.path.join(os.path.dirname(__file__), '..', '..', self.intents_file)
            
            if not os.path.exists(intents_path):
                logger.warning(f"Intents file not found: {intents_path}, using defaults")
                return self.get_default_intents()
            
            with open(intents_path, 'r') as f:
                data = json.load(f)
            return data.get('intents', [])
        except Exception as e:
            logger.error(f"Error loading intents: {e}")
            return self.get_default_intents()
    
    def get_default_intents(self) -> list:
        """Default intents if file not found"""
        return [
            {
                "tag": "greeting",
                "patterns": ["hi", "hello", "hey", "good morning", "good afternoon", "what's up"],
                "responses": ["Hello! 👋 How can I help you today?", "Hi there! What can I do for you?"]
            },
            {
                "tag": "find_matches",
                "patterns": ["find matches", "show matches", "who can i work with", "find influencers", "find companies"],
                "responses": ["I can help you find perfect matches! Let me check your profile."]
            },
            {
                "tag": "collaboration",
                "patterns": ["send collaboration", "work together", "start project", "collaborate"],
                "responses": ["I can help you send a collaboration request! Which match would you like to reach out to?"]
            },
            {
                "tag": "performance",
                "patterns": ["show stats", "my performance", "analytics", "how am i doing"],
                "responses": ["Let me pull up your performance metrics! 📊"]
            },
            {
                "tag": "help",
                "patterns": ["help", "how does this work", "what can you do", "guide"],
                "responses": ["I'm here to help! I can assist you with finding matches, collaboration requests, and viewing analytics."]
            }
        ]
    
    def predict(self, text: str) -> Dict:
        """Predict intent from text using pattern matching"""
        text_lower = text.lower().strip()
        
        best_match = None
        best_score = 0
        
        for intent in self.intents:
            score = 0
            patterns = intent.get('patterns', [])
            
            for pattern in patterns:
                pattern_lower = pattern.lower()
                
                # Exact match
                if pattern_lower == text_lower:
                    score = 1.0
                    break
                
                # Contains match
                elif pattern_lower in text_lower:
                    score = max(score, 0.8)
                
                # Word overlap
                else:
                    pattern_words = set(pattern_lower.split())
                    text_words = set(text_lower.split())
                    overlap = len(pattern_words & text_words)
                    if overlap > 0:
                        score = max(score, overlap / max(len(pattern_words), len(text_words)))
            
            if score > best_score:
                best_score = score
                best_match = intent
        
        if best_match and best_score > 0.3:
            return {
                'intent': best_match['tag'],
                'confidence': round(best_score, 4)
            }
        
        return {
            'intent': 'unknown',
            'confidence': 0.0
        }
    
    def classify(self, text: str) -> tuple:
        """Classify intent and return tuple (intent, confidence, extracted_entities)
        
        This method wraps predict() and returns 3 values as expected by main.py
        """
        result = self.predict(text)
        
        # Extract simple entities from the text
        extracted_entities = self._extract_entities(text)
        
        return (
            result['intent'],
            result['confidence'],
            extracted_entities
        )
    
    def _extract_entities(self, text: str) -> Dict:
        """Extract simple entities from text based on keywords"""
        text_lower = text.lower()
        entities = {}
        
        # Industry keywords
        industries = ['tech', 'fashion', 'beauty', 'fitness', 'food', 'travel', 'gaming', 'music', 'sports', 'health']
        for industry in industries:
            if industry in text_lower:
                entities['industry'] = industry
                break
        
        # Platform keywords
        platforms = ['instagram', 'youtube', 'tiktok', 'twitter', 'facebook', 'linkedin']
        for platform in platforms:
            if platform in text_lower:
                entities['platform'] = platform
                break
        
        # Budget-related keywords
        budget_keywords = ['budget', 'price', 'cost', 'payment', 'fee', 'cheap', 'expensive', 'affordable']
        for keyword in budget_keywords:
            if keyword in text_lower:
                entities['budget_related'] = True
                break
        
        return entities if entities else None
