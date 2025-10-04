from fastapi import FastAPI, HTTPException
from typing import List
from schemas import HealthResponse, TabularBatchRequest, TabularBatchResponse, MetricsResponse
from Services.predictor import Predictor

app = FastAPI(title="Exoplanet MVP API", version="0.1.0")
_model = Predictor()  # swap with a real model later


@app.get("/healthz", response_model=HealthResponse, tags=["system"])
def healthz():
    return HealthResponse(status="ok")


@app.post("/predict/tabular", response_model=TabularBatchResponse, tags=["inference"])
def predict_tabular(payload: TabularBatchRequest):
    if not payload.records:
        raise HTTPException(status_code=400, detail="No records provided.")

    probs: List[float] = _model.predict_proba(payload.records)
    labels: List[int] = [1 if p >= payload.threshold else 0 for p in probs]

    return TabularBatchResponse(
        model_version=_model.version,
        threshold=payload.threshold,
        probabilities=probs,
        labels=labels,
        count=len(labels),
    )


@app.get("/model/metrics", response_model=MetricsResponse, tags=["model"])
def model_metrics():
    # Placeholder metrics; replace with tracked values once you have a real model
    return MetricsResponse(
        model_version=_model.version,
        metrics={
            "roc_auc": 0.78,
            "pr_auc": 0.62,
            "f1": 0.71,
            "accuracy": 0.74,
        },
    )
