/* Cumulative Step History Cybersecurity Visualizer Component */
export class CryptoVisualizer {
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
        
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(99,102,241,0.3); padding-bottom:10px;">
          <h4 style="margin:0; color:var(--accent-purple); font-size:1.1rem; font-weight:bold;">
            🔐 Cumulative Cryptographic Step History Timeline (${this.history.length} Steps)
          </h4>
          <span style="font-size:0.8rem; color:var(--text-muted);">
            Step-by-step mathematical key derivation & cipher history
          </span>
        </div>
    `;

    this.history.forEach((stepState, stepIdx) => {
      const variables = stepState.variables || {};
      const array = stepState.array || [];
      const pointers = stepState.pointers || {};
      const currentIdx = pointers.current_index !== undefined ? pointers.current_index : (pointers.current !== undefined ? pointers.current : -1);
      const isLatest = stepIdx === this.history.length - 1;

      html += `
        <div style="background:${isLatest ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.6)'}; border:${isLatest ? '2px solid var(--accent-purple)' : '1px solid rgba(255,255,255,0.08)'}; border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:12px; box-shadow:${isLatest ? '0 8px 20px rgba(139,92,246,0.3)' : 'none'}; transition:all 0.3s ease;">
          
          <!-- Step Header Banner -->
          <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="background:${isLatest ? 'var(--accent-purple)' : '#334155'}; color:#fff; font-size:0.75rem; font-weight:bold; padding:4px 10px; border-radius:6px; text-transform:uppercase;">
                ${(stepState.action || 'CRYPTO STEP').toUpperCase()}
              </span>
              <span style="color:#f8fafc; font-size:0.95rem; font-weight:bold;">
                ${stepState.message || `Step ${stepIdx + 1} processing...`}
              </span>
            </div>
            <span style="font-family:var(--font-mono); color:var(--accent-secondary); font-size:0.85rem; font-weight:bold;">
              Step ${stepIdx + 1} / ${stepState.totalSteps || this.history.length}
            </span>
          </div>
      `;

      // Character Substitution / Shift (Caesar/Vigenere)
      if (array.length > 0 && (variables.result_text !== undefined || variables.char !== undefined)) {
        const resultText = variables.result_text || "";
        html += `
          <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap; background:rgba(0,0,0,0.3); padding:12px; border-radius:8px;">
        `;
        array.forEach((ch, idx) => {
          const isActive = idx === currentIdx;
          const isProcessed = idx < currentIdx;
          const cipherChar = resultText[idx] || "";

          let bg = isActive ? "var(--accent-purple)" : (isProcessed ? "rgba(16,185,129,0.2)" : "#1e293b");
          let border = isActive ? "2px solid #a5b4fc" : (isProcessed ? "1px solid var(--accent-success)" : "1px solid rgba(255,255,255,0.1)");

          html += `
            <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
              <div style="width:40px; height:40px; background:${bg}; border:${border}; border-radius:6px; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#fff; font-size:1.1rem;">
                ${ch}
              </div>
              <span style="font-size:0.85rem; font-weight:bold; color:var(--accent-warning);">${isProcessed || isActive ? cipherChar : ''}</span>
            </div>
          `;
        });
        html += `</div>`;
        if (resultText) {
          html += `<div style="font-family:var(--font-mono); font-size:0.9rem; color:var(--accent-warning); font-weight:bold; text-align:right;">Ciphertext so far: "${resultText}"</div>`;
        }

      // RSA / Asymmetric Cards
      } else {
        html += `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px; background:rgba(0,0,0,0.3); padding:12px; border-radius:8px;">`;
        if (variables.p !== undefined) html += `<div style="background:#1e293b; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:var(--text-muted);">p:</span> <strong style="color:#fff;">${variables.p}</strong></div>`;
        if (variables.q !== undefined) html += `<div style="background:#1e293b; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:var(--text-muted);">q:</span> <strong style="color:#fff;">${variables.q}</strong></div>`;
        if (variables.n !== undefined) html += `<div style="background:#1e293b; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:var(--text-muted);">n (p*q):</span> <strong style="color:var(--accent-secondary);">${variables.n}</strong></div>`;
        if (variables.phi !== undefined) html += `<div style="background:#1e293b; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:var(--text-muted);">φ(n):</span> <strong style="color:var(--accent-purple);">${variables.phi}</strong></div>`;
        if (variables.e !== undefined) html += `<div style="background:#1e293b; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:var(--text-muted);">e (public):</span> <strong style="color:var(--accent-warning);">${variables.e}</strong></div>`;
        if (variables.d !== undefined) html += `<div style="background:#1e293b; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:var(--text-muted);">d (private):</span> <strong style="color:var(--accent-warning);">${variables.d}</strong></div>`;
        if (variables.ciphertext !== undefined) html += `<div style="background:#1e293b; padding:8px; border-radius:6px; font-size:0.85rem; grid-column:span 2;"><span style="color:var(--text-muted);">Ciphertext C:</span> <strong style="color:var(--accent-warning);">${variables.ciphertext}</strong></div>`;
        html += `</div>`;
      }

      html += `</div>`;
    });

    html += `</div>`;

    this.container.innerHTML = html;

    setTimeout(() => {
      this.container.scrollTop = this.container.scrollHeight;
    }, 50);
  }
}
