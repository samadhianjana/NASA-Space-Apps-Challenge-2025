# app/services/predictor_lightcurve.py
from typing import Optional, Tuple
import os
import io
import numpy as np
from PIL import Image  # pillow>=10

# ----------------------------
# Vector-path helpers (your originals)
# ----------------------------

def _nan_safe(arr: np.ndarray) -> np.ndarray:
    if not np.isnan(arr).any():
        return arr
    idx = np.where(~np.isnan(arr))[0]
    if idx.size == 0:
        return np.zeros_like(arr)
    return np.interp(np.arange(arr.size), idx, arr[idx])

def _rolling_median(arr: np.ndarray, win: int) -> np.ndarray:
    win = max(5, int(win // 2 * 2 + 1))
    pad = win // 2
    x = np.pad(arr, (pad, pad), mode="edge")
    out = np.empty_like(arr)
    for i in range(arr.size):
        out[i] = np.median(x[i:i + win])
    return out

def _median_detrend(arr: np.ndarray, win: Optional[int] = None) -> np.ndarray:
    if win is None:
        win = int(max(11, min(101, arr.size // 30)))
        win = win // 2 * 2 + 1
    baseline = _rolling_median(arr, win)
    return arr - baseline

def _standardize(arr: np.ndarray, eps: float = 1e-8) -> np.ndarray:
    mu = float(np.mean(arr))
    sd = float(np.std(arr))
    return (arr - mu) / (sd + eps)

def _resample_lin(arr: np.ndarray, target_len: int) -> np.ndarray:
    if arr.size == target_len:
        return arr
    x_old = np.linspace(0.0, 1.0, arr.size)
    x_new = np.linspace(0.0, 1.0, target_len)
    return np.interp(x_new, x_old, arr)

def _infer_seq_len_from_model(model) -> Optional[int]:
    """Return L if model input shape is (None, L) or (None, L, C); else None."""
    shp = model.inputs[0].shape
    # (None, L)
    if len(shp) == 2 and shp[1] is not None:
        return int(shp[1])
    # (None, L, C)
    if len(shp) == 3 and shp[1] is not None:
        return int(shp[1])
    return None

def _expects_channel_dim(model) -> bool:
    shp = model.inputs[0].shape
    return len(shp) == 3  # (N, L, 1) or (N, L, C)

def _postprocess_logits_to_prob(y: np.ndarray) -> float:
    y = np.array(y)
    if y.ndim == 2 and y.shape[1] == 1:
        prob1 = float(y[0, 0])          # sigmoid
    elif y.ndim == 2 and y.shape[1] == 2:
        prob1 = float(y[0, 1])          # softmax [p0, p1]
    else:
        v = float(np.squeeze(y))        # generic score -> sigmoid
        prob1 = 1.0 / (1.0 + np.exp(-v))
    return max(0.0, min(1.0, prob1))

def _get_threshold() -> float:
    val = os.getenv("LC_MODEL_THRESHOLD", None)
    if val is None:
        return 0.5
    try:
        t = float(val)
        return 0.0 if t < 0 else 1.0 if t > 1 else t
    except Exception:
        return 0.5

# ----------------------------
# Public API: vector pathway
# ----------------------------

def preprocess_lightcurve(raw_samples: np.ndarray, target_len: Optional[int] = None) -> np.ndarray:
    x = np.asarray(raw_samples, dtype=np.float32).ravel()
    x = _nan_safe(x)
    x = _median_detrend(x, None)
    x = _standardize(x)
    if target_len is not None:
        x = _resample_lin(x, target_len)
    return x

def predict_lightcurve(model, samples: np.ndarray) -> Tuple[float, int]:
    """
    Vector pathway: run inference with a Keras model on a 1-D light-curve vector.
    Returns (probability_of_planet, label in {0,1}).
    """
    L = _infer_seq_len_from_model(model) or 512
    x = preprocess_lightcurve(samples, L)

    x = x[None, ...]  # (1, L)
    if _expects_channel_dim(model):
        x = x[..., None]  # (1, L, 1)

    y = model.predict(x, verbose=0)
    prob1 = _postprocess_logits_to_prob(y)

    thr = _get_threshold()
    label = 1 if prob1 >= thr else 0
    return prob1, label

# ----------------------------
# Image → series extractor (for plotted light curves)
# ----------------------------

def _normalize_0_1(arr: np.ndarray) -> np.ndarray:
    a = arr.astype(np.float32)
    if a.max() > 1.0:
        a = a / 255.0
    return a

def _extract_series_from_plot(img: Image.Image, target_len: int) -> np.ndarray:
    """
    Heuristic extractor for typical LC plots:
    1) grayscale
    2) contrast stretch
    3) per-column 'dark-row' soft argmin to trace the curve
    4) invert y to flux-ish and smooth
    5) resample to target_len
    """
    # 1) grayscale + resize width ~ target_len (keep aspect ratio)
    img = img.convert("L")
    w0, h0 = img.size
    if w0 <= 0 or h0 <= 0:
        raise ValueError("Invalid image dimensions.")
    new_w = min(max(target_len, 256), 4096)
    new_h = int(round(h0 * (new_w / w0)))
    img = img.resize((new_w, new_h), Image.BILINEAR)

    # 2) to numpy, normalize to [0,1]
    g = _normalize_0_1(np.asarray(img, dtype=np.float32))  # (H,W), 0=black,1=white

    # optional quick contrast stretch
    lo, hi = np.percentile(g, [1, 99])
    if hi > lo:
        g = np.clip((g - lo) / (hi - lo), 0, 1)

    # 3) soft argmin over rows for each column
    # darker = smaller; use softmin weights
    tau = 0.08  # temperature (tune if needed)
    W = g.shape[1]
    rows = np.arange(g.shape[0], dtype=np.float32)[:, None]  # (H,1)
    # weights per column: exp(-(1-g)/tau) => darker (g~0) => larger weight
    wts = np.exp(-(1.0 - g) / tau)  # (H,W)
    wts_sum = np.maximum(wts.sum(axis=0, keepdims=True), 1e-6)
    y_soft = (rows[:, 0:1] * wts).sum(axis=0) / wts_sum[0]  # (W,)
    # invert y: top->1, bottom->0
    y_norm = 1.0 - (y_soft / max(g.shape[0] - 1, 1))

    # 4) mild smoothing
    k = max(3, int(W // 200) | 1)
    pad = k // 2
    y_pad = np.pad(y_norm, (pad, pad), mode="edge")
    y_sm = np.convolve(y_pad, np.ones(k) / k, mode="valid")

    # 5) resample to target_len and z-score
    series = _resample_lin(y_sm.astype(np.float32), target_len)
    series = _standardize(series)
    return series

# ----------------------------
# Public API: image bytes → model prediction
# ----------------------------

def predict_lightcurve_from_image_bytes(model, image_bytes: bytes) -> Tuple[float, int]:
    """
    If the model expects (N,L) or (N,L,C), extract a 1-D series from the plot and feed vector path.
    If the model expects image tensors, resize+normalize and feed as image.
    """
    shp = model.inputs[0].shape
    rank = len(shp)

    img = Image.open(io.BytesIO(image_bytes))

    # CASE A: sequence model (your case) -> extract 1-D series
    L = _infer_seq_len_from_model(model)
    if L is not None:
        series = _extract_series_from_plot(img, L)
        return predict_lightcurve(model, series)

    # CASE B: true image model -> build (1,H,W,C)/(1,H,W,1)
    # Fallback sizes
    H = int(shp[1]) if rank >= 3 and shp[1] is not None else 224
    W = int(shp[2]) if rank >= 3 and shp[2] is not None else 224
    C = int(shp[3]) if rank >= 4 and shp[3] is not None else 1

    img = img.resize((W, H), Image.BILINEAR)
    if C == 1:
        if img.mode != "L":
            img = img.convert("L")
        arr = np.asarray(img, dtype=np.float32)[..., None]
    else:
        if img.mode != "RGB":
            img = img.convert("RGB")
        arr = np.asarray(img, dtype=np.float32)

    x = _normalize_0_1(arr)[None, ...]
    y = model.predict(x, verbose=0)
    prob1 = _postprocess_logits_to_prob(y)
    thr = _get_threshold()
    label = 1 if prob1 >= thr else 0
    return prob1, label
