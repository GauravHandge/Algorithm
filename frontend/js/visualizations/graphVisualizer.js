/* Robust SVG Graph Visualizer with Auto-Node Layout & On-Canvas Live Step Overlay */
export class GraphVisualizer {
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

    // 1. Extract or Auto-Generate Nodes & Edges
    let nodes = state.nodes || (state.graph ? state.graph.nodes : null) || [];
    let edges = state.edges || (state.graph ? state.graph.edges : null) || [];

    // Fallback: If nodes is empty, auto-generate nodes from edges list (e.g. ["A-B", "A-C", "B-D"])
    if (nodes.length === 0 && edges.length > 0) {
      const nodeSet = new Set();
      edges.forEach(e => {
        if (typeof e === 'string') {
          const parts = e.split('-');
          if (parts[0]) nodeSet.add(parts[0]);
          if (parts[1]) nodeSet.add(parts[1]);
        } else if (e.source && e.target) {
          nodeSet.add(e.source);
          nodeSet.add(e.target);
        }
      });
      nodes = Array.from(nodeSet).map(id => ({ id, label: id }));
    }

    // Default Fallback Nodes if completely empty
    if (nodes.length === 0) {
      nodes = [
        { id: "A", label: "A" },
        { id: "B", label: "B" },
        { id: "C", label: "C" },
        { id: "D", label: "D" },
        { id: "E", label: "E" }
      ];
      edges = [
        { source: "A", target: "B", weight: 4 },
        { source: "A", target: "C", weight: 2 },
        { source: "B", target: "D", weight: 5 },
        { source: "C", target: "E", weight: 3 }
      ];
    }

    // Normalize edges format
    const formattedEdges = edges.map(e => {
      if (typeof e === 'string') {
        const parts = e.split('-');
        return { source: parts[0], target: parts[1], weight: 1 };
      }
      return e;
    });

    // 2. Position nodes in a clean circular / grid 2D layout
    const width = this.container.clientWidth || 700;
    const height = Math.max(this.container.clientHeight || 380, 350);
    const centerX = width / 2;
    const centerY = height / 2 - 20;
    const radius = Math.min(width, height) / 2.8;

    const nodePositions = {};
    const totalNodes = nodes.length;

    nodes.forEach((node, idx) => {
      const nodeId = typeof node === 'string' ? node : node.id;
      const angle = (idx / totalNodes) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      nodePositions[nodeId] = { x, y, label: typeof node === 'string' ? node : (node.label || nodeId) };
    });

    const activeNode = state.current_node || (state.pointers ? state.pointers.current : null);
    const visitedNodes = new Set(state.visited || []);
    const queueNodes = state.queue || state.stack || [];
    const distances = (state.variables && state.variables.distances) || {};

    // 3. Render SVG Canvas
    let svgHtml = `
      <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; justify-content:space-between; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0;">
        
        <!-- On-Canvas Step Live Explanation Overlay -->
        <div style="background:#f8fafc; border-bottom:1px solid #e2e8f0; padding:12px 18px; display:flex; align-items:center; justify-content:space-between; gap:12px; z-index:10;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:#0052ff; color:#fff; font-size:0.75rem; font-weight:700; padding:4px 10px; border-radius:6px; text-transform:uppercase; letter-spacing:0.5px;">
              ${(state.action || 'STEP EXECUTION').toUpperCase()}
            </span>
            <span style="color:#0f172a; font-size:0.95rem; font-weight:600;">
              ${state.message || 'Executing graph algorithm step...'}
            </span>
          </div>
          <span style="font-family:var(--font-mono); color:#0052ff; font-size:0.85rem; font-weight:700; white-space:nowrap;">
            Step ${(state.step || 0) + 1}
          </span>
        </div>

        <!-- SVG Graph Canvas -->
        <svg width="100%" height="${height}" style="flex-grow:1; background:#ffffff;">
          <defs>
            <filter id="glow-node" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="rgba(0, 82, 255, 0.35)" />
            </filter>
          </defs>
    `;

    // Draw Edges
    formattedEdges.forEach(edge => {
      const p1 = nodePositions[edge.source];
      const p2 = nodePositions[edge.target];

      if (p1 && p2) {
        const isEdgeActive = (activeNode === edge.source && visitedNodes.has(edge.target)) ||
                             (activeNode === edge.target && visitedNodes.has(edge.source));
        const strokeColor = isEdgeActive ? "#0052ff" : "#64748b";
        const strokeWidth = isEdgeActive ? "3.5" : "2";

        svgHtml += `
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${isEdgeActive ? '6,3' : 'none'}" />
        `;

        if (edge.weight !== undefined && edge.weight !== 1) {
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          svgHtml += `
            <rect x="${midX - 12}" y="${midY - 10}" width="24" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))" />
            <text x="${midX}" y="${midY + 4}" fill="#0f172a" font-size="11" font-weight="700" text-anchor="middle">${edge.weight}</text>
          `;
        }
      }
    });

    // Draw Nodes
    Object.keys(nodePositions).forEach(nodeId => {
      const pos = nodePositions[nodeId];
      const isActive = activeNode === nodeId;
      const isVisited = visitedNodes.has(nodeId);
      const isQueued = queueNodes.includes(nodeId);

      let nodeFill = "#ffffff";
      let nodeStroke = "#0f172a";
      let textColor = "#0f172a";
      let nodeGlow = false;

      if (isActive) {
        nodeFill = "#0052ff";
        nodeStroke = "#0052ff";
        textColor = "#ffffff";
        nodeGlow = true;
      } else if (isVisited) {
        nodeFill = "#eff6ff";
        nodeStroke = "#2563eb";
        textColor = "#1d4ed8";
      } else if (isQueued) {
        nodeFill = "#fffbeb";
        nodeStroke = "#f59e0b";
        textColor = "#b45309";
      }

      const distVal = distances[nodeId] !== undefined ? `d:${distances[nodeId]}` : null;

      svgHtml += `
        <g>
          <circle cx="${pos.x}" cy="${pos.y}" r="22" fill="${nodeFill}" stroke="${nodeStroke}" stroke-width="2.5" ${nodeGlow ? 'filter="url(#glow-node)"' : ''} />
          <text x="${pos.x}" y="${pos.y + 5}" fill="${textColor}" font-size="14" font-weight="700" text-anchor="middle">${pos.label}</text>
          ${distVal ? `<text x="${pos.x}" y="${pos.y - 28}" fill="#0052ff" font-size="11" font-weight="700" text-anchor="middle">${distVal}</text>` : ''}
        </g>
      `;
    });

    svgHtml += `</svg>`;

    // Bottom Queue/Visited Status Strip
    svgHtml += `
        <div style="background:#f8fafc; padding:10px 16px; border-top:1px solid #e2e8f0; display:flex; gap:20px; align-items:center; font-size:0.82rem;">
          <div><strong style="color:#64748b;">Queue/Stack:</strong> <span style="color:#b45309; font-family:var(--font-mono); font-weight:700;">[${queueNodes.join(', ')}]</span></div>
          <div><strong style="color:#64748b;">Visited:</strong> <span style="color:#059669; font-family:var(--font-mono); font-weight:700;">{${Array.from(visitedNodes).join(', ')}}</span></div>
        </div>
      </div>
    `;

    this.container.innerHTML = svgHtml;
  }
}
