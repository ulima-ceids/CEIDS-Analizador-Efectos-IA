import os
import tempfile
from typing import Literal

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.analysis.dsp_features import extract_features
from src.analysis.effect_heuristics import estimate_effects


class DSPFeatures(BaseModel):
	rms_db: float
	centroid: float
	bandwidth: float
	flatness: float = Field(ge=0.0, le=1.0)
	zcr: float = Field(ge=0.0)
	hp_ratio: float = Field(ge=0.0, le=1.0)
	onset_count: int = Field(ge=0)
	reverb_ratio: float = Field(ge=0.0, le=1.0)


class EffectParameters(BaseModel):
	gain: int = Field(ge=0, le=100)
	tone: int = Field(ge=0, le=100)
	bass: int = Field(ge=0, le=100)
	mid: int = Field(ge=0, le=100)
	treble: int = Field(ge=0, le=100)
	reverb: int = Field(ge=0, le=100)


class AnalyzeResponse(BaseModel):
	effect: Literal["distortion", "overdrive", "clean", "fuzz"]
	confidence: float = Field(ge=0.0, le=1.0)
	parameters: EffectParameters
	features: DSPFeatures


class DocsInfoResponse(BaseModel):
	service: str
	version: str
	model_status: str
	analysis_pipeline: list[str]
	frontend_base_url: str
	cors_allowed_origins: list[str]
	contract: dict


def _clamp(value: float, low: float, high: float) -> float:
	return max(low, min(high, value))


def _normalize_features(raw: dict) -> DSPFeatures:
	# Convert hp_ratio from dB-like scale to [0, 1] expected by frontend schema.
	hp_db = float(raw.get("hp_ratio", 0.0))
	hp_norm = (hp_db + 20.0) / 40.0

	return DSPFeatures(
		rms_db=float(raw.get("rms_db", 0.0)),
		centroid=float(raw.get("centroid", 0.0)),
		bandwidth=float(raw.get("bandwidth", 0.0)),
		flatness=float(_clamp(float(raw.get("flatness", 0.0)), 0.0, 1.0)),
		zcr=float(max(0.0, float(raw.get("zcr", 0.0)))),
		hp_ratio=float(_clamp(hp_norm, 0.0, 1.0)),
		onset_count=int(max(0, int(raw.get("onset_count", 0)))),
		reverb_ratio=float(_clamp(float(raw.get("reverb_ratio", 0.0)), 0.0, 1.0)),
	)


app = FastAPI(title="EFECTOS-IA API", version="0.1.0")

ALLOWED_ORIGINS = [
	"http://localhost:5173",
	"http://127.0.0.1:5173",
]

app.add_middleware(
	CORSMiddleware,
	allow_origins=ALLOWED_ORIGINS,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
	return {"status": "ok"}


@app.get("/docs-info", response_model=DocsInfoResponse)
def docs_info() -> DocsInfoResponse:
	return DocsInfoResponse(
		service="EFECTOS-IA API",
		version=app.version,
		model_status="DSP heuristics active, CNN planned",
		analysis_pipeline=[
			"Audio decode and load (librosa)",
			"Feature extraction (RMS, centroid, bandwidth, flatness, ZCR)",
			"HPSS ratio and onset detection",
			"Heuristic effect estimation",
		],
		frontend_base_url="http://localhost:5173",
		cors_allowed_origins=ALLOWED_ORIGINS,
		contract={
			"method": "POST",
			"path": "/analyze",
			"content_type": "multipart/form-data",
			"field": "file",
			"response_fields": [
				"effect",
				"confidence",
				"parameters",
				"features",
			],
		},
	)


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(file: UploadFile = File(...)) -> AnalyzeResponse:
	if not file.filename:
		raise HTTPException(status_code=400, detail="Archivo inválido.")

	suffix = os.path.splitext(file.filename)[1].lower()
	allowed_ext = {".wav", ".mp3", ".ogg", ".flac", ".aif", ".aiff"}
	if suffix not in allowed_ext:
		raise HTTPException(
			status_code=400,
			detail="Formato no soportado. Usa WAV, MP3, OGG, FLAC o AIFF.",
		)

	temp_path = None
	try:
		with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
			content = await file.read()
			tmp.write(content)
			temp_path = tmp.name

		raw_features = extract_features(temp_path)
		estimated = estimate_effects(raw_features)

		features = _normalize_features(raw_features)
		parameters = EffectParameters(
			gain=int(estimated.get("gain", 0)),
			tone=int(estimated.get("tone", 0)),
			bass=int(estimated.get("bass", 0)),
			mid=int(estimated.get("mid", 0)),
			treble=int(estimated.get("treble", 0)),
			reverb=int(estimated.get("reverb", 0)),
		)

		return AnalyzeResponse(
			effect=str(estimated.get("effect", "clean")),
			confidence=float(_clamp(float(estimated.get("confidence", 0.0)), 0.0, 1.0)),
			parameters=parameters,
			features=features,
		)
	except HTTPException:
		raise
	except Exception as exc:
		raise HTTPException(status_code=500, detail=f"Error analizando el audio: {exc}")
	finally:
		if temp_path and os.path.exists(temp_path):
			os.remove(temp_path)
