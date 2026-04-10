# Code Bundle

This folder contains the code delivered with the submission.

## Main pieces

- `hackathon_reefer_dl/`
  - participant-package data preparation
  - model training
  - prediction generation
  - final candidate blending utilities
- `reefer_forecast_dl.py`
  - legacy deep-learning experiment script kept for reference

## Final blend utility

The final hand-in file was assembled with:

```bash
python hackathon_reefer_dl/blend_existing_candidates.py \
  --anchor outputs/results/predictions.csv \
  --tail-specialist hackathon_reefer_dl/outputs/predictions_tabular_emergency.csv \
  --top-k 15 \
  --tail-point-anchor-weight 0.275 \
  --tail-p90-anchor-weight 0.95 \
  --out outputs/results/predictions_physics_exe_full_v6.csv
```

## Deep-learning subproject entry points

```bash
python hackathon_reefer_dl/prepare_data.py \
  --participant-dir ../FSL-assests/participant_package/participant_package \
  --out-dir hackathon_reefer_dl/artifacts

python hackathon_reefer_dl/train.py \
  --data hackathon_reefer_dl/artifacts/hourly_features.parquet \
  --config hackathon_reefer_dl/configs/runtime_tabular_emergency.json \
  --out-dir hackathon_reefer_dl/outputs/model_tabular_emergency

python hackathon_reefer_dl/predict.py \
  --participant-dir ../FSL-assests/participant_package/participant_package \
  --model-dir hackathon_reefer_dl/outputs/model_tabular_emergency \
  --targets ../FSL-assests/participant_package/participant_package/target_timestamps.csv \
  --out hackathon_reefer_dl/outputs/predictions_tabular_emergency.csv
```
