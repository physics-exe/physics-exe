from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


SITE_DIR = Path(__file__).resolve().parents[1]
REPO_DIR = Path(__file__).resolve().parents[2]
OUTPUT_PATH = SITE_DIR / "data" / "siteData.js"


FEATURE_LABELS = {
    "active_container_count": "Active container count",
    "share_stack_tier_1": "Stack tier 1 share",
    "share_stack_tier_2": "Stack tier 2 share",
    "share_stack_tier_3": "Stack tier 3 share",
    "mean_stack_tier": "Mean stack tier",
    "mean_ambient_minus_setpoint_c": "Ambient minus setpoint",
    "mean_temperature_ambient_c": "Ambient temperature",
    "mean_temperature_setpoint_c": "Setpoint temperature",
    "mean_temperature_return_c": "Return temperature",
    "mean_temperature_supply_c": "Supply temperature",
    "mean_return_minus_supply_c": "Return minus supply",
    "day_of_year": "Day of year",
    "month": "Month",
    "weather_temperature_vc_halle3_c": "VC Halle 3 temperature",
    "weather_temperature_mean_c": "Mean site temperature",
    "weather_temperature_zentralgate_c": "Zentralgate temperature",
    "weather_temperature_spread_c": "Temperature spread",
    "weather_wind_speed_vc_halle3": "VC Halle 3 wind speed",
    "weather_wind_speed_zentralgate": "Zentralgate wind speed",
    "weather_wind_speed_mean": "Mean wind speed",
    "weather_wind_speed_spread": "Wind speed spread",
    "weather_wind_direction_vc_halle3_cos": "VC Halle 3 wind direction",
    "weather_wind_direction_mean_cos": "Mean wind direction",
    "weather_wind_direction_zentralgate_cos": "Zentralgate wind direction",
}


def clean_label(name: str) -> str:
    if name in FEATURE_LABELS:
        return FEATURE_LABELS[name]
    return (
        name.replace("share_hardware_", "")
        .replace("share_container_size_", "Size ")
        .replace("_", " ")
        .title()
    )


def to_records(frame: pd.DataFrame, rename_map: dict[str, str] | None = None, digits: int = 3) -> list[dict]:
    rename_map = rename_map or {}
    records: list[dict] = []
    for row in frame.to_dict(orient="records"):
        output = {}
        for key, value in row.items():
            target_key = rename_map.get(key, key)
            if isinstance(value, pd.Timestamp):
                output[target_key] = value.isoformat().replace("+00:00", "Z")
            elif pd.isna(value):
                output[target_key] = None
            elif isinstance(value, float):
                output[target_key] = round(float(value), digits)
            else:
                output[target_key] = value
        records.append(output)
    return records


def sample_frame(frame: pd.DataFrame, max_rows: int) -> pd.DataFrame:
    if len(frame) <= max_rows:
        return frame.copy()
    step = max(1, len(frame) // max_rows)
    return frame.iloc[::step].head(max_rows).copy()


def main() -> None:
    dataset_summary = json.loads((REPO_DIR / "outputs" / "dataset_analysis" / "dataset_summary.json").read_text(encoding="utf-8"))
    weather_summary = json.loads((REPO_DIR / "outputs" / "weather_analysis" / "weather_summary.json").read_text(encoding="utf-8"))

    predictions = pd.read_csv(REPO_DIR / "outputs" / "results" / "predictions_physics_exe_v5.csv")
    predictions["timestamp_utc"] = pd.to_datetime(predictions["timestamp_utc"], utc=True)

    january = pd.read_csv(REPO_DIR / "outputs" / "results" / "predictions_for_january.csv")
    january = january.rename(columns={january.columns[0]: "timestamp"})
    january["timestamp"] = pd.to_datetime(january["timestamp"], utc=True)
    january["abs_error_kw"] = (january["predicted_power_kw"] - january["true_power_kw"]).abs()

    january_actual_lookup = january.set_index("timestamp").to_dict(orient="index")

    january_forecast = predictions.copy()
    january_forecast["actual_kw"] = january_forecast["timestamp_utc"].map(
        lambda ts: january_actual_lookup.get(ts, {}).get("true_power_kw")
    )
    january_forecast["abs_error_kw"] = january_forecast["timestamp_utc"].map(
        lambda ts: january_actual_lookup.get(ts, {}).get("abs_error_kw")
    )

    january_daily_mae = (
        january.assign(day=january["timestamp"].dt.strftime("%b %d"))
        .groupby("day", sort=False)["abs_error_kw"]
        .mean()
        .reset_index()
        .rename(columns={"day": "label", "abs_error_kw": "mae_kw"})
    )

    hourly = pd.read_csv(REPO_DIR / "outputs" / "dataset_analysis" / "hourly_features.csv")
    hourly["timestamp_utc"] = pd.to_datetime(hourly["timestamp_utc"], utc=True)

    weather_hourly = pd.read_csv(REPO_DIR / "outputs" / "weather_analysis" / "weather_label_hourly.csv")
    weather_hourly["timestamp_utc"] = pd.to_datetime(weather_hourly["timestamp_utc"], utc=True)

    feature_corr = pd.read_csv(REPO_DIR / "outputs" / "dataset_analysis" / "feature_label_correlations.csv").head(8)
    feature_corr["label"] = feature_corr["feature"].map(clean_label)
    feature_importance = pd.read_csv(REPO_DIR / "outputs" / "dataset_analysis" / "feature_importance.csv").head(8)
    feature_importance["label"] = feature_importance["feature"].map(clean_label)

    weather_corr = pd.read_csv(REPO_DIR / "outputs" / "weather_analysis" / "same_hour_weather_correlations.csv").head(6)
    weather_corr["label"] = weather_corr["feature"].map(clean_label)
    weather_windows = pd.read_csv(REPO_DIR / "outputs" / "weather_analysis" / "weather_history_window_recommendations.csv").head(6)
    weather_windows["label"] = weather_windows["feature"].map(clean_label)

    year_series = sample_frame(hourly[["timestamp_utc", "label_power_kw"]], 1600)
    container_scatter = sample_frame(hourly[["active_container_count", "label_power_kw"]], 220)
    weather_scatter = sample_frame(
        weather_hourly[["weather_temperature_vc_halle3_c", "label_power_kw"]].dropna(),
        220,
    )

    hour_profile = (
        hourly.groupby("hour_of_day", sort=True)["label_power_kw"]
        .mean()
        .reset_index()
        .assign(label=lambda frame: frame["hour_of_day"].map(lambda hour: f"{int(hour):02d}:00"))
    )

    month_labels = {
        1: "Jan",
        2: "Feb",
        3: "Mar",
        4: "Apr",
        5: "May",
        6: "Jun",
        7: "Jul",
        8: "Aug",
        9: "Sep",
        10: "Oct",
        11: "Nov",
        12: "Dec",
    }
    month_profile = (
        hourly.groupby("month", sort=True)["label_power_kw"]
        .mean()
        .reset_index()
        .assign(label=lambda frame: frame["month"].map(month_labels))
    )

    top_error_hours = (
        january.nlargest(5, "abs_error_kw")[["timestamp", "predicted_power_kw", "true_power_kw", "abs_error_kw"]]
        .assign(label=lambda frame: frame["timestamp"].dt.strftime("%b %d %H:%M UTC"))
    )

    site_data = {
        "meta": {
            "generatedAtUtc": pd.Timestamp.utcnow().isoformat().replace("+00:00", "Z"),
            "siteTitle": "physics.exe Reefer Forecast Presentation",
        },
        "challenge": {
            "task": dataset_summary["challenge_understanding"]["task"],
            "evaluationWeights": dataset_summary["challenge_understanding"]["evaluation_weights"],
            "rawRows": dataset_summary["raw_dataset_summary"]["row_count"],
            "hourlyRows": dataset_summary["raw_dataset_summary"]["hourly_count"],
            "publicTargetHours": dataset_summary["target_summary"]["row_count"],
            "coverageStartUtc": dataset_summary["raw_dataset_summary"]["timestamp_min_utc"],
            "coverageEndUtc": dataset_summary["raw_dataset_summary"]["timestamp_max_utc"],
        },
        "solution": {
            "name": "Autoregressive Generator Notebook",
            "notebookPath": "outputs/results/generative_models.ipynb",
            "submissionPath": "outputs/results/predictions_physics_exe_v5.csv",
            "trainingWindow": "Historical sequence until January 2026",
            "inferenceWindow": "January 1 to January 10, 2026",
            "architecture": {
                "inputSize": 1,
                "hiddenSize": 16,
                "outputSize": 1,
                "batchSize": 1,
                "loss": "L1 loss",
                "activation": "ReLU",
                "optimizer": "Adam",
                "learningRate": 0.001,
                "epochs": 1000,
                "correlationThreshold": 0.4,
                "featureWeightClamp": "1e-8 to 1e-5",
                "p90Rule": "point forecast + 10%",
            },
            "process": [
                "Rank numeric features by correlation to reefer power.",
                "Build sequential one-hour batches and train a small generator MLP.",
                "Roll the model across the January horizon to predict the next hour.",
                "Attach a cautious p90 estimate as a fixed 10 percent uplift.",
            ],
            "diagramFlow": {
                "inputs": [
                    {
                        "title": "Hourly table",
                        "detail": "Notebook reads the base hourly dataset and keeps timestamp, power target, and numeric candidates.",
                    },
                    {
                        "title": "Correlation screen",
                        "detail": "Features are ranked by absolute correlation and filtered with a threshold of |r| >= 0.4.",
                    },
                    {
                        "title": "Sequential batches",
                        "detail": "The notebook constructs batch size 1 windows so each row predicts the next hour.",
                    },
                ],
                "network": [
                    {
                        "title": "Main MLP path",
                        "detail": "Current-hour power enters fc1: 1 -> 16, then ReLU, then fc2: 16 -> 1.",
                    },
                    {
                        "title": "Feature correction path",
                        "detail": "Each correlated feature gets its own learnable scalar weight and contributes an additive correction term.",
                    },
                    {
                        "title": "Output merge",
                        "detail": "The final point forecast is MLP output plus the summed feature correction stream.",
                    },
                ],
                "training": [
                    {
                        "title": "Target hour",
                        "detail": "For pair i, the target is the next batch's power value, so the model learns one-step-ahead prediction.",
                    },
                    {
                        "title": "Loss and updates",
                        "detail": "L1 loss is optimized with Adam for both the network parameters and the feature weights.",
                    },
                    {
                        "title": "Stopping rule",
                        "detail": "The notebook allows up to 1000 epochs per pair and stops early when loss gets sufficiently small.",
                    },
                ],
                "inference": [
                    {
                        "title": "January rollout",
                        "detail": "The trained notebook is evaluated across the January 2026 slice to produce next-hour point forecasts.",
                    },
                    {
                        "title": "Risk band",
                        "detail": "The p90 estimate is defined as a fixed 10 percent uplift above the point forecast.",
                    },
                ],
            },
            "layerBreakdown": [
                {
                    "stage": "fc1",
                    "shape": "1 -> 16",
                    "note": "Current power scalar projected into hidden space.",
                },
                {
                    "stage": "ReLU",
                    "shape": "16",
                    "note": "Non-linear activation inside the generator block.",
                },
                {
                    "stage": "fc2",
                    "shape": "16 -> 1",
                    "note": "Base next-hour estimate before feature correction.",
                },
                {
                    "stage": "Feature weights",
                    "shape": "k -> 1",
                    "note": "Sum of weighted correlated features, clamped to a tiny positive range.",
                },
                {
                    "stage": "Final output",
                    "shape": "1",
                    "note": "Point forecast used for submission and p90 uplift.",
                },
            ],
            "featureThemes": [
                "Load memory",
                "Container activity",
                "Stack composition",
                "Reefer temperatures",
                "Weather context",
            ],
        },
        "results": {
            "meanPredictionKw": round(float(predictions["pred_power_kw"].mean()), 2),
            "peakPredictionKw": round(float(predictions["pred_power_kw"].max()), 2),
            "meanP90UpliftPct": round(float(((predictions["pred_p90_kw"] / predictions["pred_power_kw"]) - 1).mean() * 100), 2),
            "overlapHours": int(len(january)),
            "maeKw": round(float(january["abs_error_kw"].mean()), 2),
            "rmseKw": round(float((((january["predicted_power_kw"] - january["true_power_kw"]) ** 2).mean()) ** 0.5), 2),
            "peakActualKw": round(float(january["true_power_kw"].max()), 2),
            "peakPredictedKw": round(float(january["predicted_power_kw"].max()), 2),
            "peakCapturePct": round(float(january["predicted_power_kw"].max() / january["true_power_kw"].max() * 100), 2),
        },
        "januaryForecast": to_records(
            january_forecast[["timestamp_utc", "pred_power_kw", "pred_p90_kw", "actual_kw", "abs_error_kw"]],
            rename_map={
                "timestamp_utc": "timestampUtc",
                "pred_power_kw": "pointKw",
                "pred_p90_kw": "p90Kw",
                "actual_kw": "actualKw",
                "abs_error_kw": "absErrorKw",
            },
            digits=2,
        ),
        "januaryDailyMae": to_records(january_daily_mae, rename_map={"mae_kw": "valueKw"}, digits=2),
        "yearlyPowerSeries": to_records(
            year_series,
            rename_map={"timestamp_utc": "timestampUtc", "label_power_kw": "powerKw"},
            digits=2,
        ),
        "hourProfile": to_records(
            hour_profile[["label", "label_power_kw"]],
            rename_map={"label_power_kw": "powerKw"},
            digits=2,
        ),
        "monthProfile": to_records(
            month_profile[["label", "label_power_kw"]],
            rename_map={"label_power_kw": "powerKw"},
            digits=2,
        ),
        "containerScatter": to_records(
            container_scatter,
            rename_map={"active_container_count": "containers", "label_power_kw": "powerKw"},
            digits=2,
        ),
        "weatherScatter": to_records(
            weather_scatter,
            rename_map={"weather_temperature_vc_halle3_c": "temperatureC", "label_power_kw": "powerKw"},
            digits=2,
        ),
        "topFeatureCorrelations": to_records(
            feature_corr[["label", "pearson_correlation"]],
            rename_map={"pearson_correlation": "value"},
            digits=3,
        ),
        "topFeatureImportances": to_records(
            feature_importance[["label", "mae_increase_kw"]],
            rename_map={"mae_increase_kw": "valueKw"},
            digits=1,
        ),
        "topWeatherSignals": to_records(
            weather_corr[["label", "pearson_correlation"]],
            rename_map={"pearson_correlation": "value"},
            digits=3,
        ),
        "weatherWindows": to_records(
            weather_windows[
                [
                    "label",
                    "peak_history_window_hours",
                    "efficient_history_window_hours",
                    "peak_mean_abs_future_correlation",
                ]
            ],
            rename_map={
                "peak_history_window_hours": "peakHours",
                "efficient_history_window_hours": "efficientHours",
                "peak_mean_abs_future_correlation": "score",
            },
            digits=2,
        ),
        "weatherOverview": {
            "hourlyWeatherRows": weather_summary["overlap_summary"]["weather_hour_count"],
            "weatherFeatures": weather_summary["overlap_summary"]["weather_feature_count"],
            "overlapStartUtc": weather_summary["overlap_summary"]["overlap_range_utc"][0],
            "overlapEndUtc": weather_summary["overlap_summary"]["overlap_range_utc"][1],
        },
        "topErrorHours": to_records(
            top_error_hours[["label", "predicted_power_kw", "true_power_kw", "abs_error_kw"]],
            rename_map={
                "predicted_power_kw": "predictedKw",
                "true_power_kw": "actualKw",
                "abs_error_kw": "absErrorKw",
            },
            digits=2,
        ),
    }

    OUTPUT_PATH.write_text(
        "window.siteData = " + json.dumps(site_data, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
