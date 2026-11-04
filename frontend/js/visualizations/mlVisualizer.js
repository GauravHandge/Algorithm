/* Machine Learning & Deep Learning Visualizer Component */
export class MLVisualizer {
  constructor(container) {
    this.container = container;
  }

  render(state) {
    if (!this.container) return;
    this.container.innerHTML = "";

    if (!state) {
      this.container.innerHTML = `<div style="color:var(--text-muted); padding:2rem; text-align:center;">No execution state loaded</div>`;
      return;
    }

    const variables = state.variables || {};
    const subType = variables.subType || "";

    // 1. K-Means Clustering
    if (subType === "kmeans") {
      this._renderKMeans(variables);
      return;
    }

    // 2. K-Nearest Neighbors (KNN)
    if (subType === "knn") {
      this._renderKNN(variables);
      return;
    }

    // 3. Decision Tree
    if (subType === "decision_tree") {
      this._renderDecisionTree(variables);
      return;
    }

    // 4. Logistic Regression
    if (subType === "logistic_regression") {
      this._renderLogisticRegression(variables);
      return;
    }

    // 5. CNN Convolution & Pooling
    if (subType === "cnn") {
      this._renderCNN(variables);
      return;
    }

    // 6. Optimizers Race
    if (subType === "optimizers") {
      this._renderOptimizers(variables);
      return;
    }

    // 7. Neural Network
    if (variables.inputs || variables.hidden_activations || variables.prediction !== undefined) {
      this._renderNeuralNetwork(variables);
      return;
    }

    // 8. Default: Linear Regression 2D Scatter + Best Fit Line
    this._renderLinearRegression(variables);
  }

  // --- K-Means Clustering Visualizer ---
  _renderKMeans(vars) {
    const width = 640;
    const height = 360;
    const margin = 40;
    const points = vars.points || [];
    const centroids = vars.centroids || [];
    const clusterColors = ["#38bdf8", "#34d399", "#f472b6", "#fbbf24"];

    let svgHtml = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="width:100%; height:100%;">
      <!-- Background Grid -->
      <line x1="${margin}" y1="${height - margin}" x2="${width - margin}" y2="${height - margin}" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
      <line x1="${margin}" y1="${margin}" x2="${margin}" y2="${height - margin}" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
      <text x="${width - margin + 5}" y="${height - margin + 5}" fill="#94a3b8" font-size="11">X</text>
      <text x="${margin - 10}" y="${margin - 10}" fill="#94a3b8" font-size="11">Y</text>`;

    // Draw connection lines to nearest centroid if assigned
    points.forEach(pt => {
      const px = margin + (pt.x / 10) * (width - 2 * margin);
      const py = (height - margin) - (pt.y / 8) * (height - 2 * margin);

      if (pt.cluster !== -1 && centroids[pt.cluster]) {
        const c = centroids[pt.cluster];
        const cx = margin + (c.x / 10) * (width - 2 * margin);
        const cy = (height - margin) - (c.y / 8) * (height - 2 * margin);
        svgHtml += `<line x1="${px}" y1="${py}" x2="${cx}" y2="${cy}" stroke="${c.color || '#38bdf8'}" stroke-width="1" stroke-dasharray="3,3" opacity="0.4" />`;
      }
    });

    // Draw Points
    points.forEach(pt => {
      const px = margin + (pt.x / 10) * (width - 2 * margin);
      const py = (height - margin) - (pt.y / 8) * (height - 2 * margin);
      const color = pt.cluster === -1 ? "#94a3b8" : clusterColors[pt.cluster % clusterColors.length];
      svgHtml += `<circle cx="${px}" cy="${py}" r="6" fill="${color}" stroke="#ffffff" stroke-width="1.5" />`;
    });

    // Draw Centroids as glowing diamonds
    centroids.forEach((c, idx) => {
      const cx = margin + (c.x / 10) * (width - 2 * margin);
      const cy = (height - margin) - (c.y / 8) * (height - 2 * margin);
      const color = c.color || clusterColors[idx % clusterColors.length];

      svgHtml += `
        <g>
          <circle cx="${cx}" cy="${cy}" r="16" fill="${color}" opacity="0.25" />
          <polygon points="${cx},${cy - 12} ${cx + 12},${cy} ${cx},${cy + 12} ${cx - 12},${cy}" fill="${color}" stroke="#ffffff" stroke-width="2" />
          <text x="${cx}" y="${cy + 4}" font-size="10" font-weight="bold" fill="#000" text-anchor="middle">C${idx + 1}</text>
        </g>`;
    });

    svgHtml += `</svg>`;

    const overlay = `<div style="position:absolute; top:12px; right:12px; background:rgba(15,23,42,0.85); padding:10px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); font-size:0.85rem;">
      <div style="color:#38bdf8; font-weight:700;">K-Means (K=${vars.k || 3})</div>
      <div style="color:#94a3b8; font-size:0.78rem; margin-top:3px;">Iteration: <strong>${vars.iteration || 0}</strong></div>
    </div>`;

    this.container.innerHTML = svgHtml + overlay;
  }

  // --- K-Nearest Neighbors (KNN) Visualizer ---
  _renderKNN(vars) {
    const width = 640;
    const height = 360;
    const margin = 40;
    const trainPoints = vars.train_points || [];
    const q = vars.query_point || { x: 3, y: 3 };
    const radius = vars.radius || 0;

    const qx = margin + (q.x / 8) * (width - 2 * margin);
    const qy = (height - margin) - (q.y / 7) * (height - 2 * margin);
    const radPx = radius ? (radius / 8) * (width - 2 * margin) : 0;

    let svgHtml = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="width:100%; height:100%;">
      <!-- Axes -->
      <line x1="${margin}" y1="${height - margin}" x2="${width - margin}" y2="${height - margin}" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
      <line x1="${margin}" y1="${margin}" x2="${margin}" y2="${height - margin}" stroke="rgba(255,255,255,0.15)" stroke-width="2" />`;

    // Decision Radius Circle
    if (radPx > 0) {
      svgHtml += `<circle cx="${qx}" cy="${qy}" r="${radPx}" fill="rgba(251,191,36,0.12)" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4,4" />`;
    }

    // Training Points
    trainPoints.forEach(pt => {
      const px = margin + (pt.x / 8) * (width - 2 * margin);
      const py = (height - margin) - (pt.y / 7) * (height - 2 * margin);
      svgHtml += `<circle cx="${px}" cy="${py}" r="6.5" fill="${pt.color || '#38bdf8'}" stroke="#ffffff" stroke-width="1.5" />`;
    });

    // Query Point (Pulsing Diamond)
    svgHtml += `
      <g>
        <polygon points="${qx},${qy - 10} ${qx + 10},${qy} ${qx},${qy + 10} ${qx - 10},${qy}" fill="#f59e0b" stroke="#ffffff" stroke-width="2" />
        <text x="${qx}" y="${qy - 14}" font-size="11" font-weight="bold" fill="#fde047" text-anchor="middle">Query (?)</text>
      </g>
    </svg>`;

    const predictionBadge = vars.prediction ?
      `<div style="color:#34d399; font-weight:bold; margin-top:4px;">Pred: ${vars.prediction}</div>` : '';

    const overlay = `<div style="position:absolute; top:12px; right:12px; background:rgba(15,23,42,0.85); padding:10px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); font-size:0.85rem;">
      <div style="color:#fbbf24; font-weight:700;">KNN (K = ${vars.k || 3})</div>
      <div style="color:#94a3b8; font-size:0.78rem;">Radius: ${radius ? radius.toFixed(2) : 'Searching'}</div>
      ${predictionBadge}
    </div>`;

    this.container.innerHTML = svgHtml + overlay;
  }

  // --- Decision Tree Visualizer ---
  _renderDecisionTree(vars) {
    const width = 640;
    const height = 360;

    let svgHtml = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="width:100%; height:100%;">
      <!-- Tree Branch Lines -->
      <line x1="320" y1="60" x2="160" y2="150" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
      <line x1="320" y1="60" x2="480" y2="150" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
      <text x="210" y="95" fill="#38bdf8" font-size="11">Yes (Age &lt;= 30)</text>
      <text x="430" y="95" fill="#f472b6" font-size="11">No (Age &gt; 30)</text>

      <line x1="160" y1="150" x2="90" y2="250" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
      <line x1="160" y1="150" x2="230" y2="250" stroke="rgba(255,255,255,0.15)" stroke-width="2" />

      <line x1="480" y1="150" x2="410" y2="250" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
      <line x1="480" y1="150" x2="550" y2="250" stroke="rgba(255,255,255,0.15)" stroke-width="2" />

      <!-- Root Node -->
      <rect x="240" y="30" width="160" height="46" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
      <text x="320" y="52" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">Age &lt;= 30 ?</text>
      <text x="320" y="68" fill="#94a3b8" font-size="10" text-anchor="middle">Gini: 0.469 | N=8</text>

      <!-- Level 1 Splits -->
      <rect x="90" y="130" width="140" height="44" rx="8" fill="#1e293b" stroke="#6366f1" stroke-width="1.5" />
      <text x="160" y="150" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">Income &lt;= 45 ?</text>
      <text x="160" y="165" fill="#94a3b8" font-size="9" text-anchor="middle">N=3</text>

      <rect x="410" y="130" width="140" height="44" rx="8" fill="#1e293b" stroke="#6366f1" stroke-width="1.5" />
      <text x="480" y="150" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">Income &gt; 35 ?</text>
      <text x="480" y="165" fill="#94a3b8" font-size="9" text-anchor="middle">N=5</text>

      <!-- Terminal Leaves -->
      <rect x="45" y="240" width="90" height="36" rx="6" fill="#f87171" />
      <text x="90" y="262" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">No (0)</text>

      <rect x="185" y="240" width="90" height="36" rx="6" fill="#34d399" />
      <text x="230" y="262" fill="#000" font-size="11" font-weight="bold" text-anchor="middle">Yes (1)</text>

      <rect x="365" y="240" width="90" height="36" rx="6" fill="#34d399" />
      <text x="410" y="262" fill="#000" font-size="11" font-weight="bold" text-anchor="middle">Yes (1)</text>

      <rect x="505" y="240" width="90" height="36" rx="6" fill="#f87171" />
      <text x="550" y="262" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">No (0)</text>
    </svg>`;

    const overlay = `<div style="position:absolute; bottom:12px; left:12px; background:rgba(15,23,42,0.85); padding:8px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); font-size:0.8rem; color:#94a3b8;">
      Pure Leaves Reached: <strong style="color:#34d399;">100% Accuracy</strong> | Criterion: <strong>Gini Impurity</strong>
    </div>`;

    this.container.innerHTML = svgHtml + overlay;
  }

  // --- Logistic Regression (Sigmoid S-Curve) ---
  _renderLogisticRegression(vars) {
    const width = 640;
    const height = 360;
    const margin = 40;
    const w = vars.w || 0.5;
    const b = vars.b || -1.5;
    const boundary = vars.decision_boundary || 3.0;
    const data = vars.data || [];

    let svgHtml = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="width:100%; height:100%;">
      <!-- Axes -->
      <line x1="${margin}" y1="${height - margin}" x2="${width - margin}" y2="${height - margin}" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
      <line x1="${margin}" y1="${margin}" x2="${margin}" y2="${height - margin}" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
      
      <!-- Probability threshold line at P = 0.5 -->
      <line x1="${margin}" y1="${height / 2}" x2="${width - margin}" y2="${height / 2}" stroke="rgba(255,255,255,0.15)" stroke-dasharray="4,4" />
      <text x="${width - margin + 5}" y="${height / 2 + 4}" fill="#94a3b8" font-size="10">P = 0.5</text>`;

    // Vertical Decision Boundary
    if (boundary > 0 && boundary < 6) {
      const bx = margin + (boundary / 6) * (width - 2 * margin);
      svgHtml += `
        <line x1="${bx}" y1="${margin}" x2="${bx}" y2="${height - margin}" stroke="#f472b6" stroke-width="2" stroke-dasharray="3,3" />
        <text x="${bx}" y="${margin - 5}" fill="#f472b6" font-size="10" font-weight="bold" text-anchor="middle">Boundary: ${boundary}h</text>`;
    }

    // Sigmoid Curve
    let pathD = "";
    for (let xVal = 0; xVal <= 6; xVal += 0.1) {
      const z = w * xVal + b;
      const p = 1 / (1 + Math.exp(-Math.max(Math.min(z, 20), -20)));
      const px = margin + (xVal / 6) * (width - 2 * margin);
      const py = (height - margin) - p * (height - 2 * margin);
      pathD += (pathD === "" ? `M ${px} ${py}` : ` L ${px} ${py}`);
    }
    svgHtml += `<path d="${pathD}" fill="none" stroke="#38bdf8" stroke-width="3" />`;

    // Data points (at y=0 or y=1)
    data.forEach(d => {
      const px = margin + (d.hours / 6) * (width - 2 * margin);
      const py = d.passed === 1 ? margin + 15 : height - margin - 15;
      const col = d.passed === 1 ? "#34d399" : "#f87171";
      svgHtml += `<circle cx="${px}" cy="${py}" r="5.5" fill="${col}" stroke="#fff" stroke-width="1.5" />`;
    });

    svgHtml += `</svg>`;

    const overlay = `<div style="position:absolute; top:12px; right:12px; background:rgba(15,23,42,0.85); padding:10px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); font-size:0.85rem;">
      <div style="color:#38bdf8; font-weight:700;">Sigmoid σ(z) = 1/(1 + e<sup>-z</sup>)</div>
      <div style="color:#94a3b8; font-size:0.78rem; margin-top:2px;">w: ${w} | b: ${b} | Loss: ${vars.loss || 0}</div>
    </div>`;

    this.container.innerHTML = svgHtml + overlay;
  }

  // --- CNN Convolution & Pooling Visualizer ---
  _renderCNN(vars) {
    const img = vars.image || [
      [1, 0, 1, 0, 1],
      [0, 1, 1, 1, 0],
      [1, 1, 0, 1, 1],
      [0, 1, 1, 1, 0],
      [1, 0, 1, 0, 1]
    ];
    const kernel = vars.kernel || [[1, 0, -1], [1, 0, -1], [1, 0, -1]];
    const fmap = vars.feature_map || [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const patch = vars.active_patch || { row: 0, col: 0 };

    let html = `
      <div style="display:flex; justify-content:space-around; align-items:center; height:100%; padding:1rem; gap:1.5rem;">
        <!-- Input Image Matrix (5x5) -->
        <div style="text-align:center;">
          <div style="color:#94a3b8; font-size:0.8rem; font-weight:bold; margin-bottom:0.5rem;">5x5 INPUT IMAGE</div>
          <div style="display:grid; grid-template-columns:repeat(5, 28px); gap:3px; background:#0b1120; padding:6px; border-radius:6px; border:1px solid rgba(255,255,255,0.1);">`;

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const inPatch = (r >= patch.row && r < patch.row + 3 && c >= patch.col && c < patch.col + 3);
        const bg = inPatch ? "rgba(56,189,248,0.35)" : (img[r][c] ? "#1e293b" : "#020617");
        const border = inPatch ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.05)";
        html += `<div style="width:28px; height:28px; display:flex; align-items:center; justify-content:center; background:${bg}; border:${border}; border-radius:3px; font-size:11px; font-weight:bold; color:#fff;">${img[r][c]}</div>`;
      }
    }

    html += `</div></div>

        <!-- Kernel (3x3) -->
        <div style="text-align:center;">
          <div style="color:#fbbf24; font-size:0.8rem; font-weight:bold; margin-bottom:0.5rem;">* 3x3 KERNEL</div>
          <div style="display:grid; grid-template-columns:repeat(3, 26px); gap:3px; background:#1e1b4b; padding:6px; border-radius:6px; border:1px solid rgba(251,191,36,0.4);">`;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        html += `<div style="width:26px; height:26px; display:flex; align-items:center; justify-content:center; background:#312e81; border-radius:3px; font-size:10px; font-weight:bold; color:#fde047;">${kernel[r][c]}</div>`;
      }
    }

    html += `</div></div>

        <!-- Arrow -->
        <div style="font-size:1.5rem; color:#94a3b8;">➔</div>

        <!-- Feature Map (3x3) -->
        <div style="text-align:center;">
          <div style="color:#34d399; font-size:0.8rem; font-weight:bold; margin-bottom:0.5rem;">= 3x3 FEATURE MAP</div>
          <div style="display:grid; grid-template-columns:repeat(3, 30px); gap:4px; background:#0b1120; padding:6px; border-radius:6px; border:1px solid rgba(52,211,153,0.3);">`;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const isCurrent = (r === patch.row && c === patch.col);
        const bg = isCurrent ? "#059669" : "#1e293b";
        html += `<div style="width:30px; height:30px; display:flex; align-items:center; justify-content:center; background:${bg}; border-radius:4px; font-size:11px; font-weight:bold; color:#fff;">${fmap[r][c]}</div>`;
      }
    }

    html += `</div></div>
      </div>`;

    this.container.innerHTML = html;
  }

  // --- Optimizers Race Visualizer ---
  _renderOptimizers(vars) {
    const width = 640;
    const height = 360;
    const margin = 40;

    const sgd = vars.sgd || { w: 10, loss: 100 };
    const mom = vars.momentum || { w: 10, loss: 100 };
    const adam = vars.adam || { w: 10, loss: 100 };

    let svgHtml = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="width:100%; height:100%;">
      <!-- Loss Surface Parabola f(w) = w^2 -->
      <line x1="${margin}" y1="${height - margin}" x2="${width - margin}" y2="${height - margin}" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
      <line x1="${width / 2}" y1="${margin}" x2="${width / 2}" y2="${height - margin}" stroke="rgba(255,255,255,0.15)" stroke-dasharray="3,3" />
      <text x="${width / 2}" y="${height - margin + 20}" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">Min (w=0)</text>`;

    // Parabola curve
    let curveD = "";
    for (let wVal = -12; wVal <= 12; wVal += 0.5) {
      const cx = margin + ((wVal + 12) / 24) * (width - 2 * margin);
      const cy = (height - margin) - (Math.pow(wVal, 2) / 144) * (height - 2 * margin);
      curveD += (curveD === "" ? `M ${cx} ${cy}` : ` L ${cx} ${cy}`);
    }
    svgHtml += `<path d="${curveD}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" />`;

    // Optimizer Markers
    const getPos = (w) => ({
      x: margin + ((w + 12) / 24) * (width - 2 * margin),
      y: (height - margin) - (Math.pow(w, 2) / 144) * (height - 2 * margin)
    });

    const pSGD = getPos(sgd.w);
    const pMOM = getPos(mom.w);
    const pADM = getPos(adam.w);

    svgHtml += `
      <!-- SGD (Orange) -->
      <circle cx="${pSGD.x}" cy="${pSGD.y}" r="8" fill="#f97316" stroke="#fff" stroke-width="2" />
      <text x="${pSGD.x}" y="${pSGD.y - 12}" fill="#f97316" font-size="10" font-weight="bold" text-anchor="middle">SGD</text>

      <!-- Momentum (Cyan) -->
      <circle cx="${pMOM.x}" cy="${pMOM.y}" r="8" fill="#06b6d4" stroke="#fff" stroke-width="2" />
      <text x="${pMOM.x}" y="${pMOM.y - 12}" fill="#06b6d4" font-size="10" font-weight="bold" text-anchor="middle">Momentum</text>

      <!-- Adam (Purple/Gold) -->
      <circle cx="${pADM.x}" cy="${pADM.y}" r="9" fill="#c084fc" stroke="#fff" stroke-width="2" />
      <text x="${pADM.x}" y="${pADM.y - 14}" fill="#c084fc" font-size="11" font-weight="bold" text-anchor="middle">Adam 👑</text>
    </svg>`;

    const overlay = `<div style="position:absolute; top:12px; right:12px; background:rgba(15,23,42,0.85); padding:10px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); font-size:0.8rem;">
      <div style="font-weight:700; color:#fff; margin-bottom:4px;">Optimizers Leaderboard (Loss f(w)=w²)</div>
      <div style="color:#c084fc;">Adam: <strong>${adam.loss}</strong> (w=${adam.w})</div>
      <div style="color:#06b6d4;">Momentum: <strong>${mom.loss}</strong> (w=${mom.w})</div>
      <div style="color:#f97316;">SGD: <strong>${sgd.loss}</strong> (w=${sgd.w})</div>
    </div>`;

    this.container.innerHTML = svgHtml + overlay;
  }

  // --- Linear Regression Visualizer ---
  _renderLinearRegression(vars) {
    const points = vars.points || [
      { x: 1, y: 2 }, { x: 2, y: 3.5 }, { x: 3, y: 4.5 }, { x: 4, y: 6 }, { x: 5, y: 7.2 }
    ];
    const w = vars.w || 0;
    const b = vars.b || 0;
    const loss = vars.loss || 0;

    const width = 600;
    const height = 340;
    const margin = 40;

    let svgHtml = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="width:100%; height:100%;">
      <!-- Axes -->
      <line x1="${margin}" y1="${height - margin}" x2="${width - margin}" y2="${height - margin}" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
      <line x1="${margin}" y1="${margin}" x2="${margin}" y2="${height - margin}" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
      <text x="${width - margin}" y="${height - margin + 25}" fill="var(--text-muted)" font-size="12">X</text>
      <text x="${margin - 25}" y="${margin}" fill="var(--text-muted)" font-size="12">Y</text>`;

    points.forEach(pt => {
      const cx = margin + (pt.x / 6) * (width - 2 * margin);
      const cy = (height - margin) - (pt.y / 8) * (height - 2 * margin);
      svgHtml += `<circle cx="${cx}" cy="${cy}" r="6" fill="#06b6d4" stroke="#ffffff" stroke-width="2" />`;
    });

    const x1_val = 0;
    const y1_val = w * x1_val + b;
    const x2_val = 6;
    const y2_val = w * x2_val + b;

    const lx1 = margin + (x1_val / 6) * (width - 2 * margin);
    const ly1 = (height - margin) - (y1_val / 8) * (height - 2 * margin);
    const lx2 = margin + (x2_val / 6) * (width - 2 * margin);
    const ly2 = (height - margin) - (y2_val / 8) * (height - 2 * margin);

    svgHtml += `<line x1="${lx1}" y1="${ly1}" x2="${lx2}" y2="${ly2}" stroke="#6366f1" stroke-width="4" stroke-linecap="round" />`;
    svgHtml += `</svg>`;

    const overlay = `<div style="position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.6); padding:10px 16px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); font-size:0.9rem;">
      <div><strong style="color:var(--accent-primary);">y = ${w.toFixed(3)}x + ${b.toFixed(3)}</strong></div>
      <div style="color:var(--text-muted); margin-top:4px;">MSE Loss: <span style="color:#f59e0b;">${loss.toFixed(4)}</span></div>
    </div>`;

    this.container.innerHTML = svgHtml + overlay;
  }

  // --- Neural Network Visualizer ---
  _renderNeuralNetwork(vars) {
    const width = 600;
    const height = 340;

    const x_input = 100;
    const x_hidden = 300;
    const x_output = 500;

    const inputs = vars.inputs || [0.5, 0.8];
    const h_acts = vars.hidden_activations || [0.5, 0.5];
    const pred = vars.prediction !== undefined ? vars.prediction : 0.5;

    let svgHtml = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="width:100%; height:100%;">
      <!-- Layer Connections -->
      <line x1="${x_input}" y1="100" x2="${x_hidden}" y2="100" stroke="rgba(99,102,241,0.5)" stroke-width="2" />
      <line x1="${x_input}" y1="100" x2="${x_hidden}" y2="240" stroke="rgba(99,102,241,0.5)" stroke-width="2" />
      <line x1="${x_input}" y1="240" x2="${x_hidden}" y2="100" stroke="rgba(99,102,241,0.5)" stroke-width="2" />
      <line x1="${x_input}" y1="240" x2="${x_hidden}" y2="240" stroke="rgba(99,102,241,0.5)" stroke-width="2" />

      <line x1="${x_hidden}" y1="100" x2="${x_output}" y2="170" stroke="rgba(139,92,246,0.6)" stroke-width="3" />
      <line x1="${x_hidden}" y1="240" x2="${x_output}" y2="170" stroke="rgba(139,92,246,0.6)" stroke-width="3" />

      <!-- Input Layer Nodes -->
      <g><circle cx="${x_input}" cy="100" r="24" fill="#0284c7" stroke="#38bdf8" stroke-width="3" /><text x="${x_input}" y="105" text-anchor="middle" fill="#fff" font-weight="bold">${inputs[0]}</text></g>
      <g><circle cx="${x_input}" cy="240" r="24" fill="#0284c7" stroke="#38bdf8" stroke-width="3" /><text x="${x_input}" y="245" text-anchor="middle" fill="#fff" font-weight="bold">${inputs[1]}</text></g>

      <!-- Hidden Layer Nodes -->
      <g><circle cx="${x_hidden}" cy="100" r="24" fill="#7c3aed" stroke="#c084fc" stroke-width="3" /><text x="${x_hidden}" y="105" text-anchor="middle" fill="#fff" font-weight="bold">${h_acts[0]}</text></g>
      <g><circle cx="${x_hidden}" cy="240" r="24" fill="#7c3aed" stroke="#c084fc" stroke-width="3" /><text x="${x_hidden}" y="245" text-anchor="middle" fill="#fff" font-weight="bold">${h_acts[1]}</text></g>

      <!-- Output Layer Node -->
      <g><circle cx="${x_output}" cy="170" r="28" fill="#059669" stroke="#34d399" stroke-width="4" /><text x="${x_output}" y="175" text-anchor="middle" fill="#fff" font-weight="bold">${pred}</text></g>
    </svg>`;

    const overlay = `<div style="position:absolute; bottom:12px; right:12px; background:rgba(0,0,0,0.6); padding:8px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); font-size:0.85rem;">
      <span style="color:var(--accent-purple);">Target Y: ${vars.target || 1.0}</span> | 
      <span style="color:var(--accent-warning);">Loss: ${vars.loss || 0.0}</span>
    </div>`;

    this.container.innerHTML = svgHtml + overlay;
  }
}
