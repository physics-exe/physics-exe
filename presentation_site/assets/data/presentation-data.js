window.presentationData = {
  "headline": {
    "windowLabel": "January 1-10, 2026",
    "windowHours": 223,
    "historyHours": 336,
    "forecastHorizonHours": 24,
    "datasetRows": 8983,
    "peakThresholdKw": 970.2,
    "bestComposite": 47.03,
    "baselineComposite": 63.54,
    "rawModelComposite": 55.06,
    "improvementVsBaselinePct": 26.0,
    "improvementVsRawModelPct": 14.6
  },
  "heroMetrics": [
    {
      "label": "Public Composite",
      "value": "47.03",
      "detail": "Measured on the released public target window"
    },
    {
      "label": "Gain vs Baseline",
      "value": "26.0%",
      "detail": "Relative improvement over the organizer baseline"
    },
    {
      "label": "Forecast Horizon",
      "value": "24h",
      "detail": "Every forecast is locked to a strict T-24 cutoff"
    },
    {
      "label": "History Context",
      "value": "336h",
      "detail": "Fourteen days of hourly history feed each prediction"
    }
  ],
  "challengeFacts": [
    "Target window: January 1, 2026 to January 10, 2026 (223 hours).",
    "Scoring: 0.5 * MAE_all + 0.3 * MAE_peak + 0.2 * pinball_p90.",
    "Peak-hour cutoff on the public window: 970.2 kW.",
    "Best day in the public window: Jan 04 with 11.1 kW MAE.",
    "Hardest day in the public window: Jan 02 with 111.3 kW MAE."
  ],
  "blendChips": [
    "Baseline = 0.7 * lag24 + 0.3 * lag168",
    "Weighted MAE on the top 15% of loads",
    "Point calibration by hour of day",
    "P90 calibration by residual volatility",
    "Low / mid / high lag24 weights = 0.35 / 1.00 / 0.475",
    "P90 uplifts = 1.065 / 1.14 / 1.085"
  ],
  "experimentRows": [
    {
      "label": "Organizer baseline",
      "composite": 63.54,
      "maeAll": 55.73,
      "maePeak": 110.61,
      "pinball": 12.46,
      "highlight": false
    },
    {
      "label": "Lag24 medium model",
      "composite": 56.97,
      "maeAll": 72.77,
      "maePeak": 55.33,
      "pinball": 19.94,
      "highlight": false
    },
    {
      "label": "Tabular emergency",
      "composite": 55.06,
      "maeAll": 72.27,
      "maePeak": 50.86,
      "pinball": 18.34,
      "highlight": false
    },
    {
      "label": "First final blend",
      "composite": 50.33,
      "maeAll": 46.46,
      "maePeak": 83.65,
      "pinball": 10.01,
      "highlight": false
    },
    {
      "label": "Winning final blend",
      "composite": 47.03,
      "maeAll": 54.6,
      "maePeak": 59.1,
      "pinball": 10.0,
      "highlight": true
    }
  ],
  "featureNotes": [
    "Emergency training selected only the load/calendar block: load_calendar.",
    "Broader fast runs kept load/calendar plus reefer_state, which helped in the richer multi-seed setting.",
    "Emergency input width: 16 features plus 7 target-time calendar values.",
    "Fast input width: 38 features plus 7 target-time calendar values."
  ],
  "takeaways": [
    "The raw residual MLP is already competitive, but the biggest public-window jump comes from a simple lag24-aware blend on top of it.",
    "Container count remains the clearest operational driver, while temperature history matters most when weather is added.",
    "The site is grounded in reproducible repo artifacts instead of hand-drawn screenshots, so the presentation can be refreshed after new runs.",
    "This is a disciplined forecast stack: strict T-24 inputs, residual learning, calibration, and a transparent post-blend tuned to peak-sensitive scoring."
  ],
  "generatedAt": "2026-04-10 07:41 UTC"
};
