const INSPIRATION_DB = "miorning_inspiration_box";
const INSPIRATION_DB_VERSION = 2;
const CATEGORY_STORE = "categories";
const ITEM_STORE = "items";
const SETTINGS_STORE = "settings";
const TRASH_ID = "__trash__";
const DEFAULT_CATEGORY_ID = "cat_inbox";
const STORAGE_HOST_PATH = "storage-host.html";
const CONFIG_STATE_KEY = "mpg_state_v1_7_0";
const LEGACY_CONFIG_STATE_KEYS = ["mpg_state_v1_6_5", "mpg_state_v1_6_4", "mpg_state_v1_6_3", "mpg_state_v1_6_2", "mpg_state_v1_6_1", "mpg_state_v1_6_0"];
const DAILY_BACKUP_KEY = "mpg_daily_backup_last_date";
const DAILY_BACKUP_ALARM = "mpg-daily-config-backup";
const TRASH_TALK_ALARM = "mpg-user-trash-talk-reminder";
const NIGHT_TRASH_TALK_ALARM_PREFIX = "mpg-system-trash-talk-night:";
const NIGHT_TRASH_TALK_SLOTS = [
  { id: "2200", hour: 22, minute: 0, message: "可以滚去睡觉了小崽子！早点起床时间还是你的啊！" },
  { id: "2230", hour: 22, minute: 30, message: "十点半了狗东西，再不睡马上就不想睡了！" },
  { id: "2300", hour: 23, minute: 0, message: "？我没看错的话现在十二点了吧？！" },
  { id: "2330", hour: 23, minute: 30, message: "好吧刚才看错了，但现在真的十二点了！！" },
  { id: "0000", hour: 0, minute: 0, message: "您做什么工作的？拯救世界呢？少你一个宇宙要爆炸是吧？" },
  { id: "0030", hour: 0, minute: 30, message: "从现在开始我将闭嘴，因为我已经睡着了：）您请随意糟蹋自己身体。" }
];
let storageHostCreating = null;
let dailyBackupInFlight = null;

async function readConfigState() {
  const stored = await chrome.storage.local.get([CONFIG_STATE_KEY, ...LEGACY_CONFIG_STATE_KEYS]);
  return stored[CONFIG_STATE_KEY] || LEGACY_CONFIG_STATE_KEYS.map((key) => stored[key]).find(Boolean) || null;
}

// Missing settings keep the pre-DLC behavior for existing installations.
function isAutoBackupEnabled(data) {
  return data?.autoBackupEnabled !== false;
}

function isTrashTalkEnabled(data) {
  return data?.dlc?.trashTalk !== false;
}

function isNightTrashTalkEnabled(data) {
  return isTrashTalkEnabled(data) && data?.trashTalk?.systemEnabled !== false;
}

async function assertAutoBackupEnabled() {
  if (isAutoBackupEnabled(await readConfigState())) return;
  const error = new Error("每日自动备份已关闭");
  error.code = "AUTO_BACKUP_DISABLED";
  throw error;
}

function normalizeStyleQuadrants(value) {
  return Array.from(new Set((Array.isArray(value) ? value : [])
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item >= 1 && item <= 4)))
    .sort((a, b) => a - b);
}

function makeId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed"));
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("IndexedDB transaction failed"));
    transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted"));
  });
}

function openInspirationDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(INSPIRATION_DB, INSPIRATION_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CATEGORY_STORE)) {
        const categories = db.createObjectStore(CATEGORY_STORE, { keyPath: "id" });
        categories.createIndex("createdAt", "createdAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(ITEM_STORE)) {
        const items = db.createObjectStore(ITEM_STORE, { keyPath: "id" });
        items.createIndex("categoryId", "categoryId", { unique: false });
        items.createIndex("createdAt", "createdAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("无法打开灵感箱数据库"));
  });
}

async function ensureDefaultCategory(db) {
  const tx = db.transaction(CATEGORY_STORE, "readwrite");
  const store = tx.objectStore(CATEGORY_STORE);
  const all = await requestResult(store.getAll());
  if (!all.length) {
    store.put({
      id: DEFAULT_CATEGORY_ID,
      name: "随手一捡",
      coverDataUrl: "",
      createdAt: Date.now()
    });
  }
  await transactionDone(tx);
}

async function withDb(callback) {
  const db = await openInspirationDb();
  try {
    await ensureDefaultCategory(db);
    return await callback(db);
  } finally {
    db.close();
  }
}

async function readAll(db, storeName) {
  const tx = db.transaction(storeName, "readonly");
  const result = await requestResult(tx.objectStore(storeName).getAll());
  await transactionDone(tx);
  return result;
}

async function readSetting(db, key) {
  const tx = db.transaction(SETTINGS_STORE, "readonly");
  const result = await requestResult(tx.objectStore(SETTINGS_STORE).get(key));
  await transactionDone(tx);
  return result || null;
}

async function writeSetting(db, value) {
  const tx = db.transaction(SETTINGS_STORE, "readwrite");
  tx.objectStore(SETTINGS_STORE).put(value);
  await transactionDone(tx);
}

async function ensureStorageHost() {
  const url = chrome.runtime.getURL(STORAGE_HOST_PATH);
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [url]
  });
  if (contexts.length) return;
  if (!storageHostCreating) {
    storageHostCreating = chrome.offscreen.createDocument({
      url: STORAGE_HOST_PATH,
      reasons: ["BLOBS"],
      justification: "持续读写用户授权的灵感原图文件夹，并处理图片 Blob。"
    }).finally(() => { storageHostCreating = null; });
  }
  await storageHostCreating;
}

async function callStorageHost(action, payload = {}, beforeSend = null) {
  await ensureStorageHost();
  if (beforeSend) await beforeSend();
  const response = await chrome.runtime.sendMessage({
    target: "mpg-storage-host",
    action,
    payload
  });
  if (!response?.ok) throw new Error(response?.error || "原图文件夹操作失败");
  return response.result;
}

async function getStorageStatus() {
  return withDb(async (db) => {
    const record = await readSetting(db, "originalDirectory");
    let permission = "missing";
    if (record?.handle) {
      try { permission = (await callStorageHost("status"))?.permission || "prompt"; }
      catch (_) { permission = "prompt"; }
    }
    return {
      selected: Boolean(record?.handle),
      name: record?.name || record?.expectedName || "",
      permission,
      pendingRebind: !record?.handle && Boolean(record?.expectedName),
      internalOriginals: (await readAll(db, ITEM_STORE)).filter((item) => Boolean(item.dataUrl) && !item.originalFileName).length
    };
  });
}

async function writeDataUrlToDirectory(db, itemId, dataUrl, preferredName = "") {
  const record = await readSetting(db, "originalDirectory");
  if (!record?.handle) throw new Error("尚未选择原图保存文件夹");
  return await callStorageHost("write", { itemId, dataUrl, preferredName });
}

async function readOriginalFromDirectory(db, fileName) {
  const record = await readSetting(db, "originalDirectory");
  if (!record?.handle) throw new Error("找不到原图文件夹，请重新选择原图保存位置");
  return await callStorageHost("read", { fileName });
}

async function removeOriginalFromDirectory(db, fileName) {
  if (!fileName) return;
  try { await callStorageHost("remove", { fileName }); } catch (_) {}
}

async function migrateInternalOriginals() {
  return withDb(async (db) => {
    const items = await readAll(db, ITEM_STORE);
    let migrated = 0;
    for (const item of items) {
      if (!item.dataUrl || item.originalFileName) continue;
      try {
        item.originalFileName = await writeDataUrlToDirectory(db, item.id, item.dataUrl, item.originalFileName);
        const tx = db.transaction(ITEM_STORE, "readwrite");
        tx.objectStore(ITEM_STORE).put(item);
        await transactionDone(tx);
        migrated += 1;
      } catch (_) {
        break;
      }
    }
    return migrated;
  });
}

async function cacheExternalOriginals() {
  return withDb(async (db) => {
    const items = await readAll(db, ITEM_STORE);
    let cached = 0;
    for (const item of items) {
      if (item.dataUrl || !item.originalFileName) continue;
      try {
        item.dataUrl = await readOriginalFromDirectory(db, item.originalFileName);
        const transaction = db.transaction(ITEM_STORE, "readwrite");
        transaction.objectStore(ITEM_STORE).put(item);
        await transactionDone(transaction);
        cached += 1;
      } catch (_) {
        break;
      }
    }
    return cached;
  });
}

async function getLibrary() {
  return withDb(async (db) => {
    const [categories, items] = await Promise.all([
      readAll(db, CATEGORY_STORE),
      readAll(db, ITEM_STORE)
    ]);

    categories.sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
    const activeItems = items.filter((item) => item.categoryId !== TRASH_ID);

    const result = categories.map((category) => {
      const categoryItems = activeItems
        .filter((item) => item.categoryId === category.id)
        .sort((a, b) => Number(b.categoryAddedAt || b.createdAt || 0) - Number(a.categoryAddedAt || a.createdAt || 0));
      return {
        id: category.id,
        name: category.name,
        count: categoryItems.length,
        coverDataUrl: categoryItems[0]?.thumbDataUrl || ""
      };
    });

    return {
      categories: result,
      trashCount: items.filter((item) => item.categoryId === TRASH_ID).length,
      totalCount: activeItems.length
    };
  });
}

async function listItems(categoryId) {
  return withDb(async (db) => {
    const tx = db.transaction(ITEM_STORE, "readonly");
    const items = await requestResult(tx.objectStore(ITEM_STORE).index("categoryId").getAll(categoryId));
    await transactionDone(tx);
    items.sort((a, b) => Number(b.order ?? b.createdAt ?? 0) - Number(a.order ?? a.createdAt ?? 0));
    return items.map(({ dataUrl, ...item }) => item);
  });
}

async function listStyleItems(quadrant) {
  const selectedQuadrant = Number(quadrant);
  if (!Number.isInteger(selectedQuadrant) || selectedQuadrant < 1 || selectedQuadrant > 4) {
    throw new Error("风格象限不存在");
  }
  return withDb(async (db) => {
    const items = (await readAll(db, ITEM_STORE))
      .filter((item) => item.categoryId !== TRASH_ID && normalizeStyleQuadrants(item.styleQuadrants).includes(selectedQuadrant))
      .sort((a, b) => Number(b.order ?? b.createdAt ?? 0) - Number(a.order ?? a.createdAt ?? 0));
    return items.map(({ dataUrl, ...item }) => ({
      ...item,
      styleQuadrants: normalizeStyleQuadrants(item.styleQuadrants)
    }));
  });
}

async function setItemStyleQuadrants(id, quadrants) {
  return withDb(async (db) => {
    const tx = db.transaction(ITEM_STORE, "readwrite");
    const store = tx.objectStore(ITEM_STORE);
    const item = await requestResult(store.get(id));
    if (!item) throw new Error("灵感不存在");
    item.styleQuadrants = normalizeStyleQuadrants(quadrants);
    store.put(item);
    await transactionDone(tx);
    return item.styleQuadrants;
  });
}

async function getItem(id) {
  return withDb(async (db) => {
    const tx = db.transaction(ITEM_STORE, "readonly");
    const item = await requestResult(tx.objectStore(ITEM_STORE).get(id));
    await transactionDone(tx);
    if (!item) throw new Error("这份灵感已经不在箱子里了");
    if (!item.dataUrl && item.originalFileName) {
      item.dataUrl = await readOriginalFromDirectory(db, item.originalFileName);
      const cacheTransaction = db.transaction(ITEM_STORE, "readwrite");
      cacheTransaction.objectStore(ITEM_STORE).put(item);
      await transactionDone(cacheTransaction);
    }
    if (!item.dataUrl) throw new Error("这份灵感只剩缩略图，重新选择原图文件夹后再试");
    return item;
  });
}

async function addCategory(name) {
  const normalized = String(name || "").trim().slice(0, 30);
  if (!normalized) throw new Error("分类名称不能为空");
  if (normalized === "回收站") throw new Error("“回收站”是保留名称");

  return withDb(async (db) => {
    const tx = db.transaction(CATEGORY_STORE, "readwrite");
    const store = tx.objectStore(CATEGORY_STORE);
    const categories = await requestResult(store.getAll());
    if (categories.some((category) => String(category.name).toLowerCase() === normalized.toLowerCase())) {
      tx.abort();
      throw new Error("这个分类已经存在");
    }
    const category = {
      id: makeId("cat"),
      name: normalized,
      coverDataUrl: "",
      createdAt: Date.now()
    };
    store.put(category);
    await transactionDone(tx);
    return category;
  });
}

async function renameCategory(categoryId, name) {
  const normalized = String(name || "").trim().slice(0, 30);
  if (!normalized) throw new Error("分类名称不能为空");
  if (normalized === "回收站") throw new Error("“回收站”是保留名称");
  return withDb(async (db) => {
    const tx = db.transaction(CATEGORY_STORE, "readwrite");
    const store = tx.objectStore(CATEGORY_STORE);
    const categories = await requestResult(store.getAll());
    const category = categories.find((entry) => entry.id === categoryId);
    if (!category) {
      tx.abort();
      throw new Error("分类不存在");
    }
    if (categories.some((entry) => entry.id !== categoryId && String(entry.name).toLowerCase() === normalized.toLowerCase())) {
      tx.abort();
      throw new Error("这个分类名称已经存在");
    }
    category.name = normalized;
    category.updatedAt = Date.now();
    store.put(category);
    await transactionDone(tx);
    return category;
  });
}

async function deleteCategory(categoryId) {
  if (!categoryId || categoryId === TRASH_ID) throw new Error("这个分类不能删除");
  return withDb(async (db) => {
    const tx = db.transaction([CATEGORY_STORE, ITEM_STORE], "readwrite");
    const categoryStore = tx.objectStore(CATEGORY_STORE);
    const itemStore = tx.objectStore(ITEM_STORE);
    const category = await requestResult(categoryStore.get(categoryId));
    if (!category) {
      tx.abort();
      throw new Error("分类不存在");
    }
    const items = await requestResult(itemStore.index("categoryId").getAll(categoryId));
    const deletedAt = Date.now();
    items.forEach((item) => {
      item.originalCategoryId = categoryId;
      item.categoryId = TRASH_ID;
      item.deletedAt = deletedAt;
      itemStore.put(item);
    });
    categoryStore.delete(categoryId);
    await transactionDone(tx);
    return { moved: items.length, name: category.name };
  });
}

async function addItem(payload) {
  if (!payload?.dataUrl || !payload?.thumbDataUrl) throw new Error("截图数据不完整");
  return withDb(async (db) => {
    const checkTx = db.transaction(CATEGORY_STORE, "readonly");
    const category = await requestResult(checkTx.objectStore(CATEGORY_STORE).get(payload.categoryId));
    await transactionDone(checkTx);
    if (!category) throw new Error("所选分类不存在");

    const itemId = makeId("idea");
    const internalDataUrl = payload.dataUrl;
    let originalFileName = "";
    try {
      originalFileName = await writeDataUrlToDirectory(db, itemId, payload.dataUrl);
    } catch (_) {}

    const item = {
      id: itemId,
      categoryId: category.id,
      originalCategoryId: category.id,
      note: String(payload.note || "").trim().slice(0, 500),
      dataUrl: internalDataUrl,
      originalFileName,
      thumbDataUrl: payload.thumbDataUrl,
      width: Math.max(1, Number(payload.width || 1)),
      height: Math.max(1, Number(payload.height || 1)),
      createdAt: Date.now(),
      categoryAddedAt: Date.now(),
      order: Date.now(),
      deletedAt: 0,
      styleQuadrants: []
    };
    const tx = db.transaction(ITEM_STORE, "readwrite");
    tx.objectStore(ITEM_STORE).put(item);
    await transactionDone(tx);
    return { id: item.id, categoryId: item.categoryId };
  });
}

async function updateItem(id, payload = {}) {
  return withDb(async (db) => {
    const readTx = db.transaction(ITEM_STORE, "readonly");
    const existing = await requestResult(readTx.objectStore(ITEM_STORE).get(id));
    await transactionDone(readTx);
    if (!existing) throw new Error("灵感不存在");

    existing.note = String(payload.note ?? existing.note ?? "").trim().slice(0, 500);
    if (payload.dataUrl && payload.thumbDataUrl) {
      let originalFileName = existing.originalFileName || "";
      try {
        originalFileName = await writeDataUrlToDirectory(db, existing.id, payload.dataUrl, originalFileName);
      } catch (_) {
        originalFileName = "";
      }
      existing.dataUrl = String(payload.dataUrl);
      existing.originalFileName = originalFileName;
      existing.thumbDataUrl = String(payload.thumbDataUrl);
      existing.width = Math.max(1, Number(payload.width || existing.width || 1));
      existing.height = Math.max(1, Number(payload.height || existing.height || 1));
    }
    existing.updatedAt = Date.now();
    const writeTx = db.transaction(ITEM_STORE, "readwrite");
    writeTx.objectStore(ITEM_STORE).put(existing);
    await transactionDone(writeTx);
    const { dataUrl, ...metadata } = existing;
    return metadata;
  });
}

async function moveItemToTrash(id) {
  return withDb(async (db) => {
    const tx = db.transaction(ITEM_STORE, "readwrite");
    const store = tx.objectStore(ITEM_STORE);
    const item = await requestResult(store.get(id));
    if (!item) throw new Error("灵感不存在");
    if (item.categoryId !== TRASH_ID) item.originalCategoryId = item.categoryId;
    item.categoryId = TRASH_ID;
    item.deletedAt = Date.now();
    item.order = Date.now();
    store.put(item);
    await transactionDone(tx);
    return true;
  });
}

async function restoreItem(id) {
  return withDb(async (db) => {
    const categoryTx = db.transaction(CATEGORY_STORE, "readonly");
    const categories = await requestResult(categoryTx.objectStore(CATEGORY_STORE).getAll());
    await transactionDone(categoryTx);

    const tx = db.transaction(ITEM_STORE, "readwrite");
    const store = tx.objectStore(ITEM_STORE);
    const item = await requestResult(store.get(id));
    if (!item) throw new Error("灵感不存在");
    const wanted = categories.find((category) => category.id === item.originalCategoryId);
    item.categoryId = wanted?.id || categories[0]?.id || DEFAULT_CATEGORY_ID;
    item.originalCategoryId = item.categoryId;
    item.deletedAt = 0;
    item.categoryAddedAt = Date.now();
    item.order = Date.now();
    store.put(item);
    await transactionDone(tx);
    return true;
  });
}

async function permanentlyDeleteItem(id) {
  return withDb(async (db) => {
    const tx = db.transaction(ITEM_STORE, "readwrite");
    const store = tx.objectStore(ITEM_STORE);
    const item = await requestResult(store.get(id));
    store.delete(id);
    await transactionDone(tx);
    await removeOriginalFromDirectory(db, item?.originalFileName);
    return true;
  });
}

async function clearTrashItems() {
  return withDb(async (db) => {
    const transaction = db.transaction(ITEM_STORE, "readwrite");
    const store = transaction.objectStore(ITEM_STORE);
    const items = await requestResult(store.getAll());
    const trashItems = items.filter((item) => item.categoryId === TRASH_ID);
    trashItems.forEach((item) => store.delete(item.id));
    await transactionDone(transaction);
    return trashItems.length;
  });
}

async function moveItemToCategory(id, categoryId) {
  if (!categoryId) throw new Error("目标分类不存在");
  if (categoryId === TRASH_ID) return moveItemToTrash(id);
  return withDb(async (db) => {
    const categoryTx = db.transaction(CATEGORY_STORE, "readonly");
    const category = await requestResult(categoryTx.objectStore(CATEGORY_STORE).get(categoryId));
    await transactionDone(categoryTx);
    if (!category) throw new Error("目标分类不存在");

    const tx = db.transaction(ITEM_STORE, "readwrite");
    const store = tx.objectStore(ITEM_STORE);
    const item = await requestResult(store.get(id));
    if (!item) throw new Error("灵感不存在");
    item.categoryId = categoryId;
    item.originalCategoryId = categoryId;
    item.deletedAt = 0;
    item.categoryAddedAt = Date.now();
    item.order = Date.now();
    store.put(item);
    await transactionDone(tx);
    return true;
  });
}

async function reorderItems(categoryId, orderedIds) {
  const ids = Array.isArray(orderedIds) ? orderedIds.filter(Boolean) : [];
  return withDb(async (db) => {
    const tx = db.transaction(ITEM_STORE, "readwrite");
    const store = tx.objectStore(ITEM_STORE);
    const allItems = await requestResult(store.getAll());
    const itemById = new Map(allItems.map((item) => [item.id, item]));
    for (let index = 0; index < ids.length; index += 1) {
      const item = itemById.get(ids[index]);
      if (!item || item.categoryId !== categoryId) continue;
      item.order = (ids.length - index) * 1000;
      store.put(item);
    }
    await transactionDone(tx);
    return true;
  });
}

async function exportInspirationData() {
  return withDb(async (db) => {
    const storage = await readSetting(db, "originalDirectory");
    return {
      version: 3,
      storageDirectoryName: storage?.name || storage?.expectedName || "",
      categories: await readAll(db, CATEGORY_STORE),
      items: (await readAll(db, ITEM_STORE)).map(({ dataUrl, ...item }) => item)
    };
  });
}

async function exportInspirationIndex() {
  return withDb(async (db) => {
    const storage = await readSetting(db, "originalDirectory");
    return {
      version: 3,
      storageDirectoryName: storage?.name || storage?.expectedName || "",
      categories: await readAll(db, CATEGORY_STORE),
      items: (await readAll(db, ITEM_STORE)).map(({ dataUrl, thumbDataUrl, ...item }) => item)
    };
  });
}

async function exportOneInspirationItem(id) {
  return withDb(async (db) => {
    const tx = db.transaction(ITEM_STORE, "readonly");
    const item = await requestResult(tx.objectStore(ITEM_STORE).get(id));
    await transactionDone(tx);
    if (!item) throw new Error("灵感不存在");
    const { dataUrl, ...metadata } = item;
    return metadata;
  });
}

async function importInspirationData(payload) {
  if (!payload || !Array.isArray(payload.categories) || !Array.isArray(payload.items)) return false;
  return withDb(async (db) => {
    const tx = db.transaction([CATEGORY_STORE, ITEM_STORE], "readwrite");
    const categories = tx.objectStore(CATEGORY_STORE);
    const items = tx.objectStore(ITEM_STORE);
    categories.clear();
    items.clear();
    payload.categories.forEach((category) => {
      if (category?.id && category?.name) categories.put(category);
    });
    payload.items.forEach((item) => {
      if (item?.id && item?.thumbDataUrl) {
        items.put({ ...item, dataUrl: typeof item.dataUrl === "string" ? item.dataUrl : "" });
      }
    });
    await transactionDone(tx);
    return true;
  });
}

async function beginInspirationImport(categoriesPayload, storageDirectoryName = "") {
  const incoming = Array.isArray(categoriesPayload) ? categoriesPayload : [];
  return withDb(async (db) => {
    const tx = db.transaction([CATEGORY_STORE, ITEM_STORE], "readwrite");
    const categories = tx.objectStore(CATEGORY_STORE);
    categories.clear();
    tx.objectStore(ITEM_STORE).clear();
    incoming.forEach((category) => {
      if (category?.id && category?.name) categories.put(category);
    });
    if (!incoming.some((category) => category?.id && category?.name)) {
      categories.put({ id: DEFAULT_CATEGORY_ID, name: "随手一捡", coverDataUrl: "", createdAt: Date.now() });
    }
    await transactionDone(tx);
    if (storageDirectoryName) {
      const current = await readSetting(db, "originalDirectory");
      const importedName = String(storageDirectoryName);
      const currentName = String(current?.name || current?.expectedName || "");
      const canReuseCurrentHandle = Boolean(current?.handle) && currentName === importedName;
      await writeSetting(db, {
        key: "originalDirectory",
        handle: canReuseCurrentHandle ? current.handle : undefined,
        name: canReuseCurrentHandle ? current.name : "",
        expectedName: importedName,
        updatedAt: Date.now()
      });
    }
    return true;
  });
}

async function importOneInspirationItem(item) {
  if (!item?.id || !item?.thumbDataUrl) throw new Error("灵感备份中有一项缩略图不完整");
  return withDb(async (db) => {
    const tx = db.transaction(ITEM_STORE, "readwrite");
    tx.objectStore(ITEM_STORE).put({
      ...item,
      dataUrl: typeof item.dataUrl === "string" ? item.dataUrl : ""
    });
    await transactionDone(tx);
    return true;
  });
}

async function broadcastStorageChanged() {
  try {
    const tabs = await chrome.tabs.query({});
    await Promise.allSettled(tabs
      .filter((tab) => Number.isInteger(tab.id))
      .map((tab) => chrome.tabs.sendMessage(tab.id, { type: "mpg-inspiration:storage-changed" })));
  } catch (_) {}
}

async function storageSelected() {
  await ensureStorageHost();
  const migrated = await migrateInternalOriginals();
  await cacheExternalOriginals();
  await broadcastStorageChanged();
  return migrated;
}

function localDateStamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function buildDailyBackupPayload() {
  const data = await readConfigState();
  if (!data) throw new Error("还没有可备份的插件配置");
  return {
    name: "Miorning Prompt Guard Config",
    version: "1.8.0",
    exportedAt: new Date().toISOString(),
    automaticBackup: true,
    data,
    inspirationBox: await exportInspirationData()
  };
}

async function saveBackupToDownloads(fileName, text) {
  const prepared = await callStorageHost("download-text", {
    text,
    mime: "application/json;charset=utf-8"
  }, assertAutoBackupEnabled);
  if (!prepared?.url) throw new Error("自动备份文件生成失败");
  await assertAutoBackupEnabled();
  await chrome.downloads.download({
    url: prepared.url,
    filename: `MIORNING-自动备份/${fileName}`,
    conflictAction: "overwrite",
    saveAs: false
  });
}

async function runDailyBackup(force = false) {
  const date = localDateStamp();
  await assertAutoBackupEnabled();
  const saved = await chrome.storage.local.get(DAILY_BACKUP_KEY);
  if (!force && saved[DAILY_BACKUP_KEY] === date) return { skipped: true, date };
  const payload = await buildDailyBackupPayload();
  const text = JSON.stringify(payload, null, 2);
  const fileName = `Miorning-Prompt-Guard-自动备份-${date}.json`;
  let location = "downloads";
  try {
    await callStorageHost("write-text", {
      folderName: "MIORNING-自动备份",
      fileName,
      text,
      mime: "application/json;charset=utf-8"
    }, assertAutoBackupEnabled);
    location = "original-directory";
  } catch (error) {
    if (error?.code === "AUTO_BACKUP_DISABLED") throw error;
    await saveBackupToDownloads(fileName, text);
  }
  await chrome.storage.local.set({ [DAILY_BACKUP_KEY]: date });
  return { skipped: false, date, location, fileName };
}

async function performDailyBackup(force = false) {
  if (!dailyBackupInFlight) {
    dailyBackupInFlight = runDailyBackup(force)
      .catch((error) => {
        if (error?.code === "AUTO_BACKUP_DISABLED") {
          return { skipped: true, reason: "disabled", date: localDateStamp() };
        }
        throw error;
      })
      .finally(() => { dailyBackupInFlight = null; });
  }
  return dailyBackupInFlight;
}

async function scheduleDailyBackup() {
  if (!isAutoBackupEnabled(await readConfigState())) {
    await chrome.alarms.clear(DAILY_BACKUP_ALARM);
    return false;
  }
  await chrome.alarms.create(DAILY_BACKUP_ALARM, { delayInMinutes: 0.2, periodInMinutes: 360 });
  // A settings change can arrive while Chrome is creating the alarm.
  if (!isAutoBackupEnabled(await readConfigState())) {
    await chrome.alarms.clear(DAILY_BACKUP_ALARM);
    return false;
  }
  return true;
}

async function scheduleTrashTalkReminder(reminder) {
  await chrome.alarms.clear(TRASH_TALK_ALARM);
  if (!isTrashTalkEnabled(await readConfigState())) return false;
  const endAt = Number(reminder?.endAt || 0);
  if (reminder?.active && endAt > Date.now()) {
    await chrome.alarms.create(TRASH_TALK_ALARM, { when: endAt });
    if (!isTrashTalkEnabled(await readConfigState())) {
      await chrome.alarms.clear(TRASH_TALK_ALARM);
      return false;
    }
  }
  return true;
}

async function schedulePersistedTrashTalkReminder() {
  const data = await readConfigState();
  if (!isTrashTalkEnabled(data)) {
    await chrome.alarms.clear(TRASH_TALK_ALARM);
    return false;
  }
  const reminder = data?.trashTalk?.reminder;
  if (!reminder?.active) return scheduleTrashTalkReminder(reminder);
  if (Number(reminder.endAt || 0) <= Date.now()) return deliverTrashTalkReminder();
  await scheduleTrashTalkReminder(reminder);
}

async function deliverTrashTalkReminder() {
  let data = await readConfigState();
  if (!isTrashTalkEnabled(data)) return false;
  let reminder = data?.trashTalk?.reminder;
  if (!reminder?.active) return false;
  if (Number(reminder.endAt || 0) > Date.now()) {
    await scheduleTrashTalkReminder(reminder);
    return false;
  }
  const tabs = await chrome.tabs.query({ active: true });
  data = await readConfigState();
  reminder = data?.trashTalk?.reminder;
  if (!isTrashTalkEnabled(data) || !reminder?.active || Number(reminder.endAt || 0) > Date.now()) return false;
  const results = await Promise.allSettled(tabs
    .filter((tab) => Number.isInteger(tab.id))
    .map((tab) => chrome.tabs.sendMessage(tab.id, {
      type: "mpg-trash-talk:timer-fired",
      reminder: {
        active: true,
        endAt: Number(reminder.endAt || Date.now()),
        message: String(reminder.message || "时间到了。")
      }
    })));
  if (!results.some((result) => result.status === "fulfilled")) {
    await scheduleTrashTalkReminder({ ...reminder, endAt: Date.now() + 30000 });
    return false;
  }
  // Preserve new settings (including DLC / backup switches) changed during delivery.
  const latest = await readConfigState();
  const latestReminder = latest?.trashTalk?.reminder;
  if (isTrashTalkEnabled(latest) && latestReminder?.active
    && Number(latestReminder.endAt || 0) === Number(reminder.endAt || 0)
    && String(latestReminder.message || "") === String(reminder.message || "")) {
    latest.trashTalk.reminder = { active: false, endAt: 0, message: String(reminder.message || "") };
    await chrome.storage.local.set({ [CONFIG_STATE_KEY]: latest });
  }
  return true;
}

function nextNightTrashTalkTime(slot, now = Date.now()) {
  const candidate = new Date(now);
  candidate.setHours(slot.hour, slot.minute, 0, 0);
  if (candidate.getTime() <= now + 1000) candidate.setDate(candidate.getDate() + 1);
  return candidate.getTime();
}

async function scheduleNightTrashTalkSlot(slot) {
  const alarmName = `${NIGHT_TRASH_TALK_ALARM_PREFIX}${slot.id}`;
  if (!isNightTrashTalkEnabled(await readConfigState())) {
    await chrome.alarms.clear(alarmName);
    return false;
  }
  await chrome.alarms.create(alarmName, {
    when: nextNightTrashTalkTime(slot)
  });
  if (!isNightTrashTalkEnabled(await readConfigState())) {
    await chrome.alarms.clear(alarmName);
    return false;
  }
  return true;
}

async function scheduleNightTrashTalkAlarms() {
  await Promise.all(NIGHT_TRASH_TALK_SLOTS.map(scheduleNightTrashTalkSlot));
}

async function deliverNightTrashTalk(slot) {
  if (!isNightTrashTalkEnabled(await readConfigState())) return false;
  const tabs = await chrome.tabs.query({ active: true });
  if (!isNightTrashTalkEnabled(await readConfigState())) return false;
  const results = await Promise.allSettled(tabs
    .filter((tab) => Number.isInteger(tab.id))
    .map((tab) => chrome.tabs.sendMessage(tab.id, {
      type: "mpg-trash-talk:system-night",
      message: slot.message,
      duration: 60000
    })));
  return results.some((result) => result.status === "fulfilled");
}

async function handleNightTrashTalkAlarm(alarm) {
  const slotId = String(alarm?.name || "").slice(NIGHT_TRASH_TALK_ALARM_PREFIX.length);
  const slot = NIGHT_TRASH_TALK_SLOTS.find((item) => item.id === slotId);
  if (!slot) return false;
  if (!await scheduleNightTrashTalkSlot(slot)) return false;
  const lateBy = Date.now() - Number(alarm?.scheduledTime || Date.now());
  if (lateBy <= 5 * 60 * 1000) await deliverNightTrashTalk(slot);
  return true;
}

async function openStoragePopup(sender) {
  await ensureStorageHost();
  const options = Number.isInteger(sender?.tab?.windowId) ? { windowId: sender.tab.windowId } : undefined;
  await chrome.action.openPopup(options);
  return true;
}

function captureVisible(sender) {
  return new Promise((resolve, reject) => {
    if (!sender.tab) return reject(new Error("当前页面无法截图"));
    chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: "png" }, (dataUrl) => {
      const error = chrome.runtime.lastError;
      if (error) return reject(new Error(error.message || "截图失败"));
      if (!dataUrl) return reject(new Error("截图失败：未取得画面"));
      resolve(dataUrl);
    });
  });
}

async function handleMessage(message, sender) {
  switch (message?.type) {
    case "mpg-inspiration:capture-visible": return { dataUrl: await captureVisible(sender) };
    case "mpg-inspiration:get-library": return await getLibrary();
    case "mpg-inspiration:list-items": return { items: await listItems(message.categoryId) };
    case "mpg-inspiration:list-style-items": return { items: await listStyleItems(message.quadrant) };
    case "mpg-inspiration:get-item": return { item: await getItem(message.id) };
    case "mpg-inspiration:set-item-styles": return { quadrants: await setItemStyleQuadrants(message.id, message.quadrants) };
    case "mpg-inspiration:add-category": return { category: await addCategory(message.name) };
    case "mpg-inspiration:rename-category": return { category: await renameCategory(message.categoryId, message.name) };
    case "mpg-inspiration:delete-category": return { result: await deleteCategory(message.categoryId) };
    case "mpg-inspiration:add-item": return { item: await addItem(message.item) };
    case "mpg-inspiration:update-item": return { item: await updateItem(message.id, message.item) };
    case "mpg-inspiration:trash-item": return { updated: await moveItemToTrash(message.id) };
    case "mpg-inspiration:restore-item": return { updated: await restoreItem(message.id) };
    case "mpg-inspiration:delete-item": return { updated: await permanentlyDeleteItem(message.id) };
    case "mpg-inspiration:clear-trash": return { cleared: await clearTrashItems() };
    case "mpg-inspiration:move-item": return { updated: await moveItemToCategory(message.id, message.categoryId) };
    case "mpg-inspiration:reorder-items": return { updated: await reorderItems(message.categoryId, message.ids) };
    case "mpg-inspiration:get-storage-status": return { storage: await getStorageStatus() };
    case "mpg-inspiration:storage-selected": return { migrated: await storageSelected() };
    case "mpg-inspiration:open-storage-popup": return { opened: await openStoragePopup(sender) };
    case "mpg-inspiration:export": return { data: await exportInspirationData() };
    case "mpg-inspiration:export-index": return { data: await exportInspirationIndex() };
    case "mpg-inspiration:export-item": return { item: await exportOneInspirationItem(message.id) };
    case "mpg-inspiration:import": return { imported: await importInspirationData(message.data) };
    case "mpg-inspiration:import-start": return { imported: await beginInspirationImport(message.categories, message.storageDirectoryName) };
    case "mpg-inspiration:import-item": return { imported: await importOneInspirationItem(message.item) };
    case "mpg-inspiration:daily-backup": return { backup: await performDailyBackup(Boolean(message.force)) };
    default: throw new Error("未知的灵感箱操作");
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!String(message?.type || "").startsWith("mpg-inspiration:")) return false;
  handleMessage(message, sender)
    .then((payload) => sendResponse({ ok: true, ...payload }))
    .catch((error) => sendResponse({ ok: false, error: error?.message || "灵感箱操作失败" }));
  return true;
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "mpg-trash-talk:schedule") return false;
  scheduleTrashTalkReminder(message.reminder)
    .then(() => sendResponse({ ok: true }))
    .catch((error) => sendResponse({ ok: false, error: error?.message || "提醒设置失败" }));
  return true;
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  const configChanges = [CONFIG_STATE_KEY, ...LEGACY_CONFIG_STATE_KEYS]
    .map((key) => changes[key]).filter(Boolean);
  // Adding/removing a versioned key can change which legacy configuration wins.
  const sourceChanged = configChanges.some(({ oldValue, newValue }) => !oldValue || !newValue);
  if (sourceChanged || configChanges.some(({ oldValue, newValue }) => isAutoBackupEnabled(oldValue) !== isAutoBackupEnabled(newValue))) {
    scheduleDailyBackup().catch(() => {});
  }
  if (sourceChanged || configChanges.some(({ oldValue, newValue }) => isTrashTalkEnabled(oldValue) !== isTrashTalkEnabled(newValue))) {
    schedulePersistedTrashTalkReminder().catch(() => {});
  }
  if (sourceChanged || configChanges.some(({ oldValue, newValue }) => isNightTrashTalkEnabled(oldValue) !== isNightTrashTalkEnabled(newValue))) {
    scheduleNightTrashTalkAlarms().catch(() => {});
  }
});

chrome.runtime.onInstalled.addListener(() => {
  withDb(async () => true).catch(() => {});
  ensureStorageHost().catch(() => {});
  scheduleDailyBackup().catch(() => {});
  scheduleNightTrashTalkAlarms().catch(() => {});
  schedulePersistedTrashTalkReminder().catch(() => {});
});

chrome.runtime.onStartup.addListener(() => {
  ensureStorageHost().catch(() => {});
  scheduleDailyBackup().catch(() => {});
  scheduleNightTrashTalkAlarms().catch(() => {});
  schedulePersistedTrashTalkReminder().catch(() => {});
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (String(alarm?.name || "").startsWith(NIGHT_TRASH_TALK_ALARM_PREFIX)) {
    handleNightTrashTalkAlarm(alarm).catch(() => {});
    return;
  }
  if (alarm?.name === DAILY_BACKUP_ALARM) {
    performDailyBackup().catch(() => {});
    return;
  }
  if (alarm?.name === TRASH_TALK_ALARM) deliverTrashTalkReminder().catch(() => {});
});
