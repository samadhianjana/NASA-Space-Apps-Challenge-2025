from typing import Dict, List
import numpy as np
from fastapi import HTTPException, status

from app.core.config import read_feature_order

FEATURES = read_feature_order()

def ensure_and_order(payload: Dict[str, float]) -> List[float]:
    """
    Validate presence of all expected features, cast to float, and return in canonical order.
    """
    missing = [f for f in FEATURES if f not in payload]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": "Missing required features", "missing": missing},
        )

    try:
        ordered = [float(payload[f]) for f in FEATURES]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": f"Failed to cast feature to float: {e}"},
        )
    return ordered

def stack_instances(instances: List[Dict[str, float]]) -> np.ndarray:
    """
    Convert list of dicts → 2D numpy array (n_samples, n_features)
    """
    ordered_rows = [ensure_and_order(x) for x in instances]
    X = np.asarray(ordered_rows, dtype=float)
    return X
