# physics.exe Hackathon Codebase

This repo now contains a reusable exploratory-analysis workflow for the reefer peak-load challenge. The script turns the raw participant release into an hourly feature table, summarizes the challenge context, and generates plots to understand the target behavior, feature relationships, and first-pass feature importance.

## What The Analysis Does

- Reads `reefer_release.zip` directly from the participant package without manual extraction.
- Parses the raw semicolon-delimited, decimal-comma reefer data.
- Aggregates the raw container-hour rows into an hourly label aligned with the challenge objective: combined reefer power in kW.
- Builds an hourly feature table using temperatures, container counts, hardware mix, size mix, stack tiers, and calendar features.
- Exports correlation tables, a simple permutation-importance view, and a browser-friendly report with SVG plots.

## Generated Outputs

By default, running the script creates `outputs/dataset_analysis/` with:

- `report.html`
- `report.md`
- `dataset_summary.json`
- `hourly_features.csv`
- `feature_label_correlations.csv`
- `feature_importance.csv`
- several SVG plots for load patterns and feature relationships

## Quick Start

```bash
uv run main.py
```

That assumes the repo sits next to the extracted `participant_package/participant_package` directory in the hackathon workspace, which matches the current folder layout.

If you want to point to a different release location:

```bash
uv run main.py --reefer-zip path/to/reefer_release.zip --target-csv path/to/target_timestamps.csv
```

## Weather Analysis

To generate the separate weather-impact report from the extracted directories:

```bash
uv run weather_impact_analysis.py
```

By default this reads:

- `../participant_package/participant_package/reefer_release/reefer_release.csv`
- `../participant_package/participant_package/wetterdaten/`

and writes a dedicated report to `outputs/weather_analysis/report.html`.

## Dataset Preprocessing

To build the day-ahead-safe derived dataset for later modeling:

```bash
python preprocess_dataset.py
```

That command reads the raw participant reefer release, audits timestamp consistency and DST behavior, repairs the large March-April history gap by reordering the non-test sequence, engineers explicit hour-by-hour `t-minus` history windows that are safe for a 24-hour-ahead setup, attaches weather-history availability flags, and writes:

- `outputs/preprocessed_dataset/trainval_hourly.csv`
- `outputs/preprocessed_dataset/test_hourly.csv`
- `outputs/preprocessed_dataset/preprocessing_summary.json`

## Base-Feature Dataset Derivation

To create narrow copies of the existing preprocessed exports that keep only the original non-history columns and drop every explicit lag column matching `*_tminusNh`:

```bash
python derive_base_feature_dataset.py
```

That command reads the existing wide files in `outputs/preprocessed_dataset/` and writes:

- `outputs/preprocessed_dataset/trainval_hourly_base.csv`
- `outputs/preprocessed_dataset/test_hourly_base.csv`
- `outputs/preprocessed_dataset/base_feature_dataset_summary.json`

## Challenge Understanding

- The forecasting target is the combined hourly electricity demand of plugged-in reefer containers.
- Submissions need both `pred_power_kw` and an upper estimate `pred_p90_kw`.
- The evaluation favors overall accuracy, peak-hour accuracy, and sensible upper-risk estimates.
- For EDA, this repo defines the label as `sum(AvPowerCons) / 1000` per `EventTime` hour, which matches the aggregate power target in the challenge brief.

## Notes On The Raw Data

- The raw file uses semicolon delimiters instead of commas.
- Decimal values use commas, for example `887,79`.
- A few field names differ from the markdown description, for example `AvPowerCons` and `RemperatureSupply`.
- The weather archive is included in the challenge package but is not fused into this first-pass EDA yet.

## Files In This Repo

- `main.py`: thin entrypoint that runs the analysis workflow
- `reefer_dataset_analysis.py`: data loading, aggregation, plotting, and report generation
- `pyproject.toml`: project configuration and dependencies
- `uv.lock`: lock file for reproducible installs
