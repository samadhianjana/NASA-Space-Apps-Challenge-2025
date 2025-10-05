from typing import Dict, List
import numpy as np

from app.core.config import settings, read_feature_order
from app.services.feature_guard import stack_instances
from app.services import model_loader

def predict(instances: List[Dict[str, float]]) -> List[Dict[str, float]]:
    """
    instances: list of dicts (feature_name -> value)
    returns: list of dicts with probability and label
    """
    X = stack_instances(instances)  # shape: (n, d)

    # If you saved a separate preprocessor, apply it here (ONLY if your model isn't a pipeline)
    preproc = model_loader.get_preprocessor()
    if preproc is not None and not hasattr(model_loader.get_model(), "steps"):
        X = preproc.transform(X)

    # Get probabilities
    probs = model_loader.predict_proba(X)  # could be 1D or 2D

    # 🔧 Ensure probs is 1D
    probs = np.array(probs)
    if probs.ndim == 2:
        if probs.shape[1] == 2:
            probs = probs[:, 1]  # binary classification → positive class
        else:
            probs = probs.max(axis=1)  # multiclass → max probability per row

    # Apply threshold for labels
    threshold = settings.MODEL_THRESHOLD
    labels = (probs >= threshold).astype(int)

    # Ensure flat scalars for JSON
    probs = np.ravel(probs)
    labels = np.ravel(labels)

    results = [{"probability": float(p), "label": int(l)} for p, l in zip(probs, labels)]
    return results

def model_info() -> Dict[str, object]:
    m = model_loader.get_model()
    features = read_feature_order()
    info = {
        "model_class": type(m).__name__,
        "loaded": True,
        "features": features,
        "threshold": settings.MODEL_THRESHOLD,
        "n_features_in_": getattr(m, "n_features_in_", None),
    }
    return info
