# Approach

This submission treats the task as a strict 24-hour-ahead forecast.

## Main idea

- Build admissible hourly reefer features from the participant package only.
- Train deep-learning forecast candidates in `hackathon_reefer_dl/`.
- Keep a stronger legacy forecast artifact as the anchor forecast.
- Improve peak-hour behavior with a lightweight tail blend.

## Final submission used here

The submitted `predictions.csv` is a blend of two existing forecast candidates:

- anchor forecast: the stronger average-error forecast from `outputs/results/predictions.csv`
- tail specialist: `hackathon_reefer_dl/outputs/predictions_tabular_emergency.csv`

Blending rule:

- rank hours by anchor `pred_power_kw`
- take the top 15 ranked hours
- for those hours only, replace the point forecast with
  - `0.275 * anchor + 0.725 * tail_specialist`
- keep the anchor `pred_p90_kw` as the base upper forecast
- for the swapped tail hours, use
  - `0.95 * anchor_p90 + 0.05 * tail_specialist_p90`
- always enforce `pred_p90_kw >= pred_power_kw`

## Files included

- `predictions.csv`: final submission file
- `code/`: code used during development and final blending

## Notes

- The reusable blending utility is `code/hackathon_reefer_dl/blend_existing_candidates.py`.
- The deep-learning forecasting subproject lives in `code/hackathon_reefer_dl/`.
- A legacy forecasting experiment script is included as `code/reefer_forecast_dl.py`.
