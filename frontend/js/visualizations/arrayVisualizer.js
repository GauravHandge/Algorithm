/* Cumulative Step History Array & Bar Visualizer Component */
export class ArrayVisualizer {
  constructor(container) {
    this.container = container;
    this.history = [];
  }

  render(state) {
    if (!this.container) return;

    if (!state) {
      this.container.innerHTML = `<div style="color:var(--text-muted); padding:20px;">No execution state loaded</div>`;
      return;
    }

    const currentStep = state.step !== undefined ? state.step : 0;

    // Reset history if step is 0 (rewind/initialize)
    if (currentStep === 0) {
      this.history = [state];
    } else {
      // Append step to history stack if not already present
      const existingIdx = this.history.findIndex(s => s.step === currentStep);
      if (existingIdx >= 0) {
        this.history[existingIdx] = state;
        this.history = this.history.slice(0, existingIdx + 1);
      } else {
        this.history.push(state);
      }
    }

    let html = `
      <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; background:#f8fafc; border-radius:12px; overflow-y:auto; padding:16px; gap:20px; border:1px solid #e2e8f0;">
        
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #e2e8f0; padding-bottom:10px;">
          <h4 style="margin:0; color:#0f172a; font-size:1.05rem; font-weight:700;">
            📊 Step-by-Step Cumulative Execution History Timeline (${this.history.length} Steps Rendered)
          </h4>
          <span style="font-size:0.8rem; color:#64748b;">
            Each step remains saved below as algorithm executes
          </span>
        </div>
    `;

    // Render each step card sequentially down the page
    this.history.forEach((stepState, stepIdx) => {
      let arr = stepState.array || [];
      if (!Array.isArray(arr) || arr.length === 0) {
        arr = [25, 40, 15, 60, 35, 75, 50, 10];
      }

      const pointers = stepState.pointers || {};
      const maxVal = Math.max(...arr.map(v => typeof v === 'number' ? v : 10), 10);
      const isLatest = stepIdx === this.history.length - 1;

      html += `
        <div style="background:#ffffff; border:${isLatest ? '2px solid #0052ff' : '1px solid #e2e8f0'}; border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:12px; box-shadow:${isLatest ? '0 8px 20px rgba(0,82,255,0.12)' : '0 2px 6px rgba(0,0,0,0.03)'}; transition:all 0.3s ease;">
          
          <!-- Step Header Banner -->
          <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="background:${isLatest ? '#0052ff' : '#64748b'}; color:#fff; font-size:0.75rem; font-weight:700; padding:4px 10px; border-radius:6px; text-transform:uppercase;">
                ${(stepState.action || 'STEP').toUpperCase()}
              </span>
              <span style="color:#0f172a; font-size:0.95rem; font-weight:700;">
                ${stepState.message || `Step ${stepIdx + 1} processing...`}
              </span>
            </div>
            <span style="font-family:var(--font-mono); color:#0052ff; font-size:0.85rem; font-weight:700;">
              Step ${stepIdx + 1} / ${stepState.totalSteps || this.history.length}
            </span>
          </div>

          <!-- Array Visual Bars -->
          <div style="display:flex; align-items:flex-end; justify-content:center; gap:10px; height:120px; padding:10px 0; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
      `;

      arr.forEach((val, idx) => {
        const heightPct = Math.max(20, (val / maxVal) * 80);
        const isCompare = pointers.compare === idx || pointers.current === idx || pointers.mid === idx;
        const isSwap = pointers.swap === idx || pointers.low === idx || pointers.high === idx;
        const isSorted = pointers.sorted && pointers.sorted.includes(idx);

        let bg = "#0052ff";
        let border = "1px solid #bfdbfe";

        if (isSwap) {
          bg = "#f59e0b";
          border = "2px solid #d97706";
        } else if (isCompare) {
          bg = "#0284c7";
          border = "2px solid #0369a1";
        } else if (isSorted) {
          bg = "#10b981";
          border = "2px solid #059669";
        }

        html += `
          <div style="display:flex; flex-direction:column; align-items:center; flex:1; max-width:48px;">
            <div style="width:100%; height:${heightPct}%; background:${bg}; border:${border}; border-radius:6px 6px 3px 3px; display:flex; align-items:center; justify-content:center; font-weight:700; color:#ffffff; font-size:0.9rem; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
              ${val}
            </div>
            <span style="font-size:0.75rem; color:#64748b; font-family:var(--font-mono); font-weight:600; margin-top:4px;">[${idx}]</span>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    html += `</div>`;

    this.container.innerHTML = html;

    // Auto-scroll container to latest step card
    setTimeout(() => {
      this.container.scrollTop = this.container.scrollHeight;
    }, 50);
  }
}
