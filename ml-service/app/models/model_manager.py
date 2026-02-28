from .intent_classifier import IntentClassifier
from .response_generator import ResponseGenerator
from .entity_extractor import EntityExtractor
from .sentiment_analyzer import SentimentAnalyzer

class ModelManager:
    """
    Central manager for all AI models.
    Lazy loads components and provides a unified interface.
    """
    def __init__(self, intents_path: str):
        self.intents_path = intents_path
        self._intent_classifier = None
        self._response_generator = None
        self._entity_extractor = None
        self._sentiment_analyzer = None

    @property
    def intent_classifier(self) -> IntentClassifier:
        if self._intent_classifier is None:
            self._intent_classifier = IntentClassifier(self.intents_path)
        return self._intent_classifier

    @property
    def response_generator(self) -> ResponseGenerator:
        if self._response_generator is None:
            self._response_generator = ResponseGenerator(self.intents_path)
        return self._response_generator

    @property
    def entity_extractor(self) -> EntityExtractor:
        if self._entity_extractor is None:
            self._entity_extractor = EntityExtractor()
        return self._entity_extractor

    @property
    def sentiment_analyzer(self) -> SentimentAnalyzer:
        if self._sentiment_analyzer is None:
            self._sentiment_analyzer = SentimentAnalyzer()
        return self._sentiment_analyzer