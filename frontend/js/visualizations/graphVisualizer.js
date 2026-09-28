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
      <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; justify-content:space-between; background:#0b0f19; border-radius:12px; overflow:hidden;">
        
        <!-- On-Canvas Step Live Explanation Overlay -->
        <div style="background:rgba(15, 23, 42, 0.9); border-bottom:1px solid rgba(99,102,241,0.3); padding:12px 18px; display:flex; align-items:center; justify-content:space-between; gap:12px; z-index:10;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:var(--accent-primary); color:#fff; font-size:0.75rem; font-weight:bold; padding:4px 10px; border-radius:6px; text-transform:uppercase; letter-spacing:0.5px;">
              ${(state.action || 'STEP EXECUTION').toUpperCase()}
            </span>
            <span style="color:#f8fafc; font-size:0.95rem; font-weight:500;">
              ${state.message || 'Executing graph algorithm step...'}
            </span>
          </div>
          <span style="font-family:var(--font-mono); color:var(--accent-secondary); font-size:0.85rem; font-weight:bold; white-space:nowrap;">
            Step ${(state.step || 0) + 1}
          </span>
        </div>

        <!-- SVG Graph Canvas -->
        <svg width="100%" height="${height}" style="flex-grow:1;">
          <defs>
            <filter id="glow-node" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
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
        const strokeColor = isEdgeActive ? "var(--accent-secondary)" : "rgba(255,255,255,0.18)";
        const strokeWidth = isEdgeActive ? "3.5" : "2";

        svgHtml += `
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${isEdgeActive ? '6,3' : 'none'}" />
        `;

        if (edge.weight !== undefined && edge.weight !== 1) {
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          svgHtml += `
            <rect x="${midX - 12}" y="${midY - 10}" width="24" height="20" rx="4" fill="#1e293b" stroke="rgba(255,255,255,0.2)" />
            <text x="${midX}" y="${midY + 4}" fill="var(--accent-warning)" font-size="11" font-weight="bold" text-anchor="middle">${edge.weight}</text>
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

      let nodeFill = "#1e293b";
      let nodeStroke = "rgba(255,255,255,0.3)";
      let nodeGlow = false;

      if (isActive) {
        nodeFill = "var(--accent-primary)";
        nodeStroke = "#a5b4fc";
        nodeGlow = true;
      } else if (isVisited) {
        nodeFill = "var(--accent-success)";
        nodeStroke = "#86efac";
      } else if (isQueued) {
        nodeFill = "var(--accent-warning)";
        nodeStroke = "#fde047";
      }

      const distVal = distances[nodeId] !== undefined ? `d:${distances[nodeId]}` : null;

      svgHtml += `
        <g>
          <circle cx="${pos.x}" cy="${pos.y}" r="22" fill="${nodeFill}" stroke="${nodeStroke}" stroke-width="2.5" ${nodeGlow ? 'filter="url(#glow-node)"' : ''} />
          <text x="${pos.x}" y="${pos.y + 5}" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">${pos.label}</text>
          ${distVal ? `<text x="${pos.x}" y="${pos.y - 28}" fill="var(--accent-secondary)" font-size="11" font-weight="bold" text-anchor="middle">${distVal}</text>` : ''}
        </g>
      `;
    });

    svgHtml += `</svg>`;

    // Bottom Queue/Visited Status Strip
    svgHtml += `
        <div style="background:rgba(15,23,42,0.85); padding:8px 16px; border-top:1px solid rgba(255,255,255,0.08); display:flex; gap:20px; align-items:center; font-size:0.8rem;">
          <div><strong style="color:var(--text-muted);">Queue/Stack:</strong> <span style="color:var(--accent-warning); font-family:var(--font-mono); font-weight:bold;">[${queueNodes.join(', ')}]</span></div>
          <div><strong style="color:var(--text-muted);">Visited:</strong> <span style="color:var(--accent-success); font-family:var(--font-mono); font-weight:bold;">{${Array.from(visitedNodes).join(', ')}}</span></div>
        </div>
      </div>
    `;

    this.container.innerHTML = svgHtml;
  }
}
