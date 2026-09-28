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
      <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; background:#0b0f19; border-radius:12px; overflow-y:auto; padding:16px; gap:20px;">
        
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
          <h4 style="margin:0; color:var(--accent-secondary); font-size:1.1rem; font-weight:bold;">
            📊 Step-by-Step Cumulative Execution History Timeline (${this.history.length} Steps Rendered)
          </h4>
          <span style="font-size:0.8rem; color:var(--text-muted);">
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
        <div style="background:${isLatest ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.6)'}; border:${isLatest ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)'}; border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:12px; box-shadow:${isLatest ? '0 8px 20px rgba(99,102,241,0.25)' : 'none'}; transition:all 0.3s ease;">
          
          <!-- Step Header Banner -->
          <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="background:${isLatest ? 'var(--accent-primary)' : '#334155'}; color:#fff; font-size:0.75rem; font-weight:bold; padding:4px 10px; border-radius:6px; text-transform:uppercase;">
                ${(stepState.action || 'STEP').toUpperCase()}
              </span>
              <span style="color:#f8fafc; font-size:0.95rem; font-weight:bold;">
                ${stepState.message || `Step ${stepIdx + 1} processing...`}
              </span>
            </div>
            <span style="font-family:var(--font-mono); color:var(--accent-secondary); font-size:0.85rem; font-weight:bold;">
              Step ${stepIdx + 1} / ${stepState.totalSteps || this.history.length}
            </span>
          </div>

          <!-- Array Visual Bars -->
          <div style="display:flex; align-items:flex-end; justify-content:center; gap:10px; height:120px; padding:10px 0; background:rgba(0,0,0,0.3); border-radius:8px;">
      `;

      arr.forEach((val, idx) => {
        const heightPct = Math.max(20, (val / maxVal) * 80);
        const isCompare = pointers.compare === idx || pointers.current === idx || pointers.mid === idx;
        const isSwap = pointers.swap === idx || pointers.low === idx || pointers.high === idx;
        const isSorted = pointers.sorted && pointers.sorted.includes(idx);

        let bg = "var(--accent-primary)";
        let border = "1px solid rgba(255,255,255,0.1)";

        if (isSwap) {
          bg = "var(--accent-warning)";
          border = "2px solid #fde047";
        } else if (isCompare) {
          bg = "var(--accent-secondary)";
          border = "2px solid #67e8f9";
        } else if (isSorted) {
          bg = "var(--accent-success)";
          border = "2px solid #86efac";
        }

        html += `
          <div style="display:flex; flex-direction:column; align-items:center; flex:1; max-width:48px;">
            <div style="width:100%; height:${heightPct}%; background:${bg}; border:${border}; border-radius:6px 6px 3px 3px; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#ffffff; font-size:0.9rem;">
              ${val}
            </div>
            <span style="font-size:0.7rem; color:var(--text-muted); font-family:var(--font-mono); margin-top:4px;">[${idx}]</span>
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
