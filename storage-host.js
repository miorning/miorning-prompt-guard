const DB_NAME = "miorning_inspiration_box";
const DB_VERSION = 2;
const SETTINGS_STORE = "settings";

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("数据库操作失败"));
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("数据库操作失败"));
    transaction.onabort = () => reject(transaction.error || new Error("数据库操作被取消"));
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
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("无法打开灵感箱数据库"));
  });
}

async function readDirectoryRecord() {
  const db = await openDb();
  try {
    const transaction = db.transaction(SETTINGS_STORE, "readonly");
    const record = await requestResult(transaction.objectStore(SETTINGS_STORE).get("originalDirectory"));
    await transactionDone(transaction);
    return record || null;
  } finally { db.close(); }
}

async function queryHandlePermission(handle, mode) {
  if (typeof handle?.queryPermission !== "function") return "granted";
  return await handle.queryPermission({ mode }).catch(() => "prompt");
}

async function getGrantedDirectory(mode = "readwrite") {
  const record = await readDirectoryRecord();
  if (!record?.handle) throw new Error("尚未选择原图保存文件夹");
  const permission = await queryHandlePermission(record.handle, mode);
  if (permission !== "granted") throw new Error("原图文件夹需要重新授权");
  return { handle: record.handle, permission };
}

async function handleAction(action, payload = {}) {
  if (action === "status") {
    const record = await readDirectoryRecord();
    if (!record?.handle) return { permission: "missing" };
    return {
      permission: await queryHandlePermission(record.handle, "readwrite")
    };
  }

  if (action === "write") {
    const { handle } = await getGrantedDirectory("readwrite");
    const fileName = payload.preferredName || `MIORNING-${payload.itemId}.png`;
    const fileHandle = await handle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    try {
      const blob = await (await fetch(payload.dataUrl)).blob();
      await writable.write(blob);
    } finally {
      await writable.close();
    }
    return fileName;
  }

  if (action === "write-text") {
    const { handle } = await getGrantedDirectory("readwrite");
    const folderName = String(payload.folderName || "").trim();
    const target = folderName
      ? await handle.getDirectoryHandle(folderName, { create: true })
      : handle;
    const fileName = String(payload.fileName || "MIORNING-自动备份.json");
    const fileHandle = await target.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    try {
      await writable.write(new Blob([String(payload.text || "")], { type: payload.mime || "application/json;charset=utf-8" }));
    } finally {
      await writable.close();
    }
    return { fileName, folderName };
  }

  if (action === "download-text") {
    const blob = new Blob([String(payload.text || "")], { type: payload.mime || "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return { url };
  }

  if (action === "read") {
    const { handle } = await getGrantedDirectory("read");
    const fileHandle = await handle.getFileHandle(payload.fileName, { create: false });
    const file = await fileHandle.getFile();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error("读取原图失败"));
      reader.readAsDataURL(file);
    });
  }

  if (action === "remove") {
    const { handle } = await getGrantedDirectory("readwrite");
    await handle.removeEntry(payload.fileName);
    return true;
  }

  throw new Error("未知的原图库操作");
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.target !== "mpg-storage-host") return false;
  handleAction(message.action, message.payload)
    .then((result) => sendResponse({ ok: true, result }))
    .catch((error) => sendResponse({ ok: false, error: error?.message || "原图库操作失败" }));
  return true;
});
