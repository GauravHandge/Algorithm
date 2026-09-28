/* AI Tutor Drawer UI Component */
import { API } from '../api.js';
import { globalPlayer } from '../state.js';

export class AITutor {
  constructor(container) {
    this.container = container;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="ai-tutor-box glass-panel">
        <div class="ai-header">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M5 2a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1V4a2 2 0 0 0-2-2H5zm0 1h6a1 1 0 0 1 1 1v2H4V4a1 1 0 0 1 1-1zm-3 5h12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/></svg>
          AI Tutor (Groq Powered)
        </div>

        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button id="ai-btn-explain" class="btn btn-secondary" style="font-size:0.8rem; padding:0.4rem 0.75rem;">💡 Explain Step</button>
          <button id="ai-btn-hint" class="btn btn-secondary" style="font-size:0.8rem; padding:0.4rem 0.75rem;">🎯 Get Hint</button>
        </div>

        <div id="ai-response-box" class="ai-response-box">
          Click <strong>Explain Step</strong> or ask a question to receive AI guidance.
        </div>

        <div class="ai-chat-input">
          <input type="text" id="ai-chat-text" placeholder="Ask AI: Why did this step happen?" />
          <button id="ai-btn-send" class="btn btn-primary" style="padding:0.4rem 0.85rem;">Ask</button>
        </div>
      </div>
    `;

    document.getElementById("ai-btn-explain").addEventListener("click", () => this.handleExplain());
    document.getElementById("ai-btn-hint").addEventListener("click", () => this.handleHint());
    document.getElementById("ai-btn-send").addEventListener("click", () => this.handleChat());
    document.getElementById("ai-chat-text").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleChat();
    });
  }

  async handleExplain() {
    const box = document.getElementById("ai-response-box");
    const state = globalPlayer.getCurrentState();
    if (!state || !globalPlayer.algorithmId) {
      box.innerHTML = `<span style="color:var(--accent-warning);">Please run an algorithm first!</span>`;
      return;
    }

    box.innerHTML = `<span style="color:var(--text-muted);">Thinking with Groq AI...</span>`;
    try {
      const res = await API.explainStep(globalPlayer.algorithmId, state);
      box.innerHTML = res.response || "No explanation available.";
    } catch (e) {
      box.innerHTML = `<span style="color:var(--accent-danger);">AI Service temporarily offline.</span>`;
    }
  }

  async handleHint() {
    const box = document.getElementById("ai-response-box");
    const state = globalPlayer.getCurrentState();
    if (!state || !globalPlayer.algorithmId) {
      box.innerHTML = `<span style="color:var(--accent-warning);">Please run an algorithm first!</span>`;
      return;
    }

    box.innerHTML = `<span style="color:var(--text-muted);">Generating hint...</span>`;
    try {
      const res = await API.getHint(globalPlayer.algorithmId, state);
      box.innerHTML = res.response || "No hint available.";
    } catch (e) {
      box.innerHTML = `<span style="color:var(--accent-danger);">AI Service temporarily offline.</span>`;
    }
  }

  async handleChat() {
    const box = document.getElementById("ai-response-box");
    const input = document.getElementById("ai-chat-text");
    const query = input.value.trim();
    if (!query) return;

    box.innerHTML = `<span style="color:var(--text-muted);">Asking AI: "${query}"...</span>`;
    input.value = "";

    try {
      const state = globalPlayer.getCurrentState();
      const res = await API.askAIChat(globalPlayer.algorithmId || "general", query, state);
      box.innerHTML = res.response || "No response received.";
    } catch (e) {
      box.innerHTML = `<span style="color:var(--accent-danger);">AI Service temporarily offline.</span>`;
    }
  }
}
