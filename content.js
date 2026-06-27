(() => {
  const BILI_URL = "https://space.bilibili.com/353186187";
  const STORAGE_KEY = "mpg_state_v1_5_5";
  const OLD_STORAGE_KEYS = ["mpg_state_v1_5_4_test", "mpg_state_v1_5_4", "mpg_state_v1_5_3", "mpg_state_v1_5_2", "mpg_state_v1_5_1", "mpg_state_v1_5_0", "mpg_state_v1_4_9", "mpg_state_v1_4_8", "mpg_state_v1_4_7", "mpg_state_v1_4_6", "mpg_state_v1_4_5", "mpg_state_v1_4_4", "mpg_state_v1_4_3_fix", "mpg_state_v1_4_3", "mpg_state_v1_4_2", "mpg_state_v13", "mpg_state_v12", "mpg_state_v11", "mpg_state_v10", "mpg_state_v09", "mpg_state_v08", "mpg_state_v07", "mpg_state_v06", "mpg_state_v05", "mpg_state_v04", "mpg_state_v03", "mpg_state_v02"];

  const ASSET_FLOAT_ON = chrome.runtime.getURL("assets/floating-on.png");
  const ASSET_FLOAT_OFF = chrome.runtime.getURL("assets/floating-off.png");
  const ASSET_MODAL_HERO = chrome.runtime.getURL("assets/modal-hero-default.png");

  const DEFAULT_COMMON_PROMPTS = [
    "不要BGM，不要字幕，只要环境音效和动作音效。"
  ];

  const DEFAULT_STATE = {
    enabled: true,
    hotkeyMode: "backtick",
    collectHotkeyMode: "ctrl_b",
    activeCategory: "常用补全",
    collectCategory: "常用补全",
    uiTheme: "night",
    guardPopupCount: 0,
    usageCount: 0,
    collectCount: 0,
    unlockedAchievements: [],
    allAchievementsRewardShown: false,
    easterHidden: false,
    modalHeroImage: "",
    promptThumbs: {},
    categories: {
      "常用补全": DEFAULT_COMMON_PROMPTS
    }
  };


  const ACHIEVEMENTS = [
    { id: "use_1", type: "use", threshold: 1, name: "提示词试吃员", desc: "使用 1 次提示词。先尝一口，别急着说难吃。", icon: "◎" },
    { id: "use_10", type: "use", threshold: 10, name: "复制按钮熟练工", desc: "使用 10 次提示词。你已经不是乱点，是有组织地乱点。", icon: "◉" },
    { id: "use_50", type: "use", threshold: 50, name: "提示词小厨子", desc: "使用 50 次提示词。调料没少放，锅有没有糊另说。", icon: "◆" },
    { id: "use_100", type: "use", threshold: 100, name: "提示词批发商", desc: "使用 100 次提示词。您这不是创作，是进货。", icon: "◈" },
    { id: "use_500", type: "use", threshold: 500, name: "提示词永动机", desc: "使用 500 次提示词。鼠标：我想申请工伤。", icon: "◇" },

    { id: "collect_1", type: "collect", threshold: 1, name: "捡破烂初心者", desc: "收录 1 条。万丈高楼从偷第一句开始。", icon: "◎" },
    { id: "collect_10", type: "collect", threshold: 10, name: "提示词小仓鼠", desc: "收录 10 条。囤货使你安心，虽然不一定会用。", icon: "◉" },
    { id: "collect_50", type: "collect", threshold: 50, name: "赛博破烂王", desc: "收录 50 条。别人刷视频，你捡句子。", icon: "◆" },
    { id: "collect_100", type: "collect", threshold: 100, name: "仓库管理员失控版", desc: "收录 100 条。分类没炸已经是奇迹。", icon: "◈" },
    { id: "collect_500", type: "collect", threshold: 500, name: "提示词囤积症晚期", desc: "收录 500 条。医生说你没事，只是该睡觉了。", icon: "◇" },

    { id: "remind_1", type: "remind", threshold: 1, name: "第一次被拦住", desc: "被强制提醒 1 次。别生气，我是为你好。", icon: "◎" },
    { id: "remind_10", type: "remind", threshold: 10, name: "回车被害妄想", desc: "被强制提醒 10 次。现在看到 Enter 都有点心虚。", icon: "◉" },
    { id: "remind_50", type: "remind", threshold: 50, name: "低级错误观察员", desc: "被强制提醒 50 次。错误还没犯，羞耻感先到了。", icon: "◆" },
    { id: "remind_100", type: "remind", threshold: 100, name: "保险栓重点客户", desc: "被强制提醒 100 次。您这边建议终身会员。", icon: "◈" },
    { id: "remind_500", type: "remind", threshold: 500, name: "回车渡劫天尊", desc: "被强制提醒 500 次。九九八十一难，您超额完成。", icon: "◇" }
  ];

  const ACHIEVEMENT_LINES = {
    use: "使用提示词次数",
    collect: "录入提示词数量",
    remind: "强制提醒次数"
  };


  const STATE = {
    data: clone(DEFAULT_STATE),
    bypassUntil: 0,
    lastTarget: null,
    lastEventInfo: null,
    floating: null,
    modal: null,
    manager: null,
    collector: null,
    achievementsPanel: null,
    achievementPopup: null,
    allRewardPopup: null,
    easterPopup: null,
    toastTimer: null,
    longPressTimer: null,
    longPressFired: false,
    managerScrollToBottom: false,
    hotkeyPanel: null,
    categoryIoPanel: null,
    thumbPreview: null
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function mergeState(saved) {
    const merged = clone(DEFAULT_STATE);
    if (!saved || typeof saved !== "object") return merged;

    merged.enabled = typeof saved.enabled === "boolean" ? saved.enabled : merged.enabled;

    const allowedHotkeys = new Set(["backtick", "ctrl_backtick", "ctrl_alt_backtick"]);
    merged.hotkeyMode = allowedHotkeys.has(saved.hotkeyMode) ? saved.hotkeyMode : merged.hotkeyMode;

    const allowedThemes = new Set(["night", "day"]);
    merged.uiTheme = allowedThemes.has(saved.uiTheme) ? saved.uiTheme : merged.uiTheme;

    merged.guardPopupCount = Number.isFinite(saved.guardPopupCount) ? Math.max(0, Math.floor(saved.guardPopupCount)) : 0;
    merged.usageCount = Number.isFinite(saved.usageCount) ? Math.max(0, Math.floor(saved.usageCount)) : 0;
    merged.collectCount = Number.isFinite(saved.collectCount) ? Math.max(0, Math.floor(saved.collectCount)) : 0;
    merged.unlockedAchievements = Array.isArray(saved.unlockedAchievements) ? saved.unlockedAchievements.filter(x => typeof x === "string") : [];
    merged.allAchievementsRewardShown = typeof saved.allAchievementsRewardShown === "boolean" ? saved.allAchievementsRewardShown : false;
    merged.easterHidden = typeof saved.easterHidden === "boolean" ? saved.easterHidden : false;
    merged.modalHeroImage = typeof saved.modalHeroImage === "string" ? saved.modalHeroImage : "";
    merged.promptThumbs = saved.promptThumbs && typeof saved.promptThumbs === "object" ? saved.promptThumbs : {};

    const allowedCollectHotkeys = new Set(["ctrl_b", "ctrl_q"]);
    merged.collectHotkeyMode = allowedCollectHotkeys.has(saved.collectHotkeyMode) ? saved.collectHotkeyMode : merged.collectHotkeyMode;

    const sourceCategories = saved.categories && typeof saved.categories === "object" ? saved.categories : {};
    merged.categories = {};

    Object.entries(sourceCategories).forEach(([name, arr]) => {
      if (typeof name === "string" && Array.isArray(arr)) {
        merged.categories[name] = arr.filter(x => typeof x === "string");
      }
    });

    if (!merged.categories["常用补全"]) {
      merged.categories["常用补全"] = DEFAULT_COMMON_PROMPTS.slice();
    }
    if (!Array.isArray(merged.categories["常用补全"]) || merged.categories["常用补全"].length === 0) {
      merged.categories["常用补全"] = DEFAULT_COMMON_PROMPTS.slice();
    }

    merged.activeCategory = typeof saved.activeCategory === "string" && merged.categories[saved.activeCategory]
      ? saved.activeCategory
      : "常用补全";

    merged.collectCategory = typeof saved.collectCategory === "string" && merged.categories[saved.collectCategory]
      ? saved.collectCategory
      : "常用补全";

    return merged;
  }

  function loadState() {
    try {
      chrome.storage?.local?.get([STORAGE_KEY, ...OLD_STORAGE_KEYS], (res) => {
        if (chrome.runtime.lastError) return;
        STATE.data = mergeState(
          res?.[STORAGE_KEY] ||
          res?.mpg_state_v1_5_4_test ||
          res?.mpg_state_v1_5_4 ||
          res?.mpg_state_v1_5_3 ||
          res?.mpg_state_v1_5_2 ||
          res?.mpg_state_v1_5_1 ||
          res?.mpg_state_v1_5_0 ||
          res?.mpg_state_v1_4_9 ||
          res?.mpg_state_v1_4_8 ||
          res?.mpg_state_v1_4_7 ||
          res?.mpg_state_v1_4_6 ||
          res?.mpg_state_v1_4_5 ||
          res?.mpg_state_v1_4_4 ||
          res?.mpg_state_v1_4_3_fix ||
          res?.mpg_state_v1_4_3 ||
          res?.mpg_state_v1_4_2 ||
          res?.mpg_state_v12 ||
          res?.mpg_state_v11 ||
          res?.mpg_state_v10 ||
          res?.mpg_state_v09 ||
          res?.mpg_state_v08 ||
          res?.mpg_state_v07 ||
          res?.mpg_state_v06 ||
          res?.mpg_state_v05 ||
          res?.mpg_state_v04 ||
          res?.mpg_state_v03 ||
          res?.mpg_state_v02
        );
        saveState();
        applyFloatingState();
      });
    } catch (_) {
      STATE.data = clone(DEFAULT_STATE);
    }
  }

  function applyThemeClass() {
    const root = document.documentElement;
    root.classList.remove("mpg-theme-night", "mpg-theme-day");
    root.classList.add(STATE.data.uiTheme === "day" ? "mpg-theme-day" : "mpg-theme-night");
  }

  function saveState() {
    applyThemeClass();
    try {
      chrome.storage?.local?.set({ [STORAGE_KEY]: STATE.data });
    } catch (_) {}
  }

  function safeText(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function openBili() {
    window.open(BILI_URL, "_blank", "noopener,noreferrer");
  }

  function signatureHtml() {
    return `<button class="mpg-signature" type="button" data-action="bili">Miorning喵咛提醒您：早点滚去睡觉！小崽子！</button>`;
  }

  function getFloatingIconSrc(enabled) {
    return enabled ? ASSET_FLOAT_ON : ASSET_FLOAT_OFF;
  }

  function getModalHeroSrc() {
    return STATE.data.modalHeroImage || ASSET_MODAL_HERO;
  }

  function readImageFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error("read-error"));
      reader.readAsDataURL(file);
    });
  }

  function downloadTextFile(filename, content, mime = "application/json;charset=utf-8") {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1000);
  }

  function exportFullConfig() {
    const payload = {
      name: "Miorning Prompt Guard Config",
      version: "1.5.5",
      exportedAt: new Date().toISOString(),
      data: STATE.data
    };

    const content = JSON.stringify(payload, null, 2);
    downloadTextFile("Miorning-Prompt-Guard-配置备份.json", content);
    showToast("配置已导出");
  }

  function importFullConfig() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.style.display = "none";
    document.body.appendChild(input);

    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) {
        input.remove();
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result || "{}"));
          const rawData = parsed && typeof parsed === "object" && parsed.data ? parsed.data : parsed;
          STATE.data = mergeState(rawData);
          saveState();
          applyFloatingState();
          showToast("配置已导入");
          showManager();
        } catch (_) {
          showToast("配置导入失败：JSON 文件不正确");
        } finally {
          input.remove();
        }
      };
      reader.onerror = () => {
        showToast("配置导入失败：读取文件失败");
        input.remove();
      };
      reader.readAsText(file, "utf-8");
    }, { once: true });

    input.click();
  }

  function openModalHeroPicker(target, eventInfo) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/webp,image/jpeg,image/jpg";
    input.style.display = "none";
    document.body.appendChild(input);
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) {
        input.remove();
        return;
      }
      try {
        const dataUrl = await readImageFileAsDataURL(file);
        if (dataUrl) {
          STATE.data.modalHeroImage = dataUrl;
          saveState();
          showToast("对话框顶部图片已更新");
          showGuardModal(target, eventInfo);
        }
      } catch (_) {
        showToast("图片读取失败");
      } finally {
        input.remove();
      }
    }, { once: true });
    input.click();
  }


  function getCounterForAchievement(ach) {
    if (ach.type === "use") return Number(STATE.data.usageCount || 0);
    if (ach.type === "collect") return Number(STATE.data.collectCount || 0);
    if (ach.type === "remind") return Number(STATE.data.guardPopupCount || 0);
    return 0;
  }


  function isAchievementUnlocked(id) {
    return (STATE.data.unlockedAchievements || []).includes(id);
  }

  function maybeUnlockAchievements(type) {
    const unlocked = new Set(STATE.data.unlockedAchievements || []);
    const newlyUnlocked = [];

    ACHIEVEMENTS.forEach((ach) => {
      if (type && ach.type !== type) return;
      if (unlocked.has(ach.id)) return;
      if (getCounterForAchievement(ach) >= ach.threshold) {
        unlocked.add(ach.id);
        newlyUnlocked.push(ach);
      }
    });

    if (newlyUnlocked.length) {
      STATE.data.unlockedAchievements = Array.from(unlocked);
      saveState();

      newlyUnlocked.forEach((ach, idx) => {
        setTimeout(() => showAchievementPopup(ach), idx * 700);
      });
    }

    maybeShowAllAchievementsReward();
  }

  function recordReminder() {
    STATE.data.guardPopupCount = Math.max(0, Number(STATE.data.guardPopupCount || 0)) + 1;
    saveState();
    maybeUnlockAchievements("remind");
  }

  function recordUsage() {
    STATE.data.usageCount = Math.max(0, Number(STATE.data.usageCount || 0)) + 1;
    saveState();
    maybeUnlockAchievements("use");
  }

  function recordCollect(count = 1) {
    STATE.data.collectCount = Math.max(0, Number(STATE.data.collectCount || 0)) + count;
    saveState();
    maybeUnlockAchievements("collect");
  }


  function showAchievementPopup(ach) {
    closeAchievementPopup();
    const root = document.createElement("div");
    root.id = "mpg-achievement-popup";
    root.innerHTML = `
      <div class="mpg-achievement-card">
        <div class="mpg-achievement-kicker">ACHIEVEMENT UNLOCKED</div>
        <div class="mpg-achievement-main">
          <div class="mpg-achievement-icon">${safeText(ach.icon || "▣")}</div>
          <div>
            <div class="mpg-achievement-name">${safeText(ach.name)}</div>
            <div class="mpg-achievement-desc">${safeText(ach.desc)}</div>
          </div>
        </div>
      </div>
    `;
    document.documentElement.appendChild(root);
    STATE.achievementPopup = root;
    setTimeout(() => closeAchievementPopup(), 5200);
  }

  function hasAllAchievements() {
    const unlocked = new Set(STATE.data.unlockedAchievements || []);
    return ACHIEVEMENTS.every((ach) => unlocked.has(ach.id));
  }

  function maybeShowAllAchievementsReward() {
    if (STATE.data.allAchievementsRewardShown) return;
    if (!hasAllAchievements()) return;

    STATE.data.allAchievementsRewardShown = true;
    saveState();

    setTimeout(() => showAllAchievementsReward(), 900);
  }

  function closeAllAchievementsReward() {
    const node = document.getElementById("mpg-all-reward-root");
    if (node) node.remove();
    STATE.allRewardPopup = null;
  }

  function showAllAchievementsReward() {
    closeAllAchievementsReward();

    const root = document.createElement("div");
    root.id = "mpg-all-reward-root";
    root.innerHTML = `
      <div class="mpg-rainbow-screen">
        <div class="mpg-rainbow-title">全成就奖励：由您自己给自己发放！</div>
        <div class="mpg-rainbow-text">开玩笑的，我有幸成为了libtv的创作者，也不知道他们运营哪根筋抽抽了从人群中找到了默默无闻的鄙人，如果您全成就了欢迎在b站自己觉得最好的ai视频下方@我并贴上自己的全成就截屏，然后我会去看作品，我觉得是个黑马，就会给您内推到libtv，倒不是说内推就能进，还是需要您的作品质量过硬的哦，唯一的好处是，能让你更早被看见，虽然这也未必是什么好事，但如果你希望试一试的话，那就去这么做吧，期待你带上全成就的截图在您最好的作品下@我~祝您明天和今天一样，都像昨天一样开心。江湖再见！</div>
        <div class="mpg-rainbow-tip">点击任意位置关闭</div>
      </div>
    `;
    document.documentElement.appendChild(root);
    STATE.allRewardPopup = root;

    root.addEventListener("click", () => {
      closeAllAchievementsReward();
    }, { once: true });
  }

  function closeAchievementPopup() {
    const node = document.getElementById("mpg-achievement-popup");
    if (node) node.remove();
    STATE.achievementPopup = null;
  }

  function closeAchievementsPanel() {
    const node = document.getElementById("mpg-achievements-root");
    if (node) node.remove();
    STATE.achievementsPanel = null;
  }

  function achievementLineHtml(type) {
    const title = ACHIEVEMENT_LINES[type] || type;
    const count = getCounterForAchievement({ type });
    const line = ACHIEVEMENTS.filter(a => a.type === type);

    let visibleCount = 1;
    for (let i = 0; i < line.length; i++) {
      if (isAchievementUnlocked(line[i].id)) visibleCount = Math.min(line.length, i + 2);
    }

    const items = line.map((ach, index) => {
      const visible = index < visibleCount;
      const unlocked = isAchievementUnlocked(ach.id);
      const progress = visible ? Math.min(Number(count || 0), ach.threshold) : "?";
      const threshold = visible ? ach.threshold : "???";
      const name = visible ? ach.name : "？？？？？？";
      const desc = visible ? ach.desc : "该成就已被马赛克封印，先把上一层干完再说。";
      const icon = visible ? (unlocked ? ach.icon : "□") : "▓";

      return `
        <div class="mpg-achievement-row ${unlocked ? "unlocked" : "locked"} ${visible ? "" : "censored"}">
          <div class="mpg-achievement-mini-icon">${safeText(icon)}</div>
          <div class="mpg-achievement-row-body">
            <div class="mpg-achievement-row-title">${safeText(name)} <span>${progress}/${threshold}</span></div>
            <div class="mpg-achievement-row-desc">${safeText(desc)}</div>
          </div>
        </div>
      `;
    }).join("");

    return `
      <section class="mpg-card mpg-achievement-line">
        <div class="mpg-section-title">${safeText(title)} · 当前 ${count || 0}</div>
        ${items}
      </section>
    `;
  }
  function closeLockedRewardPopup() {
    const node = document.getElementById("mpg-locked-reward-root");
    if (node) node.remove();
  }

  function showLockedRewardPopup() {
    closeLockedRewardPopup();

    const root = document.createElement("div");
    root.id = "mpg-locked-reward-root";
    root.innerHTML = `
      <div class="mpg-locked-backdrop" data-action="close-locked-reward"></div>
      <div class="mpg-locked-card" role="dialog" aria-modal="true">
        <strong>您尚未完成所有成就。</strong>
        <p>先把该打的黑工打完，再来领奖。</p>
        <button type="button" class="mpg-small-btn primary-soft" data-action="close-locked-reward">知道了</button>
      </div>
    `;
    document.documentElement.appendChild(root);

    root.addEventListener("click", (e) => {
      const close = e.target.closest?.("[data-action='close-locked-reward']");
      if (close) closeLockedRewardPopup();
    });
  }

  function showAchievementsPanel() {
    closeAchievementsPanel();
    const root = document.createElement("div");
    root.id = "mpg-achievements-root";
    root.innerHTML = `
      <div class="mpg-achievements-backdrop" data-action="close-achievements"></div>
      <div class="mpg-achievements-panel" role="dialog" aria-modal="true">
        <div class="mpg-header">
          <div>
            <strong>成就系统</strong>
            <p>使用按 Enter 弹窗里实际点击提示词次数计算；收录不统计 TXT 导入；提醒按 Enter 强制弹窗次数计算。</p>
          </div>
          <button class="mpg-x" type="button" data-action="close-achievements">×</button>
        </div>
        <div class="mpg-achievement-actionbar">
          <button type="button" class="mpg-small-btn mpg-reward-btn ${hasAllAchievements() ? "unlocked" : "locked"}" data-action="show-all-reward">全成就彩蛋</button>
        </div>
        <div class="mpg-achievements-grid">
          ${achievementLineHtml("use")}
          ${achievementLineHtml("collect")}
          ${achievementLineHtml("remind")}
        </div>
        ${signatureHtml()}
      </div>
      </div>
    `;
    document.documentElement.appendChild(root);
    STATE.achievementsPanel = root;
    root.addEventListener("click", (e) => {
      const reward = e.target.closest?.("[data-action='show-all-reward']");
      if (reward) {
        e.preventDefault();
        e.stopPropagation();
        if (hasAllAchievements()) {
          showAllAchievementsReward();
        } else {
          showLockedRewardPopup();
        }
        return;
      }

      const bili = e.target.closest?.("[data-action='bili']");
      if (bili) {
        e.preventDefault();
        e.stopPropagation();
        openBili();
        return;
      }

      const close = e.target.closest?.("[data-action='close-achievements']");
      if (close) {
        closeAchievementsPanel();
      }
    });

    const sig = root.querySelector("[data-action='bili']");
    sig?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openBili();
    }, true);
  }

  function getHotkeyLabel(mode = STATE.data.hotkeyMode) {
    if (mode === "ctrl_backtick") return "Ctrl + `";
    if (mode === "ctrl_alt_backtick") return "Ctrl + Alt + `";
    return "`";
  }

  function getCollectHotkeyLabel(mode = STATE.data.collectHotkeyMode) {
    if (mode === "ctrl_q") return "Ctrl + Q";
    return "Ctrl + B";
  }

  function isBackquote(e) {
    return e.code === "Backquote" || e.key === "`";
  }

  function matchesToggleHotkey(e) {
    if (!isBackquote(e)) return false;
    if (e.shiftKey || e.metaKey) return false;

    const mode = STATE.data.hotkeyMode || "backtick";
    if (mode === "ctrl_alt_backtick") return e.ctrlKey && e.altKey;
    if (mode === "ctrl_backtick") return e.ctrlKey && !e.altKey;
    return !e.ctrlKey && !e.altKey;
  }

  function matchesCollectHotkey(e) {
    if (e.shiftKey || e.altKey || e.metaKey) return false;
    const key = (e.key || "").toLowerCase();
    const code = e.code || "";
    const mode = STATE.data.collectHotkeyMode || "ctrl_b";
    if (mode === "ctrl_q") return e.ctrlKey && (key === "q" || code === "KeyQ");
    return e.ctrlKey && (key === "b" || code === "KeyB");
  }

  function toggleEnabled() {
    STATE.data.enabled = !STATE.data.enabled;
    saveState();
    applyFloatingState();
    showToast(STATE.data.enabled ? "提示词保险栓已开启" : "提示词保险栓已关闭");
  }

  function isVisible(el) {
    if (!el || !(el instanceof Element)) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  }

  function closestEditable(target) {
    if (!target || !(target instanceof Element)) return null;

    if (target.closest?.("#mpg-modal-root, #mpg-manager-root, #mpg-collector-root, #mpg-floating, #mpg-toast")) {
      return null;
    }

    const el = target.closest?.("textarea, input, [contenteditable='true'], [contenteditable='plaintext-only'], [role='textbox']");
    if (!el) return null;

    const tag = el.tagName?.toLowerCase();
    if (tag === "input") {
      const type = (el.getAttribute("type") || "text").toLowerCase();
      const okTypes = new Set(["text", "search", "url", "email", "tel", "password", "number"]);
      if (!okTypes.has(type)) return null;
    }

    if (el.isContentEditable || tag === "textarea" || tag === "input" || el.getAttribute("role") === "textbox") {
      return el;
    }
    return null;
  }

  function getEditableText(el) {
    if (!el) return "";
    const tag = el.tagName?.toLowerCase();
    if (tag === "textarea" || tag === "input") return el.value || "";
    return el.innerText || el.textContent || "";
  }

  function getSelectedText() {
    const active = document.activeElement;
    const tag = active?.tagName?.toLowerCase();

    if ((tag === "textarea" || tag === "input") && typeof active.selectionStart === "number" && typeof active.selectionEnd === "number") {
      const selected = (active.value || "").slice(active.selectionStart, active.selectionEnd);
      if (selected.trim()) return selected.trim();
    }

    const selected = window.getSelection?.().toString() || "";
    return selected.trim();
  }

  function insertTextIntoEditable(el, text) {
    if (!el) return;
    el.focus();

    const tag = el.tagName?.toLowerCase();
    const current = getEditableText(el);
    const prefixLineBreak = current && !current.endsWith("\n") ? "\n" : "";

    if (tag === "textarea" || tag === "input") {
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const prefix = el.value.slice(0, start);
      const suffix = el.value.slice(end);
      const spacer = prefix && !prefix.endsWith("\n") ? "\n" : "";
      el.value = prefix + spacer + text + suffix;
      const pos = (prefix + spacer + text).length;
      el.setSelectionRange?.(pos, pos);
      el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }

    document.execCommand("insertText", false, prefixLineBreak + text);
    el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
  }

  function checkPrompt(text) {
    const normalized = (text || "").replace(/\s+/g, " ").trim();

    const bgm = /((不要|无|禁止|去掉|关闭|不要有|不需要)\s*(bgm|BGM|背景音乐|配乐|音乐))|((no|without)\s*(bgm|music|background music))/i.test(normalized);

    const subtitle = /((不要|无|禁止|去掉|关闭|不要有|不需要)\s*(字幕|文字|字幕条|文案|旁白字幕))|((no|without)\s*(subtitle|subtitles|caption|captions|text))/i.test(normalized);

    return { bgm, subtitle };
  }

  function checkLine(ok, label) {
    return `
      <div class="mpg-check-line ${ok ? "ok" : "bad"}">
        <span class="mpg-mark">${ok ? "✅" : "❌"}</span>
        <span>${safeText(label)}</span>
      </div>
    `;
  }

  function warnLine(label) {
    return `
      <div class="mpg-check-line warn">
        <span class="mpg-mark">⚠️</span>
        <span>${safeText(label)}</span>
      </div>
    `;
  }

  function createFloating() {
    if (document.getElementById("mpg-floating")) return;

    const btn = document.createElement("button");
    btn.id = "mpg-floating";
    btn.type = "button";
    btn.title = "左键单击开关，右键打开设置，左键按住1秒打开成就系统";
    btn.innerHTML = `<img alt="Miorning Prompt Guard">`;
    btn.setAttribute("aria-label", "Miorning Prompt Guard");

    btn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showManager();
    }, true);

    btn.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      STATE.longPressFired = false;
      clearTimeout(STATE.longPressTimer);
      STATE.longPressTimer = setTimeout(() => {
        STATE.longPressFired = true;
        showAchievementsPanel();
      }, 1000);
    }, true);

    btn.addEventListener("mouseup", () => {
      clearTimeout(STATE.longPressTimer);
    }, true);

    btn.addEventListener("mouseleave", () => {
      clearTimeout(STATE.longPressTimer);
    }, true);

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearTimeout(STATE.longPressTimer);
      if (STATE.longPressFired) {
        STATE.longPressFired = false;
        return;
      }
      toggleEnabled();
    }, true);

    document.documentElement.appendChild(btn);
    STATE.floating = btn;
    applyFloatingState();
  }

  function applyFloatingState() {
    const btn = STATE.floating || document.getElementById("mpg-floating");
    if (!btn) return;
    btn.classList.toggle("off", !STATE.data.enabled);
    btn.title = "左键单击开关，右键打开设置，左键按住1秒打开成就系统";
    const img = btn.querySelector("img");
    if (img) img.src = getFloatingIconSrc(STATE.data.enabled);
  }

  function showToast(msg) {
    let toast = document.getElementById("mpg-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "mpg-toast";
      document.documentElement.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(STATE.toastTimer);
    STATE.toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
  }

  function closeGuardModal(focusBack = true) {
    const modal = document.getElementById("mpg-modal-root");
    if (modal) modal.remove();
    STATE.modal = null;
    if (focusBack) STATE.lastTarget?.focus?.();
  }

  function closeManager() {
    const manager = document.getElementById("mpg-manager-root");
    if (manager) manager.remove();
    STATE.manager = null;
  }

  function closeCollector() {
    const collector = document.getElementById("mpg-collector-root");
    if (collector) collector.remove();
    STATE.collector = null;
  }

  function allCategoryNames() {
    const names = Object.keys(STATE.data.categories || {});
    if (!names.includes("常用补全")) names.unshift("常用补全");
    return [...new Set(names)];
  }

  function customCategoryNames() {
    return allCategoryNames().filter(name => name !== "常用补全");
  }

  function categoryOptionsHtml(selectedName) {
    return allCategoryNames().map(name => `<option value="${safeText(name)}" ${name === selectedName ? "selected" : ""}>${safeText(name)}</option>`).join("");
  }

  function ensureThumbArray(category) {
    if (!STATE.data.promptThumbs || typeof STATE.data.promptThumbs !== "object") {
      STATE.data.promptThumbs = {};
    }
    if (!Array.isArray(STATE.data.promptThumbs[category])) {
      STATE.data.promptThumbs[category] = [];
    }
    const prompts = STATE.data.categories?.[category] || [];
    while (STATE.data.promptThumbs[category].length < prompts.length) {
      STATE.data.promptThumbs[category].push("");
    }
    if (STATE.data.promptThumbs[category].length > prompts.length) {
      STATE.data.promptThumbs[category] = STATE.data.promptThumbs[category].slice(0, prompts.length);
    }
    return STATE.data.promptThumbs[category];
  }

  function getPromptThumb(category, index) {
    return ensureThumbArray(category)[index] || "";
  }

  function setPromptThumb(category, index, dataUrl) {
    const arr = ensureThumbArray(category);
    arr[index] = dataUrl || "";
    saveState();
  }

  function moveThumbCategory(oldName, newName) {
    if (!STATE.data.promptThumbs) STATE.data.promptThumbs = {};
    STATE.data.promptThumbs[newName] = ensureThumbArray(oldName);
    delete STATE.data.promptThumbs[oldName];
  }

  async function fileToDataURL(file) {
    return await readImageFileAsDataURL(file);
  }

  function firstImageFromPasteEvent(e) {
    const items = Array.from(e.clipboardData?.items || []);
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        return item.getAsFile();
      }
    }

    const files = Array.from(e.clipboardData?.files || []);
    const file = files.find(file => file.type.startsWith("image/"));
    if (file) return file;

    return null;
  }

  function dataUrlFromPasteHtml(e) {
    const html = e.clipboardData?.getData("text/html") || "";
    if (!html) return "";
    const match = html.match(/src=["'](data:image\/[^"']+)["']/i);
    return match ? match[1] : "";
  }

  async function dataUrlFromNavigatorClipboard() {
    if (!navigator.clipboard?.read) return "";

    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find(type => type.startsWith("image/"));
        if (!type) continue;
        const blob = await item.getType(type);
        return await readImageFileAsDataURL(blob);
      }
    } catch (_) {}

    return "";
  }

  async function imageDataUrlFromPasteEvent(e) {
    const file = firstImageFromPasteEvent(e);
    if (file) return await fileToDataURL(file);

    const fromHtml = dataUrlFromPasteHtml(e);
    if (fromHtml) return fromHtml;

    return await dataUrlFromNavigatorClipboard();
  }

  function updatePromptThumbDom(index, dataUrl) {
    const item = document.querySelector(`#mpg-manager-root .mpg-prompt-item[data-prompt-item="${index}"]`);
    const slot = item?.querySelector?.(".mpg-thumb-slot");
    if (!slot) return;

    if (dataUrl) {
      slot.classList.add("has-thumb");
      slot.innerHTML = `<img src="${dataUrl}" alt="缩略图">`;
    } else {
      slot.classList.remove("has-thumb");
      slot.innerHTML = `<span>图</span>`;
    }
  }

  async function applyThumbDataUrlFromItem(item, dataUrl) {
    if (!item || !dataUrl) return false;

    const idx = Number(item.getAttribute("data-prompt-item"));
    const activeName = STATE.data.activeCategory || "常用补全";
    setPromptThumb(activeName, idx, dataUrl);
    updatePromptThumbDom(idx, dataUrl);
    showToast("缩略图已添加");
    return true;
  }

  async function handlePromptThumbPaste(e) {
    const item = e.target instanceof Element ? e.target.closest?.(".mpg-prompt-item") : null;
    if (!item) return false;

    let dataUrl = "";
    try {
      dataUrl = await imageDataUrlFromPasteEvent(e);
    } catch (_) {}

    if (!dataUrl) return false;

    e.preventDefault();
    e.stopPropagation();
    return await applyThumbDataUrlFromItem(item, dataUrl);
  }

  async function handlePromptThumbCtrlV(e) {
    if (!(e.ctrlKey || e.metaKey)) return false;
    if (String(e.key || "").toLowerCase() !== "v") return false;

    const item = e.target instanceof Element ? e.target.closest?.(".mpg-prompt-item") : null;
    if (!item) return false;

    let dataUrl = "";
    try {
      dataUrl = await dataUrlFromNavigatorClipboard();
    } catch (_) {}

    if (!dataUrl) return false;

    e.preventDefault();
    e.stopPropagation();
    return await applyThumbDataUrlFromItem(item, dataUrl);
  }

  function openThumbFilePicker(index) {
    const active = STATE.data.activeCategory || "常用补全";
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/jpg,image/webp";
    input.style.display = "none";
    document.body.appendChild(input);

    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) {
        input.remove();
        return;
      }

      try {
        const dataUrl = await fileToDataURL(file);
        setPromptThumb(active, index, dataUrl);
        updatePromptThumbDom(index, dataUrl);
        showToast("缩略图已添加");
      } catch (_) {
        showToast("缩略图添加失败");
      } finally {
        input.remove();
      }
    }, { once: true });

    input.click();
  }

  function thumbHtml(category, index, label = "点击输入框黏贴您的截图上传或替代缩略图") {
    const src = getPromptThumb(category, index);
    return `
      <button type="button" class="mpg-thumb-slot ${src ? "has-thumb" : ""}" data-action="thumb-upload" data-index="${index}" data-thumb-index="${index}" title="${safeText(label)}">
        ${src ? `<img src="${src}" alt="缩略图">` : `<span>图</span>`}
      </button>
    `;
  }

  function snippetButtonHtml(category, index, prompt, attrName) {
    const thumb = getPromptThumb(category, index);
    return `
      <button type="button" class="mpg-snippet-with-thumb ${thumb ? "has-thumb" : ""}" ${attrName}="${index}" ${thumb ? `data-thumb-preview="${thumb}"` : ""}>
        ${thumb ? `<img class="mpg-snippet-thumb" src="${thumb}" alt="">` : ""}
        <span>${safeText(prompt)}</span>
      </button>
    `;
  }

  function closeThumbPreview() {
    const node = document.getElementById("mpg-thumb-preview-root");
    if (node) node.remove();
    STATE.thumbPreview = null;
  }

  function showThumbPreviewForButton(btn) {
    const src = btn?.getAttribute?.("data-thumb-preview");
    if (!src) return;

    closeThumbPreview();

    const root = document.createElement("div");
    root.id = "mpg-thumb-preview-root";
    root.innerHTML = `<img src="${src}" alt="缩略图预览">`;
    document.documentElement.appendChild(root);
    STATE.thumbPreview = root;

    const rect = btn.getBoundingClientRect();
    const previewWidth = 260;
    const previewHeight = 180;
    let left = rect.left + rect.width / 2 - previewWidth / 2;
    let top = rect.top - previewHeight - 14;

    left = Math.max(12, Math.min(window.innerWidth - previewWidth - 12, left));
    if (top < 12) {
      top = rect.bottom + 14;
    }

    root.style.left = `${left}px`;
    root.style.top = `${top}px`;
  }

  function showGuardModal(target, eventInfo) {
    closeGuardModal(false);

    const text = getEditableText(target);
    const result = checkPrompt(text);

    const commonPrompts = STATE.data.categories["常用补全"] || DEFAULT_COMMON_PROMPTS;
    const names = customCategoryNames();

    if (!STATE.data.activeCategory || STATE.data.activeCategory === "常用补全" || !STATE.data.categories[STATE.data.activeCategory]) {
      STATE.data.activeCategory = names[0] || "";
    }
    const active = STATE.data.activeCategory || "";
    const activePrompts = active ? (STATE.data.categories[active] || []) : [];

    const root = document.createElement("div");
    root.id = "mpg-modal-root";
    root.innerHTML = `
      <div class="mpg-backdrop" data-action="outside-close"></div>
      <div class="mpg-modal-shell">
        <img class="mpg-hero-float" data-action="hero-image" src="${getModalHeroSrc()}" alt="IP 顶部图" title="左键长按 1 秒可更换顶部 IP 图">
        <div class="mpg-modal" role="dialog" aria-modal="true">
        <div class="mpg-header">
          <div>
            <strong>生成前确认 <span class="mpg-count-badge">已强制提醒您${STATE.data.guardPopupCount || 0}次，不用谢。</span></strong>
            <p>检测到你按下 Enter 提交。再次按 Enter 可直接确认生成。</p>
          </div>
          <button class="mpg-x" type="button" data-action="close">×</button>
        </div>

        <div class="mpg-checks">
          ${checkLine(result.bgm, "不要 BGM / 无 BGM")}
          ${checkLine(result.subtitle, "不要字幕 / 无字幕")}
          ${warnLine("记得确认画布比例 / 画幅比例是否正确")}
          ${warnLine("记得确认视频时长是否正确")}
        </div>

        <div class="mpg-snippets">
          <div class="mpg-section-title">常用补全</div>
          <div class="mpg-snippet-grid">
            ${commonPrompts.map((s, i) => snippetButtonHtml("常用补全", i, s, "data-common-snippet")).join("")}
          </div>

          <div class="mpg-section-title mpg-with-gap">我的分类</div>
          ${names.length ? `
            <div class="mpg-tabs">
              ${names.map(name => `<button type="button" class="${name === active ? "active" : ""}" data-category="${safeText(name)}">${safeText(name)}</button>`).join("")}
            </div>
            <div class="mpg-category-prompts">
              ${activePrompts.length
                ? activePrompts.map((s, i) => snippetButtonHtml(active, i, s, "data-category-snippet")).join("")
                : `<div class="mpg-empty">这个分类还没有提示词。</div>`}
            </div>
          ` : `<div class="mpg-empty">暂无自定义分类。右键右下角图标打开设置添加。</div>`}
        </div>

        <div class="mpg-actions">
          <button type="button" class="secondary" data-action="close">返回修改</button>
          <button type="button" class="primary" data-action="continue">确认生成</button>
        </div>

        <div class="mpg-note">
          说明：确认后会尝试自动放行一次 Enter。若平台不接受模拟快捷键，8 秒内你再按一次 Enter 会直接通过，不再弹窗。
        </div>

        ${signatureHtml()}
      </div>
      </div>
    `;
    document.documentElement.appendChild(root);
    STATE.modal = root;

    root.addEventListener("mouseover", (e) => {
      const btn = e.target.closest?.(".mpg-snippet-with-thumb.has-thumb");
      if (btn) showThumbPreviewForButton(btn);
    }, true);

    root.addEventListener("mouseout", (e) => {
      const btn = e.target.closest?.(".mpg-snippet-with-thumb.has-thumb");
      if (!btn) return;
      const next = e.relatedTarget;
      if (next && btn.contains(next)) return;
      closeThumbPreview();
    }, true);

    const heroImg = root.querySelector('.mpg-hero-float');
    let heroLongPressTimer = null;
    let heroLongPressDone = false;
    const clearHeroPress = () => {
      clearTimeout(heroLongPressTimer);
      heroLongPressTimer = null;
    };
    heroImg?.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, true);
    heroImg?.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      heroLongPressDone = false;
      clearHeroPress();
      heroLongPressTimer = setTimeout(() => {
        heroLongPressDone = true;
        openModalHeroPicker(target, eventInfo);
      }, 1000);
    }, true);
    heroImg?.addEventListener("mouseup", (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearHeroPress();
    }, true);
    heroImg?.addEventListener("mouseleave", clearHeroPress, true);
    let heroClickCount = 0;
    let heroClickTimer = null;
    heroImg?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (heroLongPressDone) {
        heroLongPressDone = false;
        heroClickCount = 0;
        clearTimeout(heroClickTimer);
        return;
      }

      heroClickCount += 1;
      clearTimeout(heroClickTimer);

      if (heroClickCount >= 5) {
        heroClickCount = 0;
        STATE.data.modalHeroImage = "";
        saveState();
        showToast("顶部图已恢复默认");
        showGuardModal(target, eventInfo);
        return;
      }

      heroClickTimer = setTimeout(() => {
        heroClickCount = 0;
      }, 1400);
    }, true);

    root.addEventListener("click", (e) => {
      const outside = e.target.closest?.("[data-action='outside-close']");
      if (outside) {
        closeGuardModal(true);
        return;
      }

      const bili = e.target.closest?.("[data-action='bili']");
      if (bili) {
        openBili();
        return;
      }

      const close = e.target.closest?.("[data-action='close']");
      if (close) {
        closeGuardModal(true);
        return;
      }

      const commonSnippet = e.target.closest?.("[data-common-snippet]");
      if (commonSnippet) {
        const idx = Number(commonSnippet.getAttribute("data-common-snippet"));
        const prompt = commonPrompts[idx];
        if (prompt) {
          insertTextIntoEditable(target, prompt);
          recordUsage();
        }
        showGuardModal(target, eventInfo);
        return;
      }

      const tab = e.target.closest?.("[data-category]");
      if (tab) {
        STATE.data.activeCategory = tab.getAttribute("data-category") || "";
        saveState();
        showGuardModal(target, eventInfo);
        return;
      }

      const categorySnippet = e.target.closest?.("[data-category-snippet]");
      if (categorySnippet) {
        const idx = Number(categorySnippet.getAttribute("data-category-snippet"));
        const name = STATE.data.activeCategory || "";
        const prompt = STATE.data.categories[name]?.[idx];
        if (prompt) {
          insertTextIntoEditable(target, prompt);
          recordUsage();
        }
        showGuardModal(target, eventInfo);
        return;
      }

      const cont = e.target.closest?.("[data-action='continue']");
      if (cont) {
        closeGuardModal(false);
        allowAndTryContinue(target, eventInfo);
      }
    });

    const primary = root.querySelector("[data-action='continue']");
    primary?.focus();
  }

  function continueFromGuardByEnter(e) {
    if (!STATE.modal) return false;
    if (e.key !== "Enter" || e.shiftKey) return false;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const target = STATE.lastTarget;
    const info = STATE.lastEventInfo;
    closeGuardModal(false);
    allowAndTryContinue(target, info);
    return true;
  }

  function allowAndTryContinue(target, eventInfo) {
    STATE.bypassUntil = Date.now() + 8000;
    showToast("已放行 8 秒：若未自动生成，再按一次 Enter/快捷键即可。");
    target?.focus?.();

    setTimeout(() => {
      tryReplayEnter(target, eventInfo);
    }, 30);

    setTimeout(() => {
      const btn = findGenerateButton();
      if (btn) btn.click();
    }, 220);
  }

  function tryReplayEnter(target, eventInfo) {
    if (!target) return;
    const opts = {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true,
      composed: true,
      ctrlKey: !!eventInfo?.ctrlKey,
      metaKey: !!eventInfo?.metaKey,
      altKey: !!eventInfo?.altKey,
      shiftKey: false
    };

    ["keydown", "keypress", "keyup"].forEach((type) => {
      const ev = new KeyboardEvent(type, opts);
      target.dispatchEvent(ev);
    });
  }

  function textOf(el) {
    return [
      el.innerText,
      el.textContent,
      el.getAttribute?.("aria-label"),
      el.getAttribute?.("title"),
      el.getAttribute?.("data-testid"),
      el.getAttribute?.("class")
    ].filter(Boolean).join(" ");
  }

  function findGenerateButton() {
    const candidates = Array.from(document.querySelectorAll("button, [role='button'], input[type='button'], input[type='submit']"))
      .filter(isVisible)
      .filter((el) => !el.disabled && el.getAttribute("aria-disabled") !== "true");

    const strong = /(生成|开始生成|立即生成|发送|提交|创作|创建|generate|create|send|submit|run)/i;
    const weakBad = /(取消|关闭|返回|删除|重置|历史|模板|设置|cancel|close|back|delete|reset|setting)/i;

    const scored = candidates.map((el) => {
      const t = textOf(el);
      let score = 0;
      if (strong.test(t)) score += 10;
      if (/生成|generate/i.test(t)) score += 5;
      if (/发送|send/i.test(t)) score += 3;
      if (weakBad.test(t)) score -= 20;
      const rect = el.getBoundingClientRect();
      score += (rect.left / Math.max(window.innerWidth, 1)) + (rect.top / Math.max(window.innerHeight, 1));
      return { el, score, t };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

    return scored[0]?.el || null;
  }

  function shouldBypass() {
    return Date.now() < STATE.bypassUntil;
  }


  function showCollector(selectedText = "") {
    closeCollector();

    if (!STATE.data.collectCategory || !STATE.data.categories[STATE.data.collectCategory]) {
      STATE.data.collectCategory = "常用补全";
    }

    const root = document.createElement("div");
    root.id = "mpg-collector-root";
    root.innerHTML = `
      <div class="mpg-collector-backdrop" data-action="close-collector"></div>
      <div class="mpg-collector" role="dialog" aria-modal="true">
        <div class="mpg-header">
          <div>
            <strong>快速收藏提示词</strong>
            <p>选中文字已放入输入框。修改后选择分类，点击添加或按 Enter 保存。</p>
          </div>
          <button class="mpg-x" type="button" data-action="close-collector">×</button>
        </div>
        <section class="mpg-card mpg-collector-card">
          <label class="mpg-label">提示词内容</label>
          <textarea id="mpg-collector-text" placeholder="把想收藏的提示词放这里...">${safeText(selectedText)}</textarea>

          <label class="mpg-label">加入分类</label>
          <select id="mpg-collector-category" class="mpg-input">
            ${categoryOptionsHtml(STATE.data.collectCategory)}
          </select>
        </section>

        <div class="mpg-actions">
          <button type="button" class="secondary" data-action="close-collector">取消</button>
          <button type="button" class="primary" data-action="save-collector">添加提示词</button>
        </div>

        ${signatureHtml()}
      </div>
      </div>
    `;
    document.documentElement.appendChild(root);
    STATE.collector = root;

    root.addEventListener("click", (e) => {
      const outside = e.target.closest?.("[data-action='close-collector']");
      if (outside) {
        closeCollector();
        return;
      }

      const bili = e.target.closest?.("[data-action='bili']");
      if (bili) {
        openBili();
        return;
      }

      const close = e.target.closest?.("[data-action='close-collector']");
      if (close) {
        closeCollector();
        return;
      }

      const save = e.target.closest?.("[data-action='save-collector']");
      if (save) {
        saveCollectorPrompt();
        return;
      }
    });


    root.addEventListener("paste", async (e) => {
      const item = e.target instanceof Element ? e.target.closest?.(".mpg-prompt-item") : null;
      if (!item) return;

      const file = firstImageFromPasteEvent(e);
      if (!file) return;

      e.preventDefault();
      e.stopPropagation();

      const idx = Number(item.getAttribute("data-prompt-item"));
      const activeName = STATE.data.activeCategory || "常用补全";

      try {
        const dataUrl = await fileToDataURL(file);
        setPromptThumb(activeName, idx, dataUrl);
        STATE.managerScrollToBottom = true;
        showToast("缩略图已添加");
        showManager();
      } catch (_) {
        showToast("缩略图添加失败");
      }
    }, true);

    root.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeCollector();
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        saveCollectorPrompt();
      }
    });

    const textArea = root.querySelector("#mpg-collector-text");
    textArea?.focus();
    textArea?.select?.();
  }

  function saveCollectorPrompt() {
    const root = document.getElementById("mpg-collector-root");
    if (!root) return;

    const ta = root.querySelector("#mpg-collector-text");
    const sel = root.querySelector("#mpg-collector-category");
    const value = (ta?.value || "").trim();
    const category = sel?.value || "常用补全";

    if (!value) {
      showToast("提示词不能为空");
      return;
    }

    if (!STATE.data.categories[category]) STATE.data.categories[category] = [];
    STATE.data.categories[category].push(value);
    ensureThumbArray(category);
    recordCollect(1);
    STATE.data.collectCategory = category;
    if (category !== "常用补全") STATE.data.activeCategory = category;

    saveState();
    closeCollector();
    showToast(`已添加到「${category}」`);
  }

  function onKeyDownCapture(e) {
    if (continueFromGuardByEnter(e)) return;

    if (e.target instanceof Element && e.target.closest?.("#mpg-collector-root")) {
      return;
    }

    if (e.target instanceof Element && e.target.closest?.("#mpg-manager-root, #mpg-modal-root")) {
      return;
    }

    if (matchesCollectHotkey(e)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      showCollector(getSelectedText());
      return;
    }

    if (matchesToggleHotkey(e)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      toggleEnabled();
      return;
    }

    if (!STATE.data.enabled) return;
    if (e.key !== "Enter") return;
    if (e.shiftKey) return;
    if (shouldBypass()) return;

    const editable = closestEditable(e.target);
    if (!editable) return;

    STATE.lastTarget = editable;
    STATE.lastEventInfo = {
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      altKey: e.altKey
    };

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    recordReminder();
    showGuardModal(editable, STATE.lastEventInfo);
  }

  function toggleTheme() {
    STATE.data.uiTheme = STATE.data.uiTheme === "day" ? "night" : "day";
    saveState();
    showManager();
  }

  function closeEasterPopup() {
    const node = document.getElementById("mpg-easter-root");
    if (node) node.remove();
    STATE.easterPopup = null;
  }

  function showEasterConfirm() {
    closeEasterPopup();

    const root = document.createElement("div");
    root.id = "mpg-easter-root";
    root.innerHTML = `
      <div class="mpg-easter-backdrop"></div>
      <div class="mpg-easter-confirm" role="dialog" aria-modal="true">
        <strong>是否确认重置？</strong>
        <p>您即将支付空气，获得传说中的 6480 种提示词。</p>
        <div class="mpg-easter-actions">
          <button type="button" data-action="easter-yes">是</button>
          <button type="button" data-action="easter-no">否</button>
        </div>
      </div>
    `;
    document.documentElement.appendChild(root);
    STATE.easterPopup = root;

    root.addEventListener("click", (e) => {
      const no = e.target.closest?.("[data-action='easter-no']");
      if (no) {
        closeEasterPopup();
        return;
      }

      const yes = e.target.closest?.("[data-action='easter-yes']");
      if (yes) {
        showEasterBlueScreen();
      }
    });
  }

  function showEasterBlueScreen() {
    closeEasterPopup();

    STATE.data.easterHidden = true;
    saveState();
    closeManager();

    const root = document.createElement("div");
    root.id = "mpg-easter-root";
    root.innerHTML = `
      <div class="mpg-blue-screen">
        <div class="mpg-blue-title">捷径的路上早已挤满了人，滚去自己加提示词去！</div>
        <div class="mpg-blue-text">当然，如果您是天才当我没说，只不过我真没给您准备提示词：）抱歉了啊，还是等评论区有人分享吧，实不相瞒，我也在等！！！</div>
        <div class="mpg-blue-tip">点击任意位置关闭</div>
      </div>
    `;
    document.documentElement.appendChild(root);
    STATE.easterPopup = root;

    root.addEventListener("click", () => {
      closeEasterPopup();
    }, { once: true });
  }

  function closeHotkeyPanel() {
    const node = document.getElementById("mpg-hotkey-panel-root");
    if (node) node.remove();
    STATE.hotkeyPanel = null;
  }

  function closeCategoryIoPanel() {
    const node = document.getElementById("mpg-category-io-root");
    if (node) node.remove();
    STATE.categoryIoPanel = null;
  }

  function showHotkeyPanel() {
    closeHotkeyPanel();

    const root = document.createElement("div");
    root.id = "mpg-hotkey-panel-root";
    root.innerHTML = `
      <div class="mpg-mini-backdrop" data-action="close-hotkey-panel"></div>
      <div class="mpg-mini-panel" role="dialog" aria-modal="true">
        <div class="mpg-mini-header">
          <strong>快捷键设置</strong>
          <button class="mpg-x" type="button" data-action="close-hotkey-panel">×</button>
        </div>

        <div class="mpg-hotkey-two-col">
          <div class="mpg-hotkey-group">
            <div class="mpg-sub-title">保险栓开关</div>
            <div class="mpg-radio-grid">
              <label class="mpg-radio">
                <input type="radio" name="mpg-hotkey-pop" value="backtick" ${STATE.data.hotkeyMode === "backtick" ? "checked" : ""}>
                <span><code>\`</code></span>
              </label>
              <label class="mpg-radio">
                <input type="radio" name="mpg-hotkey-pop" value="ctrl_backtick" ${STATE.data.hotkeyMode === "ctrl_backtick" ? "checked" : ""}>
                <span><code>Ctrl + \`</code></span>
              </label>
              <label class="mpg-radio">
                <input type="radio" name="mpg-hotkey-pop" value="ctrl_alt_backtick" ${STATE.data.hotkeyMode === "ctrl_alt_backtick" ? "checked" : ""}>
                <span><code>Ctrl + Alt + \`</code></span>
              </label>
            </div>
          </div>

          <div class="mpg-hotkey-group">
            <div class="mpg-sub-title">快速收藏</div>
            <div class="mpg-radio-grid">
              <label class="mpg-radio">
                <input type="radio" name="mpg-collect-hotkey-pop" value="ctrl_b" ${STATE.data.collectHotkeyMode === "ctrl_b" ? "checked" : ""}>
                <span><code>Ctrl + B</code></span>
              </label>
              <label class="mpg-radio">
                <input type="radio" name="mpg-collect-hotkey-pop" value="ctrl_q" ${STATE.data.collectHotkeyMode === "ctrl_q" ? "checked" : ""}>
                <span><code>Ctrl + Q</code></span>
              </label>
            </div>
          </div>
        </div>

        <div class="mpg-mini-actions">
          <button type="button" class="mpg-small-btn primary-soft" data-action="save-hotkey-panel">保存快捷键</button>
        </div>
      </div>
    `;
    document.documentElement.appendChild(root);
    STATE.hotkeyPanel = root;

    root.addEventListener("click", (e) => {
      const close = e.target.closest?.("[data-action='close-hotkey-panel']");
      if (close) {
        closeHotkeyPanel();
        return;
      }

      const save = e.target.closest?.("[data-action='save-hotkey-panel']");
      if (save) {
        const selectedToggle = root.querySelector(`input[name="mpg-hotkey-pop"]:checked`);
        const selectedCollect = root.querySelector(`input[name="mpg-collect-hotkey-pop"]:checked`);
        STATE.data.hotkeyMode = selectedToggle?.value || "backtick";
        STATE.data.collectHotkeyMode = selectedCollect?.value || "ctrl_b";
        saveState();
        closeHotkeyPanel();
        showToast("快捷键已保存");
        showManager();
      }
    });
  }

  function showCategoryIoPanel() {
    closeCategoryIoPanel();

    const active = STATE.data.activeCategory || "常用补全";
    const root = document.createElement("div");
    root.id = "mpg-category-io-root";
    root.innerHTML = `
      <div class="mpg-mini-backdrop" data-action="close-category-io"></div>
      <div class="mpg-mini-panel mpg-io-panel" role="dialog" aria-modal="true">
        <div class="mpg-mini-header">
          <strong>导入 / 导出当前分类</strong>
          <button class="mpg-x" type="button" data-action="close-category-io">×</button>
        </div>

        <div class="mpg-section-title">当前分类：${safeText(active)}</div>

        <div class="mpg-io-mini-grid">
          <div class="mpg-import-box">
            <div class="mpg-import-title">导入 TXT</div>
            <div class="mpg-row mpg-row-tight">
              <input class="mpg-input" id="mpg-import-file" type="file" accept=".txt,text/plain">
              <button type="button" class="mpg-small-btn primary-soft" data-action="import-txt">导入</button>
            </div>
            <div class="mpg-hint">每行一段提示词，空行自动忽略。</div>
          </div>

          <div class="mpg-export-box">
            <div class="mpg-export-title">导出 TXT</div>
            <button type="button" class="mpg-small-btn primary-soft" data-action="export-txt">导出该分类</button>
            <div class="mpg-hint">按当前分类名导出，每行一条。</div>
          </div>
        </div>
      </div>
    `;
    document.documentElement.appendChild(root);
    STATE.categoryIoPanel = root;

    root.addEventListener("click", (e) => {
      const close = e.target.closest?.("[data-action='close-category-io']");
      if (close) {
        closeCategoryIoPanel();
        return;
      }

      const action = e.target.closest?.("[data-action]");
      if (!action) return;

      const act = action.getAttribute("data-action");
      if (act === "import-txt") {
        importTxtToActiveCategory();
        return;
      }
      if (act === "export-txt") {
        exportActiveCategoryToTxt();
        return;
      }
    });
  }

  function showManager() {
    closeManager();

    const names = allCategoryNames();
    if (!STATE.data.activeCategory || !STATE.data.categories[STATE.data.activeCategory]) {
      STATE.data.activeCategory = "常用补全";
    }

    const active = STATE.data.activeCategory || "常用补全";
    const prompts = STATE.data.categories[active] || [];
    ensureThumbArray(active);

    const canRenameDelete = active !== "常用补全";

    const root = document.createElement("div");
    root.id = "mpg-manager-root";
    root.innerHTML = `
      <div class="mpg-manager-backdrop" data-action="outside-close-manager"></div>
      <div class="mpg-manager" role="dialog" aria-modal="true">
        <div class="mpg-header">
          <div>
            <div class="mpg-title-row">
              <strong>提示词保险栓设置</strong>
              ${STATE.data.easterHidden ? "" : `<button type="button" class="mpg-easter-btn" data-action="open-easter-confirm">648解锁6480种提示词</button>`}
            </div>
            <p>管理分类、自定义提示词、TXT 导入和快捷键。数据保存在当前浏览器本地。</p>
          </div>
          <div class="mpg-manager-header-actions">
            <button class="mpg-config-btn mpg-theme-mini" type="button" data-action="toggle-theme" title="切换白天 / 黑夜模式">${STATE.data.uiTheme === "day" ? "白天" : "夜间"}</button>
            <button class="mpg-config-btn" type="button" data-action="open-hotkey-panel" title="设置保险栓和快速收藏快捷键">快捷键</button>
            <button class="mpg-config-btn" type="button" data-action="export-config" title="仅供升级版本时使用">导出配置</button>
            <button class="mpg-config-btn" type="button" data-action="import-config" title="仅供升级版本时使用">导入配置</button>
            <button class="mpg-x" type="button" data-action="close-manager">×</button>
          </div>
        </div>

        <section class="mpg-card mpg-category-card">
          <div class="mpg-section-title">分类</div>
          <div class="mpg-tabs vertical">
            ${names.map(name => `<button type="button" class="${name === active ? "active" : ""}" data-manager-category="${safeText(name)}">${safeText(name)}</button>`).join("")}
          </div>

          <div class="mpg-row mpg-row-tight">
            <input class="mpg-input" id="mpg-new-category" placeholder="新分类名，例如：运镜 / 转场 / 负面词">
            <button type="button" class="mpg-small-btn primary-soft" data-action="add-category">添加</button>
          </div>

          <div class="mpg-row mpg-row-tight">
            <input class="mpg-input" id="mpg-rename-category" value="${safeText(active)}" ${!canRenameDelete ? "disabled" : ""}>
            <button type="button" class="mpg-small-btn" data-action="rename-category" ${!canRenameDelete ? "disabled" : ""}>改名</button>
            <button type="button" class="mpg-small-btn danger" data-action="delete-category" ${!canRenameDelete ? "disabled" : ""}>删除</button>
          </div>
          ${!canRenameDelete ? `<div class="mpg-hint">“常用补全”可以添加、修改、TXT 导入，但不能改名或删除。</div>` : ""}
        </section>

        <section class="mpg-card mpg-prompts-card">
          <div class="mpg-prompts-title-row">
            <div class="mpg-section-title">当前分类：${safeText(active)}</div>
            <button type="button" class="mpg-small-btn primary-soft" data-action="open-category-io">导入/导出当前分类提示词</button>
          </div>

          <div class="mpg-prompt-list">
            ${prompts.length ? prompts.map((p, i) => promptEditorHtml(p, i)).join("") : `<div class="mpg-empty">这个分类还没有提示词。</div>`}
          </div>

          <div class="mpg-add-prompt">
            <textarea id="mpg-new-prompt" placeholder="输入新的提示词..."></textarea>
            <button type="button" class="mpg-small-btn primary-soft" data-action="add-prompt">添加提示词</button>
          </div>
        </section>

        ${signatureHtml()}
      </div>
    `;
    document.documentElement.appendChild(root);
    STATE.manager = root;

    root.addEventListener("click", (e) => {
      const outside = e.target.closest?.("[data-action='outside-close-manager']");
      if (outside) {
        closeManager();
        return;
      }

      const bili = e.target.closest?.("[data-action='bili']");
      if (bili) {
        openBili();
        return;
      }

      const close = e.target.closest?.("[data-action='close-manager']");
      if (close) {
        closeManager();
        return;
      }

      const tab = e.target.closest?.("[data-manager-category]");
      if (tab) {
        STATE.data.activeCategory = tab.getAttribute("data-manager-category") || "常用补全";
        saveState();
        showManager();
        return;
      }

      const action = e.target.closest?.("[data-action]");
      if (!action) return;

      const act = action.getAttribute("data-action");
      if (act === "thumb-upload") {
        openThumbFilePicker(Number(action.getAttribute("data-index")));
        return;
      }
      if (act === "open-hotkey-panel") {
        showHotkeyPanel();
        return;
      }
      if (act === "open-category-io") {
        showCategoryIoPanel();
        return;
      }
      if (act === "export-config") {
        exportFullConfig();
        return;
      }
      if (act === "import-config") {
        importFullConfig();
        return;
      }
      if (act === "open-easter-confirm") {
        showEasterConfirm();
        return;
      }
      if (act === "toggle-theme") {
        toggleTheme();
        return;
      }
      if (act === "add-category") {
        addCategory();
        return;
      }
      if (act === "rename-category") {
        renameCategory();
        return;
      }
      if (act === "delete-category") {
        deleteCategory();
        return;
      }
      if (act === "add-prompt") {
        addPrompt();
        return;
      }
      if (act === "save-prompt") {
        savePrompt(Number(action.getAttribute("data-index")));
        return;
      }
      if (act === "delete-prompt") {
        deletePrompt(Number(action.getAttribute("data-index")));
        return;
      }
    });

    root.addEventListener("paste", async (e) => {
      await handlePromptThumbPaste(e);
    }, true);

    root.addEventListener("keydown", async (e) => {
      if (await handlePromptThumbCtrlV(e)) return;

      if (e.key === "Escape") {
        e.preventDefault();
        closeManager();
      }
    }, true);

    if (STATE.managerScrollToBottom) {
      STATE.managerScrollToBottom = false;
      requestAnimationFrame(() => {
        const manager = document.querySelector("#mpg-manager-root .mpg-manager");
        const list = document.querySelector("#mpg-manager-root .mpg-prompt-list");
        if (list) list.scrollTop = list.scrollHeight;
        if (manager) manager.scrollTop = manager.scrollHeight;
      });
    }
  }

  function promptEditorHtml(prompt, idx) {
    const active = STATE.data.activeCategory || "常用补全";
    return `
      <div class="mpg-prompt-item" data-prompt-item="${idx}">
        ${thumbHtml(active, idx)}
        <textarea data-prompt-edit="${idx}" placeholder="可在这里粘贴截图作为缩略图" title="点击输入框黏贴您的截图上传或替代缩略图">${safeText(prompt)}</textarea>
        <div class="mpg-prompt-actions">
          <button type="button" class="mpg-small-btn" data-action="save-prompt" data-index="${idx}">保存</button>
          <button type="button" class="mpg-small-btn danger" data-action="delete-prompt" data-index="${idx}">删除</button>
        </div>
      </div>
    `;
  }

  function saveHotkeys() {
    const selectedToggle = document.querySelector(`#mpg-manager-root input[name="mpg-hotkey"]:checked`);
    STATE.data.hotkeyMode = selectedToggle?.value || "backtick";

    const selectedCollect = document.querySelector(`#mpg-manager-root input[name="mpg-collect-hotkey-manager"]:checked`);
    STATE.data.collectHotkeyMode = selectedCollect?.value || "ctrl_b";

    saveState();
    showToast("快捷键已保存");
    showManager();
  }

  function addCategory() {
    const input = document.getElementById("mpg-new-category");
    const name = (input?.value || "").trim();
    if (!name) return showToast("分类名不能为空");
    if (name === "常用补全") return showToast("常用补全已存在");
    if (STATE.data.categories[name]) return showToast("分类已存在");
    STATE.data.categories[name] = [];
    STATE.data.activeCategory = name;
    STATE.data.collectCategory = name;
    saveState();
    showManager();
  }

  function renameCategory() {
    const active = STATE.data.activeCategory || "常用补全";
    if (active === "常用补全") return showToast("常用补全不能改名");

    const input = document.getElementById("mpg-rename-category");
    const newName = (input?.value || "").trim();
    if (!newName) return showToast("新分类名不能为空");
    if (newName === "常用补全") return showToast("不能改名为常用补全");
    if (newName === active) return;
    if (STATE.data.categories[newName]) return showToast("分类名已存在");

    STATE.data.categories[newName] = STATE.data.categories[active] || [];
    moveThumbCategory(active, newName);
    delete STATE.data.categories[active];
    STATE.data.activeCategory = newName;
    if (STATE.data.collectCategory === active) STATE.data.collectCategory = newName;
    saveState();
    showManager();
  }

  function deleteCategory() {
    const active = STATE.data.activeCategory || "常用补全";
    if (active === "常用补全") return showToast("常用补全不能删除");
    if (!confirm(`确定删除分类「${active}」吗？里面的提示词也会删除。`)) return;
    delete STATE.data.categories[active];
    if (STATE.data.promptThumbs) delete STATE.data.promptThumbs[active];
    const names = customCategoryNames();
    STATE.data.activeCategory = names[0] || "常用补全";
    if (STATE.data.collectCategory === active) STATE.data.collectCategory = "常用补全";
    saveState();
    showManager();
  }

  function addPrompt() {
    const active = STATE.data.activeCategory || "常用补全";
    const ta = document.getElementById("mpg-new-prompt");
    const value = (ta?.value || "").trim();
    if (!value) return showToast("提示词不能为空");
    if (!STATE.data.categories[active]) STATE.data.categories[active] = [];
    STATE.data.categories[active].push(value);
    ensureThumbArray(active);
    recordCollect(1);
    saveState();
    STATE.managerScrollToBottom = true;
    showManager();
  }

  function savePrompt(idx) {
    const active = STATE.data.activeCategory || "常用补全";
    const ta = document.querySelector(`[data-prompt-edit="${idx}"]`);
    const value = (ta?.value || "").trim();
    if (!value) return showToast("提示词不能为空");
    if (!STATE.data.categories[active]) return;
    STATE.data.categories[active][idx] = value;
    saveState();
    showToast("提示词已保存");
    showManager();
  }

  function deletePrompt(idx) {
    const active = STATE.data.activeCategory || "常用补全";
    if (!STATE.data.categories[active]) return;
    const thumbArr = ensureThumbArray(active);
    STATE.data.categories[active].splice(idx, 1);
    thumbArr.splice(idx, 1);
    STATE.data.promptThumbs[active] = thumbArr;
    if (active === "常用补全" && STATE.data.categories[active].length === 0) {
      STATE.data.categories[active] = DEFAULT_COMMON_PROMPTS.slice();
    }
    saveState();
    showManager();
  }

  function importTxtToActiveCategory() {
    const active = STATE.data.activeCategory || "常用补全";

    const input = document.getElementById("mpg-import-file");
    const file = input?.files?.[0];
    if (!file) return showToast("请先选择 TXT 文件");
    if (!file.name.toLowerCase().endsWith(".txt") && file.type && file.type !== "text/plain") {
      return showToast("请选择 TXT 文件");
    }

    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result || "");
      const lines = raw
        .replace(/^\uFEFF/, "")
        .split(/\r?\n/)
        .map(x => x.trim())
        .filter(Boolean);

      if (!lines.length) {
        showToast("TXT 里没有可导入的提示词");
        return;
      }

      if (!STATE.data.categories[active]) STATE.data.categories[active] = [];

      const existed = new Set(STATE.data.categories[active]);
      const added = [];
      lines.forEach(line => {
        if (!existed.has(line)) {
          STATE.data.categories[active].push(line);
          ensureThumbArray(active);
          existed.add(line);
          added.push(line);
        }
      });

      saveState();
      STATE.managerScrollToBottom = true;
      showToast(`已导入 ${added.length} 条提示词`);
      closeCategoryIoPanel();
      showManager();
    };
    reader.onerror = () => showToast("读取 TXT 失败");
    reader.readAsText(file, "utf-8");
  }


  function safeFilename(name) {
    const cleaned = String(name || "提示词")
      .replace(/[\\/:*?"<>|]/g, "_")
      .replace(/\s+/g, " ")
      .trim();
    return cleaned || "提示词";
  }

  function exportActiveCategoryToTxt() {
    const active = STATE.data.activeCategory || "常用补全";
    const prompts = STATE.data.categories[active] || [];

    if (!prompts.length) {
      showToast("当前分类没有可导出的提示词");
      return;
    }

    const content = prompts.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeFilename(active)}.txt`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1000);

    showToast(`已导出「${active}」`);
    closeCategoryIoPanel();
  }

  function init() {
    applyThemeClass();
    loadState();
    createFloating();
  }

  window.addEventListener("keydown", onKeyDownCapture, true);
  document.addEventListener("keydown", onKeyDownCapture, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
