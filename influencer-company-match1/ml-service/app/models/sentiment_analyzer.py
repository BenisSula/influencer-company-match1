from typing import Dict
import logging

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    """Simple rule-based sentiment analyzer"""
    
    def __init__(self):
        self.positive_words = {
            'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
            'love', 'like', 'happy', 'pleased', 'satisfied', 'perfect',
            'awesome', 'brilliant', 'outstanding', 'superb', 'thanks', 'thank'
        }
        
        self.negative_words = {
            'bad', 'terrible', 'awful', 'horrible', 'poor', 'disappointing',
            'hate', 'dislike', 'unhappy', 'unsatisfied', 'worst', 'useless',
            'annoying', 'frustrating', 'problem', 'issue', 'error', 'broken'
        }
        
        logger.info("Sentiment analyzer initialized")
    
    def analyze(self, text: str) -> Dict:
        """Analyze sentiment of text"""
        text_lower = text.lower()
        words = text_lower.split()
        
        positive_count = sum(1 for word in words if word in self.positive_words)
        negative_count = sum(1 for word in words if word in self.negative_words)
        
        total = positive_count + negative_count
        
        if total == 0:
            sentiment = 'neutral'
            score = 0.5
        elif positive_count > negative_count:
            sentiment = 'positive'
            score = 0.5 + (positive_count / (total * 2))
        elif negative_count > positive_count:
            sentiment = 'negative'
            score = 0.5 - (negative_count / (total * 2))
        else:
            sentiment = 'neutral'
            score = 0.5
        
        return {
            'sentiment': sentiment,
            'score': round(score, 4),
            'positive_words': positive_count,
            'negative_words': negative_count
        }
