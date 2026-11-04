/**
 * AlgoVerse AI Studio — Professional Workflow Graph Visualizer
 * Inspired by Linear, Vercel, FlowDrop, and SvelteFlow developer interfaces (Images 1 & 2).
 * Renders high-fidelity workflow node cards, input/output port handles,
 * smooth cubic bezier connectors, animated flow pulses, interactive HUD, and minimap.
 */

export class RagGraphVisualizer {
  constructor(containerElement, onNodeSelectCallback = null) {
    this.container = containerElement;
    this.onNodeSelect = onNodeSelectCallback;
    this.currentArch = null;
    this.currentStepIndex = 0;
    this.selectedNodeId = null;
    this.zoomLevel = 1.0;
  }

  setArchitecture(archData) {
    this.currentArch = archData;
    this.currentStepIndex = 0;
    this.selectedNodeId = null;
    this.zoomLevel = 1.0;
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

  zoomIn() {
    this.zoomLevel = Math.min(this.zoomLevel + 0.15, 1.6);
    this._applyZoom();
  }

  zoomOut() {
    this.zoomLevel = Math.max(this.zoomLevel - 0.15, 0.7);
    this._applyZoom();
  }

  resetZoom() {
    this.zoomLevel = 1.0;
    this._applyZoom();
  }

  _applyZoom() {
    const svgEl = this.container.querySelector(".workflow-svg-canvas");
    if (svgEl) {
      svgEl.style.transform = `scale(${this.zoomLevel})`;
      svgEl.style.transformOrigin = "center center";
      svgEl.style.transition = "transform 0.25s cubic-bezier(0.2, 0, 0, 1)";
    }
    const zoomText = this.container.querySelector(".zoom-indicator-text");
    if (zoomText) {
      zoomText.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }
  }

  getRoleStyles(role) {
    switch (role) {
      case "START":
      case "END":
        return { badgeBg: "#ECFDF5", badgeBorder: "#A7F3D0", badgeText: "#059669", iconBg: "#F0FDF4", iconColor: "#16A34A" };
      case "GATE":
      case "ROUTER":
        return { badgeBg: "#FEF3C7", badgeBorder: "#FDE68A", badgeText: "#B45309", iconBg: "#FFFBEB", iconColor: "#D97706" };
      case "TOOL":
        return { badgeBg: "#FEF9C3", badgeBorder: "#FEF08A", badgeText: "#854D0E", iconBg: "#FEFCE8", iconColor: "#CA8A04" };
      case "PLANNER":
        return { badgeBg: "#EFF6FF", badgeBorder: "#BFDBFE", badgeText: "#1D4ED8", iconBg: "#EFF6FF", iconColor: "#2563EB" };
      case "GRAPH":
        return { badgeBg: "#F0FDFA", badgeBorder: "#99F6E4", badgeText: "#0F766E", iconBg: "#F0FDFA", iconColor: "#0D9488" };
      case "VISION":
        return { badgeBg: "#FDF2F8", badgeBorder: "#FBCFE8", badgeText: "#BE185D", iconBg: "#FDF2F8", iconColor: "#DB2777" };
      case "FUSION":
      case "RERANK":
        return { badgeBg: "#F5F3FF", badgeBorder: "#DDD6FE", badgeText: "#6D28D9", iconBg: "#F5F3FF", iconColor: "#7C3AED" };
      case "RETRIEVE":
      case "DENSE_SEARCH":
      case "BM25_SEARCH":
      case "EXPAND":
        return { badgeBg: "#EFF6FF", badgeBorder: "#BFDBFE", badgeText: "#1E40AF", iconBg: "#EFF6FF", iconColor: "#2563EB" };
      case "EVALUATE":
      case "REFLECTION":
        return { badgeBg: "#FAF5FF", badgeBorder: "#E9D5FF", badgeText: "#7E22CE", iconBg: "#FAF5FF", iconColor: "#9333EA" };
      case "REWRITE":
      case "LOOP":
        return { badgeBg: "#FEF2F2", badgeBorder: "#FECACA", badgeText: "#B91C1C", iconBg: "#FEF2F2", iconColor: "#DC2626" };
      case "GENERATE":
      case "SYNTHESIS":
        return { badgeBg: "#EFF6FF", badgeBorder: "#BFDBFE", badgeText: "#1E40AF", iconBg: "#EFF6FF", iconColor: "#2563EB" };
      default:
        return { badgeBg: "#F1F5F9", badgeBorder: "#E2E8F0", badgeText: "#475569", iconBg: "#F8FAFC", iconColor: "#64748B" };
    }
  }

  getIconSvg(iconName) {
    const icons = {
      "play": '<polygon points="5 3 19 12 5 21 5 3"></polygon>',
      "check-square": '<polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
      "help-circle": '<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>',
      "database": '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>',
      "check-circle": '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
      "refresh-cw": '<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>',
      "shield-alert": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
      "thumbs-up": '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>',
      "cpu": '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line>',
      "git-branch": '<line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path>',
      "git-merge": '<circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M6 21V9a9 9 0 0 0 9 9"></path>',
      "bar-chart-2": '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>',
      "minimize-2": '<polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line>',
      "shield-check": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline>',
      "file-text": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>',
      "scissors": '<circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line>',
      "search": '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
      "layers": '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>',
      "sparkles": '<path d="M12 3l1.91 5.89L20 10.8l-4.59 4.11L16.47 21 12 17.65 7.53 21l1.06-6.09L4 10.8l6.09-1.91L12 3z"></path>',
      "align-left": '<line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line>',
      "image": '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>',
      "share-2": '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>',
      "network": '<rect x="9" y="2" width="6" height="6" rx="1"></rect><rect x="2" y="16" width="6" height="6" rx="1"></rect><rect x="16" y="16" width="6" height="6" rx="1"></rect><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"></path><line x1="12" y1="8" x2="12" y2="12"></line>',
      "code": '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',
      "terminal": '<polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line>',
      "user-check": '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline>',
      "folder-tree": '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path><line x1="8" y1="10" x2="8" y2="16"></line><line x1="12" y1="13" x2="12" y2="16"></line>',
      "eye": '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>'
    };
    return icons[iconName] || '<circle cx="12" cy="12" r="10"></circle>';
  }

  render() {
    if (!this.container || !this.currentArch) return;

    const arch = this.currentArch;
    const currentStep = arch.steps[this.currentStepIndex] || arch.steps[0];
    const activeNodeId = currentStep ? currentStep.activeNodeId : null;
    const activeEdgeId = currentStep ? currentStep.activeEdgeId : null;

    // Viewport dimensions
    const svgWidth = 1120;
    const svgHeight = 440;

    // FlowDrop Node dimensions
    const nodeW = 142;
    const nodeH = 76;
    const portRadius = 4.5;

    // Map of nodes for quick reference
    const nodeMap = {};
    const nodeOrderMap = {};
    arch.nodes.forEach((n, idx) => {
      nodeMap[n.id] = n;
      nodeOrderMap[n.id] = idx;
    });

    const activeNodeOrder = activeNodeId && nodeOrderMap[activeNodeId] !== undefined ? nodeOrderMap[activeNodeId] : -1;

    // 1. Build Edges (Smooth FlowDrop / SvelteFlow Bezier Curves)
    let edgesSvg = "";
    let particlesSvg = "";

    arch.edges.forEach(edge => {
      const src = nodeMap[edge.source];
      const tgt = nodeMap[edge.target];
      if (!src || !tgt) return;

      const isEdgeActive = (edge.id === activeEdgeId) || (src.id === activeNodeId && !activeEdgeId);
      const isLoop = edge.type === "loop";
      const isConditional = edge.type === "conditional";

      // Output port of source (right edge center)
      const x1 = src.x + nodeW;
      const y1 = src.y + nodeH / 2;

      // Input port of target (left edge center)
      const x2 = tgt.x;
      const y2 = tgt.y + nodeH / 2;

      let pathD = "";

      if (isLoop && edge.source === "rewrite_query" && edge.target === "retrieval_node") {
        // Smooth loop-back arc from bottom up to retrieval node
        const loopX1 = src.x + nodeW / 2;
        const loopY1 = src.y;
        const loopX2 = tgt.x + nodeW / 2;
        const loopY2 = tgt.y + nodeH;
        pathD = `M ${loopX1} ${loopY1} C ${loopX1} ${loopY1 - 45}, ${loopX2 + 45} ${loopY2 + 50}, ${loopX2} ${loopY2}`;
      } else if (isLoop && edge.source === "grade_hallucination" && edge.target === "generate_node") {
        // Loop back from hallucination checker to generator
        const loopX1 = src.x + 20;
        const loopY1 = src.y;
        const loopX2 = tgt.x + nodeW - 20;
        const loopY2 = tgt.y;
        pathD = `M ${loopX1} ${loopY1} C ${loopX1 - 35} ${loopY1 - 50}, ${loopX2 + 35} ${loopY2 - 50}, ${loopX2} ${loopY2}`;
      } else if (src.y !== tgt.y) {
        // Smooth cubic bezier branching curve (FlowDrop / SvelteFlow style)
        const dx = Math.max(Math.abs(x2 - x1) * 0.5, 45);
        pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
      } else {
        // Linear horizontal curve with subtle ease
        const dx = (x2 - x1) * 0.45;
        pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
      }

      // Edge Styling
      let strokeColor = "#CBD5E1";
      let strokeWidth = 1.75;
      let strokeDash = isConditional ? "5,4" : (isLoop ? "6,3" : "none");
      let markerId = "arrow-default";

      if (isEdgeActive) {
        strokeColor = isLoop ? "#DC2626" : "#2563EB";
        strokeWidth = 2.5;
        markerId = isLoop ? "arrow-loop" : "arrow-active";
      }

      const pathId = `edge-path-${edge.id}`;

      edgesSvg += `
        <g class="graph-edge ${isEdgeActive ? 'active-edge' : ''}">
          <path id="${pathId}" d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" marker-end="url(#${markerId})" />
          ${edge.label ? `
            <text font-size="9" font-family="'Inter', sans-serif" fill="${isEdgeActive ? '#2563EB' : '#64748B'}" font-weight="600" dy="-5">
              <textPath href="#${pathId}" startOffset="50%" text-anchor="middle">
                ${edge.label}
              </textPath>
            </text>
          ` : ''}
        </g>
      `;

      // Live Animated Flow Particle
      if (isEdgeActive) {
        const particleColor = isLoop ? "#DC2626" : "#2563EB";
        particlesSvg += `
          <circle r="4" fill="${particleColor}">
            <animateMotion dur="1.3s" repeatCount="indefinite" path="${pathD}" keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
          </circle>
          <circle r="2" fill="#FFFFFF">
            <animateMotion dur="1.3s" repeatCount="indefinite" path="${pathD}" keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
          </circle>
        `;
      }
    });

    // 2. Build Nodes (Workflow Node Cards matching Images 1 & 2)
    let nodesSvg = "";
    let minimapNodesSvg = "";

    arch.nodes.forEach(node => {
      const roleStyle = this.getRoleStyles(node.role);
      const isNodeActive = (node.id === activeNodeId);
      const isNodeSelected = (node.id === this.selectedNodeId);

      // Node order comparison
      const order = nodeOrderMap[node.id] !== undefined ? nodeOrderMap[node.id] : 0;
      const isCompleted = activeNodeOrder > -1 && order < activeNodeOrder;

      // Status indicator
      let statusDotColor = "#94A3B8";
      let statusLabel = "Pending";
      let statusTextColor = "#64748B";

      if (isNodeActive) {
        statusDotColor = "#2563EB";
        statusLabel = "Active";
        statusTextColor = "#2563EB";
      } else if (isCompleted) {
        statusDotColor = "#16A34A";
        statusLabel = "Completed";
        statusTextColor = "#16A34A";
      }

      // Border and card styling
      let cardBorder = "#E5E7EB";
      let cardBg = "#FFFFFF";
      let cardShadow = "url(#card-shadow)";

      if (isNodeActive) {
        cardBorder = "#2563EB";
        cardShadow = "url(#active-shadow)";
      } else if (isNodeSelected) {
        cardBorder = "#2563EB";
      }

      nodesSvg += `
        <g class="graph-node-group" data-node-id="${node.id}" style="cursor:pointer;" transform="translate(${node.x}, ${node.y})">
          
          <!-- Active Focus Outline Ring -->
          ${isNodeActive ? `
            <rect x="-3" y="-3" width="${nodeW + 6}" height="${nodeH + 6}" rx="12" fill="none" stroke="#2563EB" stroke-width="2" opacity="0.35">
              <animate attributeName="opacity" values="0.45;0.15;0.45" dur="1.8s" repeatCount="indefinite" />
            </rect>
          ` : ''}

          <!-- Main White Node Card -->
          <rect 
            x="0" 
            y="0" 
            width="${nodeW}" 
            height="${nodeH}" 
            rx="10" 
            fill="${cardBg}" 
            stroke="${cardBorder}" 
            stroke-width="${isNodeActive ? '2' : '1'}"
            filter="${cardShadow}"
          />

          <!-- Node Header Strip -->
          <g transform="translate(10, 10)">
            <!-- Icon Box -->
            <rect x="0" y="0" width="20" height="20" rx="5" fill="${roleStyle.iconBg}" stroke="${roleStyle.badgeBorder}" stroke-width="1" />
            <g transform="translate(3, 3)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${roleStyle.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                ${this.getIconSvg(node.icon)}
              </svg>
            </g>

            <!-- Role Badge Pill -->
            <rect x="26" y="2" width="${nodeW - 68}" height="16" rx="4" fill="${roleStyle.badgeBg}" stroke="${roleStyle.badgeBorder}" stroke-width="0.5" />
            <text x="${26 + (nodeW - 68) / 2}" y="13.5" font-size="8.5" font-family="'Inter', sans-serif" font-weight="700" fill="${roleStyle.badgeText}" text-anchor="middle" letter-spacing="0.3">
              ${node.role}
            </text>

            <!-- Mini Status Dot -->
            <circle cx="${nodeW - 22}" cy="10" r="3.5" fill="${statusDotColor}" />
          </g>

          <!-- Node Title Label -->
          <text x="12" y="47" font-size="11" font-family="'Inter', sans-serif" font-weight="700" fill="#111827">
            ${node.label.length > 18 ? node.label.substring(0, 17) + '…' : node.label}
          </text>

          <!-- Node Footer Status -->
          <g transform="translate(12, 63)">
            <circle cx="2" cy="-3" r="2.5" fill="${statusDotColor}" />
            <text x="9" y="0" font-size="9" font-family="'Inter', sans-serif" font-weight="600" fill="${statusTextColor}">
              ${statusLabel}
            </text>
          </g>

          <!-- Left Port Handle (Input) -->
          <circle cx="0" cy="${nodeH / 2}" r="${portRadius}" fill="#6366F1" stroke="#FFFFFF" stroke-width="1.5" />

          <!-- Right Port Handle (Output) -->
          <circle cx="${nodeW}" cy="${nodeH / 2}" r="${portRadius}" fill="#10B981" stroke="#FFFFFF" stroke-width="1.5" />
        </g>
      `;

      // Minimap miniature node
      minimapNodesSvg += `
        <rect x="${node.x}" y="${node.y}" width="${nodeW}" height="${nodeH}" rx="8" fill="${isNodeActive ? '#2563EB' : (isCompleted ? '#16A34A' : '#E2E8F0')}" opacity="${isNodeActive ? '0.9' : '0.6'}" />
      `;
    });

    // 3. Assemble Complete SVG Structure
    this.container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; min-height:100%; display:flex; flex-direction:column; background:#F8FAFC; overflow:hidden;">
        
        <!-- SVG Interactive Canvas with Dotted Grid Background -->
        <div class="workflow-canvas-scroll" style="position:relative; flex:1; width:100%; height:100%; overflow:auto; display:flex; align-items:center; justify-content:center; background:#F8FAFC;">
          <svg class="workflow-svg-canvas" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" style="width:100%; height:100%; min-width:980px; min-height:440px; display:block;">
            <defs>
              <!-- Dotted Grid Pattern (FlowDrop Style) -->
              <pattern id="dot-grid" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.1" fill="#CBD5E1" opacity="0.75" />
              </pattern>

              <!-- Arrow Markers -->
              <marker id="arrow-default" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#94A3B8" />
              </marker>
              <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#2563EB" />
              </marker>
              <marker id="arrow-loop" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#DC2626" />
              </marker>

              <!-- Subtle Developer Card Shadows -->
              <filter id="active-shadow" x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="rgba(37, 99, 235, 0.16)" />
              </filter>
              <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0, 0, 0, 0.05)" />
              </filter>
            </defs>

            <!-- Background Grid -->
            <rect width="${svgWidth}" height="${svgHeight}" fill="url(#dot-grid)" />

            <!-- Edge Connectors Layer -->
            <g id="edges-layer">${edgesSvg}</g>

            <!-- Animated Flow Pulse Layer -->
            <g id="particles-layer">${particlesSvg}</g>

            <!-- Workflow Nodes Layer -->
            <g id="nodes-layer">${nodesSvg}</g>
          </svg>

          <!-- Floating Canvas Zoom Controls (Bottom Left - Image 1/2 Style) -->
          <div style="position:absolute; bottom:36px; left:16px; background:#FFFFFF; border:1px solid #E5E7EB; border-radius:8px; display:flex; align-items:center; gap:2px; padding:3px; box-shadow:0 1px 3px rgba(0,0,0,0.06); z-index:10;">
            <button id="btn-zoom-in" title="Zoom In" style="width:28px; height:28px; background:none; border:none; cursor:pointer; font-size:14px; font-weight:700; color:#374151; border-radius:4px; display:flex; align-items:center; justify-content:center;">+</button>
            <span class="zoom-indicator-text" style="font-size:11px; font-family:'JetBrains Mono', monospace; color:#64748B; padding:0 6px;">${Math.round(this.zoomLevel * 100)}%</span>
            <button id="btn-zoom-out" title="Zoom Out" style="width:28px; height:28px; background:none; border:none; cursor:pointer; font-size:14px; font-weight:700; color:#374151; border-radius:4px; display:flex; align-items:center; justify-content:center;">−</button>
            <button id="btn-zoom-reset" title="Fit to View" style="padding:0 8px; height:28px; background:none; border:none; cursor:pointer; font-size:11px; font-weight:600; color:#2563EB; border-radius:4px; display:flex; align-items:center; justify-content:center;">Fit</button>
          </div>

          <!-- Bottom Left Canvas Stats Strip (FlowDrop Style) -->
          <div style="position:absolute; bottom:10px; left:16px; font-size:11px; font-family:'Inter', sans-serif; color:#64748B; display:flex; gap:12px; z-index:9;">
            <span>${arch.nodes.length} nodes</span>
            <span>·</span>
            <span>${arch.edges.length} connections</span>
          </div>

          <!-- Svelte Flow / FlowDrop Minimap (Bottom Right - Matching Images 1 & 2!) -->
          <div style="position:absolute; bottom:14px; right:16px; width:130px; height:85px; background:#FFFFFF; border:1px solid #E5E7EB; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05); z-index:10; display:flex; flex-direction:column; justify-content:space-between;">
            <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width:100%; height:68px; background:#F8FAFC;">
              <g>${minimapNodesSvg}</g>
            </svg>
            <div style="background:#FFFFFF; border-top:1px solid #F1F5F9; padding:2px 6px; font-size:8.5px; color:#94A3B8; text-align:right; font-family:'Inter', sans-serif;">
              Workflow Studio
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach click listeners to all nodes
    const nodeGroups = this.container.querySelectorAll(".graph-node-group");
    nodeGroups.forEach(group => {
      group.addEventListener("click", () => {
        const nodeId = group.getAttribute("data-node-id");
        this.selectNode(nodeId);
      });
    });

    // Zoom button event listeners
    const zoomInBtn = this.container.querySelector("#btn-zoom-in");
    const zoomOutBtn = this.container.querySelector("#btn-zoom-out");
    const zoomResetBtn = this.container.querySelector("#btn-zoom-reset");
    if (zoomInBtn) zoomInBtn.addEventListener("click", () => this.zoomIn());
    if (zoomOutBtn) zoomOutBtn.addEventListener("click", () => this.zoomOut());
    if (zoomResetBtn) zoomResetBtn.addEventListener("click", () => this.resetZoom());
  }
}
