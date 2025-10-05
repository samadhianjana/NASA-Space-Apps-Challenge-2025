from typing import List, Optional
from pydantic import BaseModel, Field

# ----------------------------
# Tabular (existing)
# ----------------------------

class ExoFeatures(BaseModel):
    koi_period: float = Field(...)
    koi_period_err1: float = Field(...)
    koi_period_err2: float = Field(...)
    koi_time0bk: float = Field(...)
    koi_time0bk_err1: float = Field(...)
    koi_time0bk_err2: float = Field(...)
    koi_impact: float = Field(...)
    koi_impact_err1: float = Field(...)
    koi_impact_err2: float = Field(...)
    koi_duration: float = Field(...)
    koi_duration_err1: float = Field(...)

class PredictRequest(BaseModel):
    instances: List[ExoFeatures]

class PredictItemResult(BaseModel):
    probability: float
    label: int  # 1 = planet, 0 = non-planet

class PredictResponse(BaseModel):
    results: List[PredictItemResult]


# ----------------------------
# Light-curve (vector) payload
# ----------------------------
# NOTE: Pydantic v2 — use List[float] + Field(min_length=...)
class LightCurvePayload(BaseModel):
    samples: List[float] = Field(
        ...,
        min_length=32,
        description="1-D light curve flux values in time order (at least 32 samples).",
    )
    sampling_rate: Optional[float] = Field(
        None,
        description="Optional sampling rate if your model uses it (e.g., samples per day).",
    )

# Result/response types for LC — keep names expected by routes.py
class LCResult(BaseModel):
    probability: float
    label: int  # 1 = planet, 0 = non-planet

class BackendPredictResponse(BaseModel):
    results: List[LCResult]


# ----------------------------
# Model info
# ----------------------------
class ModelInfo(BaseModel):
    model_class: str
    loaded: bool
    features: List[str]
    threshold: Optional[float] = None
    n_features_in_: Optional[int] = None


# ----------------------------
# Optional aliases (so both tabular & LC code can share names)
# ----------------------------
# If your tabular code expects PredictItemResult/PredictResponse,
# and LC route expects LCResult/BackendPredictResponse, both exist.
# If you prefer one set everywhere, keep these aliases:
# (Uncomment if helpful)
# LCResult = PredictItemResult
# BackendPredictResponse = PredictResponse
