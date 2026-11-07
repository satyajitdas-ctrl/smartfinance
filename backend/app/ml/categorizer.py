from pathlib import Path
import joblib
import numpy as np

ML_DIR = Path(__file__).resolve().parent
MODEL_PATH = ML_DIR / "artifacts" / "expense_categorizer.joblib"


class ExpenseCategorizer:
    _instance = None

    def __init__(self):
        self.model = None
        self.version = "1.0.0"
        self.classes = []
        self._load_or_train()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_or_train(self):
        if MODEL_PATH.exists():
            data = joblib.load(MODEL_PATH)
            self.model = data["model"]
            self.version = data.get("version", "1.0.0")
            self.classes = data.get("classes", [])
        else:
            from app.ml.train_categorizer import train_and_export_model
            data = train_and_export_model()
            self.model = data["model"]
            self.version = data.get("version", "1.0.0")
            self.classes = data.get("classes", [])

    def predict(self, description: str) -> dict:
        """Predicts the category for a transaction description with probability confidence."""
        if not description or not description.strip():
            return {
                "description": description,
                "predicted_category": "Other",
                "confidence": 0.5,
                "model_version": self.version,
            }

        text = description.strip()
        probs = self.model.predict_proba([text])[0]
        max_idx = int(np.argmax(probs))
        predicted_cat = self.model.classes_[max_idx]
        confidence = round(float(probs[max_idx]), 2)

        return {
            "description": text,
            "predicted_category": predicted_cat,
            "confidence": confidence,
            "model_version": self.version,
        }


categorizer = ExpenseCategorizer.get_instance()
