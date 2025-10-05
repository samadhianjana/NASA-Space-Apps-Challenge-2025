from typing import Optional
import numpy as np

from fastapi import APIRouter, HTTPException, UploadFile, File, Form 
from app.schemas import PredictRequest, PredictResponse, ModelInfo
from ...services.predictor_tabular import predict, model_info
from app.schemas import BackendPredictResponse, LCResult
from app.services.model_loader import get_lightcurve_model
from app.services import model_loader
from app.services.predictor_lightcurve import predict_lightcurve_from_image_bytes


router = APIRouter()

@router.get("/healthz")
def healthz():
    try:
        m = model_loader.get_model()
        return {"status": "ok", "model_loaded": m is not None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model/info", response_model=ModelInfo)
def get_model_info():
    return model_info()

@router.post("/predict/tabular", response_model=PredictResponse)
def predict_tabular(body: PredictRequest):
    results = predict([item.model_dump() for item in body.instances])
    return PredictResponse(results=results)




@router.post("/predict/lightcurve", response_model=BackendPredictResponse)
async def predict_lightcurve(
    image: UploadFile = File(..., description="PNG/JPEG/WEBP image of the light curve"),
):
    try:
        if image.content_type not in {"image/png", "image/jpeg", "image/jpg", "image/webp"}:
            raise HTTPException(status_code=400, detail="Unsupported image type.")
        data = await image.read()
        if not data:
            raise HTTPException(status_code=400, detail="Empty image payload.")

        model = get_lightcurve_model()
        # Uses LC_MODEL_THRESHOLD from .env internally
        prob1, label = predict_lightcurve_from_image_bytes(model, data)

        return BackendPredictResponse(results=[LCResult(probability=prob1, label=label)])

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Light-curve image inference failed: {e}")
