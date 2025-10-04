from typing import List, Dict
import math


class Predictor:
    """
    Mock predictor for an MVP.
    Heuristic: sigmoid(normalized sum of feature values).
    Replace with a real ML model (e.g., load from disk) later.
    """

    def __init__(self):
        self.version = "mock-0.1.0"

    def _score_row(self, feature_map: Dict[str, float]) -> float:
        if not feature_map:
            return 0.0
        # Simple, stable heuristic: average of clipped features → sigmoid
        vals = [max(min(float(v), 10.0), -10.0) for v in feature_map.values()]
        avg = sum(vals) / len(vals)
        # mild scaling so probabilities aren't all ~0.5
        z = avg / 3.0
        return 1.0 / (1.0 + math.exp(-z))

    def predict_proba(self, records: List["TabularRecord"]) -> List[float]:
        return [self._score_row(r.features) for r in records]
