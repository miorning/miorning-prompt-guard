(() => {
  "use strict";
  if (window.MiorningHub) return;
  const TABS = ["home", "dlc", "settings"];
  const LABELS = { home: "主页", dlc: "DLC", settings: "设置" };
  let root = null, activeTab = "home", returnFocus = null, busy = false;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
  const app = () => window.MiorningApp;
  const state = () => app()?.getState?.() || {};
  const catalog = () => Array.isArray(app()?.catalog) ? app().catalog : [];
  const installed = id => state().dlc?.[id] === true;
  const asset = name => chrome.runtime.getURL(`assets/${name}`);
  const heading = (kicker, title, description) => `<header class="mh-page-heading"><span class="mh-eyebrow">${esc(kicker)}</span><h2>${esc(title)}</h2><p>${esc(description)}</p></header>`;
  const launcher = (action, name, description, number, extra = "") => `<button type="button" class="mh-launch ${extra}" data-hub-run="${esc(action)}"><span class="mh-index" aria-hidden="true">${esc(number)}</span><span class="mh-launch-copy"><strong>${esc(name)}</strong><span>${esc(description)}</span></span><span class="mh-arrow" aria-hidden="true">↗</span></button>`;

  function homeMarkup() {
    const data = state(), items = catalog().filter(item => installed(item.id));
    const categoryCount = Object.keys(data.categories || {}).length;
    const promptCount = Object.values(data.categories || {}).reduce((sum, values) => sum + (Array.isArray(values) ? values.length : 0), 0);
    const siteCount = Array.isArray(data.guardSites) ? data.guardSites.length : 0;
    return `${heading("YOUR LITTLE TOOLBOX", "先写好，再发出去。", "提示词留在手边，其他本事按需添加。")}
      <section class="mh-base" aria-label="基础功能"><div class="mh-section-label"><span>基础功能</span><span class="mh-small-label">始终保留</span></div>
      ${launcher("prompts", "提示词库", "管理分类、补全语句与收藏的提示词", "01", "mh-launch-primary")}
      <div class="mh-base-meta"><span>${categoryCount} 个分类 · ${promptCount} 条提示词</span><button type="button" class="mh-text-button" data-hub-tab="settings">${siteCount ? `保险栓：${siteCount} 个网站` : "设置保险栓网站"} →</button></div></section>
      <section class="mh-installed" aria-labelledby="mh-installed-title"><div class="mh-section-label"><h3 id="mh-installed-title">已添加的功能 <span class="mh-count">${items.length}</span></h3><button type="button" class="mh-text-button" data-hub-tab="dlc">管理 DLC →</button></div>
      ${items.length ? `<div class="mh-launch-list">${items.map((item, index) => launcher(item.action || item.id, item.name, item.desc || item.alias || "打开功能", String(index + 2).padStart(2, "0"))).join("")}</div>` : `<div class="mh-empty"><strong>够用就好，多的自己挑。</strong><p>灵感箱、画风库、轮盘……想用哪个，再加哪个。</p><button type="button" class="mh-button mh-button-primary" data-hub-tab="dlc">挑选 DLC <span aria-hidden="true">＋</span></button></div>`}</section>
      <div class="mh-home-note"><span class="mh-tiny-rule" aria-hidden="true"></span><p>${data.enabled === false ? "保险栓当前已暂停。" : "保险栓已开启。"}${siteCount ? "只在你指定的网站接管 Enter。" : "未指定网站，不会拦截网页上的 Enter。"}</p><button type="button" class="mh-text-button" data-hub-run="toggle">${data.enabled === false ? "开启" : "暂停"}</button></div>`;
  }

  function dependency(item) {
    if (item.id === "style") return "依赖灵感箱；添加时会一起开启。";
    if (item.id === "inspiration") return "移除时，画风库也会一并关闭。";
    const values = Array.isArray(item.requires) ? item.requires : [];
    return values.length ? `依赖：${values.map(id => catalog().find(entry => entry.id === id)?.name || id).join("、")}` : "";
  }

  function dlcMarkup() {
    const items = catalog(), count = items.filter(item => installed(item.id)).length;
    return `${heading("ADD WHAT YOU NEED", "本事，按需上身。", "DLC 是内置的可选功能。添加即启用，移除即关闭。")}
      <div class="mh-dlc-summary"><span>已添加 <strong>${count}</strong> / ${items.length}</span><span>没有商店，也不需要下载。</span></div>
      <div class="mh-dlc-list">${items.map((item, index) => {
        const on = installed(item.id), note = dependency(item);
        return `<section class="mh-dlc-row ${on ? "is-installed" : ""}" aria-labelledby="mh-dlc-name-${esc(item.id)}"><span class="mh-dlc-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span><div class="mh-dlc-copy"><div class="mh-dlc-title"><h3 id="mh-dlc-name-${esc(item.id)}">${esc(item.name)}</h3>${on ? '<span class="mh-installed-label">已添加</span>' : ""}</div><p>${esc(item.desc || item.alias || "可选扩展功能")}</p>${note ? `<small>${esc(note)}</small>` : ""}</div><button type="button" class="mh-button ${on ? "mh-button-remove" : "mh-button-primary"}" data-hub-dlc="${esc(item.id)}" data-focus-key="dlc-${esc(item.id)}" aria-label="${on ? "移除" : "添加"}${esc(item.name)}">${on ? "移除" : "添加 ＋"}</button></section>`;
      }).join("") || '<p class="mh-empty">功能列表暂时不可用，请关闭后重新打开。</p>'}</div>
      <p class="mh-footnote">基础提示词库和保险栓不属于 DLC，始终保留。</p>`;
  }

  function settingsMarkup() {
    const data = state(), sites = Array.isArray(data.guardSites) ? data.guardSites : [];
    const backup = data.autoBackupEnabled !== false;
    return `${heading("MAKE YOURSELF AT HOME", "你的习惯，你来定。", "哪些网站交给保险栓，哪些功能留在手边。")}
      <section class="mh-setting-section" aria-labelledby="mh-sites-title"><div class="mh-section-label"><h3 id="mh-sites-title">保险栓生效网站</h3><span class="mh-small-label">${sites.length} 个</span></div>
      <p class="mh-setting-description" id="mh-sites-help">同一主机名的全部页面都生效，http / https 均可。www 和其他子域名需分别添加；列表为空时不拦截 Enter。</p>
      <form class="mh-site-form" data-hub-site-form novalidate><label for="mh-site-input">网站地址</label><div class="mh-input-row"><input id="mh-site-input" type="text" inputmode="url" autocomplete="off" spellcheck="false" placeholder="https://example.com" aria-describedby="mh-sites-help mh-site-error" required><button type="submit" class="mh-button mh-button-primary">添加</button></div><p class="mh-field-error" id="mh-site-error" role="alert" hidden></p></form>
      ${sites.length ? `<ul class="mh-site-list">${sites.map(site => `<li><span title="${esc(site)}">${esc(site)}</span><button type="button" class="mh-text-button" data-hub-remove-site="${esc(site)}" aria-label="移除网站 ${esc(site)}">移除</button></li>`).join("")}</ul>` : '<p class="mh-site-empty">暂未添加网站。网页的 Enter 保持原样。</p>'}</section>
      <section class="mh-setting-section" aria-labelledby="mh-backup-title"><div class="mh-switch-row"><div><h3 id="mh-backup-title">自动备份配置</h3><p class="mh-setting-description" id="mh-backup-help">默认每天一份，优先存入原图文件夹；不可写入时保存到下载目录的「MIORNING-自动备份」。不含原图。关闭不影响手动导出。</p></div><button type="button" class="mh-switch" role="switch" aria-checked="${backup}" aria-labelledby="mh-backup-title" aria-describedby="mh-backup-help" data-hub-backup data-focus-key="backup"><span class="mh-switch-track" aria-hidden="true"><span></span></span><span>${backup ? "开启" : "关闭"}</span></button></div><div class="mh-inline-actions"><button type="button" class="mh-button" data-hub-command="export">导出配置</button><button type="button" class="mh-button" data-hub-command="import">导入配置</button></div></section>
      <section class="mh-setting-section mh-preferences" aria-labelledby="mh-preferences-title"><h3 id="mh-preferences-title">操作与外观</h3><div class="mh-preference-actions"><button type="button" class="mh-preference" data-hub-run="shortcuts"><span><strong>快捷键</strong><small>${esc(app()?.getShortcutLabel?.("toggle") || "按你的习惯设置")}</small></span><span aria-hidden="true">↗</span></button><button type="button" class="mh-preference" data-hub-run="skins"><span><strong>轮盘皮肤</strong><small>统一调整四象限外观</small></span><span aria-hidden="true">↗</span></button></div></section>`;
  }

  function notify(message, error = false) {
    const node = root?.querySelector(".mh-status");
    if (node) { node.textContent = message; node.classList.toggle("is-error", error); }
  }

  function render({ focusKey = "", keepScroll = false } = {}) {
    if (!root) return;
    const panel = root.querySelector(".mh-panel"), scrollTop = keepScroll ? panel.scrollTop : 0;
    root.querySelectorAll('[role="tab"]').forEach(tab => {
      const selected = tab.dataset.hubTab === activeTab;
      tab.setAttribute("aria-selected", String(selected)); tab.tabIndex = selected ? 0 : -1;
    });
    panel.id = "mh-panel";
    panel.setAttribute("aria-labelledby", `mh-tab-${activeTab}`);
    panel.innerHTML = activeTab === "dlc" ? dlcMarkup() : activeTab === "settings" ? settingsMarkup() : homeMarkup();
    panel.scrollTop = scrollTop;
    const theme = root.querySelector("[data-hub-command='theme']"), day = state().uiTheme === "day";
    theme.textContent = day ? "切换夜间" : "切换白天";
    theme.setAttribute("aria-label", day ? "切换为夜间主题" : "切换为白天主题");
    if (focusKey) [...panel.querySelectorAll("[data-focus-key]")].find(element => element.dataset.focusKey === focusKey)?.focus({ preventScroll: true });
  }

  function selectTab(tab, focusTab = true) {
    if (!TABS.includes(tab) || busy) return;
    activeTab = tab; render(); notify("");
    if (focusTab) root?.querySelector(`#mh-tab-${tab}`)?.focus({ preventScroll: true });
  }

  function refresh() {
    if (!root?.isConnected) return;
    const active = document.activeElement;
    const hadFocus = root.contains(active);
    const input = root.querySelector("#mh-site-input");
    const error = root.querySelector("#mh-site-error");
    const draft = input ? { value: input.value, start: input.selectionStart, end: input.selectionEnd, direction: input.selectionDirection, invalid: input.getAttribute("aria-invalid"), error: error?.textContent || "", errorHidden: error?.hidden !== false } : null;
    const identity = hadFocus ? { id: active.id, key: active.dataset?.focusKey, run: active.dataset?.hubRun, removeSite: active.dataset?.hubRemoveSite, submit: active.matches?.('[type="submit"]') } : null;
    render({ keepScroll: true });
    const nextInput = root.querySelector("#mh-site-input");
    if (draft && nextInput) {
      nextInput.value = draft.value;
      if (draft.invalid) nextInput.setAttribute("aria-invalid", draft.invalid);
      const nextError = root.querySelector("#mh-site-error");
      nextError.textContent = draft.error; nextError.hidden = draft.errorHidden;
      if (draft.start !== null) nextInput.setSelectionRange(draft.start, draft.end, draft.direction);
    }
    if (identity) {
      const target = identity.id ? [...root.querySelectorAll("[id]")].find(node => node.id === identity.id)
        : identity.key ? [...root.querySelectorAll("[data-focus-key]")].find(node => node.dataset.focusKey === identity.key)
        : identity.removeSite ? [...root.querySelectorAll("[data-hub-remove-site]")].find(node => node.dataset.hubRemoveSite === identity.removeSite)
        : identity.run ? [...root.querySelectorAll("[data-hub-run]")].find(node => node.dataset.hubRun === identity.run)
        : identity.submit ? root.querySelector('[type="submit"]') : active?.isConnected ? active : null;
      (target || root.querySelector(`#mh-tab-${activeTab}`))?.focus({ preventScroll: true });
    }
  }

  const visible = element => Boolean(element?.getClientRects().length) && getComputedStyle(element).visibility !== "hidden";
  function hasHigherPopup() {
    return root && [...document.querySelectorAll('[id^="mpg-"][id$="-root"], dialog[open]')].some(node => node !== root && !root.contains(node) && visible(node) && (root.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING));
  }
  const focusable = () => root ? [...root.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href], [tabindex="0"]')].filter(element => element.tabIndex >= 0 && visible(element)) : [];

  function onKeyDown(event) {
    if (!root || hasHigherPopup()) return;
    if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); close(); return; }
    if (event.target.closest?.('[role="tablist"]') && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
      event.preventDefault(); event.stopPropagation();
      const current = TABS.indexOf(activeTab);
      selectTab(TABS[event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : (current + (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1) + TABS.length) % TABS.length]);
      return;
    }
    if (event.key !== "Tab") return;
    const targets = focusable(), first = targets[0], last = targets[targets.length - 1];
    if (!first) { event.preventDefault(); root.querySelector(".mh-dialog")?.focus(); return; }
    if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
  }
  function onFocusIn(event) {
    if (root && !root.contains(event.target) && !hasHigherPopup()) (focusable()[0] || root.querySelector(".mh-dialog"))?.focus({ preventScroll: true });
  }

  async function mutate(button, operation, success) {
    if (busy || !root) return;
    const currentRoot = root;
    busy = true; button.disabled = true; button.setAttribute("aria-busy", "true");
    try {
      const result = await operation();
      if (root !== currentRoot) return;
      if (result === false) throw new Error("这次操作没有保存，请重试。");
      success?.(result);
    } catch (error) { if (root === currentRoot) notify(error?.message || "操作失败，请重试。", true); }
    finally { busy = false; if (button.isConnected) { button.disabled = false; button.removeAttribute("aria-busy"); } }
  }

  async function onClick(event) {
    const button = event.target.closest?.("button");
    if (!button || !root?.contains(button)) return;
    const api = app();
    if (button.hasAttribute("data-hub-close")) { close(); return; }
    if (button.dataset.hubTab) { selectTab(button.dataset.hubTab); return; }
    if (button.dataset.hubRun) {
      const action = button.dataset.hubRun; close();
      try { await api?.run?.(action); } catch (error) { open(activeTab); notify(error?.message || "暂时无法打开这个功能。", true); }
      return;
    }
    if (button.dataset.hubDlc) {
      const id = button.dataset.hubDlc, enabled = installed(id), style = installed("style"), inspiration = installed("inspiration");
      const name = catalog().find(item => item.id === id)?.name || "功能";
      await mutate(button, () => api.setDlc(id, !enabled), () => {
        render({ focusKey: `dlc-${id}`, keepScroll: true });
        notify(id === "style" && !enabled && !inspiration ? "画风库已添加，灵感箱也已一起开启。" : id === "inspiration" && enabled && style ? "灵感箱和画风库已一起关闭。" : `${name}${enabled ? "已移除。" : "已添加。"}`);
      }); return;
    }
    if (button.hasAttribute("data-hub-remove-site")) {
      await mutate(button, () => api.removeSite(button.dataset.hubRemoveSite), () => { render({ keepScroll: true }); root.querySelector("#mh-site-input")?.focus({ preventScroll: true }); notify("已移除该网站。网页的 Enter 不再由保险栓接管。"); }); return;
    }
    if (button.hasAttribute("data-hub-backup")) {
      const next = state().autoBackupEnabled === false;
      await mutate(button, () => api.setBackup(next), () => { render({ focusKey: "backup", keepScroll: true }); notify(next ? "自动备份已开启。" : "自动备份已关闭；仍可手动导出配置。"); }); return;
    }
    const command = button.dataset.hubCommand;
    if (command === "theme") { api.toggleTheme(); render({ keepScroll: true }); notify(state().uiTheme === "day" ? "已切换白天主题。" : "已切换夜间主题。"); }
    if (command === "export") await mutate(button, () => api.exportConfig(), () => notify("已发起配置导出，请查看浏览器下载列表。"));
    if (command === "import") { close(); try { await api.importConfig(); } catch (error) { open("settings"); notify(error?.message || "未能导入配置。", true); } }
  }

  async function onSubmit(event) {
    if (!event.target.matches("[data-hub-site-form]")) return;
    event.preventDefault(); event.stopPropagation(); if (busy) return;
    const input = root.querySelector("#mh-site-input"), error = root.querySelector("#mh-site-error"), text = input.value.trim();
    error.hidden = true; input.removeAttribute("aria-invalid");
    if (!text) { error.textContent = "请先输入一个网站地址。"; error.hidden = false; input.setAttribute("aria-invalid", "true"); input.focus(); return; }
    await mutate(event.target.querySelector('[type="submit"]'), async () => {
      try { return await app().addSite(text); }
      catch (failure) { if (error.isConnected) { error.textContent = failure?.message || "请填写有效的网站地址。"; error.hidden = false; input.setAttribute("aria-invalid", "true"); input.focus(); } throw failure; }
    }, origin => { render({ keepScroll: true }); root.querySelector("#mh-site-input")?.focus({ preventScroll: true }); notify(`已添加 ${typeof origin === "string" ? origin : "该网站"}，同一主机名下的全部页面生效。`); });
  }

  function close() {
    if (!root) return;
    const target = returnFocus; root.remove(); root = null; busy = false; returnFocus = null;
    window.removeEventListener("keydown", onKeyDown, true); document.removeEventListener("focusin", onFocusIn, true);
    if (target?.isConnected && typeof target.focus === "function") target.focus({ preventScroll: true });
    else document.getElementById("mpg-floating")?.focus({ preventScroll: true });
  }

  function open(tab = "home") {
    if (!app()) return;
    if (root?.isConnected) { selectTab(TABS.includes(tab) ? tab : "home"); return; }
    activeTab = TABS.includes(tab) ? tab : "home"; returnFocus = document.activeElement;
    root = document.createElement("div"); root.id = "mpg-hub-root"; root.lang = "zh-CN";
    // Existing feature popups use the document layer; native showModal would
    // make them inert. Trap focus here, and close the hub before launching one.
    root.innerHTML = `<div class="mh-backdrop" data-hub-backdrop></div><section class="mh-dialog" role="dialog" aria-modal="true" aria-labelledby="mh-brand-name" tabindex="-1"><aside class="mh-rail"><div class="mh-brand"><img src="${esc(asset("floating-on.png"))}" width="42" height="46" alt=""><div><h1 id="mh-brand-name">MIORNING</h1><span>喵咛 · 小工具柜</span></div></div><nav class="mh-tabs" role="tablist" aria-label="工具柜导航">${TABS.map((name, index) => `<button id="mh-tab-${name}" type="button" role="tab" aria-controls="mh-panel-${name}" aria-selected="${name === activeTab}" tabindex="${name === activeTab ? "0" : "-1"}" data-hub-tab="${name}"><span class="mh-tab-index" aria-hidden="true">0${index + 1}</span><span>${LABELS[name]}</span><span class="mh-tab-arrow" aria-hidden="true">↗</span></button>`).join("")}</nav><div class="mh-cat"><span class="mh-cat-caption">少一点折腾。<br>多一点创作。</span><img src="${esc(asset("modal-hero-default.png"))}" width="234" height="293" alt="穿奶油色上衣、戴红围巾的喵咛黑猫正在看书" draggable="false"><span class="mh-cat-label">MIORNING / 1.8</span></div><button type="button" class="mh-theme" data-hub-command="theme">切换主题</button></aside><div class="mh-main"><div class="mh-topline"><span>MIORNING PROMPT GUARD</span><button type="button" class="mh-close" data-hub-close aria-label="关闭工具柜">×</button></div><div class="mh-panel" role="tabpanel" tabindex="0"></div><footer class="mh-footer"><p class="mh-status" role="status" aria-live="polite" aria-atomic="true"></p><span class="mh-escape" aria-hidden="true">ESC 关闭</span></footer></div></section>`;
    (document.fullscreenElement || document.documentElement).appendChild(root);
    root.querySelectorAll('[role="tab"]').forEach(tab => tab.setAttribute("aria-controls", "mh-panel"));
    root.addEventListener("click", onClick); root.addEventListener("submit", onSubmit);
    root.querySelector("[data-hub-backdrop]").addEventListener("click", close);
    root.addEventListener("input", event => { if (event.target.id === "mh-site-input") { event.target.removeAttribute("aria-invalid"); const error = root?.querySelector("#mh-site-error"); if (error) error.hidden = true; } });
    window.addEventListener("keydown", onKeyDown, true); document.addEventListener("focusin", onFocusIn, true);
    render(); root.querySelector(`#mh-tab-${activeTab}`)?.focus({ preventScroll: true });
  }
  window.MiorningHub = { open, close, refresh };
})();
