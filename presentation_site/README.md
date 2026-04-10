# Presentation Site

Static presentation website for the `hackathon_reefer_dl` solution.

## What is inside

- `index.html`: presentation page
- `styles.css`: visual system and layout
- `script.js`: small UI wiring for metrics, tables, and scroll reveals
- `generate_assets.py`: regenerates the plots and site data from repo artifacts
- `assets/plots/`: generated SVG figures
- `assets/data/presentation-data.js`: generated summary data for the site

## Refresh the assets

Run this from the `physics-exe` repo root:

```bash
python presentation_site/generate_assets.py
```

The script reads:

- `../participant_package/participant_package/`
- `hackathon_reefer_dl/outputs/`
- `outputs/dataset_analysis/`
- `outputs/weather_analysis/`

## Open the site

You can either open `presentation_site/index.html` directly or serve it locally:

```bash
python -m http.server 8000 --directory presentation_site
```

Then browse to `http://localhost:8000`.
