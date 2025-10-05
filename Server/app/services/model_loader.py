# app/services/model_loader.py
import os
import threading
from typing import Any, Optional

import numpy as np
import joblib  # Use joblib for loading scikit-learn models

from app.core.config import settings

# -----------------------------
# Thread-safe, lazy-loaded singletons (Tabular)
# -----------------------------
_model_lock = threading.Lock()
_model_obj: Optional[Any] = None

_preproc_lock = threading.Lock()
_preproc_obj: Optional[Any] = None


def _load_model(path: str) -> Any:
    """Load a Sklearn/Joblib model, with fallback to pickle."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model file not found: {path}")
    try:
        return joblib.load(path)
    except Exception as e:
        import pickle
        try:
            with open(path, "rb") as f:
                return pickle.load(f)
        except Exception as e2:
            raise RuntimeError(
                f"Failed to load model with both joblib and pickle.\n"
                f"Joblib error: {e}\nPickle error: {e2}"
            )


def get_model() -> Any:
    """Thread-safe singleton getter for the TABULAR model."""
    global _model_obj
    if _model_obj is None:
        with _model_lock:
            if _model_obj is None:
                print(f"🔍 Loading tabular model from: {settings.MODEL_PATH}")
                _model_obj = _load_model(settings.MODEL_PATH)
                print("✅ Tabular model loaded successfully!")
    return _model_obj


def get_preprocessor() -> Optional[Any]:
    """
    Optional: load a separate preprocessor if you saved one.
    If you baked preprocessing into the model pipeline, this will never be used.
    """
    global _preproc_obj
    preproc_path = getattr(settings, "PREPROC_PATH", None)
    if not preproc_path:
        return None
    if _preproc_obj is None:
        with _preproc_lock:
            if _preproc_obj is None and os.path.exists(preproc_path):
                print(f"🔍 Loading preprocessor from: {preproc_path}")
                _preproc_obj = _load_model(preproc_path)
                print("✅ Preprocessor loaded successfully!")
    return _preproc_obj


def predict_proba(X: np.ndarray) -> np.ndarray:
    """
    Convenience helper for TABULAR pathway only.
    Returns a 1D array of probabilities for the positive class when available.
    """
    model = get_model()

    if isinstance(X, list):
        X = np.array(X)

    if hasattr(model, "predict_proba"):
        proba = np.array(model.predict_proba(X))
        if proba.ndim == 2:
            if proba.shape[1] == 2:
                return proba[:, 1]   # binary positive-class prob
            return proba.max(axis=1)  # multiclass: max prob
        return proba  # already 1D

    if hasattr(model, "decision_function"):
        scores = np.array(model.decision_function(X))
        min_s, max_s = scores.min(), scores.max()
        if max_s - min_s > 1e-12:
            return (scores - min_s) / (max_s - min_s)
        return (scores > 0).astype(float)

    preds = np.array(model.predict(X))
    return preds.astype(float)


# -----------------------------
# Light-curve (Keras) model loader (image or vector heads)
# -----------------------------
_lc_model_lock = threading.Lock()
_lc_model_obj: Optional[Any] = None


def _load_keras_model(path: str) -> Any:
    """Load a TensorFlow/Keras model lazily to avoid TF import unless needed."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Keras model file not found: {path}")
    import tensorflow as tf  # lazy import
    return tf.keras.models.load_model(path)


def get_lightcurve_model() -> Any:
    """Thread-safe singleton getter for the LIGHT-CURVE Keras model."""
    global _lc_model_obj
    if _lc_model_obj is None:
        with _lc_model_lock:
            if _lc_model_obj is None:
                lc_path = getattr(settings, "LIGHTCURVE_MODEL_PATH", None)
                if not lc_path:
                    raise RuntimeError("LIGHTCURVE_MODEL_PATH is not set in settings/.env.")
                print(f"🔍 Loading light-curve model from: {lc_path}")
                _lc_model_obj = _load_keras_model(lc_path)
                print("✅ Light-curve model loaded successfully!")
    return _lc_model_obj


# -----------------------------
# (Optional) test helpers
# -----------------------------
def _clear_model_caches_for_tests() -> None:
    """Clear all singletons (useful in unit tests)."""
    global _model_obj, _preproc_obj, _lc_model_obj
    with _model_lock:
        _model_obj = None
    with _preproc_lock:
        _preproc_obj = None
    with _lc_model_lock:
        _lc_model_obj = None
