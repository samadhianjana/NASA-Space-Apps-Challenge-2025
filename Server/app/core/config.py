# app/core/config.py
import json
import os
from dataclasses import dataclass
from typing import List, Optional

from dotenv import load_dotenv

load_dotenv()  # read .env if present

# ---- Fallback feature order (exactly your list) ----
DEFAULT_FEATURES: List[str] = [
    "koi_period",
    "koi_period_err1",
    "koi_period_err2",
    "koi_time0bk",
    "koi_time0bk_err1",
    "koi_time0bk_err2",
    "koi_impact",
    "koi_impact_err1",
    "koi_impact_err2",
    "koi_duration",
    "koi_duration_err1",
]


def _env_float(key: str, default: float) -> float:
    v = os.getenv(key)
    if v is None:
        return default
    try:
        return float(v)
    except Exception:
        return default


def _env_int(key: str, default: int) -> int:
    v = os.getenv(key)
    if v is None:
        return default
    try:
        return int(v)
    except Exception:
        return default


def _normpath(p: str) -> str:
    # Normalize OS-specific paths; accept forward slashes on Windows too.
    return os.path.normpath(p)


@dataclass(frozen=True)
class Settings:
    # --- Tabular model ---
    MODEL_PATH: str = _normpath(os.getenv("MODEL_PATH", "models/tabular/model.pkl"))
    PREPROC_PATH: str = _normpath(os.getenv("PREPROC_PATH", "models/preprocessing.pkl"))  # optional
    FEATURE_ORDER_PATH: str = _normpath(os.getenv("FEATURE_ORDER_PATH", "models/feature_order.json"))
    MODEL_THRESHOLD: float = _env_float("MODEL_THRESHOLD", 0.5)

    # --- Light-curve model (vector or image Keras model) ---
    LIGHTCURVE_MODEL_PATH: str = _normpath(
        os.getenv("LIGHTCURVE_MODEL_PATH", "models/lightcurve/model.keras")
    )
    LC_MODEL_THRESHOLD: float = _env_float("LC_MODEL_THRESHOLD", 0.5)

    # --- Server (optional; only if you read these elsewhere) ---
    UVICORN_HOST: str = os.getenv("UVICORN_HOST", "0.0.0.0")
    UVICORN_PORT: int = _env_int("UVICORN_PORT", 8000)
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")

    # --- CORS (optional) ---
    # ALLOW_ORIGINS can be a comma-separated list, e.g., "http://localhost:5173,https://myapp.com"
    ALLOW_ORIGINS_RAW: str = os.getenv("ALLOW_ORIGINS", "*")

    @property
    def ALLOW_ORIGINS(self) -> List[str]:
        raw = self.ALLOW_ORIGINS_RAW.strip()
        if raw == "*" or raw == "":
            return ["*"]
        return [o.strip() for o in raw.split(",") if o.strip()]


settings = Settings()


def read_feature_order() -> List[str]:
    path = settings.FEATURE_ORDER_PATH
    try:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                features = json.load(f)
            if isinstance(features, list) and all(isinstance(x, str) for x in features):
                return features
    except Exception:
        pass
    return DEFAULT_FEATURES
