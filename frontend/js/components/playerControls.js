/* Player Controls UI Component with Ultra-Slow & Granular Step Controls */
import { globalPlayer } from '../state.js';

export class PlayerControls {
  constructor(container) {
    this.container = container;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="control-bar glass-panel">
        <div class="btn-group">
          <button id="btn-prev" class="btn btn-secondary" title="Step Back">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
            Step Prev
          </button>
          <button id="btn-play" class="btn btn-primary" title="Play / Pause Step Animation">
            <span id="play-icon">▶ Live Demo</span>
          </button>
          <button id="btn-next" class="btn btn-secondary" title="Step Forward">
            Step Next
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
          </button>
          <button id="btn-reset" class="btn btn-secondary" title="Reset to Step 1">↻ Reset</button>
        </div>

        <div class="progress-track">
          <div id="progress-fill" class="progress-fill"></div>
        </div>

        <div style="display:flex; align-items:center; gap:0.75rem;">
          <span id="step-indicator" style="font-family:var(--font-mono); font-weight:bold; font-size:0.9rem; color:var(--accent-secondary);">Step 0 / 0</span>
          <select id="speed-select" class="speed-select">
            <option value="0.1">0.1x (Very Slow)</option>
            <option value="0.25">0.25x (Slow Demo)</option>
            <option value="0.5" selected>0.5x (Step-by-Step)</option>
            <option value="1.0">1.0x (Normal)</option>
            <option value="2.0">2.0x (Fast)</option>
          </select>
        </div>
      </div>
    `;

    // Event listeners
    document.getElementById("btn-prev").addEventListener("click", () => globalPlayer.previous());
    document.getElementById("btn-next").addEventListener("click", () => globalPlayer.next());
    document.getElementById("btn-play").addEventListener("click", () => globalPlayer.togglePlay());
    document.getElementById("btn-reset").addEventListener("click", () => globalPlayer.reset());
    document.getElementById("speed-select").addEventListener("change", (e) => globalPlayer.setSpeed(e.target.value));

    // Initial speed setting
    globalPlayer.setSpeed(0.5);

    // Subscribe to state changes
    globalPlayer.subscribe((state, currentIdx, totalSteps, isPlaying) => {
      const playIcon = document.getElementById("play-icon");
      if (playIcon) playIcon.textContent = isPlaying ? "⏸ Pause Demo" : "▶ Live Demo";

      const stepInd = document.getElementById("step-indicator");
      if (stepInd) stepInd.textContent = `Step ${totalSteps > 0 ? currentIdx + 1 : 0} / ${totalSteps}`;

      const fill = document.getElementById("progress-fill");
      if (fill) {
        const pct = totalSteps > 1 ? (currentIdx / (totalSteps - 1)) * 100 : 0;
        fill.style.width = `${pct}%`;
      }
    });
  }
}
