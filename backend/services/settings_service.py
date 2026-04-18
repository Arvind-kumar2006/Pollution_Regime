"""Load persisted inference settings merged with safe defaults."""
from __future__ import annotations

from backend.database import SessionLocal
from backend.models import SystemSettings

DEFAULT_INFERENCE_SETTINGS = {
    "n_states": 3,
    "pm25_threshold": 150.0,
    "volatility_ratio": 0.2,
    "regime_high_aqi": 200.0,
    "regime_stable_max_aqi": 100.0,
    "min_dwell_hours": 1.0,
    "smoothing_enabled": True,
}

ALLOWED_SETTING_KEYS: frozenset[str] = frozenset(DEFAULT_INFERENCE_SETTINGS.keys())
CONFIG_VERSION_KEY = "__config_version__"


def load_inference_settings() -> dict:
    merged = dict(DEFAULT_INFERENCE_SETTINGS)
    db = SessionLocal()
    try:
        rows = db.query(SystemSettings).all()
        for row in rows:
            key = row.setting_key
            if key not in merged:
                continue
            val = row.setting_value
            if isinstance(val, dict):
                continue
            if key == "smoothing_enabled":
                merged[key] = bool(val)
            elif key == "n_states":
                merged[key] = int(val)
            elif key == "min_dwell_hours":
                fh = float(val)
                merged[key] = (
                    fh
                    if fh >= 1.0
                    else float(DEFAULT_INFERENCE_SETTINGS["min_dwell_hours"])
                )
            else:
                merged[key] = float(val)
    finally:
        db.close()
    return merged
