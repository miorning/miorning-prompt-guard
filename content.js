(() => {
  const BILI_URL = "https://space.bilibili.com/353186187";
  const STORAGE_KEY = "mpg_state_v1_7_0";
  const OLD_STORAGE_KEYS = ["mpg_state_v1_5_14", "mpg_state_v1_5_13", "mpg_state_v1_5_12", "mpg_state_v1_5_11", "mpg_state_v1_5_10", "mpg_state_v1_5_9", "mpg_state_v1_5_8", "mpg_state_v1_5_7", "mpg_state_v1_5_6", "mpg_state_v1_5_5", "mpg_state_v1_5_4_test", "mpg_state_v1_5_4", "mpg_state_v1_5_3", "mpg_state_v1_5_2", "mpg_state_v1_5_1", "mpg_state_v1_5_0", "mpg_state_v1_4_9", "mpg_state_v1_4_8", "mpg_state_v1_4_7", "mpg_state_v1_4_6", "mpg_state_v1_4_5", "mpg_state_v1_4_4", "mpg_state_v1_4_3_fix", "mpg_state_v1_4_3", "mpg_state_v1_4_2", "mpg_state_v13", "mpg_state_v12", "mpg_state_v11", "mpg_state_v10", "mpg_state_v09", "mpg_state_v08", "mpg_state_v07", "mpg_state_v06", "mpg_state_v05", "mpg_state_v04", "mpg_state_v03", "mpg_state_v02"];
  OLD_STORAGE_KEYS.unshift("mpg_state_v1_6_5", "mpg_state_v1_6_4", "mpg_state_v1_6_3", "mpg_state_v1_6_2", "mpg_state_v1_6_1", "mpg_state_v1_6_0", "mpg_state_v1_5_22", "mpg_state_v1_5_21", "mpg_state_v1_5_20", "mpg_state_v1_5_19", "mpg_state_v1_5_18", "mpg_state_v1_5_17", "mpg_state_v1_5_16", "mpg_state_v1_5_15");

  const ASSET_FLOAT_ON = chrome.runtime.getURL("assets/floating-on.png");
  const ASSET_FLOAT_OFF = chrome.runtime.getURL("assets/floating-off.png");
  const ASSET_MODAL_HERO = chrome.runtime.getURL("assets/modal-hero-default.png");
  const TRASH_TALK_IMAGES = [
    chrome.runtime.getURL("assets/trash-talk-retro.webp"),
    chrome.runtime.getURL("assets/trash-talk-gothic.webp"),
    chrome.runtime.getURL("assets/trash-talk-rage.webp")
  ];
  const SYSTEM_TRASH_TALK_LINES = [
    "阿西吧",
    "西八咯嘛！",
    "起来走走啊喂！痔疮要爆炸啦！",
    "嘴巴干不知道喝水啊？！没水杯啊？！",
    "没吃饭啊？一点精神都没？！",
    "我对你的敬仰真是如滔滔江水，连绵不绝，又有如黄河泛滥一发不可收拾！",
    "做妖就像做人一样，要有仁慈的心，有了仁慈的心，就不再是妖，而是人妖。",
    "不开心，就算长生不老也没用，开心，就算只能活几天也足够！",
    "原来那个女孩子在我心里留下了一滴眼泪，我完全可以感受到当时她是多么的伤心。",
    "曾经痛苦，才知道真正的痛苦；曾经执着，才能放下执着；曾经牵挂，才能了无牵挂。",
    "世间之爱皆是爱，没有大小之分。",
    "只有越来越强大，才能越来越童话。",
    "做人如果没梦想，那跟咸鱼有什么分别啊？",
    "只要你说我行，就算全天下的人都说我不行，我也不在乎。",
    "有时候你发现你爱上一个你讨厌的人，这段感情才是最要命的。",
    "别人只会在乎你做了多少、从不会在乎你说了多少、所以、我宁愿做、也不愿说。",
    "美好的爱情就是一个臭不要脸一个假装矜持，千万不要等到臭不要脸的那个走了，假装矜持的那个才哭了。",
    "别人笑我太疯癫，我笑他人看不穿。",
    "面子是别人给的，但有时候面子也是自己凑上来丢的。",
    "我以为凭我们的交情，可以讲点感情，没想到还是一笔生意。",
    "所以什么时候到b站给不才充个电啊？？！",
    "除暴安良是我们做市民的责任，行善积德是我本身的兴趣。",
    "不记得了也好，忘却也是一种幸福。",
    "我们虽然穷，但不乱说脏话，我们不去偷，我们不去抢，不属于自己的东西，我们不会拿。",
    "房子再大，你也只睡一张床。",
    "腰里揣着死耗子还冒充打猎的。",
    "打我啊笨蛋！",
    "命运真是不公平，为什么我这么帅却要掉头发，你们长的那么丑却不掉头发。",
    "如果你非要叫我跑龙套的，可不可以不要加个“死”字在前面？",
    "聋子都听得出，这句话是真心的。",
    "根本就没有什么食神，或者说，人人都是食神。",
    "我裤子都脱了一半了，再给次机会吧！",
    "我不是针对谁，我是说在座各位都是垃圾。",
    "不见五陵豪杰墓，无花无酒锄作田",
    "我那么喜欢你，你喜欢我一下会死啊？",
    "如果非要在这份爱上加上一个期限，我希望是一万年‌。",
    "努力！奋斗！",
    "为什么坚持？想一想当初。",
    "你回火星吧，地球是很危险的。",
    "前面漆黑一片，什么也看不到。也不是，天亮后会很美的。",
    "你以为躲在这里就找不到你吗？像黑夜里的萤火虫那样鲜明。",
    "一乡二里共三夫子不识四书五经六艺竟敢教七八九子十分大胆！",
    "小强！小强你怎么了小强？",
    "我一秒钟几十万上下，我会和你去踢球？",
    "就算是一条内裤，一卷卫生纸也有它的用处‌！",
    "我只是想证明，就算是小人物，也有大梦想‌。",
    "我对你的敬仰真是如滔滔江水，连绵不绝‌。",
    "凭你的智慧，我很难跟你解释。",
    "难道我学过如来神掌也要说给你听吗？",
    "不上班行不行？",
    "你先养好你自己吧，傻瓜！",
    "人生若只如初见，何事秋风悲画扇",
    "此情可待成追忆，只是当时已惘然",
    "多情自古伤离别，更那堪冷落清秋节",
    "昨夜星辰昨夜风，画楼西畔桂堂东。身无彩凤双飞翼，心有灵犀一点通",
    "昔日芙蓉花，今成断根草",
    "日上三竿我独眠，谁是神仙，我是神仙。南山空谷书一卷，疯也痴癫，狂也痴癫。",
    "腹内胎生异锦，笔端舌喷长江。纵教匹绢字难偿，不屑与人称量。",
    "酒酣耳热说文章。惊倒邻墙，推倒胡床。旁观拍手笑疏狂，疏又何妨，狂又何妨？",
    "我见青山多妩媚，料青山见我应如是。情与貌，略相似。",
    "吾文如万斛泉源，不择地皆可出。在平地，滔滔汩汩，虽一日千里无难。",
    "少年上人号怀素，草书天下称独步。墨池飞出北溟鱼，笔锋杀尽中山兔。",
    "昔年有狂客，号尔谪仙人。笔落惊风雨，诗成泣鬼神。",
    "不恨古人吾不见，恨古人、不见吾狂耳。",
    "老子舞时不须拍，梅花乱插乌巾香。尊前作剧莫相笑，我死诸君思我狂。",
    "当时年少春衫薄，骑马倚斜桥，满楼红袖招。",
    "便作春江都是泪，流不尽，许多愁。",
    "我以天地为栋宇，屋室为裈衣。诸君何为入我裈中？",
    "十步杀一人，千里不留行。事了拂衣去，深藏身与名。",
    "斗酒十千恣欢谑，但愿长醉不复醒",
    "天生我材必有用，千金散尽复还来",
    "曾经沧海难为水，除却巫山不是云。取次花丛懒回顾，半缘修道半缘君。",
    "斯是陋室，惟吾德馨",
    "但识琴中趣，何劳弦上声",
    "回字有四种写法你知道麼？",
    "富贵不归故乡，如衣锦夜行",
    "天下才共一石，曹子建独得八斗，我得一斗，自古及今共用一斗。",
    "晚来天欲雪，能饮一杯无。",
    "大丈夫何患无妻",
    "心事同漂泊，生涯共苦辛。无论去与住，俱是梦中人。",
    "同心一人去，坐觉长安空。",
    "乱山残雪夜，孤烛异乡人。",
    "火冷灯稀霜露下，昏昏雪意云垂野。",
    "桃李春风一杯酒，江湖夜雨十年灯。",
    "万里沧江生白发，几人灯火坐黄昏？",
    "雪月最相宜，梅雪都清绝。",
    "毕竟几人真得鹿，不知终日梦为鱼。",
    "出门一笑无拘碍，云在东湖月在天。",
    "檐流未滴梅花冻，一种清孤不等闲。",
    "晚岁既知三字误，终身只合两山间。",
    "江寒水不流，鱼嚼梅花影。",
    "人生难得秋前雨，乞我虚堂自在眠。",
    "吾日三省吾身。",
    "巧言令色，鲜矣仁！",
    "人不知而不愠，不亦君子乎？",
    "过则勿惮改。",
    "温故而知新，可以为师矣。",
    "不患人之不已知，患不知人也。",
    "不在其位，不谋其政。",
    "君子坦荡荡，小人长戚戚。",
    "知之者不如好之者，好之者不如乐之者。",
    "君子食无求饱，居无求安，敏于事而慎于言，就有道而正焉，可谓好学也已。",
    "推荐一部我这辈子唯一看吐了的恐怖片《人体蜈蚣》"
  ];

  const SHOTLAB_SOURCE_EXT = "MIORNING_SHOTLAB_EXT";
  const SHOTLAB_SOURCE_PAGE = "MIORNING_SHOTLAB_PAGE";

  const DEFAULT_COMMON_PROMPTS = [
    "不要BGM，不要字幕，只要环境音效和动作音效。"
  ];

  const DEFAULT_STATE = {
    enabled: true,
    guardSites: [],
    autoBackupEnabled: true,
    dlc: window.MiorningModulePolicy.normalizeModules(null),
    hotkeyMode: "backtick",
    collectHotkeyMode: "ctrl_b",
    shortcutBindings: {
      toggle: ["Backquote"],
      collect: ["Control", "KeyB"],
      inspirationCapture: ["Alt", "F1"],
      inspirationBox: ["Alt", "F2"],
      stylePicker: ["Alt", "Backquote"],
      quickWheel: ["Alt", "KeyQ"],
      trashTalk: ["Alt", "KeyT"]
    },
    quickWheelActions: { 1: "", 2: "", 3: "", 4: "" },
    pieSkin: "classic",
    trashTalk: {
      systemEnabled: true,
      recentDurations: [],
      reminder: { active: false, endAt: 0, message: "" }
    },
    activeCategory: "常用补全",
    collectCategory: "常用补全",
    uiTheme: "night",
    shotlabCanvasEnhancer: {
      enabled: true,
      focusSelected: true,
      fitCanvas: true,
      groupSelected: true,
      ungroupSelected: true,
      altDuplicate: true
    },
    guardPopupCount: 0,
    usageCount: 0,
    collectCount: 0,
    inspirationCount: 0,
    unlockedAchievements: [],
    allAchievementsRewardShown: false,
    easterHidden: false,
    modalHeroImage: "",
    floatingPosition: null,
    promptThumbs: {},
    promptThumbVersion: 2,
    categories: {
      "常用补全": DEFAULT_COMMON_PROMPTS
    }
  };


  const ACHIEVEMENTS = [
    { id: "use_1", type: "use", threshold: 1, name: "提示词试吃员", desc: "先尝一口，别急着嫌弃。", icon: "◎" },
    { id: "use_10", type: "use", threshold: 10, name: "复制键熟练工", desc: "复制得很熟，内容另说。", icon: "◉" },
    { id: "use_50", type: "use", threshold: 50, name: "提示词小厨子", desc: "调料齐了，锅糊没糊另说。", icon: "◆" },
    { id: "use_100", type: "use", threshold: 100, name: "提示词批发商", desc: "这不是创作，这是进货。", icon: "◈" },
    { id: "use_500", type: "use", threshold: 500, name: "提示词永动机", desc: "鼠标已提交工伤申请。", icon: "◇" },

    { id: "collect_1", type: "collect", threshold: 1, name: "捡破烂初心者", desc: "第一句捡到手，开张了。", icon: "◎" },
    { id: "collect_10", type: "collect", threshold: 10, name: "提示词小仓鼠", desc: "先囤着，用不用以后再说。", icon: "◉" },
    { id: "collect_50", type: "collect", threshold: 50, name: "赛博捡破烂王", desc: "别人刷视频，你忙着捡句子。", icon: "◆" },
    { id: "collect_100", type: "collect", threshold: 100, name: "仓库总管理员", desc: "分类没炸，已经很专业。", icon: "◈" },
    { id: "collect_500", type: "collect", threshold: 500, name: "提示词囤积狂", desc: "医生建议先停止囤积。", icon: "◇" },

    { id: "remind_1", type: "remind", threshold: 1, name: "第一次被拦住", desc: "第一次被拦，先别生气。", icon: "◎" },
    { id: "remind_10", type: "remind", threshold: 10, name: "回车被害妄想", desc: "现在看见回车就心虚。", icon: "◉" },
    { id: "remind_50", type: "remind", threshold: 50, name: "错误观察专员", desc: "错误没犯，羞耻先到了。", icon: "◆" },
    { id: "remind_100", type: "remind", threshold: 100, name: "保险栓老客户", desc: "建议直接续费终身会员。", icon: "◈" },
    { id: "remind_500", type: "remind", threshold: 500, name: "回车渡劫天尊", desc: "八十一难，您超额完成。", icon: "◇" },

    { id: "inspiration_1", type: "inspiration", threshold: 1, name: "灵感拾荒新人", desc: "终于不是截图失踪人口。", icon: "◎" },
    { id: "inspiration_10", type: "inspiration", threshold: 10, name: "电子松鼠过冬", desc: "先囤着，冬天未必会用。", icon: "◉" },
    { id: "inspiration_50", type: "inspiration", threshold: 50, name: "参考图军火商", desc: "库存一开，气势不能输。", icon: "◆" },
    { id: "inspiration_100", type: "inspiration", threshold: 100, name: "赛博仓鼠本鼠", desc: "硬盘没乱，只是物品很多。", icon: "◈" },
    { id: "inspiration_500", type: "inspiration", threshold: 500, name: "灵感垃圾场主", desc: "每张有用，日期尚未出生。", icon: "◇" }
  ];

  const ACHIEVEMENT_LINES = {
    use: "使用提示词次数",
    collect: "录入提示词数量",
    remind: "强制提醒次数",
    inspiration: "收纳灵感数量"
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
    shotlabPanel: null,
    floatingDock: null,
    floatingHover: false,
    floatingDrag: null,
    thumbPreview: null,
    pressedShortcutCodes: new Set(),
    hotkeyRecording: null,
    lastPointer: { x: 0, y: 0 },
    quickWheel: null,
    quickActionPanel: null,
    pieSkinPanel: null,
    trashTalkPanel: null,
    trashTalkReminder: null,
    trashTalkBabbleTimer: null,
    trashTalkSystemInterval: null,
    trashTalkWelcomeKey: "",
    trashTalkBabblePriority: 0,
    trashTalkBabbleReservedUntil: 0,
    lastSystemTrashTalkIndex: -1,
    trashTalkLastActivityAt: Date.now(),
    lastTrashTalkImage: -1
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function mergeState(saved) {
    const merged = clone(DEFAULT_STATE);
    if (!saved || typeof saved !== "object") return merged;

    merged.enabled = typeof saved.enabled === "boolean" ? saved.enabled : merged.enabled;
    merged.guardSites = window.MiorningModulePolicy.normalizeSites(saved.guardSites);
    merged.autoBackupEnabled = saved.autoBackupEnabled !== false;
    merged.dlc = window.MiorningModulePolicy.normalizeModules(saved.dlc, !saved.dlc);

    const allowedHotkeys = new Set(["backtick", "ctrl_backtick", "ctrl_alt_backtick"]);
    merged.hotkeyMode = allowedHotkeys.has(saved.hotkeyMode) ? saved.hotkeyMode : merged.hotkeyMode;

    const allowedThemes = new Set(["night", "day"]);
    merged.uiTheme = allowedThemes.has(saved.uiTheme) ? saved.uiTheme : merged.uiTheme;

    const shotlabSaved = saved.shotlabCanvasEnhancer && typeof saved.shotlabCanvasEnhancer === "object"
      ? saved.shotlabCanvasEnhancer
      : {};
    merged.shotlabCanvasEnhancer = {
      enabled: typeof shotlabSaved.enabled === "boolean" ? shotlabSaved.enabled : true,
      focusSelected: typeof shotlabSaved.focusSelected === "boolean" ? shotlabSaved.focusSelected : true,
      fitCanvas: typeof shotlabSaved.fitCanvas === "boolean"
        ? shotlabSaved.fitCanvas
        : (typeof shotlabSaved.zoomMinimum === "boolean" ? shotlabSaved.zoomMinimum : true),
      groupSelected: typeof shotlabSaved.groupSelected === "boolean" ? shotlabSaved.groupSelected : true,
      ungroupSelected: typeof shotlabSaved.ungroupSelected === "boolean" ? shotlabSaved.ungroupSelected : true,
      altDuplicate: typeof shotlabSaved.altDuplicate === "boolean" ? shotlabSaved.altDuplicate : true
    };

    merged.guardPopupCount = Number.isFinite(saved.guardPopupCount) ? Math.max(0, Math.floor(saved.guardPopupCount)) : 0;
    merged.usageCount = Number.isFinite(saved.usageCount) ? Math.max(0, Math.floor(saved.usageCount)) : 0;
    merged.collectCount = Number.isFinite(saved.collectCount) ? Math.max(0, Math.floor(saved.collectCount)) : 0;
    merged.inspirationCount = Number.isFinite(saved.inspirationCount) ? Math.max(0, Math.floor(saved.inspirationCount)) : 0;
    merged.unlockedAchievements = Array.isArray(saved.unlockedAchievements) ? saved.unlockedAchievements.filter(x => typeof x === "string") : [];
    merged.allAchievementsRewardShown = typeof saved.allAchievementsRewardShown === "boolean" ? saved.allAchievementsRewardShown : false;
    if (!merged.unlockedAchievements.some((id) => id.startsWith("inspiration_"))) {
      merged.allAchievementsRewardShown = false;
    }
    merged.easterHidden = typeof saved.easterHidden === "boolean" ? saved.easterHidden : false;
    merged.modalHeroImage = typeof saved.modalHeroImage === "string" ? saved.modalHeroImage : "";
    const savedFloatingPosition = saved.floatingPosition && typeof saved.floatingPosition === "object"
      ? saved.floatingPosition
      : null;
    merged.floatingPosition = savedFloatingPosition && Number.isFinite(savedFloatingPosition.xRatio) && Number.isFinite(savedFloatingPosition.yRatio)
      ? {
          xRatio: Math.min(1, Math.max(0, savedFloatingPosition.xRatio)),
          yRatio: Math.min(1, Math.max(0, savedFloatingPosition.yRatio))
        }
      : null;
    merged.promptThumbs = saved.promptThumbs && typeof saved.promptThumbs === "object" ? saved.promptThumbs : {};
    merged.promptThumbVersion = saved.promptThumbVersion === 2 ? 2 : 1;

    const allowedCollectHotkeys = new Set(["ctrl_b", "ctrl_q"]);
    merged.collectHotkeyMode = allowedCollectHotkeys.has(saved.collectHotkeyMode) ? saved.collectHotkeyMode : merged.collectHotkeyMode;

    const legacyToggle = merged.hotkeyMode === "ctrl_alt_backtick"
      ? ["Control", "Alt", "Backquote"]
      : (merged.hotkeyMode === "ctrl_backtick" ? ["Control", "Backquote"] : ["Backquote"]);
    const legacyCollect = merged.collectHotkeyMode === "ctrl_q" ? ["Control", "KeyQ"] : ["Control", "KeyB"];
    const shortcutSource = saved.shortcutBindings && typeof saved.shortcutBindings === "object" ? saved.shortcutBindings : {};
    merged.shortcutBindings = {
      toggle: normalizeShortcutCodes(shortcutSource.toggle, legacyToggle),
      collect: normalizeShortcutCodes(shortcutSource.collect, legacyCollect),
      inspirationCapture: normalizeShortcutCodes(shortcutSource.inspirationCapture, ["Alt", "F1"]),
      inspirationBox: normalizeShortcutCodes(shortcutSource.inspirationBox, ["Alt", "F2"]),
      stylePicker: normalizeShortcutCodes(shortcutSource.stylePicker, ["Alt", "Backquote"]),
      quickWheel: normalizeShortcutCodes(shortcutSource.quickWheel, ["Alt", "KeyQ"]),
      trashTalk: normalizeShortcutCodes(shortcutSource.trashTalk, ["Alt", "KeyT"])
    };
    const validQuickActions = new Set(["", "manager", "inspiration", "capture", "toggle", "trashTalk"]);
    const savedQuickActions = saved.quickWheelActions && typeof saved.quickWheelActions === "object"
      ? saved.quickWheelActions
      : {};
    merged.quickWheelActions = {};
    [1, 2, 3, 4].forEach((quadrant) => {
      const action = String(savedQuickActions[quadrant] || "");
      merged.quickWheelActions[quadrant] = validQuickActions.has(action) ? action : "";
    });
    merged.pieSkin = ["classic", "girl", "cyber"].includes(saved.pieSkin) ? saved.pieSkin : "classic";
    const savedTrashTalk = saved.trashTalk && typeof saved.trashTalk === "object" ? saved.trashTalk : {};
    const savedReminder = savedTrashTalk.reminder && typeof savedTrashTalk.reminder === "object" ? savedTrashTalk.reminder : {};
    merged.trashTalk = {
      systemEnabled: typeof savedTrashTalk.systemEnabled === "boolean" ? savedTrashTalk.systemEnabled : true,
      recentDurations: Array.from(new Set((Array.isArray(savedTrashTalk.recentDurations) ? savedTrashTalk.recentDurations : [])
        .map((value) => Math.floor(Number(value)))
        .filter((value) => value >= 1 && value <= 24 * 60 * 60))).slice(0, 3),
      reminder: {
        active: Boolean(savedReminder.active),
        endAt: Math.max(0, Number(savedReminder.endAt || 0)),
        message: String(savedReminder.message || "").slice(0, 200)
      }
    };

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
      chrome.storage?.local?.get([STORAGE_KEY, ...OLD_STORAGE_KEYS], async (res) => {
        if (chrome.runtime.lastError) return;
        const previousState = OLD_STORAGE_KEYS.map((key) => res?.[key]).find(Boolean);
        STATE.data = mergeState(res?.[STORAGE_KEY] || previousState);
        applyThemeClass();
        applyFloatingState();
        applyDlcRuntime();
        initializeSystemTrashTalk();
        resumeUserReminder();
        try { await optimizePromptThumbsIfNeeded(); } catch (_) {}
        saveState();
      });
    } catch (_) {
      STATE.data = clone(DEFAULT_STATE);
    }
  }

  function applyThemeClass() {
    const root = document.documentElement;
    root.classList.remove("mpg-theme-night", "mpg-theme-day");
    root.classList.add(STATE.data.uiTheme === "day" ? "mpg-theme-day" : "mpg-theme-night");
    root.classList.remove("mpg-pie-skin-classic", "mpg-pie-skin-girl", "mpg-pie-skin-cyber");
    root.classList.add(`mpg-pie-skin-${STATE.data.pieSkin || "classic"}`);
  }

  function saveState() {
    applyThemeClass();
    sendShotlabConfig();
    const snapshot = clone(STATE.data);
    return new Promise((resolve) => {
      try {
        if (!chrome.storage?.local?.set) return resolve(false);
        chrome.storage.local.set({ [STORAGE_KEY]: snapshot }, () => {
          resolve(!chrome.runtime.lastError);
        });
      } catch (_) { resolve(false); }
    });
  }

  function isShotlabCanvasPage() {
    return location.hostname === "aigc.xinpianchang.com" &&
      (location.pathname === "/canvas" || location.pathname.startsWith("/canvas/"));
  }

  function getShotlabConfig() {
    const saved = STATE.data.shotlabCanvasEnhancer || DEFAULT_STATE.shotlabCanvasEnhancer;
    return {
      enabled: isDlcEnabled("shotlab") && saved.enabled !== false,
      focusSelected: saved.focusSelected !== false,
      fitCanvas: saved.fitCanvas !== false,
      groupSelected: saved.groupSelected !== false,
      ungroupSelected: saved.ungroupSelected !== false,
      altDuplicate: saved.altDuplicate !== false,
      showToasts: false,
      debug: false
    };
  }

  function sendShotlabConfig() {
    if (location.hostname !== "aigc.xinpianchang.com") return;
    window.postMessage({
      source: SHOTLAB_SOURCE_EXT,
      type: "config",
      payload: getShotlabConfig()
    }, "*");
  }

  function onShotlabBridgeMessage(event) {
    if (event.source !== window || !event.data || event.data.source !== SHOTLAB_SOURCE_PAGE) return;
    if (event.data.type === "ready") {
      sendShotlabConfig();
      return;
    }
    if (event.data.type === "toast") {
      const payload = event.data.payload || {};
      if (payload.level === "error") showToast(payload.message || "");
    }
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

  function loadImageElement(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("image-decode-error"));
      image.src = dataUrl;
    });
  }

  async function compressPromptThumbnail(dataUrl) {
    if (!dataUrl) return "";
    const image = await loadImageElement(dataUrl);
    const maxWidth = 320;
    const maxHeight = 200;
    const scale = Math.min(1, maxWidth / Math.max(1, image.naturalWidth), maxHeight / Math.max(1, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d", { alpha: false });
    context.fillStyle = "#111";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/webp", 0.72);
  }

  async function optimizePromptThumbsIfNeeded(target = STATE.data) {
    if (target.promptThumbVersion === 2) return false;
    const groups = target.promptThumbs && typeof target.promptThumbs === "object"
      ? target.promptThumbs
      : {};
    for (const [category, thumbs] of Object.entries(groups)) {
      if (!Array.isArray(thumbs)) continue;
      for (let index = 0; index < thumbs.length; index += 1) {
        if (!thumbs[index]) continue;
        try { thumbs[index] = await compressPromptThumbnail(thumbs[index]); } catch (_) {}
      }
      groups[category] = thumbs;
    }
    target.promptThumbs = groups;
    target.promptThumbVersion = 2;
    return true;
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

  async function exportFullConfig() {
    try { await optimizePromptThumbsIfNeeded(); } catch (_) {}
    let inspirationBox = null;
    try {
      inspirationBox = await window.MiorningInspiration?.exportData?.();
    } catch (_) {
      showToast("灵感箱图片未能打包，其他配置仍会正常导出");
    }
    const payload = {
      name: "Miorning Prompt Guard Config",
      version: "1.8.0",
      exportedAt: new Date().toISOString(),
      data: STATE.data,
      inspirationBox
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
      reader.onload = async () => {
        try {
          const parsed = JSON.parse(String(reader.result || "{}"));
          const rawData = parsed && typeof parsed === "object" && parsed.data ? parsed.data : parsed;
          const importedState = mergeState(rawData);
          try { await optimizePromptThumbsIfNeeded(importedState); } catch (_) {}
          if (parsed?.inspirationBox) {
            await window.MiorningInspiration?.importData?.(parsed.inspirationBox);
          }
          STATE.data = importedState;
          saveState();
          applyFloatingState();
          showToast("配置已导入");
          applyDlcRuntime();
          closeManager();
          window.MiorningHub.open();
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
    if (ach.type === "inspiration") return Number(STATE.data.inspirationCount || 0);
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

  function recordInspiration(count = 1) {
    STATE.data.inspirationCount = Math.max(0, Number(STATE.data.inspirationCount || 0)) + count;
    saveState();
    maybeUnlockAchievements("inspiration");
  }


  function showAchievementPopup(ach) {
    if (!isDlcEnabled("achievements")) return;
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
    if (!isDlcEnabled("achievements")) return;
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
    if (!isDlcEnabled("achievements")) return;
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
    if (!isDlcEnabled("achievements")) return window.MiorningHub.open("dlc");
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
          ${achievementLineHtml("inspiration")}
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

  const SHORTCUT_ORDER = ["Control", "Alt", "Shift", "Meta"];
  const SHORTCUT_DEFAULTS = {
    toggle: ["Backquote"],
    collect: ["Control", "KeyB"],
    inspirationCapture: ["Alt", "F1"],
    inspirationBox: ["Alt", "F2"],
    stylePicker: ["Alt", "Backquote"],
    quickWheel: ["Alt", "KeyQ"],
    trashTalk: ["Alt", "KeyT"]
  };

  function canonicalShortcutCode(code) {
    const value = String(code || "");
    if (value === "ControlLeft" || value === "ControlRight" || value === "Ctrl") return "Control";
    if (value === "AltLeft" || value === "AltRight") return "Alt";
    if (value === "ShiftLeft" || value === "ShiftRight") return "Shift";
    if (value === "MetaLeft" || value === "MetaRight" || value === "OSLeft" || value === "OSRight") return "Meta";
    return value;
  }

  function normalizeShortcutCodes(value, fallback = ["Backquote"]) {
    const source = Array.isArray(value) ? value : (Array.isArray(value?.codes) ? value.codes : []);
    const unique = Array.from(new Set(source.map(canonicalShortcutCode).filter(Boolean)));
    const normalized = unique.sort((a, b) => {
      const ai = SHORTCUT_ORDER.indexOf(a);
      const bi = SHORTCUT_ORDER.indexOf(b);
      if (ai >= 0 || bi >= 0) return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
      return a.localeCompare(b);
    });
    return normalized.length ? normalized.slice(0, 3) : fallback.slice();
  }

  function shortcutCodeLabel(code) {
    const labels = {
      Control: "Ctrl", Alt: "Alt", Shift: "Shift", Meta: "Win",
      Backquote: "~", Space: "Space", Escape: "Esc", Delete: "Delete",
      Backspace: "Backspace", Enter: "Enter", Tab: "Tab",
      ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→",
      BracketLeft: "[", BracketRight: "]", Semicolon: ";", Quote: "'",
      Comma: ",", Period: ".", Slash: "/", Backslash: "\\",
      Minus: "-", Equal: "="
    };
    if (labels[code]) return labels[code];
    if (/^Key[A-Z]$/.test(code)) return code.slice(3);
    if (/^Digit[0-9]$/.test(code)) return code.slice(5);
    if (/^Numpad[0-9]$/.test(code)) return `Num ${code.slice(6)}`;
    return code || "未设置";
  }

  function shortcutLabel(codes) {
    return normalizeShortcutCodes(codes).map(shortcutCodeLabel).join(" + ");
  }

  function getShortcutBinding(key) {
    return normalizeShortcutCodes(STATE.data.shortcutBindings?.[key], SHORTCUT_DEFAULTS[key]);
  }

  function currentShortcutCodes(event) {
    const codes = new Set(STATE.pressedShortcutCodes);
    const ownCode = canonicalShortcutCode(event.code || event.key);
    if (ownCode) codes.add(ownCode);
    if (event.ctrlKey) codes.add("Control");
    if (event.altKey) codes.add("Alt");
    if (event.shiftKey) codes.add("Shift");
    if (event.metaKey) codes.add("Meta");
    return normalizeShortcutCodes(Array.from(codes));
  }

  function shortcutSetsEqual(a, b) {
    const left = normalizeShortcutCodes(a);
    const right = normalizeShortcutCodes(b);
    return left.length === right.length && left.every((code, index) => code === right[index]);
  }

  function matchesShortcut(event, key) {
    const moduleId = window.MiorningModulePolicy.shortcutModules[key];
    if (moduleId && !isDlcEnabled(moduleId)) return false;
    if (event.repeat) return false;
    return shortcutSetsEqual(currentShortcutCodes(event), getShortcutBinding(key));
  }

  function findShortcutConflict(key, codes) {
    return Object.keys(SHORTCUT_DEFAULTS).find((other) => other !== key && shortcutSetsEqual(codes, getShortcutBinding(other))) || "";
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
      const okTypes = new Set(["text", "search", "url"]);
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

  const FLOATING_ICON_SIZE = 42;
  const FLOATING_HANDLE_WIDTH = 28;

  function floatingBounds() {
    const minX = FLOATING_HANDLE_WIDTH;
    const maxX = Math.max(minX, window.innerWidth - FLOATING_ICON_SIZE);
    const minY = 0;
    const maxY = Math.max(minY, window.innerHeight - FLOATING_ICON_SIZE);
    return { minX, maxX, minY, maxY };
  }

  function setFloatingPixelPosition(iconX, iconY) {
    const dock = STATE.floatingDock || document.getElementById("mpg-floating-dock");
    if (!dock) return;
    const bounds = floatingBounds();
    const x = Math.min(bounds.maxX, Math.max(bounds.minX, Number(iconX) || 0));
    const y = Math.min(bounds.maxY, Math.max(bounds.minY, Number(iconY) || 0));
    dock.style.setProperty("left", `${x - FLOATING_HANDLE_WIDTH}px`, "important");
    dock.style.setProperty("top", `${y}px`, "important");
    dock.style.setProperty("right", "auto", "important");
    dock.style.setProperty("bottom", "auto", "important");
    positionFloatingMessages();
    requestAnimationFrame(positionFloatingMessages);
    positionToastNearFloating();
  }

  function positionFloatingMessages() {
    const dock = STATE.floatingDock || document.getElementById("mpg-floating-dock");
    const btn = STATE.floating || document.getElementById("mpg-floating");
    if (!dock || !btn) return;
    const dockRect = dock.getBoundingClientRect();
    const iconRect = btn.getBoundingClientRect();
    const padding = 12;
    const gap = 9;
    const placeHorizontally = (node) => {
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const width = Math.min(Math.max(1, rect.width || 240), Math.max(1, window.innerWidth - padding * 2));
      const wantedCenter = iconRect.left + iconRect.width / 2;
      const center = Math.max(padding + width / 2, Math.min(window.innerWidth - padding - width / 2, wantedCenter));
      node.style.setProperty("left", `${center - dockRect.left}px`, "important");
    };

    const hint = dock.querySelector("#mpg-floating-hint");
    const babble = dock.querySelector("#mpg-floating-babble");
    placeHorizontally(hint);
    placeHorizontally(babble);

    const hintHeight = Math.max(1, hint?.getBoundingClientRect().height || 42);
    const babbleHeight = Math.max(1, babble?.getBoundingClientRect().height || 42);
    const roomAbove = Math.max(0, iconRect.top - padding - gap);
    const roomBelow = Math.max(0, window.innerHeight - iconRect.bottom - padding - gap);
    dock.classList.toggle("hint-above", roomBelow < hintHeight && roomAbove >= roomBelow);
    dock.classList.toggle("babble-below", roomAbove < babbleHeight && roomBelow > roomAbove);
  }

  function positionToastNearFloating() {
    const toast = document.getElementById("mpg-toast");
    const btn = STATE.floating || document.getElementById("mpg-floating");
    if (!toast || !btn) return;
    const iconRect = btn.getBoundingClientRect();
    const toastRect = toast.getBoundingClientRect();
    const width = Math.min(Math.max(1, window.innerWidth - 16), Math.max(1, toastRect.width || 240));
    const height = Math.min(Math.max(1, window.innerHeight - 16), Math.max(1, toastRect.height || 42));
    const left = Math.max(8, Math.min(window.innerWidth - width - 8, iconRect.left + iconRect.width / 2 - width / 2));
    const putAbove = iconRect.bottom + height + 12 > window.innerHeight;
    const top = putAbove
      ? Math.max(8, iconRect.top - height - 10)
      : Math.min(window.innerHeight - height - 8, iconRect.bottom + 10);
    toast.style.setProperty("left", `${left}px`, "important");
    toast.style.setProperty("top", `${top}px`, "important");
    toast.style.setProperty("right", "auto", "important");
    toast.style.setProperty("bottom", "auto", "important");
  }

  function applyFloatingPosition() {
    const position = STATE.data.floatingPosition;
    if (!position || !Number.isFinite(position.xRatio) || !Number.isFinite(position.yRatio)) {
      const dock = STATE.floatingDock || document.getElementById("mpg-floating-dock");
      if (dock) {
        dock.style.removeProperty("left");
        dock.style.removeProperty("top");
        dock.style.removeProperty("right");
        dock.style.removeProperty("bottom");
        dock.classList.remove("hint-above");
        dock.querySelector("#mpg-floating-hint")?.style.removeProperty("left");
        dock.querySelector("#mpg-floating-babble")?.style.removeProperty("left");
        requestAnimationFrame(positionFloatingMessages);
      }
      return;
    }
    const bounds = floatingBounds();
    const x = bounds.minX + (bounds.maxX - bounds.minX) * Math.min(1, Math.max(0, position.xRatio));
    const y = bounds.minY + (bounds.maxY - bounds.minY) * Math.min(1, Math.max(0, position.yRatio));
    setFloatingPixelPosition(x, y);
  }

  function rememberFloatingPosition(iconX, iconY) {
    const bounds = floatingBounds();
    const x = Math.min(bounds.maxX, Math.max(bounds.minX, Number(iconX) || 0));
    const y = Math.min(bounds.maxY, Math.max(bounds.minY, Number(iconY) || 0));
    STATE.data.floatingPosition = {
      xRatio: bounds.maxX === bounds.minX ? 0 : (x - bounds.minX) / (bounds.maxX - bounds.minX),
      yRatio: bounds.maxY === bounds.minY ? 0 : (y - bounds.minY) / (bounds.maxY - bounds.minY)
    };
    saveState();
  }

  function beginFloatingDrag(event, dock, btn, handle) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    clearTimeout(STATE.longPressTimer);
    const iconRect = btn.getBoundingClientRect();
    STATE.floatingDrag = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startIconX: iconRect.left,
      startIconY: iconRect.top
    };
    STATE.floatingHover = true;
    dock.classList.add("dragging");
    try { handle.setPointerCapture(event.pointerId); } catch (_) {}
  }

  function updateFloatingDrag(event) {
    const drag = STATE.floatingDrag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    setFloatingPixelPosition(
      drag.startIconX + event.clientX - drag.startClientX,
      drag.startIconY + event.clientY - drag.startClientY
    );
  }

  function finishFloatingDrag(event, dock, btn, handle) {
    const drag = STATE.floatingDrag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    try { handle.releasePointerCapture(event.pointerId); } catch (_) {}
    const iconRect = btn.getBoundingClientRect();
    STATE.floatingDrag = null;
    dock.classList.remove("dragging");
    STATE.floatingHover = dock.matches(":hover");
    rememberFloatingPosition(iconRect.left, iconRect.top);
  }

  function createFloating() {
    if (document.getElementById("mpg-floating-dock") || document.getElementById("mpg-floating")) return;

    const dock = document.createElement("div");
    dock.id = "mpg-floating-dock";

    const handle = document.createElement("button");
    handle.id = "mpg-floating-drag";
    handle.type = "button";
    handle.textContent = "⠿";
    handle.title = "拖动插件图标";
    handle.setAttribute("aria-label", "拖动插件图标");

    const btn = document.createElement("button");
    btn.id = "mpg-floating";
    btn.type = "button";
    btn.innerHTML = `<img alt="Miorning Prompt Guard">`;
    btn.setAttribute("aria-label", "Miorning Prompt Guard");

    const hint = document.createElement("span");
    hint.id = "mpg-floating-hint";
    hint.setAttribute("role", "tooltip");

    const babble = document.createElement("button");
    babble.id = "mpg-floating-babble";
    babble.type = "button";
    babble.setAttribute("aria-label", "关闭喵咛垃圾话");
    babble.addEventListener("mouseenter", hideSystemBabble, true);
    babble.addEventListener("click", hideSystemBabble, true);

    btn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.MiorningHub.open();
    }, true);

    btn.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      STATE.longPressFired = false;
      clearTimeout(STATE.longPressTimer);
      if (!isDlcEnabled("achievements")) return;
      STATE.longPressTimer = setTimeout(() => {
        STATE.longPressFired = true;
        showAchievementsPanel();
      }, 1000);
    }, true);

    dock.addEventListener("mouseenter", () => {
      STATE.floatingHover = true;
    }, true);

    btn.addEventListener("mouseup", () => {
      clearTimeout(STATE.longPressTimer);
    }, true);

    btn.addEventListener("mouseleave", () => {
      clearTimeout(STATE.longPressTimer);
    }, true);

    dock.addEventListener("mouseleave", () => {
      if (STATE.floatingDrag) return;
      STATE.floatingHover = false;
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

    handle.addEventListener("pointerdown", (event) => beginFloatingDrag(event, dock, btn, handle), true);
    handle.addEventListener("pointermove", updateFloatingDrag, true);
    handle.addEventListener("pointerup", (event) => finishFloatingDrag(event, dock, btn, handle), true);
    handle.addEventListener("pointercancel", (event) => finishFloatingDrag(event, dock, btn, handle), true);
    handle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }, true);
    handle.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
    }, true);

    dock.append(handle, btn, hint, babble);
    document.documentElement.appendChild(dock);
    STATE.floatingDock = dock;
    STATE.floating = btn;
    applyFloatingState();
  }

  function applyFloatingState() {
    const btn = STATE.floating || document.getElementById("mpg-floating");
    if (!btn) return;
    applyFloatingPosition();
    btn.classList.toggle("off", !STATE.data.enabled);
    const hintText = "左键开关保险栓 · 右键打开喵咛 · 左侧拖动搬家" +
      (isDlcEnabled("achievements") ? " · 按住 1 秒看成就" : "") +
      (isShotlabCanvasPage() && isDlcEnabled("shotlab") ? " · 悬停按 Tab 设置画布" : "");
    btn.removeAttribute("title");
    const hint = (STATE.floatingDock || document.getElementById("mpg-floating-dock"))?.querySelector("#mpg-floating-hint");
    if (hint) hint.textContent = hintText;
    const img = btn.querySelector("img");
    if (img) img.src = getFloatingIconSrc(STATE.data.enabled);
    positionToastNearFloating();
    positionFloatingMessages();
    requestAnimationFrame(positionFloatingMessages);
  }

  function isBilibiliPage() {
    return /(^|\.)bilibili\.com$/i.test(location.hostname);
  }

  function getSystemTrashTalkGreeting() {
    const hostname = String(location.hostname || "").toLowerCase();
    const pathname = (String(location.pathname || "/").replace(/\/+$/, "") || "/");
    if (hostname === "space.bilibili.com" && pathname === "/353186187") {
      return "你~干~嘛~不会是想要给我充电电吧？！这样不太好吧！（动作：边说边拉开打着补丁的口袋）";
    }
    if ((hostname === "miorning.vip" || hostname === "www.miorning.vip") && pathname === "/") {
      return "还回来干嘛？！";
    }
    if (isBilibiliPage()) return "哟，B友啊！你好你好你好：）";
    return "";
  }

  function hideSystemBabble(resetPriority = false) {
    clearTimeout(STATE.trashTalkBabbleTimer);
    STATE.trashTalkBabbleTimer = null;
    document.getElementById("mpg-floating-babble")?.classList.remove("show");
    if (resetPriority === true) {
      STATE.trashTalkBabblePriority = 0;
      STATE.trashTalkBabbleReservedUntil = 0;
    }
  }

  function showSystemBabble(message, duration = 60000, priority = 10) {
    const text = String(message ?? "").trim();
    if (!text || !isDlcEnabled("trashTalk") || !STATE.data.trashTalk?.systemEnabled) return;
    const now = Date.now();
    const normalizedPriority = Math.max(0, Number(priority) || 0);
    if (now < STATE.trashTalkBabbleReservedUntil && normalizedPriority <= STATE.trashTalkBabblePriority) return;
    const node = document.getElementById("mpg-floating-babble");
    if (!node) return;
    node.textContent = text;
    node.classList.add("show");
    STATE.trashTalkBabblePriority = normalizedPriority;
    STATE.trashTalkBabbleReservedUntil = now + Math.max(1000, Number(duration) || 60000);
    positionFloatingMessages();
    requestAnimationFrame(positionFloatingMessages);
    clearTimeout(STATE.trashTalkBabbleTimer);
    STATE.trashTalkBabbleTimer = setTimeout(() => hideSystemBabble(true), duration);
  }

  function pickSystemTrashTalkLine() {
    if (!SYSTEM_TRASH_TALK_LINES.length) return "";
    let index = Math.floor(Math.random() * SYSTEM_TRASH_TALK_LINES.length);
    if (SYSTEM_TRASH_TALK_LINES.length > 1 && index === STATE.lastSystemTrashTalkIndex) {
      index = (index + 1 + Math.floor(Math.random() * (SYSTEM_TRASH_TALK_LINES.length - 1))) % SYSTEM_TRASH_TALK_LINES.length;
    }
    STATE.lastSystemTrashTalkIndex = index;
    return SYSTEM_TRASH_TALK_LINES[index];
  }

  function initializeSystemTrashTalk() {
    clearInterval(STATE.trashTalkSystemInterval);
    STATE.trashTalkSystemInterval = null;
    if (!isDlcEnabled("trashTalk") || !STATE.data.trashTalk?.systemEnabled) {
      hideSystemBabble(true);
      return;
    }

    const greeting = getSystemTrashTalkGreeting();
    const welcomeKey = greeting
      ? `${String(location.hostname || "").toLowerCase()}${String(location.pathname || "/").replace(/\/+$/, "") || "/"}`
      : "";
    if (greeting && welcomeKey !== STATE.trashTalkWelcomeKey) {
      STATE.trashTalkWelcomeKey = welcomeKey;
      setTimeout(() => showSystemBabble(greeting, 60000, 30), 500);
    }

    if (!isBilibiliPage()) return;
    STATE.trashTalkSystemInterval = setInterval(() => {
      const now = Date.now();
      if (now - STATE.trashTalkLastActivityAt < 3 * 60 * 1000) return;
      if (now < STATE.trashTalkBabbleReservedUntil) return;
      showSystemBabble(pickSystemTrashTalkLine(), 60000, 10);
    }, 3 * 60 * 1000);
  }

  function scheduleTrashTalkAlarm(reminder) {
    try {
      chrome.runtime.sendMessage({ type: "mpg-trash-talk:schedule", reminder });
    } catch (_) {}
  }

  function rememberTrashTalkDuration(totalSeconds) {
    const seconds = Math.max(1, Math.min(24 * 60 * 60, Math.floor(Number(totalSeconds) || 0)));
    const recent = Array.isArray(STATE.data.trashTalk?.recentDurations)
      ? STATE.data.trashTalk.recentDurations
      : [];
    STATE.data.trashTalk.recentDurations = [seconds, ...recent.filter((value) => Number(value) !== seconds)].slice(0, 3);
  }

  function scheduleUserReminder(totalSeconds, message, rememberDuration = false) {
    const seconds = Math.max(1, Math.min(24 * 60 * 60, Math.floor(Number(totalSeconds) || 0)));
    if (rememberDuration) rememberTrashTalkDuration(seconds);
    STATE.data.trashTalk.reminder = {
      active: true,
      endAt: Date.now() + seconds * 1000,
      message: String(message || "该干活了，大人。").trim().slice(0, 200)
    };
    saveState();
    scheduleTrashTalkAlarm(STATE.data.trashTalk.reminder);
  }

  function clearUserReminder() {
    STATE.data.trashTalk.reminder = { active: false, endAt: 0, message: "" };
    saveState();
    scheduleTrashTalkAlarm(STATE.data.trashTalk.reminder);
  }

  function resumeUserReminder() {
    if (!isDlcEnabled("trashTalk")) return;
    const reminder = STATE.data.trashTalk?.reminder;
    if (!reminder?.active) return;
    if (Number(reminder.endAt || 0) <= Date.now()) {
      const message = reminder.message;
      clearUserReminder();
      showTrashTalkReminder(message);
      return;
    }
    scheduleTrashTalkAlarm(reminder);
  }

  function durationFromFields(root) {
    const hours = Math.max(0, Math.min(24, Number(root.querySelector("[data-trash-hours]")?.value || 0)));
    const minutes = Math.max(0, Math.min(59, Number(root.querySelector("[data-trash-minutes]")?.value || 0)));
    const seconds = Math.max(0, Math.min(59, Number(root.querySelector("[data-trash-seconds]")?.value || 0)));
    return Math.min(24 * 60 * 60, Math.floor(hours * 3600 + minutes * 60 + seconds));
  }

  function fillTrashTalkDuration(root, totalSeconds) {
    const value = Math.max(1, Math.min(24 * 60 * 60, Math.floor(Number(totalSeconds) || 0)));
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;
    const hoursInput = root.querySelector("[data-trash-hours]");
    const minutesInput = root.querySelector("[data-trash-minutes]");
    const secondsInput = root.querySelector("[data-trash-seconds]");
    if (hoursInput) hoursInput.value = String(hours);
    if (minutesInput) minutesInput.value = String(minutes);
    if (secondsInput) secondsInput.value = String(seconds);
  }

  function trashTalkDurationLabel(totalSeconds) {
    const value = Math.max(1, Math.floor(Number(totalSeconds) || 0));
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;
    return [
      hours ? `${hours}小时` : "",
      minutes ? `${minutes}分钟` : "",
      seconds ? `${seconds}秒` : ""
    ].filter(Boolean).join("") || "1秒";
  }

  function pickTrashTalkImage() {
    let index = Math.floor(Math.random() * TRASH_TALK_IMAGES.length);
    if (TRASH_TALK_IMAGES.length > 1 && index === STATE.lastTrashTalkImage) {
      index = (index + 1 + Math.floor(Math.random() * (TRASH_TALK_IMAGES.length - 1))) % TRASH_TALK_IMAGES.length;
    }
    STATE.lastTrashTalkImage = index;
    return TRASH_TALK_IMAGES[index];
  }

  function closeTrashTalkReminder() {
    document.getElementById("mpg-trash-talk-reminder-root")?.remove();
    STATE.trashTalkReminder = null;
  }

  function showTrashTalkReminder(message) {
    if (!isDlcEnabled("trashTalk")) return;
    closeTrashTalkReminder();
    const root = document.createElement("div");
    root.id = "mpg-trash-talk-reminder-root";
    root.innerHTML = `
      <div class="mpg-trash-talk-reminder" role="alertdialog" aria-modal="true" aria-label="喵咛强制提醒">
        <img src="${safeText(pickTrashTalkImage())}" alt="黑猫喊冤，白猫宣布吉时已到">
        <div class="mpg-trash-talk-message">${safeText(message || "该干活了，大人。")}</div>
        <div class="mpg-trash-talk-verdicts">
          <button type="button" data-trash-verdict="postpone">刀下留人</button>
          <button type="button" class="danger" data-trash-verdict="execute">斩立决！</button>
        </div>
        <div class="mpg-trash-talk-postpone" hidden>
          <strong>留人多久？</strong>
          <div class="mpg-trash-duration">
            <label><input type="number" min="0" max="24" value="0" data-trash-hours>小时</label>
            <label><input type="number" min="0" max="59" value="5" data-trash-minutes>分钟</label>
            <label><input type="number" min="0" max="59" value="0" data-trash-seconds>秒</label>
          </div>
          <div class="mpg-trash-talk-postpone-actions">
            <button type="button" data-trash-postpone-cancel>算了</button>
            <button type="button" data-trash-postpone-confirm>确认留人</button>
          </div>
        </div>
      </div>
    `;
    (document.fullscreenElement || document.documentElement).appendChild(root);
    STATE.trashTalkReminder = root;
    root.addEventListener("click", (event) => {
      const verdict = event.target.closest?.("[data-trash-verdict]")?.getAttribute("data-trash-verdict");
      if (verdict === "execute") {
        clearUserReminder();
        closeTrashTalkReminder();
        return;
      }
      if (verdict === "postpone") {
        root.querySelector(".mpg-trash-talk-postpone").hidden = false;
        return;
      }
      if (event.target.closest?.("[data-trash-postpone-cancel]")) {
        root.querySelector(".mpg-trash-talk-postpone").hidden = true;
        return;
      }
      if (event.target.closest?.("[data-trash-postpone-confirm]")) {
        const seconds = durationFromFields(root);
        if (!seconds) return showToast("留人时间至少 1 秒");
        scheduleUserReminder(seconds, message);
        closeTrashTalkReminder();
      }
    });
  }

  function closeTrashTalkPanel() {
    document.getElementById("mpg-trash-talk-settings-root")?.remove();
    STATE.trashTalkPanel = null;
  }

  function showTrashTalkPanel() {
    if (!isDlcEnabled("trashTalk")) return window.MiorningHub.open("dlc");
    closeTrashTalkPanel();
    const reminder = STATE.data.trashTalk?.reminder || {};
    const remaining = reminder.active ? Math.max(0, Math.ceil((Number(reminder.endAt) - Date.now()) / 1000)) : 0;
    const recentDurations = Array.isArray(STATE.data.trashTalk?.recentDurations)
      ? STATE.data.trashTalk.recentDurations.slice(0, 3)
      : [];
    const recentDurationButtons = [0, 1, 2].map((index) => {
      const seconds = Number(recentDurations[index] || 0);
      return seconds > 0
        ? `<button type="button" data-trash-recent-duration="${seconds}">${safeText(trashTalkDurationLabel(seconds))}</button>`
        : `<button type="button" disabled aria-label="暂无最近使用时间">—</button>`;
    }).join("");
    const root = document.createElement("div");
    root.id = "mpg-trash-talk-settings-root";
    root.innerHTML = `
      <div class="mpg-trash-talk-backdrop" data-trash-settings-close></div>
      <section class="mpg-trash-talk-settings" role="dialog" aria-modal="true" aria-label="垃圾话与番茄钟">
        <header>
          <div><strong>垃圾话与番茄钟</strong><small>用户倒计时固定强弹窗，系统垃圾话固定静默</small></div>
          <button type="button" data-trash-settings-close>×</button>
        </header>
        <div class="mpg-trash-talk-card">
          <label class="mpg-trash-talk-label">倒计时</label>
          <div class="mpg-trash-duration">
            <label><input type="number" min="0" max="24" value="0" data-trash-hours>小时</label>
            <label><input type="number" min="0" max="59" value="25" data-trash-minutes>分钟</label>
            <label><input type="number" min="0" max="59" value="0" data-trash-seconds>秒</label>
          </div>
          <div class="mpg-trash-recent">
            <span>最近使用</span>
            <div>${recentDurationButtons}</div>
          </div>
          <label class="mpg-trash-talk-label" for="mpg-trash-talk-copy">到点提醒什么</label>
          <textarea id="mpg-trash-talk-copy" maxlength="200" placeholder="例如：先把这一镜做完再躺。">${safeText(reminder.message || "")}</textarea>
          <button type="button" class="primary" data-trash-schedule>开始倒计时</button>
          ${reminder.active ? `<div class="mpg-trash-talk-active">当前提醒剩余约 ${remaining} 秒 <button type="button" data-trash-cancel>取消</button></div>` : ""}
        </div>
        <label class="mpg-trash-talk-system-toggle">
          <span><b>胶带封住喵咛的嘴</b><small>关闭系统自带垃圾话，不影响你的倒计时</small></span>
          <input type="checkbox" data-trash-system-mute ${STATE.data.trashTalk?.systemEnabled ? "" : "checked"}>
        </label>
      </section>
    `;
    document.documentElement.appendChild(root);
    STATE.trashTalkPanel = root;
    root.addEventListener("click", (event) => {
      if (event.target.closest?.("[data-trash-settings-close]")) return closeTrashTalkPanel();
      const recentButton = event.target.closest?.("[data-trash-recent-duration]");
      if (recentButton) {
        fillTrashTalkDuration(root, recentButton.getAttribute("data-trash-recent-duration"));
        return;
      }
      if (event.target.closest?.("[data-trash-cancel]")) {
        clearUserReminder();
        showTrashTalkPanel();
        return;
      }
      if (event.target.closest?.("[data-trash-schedule]")) {
        const seconds = durationFromFields(root);
        if (!seconds) return showToast("倒计时至少 1 秒");
        const message = root.querySelector("#mpg-trash-talk-copy")?.value || "";
        scheduleUserReminder(seconds, message, true);
        closeTrashTalkPanel();
        showToast("吉时已记下，到点谁也救不了你");
      }
    });
    root.querySelector("[data-trash-system-mute]")?.addEventListener("change", (event) => {
      STATE.data.trashTalk.systemEnabled = !event.target.checked;
      saveState();
      initializeSystemTrashTalk();
    });
  }

  function closeShotlabPanel() {
    const panel = document.getElementById("mpg-shotlab-root");
    if (panel) panel.remove();
    STATE.shotlabPanel = null;
  }

  function showShotlabPanel() {
    if (!isDlcEnabled("shotlab")) return window.MiorningHub.open("dlc");
    if (!isShotlabCanvasPage()) return;
    closeShotlabPanel();

    const config = getShotlabConfig();
    const root = document.createElement("div");
    root.id = "mpg-shotlab-root";
    root.innerHTML = `
      <div class="mpg-shotlab-backdrop" data-action="close-shotlab"></div>
      <section class="mpg-shotlab-panel" role="dialog" aria-modal="true" aria-label="ShotLab 画布增强">
        <div class="mpg-shotlab-header">
          <div>
            <div class="mpg-shotlab-brand">MIORNING</div>
            <strong>ShotLab 画布增强</strong>
            <p>仅在 ShotLab 画布页面生效。设置自动保存，按 Esc 关闭。</p>
          </div>
          <button class="mpg-x" type="button" data-action="close-shotlab" aria-label="关闭">×</button>
        </div>

        <div class="mpg-shotlab-settings ${config.enabled ? "" : "is-disabled"}">
          <label class="mpg-shotlab-setting master">
            <span><b>启用画布增强</b><small>统一控制下方全部 ShotLab 增强快捷键</small></span>
            <input type="checkbox" data-shotlab-setting="enabled" ${config.enabled ? "checked" : ""}>
          </label>
          <label class="mpg-shotlab-setting">
            <span><b><kbd>F</kbd> 聚焦节点</b><small>仅选中一个节点时，居中并放大到最大</small></span>
            <input type="checkbox" data-shotlab-setting="focusSelected" data-shotlab-individual ${config.focusSelected ? "checked" : ""} ${config.enabled ? "" : "disabled"}>
          </label>
          <label class="mpg-shotlab-setting">
            <span><b><kbd>Alt + F</kbd> 适应全部节点</b><small>自动居中并缩放，让全部节点以合适留白进入当前视图</small></span>
            <input type="checkbox" data-shotlab-setting="fitCanvas" data-shotlab-individual ${config.fitCanvas ? "checked" : ""} ${config.enabled ? "" : "disabled"}>
          </label>
          <label class="mpg-shotlab-setting">
            <span><b><kbd>G</kbd> 快速打组</b><small>选中两个或以上节点后，调用 ShotLab 原生“创建组”</small></span>
            <input type="checkbox" data-shotlab-setting="groupSelected" data-shotlab-individual ${config.groupSelected ? "checked" : ""} ${config.enabled ? "" : "disabled"}>
          </label>
          <label class="mpg-shotlab-setting">
            <span><b><kbd>Alt + G</kbd> 快速解组</b><small>选中分组边框后，调用 ShotLab 原生“解组”</small></span>
            <input type="checkbox" data-shotlab-setting="ungroupSelected" data-shotlab-individual ${config.ungroupSelected ? "checked" : ""} ${config.enabled ? "" : "disabled"}>
          </label>
          <label class="mpg-shotlab-setting">
            <span><b><kbd>Alt + 左键拖拽</kbd> 快捷复制</b><small>拖动单个已选节点，原生复制到落点；撤销一次即可删除副本</small></span>
            <input type="checkbox" data-shotlab-setting="altDuplicate" data-shotlab-individual ${config.altDuplicate ? "checked" : ""} ${config.enabled ? "" : "disabled"}>
          </label>
        </div>

        <div class="mpg-shotlab-section-title">ShotLab 原有快捷键</div>
        <div class="mpg-shotlab-native-list">
          <div><kbd>Ctrl + C</kbd><span>复制节点</span></div>
          <div><kbd>Ctrl + V</kbd><span>粘贴节点或媒体文件</span></div>
          <div><kbd>Delete / Backspace</kbd><span>删除已选中节点或连线</span></div>
          <div><kbd>双击 / 右键空白处</kbd><span>新建节点</span></div>
          <div><kbd>Ctrl + Z</kbd><span>撤销上一步操作</span></div>
          <div><kbd>Ctrl + Shift + Z</kbd><span>恢复上一步操作</span></div>
          <div><kbd>Ctrl + 点击</kbd><span>多选节点</span></div>
          <div><kbd>Ctrl + 滚轮</kbd><span>缩放画布</span></div>
          <div><kbd>空格 + 左键 / 滚轮键 / 右键拖拽</kbd><span>移动画布</span></div>
        </div>

        <div class="mpg-shotlab-foot">鼠标移到右下角 MIORNING 图标上，按 <kbd>Tab</kbd> 可再次打开</div>
      </section>
    `;

    document.documentElement.appendChild(root);
    STATE.shotlabPanel = root;

    const syncShotlabPanelState = () => {
      const enabled = STATE.data.shotlabCanvasEnhancer?.enabled !== false;
      root.querySelector(".mpg-shotlab-settings")?.classList.toggle("is-disabled", !enabled);
      root.querySelectorAll("input[data-shotlab-individual]").forEach((input) => {
        input.disabled = !enabled;
      });
    };

    root.addEventListener("click", (e) => {
      if (e.target.closest?.("[data-action='close-shotlab']")) closeShotlabPanel();
    });

    root.addEventListener("change", (e) => {
      const input = e.target.closest?.("input[data-shotlab-setting]");
      if (!input) return;
      const key = input.getAttribute("data-shotlab-setting");
      if (!STATE.data.shotlabCanvasEnhancer) {
        STATE.data.shotlabCanvasEnhancer = clone(DEFAULT_STATE.shotlabCanvasEnhancer);
      }
      STATE.data.shotlabCanvasEnhancer[key] = Boolean(input.checked);
      if (key === "enabled") syncShotlabPanelState();
      saveState();
    });

    syncShotlabPanelState();
  }

  function showToast(msg) {
    msg = String(msg ?? "").trim();
    if (!msg) return;
    let toast = document.getElementById("mpg-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "mpg-toast";
      document.documentElement.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    positionToastNearFloating();
    requestAnimationFrame(positionToastNearFloating);
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
    const thumbnail = await compressPromptThumbnail(dataUrl);
    setPromptThumb(activeName, idx, thumbnail);
    updatePromptThumbDom(idx, thumbnail);
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
        const thumbnail = await compressPromptThumbnail(dataUrl);
        setPromptThumb(active, index, thumbnail);
        updatePromptThumbDom(index, thumbnail);
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
    if (!STATE.data.enabled || !window.MiorningModulePolicy.allowsUrl(STATE.data.guardSites, location.href)) return;
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
        const thumbnail = await compressPromptThumbnail(dataUrl);
        setPromptThumb(activeName, idx, thumbnail);
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

  const QUICK_ACTIONS = {
    manager: { label: "喵咛主页", desc: "打开功能与 DLC" },
    inspiration: { label: "灵感收纳箱", desc: "打开灵感箱" },
    capture: { label: "截图收灵感", desc: "开始框选截图" },
    toggle: { label: "开关插件", desc: "切换保险栓状态" },
    trashTalk: { label: "垃圾话", desc: "打开番茄提醒设置" }
  };

  function quickWheelQuadrantFromPointer(centerX, centerY, clientX, clientY) {
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    if (Math.hypot(dx, dy) < 22) return 0;
    if (dx >= 0 && dy < 0) return 1;
    if (dx < 0 && dy < 0) return 2;
    if (dx < 0 && dy >= 0) return 3;
    return 4;
  }

  function closeQuickActionPanel() {
    document.getElementById("mpg-quick-action-root")?.remove();
    STATE.quickActionPanel = null;
  }

  function closeQuickWheel() {
    const wheel = STATE.quickWheel;
    if (wheel?.moveHandler) window.removeEventListener("pointermove", wheel.moveHandler, true);
    wheel?.root?.remove?.();
    document.getElementById("mpg-quick-wheel-root")?.remove();
    STATE.quickWheel = null;
  }

  function activateQuickWheelQuadrant(quadrant) {
    const wheel = STATE.quickWheel;
    if (!wheel || !quadrant) return;
    wheel.quadrant = quadrant;
    wheel.root.classList.remove("hover-q1", "hover-q2", "hover-q3", "hover-q4");
    wheel.root.classList.add(`hover-q${quadrant}`);
    wheel.root.querySelectorAll("[data-quick-quadrant]").forEach((button) => {
      button.classList.toggle("active", Number(button.getAttribute("data-quick-quadrant")) === quadrant);
    });
    const action = STATE.data.quickWheelActions?.[quadrant] || "";
    const center = wheel.root.querySelector(".mpg-quick-wheel-center");
    if (center) center.textContent = QUICK_ACTIONS[action]?.label || "未设置";
  }

  function openQuickActionChooser(quadrant) {
    closeQuickWheel();
    closeQuickActionPanel();
    const current = STATE.data.quickWheelActions?.[quadrant] || "";
    const root = document.createElement("div");
    root.id = "mpg-quick-action-root";
    root.innerHTML = `
      <div class="mpg-quick-action-backdrop" data-quick-choice="close"></div>
      <div class="mpg-quick-action-panel" role="dialog" aria-modal="true" aria-label="设置快捷轮盘">
        <header><div><strong>设置象限 ${["Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ"][quadrant - 1]}</strong><small>选一个功能，下次划到这里直接打开</small></div><div class="mpg-quick-action-head-buttons"><button type="button" data-quick-skin>皮肤</button><button type="button" data-quick-choice="close">×</button></div></header>
        <div class="mpg-quick-action-grid">
          ${Object.entries(QUICK_ACTIONS).filter(([key]) => quickActionAvailable(key)).map(([key, meta]) => `<button type="button" class="${current === key ? "selected" : ""}" data-quick-choice="${key}"><strong>${safeText(meta.label)}</strong><small>${safeText(meta.desc)}</small></button>`).join("")}
        </div>
        <button type="button" class="mpg-quick-action-clear" data-quick-choice="clear">清空这个象限</button>
      </div>
    `;
    document.documentElement.appendChild(root);
    STATE.quickActionPanel = root;
    root.addEventListener("click", (event) => {
      if (event.target.closest?.("[data-quick-skin]")) {
        showPieSkinPanel();
        return;
      }
      const choice = event.target.closest?.("[data-quick-choice]")?.getAttribute("data-quick-choice");
      if (!choice) return;
      if (choice === "close") return closeQuickActionPanel();
      STATE.data.quickWheelActions[quadrant] = choice === "clear" ? "" : choice;
      saveState();
      closeQuickActionPanel();
      showToast(choice === "clear" ? "这个象限已经空出来了" : `已设置为「${QUICK_ACTIONS[choice].label}」`);
    });
  }

  function executeQuickAction(action) {
    if (!QUICK_ACTIONS[action]) return;
    setTimeout(() => {
      if (!quickActionAvailable(action)) return window.MiorningHub.open("dlc");
      if (action === "manager") return window.MiorningHub.open();
      if (action === "inspiration") return window.MiorningInspiration?.open?.();
      if (action === "capture") return window.MiorningInspiration?.capture?.();
      if (action === "toggle") return toggleEnabled();
      if (action === "trashTalk") return showTrashTalkPanel();
    }, 0);
  }

  function closePieSkinPanel() {
    document.getElementById("mpg-pie-skin-root")?.remove();
    STATE.pieSkinPanel = null;
  }

  function showPieSkinPanel() {
    closePieSkinPanel();
    const root = document.createElement("div");
    root.id = "mpg-pie-skin-root";
    root.innerHTML = `
      <div class="mpg-pie-skin-backdrop" data-pie-skin-close></div>
      <section class="mpg-pie-skin-panel" role="dialog" aria-modal="true" aria-label="饼状菜单皮肤">
        <header><div><strong>轮盘皮肤</strong><small>所有四象限饼图一起换装</small></div><button type="button" data-pie-skin-close>×</button></header>
        <div class="mpg-pie-skin-grid">
          ${[
            ["classic", "经典", "克制、清楚、原味"],
            ["girl", "少女", "柔光、樱粉、甜而不腻"],
            ["cyber", "酷炫", "霓虹、扫描线、能量环"]
          ].map(([key, name, desc]) => `
            <button type="button" class="${STATE.data.pieSkin === key ? "selected" : ""}" data-pie-skin="${key}">
              <span class="mpg-pie-skin-preview ${key}"><i></i><i></i><i></i><i></i></span>
              <strong>${name}</strong><small>${desc}</small>
            </button>`).join("")}
        </div>
      </section>
    `;
    document.documentElement.appendChild(root);
    STATE.pieSkinPanel = root;
    root.addEventListener("click", (event) => {
      if (event.target.closest?.("[data-pie-skin-close]")) return closePieSkinPanel();
      const skin = event.target.closest?.("[data-pie-skin]")?.getAttribute("data-pie-skin");
      if (!["classic", "girl", "cyber"].includes(skin)) return;
      STATE.data.pieSkin = skin;
      saveState();
      closePieSkinPanel();
      showToast(`所有轮盘已换成${skin === "girl" ? "少女" : skin === "cyber" ? "酷炫" : "经典"}皮肤`);
    });
  }

  function openQuickWheel(position = {}) {
    closeQuickActionPanel();
    closeQuickWheel();
    const radius = 104;
    const centerX = Math.max(radius + 10, Math.min(window.innerWidth - radius - 10, Number(position.x) || window.innerWidth / 2));
    const centerY = Math.max(radius + 10, Math.min(window.innerHeight - radius - 10, Number(position.y) || window.innerHeight / 2));
    const root = document.createElement("div");
    root.id = "mpg-quick-wheel-root";
    root.style.left = `${centerX - radius}px`;
    root.style.top = `${centerY - radius}px`;
    root.innerHTML = `
      <div class="mpg-quick-wheel" role="menu" aria-label="自定义快捷轮盘">
        ${[1, 2, 3, 4].map((quadrant) => {
          const action = STATE.data.quickWheelActions?.[quadrant] || "";
          return `<button type="button" class="q${quadrant}" data-quick-quadrant="${quadrant}"><span>${safeText(QUICK_ACTIONS[action]?.label || "＋ 设置")}</span></button>`;
        }).join("")}
        <span class="mpg-quick-wheel-center">快捷</span>
        ${[1, 2, 3, 4].map((quadrant) => `<button type="button" class="mpg-quick-wheel-edit q${quadrant}" data-quick-edit="${quadrant}">${STATE.data.quickWheelActions?.[quadrant] ? "修改" : "设置"}</button>`).join("")}
      </div>
      <div class="mpg-quick-wheel-help">按住快捷键划向功能 · 松手执行</div>
    `;
    document.documentElement.appendChild(root);
    const moveHandler = (event) => {
      const wheel = STATE.quickWheel;
      if (!wheel || wheel.editing) return;
      const quadrant = quickWheelQuadrantFromPointer(wheel.centerX, wheel.centerY, event.clientX, event.clientY);
      if (quadrant) activateQuickWheelQuadrant(quadrant);
    };
    STATE.quickWheel = { root, centerX, centerY, quadrant: 0, editing: false, moveHandler };
    window.addEventListener("pointermove", moveHandler, true);
    root.querySelectorAll("[data-quick-quadrant]").forEach((button) => {
      button.addEventListener("pointerenter", () => activateQuickWheelQuadrant(Number(button.getAttribute("data-quick-quadrant"))));
    });
    root.querySelectorAll("[data-quick-edit]").forEach((button) => {
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const quadrant = Number(button.getAttribute("data-quick-edit"));
        if (STATE.quickWheel) STATE.quickWheel.editing = true;
        openQuickActionChooser(quadrant);
      }, true);
    });
  }

  function releaseQuickWheel() {
    const wheel = STATE.quickWheel;
    if (!wheel) return false;
    const { quadrant, editing } = wheel;
    closeQuickWheel();
    if (editing || !quadrant) return true;
    const action = STATE.data.quickWheelActions?.[quadrant] || "";
    if (action) executeQuickAction(action);
    else openQuickActionChooser(quadrant);
    return true;
  }

  function closeTopmostPopupWithEsc() {
    if (document.getElementById("mpg-trash-talk-reminder-root")) return true;
    if (document.getElementById("mpg-pie-skin-root")) { closePieSkinPanel(); return true; }
    if (document.getElementById("mpg-trash-talk-settings-root")) { closeTrashTalkPanel(); return true; }
    if (document.getElementById("mpg-quick-action-root")) { closeQuickActionPanel(); return true; }
    if (document.getElementById("mpg-quick-wheel-root")) { closeQuickWheel(); return true; }
    if (window.MiorningInspiration?.closeTopmost?.()) return true;
    if (document.getElementById("mpg-shotlab-root")) { closeShotlabPanel(); return true; }
    if (document.getElementById("mpg-thumb-preview-root")) { closeThumbPreview(); return true; }
    if (document.getElementById("mpg-locked-reward-root")) { closeLockedRewardPopup(); return true; }
    if (document.getElementById("mpg-all-reward-root")) { closeAllAchievementsReward(); return true; }
    if (document.getElementById("mpg-easter-root")) { closeEasterPopup(); return true; }
    if (document.getElementById("mpg-category-io-root")) { closeCategoryIoPanel(); return true; }
    if (document.getElementById("mpg-hotkey-panel-root")) { closeHotkeyPanel(); return true; }
    if (document.getElementById("mpg-achievements-root")) { closeAchievementsPanel(); return true; }
    if (document.getElementById("mpg-collector-root")) { closeCollector(); return true; }
    if (document.getElementById("mpg-manager-root")) { closeManager(); return true; }
    if (document.getElementById("mpg-modal-root")) { closeGuardModal(); return true; }
    if (document.getElementById("mpg-hub-root")) { window.MiorningHub.close(); return true; }
    return false;
  }

  function onKeyDownCapture(e) {
    if (handleHotkeyRecordingKeyDown(e)) return;
    if (e.isComposing || e.keyCode === 229) return;

    const pressedCode = canonicalShortcutCode(e.code || e.key);
    if (pressedCode) STATE.pressedShortcutCodes.add(pressedCode);

    if (e.key === "Escape" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (closeTopmostPopupWithEsc()) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }
    }

    if (e.key === "Tab" && !e.ctrlKey && !e.metaKey && !e.altKey && isDlcEnabled("shotlab") && isShotlabCanvasPage() && STATE.floatingHover) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (document.getElementById("mpg-shotlab-root")) closeShotlabPanel();
      else showShotlabPanel();
      return;
    }

    if (continueFromGuardByEnter(e)) return;

    if (e.target instanceof Element && e.target.closest?.("[id^='mpg-']") && !e.target.closest?.("#mpg-floating-dock")) {
      return;
    }

    if (e.target instanceof Element && e.target.closest?.("#mpg-manager-root, #mpg-modal-root")) {
      return;
    }

    if (matchesShortcut(e, "inspirationCapture")) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.MiorningInspiration?.capture?.();
      return;
    }

    if (matchesShortcut(e, "inspirationBox")) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.MiorningInspiration?.open?.();
      return;
    }

    if (matchesShortcut(e, "trashTalk")) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      showTrashTalkPanel();
      return;
    }

    if (matchesShortcut(e, "stylePicker")) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const x = Number.isFinite(STATE.lastPointer.x) && STATE.lastPointer.x > 0 ? STATE.lastPointer.x : window.innerWidth / 2;
      const y = Number.isFinite(STATE.lastPointer.y) && STATE.lastPointer.y > 0 ? STATE.lastPointer.y : window.innerHeight / 2;
      window.MiorningInspiration?.openStylePicker?.({ x, y });
      return;
    }

    if (matchesShortcut(e, "quickWheel")) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const x = Number.isFinite(STATE.lastPointer.x) && STATE.lastPointer.x > 0 ? STATE.lastPointer.x : window.innerWidth / 2;
      const y = Number.isFinite(STATE.lastPointer.y) && STATE.lastPointer.y > 0 ? STATE.lastPointer.y : window.innerHeight / 2;
      openQuickWheel({ x, y });
      return;
    }

    if (matchesShortcut(e, "collect")) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      showCollector(getSelectedText());
      return;
    }

    if (matchesShortcut(e, "toggle")) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      toggleEnabled();
      return;
    }

    if (!STATE.data.enabled || !window.MiorningModulePolicy.allowsUrl(STATE.data.guardSites, location.href)) return;
    if (e.key !== "Enter") return;
    if (e.repeat) return;
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

  function onKeyUpCapture(e) {
    if (handleHotkeyRecordingKeyUp(e)) return;
    const code = canonicalShortcutCode(e.code || e.key);
    if (code) STATE.pressedShortcutCodes.delete(code);
    window.MiorningInspiration?.releaseStylePicker?.();
    releaseQuickWheel();
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
    STATE.hotkeyRecording = null;
  }

  function beginHotkeyRecording(key, root) {
    STATE.hotkeyRecording = { key, codes: new Set(), down: new Set(), root };
    root.querySelectorAll("[data-record-shortcut]").forEach((card) => {
      card.classList.toggle("recording", card.getAttribute("data-record-shortcut") === key);
    });
    const label = root.querySelector(`[data-shortcut-label="${key}"]`);
    if (label) label.textContent = "请按下快捷键…";
    const status = root.querySelector(".mpg-shortcut-record-status");
    if (status) status.textContent = "按住想要的按键，全部松开后自动保存；单独的 Ctrl / Alt / Shift 不可使用。";
  }

  function handleHotkeyRecordingKeyDown(event) {
    const recording = STATE.hotkeyRecording;
    if (!recording) return false;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (event.repeat) return true;
    const code = canonicalShortcutCode(event.code || event.key);
    if (!code) return true;
    if (!recording.codes.has(code) && recording.codes.size >= 3) {
      showToast("一个快捷键最多录入三个按键");
      return true;
    }
    recording.codes.add(code);
    recording.down.add(code);
    const label = recording.root.querySelector(`[data-shortcut-label="${recording.key}"]`);
    if (label) label.textContent = shortcutLabel(Array.from(recording.codes));
    return true;
  }

  function handleHotkeyRecordingKeyUp(event) {
    const recording = STATE.hotkeyRecording;
    if (!recording) return false;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const code = canonicalShortcutCode(event.code || event.key);
    recording.down.delete(code);
    if (recording.down.size) return true;

    const codes = normalizeShortcutCodes(Array.from(recording.codes));
    const hasActionKey = codes.some((item) => !SHORTCUT_ORDER.includes(item));
    if (!hasActionKey) {
      showToast("不能只使用 Ctrl、Alt、Shift 或 Win 键");
      STATE.hotkeyRecording = null;
      showHotkeyPanel();
      return true;
    }
    const conflict = findShortcutConflict(recording.key, codes);
    if (conflict) {
      showToast("这个组合键已经被其他功能占用了");
      STATE.hotkeyRecording = null;
      showHotkeyPanel();
      return true;
    }

    STATE.data.shortcutBindings[recording.key] = codes;
    STATE.hotkeyRecording = null;
    saveState();
    showToast(`快捷键已改为 ${shortcutLabel(codes)}`);
    showHotkeyPanel();
    return true;
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
          <div><strong>快捷键设置</strong><small>点击任意键位卡片，然后按下新的组合键</small></div>
          <button class="mpg-x" type="button" data-action="close-hotkey-panel">×</button>
        </div>

        <div class="mpg-shortcut-recorder-grid">
          <button type="button" class="mpg-shortcut-recorder" data-record-shortcut="toggle">
            <span class="mpg-shortcut-number">01</span>
            <span class="mpg-shortcut-copy"><strong>关闭 / 开启插件</strong><small>原来的保险栓总开关</small></span>
            <kbd data-shortcut-label="toggle">${safeText(shortcutLabel(getShortcutBinding("toggle")))}</kbd>
          </button>
          <button type="button" class="mpg-shortcut-recorder" data-record-shortcut="collect">
            <span class="mpg-shortcut-number">02</span>
            <span class="mpg-shortcut-copy"><strong>录入提示词</strong><small>快速打开提示词收藏框</small></span>
            <kbd data-shortcut-label="collect">${safeText(shortcutLabel(getShortcutBinding("collect")))}</kbd>
          </button>
          <button type="button" class="mpg-shortcut-recorder" data-record-shortcut="inspirationCapture">
            <span class="mpg-shortcut-number">03</span>
            <span class="mpg-shortcut-copy"><strong>截图保存灵感</strong><small>框选网页并收进灵感箱</small></span>
            <kbd data-shortcut-label="inspirationCapture">${safeText(shortcutLabel(getShortcutBinding("inspirationCapture")))}</kbd>
          </button>
          <button type="button" class="mpg-shortcut-recorder" data-record-shortcut="inspirationBox">
            <span class="mpg-shortcut-number">04</span>
            <span class="mpg-shortcut-copy"><strong>打开灵感箱</strong><small>查看、复制与整理参考图</small></span>
            <kbd data-shortcut-label="inspirationBox">${safeText(shortcutLabel(getShortcutBinding("inspirationBox")))}</kbd>
          </button>
          <button type="button" class="mpg-shortcut-recorder" data-record-shortcut="stylePicker">
            <span class="mpg-shortcut-number">05</span>
            <span class="mpg-shortcut-copy"><strong>选择视频画风</strong><small>按住后用四象限挑选画风参考</small></span>
            <kbd data-shortcut-label="stylePicker">${safeText(shortcutLabel(getShortcutBinding("stylePicker")))}</kbd>
          </button>
          <button type="button" class="mpg-shortcut-recorder" data-record-shortcut="quickWheel">
            <span class="mpg-shortcut-number">06</span>
            <span class="mpg-shortcut-copy"><strong>自定义快捷轮盘</strong><small>四个象限可分别放入常用功能</small></span>
            <kbd data-shortcut-label="quickWheel">${safeText(shortcutLabel(getShortcutBinding("quickWheel")))}</kbd>
          </button>
          <button type="button" class="mpg-shortcut-recorder" data-record-shortcut="trashTalk">
            <span class="mpg-shortcut-number">07</span>
            <span class="mpg-shortcut-copy"><strong>垃圾话与番茄钟</strong><small>设置强制倒计时与系统静默吐槽</small></span>
            <kbd data-shortcut-label="trashTalk">${safeText(shortcutLabel(getShortcutBinding("trashTalk")))}</kbd>
          </button>
        </div>

        <div class="mpg-shortcut-record-status">支持单键或组合键；点击卡片后录入，全部松开即自动保存。</div>
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

      const recorder = e.target.closest?.("[data-record-shortcut]");
      if (recorder) beginHotkeyRecording(recorder.getAttribute("data-record-shortcut"), root);
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
              <strong>喵咛 · 提示词仓库</strong>
              ${STATE.data.easterHidden || !isDlcEnabled("achievements") ? "" : `<button type="button" class="mpg-easter-btn" data-action="open-easter-confirm">648解锁6480种提示词</button>`}
            </div>
            <p>先存着。下次别再从头编了。 · 数据留在当前浏览器</p>
          </div>
          <div class="mpg-manager-header-actions">
            <button class="mpg-config-btn" type="button" data-action="open-hub">回到喵咛</button>
            <button class="mpg-config-btn mpg-theme-mini" type="button" data-action="toggle-theme" title="切换白天 / 黑夜模式">${STATE.data.uiTheme === "day" ? "白天" : "夜间"}</button>
            <button class="mpg-config-btn mpg-pie-skin-entry" type="button" data-action="open-pie-skin" title="切换全部四象限轮盘皮肤">皮肤</button>
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
      if (act === "open-hub") { closeManager(); window.MiorningHub.open(); return; }
      if (act === "thumb-upload") {
        openThumbFilePicker(Number(action.getAttribute("data-index")));
        return;
      }
      if (act === "open-hotkey-panel") {
        showHotkeyPanel();
        return;
      }
      if (act === "open-trash-talk") {
        showTrashTalkPanel();
        return;
      }
      if (act === "open-inspiration-box") {
        closeManager();
        window.MiorningInspiration?.open?.();
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
      if (act === "open-pie-skin") {
        showPieSkinPanel();
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

  function isDlcEnabled(id) {
    return STATE.data.dlc?.[id] === true;
  }

  function quickActionAvailable(action) {
    const id = { inspiration: "inspiration", capture: "inspiration", trashTalk: "trashTalk" }[action];
    return !id || isDlcEnabled(id);
  }

  function applyDlcRuntime() {
    const root = document.documentElement;
    window.MiorningModulePolicy.catalog.forEach(({ id }) => root.classList.toggle(`mpg-dlc-${id}`, isDlcEnabled(id)));
    window.MiorningInspiration?.syncModules?.();
    if (!isDlcEnabled("quickWheel")) { closeQuickWheel(); closeQuickActionPanel(); }
    if (!isDlcEnabled("shotlab")) closeShotlabPanel();
    if (!isDlcEnabled("achievements")) {
      closeAchievementsPanel();
      document.getElementById("mpg-achievement-popup")?.remove();
      closeAllAchievementsReward();
    }
    if (!isDlcEnabled("trashTalk")) {
      clearInterval(STATE.trashTalkSystemInterval);
      STATE.trashTalkSystemInterval = null;
      hideSystemBabble(true);
      closeTrashTalkPanel();
      document.getElementById("mpg-trash-talk-reminder-root")?.remove();
      STATE.trashTalkReminder = null;
    }
    if (STATE.modal && (!STATE.data.enabled || !window.MiorningModulePolicy.allowsUrl(STATE.data.guardSites, location.href))) closeGuardModal();
    applyFloatingState();
    sendShotlabConfig();
  }

  async function commitSettings(change) {
    const previous = clone(STATE.data);
    const result = change();
    const attempted = JSON.stringify(STATE.data);
    if (!await saveState()) {
      if (JSON.stringify(STATE.data) === attempted) STATE.data = previous;
      applyThemeClass(); applyDlcRuntime(); initializeSystemTrashTalk();
      window.MiorningHub.refresh?.();
      throw new Error("设置未保存，请刷新网页后重试；原来的设置没有改变。");
    }
    applyDlcRuntime();
    return result;
  }

  async function setDlc(id, enabled) {
    if (!window.MiorningModulePolicy.catalog.some(item => item.id === id)) return false;
    await commitSettings(() => {
      STATE.data.dlc[id] = Boolean(enabled);
      if (id === "style" && enabled) STATE.data.dlc.inspiration = true;
      if (id === "inspiration" && !enabled) STATE.data.dlc.style = false;
    });
    initializeSystemTrashTalk();
    if (id === "trashTalk" && enabled) resumeUserReminder();
    return true;
  }

  function runHubAction(action) {
    const moduleId = { inspiration: "inspiration", capture: "inspiration", style: "style", shotlab: "shotlab", wheel: "quickWheel", trashTalk: "trashTalk", achievements: "achievements" }[action];
    if (moduleId && !isDlcEnabled(moduleId)) return window.MiorningHub.open("dlc");
    window.MiorningHub.close();
    const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    if (action === "prompts") return showManager();
    if (action === "shortcuts") return showHotkeyPanel();
    if (action === "skins") return showPieSkinPanel();
    if (action === "inspiration") return window.MiorningInspiration?.open?.();
    if (action === "capture") return window.MiorningInspiration?.capture?.();
    if (action === "style") return window.MiorningInspiration?.openStylePicker?.(position);
    if (action === "shotlab") return showShotlabPanel();
    if (action === "wheel") return openQuickActionChooser(1);
    if (action === "trashTalk") return showTrashTalkPanel();
    if (action === "achievements") return showAchievementsPanel();
    if (action === "toggle") return toggleEnabled();
  }

  window.MiorningApp = {
    catalog: window.MiorningModulePolicy.catalog,
    getState: () => STATE.data,
    isDlcEnabled,
    setDlc,
    addSite: (text) => commitSettings(() => {
      const origin = window.MiorningModulePolicy.normalizeSite(text);
      if (!STATE.data.guardSites.includes(origin) && STATE.data.guardSites.length >= 100) throw new Error("最多添加 100 个网站，请先移除不再使用的网站。");
      STATE.data.guardSites = window.MiorningModulePolicy.normalizeSites([...STATE.data.guardSites, origin]);
      return origin;
    }),
    removeSite: (origin) => commitSettings(() => {
      STATE.data.guardSites = STATE.data.guardSites.filter(site => site !== origin);
    }),
    setBackup: (enabled) => commitSettings(() => { STATE.data.autoBackupEnabled = Boolean(enabled); }),
    run: runHubAction,
    toggleTheme: () => { STATE.data.uiTheme = STATE.data.uiTheme === "day" ? "night" : "day"; saveState(); },
    exportConfig: exportFullConfig,
    importConfig: importFullConfig,
    getShortcutLabel: (key) => shortcutLabel(getShortcutBinding(key))
  };

  function init() {
    applyThemeClass();
    loadState();
    createFloating();
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "mpg-trash-talk:timer-fired") {
      if (!isDlcEnabled("trashTalk")) return;
      const reminder = message.reminder || STATE.data.trashTalk?.reminder || {};
      clearUserReminder();
      showTrashTalkReminder(reminder.message || "该干活了，大人。");
      return;
    }
    if (message?.type === "mpg-trash-talk:system-night") {
      showSystemBabble(message.message || "", Number(message.duration) || 60000, 100);
    }
  });

  chrome.storage?.onChanged?.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    const value = changes?.[STORAGE_KEY]?.newValue;
    if (!value) return;
    if (JSON.stringify(value) === JSON.stringify(STATE.data)) return;
    const previousDlc = JSON.stringify(STATE.data.dlc);
    const previousSystem = STATE.data.trashTalk?.systemEnabled;
    STATE.data = mergeState(value);
    applyThemeClass();
    applyDlcRuntime();
    if (previousDlc !== JSON.stringify(STATE.data.dlc) || previousSystem !== STATE.data.trashTalk?.systemEnabled) initializeSystemTrashTalk();
    window.MiorningHub.refresh?.();
  });

  window.addEventListener("message", onShotlabBridgeMessage);
  window.addEventListener("MPG_INSPIRATION_ADDED", () => recordInspiration(1));
  window.addEventListener("keydown", onKeyDownCapture, true);
  document.addEventListener("keydown", onKeyDownCapture, true);
  window.addEventListener("keyup", onKeyUpCapture, true);
  document.addEventListener("keyup", onKeyUpCapture, true);
  window.addEventListener("pointermove", (event) => {
    STATE.lastPointer.x = event.clientX;
    STATE.lastPointer.y = event.clientY;
    if (Date.now() - STATE.trashTalkLastActivityAt >= 1000) {
      STATE.trashTalkLastActivityAt = Date.now();
    }
  }, true);
  ["pointerdown", "keydown", "wheel", "touchstart"].forEach((type) => {
    window.addEventListener(type, () => { STATE.trashTalkLastActivityAt = Date.now(); }, true);
  });
  window.addEventListener("blur", () => STATE.pressedShortcutCodes.clear(), true);
  window.addEventListener("resize", () => {
    if (!STATE.floatingDrag) applyFloatingPosition();
    positionFloatingMessages();
    positionToastNearFloating();
  });

  window.MiorningShortcutApi = {
    getLabel: (key) => shortcutLabel(getShortcutBinding(key)),
    getLabels: () => ({
      toggle: shortcutLabel(getShortcutBinding("toggle")),
      collect: shortcutLabel(getShortcutBinding("collect")),
      inspirationCapture: shortcutLabel(getShortcutBinding("inspirationCapture")),
      inspirationBox: shortcutLabel(getShortcutBinding("inspirationBox")),
      stylePicker: shortcutLabel(getShortcutBinding("stylePicker")),
      quickWheel: shortcutLabel(getShortcutBinding("quickWheel")),
      trashTalk: shortcutLabel(getShortcutBinding("trashTalk"))
    })
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
