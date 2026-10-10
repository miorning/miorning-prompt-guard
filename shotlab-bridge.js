(() => {
  'use strict';

  if (window.__MIORNING_SHOTLAB_BRIDGE_V1516__) return;
  window.__MIORNING_SHOTLAB_BRIDGE_V1516__ = true;

  const SOURCE_EXT = 'MIORNING_SHOTLAB_EXT';
  const SOURCE_PAGE = 'MIORNING_SHOTLAB_PAGE';

  const DEFAULTS = Object.freeze({
    // Remain dormant until the isolated extension state explicitly enables this DLC.
    enabled: false,
    focusSelected: true,
    fitCanvas: true,
    groupSelected: true,
    ungroupSelected: true,
    altDuplicate: true,
    showToasts: false,
    debug: false
  });


  const isShotlabCanvasLocation = () => {
    return location.hostname === 'aigc.xinpianchang.com' &&
      (location.pathname === '/canvas' || location.pathname.startsWith('/canvas/'));
  };

  const NODE_SELECTORS = [
    '.react-flow__node',
    '.vue-flow__node',
    '[data-node-id]',
    '[data-nodeid]',
    '[data-id][class*="flow__node"]',
    '[data-id][class*="canvas-node"]',
    '[data-id][class*="node-card"]',
    '[id^="node_card_"]',
    '[id^="node_upload_"]',
    '[class*="canvasNode"]',
    '[class*="nodeItem"]'
  ];

  const CANVAS_SELECTORS = [
    '.react-flow__pane',
    '.vue-flow__pane',
    '.react-flow',
    '.vue-flow',
    '[class*="infinite-canvas"]',
    '[class*="infiniteCanvas"]',
    '[class*="flow-canvas"]',
    '[class*="flowCanvas"]',
    '[class*="canvas-container"]',
    '[class*="canvasContainer"]',
    '[class*="graph-canvas"]',
    '[class*="graphCanvas"]'
  ];

  let config = { ...DEFAULTS };
  let syntheticGuard = 0;
  let altDuplicateSession = null;
  let altDuplicateBusy = false;
  let altMouseGuardUntil = 0;

  const post = (type, payload = {}) => {
    window.postMessage({ source: SOURCE_PAGE, type, payload }, '*');
  };

  const debug = (...args) => {
    if (config.debug) console.debug('[MIORNING ShotLab]', ...args);
  };

  const toast = (message, level = 'success', duration = 2600) => {
    post('toast', { message, level, duration });
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const stopEvent = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  };

  const isEditable = (element) => {
    if (!(element instanceof Element)) return false;
    return Boolean(element.closest('input, textarea, select, [contenteditable="true"], [role="textbox"], .monaco-editor, .CodeMirror'));
  };

  const queryAllUnique = (selectors, root = document) => {
    const set = new Set();
    for (const selector of selectors) {
      try {
        root.querySelectorAll(selector).forEach((item) => set.add(item));
      } catch (_) {}
    }
    return [...set];
  };

  const closestBySelectors = (element, selectors) => {
    if (!(element instanceof Element)) return null;
    for (const selector of selectors) {
      try {
        const found = element.closest(selector);
        if (found) return found;
      } catch (_) {}
    }
    return null;
  };

  const findNode = (target) => closestBySelectors(target, NODE_SELECTORS);

  const findCanvas = (target = null) => {
    if (target instanceof Element) {
      const direct = closestBySelectors(target, CANVAS_SELECTORS);
      if (direct) return direct;
    }
    for (const selector of CANVAS_SELECTORS) {
      try {
        const canvas = document.querySelector(selector);
        if (canvas) return canvas;
      } catch (_) {}
    }
    return null;
  };

  const getNodeId = (node) => {
    if (!node) return null;
    return node.getAttribute('data-id') ||
      node.getAttribute('data-node-id') ||
      node.getAttribute('data-nodeid') ||
      node.dataset?.id ||
      node.id || null;
  };

  const isVisible = (element) => {
    if (!(element instanceof Element)) return false;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0 && rect.width > 1 && rect.height > 1;
  };

  const getNodes = () => queryAllUnique(NODE_SELECTORS).filter((node) => isVisible(node));

  const isSelectedNode = (node) => {
    if (!node) return false;
    const cls = String(node.className?.baseVal || node.className || '');
    return node.matches('[aria-selected="true"], [data-selected="true"]') ||
      /(^|\s)selected(\s|$)/i.test(cls) ||
      /node-selected|nodeSelected|is-selected|isSelected/i.test(cls) ||
      getComputedStyle(node).outlineStyle !== 'none';
  };

  const getSelectedNodes = () => getNodes().filter(isSelectedNode);

  const centerOf = (element) => {
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, rect };
  };

  const dispatchPointer = (target, type, options = {}) => {
    const PointerCtor = window.PointerEvent || window.MouseEvent;
    const event = new PointerCtor(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window,
      clientX: options.clientX || 0,
      clientY: options.clientY || 0,
      screenX: options.clientX || 0,
      screenY: options.clientY || 0,
      button: options.button ?? 0,
      buttons: options.buttons ?? 0,
      pointerId: options.pointerId ?? 9876,
      pointerType: 'mouse',
      isPrimary: true,
      pressure: options.buttons ? 0.5 : 0,
      ctrlKey: Boolean(options.ctrlKey),
      altKey: Boolean(options.altKey),
      shiftKey: Boolean(options.shiftKey),
      metaKey: Boolean(options.metaKey)
    });
    Object.defineProperty(event, '__miorningSynthetic', { value: true });
    target.dispatchEvent(event);
    return event;
  };

  const dispatchMouse = (target, type, options = {}) => {
    const event = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window,
      clientX: options.clientX || 0,
      clientY: options.clientY || 0,
      screenX: options.clientX || 0,
      screenY: options.clientY || 0,
      button: options.button ?? 0,
      buttons: options.buttons ?? 0,
      ctrlKey: Boolean(options.ctrlKey),
      altKey: Boolean(options.altKey),
      shiftKey: Boolean(options.shiftKey),
      metaKey: Boolean(options.metaKey)
    });
    Object.defineProperty(event, '__miorningSynthetic', { value: true });
    target.dispatchEvent(event);
    return event;
  };

  const clickAt = (target, x, y) => {
    syntheticGuard++;
    try {
      dispatchPointer(target, 'pointerdown', { clientX: x, clientY: y, button: 0, buttons: 1 });
      dispatchMouse(target, 'mousedown', { clientX: x, clientY: y, button: 0, buttons: 1 });
      dispatchPointer(target, 'pointerup', { clientX: x, clientY: y, button: 0, buttons: 0 });
      dispatchMouse(target, 'mouseup', { clientX: x, clientY: y, button: 0, buttons: 0 });
      dispatchMouse(target, 'click', { clientX: x, clientY: y, button: 0, buttons: 0 });
    } finally {
      syntheticGuard--;
    }
  };

  const findBlankPoint = (canvas, preferred = null) => {
    const rect = canvas.getBoundingClientRect();
    const points = [];
    if (preferred) {
      points.push(preferred);
      for (const radius of [20, 36, 56, 80, 120]) {
        for (const [dx, dy] of [[radius, 0], [-radius, 0], [0, radius], [0, -radius], [radius, radius], [-radius, radius], [radius, -radius], [-radius, -radius]]) {
          points.push({ x: preferred.x + dx, y: preferred.y + dy });
        }
      }
    }
    const xs = [0.5, 0.25, 0.75, 0.12, 0.88];
    const ys = [0.5, 0.25, 0.75, 0.15, 0.85];
    for (const y of ys) {
      for (const x of xs) points.push({ x: rect.left + rect.width * x, y: rect.top + rect.height * y });
    }

    for (const point of points) {
      if (point.x < rect.left + 8 || point.x > rect.right - 8 || point.y < rect.top + 8 || point.y > rect.bottom - 8) continue;
      const element = document.elementFromPoint(point.x, point.y);
      if (!element || findNode(element)) continue;
      if (findCanvas(element) || canvas.contains(element)) return { ...point, target: element };
    }

    return {
      x: rect.left + Math.min(80, rect.width / 2),
      y: rect.top + Math.min(80, rect.height / 2),
      target: canvas
    };
  };

  const tryCanvasDrag = async (canvas, node, dx, dy, mode) => {
    const before = centerOf(node);
    const canvasRect = canvas.getBoundingClientRect();
    const preferred = {
      x: canvasRect.left + canvasRect.width / 2 - dx / 2,
      y: canvasRect.top + canvasRect.height / 2 - dy / 2
    };
    const start = findBlankPoint(canvas, preferred);
    const end = { x: start.x + dx, y: start.y + dy };
    const pointerId = mode === 'middle' ? 9631 : 9632;
    const button = mode === 'middle' ? 1 : 2;
    const buttons = mode === 'middle' ? 4 : 2;
    const blockContext = (event) => event.preventDefault();

    if (mode === 'right') window.addEventListener('contextmenu', blockContext, true);
    syntheticGuard++;
    try {
      dispatchPointer(start.target, 'pointerdown', { clientX: start.x, clientY: start.y, pointerId, button, buttons });
      dispatchMouse(start.target, 'mousedown', { clientX: start.x, clientY: start.y, button, buttons });
      for (let i = 1; i <= 8; i++) {
        const x = start.x + dx * (i / 8);
        const y = start.y + dy * (i / 8);
        const target = document.elementFromPoint(
          Math.max(1, Math.min(window.innerWidth - 1, x)),
          Math.max(1, Math.min(window.innerHeight - 1, y))
        ) || document;
        dispatchPointer(target, 'pointermove', { clientX: x, clientY: y, pointerId, button, buttons });
        dispatchMouse(target, 'mousemove', { clientX: x, clientY: y, button, buttons });
        dispatchPointer(document, 'pointermove', { clientX: x, clientY: y, pointerId, button, buttons });
      }
      dispatchPointer(document, 'pointerup', { clientX: end.x, clientY: end.y, pointerId, button, buttons: 0 });
      dispatchMouse(document, 'mouseup', { clientX: end.x, clientY: end.y, button, buttons: 0 });
    } finally {
      syntheticGuard--;
      if (mode === 'right') {
        setTimeout(() => window.removeEventListener('contextmenu', blockContext, true), 80);
      }
    }
    await sleep(90);
    const after = centerOf(node);
    const movement = Math.hypot(after.x - before.x, after.y - before.y);
    debug('Focus pan attempt', { mode, requested: { dx, dy }, actual: { dx: after.x - before.x, dy: after.y - before.y }, movement });
    return movement;
  };

  const findTransformViewport = (node, canvas) => {
    let current = node.parentElement;
    const candidates = [];
    while (current && current !== document.body) {
      const style = getComputedStyle(current);
      const transform = style.transform;
      if (transform && transform !== 'none') {
        let score = 0;
        const cls = String(current.className?.baseVal || current.className || '');
        if (/viewport|transform|pane|graph|canvas|content|layer/i.test(cls)) score += 40;
        const descendants = getNodes().filter((item) => current.contains(item)).length;
        if (descendants >= 2) score += 80;
        if (canvas && (current === canvas || canvas.contains(current) || current.contains(canvas))) score += 20;
        const rect = current.getBoundingClientRect();
        if (rect.width > window.innerWidth * 0.5 && rect.height > window.innerHeight * 0.5) score += 20;
        candidates.push({ element: current, transform, score, descendants });
      }
      if (current === canvas) break;
      current = current.parentElement;
    }
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0] || null;
  };

  const shiftTransformViewport = async (node, canvas, dx, dy) => {
    const candidate = findTransformViewport(node, canvas);
    if (!candidate) return false;
    try {
      const matrix = new DOMMatrixReadOnly(candidate.transform);
      const next = `matrix(${matrix.a}, ${matrix.b}, ${matrix.c}, ${matrix.d}, ${matrix.e + dx}, ${matrix.f + dy})`;
      candidate.element.style.setProperty('transform', next, 'important');
      await sleep(70);
      debug('Focus direct transform fallback', { candidate: candidate.element, score: candidate.score, from: candidate.transform, to: next });
      return true;
    } catch (error) {
      debug('Focus direct transform fallback failed', error);
      return false;
    }
  };

  const centerNodeRobust = async (node, canvas) => {
    for (let round = 0; round < 3; round++) {
      const canvasRect = canvas.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      const dx = canvasRect.left + canvasRect.width / 2 - (nodeRect.left + nodeRect.width / 2);
      const dy = canvasRect.top + canvasRect.height / 2 - (nodeRect.top + nodeRect.height / 2);
      const distance = Math.hypot(dx, dy);
      if (distance < 10) return true;

      let movement = await tryCanvasDrag(canvas, node, dx, dy, 'middle');
      if (movement < Math.min(6, distance * 0.08)) movement = await tryCanvasDrag(canvas, node, dx, dy, 'right');
      if (movement < Math.min(6, distance * 0.08)) await shiftTransformViewport(node, canvas, dx, dy);
      await sleep(60);
    }

    const canvasRect = canvas.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    return Math.hypot(
      nodeRect.left + nodeRect.width / 2 - (canvasRect.left + canvasRect.width / 2),
      nodeRect.top + nodeRect.height / 2 - (canvasRect.top + canvasRect.height / 2)
    ) < 40;
  };

  const setNativeZoomToMax = async (canvas, node) => {
    const canvasRect = canvas.getBoundingClientRect();
    const controls = [...document.querySelectorAll('input[type="range"], [role="slider"]')].filter((element) => {
      if (!isVisible(element) || element.closest(NODE_SELECTORS.join(','))) return false;
      const rect = element.getBoundingClientRect();
      return rect.width >= 40 && rect.width <= 360 && rect.bottom > canvasRect.top + canvasRect.height * 0.55;
    });
    if (!controls.length) return false;

    controls.sort((a, b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom);
    const control = controls[0];
    const before = node.getBoundingClientRect().width;

    if (control instanceof HTMLInputElement) {
      const max = control.max || '100';
      const oldValue = control.value;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      if (setter) setter.call(control, max);
      else control.value = max;
      if (control._valueTracker) control._valueTracker.setValue(oldValue);
      control.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      control.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    } else {
      const rect = control.getBoundingClientRect();
      clickAt(control, rect.right - 3, rect.top + rect.height / 2);
    }

    await sleep(150);
    const after = node.getBoundingClientRect().width;
    debug('Focus zoom control attempt', { control, before, after });
    return after > before * 1.03;
  };

  const zoomWithCtrlWheelAtNode = async (canvas, node) => {
    for (let i = 0; i < 28; i++) {
      const point = centerOf(node);
      const x = Math.max(2, Math.min(window.innerWidth - 2, point.x));
      const y = Math.max(2, Math.min(window.innerHeight - 2, point.y));
      const target = document.elementFromPoint(x, y) || canvas;
      const event = new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        composed: true,
        view: window,
        clientX: x,
        clientY: y,
        screenX: x,
        screenY: y,
        deltaY: -260,
        deltaX: 0,
        deltaMode: WheelEvent.DOM_DELTA_PIXEL,
        ctrlKey: true
      });
      Object.defineProperty(event, '__miorningSynthetic', { value: true });
      syntheticGuard++;
      try {
        target.dispatchEvent(event);
      } finally {
        syntheticGuard--;
      }
      await sleep(14);
    }
  };

  const focusSelectedNode = async () => {
    // 完全恢复 v0.3.1 的已验证聚焦路径，只增加“必须且只能选中一个节点”。
    // 不再用 lastNodeId 兜底，避免误取同 ID 的内部辅助层或上一次节点。
    const selectedById = new Map();
    for (const candidate of getSelectedNodes()) {
      const id = getNodeId(candidate);
      if (!id) continue;
      const rect = candidate.getBoundingClientRect();
      const area = Math.max(1, rect.width * rect.height);
      const current = selectedById.get(id);
      if (!current || area > current.area) selectedById.set(id, { node: candidate, area });
    }
    const selected = [...selectedById.values()].map((item) => item.node);
    if (selected.length !== 1) {
      toast(selected.length > 1 ? 'F 聚焦仅对单个节点生效。' : '请先左键选中一个节点，再按 F。', 'warning', 3000);
      return;
    }
    const node = selected[0];

    const canvas = findCanvas(node);
    if (!canvas) {
      toast('没有识别到 ShotLab 画布。', 'error');
      return;
    }

    const before = { node: centerOf(node), canvas: centerOf(canvas) };
    debug('Focus selected node start', { id: getNodeId(node), before });

    await centerNodeRobust(node, canvas);
    const zoomedByControl = await setNativeZoomToMax(canvas, node);
    if (!zoomedByControl) await zoomWithCtrlWheelAtNode(canvas, node);
    await sleep(110);
    const centered = await centerNodeRobust(node, canvas);

    const canvasRect = canvas.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const distance = Math.hypot(
      nodeRect.left + nodeRect.width / 2 - (canvasRect.left + canvasRect.width / 2),
      nodeRect.top + nodeRect.height / 2 - (canvasRect.top + canvasRect.height / 2)
    );
    debug('Focus selected node completed', {
      id: getNodeId(node), zoomedByControl, centered, distance, nodeRect, canvasRect
    });

    if (distance > 70) {
      toast('节点已放大，但居中存在偏差。请展开最新 Focus 日志。', 'warning', 4800);
    }
  };





  const getFlowBoundsFromStore = (state) => {
    if (!Array.isArray(state?.nodes)) return null;
    const expectedCount = state.nodes.filter((node) => node && !node.hidden).length;
    const lookup = state.nodeLookup instanceof Map
      ? state.nodeLookup
      : (state.nodeInternals instanceof Map ? state.nodeInternals : null);
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    let count = 0;

    for (const node of state.nodes) {
      if (!node || node.hidden) continue;
      const internal = lookup?.get(node.id);
      const absolute = internal?.internals?.positionAbsolute || internal?.positionAbsolute || node.positionAbsolute || node.position;
      const width = Number(internal?.measured?.width ?? internal?.width ?? node.measured?.width ?? node.width);
      const height = Number(internal?.measured?.height ?? internal?.height ?? node.measured?.height ?? node.height);
      if (!absolute || !Number.isFinite(absolute.x) || !Number.isFinite(absolute.y) || !Number.isFinite(width) || !Number.isFinite(height)) continue;
      const x = absolute.x;
      const y = absolute.y;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x + width);
      bottom = Math.max(bottom, y + height);
      count++;
    }

    if (!count || count !== expectedCount || !Number.isFinite(left + top + right + bottom)) return null;
    return { left, top, right, bottom, width: Math.max(1, right - left), height: Math.max(1, bottom - top), count };
  };

  const getFlowBoundsFromDom = (root, viewport) => {
    if (!root || !viewport) return null;
    const rootRect = root.getBoundingClientRect();
    let matrix;
    try {
      matrix = new DOMMatrixReadOnly(getComputedStyle(viewport).transform);
    } catch (_) {
      return null;
    }
    const zoom = Number(matrix.a);
    if (!Number.isFinite(zoom) || zoom <= 0) return null;

    const nodes = getNodes().filter((node) => root.contains(node));
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    let count = 0;
    for (const node of nodes) {
      const rect = node.getBoundingClientRect();
      const x = (rect.left - rootRect.left - matrix.e) / zoom;
      const y = (rect.top - rootRect.top - matrix.f) / zoom;
      const width = rect.width / zoom;
      const height = rect.height / zoom;
      if (![x, y, width, height].every(Number.isFinite)) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x + width);
      bottom = Math.max(bottom, y + height);
      count++;
    }
    if (!count || !Number.isFinite(left + top + right + bottom)) return null;
    return { left, top, right, bottom, width: Math.max(1, right - left), height: Math.max(1, bottom - top), count };
  };

  const setFlowViewport = async (store, viewport, duration = 180) => {
    const state = store?.getState?.();
    const target = { x: viewport.x, y: viewport.y, zoom: viewport.zoom };
    if (typeof state?.setViewport === 'function') {
      await state.setViewport(target, { duration });
    } else if (typeof state?.panZoom?.setViewport === 'function') {
      await state.panZoom.setViewport(target, { duration });
    } else {
      store.setState({ transform: [target.x, target.y, target.zoom] });
    }

    const latest = store.getState?.();
    const transform = Array.isArray(latest?.transform) ? latest.transform : [];
    if (Math.hypot(Number(transform[0]) - target.x, Number(transform[1]) - target.y) > 1 || Math.abs(Number(transform[2]) - target.zoom) > 0.002) {
      store.setState({ transform: [target.x, target.y, target.zoom] });
    }
  };

  const fitCanvasToAllNodes = async () => {
    const centerTarget = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    const canvas = findCanvas(centerTarget) || findCanvas();
    const root = canvas?.closest?.('.react-flow, .vue-flow') || (canvas?.matches?.('.react-flow, .vue-flow') ? canvas : null);
    const viewport = root?.querySelector?.('.react-flow__viewport, .vue-flow__viewport');
    const store = findReactFlowStore(getNodes().find((node) => root?.contains(node)) || null);
    if (!canvas || !root || !viewport || !store) {
      toast('没有识别到可适应的 ShotLab 画布。', 'error');
      return;
    }

    const state = store.getState();
    const bounds = getFlowBoundsFromStore(state) || getFlowBoundsFromDom(root, viewport);
    if (!bounds) {
      toast('当前画布中没有可适应的节点。', 'warning', 3000);
      return;
    }

    const rootRect = root.getBoundingClientRect();
    const padding = Math.max(46, Math.min(92, Math.min(rootRect.width, rootRect.height) * 0.085));
    const availableWidth = Math.max(80, rootRect.width - padding * 2);
    const availableHeight = Math.max(80, rootRect.height - padding * 2);
    const minZoom = Number.isFinite(Number(state.minZoom)) ? Number(state.minZoom) : 0.1;
    const maxZoom = Number.isFinite(Number(state.maxZoom)) ? Number(state.maxZoom) : 2;
    const zoom = Math.max(minZoom, Math.min(maxZoom, Math.min(availableWidth / bounds.width, availableHeight / bounds.height)));
    const centerX = (bounds.left + bounds.right) / 2;
    const centerY = (bounds.top + bounds.bottom) / 2;
    const target = {
      x: rootRect.width / 2 - centerX * zoom,
      y: rootRect.height / 2 - centerY * zoom,
      zoom
    };

    await setFlowViewport(store, target, 180);
    await sleep(210);
    debug('Fit canvas completed', { bounds, target, rootRect });
  };

  const getDistinctSelectedNodes = () => {
    const byId = new Map();
    for (const node of getSelectedNodes()) {
      const id = getNodeId(node);
      if (!id) continue;
      const rect = node.getBoundingClientRect();
      const area = Math.max(1, rect.width * rect.height);
      const current = byId.get(id);
      if (!current || area > current.area) byId.set(id, { node, area });
    }
    return [...byId.values()].map((item) => item.node);
  };

  const findNativeActionButton = (label, includeHidden = false) => {
    return [...document.querySelectorAll('button, [role="button"]')].find((button) => {
      if (!includeHidden && !isVisible(button)) return false;
      if (includeHidden) {
        const rect = button.getBoundingClientRect();
        if (rect.width <= 1 || rect.height <= 1) return false;
      }
      return String(button.textContent || '').replace(/\s+/g, ' ').trim() === label;
    }) || null;
  };

  const waitForNativeActionButton = async (label, timeout = 700, includeHidden = false) => {
    const started = performance.now();
    while (performance.now() - started < timeout) {
      const button = findNativeActionButton(label, includeHidden);
      if (button) return button;
      await sleep(35);
    }
    return null;
  };

  const findReactEventHandler = (element, propName, maxDepth = 4) => {
    let current = element;
    for (let depth = 0; current && depth < maxDepth; depth++, current = current.parentElement) {
      for (const key of Object.getOwnPropertyNames(current)) {
        if (key.startsWith('__reactProps$') || key.startsWith('__reactEventHandlers$')) {
          const handler = current[key]?.[propName];
          if (typeof handler === 'function') return { handler, current };
        }
        if (key.startsWith('__reactFiber$')) {
          let fiber = current[key];
          for (let hop = 0; fiber && hop < 5; hop++, fiber = fiber.return) {
            const handler = fiber.memoizedProps?.[propName] || fiber.pendingProps?.[propName];
            if (typeof handler === 'function') return { handler, current };
          }
        }
      }
    }
    return null;
  };

  const findReactClickHandler = (button) => findReactEventHandler(button, 'onClick', 4);

  const activateNativeActionButton = (button, sourceEvent) => {
    const react = findReactClickHandler(button);
    if (react) {
      const event = {
        nativeEvent: sourceEvent,
        target: button,
        currentTarget: react.current,
        type: 'click',
        button: 0,
        buttons: 0,
        defaultPrevented: false,
        preventDefault() { this.defaultPrevented = true; sourceEvent?.preventDefault?.(); },
        stopPropagation() { sourceEvent?.stopPropagation?.(); },
        isDefaultPrevented() { return this.defaultPrevented; },
        isPropagationStopped() { return false; },
        persist() {}
      };
      react.handler(event);
      return 'react-handler';
    }

    try { button.focus({ preventScroll: true }); } catch (_) {}
    button.click();
    return 'dom-click';
  };

  const countGroupNodes = () => {
    const groups = queryAllUnique([
      '.react-flow__node-group',
      '.vue-flow__node-group',
      '[data-id^="group_"][class*="flow__node"]'
    ]);
    return groups.filter(isVisible).length;
  };

  const groupSelectedNodes = async (sourceEvent) => {
    const selected = getDistinctSelectedNodes();
    if (selected.length < 2) {
      toast('请先选中两个或以上节点，再按 G 打组。', 'warning', 3200);
      return;
    }

    const button = await waitForNativeActionButton('创建组');
    if (!button) {
      toast('没有找到 ShotLab 原生“创建组”按钮。', 'error', 4200);
      return;
    }

    const before = countGroupNodes();
    const mode = activateNativeActionButton(button, sourceEvent);
    await sleep(220);
    debug('Group selected nodes invoked', { mode, selected: selected.map(getNodeId), before, after: countGroupNodes() });
  };

  const ungroupSelectedNodes = async (sourceEvent) => {
    const button = await waitForNativeActionButton('解组');
    if (!button) {
      toast('请先选中分组边框，再按 Alt + G 解组。', 'warning', 3400);
      return;
    }

    const before = countGroupNodes();
    const mode = activateNativeActionButton(button, sourceEvent);
    await sleep(220);
    debug('Ungroup selected group invoked', { mode, before, after: countGroupNodes() });
  };

  const nextAnimationFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

  const rectContainsPoint = (rect, point) => {
    return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
  };

  const findCanvasAtPoint = (point) => {
    const stack = typeof document.elementsFromPoint === 'function'
      ? document.elementsFromPoint(point.x, point.y)
      : [document.elementFromPoint(point.x, point.y)].filter(Boolean);

    for (const element of stack) {
      const canvas = findCanvas(element);
      if (!canvas || !isVisible(canvas)) continue;
      if (rectContainsPoint(canvas.getBoundingClientRect(), point)) return canvas;
    }

    const candidates = queryAllUnique(CANVAS_SELECTORS)
      .filter(isVisible)
      .filter((item) => rectContainsPoint(item.getBoundingClientRect(), point))
      .sort((a, b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return (ar.width * ar.height) - (br.width * br.height);
      });
    return candidates[0] || findCanvas();
  };

  const captureFlowTarget = (point, canvas) => {
    const screen = { x: point.x, y: point.y };
    const root = canvas?.closest?.('.react-flow, .vue-flow') ||
      (canvas?.matches?.('.react-flow, .vue-flow') ? canvas : null);
    const viewport = root?.querySelector?.('.react-flow__viewport, .vue-flow__viewport');
    if (!root || !viewport) return { screen, flow: null, zoom: 1 };

    try {
      const rootRect = root.getBoundingClientRect();
      const matrix = new DOMMatrixReadOnly(getComputedStyle(viewport).transform);
      const zoom = Number(matrix.a) > 0 ? Number(matrix.a) : 1;
      return {
        screen,
        flow: {
          x: (point.x - rootRect.left - matrix.e) / zoom,
          y: (point.y - rootRect.top - matrix.f) / zoom
        },
        zoom
      };
    } catch (_) {
      return { screen, flow: null, zoom: 1 };
    }
  };

  const snapshotCanvasElements = () => {
    const nodes = queryAllUnique(NODE_SELECTORS).filter((node) => !node.hasAttribute('data-miorning-alt-copy-preview'));
    const edges = queryAllUnique(['.react-flow__edge', '.vue-flow__edge']);
    return {
      nodeElements: new Set(nodes),
      nodeIds: new Set(nodes.map(getNodeId).filter(Boolean)),
      edgeElements: new Set(edges),
      edgeIds: new Set(edges.map((edge) => edge.getAttribute('data-id') || edge.id).filter(Boolean))
    };
  };

  const getFreshNodes = (snapshot) => {
    return queryAllUnique(NODE_SELECTORS).filter((node) => {
      if (node.hasAttribute('data-miorning-alt-copy-preview') || !node.isConnected) return false;
      if (!snapshot.nodeElements.has(node)) return true;
      const id = getNodeId(node);
      return Boolean(id && !snapshot.nodeIds.has(id));
    });
  };

  const getFreshOuterNodes = (snapshot) => {
    const fresh = getFreshNodes(snapshot);
    const outer = fresh.filter((candidate) => !fresh.some((other) => other !== candidate && other.contains(candidate)));
    return outer.length ? outer : fresh;
  };

  const isReactFlowStore = (value) => {
    if (!value || (typeof value !== 'object' && typeof value !== 'function')) return false;
    if (typeof value.getState !== 'function' || typeof value.setState !== 'function') return false;
    try {
      const state = value.getState();
      return Boolean(state && (
        Array.isArray(state.nodes) ||
        state.nodeLookup instanceof Map ||
        state.nodeInternals instanceof Map
      ));
    } catch (_) {
      return false;
    }
  };

  const reactFlowStoreCache = new WeakMap();

  function findStoreInValue(value, depth, visited) {
    if (!value || depth < 0 || (typeof value !== 'object' && typeof value !== 'function')) return null;
    if (visited.has(value)) return null;
    visited.add(value);
    if (isReactFlowStore(value)) return value;

    let keys = [];
    try {
      keys = Object.keys(value).slice(0, 80);
    } catch (_) {
      return null;
    }

    const preferred = [
      'value', 'store', 'storeApi', 'api', 'memoizedValue', 'memoizedState',
      'next', 'queue', 'baseState', 'dependencies', 'firstContext'
    ];
    const interesting = keys.filter((key) => /store|api|value|context|memoized|state|next|queue/i.test(key));
    const ordered = [...new Set([...preferred, ...interesting, ...keys.slice(0, depth > 2 ? 16 : 6)])];
    for (const key of ordered) {
      let child;
      try {
        child = value[key];
      } catch (_) {
        continue;
      }
      const store = findStoreInValue(child, depth - 1, visited);
      if (store) return store;
    }
    return null;
  }

  const findReactFlowStore = (node) => {
    const flowRoot = node?.closest?.('.react-flow, .vue-flow');
    const cached = flowRoot ? reactFlowStoreCache.get(flowRoot) : null;
    if (cached && isReactFlowStore(cached)) return cached;
    const remember = (store) => {
      if (store && flowRoot) reactFlowStoreCache.set(flowRoot, store);
      return store;
    };

    const elements = [];
    let element = node;
    while (element && elements.length < 12) {
      elements.push(element);
      element = element.parentElement;
    }

    const fibers = [];
    for (const item of elements) {
      for (const key of Object.getOwnPropertyNames(item)) {
        if ((key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')) && item[key]) {
          fibers.push(item[key]);
        }
        if ((key.startsWith('__reactProps$') || key.startsWith('__reactEventHandlers$')) && item[key]) {
          const propsStore = findStoreInValue(item[key], 3, new Set());
          if (propsStore) return remember(propsStore);
        }
      }
    }

    const queue = fibers.slice();
    const visited = new Set();
    const scannedValues = new Set();
    while (queue.length && visited.size < 1800) {
      const fiber = queue.shift();
      if (!fiber || visited.has(fiber)) continue;
      visited.add(fiber);

      const sources = [
        fiber.dependencies?.firstContext?.memoizedValue,
        fiber.memoizedProps,
        fiber.pendingProps,
        fiber.memoizedState,
        fiber.stateNode
      ];
      for (const source of sources) {
        const store = findStoreInValue(source, 4, scannedValues);
        if (store) return remember(store);
      }

      if (fiber.return) queue.push(fiber.return);
      if (fiber.child) queue.push(fiber.child);
      if (fiber.sibling) queue.push(fiber.sibling);
    }
    return null;
  };

  const getDesiredNodePosition = (node, target, state) => {
    const id = getNodeId(node);
    const index = state.nodes.findIndex((item) => String(item?.id) === String(id));
    if (index < 0) return null;

    const source = state.nodes[index];
    const currentPosition = source?.position;
    if (!currentPosition || !Number.isFinite(currentPosition.x) || !Number.isFinite(currentPosition.y)) return null;

    const transform = Array.isArray(state.transform) ? state.transform : null;
    let zoom = Number(transform?.[2]);
    if (!Number.isFinite(zoom) || zoom <= 0) {
      const viewport = node.closest('.react-flow, .vue-flow')?.querySelector('.react-flow__viewport, .vue-flow__viewport');
      try {
        zoom = new DOMMatrixReadOnly(getComputedStyle(viewport).transform).a;
      } catch (_) {
        zoom = 1;
      }
    }
    if (!Number.isFinite(zoom) || zoom <= 0) zoom = 1;

    if (target?.flow && Number.isFinite(target.flow.x) && Number.isFinite(target.flow.y)) {
      const lookup = state.nodeLookup instanceof Map ? state.nodeLookup :
        (state.nodeInternals instanceof Map ? state.nodeInternals : null);
      const internal = lookup?.get(id);
      const rect = node.getBoundingClientRect();
      const width = Number(internal?.measured?.width ?? internal?.width) || rect.width / zoom;
      const height = Number(internal?.measured?.height ?? internal?.height) || rect.height / zoom;
      const origin = Array.isArray(source.origin) ? source.origin :
        (Array.isArray(internal?.internals?.userNode?.origin) ? internal.internals.userNode.origin : [0, 0]);
      const parentId = source.parentId || source.parentNode;
      const parentInternal = parentId ? lookup?.get(parentId) : null;
      const parentAbsolute = parentInternal?.internals?.positionAbsolute || parentInternal?.positionAbsolute || { x: 0, y: 0 };
      return {
        index,
        source,
        position: {
          x: target.flow.x - Number(parentAbsolute.x || 0) - width * (0.5 - Number(origin[0] || 0)),
          y: target.flow.y - Number(parentAbsolute.y || 0) - height * (0.5 - Number(origin[1] || 0))
        }
      };
    }

    const point = target?.screen || target;
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return null;
    const current = centerOf(node);
    return {
      index,
      source,
      position: {
        x: currentPosition.x + (point.x - current.x) / zoom,
        y: currentPosition.y + (point.y - current.y) / zoom
      }
    };
  };

  const createNativeCopyViewportTransaction = (node, target) => {
    if (!target?.flow || !Number.isFinite(target.flow.x) || !Number.isFinite(target.flow.y)) return null;
    const store = findReactFlowStore(node);
    const root = node?.closest?.('.react-flow, .vue-flow');
    const state = store?.getState?.();
    const original = Array.isArray(state?.transform) ? state.transform.slice(0, 3).map(Number) : null;
    if (!store || !root || !original || original.length < 3 || !original.every(Number.isFinite) || original[2] <= 0) return null;

    const rect = root.getBoundingClientRect();
    const zoom = original[2];
    return {
      store,
      original,
      temporary: [
        rect.width / 2 - target.flow.x * zoom,
        rect.height / 2 - target.flow.y * zoom,
        zoom
      ]
    };
  };

  const invokeNativeCopyAtTarget = (button, session, target) => {
    const transaction = createNativeCopyViewportTransaction(session.source, target);
    if (!transaction) return { mode: activateNativeActionButton(button, session.sourceEvent), transaction: false };

    // ShotLab 原生“复制节点”始终把副本中心放在当前视口中心。
    // 只在同一个同步任务内临时改写 React Flow 坐标换算，复制完成即还原。
    // 画布不产生可见位移，节点的初始位置直接就是落点，因此撤销栈中只有“复制”一步。
    transaction.store.setState({ transform: transaction.temporary });
    let mode;
    try {
      mode = activateNativeActionButton(button, session.sourceEvent);
    } finally {
      transaction.store.setState({ transform: transaction.original });
    }
    return { mode, transaction: true };
  };

  const commitNodePosition = async (node, target) => {
    const id = getNodeId(node);
    const store = findReactFlowStore(node);
    if (!id || !store) return false;

    for (let attempt = 0; attempt < 2; attempt++) {
      const state = store.getState();
      if (!Array.isArray(state?.nodes)) return false;
      const desired = getDesiredNodePosition(node, target, state);
      if (!desired) return false;

      const nextNodes = state.nodes.slice();
      nextNodes[desired.index] = { ...desired.source, position: desired.position, dragging: false };
      if (typeof state.setNodes === 'function') state.setNodes(nextNodes);
      else store.setState({ nodes: nextNodes });

      await nextAnimationFrame();
      await sleep(35);
      const finalNode = store.getState()?.nodes?.find((item) => String(item?.id) === String(id));
      const error = finalNode?.position
        ? Math.hypot(finalNode.position.x - desired.position.x, finalNode.position.y - desired.position.y)
        : Infinity;
      debug('Alt duplicate untracked fallback placement', { id, attempt, error, position: desired.position });
      if (error <= 0.75) return true;
    }
    return false;
  };

  const createAltDuplicatePreview = (node, startPoint) => {
    const rect = node.getBoundingClientRect();
    const nativeWidth = Math.max(1, Number(node.offsetWidth) || rect.width);
    const nativeHeight = Math.max(1, Number(node.offsetHeight) || rect.height);
    const scaleX = rect.width / nativeWidth;
    const scaleY = rect.height / nativeHeight;
    const preview = document.createElement('div');
    const clone = node.cloneNode(true);

    clone.removeAttribute('data-id');
    clone.removeAttribute('data-node-id');
    clone.removeAttribute('aria-selected');
    clone.classList.remove('selected', 'dragging');
    clone.querySelectorAll('.selected, .dragging').forEach((element) => element.classList.remove('selected', 'dragging'));
    clone.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
    clone.querySelectorAll('input, textarea, select, button, [contenteditable]').forEach((element) => {
      element.setAttribute('tabindex', '-1');
      element.setAttribute('aria-hidden', 'true');
    });

    preview.setAttribute('data-miorning-alt-copy-preview', '1');
    preview.style.setProperty('position', 'fixed', 'important');
    preview.style.setProperty('left', `${rect.left}px`, 'important');
    preview.style.setProperty('top', `${rect.top}px`, 'important');
    preview.style.setProperty('width', `${rect.width}px`, 'important');
    preview.style.setProperty('height', `${rect.height}px`, 'important');
    preview.style.setProperty('transform', 'none', 'important');
    preview.style.setProperty('overflow', 'visible', 'important');
    preview.style.setProperty('margin', '0', 'important');
    preview.style.setProperty('z-index', '2147483645', 'important');
    preview.style.setProperty('pointer-events', 'none', 'important');
    preview.style.setProperty('opacity', '0', 'important');
    preview.style.setProperty('transition', 'opacity 70ms ease', 'important');

    clone.style.setProperty('position', 'absolute', 'important');
    clone.style.setProperty('left', '0', 'important');
    clone.style.setProperty('top', '0', 'important');
    clone.style.setProperty('width', `${nativeWidth}px`, 'important');
    clone.style.setProperty('height', `${nativeHeight}px`, 'important');
    clone.style.setProperty('margin', '0', 'important');
    clone.style.setProperty('transform', `scale(${scaleX}, ${scaleY})`, 'important');
    clone.style.setProperty('transform-origin', 'left top', 'important');
    preview.appendChild(clone);
    document.documentElement.appendChild(preview);
    return { preview, rect, startPoint };
  };

  const updateAltDuplicatePreview = (session, point) => {
    const dx = point.x - session.startPoint.x;
    const dy = point.y - session.startPoint.y;
    const left = session.sourceRect.left + dx;
    const top = session.sourceRect.top + dy;
    session.preview.style.setProperty('left', `${left}px`, 'important');
    session.preview.style.setProperty('top', `${top}px`, 'important');
    session.targetCenter = {
      x: left + session.sourceRect.width / 2,
      y: top + session.sourceRect.height / 2
    };
    if (!session.dragged && Math.hypot(dx, dy) >= 4) {
      session.dragged = true;
      session.preview.style.setProperty('opacity', '0.88', 'important');
    }
  };

  const removeAltDuplicatePreview = (session) => {
    try { session?.preview?.remove(); } catch (_) {}
  };

  const createAltCopyVisualGuard = (snapshot) => {
    const marked = new Set();
    let menuRoot = null;

    const markElement = (element) => {
      if (!(element instanceof Element) || marked.has(element)) return;
      element.setAttribute('data-miorning-alt-copy-hidden', '1');
      marked.add(element);
    };

    const scan = () => {
      for (const node of getFreshNodes(snapshot)) markElement(node);
      for (const edge of queryAllUnique(['.react-flow__edge', '.vue-flow__edge'])) {
        const id = edge.getAttribute('data-id') || edge.id;
        if (!snapshot.edgeElements.has(edge) || (id && !snapshot.edgeIds.has(id))) markElement(edge);
      }
      const copyButton = findNativeActionButton('复制节点');
      if (copyButton) {
        let current = copyButton;
        for (let depth = 0; current && depth < 7; depth++, current = current.parentElement) {
          const text = String(current.textContent || '').replace(/\s+/g, ' ').trim();
          if (text.includes('节点操作') && text.includes('复制节点') && text.includes('删除')) {
            menuRoot = current;
            menuRoot.setAttribute('data-miorning-alt-copy-menu', '1');
            break;
          }
        }
      }
    };

    const observer = new MutationObserver(scan);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    scan();
    return {
      scan,
      reveal() {
        observer.disconnect();
        for (const element of marked) element.removeAttribute('data-miorning-alt-copy-hidden');
      },
      closeMenu() {
        const escape = new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          composed: true,
          key: 'Escape',
          code: 'Escape'
        });
        Object.defineProperty(escape, '__miorningSynthetic', { value: true });
        document.dispatchEvent(escape);
        if (menuRoot?.isConnected) {
          menuRoot.setAttribute('data-miorning-alt-copy-menu', '1');
        }
      }
    };
  };

  const openNativeNodeMenu = async (node, sourceEvent) => {
    const point = centerOf(node);
    syntheticGuard++;
    try {
      dispatchMouse(node, 'contextmenu', {
        clientX: point.x,
        clientY: point.y,
        button: 2,
        buttons: 0
      });
    } finally {
      syntheticGuard--;
    }

    let button = await waitForNativeActionButton('复制节点', 360, true);
    if (button) return button;

    const react = findReactEventHandler(node, 'onContextMenu', 10);
    if (react) {
      react.handler({
        nativeEvent: sourceEvent,
        target: node,
        currentTarget: react.current,
        type: 'contextmenu',
        button: 2,
        buttons: 0,
        clientX: point.x,
        clientY: point.y,
        preventDefault() {},
        stopPropagation() {},
        persist() {}
      });
      button = await waitForNativeActionButton('复制节点', 420, true);
    }
    return button;
  };

  const waitForFreshClone = async (snapshot, timeout = 1500) => {
    const started = performance.now();
    while (performance.now() - started < timeout) {
      const fresh = getFreshOuterNodes(snapshot);
      if (fresh.length) {
        const selected = fresh.find(isSelectedNode);
        if (selected) return selected;
        return [...fresh].sort((a, b) => {
          const ar = a.getBoundingClientRect();
          const br = b.getBoundingClientRect();
          return (br.width * br.height) - (ar.width * ar.height);
        })[0];
      }
      await nextAnimationFrame();
    }
    return null;
  };

  const duplicateNodeNatively = async (session, target, snapshot, visualGuard) => {
    const button = await openNativeNodeMenu(session.source, session.sourceEvent);
    if (!button) return null;
    visualGuard.scan();
    const invoked = invokeNativeCopyAtTarget(button, session, target);
    const clone = await waitForFreshClone(snapshot);
    visualGuard.scan();
    debug('Alt native duplicate invoked', { ...invoked, source: getNodeId(session.source), clone: getNodeId(clone) });
    return { clone, ...invoked };
  };

  const cancelAltDuplicateSession = (reason = 'cancelled') => {
    const session = altDuplicateSession;
    if (!session || session.finalizing) return;
    altDuplicateSession = null;
    altMouseGuardUntil = performance.now() + 120;
    document.documentElement.removeAttribute('data-miorning-alt-copy-active');
    removeAltDuplicatePreview(session);
    debug('Alt duplicate session cancelled', { reason });
  };

  const finishAltDuplicateSession = async (sourceEvent) => {
    const session = altDuplicateSession;
    if (!session || session.finalizing) return;
    session.finalizing = true;
    altMouseGuardUntil = performance.now() + 260;

    if (!session.dragged) {
      altDuplicateSession = null;
      document.documentElement.removeAttribute('data-miorning-alt-copy-active');
      removeAltDuplicatePreview(session);
      return;
    }

    altDuplicateBusy = true;
    const canvas = findCanvasAtPoint(session.targetCenter) || findCanvas(session.source);
    const target = captureFlowTarget(session.targetCenter, canvas);
    const snapshot = snapshotCanvasElements();
    const visualGuard = createAltCopyVisualGuard(snapshot);
    let clone = null;
    let placed = false;

    try {
      const nativeResult = await duplicateNodeNatively(session, target, snapshot, visualGuard);
      clone = nativeResult?.clone || null;
      if (!clone) throw new Error('ShotLab 没有生成节点副本');

      await nextAnimationFrame();
      const cloneCenter = centerOf(clone);
      const initialError = Math.hypot(cloneCenter.x - target.screen.x, cloneCenter.y - target.screen.y);
      placed = initialError <= 3;
      if (!placed) placed = await commitNodePosition(clone, target);
      if (!placed) throw new Error('无法写入副本落点');
      await nextAnimationFrame();
      visualGuard.scan();
      await nextAnimationFrame();
      debug('Alt duplicate completed', {
        source: getNodeId(session.source),
        clone: getNodeId(clone),
        target,
        initialError,
        viewportTransaction: Boolean(nativeResult?.transaction),
        placed
      });
    } catch (error) {
      console.error('[MIORNING ShotLab] Alt duplicate failed', error);
      toast(`Alt 拖拽复制失败：${error?.message || '未知错误'}`, 'error', 4600);
    } finally {
      visualGuard.closeMenu();
      requestAnimationFrame(() => {
        visualGuard.reveal();
        removeAltDuplicatePreview(session);
      });
      altDuplicateSession = null;
      altDuplicateBusy = false;
      altMouseGuardUntil = performance.now() + 160;
      document.documentElement.removeAttribute('data-miorning-alt-copy-active');
    }
  };

  const onAltDuplicatePointer = (event) => {
    if (!isShotlabCanvasLocation() || event.__miorningSynthetic || syntheticGuard) return;

    if (event.type === 'pointerdown') {
      const staleMenus = [...document.querySelectorAll('[data-miorning-alt-copy-menu="1"]')];
      if (staleMenus.length) {
        setTimeout(() => staleMenus.forEach((menu) => menu.removeAttribute('data-miorning-alt-copy-menu')), 80);
      }
      if (!config.enabled || !config.altDuplicate || altDuplicateBusy) return;
      if (event.button !== 0 || !event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (isEditable(event.target)) return;
      const source = findNode(event.target);
      if (!source || !isVisible(source)) return;
      const selected = getDistinctSelectedNodes();
      if (selected.length !== 1 || String(getNodeId(selected[0])) !== String(getNodeId(source))) return;

      stopEvent(event);
      const startPoint = { x: event.clientX, y: event.clientY };
      const previewInfo = createAltDuplicatePreview(source, startPoint);
      document.documentElement.setAttribute('data-miorning-alt-copy-active', '1');
      altDuplicateSession = {
        source,
        sourceEvent: event,
        startPoint,
        sourceRect: previewInfo.rect,
        preview: previewInfo.preview,
        targetCenter: centerOf(source),
        dragged: false,
        finalizing: false
      };
      debug('Alt duplicate session started', { source: getNodeId(source), startPoint, sourceRect: previewInfo.rect });
      return;
    }

    const session = altDuplicateSession;
    if (!session) return;
    stopEvent(event);

    if (event.type === 'pointermove') {
      updateAltDuplicatePreview(session, { x: event.clientX, y: event.clientY });
      return;
    }
    if (event.type === 'pointerup') {
      updateAltDuplicatePreview(session, { x: event.clientX, y: event.clientY });
      finishAltDuplicateSession(event).catch((error) => {
        console.error('[MIORNING ShotLab] Alt duplicate finalization failed', error);
        cancelAltDuplicateSession('finalization-error');
      });
      return;
    }
    if (event.type === 'pointercancel') cancelAltDuplicateSession('pointer-cancel');
  };

  const onAltDuplicateMouse = (event) => {
    if (event.__miorningSynthetic || syntheticGuard) return;
    if (altDuplicateSession || performance.now() < altMouseGuardUntil) stopEvent(event);
  };

  const onAltDuplicateDragStart = (event) => {
    if (altDuplicateSession) stopEvent(event);
  };

  const onKeyDown = (event) => {
    if (!isShotlabCanvasLocation()) return;
    if (event.__miorningSynthetic || syntheticGuard || isEditable(event.target)) return;

    const key = String(event.key || '').toLowerCase();
    if (key === 'escape' && altDuplicateSession && !altDuplicateSession.finalizing) {
      stopEvent(event);
      cancelAltDuplicateSession('escape');
      return;
    }
    if (!config.enabled) return;
    if (event.repeat || event.ctrlKey || event.metaKey || event.shiftKey) return;

    if (key === 'f' && event.altKey) {
      if (!config.fitCanvas) return;
      stopEvent(event);
      fitCanvasToAllNodes().catch((error) => {
        console.error('[MIORNING ShotLab] fit canvas failed', error);
        toast(`适应画布失败：${error?.message || '未知错误'}`, 'error', 4800);
      });
      return;
    }

    if (key === 'f' && !event.altKey) {
      if (!config.focusSelected) return;
      stopEvent(event);
      focusSelectedNode().catch((error) => {
        console.error('[MIORNING ShotLab] focus failed', error);
        toast(`聚焦失败：${error?.message || '未知错误'}`, 'error', 4800);
      });
      return;
    }

    if (key === 'g') {
      const actionEnabled = event.altKey ? config.ungroupSelected : config.groupSelected;
      if (!actionEnabled) return;
      stopEvent(event);
      const action = event.altKey ? ungroupSelectedNodes : groupSelectedNodes;
      action(event).catch((error) => {
        console.error('[MIORNING ShotLab] group action failed', error);
        toast(`${event.altKey ? '解组' : '打组'}失败：${error?.message || '未知错误'}`, 'error', 4800);
      });
    }
  };

  const onMessage = (event) => {
    if (event.source !== window || !event.data || event.data.source !== SOURCE_EXT) return;
    if (event.data.type === 'config') {
      config = { ...DEFAULTS, ...(event.data.payload || {}) };
      if ((!config.enabled || !config.altDuplicate) && altDuplicateSession && !altDuplicateSession.finalizing) {
        cancelAltDuplicateSession('disabled');
      }
      debug('Config updated', config);
    }
  };

  onKeyDown.__miorningInternal = true;
  window.addEventListener('message', onMessage);
  window.addEventListener('pointerdown', onAltDuplicatePointer, true);
  window.addEventListener('pointermove', onAltDuplicatePointer, true);
  window.addEventListener('pointerup', onAltDuplicatePointer, true);
  window.addEventListener('pointercancel', onAltDuplicatePointer, true);
  window.addEventListener('mousedown', onAltDuplicateMouse, true);
  window.addEventListener('mousemove', onAltDuplicateMouse, true);
  window.addEventListener('mouseup', onAltDuplicateMouse, true);
  window.addEventListener('click', onAltDuplicateMouse, true);
  window.addEventListener('dragstart', onAltDuplicateDragStart, true);
  window.addEventListener('selectstart', onAltDuplicateDragStart, true);
  window.addEventListener('blur', () => cancelAltDuplicateSession('window-blur'));
  window.addEventListener('keydown', onKeyDown, true);

  post('ready');
  debug('Bridge v1.5.16 integrated ready');
})();
