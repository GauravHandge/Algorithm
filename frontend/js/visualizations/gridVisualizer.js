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
      <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; justify-content:space-between; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0;">
        
        <!-- On-Canvas Live Step Explanation Overlay -->
        <div style="background:#f8fafc; border-bottom:1px solid #e2e8f0; padding:12px 18px; display:flex; align-items:center; justify-content:space-between; gap:12px; z-index:10;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:#0052ff; color:#fff; font-size:0.75rem; font-weight:700; padding:4px 10px; border-radius:6px; text-transform:uppercase; letter-spacing:0.5px;">
              ${(state.action || 'STEP EXECUTION').toUpperCase()}
            </span>
            <span style="color:#0f172a; font-size:0.95rem; font-weight:600;">
              ${state.message || 'Executing grid/matrix step...'}
            </span>
          </div>
          <span style="font-family:var(--font-mono); color:#0052ff; font-size:0.85rem; font-weight:700; white-space:nowrap;">
            Step ${(state.step || 0)}
          </span>
        </div>

        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; flex-grow:1; padding:20px; overflow-y:auto; gap:16px; background:#ffffff;">
    `;

    // Knapsack Items Banner
    if (variables.items && variables.capacity !== undefined) {
      html += `
        <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-bottom:5px;">
          <span style="background:#f1f5f9; padding:4px 10px; border-radius:6px; font-size:0.8rem; color:#475569; border:1px solid #e2e8f0;">Capacity: <strong style="color:#0052ff;">${variables.capacity}kg</strong></span>
          ${variables.items.map(it => `
            <span style="background:${it.name === variables.current_item ? '#eff6ff' : '#ffffff'}; padding:4px 10px; border-radius:6px; font-size:0.8rem; border:${it.name === variables.current_item ? '1px solid #3b82f6' : '1px solid #cbd5e1'}; color:${it.name === variables.current_item ? '#1d4ed8' : '#0f172a'}; font-weight:${it.name === variables.current_item ? '700' : '500'};">
              ${it.name} (${it.wt}kg, $${it.val})
            </span>
          `).join('')}
        </div>
      `;
    }

    // 1. Render Table / Matrix Grid if present
    if (grid.length > 0) {
      html += `<table style="border-collapse:collapse; width:90%; max-width:640px; background:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.05);">`;
      grid.forEach((row, rIdx) => {
        html += `<tr style="border-bottom:1px solid #e2e8f0;">`;
        if (Array.isArray(row)) {
          row.forEach((cell, cIdx) => {
            const isHeader = rIdx === 0 || cIdx === 0;
            const isHighlight = variables.row === rIdx;
            const bg = isHighlight ? "#eff6ff" : (isHeader ? "#f8fafc" : "#ffffff");
            const color = isHighlight ? "#0052ff" : (isHeader ? "#0f172a" : "#334155");
            html += `<td style="padding:8px 12px; text-align:center; font-weight:${isHeader || isHighlight ? '700' : '500'}; color:${color}; background:${bg}; font-family:var(--font-mono); font-size:0.85rem; border:1px solid #e2e8f0;">${cell}</td>`;
          });
        }
        html += `</tr>`;
      });
      html += `</table>`;
    }

    // 2. Render OS Gantt Chart / Process Execution
    if (variables.gantt || variables.processes) {
      const gantt = variables.gantt || [
        { pid: "P1", start: 0, end: 4, color: "#0052ff" },
        { pid: "P2", start: 4, end: 7, color: "#0284c7" },
        { pid: "P3", start: 7, end: 9, color: "#f59e0b" }
      ];

      html += `
        <div style="width:90%; max-width:600px; background:#ffffff; padding:16px; border-radius:10px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <div style="font-size:0.85rem; color:#64748b; font-weight:700; margin-bottom:10px; text-transform:uppercase;">Process CPU Gantt Chart Timeline</div>
          <div style="display:flex; width:100%; height:45px; border-radius:6px; overflow:hidden; border:1px solid #cbd5e1;">
      `;

      gantt.forEach(block => {
        html += `
          <div style="flex:1; background:${block.color || '#0052ff'}; display:flex; align-items:center; justify-content:center; color:#ffffff; font-weight:700; font-family:var(--font-mono); border-right:1px solid #ffffff;">
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
