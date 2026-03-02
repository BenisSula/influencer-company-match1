import json
import os
import random
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class ResponseGenerator:
    """Template-based response generator"""
    
    def __init__(self, intents_file='data/intents.json'):
        self.intents_file = intents_file
        self.intents = self.load_intents()
        self.intent_map = {intent['tag']: intent for intent in self.intents}
        logger.info("Response generator initialized")
    
    def load_intents(self) -> List[Dict]:
        """Load intents from JSON file"""
        try:
            intents_path = os.path.join(os.path.dirname(__file__), '..', '..', self.intents_file)
            
            if not os.path.exists(intents_path):
                return self.get_default_intents()
            
            with open(intents_path, 'r') as f:
                data = json.load(f)
            return data.get('intents', [])
        except Exception as e:
            logger.error(f"Error loading intents: {e}")
            return self.get_default_intents()
    
    def get_default_intents(self) -> list:
        """Default intents"""
        return [
            {
                "tag": "greeting",
                "responses": [
                    "Hello! 👋 How can I help you today?",
                    "Hi there! What can I do for you?",
                    "Hey! Ready to find your perfect match?"
                ]
            },
            {
                "tag": "find_matches",
                "responses": [
                    "I can help you find perfect matches! Let me check your profile and suggest the best options.",
                    "Great! Based on your profile, I'll find the most compatible matches for you."
                ]
            },
            {
                "tag": "collaboration",
                "responses": [
                    "I can help you send a collaboration request! Which match would you like to reach out to?",
                    "Let's get you connected! Tell me more about the collaboration you have in mind."
                ]
            },
            {
                "tag": "performance",
                "responses": [
                    "Let me pull up your performance metrics! 📊",
                    "Here's a quick overview of your performance..."
                ]
            },
            {
                "tag": "help",
                "responses": [
                    "I'm here to help! I can assist you with:\n• Finding perfect matches\n• Sending collaboration requests\n• Viewing your analytics\n• Managing your profile\n\nWhat would you like to know more about?"
                ]
            },
            {
                "tag": "unknown",
                "responses": [
                    "I'm not sure I understand. Could you rephrase that?",
                    "I'm here to help! Try asking about matches, collaborations, or your performance.",
                    "I didn't quite get that. You can ask me about finding matches, sending collaboration requests, or viewing your stats."
                ]
            }
        ]
    
    def generate(self, intent: str, message: str, context: Dict = {}, confidence: float = 1.0) -> str:
        """Generate response based on intent"""
        
        # Low confidence fallback
        if confidence < 0.3:
            intent = 'unknown'
        
        # Get responses for intent
        intent_data = self.intent_map.get(intent)
        
        if not intent_data:
            intent_data = self.intent_map.get('unknown', {})
        
        responses = intent_data.get('responses', ["I'm here to help! How can I assist you?"])
        
        # Select random response
        response = random.choice(responses)
        
        # Personalize with context
        if context.get('user_name'):
            response = f"{context['user_name']}, {response}"
        
        return response
    
    def get_suggestions(self, intent: str) -> List[str]:
        """Get follow-up suggestions based on intent"""
        suggestions_map = {
            'greeting': [
                "Find matches for me",
                "Show my performance",
                "Help me collaborate"
            ],
            'find_matches': [
                "Show me top matches",
                "Filter by industry",
                "View match details"
            ],
            'collaboration': [
                "View my requests",
                "Send a message",
                "Schedule a meeting"
            ],
            'performance': [
                "Show detailed analytics",
                "Compare with others",
                "Export report"
            ],
            'help': [
                "Find matches",
                "View analytics",
                "Send collaboration request"
            ]
        }
        
        return suggestions_map.get(intent, [
            "Find matches",
            "View performance",
            "Get help"
        ])
