"""
Match Predictor using scikit-learn
Implements Random Forest and Gradient Boosting classifiers
"""
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import numpy as np
import logging

logger = logging.getLogger(__name__)


class MatchPredictor:
    """
    ML model for predicting match success
    Supports Random Forest and Gradient Boosting algorithms
    """
    
    def __init__(self, model_type='random_forest'):
        """
        Initialize predictor with specified model type
        
        Args:
            model_type: 'random_forest' or 'gradient_boosting'
        """
        self.model_type = model_type
        self.model = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the ML model based on type"""
        if self.model_type == 'random_forest':
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                max_features='sqrt',
                random_state=42,
                n_jobs=-1  # Use all CPU cores
            )
            logger.info("Initialized Random Forest classifier")
        elif self.model_type == 'gradient_boosting':
            self.model = GradientBoostingClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42
            )
            logger.info("Initialized Gradient Boosting classifier")
        else:
            raise ValueError(f"Unknown model type: {self.model_type}")
    
    def train(self, X, y):
        """
        Train the model with cross-validation
        
        Args:
            X: Feature matrix (n_samples, n_features)
            y: Target vector (n_samples,)
            
        Returns:
            Dictionary with training metrics
        """
        if len(X) < 10:
            logger.warning(f"Training with only {len(X)} samples. Results may be unreliable.")
        
        # Perform cross-validation
        try:
            cv_scores = cross_val_score(self.model, X, y, cv=min(5, len(X)), scoring='accuracy')
            cv_mean = cv_scores.mean()
            cv_std = cv_scores.std()
            logger.info(f"Cross-validation scores: {cv_mean:.3f} (+/- {cv_std:.3f})")
        except Exception as e:
            logger.warning(f"Cross-validation failed: {e}. Skipping CV.")
            cv_mean = 0.0
            cv_std = 0.0
        
        # Train on full dataset
        self.model.fit(X, y)
        
        # Calculate training metrics
        y_pred = self.model.predict(X)
        
        metrics = {
            'accuracy': float(accuracy_score(y, y_pred)),
            'precision': float(precision_score(y, y_pred, zero_division=0)),
            'recall': float(recall_score(y, y_pred, zero_division=0)),
            'f1_score': float(f1_score(y, y_pred, zero_division=0)),
            'cv_score': float(cv_mean),
            'cv_std': float(cv_std),
            'n_samples': int(len(y)),
            'n_features': int(X.shape[1])
        }
        
        logger.info(f"Training complete. Accuracy: {metrics['accuracy']:.3f}, F1: {metrics['f1_score']:.3f}")
        
        return metrics
    
    def predict(self, X):
        """
        Predict match success probability
        
        Args:
            X: Feature matrix (n_samples, n_features)
            
        Returns:
            Dictionary with predictions, probabilities, and confidence
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        # Get predictions
        predictions = self.model.predict(X)
        probabilities = self.model.predict_proba(X)
        
        # Calculate confidence (distance from 0.5)
        success_probs = probabilities[:, 1]
        confidence = np.abs(success_probs - 0.5) * 2  # Scale to 0-1
        
        return {
            'predictions': predictions.tolist(),
            'probabilities': success_probs.tolist(),
            'confidence': confidence.tolist()
        }
    
    def is_trained(self):
        """
        Check if the model has been trained
        
        Returns:
            Boolean indicating if model is trained
        """
        if self.model is None:
            return False
        return hasattr(self.model, 'n_features_in_')
    
    def get_feature_importance(self):
        """
        Get feature importance scores
        
        Returns:
            Array of feature importance scores or None if not available
        """
        if self.model is None:
            return None
        
        if hasattr(self.model, 'feature_importances_'):
            return self.model.feature_importances_.tolist()
        
        return None
    
    def get_model_info(self):
        """
        Get information about the current model
        
        Returns:
            Dictionary with model information
        """
        if self.model is None:
            return {
                'type': self.model_type,
                'trained': False
            }
        
        info = {
            'type': self.model_type,
            'trained': True,
        }
        
        if self.model_type == 'random_forest':
            info.update({
                'n_estimators': self.model.n_estimators,
                'max_depth': self.model.max_depth,
                'n_features': self.model.n_features_in_ if hasattr(self.model, 'n_features_in_') else None
            })
        elif self.model_type == 'gradient_boosting':
            info.update({
                'n_estimators': self.model.n_estimators,
                'learning_rate': self.model.learning_rate,
                'max_depth': self.model.max_depth,
                'n_features': self.model.n_features_in_ if hasattr(self.model, 'n_features_in_') else None
            })
        
        return info
