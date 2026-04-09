# ML Model Handoff For Reefer Peak-Load Forecasting

This file is meant to be given to another LLM or engineer who has not seen the earlier analysis chat. It summarizes the forecasting task, the real data layout, the label construction used for analysis, the strongest findings from the reefer-only analysis, and the strongest findings from the separate weather analysis.

## 1. Challenge Summary

- Forecast the combined hourly electricity demand of plugged-in reefer containers.
- Submission columns:
  - `timestamp_utc`
  - `pred_power_kw`
  - `pred_p90_kw`
- Evaluation weights:
  - `0.5 * mae_all`
  - `0.3 * mae_peak`
  - `0.2 * pinball_p90`
- The task is explicitly day-ahead / 24-hour-ahead forecasting.
- Do not use information from the future relative to a target hour.

## 2. Actual Data Layout In This Workspace

- Reefer raw data:
  - `../participant_package/participant_package/reefer_release/reefer_release.csv`
- Weather raw data:
  - `../participant_package/participant_package/wetterdaten/`
- Public targets:
  - `../participant_package/participant_package/target_timestamps.csv`

## 3. Important Raw Data Notes

- `reefer_release.csv` is semicolon-delimited.
- Numeric values use decimal commas, for example `887,79`.
- The raw reefer schema differs slightly from the markdown documentation.
- Important raw reefer columns actually seen in the file:
  - `EventTime`
  - `AvPowerCons`
  - `TemperatureSetPoint`
  - `TemperatureAmbient`
  - `TemperatureReturn`
  - `RemperatureSupply`
  - `HardwareType`
  - `ContainerSize`
  - `stack_tier`
- Weather files are also semicolon-delimited and contain high-frequency observations with:
  - `UtcTimestamp`
  - `Value`
- Weather files can contain literal `NULL` strings in numeric fields.

## 4. Label Definition Used In The Analysis

For the exploratory work in this repo, the hourly label was defined as:

- `label_power_kw = sum(AvPowerCons) / 1000` grouped by `EventTime` hour

This matches the challenge goal conceptually: combined reefer power demand per hour.

## 5. Reefer-Only Analysis Summary

Source report artifacts:

- `outputs/dataset_analysis/report.html`
- `outputs/dataset_analysis/hourly_features.csv`
- `outputs/dataset_analysis/feature_label_correlations.csv`
- `outputs/dataset_analysis/feature_importance.csv`
- `outputs/dataset_analysis/dataset_summary.json`

### 5.1 Coverage

- Raw rows: `3,774,557`
- Aggregated hours: `8,403`
- Reefer range: `2025-01-01T00:00:00Z` to `2026-01-10T06:00:00Z`
- Public target timestamps: `223`
- Public target range: `2026-01-01T00:00:00Z` to `2026-01-10T06:00:00Z`

### 5.2 Basic Distribution Notes

- `40`-foot containers dominate by far.
- Hardware type distribution is concentrated, with `SCC6` and `ML3` contributing the largest row counts.
- Stack tiers `1`, `2`, and `3` are present, and stack-tier composition appears strongly related to the aggregate load.

### 5.3 Strongest Reefer-Derived Signals To The Label

Top feature-label correlations from the hourly feature table:

- `active_container_count`: `r = 0.795`
- `share_stack_tier_1`: `r = -0.599`
- `mean_stack_tier`: `r = 0.566`
- `share_stack_tier_3`: `r = 0.487`
- `share_stack_tier_2`: `r = 0.465`
- `mean_ambient_minus_setpoint_c`: `r = 0.405`
- `mean_temperature_ambient_c`: `r = 0.389`
- `month`: `r = 0.378`
- `mean_return_minus_supply_c`: `r = 0.376`
- `day_of_year`: `r = 0.373`

### 5.4 Simple Feature-Importance View

A simple time-ordered ridge model with permutation importance identified the following strongest features:

- `active_container_count`: MAE increase `216.2 kW`
- `day_of_year`: MAE increase `137.1 kW`
- `mean_temperature_setpoint_c`: MAE increase `105.7 kW`
- `month`: MAE increase `91.1 kW`
- `mean_temperature_return_c`: MAE increase `44.3 kW`
- `mean_temperature_supply_c`: MAE increase `32.8 kW`
- `mean_stack_tier`: MAE increase `28.5 kW`

### 5.5 Reefer-Only Interpretation

- Container count is the dominant driver of aggregate load.
- Stack-tier composition matters a lot and should not be ignored.
- Temperature-related reefer internals and ambient/setpoint gaps matter materially.
- There is clear seasonal structure (`day_of_year`, `month`).
- A competitive model should almost certainly combine reefer operational state, calendar features, and weather features.

## 6. Weather Analysis Summary

Source report artifacts:

- `outputs/weather_analysis/report.html`
- `outputs/weather_analysis/weather_label_hourly.csv`
- `outputs/weather_analysis/same_hour_weather_correlations.csv`
- `outputs/weather_analysis/weather_history_window_scores.csv`
- `outputs/weather_analysis/weather_history_window_recommendations.csv`
- `outputs/weather_analysis/weather_summary.json`

### 6.1 Weather Coverage And Overlap

- Label hours available overall: `8,403`
- Weather hours available: `3,204`
- Derived weather feature count: `17`
- Weather range: `2025-09-24T10:00:00Z` to `2026-02-23T14:00:00Z`
- Usable weather/label overlap: `2025-09-24T10:00:00Z` to `2026-01-10T06:00:00Z`

### 6.2 Weather Features Built

The weather analysis aggregated the raw sensor streams to hourly means and derived:

- temperature at VC Halle 3
- temperature at Zentralgate
- mean temperature
- temperature spread between locations
- wind speed at VC Halle 3
- wind speed at Zentralgate
- mean wind speed
- wind-speed spread
- wind-direction sin/cos encodings for both locations
- wind-direction consistency features
- mean wind-direction sin/cos/consistency features

### 6.3 Influence Of Actual Weather On Actual Power Consumption

Top same-hour weather correlations to actual same-hour aggregate power:

- `weather_temperature_vc_halle3_c`: `r = 0.557`
- `weather_temperature_mean_c`: `r = 0.377`
- `weather_temperature_zentralgate_c`: `r = 0.231`
- `weather_wind_direction_vc_halle3_cos`: `r = -0.210`
- `weather_wind_direction_mean_cos`: `r = -0.193`
- `weather_wind_direction_zentralgate_cos`: `r = -0.172`
- `weather_wind_speed_vc_halle3`: `r = -0.081`

Interpretation:

- Temperature is clearly the strongest direct weather signal.
- VC Halle 3 temperature is more informative than Zentralgate temperature in this overlap window.
- Wind speed is weak same-hour.
- Some wind-direction components carry structure, but much less than temperature.

## 7. Influence Of Past Weather On Power In The Next 24 Hours

Method used:

- For each hourly weather feature, compute rolling means over history windows from `1` to `72` hours.
- For each history window, measure correlation to future power at horizons `+1` to `+24` hours.
- Summarize each history window by the mean absolute correlation across future horizons `1..24`.
- Report:
  - the `peak_history_window_hours`
  - and an `efficient_history_window_hours`, defined as the smallest window reaching at least `95%` of the peak score

### 7.1 Best History-Window Recommendations

Strongest recommended windows:

- `weather_temperature_vc_halle3_c`
  - efficient window: `51 h`
  - peak window: `72 h`
  - peak score: `0.623`
- `weather_temperature_mean_c`
  - efficient window: `44 h`
  - peak window: `72 h`
  - peak score: `0.620`
- `weather_temperature_zentralgate_c`
  - efficient window: `46 h`
  - peak window: `67 h`
  - peak score: `0.574`
- `weather_wind_direction_vc_halle3_cos`
  - efficient window: `60 h`
  - peak window: `72 h`
  - peak score: `0.293`
- `weather_wind_direction_mean_cos`
  - efficient window: `62 h`
  - peak window: `72 h`
  - peak score: `0.290`
- `weather_wind_speed_vc_halle3`
  - efficient window: `57 h`
  - peak window: `71 h`
  - peak score: `0.223`
- `weather_wind_speed_spread`
  - efficient window: `43 h`
  - peak window: `50 h`
  - peak score: `0.169`

### 7.2 Practical Interpretation For Model Inputs

- Temperature history is the most useful weather history by far.
- A model should likely include at least about the previous `48 hours` of weather history.
- If feature budget allows, testing `60-72 hours` of weather context is reasonable, especially for temperature and some wind-direction encodings.
- Wind-speed features appear weaker than temperature but may still add incremental value.
- For a pragmatic first model, a good weather feature window is:
  - default: last `48 hours`
  - optional extended experiment: last `72 hours`

## 8. Recommended Modeling Direction For The Next LLM

This is not a final model prescription, but it is the evidence-based starting point from the analyses above.

### 8.1 Features That Should Probably Be In The First Serious Model

- Reefer operational state:
  - active container count
  - stack-tier shares / mean stack tier
  - container-size shares
  - hardware-type shares
  - mean setpoint / return / supply temperatures
  - ambient-minus-setpoint
  - return-minus-supply
- Calendar:
  - hour of day
  - day of week
  - day of year
  - month
  - cyclical encodings
- Weather:
  - mean temperature
  - VC Halle 3 temperature
  - Zentralgate temperature
  - wind speed features
  - wind-direction sin/cos / consistency features
  - rolling weather summaries over roughly `48h` and optionally `72h`

### 8.2 Strong Candidate Modeling Strategies

- Gradient-boosted trees on an hourly feature table
- LightGBM / XGBoost / CatBoost style models
- Direct multi-horizon forecasting or recursive next-hour forecasting with careful leakage prevention
- A separate model or calibrated post-processing rule for `pred_p90_kw`

### 8.3 Important Leakage Constraint

- For a target hour `t`, only use information available before `t`.
- For a 24-hour-ahead setup, features must reflect what would be known when generating tomorrow’s hourly forecast.
- The weather analysis above uses realized historical weather to estimate useful context length. In production, those signals should be replaced by weather forecasts and/or lagged observed weather available at prediction time.

## 9. Suggested First Modeling Experiments

1. Build a clean hourly training table from `hourly_features.csv` plus hourly weather features.
2. Start with reefer features + calendar only.
3. Add same-hour weather forecast proxies or lagged weather aggregates over `24h`, `48h`, and `72h`.
4. Compare feature sets on:
   - all-hour MAE
   - peak-hour MAE
   - p90 pinball loss
5. Test whether `48h` weather windows capture almost all useful signal before paying the cost of `72h`.
6. Consider dedicated features for peaks:
   - rolling max container count
   - recent high-temperature exposure
   - interaction terms between active-container count and temperature

## 10. Files Produced By The Existing Analysis Code

- Reefer analysis entrypoint:
  - `main.py`
- Weather analysis entrypoint:
  - `weather_impact_analysis.py`
- Generated reefer outputs:
  - `outputs/dataset_analysis/`
- Generated weather outputs:
  - `outputs/weather_analysis/`

## 11. Bottom-Line Takeaway

If another LLM is going to build the first serious ML model, the most important facts to internalize are:

- Aggregate reefer power is driven first by how many active containers are plugged in.
- Stack-tier composition and reefer-internal temperature state matter materially.
- Temperature is the strongest weather signal.
- The most useful weather history is not just the last few hours; roughly the previous `48 hours` looks like a strong default, with `60-72 hours` worth testing as an extended window.
- The model should probably combine reefer operational features, seasonality/calendar structure, and weather-history aggregates.
