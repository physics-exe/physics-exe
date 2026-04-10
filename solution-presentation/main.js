(function () {
  const data = window.siteData;
  if (!data) {
    return;
  }

  const numberFormat = new Intl.NumberFormat("en-US");
  const compactFormat = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  const oneDecimalFormat = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const twoDecimalFormat = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const shortDateFormat = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const mediumDateFormat = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });

  function formatCompact(value) {
    return compactFormat.format(value);
  }

  function formatInt(value) {
    return numberFormat.format(Math.round(value));
  }

  function formatKw(value) {
    return `${oneDecimalFormat.format(value)} kW`;
  }

  function formatPreciseKw(value) {
    return `${twoDecimalFormat.format(value)} kW`;
  }

  function formatPct(value) {
    return `${oneDecimalFormat.format(value)}%`;
  }

  function formatDateTick(value) {
    return shortDateFormat.format(new Date(value));
  }

  function formatDateTime(value) {
    return `${mediumDateFormat.format(new Date(value))} UTC`;
  }

  function createMetricCard({ label, value, note }) {
    return `
      <article class="metric-card glass">
        <span class="metric-label">${label}</span>
        <strong class="metric-value">${value}</strong>
        <div class="metric-note">${note}</div>
      </article>
    `;
  }

  function createResultCard({ label, value, note }) {
    return `
      <article class="result-card">
        <span class="metric-label">${label}</span>
        <strong class="metric-value">${value}</strong>
        <div class="metric-note">${note}</div>
      </article>
    `;
  }

  function injectHeroCards() {
    const heroStats = [
      {
        label: "Raw reefer rows",
        value: formatCompact(data.challenge.rawRows),
        note: "Container-level records parsed from the participant release.",
      },
      {
        label: "Hourly snapshots",
        value: formatInt(data.challenge.hourlyRows),
        note: "Aggregated terminal-level load states used for analysis.",
      },
      {
        label: "Public target hours",
        value: formatInt(data.challenge.publicTargetHours),
        note: "January hours that needed predictions for the released task.",
      },
      {
        label: "January MAE",
        value: formatPreciseKw(data.results.maeKw),
        note: "Observed overlap quality for the showcased notebook rollout.",
      },
    ];

    document.getElementById("heroStats").innerHTML = heroStats.map(createMetricCard).join("");
  }

  function injectWeights() {
    const weights = data.challenge.evaluationWeights;
    const cards = [
      { label: "All hours", value: formatPct(weights.mae_all * 100) },
      { label: "Peak hours", value: formatPct(weights.mae_peak * 100) },
      { label: "p90 pinball", value: formatPct(weights.pinball_p90 * 100) },
    ];

    document.getElementById("weightCards").innerHTML = cards
      .map(
        (item) => `
          <div class="metric-card">
            <span class="metric-label">${item.label}</span>
            <strong class="metric-value">${item.value}</strong>
          </div>
        `,
      )
      .join("");
  }

  function injectNarrativePoints() {
    const items = [
      "Forecast combined reefer power, not general terminal activity.",
      "Keep peak-hour misses low because the terminal cares about stressed hours most.",
      "Pair each point forecast with a conservative p90 band for operational safety.",
      "Explain the model in a way that works for both technical and non-technical audiences.",
    ];

    document.getElementById("narrativePoints").innerHTML = items
      .map((item) => `<li>${item}</li>`)
      .join("");
  }

  function injectResults() {
    const cards = [
      {
        label: "Overlap hours",
        value: formatInt(data.results.overlapHours),
        note: "Hours with both notebook predictions and observed January values.",
      },
      {
        label: "January RMSE",
        value: formatPreciseKw(data.results.rmseKw),
        note: "How tightly the rollout stayed around the true trajectory.",
      },
      {
        label: "Peak capture",
        value: formatPct(data.results.peakCapturePct),
        note: `${formatPreciseKw(data.results.peakPredictedKw)} predicted vs ${formatPreciseKw(data.results.peakActualKw)} actual.`,
      },
      {
        label: "Mean p90 uplift",
        value: formatPct(data.results.meanP90UpliftPct),
        note: "Fixed headroom added on top of the point forecast in the notebook.",
      },
    ];

    document.getElementById("resultCards").innerHTML = cards.map(createResultCard).join("");
  }

  function injectErrorTable() {
    const rows = data.topErrorHours
      .map(
        (row) => `
          <div class="table-row">
            <div>
              <strong>${row.label}</strong>
              <span>Largest absolute miss</span>
            </div>
            <div>
              <strong>${formatPreciseKw(row.predictedKw)}</strong>
              <span>Predicted</span>
            </div>
            <div>
              <strong>${formatPreciseKw(row.actualKw)}</strong>
              <span>Actual</span>
            </div>
            <div>
              <strong>${formatPreciseKw(row.absErrorKw)}</strong>
              <span>Abs. error</span>
            </div>
          </div>
        `,
      )
      .join("");

    document.getElementById("errorHoursTable").innerHTML = rows;
  }

  function injectModelDetails() {
    const architecture = data.solution.architecture;
    document.getElementById("inputSizeValue").textContent = architecture.inputSize;
    document.getElementById("hiddenSizeValue").textContent = architecture.hiddenSize;
    document.getElementById("outputSizeValue").textContent = architecture.outputSize;

    document.getElementById("processFlow").innerHTML = data.solution.process
      .map(
        (step, index) => `
          <div class="process-step">
            <div class="process-index">${index + 1}</div>
            <div class="process-copy">${step}</div>
          </div>
        `,
      )
      .join("");

    const configCards = [
      { label: "Correlation gate", value: `|r| >= ${architecture.correlationThreshold}` },
      { label: "Batch size", value: architecture.batchSize },
      { label: "Epoch budget", value: architecture.epochs },
      { label: "Optimizer", value: architecture.optimizer },
      { label: "Learning rate", value: architecture.learningRate },
      { label: "Loss", value: architecture.loss },
      { label: "Activation", value: architecture.activation },
      { label: "p90 rule", value: architecture.p90Rule },
      { label: "Forecast span", value: data.solution.inferenceWindow },
    ];

    document.getElementById("configGrid").innerHTML = configCards
      .map(
        (item) => `
          <div class="config-item">
            <span>${item.label}</span>
            <strong>${item.value}</strong>
          </div>
        `,
      )
      .join("");

    document.getElementById("layerBreakdown").innerHTML = data.solution.layerBreakdown
      .map(
        (layer) => `
          <div class="layer-row">
            <div class="layer-stage">${layer.stage}</div>
            <div class="layer-shape">${layer.shape}</div>
            <div class="layer-note">${layer.note}</div>
          </div>
        `,
      )
      .join("");

    document.getElementById("featureChips").innerHTML = data.solution.featureThemes
      .map((label) => `<span class="chip">${label}</span>`)
      .join("");

    const diagram = data.solution.diagramFlow;
    document.getElementById("detailedModelDiagram").innerHTML = `
      <div class="diagram-column">
        <p class="panel-label">1. Data Intake</p>
        <div class="diagram-stack">
          ${diagram.inputs
            .map(
              (item) => `
                <div class="diagram-node">
                  <strong class="diagram-node-title">${item.title}</strong>
                  <div class="diagram-node-copy">${item.detail}</div>
                </div>
              `,
            )
            .join("")}
        </div>
      </div>
      <div class="diagram-column network-column">
        <p class="panel-label">2. Generator Core</p>
        <div class="diagram-stack">
          ${diagram.network
            .slice(0, 2)
            .map(
              (item) => `
                <div class="diagram-node">
                  <strong class="diagram-node-title">${item.title}</strong>
                  <div class="diagram-node-copy">${item.detail}</div>
                </div>
              `,
            )
            .join("")}
        </div>
        <div class="diagram-bridge">
          <strong>Merge rule</strong>
          <span>${diagram.network[2].detail}</span>
        </div>
        <div class="diagram-stack">
          <div class="diagram-node">
            <strong class="diagram-node-title">Weight clamp</strong>
            <div class="diagram-node-copy">
              Feature weights are kept in the tiny positive range ${architecture.featureWeightClamp} before being summed.
            </div>
          </div>
        </div>
      </div>
      <div class="diagram-column">
        <p class="panel-label">3. Training Loop</p>
        <div class="diagram-stack">
          ${diagram.training
            .map(
              (item) => `
                <div class="diagram-node">
                  <strong class="diagram-node-title">${item.title}</strong>
                  <div class="diagram-node-copy">${item.detail}</div>
                </div>
              `,
            )
            .join("")}
        </div>
      </div>
      <div class="diagram-column">
        <p class="panel-label">4. Inference Output</p>
        <div class="diagram-stack">
          ${diagram.inference
            .map(
              (item) => `
                <div class="diagram-node">
                  <strong class="diagram-node-title">${item.title}</strong>
                  <div class="diagram-node-copy">${item.detail}</div>
                </div>
              `,
            )
            .join("")}
          <div class="diagram-node">
            <strong class="diagram-node-title">Submission file</strong>
            <div class="diagram-node-copy">
              The final CSV stores hourly point forecasts and p90 values for the released January timestamps.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function rankGroup(title, items, maxValue, valueKey, formatter, metaBuilder) {
    return `
      <div class="rank-stack">
        <p class="panel-label">${title}</p>
        ${items
          .map((item) => {
            const width = `${Math.max(8, (item[valueKey] / maxValue) * 100)}%`;
            return `
              <div class="rank-item">
                <div class="rank-head">
                  <strong>${item.label}</strong>
                  <span class="rank-value">${formatter(item[valueKey])}</span>
                </div>
                <div class="rank-bar"><span style="width:${width}"></span></div>
                <div class="rank-meta">${metaBuilder(item)}</div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function injectRankings() {
    const featureCorrMax = Math.max(...data.topFeatureCorrelations.map((item) => Math.abs(item.value)));
    const featureImportanceMax = Math.max(...data.topFeatureImportances.map((item) => item.valueKw));
    const weatherSignalMax = Math.max(...data.topWeatherSignals.map((item) => Math.abs(item.value)));
    const weatherWindowMax = Math.max(...data.weatherWindows.map((item) => item.efficientHours));

    document.getElementById("featureRanks").innerHTML =
      rankGroup(
        "Correlation strength",
        data.topFeatureCorrelations.slice(0, 5),
        featureCorrMax,
        "value",
        (value) => `${value > 0 ? "+" : ""}${twoDecimalFormat.format(value)}`,
        () => "Higher absolute values indicate a tighter direct relationship with load.",
      ) +
      rankGroup(
        "Permutation impact",
        data.topFeatureImportances.slice(0, 5),
        featureImportanceMax,
        "valueKw",
        (value) => formatPreciseKw(value),
        () => "Estimated MAE increase when the feature is disrupted in the simple ridge view.",
      );

    document.getElementById("weatherRanks").innerHTML =
      rankGroup(
        "Same-hour weather signals",
        data.topWeatherSignals,
        weatherSignalMax,
        "value",
        (value) => `${value > 0 ? "+" : ""}${twoDecimalFormat.format(value)}`,
        () => "Temperature dominates the immediate weather relationship.",
      ) +
      rankGroup(
        "Recommended history windows",
        data.weatherWindows,
        weatherWindowMax,
        "efficientHours",
        (value) => `${value} h`,
        (item) => `Peak utility at ${item.peakHours} h with score ${twoDecimalFormat.format(item.score)}.`,
      );
  }

  function toScale(domainMin, domainMax, rangeMin, rangeMax) {
    const span = domainMax - domainMin || 1;
    return (value) => rangeMin + ((value - domainMin) / span) * (rangeMax - rangeMin);
  }

  function linePath(points) {
    if (!points.length) {
      return "";
    }
    return points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(" ");
  }

  function segmentedLinePath(points) {
    const segments = [];
    let current = [];
    points.forEach((point) => {
      if (point.y === null || Number.isNaN(point.y)) {
        if (current.length > 1) {
          segments.push(linePath(current));
        }
        current = [];
        return;
      }
      current.push(point);
    });
    if (current.length > 1) {
      segments.push(linePath(current));
    }
    return segments.join(" ");
  }

  function areaPath(points, baselineY) {
    if (!points.length) {
      return "";
    }
    const top = linePath(points);
    const last = points[points.length - 1];
    const first = points[0];
    return `${top} L ${last.x.toFixed(2)} ${baselineY.toFixed(2)} L ${first.x.toFixed(2)} ${baselineY.toFixed(2)} Z`;
  }

  function bandPath(topPoints, bottomPoints) {
    if (!topPoints.length || !bottomPoints.length) {
      return "";
    }
    const top = linePath(topPoints);
    const bottom = [...bottomPoints]
      .reverse()
      .map((point) => `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(" ");
    return `${top} ${bottom} Z`;
  }

  function buildChartBase(width, height, xTicks, yTicks, yScale, xScale, xLabelBuilder, yLabelBuilder) {
    const margin = { top: 18, right: 18, bottom: 38, left: 56 };
    const gridLines = yTicks
      .map((tick) => {
        const y = yScale(tick);
        return `
          <line x1="${margin.left}" x2="${width - margin.right}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,0.08)" />
          <text x="${margin.left - 10}" y="${y + 4}" text-anchor="end" fill="rgba(151,172,193,0.95)" font-size="11">${yLabelBuilder(tick)}</text>
        `;
      })
      .join("");

    const axisLabels = xTicks
      .map((tick) => {
        const x = xScale(tick.index);
        return `
          <text x="${x}" y="${height - 12}" text-anchor="middle" fill="rgba(151,172,193,0.95)" font-size="11">${xLabelBuilder(tick.value)}</text>
        `;
      })
      .join("");

    return {
      margin,
      gridLines,
      axisLabels,
    };
  }

  function tickValues(min, max, count) {
    const span = max - min || 1;
    return Array.from({ length: count }, (_, index) => min + (span * index) / (count - 1));
  }

  function indexTicks(dataPoints, count, valueAccessor) {
    if (!dataPoints.length) {
      return [];
    }
    if (dataPoints.length === 1) {
      return [{ index: 0, value: valueAccessor(dataPoints[0]) }];
    }
    return Array.from({ length: count }, (_, index) => {
      const ratio = index / (count - 1);
      const pointIndex = Math.min(dataPoints.length - 1, Math.round(ratio * (dataPoints.length - 1)));
      return {
        index: pointIndex,
        value: valueAccessor(dataPoints[pointIndex]),
      };
    });
  }

  function renderLineChart(containerId, seriesData, options) {
    const container = document.getElementById(containerId);
    const width = 900;
    const height = options.height || 320;
    const margin = { top: 18, right: 18, bottom: 38, left: 56 };

    const allValues = [];
    seriesData.forEach((series) => {
      series.values.forEach((value) => {
        if (value !== null && !Number.isNaN(value)) {
          allValues.push(value);
        }
      });
    });
    if (!allValues.length) {
      container.innerHTML = "";
      return;
    }

    const minValue = options.minY !== undefined ? options.minY : Math.min(...allValues);
    const maxValue = options.maxY !== undefined ? options.maxY : Math.max(...allValues);
    const padding = (maxValue - minValue || 1) * 0.12;
    const domainMin = Math.max(0, minValue - padding);
    const domainMax = maxValue + padding;

    const xScale = toScale(0, seriesData[0].values.length - 1 || 1, margin.left, width - margin.right);
    const yScale = toScale(domainMin, domainMax, height - margin.bottom, margin.top);
    const xTicks = indexTicks(options.baseData, options.xTickCount || 6, options.xLabelAccessor);
    const yTicks = tickValues(domainMin, domainMax, 5);
    const base = buildChartBase(
      width,
      height,
      xTicks,
      yTicks,
      yScale,
      xScale,
      options.xTickFormatter,
      options.yTickFormatter,
    );

    const bandMarkup = options.band
      ? (() => {
          const topPoints = options.baseData.map((item, index) => ({
            x: xScale(index),
            y: yScale(item[options.band.upperKey]),
          }));
          const bottomPoints = options.baseData.map((item, index) => ({
            x: xScale(index),
            y: yScale(item[options.band.lowerKey]),
          }));
          return `<path d="${bandPath(topPoints, bottomPoints)}" fill="${options.band.fill}" />`;
        })()
      : "";

    const areaMarkup =
      options.areaKey !== undefined
        ? (() => {
            const points = options.baseData.map((item, index) => ({
              x: xScale(index),
              y: yScale(item[options.areaKey]),
            }));
            return `<path d="${areaPath(points, yScale(domainMin))}" fill="${options.areaFill}" />`;
          })()
        : "";

    const seriesMarkup = seriesData
      .map((series) => {
        const points = series.values.map((value, index) => ({
          x: xScale(index),
          y: value === null ? null : yScale(value),
        }));
        return `<path d="${segmentedLinePath(points)}" fill="none" stroke="${series.color}" stroke-width="${series.strokeWidth || 3}" stroke-linecap="round" stroke-linejoin="round" />`;
      })
      .join("");

    const legends = seriesData
      .map(
        (series, index) => `
          <g transform="translate(${margin.left + index * 190}, ${height - 6})">
            <line x1="0" x2="20" y1="0" y2="0" stroke="${series.color}" stroke-width="3" />
            <text x="28" y="4" fill="rgba(151,172,193,0.95)" font-size="11">${series.label}</text>
          </g>
        `,
      )
      .join("");

    container.innerHTML = `
      <div class="chart-shell">
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${options.ariaLabel}">
          ${base.gridLines}
          ${areaMarkup}
          ${bandMarkup}
          ${seriesMarkup}
          <line x1="${margin.left}" x2="${margin.left}" y1="${margin.top}" y2="${height - margin.bottom}" stroke="rgba(255,255,255,0.12)" />
          <line x1="${margin.left}" x2="${width - margin.right}" y1="${height - margin.bottom}" y2="${height - margin.bottom}" stroke="rgba(255,255,255,0.12)" />
          ${base.axisLabels}
          ${legends}
        </svg>
      </div>
    `;
  }

  function renderBarChart(containerId, rows, options) {
    const container = document.getElementById(containerId);
    const width = 900;
    const height = options.height || 280;
    const margin = { top: 18, right: 18, bottom: 42, left: 56 };
    const maxValue = Math.max(...rows.map((row) => row[options.valueKey]));
    const xStep = (width - margin.left - margin.right) / rows.length;
    const barWidth = xStep * 0.66;
    const yScale = toScale(0, maxValue * 1.12, height - margin.bottom, margin.top);
    const yTicks = tickValues(0, maxValue * 1.12, 5);
    const xTicks = rows.map((row, index) => ({ index, value: row[options.labelKey] }));
    const xScale = toScale(0, rows.length - 1 || 1, margin.left, width - margin.right);
    const base = buildChartBase(width, height, xTicks, yTicks, yScale, xScale, (value) => value, options.yTickFormatter);

    const bars = rows
      .map((row, index) => {
        const value = row[options.valueKey];
        const x = margin.left + index * xStep + (xStep - barWidth) / 2;
        const y = yScale(value);
        const barHeight = height - margin.bottom - y;
        return `
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="12" fill="${options.barColor}" />
        `;
      })
      .join("");

    container.innerHTML = `
      <div class="chart-shell">
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${options.ariaLabel}">
          ${base.gridLines}
          ${bars}
          <line x1="${margin.left}" x2="${margin.left}" y1="${margin.top}" y2="${height - margin.bottom}" stroke="rgba(255,255,255,0.12)" />
          <line x1="${margin.left}" x2="${width - margin.right}" y1="${height - margin.bottom}" y2="${height - margin.bottom}" stroke="rgba(255,255,255,0.12)" />
          ${base.axisLabels}
        </svg>
      </div>
    `;
  }

  function renderScatterChart(containerId, rows, options) {
    const container = document.getElementById(containerId);
    const width = 900;
    const height = options.height || 300;
    const margin = { top: 20, right: 18, bottom: 40, left: 56 };
    const xValues = rows.map((row) => row[options.xKey]).filter((value) => value !== null);
    const yValues = rows.map((row) => row[options.yKey]).filter((value) => value !== null);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const xScale = toScale(minX, maxX, margin.left, width - margin.right);
    const yScale = toScale(minY, maxY, height - margin.bottom, margin.top);

    const yTicks = tickValues(minY, maxY, 5);
    const xTicks = tickValues(minX, maxX, 5).map((value) => ({ index: value, value }));
    const base = {
      gridLines: yTicks
        .map((tick) => {
          const y = yScale(tick);
          return `
            <line x1="${margin.left}" x2="${width - margin.right}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,0.08)" />
            <text x="${margin.left - 10}" y="${y + 4}" text-anchor="end" fill="rgba(151,172,193,0.95)" font-size="11">${options.yTickFormatter(tick)}</text>
          `;
        })
        .join(""),
      axisLabels: xTicks
        .map((tick) => {
          const x = xScale(tick.value);
          return `
            <text x="${x}" y="${height - 12}" text-anchor="middle" fill="rgba(151,172,193,0.95)" font-size="11">${options.xTickFormatter(tick.value)}</text>
          `;
        })
        .join(""),
    };

    const circles = rows
      .map((row) => {
        const x = xScale(row[options.xKey]);
        const y = yScale(row[options.yKey]);
        return `<circle cx="${x}" cy="${y}" r="5.5" fill="${options.color}" fill-opacity="0.35" stroke="${options.stroke || options.color}" stroke-opacity="0.5" />`;
      })
      .join("");

    container.innerHTML = `
      <div class="chart-shell">
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${options.ariaLabel}">
          ${base.gridLines}
          ${circles}
          <line x1="${margin.left}" x2="${margin.left}" y1="${margin.top}" y2="${height - margin.bottom}" stroke="rgba(255,255,255,0.12)" />
          <line x1="${margin.left}" x2="${width - margin.right}" y1="${height - margin.bottom}" y2="${height - margin.bottom}" stroke="rgba(255,255,255,0.12)" />
          ${base.axisLabels}
        </svg>
      </div>
    `;
  }

  function renderCharts() {
    renderLineChart(
      "januaryForecastChart",
      [
        {
          label: "Actual overlap",
          color: "#ffd77b",
          values: data.januaryForecast.map((row) => row.actualKw),
          strokeWidth: 3,
        },
        {
          label: "Point forecast",
          color: "#54d3c2",
          values: data.januaryForecast.map((row) => row.pointKw),
          strokeWidth: 3.5,
        },
        {
          label: "p90 envelope",
          color: "#ff9a5a",
          values: data.januaryForecast.map((row) => row.p90Kw),
          strokeWidth: 2.5,
        },
      ],
      {
        baseData: data.januaryForecast,
        band: {
          lowerKey: "pointKw",
          upperKey: "p90Kw",
          fill: "rgba(255, 154, 90, 0.16)",
        },
        xLabelAccessor: (row) => row.timestampUtc,
        xTickFormatter: formatDateTick,
        yTickFormatter: (value) => formatInt(value),
        ariaLabel: "January forecast chart",
        height: 340,
      },
    );

    renderBarChart("dailyMaeChart", data.januaryDailyMae, {
      labelKey: "label",
      valueKey: "valueKw",
      yTickFormatter: (value) => formatInt(value),
      barColor: "rgba(255, 154, 90, 0.88)",
      ariaLabel: "Daily MAE chart",
      height: 280,
    });

    renderLineChart(
      "yearlyPowerChart",
      [
        {
          label: "Hourly demand",
          color: "#54d3c2",
          values: data.yearlyPowerSeries.map((row) => row.powerKw),
          strokeWidth: 2.8,
        },
      ],
      {
        baseData: data.yearlyPowerSeries,
        areaKey: "powerKw",
        areaFill: "rgba(84, 211, 194, 0.15)",
        xLabelAccessor: (row) => row.timestampUtc,
        xTickFormatter: formatDateTick,
        yTickFormatter: (value) => formatInt(value),
        ariaLabel: "Historical load trace chart",
      },
    );

    renderBarChart("hourProfileChart", data.hourProfile, {
      labelKey: "label",
      valueKey: "powerKw",
      yTickFormatter: (value) => formatInt(value),
      barColor: "rgba(84, 211, 194, 0.88)",
      ariaLabel: "Hour of day profile chart",
      height: 280,
    });

    renderScatterChart("containerScatterChart", data.containerScatter, {
      xKey: "containers",
      yKey: "powerKw",
      xTickFormatter: (value) => formatInt(value),
      yTickFormatter: (value) => formatInt(value),
      color: "#54d3c2",
      stroke: "#7ee2d5",
      ariaLabel: "Container count versus power scatter plot",
    });

    renderScatterChart("weatherScatterChart", data.weatherScatter, {
      xKey: "temperatureC",
      yKey: "powerKw",
      xTickFormatter: (value) => oneDecimalFormat.format(value),
      yTickFormatter: (value) => formatInt(value),
      color: "#ff9a5a",
      stroke: "#ffc79f",
      ariaLabel: "Temperature versus power scatter plot",
    });
  }

  function setupReveal() {
    const nodes = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    nodes.forEach((node) => observer.observe(node));
  }

  function updateHeaderOffset() {
    const topbar = document.querySelector(".topbar");
    if (!topbar) {
      return;
    }
    const rect = topbar.getBoundingClientRect();
    const offset = rect.height + 32;
    document.documentElement.style.setProperty("--header-offset", `${offset}px`);
  }

  injectWeights();
  injectHeroCards();
  injectNarrativePoints();
  injectResults();
  injectErrorTable();
  injectRankings();
  injectModelDetails();
  renderCharts();
  updateHeaderOffset();
  setupReveal();

  window.addEventListener("resize", updateHeaderOffset);

  document.querySelectorAll(".reveal").forEach((node, index) => {
    if (index < 2) {
      node.classList.add("is-visible");
    }
  });

  document.title = data.meta.siteTitle;
})();
