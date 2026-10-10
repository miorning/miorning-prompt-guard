/* Local DLC policy. No remote code; uninstalling never removes collection data. */
(() => {
  const catalog = Object.freeze([
    { id: "inspiration", name: "灵感收纳箱", alias: "捡破烂，也要分门别类。", desc: "框选截图、分类备注、原图复制与回收站。", mark: "01", action: "inspiration" },
    { id: "style", name: "四象限风格", alias: "选择困难？往这边划。", desc: "按情绪整理画风，固定参考图和备注。", mark: "02", action: "style", requires: "inspiration" },
    { id: "shotlab", name: "ShotLab 画布", alias: "少点几下，多躺一会儿。", desc: "聚焦、适应画布、打组解组、Alt 拖拽复制。", mark: "03", action: "shotlab" },
    { id: "quickWheel", name: "快捷轮盘", alias: "常用的，划一下就行。", desc: "把已添加的功能装进四个快捷象限。", mark: "04", action: "wheel" },
    { id: "trashTalk", name: "垃圾话与番茄钟", alias: "你负责拖延，我负责催命。", desc: "自定义倒计时、系统吐槽和夜间休息提醒。", mark: "05", action: "trashTalk" },
    { id: "achievements", name: "成就收藏册", alias: "并不优秀，但有勋章。", desc: "四条成就线与彩蛋，进度照样保留。", mark: "06", action: "achievements" }
  ]);
  const shortcutModules = { inspirationCapture: "inspiration", inspirationBox: "inspiration", stylePicker: "style", quickWheel: "quickWheel", trashTalk: "trashTalk" };
  function normalizeSite(value) {
    const input = String(value || "").trim();
    if (!input || /[\s*\\]/.test(input)) throw new Error("请输入根网址或域名，不支持空格和通配符。");
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(input) ? input : `https://${input}`);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || (!url.hostname.includes(".") && url.hostname !== "localhost")) throw new Error("请填写 http / https 网站根网址。");
    return url.origin;
  }
  function normalizeSites(values) {
    return [...new Set((Array.isArray(values) ? values : []).flatMap(value => { try { return [normalizeSite(value)]; } catch (_) { return []; } }))].slice(0, 100);
  }
  function allowsUrl(values, currentUrl) {
    try {
      const current = new URL(currentUrl);
      if (!["http:", "https:"].includes(current.protocol)) return false;
      return normalizeSites(values).some(value => new URL(value).host.toLowerCase() === current.host.toLowerCase());
    } catch (_) { return false; }
  }
  function normalizeModules(saved, legacy = false) {
    const result = Object.fromEntries(catalog.map(item => [item.id, saved && typeof saved[item.id] === "boolean" ? saved[item.id] : legacy]));
    if (result.style) result.inspiration = true;
    return result;
  }
  window.MiorningModulePolicy = Object.freeze({ catalog, shortcutModules, normalizeSite, normalizeSites, allowsUrl, normalizeModules });
})();
