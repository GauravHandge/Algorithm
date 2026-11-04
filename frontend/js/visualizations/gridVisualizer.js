/* Grid & Table Visualizer with On-Canvas Live Step Overlay (OS Gantt, SQL Tables, Page Frames) */
export class GridVisualizer {
  constructor(container) {
    this.container = container;
  }

  render(state) {
    if (!this.container) return;
    this.container.innerHTML = "";

    if (!state) {
      this.container.innerHTML = `<div style="color:var(--text-muted); padding:20px;">No execution state loaded</div>`;
      return;
    }

    const grid = state.matrix || state.grid || state.table || [];
    const variables = state.variables || {};

    let html = `
      <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; justify-content:space-between; background:#0b0f19; border-radius:12px; overflow:hidden;">
        
        <!-- On-Canvas Live Step Explanation Overlay -->
        <div style="background:rgba(15, 23, 42, 0.9); border-bottom:1px solid rgba(99,102,241,0.3); padding:12px 18px; display:flex; align-items:center; justify-content:space-between; gap:12px; z-index:10;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:var(--accent-primary); color:#fff; font-size:0.75rem; font-weight:bold; padding:4px 10px; border-radius:6px; text-transform:uppercase; letter-spacing:0.5px;">
              ${(state.action || 'STEP EXECUTION').toUpperCase()}
            </span>
            <span style="color:#f8fafc; font-size:0.95rem; font-weight:500;">
              ${state.message || 'Executing grid/matrix step...'}
            </span>
          </div>
          <span style="font-family:var(--font-mono); color:var(--accent-secondary); font-size:0.85rem; font-weight:bold; white-space:nowrap;">
            Step ${(state.step || 0)}
          </span>
        </div>

        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; flex-grow:1; padding:20px; overflow-y:auto; gap:16px;">
    `;

    // Knapsack Items Banner
    if (variables.items && variables.capacity !== undefined) {
      html += `
        <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-bottom:5px;">
          <span style="background:#1e293b; padding:4px 10px; border-radius:6px; font-size:0.8rem; color:#94a3b8; border:1px solid rgba(255,255,255,0.08);">Capacity: <strong style="color:#38bdf8;">${variables.capacity}kg</strong></span>
          ${variables.items.map(it => `
            <span style="background:${it.name === variables.current_item ? 'rgba(99,102,241,0.35)' : '#0f172a'}; padding:4px 10px; border-radius:6px; font-size:0.8rem; border:${it.name === variables.current_item ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.06)'}; color:#fff;">
              ${it.name} (${it.wt}kg, $${it.val})
            </span>
          `).join('')}
        </div>
      `;
    }

    // 1. Render Table / Matrix Grid if present
    if (grid.length > 0) {
      html += `<table style="border-collapse:collapse; width:90%; max-width:640px; background:#1e293b; border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.1);">`;
      grid.forEach((row, rIdx) => {
        html += `<tr style="border-bottom:1px solid rgba(255,255,255,0.08);">`;
        if (Array.isArray(row)) {
          row.forEach((cell, cIdx) => {
            const isHeader = rIdx === 0 || cIdx === 0;
            const isHighlight = variables.row === rIdx;
            const bg = isHighlight ? "rgba(56,189,248,0.18)" : (isHeader ? "rgba(0,0,0,0.3)" : "transparent");
            html += `<td style="padding:8px 12px; text-align:center; font-weight:${isHeader ? 'bold' : 'normal'}; color:${isHighlight ? '#38bdf8' : (isHeader ? 'var(--accent-secondary)' : '#fff')}; background:${bg}; font-family:var(--font-mono); font-size:0.85rem;">${cell}</td>`;
          });
        }
        html += `</tr>`;
      });
      html += `</table>`;
    }

    // 2. Render OS Gantt Chart / Process Execution
    if (variables.gantt || variables.processes) {
      const gantt = variables.gantt || [
        { pid: "P1", start: 0, end: 4, color: "var(--accent-primary)" },
        { pid: "P2", start: 4, end: 7, color: "var(--accent-secondary)" },
        { pid: "P3", start: 7, end: 9, color: "var(--accent-warning)" }
      ];

      html += `
        <div style="width:90%; max-width:600px; background:#1e293b; padding:16px; border-radius:10px; border:1px solid var(--border-color);">
          <div style="font-size:0.85rem; color:var(--text-muted); font-weight:bold; margin-bottom:10px; text-transform:uppercase;">Process CPU Gantt Chart Timeline</div>
          <div style="display:flex; width:100%; height:45px; border-radius:6px; overflow:hidden;">
      `;

      gantt.forEach(block => {
        html += `
          <div style="flex:1; background:${block.color || 'var(--accent-primary)'}; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-family:var(--font-mono); border-right:1px solid rgba(0,0,0,0.3);">
            ${block.pid} (${block.start}-${block.end}s)
          </div>
        `;
      });

      html += `</div></div>`;
    }

    html += `
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }
}
