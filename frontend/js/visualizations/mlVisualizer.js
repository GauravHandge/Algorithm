/* Machine Learning & Neural Network Visualizer Component */
export class MLVisualizer {
  constructor(container) {
    this.container = container;
  }

  render(state) {
    if (!this.container) return;
    this.container.innerHTML = "";

    if (!state) {
      this.container.innerHTML = `<div style="color:var(--text-muted);">No execution state loaded</div>`;
      return;
    }

    const variables = state.variables || {};

    // Check if Neural Network state
    if (variables.inputs || variables.hidden_activations || variables.prediction !== undefined) {
      this._renderNeuralNetwork(variables);
      return;
    }

    // Linear Regression 2D Scatter + Best Fit Line
    const points = variables.points || [
      {x: 1, y: 2}, {x: 2, y: 3.5}, {x: 3, y: 4.5}, {x: 4, y: 6}, {x: 5, y: 7.2}
    ];
    const w = variables.w || 0;
    const b = variables.b || 0;
    const loss = variables.loss || 0;

    const width = 600;
    const height = 340;
    const margin = 40;

    let svgHtml = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="width:100%; height:100%;">
      <!-- Axes -->
      <line x1="${margin}" y1="${height - margin}" x2="${width - margin}" y2="${height - margin}" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
      <line x1="${margin}" y1="${margin}" x2="${margin}" y2="${height - margin}" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
      <text x="${width - margin}" y="${height - margin + 25}" fill="var(--text-muted)" font-size="12">X</text>
      <text x="${margin - 25}" y="${margin}" fill="var(--text-muted)" font-size="12">Y</text>`;

    // Plot Points
    points.forEach(pt => {
      const cx = margin + (pt.x / 6) * (width - 2 * margin);
      const cy = (height - margin) - (pt.y / 8) * (height - 2 * margin);

      svgHtml += `<circle cx="${cx}" cy="${cy}" r="6" fill="#06b6d4" stroke="#ffffff" stroke-width="2" />`;
    });

    // Plot Regression Line y = wx + b
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

    // Loss Overlay
    const overlay = `<div style="position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.6); padding:10px 16px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); font-size:0.9rem;">
      <div><strong style="color:var(--accent-primary);">y = ${w.toFixed(3)}x + ${b.toFixed(3)}</strong></div>
      <div style="color:var(--text-muted); margin-top:4px;">MSE Loss: <span style="color:#f59e0b;">${loss.toFixed(4)}</span></div>
    </div>`;

    this.container.innerHTML = svgHtml + overlay;
  }

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
