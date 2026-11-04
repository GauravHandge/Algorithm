/* Enhanced Step Explanation & Pseudocode Line Highlighting Component */
import { globalPlayer } from '../state.js';

export class StepPanel {
  constructor(container) {
    this.container = container;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="step-card glass-panel">
        <div class="step-title">
          <span id="step-action-badge" class="badge badge-category">INITIALIZING</span>
          <span id="step-count-badge" style="font-size:0.8rem; color:var(--text-muted);">Step 0/0</span>
        </div>

        <div id="step-desc-text" class="step-desc">
          Select an algorithm and click Run to begin step-by-step execution simulation.
        </div>

        <div id="step-variables-box" style="font-family:var(--font-mono); font-size:0.85rem; color:#0f172a; background:#f8fafc; padding:0.85rem; border-radius:8px; border:1px solid #e2e8f0; display:none;">
        </div>
      </div>
    `;

    globalPlayer.subscribe((state, idx, total) => {
      const badge = document.getElementById("step-action-badge");
      const desc = document.getElementById("step-desc-text");
      const stepCount = document.getElementById("step-count-badge");
      const varsBox = document.getElementById("step-variables-box");

      if (!state) return;

      if (badge) {
        badge.textContent = (state.action || "STEP EXECUTION").toUpperCase();
        badge.className = `badge badge-${this._getBadgeStyle(state.action)}`;
      }

      if (desc) {
        desc.innerHTML = `<strong>Step ${idx + 1}:</strong> ${state.message || "Executing algorithm step..."}`;
      }

      if (stepCount) {
        stepCount.textContent = `Step ${idx + 1} / ${total}`;
      }

      // Format State Variables Inspector
      if (varsBox) {
        const vars = state.variables || {};
        const ptrs = state.pointers || {};
        const combined = { ...ptrs, ...vars };

        if (Object.keys(combined).length > 0) {
          varsBox.style.display = "block";
          const formatted = Object.entries(combined)
            .map(([k, v]) => `<div><span style="color:var(--accent-secondary); font-weight:bold;">${k}:</span> ${JSON.stringify(v)}</div>`)
            .join("");
          varsBox.innerHTML = `<div style="font-weight:bold; color:var(--text-muted); margin-bottom:4px; font-size:0.75rem; text-transform:uppercase;">Active Step Variables</div>${formatted}`;
        } else {
          varsBox.style.display = "none";
        }
      }

      // Line-by-line Pseudocode Highlight matching step line
      this._highlightPseudocodeLine(idx, state);
    });
  }

  _getBadgeStyle(action) {
    if (!action) return "category";
    const act = action.toLowerCase();
    if (act.includes("swap") || act.includes("fault") || act.includes("error")) return "hard";
    if (act.includes("compare") || act.includes("encrypt") || act.includes("decrypt")) return "medium";
    if (act.includes("sorted") || act.includes("found") || act.includes("hit") || act.includes("complete")) return "easy";
    return "category";
  }

  _highlightPseudocodeLine(stepIdx, state) {
    const codeBlock = document.getElementById("pseudocode-container");
    if (!codeBlock) return;

    const rawText = codeBlock.getAttribute("data-raw") || codeBlock.textContent;
    if (!codeBlock.getAttribute("data-raw")) {
      codeBlock.setAttribute("data-raw", rawText);
    }

    const lines = rawText.split("\n");
    const totalLines = lines.length;

    // Estimate line index based on step
    const targetLineIdx = stepIdx % totalLines;

    const highlighted = lines.map((line, lIdx) => {
      if (lIdx === targetLineIdx) {
        return `<div style="background:#eff6ff; border-left:3px solid #0052ff; padding-left:8px; font-weight:700; color:#0052ff;">${line}</div>`;
      }
      return `<div style="padding-left:11px; color:#334155;">${line}</div>`;
    }).join("");

    codeBlock.innerHTML = highlighted;
  }
}
