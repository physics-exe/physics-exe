You are working in the `physics-exe` repository for a hackathon forecasting task.

## Goal
Build a deep-learning pipeline to forecast reefer aggregate hourly power demand for the challenge.

The final model must:
- train and validate on `outputs/preprocessed_dataset/trainval_hourly.csv`
- test only on `outputs/preprocessed_dataset/test_hourly.csv`
- predict:
  - `pred_power_kw`
  - `pred_p90_kw`

The challenge score is:
- `0.5 * mae_all + 0.3 * mae_peak + 0.2 * pinball_p90`

Lower is better.

## Important challenge constraints
- This is a strict 24-hour-ahead forecasting task.
- Do not use future information relative to the target hour.
- Do not fit anything on `test_hourly.csv`.
- Use `source_timestamp_utc` for chronology and splits.
- Do not use `effective_timestamp_utc` for splitting because the trainval set contains a shifted Jan-Mar 2025 block whose effective dates overlap 2026.
- Use file boundaries to distinguish trainval vs test.

## Data facts already established
- `trainval_hourly.csv`: 7,989 rows, 2,699 columns
- `test_hourly.csv`: 223 rows, 2,699 columns
- 25 base columns total, including target and metadata
- 2,674 explicit history columns
- Full weather history is complete for the public-test-like late 2025 regime and for all rows in `test_hourly.csv`
- Weather history becomes complete in trainval starting around `2025-11-04`
- Public test window is `2026-01-01T00:00:00Z` through `2026-01-10T06:00:00Z`

## Input structure to use
Parse `_tminusNh` features into grouped temporal tensors.

1. Long reefer branch `(6, 168)`
Features:
- `label_power_kw`
- `active_rows`
- `unique_containers`
- `unique_visits`
- `distinct_customers`
- `mean_power_per_active_reefer_kw`

2. Short reefer branch `(19, 48)`
Features:
- stack-tier history
- hardware-share history
- reefer internal temperature history
- temperature gap history

3. Weather branch `(17, 63)`
- include padded weather histories
- include a binary weather mask tensor
- include the 5 weather-availability metadata columns as static features

4. Static branch
Use:
- categorical embeddings for `hour_of_day`, `day_of_week`, `month`, `season`
- cyclical calendar features
- `is_weekend`
- `was_gap_shifted`
- `was_dst_adjusted`
- weather availability fields

## Preprocessing rules
- Fit train-fold-only robust scalers per base feature
- Clip scaled continuous values to `[-6, 6]`
- Keep binary flags unscaled
- Replace NaNs with 0 after scaling
- Pass explicit masks for missing weather history
- Optimize on standardized target values if helpful, but always score in raw kW

## Architecture to implement
Use a compact multi-branch PyTorch model, around 1M params or less.

### Long reefer branch
- 1x1 projection to 64 channels
- 4 residual dilated TCN blocks
- kernel size 5
- dilations 1, 2, 4, 8
- squeeze-excitation
- attention pooling

### Short reefer branch
- projection to 48 channels
- 3 residual TCN blocks
- kernel size 3
- dilations 1, 2, 4
- attention pooling

### Weather branch
- input is weather channels plus mask
- project to 48 channels
- 2 mask-aware temporal blocks
- 2 lightweight self-attention blocks over lag dimension
- attention pooling

### Static branch
- embedding stack plus MLP
- `128 -> 64 -> 32`

### Fusion
- concatenate all branch embeddings
- gated residual fusion MLP
- `256 -> 128 -> 64`
- dropout 0.15

### Output heads
- point forecast head for `pred_power_kw`
- nonnegative uplift head using `softplus`
- compute `pred_p90_kw = pred_power_kw + uplift`

## Training plan
Use a 2-stage training strategy.

### Stage 1
Train reefer-only:
- long reefer branch
- short reefer branch
- static branch
Use all trainval rows.

### Stage 2
Initialize from Stage 1 and add weather branch.
Fine-tune only on rows where `weather_history_complete == 1`.

### Loss
Optimize:
- `0.5 * MAE_all`
- `0.3 * MAE_peak`
- `0.2 * Pinball90`

Define peak rows using the training fold's 90th percentile of `label_power_kw`.

### Optimizer / schedule
- AdamW
- Stage 1 LR `1e-3`
- Stage 2 LR `2e-4`
- weight decay `1e-4`
- cosine LR schedule
- batch size about 256 then 128
- gradient clipping 1.0
- mixed precision if GPU is available
- early stopping on blended challenge score with patience 15

### Regularization
- weather channel dropout 0.1
- small Gaussian noise on continuous inputs, e.g. 0.01
- run 3 to 5 seeds for final ensemble

## Validation design
Use source-time-based forward validation only.

### Hyperparameter folds
1. `2025-11-15 00:00 UTC` to `2025-11-24 23:00 UTC`
2. `2025-12-01 00:00 UTC` to `2025-12-10 23:00 UTC`
3. `2025-12-11 00:00 UTC` to `2025-12-20 23:00 UTC`

### Final development holdout
- `2025-12-22 00:00 UTC` to `2025-12-31 23:00 UTC`

All training data for each fold must be strictly earlier than the validation window.

## p90 calibration
- Generate out-of-fold predictions on tuning folds plus the final holdout
- Fit a simple global affine or monotonic calibrator for p90 uplift
- Final prediction must satisfy `pred_p90_kw >= pred_power_kw` row-wise

## Baselines the DL model must beat
Implement and compare against:
- yesterday same hour baseline
- a simple flattened lag-feature ridge or MLP baseline

## Required deliverables
Please implement a clean training/evaluation workflow in this repo that:
- loads the hourly CSVs
- builds the grouped tensors
- trains the 2-stage model
- runs forward validation
- reports:
  - `mae_all`
  - `mae_peak`
  - `pinball_p90`
  - combined score
- evaluates once on `test_hourly.csv` after model selection is frozen
- saves predictions and metrics to an `outputs/` subfolder

## Extra guidance
- Keep the model compact because the dataset is still small.
- If the deep model does not beat the simple baselines on the final holdout, say so clearly.
- Preserve reproducibility: fixed seeds, explicit configs, clear scripts.
- Before coding, inspect the repo and reuse existing preprocessing outputs and handoff markdown files.
