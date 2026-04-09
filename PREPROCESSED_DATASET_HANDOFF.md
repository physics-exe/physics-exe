# Preprocessed Dataset Handoff

This file is meant for another LLM or engineer who needs to work with the derived datasets produced by the preprocessing pipeline in this repo.

It describes:

- where the derived datasets live
- what each column group means
- how the history features were constructed
- what the timestamp fields mean
- what caveats matter before modeling

## 1. Output Files

Derived datasets are written to:

- `outputs/preprocessed_dataset/trainval_hourly.csv`
- `outputs/preprocessed_dataset/test_hourly.csv`
- `outputs/preprocessed_dataset/preprocessing_summary.json`

Base-feature-only derivatives can be created from those wide exports with:

- `derive_base_feature_dataset.py`

That utility writes:

- `outputs/preprocessed_dataset/trainval_hourly_base.csv`
- `outputs/preprocessed_dataset/test_hourly_base.csv`
- `outputs/preprocessed_dataset/base_feature_dataset_summary.json`

The pipeline entrypoint is:

- `preprocess_dataset.py`

The main implementation is:

- `reefer_preprocessing.py`

## 2. What The Files Represent

### 2.1 `trainval_hourly.csv`

- Contains all non-test hours after preprocessing.
- This file is intentionally not split into train and validation yet.
- Rows are ordered by `sequence_index`.
- The March-April 2025 internal gap was removed by reordering the history:
  - the pre-gap block from `2025-01-01` to `2025-03-30 08:00 UTC` was moved after the post-gap block
  - that moved block was assigned new `effective_timestamp_utc` values in early 2026

### 2.2 `test_hourly.csv`

- Contains only the public test timestamps from:
  - `2026-01-01T00:00:00Z`
  - through `2026-01-10T06:00:00Z`
- Row count matches `target_timestamps.csv` exactly.
- The label is still included for offline evaluation convenience.
- Do not use this file for fitting the final model.

### 2.3 `preprocessing_summary.json`

- Stores audit and preprocessing metadata:
  - raw row counts
  - DST audit outcome
  - gap repair summary
  - weather merge coverage
  - row-drop reasons
  - final export counts

## 3. Final Dataset Size

Current export sizes:

- `trainval_hourly.csv`: `7,989` rows, `2,699` columns
- `test_hourly.csv`: `223` rows, `2,699` columns

Column breakdown:

- `25` non-history columns
- `2,674` explicit history columns

The base-only derivative keeps exactly those `25` non-history columns and removes every column whose name ends with `_tminus{N}h`.

Only `191` early warmup rows were dropped from trainval because the longest reefer history requires prior context.

## 4. Label Definition

The hourly target is:

- `label_power_kw = sum(AvPowerCons) / 1000`

This is the combined reefer demand per hour.

## 5. Important Timestamp Fields

### 5.1 `source_timestamp_utc`

- The original hour from the raw dataset.
- This is the true chronological timestamp from the participant data.
- Use this when reasoning about the original calendar position of a row.

### 5.2 `effective_timestamp_utc`

- The reordered timestamp used to remove the large internal 2025 gap from the trainval sequence.
- In `trainval_hourly.csv`, this creates a continuous modeling timeline.
- In `test_hourly.csv`, this stays aligned with the actual source time.

### 5.3 `sequence_index`

- Monotonic row order for downstream modeling.
- This is the safest ordering column for sequence models or custom split logic.

## 6. Very Important Split Caveat

Do not combine trainval and test based on `effective_timestamp_utc`.

Reason:

- the moved January-March 2025 block in trainval was reassigned into early 2026 effective dates
- those effective dates overlap the actual calendar year used by the public test period

So:

- use file boundaries to distinguish trainval vs test
- use `source_timestamp_utc` for real-world chronology
- use `sequence_index` for ordered modeling within each export

## 7. Base Columns

The `25` non-history columns are:

- `source_timestamp_utc`
- `effective_timestamp_utc`
- `sequence_index`
- `label_power_kw`
- `was_gap_shifted`
- `was_dst_adjusted`
- `hour_of_day`
- `day_of_week`
- `day_of_year`
- `month`
- `season`
- `is_weekend`
- `hour_sin`
- `hour_cos`
- `dow_sin`
- `dow_cos`
- `day_of_year_sin`
- `day_of_year_cos`
- `month_sin`
- `month_cos`
- `weather_history_expected`
- `weather_history_complete`
- `weather_history_expected_feature_count`
- `weather_history_available_feature_count`
- `weather_history_available_fraction`

### 7.1 Meaning Of The Operational Flags

- `was_gap_shifted`
  - `1` if the row came from the moved January-March 2025 block
  - `0` otherwise

- `was_dst_adjusted`
  - would be `1` if a DST correction had been applied
  - in the current run, the DST audit found no correction was needed

### 7.2 Meaning Of The Calendar Columns

- `hour_of_day`, `day_of_week`, `day_of_year`, `month`, `season`, `is_weekend`
  - known-in-advance calendar features

- `hour_sin`, `hour_cos`
  - cyclical encoding of hour of day

- `dow_sin`, `dow_cos`
  - cyclical encoding of weekday

- `day_of_year_sin`, `day_of_year_cos`
  - cyclical encoding of annual seasonality

- `month_sin`, `month_cos`
  - cyclical encoding of month

### 7.3 Meaning Of The Weather Availability Columns

- `weather_history_expected`
  - `1` if the row is late enough that weather-history features would be expected
  - `0` if the row is before the point where full weather histories could even exist

- `weather_history_complete`
  - `1` if all expected weather-history columns are present for that row
  - `0` if weather history is partial or unavailable

- `weather_history_expected_feature_count`
  - number of weather history columns that should be available for that row

- `weather_history_available_feature_count`
  - number of those weather history columns that are actually non-missing

- `weather_history_available_fraction`
  - available divided by expected
  - `NaN` when weather history is not yet expected

These columns were added so trainval remains continuous even though weather coverage starts late and some weather series have missing intervals.

## 8. No Same-Hour Operational Predictors Were Kept

The derived dataset is meant to be day-ahead-safe.

That means the preprocessing does not keep same-hour operational predictors like:

- same-hour active reefer count
- same-hour container count
- same-hour hardware shares
- same-hour reefer internal temperatures

Instead, those signals were expanded into explicit history windows that only use information available at least `24` hours before the target hour.

## 9. History Feature Naming Pattern

All history columns follow this naming pattern:

- `{feature_name}_tminus{N}h`

Examples:

- `label_power_kw_tminus24h`
- `label_power_kw_tminus25h`
- `active_rows_tminus24h`
- `mean_temperature_return_c_tminus48h`
- `weather_temperature_vc_halle3_c_tminus74h`

Interpretation:

- `tminus24h` means the value from exactly 24 hours before the target hour
- `tminus25h` means the value from 25 hours before the target hour
- and so on

Every history window starts at `24h` in the past because this is a 24-hour-ahead forecasting setup.

## 10. Reefer-Derived History Features

These features come from the reefer data after hourly aggregation.

### 10.1 Reefer Features With `168h` Of Explicit History

For each of the following, the dataset includes:

- `tminus24h` through `tminus191h`

Features:

- `label_power_kw`
- `active_rows`
- `unique_containers`
- `unique_visits`
- `distinct_customers`
- `mean_power_per_active_reefer_kw`

These are the highest-value load and occupancy style features, so they were given a full one-week history window beyond the 24-hour forecast offset.

### 10.2 Reefer Features With `48h` Of Explicit History

For each of the following, the dataset includes:

- `tminus24h` through `tminus71h`

Stack-tier composition:

- `mean_stack_tier`
- `share_stack_tier_1`
- `share_stack_tier_2`
- `share_stack_tier_3`

Hardware composition:

- `share_hardware_scc6`
- `share_hardware_decosvb`
- `share_hardware_ml5`
- `share_hardware_decosiiih`
- `share_hardware_decosiiij`
- `share_hardware_decosva`
- `share_hardware_mp4000`
- `share_hardware_ml3`
- `share_hardware_other`

Temperature and temperature-gap features:

- `mean_temperature_setpoint_c`
- `mean_temperature_ambient_c`
- `mean_temperature_return_c`
- `mean_temperature_supply_c`
- `mean_ambient_minus_setpoint_c`
- `mean_return_minus_supply_c`

### 10.3 Meaning Of The Reefer Aggregates

- `active_rows`
  - number of raw reefer rows in the hour

- `unique_containers`
  - number of distinct `container_uuid` values in the hour

- `unique_visits`
  - number of distinct `container_visit_uuid` values in the hour

- `distinct_customers`
  - number of distinct `customer_uuid` values in the hour

- `mean_power_per_active_reefer_kw`
  - aggregate hourly kW divided by row count

- `mean_stack_tier`
  - average `stack_tier` in the hour

- `share_stack_tier_1`, `share_stack_tier_2`, `share_stack_tier_3`
  - share of rows in each main tier bucket

- `share_hardware_*`
  - share of rows belonging to that hardware family
  - less frequent hardware was bucketed into `share_hardware_other`

- `mean_temperature_setpoint_c`
  - hourly mean setpoint

- `mean_temperature_ambient_c`
  - hourly mean ambient temperature from reefer records

- `mean_temperature_return_c`
  - hourly mean return temperature

- `mean_temperature_supply_c`
  - hourly mean supply temperature

- `mean_ambient_minus_setpoint_c`
  - hourly mean ambient minus setpoint proxy

- `mean_return_minus_supply_c`
  - hourly mean return minus supply proxy

## 11. Weather-Derived History Features

Weather was merged as hourly observed external context, then converted into explicit history windows based on the recommendations in `ML_MODEL_HANDOFF.md` section `7.1 Best History-Window Recommendations`.

### 11.1 Weather Coverage

- weather hourly coverage starts at `2025-09-24T10:00:00Z`
- weather hourly coverage ends at `2026-02-23T14:00:00Z`
- the raw weather merge produced `17` weather features

Because weather coverage begins late in 2025, many early trainval rows have no weather context at all. That is expected.

### 11.2 Weather Features And History Lengths

Temperature features:

- `weather_temperature_vc_halle3_c`: `51h`
- `weather_temperature_mean_c`: `44h`
- `weather_temperature_zentralgate_c`: `46h`
- `weather_temperature_spread_c`: `43h`

Wind speed features:

- `weather_wind_speed_vc_halle3`: `57h`
- `weather_wind_speed_zentralgate`: `42h`
- `weather_wind_speed_mean`: `42h`
- `weather_wind_speed_spread`: `43h`

Wind direction features:

- `weather_wind_direction_vc_halle3_cos`: `60h`
- `weather_wind_direction_mean_cos`: `62h`
- `weather_wind_direction_zentralgate_cos`: `63h`
- `weather_wind_direction_zentralgate_sin`: `35h`
- `weather_wind_direction_vc_halle3_sin`: `37h`
- `weather_wind_direction_mean_sin`: `36h`
- `weather_wind_direction_zentralgate_consistency`: `26h`
- `weather_wind_direction_vc_halle3_consistency`: `37h`
- `weather_wind_direction_mean_consistency`: `30h`

Interpretation example:

- `weather_temperature_vc_halle3_c` with `51h` history creates:
  - `weather_temperature_vc_halle3_c_tminus24h`
  - through `weather_temperature_vc_halle3_c_tminus74h`

## 12. Missingness And Warmup Behavior

### 12.1 What Was Dropped

Only rows that lacked required reefer history were dropped.

Current trainval drop count:

- `warmup_incomplete_history`: `191`

This is expected because the longest required reefer history is:

- `24h` forecast offset
- plus `168h` history window

### 12.2 What Was Not Dropped

Rows with partial or missing weather histories were intentionally retained.

That avoids breaking trainval continuity after the March-gap repair.

Instead, weather completeness is communicated through:

- `weather_history_expected`
- `weather_history_complete`
- `weather_history_expected_feature_count`
- `weather_history_available_feature_count`
- `weather_history_available_fraction`

### 12.3 Practical Implication For Modeling

If a model cannot handle missing values well, you have several options:

- train on the weather-complete subset
- impute missing weather histories
- build one reefer-only model and one weather-augmented model
- let a tree model learn from missingness together with the weather availability flags

## 13. Raw Fields Intentionally Removed

The preprocessing intentionally removed obviously non-generalizable or non-useful raw columns from the exported modeling table, including:

- raw UUID-style IDs
- direct same-hour energy columns
- raw `ContainerSize`

Important note:

- `ContainerSize` was removed from the final export because earlier handoff guidance suggested it was low value relative to the stronger reefer structural signals

## 14. DST And Time Handling

The pipeline audited DST behavior for reefer and weather timestamps.

Result:

- no DST correction was applied
- the data appears to already use one consistent time basis across the year

So in the current export:

- `was_dst_adjusted` should remain `0`

## 15. What Another LLM Should Know Before Modeling

### 15.1 The Dataset Is Already Leakage-Aware

The most important preprocessing constraint was:

- for a target hour `t`, only use information available before `t`

That is why all history features begin at `t-24h` rather than using same-hour values.

### 15.2 Train/Validation Splitting Still Needs To Be Done Later

`trainval_hourly.csv` is one combined modeling file.

The next modeling step still needs to define a proper validation strategy, for example:

- time-based validation on the continuous `sequence_index`
- blocked validation on the reordered timeline
- or a weather-complete validation slice if weather features are central to the model

### 15.3 Test Still Contains The Label

The label is present in `test_hourly.csv` for offline analysis in this workspace.

For a real submission workflow:

- do not train on it
- do not assume this would exist in a hidden-evaluation setting

## 16. Quick Schema Summary

Base columns:

- `25`

History columns:

- reefer-derived: `1,906`
- weather-derived: `768`
- total history columns: `2,674`

Grand total:

- `2,699` columns

## 17. Recommended First Modeling Read Of The Dataset

A new LLM should probably do the following first:

1. Load `trainval_hourly.csv` and sort by `sequence_index`.
2. Keep `label_power_kw` as the target.
3. Exclude `source_timestamp_utc` and `effective_timestamp_utc` from direct numeric modeling unless you explicitly derive time features from them.
4. Decide how to treat rows where `weather_history_complete = 0`.
5. Create a time-based validation split from `trainval_hourly.csv`.
6. Start with a tree-based regressor that can handle high-dimensional lag matrices and missing values.

## 18. Related Files Worth Reading Next

- `ML_MODEL_HANDOFF.md`
- `llm_handover.md`
- `outputs/preprocessed_dataset/preprocessing_summary.json`
- `reefer_preprocessing.py`
