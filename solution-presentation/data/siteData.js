window.siteData = {
  "meta": {
    "generatedAtUtc": "2026-04-10T07:42:21.862333Z",
    "siteTitle": "physics.exe Reefer Forecast Presentation"
  },
  "challenge": {
    "task": "Forecast combined hourly reefer power and provide both a point estimate and an upper p90 estimate.",
    "evaluationWeights": {
      "mae_all": 0.5,
      "mae_peak": 0.3,
      "pinball_p90": 0.2
    },
    "rawRows": 3774557,
    "hourlyRows": 8403,
    "publicTargetHours": 223,
    "coverageStartUtc": "2025-01-01T00:00:00Z",
    "coverageEndUtc": "2026-01-10T06:00:00Z"
  },
  "solution": {
    "name": "Autoregressive Generator Notebook",
    "notebookPath": "outputs/results/generative_models.ipynb",
    "submissionPath": "outputs/results/predictions_physics_exe_v5.csv",
    "trainingWindow": "Historical sequence until January 2026",
    "inferenceWindow": "January 1 to January 10, 2026",
    "architecture": {
      "inputSize": 1,
      "hiddenSize": 16,
      "outputSize": 1,
      "batchSize": 1,
      "loss": "L1 loss",
      "activation": "ReLU",
      "optimizer": "Adam",
      "learningRate": 0.001,
      "epochs": 1000,
      "correlationThreshold": 0.4,
      "featureWeightClamp": "1e-8 to 1e-5",
      "p90Rule": "point forecast + 10%"
    },
    "process": [
      "Rank numeric features by correlation to reefer power.",
      "Build sequential one-hour batches and train a small generator MLP.",
      "Roll the model across the January horizon to predict the next hour.",
      "Attach a cautious p90 estimate as a fixed 10 percent uplift."
    ],
    "diagramFlow": {
      "inputs": [
        {
          "title": "Hourly table",
          "detail": "Notebook reads the base hourly dataset and keeps timestamp, power target, and numeric candidates."
        },
        {
          "title": "Correlation screen",
          "detail": "Features are ranked by absolute correlation and filtered with a threshold of |r| >= 0.4."
        },
        {
          "title": "Sequential batches",
          "detail": "The notebook constructs batch size 1 windows so each row predicts the next hour."
        }
      ],
      "network": [
        {
          "title": "Main MLP path",
          "detail": "Current-hour power enters fc1: 1 -> 16, then ReLU, then fc2: 16 -> 1."
        },
        {
          "title": "Feature correction path",
          "detail": "Each correlated feature gets its own learnable scalar weight and contributes an additive correction term."
        },
        {
          "title": "Output merge",
          "detail": "The final point forecast is MLP output plus the summed feature correction stream."
        }
      ],
      "training": [
        {
          "title": "Target hour",
          "detail": "For pair i, the target is the next batch's power value, so the model learns one-step-ahead prediction."
        },
        {
          "title": "Loss and updates",
          "detail": "L1 loss is optimized with Adam for both the network parameters and the feature weights."
        },
        {
          "title": "Stopping rule",
          "detail": "The notebook allows up to 1000 epochs per pair and stops early when loss gets sufficiently small."
        }
      ],
      "inference": [
        {
          "title": "January rollout",
          "detail": "The trained notebook is evaluated across the January 2026 slice to produce next-hour point forecasts."
        },
        {
          "title": "Risk band",
          "detail": "The p90 estimate is defined as a fixed 10 percent uplift above the point forecast."
        }
      ]
    },
    "layerBreakdown": [
      {
        "stage": "fc1",
        "shape": "1 -> 16",
        "note": "Current power scalar projected into hidden space."
      },
      {
        "stage": "ReLU",
        "shape": "16",
        "note": "Non-linear activation inside the generator block."
      },
      {
        "stage": "fc2",
        "shape": "16 -> 1",
        "note": "Base next-hour estimate before feature correction."
      },
      {
        "stage": "Feature weights",
        "shape": "k -> 1",
        "note": "Sum of weighted correlated features, clamped to a tiny positive range."
      },
      {
        "stage": "Final output",
        "shape": "1",
        "note": "Point forecast used for submission and p90 uplift."
      }
    ],
    "featureThemes": [
      "Load memory",
      "Container activity",
      "Stack composition",
      "Reefer temperatures",
      "Weather context"
    ]
  },
  "results": {
    "meanPredictionKw": 867.22,
    "peakPredictionKw": 1023.71,
    "meanP90UpliftPct": 10.0,
    "overlapHours": 222,
    "maeKw": 14.3,
    "rmseKw": 19.89,
    "peakActualKw": 1028.17,
    "peakPredictedKw": 1023.04,
    "peakCapturePct": 99.5
  },
  "januaryForecast": [
    {
      "timestampUtc": "2026-01-01T00:00:00Z",
      "pointKw": 945.93,
      "p90Kw": 1040.52,
      "actualKw": null,
      "absErrorKw": null
    },
    {
      "timestampUtc": "2026-01-01T01:00:00Z",
      "pointKw": 925.82,
      "p90Kw": 1018.4,
      "actualKw": 929.79,
      "absErrorKw": 8.86
    },
    {
      "timestampUtc": "2026-01-01T02:00:00Z",
      "pointKw": 925.42,
      "p90Kw": 1017.97,
      "actualKw": 929.39,
      "absErrorKw": 4.2
    },
    {
      "timestampUtc": "2026-01-01T03:00:00Z",
      "pointKw": 931.28,
      "p90Kw": 1024.41,
      "actualKw": 935.28,
      "absErrorKw": 10.48
    },
    {
      "timestampUtc": "2026-01-01T04:00:00Z",
      "pointKw": 934.48,
      "p90Kw": 1027.93,
      "actualKw": 938.49,
      "absErrorKw": 7.84
    },
    {
      "timestampUtc": "2026-01-01T05:00:00Z",
      "pointKw": 934.5,
      "p90Kw": 1027.95,
      "actualKw": 938.52,
      "absErrorKw": 4.67
    },
    {
      "timestampUtc": "2026-01-01T06:00:00Z",
      "pointKw": 930.59,
      "p90Kw": 1023.65,
      "actualKw": 934.59,
      "absErrorKw": 0.71
    },
    {
      "timestampUtc": "2026-01-01T07:00:00Z",
      "pointKw": 944.4,
      "p90Kw": 1038.84,
      "actualKw": 948.47,
      "absErrorKw": 18.5
    },
    {
      "timestampUtc": "2026-01-01T08:00:00Z",
      "pointKw": 944.89,
      "p90Kw": 1039.38,
      "actualKw": 948.96,
      "absErrorKw": 5.19
    },
    {
      "timestampUtc": "2026-01-01T09:00:00Z",
      "pointKw": 941.97,
      "p90Kw": 1036.17,
      "actualKw": 946.02,
      "absErrorKw": 1.76
    },
    {
      "timestampUtc": "2026-01-01T10:00:00Z",
      "pointKw": 936.87,
      "p90Kw": 1030.55,
      "actualKw": 940.89,
      "absErrorKw": 0.44
    },
    {
      "timestampUtc": "2026-01-01T11:00:00Z",
      "pointKw": 943.46,
      "p90Kw": 1037.81,
      "actualKw": 947.52,
      "absErrorKw": 11.28
    },
    {
      "timestampUtc": "2026-01-01T12:00:00Z",
      "pointKw": 932.59,
      "p90Kw": 1025.85,
      "actualKw": 936.6,
      "absErrorKw": 6.23
    },
    {
      "timestampUtc": "2026-01-01T13:00:00Z",
      "pointKw": 932.89,
      "p90Kw": 1026.18,
      "actualKw": 936.9,
      "absErrorKw": 4.93
    },
    {
      "timestampUtc": "2026-01-01T14:00:00Z",
      "pointKw": 932.0,
      "p90Kw": 1025.2,
      "actualKw": 936.0,
      "absErrorKw": 3.74
    },
    {
      "timestampUtc": "2026-01-01T15:00:00Z",
      "pointKw": 926.73,
      "p90Kw": 1019.41,
      "actualKw": 930.71,
      "absErrorKw": 0.66
    },
    {
      "timestampUtc": "2026-01-01T16:00:00Z",
      "pointKw": 929.46,
      "p90Kw": 1022.41,
      "actualKw": 933.45,
      "absErrorKw": 7.35
    },
    {
      "timestampUtc": "2026-01-01T17:00:00Z",
      "pointKw": 937.13,
      "p90Kw": 1030.85,
      "actualKw": 941.16,
      "absErrorKw": 12.33
    },
    {
      "timestampUtc": "2026-01-01T18:00:00Z",
      "pointKw": 931.02,
      "p90Kw": 1024.13,
      "actualKw": 935.02,
      "absErrorKw": 1.48
    },
    {
      "timestampUtc": "2026-01-01T19:00:00Z",
      "pointKw": 925.05,
      "p90Kw": 1017.56,
      "actualKw": 929.02,
      "absErrorKw": 1.37
    },
    {
      "timestampUtc": "2026-01-01T20:00:00Z",
      "pointKw": 933.89,
      "p90Kw": 1027.28,
      "actualKw": 937.9,
      "absErrorKw": 13.47
    },
    {
      "timestampUtc": "2026-01-01T21:00:00Z",
      "pointKw": 935.82,
      "p90Kw": 1029.41,
      "actualKw": 939.85,
      "absErrorKw": 6.58
    },
    {
      "timestampUtc": "2026-01-01T22:00:00Z",
      "pointKw": 921.67,
      "p90Kw": 1013.84,
      "actualKw": 925.62,
      "absErrorKw": 9.57
    },
    {
      "timestampUtc": "2026-01-01T23:00:00Z",
      "pointKw": 928.97,
      "p90Kw": 1021.87,
      "actualKw": 932.96,
      "absErrorKw": 11.91
    },
    {
      "timestampUtc": "2026-01-02T00:00:00Z",
      "pointKw": 915.04,
      "p90Kw": 1006.54,
      "actualKw": 918.95,
      "absErrorKw": 9.4
    },
    {
      "timestampUtc": "2026-01-02T01:00:00Z",
      "pointKw": 921.34,
      "p90Kw": 1013.47,
      "actualKw": 925.29,
      "absErrorKw": 10.87
    },
    {
      "timestampUtc": "2026-01-02T02:00:00Z",
      "pointKw": 929.41,
      "p90Kw": 1022.35,
      "actualKw": 933.4,
      "absErrorKw": 12.69
    },
    {
      "timestampUtc": "2026-01-02T03:00:00Z",
      "pointKw": 927.75,
      "p90Kw": 1020.52,
      "actualKw": 931.73,
      "absErrorKw": 2.94
    },
    {
      "timestampUtc": "2026-01-02T04:00:00Z",
      "pointKw": 921.47,
      "p90Kw": 1013.62,
      "actualKw": 925.42,
      "absErrorKw": 1.7
    },
    {
      "timestampUtc": "2026-01-02T05:00:00Z",
      "pointKw": 905.92,
      "p90Kw": 996.52,
      "actualKw": 909.8,
      "absErrorKw": 11.05
    },
    {
      "timestampUtc": "2026-01-02T06:00:00Z",
      "pointKw": 885.29,
      "p90Kw": 973.82,
      "actualKw": 889.06,
      "absErrorKw": 16.25
    },
    {
      "timestampUtc": "2026-01-02T07:00:00Z",
      "pointKw": 871.82,
      "p90Kw": 959.0,
      "actualKw": 875.52,
      "absErrorKw": 9.16
    },
    {
      "timestampUtc": "2026-01-02T08:00:00Z",
      "pointKw": 896.46,
      "p90Kw": 986.1,
      "actualKw": 900.28,
      "absErrorKw": 29.06
    },
    {
      "timestampUtc": "2026-01-02T09:00:00Z",
      "pointKw": 874.59,
      "p90Kw": 962.05,
      "actualKw": 878.3,
      "absErrorKw": 17.54
    },
    {
      "timestampUtc": "2026-01-02T10:00:00Z",
      "pointKw": 862.04,
      "p90Kw": 948.24,
      "actualKw": 865.69,
      "absErrorKw": 8.3
    },
    {
      "timestampUtc": "2026-01-02T11:00:00Z",
      "pointKw": 843.74,
      "p90Kw": 928.12,
      "actualKw": 847.3,
      "absErrorKw": 14.14
    },
    {
      "timestampUtc": "2026-01-02T12:00:00Z",
      "pointKw": 813.65,
      "p90Kw": 895.02,
      "actualKw": 817.06,
      "absErrorKw": 26.1
    },
    {
      "timestampUtc": "2026-01-02T13:00:00Z",
      "pointKw": 831.67,
      "p90Kw": 914.84,
      "actualKw": 835.17,
      "absErrorKw": 22.09
    },
    {
      "timestampUtc": "2026-01-02T14:00:00Z",
      "pointKw": 814.17,
      "p90Kw": 895.59,
      "actualKw": 817.58,
      "absErrorKw": 13.51
    },
    {
      "timestampUtc": "2026-01-02T15:00:00Z",
      "pointKw": 812.09,
      "p90Kw": 893.3,
      "actualKw": 815.49,
      "absErrorKw": 1.89
    },
    {
      "timestampUtc": "2026-01-02T16:00:00Z",
      "pointKw": 799.13,
      "p90Kw": 879.05,
      "actualKw": 802.47,
      "absErrorKw": 9.05
    },
    {
      "timestampUtc": "2026-01-02T17:00:00Z",
      "pointKw": 870.97,
      "p90Kw": 958.06,
      "actualKw": 874.66,
      "absErrorKw": 76.1
    },
    {
      "timestampUtc": "2026-01-02T18:00:00Z",
      "pointKw": 848.77,
      "p90Kw": 933.65,
      "actualKw": 852.35,
      "absErrorKw": 18.01
    },
    {
      "timestampUtc": "2026-01-02T19:00:00Z",
      "pointKw": 852.72,
      "p90Kw": 937.99,
      "actualKw": 856.32,
      "absErrorKw": 8.14
    },
    {
      "timestampUtc": "2026-01-02T20:00:00Z",
      "pointKw": 855.59,
      "p90Kw": 941.15,
      "actualKw": 859.21,
      "absErrorKw": 7.08
    },
    {
      "timestampUtc": "2026-01-02T21:00:00Z",
      "pointKw": 850.58,
      "p90Kw": 935.64,
      "actualKw": 854.17,
      "absErrorKw": 0.82
    },
    {
      "timestampUtc": "2026-01-02T22:00:00Z",
      "pointKw": 826.58,
      "p90Kw": 909.24,
      "actualKw": 830.05,
      "absErrorKw": 19.94
    },
    {
      "timestampUtc": "2026-01-02T23:00:00Z",
      "pointKw": 820.57,
      "p90Kw": 902.63,
      "actualKw": 824.01,
      "absErrorKw": 1.99
    },
    {
      "timestampUtc": "2026-01-03T00:00:00Z",
      "pointKw": 818.33,
      "p90Kw": 900.16,
      "actualKw": 821.76,
      "absErrorKw": 1.77
    },
    {
      "timestampUtc": "2026-01-03T01:00:00Z",
      "pointKw": 835.03,
      "p90Kw": 918.53,
      "actualKw": 838.54,
      "absErrorKw": 20.79
    },
    {
      "timestampUtc": "2026-01-03T02:00:00Z",
      "pointKw": 838.14,
      "p90Kw": 921.96,
      "actualKw": 841.67,
      "absErrorKw": 7.23
    },
    {
      "timestampUtc": "2026-01-03T03:00:00Z",
      "pointKw": 837.05,
      "p90Kw": 920.76,
      "actualKw": 840.58,
      "absErrorKw": 3.02
    },
    {
      "timestampUtc": "2026-01-03T04:00:00Z",
      "pointKw": 835.44,
      "p90Kw": 918.99,
      "actualKw": 838.96,
      "absErrorKw": 2.49
    },
    {
      "timestampUtc": "2026-01-03T05:00:00Z",
      "pointKw": 838.67,
      "p90Kw": 922.54,
      "actualKw": 842.21,
      "absErrorKw": 7.34
    },
    {
      "timestampUtc": "2026-01-03T06:00:00Z",
      "pointKw": 846.18,
      "p90Kw": 930.79,
      "actualKw": 849.75,
      "absErrorKw": 11.66
    },
    {
      "timestampUtc": "2026-01-03T07:00:00Z",
      "pointKw": 832.14,
      "p90Kw": 915.35,
      "actualKw": 835.64,
      "absErrorKw": 9.95
    },
    {
      "timestampUtc": "2026-01-03T08:00:00Z",
      "pointKw": 833.83,
      "p90Kw": 917.21,
      "actualKw": 837.34,
      "absErrorKw": 5.78
    },
    {
      "timestampUtc": "2026-01-03T09:00:00Z",
      "pointKw": 823.74,
      "p90Kw": 906.12,
      "actualKw": 827.2,
      "absErrorKw": 6.05
    },
    {
      "timestampUtc": "2026-01-03T10:00:00Z",
      "pointKw": 841.35,
      "p90Kw": 925.49,
      "actualKw": 844.9,
      "absErrorKw": 21.73
    },
    {
      "timestampUtc": "2026-01-03T11:00:00Z",
      "pointKw": 854.3,
      "p90Kw": 939.72,
      "actualKw": 857.91,
      "absErrorKw": 17.14
    },
    {
      "timestampUtc": "2026-01-03T12:00:00Z",
      "pointKw": 863.2,
      "p90Kw": 949.52,
      "actualKw": 866.85,
      "absErrorKw": 13.15
    },
    {
      "timestampUtc": "2026-01-03T13:00:00Z",
      "pointKw": 859.07,
      "p90Kw": 944.98,
      "actualKw": 862.71,
      "absErrorKw": 0.11
    },
    {
      "timestampUtc": "2026-01-03T14:00:00Z",
      "pointKw": 850.95,
      "p90Kw": 936.04,
      "actualKw": 854.54,
      "absErrorKw": 3.94
    },
    {
      "timestampUtc": "2026-01-03T15:00:00Z",
      "pointKw": 847.98,
      "p90Kw": 932.77,
      "actualKw": 851.56,
      "absErrorKw": 1.2
    },
    {
      "timestampUtc": "2026-01-03T16:00:00Z",
      "pointKw": 840.91,
      "p90Kw": 925.0,
      "actualKw": 844.46,
      "absErrorKw": 2.93
    },
    {
      "timestampUtc": "2026-01-03T17:00:00Z",
      "pointKw": 831.77,
      "p90Kw": 914.95,
      "actualKw": 835.27,
      "absErrorKw": 5.06
    },
    {
      "timestampUtc": "2026-01-03T18:00:00Z",
      "pointKw": 826.88,
      "p90Kw": 909.57,
      "actualKw": 830.35,
      "absErrorKw": 0.84
    },
    {
      "timestampUtc": "2026-01-03T19:00:00Z",
      "pointKw": 822.36,
      "p90Kw": 904.59,
      "actualKw": 825.81,
      "absErrorKw": 0.49
    },
    {
      "timestampUtc": "2026-01-03T20:00:00Z",
      "pointKw": 835.83,
      "p90Kw": 919.42,
      "actualKw": 839.35,
      "absErrorKw": 17.57
    },
    {
      "timestampUtc": "2026-01-03T21:00:00Z",
      "pointKw": 822.43,
      "p90Kw": 904.67,
      "actualKw": 825.88,
      "absErrorKw": 9.37
    },
    {
      "timestampUtc": "2026-01-03T22:00:00Z",
      "pointKw": 805.61,
      "p90Kw": 886.17,
      "actualKw": 808.98,
      "absErrorKw": 12.87
    },
    {
      "timestampUtc": "2026-01-03T23:00:00Z",
      "pointKw": 805.82,
      "p90Kw": 886.41,
      "actualKw": 809.19,
      "absErrorKw": 4.15
    },
    {
      "timestampUtc": "2026-01-04T00:00:00Z",
      "pointKw": 805.96,
      "p90Kw": 886.56,
      "actualKw": 809.33,
      "absErrorKw": 4.07
    },
    {
      "timestampUtc": "2026-01-04T01:00:00Z",
      "pointKw": 789.37,
      "p90Kw": 868.3,
      "actualKw": 792.65,
      "absErrorKw": 12.74
    },
    {
      "timestampUtc": "2026-01-04T02:00:00Z",
      "pointKw": 784.59,
      "p90Kw": 863.05,
      "actualKw": 787.85,
      "absErrorKw": 0.95
    },
    {
      "timestampUtc": "2026-01-04T03:00:00Z",
      "pointKw": 804.69,
      "p90Kw": 885.16,
      "actualKw": 808.05,
      "absErrorKw": 24.02
    },
    {
      "timestampUtc": "2026-01-04T04:00:00Z",
      "pointKw": 809.11,
      "p90Kw": 890.02,
      "actualKw": 812.49,
      "absErrorKw": 8.37
    },
    {
      "timestampUtc": "2026-01-04T05:00:00Z",
      "pointKw": 803.95,
      "p90Kw": 884.35,
      "actualKw": 807.31,
      "absErrorKw": 1.23
    },
    {
      "timestampUtc": "2026-01-04T06:00:00Z",
      "pointKw": 803.36,
      "p90Kw": 883.7,
      "actualKw": 806.72,
      "absErrorKw": 3.34
    },
    {
      "timestampUtc": "2026-01-04T07:00:00Z",
      "pointKw": 811.37,
      "p90Kw": 892.51,
      "actualKw": 814.77,
      "absErrorKw": 11.97
    },
    {
      "timestampUtc": "2026-01-04T08:00:00Z",
      "pointKw": 814.47,
      "p90Kw": 895.91,
      "actualKw": 817.88,
      "absErrorKw": 7.08
    },
    {
      "timestampUtc": "2026-01-04T09:00:00Z",
      "pointKw": 807.84,
      "p90Kw": 888.63,
      "actualKw": 811.22,
      "absErrorKw": 2.68
    },
    {
      "timestampUtc": "2026-01-04T10:00:00Z",
      "pointKw": 813.48,
      "p90Kw": 894.83,
      "actualKw": 816.89,
      "absErrorKw": 9.62
    },
    {
      "timestampUtc": "2026-01-04T11:00:00Z",
      "pointKw": 801.97,
      "p90Kw": 882.17,
      "actualKw": 805.32,
      "absErrorKw": 7.59
    },
    {
      "timestampUtc": "2026-01-04T12:00:00Z",
      "pointKw": 795.66,
      "p90Kw": 875.23,
      "actualKw": 798.98,
      "absErrorKw": 2.43
    },
    {
      "timestampUtc": "2026-01-04T13:00:00Z",
      "pointKw": 821.77,
      "p90Kw": 903.95,
      "actualKw": 825.22,
      "absErrorKw": 30.12
    },
    {
      "timestampUtc": "2026-01-04T14:00:00Z",
      "pointKw": 819.52,
      "p90Kw": 901.48,
      "actualKw": 822.96,
      "absErrorKw": 1.77
    },
    {
      "timestampUtc": "2026-01-04T15:00:00Z",
      "pointKw": 809.61,
      "p90Kw": 890.57,
      "actualKw": 812.99,
      "absErrorKw": 5.96
    },
    {
      "timestampUtc": "2026-01-04T16:00:00Z",
      "pointKw": 814.97,
      "p90Kw": 896.46,
      "actualKw": 818.38,
      "absErrorKw": 9.34
    },
    {
      "timestampUtc": "2026-01-04T17:00:00Z",
      "pointKw": 805.57,
      "p90Kw": 886.13,
      "actualKw": 808.94,
      "absErrorKw": 5.45
    },
    {
      "timestampUtc": "2026-01-04T18:00:00Z",
      "pointKw": 803.85,
      "p90Kw": 884.24,
      "actualKw": 807.21,
      "absErrorKw": 2.2
    },
    {
      "timestampUtc": "2026-01-04T19:00:00Z",
      "pointKw": 807.02,
      "p90Kw": 887.72,
      "actualKw": 810.39,
      "absErrorKw": 7.11
    },
    {
      "timestampUtc": "2026-01-04T20:00:00Z",
      "pointKw": 820.75,
      "p90Kw": 902.83,
      "actualKw": 824.2,
      "absErrorKw": 17.75
    },
    {
      "timestampUtc": "2026-01-04T21:00:00Z",
      "pointKw": 820.3,
      "p90Kw": 902.33,
      "actualKw": 823.74,
      "absErrorKw": 3.56
    },
    {
      "timestampUtc": "2026-01-04T22:00:00Z",
      "pointKw": 817.31,
      "p90Kw": 899.05,
      "actualKw": 820.74,
      "absErrorKw": 1.01
    },
    {
      "timestampUtc": "2026-01-04T23:00:00Z",
      "pointKw": 811.21,
      "p90Kw": 892.33,
      "actualKw": 814.6,
      "absErrorKw": 2.14
    },
    {
      "timestampUtc": "2026-01-05T00:00:00Z",
      "pointKw": 808.08,
      "p90Kw": 888.89,
      "actualKw": 811.46,
      "absErrorKw": 0.82
    },
    {
      "timestampUtc": "2026-01-05T01:00:00Z",
      "pointKw": 814.71,
      "p90Kw": 896.18,
      "actualKw": 818.12,
      "absErrorKw": 10.61
    },
    {
      "timestampUtc": "2026-01-05T02:00:00Z",
      "pointKw": 819.23,
      "p90Kw": 901.15,
      "actualKw": 822.66,
      "absErrorKw": 8.52
    },
    {
      "timestampUtc": "2026-01-05T03:00:00Z",
      "pointKw": 806.96,
      "p90Kw": 887.66,
      "actualKw": 810.33,
      "absErrorKw": 8.32
    },
    {
      "timestampUtc": "2026-01-05T04:00:00Z",
      "pointKw": 811.13,
      "p90Kw": 892.24,
      "actualKw": 814.52,
      "absErrorKw": 8.13
    },
    {
      "timestampUtc": "2026-01-05T05:00:00Z",
      "pointKw": 796.78,
      "p90Kw": 876.46,
      "actualKw": 800.1,
      "absErrorKw": 10.46
    },
    {
      "timestampUtc": "2026-01-05T06:00:00Z",
      "pointKw": 788.9,
      "p90Kw": 867.79,
      "actualKw": 792.18,
      "absErrorKw": 4.03
    },
    {
      "timestampUtc": "2026-01-05T07:00:00Z",
      "pointKw": 792.47,
      "p90Kw": 871.72,
      "actualKw": 795.77,
      "absErrorKw": 7.43
    },
    {
      "timestampUtc": "2026-01-05T08:00:00Z",
      "pointKw": 800.74,
      "p90Kw": 880.81,
      "actualKw": 804.08,
      "absErrorKw": 12.17
    },
    {
      "timestampUtc": "2026-01-05T09:00:00Z",
      "pointKw": 794.88,
      "p90Kw": 874.37,
      "actualKw": 798.2,
      "absErrorKw": 1.98
    },
    {
      "timestampUtc": "2026-01-05T10:00:00Z",
      "pointKw": 800.96,
      "p90Kw": 881.06,
      "actualKw": 804.31,
      "absErrorKw": 9.99
    },
    {
      "timestampUtc": "2026-01-05T11:00:00Z",
      "pointKw": 802.69,
      "p90Kw": 882.96,
      "actualKw": 806.04,
      "absErrorKw": 5.64
    },
    {
      "timestampUtc": "2026-01-05T12:00:00Z",
      "pointKw": 810.13,
      "p90Kw": 891.14,
      "actualKw": 813.52,
      "absErrorKw": 11.39
    },
    {
      "timestampUtc": "2026-01-05T13:00:00Z",
      "pointKw": 808.71,
      "p90Kw": 889.58,
      "actualKw": 812.09,
      "absErrorKw": 2.54
    },
    {
      "timestampUtc": "2026-01-05T14:00:00Z",
      "pointKw": 811.22,
      "p90Kw": 892.34,
      "actualKw": 814.61,
      "absErrorKw": 6.47
    },
    {
      "timestampUtc": "2026-01-05T15:00:00Z",
      "pointKw": 787.04,
      "p90Kw": 865.75,
      "actualKw": 790.32,
      "absErrorKw": 20.33
    },
    {
      "timestampUtc": "2026-01-05T16:00:00Z",
      "pointKw": 784.58,
      "p90Kw": 863.04,
      "actualKw": 787.84,
      "absErrorKw": 1.36
    },
    {
      "timestampUtc": "2026-01-05T17:00:00Z",
      "pointKw": 786.99,
      "p90Kw": 865.69,
      "actualKw": 790.27,
      "absErrorKw": 6.25
    },
    {
      "timestampUtc": "2026-01-05T18:00:00Z",
      "pointKw": 785.79,
      "p90Kw": 864.37,
      "actualKw": 789.06,
      "absErrorKw": 2.62
    },
    {
      "timestampUtc": "2026-01-05T19:00:00Z",
      "pointKw": 807.94,
      "p90Kw": 888.73,
      "actualKw": 811.31,
      "absErrorKw": 26.08
    },
    {
      "timestampUtc": "2026-01-05T20:00:00Z",
      "pointKw": 813.38,
      "p90Kw": 894.72,
      "actualKw": 816.79,
      "absErrorKw": 9.42
    },
    {
      "timestampUtc": "2026-01-05T21:00:00Z",
      "pointKw": 799.55,
      "p90Kw": 879.51,
      "actualKw": 802.89,
      "absErrorKw": 9.92
    },
    {
      "timestampUtc": "2026-01-05T22:00:00Z",
      "pointKw": 833.84,
      "p90Kw": 917.23,
      "actualKw": 837.35,
      "absErrorKw": 38.36
    },
    {
      "timestampUtc": "2026-01-05T23:00:00Z",
      "pointKw": 881.29,
      "p90Kw": 969.41,
      "actualKw": 885.03,
      "absErrorKw": 51.77
    },
    {
      "timestampUtc": "2026-01-06T00:00:00Z",
      "pointKw": 813.94,
      "p90Kw": 895.33,
      "actualKw": 817.34,
      "absErrorKw": 63.34
    },
    {
      "timestampUtc": "2026-01-06T01:00:00Z",
      "pointKw": 835.15,
      "p90Kw": 918.66,
      "actualKw": 838.67,
      "absErrorKw": 25.3
    },
    {
      "timestampUtc": "2026-01-06T02:00:00Z",
      "pointKw": 836.33,
      "p90Kw": 919.96,
      "actualKw": 839.85,
      "absErrorKw": 5.28
    },
    {
      "timestampUtc": "2026-01-06T03:00:00Z",
      "pointKw": 818.73,
      "p90Kw": 900.6,
      "actualKw": 822.16,
      "absErrorKw": 13.58
    },
    {
      "timestampUtc": "2026-01-06T04:00:00Z",
      "pointKw": 842.21,
      "p90Kw": 926.43,
      "actualKw": 845.76,
      "absErrorKw": 27.61
    },
    {
      "timestampUtc": "2026-01-06T05:00:00Z",
      "pointKw": 840.54,
      "p90Kw": 924.59,
      "actualKw": 844.08,
      "absErrorKw": 2.45
    },
    {
      "timestampUtc": "2026-01-06T06:00:00Z",
      "pointKw": 814.56,
      "p90Kw": 896.01,
      "actualKw": 817.97,
      "absErrorKw": 21.99
    },
    {
      "timestampUtc": "2026-01-06T07:00:00Z",
      "pointKw": 790.71,
      "p90Kw": 869.78,
      "actualKw": 794.0,
      "absErrorKw": 19.98
    },
    {
      "timestampUtc": "2026-01-06T08:00:00Z",
      "pointKw": 799.21,
      "p90Kw": 879.13,
      "actualKw": 802.55,
      "absErrorKw": 12.4
    },
    {
      "timestampUtc": "2026-01-06T09:00:00Z",
      "pointKw": 817.01,
      "p90Kw": 898.72,
      "actualKw": 820.44,
      "absErrorKw": 21.79
    },
    {
      "timestampUtc": "2026-01-06T10:00:00Z",
      "pointKw": 816.25,
      "p90Kw": 897.87,
      "actualKw": 819.67,
      "absErrorKw": 3.23
    },
    {
      "timestampUtc": "2026-01-06T11:00:00Z",
      "pointKw": 838.56,
      "p90Kw": 922.42,
      "actualKw": 842.09,
      "absErrorKw": 26.42
    },
    {
      "timestampUtc": "2026-01-06T12:00:00Z",
      "pointKw": 855.56,
      "p90Kw": 941.11,
      "actualKw": 859.18,
      "absErrorKw": 21.2
    },
    {
      "timestampUtc": "2026-01-06T13:00:00Z",
      "pointKw": 882.97,
      "p90Kw": 971.27,
      "actualKw": 886.73,
      "absErrorKw": 31.76
    },
    {
      "timestampUtc": "2026-01-06T14:00:00Z",
      "pointKw": 841.7,
      "p90Kw": 925.87,
      "actualKw": 845.25,
      "absErrorKw": 37.12
    },
    {
      "timestampUtc": "2026-01-06T15:00:00Z",
      "pointKw": 795.98,
      "p90Kw": 875.58,
      "actualKw": 799.3,
      "absErrorKw": 41.82
    },
    {
      "timestampUtc": "2026-01-06T16:00:00Z",
      "pointKw": 805.77,
      "p90Kw": 886.35,
      "actualKw": 809.14,
      "absErrorKw": 13.72
    },
    {
      "timestampUtc": "2026-01-06T17:00:00Z",
      "pointKw": 783.49,
      "p90Kw": 861.84,
      "actualKw": 786.75,
      "absErrorKw": 18.45
    },
    {
      "timestampUtc": "2026-01-06T18:00:00Z",
      "pointKw": 792.74,
      "p90Kw": 872.01,
      "actualKw": 796.04,
      "absErrorKw": 13.1
    },
    {
      "timestampUtc": "2026-01-06T19:00:00Z",
      "pointKw": 826.26,
      "p90Kw": 908.89,
      "actualKw": 829.73,
      "absErrorKw": 37.56
    },
    {
      "timestampUtc": "2026-01-06T20:00:00Z",
      "pointKw": 854.84,
      "p90Kw": 940.32,
      "actualKw": 858.45,
      "absErrorKw": 32.77
    },
    {
      "timestampUtc": "2026-01-06T21:00:00Z",
      "pointKw": 827.99,
      "p90Kw": 910.79,
      "actualKw": 831.47,
      "absErrorKw": 22.77
    },
    {
      "timestampUtc": "2026-01-06T22:00:00Z",
      "pointKw": 828.0,
      "p90Kw": 910.8,
      "actualKw": 831.48,
      "absErrorKw": 4.07
    },
    {
      "timestampUtc": "2026-01-06T23:00:00Z",
      "pointKw": 811.87,
      "p90Kw": 893.06,
      "actualKw": 815.27,
      "absErrorKw": 12.15
    },
    {
      "timestampUtc": "2026-01-07T00:00:00Z",
      "pointKw": 862.26,
      "p90Kw": 948.49,
      "actualKw": 865.92,
      "absErrorKw": 54.61
    },
    {
      "timestampUtc": "2026-01-07T01:00:00Z",
      "pointKw": 861.5,
      "p90Kw": 947.65,
      "actualKw": 865.15,
      "absErrorKw": 3.48
    },
    {
      "timestampUtc": "2026-01-07T02:00:00Z",
      "pointKw": 864.16,
      "p90Kw": 950.58,
      "actualKw": 867.82,
      "absErrorKw": 6.92
    },
    {
      "timestampUtc": "2026-01-07T03:00:00Z",
      "pointKw": 837.09,
      "p90Kw": 920.8,
      "actualKw": 840.62,
      "absErrorKw": 22.95
    },
    {
      "timestampUtc": "2026-01-07T04:00:00Z",
      "pointKw": 860.88,
      "p90Kw": 946.96,
      "actualKw": 864.52,
      "absErrorKw": 28.01
    },
    {
      "timestampUtc": "2026-01-07T05:00:00Z",
      "pointKw": 831.94,
      "p90Kw": 915.14,
      "actualKw": 835.44,
      "absErrorKw": 24.84
    },
    {
      "timestampUtc": "2026-01-07T06:00:00Z",
      "pointKw": 816.43,
      "p90Kw": 898.08,
      "actualKw": 819.86,
      "absErrorKw": 11.51
    },
    {
      "timestampUtc": "2026-01-07T07:00:00Z",
      "pointKw": 831.39,
      "p90Kw": 914.53,
      "actualKw": 834.89,
      "absErrorKw": 19.03
    },
    {
      "timestampUtc": "2026-01-07T08:00:00Z",
      "pointKw": 822.5,
      "p90Kw": 904.75,
      "actualKw": 825.95,
      "absErrorKw": 4.86
    },
    {
      "timestampUtc": "2026-01-07T09:00:00Z",
      "pointKw": 805.62,
      "p90Kw": 886.18,
      "actualKw": 808.99,
      "absErrorKw": 12.94
    },
    {
      "timestampUtc": "2026-01-07T10:00:00Z",
      "pointKw": 839.26,
      "p90Kw": 923.19,
      "actualKw": 842.8,
      "absErrorKw": 37.75
    },
    {
      "timestampUtc": "2026-01-07T11:00:00Z",
      "pointKw": 825.79,
      "p90Kw": 908.36,
      "actualKw": 829.25,
      "absErrorKw": 9.43
    },
    {
      "timestampUtc": "2026-01-07T12:00:00Z",
      "pointKw": 835.33,
      "p90Kw": 918.86,
      "actualKw": 838.84,
      "absErrorKw": 13.63
    },
    {
      "timestampUtc": "2026-01-07T13:00:00Z",
      "pointKw": 842.56,
      "p90Kw": 926.82,
      "actualKw": 846.12,
      "absErrorKw": 11.37
    },
    {
      "timestampUtc": "2026-01-07T14:00:00Z",
      "pointKw": 840.4,
      "p90Kw": 924.44,
      "actualKw": 843.95,
      "absErrorKw": 1.97
    },
    {
      "timestampUtc": "2026-01-07T15:00:00Z",
      "pointKw": 827.0,
      "p90Kw": 909.7,
      "actualKw": 830.47,
      "absErrorKw": 9.35
    },
    {
      "timestampUtc": "2026-01-07T16:00:00Z",
      "pointKw": 852.44,
      "p90Kw": 937.69,
      "actualKw": 856.05,
      "absErrorKw": 29.63
    },
    {
      "timestampUtc": "2026-01-07T17:00:00Z",
      "pointKw": 865.52,
      "p90Kw": 952.07,
      "actualKw": 869.19,
      "absErrorKw": 17.33
    },
    {
      "timestampUtc": "2026-01-07T18:00:00Z",
      "pointKw": 865.39,
      "p90Kw": 951.93,
      "actualKw": 869.06,
      "absErrorKw": 4.13
    },
    {
      "timestampUtc": "2026-01-07T19:00:00Z",
      "pointKw": 894.97,
      "p90Kw": 984.47,
      "actualKw": 898.79,
      "absErrorKw": 34.0
    },
    {
      "timestampUtc": "2026-01-07T20:00:00Z",
      "pointKw": 888.42,
      "p90Kw": 977.26,
      "actualKw": 892.2,
      "absErrorKw": 2.16
    },
    {
      "timestampUtc": "2026-01-07T21:00:00Z",
      "pointKw": 910.01,
      "p90Kw": 1001.01,
      "actualKw": 913.9,
      "absErrorKw": 26.09
    },
    {
      "timestampUtc": "2026-01-07T22:00:00Z",
      "pointKw": 874.77,
      "p90Kw": 962.25,
      "actualKw": 878.49,
      "absErrorKw": 30.9
    },
    {
      "timestampUtc": "2026-01-07T23:00:00Z",
      "pointKw": 899.13,
      "p90Kw": 989.04,
      "actualKw": 902.97,
      "absErrorKw": 28.8
    },
    {
      "timestampUtc": "2026-01-08T00:00:00Z",
      "pointKw": 890.4,
      "p90Kw": 979.43,
      "actualKw": 894.19,
      "absErrorKw": 4.33
    },
    {
      "timestampUtc": "2026-01-08T01:00:00Z",
      "pointKw": 859.09,
      "p90Kw": 945.0,
      "actualKw": 862.73,
      "absErrorKw": 27.06
    },
    {
      "timestampUtc": "2026-01-08T02:00:00Z",
      "pointKw": 856.09,
      "p90Kw": 941.69,
      "actualKw": 859.71,
      "absErrorKw": 1.21
    },
    {
      "timestampUtc": "2026-01-08T03:00:00Z",
      "pointKw": 845.89,
      "p90Kw": 930.48,
      "actualKw": 849.47,
      "absErrorKw": 6.03
    },
    {
      "timestampUtc": "2026-01-08T04:00:00Z",
      "pointKw": 838.78,
      "p90Kw": 922.66,
      "actualKw": 842.32,
      "absErrorKw": 2.99
    },
    {
      "timestampUtc": "2026-01-08T05:00:00Z",
      "pointKw": 847.04,
      "p90Kw": 931.74,
      "actualKw": 850.61,
      "absErrorKw": 12.41
    },
    {
      "timestampUtc": "2026-01-08T06:00:00Z",
      "pointKw": 834.4,
      "p90Kw": 917.84,
      "actualKw": 837.91,
      "absErrorKw": 8.54
    },
    {
      "timestampUtc": "2026-01-08T07:00:00Z",
      "pointKw": 826.13,
      "p90Kw": 908.74,
      "actualKw": 829.6,
      "absErrorKw": 4.22
    },
    {
      "timestampUtc": "2026-01-08T08:00:00Z",
      "pointKw": 817.84,
      "p90Kw": 899.62,
      "actualKw": 821.27,
      "absErrorKw": 4.29
    },
    {
      "timestampUtc": "2026-01-08T09:00:00Z",
      "pointKw": 856.82,
      "p90Kw": 942.51,
      "actualKw": 860.45,
      "absErrorKw": 43.18
    },
    {
      "timestampUtc": "2026-01-08T10:00:00Z",
      "pointKw": 852.9,
      "p90Kw": 938.18,
      "actualKw": 856.5,
      "absErrorKw": 0.27
    },
    {
      "timestampUtc": "2026-01-08T11:00:00Z",
      "pointKw": 807.3,
      "p90Kw": 888.03,
      "actualKw": 810.68,
      "absErrorKw": 41.63
    },
    {
      "timestampUtc": "2026-01-08T12:00:00Z",
      "pointKw": 848.89,
      "p90Kw": 933.78,
      "actualKw": 852.48,
      "absErrorKw": 45.75
    },
    {
      "timestampUtc": "2026-01-08T13:00:00Z",
      "pointKw": 861.67,
      "p90Kw": 947.84,
      "actualKw": 865.32,
      "absErrorKw": 17.02
    },
    {
      "timestampUtc": "2026-01-08T14:00:00Z",
      "pointKw": 841.98,
      "p90Kw": 926.17,
      "actualKw": 845.53,
      "absErrorKw": 15.55
    },
    {
      "timestampUtc": "2026-01-08T15:00:00Z",
      "pointKw": 850.79,
      "p90Kw": 935.87,
      "actualKw": 854.38,
      "absErrorKw": 12.99
    },
    {
      "timestampUtc": "2026-01-08T16:00:00Z",
      "pointKw": 889.39,
      "p90Kw": 978.33,
      "actualKw": 893.18,
      "absErrorKw": 42.98
    },
    {
      "timestampUtc": "2026-01-08T17:00:00Z",
      "pointKw": 857.51,
      "p90Kw": 943.26,
      "actualKw": 861.14,
      "absErrorKw": 27.64
    },
    {
      "timestampUtc": "2026-01-08T18:00:00Z",
      "pointKw": 851.5,
      "p90Kw": 936.65,
      "actualKw": 855.1,
      "absErrorKw": 1.82
    },
    {
      "timestampUtc": "2026-01-08T19:00:00Z",
      "pointKw": 897.43,
      "p90Kw": 987.17,
      "actualKw": 901.26,
      "absErrorKw": 50.35
    },
    {
      "timestampUtc": "2026-01-08T20:00:00Z",
      "pointKw": 961.0,
      "p90Kw": 1057.1,
      "actualKw": 965.15,
      "absErrorKw": 68.33
    },
    {
      "timestampUtc": "2026-01-08T21:00:00Z",
      "pointKw": 945.28,
      "p90Kw": 1039.81,
      "actualKw": 949.35,
      "absErrorKw": 11.01
    },
    {
      "timestampUtc": "2026-01-08T22:00:00Z",
      "pointKw": 974.08,
      "p90Kw": 1071.49,
      "actualKw": 978.29,
      "absErrorKw": 33.65
    },
    {
      "timestampUtc": "2026-01-08T23:00:00Z",
      "pointKw": 952.94,
      "p90Kw": 1048.23,
      "actualKw": 957.05,
      "absErrorKw": 16.38
    },
    {
      "timestampUtc": "2026-01-09T00:00:00Z",
      "pointKw": 991.47,
      "p90Kw": 1090.62,
      "actualKw": 995.77,
      "absErrorKw": 43.47
    },
    {
      "timestampUtc": "2026-01-09T01:00:00Z",
      "pointKw": 987.26,
      "p90Kw": 1085.99,
      "actualKw": 991.54,
      "absErrorKw": 0.73
    },
    {
      "timestampUtc": "2026-01-09T02:00:00Z",
      "pointKw": 950.28,
      "p90Kw": 1045.31,
      "actualKw": 954.37,
      "absErrorKw": 32.23
    },
    {
      "timestampUtc": "2026-01-09T03:00:00Z",
      "pointKw": 947.82,
      "p90Kw": 1042.6,
      "actualKw": 951.9,
      "absErrorKw": 2.26
    },
    {
      "timestampUtc": "2026-01-09T04:00:00Z",
      "pointKw": 932.27,
      "p90Kw": 1025.49,
      "actualKw": 936.27,
      "absErrorKw": 10.91
    },
    {
      "timestampUtc": "2026-01-09T05:00:00Z",
      "pointKw": 942.32,
      "p90Kw": 1036.55,
      "actualKw": 946.38,
      "absErrorKw": 14.73
    },
    {
      "timestampUtc": "2026-01-09T06:00:00Z",
      "pointKw": 930.13,
      "p90Kw": 1023.14,
      "actualKw": 934.12,
      "absErrorKw": 7.57
    },
    {
      "timestampUtc": "2026-01-09T07:00:00Z",
      "pointKw": 945.19,
      "p90Kw": 1039.71,
      "actualKw": 949.26,
      "absErrorKw": 19.76
    },
    {
      "timestampUtc": "2026-01-09T08:00:00Z",
      "pointKw": 942.67,
      "p90Kw": 1036.93,
      "actualKw": 946.72,
      "absErrorKw": 2.17
    },
    {
      "timestampUtc": "2026-01-09T09:00:00Z",
      "pointKw": 968.82,
      "p90Kw": 1065.71,
      "actualKw": 973.01,
      "absErrorKw": 30.98
    },
    {
      "timestampUtc": "2026-01-09T10:00:00Z",
      "pointKw": 992.96,
      "p90Kw": 1092.25,
      "actualKw": 997.27,
      "absErrorKw": 29.09
    },
    {
      "timestampUtc": "2026-01-09T11:00:00Z",
      "pointKw": 995.6,
      "p90Kw": 1095.16,
      "actualKw": 999.92,
      "absErrorKw": 7.62
    },
    {
      "timestampUtc": "2026-01-09T12:00:00Z",
      "pointKw": 975.23,
      "p90Kw": 1072.76,
      "actualKw": 979.46,
      "absErrorKw": 15.48
    },
    {
      "timestampUtc": "2026-01-09T13:00:00Z",
      "pointKw": 968.93,
      "p90Kw": 1065.82,
      "actualKw": 973.12,
      "absErrorKw": 1.47
    },
    {
      "timestampUtc": "2026-01-09T14:00:00Z",
      "pointKw": 987.83,
      "p90Kw": 1086.62,
      "actualKw": 992.12,
      "absErrorKw": 23.83
    },
    {
      "timestampUtc": "2026-01-09T15:00:00Z",
      "pointKw": 970.69,
      "p90Kw": 1067.76,
      "actualKw": 974.89,
      "absErrorKw": 12.29
    },
    {
      "timestampUtc": "2026-01-09T16:00:00Z",
      "pointKw": 967.3,
      "p90Kw": 1064.03,
      "actualKw": 971.48,
      "absErrorKw": 1.44
    },
    {
      "timestampUtc": "2026-01-09T17:00:00Z",
      "pointKw": 980.2,
      "p90Kw": 1078.22,
      "actualKw": 984.45,
      "absErrorKw": 17.79
    },
    {
      "timestampUtc": "2026-01-09T18:00:00Z",
      "pointKw": 976.45,
      "p90Kw": 1074.1,
      "actualKw": 980.68,
      "absErrorKw": 1.13
    },
    {
      "timestampUtc": "2026-01-09T19:00:00Z",
      "pointKw": 993.48,
      "p90Kw": 1092.82,
      "actualKw": 997.79,
      "absErrorKw": 21.99
    },
    {
      "timestampUtc": "2026-01-09T20:00:00Z",
      "pointKw": 1010.22,
      "p90Kw": 1111.24,
      "actualKw": 1014.61,
      "absErrorKw": 21.79
    },
    {
      "timestampUtc": "2026-01-09T21:00:00Z",
      "pointKw": 1017.74,
      "p90Kw": 1119.51,
      "actualKw": 1022.17,
      "absErrorKw": 12.62
    },
    {
      "timestampUtc": "2026-01-09T22:00:00Z",
      "pointKw": 1018.54,
      "p90Kw": 1120.4,
      "actualKw": 1022.98,
      "absErrorKw": 5.91
    },
    {
      "timestampUtc": "2026-01-09T23:00:00Z",
      "pointKw": 950.18,
      "p90Kw": 1045.2,
      "actualKw": 954.28,
      "absErrorKw": 63.6
    },
    {
      "timestampUtc": "2026-01-10T00:00:00Z",
      "pointKw": 960.83,
      "p90Kw": 1056.91,
      "actualKw": 964.97,
      "absErrorKw": 15.43
    },
    {
      "timestampUtc": "2026-01-10T01:00:00Z",
      "pointKw": 1003.23,
      "p90Kw": 1103.56,
      "actualKw": 1007.6,
      "absErrorKw": 47.41
    },
    {
      "timestampUtc": "2026-01-10T02:00:00Z",
      "pointKw": 974.53,
      "p90Kw": 1071.98,
      "actualKw": 978.74,
      "absErrorKw": 23.83
    },
    {
      "timestampUtc": "2026-01-10T03:00:00Z",
      "pointKw": 999.88,
      "p90Kw": 1099.87,
      "actualKw": 1004.23,
      "absErrorKw": 30.35
    },
    {
      "timestampUtc": "2026-01-10T04:00:00Z",
      "pointKw": 1023.71,
      "p90Kw": 1126.08,
      "actualKw": 1028.17,
      "absErrorKw": 28.95
    },
    {
      "timestampUtc": "2026-01-10T05:00:00Z",
      "pointKw": 1023.02,
      "p90Kw": 1125.32,
      "actualKw": 1027.48,
      "absErrorKw": 4.44
    },
    {
      "timestampUtc": "2026-01-10T06:00:00Z",
      "pointKw": 1021.11,
      "p90Kw": 1123.22,
      "actualKw": 1025.56,
      "absErrorKw": 3.21
    }
  ],
  "januaryDailyMae": [
    {
      "label": "Jan 01",
      "valueKw": 6.68
    },
    {
      "label": "Jan 02",
      "valueKw": 14.49
    },
    {
      "label": "Jan 03",
      "valueKw": 7.78
    },
    {
      "label": "Jan 04",
      "valueKw": 7.6
    },
    {
      "label": "Jan 05",
      "valueKw": 11.44
    },
    {
      "label": "Jan 06",
      "valueKw": 22.08
    },
    {
      "label": "Jan 07",
      "valueKw": 18.57
    },
    {
      "label": "Jan 08",
      "valueKw": 20.82
    },
    {
      "label": "Jan 09",
      "valueKw": 16.7
    },
    {
      "label": "Jan 10",
      "valueKw": 21.95
    }
  ],
  "yearlyPowerSeries": [
    {
      "timestampUtc": "2025-01-01T00:00:00Z",
      "powerKw": 843.25
    },
    {
      "timestampUtc": "2025-01-01T05:00:00Z",
      "powerKw": 876.54
    },
    {
      "timestampUtc": "2025-01-01T10:00:00Z",
      "powerKw": 866.79
    },
    {
      "timestampUtc": "2025-01-01T15:00:00Z",
      "powerKw": 886.38
    },
    {
      "timestampUtc": "2025-01-01T20:00:00Z",
      "powerKw": 891.36
    },
    {
      "timestampUtc": "2025-01-02T01:00:00Z",
      "powerKw": 857.9
    },
    {
      "timestampUtc": "2025-01-02T06:00:00Z",
      "powerKw": 835.74
    },
    {
      "timestampUtc": "2025-01-02T11:00:00Z",
      "powerKw": 794.17
    },
    {
      "timestampUtc": "2025-01-02T16:00:00Z",
      "powerKw": 813.81
    },
    {
      "timestampUtc": "2025-01-02T21:00:00Z",
      "powerKw": 809.25
    },
    {
      "timestampUtc": "2025-01-03T02:00:00Z",
      "powerKw": 778.51
    },
    {
      "timestampUtc": "2025-01-03T07:00:00Z",
      "powerKw": 758.18
    },
    {
      "timestampUtc": "2025-01-03T12:00:00Z",
      "powerKw": 724.2
    },
    {
      "timestampUtc": "2025-01-03T17:00:00Z",
      "powerKw": 765.14
    },
    {
      "timestampUtc": "2025-01-03T22:00:00Z",
      "powerKw": 721.47
    },
    {
      "timestampUtc": "2025-01-04T03:00:00Z",
      "powerKw": 725.59
    },
    {
      "timestampUtc": "2025-01-04T08:00:00Z",
      "powerKw": 750.73
    },
    {
      "timestampUtc": "2025-01-04T13:00:00Z",
      "powerKw": 758.18
    },
    {
      "timestampUtc": "2025-01-04T18:00:00Z",
      "powerKw": 747.03
    },
    {
      "timestampUtc": "2025-01-04T23:00:00Z",
      "powerKw": 773.76
    },
    {
      "timestampUtc": "2025-01-05T04:00:00Z",
      "powerKw": 770.05
    },
    {
      "timestampUtc": "2025-01-05T09:00:00Z",
      "powerKw": 730.89
    },
    {
      "timestampUtc": "2025-01-05T14:00:00Z",
      "powerKw": 944.65
    },
    {
      "timestampUtc": "2025-01-05T19:00:00Z",
      "powerKw": 866.92
    },
    {
      "timestampUtc": "2025-01-06T00:00:00Z",
      "powerKw": 894.54
    },
    {
      "timestampUtc": "2025-01-06T05:00:00Z",
      "powerKw": 1023.66
    },
    {
      "timestampUtc": "2025-01-06T10:00:00Z",
      "powerKw": 918.28
    },
    {
      "timestampUtc": "2025-01-06T15:00:00Z",
      "powerKw": 897.85
    },
    {
      "timestampUtc": "2025-01-06T20:00:00Z",
      "powerKw": 884.32
    },
    {
      "timestampUtc": "2025-01-07T01:00:00Z",
      "powerKw": 837.56
    },
    {
      "timestampUtc": "2025-01-07T06:00:00Z",
      "powerKw": 846.76
    },
    {
      "timestampUtc": "2025-01-07T11:00:00Z",
      "powerKw": 740.01
    },
    {
      "timestampUtc": "2025-01-07T16:00:00Z",
      "powerKw": 633.43
    },
    {
      "timestampUtc": "2025-01-07T21:00:00Z",
      "powerKw": 675.31
    },
    {
      "timestampUtc": "2025-01-08T02:00:00Z",
      "powerKw": 669.36
    },
    {
      "timestampUtc": "2025-01-08T07:00:00Z",
      "powerKw": 668.03
    },
    {
      "timestampUtc": "2025-01-08T12:00:00Z",
      "powerKw": 694.21
    },
    {
      "timestampUtc": "2025-01-08T17:00:00Z",
      "powerKw": 739.72
    },
    {
      "timestampUtc": "2025-01-08T22:00:00Z",
      "powerKw": 729.17
    },
    {
      "timestampUtc": "2025-01-09T03:00:00Z",
      "powerKw": 658.23
    },
    {
      "timestampUtc": "2025-01-09T08:00:00Z",
      "powerKw": 676.11
    },
    {
      "timestampUtc": "2025-01-09T13:00:00Z",
      "powerKw": 673.73
    },
    {
      "timestampUtc": "2025-01-09T18:00:00Z",
      "powerKw": 684.74
    },
    {
      "timestampUtc": "2025-01-09T23:00:00Z",
      "powerKw": 718.07
    },
    {
      "timestampUtc": "2025-01-10T04:00:00Z",
      "powerKw": 655.96
    },
    {
      "timestampUtc": "2025-01-10T09:00:00Z",
      "powerKw": 682.77
    },
    {
      "timestampUtc": "2025-01-10T14:00:00Z",
      "powerKw": 838.16
    },
    {
      "timestampUtc": "2025-01-10T19:00:00Z",
      "powerKw": 994.69
    },
    {
      "timestampUtc": "2025-01-11T00:00:00Z",
      "powerKw": 994.76
    },
    {
      "timestampUtc": "2025-01-11T05:00:00Z",
      "powerKw": 977.31
    },
    {
      "timestampUtc": "2025-01-11T10:00:00Z",
      "powerKw": 994.95
    },
    {
      "timestampUtc": "2025-01-11T15:00:00Z",
      "powerKw": 1037.83
    },
    {
      "timestampUtc": "2025-01-11T20:00:00Z",
      "powerKw": 973.84
    },
    {
      "timestampUtc": "2025-01-12T01:00:00Z",
      "powerKw": 922.49
    },
    {
      "timestampUtc": "2025-01-12T06:00:00Z",
      "powerKw": 893.85
    },
    {
      "timestampUtc": "2025-01-12T11:00:00Z",
      "powerKw": 976.4
    },
    {
      "timestampUtc": "2025-01-12T16:00:00Z",
      "powerKw": 955.49
    },
    {
      "timestampUtc": "2025-01-12T21:00:00Z",
      "powerKw": 880.01
    },
    {
      "timestampUtc": "2025-01-13T02:00:00Z",
      "powerKw": 965.49
    },
    {
      "timestampUtc": "2025-01-13T07:00:00Z",
      "powerKw": 857.31
    },
    {
      "timestampUtc": "2025-01-13T12:00:00Z",
      "powerKw": 994.71
    },
    {
      "timestampUtc": "2025-01-13T17:00:00Z",
      "powerKw": 949.17
    },
    {
      "timestampUtc": "2025-01-13T22:00:00Z",
      "powerKw": 923.2
    },
    {
      "timestampUtc": "2025-01-14T03:00:00Z",
      "powerKw": 906.29
    },
    {
      "timestampUtc": "2025-01-14T08:00:00Z",
      "powerKw": 895.14
    },
    {
      "timestampUtc": "2025-01-14T13:00:00Z",
      "powerKw": 914.6
    },
    {
      "timestampUtc": "2025-01-14T18:00:00Z",
      "powerKw": 900.79
    },
    {
      "timestampUtc": "2025-01-14T23:00:00Z",
      "powerKw": 1057.5
    },
    {
      "timestampUtc": "2025-01-15T04:00:00Z",
      "powerKw": 1070.81
    },
    {
      "timestampUtc": "2025-01-15T09:00:00Z",
      "powerKw": 891.35
    },
    {
      "timestampUtc": "2025-01-15T14:00:00Z",
      "powerKw": 906.99
    },
    {
      "timestampUtc": "2025-01-15T19:00:00Z",
      "powerKw": 861.62
    },
    {
      "timestampUtc": "2025-01-16T00:00:00Z",
      "powerKw": 906.22
    },
    {
      "timestampUtc": "2025-01-16T05:00:00Z",
      "powerKw": 896.32
    },
    {
      "timestampUtc": "2025-01-16T10:00:00Z",
      "powerKw": 744.28
    },
    {
      "timestampUtc": "2025-01-16T15:00:00Z",
      "powerKw": 695.9
    },
    {
      "timestampUtc": "2025-01-16T20:00:00Z",
      "powerKw": 747.97
    },
    {
      "timestampUtc": "2025-01-17T01:00:00Z",
      "powerKw": 753.09
    },
    {
      "timestampUtc": "2025-01-17T06:00:00Z",
      "powerKw": 751.39
    },
    {
      "timestampUtc": "2025-01-17T11:00:00Z",
      "powerKw": 763.65
    },
    {
      "timestampUtc": "2025-01-17T16:00:00Z",
      "powerKw": 875.06
    },
    {
      "timestampUtc": "2025-01-17T21:00:00Z",
      "powerKw": 831.39
    },
    {
      "timestampUtc": "2025-01-18T02:00:00Z",
      "powerKw": 759.11
    },
    {
      "timestampUtc": "2025-01-18T07:00:00Z",
      "powerKw": 805.58
    },
    {
      "timestampUtc": "2025-01-18T12:00:00Z",
      "powerKw": 740.36
    },
    {
      "timestampUtc": "2025-01-18T17:00:00Z",
      "powerKw": 747.01
    },
    {
      "timestampUtc": "2025-01-18T22:00:00Z",
      "powerKw": 706.36
    },
    {
      "timestampUtc": "2025-01-19T03:00:00Z",
      "powerKw": 703.87
    },
    {
      "timestampUtc": "2025-01-19T08:00:00Z",
      "powerKw": 689.52
    },
    {
      "timestampUtc": "2025-01-19T13:00:00Z",
      "powerKw": 722.98
    },
    {
      "timestampUtc": "2025-01-19T18:00:00Z",
      "powerKw": 690.96
    },
    {
      "timestampUtc": "2025-01-19T23:00:00Z",
      "powerKw": 659.8
    },
    {
      "timestampUtc": "2025-01-20T04:00:00Z",
      "powerKw": 674.84
    },
    {
      "timestampUtc": "2025-01-20T09:00:00Z",
      "powerKw": 670.43
    },
    {
      "timestampUtc": "2025-01-20T14:00:00Z",
      "powerKw": 655.84
    },
    {
      "timestampUtc": "2025-01-20T19:00:00Z",
      "powerKw": 674.32
    },
    {
      "timestampUtc": "2025-01-21T00:00:00Z",
      "powerKw": 690.71
    },
    {
      "timestampUtc": "2025-01-21T05:00:00Z",
      "powerKw": 691.63
    },
    {
      "timestampUtc": "2025-01-21T10:00:00Z",
      "powerKw": 697.16
    },
    {
      "timestampUtc": "2025-01-21T15:00:00Z",
      "powerKw": 742.21
    },
    {
      "timestampUtc": "2025-01-21T20:00:00Z",
      "powerKw": 740.27
    },
    {
      "timestampUtc": "2025-01-22T01:00:00Z",
      "powerKw": 682.25
    },
    {
      "timestampUtc": "2025-01-22T06:00:00Z",
      "powerKw": 640.17
    },
    {
      "timestampUtc": "2025-01-22T11:00:00Z",
      "powerKw": 650.72
    },
    {
      "timestampUtc": "2025-01-22T16:00:00Z",
      "powerKw": 773.14
    },
    {
      "timestampUtc": "2025-01-22T21:00:00Z",
      "powerKw": 727.12
    },
    {
      "timestampUtc": "2025-01-23T02:00:00Z",
      "powerKw": 630.13
    },
    {
      "timestampUtc": "2025-01-23T07:00:00Z",
      "powerKw": 590.54
    },
    {
      "timestampUtc": "2025-01-23T12:00:00Z",
      "powerKw": 699.54
    },
    {
      "timestampUtc": "2025-01-23T17:00:00Z",
      "powerKw": 772.87
    },
    {
      "timestampUtc": "2025-01-23T22:00:00Z",
      "powerKw": 783.2
    },
    {
      "timestampUtc": "2025-01-24T03:00:00Z",
      "powerKw": 777.82
    },
    {
      "timestampUtc": "2025-01-24T08:00:00Z",
      "powerKw": 911.34
    },
    {
      "timestampUtc": "2025-01-24T13:00:00Z",
      "powerKw": 978.42
    },
    {
      "timestampUtc": "2025-01-24T18:00:00Z",
      "powerKw": 1054.2
    },
    {
      "timestampUtc": "2025-01-24T23:00:00Z",
      "powerKw": 1023.43
    },
    {
      "timestampUtc": "2025-01-25T04:00:00Z",
      "powerKw": 1007.97
    },
    {
      "timestampUtc": "2025-01-25T09:00:00Z",
      "powerKw": 1011.55
    },
    {
      "timestampUtc": "2025-01-25T14:00:00Z",
      "powerKw": 1012.35
    },
    {
      "timestampUtc": "2025-01-25T19:00:00Z",
      "powerKw": 1000.83
    },
    {
      "timestampUtc": "2025-01-26T00:00:00Z",
      "powerKw": 1013.91
    },
    {
      "timestampUtc": "2025-01-26T05:00:00Z",
      "powerKw": 1024.42
    },
    {
      "timestampUtc": "2025-01-26T10:00:00Z",
      "powerKw": 1098.31
    },
    {
      "timestampUtc": "2025-01-26T15:00:00Z",
      "powerKw": 1032.41
    },
    {
      "timestampUtc": "2025-01-26T20:00:00Z",
      "powerKw": 1072.9
    },
    {
      "timestampUtc": "2025-01-27T01:00:00Z",
      "powerKw": 1127.21
    },
    {
      "timestampUtc": "2025-01-27T06:00:00Z",
      "powerKw": 1169.76
    },
    {
      "timestampUtc": "2025-01-27T11:00:00Z",
      "powerKw": 1136.65
    },
    {
      "timestampUtc": "2025-01-27T16:00:00Z",
      "powerKw": 1126.32
    },
    {
      "timestampUtc": "2025-01-27T21:00:00Z",
      "powerKw": 1016.58
    },
    {
      "timestampUtc": "2025-01-28T02:00:00Z",
      "powerKw": 1041.72
    },
    {
      "timestampUtc": "2025-01-28T07:00:00Z",
      "powerKw": 982.1
    },
    {
      "timestampUtc": "2025-01-28T12:00:00Z",
      "powerKw": 915.59
    },
    {
      "timestampUtc": "2025-01-28T17:00:00Z",
      "powerKw": 892.41
    },
    {
      "timestampUtc": "2025-01-28T22:00:00Z",
      "powerKw": 900.46
    },
    {
      "timestampUtc": "2025-01-29T03:00:00Z",
      "powerKw": 898.9
    },
    {
      "timestampUtc": "2025-01-29T08:00:00Z",
      "powerKw": 868.54
    },
    {
      "timestampUtc": "2025-01-29T13:00:00Z",
      "powerKw": 904.24
    },
    {
      "timestampUtc": "2025-01-29T18:00:00Z",
      "powerKw": 918.06
    },
    {
      "timestampUtc": "2025-01-29T23:00:00Z",
      "powerKw": 980.74
    },
    {
      "timestampUtc": "2025-01-30T04:00:00Z",
      "powerKw": 980.46
    },
    {
      "timestampUtc": "2025-01-30T09:00:00Z",
      "powerKw": 1049.54
    },
    {
      "timestampUtc": "2025-01-30T14:00:00Z",
      "powerKw": 1099.21
    },
    {
      "timestampUtc": "2025-01-30T19:00:00Z",
      "powerKw": 1072.69
    },
    {
      "timestampUtc": "2025-01-31T00:00:00Z",
      "powerKw": 1011.79
    },
    {
      "timestampUtc": "2025-01-31T05:00:00Z",
      "powerKw": 955.85
    },
    {
      "timestampUtc": "2025-01-31T10:00:00Z",
      "powerKw": 1082.1
    },
    {
      "timestampUtc": "2025-01-31T15:00:00Z",
      "powerKw": 1128.35
    },
    {
      "timestampUtc": "2025-01-31T20:00:00Z",
      "powerKw": 1079.61
    },
    {
      "timestampUtc": "2025-02-01T01:00:00Z",
      "powerKw": 1079.87
    },
    {
      "timestampUtc": "2025-02-01T06:00:00Z",
      "powerKw": 1106.39
    },
    {
      "timestampUtc": "2025-02-01T11:00:00Z",
      "powerKw": 1078.59
    },
    {
      "timestampUtc": "2025-02-01T16:00:00Z",
      "powerKw": 1148.69
    },
    {
      "timestampUtc": "2025-02-01T21:00:00Z",
      "powerKw": 1128.64
    },
    {
      "timestampUtc": "2025-02-02T02:00:00Z",
      "powerKw": 1114.97
    },
    {
      "timestampUtc": "2025-02-02T07:00:00Z",
      "powerKw": 1024.84
    },
    {
      "timestampUtc": "2025-02-02T12:00:00Z",
      "powerKw": 1066.32
    },
    {
      "timestampUtc": "2025-02-02T17:00:00Z",
      "powerKw": 1085.79
    },
    {
      "timestampUtc": "2025-02-02T22:00:00Z",
      "powerKw": 1065.85
    },
    {
      "timestampUtc": "2025-02-03T03:00:00Z",
      "powerKw": 1010.62
    },
    {
      "timestampUtc": "2025-02-03T08:00:00Z",
      "powerKw": 1064.18
    },
    {
      "timestampUtc": "2025-02-03T13:00:00Z",
      "powerKw": 1226.13
    },
    {
      "timestampUtc": "2025-02-03T18:00:00Z",
      "powerKw": 1234.66
    },
    {
      "timestampUtc": "2025-02-03T23:00:00Z",
      "powerKw": 1164.0
    },
    {
      "timestampUtc": "2025-02-04T04:00:00Z",
      "powerKw": 1122.73
    },
    {
      "timestampUtc": "2025-02-04T09:00:00Z",
      "powerKw": 1149.45
    },
    {
      "timestampUtc": "2025-02-04T14:00:00Z",
      "powerKw": 1157.15
    },
    {
      "timestampUtc": "2025-02-04T19:00:00Z",
      "powerKw": 1213.1
    },
    {
      "timestampUtc": "2025-02-05T00:00:00Z",
      "powerKw": 1219.78
    },
    {
      "timestampUtc": "2025-02-05T05:00:00Z",
      "powerKw": 1268.54
    },
    {
      "timestampUtc": "2025-02-05T10:00:00Z",
      "powerKw": 1391.64
    },
    {
      "timestampUtc": "2025-02-05T15:00:00Z",
      "powerKw": 1594.15
    },
    {
      "timestampUtc": "2025-02-05T20:00:00Z",
      "powerKw": 1545.67
    },
    {
      "timestampUtc": "2025-02-06T01:00:00Z",
      "powerKw": 1539.4
    },
    {
      "timestampUtc": "2025-02-06T06:00:00Z",
      "powerKw": 1427.6
    },
    {
      "timestampUtc": "2025-02-06T11:00:00Z",
      "powerKw": 1511.96
    },
    {
      "timestampUtc": "2025-02-06T16:00:00Z",
      "powerKw": 1427.45
    },
    {
      "timestampUtc": "2025-02-06T21:00:00Z",
      "powerKw": 1415.61
    },
    {
      "timestampUtc": "2025-02-07T02:00:00Z",
      "powerKw": 1288.75
    },
    {
      "timestampUtc": "2025-02-07T07:00:00Z",
      "powerKw": 1252.79
    },
    {
      "timestampUtc": "2025-02-07T12:00:00Z",
      "powerKw": 1445.34
    },
    {
      "timestampUtc": "2025-02-07T17:00:00Z",
      "powerKw": 1465.08
    },
    {
      "timestampUtc": "2025-02-07T22:00:00Z",
      "powerKw": 1444.67
    },
    {
      "timestampUtc": "2025-02-08T03:00:00Z",
      "powerKw": 1389.77
    },
    {
      "timestampUtc": "2025-02-08T08:00:00Z",
      "powerKw": 1440.01
    },
    {
      "timestampUtc": "2025-02-08T13:00:00Z",
      "powerKw": 1614.79
    },
    {
      "timestampUtc": "2025-02-08T18:00:00Z",
      "powerKw": 1702.69
    },
    {
      "timestampUtc": "2025-02-08T23:00:00Z",
      "powerKw": 1642.95
    },
    {
      "timestampUtc": "2025-02-09T04:00:00Z",
      "powerKw": 1498.8
    },
    {
      "timestampUtc": "2025-02-09T09:00:00Z",
      "powerKw": 1419.68
    },
    {
      "timestampUtc": "2025-02-09T14:00:00Z",
      "powerKw": 1438.98
    },
    {
      "timestampUtc": "2025-02-09T19:00:00Z",
      "powerKw": 1402.31
    },
    {
      "timestampUtc": "2025-02-10T00:00:00Z",
      "powerKw": 1347.17
    },
    {
      "timestampUtc": "2025-02-10T05:00:00Z",
      "powerKw": 1352.77
    },
    {
      "timestampUtc": "2025-02-10T10:00:00Z",
      "powerKw": 1336.28
    },
    {
      "timestampUtc": "2025-02-10T15:00:00Z",
      "powerKw": 1351.37
    },
    {
      "timestampUtc": "2025-02-10T20:00:00Z",
      "powerKw": 1300.43
    },
    {
      "timestampUtc": "2025-02-11T01:00:00Z",
      "powerKw": 1220.48
    },
    {
      "timestampUtc": "2025-02-11T06:00:00Z",
      "powerKw": 1020.65
    },
    {
      "timestampUtc": "2025-02-11T11:00:00Z",
      "powerKw": 953.3
    },
    {
      "timestampUtc": "2025-02-11T16:00:00Z",
      "powerKw": 876.3
    },
    {
      "timestampUtc": "2025-02-11T21:00:00Z",
      "powerKw": 728.32
    },
    {
      "timestampUtc": "2025-02-12T02:00:00Z",
      "powerKw": 709.96
    },
    {
      "timestampUtc": "2025-02-12T07:00:00Z",
      "powerKw": 681.3
    },
    {
      "timestampUtc": "2025-02-12T12:00:00Z",
      "powerKw": 754.7
    },
    {
      "timestampUtc": "2025-02-12T17:00:00Z",
      "powerKw": 756.96
    },
    {
      "timestampUtc": "2025-02-12T22:00:00Z",
      "powerKw": 702.8
    },
    {
      "timestampUtc": "2025-02-13T03:00:00Z",
      "powerKw": 660.02
    },
    {
      "timestampUtc": "2025-02-13T08:00:00Z",
      "powerKw": 687.08
    },
    {
      "timestampUtc": "2025-02-13T13:00:00Z",
      "powerKw": 757.5
    },
    {
      "timestampUtc": "2025-02-13T18:00:00Z",
      "powerKw": 754.45
    },
    {
      "timestampUtc": "2025-02-13T23:00:00Z",
      "powerKw": 730.41
    },
    {
      "timestampUtc": "2025-02-14T04:00:00Z",
      "powerKw": 669.88
    },
    {
      "timestampUtc": "2025-02-14T09:00:00Z",
      "powerKw": 735.11
    },
    {
      "timestampUtc": "2025-02-14T14:00:00Z",
      "powerKw": 772.08
    },
    {
      "timestampUtc": "2025-02-14T19:00:00Z",
      "powerKw": 791.6
    },
    {
      "timestampUtc": "2025-02-15T00:00:00Z",
      "powerKw": 829.05
    },
    {
      "timestampUtc": "2025-02-15T05:00:00Z",
      "powerKw": 858.06
    },
    {
      "timestampUtc": "2025-02-15T10:00:00Z",
      "powerKw": 875.62
    },
    {
      "timestampUtc": "2025-02-15T15:00:00Z",
      "powerKw": 892.03
    },
    {
      "timestampUtc": "2025-02-15T20:00:00Z",
      "powerKw": 826.4
    },
    {
      "timestampUtc": "2025-02-16T01:00:00Z",
      "powerKw": 827.19
    },
    {
      "timestampUtc": "2025-02-16T06:00:00Z",
      "powerKw": 807.88
    },
    {
      "timestampUtc": "2025-02-16T11:00:00Z",
      "powerKw": 853.26
    },
    {
      "timestampUtc": "2025-02-16T16:00:00Z",
      "powerKw": 909.12
    },
    {
      "timestampUtc": "2025-02-16T21:00:00Z",
      "powerKw": 786.43
    },
    {
      "timestampUtc": "2025-02-17T02:00:00Z",
      "powerKw": 793.63
    },
    {
      "timestampUtc": "2025-02-17T07:00:00Z",
      "powerKw": 768.14
    },
    {
      "timestampUtc": "2025-02-17T12:00:00Z",
      "powerKw": 880.02
    },
    {
      "timestampUtc": "2025-02-17T17:00:00Z",
      "powerKw": 774.08
    },
    {
      "timestampUtc": "2025-02-17T22:00:00Z",
      "powerKw": 741.72
    },
    {
      "timestampUtc": "2025-02-18T03:00:00Z",
      "powerKw": 793.05
    },
    {
      "timestampUtc": "2025-02-18T08:00:00Z",
      "powerKw": 809.87
    },
    {
      "timestampUtc": "2025-02-18T13:00:00Z",
      "powerKw": 941.8
    },
    {
      "timestampUtc": "2025-02-18T18:00:00Z",
      "powerKw": 859.98
    },
    {
      "timestampUtc": "2025-02-18T23:00:00Z",
      "powerKw": 784.88
    },
    {
      "timestampUtc": "2025-02-19T04:00:00Z",
      "powerKw": 709.66
    },
    {
      "timestampUtc": "2025-02-19T09:00:00Z",
      "powerKw": 671.33
    },
    {
      "timestampUtc": "2025-02-19T14:00:00Z",
      "powerKw": 732.6
    },
    {
      "timestampUtc": "2025-02-19T19:00:00Z",
      "powerKw": 668.97
    },
    {
      "timestampUtc": "2025-02-20T00:00:00Z",
      "powerKw": 635.98
    },
    {
      "timestampUtc": "2025-02-20T05:00:00Z",
      "powerKw": 673.5
    },
    {
      "timestampUtc": "2025-02-20T10:00:00Z",
      "powerKw": 722.25
    },
    {
      "timestampUtc": "2025-02-20T15:00:00Z",
      "powerKw": 773.3
    },
    {
      "timestampUtc": "2025-02-20T20:00:00Z",
      "powerKw": 787.68
    },
    {
      "timestampUtc": "2025-02-21T01:00:00Z",
      "powerKw": 791.47
    },
    {
      "timestampUtc": "2025-02-21T06:00:00Z",
      "powerKw": 758.16
    },
    {
      "timestampUtc": "2025-02-21T11:00:00Z",
      "powerKw": 804.17
    },
    {
      "timestampUtc": "2025-02-21T16:00:00Z",
      "powerKw": 829.69
    },
    {
      "timestampUtc": "2025-02-21T21:00:00Z",
      "powerKw": 767.74
    },
    {
      "timestampUtc": "2025-02-22T02:00:00Z",
      "powerKw": 843.31
    },
    {
      "timestampUtc": "2025-02-22T07:00:00Z",
      "powerKw": 816.52
    },
    {
      "timestampUtc": "2025-02-22T12:00:00Z",
      "powerKw": 884.93
    },
    {
      "timestampUtc": "2025-02-22T17:00:00Z",
      "powerKw": 973.76
    },
    {
      "timestampUtc": "2025-02-22T22:00:00Z",
      "powerKw": 1018.47
    },
    {
      "timestampUtc": "2025-02-23T03:00:00Z",
      "powerKw": 1003.2
    },
    {
      "timestampUtc": "2025-02-23T08:00:00Z",
      "powerKw": 977.64
    },
    {
      "timestampUtc": "2025-02-23T13:00:00Z",
      "powerKw": 1051.19
    },
    {
      "timestampUtc": "2025-02-23T18:00:00Z",
      "powerKw": 971.27
    },
    {
      "timestampUtc": "2025-02-23T23:00:00Z",
      "powerKw": 922.42
    },
    {
      "timestampUtc": "2025-02-24T04:00:00Z",
      "powerKw": 953.83
    },
    {
      "timestampUtc": "2025-02-24T09:00:00Z",
      "powerKw": 1024.38
    },
    {
      "timestampUtc": "2025-02-24T14:00:00Z",
      "powerKw": 976.58
    },
    {
      "timestampUtc": "2025-02-24T19:00:00Z",
      "powerKw": 1020.94
    },
    {
      "timestampUtc": "2025-02-25T00:00:00Z",
      "powerKw": 874.6
    },
    {
      "timestampUtc": "2025-02-25T05:00:00Z",
      "powerKw": 862.8
    },
    {
      "timestampUtc": "2025-02-25T10:00:00Z",
      "powerKw": 929.21
    },
    {
      "timestampUtc": "2025-02-25T15:00:00Z",
      "powerKw": 922.78
    },
    {
      "timestampUtc": "2025-02-25T20:00:00Z",
      "powerKw": 834.96
    },
    {
      "timestampUtc": "2025-02-26T01:00:00Z",
      "powerKw": 772.06
    },
    {
      "timestampUtc": "2025-02-26T06:00:00Z",
      "powerKw": 778.08
    },
    {
      "timestampUtc": "2025-02-26T11:00:00Z",
      "powerKw": 772.89
    },
    {
      "timestampUtc": "2025-02-26T16:00:00Z",
      "powerKw": 757.54
    },
    {
      "timestampUtc": "2025-02-26T21:00:00Z",
      "powerKw": 726.47
    },
    {
      "timestampUtc": "2025-02-27T02:00:00Z",
      "powerKw": 700.69
    },
    {
      "timestampUtc": "2025-02-27T07:00:00Z",
      "powerKw": 720.84
    },
    {
      "timestampUtc": "2025-02-27T12:00:00Z",
      "powerKw": 771.89
    },
    {
      "timestampUtc": "2025-02-27T17:00:00Z",
      "powerKw": 764.53
    },
    {
      "timestampUtc": "2025-02-27T22:00:00Z",
      "powerKw": 732.89
    },
    {
      "timestampUtc": "2025-02-28T03:00:00Z",
      "powerKw": 716.01
    },
    {
      "timestampUtc": "2025-02-28T08:00:00Z",
      "powerKw": 745.79
    },
    {
      "timestampUtc": "2025-02-28T13:00:00Z",
      "powerKw": 822.36
    },
    {
      "timestampUtc": "2025-02-28T18:00:00Z",
      "powerKw": 787.54
    },
    {
      "timestampUtc": "2025-02-28T23:00:00Z",
      "powerKw": 781.27
    },
    {
      "timestampUtc": "2025-03-01T04:00:00Z",
      "powerKw": 794.29
    },
    {
      "timestampUtc": "2025-03-01T09:00:00Z",
      "powerKw": 828.72
    },
    {
      "timestampUtc": "2025-03-01T14:00:00Z",
      "powerKw": 988.83
    },
    {
      "timestampUtc": "2025-03-01T19:00:00Z",
      "powerKw": 929.05
    },
    {
      "timestampUtc": "2025-03-02T00:00:00Z",
      "powerKw": 770.11
    },
    {
      "timestampUtc": "2025-03-02T05:00:00Z",
      "powerKw": 711.55
    },
    {
      "timestampUtc": "2025-03-02T10:00:00Z",
      "powerKw": 737.31
    },
    {
      "timestampUtc": "2025-03-02T15:00:00Z",
      "powerKw": 721.25
    },
    {
      "timestampUtc": "2025-03-02T20:00:00Z",
      "powerKw": 686.78
    },
    {
      "timestampUtc": "2025-03-03T01:00:00Z",
      "powerKw": 674.73
    },
    {
      "timestampUtc": "2025-03-03T06:00:00Z",
      "powerKw": 607.37
    },
    {
      "timestampUtc": "2025-03-03T11:00:00Z",
      "powerKw": 687.14
    },
    {
      "timestampUtc": "2025-03-03T16:00:00Z",
      "powerKw": 677.51
    },
    {
      "timestampUtc": "2025-03-03T21:00:00Z",
      "powerKw": 636.06
    },
    {
      "timestampUtc": "2025-03-04T02:00:00Z",
      "powerKw": 678.89
    },
    {
      "timestampUtc": "2025-03-04T07:00:00Z",
      "powerKw": 720.33
    },
    {
      "timestampUtc": "2025-03-04T12:00:00Z",
      "powerKw": 915.43
    },
    {
      "timestampUtc": "2025-03-04T17:00:00Z",
      "powerKw": 973.98
    },
    {
      "timestampUtc": "2025-03-04T22:00:00Z",
      "powerKw": 925.11
    },
    {
      "timestampUtc": "2025-03-05T03:00:00Z",
      "powerKw": 897.42
    },
    {
      "timestampUtc": "2025-03-05T08:00:00Z",
      "powerKw": 913.8
    },
    {
      "timestampUtc": "2025-03-05T13:00:00Z",
      "powerKw": 885.91
    },
    {
      "timestampUtc": "2025-03-05T18:00:00Z",
      "powerKw": 850.23
    },
    {
      "timestampUtc": "2025-03-05T23:00:00Z",
      "powerKw": 765.56
    },
    {
      "timestampUtc": "2025-03-06T04:00:00Z",
      "powerKw": 774.0
    },
    {
      "timestampUtc": "2025-03-06T09:00:00Z",
      "powerKw": 838.71
    },
    {
      "timestampUtc": "2025-03-06T14:00:00Z",
      "powerKw": 1035.32
    },
    {
      "timestampUtc": "2025-03-06T19:00:00Z",
      "powerKw": 912.3
    },
    {
      "timestampUtc": "2025-03-07T00:00:00Z",
      "powerKw": 790.46
    },
    {
      "timestampUtc": "2025-03-07T05:00:00Z",
      "powerKw": 776.05
    },
    {
      "timestampUtc": "2025-03-07T10:00:00Z",
      "powerKw": 919.74
    },
    {
      "timestampUtc": "2025-03-07T15:00:00Z",
      "powerKw": 1032.04
    },
    {
      "timestampUtc": "2025-03-07T20:00:00Z",
      "powerKw": 772.12
    },
    {
      "timestampUtc": "2025-03-08T01:00:00Z",
      "powerKw": 548.61
    },
    {
      "timestampUtc": "2025-03-08T06:00:00Z",
      "powerKw": 566.72
    },
    {
      "timestampUtc": "2025-03-08T11:00:00Z",
      "powerKw": 703.64
    },
    {
      "timestampUtc": "2025-03-08T16:00:00Z",
      "powerKw": 771.56
    },
    {
      "timestampUtc": "2025-03-08T21:00:00Z",
      "powerKw": 645.6
    },
    {
      "timestampUtc": "2025-03-09T02:00:00Z",
      "powerKw": 594.4
    },
    {
      "timestampUtc": "2025-03-09T07:00:00Z",
      "powerKw": 599.35
    },
    {
      "timestampUtc": "2025-03-09T12:00:00Z",
      "powerKw": 817.09
    },
    {
      "timestampUtc": "2025-03-09T17:00:00Z",
      "powerKw": 731.56
    },
    {
      "timestampUtc": "2025-03-09T22:00:00Z",
      "powerKw": 609.26
    },
    {
      "timestampUtc": "2025-03-10T03:00:00Z",
      "powerKw": 611.25
    },
    {
      "timestampUtc": "2025-03-10T08:00:00Z",
      "powerKw": 626.74
    },
    {
      "timestampUtc": "2025-03-10T13:00:00Z",
      "powerKw": 663.71
    },
    {
      "timestampUtc": "2025-03-10T18:00:00Z",
      "powerKw": 689.41
    },
    {
      "timestampUtc": "2025-03-10T23:00:00Z",
      "powerKw": 647.82
    },
    {
      "timestampUtc": "2025-03-11T04:00:00Z",
      "powerKw": 623.7
    },
    {
      "timestampUtc": "2025-03-11T09:00:00Z",
      "powerKw": 635.94
    },
    {
      "timestampUtc": "2025-03-11T14:00:00Z",
      "powerKw": 663.26
    },
    {
      "timestampUtc": "2025-03-11T19:00:00Z",
      "powerKw": 764.06
    },
    {
      "timestampUtc": "2025-03-12T00:00:00Z",
      "powerKw": 674.31
    },
    {
      "timestampUtc": "2025-03-12T05:00:00Z",
      "powerKw": 756.98
    },
    {
      "timestampUtc": "2025-03-12T10:00:00Z",
      "powerKw": 746.37
    },
    {
      "timestampUtc": "2025-03-12T15:00:00Z",
      "powerKw": 805.13
    },
    {
      "timestampUtc": "2025-03-12T20:00:00Z",
      "powerKw": 792.78
    },
    {
      "timestampUtc": "2025-03-13T01:00:00Z",
      "powerKw": 742.4
    },
    {
      "timestampUtc": "2025-03-13T06:00:00Z",
      "powerKw": 727.09
    },
    {
      "timestampUtc": "2025-03-13T11:00:00Z",
      "powerKw": 816.32
    },
    {
      "timestampUtc": "2025-03-13T16:00:00Z",
      "powerKw": 783.77
    },
    {
      "timestampUtc": "2025-03-13T21:00:00Z",
      "powerKw": 726.28
    },
    {
      "timestampUtc": "2025-03-14T02:00:00Z",
      "powerKw": 683.89
    },
    {
      "timestampUtc": "2025-03-14T07:00:00Z",
      "powerKw": 652.34
    },
    {
      "timestampUtc": "2025-03-14T12:00:00Z",
      "powerKw": 764.51
    },
    {
      "timestampUtc": "2025-03-14T17:00:00Z",
      "powerKw": 841.16
    },
    {
      "timestampUtc": "2025-03-14T22:00:00Z",
      "powerKw": 808.39
    },
    {
      "timestampUtc": "2025-03-15T03:00:00Z",
      "powerKw": 887.05
    },
    {
      "timestampUtc": "2025-03-15T08:00:00Z",
      "powerKw": 875.48
    },
    {
      "timestampUtc": "2025-03-15T13:00:00Z",
      "powerKw": 966.54
    },
    {
      "timestampUtc": "2025-03-15T18:00:00Z",
      "powerKw": 858.1
    },
    {
      "timestampUtc": "2025-03-15T23:00:00Z",
      "powerKw": 760.57
    },
    {
      "timestampUtc": "2025-03-16T04:00:00Z",
      "powerKw": 736.67
    },
    {
      "timestampUtc": "2025-03-16T09:00:00Z",
      "powerKw": 801.0
    },
    {
      "timestampUtc": "2025-03-16T14:00:00Z",
      "powerKw": 855.68
    },
    {
      "timestampUtc": "2025-03-16T19:00:00Z",
      "powerKw": 772.54
    },
    {
      "timestampUtc": "2025-03-17T00:00:00Z",
      "powerKw": 725.8
    },
    {
      "timestampUtc": "2025-03-17T05:00:00Z",
      "powerKw": 696.8
    },
    {
      "timestampUtc": "2025-03-17T10:00:00Z",
      "powerKw": 817.9
    },
    {
      "timestampUtc": "2025-03-17T15:00:00Z",
      "powerKw": 741.63
    },
    {
      "timestampUtc": "2025-03-17T20:00:00Z",
      "powerKw": 678.71
    },
    {
      "timestampUtc": "2025-03-18T01:00:00Z",
      "powerKw": 630.92
    },
    {
      "timestampUtc": "2025-03-18T06:00:00Z",
      "powerKw": 774.22
    },
    {
      "timestampUtc": "2025-03-18T11:00:00Z",
      "powerKw": 1003.02
    },
    {
      "timestampUtc": "2025-03-18T16:00:00Z",
      "powerKw": 1046.88
    },
    {
      "timestampUtc": "2025-03-18T21:00:00Z",
      "powerKw": 909.32
    },
    {
      "timestampUtc": "2025-03-19T02:00:00Z",
      "powerKw": 816.72
    },
    {
      "timestampUtc": "2025-03-19T07:00:00Z",
      "powerKw": 807.43
    },
    {
      "timestampUtc": "2025-03-19T12:00:00Z",
      "powerKw": 912.9
    },
    {
      "timestampUtc": "2025-03-19T17:00:00Z",
      "powerKw": 697.86
    },
    {
      "timestampUtc": "2025-03-19T22:00:00Z",
      "powerKw": 598.58
    },
    {
      "timestampUtc": "2025-03-20T03:00:00Z",
      "powerKw": 590.83
    },
    {
      "timestampUtc": "2025-03-20T08:00:00Z",
      "powerKw": 574.19
    },
    {
      "timestampUtc": "2025-03-20T13:00:00Z",
      "powerKw": 935.98
    },
    {
      "timestampUtc": "2025-03-20T18:00:00Z",
      "powerKw": 846.99
    },
    {
      "timestampUtc": "2025-03-20T23:00:00Z",
      "powerKw": 805.59
    },
    {
      "timestampUtc": "2025-03-21T04:00:00Z",
      "powerKw": 812.72
    },
    {
      "timestampUtc": "2025-03-21T09:00:00Z",
      "powerKw": 867.98
    },
    {
      "timestampUtc": "2025-03-21T14:00:00Z",
      "powerKw": 1076.7
    },
    {
      "timestampUtc": "2025-03-21T19:00:00Z",
      "powerKw": 1128.55
    },
    {
      "timestampUtc": "2025-03-22T00:00:00Z",
      "powerKw": 1026.24
    },
    {
      "timestampUtc": "2025-03-22T05:00:00Z",
      "powerKw": 1014.6
    },
    {
      "timestampUtc": "2025-03-22T10:00:00Z",
      "powerKw": 1060.34
    },
    {
      "timestampUtc": "2025-03-22T15:00:00Z",
      "powerKw": 1187.49
    },
    {
      "timestampUtc": "2025-03-22T20:00:00Z",
      "powerKw": 954.09
    },
    {
      "timestampUtc": "2025-03-23T01:00:00Z",
      "powerKw": 950.93
    },
    {
      "timestampUtc": "2025-03-23T06:00:00Z",
      "powerKw": 909.68
    },
    {
      "timestampUtc": "2025-03-23T11:00:00Z",
      "powerKw": 993.31
    },
    {
      "timestampUtc": "2025-03-23T16:00:00Z",
      "powerKw": 1193.55
    },
    {
      "timestampUtc": "2025-03-23T21:00:00Z",
      "powerKw": 1123.83
    },
    {
      "timestampUtc": "2025-03-24T02:00:00Z",
      "powerKw": 1033.03
    },
    {
      "timestampUtc": "2025-03-24T07:00:00Z",
      "powerKw": 964.52
    },
    {
      "timestampUtc": "2025-03-24T12:00:00Z",
      "powerKw": 1067.52
    },
    {
      "timestampUtc": "2025-03-24T17:00:00Z",
      "powerKw": 1079.48
    },
    {
      "timestampUtc": "2025-03-24T22:00:00Z",
      "powerKw": 919.81
    },
    {
      "timestampUtc": "2025-03-25T03:00:00Z",
      "powerKw": 864.03
    },
    {
      "timestampUtc": "2025-03-25T08:00:00Z",
      "powerKw": 779.84
    },
    {
      "timestampUtc": "2025-03-25T13:00:00Z",
      "powerKw": 995.66
    },
    {
      "timestampUtc": "2025-03-25T18:00:00Z",
      "powerKw": 944.66
    },
    {
      "timestampUtc": "2025-03-25T23:00:00Z",
      "powerKw": 705.34
    },
    {
      "timestampUtc": "2025-03-26T04:00:00Z",
      "powerKw": 682.92
    },
    {
      "timestampUtc": "2025-03-26T09:00:00Z",
      "powerKw": 573.71
    },
    {
      "timestampUtc": "2025-03-26T14:00:00Z",
      "powerKw": 608.83
    },
    {
      "timestampUtc": "2025-03-26T19:00:00Z",
      "powerKw": 623.81
    },
    {
      "timestampUtc": "2025-03-27T00:00:00Z",
      "powerKw": 578.44
    },
    {
      "timestampUtc": "2025-03-27T05:00:00Z",
      "powerKw": 598.39
    },
    {
      "timestampUtc": "2025-03-27T10:00:00Z",
      "powerKw": 714.11
    },
    {
      "timestampUtc": "2025-03-27T15:00:00Z",
      "powerKw": 864.79
    },
    {
      "timestampUtc": "2025-03-27T20:00:00Z",
      "powerKw": 756.11
    },
    {
      "timestampUtc": "2025-03-28T01:00:00Z",
      "powerKw": 684.42
    },
    {
      "timestampUtc": "2025-03-28T06:00:00Z",
      "powerKw": 680.2
    },
    {
      "timestampUtc": "2025-03-28T11:00:00Z",
      "powerKw": 872.49
    },
    {
      "timestampUtc": "2025-03-28T16:00:00Z",
      "powerKw": 907.39
    },
    {
      "timestampUtc": "2025-03-28T21:00:00Z",
      "powerKw": 695.63
    },
    {
      "timestampUtc": "2025-03-29T02:00:00Z",
      "powerKw": 691.71
    },
    {
      "timestampUtc": "2025-03-29T07:00:00Z",
      "powerKw": 681.21
    },
    {
      "timestampUtc": "2025-03-29T12:00:00Z",
      "powerKw": 833.95
    },
    {
      "timestampUtc": "2025-03-29T17:00:00Z",
      "powerKw": 720.91
    },
    {
      "timestampUtc": "2025-03-29T22:00:00Z",
      "powerKw": 686.57
    },
    {
      "timestampUtc": "2025-03-30T03:00:00Z",
      "powerKw": 745.74
    },
    {
      "timestampUtc": "2025-03-30T08:00:00Z",
      "powerKw": 769.82
    },
    {
      "timestampUtc": "2025-04-23T17:00:00Z",
      "powerKw": 761.03
    },
    {
      "timestampUtc": "2025-04-23T22:00:00Z",
      "powerKw": 667.59
    },
    {
      "timestampUtc": "2025-04-24T03:00:00Z",
      "powerKw": 696.97
    },
    {
      "timestampUtc": "2025-04-24T08:00:00Z",
      "powerKw": 751.62
    },
    {
      "timestampUtc": "2025-04-24T13:00:00Z",
      "powerKw": 868.72
    },
    {
      "timestampUtc": "2025-04-24T18:00:00Z",
      "powerKw": 684.08
    },
    {
      "timestampUtc": "2025-04-24T23:00:00Z",
      "powerKw": 704.43
    },
    {
      "timestampUtc": "2025-04-25T04:00:00Z",
      "powerKw": 740.69
    },
    {
      "timestampUtc": "2025-04-25T09:00:00Z",
      "powerKw": 798.64
    },
    {
      "timestampUtc": "2025-04-25T14:00:00Z",
      "powerKw": 872.3
    },
    {
      "timestampUtc": "2025-04-25T19:00:00Z",
      "powerKw": 788.4
    },
    {
      "timestampUtc": "2025-04-26T00:00:00Z",
      "powerKw": 705.46
    },
    {
      "timestampUtc": "2025-04-26T05:00:00Z",
      "powerKw": 713.16
    },
    {
      "timestampUtc": "2025-04-26T10:00:00Z",
      "powerKw": 939.9
    },
    {
      "timestampUtc": "2025-04-26T15:00:00Z",
      "powerKw": 1045.2
    },
    {
      "timestampUtc": "2025-04-26T20:00:00Z",
      "powerKw": 883.5
    },
    {
      "timestampUtc": "2025-04-27T01:00:00Z",
      "powerKw": 842.37
    },
    {
      "timestampUtc": "2025-04-27T06:00:00Z",
      "powerKw": 823.64
    },
    {
      "timestampUtc": "2025-04-27T11:00:00Z",
      "powerKw": 1019.01
    },
    {
      "timestampUtc": "2025-04-27T16:00:00Z",
      "powerKw": 997.18
    },
    {
      "timestampUtc": "2025-04-27T21:00:00Z",
      "powerKw": 852.76
    },
    {
      "timestampUtc": "2025-04-28T02:00:00Z",
      "powerKw": 820.86
    },
    {
      "timestampUtc": "2025-04-28T07:00:00Z",
      "powerKw": 833.59
    },
    {
      "timestampUtc": "2025-04-28T12:00:00Z",
      "powerKw": 1167.08
    },
    {
      "timestampUtc": "2025-04-28T17:00:00Z",
      "powerKw": 1110.12
    },
    {
      "timestampUtc": "2025-04-28T22:00:00Z",
      "powerKw": 919.3
    },
    {
      "timestampUtc": "2025-04-29T03:00:00Z",
      "powerKw": 909.24
    },
    {
      "timestampUtc": "2025-04-29T08:00:00Z",
      "powerKw": 894.19
    },
    {
      "timestampUtc": "2025-04-29T13:00:00Z",
      "powerKw": 1070.47
    },
    {
      "timestampUtc": "2025-04-29T18:00:00Z",
      "powerKw": 1034.68
    },
    {
      "timestampUtc": "2025-04-29T23:00:00Z",
      "powerKw": 1005.56
    },
    {
      "timestampUtc": "2025-04-30T04:00:00Z",
      "powerKw": 1019.43
    },
    {
      "timestampUtc": "2025-04-30T09:00:00Z",
      "powerKw": 1188.5
    },
    {
      "timestampUtc": "2025-04-30T14:00:00Z",
      "powerKw": 1357.2
    },
    {
      "timestampUtc": "2025-04-30T19:00:00Z",
      "powerKw": 1207.21
    },
    {
      "timestampUtc": "2025-05-01T00:00:00Z",
      "powerKw": 1059.8
    },
    {
      "timestampUtc": "2025-05-01T05:00:00Z",
      "powerKw": 1060.84
    },
    {
      "timestampUtc": "2025-05-01T10:00:00Z",
      "powerKw": 1081.03
    },
    {
      "timestampUtc": "2025-05-01T15:00:00Z",
      "powerKw": 1427.52
    },
    {
      "timestampUtc": "2025-05-01T20:00:00Z",
      "powerKw": 1235.81
    },
    {
      "timestampUtc": "2025-05-02T01:00:00Z",
      "powerKw": 1152.11
    },
    {
      "timestampUtc": "2025-05-02T06:00:00Z",
      "powerKw": 1077.19
    },
    {
      "timestampUtc": "2025-05-02T11:00:00Z",
      "powerKw": 1407.26
    },
    {
      "timestampUtc": "2025-05-02T16:00:00Z",
      "powerKw": 1129.85
    },
    {
      "timestampUtc": "2025-05-02T21:00:00Z",
      "powerKw": 946.45
    },
    {
      "timestampUtc": "2025-05-03T02:00:00Z",
      "powerKw": 877.53
    },
    {
      "timestampUtc": "2025-05-03T07:00:00Z",
      "powerKw": 918.0
    },
    {
      "timestampUtc": "2025-05-03T12:00:00Z",
      "powerKw": 1108.43
    },
    {
      "timestampUtc": "2025-05-03T17:00:00Z",
      "powerKw": 996.25
    },
    {
      "timestampUtc": "2025-05-03T22:00:00Z",
      "powerKw": 817.55
    },
    {
      "timestampUtc": "2025-05-04T03:00:00Z",
      "powerKw": 829.36
    },
    {
      "timestampUtc": "2025-05-04T08:00:00Z",
      "powerKw": 868.0
    },
    {
      "timestampUtc": "2025-05-04T13:00:00Z",
      "powerKw": 937.9
    },
    {
      "timestampUtc": "2025-05-04T18:00:00Z",
      "powerKw": 906.12
    },
    {
      "timestampUtc": "2025-05-04T23:00:00Z",
      "powerKw": 900.22
    },
    {
      "timestampUtc": "2025-05-05T04:00:00Z",
      "powerKw": 837.25
    },
    {
      "timestampUtc": "2025-05-05T09:00:00Z",
      "powerKw": 828.83
    },
    {
      "timestampUtc": "2025-05-05T14:00:00Z",
      "powerKw": 1028.3
    },
    {
      "timestampUtc": "2025-05-05T19:00:00Z",
      "powerKw": 884.86
    },
    {
      "timestampUtc": "2025-05-06T00:00:00Z",
      "powerKw": 884.52
    },
    {
      "timestampUtc": "2025-05-06T05:00:00Z",
      "powerKw": 748.47
    },
    {
      "timestampUtc": "2025-05-06T10:00:00Z",
      "powerKw": 827.45
    },
    {
      "timestampUtc": "2025-05-06T15:00:00Z",
      "powerKw": 884.41
    },
    {
      "timestampUtc": "2025-05-06T20:00:00Z",
      "powerKw": 784.67
    },
    {
      "timestampUtc": "2025-05-07T01:00:00Z",
      "powerKw": 733.1
    },
    {
      "timestampUtc": "2025-05-07T06:00:00Z",
      "powerKw": 862.76
    },
    {
      "timestampUtc": "2025-05-07T11:00:00Z",
      "powerKw": 963.78
    },
    {
      "timestampUtc": "2025-05-07T16:00:00Z",
      "powerKw": 991.69
    },
    {
      "timestampUtc": "2025-05-07T21:00:00Z",
      "powerKw": 850.33
    },
    {
      "timestampUtc": "2025-05-08T02:00:00Z",
      "powerKw": 801.93
    },
    {
      "timestampUtc": "2025-05-08T07:00:00Z",
      "powerKw": 845.61
    },
    {
      "timestampUtc": "2025-05-08T12:00:00Z",
      "powerKw": 918.49
    },
    {
      "timestampUtc": "2025-05-08T17:00:00Z",
      "powerKw": 976.24
    },
    {
      "timestampUtc": "2025-05-08T22:00:00Z",
      "powerKw": 900.92
    },
    {
      "timestampUtc": "2025-05-09T03:00:00Z",
      "powerKw": 876.75
    },
    {
      "timestampUtc": "2025-05-09T08:00:00Z",
      "powerKw": 1010.41
    },
    {
      "timestampUtc": "2025-05-09T13:00:00Z",
      "powerKw": 1254.35
    },
    {
      "timestampUtc": "2025-05-09T18:00:00Z",
      "powerKw": 1180.46
    },
    {
      "timestampUtc": "2025-05-09T23:00:00Z",
      "powerKw": 975.91
    },
    {
      "timestampUtc": "2025-05-10T04:00:00Z",
      "powerKw": 949.81
    },
    {
      "timestampUtc": "2025-05-10T09:00:00Z",
      "powerKw": 1220.41
    },
    {
      "timestampUtc": "2025-05-10T14:00:00Z",
      "powerKw": 1560.43
    },
    {
      "timestampUtc": "2025-05-10T19:00:00Z",
      "powerKw": 1395.39
    },
    {
      "timestampUtc": "2025-05-11T00:00:00Z",
      "powerKw": 1509.47
    },
    {
      "timestampUtc": "2025-05-11T05:00:00Z",
      "powerKw": 1468.33
    },
    {
      "timestampUtc": "2025-05-11T10:00:00Z",
      "powerKw": 1925.98
    },
    {
      "timestampUtc": "2025-05-11T15:00:00Z",
      "powerKw": 1984.09
    },
    {
      "timestampUtc": "2025-05-11T20:00:00Z",
      "powerKw": 1525.52
    },
    {
      "timestampUtc": "2025-05-12T01:00:00Z",
      "powerKw": 1348.45
    },
    {
      "timestampUtc": "2025-05-12T06:00:00Z",
      "powerKw": 1236.53
    },
    {
      "timestampUtc": "2025-05-12T11:00:00Z",
      "powerKw": 1454.7
    },
    {
      "timestampUtc": "2025-05-12T16:00:00Z",
      "powerKw": 1555.2
    },
    {
      "timestampUtc": "2025-05-12T21:00:00Z",
      "powerKw": 1238.01
    },
    {
      "timestampUtc": "2025-05-13T02:00:00Z",
      "powerKw": 1085.11
    },
    {
      "timestampUtc": "2025-05-13T07:00:00Z",
      "powerKw": 1103.54
    },
    {
      "timestampUtc": "2025-05-13T12:00:00Z",
      "powerKw": 1311.65
    },
    {
      "timestampUtc": "2025-05-13T17:00:00Z",
      "powerKw": 1394.35
    },
    {
      "timestampUtc": "2025-05-13T22:00:00Z",
      "powerKw": 1190.99
    },
    {
      "timestampUtc": "2025-05-14T03:00:00Z",
      "powerKw": 1115.06
    },
    {
      "timestampUtc": "2025-05-14T08:00:00Z",
      "powerKw": 1238.45
    },
    {
      "timestampUtc": "2025-05-14T13:00:00Z",
      "powerKw": 1212.14
    },
    {
      "timestampUtc": "2025-05-14T18:00:00Z",
      "powerKw": 1089.87
    },
    {
      "timestampUtc": "2025-05-14T23:00:00Z",
      "powerKw": 1075.9
    },
    {
      "timestampUtc": "2025-05-15T04:00:00Z",
      "powerKw": 1007.45
    },
    {
      "timestampUtc": "2025-05-15T09:00:00Z",
      "powerKw": 1131.21
    },
    {
      "timestampUtc": "2025-05-15T14:00:00Z",
      "powerKw": 1207.03
    },
    {
      "timestampUtc": "2025-05-15T19:00:00Z",
      "powerKw": 1025.43
    },
    {
      "timestampUtc": "2025-05-16T00:00:00Z",
      "powerKw": 892.91
    },
    {
      "timestampUtc": "2025-05-16T05:00:00Z",
      "powerKw": 886.51
    },
    {
      "timestampUtc": "2025-05-16T10:00:00Z",
      "powerKw": 957.15
    },
    {
      "timestampUtc": "2025-05-16T15:00:00Z",
      "powerKw": 1005.95
    },
    {
      "timestampUtc": "2025-05-16T20:00:00Z",
      "powerKw": 962.59
    },
    {
      "timestampUtc": "2025-05-17T01:00:00Z",
      "powerKw": 900.64
    },
    {
      "timestampUtc": "2025-05-17T06:00:00Z",
      "powerKw": 1280.47
    },
    {
      "timestampUtc": "2025-05-17T11:00:00Z",
      "powerKw": 1382.87
    },
    {
      "timestampUtc": "2025-05-17T16:00:00Z",
      "powerKw": 1413.59
    },
    {
      "timestampUtc": "2025-05-17T21:00:00Z",
      "powerKw": 1475.3
    },
    {
      "timestampUtc": "2025-05-18T02:00:00Z",
      "powerKw": 1431.74
    },
    {
      "timestampUtc": "2025-05-18T07:00:00Z",
      "powerKw": 1420.77
    },
    {
      "timestampUtc": "2025-05-18T12:00:00Z",
      "powerKw": 1530.75
    },
    {
      "timestampUtc": "2025-05-18T17:00:00Z",
      "powerKw": 1453.15
    },
    {
      "timestampUtc": "2025-05-18T22:00:00Z",
      "powerKw": 1339.54
    },
    {
      "timestampUtc": "2025-05-19T03:00:00Z",
      "powerKw": 1179.05
    },
    {
      "timestampUtc": "2025-05-19T08:00:00Z",
      "powerKw": 1203.04
    },
    {
      "timestampUtc": "2025-05-19T13:00:00Z",
      "powerKw": 1386.62
    },
    {
      "timestampUtc": "2025-05-19T18:00:00Z",
      "powerKw": 1372.69
    },
    {
      "timestampUtc": "2025-05-19T23:00:00Z",
      "powerKw": 1299.58
    },
    {
      "timestampUtc": "2025-05-20T04:00:00Z",
      "powerKw": 1178.43
    },
    {
      "timestampUtc": "2025-05-20T09:00:00Z",
      "powerKw": 1474.95
    },
    {
      "timestampUtc": "2025-05-20T14:00:00Z",
      "powerKw": 1496.95
    },
    {
      "timestampUtc": "2025-05-20T19:00:00Z",
      "powerKw": 1140.48
    },
    {
      "timestampUtc": "2025-05-21T00:00:00Z",
      "powerKw": 1083.9
    },
    {
      "timestampUtc": "2025-05-21T05:00:00Z",
      "powerKw": 1053.03
    },
    {
      "timestampUtc": "2025-05-21T10:00:00Z",
      "powerKw": 1054.25
    },
    {
      "timestampUtc": "2025-05-21T15:00:00Z",
      "powerKw": 1021.08
    },
    {
      "timestampUtc": "2025-05-21T20:00:00Z",
      "powerKw": 862.16
    },
    {
      "timestampUtc": "2025-05-22T01:00:00Z",
      "powerKw": 819.3
    },
    {
      "timestampUtc": "2025-05-22T06:00:00Z",
      "powerKw": 799.63
    },
    {
      "timestampUtc": "2025-05-22T11:00:00Z",
      "powerKw": 810.72
    },
    {
      "timestampUtc": "2025-05-22T16:00:00Z",
      "powerKw": 776.13
    },
    {
      "timestampUtc": "2025-05-22T21:00:00Z",
      "powerKw": 667.46
    },
    {
      "timestampUtc": "2025-05-23T02:00:00Z",
      "powerKw": 645.89
    },
    {
      "timestampUtc": "2025-05-23T07:00:00Z",
      "powerKw": 864.67
    },
    {
      "timestampUtc": "2025-05-23T12:00:00Z",
      "powerKw": 1042.11
    },
    {
      "timestampUtc": "2025-05-23T17:00:00Z",
      "powerKw": 1034.76
    },
    {
      "timestampUtc": "2025-05-23T22:00:00Z",
      "powerKw": 934.54
    },
    {
      "timestampUtc": "2025-05-24T03:00:00Z",
      "powerKw": 888.72
    },
    {
      "timestampUtc": "2025-05-24T08:00:00Z",
      "powerKw": 1012.71
    },
    {
      "timestampUtc": "2025-05-24T13:00:00Z",
      "powerKw": 1161.13
    },
    {
      "timestampUtc": "2025-05-24T18:00:00Z",
      "powerKw": 1178.83
    },
    {
      "timestampUtc": "2025-05-24T23:00:00Z",
      "powerKw": 1111.14
    },
    {
      "timestampUtc": "2025-05-25T04:00:00Z",
      "powerKw": 1099.36
    },
    {
      "timestampUtc": "2025-05-25T09:00:00Z",
      "powerKw": 1148.68
    },
    {
      "timestampUtc": "2025-05-25T14:00:00Z",
      "powerKw": 1216.56
    },
    {
      "timestampUtc": "2025-05-25T19:00:00Z",
      "powerKw": 1082.92
    },
    {
      "timestampUtc": "2025-05-26T00:00:00Z",
      "powerKw": 886.08
    },
    {
      "timestampUtc": "2025-05-26T05:00:00Z",
      "powerKw": 861.28
    },
    {
      "timestampUtc": "2025-05-26T10:00:00Z",
      "powerKw": 959.92
    },
    {
      "timestampUtc": "2025-05-26T15:00:00Z",
      "powerKw": 879.23
    },
    {
      "timestampUtc": "2025-05-26T20:00:00Z",
      "powerKw": 851.97
    },
    {
      "timestampUtc": "2025-05-27T01:00:00Z",
      "powerKw": 833.01
    },
    {
      "timestampUtc": "2025-05-27T06:00:00Z",
      "powerKw": 821.22
    },
    {
      "timestampUtc": "2025-05-27T11:00:00Z",
      "powerKw": 880.63
    },
    {
      "timestampUtc": "2025-05-27T16:00:00Z",
      "powerKw": 889.45
    },
    {
      "timestampUtc": "2025-05-27T21:00:00Z",
      "powerKw": 801.04
    },
    {
      "timestampUtc": "2025-05-28T02:00:00Z",
      "powerKw": 853.67
    },
    {
      "timestampUtc": "2025-05-28T07:00:00Z",
      "powerKw": 1006.02
    },
    {
      "timestampUtc": "2025-05-28T12:00:00Z",
      "powerKw": 1099.3
    },
    {
      "timestampUtc": "2025-05-28T17:00:00Z",
      "powerKw": 1096.7
    },
    {
      "timestampUtc": "2025-05-28T22:00:00Z",
      "powerKw": 967.43
    },
    {
      "timestampUtc": "2025-05-29T03:00:00Z",
      "powerKw": 941.73
    },
    {
      "timestampUtc": "2025-05-29T08:00:00Z",
      "powerKw": 1000.82
    },
    {
      "timestampUtc": "2025-05-29T13:00:00Z",
      "powerKw": 1154.75
    },
    {
      "timestampUtc": "2025-05-29T18:00:00Z",
      "powerKw": 1031.88
    },
    {
      "timestampUtc": "2025-05-29T23:00:00Z",
      "powerKw": 869.3
    },
    {
      "timestampUtc": "2025-05-30T04:00:00Z",
      "powerKw": 863.91
    },
    {
      "timestampUtc": "2025-05-30T09:00:00Z",
      "powerKw": 848.84
    },
    {
      "timestampUtc": "2025-05-30T14:00:00Z",
      "powerKw": 1008.53
    },
    {
      "timestampUtc": "2025-05-30T19:00:00Z",
      "powerKw": 1094.33
    },
    {
      "timestampUtc": "2025-05-31T00:00:00Z",
      "powerKw": 1035.96
    },
    {
      "timestampUtc": "2025-05-31T05:00:00Z",
      "powerKw": 992.96
    },
    {
      "timestampUtc": "2025-05-31T10:00:00Z",
      "powerKw": 1287.14
    },
    {
      "timestampUtc": "2025-05-31T15:00:00Z",
      "powerKw": 1384.58
    },
    {
      "timestampUtc": "2025-05-31T20:00:00Z",
      "powerKw": 1252.65
    },
    {
      "timestampUtc": "2025-06-01T01:00:00Z",
      "powerKw": 1128.57
    },
    {
      "timestampUtc": "2025-06-01T06:00:00Z",
      "powerKw": 1145.32
    },
    {
      "timestampUtc": "2025-06-01T11:00:00Z",
      "powerKw": 1362.57
    },
    {
      "timestampUtc": "2025-06-01T16:00:00Z",
      "powerKw": 1332.62
    },
    {
      "timestampUtc": "2025-06-01T21:00:00Z",
      "powerKw": 1140.34
    },
    {
      "timestampUtc": "2025-06-02T02:00:00Z",
      "powerKw": 1073.59
    },
    {
      "timestampUtc": "2025-06-02T07:00:00Z",
      "powerKw": 1112.96
    },
    {
      "timestampUtc": "2025-06-02T12:00:00Z",
      "powerKw": 1159.47
    },
    {
      "timestampUtc": "2025-06-02T17:00:00Z",
      "powerKw": 975.05
    },
    {
      "timestampUtc": "2025-06-02T22:00:00Z",
      "powerKw": 834.6
    },
    {
      "timestampUtc": "2025-06-03T03:00:00Z",
      "powerKw": 724.49
    },
    {
      "timestampUtc": "2025-06-03T08:00:00Z",
      "powerKw": 842.47
    },
    {
      "timestampUtc": "2025-06-03T13:00:00Z",
      "powerKw": 1078.58
    },
    {
      "timestampUtc": "2025-06-03T18:00:00Z",
      "powerKw": 1000.87
    },
    {
      "timestampUtc": "2025-06-03T23:00:00Z",
      "powerKw": 921.45
    },
    {
      "timestampUtc": "2025-06-04T04:00:00Z",
      "powerKw": 817.29
    },
    {
      "timestampUtc": "2025-06-04T09:00:00Z",
      "powerKw": 1035.05
    },
    {
      "timestampUtc": "2025-06-04T14:00:00Z",
      "powerKw": 1048.09
    },
    {
      "timestampUtc": "2025-06-04T19:00:00Z",
      "powerKw": 1169.76
    },
    {
      "timestampUtc": "2025-06-05T00:00:00Z",
      "powerKw": 1179.01
    },
    {
      "timestampUtc": "2025-06-05T05:00:00Z",
      "powerKw": 1135.76
    },
    {
      "timestampUtc": "2025-06-05T10:00:00Z",
      "powerKw": 1180.7
    },
    {
      "timestampUtc": "2025-06-05T15:00:00Z",
      "powerKw": 1124.88
    },
    {
      "timestampUtc": "2025-06-05T20:00:00Z",
      "powerKw": 1044.12
    },
    {
      "timestampUtc": "2025-06-06T01:00:00Z",
      "powerKw": 1198.04
    },
    {
      "timestampUtc": "2025-06-06T06:00:00Z",
      "powerKw": 1228.41
    },
    {
      "timestampUtc": "2025-06-06T11:00:00Z",
      "powerKw": 1518.93
    },
    {
      "timestampUtc": "2025-06-06T16:00:00Z",
      "powerKw": 1470.96
    },
    {
      "timestampUtc": "2025-06-06T21:00:00Z",
      "powerKw": 1354.79
    },
    {
      "timestampUtc": "2025-06-07T02:00:00Z",
      "powerKw": 1227.92
    },
    {
      "timestampUtc": "2025-06-07T07:00:00Z",
      "powerKw": 1272.18
    },
    {
      "timestampUtc": "2025-06-07T12:00:00Z",
      "powerKw": 1374.11
    },
    {
      "timestampUtc": "2025-06-07T17:00:00Z",
      "powerKw": 1314.76
    },
    {
      "timestampUtc": "2025-06-07T22:00:00Z",
      "powerKw": 1195.2
    },
    {
      "timestampUtc": "2025-06-08T03:00:00Z",
      "powerKw": 1167.64
    },
    {
      "timestampUtc": "2025-06-08T08:00:00Z",
      "powerKw": 1176.69
    },
    {
      "timestampUtc": "2025-06-08T13:00:00Z",
      "powerKw": 1196.86
    },
    {
      "timestampUtc": "2025-06-08T18:00:00Z",
      "powerKw": 1216.79
    },
    {
      "timestampUtc": "2025-06-08T23:00:00Z",
      "powerKw": 1156.53
    },
    {
      "timestampUtc": "2025-06-09T04:00:00Z",
      "powerKw": 1133.55
    },
    {
      "timestampUtc": "2025-06-09T09:00:00Z",
      "powerKw": 1419.98
    },
    {
      "timestampUtc": "2025-06-09T14:00:00Z",
      "powerKw": 1409.58
    },
    {
      "timestampUtc": "2025-06-09T19:00:00Z",
      "powerKw": 1304.18
    },
    {
      "timestampUtc": "2025-06-10T00:00:00Z",
      "powerKw": 1235.64
    },
    {
      "timestampUtc": "2025-06-10T05:00:00Z",
      "powerKw": 1190.85
    },
    {
      "timestampUtc": "2025-06-10T10:00:00Z",
      "powerKw": 966.43
    },
    {
      "timestampUtc": "2025-06-10T15:00:00Z",
      "powerKw": 914.88
    },
    {
      "timestampUtc": "2025-06-10T20:00:00Z",
      "powerKw": 935.06
    },
    {
      "timestampUtc": "2025-06-11T01:00:00Z",
      "powerKw": 1027.39
    },
    {
      "timestampUtc": "2025-06-11T06:00:00Z",
      "powerKw": 1118.79
    },
    {
      "timestampUtc": "2025-06-11T11:00:00Z",
      "powerKw": 1214.58
    },
    {
      "timestampUtc": "2025-06-11T16:00:00Z",
      "powerKw": 1135.4
    },
    {
      "timestampUtc": "2025-06-11T21:00:00Z",
      "powerKw": 962.84
    },
    {
      "timestampUtc": "2025-06-12T02:00:00Z",
      "powerKw": 869.96
    },
    {
      "timestampUtc": "2025-06-12T07:00:00Z",
      "powerKw": 955.21
    },
    {
      "timestampUtc": "2025-06-12T12:00:00Z",
      "powerKw": 1181.18
    },
    {
      "timestampUtc": "2025-06-12T17:00:00Z",
      "powerKw": 1186.99
    },
    {
      "timestampUtc": "2025-06-12T22:00:00Z",
      "powerKw": 1018.48
    },
    {
      "timestampUtc": "2025-06-13T03:00:00Z",
      "powerKw": 1052.69
    },
    {
      "timestampUtc": "2025-06-13T08:00:00Z",
      "powerKw": 1159.16
    },
    {
      "timestampUtc": "2025-06-13T13:00:00Z",
      "powerKw": 1354.77
    },
    {
      "timestampUtc": "2025-06-13T18:00:00Z",
      "powerKw": 1416.13
    },
    {
      "timestampUtc": "2025-06-13T23:00:00Z",
      "powerKw": 1191.06
    },
    {
      "timestampUtc": "2025-06-14T04:00:00Z",
      "powerKw": 1079.54
    },
    {
      "timestampUtc": "2025-06-14T09:00:00Z",
      "powerKw": 1287.38
    },
    {
      "timestampUtc": "2025-06-14T14:00:00Z",
      "powerKw": 1348.45
    },
    {
      "timestampUtc": "2025-06-14T19:00:00Z",
      "powerKw": 1199.43
    },
    {
      "timestampUtc": "2025-06-15T00:00:00Z",
      "powerKw": 1089.93
    },
    {
      "timestampUtc": "2025-06-15T05:00:00Z",
      "powerKw": 999.71
    },
    {
      "timestampUtc": "2025-06-15T10:00:00Z",
      "powerKw": 1143.91
    },
    {
      "timestampUtc": "2025-06-15T15:00:00Z",
      "powerKw": 1000.81
    },
    {
      "timestampUtc": "2025-06-15T20:00:00Z",
      "powerKw": 960.32
    },
    {
      "timestampUtc": "2025-06-16T01:00:00Z",
      "powerKw": 880.81
    },
    {
      "timestampUtc": "2025-06-16T06:00:00Z",
      "powerKw": 846.11
    },
    {
      "timestampUtc": "2025-06-16T11:00:00Z",
      "powerKw": 969.91
    },
    {
      "timestampUtc": "2025-06-16T16:00:00Z",
      "powerKw": 1056.15
    },
    {
      "timestampUtc": "2025-06-16T21:00:00Z",
      "powerKw": 927.83
    },
    {
      "timestampUtc": "2025-06-17T02:00:00Z",
      "powerKw": 891.98
    },
    {
      "timestampUtc": "2025-06-17T07:00:00Z",
      "powerKw": 895.37
    },
    {
      "timestampUtc": "2025-06-17T12:00:00Z",
      "powerKw": 1050.74
    },
    {
      "timestampUtc": "2025-06-17T17:00:00Z",
      "powerKw": 1139.33
    },
    {
      "timestampUtc": "2025-06-17T22:00:00Z",
      "powerKw": 994.68
    },
    {
      "timestampUtc": "2025-06-18T03:00:00Z",
      "powerKw": 1021.34
    },
    {
      "timestampUtc": "2025-06-18T08:00:00Z",
      "powerKw": 1261.55
    },
    {
      "timestampUtc": "2025-06-18T13:00:00Z",
      "powerKw": 1373.79
    },
    {
      "timestampUtc": "2025-06-18T18:00:00Z",
      "powerKw": 1377.08
    },
    {
      "timestampUtc": "2025-06-18T23:00:00Z",
      "powerKw": 1160.71
    },
    {
      "timestampUtc": "2025-06-19T04:00:00Z",
      "powerKw": 1116.76
    },
    {
      "timestampUtc": "2025-06-19T09:00:00Z",
      "powerKw": 1414.81
    },
    {
      "timestampUtc": "2025-06-19T14:00:00Z",
      "powerKw": 1516.33
    },
    {
      "timestampUtc": "2025-06-19T19:00:00Z",
      "powerKw": 1367.15
    },
    {
      "timestampUtc": "2025-06-20T00:00:00Z",
      "powerKw": 1178.69
    },
    {
      "timestampUtc": "2025-06-20T05:00:00Z",
      "powerKw": 1200.78
    },
    {
      "timestampUtc": "2025-06-20T10:00:00Z",
      "powerKw": 1412.31
    },
    {
      "timestampUtc": "2025-06-20T15:00:00Z",
      "powerKw": 1497.17
    },
    {
      "timestampUtc": "2025-06-20T20:00:00Z",
      "powerKw": 1489.64
    },
    {
      "timestampUtc": "2025-06-21T01:00:00Z",
      "powerKw": 1357.21
    },
    {
      "timestampUtc": "2025-06-21T06:00:00Z",
      "powerKw": 1473.96
    },
    {
      "timestampUtc": "2025-06-21T11:00:00Z",
      "powerKw": 1819.76
    },
    {
      "timestampUtc": "2025-06-21T16:00:00Z",
      "powerKw": 1759.09
    },
    {
      "timestampUtc": "2025-06-21T21:00:00Z",
      "powerKw": 1575.81
    },
    {
      "timestampUtc": "2025-06-22T02:00:00Z",
      "powerKw": 1417.57
    },
    {
      "timestampUtc": "2025-06-22T07:00:00Z",
      "powerKw": 1636.72
    },
    {
      "timestampUtc": "2025-06-22T12:00:00Z",
      "powerKw": 1954.2
    },
    {
      "timestampUtc": "2025-06-22T17:00:00Z",
      "powerKw": 1828.99
    },
    {
      "timestampUtc": "2025-06-22T22:00:00Z",
      "powerKw": 1446.57
    },
    {
      "timestampUtc": "2025-06-23T03:00:00Z",
      "powerKw": 1349.72
    },
    {
      "timestampUtc": "2025-06-23T08:00:00Z",
      "powerKw": 1345.21
    },
    {
      "timestampUtc": "2025-06-23T13:00:00Z",
      "powerKw": 1170.03
    },
    {
      "timestampUtc": "2025-06-23T18:00:00Z",
      "powerKw": 1267.72
    },
    {
      "timestampUtc": "2025-06-23T23:00:00Z",
      "powerKw": 1229.4
    },
    {
      "timestampUtc": "2025-06-24T04:00:00Z",
      "powerKw": 1287.3
    },
    {
      "timestampUtc": "2025-06-24T09:00:00Z",
      "powerKw": 1150.13
    },
    {
      "timestampUtc": "2025-06-24T14:00:00Z",
      "powerKw": 1152.88
    },
    {
      "timestampUtc": "2025-06-24T19:00:00Z",
      "powerKw": 1071.96
    },
    {
      "timestampUtc": "2025-06-25T00:00:00Z",
      "powerKw": 1111.53
    },
    {
      "timestampUtc": "2025-06-25T05:00:00Z",
      "powerKw": 1017.33
    },
    {
      "timestampUtc": "2025-06-25T10:00:00Z",
      "powerKw": 1011.79
    },
    {
      "timestampUtc": "2025-06-25T15:00:00Z",
      "powerKw": 985.13
    },
    {
      "timestampUtc": "2025-06-25T20:00:00Z",
      "powerKw": 854.51
    },
    {
      "timestampUtc": "2025-06-26T01:00:00Z",
      "powerKw": 766.38
    },
    {
      "timestampUtc": "2025-06-26T06:00:00Z",
      "powerKw": 712.88
    },
    {
      "timestampUtc": "2025-06-26T11:00:00Z",
      "powerKw": 982.5
    },
    {
      "timestampUtc": "2025-06-26T16:00:00Z",
      "powerKw": 1296.18
    },
    {
      "timestampUtc": "2025-06-26T21:00:00Z",
      "powerKw": 1250.45
    },
    {
      "timestampUtc": "2025-06-27T02:00:00Z",
      "powerKw": 1256.26
    },
    {
      "timestampUtc": "2025-06-27T07:00:00Z",
      "powerKw": 1158.87
    },
    {
      "timestampUtc": "2025-06-27T12:00:00Z",
      "powerKw": 1091.81
    },
    {
      "timestampUtc": "2025-06-27T17:00:00Z",
      "powerKw": 1142.16
    },
    {
      "timestampUtc": "2025-06-27T22:00:00Z",
      "powerKw": 1003.97
    },
    {
      "timestampUtc": "2025-06-28T03:00:00Z",
      "powerKw": 931.17
    },
    {
      "timestampUtc": "2025-06-28T08:00:00Z",
      "powerKw": 1094.72
    },
    {
      "timestampUtc": "2025-06-28T13:00:00Z",
      "powerKw": 1166.86
    },
    {
      "timestampUtc": "2025-06-28T18:00:00Z",
      "powerKw": 1098.26
    },
    {
      "timestampUtc": "2025-06-28T23:00:00Z",
      "powerKw": 1058.4
    },
    {
      "timestampUtc": "2025-06-29T04:00:00Z",
      "powerKw": 1049.39
    },
    {
      "timestampUtc": "2025-06-29T09:00:00Z",
      "powerKw": 1224.31
    },
    {
      "timestampUtc": "2025-06-29T14:00:00Z",
      "powerKw": 1280.43
    },
    {
      "timestampUtc": "2025-06-29T19:00:00Z",
      "powerKw": 1114.72
    },
    {
      "timestampUtc": "2025-06-30T00:00:00Z",
      "powerKw": 1058.44
    },
    {
      "timestampUtc": "2025-06-30T05:00:00Z",
      "powerKw": 1061.43
    },
    {
      "timestampUtc": "2025-06-30T10:00:00Z",
      "powerKw": 1270.37
    },
    {
      "timestampUtc": "2025-06-30T15:00:00Z",
      "powerKw": 1447.69
    },
    {
      "timestampUtc": "2025-06-30T20:00:00Z",
      "powerKw": 1215.64
    },
    {
      "timestampUtc": "2025-07-01T01:00:00Z",
      "powerKw": 944.84
    },
    {
      "timestampUtc": "2025-07-01T06:00:00Z",
      "powerKw": 945.62
    },
    {
      "timestampUtc": "2025-07-01T11:00:00Z",
      "powerKw": 1371.76
    },
    {
      "timestampUtc": "2025-07-01T16:00:00Z",
      "powerKw": 1497.46
    },
    {
      "timestampUtc": "2025-07-01T21:00:00Z",
      "powerKw": 1284.81
    },
    {
      "timestampUtc": "2025-07-02T02:00:00Z",
      "powerKw": 1168.1
    },
    {
      "timestampUtc": "2025-07-02T07:00:00Z",
      "powerKw": 1326.13
    },
    {
      "timestampUtc": "2025-07-02T12:00:00Z",
      "powerKw": 1703.34
    },
    {
      "timestampUtc": "2025-07-02T17:00:00Z",
      "powerKw": 1681.09
    },
    {
      "timestampUtc": "2025-07-02T22:00:00Z",
      "powerKw": 1107.0
    },
    {
      "timestampUtc": "2025-07-03T03:00:00Z",
      "powerKw": 1007.57
    },
    {
      "timestampUtc": "2025-07-03T08:00:00Z",
      "powerKw": 1084.29
    },
    {
      "timestampUtc": "2025-07-03T13:00:00Z",
      "powerKw": 1112.29
    },
    {
      "timestampUtc": "2025-07-03T18:00:00Z",
      "powerKw": 1254.15
    },
    {
      "timestampUtc": "2025-07-03T23:00:00Z",
      "powerKw": 1074.0
    },
    {
      "timestampUtc": "2025-07-04T04:00:00Z",
      "powerKw": 1050.45
    },
    {
      "timestampUtc": "2025-07-04T09:00:00Z",
      "powerKw": 1296.74
    },
    {
      "timestampUtc": "2025-07-04T14:00:00Z",
      "powerKw": 1446.09
    },
    {
      "timestampUtc": "2025-07-04T19:00:00Z",
      "powerKw": 1450.86
    },
    {
      "timestampUtc": "2025-07-05T00:00:00Z",
      "powerKw": 1252.06
    },
    {
      "timestampUtc": "2025-07-05T05:00:00Z",
      "powerKw": 1311.43
    },
    {
      "timestampUtc": "2025-07-05T10:00:00Z",
      "powerKw": 1333.71
    },
    {
      "timestampUtc": "2025-07-05T15:00:00Z",
      "powerKw": 1354.9
    },
    {
      "timestampUtc": "2025-07-05T20:00:00Z",
      "powerKw": 1206.96
    },
    {
      "timestampUtc": "2025-07-06T01:00:00Z",
      "powerKw": 1202.84
    },
    {
      "timestampUtc": "2025-07-06T06:00:00Z",
      "powerKw": 1151.82
    },
    {
      "timestampUtc": "2025-07-06T11:00:00Z",
      "powerKw": 1314.08
    },
    {
      "timestampUtc": "2025-07-06T16:00:00Z",
      "powerKw": 1303.74
    },
    {
      "timestampUtc": "2025-07-06T21:00:00Z",
      "powerKw": 1112.97
    },
    {
      "timestampUtc": "2025-07-07T02:00:00Z",
      "powerKw": 1212.29
    },
    {
      "timestampUtc": "2025-07-07T07:00:00Z",
      "powerKw": 1151.48
    },
    {
      "timestampUtc": "2025-07-07T12:00:00Z",
      "powerKw": 1276.63
    },
    {
      "timestampUtc": "2025-07-07T17:00:00Z",
      "powerKw": 1174.91
    },
    {
      "timestampUtc": "2025-07-07T22:00:00Z",
      "powerKw": 1038.76
    },
    {
      "timestampUtc": "2025-07-08T03:00:00Z",
      "powerKw": 919.93
    },
    {
      "timestampUtc": "2025-07-08T08:00:00Z",
      "powerKw": 976.28
    },
    {
      "timestampUtc": "2025-07-08T13:00:00Z",
      "powerKw": 967.42
    },
    {
      "timestampUtc": "2025-07-08T18:00:00Z",
      "powerKw": 1021.64
    },
    {
      "timestampUtc": "2025-07-08T23:00:00Z",
      "powerKw": 967.43
    },
    {
      "timestampUtc": "2025-07-09T04:00:00Z",
      "powerKw": 1003.47
    },
    {
      "timestampUtc": "2025-07-09T09:00:00Z",
      "powerKw": 1073.44
    },
    {
      "timestampUtc": "2025-07-09T14:00:00Z",
      "powerKw": 1078.89
    },
    {
      "timestampUtc": "2025-07-09T19:00:00Z",
      "powerKw": 801.5
    },
    {
      "timestampUtc": "2025-07-10T00:00:00Z",
      "powerKw": 754.91
    },
    {
      "timestampUtc": "2025-07-10T05:00:00Z",
      "powerKw": 755.74
    },
    {
      "timestampUtc": "2025-07-10T10:00:00Z",
      "powerKw": 897.25
    },
    {
      "timestampUtc": "2025-07-10T15:00:00Z",
      "powerKw": 956.29
    },
    {
      "timestampUtc": "2025-07-10T20:00:00Z",
      "powerKw": 795.48
    },
    {
      "timestampUtc": "2025-07-11T01:00:00Z",
      "powerKw": 860.59
    },
    {
      "timestampUtc": "2025-07-11T06:00:00Z",
      "powerKw": 944.05
    },
    {
      "timestampUtc": "2025-07-11T11:00:00Z",
      "powerKw": 1138.09
    },
    {
      "timestampUtc": "2025-07-11T16:00:00Z",
      "powerKw": 1146.08
    },
    {
      "timestampUtc": "2025-07-11T21:00:00Z",
      "powerKw": 1007.34
    },
    {
      "timestampUtc": "2025-07-12T02:00:00Z",
      "powerKw": 969.24
    },
    {
      "timestampUtc": "2025-07-12T07:00:00Z",
      "powerKw": 969.7
    },
    {
      "timestampUtc": "2025-07-12T12:00:00Z",
      "powerKw": 1097.33
    },
    {
      "timestampUtc": "2025-07-12T17:00:00Z",
      "powerKw": 1076.6
    },
    {
      "timestampUtc": "2025-07-12T22:00:00Z",
      "powerKw": 986.84
    },
    {
      "timestampUtc": "2025-07-13T03:00:00Z",
      "powerKw": 926.12
    },
    {
      "timestampUtc": "2025-07-13T08:00:00Z",
      "powerKw": 955.52
    },
    {
      "timestampUtc": "2025-07-13T13:00:00Z",
      "powerKw": 1086.31
    },
    {
      "timestampUtc": "2025-07-13T18:00:00Z",
      "powerKw": 1011.21
    },
    {
      "timestampUtc": "2025-07-13T23:00:00Z",
      "powerKw": 1002.34
    },
    {
      "timestampUtc": "2025-07-14T04:00:00Z",
      "powerKw": 994.28
    },
    {
      "timestampUtc": "2025-07-14T09:00:00Z",
      "powerKw": 1054.86
    },
    {
      "timestampUtc": "2025-07-14T14:00:00Z",
      "powerKw": 1084.36
    },
    {
      "timestampUtc": "2025-07-14T19:00:00Z",
      "powerKw": 904.28
    },
    {
      "timestampUtc": "2025-07-15T00:00:00Z",
      "powerKw": 773.18
    },
    {
      "timestampUtc": "2025-07-15T05:00:00Z",
      "powerKw": 787.85
    },
    {
      "timestampUtc": "2025-07-15T10:00:00Z",
      "powerKw": 753.57
    },
    {
      "timestampUtc": "2025-07-15T15:00:00Z",
      "powerKw": 832.91
    },
    {
      "timestampUtc": "2025-07-15T20:00:00Z",
      "powerKw": 811.14
    },
    {
      "timestampUtc": "2025-07-16T01:00:00Z",
      "powerKw": 772.08
    },
    {
      "timestampUtc": "2025-07-16T06:00:00Z",
      "powerKw": 779.03
    },
    {
      "timestampUtc": "2025-07-16T11:00:00Z",
      "powerKw": 860.9
    },
    {
      "timestampUtc": "2025-07-16T16:00:00Z",
      "powerKw": 1026.14
    },
    {
      "timestampUtc": "2025-07-16T21:00:00Z",
      "powerKw": 992.36
    },
    {
      "timestampUtc": "2025-07-17T02:00:00Z",
      "powerKw": 944.09
    },
    {
      "timestampUtc": "2025-07-17T07:00:00Z",
      "powerKw": 948.66
    },
    {
      "timestampUtc": "2025-07-17T12:00:00Z",
      "powerKw": 1110.07
    },
    {
      "timestampUtc": "2025-07-17T17:00:00Z",
      "powerKw": 1080.29
    },
    {
      "timestampUtc": "2025-07-17T22:00:00Z",
      "powerKw": 1007.49
    },
    {
      "timestampUtc": "2025-07-18T03:00:00Z",
      "powerKw": 1032.84
    },
    {
      "timestampUtc": "2025-07-18T08:00:00Z",
      "powerKw": 1056.71
    },
    {
      "timestampUtc": "2025-07-18T13:00:00Z",
      "powerKw": 1141.18
    },
    {
      "timestampUtc": "2025-07-18T18:00:00Z",
      "powerKw": 1096.34
    },
    {
      "timestampUtc": "2025-07-18T23:00:00Z",
      "powerKw": 998.48
    },
    {
      "timestampUtc": "2025-07-19T04:00:00Z",
      "powerKw": 986.04
    },
    {
      "timestampUtc": "2025-07-19T09:00:00Z",
      "powerKw": 1229.77
    },
    {
      "timestampUtc": "2025-07-19T14:00:00Z",
      "powerKw": 1350.6
    },
    {
      "timestampUtc": "2025-07-19T19:00:00Z",
      "powerKw": 1313.13
    },
    {
      "timestampUtc": "2025-07-20T00:00:00Z",
      "powerKw": 1086.0
    },
    {
      "timestampUtc": "2025-07-20T05:00:00Z",
      "powerKw": 1080.98
    },
    {
      "timestampUtc": "2025-07-20T10:00:00Z",
      "powerKw": 1249.65
    },
    {
      "timestampUtc": "2025-07-20T15:00:00Z",
      "powerKw": 1274.28
    },
    {
      "timestampUtc": "2025-07-20T20:00:00Z",
      "powerKw": 1258.98
    },
    {
      "timestampUtc": "2025-07-21T01:00:00Z",
      "powerKw": 1238.49
    },
    {
      "timestampUtc": "2025-07-21T06:00:00Z",
      "powerKw": 1080.24
    },
    {
      "timestampUtc": "2025-07-21T11:00:00Z",
      "powerKw": 1109.49
    },
    {
      "timestampUtc": "2025-07-21T16:00:00Z",
      "powerKw": 1068.37
    },
    {
      "timestampUtc": "2025-07-21T21:00:00Z",
      "powerKw": 1082.11
    },
    {
      "timestampUtc": "2025-07-22T02:00:00Z",
      "powerKw": 1027.41
    },
    {
      "timestampUtc": "2025-07-22T07:00:00Z",
      "powerKw": 989.24
    },
    {
      "timestampUtc": "2025-07-22T12:00:00Z",
      "powerKw": 1065.14
    },
    {
      "timestampUtc": "2025-07-22T17:00:00Z",
      "powerKw": 1071.31
    },
    {
      "timestampUtc": "2025-07-22T22:00:00Z",
      "powerKw": 1097.34
    },
    {
      "timestampUtc": "2025-07-23T03:00:00Z",
      "powerKw": 1123.79
    },
    {
      "timestampUtc": "2025-07-23T08:00:00Z",
      "powerKw": 1126.16
    },
    {
      "timestampUtc": "2025-07-23T13:00:00Z",
      "powerKw": 1197.7
    },
    {
      "timestampUtc": "2025-07-23T18:00:00Z",
      "powerKw": 1169.47
    },
    {
      "timestampUtc": "2025-07-23T23:00:00Z",
      "powerKw": 1181.44
    },
    {
      "timestampUtc": "2025-07-24T04:00:00Z",
      "powerKw": 1183.88
    },
    {
      "timestampUtc": "2025-07-24T09:00:00Z",
      "powerKw": 1095.87
    },
    {
      "timestampUtc": "2025-07-24T14:00:00Z",
      "powerKw": 1171.33
    },
    {
      "timestampUtc": "2025-07-24T19:00:00Z",
      "powerKw": 1027.88
    },
    {
      "timestampUtc": "2025-07-25T00:00:00Z",
      "powerKw": 974.22
    },
    {
      "timestampUtc": "2025-07-25T05:00:00Z",
      "powerKw": 954.54
    },
    {
      "timestampUtc": "2025-07-25T10:00:00Z",
      "powerKw": 1162.48
    },
    {
      "timestampUtc": "2025-07-25T15:00:00Z",
      "powerKw": 1202.19
    },
    {
      "timestampUtc": "2025-07-25T20:00:00Z",
      "powerKw": 1104.16
    },
    {
      "timestampUtc": "2025-07-26T01:00:00Z",
      "powerKw": 1011.69
    },
    {
      "timestampUtc": "2025-07-26T06:00:00Z",
      "powerKw": 1014.49
    },
    {
      "timestampUtc": "2025-07-26T11:00:00Z",
      "powerKw": 1388.9
    },
    {
      "timestampUtc": "2025-07-26T16:00:00Z",
      "powerKw": 1463.07
    },
    {
      "timestampUtc": "2025-07-26T21:00:00Z",
      "powerKw": 1346.39
    },
    {
      "timestampUtc": "2025-07-27T02:00:00Z",
      "powerKw": 1236.27
    },
    {
      "timestampUtc": "2025-07-27T07:00:00Z",
      "powerKw": 1179.16
    },
    {
      "timestampUtc": "2025-07-27T12:00:00Z",
      "powerKw": 1269.51
    },
    {
      "timestampUtc": "2025-07-27T17:00:00Z",
      "powerKw": 1216.04
    },
    {
      "timestampUtc": "2025-07-27T22:00:00Z",
      "powerKw": 1136.93
    },
    {
      "timestampUtc": "2025-07-28T03:00:00Z",
      "powerKw": 1148.2
    },
    {
      "timestampUtc": "2025-07-28T08:00:00Z",
      "powerKw": 1131.61
    },
    {
      "timestampUtc": "2025-07-28T13:00:00Z",
      "powerKw": 1201.66
    },
    {
      "timestampUtc": "2025-07-28T18:00:00Z",
      "powerKw": 1295.42
    },
    {
      "timestampUtc": "2025-07-28T23:00:00Z",
      "powerKw": 1061.26
    },
    {
      "timestampUtc": "2025-07-29T04:00:00Z",
      "powerKw": 1029.4
    },
    {
      "timestampUtc": "2025-07-29T09:00:00Z",
      "powerKw": 1322.87
    },
    {
      "timestampUtc": "2025-07-29T14:00:00Z",
      "powerKw": 1375.88
    },
    {
      "timestampUtc": "2025-07-29T19:00:00Z",
      "powerKw": 1404.76
    },
    {
      "timestampUtc": "2025-07-30T00:00:00Z",
      "powerKw": 1259.47
    },
    {
      "timestampUtc": "2025-07-30T05:00:00Z",
      "powerKw": 1193.37
    },
    {
      "timestampUtc": "2025-07-30T10:00:00Z",
      "powerKw": 1450.24
    },
    {
      "timestampUtc": "2025-07-30T15:00:00Z",
      "powerKw": 1200.01
    },
    {
      "timestampUtc": "2025-07-30T20:00:00Z",
      "powerKw": 1186.02
    },
    {
      "timestampUtc": "2025-07-31T01:00:00Z",
      "powerKw": 1187.86
    },
    {
      "timestampUtc": "2025-07-31T06:00:00Z",
      "powerKw": 1045.27
    },
    {
      "timestampUtc": "2025-07-31T11:00:00Z",
      "powerKw": 1244.74
    },
    {
      "timestampUtc": "2025-07-31T16:00:00Z",
      "powerKw": 1232.56
    },
    {
      "timestampUtc": "2025-07-31T21:00:00Z",
      "powerKw": 1296.87
    },
    {
      "timestampUtc": "2025-08-01T02:00:00Z",
      "powerKw": 1445.76
    },
    {
      "timestampUtc": "2025-08-01T07:00:00Z",
      "powerKw": 1452.91
    },
    {
      "timestampUtc": "2025-08-01T12:00:00Z",
      "powerKw": 1190.86
    },
    {
      "timestampUtc": "2025-08-01T17:00:00Z",
      "powerKw": 1179.0
    },
    {
      "timestampUtc": "2025-08-01T22:00:00Z",
      "powerKw": 1072.75
    },
    {
      "timestampUtc": "2025-08-02T03:00:00Z",
      "powerKw": 1027.37
    },
    {
      "timestampUtc": "2025-08-02T08:00:00Z",
      "powerKw": 1141.38
    },
    {
      "timestampUtc": "2025-08-02T13:00:00Z",
      "powerKw": 1251.65
    },
    {
      "timestampUtc": "2025-08-02T18:00:00Z",
      "powerKw": 1093.17
    },
    {
      "timestampUtc": "2025-08-02T23:00:00Z",
      "powerKw": 1092.97
    },
    {
      "timestampUtc": "2025-08-03T04:00:00Z",
      "powerKw": 1039.73
    },
    {
      "timestampUtc": "2025-08-03T09:00:00Z",
      "powerKw": 1037.99
    },
    {
      "timestampUtc": "2025-08-03T14:00:00Z",
      "powerKw": 1029.57
    },
    {
      "timestampUtc": "2025-08-03T19:00:00Z",
      "powerKw": 963.4
    },
    {
      "timestampUtc": "2025-08-04T00:00:00Z",
      "powerKw": 1010.6
    },
    {
      "timestampUtc": "2025-08-04T05:00:00Z",
      "powerKw": 923.11
    },
    {
      "timestampUtc": "2025-08-04T10:00:00Z",
      "powerKw": 1024.14
    },
    {
      "timestampUtc": "2025-08-04T15:00:00Z",
      "powerKw": 1046.21
    },
    {
      "timestampUtc": "2025-08-04T20:00:00Z",
      "powerKw": 928.69
    },
    {
      "timestampUtc": "2025-08-05T01:00:00Z",
      "powerKw": 845.47
    },
    {
      "timestampUtc": "2025-08-05T06:00:00Z",
      "powerKw": 768.57
    },
    {
      "timestampUtc": "2025-08-05T11:00:00Z",
      "powerKw": 913.49
    },
    {
      "timestampUtc": "2025-08-05T16:00:00Z",
      "powerKw": 889.34
    },
    {
      "timestampUtc": "2025-08-05T21:00:00Z",
      "powerKw": 789.99
    },
    {
      "timestampUtc": "2025-08-06T02:00:00Z",
      "powerKw": 783.17
    },
    {
      "timestampUtc": "2025-08-06T07:00:00Z",
      "powerKw": 884.11
    },
    {
      "timestampUtc": "2025-08-06T12:00:00Z",
      "powerKw": 989.82
    },
    {
      "timestampUtc": "2025-08-06T17:00:00Z",
      "powerKw": 902.25
    },
    {
      "timestampUtc": "2025-08-06T22:00:00Z",
      "powerKw": 754.86
    },
    {
      "timestampUtc": "2025-08-07T03:00:00Z",
      "powerKw": 746.09
    },
    {
      "timestampUtc": "2025-08-07T08:00:00Z",
      "powerKw": 816.09
    },
    {
      "timestampUtc": "2025-08-07T13:00:00Z",
      "powerKw": 915.29
    },
    {
      "timestampUtc": "2025-08-07T18:00:00Z",
      "powerKw": 868.13
    },
    {
      "timestampUtc": "2025-08-07T23:00:00Z",
      "powerKw": 740.08
    },
    {
      "timestampUtc": "2025-08-08T04:00:00Z",
      "powerKw": 732.97
    },
    {
      "timestampUtc": "2025-08-08T09:00:00Z",
      "powerKw": 816.12
    },
    {
      "timestampUtc": "2025-08-08T14:00:00Z",
      "powerKw": 957.84
    },
    {
      "timestampUtc": "2025-08-08T19:00:00Z",
      "powerKw": 878.22
    },
    {
      "timestampUtc": "2025-08-09T00:00:00Z",
      "powerKw": 844.3
    },
    {
      "timestampUtc": "2025-08-09T05:00:00Z",
      "powerKw": 826.88
    },
    {
      "timestampUtc": "2025-08-09T10:00:00Z",
      "powerKw": 1056.82
    },
    {
      "timestampUtc": "2025-08-09T15:00:00Z",
      "powerKw": 1048.6
    },
    {
      "timestampUtc": "2025-08-09T20:00:00Z",
      "powerKw": 931.69
    },
    {
      "timestampUtc": "2025-08-10T01:00:00Z",
      "powerKw": 807.16
    },
    {
      "timestampUtc": "2025-08-10T06:00:00Z",
      "powerKw": 804.64
    },
    {
      "timestampUtc": "2025-08-10T11:00:00Z",
      "powerKw": 993.18
    },
    {
      "timestampUtc": "2025-08-10T16:00:00Z",
      "powerKw": 981.64
    },
    {
      "timestampUtc": "2025-08-10T21:00:00Z",
      "powerKw": 763.67
    },
    {
      "timestampUtc": "2025-08-11T02:00:00Z",
      "powerKw": 837.39
    },
    {
      "timestampUtc": "2025-08-11T07:00:00Z",
      "powerKw": 838.45
    },
    {
      "timestampUtc": "2025-08-11T12:00:00Z",
      "powerKw": 1156.15
    },
    {
      "timestampUtc": "2025-08-11T17:00:00Z",
      "powerKw": 1074.59
    },
    {
      "timestampUtc": "2025-08-11T22:00:00Z",
      "powerKw": 954.94
    },
    {
      "timestampUtc": "2025-08-12T03:00:00Z",
      "powerKw": 823.75
    },
    {
      "timestampUtc": "2025-08-12T08:00:00Z",
      "powerKw": 1059.25
    },
    {
      "timestampUtc": "2025-08-12T13:00:00Z",
      "powerKw": 1159.2
    },
    {
      "timestampUtc": "2025-08-12T18:00:00Z",
      "powerKw": 1169.93
    },
    {
      "timestampUtc": "2025-08-12T23:00:00Z",
      "powerKw": 1076.81
    },
    {
      "timestampUtc": "2025-08-13T04:00:00Z",
      "powerKw": 1158.76
    },
    {
      "timestampUtc": "2025-08-13T09:00:00Z",
      "powerKw": 1243.53
    },
    {
      "timestampUtc": "2025-08-13T14:00:00Z",
      "powerKw": 1389.46
    },
    {
      "timestampUtc": "2025-08-13T19:00:00Z",
      "powerKw": 1218.69
    },
    {
      "timestampUtc": "2025-08-14T00:00:00Z",
      "powerKw": 1265.27
    },
    {
      "timestampUtc": "2025-08-14T05:00:00Z",
      "powerKw": 1146.27
    },
    {
      "timestampUtc": "2025-08-14T10:00:00Z",
      "powerKw": 1305.15
    },
    {
      "timestampUtc": "2025-08-14T15:00:00Z",
      "powerKw": 1352.66
    },
    {
      "timestampUtc": "2025-08-14T20:00:00Z",
      "powerKw": 1185.99
    },
    {
      "timestampUtc": "2025-08-15T01:00:00Z",
      "powerKw": 1279.22
    },
    {
      "timestampUtc": "2025-08-15T06:00:00Z",
      "powerKw": 1255.88
    },
    {
      "timestampUtc": "2025-08-15T11:00:00Z",
      "powerKw": 1263.06
    },
    {
      "timestampUtc": "2025-08-15T16:00:00Z",
      "powerKw": 1252.9
    },
    {
      "timestampUtc": "2025-08-15T21:00:00Z",
      "powerKw": 1050.73
    },
    {
      "timestampUtc": "2025-08-16T02:00:00Z",
      "powerKw": 1123.04
    },
    {
      "timestampUtc": "2025-08-16T07:00:00Z",
      "powerKw": 1216.25
    },
    {
      "timestampUtc": "2025-08-16T12:00:00Z",
      "powerKw": 1297.12
    },
    {
      "timestampUtc": "2025-08-16T17:00:00Z",
      "powerKw": 1194.88
    },
    {
      "timestampUtc": "2025-08-16T22:00:00Z",
      "powerKw": 1081.57
    },
    {
      "timestampUtc": "2025-08-17T03:00:00Z",
      "powerKw": 1083.74
    },
    {
      "timestampUtc": "2025-08-17T08:00:00Z",
      "powerKw": 1109.08
    },
    {
      "timestampUtc": "2025-08-17T13:00:00Z",
      "powerKw": 1336.57
    },
    {
      "timestampUtc": "2025-08-17T18:00:00Z",
      "powerKw": 1250.38
    },
    {
      "timestampUtc": "2025-08-17T23:00:00Z",
      "powerKw": 1067.36
    },
    {
      "timestampUtc": "2025-08-18T04:00:00Z",
      "powerKw": 1028.17
    },
    {
      "timestampUtc": "2025-08-18T09:00:00Z",
      "powerKw": 1122.51
    },
    {
      "timestampUtc": "2025-08-18T14:00:00Z",
      "powerKw": 1085.81
    },
    {
      "timestampUtc": "2025-08-18T19:00:00Z",
      "powerKw": 1035.89
    },
    {
      "timestampUtc": "2025-08-19T00:00:00Z",
      "powerKw": 870.66
    },
    {
      "timestampUtc": "2025-08-19T05:00:00Z",
      "powerKw": 914.63
    },
    {
      "timestampUtc": "2025-08-19T10:00:00Z",
      "powerKw": 1103.66
    },
    {
      "timestampUtc": "2025-08-19T15:00:00Z",
      "powerKw": 1141.2
    },
    {
      "timestampUtc": "2025-08-19T20:00:00Z",
      "powerKw": 1024.79
    },
    {
      "timestampUtc": "2025-08-20T01:00:00Z",
      "powerKw": 988.63
    },
    {
      "timestampUtc": "2025-08-20T06:00:00Z",
      "powerKw": 964.55
    },
    {
      "timestampUtc": "2025-08-20T11:00:00Z",
      "powerKw": 1115.62
    },
    {
      "timestampUtc": "2025-08-20T16:00:00Z",
      "powerKw": 1160.59
    },
    {
      "timestampUtc": "2025-08-20T21:00:00Z",
      "powerKw": 1000.1
    },
    {
      "timestampUtc": "2025-08-21T02:00:00Z",
      "powerKw": 919.81
    },
    {
      "timestampUtc": "2025-08-21T07:00:00Z",
      "powerKw": 973.65
    },
    {
      "timestampUtc": "2025-08-21T12:00:00Z",
      "powerKw": 1163.37
    },
    {
      "timestampUtc": "2025-08-21T17:00:00Z",
      "powerKw": 1169.09
    },
    {
      "timestampUtc": "2025-08-21T22:00:00Z",
      "powerKw": 1115.42
    },
    {
      "timestampUtc": "2025-08-22T03:00:00Z",
      "powerKw": 1382.64
    },
    {
      "timestampUtc": "2025-08-22T08:00:00Z",
      "powerKw": 1258.33
    },
    {
      "timestampUtc": "2025-08-22T13:00:00Z",
      "powerKw": 1411.72
    },
    {
      "timestampUtc": "2025-08-22T18:00:00Z",
      "powerKw": 1325.67
    },
    {
      "timestampUtc": "2025-08-22T23:00:00Z",
      "powerKw": 1240.34
    },
    {
      "timestampUtc": "2025-08-23T04:00:00Z",
      "powerKw": 1172.01
    },
    {
      "timestampUtc": "2025-08-23T09:00:00Z",
      "powerKw": 1180.43
    },
    {
      "timestampUtc": "2025-08-23T14:00:00Z",
      "powerKw": 1244.18
    },
    {
      "timestampUtc": "2025-08-23T19:00:00Z",
      "powerKw": 1155.56
    },
    {
      "timestampUtc": "2025-08-24T00:00:00Z",
      "powerKw": 1037.73
    },
    {
      "timestampUtc": "2025-08-24T05:00:00Z",
      "powerKw": 1022.1
    },
    {
      "timestampUtc": "2025-08-24T10:00:00Z",
      "powerKw": 1157.47
    },
    {
      "timestampUtc": "2025-08-24T15:00:00Z",
      "powerKw": 1224.78
    },
    {
      "timestampUtc": "2025-08-24T20:00:00Z",
      "powerKw": 1188.13
    },
    {
      "timestampUtc": "2025-08-25T01:00:00Z",
      "powerKw": 1081.98
    },
    {
      "timestampUtc": "2025-08-25T06:00:00Z",
      "powerKw": 969.1
    },
    {
      "timestampUtc": "2025-08-25T11:00:00Z",
      "powerKw": 1081.83
    },
    {
      "timestampUtc": "2025-08-25T16:00:00Z",
      "powerKw": 1153.03
    },
    {
      "timestampUtc": "2025-08-25T21:00:00Z",
      "powerKw": 989.18
    },
    {
      "timestampUtc": "2025-08-26T02:00:00Z",
      "powerKw": 1053.26
    },
    {
      "timestampUtc": "2025-08-26T07:00:00Z",
      "powerKw": 1082.32
    },
    {
      "timestampUtc": "2025-08-26T12:00:00Z",
      "powerKw": 1210.46
    },
    {
      "timestampUtc": "2025-08-26T17:00:00Z",
      "powerKw": 1147.89
    },
    {
      "timestampUtc": "2025-08-26T22:00:00Z",
      "powerKw": 1125.15
    },
    {
      "timestampUtc": "2025-08-27T03:00:00Z",
      "powerKw": 1162.08
    },
    {
      "timestampUtc": "2025-08-27T08:00:00Z",
      "powerKw": 1203.19
    },
    {
      "timestampUtc": "2025-08-27T13:00:00Z",
      "powerKw": 1176.89
    },
    {
      "timestampUtc": "2025-08-27T18:00:00Z",
      "powerKw": 1035.99
    },
    {
      "timestampUtc": "2025-08-27T23:00:00Z",
      "powerKw": 910.7
    },
    {
      "timestampUtc": "2025-08-28T04:00:00Z",
      "powerKw": 996.06
    },
    {
      "timestampUtc": "2025-08-28T09:00:00Z",
      "powerKw": 993.88
    },
    {
      "timestampUtc": "2025-08-28T14:00:00Z",
      "powerKw": 1196.56
    },
    {
      "timestampUtc": "2025-08-28T19:00:00Z",
      "powerKw": 1092.75
    },
    {
      "timestampUtc": "2025-08-29T00:00:00Z",
      "powerKw": 1070.63
    },
    {
      "timestampUtc": "2025-08-29T05:00:00Z",
      "powerKw": 1002.59
    },
    {
      "timestampUtc": "2025-08-29T10:00:00Z",
      "powerKw": 1088.68
    },
    {
      "timestampUtc": "2025-08-29T15:00:00Z",
      "powerKw": 1378.05
    },
    {
      "timestampUtc": "2025-08-29T20:00:00Z",
      "powerKw": 1283.34
    },
    {
      "timestampUtc": "2025-08-30T01:00:00Z",
      "powerKw": 1200.91
    },
    {
      "timestampUtc": "2025-08-30T06:00:00Z",
      "powerKw": 1196.06
    },
    {
      "timestampUtc": "2025-08-30T11:00:00Z",
      "powerKw": 1336.6
    },
    {
      "timestampUtc": "2025-08-30T16:00:00Z",
      "powerKw": 1329.68
    },
    {
      "timestampUtc": "2025-08-30T21:00:00Z",
      "powerKw": 1173.87
    },
    {
      "timestampUtc": "2025-08-31T02:00:00Z",
      "powerKw": 1090.35
    },
    {
      "timestampUtc": "2025-08-31T07:00:00Z",
      "powerKw": 1178.47
    },
    {
      "timestampUtc": "2025-08-31T12:00:00Z",
      "powerKw": 1422.53
    },
    {
      "timestampUtc": "2025-08-31T17:00:00Z",
      "powerKw": 1375.0
    },
    {
      "timestampUtc": "2025-08-31T22:00:00Z",
      "powerKw": 1274.29
    },
    {
      "timestampUtc": "2025-09-01T03:00:00Z",
      "powerKw": 1136.03
    },
    {
      "timestampUtc": "2025-09-01T08:00:00Z",
      "powerKw": 1159.57
    },
    {
      "timestampUtc": "2025-09-01T13:00:00Z",
      "powerKw": 1082.35
    },
    {
      "timestampUtc": "2025-09-01T18:00:00Z",
      "powerKw": 1087.11
    },
    {
      "timestampUtc": "2025-09-01T23:00:00Z",
      "powerKw": 927.45
    },
    {
      "timestampUtc": "2025-09-02T04:00:00Z",
      "powerKw": 896.84
    },
    {
      "timestampUtc": "2025-09-02T09:00:00Z",
      "powerKw": 980.79
    },
    {
      "timestampUtc": "2025-09-02T14:00:00Z",
      "powerKw": 1020.39
    },
    {
      "timestampUtc": "2025-09-02T19:00:00Z",
      "powerKw": 973.14
    },
    {
      "timestampUtc": "2025-09-03T00:00:00Z",
      "powerKw": 936.57
    },
    {
      "timestampUtc": "2025-09-03T05:00:00Z",
      "powerKw": 1014.12
    },
    {
      "timestampUtc": "2025-09-03T10:00:00Z",
      "powerKw": 1130.05
    },
    {
      "timestampUtc": "2025-09-03T15:00:00Z",
      "powerKw": 1194.53
    },
    {
      "timestampUtc": "2025-09-03T20:00:00Z",
      "powerKw": 1038.77
    },
    {
      "timestampUtc": "2025-09-04T01:00:00Z",
      "powerKw": 1073.25
    },
    {
      "timestampUtc": "2025-09-04T06:00:00Z",
      "powerKw": 1073.48
    },
    {
      "timestampUtc": "2025-09-04T11:00:00Z",
      "powerKw": 1200.14
    },
    {
      "timestampUtc": "2025-09-04T16:00:00Z",
      "powerKw": 1373.17
    },
    {
      "timestampUtc": "2025-09-04T21:00:00Z",
      "powerKw": 1311.75
    },
    {
      "timestampUtc": "2025-09-05T02:00:00Z",
      "powerKw": 1180.42
    },
    {
      "timestampUtc": "2025-09-05T07:00:00Z",
      "powerKw": 919.76
    },
    {
      "timestampUtc": "2025-09-05T12:00:00Z",
      "powerKw": 1156.66
    },
    {
      "timestampUtc": "2025-09-05T17:00:00Z",
      "powerKw": 1100.03
    },
    {
      "timestampUtc": "2025-09-05T22:00:00Z",
      "powerKw": 1008.18
    },
    {
      "timestampUtc": "2025-09-06T03:00:00Z",
      "powerKw": 981.14
    },
    {
      "timestampUtc": "2025-09-06T08:00:00Z",
      "powerKw": 1062.69
    },
    {
      "timestampUtc": "2025-09-06T13:00:00Z",
      "powerKw": 1206.22
    },
    {
      "timestampUtc": "2025-09-06T18:00:00Z",
      "powerKw": 1133.84
    },
    {
      "timestampUtc": "2025-09-06T23:00:00Z",
      "powerKw": 1127.65
    },
    {
      "timestampUtc": "2025-09-07T04:00:00Z",
      "powerKw": 1078.72
    },
    {
      "timestampUtc": "2025-09-07T09:00:00Z",
      "powerKw": 1167.45
    },
    {
      "timestampUtc": "2025-09-07T14:00:00Z",
      "powerKw": 1211.28
    },
    {
      "timestampUtc": "2025-09-07T19:00:00Z",
      "powerKw": 1073.39
    },
    {
      "timestampUtc": "2025-09-08T00:00:00Z",
      "powerKw": 1089.27
    },
    {
      "timestampUtc": "2025-09-08T05:00:00Z",
      "powerKw": 1025.25
    },
    {
      "timestampUtc": "2025-09-08T10:00:00Z",
      "powerKw": 1130.33
    },
    {
      "timestampUtc": "2025-09-08T15:00:00Z",
      "powerKw": 1044.18
    },
    {
      "timestampUtc": "2025-09-08T20:00:00Z",
      "powerKw": 1000.33
    },
    {
      "timestampUtc": "2025-09-09T01:00:00Z",
      "powerKw": 877.18
    },
    {
      "timestampUtc": "2025-09-09T06:00:00Z",
      "powerKw": 873.32
    },
    {
      "timestampUtc": "2025-09-09T11:00:00Z",
      "powerKw": 1079.52
    },
    {
      "timestampUtc": "2025-09-09T16:00:00Z",
      "powerKw": 1056.09
    },
    {
      "timestampUtc": "2025-09-09T21:00:00Z",
      "powerKw": 1004.69
    },
    {
      "timestampUtc": "2025-09-10T02:00:00Z",
      "powerKw": 927.62
    },
    {
      "timestampUtc": "2025-09-10T07:00:00Z",
      "powerKw": 882.68
    },
    {
      "timestampUtc": "2025-09-10T12:00:00Z",
      "powerKw": 991.93
    },
    {
      "timestampUtc": "2025-09-10T17:00:00Z",
      "powerKw": 876.29
    },
    {
      "timestampUtc": "2025-09-10T22:00:00Z",
      "powerKw": 902.54
    },
    {
      "timestampUtc": "2025-09-11T03:00:00Z",
      "powerKw": 887.43
    },
    {
      "timestampUtc": "2025-09-11T08:00:00Z",
      "powerKw": 954.82
    },
    {
      "timestampUtc": "2025-09-11T13:00:00Z",
      "powerKw": 1068.17
    },
    {
      "timestampUtc": "2025-09-11T18:00:00Z",
      "powerKw": 988.69
    },
    {
      "timestampUtc": "2025-09-11T23:00:00Z",
      "powerKw": 974.2
    },
    {
      "timestampUtc": "2025-09-12T04:00:00Z",
      "powerKw": 934.86
    },
    {
      "timestampUtc": "2025-09-12T09:00:00Z",
      "powerKw": 1146.5
    },
    {
      "timestampUtc": "2025-09-12T14:00:00Z",
      "powerKw": 1289.64
    },
    {
      "timestampUtc": "2025-09-12T19:00:00Z",
      "powerKw": 1232.23
    },
    {
      "timestampUtc": "2025-09-13T00:00:00Z",
      "powerKw": 1066.25
    },
    {
      "timestampUtc": "2025-09-13T05:00:00Z",
      "powerKw": 1037.45
    },
    {
      "timestampUtc": "2025-09-13T10:00:00Z",
      "powerKw": 1145.05
    },
    {
      "timestampUtc": "2025-09-13T15:00:00Z",
      "powerKw": 1196.41
    },
    {
      "timestampUtc": "2025-09-13T20:00:00Z",
      "powerKw": 1061.07
    },
    {
      "timestampUtc": "2025-09-14T01:00:00Z",
      "powerKw": 1029.97
    },
    {
      "timestampUtc": "2025-09-14T06:00:00Z",
      "powerKw": 968.92
    },
    {
      "timestampUtc": "2025-09-14T11:00:00Z",
      "powerKw": 1005.73
    },
    {
      "timestampUtc": "2025-09-14T16:00:00Z",
      "powerKw": 1044.42
    },
    {
      "timestampUtc": "2025-09-14T21:00:00Z",
      "powerKw": 944.39
    },
    {
      "timestampUtc": "2025-09-15T02:00:00Z",
      "powerKw": 906.05
    },
    {
      "timestampUtc": "2025-09-15T07:00:00Z",
      "powerKw": 830.46
    },
    {
      "timestampUtc": "2025-09-15T12:00:00Z",
      "powerKw": 993.01
    },
    {
      "timestampUtc": "2025-09-15T17:00:00Z",
      "powerKw": 881.97
    },
    {
      "timestampUtc": "2025-09-15T22:00:00Z",
      "powerKw": 755.11
    },
    {
      "timestampUtc": "2025-09-16T03:00:00Z",
      "powerKw": 710.78
    },
    {
      "timestampUtc": "2025-09-16T08:00:00Z",
      "powerKw": 749.08
    },
    {
      "timestampUtc": "2025-09-16T13:00:00Z",
      "powerKw": 725.2
    },
    {
      "timestampUtc": "2025-09-16T18:00:00Z",
      "powerKw": 735.2
    },
    {
      "timestampUtc": "2025-09-16T23:00:00Z",
      "powerKw": 740.63
    },
    {
      "timestampUtc": "2025-09-17T04:00:00Z",
      "powerKw": 721.57
    },
    {
      "timestampUtc": "2025-09-17T09:00:00Z",
      "powerKw": 800.54
    },
    {
      "timestampUtc": "2025-09-17T14:00:00Z",
      "powerKw": 932.26
    },
    {
      "timestampUtc": "2025-09-17T19:00:00Z",
      "powerKw": 1141.35
    },
    {
      "timestampUtc": "2025-09-18T00:00:00Z",
      "powerKw": 1255.09
    },
    {
      "timestampUtc": "2025-09-18T05:00:00Z",
      "powerKw": 1188.45
    },
    {
      "timestampUtc": "2025-09-18T10:00:00Z",
      "powerKw": 1386.56
    },
    {
      "timestampUtc": "2025-09-18T15:00:00Z",
      "powerKw": 1542.12
    },
    {
      "timestampUtc": "2025-09-18T20:00:00Z",
      "powerKw": 1530.2
    },
    {
      "timestampUtc": "2025-09-19T01:00:00Z",
      "powerKw": 1523.81
    },
    {
      "timestampUtc": "2025-09-19T06:00:00Z",
      "powerKw": 1482.26
    },
    {
      "timestampUtc": "2025-09-19T11:00:00Z",
      "powerKw": 1684.19
    },
    {
      "timestampUtc": "2025-09-19T16:00:00Z",
      "powerKw": 1850.12
    },
    {
      "timestampUtc": "2025-09-19T21:00:00Z",
      "powerKw": 1747.42
    },
    {
      "timestampUtc": "2025-09-20T02:00:00Z",
      "powerKw": 1626.74
    },
    {
      "timestampUtc": "2025-09-20T07:00:00Z",
      "powerKw": 1723.92
    },
    {
      "timestampUtc": "2025-09-20T12:00:00Z",
      "powerKw": 2095.52
    },
    {
      "timestampUtc": "2025-09-20T17:00:00Z",
      "powerKw": 1935.6
    },
    {
      "timestampUtc": "2025-09-20T22:00:00Z",
      "powerKw": 1668.37
    },
    {
      "timestampUtc": "2025-09-21T03:00:00Z",
      "powerKw": 1713.47
    },
    {
      "timestampUtc": "2025-09-21T08:00:00Z",
      "powerKw": 1745.26
    },
    {
      "timestampUtc": "2025-09-21T13:00:00Z",
      "powerKw": 1765.27
    },
    {
      "timestampUtc": "2025-09-21T18:00:00Z",
      "powerKw": 1635.69
    },
    {
      "timestampUtc": "2025-09-21T23:00:00Z",
      "powerKw": 1559.81
    },
    {
      "timestampUtc": "2025-09-22T04:00:00Z",
      "powerKw": 1476.04
    },
    {
      "timestampUtc": "2025-09-22T09:00:00Z",
      "powerKw": 1520.47
    },
    {
      "timestampUtc": "2025-09-22T14:00:00Z",
      "powerKw": 1484.57
    },
    {
      "timestampUtc": "2025-09-22T19:00:00Z",
      "powerKw": 1356.34
    },
    {
      "timestampUtc": "2025-09-23T00:00:00Z",
      "powerKw": 926.84
    },
    {
      "timestampUtc": "2025-09-23T05:00:00Z",
      "powerKw": 914.71
    },
    {
      "timestampUtc": "2025-09-23T10:00:00Z",
      "powerKw": 986.64
    },
    {
      "timestampUtc": "2025-09-23T15:00:00Z",
      "powerKw": 1001.9
    },
    {
      "timestampUtc": "2025-09-23T20:00:00Z",
      "powerKw": 829.89
    },
    {
      "timestampUtc": "2025-09-24T01:00:00Z",
      "powerKw": 857.21
    },
    {
      "timestampUtc": "2025-09-24T06:00:00Z",
      "powerKw": 821.27
    },
    {
      "timestampUtc": "2025-09-24T11:00:00Z",
      "powerKw": 1012.69
    },
    {
      "timestampUtc": "2025-09-24T16:00:00Z",
      "powerKw": 954.86
    },
    {
      "timestampUtc": "2025-09-24T21:00:00Z",
      "powerKw": 856.6
    },
    {
      "timestampUtc": "2025-09-25T02:00:00Z",
      "powerKw": 731.11
    },
    {
      "timestampUtc": "2025-09-25T07:00:00Z",
      "powerKw": 744.89
    },
    {
      "timestampUtc": "2025-09-25T12:00:00Z",
      "powerKw": 1030.93
    },
    {
      "timestampUtc": "2025-09-25T17:00:00Z",
      "powerKw": 1129.38
    },
    {
      "timestampUtc": "2025-09-25T22:00:00Z",
      "powerKw": 1222.71
    },
    {
      "timestampUtc": "2025-09-26T03:00:00Z",
      "powerKw": 1259.61
    },
    {
      "timestampUtc": "2025-09-26T08:00:00Z",
      "powerKw": 1261.99
    },
    {
      "timestampUtc": "2025-09-26T13:00:00Z",
      "powerKw": 1521.09
    },
    {
      "timestampUtc": "2025-09-26T18:00:00Z",
      "powerKw": 1679.01
    },
    {
      "timestampUtc": "2025-09-26T23:00:00Z",
      "powerKw": 1615.79
    },
    {
      "timestampUtc": "2025-09-27T04:00:00Z",
      "powerKw": 1573.2
    },
    {
      "timestampUtc": "2025-09-27T09:00:00Z",
      "powerKw": 1626.03
    },
    {
      "timestampUtc": "2025-09-27T14:00:00Z",
      "powerKw": 1771.13
    },
    {
      "timestampUtc": "2025-09-27T19:00:00Z",
      "powerKw": 1658.72
    },
    {
      "timestampUtc": "2025-09-28T00:00:00Z",
      "powerKw": 1646.55
    },
    {
      "timestampUtc": "2025-09-28T05:00:00Z",
      "powerKw": 1526.24
    },
    {
      "timestampUtc": "2025-09-28T10:00:00Z",
      "powerKw": 1663.44
    },
    {
      "timestampUtc": "2025-09-28T15:00:00Z",
      "powerKw": 1739.08
    },
    {
      "timestampUtc": "2025-09-28T20:00:00Z",
      "powerKw": 1543.87
    },
    {
      "timestampUtc": "2025-09-29T01:00:00Z",
      "powerKw": 1399.33
    },
    {
      "timestampUtc": "2025-09-29T06:00:00Z",
      "powerKw": 1262.75
    },
    {
      "timestampUtc": "2025-09-29T11:00:00Z",
      "powerKw": 1514.9
    },
    {
      "timestampUtc": "2025-09-29T16:00:00Z",
      "powerKw": 1459.69
    },
    {
      "timestampUtc": "2025-09-29T21:00:00Z",
      "powerKw": 1414.1
    },
    {
      "timestampUtc": "2025-09-30T02:00:00Z",
      "powerKw": 1358.66
    },
    {
      "timestampUtc": "2025-09-30T07:00:00Z",
      "powerKw": 1109.02
    },
    {
      "timestampUtc": "2025-09-30T12:00:00Z",
      "powerKw": 1213.9
    },
    {
      "timestampUtc": "2025-09-30T17:00:00Z",
      "powerKw": 997.77
    },
    {
      "timestampUtc": "2025-09-30T22:00:00Z",
      "powerKw": 845.0
    },
    {
      "timestampUtc": "2025-10-01T03:00:00Z",
      "powerKw": 788.6
    },
    {
      "timestampUtc": "2025-10-01T08:00:00Z",
      "powerKw": 788.57
    },
    {
      "timestampUtc": "2025-10-01T13:00:00Z",
      "powerKw": 935.85
    },
    {
      "timestampUtc": "2025-10-01T18:00:00Z",
      "powerKw": 915.1
    },
    {
      "timestampUtc": "2025-10-01T23:00:00Z",
      "powerKw": 976.39
    },
    {
      "timestampUtc": "2025-10-02T04:00:00Z",
      "powerKw": 885.29
    },
    {
      "timestampUtc": "2025-10-02T09:00:00Z",
      "powerKw": 1023.9
    },
    {
      "timestampUtc": "2025-10-02T14:00:00Z",
      "powerKw": 1258.92
    },
    {
      "timestampUtc": "2025-10-02T19:00:00Z",
      "powerKw": 1065.6
    },
    {
      "timestampUtc": "2025-10-03T00:00:00Z",
      "powerKw": 1122.63
    },
    {
      "timestampUtc": "2025-10-03T05:00:00Z",
      "powerKw": 1076.0
    },
    {
      "timestampUtc": "2025-10-03T10:00:00Z",
      "powerKw": 1210.51
    },
    {
      "timestampUtc": "2025-10-03T15:00:00Z",
      "powerKw": 1241.57
    },
    {
      "timestampUtc": "2025-10-03T20:00:00Z",
      "powerKw": 1173.18
    },
    {
      "timestampUtc": "2025-10-04T01:00:00Z",
      "powerKw": 1266.2
    },
    {
      "timestampUtc": "2025-10-04T06:00:00Z",
      "powerKw": 1262.95
    },
    {
      "timestampUtc": "2025-10-04T11:00:00Z",
      "powerKw": 1367.6
    },
    {
      "timestampUtc": "2025-10-04T16:00:00Z",
      "powerKw": 1314.09
    },
    {
      "timestampUtc": "2025-10-04T21:00:00Z",
      "powerKw": 1195.89
    },
    {
      "timestampUtc": "2025-10-05T02:00:00Z",
      "powerKw": 1208.18
    },
    {
      "timestampUtc": "2025-10-05T07:00:00Z",
      "powerKw": 1215.67
    },
    {
      "timestampUtc": "2025-10-05T12:00:00Z",
      "powerKw": 1295.87
    },
    {
      "timestampUtc": "2025-10-05T17:00:00Z",
      "powerKw": 1197.98
    },
    {
      "timestampUtc": "2025-10-05T22:00:00Z",
      "powerKw": 1204.36
    },
    {
      "timestampUtc": "2025-10-06T03:00:00Z",
      "powerKw": 1245.62
    },
    {
      "timestampUtc": "2025-10-06T08:00:00Z",
      "powerKw": 1281.23
    },
    {
      "timestampUtc": "2025-10-06T13:00:00Z",
      "powerKw": 1334.21
    },
    {
      "timestampUtc": "2025-10-06T18:00:00Z",
      "powerKw": 1341.84
    },
    {
      "timestampUtc": "2025-10-06T23:00:00Z",
      "powerKw": 1529.3
    },
    {
      "timestampUtc": "2025-10-07T04:00:00Z",
      "powerKw": 1521.66
    },
    {
      "timestampUtc": "2025-10-07T09:00:00Z",
      "powerKw": 1403.62
    },
    {
      "timestampUtc": "2025-10-07T14:00:00Z",
      "powerKw": 1530.69
    },
    {
      "timestampUtc": "2025-10-07T19:00:00Z",
      "powerKw": 1546.68
    },
    {
      "timestampUtc": "2025-10-08T00:00:00Z",
      "powerKw": 1069.05
    },
    {
      "timestampUtc": "2025-10-08T05:00:00Z",
      "powerKw": 1035.78
    },
    {
      "timestampUtc": "2025-10-08T10:00:00Z",
      "powerKw": 1089.09
    },
    {
      "timestampUtc": "2025-10-08T15:00:00Z",
      "powerKw": 1136.75
    },
    {
      "timestampUtc": "2025-10-08T20:00:00Z",
      "powerKw": 1204.09
    },
    {
      "timestampUtc": "2025-10-09T01:00:00Z",
      "powerKw": 1108.65
    },
    {
      "timestampUtc": "2025-10-09T06:00:00Z",
      "powerKw": 1033.54
    },
    {
      "timestampUtc": "2025-10-09T11:00:00Z",
      "powerKw": 1369.08
    },
    {
      "timestampUtc": "2025-10-09T16:00:00Z",
      "powerKw": 1358.09
    },
    {
      "timestampUtc": "2025-10-09T21:00:00Z",
      "powerKw": 1417.13
    },
    {
      "timestampUtc": "2025-10-10T02:00:00Z",
      "powerKw": 1407.9
    },
    {
      "timestampUtc": "2025-10-10T07:00:00Z",
      "powerKw": 1480.38
    },
    {
      "timestampUtc": "2025-10-10T12:00:00Z",
      "powerKw": 1573.27
    },
    {
      "timestampUtc": "2025-10-10T17:00:00Z",
      "powerKw": 1520.91
    },
    {
      "timestampUtc": "2025-10-10T22:00:00Z",
      "powerKw": 1556.43
    },
    {
      "timestampUtc": "2025-10-11T03:00:00Z",
      "powerKw": 1590.61
    },
    {
      "timestampUtc": "2025-10-11T08:00:00Z",
      "powerKw": 1619.11
    },
    {
      "timestampUtc": "2025-10-11T13:00:00Z",
      "powerKw": 1670.57
    },
    {
      "timestampUtc": "2025-10-11T18:00:00Z",
      "powerKw": 1599.1
    },
    {
      "timestampUtc": "2025-10-11T23:00:00Z",
      "powerKw": 1564.12
    },
    {
      "timestampUtc": "2025-10-12T04:00:00Z",
      "powerKw": 1577.5
    },
    {
      "timestampUtc": "2025-10-12T09:00:00Z",
      "powerKw": 1464.25
    },
    {
      "timestampUtc": "2025-10-12T14:00:00Z",
      "powerKw": 1613.93
    },
    {
      "timestampUtc": "2025-10-12T19:00:00Z",
      "powerKw": 1389.73
    },
    {
      "timestampUtc": "2025-10-13T00:00:00Z",
      "powerKw": 1285.32
    },
    {
      "timestampUtc": "2025-10-13T05:00:00Z",
      "powerKw": 1280.17
    },
    {
      "timestampUtc": "2025-10-13T10:00:00Z",
      "powerKw": 1371.72
    },
    {
      "timestampUtc": "2025-10-13T15:00:00Z",
      "powerKw": 1127.5
    },
    {
      "timestampUtc": "2025-10-13T20:00:00Z",
      "powerKw": 1124.21
    },
    {
      "timestampUtc": "2025-10-14T01:00:00Z",
      "powerKw": 1266.04
    },
    {
      "timestampUtc": "2025-10-14T06:00:00Z",
      "powerKw": 1357.78
    },
    {
      "timestampUtc": "2025-10-14T11:00:00Z",
      "powerKw": 1411.62
    },
    {
      "timestampUtc": "2025-10-14T16:00:00Z",
      "powerKw": 1355.87
    },
    {
      "timestampUtc": "2025-10-14T21:00:00Z",
      "powerKw": 1368.78
    },
    {
      "timestampUtc": "2025-10-15T02:00:00Z",
      "powerKw": 1381.06
    },
    {
      "timestampUtc": "2025-10-15T07:00:00Z",
      "powerKw": 1406.64
    },
    {
      "timestampUtc": "2025-10-15T12:00:00Z",
      "powerKw": 1401.56
    },
    {
      "timestampUtc": "2025-10-15T17:00:00Z",
      "powerKw": 1390.82
    },
    {
      "timestampUtc": "2025-10-15T22:00:00Z",
      "powerKw": 1378.0
    },
    {
      "timestampUtc": "2025-10-16T03:00:00Z",
      "powerKw": 1355.6
    },
    {
      "timestampUtc": "2025-10-16T08:00:00Z",
      "powerKw": 1362.2
    },
    {
      "timestampUtc": "2025-10-16T13:00:00Z",
      "powerKw": 1634.74
    },
    {
      "timestampUtc": "2025-10-16T18:00:00Z",
      "powerKw": 1804.37
    },
    {
      "timestampUtc": "2025-10-16T23:00:00Z",
      "powerKw": 1825.93
    },
    {
      "timestampUtc": "2025-10-17T04:00:00Z",
      "powerKw": 1746.48
    },
    {
      "timestampUtc": "2025-10-17T09:00:00Z",
      "powerKw": 1919.17
    },
    {
      "timestampUtc": "2025-10-17T14:00:00Z",
      "powerKw": 1968.89
    },
    {
      "timestampUtc": "2025-10-17T19:00:00Z",
      "powerKw": 1838.87
    },
    {
      "timestampUtc": "2025-10-18T00:00:00Z",
      "powerKw": 1633.9
    },
    {
      "timestampUtc": "2025-10-18T05:00:00Z",
      "powerKw": 1588.86
    },
    {
      "timestampUtc": "2025-10-18T10:00:00Z",
      "powerKw": 1676.95
    },
    {
      "timestampUtc": "2025-10-18T15:00:00Z",
      "powerKw": 1649.08
    },
    {
      "timestampUtc": "2025-10-18T20:00:00Z",
      "powerKw": 1554.57
    },
    {
      "timestampUtc": "2025-10-19T01:00:00Z",
      "powerKw": 1423.4
    },
    {
      "timestampUtc": "2025-10-19T06:00:00Z",
      "powerKw": 1440.15
    },
    {
      "timestampUtc": "2025-10-19T11:00:00Z",
      "powerKw": 1591.88
    },
    {
      "timestampUtc": "2025-10-19T16:00:00Z",
      "powerKw": 1546.69
    },
    {
      "timestampUtc": "2025-10-19T21:00:00Z",
      "powerKw": 1483.4
    },
    {
      "timestampUtc": "2025-10-20T02:00:00Z",
      "powerKw": 1462.61
    },
    {
      "timestampUtc": "2025-10-20T07:00:00Z",
      "powerKw": 1466.28
    },
    {
      "timestampUtc": "2025-10-20T12:00:00Z",
      "powerKw": 1338.8
    },
    {
      "timestampUtc": "2025-10-20T17:00:00Z",
      "powerKw": 1488.62
    },
    {
      "timestampUtc": "2025-10-20T22:00:00Z",
      "powerKw": 1373.13
    },
    {
      "timestampUtc": "2025-10-21T03:00:00Z",
      "powerKw": 1487.67
    },
    {
      "timestampUtc": "2025-10-21T08:00:00Z",
      "powerKw": 1413.49
    },
    {
      "timestampUtc": "2025-10-21T13:00:00Z",
      "powerKw": 1486.05
    },
    {
      "timestampUtc": "2025-10-21T18:00:00Z",
      "powerKw": 1530.45
    },
    {
      "timestampUtc": "2025-10-21T23:00:00Z",
      "powerKw": 1235.91
    },
    {
      "timestampUtc": "2025-10-22T04:00:00Z",
      "powerKw": 1212.69
    },
    {
      "timestampUtc": "2025-10-22T09:00:00Z",
      "powerKw": 991.98
    },
    {
      "timestampUtc": "2025-10-22T14:00:00Z",
      "powerKw": 1113.33
    },
    {
      "timestampUtc": "2025-10-22T19:00:00Z",
      "powerKw": 1180.01
    },
    {
      "timestampUtc": "2025-10-23T00:00:00Z",
      "powerKw": 1201.81
    },
    {
      "timestampUtc": "2025-10-23T05:00:00Z",
      "powerKw": 1258.23
    },
    {
      "timestampUtc": "2025-10-23T10:00:00Z",
      "powerKw": 1374.09
    },
    {
      "timestampUtc": "2025-10-23T15:00:00Z",
      "powerKw": 1525.91
    },
    {
      "timestampUtc": "2025-10-23T20:00:00Z",
      "powerKw": 1523.22
    },
    {
      "timestampUtc": "2025-10-24T01:00:00Z",
      "powerKw": 1515.44
    },
    {
      "timestampUtc": "2025-10-24T06:00:00Z",
      "powerKw": 1460.51
    },
    {
      "timestampUtc": "2025-10-24T11:00:00Z",
      "powerKw": 1662.03
    },
    {
      "timestampUtc": "2025-10-24T16:00:00Z",
      "powerKw": 1657.89
    },
    {
      "timestampUtc": "2025-10-24T21:00:00Z",
      "powerKw": 1602.63
    },
    {
      "timestampUtc": "2025-10-25T02:00:00Z",
      "powerKw": 1582.39
    },
    {
      "timestampUtc": "2025-10-25T07:00:00Z",
      "powerKw": 1508.79
    },
    {
      "timestampUtc": "2025-10-25T12:00:00Z",
      "powerKw": 1573.86
    },
    {
      "timestampUtc": "2025-10-25T17:00:00Z",
      "powerKw": 1512.51
    },
    {
      "timestampUtc": "2025-10-25T22:00:00Z",
      "powerKw": 1503.62
    },
    {
      "timestampUtc": "2025-10-26T03:00:00Z",
      "powerKw": 1471.82
    },
    {
      "timestampUtc": "2025-10-26T08:00:00Z",
      "powerKw": 1407.09
    },
    {
      "timestampUtc": "2025-10-26T13:00:00Z",
      "powerKw": 1467.42
    },
    {
      "timestampUtc": "2025-10-26T18:00:00Z",
      "powerKw": 1447.95
    },
    {
      "timestampUtc": "2025-10-26T23:00:00Z",
      "powerKw": 1443.51
    },
    {
      "timestampUtc": "2025-10-27T04:00:00Z",
      "powerKw": 1443.62
    },
    {
      "timestampUtc": "2025-10-27T09:00:00Z",
      "powerKw": 1357.49
    },
    {
      "timestampUtc": "2025-10-27T14:00:00Z",
      "powerKw": 1388.32
    },
    {
      "timestampUtc": "2025-10-27T19:00:00Z",
      "powerKw": 1349.08
    },
    {
      "timestampUtc": "2025-10-28T00:00:00Z",
      "powerKw": 1357.44
    },
    {
      "timestampUtc": "2025-10-28T05:00:00Z",
      "powerKw": 1382.01
    },
    {
      "timestampUtc": "2025-10-28T10:00:00Z",
      "powerKw": 1380.89
    },
    {
      "timestampUtc": "2025-10-28T15:00:00Z",
      "powerKw": 1344.5
    },
    {
      "timestampUtc": "2025-10-28T20:00:00Z",
      "powerKw": 894.2
    },
    {
      "timestampUtc": "2025-10-29T01:00:00Z",
      "powerKw": 1005.32
    },
    {
      "timestampUtc": "2025-10-29T06:00:00Z",
      "powerKw": 1021.59
    },
    {
      "timestampUtc": "2025-10-29T11:00:00Z",
      "powerKw": 1111.38
    },
    {
      "timestampUtc": "2025-10-29T16:00:00Z",
      "powerKw": 1316.86
    },
    {
      "timestampUtc": "2025-10-29T21:00:00Z",
      "powerKw": 1426.55
    },
    {
      "timestampUtc": "2025-10-30T02:00:00Z",
      "powerKw": 1475.49
    },
    {
      "timestampUtc": "2025-10-30T07:00:00Z",
      "powerKw": 1599.29
    },
    {
      "timestampUtc": "2025-10-30T12:00:00Z",
      "powerKw": 1742.35
    },
    {
      "timestampUtc": "2025-10-30T17:00:00Z",
      "powerKw": 1760.42
    },
    {
      "timestampUtc": "2025-10-30T22:00:00Z",
      "powerKw": 1691.27
    },
    {
      "timestampUtc": "2025-10-31T03:00:00Z",
      "powerKw": 1602.06
    },
    {
      "timestampUtc": "2025-10-31T08:00:00Z",
      "powerKw": 1539.88
    },
    {
      "timestampUtc": "2025-10-31T13:00:00Z",
      "powerKw": 1399.15
    },
    {
      "timestampUtc": "2025-10-31T18:00:00Z",
      "powerKw": 1405.59
    },
    {
      "timestampUtc": "2025-10-31T23:00:00Z",
      "powerKw": 1452.01
    },
    {
      "timestampUtc": "2025-11-01T04:00:00Z",
      "powerKw": 1334.82
    },
    {
      "timestampUtc": "2025-11-01T09:00:00Z",
      "powerKw": 1514.52
    },
    {
      "timestampUtc": "2025-11-01T14:00:00Z",
      "powerKw": 1540.54
    },
    {
      "timestampUtc": "2025-11-01T19:00:00Z",
      "powerKw": 1581.81
    },
    {
      "timestampUtc": "2025-11-02T00:00:00Z",
      "powerKw": 1585.99
    },
    {
      "timestampUtc": "2025-11-02T05:00:00Z",
      "powerKw": 1563.88
    },
    {
      "timestampUtc": "2025-11-02T10:00:00Z",
      "powerKw": 1605.57
    },
    {
      "timestampUtc": "2025-11-02T15:00:00Z",
      "powerKw": 1683.89
    },
    {
      "timestampUtc": "2025-11-02T20:00:00Z",
      "powerKw": 1664.18
    },
    {
      "timestampUtc": "2025-11-03T01:00:00Z",
      "powerKw": 1661.35
    },
    {
      "timestampUtc": "2025-11-03T06:00:00Z",
      "powerKw": 1668.14
    },
    {
      "timestampUtc": "2025-11-03T11:00:00Z",
      "powerKw": 1697.49
    },
    {
      "timestampUtc": "2025-11-03T16:00:00Z",
      "powerKw": 1544.94
    },
    {
      "timestampUtc": "2025-11-03T21:00:00Z",
      "powerKw": 1701.71
    },
    {
      "timestampUtc": "2025-11-04T02:00:00Z",
      "powerKw": 1770.13
    },
    {
      "timestampUtc": "2025-11-04T07:00:00Z",
      "powerKw": 1695.75
    },
    {
      "timestampUtc": "2025-11-04T12:00:00Z",
      "powerKw": 1664.29
    },
    {
      "timestampUtc": "2025-11-04T17:00:00Z",
      "powerKw": 1558.11
    },
    {
      "timestampUtc": "2025-11-04T22:00:00Z",
      "powerKw": 1135.13
    },
    {
      "timestampUtc": "2025-11-05T03:00:00Z",
      "powerKw": 1171.77
    },
    {
      "timestampUtc": "2025-11-05T08:00:00Z",
      "powerKw": 1206.94
    },
    {
      "timestampUtc": "2025-11-05T13:00:00Z",
      "powerKw": 1394.54
    },
    {
      "timestampUtc": "2025-11-05T18:00:00Z",
      "powerKw": 1343.21
    },
    {
      "timestampUtc": "2025-11-05T23:00:00Z",
      "powerKw": 1378.2
    },
    {
      "timestampUtc": "2025-11-06T04:00:00Z",
      "powerKw": 1165.81
    },
    {
      "timestampUtc": "2025-11-06T09:00:00Z",
      "powerKw": 1256.51
    },
    {
      "timestampUtc": "2025-11-06T14:00:00Z",
      "powerKw": 1322.59
    },
    {
      "timestampUtc": "2025-11-06T19:00:00Z",
      "powerKw": 1296.64
    },
    {
      "timestampUtc": "2025-11-07T00:00:00Z",
      "powerKw": 1320.48
    },
    {
      "timestampUtc": "2025-11-07T05:00:00Z",
      "powerKw": 1279.03
    },
    {
      "timestampUtc": "2025-11-07T10:00:00Z",
      "powerKw": 1303.65
    },
    {
      "timestampUtc": "2025-11-07T15:00:00Z",
      "powerKw": 1488.88
    },
    {
      "timestampUtc": "2025-11-07T20:00:00Z",
      "powerKw": 1448.83
    },
    {
      "timestampUtc": "2025-11-08T01:00:00Z",
      "powerKw": 1595.64
    },
    {
      "timestampUtc": "2025-11-08T06:00:00Z",
      "powerKw": 1598.72
    },
    {
      "timestampUtc": "2025-11-08T11:00:00Z",
      "powerKw": 1598.23
    },
    {
      "timestampUtc": "2025-11-08T16:00:00Z",
      "powerKw": 1534.77
    },
    {
      "timestampUtc": "2025-11-08T21:00:00Z",
      "powerKw": 1432.84
    },
    {
      "timestampUtc": "2025-11-09T02:00:00Z",
      "powerKw": 1485.99
    },
    {
      "timestampUtc": "2025-11-09T07:00:00Z",
      "powerKw": 1494.19
    },
    {
      "timestampUtc": "2025-11-09T12:00:00Z",
      "powerKw": 1454.98
    },
    {
      "timestampUtc": "2025-11-09T17:00:00Z",
      "powerKw": 1509.7
    },
    {
      "timestampUtc": "2025-11-09T22:00:00Z",
      "powerKw": 1546.28
    },
    {
      "timestampUtc": "2025-11-10T03:00:00Z",
      "powerKw": 1579.49
    },
    {
      "timestampUtc": "2025-11-10T08:00:00Z",
      "powerKw": 1590.89
    },
    {
      "timestampUtc": "2025-11-10T13:00:00Z",
      "powerKw": 1479.94
    },
    {
      "timestampUtc": "2025-11-10T18:00:00Z",
      "powerKw": 1469.88
    },
    {
      "timestampUtc": "2025-11-10T23:00:00Z",
      "powerKw": 1350.08
    },
    {
      "timestampUtc": "2025-11-11T04:00:00Z",
      "powerKw": 1230.42
    },
    {
      "timestampUtc": "2025-11-11T09:00:00Z",
      "powerKw": 1095.2
    },
    {
      "timestampUtc": "2025-11-11T14:00:00Z",
      "powerKw": 1045.57
    },
    {
      "timestampUtc": "2025-11-11T19:00:00Z",
      "powerKw": 1052.35
    },
    {
      "timestampUtc": "2025-11-12T00:00:00Z",
      "powerKw": 964.38
    },
    {
      "timestampUtc": "2025-11-12T05:00:00Z",
      "powerKw": 893.78
    },
    {
      "timestampUtc": "2025-11-12T10:00:00Z",
      "powerKw": 887.99
    },
    {
      "timestampUtc": "2025-11-12T15:00:00Z",
      "powerKw": 834.99
    },
    {
      "timestampUtc": "2025-11-12T20:00:00Z",
      "powerKw": 912.45
    },
    {
      "timestampUtc": "2025-11-13T01:00:00Z",
      "powerKw": 875.94
    },
    {
      "timestampUtc": "2025-11-13T06:00:00Z",
      "powerKw": 846.52
    },
    {
      "timestampUtc": "2025-11-13T11:00:00Z",
      "powerKw": 888.43
    },
    {
      "timestampUtc": "2025-11-13T16:00:00Z",
      "powerKw": 1023.79
    },
    {
      "timestampUtc": "2025-11-13T21:00:00Z",
      "powerKw": 1020.35
    },
    {
      "timestampUtc": "2025-11-14T02:00:00Z",
      "powerKw": 980.36
    },
    {
      "timestampUtc": "2025-11-14T07:00:00Z",
      "powerKw": 1034.54
    },
    {
      "timestampUtc": "2025-11-14T12:00:00Z",
      "powerKw": 1102.26
    },
    {
      "timestampUtc": "2025-11-14T17:00:00Z",
      "powerKw": 1048.24
    },
    {
      "timestampUtc": "2025-11-14T22:00:00Z",
      "powerKw": 1189.88
    },
    {
      "timestampUtc": "2025-11-15T03:00:00Z",
      "powerKw": 1211.97
    },
    {
      "timestampUtc": "2025-11-15T08:00:00Z",
      "powerKw": 1216.23
    },
    {
      "timestampUtc": "2025-11-15T13:00:00Z",
      "powerKw": 1169.61
    },
    {
      "timestampUtc": "2025-11-15T18:00:00Z",
      "powerKw": 1113.57
    },
    {
      "timestampUtc": "2025-11-15T23:00:00Z",
      "powerKw": 1188.17
    },
    {
      "timestampUtc": "2025-11-16T04:00:00Z",
      "powerKw": 1182.85
    },
    {
      "timestampUtc": "2025-11-16T09:00:00Z",
      "powerKw": 1131.46
    },
    {
      "timestampUtc": "2025-11-16T14:00:00Z",
      "powerKw": 1193.36
    },
    {
      "timestampUtc": "2025-11-16T19:00:00Z",
      "powerKw": 1118.17
    },
    {
      "timestampUtc": "2025-11-17T00:00:00Z",
      "powerKw": 1072.26
    },
    {
      "timestampUtc": "2025-11-17T05:00:00Z",
      "powerKw": 1073.63
    },
    {
      "timestampUtc": "2025-11-17T10:00:00Z",
      "powerKw": 974.61
    },
    {
      "timestampUtc": "2025-11-17T15:00:00Z",
      "powerKw": 979.93
    },
    {
      "timestampUtc": "2025-11-17T20:00:00Z",
      "powerKw": 949.19
    },
    {
      "timestampUtc": "2025-11-18T01:00:00Z",
      "powerKw": 921.67
    },
    {
      "timestampUtc": "2025-11-18T06:00:00Z",
      "powerKw": 905.65
    },
    {
      "timestampUtc": "2025-11-18T11:00:00Z",
      "powerKw": 668.7
    },
    {
      "timestampUtc": "2025-11-18T16:00:00Z",
      "powerKw": 721.39
    },
    {
      "timestampUtc": "2025-11-18T21:00:00Z",
      "powerKw": 756.93
    },
    {
      "timestampUtc": "2025-11-19T02:00:00Z",
      "powerKw": 786.26
    },
    {
      "timestampUtc": "2025-11-19T07:00:00Z",
      "powerKw": 771.18
    },
    {
      "timestampUtc": "2025-11-19T12:00:00Z",
      "powerKw": 791.1
    },
    {
      "timestampUtc": "2025-11-19T17:00:00Z",
      "powerKw": 800.72
    },
    {
      "timestampUtc": "2025-11-19T22:00:00Z",
      "powerKw": 798.83
    },
    {
      "timestampUtc": "2025-11-20T03:00:00Z",
      "powerKw": 735.84
    },
    {
      "timestampUtc": "2025-11-20T08:00:00Z",
      "powerKw": 703.23
    },
    {
      "timestampUtc": "2025-11-20T13:00:00Z",
      "powerKw": 844.02
    },
    {
      "timestampUtc": "2025-11-20T18:00:00Z",
      "powerKw": 803.6
    },
    {
      "timestampUtc": "2025-11-20T23:00:00Z",
      "powerKw": 798.74
    },
    {
      "timestampUtc": "2025-11-21T04:00:00Z",
      "powerKw": 786.69
    },
    {
      "timestampUtc": "2025-11-21T09:00:00Z",
      "powerKw": 845.17
    },
    {
      "timestampUtc": "2025-11-21T14:00:00Z",
      "powerKw": 1047.39
    },
    {
      "timestampUtc": "2025-11-21T19:00:00Z",
      "powerKw": 1052.62
    },
    {
      "timestampUtc": "2025-11-22T00:00:00Z",
      "powerKw": 1030.06
    },
    {
      "timestampUtc": "2025-11-22T05:00:00Z",
      "powerKw": 1002.41
    },
    {
      "timestampUtc": "2025-11-22T10:00:00Z",
      "powerKw": 1117.98
    },
    {
      "timestampUtc": "2025-11-22T15:00:00Z",
      "powerKw": 1265.03
    },
    {
      "timestampUtc": "2025-11-22T20:00:00Z",
      "powerKw": 1290.13
    },
    {
      "timestampUtc": "2025-11-23T01:00:00Z",
      "powerKw": 1207.79
    },
    {
      "timestampUtc": "2025-11-23T06:00:00Z",
      "powerKw": 1234.92
    },
    {
      "timestampUtc": "2025-11-23T11:00:00Z",
      "powerKw": 1173.41
    },
    {
      "timestampUtc": "2025-11-23T16:00:00Z",
      "powerKw": 1220.53
    },
    {
      "timestampUtc": "2025-11-23T21:00:00Z",
      "powerKw": 1230.64
    },
    {
      "timestampUtc": "2025-11-24T02:00:00Z",
      "powerKw": 1214.17
    },
    {
      "timestampUtc": "2025-11-24T07:00:00Z",
      "powerKw": 1237.25
    },
    {
      "timestampUtc": "2025-11-24T12:00:00Z",
      "powerKw": 1205.78
    },
    {
      "timestampUtc": "2025-11-24T17:00:00Z",
      "powerKw": 33.14
    },
    {
      "timestampUtc": "2025-11-24T22:00:00Z",
      "powerKw": 115.99
    },
    {
      "timestampUtc": "2025-11-25T03:00:00Z",
      "powerKw": 111.49
    },
    {
      "timestampUtc": "2025-11-25T08:00:00Z",
      "powerKw": 109.24
    },
    {
      "timestampUtc": "2025-11-25T13:00:00Z",
      "powerKw": 104.76
    },
    {
      "timestampUtc": "2025-11-25T18:00:00Z",
      "powerKw": 244.72
    },
    {
      "timestampUtc": "2025-11-25T23:00:00Z",
      "powerKw": 235.2
    },
    {
      "timestampUtc": "2025-11-26T04:00:00Z",
      "powerKw": 253.64
    },
    {
      "timestampUtc": "2025-11-26T09:00:00Z",
      "powerKw": 317.23
    },
    {
      "timestampUtc": "2025-11-26T14:00:00Z",
      "powerKw": 393.9
    },
    {
      "timestampUtc": "2025-11-26T19:00:00Z",
      "powerKw": 418.01
    },
    {
      "timestampUtc": "2025-11-27T00:00:00Z",
      "powerKw": 506.84
    },
    {
      "timestampUtc": "2025-11-27T05:00:00Z",
      "powerKw": 454.81
    },
    {
      "timestampUtc": "2025-11-27T10:00:00Z",
      "powerKw": 459.25
    },
    {
      "timestampUtc": "2025-11-27T15:00:00Z",
      "powerKw": 468.98
    },
    {
      "timestampUtc": "2025-11-27T20:00:00Z",
      "powerKw": 654.66
    },
    {
      "timestampUtc": "2025-11-28T01:00:00Z",
      "powerKw": 669.23
    },
    {
      "timestampUtc": "2025-11-28T06:00:00Z",
      "powerKw": 674.17
    },
    {
      "timestampUtc": "2025-11-28T11:00:00Z",
      "powerKw": 803.93
    },
    {
      "timestampUtc": "2025-11-28T16:00:00Z",
      "powerKw": 1064.85
    },
    {
      "timestampUtc": "2025-11-28T21:00:00Z",
      "powerKw": 1114.87
    },
    {
      "timestampUtc": "2025-11-29T02:00:00Z",
      "powerKw": 1052.9
    },
    {
      "timestampUtc": "2025-11-29T07:00:00Z",
      "powerKw": 968.53
    },
    {
      "timestampUtc": "2025-11-29T12:00:00Z",
      "powerKw": 1027.68
    },
    {
      "timestampUtc": "2025-11-29T17:00:00Z",
      "powerKw": 1074.99
    },
    {
      "timestampUtc": "2025-11-29T22:00:00Z",
      "powerKw": 1053.03
    },
    {
      "timestampUtc": "2025-11-30T03:00:00Z",
      "powerKw": 1095.49
    },
    {
      "timestampUtc": "2025-11-30T08:00:00Z",
      "powerKw": 1097.4
    },
    {
      "timestampUtc": "2025-11-30T13:00:00Z",
      "powerKw": 1093.13
    },
    {
      "timestampUtc": "2025-11-30T18:00:00Z",
      "powerKw": 1066.97
    },
    {
      "timestampUtc": "2025-11-30T23:00:00Z",
      "powerKw": 1115.0
    },
    {
      "timestampUtc": "2025-12-01T04:00:00Z",
      "powerKw": 1058.64
    },
    {
      "timestampUtc": "2025-12-01T09:00:00Z",
      "powerKw": 1064.14
    },
    {
      "timestampUtc": "2025-12-01T14:00:00Z",
      "powerKw": 1103.71
    },
    {
      "timestampUtc": "2025-12-01T19:00:00Z",
      "powerKw": 1086.9
    },
    {
      "timestampUtc": "2025-12-02T00:00:00Z",
      "powerKw": 888.24
    },
    {
      "timestampUtc": "2025-12-02T05:00:00Z",
      "powerKw": 697.67
    },
    {
      "timestampUtc": "2025-12-02T10:00:00Z",
      "powerKw": 715.56
    },
    {
      "timestampUtc": "2025-12-02T15:00:00Z",
      "powerKw": 765.23
    },
    {
      "timestampUtc": "2025-12-02T20:00:00Z",
      "powerKw": 925.27
    },
    {
      "timestampUtc": "2025-12-03T01:00:00Z",
      "powerKw": 958.61
    },
    {
      "timestampUtc": "2025-12-03T06:00:00Z",
      "powerKw": 920.38
    },
    {
      "timestampUtc": "2025-12-03T11:00:00Z",
      "powerKw": 920.69
    },
    {
      "timestampUtc": "2025-12-03T16:00:00Z",
      "powerKw": 995.58
    },
    {
      "timestampUtc": "2025-12-03T21:00:00Z",
      "powerKw": 1081.62
    },
    {
      "timestampUtc": "2025-12-04T02:00:00Z",
      "powerKw": 1036.4
    },
    {
      "timestampUtc": "2025-12-04T07:00:00Z",
      "powerKw": 1005.25
    },
    {
      "timestampUtc": "2025-12-04T12:00:00Z",
      "powerKw": 1091.68
    },
    {
      "timestampUtc": "2025-12-04T17:00:00Z",
      "powerKw": 1167.69
    },
    {
      "timestampUtc": "2025-12-04T22:00:00Z",
      "powerKw": 1268.36
    },
    {
      "timestampUtc": "2025-12-05T03:00:00Z",
      "powerKw": 1197.82
    },
    {
      "timestampUtc": "2025-12-05T08:00:00Z",
      "powerKw": 1227.08
    },
    {
      "timestampUtc": "2025-12-05T13:00:00Z",
      "powerKw": 1427.44
    },
    {
      "timestampUtc": "2025-12-05T18:00:00Z",
      "powerKw": 1437.77
    },
    {
      "timestampUtc": "2025-12-05T23:00:00Z",
      "powerKw": 1514.65
    },
    {
      "timestampUtc": "2025-12-06T04:00:00Z",
      "powerKw": 1470.51
    },
    {
      "timestampUtc": "2025-12-06T09:00:00Z",
      "powerKw": 1509.48
    },
    {
      "timestampUtc": "2025-12-06T14:00:00Z",
      "powerKw": 1499.08
    },
    {
      "timestampUtc": "2025-12-06T19:00:00Z",
      "powerKw": 1540.36
    },
    {
      "timestampUtc": "2025-12-07T00:00:00Z",
      "powerKw": 1600.97
    },
    {
      "timestampUtc": "2025-12-07T05:00:00Z",
      "powerKw": 1574.83
    },
    {
      "timestampUtc": "2025-12-07T10:00:00Z",
      "powerKw": 1529.33
    },
    {
      "timestampUtc": "2025-12-07T15:00:00Z",
      "powerKw": 1637.0
    },
    {
      "timestampUtc": "2025-12-07T20:00:00Z",
      "powerKw": 1636.46
    },
    {
      "timestampUtc": "2025-12-08T01:00:00Z",
      "powerKw": 1573.95
    },
    {
      "timestampUtc": "2025-12-08T06:00:00Z",
      "powerKw": 1490.88
    },
    {
      "timestampUtc": "2025-12-08T11:00:00Z",
      "powerKw": 1313.28
    },
    {
      "timestampUtc": "2025-12-08T16:00:00Z",
      "powerKw": 1254.14
    },
    {
      "timestampUtc": "2025-12-08T21:00:00Z",
      "powerKw": 1244.51
    },
    {
      "timestampUtc": "2025-12-09T02:00:00Z",
      "powerKw": 1129.43
    },
    {
      "timestampUtc": "2025-12-09T07:00:00Z",
      "powerKw": 1105.39
    },
    {
      "timestampUtc": "2025-12-09T12:00:00Z",
      "powerKw": 833.45
    },
    {
      "timestampUtc": "2025-12-09T17:00:00Z",
      "powerKw": 784.91
    },
    {
      "timestampUtc": "2025-12-09T22:00:00Z",
      "powerKw": 784.15
    },
    {
      "timestampUtc": "2025-12-10T03:00:00Z",
      "powerKw": 777.73
    },
    {
      "timestampUtc": "2025-12-10T08:00:00Z",
      "powerKw": 720.65
    },
    {
      "timestampUtc": "2025-12-10T13:00:00Z",
      "powerKw": 823.85
    },
    {
      "timestampUtc": "2025-12-10T18:00:00Z",
      "powerKw": 887.56
    },
    {
      "timestampUtc": "2025-12-10T23:00:00Z",
      "powerKw": 819.04
    },
    {
      "timestampUtc": "2025-12-11T04:00:00Z",
      "powerKw": 830.15
    },
    {
      "timestampUtc": "2025-12-11T09:00:00Z",
      "powerKw": 932.51
    },
    {
      "timestampUtc": "2025-12-11T14:00:00Z",
      "powerKw": 1077.75
    },
    {
      "timestampUtc": "2025-12-11T19:00:00Z",
      "powerKw": 1174.41
    },
    {
      "timestampUtc": "2025-12-12T00:00:00Z",
      "powerKw": 1106.81
    },
    {
      "timestampUtc": "2025-12-12T05:00:00Z",
      "powerKw": 1112.08
    },
    {
      "timestampUtc": "2025-12-12T10:00:00Z",
      "powerKw": 1138.84
    },
    {
      "timestampUtc": "2025-12-12T15:00:00Z",
      "powerKw": 1290.85
    },
    {
      "timestampUtc": "2025-12-12T20:00:00Z",
      "powerKw": 1419.97
    },
    {
      "timestampUtc": "2025-12-13T01:00:00Z",
      "powerKw": 1483.18
    },
    {
      "timestampUtc": "2025-12-13T06:00:00Z",
      "powerKw": 1493.71
    },
    {
      "timestampUtc": "2025-12-13T11:00:00Z",
      "powerKw": 1506.94
    },
    {
      "timestampUtc": "2025-12-13T16:00:00Z",
      "powerKw": 1526.9
    },
    {
      "timestampUtc": "2025-12-13T21:00:00Z",
      "powerKw": 1461.96
    },
    {
      "timestampUtc": "2025-12-14T02:00:00Z",
      "powerKw": 1403.75
    },
    {
      "timestampUtc": "2025-12-14T07:00:00Z",
      "powerKw": 1546.12
    },
    {
      "timestampUtc": "2025-12-14T12:00:00Z",
      "powerKw": 1765.89
    },
    {
      "timestampUtc": "2025-12-14T17:00:00Z",
      "powerKw": 1508.99
    },
    {
      "timestampUtc": "2025-12-14T22:00:00Z",
      "powerKw": 1442.85
    },
    {
      "timestampUtc": "2025-12-15T03:00:00Z",
      "powerKw": 1197.16
    },
    {
      "timestampUtc": "2025-12-15T08:00:00Z",
      "powerKw": 1014.74
    },
    {
      "timestampUtc": "2025-12-15T13:00:00Z",
      "powerKw": 845.4
    },
    {
      "timestampUtc": "2025-12-15T18:00:00Z",
      "powerKw": 837.64
    },
    {
      "timestampUtc": "2025-12-15T23:00:00Z",
      "powerKw": 866.98
    },
    {
      "timestampUtc": "2025-12-16T04:00:00Z",
      "powerKw": 812.36
    },
    {
      "timestampUtc": "2025-12-16T09:00:00Z",
      "powerKw": 832.71
    },
    {
      "timestampUtc": "2025-12-16T14:00:00Z",
      "powerKw": 791.66
    },
    {
      "timestampUtc": "2025-12-16T19:00:00Z",
      "powerKw": 734.34
    },
    {
      "timestampUtc": "2025-12-17T00:00:00Z",
      "powerKw": 744.78
    },
    {
      "timestampUtc": "2025-12-17T05:00:00Z",
      "powerKw": 723.07
    },
    {
      "timestampUtc": "2025-12-17T10:00:00Z",
      "powerKw": 789.14
    },
    {
      "timestampUtc": "2025-12-17T15:00:00Z",
      "powerKw": 812.93
    },
    {
      "timestampUtc": "2025-12-17T20:00:00Z",
      "powerKw": 870.72
    },
    {
      "timestampUtc": "2025-12-18T01:00:00Z",
      "powerKw": 872.97
    },
    {
      "timestampUtc": "2025-12-18T06:00:00Z",
      "powerKw": 817.59
    },
    {
      "timestampUtc": "2025-12-18T11:00:00Z",
      "powerKw": 890.81
    },
    {
      "timestampUtc": "2025-12-18T16:00:00Z",
      "powerKw": 942.01
    },
    {
      "timestampUtc": "2025-12-18T21:00:00Z",
      "powerKw": 1042.35
    },
    {
      "timestampUtc": "2025-12-19T02:00:00Z",
      "powerKw": 1273.41
    },
    {
      "timestampUtc": "2025-12-19T07:00:00Z",
      "powerKw": 1328.61
    },
    {
      "timestampUtc": "2025-12-19T12:00:00Z",
      "powerKw": 1475.64
    },
    {
      "timestampUtc": "2025-12-19T17:00:00Z",
      "powerKw": 1462.99
    },
    {
      "timestampUtc": "2025-12-19T22:00:00Z",
      "powerKw": 1477.14
    },
    {
      "timestampUtc": "2025-12-20T03:00:00Z",
      "powerKw": 1382.86
    },
    {
      "timestampUtc": "2025-12-20T08:00:00Z",
      "powerKw": 1276.73
    },
    {
      "timestampUtc": "2025-12-20T13:00:00Z",
      "powerKw": 1317.26
    },
    {
      "timestampUtc": "2025-12-20T18:00:00Z",
      "powerKw": 1294.06
    },
    {
      "timestampUtc": "2025-12-20T23:00:00Z",
      "powerKw": 1228.28
    },
    {
      "timestampUtc": "2025-12-21T04:00:00Z",
      "powerKw": 1177.2
    },
    {
      "timestampUtc": "2025-12-21T09:00:00Z",
      "powerKw": 1232.16
    },
    {
      "timestampUtc": "2025-12-21T14:00:00Z",
      "powerKw": 1177.28
    },
    {
      "timestampUtc": "2025-12-21T19:00:00Z",
      "powerKw": 1184.17
    },
    {
      "timestampUtc": "2025-12-22T00:00:00Z",
      "powerKw": 1194.93
    },
    {
      "timestampUtc": "2025-12-22T05:00:00Z",
      "powerKw": 1295.57
    },
    {
      "timestampUtc": "2025-12-22T10:00:00Z",
      "powerKw": 1165.62
    },
    {
      "timestampUtc": "2025-12-22T15:00:00Z",
      "powerKw": 1121.21
    },
    {
      "timestampUtc": "2025-12-22T20:00:00Z",
      "powerKw": 1062.75
    },
    {
      "timestampUtc": "2025-12-23T01:00:00Z",
      "powerKw": 1069.11
    },
    {
      "timestampUtc": "2025-12-23T06:00:00Z",
      "powerKw": 958.52
    },
    {
      "timestampUtc": "2025-12-23T11:00:00Z",
      "powerKw": 889.22
    },
    {
      "timestampUtc": "2025-12-23T16:00:00Z",
      "powerKw": 963.37
    },
    {
      "timestampUtc": "2025-12-23T21:00:00Z",
      "powerKw": 973.62
    },
    {
      "timestampUtc": "2025-12-24T02:00:00Z",
      "powerKw": 857.15
    },
    {
      "timestampUtc": "2025-12-24T07:00:00Z",
      "powerKw": 830.84
    }
  ],
  "hourProfile": [
    {
      "label": "00:00",
      "powerKw": 1033.26
    },
    {
      "label": "01:00",
      "powerKw": 1026.68
    },
    {
      "label": "02:00",
      "powerKw": 1021.92
    },
    {
      "label": "03:00",
      "powerKw": 1019.08
    },
    {
      "label": "04:00",
      "powerKw": 1017.32
    },
    {
      "label": "05:00",
      "powerKw": 1011.98
    },
    {
      "label": "06:00",
      "powerKw": 1009.98
    },
    {
      "label": "07:00",
      "powerKw": 1023.47
    },
    {
      "label": "08:00",
      "powerKw": 1044.5
    },
    {
      "label": "09:00",
      "powerKw": 1065.15
    },
    {
      "label": "10:00",
      "powerKw": 1089.05
    },
    {
      "label": "11:00",
      "powerKw": 1113.43
    },
    {
      "label": "12:00",
      "powerKw": 1130.24
    },
    {
      "label": "13:00",
      "powerKw": 1131.4
    },
    {
      "label": "14:00",
      "powerKw": 1133.23
    },
    {
      "label": "15:00",
      "powerKw": 1130.92
    },
    {
      "label": "16:00",
      "powerKw": 1122.95
    },
    {
      "label": "17:00",
      "powerKw": 1109.55
    },
    {
      "label": "18:00",
      "powerKw": 1095.3
    },
    {
      "label": "19:00",
      "powerKw": 1077.55
    },
    {
      "label": "20:00",
      "powerKw": 1064.84
    },
    {
      "label": "21:00",
      "powerKw": 1055.37
    },
    {
      "label": "22:00",
      "powerKw": 1042.49
    },
    {
      "label": "23:00",
      "powerKw": 1035.72
    }
  ],
  "monthProfile": [
    {
      "label": "Jan",
      "powerKw": 856.89
    },
    {
      "label": "Feb",
      "powerKw": 992.73
    },
    {
      "label": "Mar",
      "powerKw": 801.61
    },
    {
      "label": "Apr",
      "powerKw": 905.92
    },
    {
      "label": "May",
      "powerKw": 1081.1
    },
    {
      "label": "Jun",
      "powerKw": 1172.56
    },
    {
      "label": "Jul",
      "powerKw": 1111.4
    },
    {
      "label": "Aug",
      "powerKw": 1083.47
    },
    {
      "label": "Sep",
      "powerKw": 1177.2
    },
    {
      "label": "Oct",
      "powerKw": 1383.96
    },
    {
      "label": "Nov",
      "powerKw": 1085.83
    },
    {
      "label": "Dec",
      "powerKw": 1076.62
    }
  ],
  "containerScatter": [
    {
      "containers": 425.0,
      "powerKw": 843.25
    },
    {
      "containers": 403.0,
      "powerKw": 786.63
    },
    {
      "containers": 352.0,
      "powerKw": 716.85
    },
    {
      "containers": 421.0,
      "powerKw": 889.86
    },
    {
      "containers": 345.0,
      "powerKw": 796.78
    },
    {
      "containers": 340.0,
      "powerKw": 729.17
    },
    {
      "containers": 339.0,
      "powerKw": 760.25
    },
    {
      "containers": 442.0,
      "powerKw": 917.4
    },
    {
      "containers": 476.0,
      "powerKw": 958.69
    },
    {
      "containers": 445.0,
      "powerKw": 1041.91
    },
    {
      "containers": 357.0,
      "powerKw": 747.97
    },
    {
      "containers": 406.0,
      "powerKw": 770.85
    },
    {
      "containers": 363.0,
      "powerKw": 679.42
    },
    {
      "containers": 346.0,
      "powerKw": 749.98
    },
    {
      "containers": 294.0,
      "powerKw": 619.9
    },
    {
      "containers": 434.0,
      "powerKw": 1054.2
    },
    {
      "containers": 452.0,
      "powerKw": 1028.03
    },
    {
      "containers": 412.0,
      "powerKw": 1017.76
    },
    {
      "containers": 378.0,
      "powerKw": 919.92
    },
    {
      "containers": 449.0,
      "powerKw": 990.95
    },
    {
      "containers": 501.0,
      "powerKw": 1148.69
    },
    {
      "containers": 504.0,
      "powerKw": 1003.85
    },
    {
      "containers": 476.0,
      "powerKw": 1196.85
    },
    {
      "containers": 557.0,
      "powerKw": 1489.41
    },
    {
      "containers": 584.0,
      "powerKw": 1415.56
    },
    {
      "containers": 577.0,
      "powerKw": 1438.98
    },
    {
      "containers": 480.0,
      "powerKw": 1066.84
    },
    {
      "containers": 352.0,
      "powerKw": 742.52
    },
    {
      "containers": 322.0,
      "powerKw": 725.97
    },
    {
      "containers": 417.0,
      "powerKw": 846.54
    },
    {
      "containers": 399.0,
      "powerKw": 880.02
    },
    {
      "containers": 348.0,
      "powerKw": 681.45
    },
    {
      "containers": 448.0,
      "powerKw": 790.61
    },
    {
      "containers": 456.0,
      "powerKw": 819.11
    },
    {
      "containers": 469.0,
      "powerKw": 956.21
    },
    {
      "containers": 375.0,
      "powerKw": 929.21
    },
    {
      "containers": 336.0,
      "powerKw": 726.57
    },
    {
      "containers": 362.0,
      "powerKw": 788.3
    },
    {
      "containers": 387.0,
      "powerKw": 715.25
    },
    {
      "containers": 356.0,
      "powerKw": 678.02
    },
    {
      "containers": 427.0,
      "powerKw": 913.8
    },
    {
      "containers": 391.0,
      "powerKw": 792.3
    },
    {
      "containers": 395.0,
      "powerKw": 756.2
    },
    {
      "containers": 415.0,
      "powerKw": 605.22
    },
    {
      "containers": 323.0,
      "powerKw": 634.03
    },
    {
      "containers": 389.0,
      "powerKw": 727.09
    },
    {
      "containers": 393.0,
      "powerKw": 804.81
    },
    {
      "containers": 430.0,
      "powerKw": 843.63
    },
    {
      "containers": 344.0,
      "powerKw": 648.41
    },
    {
      "containers": 371.0,
      "powerKw": 950.04
    },
    {
      "containers": 388.0,
      "powerKw": 812.72
    },
    {
      "containers": 482.0,
      "powerKw": 1056.31
    },
    {
      "containers": 501.0,
      "powerKw": 1009.47
    },
    {
      "containers": 433.0,
      "powerKw": 866.0
    },
    {
      "containers": 375.0,
      "powerKw": 822.74
    },
    {
      "containers": 382.0,
      "powerKw": 691.71
    },
    {
      "containers": 355.0,
      "powerKw": 748.92
    },
    {
      "containers": 388.0,
      "powerKw": 850.44
    },
    {
      "containers": 440.0,
      "powerKw": 841.33
    },
    {
      "containers": 453.0,
      "powerKw": 1229.92
    },
    {
      "containers": 461.0,
      "powerKw": 1019.43
    },
    {
      "containers": 453.0,
      "powerKw": 1334.8
    },
    {
      "containers": 442.0,
      "powerKw": 948.14
    },
    {
      "containers": 448.0,
      "powerKw": 875.77
    },
    {
      "containers": 363.0,
      "powerKw": 880.34
    },
    {
      "containers": 386.0,
      "powerKw": 801.93
    },
    {
      "containers": 491.0,
      "powerKw": 1305.54
    },
    {
      "containers": 658.0,
      "powerKw": 1556.29
    },
    {
      "containers": 588.0,
      "powerKw": 1295.85
    },
    {
      "containers": 475.0,
      "powerKw": 1223.63
    },
    {
      "containers": 434.0,
      "powerKw": 892.91
    },
    {
      "containers": 533.0,
      "powerKw": 1441.34
    },
    {
      "containers": 513.0,
      "powerKw": 1200.61
    },
    {
      "containers": 466.0,
      "powerKw": 1240.0
    },
    {
      "containers": 380.0,
      "powerKw": 754.96
    },
    {
      "containers": 463.0,
      "powerKw": 934.54
    },
    {
      "containers": 498.0,
      "powerKw": 1183.43
    },
    {
      "containers": 384.0,
      "powerKw": 818.34
    },
    {
      "containers": 426.0,
      "powerKw": 1138.72
    },
    {
      "containers": 333.0,
      "powerKw": 779.77
    },
    {
      "containers": 471.0,
      "powerKw": 1252.65
    },
    {
      "containers": 426.0,
      "powerKw": 1127.51
    },
    {
      "containers": 352.0,
      "powerKw": 896.78
    },
    {
      "containers": 395.0,
      "powerKw": 1190.29
    },
    {
      "containers": 534.0,
      "powerKw": 1177.5
    },
    {
      "containers": 535.0,
      "powerKw": 1216.79
    },
    {
      "containers": 445.0,
      "powerKw": 1001.02
    },
    {
      "containers": 397.0,
      "powerKw": 925.58
    },
    {
      "containers": 413.0,
      "powerKw": 1331.5
    },
    {
      "containers": 360.0,
      "powerKw": 1039.62
    },
    {
      "containers": 351.0,
      "powerKw": 1056.15
    },
    {
      "containers": 381.0,
      "powerKw": 1061.97
    },
    {
      "containers": 495.0,
      "powerKw": 1327.18
    },
    {
      "containers": 609.0,
      "powerKw": 1779.44
    },
    {
      "containers": 542.0,
      "powerKw": 1392.08
    },
    {
      "containers": 428.0,
      "powerKw": 1152.88
    },
    {
      "containers": 338.0,
      "powerKw": 768.86
    },
    {
      "containers": 478.0,
      "powerKw": 1095.54
    },
    {
      "containers": 463.0,
      "powerKw": 1171.21
    },
    {
      "containers": 441.0,
      "powerKw": 1127.55
    },
    {
      "containers": 438.0,
      "powerKw": 1703.34
    },
    {
      "containers": 496.0,
      "powerKw": 1044.5
    },
    {
      "containers": 537.0,
      "powerKw": 1334.32
    },
    {
      "containers": 530.0,
      "powerKw": 1199.05
    },
    {
      "containers": 419.0,
      "powerKw": 990.57
    },
    {
      "containers": 340.0,
      "powerKw": 897.25
    },
    {
      "containers": 431.0,
      "powerKw": 986.03
    },
    {
      "containers": 437.0,
      "powerKw": 1061.69
    },
    {
      "containers": 298.0,
      "powerKw": 781.16
    },
    {
      "containers": 341.0,
      "powerKw": 1004.16
    },
    {
      "containers": 360.0,
      "powerKw": 1056.71
    },
    {
      "containers": 438.0,
      "powerKw": 1097.57
    },
    {
      "containers": 422.0,
      "powerKw": 1171.58
    },
    {
      "containers": 409.0,
      "powerKw": 1128.12
    },
    {
      "containers": 389.0,
      "powerKw": 1113.6
    },
    {
      "containers": 414.0,
      "powerKw": 1014.49
    },
    {
      "containers": 461.0,
      "powerKw": 1190.83
    },
    {
      "containers": 435.0,
      "powerKw": 1316.21
    },
    {
      "containers": 453.0,
      "powerKw": 1154.58
    },
    {
      "containers": 542.0,
      "powerKw": 1217.64
    },
    {
      "containers": 486.0,
      "powerKw": 1039.73
    },
    {
      "containers": 355.0,
      "powerKw": 900.43
    },
    {
      "containers": 359.0,
      "powerKw": 912.68
    },
    {
      "containers": 305.0,
      "powerKw": 776.6
    },
    {
      "containers": 378.0,
      "powerKw": 1075.31
    },
    {
      "containers": 380.0,
      "powerKw": 837.39
    },
    {
      "containers": 373.0,
      "powerKw": 1253.78
    },
    {
      "containers": 420.0,
      "powerKw": 1177.08
    },
    {
      "containers": 400.0,
      "powerKw": 1089.93
    },
    {
      "containers": 433.0,
      "powerKw": 1240.61
    },
    {
      "containers": 364.0,
      "powerKw": 870.66
    },
    {
      "containers": 344.0,
      "powerKw": 1088.7
    },
    {
      "containers": 547.0,
      "powerKw": 1317.96
    },
    {
      "containers": 477.0,
      "powerKw": 1191.1
    },
    {
      "containers": 414.0,
      "powerKw": 982.44
    },
    {
      "containers": 397.0,
      "powerKw": 1125.15
    },
    {
      "containers": 356.0,
      "powerKw": 1108.85
    },
    {
      "containers": 444.0,
      "powerKw": 1181.67
    },
    {
      "containers": 455.0,
      "powerKw": 1411.49
    },
    {
      "containers": 327.0,
      "powerKw": 871.34
    },
    {
      "containers": 354.0,
      "powerKw": 1038.77
    },
    {
      "containers": 381.0,
      "powerKw": 1047.4
    },
    {
      "containers": 463.0,
      "powerKw": 1100.84
    },
    {
      "containers": 372.0,
      "powerKw": 1103.96
    },
    {
      "containers": 355.0,
      "powerKw": 935.05
    },
    {
      "containers": 351.0,
      "powerKw": 988.69
    },
    {
      "containers": 430.0,
      "powerKw": 1095.31
    },
    {
      "containers": 401.0,
      "powerKw": 893.67
    },
    {
      "containers": 270.0,
      "powerKw": 746.77
    },
    {
      "containers": 423.0,
      "powerKw": 1221.46
    },
    {
      "containers": 499.0,
      "powerKw": 1850.12
    },
    {
      "containers": 488.0,
      "powerKw": 1705.07
    },
    {
      "containers": 455.0,
      "powerKw": 1315.28
    },
    {
      "containers": 354.0,
      "powerKw": 957.89
    },
    {
      "containers": 450.0,
      "powerKw": 1136.27
    },
    {
      "containers": 581.0,
      "powerKw": 1771.13
    },
    {
      "containers": 592.0,
      "powerKw": 1393.99
    },
    {
      "containers": 364.0,
      "powerKw": 969.71
    },
    {
      "containers": 414.0,
      "powerKw": 1019.76
    },
    {
      "containers": 516.0,
      "powerKw": 1212.37
    },
    {
      "containers": 499.0,
      "powerKw": 1295.87
    },
    {
      "containers": 604.0,
      "powerKw": 1558.28
    },
    {
      "containers": 446.0,
      "powerKw": 1150.57
    },
    {
      "containers": 568.0,
      "powerKw": 1405.95
    },
    {
      "containers": 603.0,
      "powerKw": 1582.15
    },
    {
      "containers": 533.0,
      "powerKw": 1371.72
    },
    {
      "containers": 561.0,
      "powerKw": 1421.51
    },
    {
      "containers": 607.0,
      "powerKw": 1708.72
    },
    {
      "containers": 638.0,
      "powerKw": 1592.25
    },
    {
      "containers": 631.0,
      "powerKw": 1470.63
    },
    {
      "containers": 533.0,
      "powerKw": 1413.49
    },
    {
      "containers": 489.0,
      "powerKw": 1178.93
    },
    {
      "containers": 664.0,
      "powerKw": 1645.31
    },
    {
      "containers": 675.0,
      "powerKw": 1448.91
    },
    {
      "containers": 562.0,
      "powerKw": 1362.19
    },
    {
      "containers": 414.0,
      "powerKw": 1021.59
    },
    {
      "containers": 587.0,
      "powerKw": 1691.23
    },
    {
      "containers": 599.0,
      "powerKw": 1505.39
    },
    {
      "containers": 720.0,
      "powerKw": 1676.43
    },
    {
      "containers": 562.0,
      "powerKw": 1538.11
    },
    {
      "containers": 538.0,
      "powerKw": 1165.81
    },
    {
      "containers": 551.0,
      "powerKw": 1523.06
    },
    {
      "containers": 591.0,
      "powerKw": 1474.03
    },
    {
      "containers": 545.0,
      "powerKw": 1364.2
    },
    {
      "containers": 390.0,
      "powerKw": 816.01
    },
    {
      "containers": 411.0,
      "powerKw": 980.36
    },
    {
      "containers": 590.0,
      "powerKw": 1156.89
    },
    {
      "containers": 567.0,
      "powerKw": 1033.98
    },
    {
      "containers": 394.0,
      "powerKw": 726.41
    },
    {
      "containers": 348.0,
      "powerKw": 738.83
    },
    {
      "containers": 463.0,
      "powerKw": 1030.06
    },
    {
      "containers": 605.0,
      "powerKw": 1263.14
    },
    {
      "containers": 106.0,
      "powerKw": 111.59
    },
    {
      "containers": 268.0,
      "powerKw": 425.19
    },
    {
      "containers": 299.0,
      "powerKw": 669.52
    },
    {
      "containers": 429.0,
      "powerKw": 1053.03
    },
    {
      "containers": 420.0,
      "powerKw": 1116.0
    },
    {
      "containers": 436.0,
      "powerKw": 939.44
    },
    {
      "containers": 471.0,
      "powerKw": 1165.43
    },
    {
      "containers": 634.0,
      "powerKw": 1481.58
    },
    {
      "containers": 718.0,
      "powerKw": 1636.46
    },
    {
      "containers": 365.0,
      "powerKw": 947.01
    },
    {
      "containers": 360.0,
      "powerKw": 818.97
    },
    {
      "containers": 532.0,
      "powerKw": 1256.4
    },
    {
      "containers": 640.0,
      "powerKw": 1489.88
    },
    {
      "containers": 412.0,
      "powerKw": 837.64
    },
    {
      "containers": 396.0,
      "powerKw": 727.14
    },
    {
      "containers": 492.0,
      "powerKw": 1032.21
    },
    {
      "containers": 621.0,
      "powerKw": 1341.69
    },
    {
      "containers": 550.0,
      "powerKw": 1215.69
    },
    {
      "containers": 462.0,
      "powerKw": 963.37
    },
    {
      "containers": 453.0,
      "powerKw": 785.83
    },
    {
      "containers": 497.0,
      "powerKw": 845.07
    },
    {
      "containers": 565.0,
      "powerKw": 1006.39
    },
    {
      "containers": 400.0,
      "powerKw": 774.42
    },
    {
      "containers": 556.0,
      "powerKw": 984.08
    },
    {
      "containers": 552.0,
      "powerKw": 925.42
    },
    {
      "containers": 476.0,
      "powerKw": 830.35
    },
    {
      "containers": 475.0,
      "powerKw": 804.08
    },
    {
      "containers": 521.0,
      "powerKw": 831.48
    }
  ],
  "weatherScatter": [
    {
      "temperatureC": 13.2,
      "powerKw": 957.89
    },
    {
      "temperatureC": 14.74,
      "powerKw": 1520.91
    },
    {
      "temperatureC": 13.4,
      "powerKw": 1609.07
    },
    {
      "temperatureC": 16.67,
      "powerKw": 1693.58
    },
    {
      "temperatureC": 13.87,
      "powerKw": 1582.15
    },
    {
      "temperatureC": 12.88,
      "powerKw": 1577.17
    },
    {
      "temperatureC": 16.42,
      "powerKw": 1613.93
    },
    {
      "temperatureC": 12.16,
      "powerKw": 1266.78
    },
    {
      "temperatureC": 11.86,
      "powerKw": 1339.67
    },
    {
      "temperatureC": 13.36,
      "powerKw": 1156.62
    },
    {
      "temperatureC": 11.98,
      "powerKw": 1363.78
    },
    {
      "temperatureC": 14.42,
      "powerKw": 1411.62
    },
    {
      "temperatureC": 13.3,
      "powerKw": 1367.19
    },
    {
      "temperatureC": 12.69,
      "powerKw": 1365.85
    },
    {
      "temperatureC": 13.46,
      "powerKw": 1409.4
    },
    {
      "temperatureC": 11.1,
      "powerKw": 1370.77
    },
    {
      "temperatureC": 12.68,
      "powerKw": 1362.2
    },
    {
      "temperatureC": 13.29,
      "powerKw": 1794.09
    },
    {
      "temperatureC": 10.15,
      "powerKw": 1746.58
    },
    {
      "temperatureC": 13.05,
      "powerKw": 1985.22
    },
    {
      "temperatureC": 8.73,
      "powerKw": 1795.01
    },
    {
      "temperatureC": 4.98,
      "powerKw": 1588.86
    },
    {
      "temperatureC": 11.58,
      "powerKw": 1696.73
    },
    {
      "temperatureC": 9.24,
      "powerKw": 1376.89
    },
    {
      "temperatureC": 10.84,
      "powerKw": 1451.71
    },
    {
      "temperatureC": 10.81,
      "powerKw": 1398.16
    },
    {
      "temperatureC": 14.59,
      "powerKw": 1463.76
    },
    {
      "temperatureC": 12.76,
      "powerKw": 1235.91
    },
    {
      "temperatureC": 12.96,
      "powerKw": 1055.89
    },
    {
      "temperatureC": 12.42,
      "powerKw": 1135.78
    },
    {
      "temperatureC": 10.01,
      "powerKw": 1250.33
    },
    {
      "temperatureC": 14.73,
      "powerKw": 1356.3
    },
    {
      "temperatureC": 12.51,
      "powerKw": 1523.22
    },
    {
      "temperatureC": 10.8,
      "powerKw": 1514.5
    },
    {
      "temperatureC": 11.74,
      "powerKw": 1650.99
    },
    {
      "temperatureC": 9.1,
      "powerKw": 1544.38
    },
    {
      "temperatureC": 9.57,
      "powerKw": 1522.18
    },
    {
      "temperatureC": 10.42,
      "powerKw": 1512.51
    },
    {
      "temperatureC": 7.0,
      "powerKw": 1448.91
    },
    {
      "temperatureC": 10.75,
      "powerKw": 1503.3
    },
    {
      "temperatureC": 8.24,
      "powerKw": 1381.04
    },
    {
      "temperatureC": 7.81,
      "powerKw": 1435.61
    },
    {
      "temperatureC": 9.94,
      "powerKw": 1388.32
    },
    {
      "temperatureC": 8.05,
      "powerKw": 1358.5
    },
    {
      "temperatureC": 7.17,
      "powerKw": 1317.3
    },
    {
      "temperatureC": 10.5,
      "powerKw": 1187.61
    },
    {
      "temperatureC": 9.58,
      "powerKw": 1033.51
    },
    {
      "temperatureC": 12.72,
      "powerKw": 1111.38
    },
    {
      "temperatureC": 10.39,
      "powerKw": 1475.49
    },
    {
      "temperatureC": 12.16,
      "powerKw": 1712.56
    },
    {
      "temperatureC": 10.63,
      "powerKw": 1691.23
    },
    {
      "temperatureC": 6.58,
      "powerKw": 1588.78
    },
    {
      "temperatureC": 12.15,
      "powerKw": 1370.81
    },
    {
      "temperatureC": 8.31,
      "powerKw": 1452.01
    },
    {
      "temperatureC": 9.55,
      "powerKw": 1462.55
    },
    {
      "temperatureC": 13.42,
      "powerKw": 1532.95
    },
    {
      "temperatureC": 10.7,
      "powerKw": 1575.81
    },
    {
      "temperatureC": 11.76,
      "powerKw": 1616.04
    },
    {
      "temperatureC": 10.48,
      "powerKw": 1664.18
    },
    {
      "temperatureC": 9.64,
      "powerKw": 1683.07
    },
    {
      "temperatureC": 10.17,
      "powerKw": 1563.76
    },
    {
      "temperatureC": 12.15,
      "powerKw": 1675.27
    },
    {
      "temperatureC": 13.45,
      "powerKw": 1705.1
    },
    {
      "temperatureC": 13.75,
      "powerKw": 1558.11
    },
    {
      "temperatureC": 11.36,
      "powerKw": 1126.29
    },
    {
      "temperatureC": 17.43,
      "powerKw": 1366.32
    },
    {
      "temperatureC": 13.0,
      "powerKw": 1410.31
    },
    {
      "temperatureC": 6.97,
      "powerKw": 1170.71
    },
    {
      "temperatureC": 13.3,
      "powerKw": 1322.59
    },
    {
      "temperatureC": 6.72,
      "powerKw": 1353.42
    },
    {
      "temperatureC": 2.35,
      "powerKw": 1219.49
    },
    {
      "temperatureC": 7.83,
      "powerKw": 1489.69
    },
    {
      "temperatureC": 8.86,
      "powerKw": 1630.57
    },
    {
      "temperatureC": 8.29,
      "powerKw": 1598.23
    },
    {
      "temperatureC": 6.76,
      "powerKw": 1459.0
    },
    {
      "temperatureC": 6.7,
      "powerKw": 1525.89
    },
    {
      "temperatureC": 8.6,
      "powerKw": 1504.24
    },
    {
      "temperatureC": 10.62,
      "powerKw": 1517.2
    },
    {
      "temperatureC": 7.14,
      "powerKw": 1590.89
    },
    {
      "temperatureC": 8.05,
      "powerKw": 1469.09
    },
    {
      "temperatureC": 6.49,
      "powerKw": 1242.0
    },
    {
      "temperatureC": 11.52,
      "powerKw": 943.68
    },
    {
      "temperatureC": 8.47,
      "powerKw": 1025.41
    },
    {
      "temperatureC": 8.01,
      "powerKw": 893.78
    },
    {
      "temperatureC": 13.58,
      "powerKw": 849.64
    },
    {
      "temperatureC": 12.5,
      "powerKw": 862.99
    },
    {
      "temperatureC": 14.16,
      "powerKw": 872.05
    },
    {
      "temperatureC": 14.73,
      "powerKw": 980.11
    },
    {
      "temperatureC": 11.54,
      "powerKw": 980.36
    },
    {
      "temperatureC": 8.32,
      "powerKw": 1063.54
    },
    {
      "temperatureC": 6.41,
      "powerKw": 1128.78
    },
    {
      "temperatureC": 6.45,
      "powerKw": 1206.47
    },
    {
      "temperatureC": 6.07,
      "powerKw": 1186.36
    },
    {
      "temperatureC": 5.35,
      "powerKw": 1188.17
    },
    {
      "temperatureC": 5.56,
      "powerKw": 1135.92
    },
    {
      "temperatureC": 5.36,
      "powerKw": 1171.09
    },
    {
      "temperatureC": 4.25,
      "powerKw": 1094.8
    },
    {
      "temperatureC": 6.76,
      "powerKw": 999.12
    },
    {
      "temperatureC": 2.58,
      "powerKw": 949.19
    },
    {
      "temperatureC": 3.87,
      "powerKw": 915.33
    },
    {
      "temperatureC": 6.61,
      "powerKw": 681.84
    },
    {
      "temperatureC": 3.49,
      "powerKw": 761.25
    },
    {
      "temperatureC": 4.42,
      "powerKw": 770.75
    },
    {
      "temperatureC": 3.93,
      "powerKw": 800.72
    },
    {
      "temperatureC": 2.64,
      "powerKw": 729.74
    },
    {
      "temperatureC": 2.87,
      "powerKw": 766.76
    },
    {
      "temperatureC": -0.32,
      "powerKw": 803.76
    },
    {
      "temperatureC": -1.79,
      "powerKw": 780.04
    },
    {
      "temperatureC": 3.79,
      "powerKw": 1047.39
    },
    {
      "temperatureC": 0.29,
      "powerKw": 1034.62
    },
    {
      "temperatureC": 0.32,
      "powerKw": 1087.13
    },
    {
      "temperatureC": 2.51,
      "powerKw": 1213.09
    },
    {
      "temperatureC": -0.08,
      "powerKw": 1226.05
    },
    {
      "temperatureC": 1.5,
      "powerKw": 1173.41
    },
    {
      "temperatureC": -0.65,
      "powerKw": 1223.77
    },
    {
      "temperatureC": 2.77,
      "powerKw": 1268.2
    },
    {
      "temperatureC": 4.44,
      "powerKw": 330.96
    },
    {
      "temperatureC": 4.22,
      "powerKw": 418.01
    },
    {
      "temperatureC": 0.92,
      "powerKw": 452.81
    },
    {
      "temperatureC": 4.29,
      "powerKw": 456.44
    },
    {
      "temperatureC": 6.67,
      "powerKw": 642.86
    },
    {
      "temperatureC": 7.64,
      "powerKw": 659.63
    },
    {
      "temperatureC": 8.56,
      "powerKw": 1064.85
    },
    {
      "temperatureC": 9.24,
      "powerKw": 1071.97
    },
    {
      "temperatureC": 9.46,
      "powerKw": 1037.93
    },
    {
      "temperatureC": 8.23,
      "powerKw": 1033.97
    },
    {
      "temperatureC": 9.85,
      "powerKw": 1107.94
    },
    {
      "temperatureC": 9.07,
      "powerKw": 1093.13
    },
    {
      "temperatureC": 4.9,
      "powerKw": 1143.07
    },
    {
      "temperatureC": 4.81,
      "powerKw": 1081.86
    },
    {
      "temperatureC": 6.63,
      "powerKw": 1123.95
    },
    {
      "temperatureC": 5.77,
      "powerKw": 823.63
    },
    {
      "temperatureC": 5.68,
      "powerKw": 715.56
    },
    {
      "temperatureC": 6.66,
      "powerKw": 916.5
    },
    {
      "temperatureC": 5.51,
      "powerKw": 915.63
    },
    {
      "temperatureC": 7.66,
      "powerKw": 921.08
    },
    {
      "temperatureC": 5.9,
      "powerKw": 1059.92
    },
    {
      "temperatureC": 4.99,
      "powerKw": 1005.25
    },
    {
      "temperatureC": 4.74,
      "powerKw": 1165.43
    },
    {
      "temperatureC": 2.25,
      "powerKw": 1259.86
    },
    {
      "temperatureC": 2.99,
      "powerKw": 1373.19
    },
    {
      "temperatureC": 3.79,
      "powerKw": 1443.97
    },
    {
      "temperatureC": 3.16,
      "powerKw": 1470.51
    },
    {
      "temperatureC": 4.88,
      "powerKw": 1486.86
    },
    {
      "temperatureC": 6.94,
      "powerKw": 1542.81
    },
    {
      "temperatureC": 9.6,
      "powerKw": 1540.96
    },
    {
      "temperatureC": 9.7,
      "powerKw": 1648.84
    },
    {
      "temperatureC": 10.86,
      "powerKw": 1573.95
    },
    {
      "temperatureC": 11.65,
      "powerKw": 1272.46
    },
    {
      "temperatureC": 12.76,
      "powerKw": 1206.79
    },
    {
      "temperatureC": 12.61,
      "powerKw": 1148.51
    },
    {
      "temperatureC": 12.82,
      "powerKw": 860.02
    },
    {
      "temperatureC": 12.93,
      "powerKw": 784.15
    },
    {
      "temperatureC": 12.75,
      "powerKw": 735.23
    },
    {
      "temperatureC": 12.41,
      "powerKw": 867.11
    },
    {
      "temperatureC": 10.91,
      "powerKw": 830.35
    },
    {
      "temperatureC": 10.01,
      "powerKw": 965.63
    },
    {
      "temperatureC": 8.05,
      "powerKw": 1174.41
    },
    {
      "temperatureC": 5.87,
      "powerKw": 1114.41
    },
    {
      "temperatureC": 6.35,
      "powerKw": 1244.41
    },
    {
      "temperatureC": 6.36,
      "powerKw": 1503.34
    },
    {
      "temperatureC": 9.45,
      "powerKw": 1514.11
    },
    {
      "temperatureC": 8.04,
      "powerKw": 1526.9
    },
    {
      "temperatureC": 5.61,
      "powerKw": 1405.72
    },
    {
      "temperatureC": 6.17,
      "powerKw": 1652.69
    },
    {
      "temperatureC": 7.03,
      "powerKw": 1450.06
    },
    {
      "temperatureC": 5.9,
      "powerKw": 1167.83
    },
    {
      "temperatureC": 9.39,
      "powerKw": 845.4
    },
    {
      "temperatureC": 5.11,
      "powerKw": 863.6
    },
    {
      "temperatureC": 3.8,
      "powerKw": 756.29
    },
    {
      "temperatureC": 8.21,
      "powerKw": 685.33
    },
    {
      "temperatureC": 4.59,
      "powerKw": 737.56
    },
    {
      "temperatureC": 7.86,
      "powerKw": 789.14
    },
    {
      "temperatureC": 9.1,
      "powerKw": 859.51
    },
    {
      "temperatureC": 7.08,
      "powerKw": 839.87
    },
    {
      "temperatureC": 10.72,
      "powerKw": 908.49
    },
    {
      "temperatureC": 8.8,
      "powerKw": 1032.21
    },
    {
      "temperatureC": 11.23,
      "powerKw": 1328.61
    },
    {
      "temperatureC": 10.6,
      "powerKw": 1477.2
    },
    {
      "temperatureC": 7.03,
      "powerKw": 1425.58
    },
    {
      "temperatureC": 4.02,
      "powerKw": 1289.15
    },
    {
      "temperatureC": 3.63,
      "powerKw": 1308.07
    },
    {
      "temperatureC": 5.06,
      "powerKw": 1177.2
    },
    {
      "temperatureC": 7.13,
      "powerKw": 1162.39
    },
    {
      "temperatureC": 5.45,
      "powerKw": 1170.42
    },
    {
      "temperatureC": 4.44,
      "powerKw": 1225.23
    },
    {
      "temperatureC": 2.91,
      "powerKw": 1134.67
    },
    {
      "temperatureC": 1.92,
      "powerKw": 1069.11
    },
    {
      "temperatureC": 2.5,
      "powerKw": 847.7
    },
    {
      "temperatureC": 3.0,
      "powerKw": 975.56
    },
    {
      "temperatureC": 1.89,
      "powerKw": 825.93
    },
    {
      "temperatureC": 2.41,
      "powerKw": 862.47
    },
    {
      "temperatureC": -1.6,
      "powerKw": 797.28
    },
    {
      "temperatureC": -4.35,
      "powerKw": 781.7
    },
    {
      "temperatureC": -1.33,
      "powerKw": 799.37
    },
    {
      "temperatureC": -4.39,
      "powerKw": 771.21
    },
    {
      "temperatureC": -0.38,
      "powerKw": 813.75
    },
    {
      "temperatureC": 0.54,
      "powerKw": 848.31
    },
    {
      "temperatureC": 1.09,
      "powerKw": 921.39
    },
    {
      "temperatureC": 6.71,
      "powerKw": 1109.8
    },
    {
      "temperatureC": 2.0,
      "powerKw": 1077.43
    },
    {
      "temperatureC": -2.72,
      "powerKw": 998.68
    },
    {
      "temperatureC": 0.58,
      "powerKw": 919.22
    },
    {
      "temperatureC": 2.5,
      "powerKw": 919.07
    },
    {
      "temperatureC": 7.04,
      "powerKw": 1014.34
    },
    {
      "temperatureC": 3.21,
      "powerKw": 980.07
    },
    {
      "temperatureC": -0.53,
      "powerKw": 739.49
    },
    {
      "temperatureC": 3.29,
      "powerKw": 841.45
    },
    {
      "temperatureC": -1.12,
      "powerKw": 847.19
    },
    {
      "temperatureC": 3.15,
      "powerKw": 876.0
    },
    {
      "temperatureC": 5.48,
      "powerKw": 972.26
    },
    {
      "temperatureC": 3.69,
      "powerKw": 929.79
    },
    {
      "temperatureC": 3.22,
      "powerKw": 940.89
    },
    {
      "temperatureC": 3.1,
      "powerKw": 929.02
    },
    {
      "temperatureC": 1.48,
      "powerKw": 925.42
    },
    {
      "temperatureC": 0.29,
      "powerKw": 835.17
    },
    {
      "temperatureC": -0.41,
      "powerKw": 830.05
    },
    {
      "temperatureC": 0.17,
      "powerKw": 835.64
    },
    {
      "temperatureC": -0.49,
      "powerKw": 844.46
    },
    {
      "temperatureC": -5.12,
      "powerKw": 792.65
    }
  ],
  "topFeatureCorrelations": [
    {
      "label": "Active container count",
      "value": 0.795
    },
    {
      "label": "Stack tier 1 share",
      "value": -0.599
    },
    {
      "label": "Mean stack tier",
      "value": 0.566
    },
    {
      "label": "Stack tier 3 share",
      "value": 0.487
    },
    {
      "label": "Stack tier 2 share",
      "value": 0.465
    },
    {
      "label": "Ambient minus setpoint",
      "value": 0.405
    },
    {
      "label": "Ambient temperature",
      "value": 0.389
    },
    {
      "label": "Month",
      "value": 0.378
    }
  ],
  "topFeatureImportances": [
    {
      "label": "Active container count",
      "valueKw": 216.2
    },
    {
      "label": "Day of year",
      "valueKw": 137.1
    },
    {
      "label": "Setpoint temperature",
      "valueKw": 105.7
    },
    {
      "label": "Month",
      "valueKw": 91.1
    },
    {
      "label": "Return temperature",
      "valueKw": 44.3
    },
    {
      "label": "Supply temperature",
      "valueKw": 32.8
    },
    {
      "label": "Mean stack tier",
      "valueKw": 28.5
    },
    {
      "label": "Ambient minus setpoint",
      "valueKw": 12.9
    }
  ],
  "topWeatherSignals": [
    {
      "label": "VC Halle 3 temperature",
      "value": 0.557
    },
    {
      "label": "Mean site temperature",
      "value": 0.377
    },
    {
      "label": "Zentralgate temperature",
      "value": 0.231
    },
    {
      "label": "VC Halle 3 wind direction",
      "value": -0.21
    },
    {
      "label": "Mean wind direction",
      "value": -0.193
    },
    {
      "label": "Zentralgate wind direction",
      "value": -0.172
    }
  ],
  "weatherWindows": [
    {
      "label": "VC Halle 3 temperature",
      "peakHours": 72.0,
      "efficientHours": 51.0,
      "score": 0.62
    },
    {
      "label": "Mean site temperature",
      "peakHours": 72.0,
      "efficientHours": 44.0,
      "score": 0.62
    },
    {
      "label": "Zentralgate temperature",
      "peakHours": 67.0,
      "efficientHours": 46.0,
      "score": 0.57
    },
    {
      "label": "VC Halle 3 wind direction",
      "peakHours": 72.0,
      "efficientHours": 60.0,
      "score": 0.29
    },
    {
      "label": "Mean wind direction",
      "peakHours": 72.0,
      "efficientHours": 62.0,
      "score": 0.29
    },
    {
      "label": "Zentralgate wind direction",
      "peakHours": 72.0,
      "efficientHours": 63.0,
      "score": 0.28
    }
  ],
  "weatherOverview": {
    "hourlyWeatherRows": 3204,
    "weatherFeatures": 17,
    "overlapStartUtc": "2025-09-24T10:00:00Z",
    "overlapEndUtc": "2026-01-10T06:00:00Z"
  },
  "topErrorHours": [
    {
      "label": "Jan 02 17:00 UTC",
      "predictedKw": 798.57,
      "actualKw": 874.66,
      "absErrorKw": 76.1
    },
    {
      "label": "Jan 08 20:00 UTC",
      "predictedKw": 896.82,
      "actualKw": 965.15,
      "absErrorKw": 68.33
    },
    {
      "label": "Jan 09 23:00 UTC",
      "predictedKw": 1017.88,
      "actualKw": 954.28,
      "absErrorKw": 63.6
    },
    {
      "label": "Jan 06 00:00 UTC",
      "predictedKw": 880.68,
      "actualKw": 817.34,
      "absErrorKw": 63.34
    },
    {
      "label": "Jan 07 00:00 UTC",
      "predictedKw": 811.3,
      "actualKw": 865.92,
      "absErrorKw": 54.61
    }
  ]
};
