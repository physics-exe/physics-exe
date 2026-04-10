from __future__ import annotations

import argparse
import csv
import json
from dataclasses import asdict, dataclass
from pathlib import Path
import sys

if __package__ in {None, ""}:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.linear_model import Ridge
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from hackathon_reefer_dl.metrics import composite_metrics


HOLDOUT_START = pd.Timestamp("2026-01-01T00:00:00Z")
WINDOW_HOURS = 223
WINDOW_STEP_HOURS = 24
RIDGE_ALPHA = 3.0
MIN_HOUR_TRAIN_ROWS = 30
FEATURE_NAMES = [
    "target_lag_24",
    "target_lag_168",
    "same3",
    "same7",
    "same7std",
    "day_delta",
    "week_delta",
    "active_visits",
    "power_per_visit_mean_kw",
    "temp_ambient_mean",
    "temp_return_mean",
    "temp_supply_mean",
]


@dataclass
class WindowRecord:
    start: str
    end: str
    mae_all: float
    mae_peak: float
    pinball_p90: float
    composite: float
    lag24_composite: float
    mean_target: float
    std_target: float


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train and run the January hourwise ridge forecaster.")
    parser.add_argument("--data", type=Path, required=True, help="Path to hourly_features.parquet")
    parser.add_argument("--out", type=Path, required=True, help="Output prediction CSV")
    parser.add_argument(
        "--targets",
        type=Path,
        help="Optional target timestamp CSV. Defaults to every target hour >= 2026-01-01 in the data artifact.",
    )
    return parser.parse_args()


def _iso(ts: pd.Timestamp) -> str:
    return ts.strftime("%Y-%m-%dT%H:%M:%SZ")


def _ridge_pipeline(alpha: float = RIDGE_ALPHA) -> Pipeline:
    return Pipeline(
        [
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("ridge", Ridge(alpha=alpha, positive=True)),
        ]
    )


def _residual_p90(
    train_true: np.ndarray,
    train_point: np.ndarray,
    train_hour: np.ndarray,
    val_point: np.ndarray,
    val_hour: np.ndarray,
) -> np.ndarray:
    positive = np.maximum(np.asarray(train_true) - np.asarray(train_point), 0.0)
    train_point = np.asarray(train_point, dtype=float)
    val_point = np.asarray(val_point, dtype=float)
    train_hour = np.asarray(train_hour, dtype=int)
    val_hour = np.asarray(val_hour, dtype=int)

    cuts = np.quantile(train_point, [1.0 / 3.0, 2.0 / 3.0])
    train_bin = np.digitize(train_point, cuts, right=False)
    val_bin = np.digitize(val_point, cuts, right=False)

    global_q = float(np.quantile(positive, 0.9))
    hour_q = {
        hour: (
            float(np.quantile(positive[train_hour == hour], 0.9))
            if np.sum(train_hour == hour) >= 20
            else global_q
        )
        for hour in range(24)
    }

    bucket_q: dict[tuple[int, int], float] = {}
    for hour in range(24):
        for pred_bin in range(3):
            mask = (train_hour == hour) & (train_bin == pred_bin)
            bucket_q[(hour, pred_bin)] = (
                float(np.quantile(positive[mask], 0.9)) if mask.sum() >= 12 else hour_q[hour]
            )

    uplift = np.asarray(
        [bucket_q[(int(hour), int(pred_bin))] for hour, pred_bin in zip(val_hour, val_bin, strict=True)],
        dtype=float,
    )
    return np.maximum(val_point, val_point + uplift)


def build_design_frame(data_path: Path) -> pd.DataFrame:
    df = pd.read_parquet(data_path)
    df["timestamp_utc"] = pd.to_datetime(df["timestamp_utc"], utc=True)
    df = df.sort_values("timestamp_utc").reset_index(drop=True)
    df["target_time"] = df["timestamp_utc"] + pd.Timedelta(hours=24)
    df["y"] = df["load_kw"].shift(-24)

    for hour in [24, 48, 72, 96, 120, 144, 168, 336]:
        df[f"target_lag_{hour}"] = df["load_kw"].shift(hour - 24)

    same7_cols = [f"target_lag_{hour}" for hour in [24, 48, 72, 96, 120, 144, 168]]
    df["same3"] = df[[f"target_lag_{hour}" for hour in [24, 48, 72]]].mean(axis=1)
    df["same7"] = df[same7_cols].mean(axis=1)
    df["same7std"] = df[same7_cols].std(axis=1)
    df["day_delta"] = df["target_lag_24"] - df["target_lag_48"]
    df["week_delta"] = df["target_lag_24"] - df["target_lag_168"]
    df["target_hour"] = df["target_time"].dt.hour.astype(int)

    return df.iloc[:-24].copy()


def predict_hour_models(
    train_df: pd.DataFrame,
    pred_df: pd.DataFrame,
    feature_names: list[str],
    alpha: float = RIDGE_ALPHA,
) -> tuple[np.ndarray, np.ndarray]:
    pred = np.zeros(len(pred_df), dtype=float)
    fitted = np.zeros(len(train_df), dtype=float)

    for hour in range(24):
        train_hour_df = train_df[(train_df["target_hour"] == hour) & np.isfinite(train_df["y"])].copy()
        pred_hour_df = pred_df[pred_df["target_hour"] == hour].copy()
        if len(train_hour_df) < MIN_HOUR_TRAIN_ROWS:
            fitted[train_df.index.get_indexer(train_hour_df.index)] = train_hour_df["target_lag_24"].to_numpy(float)
            if not pred_hour_df.empty:
                pred[pred_df.index.get_indexer(pred_hour_df.index)] = pred_hour_df["target_lag_24"].to_numpy(float)
            continue

        pipe = _ridge_pipeline(alpha=alpha)
        sample_weight = np.where(
            train_hour_df["y"].to_numpy(float) >= np.quantile(train_hour_df["y"].to_numpy(float), 0.85),
            1.75,
            1.0,
        )
        pipe.fit(train_hour_df[feature_names], train_hour_df["y"], ridge__sample_weight=sample_weight)
        fitted[train_df.index.get_indexer(train_hour_df.index)] = np.maximum(
            pipe.predict(train_hour_df[feature_names]),
            0.0,
        )
        if not pred_hour_df.empty:
            pred[pred_df.index.get_indexer(pred_hour_df.index)] = np.maximum(
                pipe.predict(pred_hour_df[feature_names]),
                0.0,
            )

    return fitted, pred


def _lag24_metric(history_df: pd.DataFrame, val_df: pd.DataFrame) -> float:
    q90 = float(
        np.quantile(
            np.maximum(
                history_df["y"].to_numpy(float) - history_df["target_lag_24"].to_numpy(float),
                0.0,
            ),
            0.9,
        )
    )
    metric = composite_metrics(
        val_df["y"].to_numpy(float),
        val_df["target_lag_24"].to_numpy(float),
        np.maximum(val_df["target_lag_24"].to_numpy(float), val_df["target_lag_24"].to_numpy(float) + q90),
    )
    return metric.composite


def select_stable_windows(
    train_df: pd.DataFrame,
    n_windows: int = 4,
    min_start: str = "2025-06-01T00:00:00Z",
    mean_low: float = 700.0,
    mean_high: float = 1050.0,
    std_high: float = 180.0,
) -> list[tuple[pd.Timestamp, pd.Timestamp]]:
    eligible: list[tuple[float, pd.Timestamp, pd.Timestamp]] = []
    start_ts = pd.Timestamp(min_start)
    start_idx = train_df.index[train_df["target_time"] >= start_ts][0]

    for idx in range(start_idx, len(train_df) - WINDOW_HOURS, WINDOW_STEP_HOURS):
        val_df = train_df.iloc[idx : idx + WINDOW_HOURS].copy()
        history_df = train_df.iloc[:idx].copy()
        if history_df.empty:
            continue
        mean_target = float(val_df["y"].mean())
        std_target = float(val_df["y"].std())
        if not (mean_low <= mean_target <= mean_high) or std_target > std_high:
            continue
        eligible.append(
            (
                _lag24_metric(history_df, val_df),
                pd.Timestamp(val_df["target_time"].iloc[0]),
                pd.Timestamp(val_df["target_time"].iloc[-1]),
            )
        )

    eligible.sort(key=lambda item: item[0])
    selected: list[tuple[pd.Timestamp, pd.Timestamp]] = []
    for _, start, end in eligible:
        overlaps = any(not (end < kept_start or start > kept_end) for kept_start, kept_end in selected)
        if overlaps:
            continue
        selected.append((start, end))
        if len(selected) == n_windows:
            break
    if len(selected) < n_windows:
        raise RuntimeError("Could not find enough non-overlapping stable validation windows.")
    selected.sort(key=lambda item: item[0])
    return selected


def load_targets(targets_path: Path) -> list[pd.Timestamp]:
    with targets_path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        return [pd.Timestamp(row["timestamp_utc"]) for row in reader]


def main() -> None:
    args = parse_args()
    df = build_design_frame(args.data)
    train_df = df[df["target_time"] < HOLDOUT_START].copy().reset_index(drop=True)

    stable_windows = select_stable_windows(train_df)
    window_records: list[WindowRecord] = []
    oof_rows: list[pd.DataFrame] = []

    for start, end in stable_windows:
        history_df = train_df[train_df["target_time"] < start].copy().reset_index(drop=True)
        val_df = train_df[(train_df["target_time"] >= start) & (train_df["target_time"] <= end)].copy().reset_index(drop=True)

        fitted_history, point_pred = predict_hour_models(history_df, val_df, FEATURE_NAMES, alpha=RIDGE_ALPHA)
        pred_p90 = _residual_p90(
            history_df["y"].to_numpy(float),
            fitted_history,
            history_df["target_hour"].to_numpy(int),
            point_pred,
            val_df["target_hour"].to_numpy(int),
        )
        lag24_composite = _lag24_metric(history_df, val_df)
        metric = composite_metrics(val_df["y"].to_numpy(float), point_pred, pred_p90)
        window_records.append(
            WindowRecord(
                start=_iso(start),
                end=_iso(end),
                mae_all=metric.mae_all,
                mae_peak=metric.mae_peak,
                pinball_p90=metric.pinball_p90,
                composite=metric.composite,
                lag24_composite=lag24_composite,
                mean_target=float(val_df["y"].mean()),
                std_target=float(val_df["y"].std()),
            )
        )
        oof_rows.append(
            pd.DataFrame(
                {
                    "target_hour": val_df["target_hour"].to_numpy(int),
                    "point_pred": point_pred,
                    "pred_bin_source": point_pred,
                    "positive_residual": np.maximum(val_df["y"].to_numpy(float) - point_pred, 0.0),
                }
            )
        )

    oof_df = pd.concat(oof_rows, axis=0, ignore_index=True)
    cuts = np.quantile(oof_df["pred_bin_source"].to_numpy(float), [1.0 / 3.0, 2.0 / 3.0])
    oof_df["pred_bin"] = np.digitize(oof_df["pred_bin_source"].to_numpy(float), cuts, right=False)
    global_q = float(np.quantile(oof_df["positive_residual"].to_numpy(float), 0.9))
    hour_q = {
        hour: (
            float(np.quantile(oof_df.loc[oof_df["target_hour"] == hour, "positive_residual"], 0.9))
            if int((oof_df["target_hour"] == hour).sum()) >= 20
            else global_q
        )
        for hour in range(24)
    }
    bucket_q: dict[str, float] = {}
    for hour in range(24):
        for pred_bin in range(3):
            mask = (oof_df["target_hour"] == hour) & (oof_df["pred_bin"] == pred_bin)
            bucket_q[f"{hour}|{pred_bin}"] = (
                float(np.quantile(oof_df.loc[mask, "positive_residual"], 0.9))
                if int(mask.sum()) >= 12
                else hour_q[hour]
            )

    if args.targets is not None:
        target_times = load_targets(args.targets)
    else:
        target_times = [pd.Timestamp(value) for value in df.loc[df["target_time"] >= HOLDOUT_START, "target_time"].tolist()]

    target_lookup = {
        pd.Timestamp(value): idx
        for idx, value in enumerate(df["target_time"].tolist())
    }
    missing = [ts for ts in target_times if ts not in target_lookup]
    if missing:
        raise KeyError(f"Missing {len(missing)} target rows in the feature table; first missing target is {missing[0]}")

    target_rows = df.iloc[[target_lookup[ts] for ts in target_times]].copy().reset_index(drop=True)
    final_train = train_df.copy()
    _, point_pred = predict_hour_models(final_train, target_rows, FEATURE_NAMES, alpha=RIDGE_ALPHA)
    pred_bin = np.digitize(point_pred, cuts, right=False)
    pred_p90 = np.maximum(
        point_pred,
        point_pred
        + np.asarray(
            [bucket_q.get(f"{int(hour)}|{int(bin_id)}", hour_q[int(hour)]) for hour, bin_id in zip(target_rows["target_hour"], pred_bin, strict=True)],
            dtype=float,
        ),
    )

    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["timestamp_utc", "pred_power_kw", "pred_p90_kw"])
        writer.writeheader()
        for target_time, point_value, upper_value in zip(target_times, point_pred, pred_p90, strict=True):
            writer.writerow(
                {
                    "timestamp_utc": _iso(target_time),
                    "pred_power_kw": round(float(max(point_value, 0.0)), 6),
                    "pred_p90_kw": round(float(max(upper_value, point_value, 0.0)), 6),
                }
            )

    summary = {
        "alpha": RIDGE_ALPHA,
        "feature_names": FEATURE_NAMES,
        "stable_windows": [asdict(record) for record in window_records],
        "stable_window_mean_composite": float(np.mean([record.composite for record in window_records])),
        "stable_window_mean_lag24_composite": float(np.mean([record.lag24_composite for record in window_records])),
        "p90_cuts": [float(value) for value in cuts],
        "p90_global_q90": global_q,
        "p90_hour_q90": {str(hour): value for hour, value in hour_q.items()},
    }
    args.out.with_suffix(".summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")

    if np.all(np.isfinite(target_rows["y"].to_numpy(float))):
        metric = composite_metrics(target_rows["y"].to_numpy(float), point_pred, pred_p90)
        args.out.with_suffix(".metrics.json").write_text(json.dumps(asdict(metric), indent=2), encoding="utf-8")
        print(f"Observed-target composite: {metric.composite:.6f}")

    print(f"Saved predictions to {args.out}")


if __name__ == "__main__":
    main()
