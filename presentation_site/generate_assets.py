from __future__ import annotations

import json
import sys
from datetime import timedelta
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.colors import LinearSegmentedColormap
from matplotlib.ticker import FuncFormatter

REPO_ROOT = Path(__file__).resolve().parents[1]
SITE_ROOT = Path(__file__).resolve().parent
PLOTS_DIR = SITE_ROOT / "assets" / "plots"
DATA_DIR = SITE_ROOT / "assets" / "data"
PARTICIPANT_DIR = REPO_ROOT.parent / "participant_package" / "participant_package"

for directory in (PLOTS_DIR, DATA_DIR):
    directory.mkdir(parents=True, exist_ok=True)

sys.path.insert(0, str(REPO_ROOT))

from hackathon_reefer_dl.baselines import aggregate_hourly_load, load_target_hours  # noqa: E402

COLORS = {
    "ink": "#10243F",
    "slate": "#5F6F86",
    "teal": "#178C82",
    "teal_soft": "#8FD3C8",
    "orange": "#EB6A3E",
    "gold": "#D8A34A",
    "sand": "#F2D8A7",
    "rose": "#F29D85",
    "red": "#B7412E",
    "grid": "#D8DEEA",
    "panel": "#FFFDF8",
}


def apply_style() -> None:
    plt.rcParams.update(
        {
            "figure.facecolor": "none",
            "axes.facecolor": "none",
            "savefig.facecolor": "none",
            "font.family": "DejaVu Sans",
            "font.size": 11,
            "axes.titlesize": 17,
            "axes.labelsize": 11,
            "axes.edgecolor": COLORS["grid"],
            "axes.linewidth": 1.0,
            "axes.labelcolor": COLORS["ink"],
            "xtick.color": COLORS["slate"],
            "ytick.color": COLORS["slate"],
            "text.color": COLORS["ink"],
            "axes.titlecolor": COLORS["ink"],
            "grid.color": COLORS["grid"],
            "grid.alpha": 0.7,
            "grid.linestyle": "-",
            "legend.frameon": False,
        }
    )


def save_svg(fig: plt.Figure, filename: str) -> None:
    fig.savefig(PLOTS_DIR / filename, format="svg", bbox_inches="tight")
    plt.close(fig)


def metric_formatter(_: float, __: int) -> str:
    return ""


def kw_formatter(value: float, _: int) -> str:
    return f"{value:,.0f} kW"


def pretty_label(raw: str) -> str:
    return (
        raw.replace("weather_", "")
        .replace("_vc_halle3", " Halle 3")
        .replace("_zentralgate", " Zentralgate")
        .replace("_mean", " Mean")
        .replace("_temperature", "Temperature")
        .replace("_wind_direction", "Wind Dir.")
        .replace("_wind_speed", "Wind Speed")
        .replace("_consistency", " Consistency")
        .replace("_c", " (C)")
        .replace("_", " ")
        .title()
    )


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def read_prediction_frame(path: Path) -> pd.DataFrame:
    frame = pd.read_csv(path)
    frame["timestamp"] = pd.to_datetime(frame["timestamp_utc"], utc=True).dt.tz_convert(None)
    return frame[["timestamp", "pred_power_kw", "pred_p90_kw"]].rename(
        columns={"pred_power_kw": "point", "pred_p90_kw": "p90"}
    )


def build_public_window_frame() -> tuple[pd.DataFrame, pd.Series]:
    hourly_load = aggregate_hourly_load(PARTICIPANT_DIR)
    history = pd.Series(hourly_load).sort_index()
    history.index = pd.to_datetime(history.index)
    history = history.rename("actual_kw")

    target_times = pd.to_datetime(load_target_hours(PARTICIPANT_DIR / "target_timestamps.csv"))
    frame = pd.DataFrame(index=target_times)
    frame.index.name = "timestamp"
    frame["actual_kw"] = [history.loc[timestamp] for timestamp in target_times]
    frame["lag24_kw"] = [hourly_load[timestamp.to_pydatetime() - timedelta(hours=24)] for timestamp in target_times]

    model_df = read_prediction_frame(REPO_ROOT / "hackathon_reefer_dl" / "outputs" / "predictions_tabular_emergency.csv")
    final_df = read_prediction_frame(REPO_ROOT / "hackathon_reefer_dl" / "outputs" / "predictions_final_blend.csv")

    frame = frame.join(model_df.set_index("timestamp").rename(columns={"point": "tabular_kw", "p90": "tabular_p90_kw"}))
    frame = frame.join(final_df.set_index("timestamp").rename(columns={"point": "final_kw", "p90": "final_p90_kw"}))
    frame = frame.reset_index()
    return frame, history


def plot_history_context(history: pd.Series, public_frame: pd.DataFrame) -> None:
    rolling = history.rolling(24, min_periods=1).mean()

    fig, ax = plt.subplots(figsize=(12.5, 4.6), constrained_layout=True)
    ax.plot(history.index, history.values, color=COLORS["slate"], alpha=0.28, linewidth=0.9, label="Hourly load")
    ax.plot(rolling.index, rolling.values, color=COLORS["teal"], linewidth=1.9, label="24h rolling mean")

    start = public_frame["timestamp"].min()
    end = public_frame["timestamp"].max()
    ax.axvspan(start, end, color=COLORS["orange"], alpha=0.13)
    ax.annotate(
        "Public target window\nJanuary 1-10, 2026",
        xy=(start, float(history.loc[start])),
        xytext=(18, 28),
        textcoords="offset points",
        fontsize=10,
        color=COLORS["orange"],
        fontweight="bold",
    )

    ax.set_title("Year-Long Load History With The Public Forecast Window Highlighted", loc="left", pad=14)
    ax.set_ylabel("Aggregate reefer load")
    ax.yaxis.set_major_formatter(FuncFormatter(kw_formatter))
    ax.grid(axis="y")
    ax.xaxis.set_major_locator(mdates.MonthLocator(interval=2))
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %Y"))
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.legend(loc="upper left", ncol=2)
    save_svg(fig, "history_context.svg")


def plot_january_forecast(public_frame: pd.DataFrame, peak_threshold: float) -> None:
    fig, ax = plt.subplots(figsize=(12.5, 5.8), constrained_layout=True)

    ax.fill_between(
        public_frame["timestamp"],
        public_frame["final_kw"],
        public_frame["final_p90_kw"],
        color=COLORS["sand"],
        alpha=0.55,
        label="Winning blend P90 band",
    )
    ax.plot(public_frame["timestamp"], public_frame["actual_kw"], color=COLORS["ink"], linewidth=2.6, label="Observed load")
    ax.plot(
        public_frame["timestamp"],
        public_frame["tabular_kw"],
        color=COLORS["orange"],
        linewidth=1.7,
        label="Residual tabular MLP",
    )
    ax.plot(
        public_frame["timestamp"],
        public_frame["final_kw"],
        color=COLORS["teal"],
        linewidth=2.2,
        label="Winning final blend",
    )
    ax.plot(
        public_frame["timestamp"],
        public_frame["lag24_kw"],
        color=COLORS["slate"],
        linewidth=1.1,
        linestyle=(0, (4, 3)),
        label="Lag-24 reference",
    )
    ax.axhline(
        peak_threshold,
        color=COLORS["red"],
        linewidth=1.2,
        linestyle=(0, (2, 3)),
        label="Peak-hour cutoff",
    )

    ax.set_title("January 2026 Public Window: Actual Load, Raw Model, Final Blend, And P90 Band", loc="left", pad=14)
    ax.set_ylabel("Aggregate reefer load")
    ax.yaxis.set_major_formatter(FuncFormatter(kw_formatter))
    ax.grid(axis="y")
    ax.xaxis.set_major_locator(mdates.DayLocator(interval=1))
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %d"))
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.legend(loc="upper right", ncol=2)
    save_svg(fig, "january_forecast.svg")


def plot_daily_mae(public_frame: pd.DataFrame) -> pd.DataFrame:
    working = public_frame.copy()
    working["day"] = working["timestamp"].dt.floor("D")
    daily = (
        working.groupby("day")
        .apply(
            lambda group: pd.Series(
                {
                    "lag24_mae": float(np.mean(np.abs(group["actual_kw"] - group["lag24_kw"]))),
                    "tabular_mae": float(np.mean(np.abs(group["actual_kw"] - group["tabular_kw"]))),
                    "final_mae": float(np.mean(np.abs(group["actual_kw"] - group["final_kw"]))),
                }
            ),
            include_groups=False,
        )
        .reset_index()
    )

    x = np.arange(len(daily))
    width = 0.24

    fig, ax = plt.subplots(figsize=(10.8, 4.8), constrained_layout=True)
    ax.bar(x - width, daily["lag24_mae"], width=width, color=COLORS["slate"], alpha=0.7, label="Lag-24")
    ax.bar(x, daily["tabular_mae"], width=width, color=COLORS["orange"], alpha=0.85, label="Tabular MLP")
    ax.bar(x + width, daily["final_mae"], width=width, color=COLORS["teal"], label="Final blend")

    ax.set_title("Daily MAE Across The Public Forecast Window", loc="left", pad=14)
    ax.set_ylabel("Mean absolute error")
    ax.yaxis.set_major_formatter(FuncFormatter(kw_formatter))
    ax.set_xticks(x)
    ax.set_xticklabels([day.strftime("%b %d") for day in daily["day"]])
    ax.grid(axis="y")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.legend(loc="upper right")
    save_svg(fig, "daily_mae.svg")
    return daily


def plot_peak_scatter(public_frame: pd.DataFrame, peak_threshold: float) -> None:
    normal_mask = public_frame["actual_kw"] < peak_threshold
    peak_mask = ~normal_mask

    fig, ax = plt.subplots(figsize=(5.8, 5.2), constrained_layout=True)
    ax.scatter(
        public_frame.loc[normal_mask, "actual_kw"],
        public_frame.loc[normal_mask, "final_kw"],
        s=34,
        alpha=0.7,
        color=COLORS["teal_soft"],
        edgecolor="none",
        label="Non-peak hours",
    )
    ax.scatter(
        public_frame.loc[peak_mask, "actual_kw"],
        public_frame.loc[peak_mask, "final_kw"],
        s=44,
        alpha=0.9,
        color=COLORS["orange"],
        edgecolor="white",
        linewidth=0.4,
        label="Peak hours",
    )

    lower = float(min(public_frame["actual_kw"].min(), public_frame["final_kw"].min()) - 15.0)
    upper = float(max(public_frame["actual_kw"].max(), public_frame["final_kw"].max()) + 15.0)
    ax.plot([lower, upper], [lower, upper], color=COLORS["ink"], linestyle=(0, (3, 3)), linewidth=1.1)

    ax.set_title("Peak-Hour Fit On The Public Window", loc="left", pad=14)
    ax.set_xlabel("Observed load")
    ax.set_ylabel("Predicted load")
    ax.xaxis.set_major_formatter(FuncFormatter(kw_formatter))
    ax.yaxis.set_major_formatter(FuncFormatter(kw_formatter))
    ax.grid(True)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.legend(loc="upper left")
    save_svg(fig, "peak_scatter.svg")


def plot_model_ladder() -> list[dict[str, float | str]]:
    runs = [
        {
            "label": "Organizer baseline",
            "slug": "organizer_baseline",
            **read_json(REPO_ROOT / "hackathon_reefer_dl" / "artifacts" / "public_baseline_metrics.json"),
        },
        {
            "label": "Lag24 medium model",
            "slug": "lag24_medium",
            **read_json(REPO_ROOT / "hackathon_reefer_dl" / "outputs" / "predictions_lag24_medium.metrics.json"),
        },
        {
            "label": "Tabular emergency",
            "slug": "tabular_emergency",
            **read_json(REPO_ROOT / "hackathon_reefer_dl" / "outputs" / "predictions_tabular_emergency.metrics.json"),
        },
        {
            "label": "First final blend",
            "slug": "first_final",
            **read_json(REPO_ROOT / "hackathon_reefer_dl" / "outputs" / "predictions_final.metrics.json"),
        },
        {
            "label": "Winning final blend",
            "slug": "winning_final_blend",
            **read_json(REPO_ROOT / "hackathon_reefer_dl" / "outputs" / "predictions_final_blend.metrics.json"),
        },
    ]

    ordered = sorted(runs, key=lambda row: row["composite"], reverse=True)
    colors = [COLORS["slate"], COLORS["slate"], COLORS["orange"], COLORS["gold"], COLORS["teal"]]

    fig, ax = plt.subplots(figsize=(8.4, 4.8), constrained_layout=True)
    ax.barh([row["label"] for row in ordered], [row["composite"] for row in ordered], color=colors)
    ax.invert_yaxis()

    for idx, row in enumerate(ordered):
        ax.text(row["composite"] + 0.8, idx, f"{row['composite']:.2f}", va="center", ha="left", color=COLORS["ink"])

    ax.set_title("Public-Window Composite Score By Submission Variant", loc="left", pad=14)
    ax.set_xlabel("Lower is better")
    ax.grid(axis="x")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    save_svg(fig, "model_ladder.svg")
    return ordered


def plot_active_container_scatter() -> None:
    frame = pd.read_csv(REPO_ROOT / "outputs" / "dataset_analysis" / "hourly_features.csv")
    correlation = float(frame["label_power_kw"].corr(frame["active_container_count"]))
    density_map = LinearSegmentedColormap.from_list(
        "container_density",
        ["#FFF7E5", COLORS["sand"], COLORS["orange"], COLORS["ink"]],
    )

    fig, ax = plt.subplots(figsize=(5.8, 5.2), constrained_layout=True)
    hb = ax.hexbin(
        frame["active_container_count"],
        frame["label_power_kw"],
        gridsize=34,
        mincnt=1,
        cmap=density_map,
        linewidths=0.0,
    )

    x_values = frame["active_container_count"].to_numpy()
    y_values = frame["label_power_kw"].to_numpy()
    coeffs = np.polyfit(x_values, y_values, deg=1)
    x_line = np.linspace(x_values.min(), x_values.max(), 200)
    ax.plot(x_line, coeffs[0] * x_line + coeffs[1], color=COLORS["teal"], linewidth=2.0)

    ax.set_title("The Strongest Driver: Active Reefer Count vs Aggregate Load", loc="left", pad=14)
    ax.set_xlabel("Active container count")
    ax.set_ylabel("Aggregate reefer load")
    ax.yaxis.set_major_formatter(FuncFormatter(kw_formatter))
    ax.grid(True)
    ax.text(
        0.03,
        0.96,
        f"Pearson r = {correlation:.3f}",
        transform=ax.transAxes,
        ha="left",
        va="top",
        color=COLORS["ink"],
        fontweight="bold",
    )
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)

    colorbar = fig.colorbar(hb, ax=ax, shrink=0.86, pad=0.03)
    colorbar.outline.set_visible(False)
    colorbar.ax.yaxis.set_major_formatter(FuncFormatter(metric_formatter))
    colorbar.ax.set_ylabel("Higher density", rotation=270, labelpad=12, color=COLORS["slate"])
    save_svg(fig, "active_count_scatter.svg")


def plot_feature_importance() -> None:
    frame = pd.read_csv(REPO_ROOT / "outputs" / "dataset_analysis" / "feature_importance.csv").head(8)
    frame = frame.sort_values("mae_increase_kw")
    labels = [pretty_label(value) for value in frame["feature"]]

    fig, ax = plt.subplots(figsize=(7.2, 4.8), constrained_layout=True)
    ax.barh(labels, frame["mae_increase_kw"], color=COLORS["orange"], alpha=0.88)
    ax.set_title("Top Forward-Safe Features By MAE Impact", loc="left", pad=14)
    ax.set_xlabel("MAE increase when permuted")
    ax.xaxis.set_major_formatter(FuncFormatter(kw_formatter))
    ax.grid(axis="x")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    save_svg(fig, "feature_importance.svg")


def plot_weather_windows() -> None:
    frame = pd.read_csv(REPO_ROOT / "outputs" / "weather_analysis" / "weather_history_window_recommendations.csv")
    frame = frame.head(6).sort_values("efficient_history_window_hours")
    labels = [pretty_label(value) for value in frame["feature"]]
    positions = np.arange(len(frame))

    fig, ax = plt.subplots(figsize=(7.2, 4.8), constrained_layout=True)
    ax.barh(positions, frame["efficient_history_window_hours"], color=COLORS["teal"], alpha=0.92, label="Efficient window")
    ax.scatter(
        frame["peak_history_window_hours"],
        positions,
        s=64,
        color=COLORS["orange"],
        zorder=3,
        label="Peak-scoring window",
    )

    ax.set_yticks(positions)
    ax.set_yticklabels(labels)
    ax.set_title("Weather Context Needed For The Next 24 Hours", loc="left", pad=14)
    ax.set_xlabel("Hours of history")
    ax.grid(axis="x")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.legend(loc="lower right")
    save_svg(fig, "weather_windows.svg")


def write_presentation_data(
    public_frame: pd.DataFrame,
    daily_mae: pd.DataFrame,
    ordered_runs: list[dict[str, float | str]],
    peak_threshold: float,
) -> None:
    winning = next(row for row in ordered_runs if row["slug"] == "winning_final_blend")
    baseline = next(row for row in ordered_runs if row["slug"] == "organizer_baseline")
    raw_model = next(row for row in ordered_runs if row["slug"] == "tabular_emergency")
    emergency_summary = read_json(REPO_ROOT / "hackathon_reefer_dl" / "outputs" / "model_tabular_emergency" / "training_summary.json")
    fast_summary = read_json(REPO_ROOT / "hackathon_reefer_dl" / "outputs" / "model_tabular_fast" / "training_summary.json")

    best_day = daily_mae.loc[daily_mae["final_mae"].idxmin()]
    toughest_day = daily_mae.loc[daily_mae["final_mae"].idxmax()]
    improvement_vs_baseline = (baseline["composite"] - winning["composite"]) / baseline["composite"] * 100.0
    improvement_vs_model = (raw_model["composite"] - winning["composite"]) / raw_model["composite"] * 100.0

    data = {
        "headline": {
            "windowLabel": "January 1-10, 2026",
            "windowHours": int(len(public_frame)),
            "historyHours": int(emergency_summary["history_hours"]),
            "forecastHorizonHours": int(emergency_summary["forecast_horizon_hours"]),
            "datasetRows": 8983,
            "peakThresholdKw": round(float(peak_threshold), 1),
            "bestComposite": round(float(winning["composite"]), 2),
            "baselineComposite": round(float(baseline["composite"]), 2),
            "rawModelComposite": round(float(raw_model["composite"]), 2),
            "improvementVsBaselinePct": round(float(improvement_vs_baseline), 1),
            "improvementVsRawModelPct": round(float(improvement_vs_model), 1),
        },
        "heroMetrics": [
            {
                "label": "Public Composite",
                "value": f"{winning['composite']:.2f}",
                "detail": "Measured on the released public target window",
            },
            {
                "label": "Gain vs Baseline",
                "value": f"{improvement_vs_baseline:.1f}%",
                "detail": "Relative improvement over the organizer baseline",
            },
            {
                "label": "Forecast Horizon",
                "value": f"{emergency_summary['forecast_horizon_hours']}h",
                "detail": "Every forecast is locked to a strict T-24 cutoff",
            },
            {
                "label": "History Context",
                "value": f"{emergency_summary['history_hours']}h",
                "detail": "Fourteen days of hourly history feed each prediction",
            },
        ],
        "challengeFacts": [
            "Target window: January 1, 2026 to January 10, 2026 (223 hours).",
            "Scoring: 0.5 * MAE_all + 0.3 * MAE_peak + 0.2 * pinball_p90.",
            "Peak-hour cutoff on the public window: "
            + f"{peak_threshold:.1f} kW.",
            "Best day in the public window: "
            + f"{pd.Timestamp(best_day['day']).strftime('%b %d')} with {best_day['final_mae']:.1f} kW MAE.",
            "Hardest day in the public window: "
            + f"{pd.Timestamp(toughest_day['day']).strftime('%b %d')} with {toughest_day['final_mae']:.1f} kW MAE.",
        ],
        "blendChips": [
            "Baseline = 0.7 * lag24 + 0.3 * lag168",
            "Weighted MAE on the top 15% of loads",
            "Point calibration by hour of day",
            "P90 calibration by residual volatility",
            "Low / mid / high lag24 weights = 0.35 / 1.00 / 0.475",
            "P90 uplifts = 1.065 / 1.14 / 1.085",
        ],
        "experimentRows": [
            {
                "label": row["label"],
                "composite": round(float(row["composite"]), 2),
                "maeAll": round(float(row["mae_all"]), 2),
                "maePeak": round(float(row["mae_peak"]), 2),
                "pinball": round(float(row["pinball_p90"]), 2),
                "highlight": row["slug"] == "winning_final_blend",
            }
            for row in ordered_runs
        ],
        "featureNotes": [
            "Emergency training selected only the load/calendar block: "
            + ", ".join(emergency_summary["selected_groups"])
            + ".",
            "Broader fast runs kept load/calendar plus reefer_state, which helped in the richer multi-seed setting.",
            "Emergency input width: "
            + f"{int(emergency_summary['model_kwargs']['input_dim'])} features plus 7 target-time calendar values.",
            "Fast input width: "
            + f"{int(fast_summary['model_kwargs']['input_dim'])} features plus 7 target-time calendar values.",
        ],
        "takeaways": [
            "The raw residual MLP is already competitive, but the biggest public-window jump comes from a simple lag24-aware blend on top of it.",
            "Container count remains the clearest operational driver, while temperature history matters most when weather is added.",
            "The site is grounded in reproducible repo artifacts instead of hand-drawn screenshots, so the presentation can be refreshed after new runs.",
            "This is a disciplined forecast stack: strict T-24 inputs, residual learning, calibration, and a transparent post-blend tuned to peak-sensitive scoring.",
        ],
        "generatedAt": pd.Timestamp.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
    }

    output = "window.presentationData = " + json.dumps(data, indent=2) + ";\n"
    (DATA_DIR / "presentation-data.js").write_text(output, encoding="utf-8")


def main() -> None:
    apply_style()
    public_frame, history = build_public_window_frame()
    peak_threshold = float(np.quantile(public_frame["actual_kw"], 0.9))

    plot_history_context(history, public_frame)
    plot_january_forecast(public_frame, peak_threshold)
    daily_mae = plot_daily_mae(public_frame)
    plot_peak_scatter(public_frame, peak_threshold)
    ordered_runs = plot_model_ladder()
    plot_active_container_scatter()
    plot_feature_importance()
    plot_weather_windows()
    write_presentation_data(public_frame, daily_mae, ordered_runs, peak_threshold)
    print(f"Presentation assets written to {SITE_ROOT}")


if __name__ == "__main__":
    main()
