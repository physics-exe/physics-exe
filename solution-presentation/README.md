# Solution Presentation Site

Static presentation website for the `physics.exe` reefer forecasting solution.

## What is inside

- `index.html`: the presentation page
- `styles.css`: custom styling and layout
- `main.js`: chart rendering and page wiring
- `data/siteData.js`: generated chart-ready data
- `assets/`: copied SVG analysis figures from the repo
- `scripts/generate_site_data.py`: rebuilds `data/siteData.js` from repo outputs

## Open the site

You can either:

1. open `index.html` directly in a browser, or
2. serve the folder locally:

```bash
cd physics-exe/solution-presentation
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Refresh the data

If the prediction files or analysis outputs change:

```bash
cd physics-exe/solution-presentation
python scripts/generate_site_data.py
```
