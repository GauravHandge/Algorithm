/**
 * Interactive LangGraph Visualizer Canvas
 * Renders nodes, curved edges, animated flow particles, and status badges.
 */

export class RagGraphVisualizer {
  constructor(containerElement, onNodeSelectCallback = null) {
    this.container = containerElement;
    this.onNodeSelect = onNodeSelectCallback;
    this.currentArch = null;
    this.currentStepIndex = 0;
    this.selectedNodeId = null;
  }

  setArchitecture(archData) {
    this.currentArch = archData;
    this.currentStepIndex = 0;
    this.selectedNodeId = null;
    this.render();
  }

  setStep(stepIndex) {
    this.currentStepIndex = stepIndex;
    if (this.currentArch && this.currentArch.steps && this.currentArch.steps[stepIndex]) {
      this.selectedNodeId = this.currentArch.steps[stepIndex].activeNodeId;
    }
    this.render();
  }

  selectNode(nodeId) {
    this.selectedNodeId = nodeId;
    this.render();
    if (this.onNodeSelect) {
      this.onNodeSelect(nodeId);
    }
  }

  getRoleColor(role) {
    switch (role) {
      case "START":
      case "END":
        return { bg: "#ecfdf5", border: "#10b981", text: "#059669", glow: "rgba(16, 185, 129, 0.25)" };
      case "GATE":
      case "ROUTER":
        return { bg: "#fffbeb", border: "#f59e0b", text: "#d97706", glow: "rgba(245, 158, 11, 0.25)" };
      case "TOOL":
        return { bg: "#fefce8", border: "#eab308", text: "#ca8a04", glow: "rgba(234, 179, 8, 0.25)" };
      case "PLANNER":
        return { bg: "#eff6ff", border: "#0052ff", text: "#0052ff", glow: "rgba(0, 82, 255, 0.25)" };
      case "GRAPH":
        return { bg: "#f0fdfa", border: "#14b8a6", text: "#0f766e", glow: "rgba(20, 184, 166, 0.25)" };
      case "VISION":
        return { bg: "#fdf2f8", border: "#ec4899", text: "#be185d", glow: "rgba(236, 72, 153, 0.25)" };
      case "FUSION":
        return { bg: "#faf5ff", border: "#8b5cf6", text: "#6d28d9", glow: "rgba(139, 92, 246, 0.25)" };
      case "AUGMENT":
      case "RETRIEVE":
      case "DENSE_SEARCH":
      case "BM25_SEARCH":
        return { bg: "#ecfeff", border: "#0891b2", text: "#0e7490", glow: "rgba(8, 145, 178, 0.25)" };
      case "EVALUATE":
      case "REFLECTION":
        return { bg: "#faf5ff", border: "#9333ea", text: "#7e22ce", glow: "rgba(147, 51, 234, 0.25)" };
      case "REWRITE":
      case "LOOP":
        return { bg: "#fff1f2", border: "#f43f5e", text: "#e11d48", glow: "rgba(244, 63, 94, 0.25)" };
      case "GENERATE":
      case "SYNTHESIS":
        return { bg: "#eff6ff", border: "#2563eb", text: "#1d4ed8", glow: "rgba(37, 99, 235, 0.25)" };
      case "STORE":
      case "EMBED":
      case "PROCESS":
      case "SUMMARIZE":
        return { bg: "#f0fdf4", border: "#2563eb", text: "#1d4ed8", glow: "rgba(37, 99, 235, 0.25)" };
      default:
        return { bg: "#f1f5f9", border: "#64748b", text: "#475569", glow: "rgba(100, 116, 139, 0.25)" };
    }
  }

  getIconSvg(iconName) {
    const icons = {
      "play": '<path d="M5 3l14 9-14 9V3z"/>',
      "check-square": '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
      "help-circle": '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
      "database": '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
      "check-circle": '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
      "refresh-cw": '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
      "shield-alert": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
      "thumbs-up": '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>',
      "cpu": '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
      "git-branch": '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
      "git-merge": '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>',
      "bar-chart-2": '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
      "minimize-2": '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>',
      "shield-check": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
      "file-text": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
      "scissors": '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
      "search": '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
      "layers": '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
      "sparkles": '<path d="M12 3l1.91 5.89L20 10.8l-4.59 4.11L16.47 21 12 17.65 7.53 21l1.06-6.09L4 10.8l6.09-1.91L12 3z"/>',
      "align-left": '<line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>',
      "image": '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
      "share-2": '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
      "network": '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><line x1="12" y1="8" x2="12" y2="12"/>',
      "code": '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
      "terminal": '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
      "user-check": '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>',
      "folder-tree": '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><line x1="8" y1="10" x2="8" y2="16"/><line x1="12" y1="13" x2="12" y2="16"/>',
      "eye": '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
    };
    return icons[iconName] || '<circle cx="12" cy="12" r="10"/>';
  }

  render() {
    if (!this.container || !this.currentArch) return;

    const arch = this.currentArch;
    const currentStep = arch.steps[this.currentStepIndex] || arch.steps[0];
    const activeNodeId = currentStep ? currentStep.activeNodeId : null;
    const activeEdgeId = currentStep ? currentStep.activeEdgeId : null;

    // Canvas Dimensions
    const svgWidth = 1100;
    const svgHeight = 420;

    // Node Dimension Settings
    const nodeW = 125;
    const nodeH = 75;

    // Map of nodes for quick lookup
    const nodeMap = {};
    arch.nodes.forEach(n => {
      nodeMap[n.id] = n;
    });

    // 1. Build Edges (Curved Bezier Lines with Arrowheads & Condition Badges)
    let edgesSvg = "";
    let particlesSvg = "";

    arch.edges.forEach(edge => {
      const src = nodeMap[edge.source];
      const tgt = nodeMap[edge.target];
      if (!src || !tgt) return;

      const isEdgeActive = (edge.id === activeEdgeId) || (src.id === activeNodeId && !activeEdgeId);
      const isLoop = edge.type === "loop";
      const isConditional = edge.type === "conditional";

      let x1, y1, x2, y2, pathD;

      if (isLoop && edge.source === "rewrite_query" && edge.target === "retrieval_node") {
        // Special loop-back curve from bottom up to retrieval
        x1 = src.x + nodeW / 2;
        y1 = src.y;
        x2 = tgt.x + nodeW / 2;
        y2 = tgt.y + nodeH;
        pathD = `M ${x1} ${y1} C ${x1} ${y1 - 30}, ${x2 + 30} ${y2 + 40}, ${x2} ${y2}`;
      } else if (isLoop && edge.source === "grade_hallucination" && edge.target === "generate_node") {
        // Loop back from hallucination to generator
        x1 = src.x;
        y1 = src.y + 20;
        x2 = tgt.x + nodeW;
        y2 = tgt.y + 20;
        pathD = `M ${x1} ${y1} C ${x1 - 40} ${y1 - 50}, ${x2 + 40} ${y2 - 50}, ${x2} ${y2}`;
      } else if (src.y !== tgt.y) {
        // Branching / Joining curve
        x1 = src.x + nodeW;
        y1 = src.y + nodeH / 2;
        x2 = tgt.x;
        y2 = tgt.y + nodeH / 2;
        const mx = (x1 + x2) / 2;
        pathD = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
      } else {
        // Standard horizontal edge
        x1 = src.x + nodeW;
        y1 = src.y + nodeH / 2;
        x2 = tgt.x;
        y2 = tgt.y + nodeH / 2;
        pathD = `M ${x1} ${y1} L ${x2} ${y2}`;
      }

      // Edge Styling
      let strokeColor = "rgba(148, 163, 184, 0.6)";
      let strokeWidth = 2;
      let strokeDash = isConditional ? "5,4" : (isLoop ? "6,3" : "none");
      let markerId = "arrow-default";

      if (isEdgeActive) {
        strokeColor = isLoop ? "#f43f5e" : "#0052ff";
        strokeWidth = 3;
        markerId = isLoop ? "arrow-loop" : "arrow-active";
      }

      const pathId = `edge-path-${edge.id}`;

      edgesSvg += `
        <g class="graph-edge ${isEdgeActive ? 'active-edge' : ''}">
          <path id="${pathId}" d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" marker-end="url(#${markerId})" />
          ${edge.label ? `
            <text font-size="10" font-family="var(--font-mono)" fill="${isEdgeActive ? '#0052ff' : '#64748b'}" font-weight="700">
              <textPath href="#${pathId}" startOffset="50%" text-anchor="middle">
                ${edge.label}
              </textPath>
            </text>
          ` : ''}
        </g>
      `;

      // If active edge, inject animated pulse particle!
      if (isEdgeActive) {
        const particleColor = isLoop ? "#f43f5e" : "#0052ff";
        particlesSvg += `
          <circle r="5" fill="${particleColor}" filter="url(#glow-filter)">
            <animateMotion dur="1.2s" repeatCount="indefinite" path="${pathD}" keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
          </circle>
          <circle r="2.5" fill="#ffffff">
            <animateMotion dur="1.2s" repeatCount="indefinite" path="${pathD}" keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
          </circle>
        `;
      }
    });

    // 2. Build Nodes (Cards with Role Badges, Icons, and Live Status)
    let nodesSvg = "";

    arch.nodes.forEach(node => {
      const colors = this.getRoleColor(node.role);
      const isNodeActive = (node.id === activeNodeId);
      const isNodeSelected = (node.id === this.selectedNodeId);

      // Determine step status relative to current playback
      let statusText = "IDLE";
      let statusBg = "rgba(100, 116, 139, 0.12)";
      let statusColor = "#64748b";

      if (isNodeActive) {
        statusText = "RUNNING";
        statusBg = colors.border;
        statusColor = "#ffffff";
      } else if (node.role === "START" && this.currentStepIndex > 0) {
        statusText = "PASSED";
        statusBg = "#ecfdf5";
        statusColor = "#059669";
      }

      nodesSvg += `
        <g class="graph-node-group" data-node-id="${node.id}" style="cursor:pointer;" transform="translate(${node.x}, ${node.y})">
          
          <!-- Active Pulsing Glow Halo -->
          ${isNodeActive ? `
            <rect x="-4" y="-4" width="${nodeW + 8}" height="${nodeH + 8}" rx="14" fill="none" stroke="${colors.border}" stroke-width="2.5" opacity="0.5">
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="transform" type="scale" values="1;1.02;1" dur="1.5s" repeatCount="indefinite" />
            </rect>
          ` : ''}

          <!-- Main Node Card Box (Crisp White Card with Soft Shadow) -->
          <rect 
            x="0" 
            y="0" 
            width="${nodeW}" 
            height="${nodeH}" 
            rx="10" 
            fill="${isNodeActive ? '#ffffff' : '#ffffff'}" 
            stroke="${isNodeActive ? colors.border : (isNodeSelected ? '#0052ff' : '#e2e8f0')}" 
            stroke-width="${isNodeActive || isNodeSelected ? '2' : '1.5'}"
            filter="${isNodeActive ? 'url(#active-shadow)' : 'url(#card-shadow)'}"
          />

          <!-- Header Role Tag -->
          <rect x="6" y="6" width="${nodeW - 12}" height="18" rx="4" fill="${colors.bg}" />
          <text x="12" y="19" font-size="9" font-family="var(--font-mono)" font-weight="700" fill="${colors.text}">
            ${node.role}
          </text>

          <!-- Status Indicator Dot/Pill -->
          <circle cx="${nodeW - 14}" cy="15" r="4" fill="${isNodeActive ? colors.border : statusColor}" />

          <!-- Center Icon + Node Label -->
          <g transform="translate(10, 32)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${colors.text}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${this.getIconSvg(node.icon)}
            </svg>
          </g>

          <text x="34" y="45" font-size="11" font-family="var(--font-heading)" font-weight="700" fill="#0f172a">
            ${node.label.length > 13 ? node.label.substring(0, 12) + '…' : node.label}
          </text>

          <!-- Node Footer: Status Text -->
          <text x="10" y="65" font-size="9" font-family="var(--font-mono)" font-weight="600" fill="${isNodeActive ? '#0052ff' : '#64748b'}">
            ${isNodeActive ? '● Active Step' : (isNodeSelected ? '▸ Selected' : 'Idle Node')}
          </text>
        </g>
      `;
    });

    // 3. Assemble Complete SVG Structure
    this.container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; min-height:430px; display:flex; flex-direction:column; background:#f8fafc; border-radius:14px; overflow:hidden; border:1px solid #e2e8f0;">
        
        <!-- Top Visualizer HUD Bar -->
        <div style="background:#ffffff; border-bottom:1px solid #e2e8f0; padding:10px 18px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; z-index:10;">
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="badge ${arch.badgeClass}" style="font-size:0.75rem; letter-spacing:0.5px; text-transform:uppercase; font-weight:700;">
              ${arch.name}
            </span>
            <span style="color:#64748b; font-size:0.85rem; font-family:var(--font-mono);">
              Topology: <strong style="color:#0f172a;">${arch.topology}</strong>
            </span>
          </div>

          <div style="display:flex; align-items:center; gap:15px; font-size:0.85rem;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="width:8px; height:8px; border-radius:50%; background:#10b981; display:inline-block; box-shadow:0 0 6px rgba(16,185,129,0.5);"></span>
              <span style="color:#475569; font-size:0.8rem; font-weight:500;">Step <strong style="color:#0f172a;">${this.currentStepIndex + 1}</strong> of <strong style="color:#0f172a;">${arch.steps.length}</strong></span>
            </div>
            <span style="color:#cbd5e1;">|</span>
            <span style="color:#0052ff; font-size:0.85rem; font-weight:700; font-family:var(--font-mono);">
              ${currentStep ? currentStep.action : 'IDLE'}
            </span>
          </div>
        </div>

        <!-- SVG Interactive Canvas with Dot Grid Background -->
        <div style="position:relative; flex:1; width:100%; height:100%; overflow-x:auto; overflow-y:hidden; display:flex; align-items:center; justify-content:center;">
          <svg viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" style="width:100%; height:100%; min-width:950px; display:block;">
            <defs>
              <!-- Grid Pattern -->
              <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="rgba(15, 23, 42, 0.08)" />
              </pattern>

              <!-- Arrow Markers -->
              <marker id="arrow-default" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
              </marker>
              <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#0052ff" />
              </marker>
              <marker id="arrow-loop" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
              </marker>

              <!-- Glowing Filters -->
              <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="active-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="rgba(0, 82, 255, 0.25)" />
              </filter>
              <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0, 0, 0, 0.05)" />
              </filter>
            </defs>

            <!-- Background Grid -->
            <rect width="${svgWidth}" height="${svgHeight}" fill="url(#dot-grid)" />

            <!-- Edge Lines -->
            <g id="edges-layer">${edgesSvg}</g>

            <!-- Animated Flow Particles Layer -->
            <g id="particles-layer">${particlesSvg}</g>

            <!-- Node Boxes Layer -->
            <g id="nodes-layer">${nodesSvg}</g>
          </svg>
        </div>

        <!-- Bottom Step Banner Overlay -->
        <div style="background:#ffffff; border-top:1px solid #e2e8f0; padding:10px 18px; display:flex; align-items:center; justify-content:space-between; gap:15px; z-index:10;">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="background:#eff6ff; color:#0052ff; border:1px solid #bfdbfe; font-size:0.75rem; font-weight:700; padding:3px 8px; border-radius:4px; font-family:var(--font-mono);">
              ACTIVE
            </span>
            <span style="font-size:0.95rem; font-weight:700; color:#0f172a;">
              ${currentStep ? currentStep.title : 'Ready'}
            </span>
          </div>
          <span style="color:#475569; font-size:0.85rem; max-width:650px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">
            ${currentStep ? currentStep.description : 'Select a step or click play to start visualization.'}
          </span>
        </div>
      </div>
    `;

    // Attach click listeners to all nodes
    const nodeGroups = this.container.querySelectorAll(".graph-node-group");
    nodeGroups.forEach(group => {
      group.addEventListener("click", (e) => {
        const nodeId = group.getAttribute("data-node-id");
        this.selectNode(nodeId);
      });
    });
  }
}
