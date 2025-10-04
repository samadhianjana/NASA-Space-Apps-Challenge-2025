from pydantic import BaseModel, Field, conlist
from typing import Dict, List, Optional


class HealthResponse(BaseModel):
    status: str = "ok"


class TabularRecord(BaseModel):
    """
    One row of tabular features. Keys = feature names, values = numeric.
    Example: {"flux": 0.12, "period": 3.4, "depth": 0.02}
    """
    features: Dict[str, float] = Field(default_factory=dict)


class TabularBatchRequest(BaseModel):
    """
    Batch of records to score. Threshold applies to label binarization.
    """
    records: conlist(TabularRecord, min_length=1)
    threshold: float = Field(default=0.5, ge=0.0, le=1.0)


class TabularBatchResponse(BaseModel):
    model_version: str
    threshold: float
    probabilities: List[float]
    labels: List[int]
    count: int


class MetricsResponse(BaseModel):
    model_version: str
    metrics: Dict[str, float]
