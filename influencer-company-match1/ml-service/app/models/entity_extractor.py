import re
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class EntityExtractor:
    """Simple rule-based entity extractor"""
    
    def __init__(self):
        self.patterns = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
            'url': r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+',
            'money': r'\$\d+(?:,\d{3})*(?:\.\d{2})?',
            'date': r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
        }
        
        self.keywords = {
            'industry': ['tech', 'fashion', 'beauty', 'fitness', 'food', 'travel', 'gaming', 'music'],
            'platform': ['instagram', 'youtube', 'tiktok', 'twitter', 'facebook', 'linkedin'],
            'budget': ['budget', 'price', 'cost', 'payment', 'fee'],
        }
        
        logger.info("Entity extractor initialized")
    
    def extract(self, text: str) -> List[Dict]:
        """Extract entities from text"""
        entities = []
        text_lower = text.lower()
        
        # Extract pattern-based entities
        for entity_type, pattern in self.patterns.items():
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                entities.append({
                    'text': match.group(),
                    'label': entity_type,
                    'start': match.start(),
                    'end': match.end()
                })
        
        # Extract keyword-based entities
        for entity_type, keywords in self.keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    start = text_lower.index(keyword)
                    entities.append({
                        'text': keyword,
                        'label': entity_type,
                        'start': start,
                        'end': start + len(keyword)
                    })
        
        return entities
