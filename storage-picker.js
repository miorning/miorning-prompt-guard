const DB_NAME = "miorning_inspiration_box";
const DB_VERSION = 2;
const SETTINGS_STORE = "settings";

function applyStorageTheme(data) {
  document.documentElement.classList.toggle("day", data?.uiTheme === "day");
}
chrome.storage.local.get("mpg_state_v1_7_0", result => applyStorageTheme(result?.mpg_state_v1_7_0));
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.mpg_state_v1_7_0) applyStorageTheme(changes.mpg_state_v1_7_0.newValue);
});

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("数据库操作失败"));
  });
}

function transactionDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error || new Error("数据库写入失败"));
    tx.onabort = () => reject(tx.error || new Error("数据库写入被取消"));
  });
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("categories")) {
        const categories = db.createObjectStore("categories", { keyPath: "id" });
        categories.createIndex("createdAt", "createdAt", { unique: false });
      }
      if (!db.objectStoreNames.contains("items")) {
        const items = db.createObjectStore("items", { keyPath: "id" });
        items.createIndex("categoryId", "categoryId", { unique: false });
        items.createIndex("createdAt", "createdAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) db.createObjectStore(SETTINGS_STORE, { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("无法打开灵感箱数据库"));
  });
}

async function readRecord() {
  const db = await openDb();
  try {
    const tx = db.transaction(SETTINGS_STORE, "readonly");
    const record = await requestResult(tx.objectStore(SETTINGS_STORE).get("originalDirectory"));
    await transactionDone(tx);
    return record || null;
  } finally { db.close(); }
}

async function saveHandle(handle) {
  const db = await openDb();
  try {
    const tx = db.transaction(SETTINGS_STORE, "readwrite");
    tx.objectStore(SETTINGS_STORE).put({
      key: "originalDirectory",
      handle,
      name: handle.name,
      expectedName: handle.name,
      updatedAt: Date.now()
    });
    await transactionDone(tx);
  } finally { db.close(); }
}

function showMessage(text, error = false) {
  const node = document.getElementById("message");
  node.textContent = text;
  node.classList.toggle("error", error);
}

async function render() {
  const record = await readRecord();
  const name = record?.name || record?.expectedName || "尚未选择";
  document.getElementById("folder-name").textContent = name;
  const reauthorize = document.getElementById("reauthorize");
  reauthorize.hidden = !record?.handle;
  if (record?.handle) {
    const permission = typeof record.handle.queryPermission === "function"
      ? await record.handle.queryPermission({ mode: "readwrite" }).catch(() => "prompt")
      : "granted";
    document.getElementById("permission-text").textContent = permission === "granted"
      ? "文件夹已连接，后续截图会直接保存原图。"
      : "浏览器重启后可能需要重新授权当前文件夹。";
    reauthorize.hidden = permission === "granted";
  }
}

async function notifySelected() {
  const response = await chrome.runtime.sendMessage({ type: "mpg-inspiration:storage-selected" });
  if (!response?.ok) throw new Error(response?.error || "原图迁移失败");
  return Number(response.migrated || 0);
}

document.getElementById("choose").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  if (typeof window.showDirectoryPicker !== "function") return showMessage("当前浏览器不支持选择文件夹，请升级 Chrome / Edge。", true);
  button.disabled = true;
  try {
    const handle = await window.showDirectoryPicker({ mode: "readwrite", id: "miorning-inspiration-originals" });
    await saveHandle(handle);
    showMessage("正在迁移已有原图…");
    const migrated = await notifySelected();
    await render();
    showMessage(`文件夹已连接，已迁移 ${migrated} 张浏览器内原图。`);
  } catch (error) {
    if (error?.name !== "AbortError") showMessage(error?.message || "文件夹选择失败", true);
  } finally { button.disabled = false; }
});

document.getElementById("reauthorize").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    const record = await readRecord();
    if (!record?.handle) throw new Error("没有可重新授权的文件夹");
    const permission = typeof record.handle.requestPermission === "function"
      ? await record.handle.requestPermission({ mode: "readwrite" })
      : "granted";
    if (permission !== "granted") throw new Error("没有取得文件夹权限");
    const migrated = await notifySelected();
    await render();
    showMessage(`授权成功，已迁移 ${migrated} 张原图。`);
  } catch (error) {
    showMessage(error?.message || "重新授权失败", true);
  } finally { button.disabled = false; }
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  event.preventDefault();
  window.close();
}, true);

document.getElementById("close").addEventListener("click", () => window.close());

render().catch((error) => showMessage(error?.message || "读取保存位置失败", true));
