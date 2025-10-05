from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routes import router as api_router

app = FastAPI(
    title="Exoplanet Classifier API",
    version="1.0.0",
    description="Serve predictions for exoplanet candidacy using a pickled model."
)

# CORS: relax as needed for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

# Basic root
@app.get("/")
def root():
    return {"status": "ok", "service": "exoplanet-api", "version": "1.0.0"}
