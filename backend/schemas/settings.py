"""Validated inference / system settings (API contract)."""
from __future__ import annotations

from typing import Any

from pydantic import AliasChoices, BaseModel, Field, field_validator, model_validator


class SettingsFull(BaseModel):
    """Complete validated configuration after merge with defaults."""

    model_config = {"populate_by_name": True}

    n_states: int = Field(
        ...,
        ge=2,
        le=10,
        validation_alias=AliasChoices("n_states", "hidden_states"),
    )
    pm25_threshold: float = Field(..., gt=0, le=500)
    volatility_ratio: float = Field(..., ge=0.01, le=1.0)
    regime_high_aqi: float = Field(..., gt=0, le=600)
    regime_stable_max_aqi: float = Field(..., gt=0, le=500)
    min_dwell_hours: float = Field(..., ge=1, le=168)
    smoothing_enabled: bool = True

    @field_validator("min_dwell_hours")
    @classmethod
    def min_dwell_realistic(cls, v: float) -> float:
        if v < 1:
            raise ValueError("min_dwell_hours must be >= 1")
        return v

    @model_validator(mode="after")
    def stable_below_high(self) -> "SettingsFull":
        if self.regime_stable_max_aqi >= self.regime_high_aqi:
            raise ValueError("regime_stable_max_aqi must be less than regime_high_aqi")
        return self


def coerce_settings_dict(data: dict[str, Any]) -> dict[str, Any]:
    """Normalize raw JSON values before Pydantic validation."""
    out = dict(data)
    if "hidden_states" in out and "n_states" not in out:
        out["n_states"] = out.pop("hidden_states")
    if "n_states" in out:
        out["n_states"] = int(out["n_states"])
    if "smoothing_enabled" in out:
        out["smoothing_enabled"] = bool(out["smoothing_enabled"])
    for k in ("pm25_threshold", "volatility_ratio", "regime_high_aqi", "regime_stable_max_aqi", "min_dwell_hours"):
        if k in out and out[k] is not None:
            out[k] = float(out[k])
    return out
