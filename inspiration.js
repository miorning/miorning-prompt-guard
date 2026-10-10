(() => {
  if (window.MiorningInspiration) return;
  const moduleEnabled = (id) => window.MiorningApp?.isDlcEnabled?.(id) === true;

  const TRASH_ID = "__trash__";
  const UI = {
    activeCategoryId: "",
    captureRequest: 0,
    inventoryOpenRequest: 0,
    drag: null,
    preview: null,
    toastTimer: null,
    inventoryRenderToken: 0,
    itemStylePicker: null,
    stylePicker: null,
    styleCloud: null,
    styleCloudToken: 0,
    pinnedStyle: null,
    editor: null,
    storageAuthorizationPrompted: false
  };
  const STYLE_JOIN_CONFIRM_KEY = "mpg_style_join_confirm_disabled";
  const TRASH_DRAG_QUIET_UNTIL_KEY = "mpg_trash_drag_quiet_until";

  const STYLE_QUADRANTS = [1, 2, 3, 4];
  const STYLE_QUADRANT_LABELS = {
    1: "明快热烈",
    2: "紧张压迫",
    3: "阴郁低沉",
    4: "舒缓治愈"
  };
  const STYLE_QUADRANT_META = {
    1: "正向 · 高能量",
    2: "负向 · 高能量",
    3: "负向 · 低能量",
    4: "正向 · 低能量"
  };

  function normalizeStyleQuadrants(value) {
    return Array.from(new Set((Array.isArray(value) ? value : [])
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item) && item >= 1 && item <= 4)))
      .sort((a, b) => a - b);
  }

  function stylePieMarkup(quadrants, className = "") {
    const active = new Set(normalizeStyleQuadrants(quadrants));
    return `<span class="mpg-style-pie ${safeText(className)}" aria-hidden="true">${STYLE_QUADRANTS
      .map((quadrant) => `<i class="q${quadrant} ${active.has(quadrant) ? "active" : ""}"></i>`)
      .join("")}</span>`;
  }

  function safeText(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function send(message) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          const runtimeError = chrome.runtime.lastError;
          if (runtimeError) return reject(new Error(runtimeError.message || "扩展连接失败"));
          if (!response?.ok) return reject(new Error(response?.error || "灵感箱操作失败"));
          resolve(response);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  function readLocalSetting(key) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(key, (result) => {
          if (chrome.runtime.lastError) return resolve(undefined);
          resolve(result?.[key]);
        });
      } catch (_) {
        resolve(undefined);
      }
    });
  }

  function writeLocalSetting(key, value) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.set({ [key]: value }, () => resolve(!chrome.runtime.lastError));
      } catch (_) {
        resolve(false);
      }
    });
  }

  function toast(message, danger = false) {
    let node = document.getElementById("mpg-inspiration-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "mpg-inspiration-toast";
      document.documentElement.appendChild(node);
    }
    node.textContent = String(message || "");
    node.classList.toggle("danger", danger);
    node.classList.add("show");
    clearTimeout(UI.toastTimer);
    UI.toastTimer = setTimeout(() => node?.classList.remove("show"), 2600);
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("图片读取失败"));
      image.src = src;
    });
  }

  async function fileToSquareCover(file) {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("图片读取失败"));
      reader.readAsDataURL(file);
    });
    const image = await loadImage(dataUrl);
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    const sx = Math.round((image.naturalWidth - side) / 2);
    const sy = Math.round((image.naturalHeight - side) / 2);
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 320;
    canvas.getContext("2d", { alpha: false }).drawImage(image, sx, sy, side, side, 0, 0, 320, 320);
    return canvas.toDataURL("image/webp", 0.86);
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("图片读取失败"));
      reader.readAsDataURL(file);
    });
  }

  async function prepareItemImage(dataUrl) {
    const image = await loadImage(dataUrl);
    const width = Math.max(1, image.naturalWidth);
    const height = Math.max(1, image.naturalHeight);
    const scale = Math.min(1, 640 / width, 360 / height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    canvas.getContext("2d", { alpha: false }).drawImage(image, 0, 0, canvas.width, canvas.height);
    return {
      dataUrl,
      thumbDataUrl: canvas.toDataURL("image/webp", 0.84),
      width,
      height
    };
  }

  function imageFileFromClipboard(event) {
    const files = Array.from(event.clipboardData?.files || []);
    const direct = files.find((file) => String(file.type || "").startsWith("image/"));
    if (direct) return direct;
    for (const item of Array.from(event.clipboardData?.items || [])) {
      if (String(item.type || "").startsWith("image/")) return item.getAsFile();
    }
    return null;
  }

  function closeCapture() {
    document.getElementById("mpg-inspiration-capture")?.remove();
  }

  function selectionBox(root) {
    return root.querySelector(".mpg-capture-selection");
  }

  function setSelection(root, rect) {
    const box = selectionBox(root);
    box.hidden = false;
    box.style.left = `${rect.x}px`;
    box.style.top = `${rect.y}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
    root._selection = rect;
  }

  function placeCaptureDock(root, rect) {
    const dock = root.querySelector(".mpg-capture-dock");
    dock.hidden = false;
    const dockWidth = Math.min(720, Math.max(440, window.innerWidth - 24));
    const left = Math.max(12, Math.min(window.innerWidth - dockWidth - 12, rect.x + (rect.width - dockWidth) / 2));
    const preferredTop = rect.y + rect.height + 12;
    const top = preferredTop + 112 <= window.innerHeight
      ? preferredTop
      : Math.max(12, rect.y - 118);
    dock.style.width = `${dockWidth}px`;
    dock.style.left = `${left}px`;
    dock.style.top = `${top}px`;
  }

  async function cropCapture(dataUrl, rect) {
    const image = await loadImage(dataUrl);
    const scaleX = image.naturalWidth / window.innerWidth;
    const scaleY = image.naturalHeight / window.innerHeight;
    const sx = Math.max(0, Math.round(rect.x * scaleX));
    const sy = Math.max(0, Math.round(rect.y * scaleY));
    const sw = Math.max(1, Math.min(image.naturalWidth - sx, Math.round(rect.width * scaleX)));
    const sh = Math.max(1, Math.min(image.naturalHeight - sy, Math.round(rect.height * scaleY)));

    const full = document.createElement("canvas");
    full.width = sw;
    full.height = sh;
    full.getContext("2d", { alpha: false }).drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);

    const thumbScale = Math.min(1, 640 / sw, 360 / sh);
    const thumb = document.createElement("canvas");
    thumb.width = Math.max(1, Math.round(sw * thumbScale));
    thumb.height = Math.max(1, Math.round(sh * thumbScale));
    thumb.getContext("2d", { alpha: false }).drawImage(full, 0, 0, thumb.width, thumb.height);

    return {
      dataUrl: full.toDataURL("image/png"),
      thumbDataUrl: thumb.toDataURL("image/webp", 0.84),
      width: sw,
      height: sh
    };
  }

  async function showCapture(dataUrl, library) {
    if (!moduleEnabled("inspiration")) return;
    closeInventory();
    closeCapture();

    const categories = Array.isArray(library?.categories) ? library.categories : [];
    const root = document.createElement("div");
    root.id = "mpg-inspiration-capture";
    root.innerHTML = `
      <img class="mpg-capture-frozen" alt="" draggable="false" src="${dataUrl}">
      <div class="mpg-capture-help">拖动框选灵感 · Esc 取消</div>
      <div class="mpg-capture-selection" hidden></div>
      <div class="mpg-capture-dock" hidden>
        <div class="mpg-capture-fields">
          <select class="mpg-capture-category" aria-label="灵感分类">
            ${categories.map((category) => `<option value="${safeText(category.id)}">${safeText(category.name)}</option>`).join("")}
            <option value="__new__">＋ 新建分类</option>
          </select>
          <input class="mpg-capture-new-category" maxlength="30" placeholder="新分类名称" hidden>
          <input class="mpg-capture-note" maxlength="500" placeholder="写点备注，免得以后连自己都看不懂">
        </div>
        <div class="mpg-capture-actions">
          <button type="button" data-capture-action="reselect">重选</button>
          <button type="button" data-capture-action="cancel">取消</button>
          <button type="button" class="primary" data-capture-action="save">收进灵感箱</button>
        </div>
      </div>
    `;
    document.documentElement.appendChild(root);

    const categorySelect = root.querySelector(".mpg-capture-category");
    const newCategoryInput = root.querySelector(".mpg-capture-new-category");
    categorySelect.addEventListener("change", () => {
      newCategoryInput.hidden = categorySelect.value !== "__new__";
      if (!newCategoryInput.hidden) newCategoryInput.focus();
    });

    let start = null;
    let drawing = false;
    const begin = (event) => {
      if (event.button !== 0 || event.target.closest?.(".mpg-capture-dock")) return;
      event.preventDefault();
      drawing = true;
      start = { x: event.clientX, y: event.clientY };
      root.querySelector(".mpg-capture-dock").hidden = true;
      setSelection(root, { x: start.x, y: start.y, width: 1, height: 1 });
      root.setPointerCapture?.(event.pointerId);
    };
    const move = (event) => {
      if (!drawing || !start) return;
      const x = Math.max(0, Math.min(start.x, event.clientX));
      const y = Math.max(0, Math.min(start.y, event.clientY));
      const right = Math.min(window.innerWidth, Math.max(start.x, event.clientX));
      const bottom = Math.min(window.innerHeight, Math.max(start.y, event.clientY));
      setSelection(root, { x, y, width: right - x, height: bottom - y });
    };
    const end = (event) => {
      if (!drawing) return;
      drawing = false;
      root.releasePointerCapture?.(event.pointerId);
      const rect = root._selection;
      if (!rect || rect.width < 24 || rect.height < 24) {
        selectionBox(root).hidden = true;
        root.querySelector(".mpg-capture-dock").hidden = true;
        root._selection = null;
        return;
      }
      placeCaptureDock(root, rect);
      root.querySelector(".mpg-capture-note")?.focus();
    };
    root.addEventListener("pointerdown", begin);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", end);
    root.addEventListener("pointercancel", end);

    root.addEventListener("click", async (event) => {
      const action = event.target.closest?.("[data-capture-action]")?.getAttribute("data-capture-action");
      if (!action) return;
      if (action === "cancel") return closeCapture();
      if (action === "reselect") {
        root._selection = null;
        selectionBox(root).hidden = true;
        root.querySelector(".mpg-capture-dock").hidden = true;
        return;
      }
      if (action !== "save" || !root._selection) return;

      const saveButton = event.target.closest("button");
      saveButton.disabled = true;
      saveButton.textContent = "正在收纳…";
      try {
        let categoryId = categorySelect.value;
        if (categoryId === "__new__") {
          const name = newCategoryInput.value.trim();
          if (!name) throw new Error("先给新分类起个名字");
          const created = await send({ type: "mpg-inspiration:add-category", name });
          categoryId = created.category.id;
        }
        if (!categoryId) throw new Error("请选择一个分类");
        const crop = await cropCapture(dataUrl, root._selection);
        await send({
          type: "mpg-inspiration:add-item",
          item: {
            categoryId,
            note: root.querySelector(".mpg-capture-note").value,
            ...crop
          }
        });
        UI.activeCategoryId = categoryId;
        closeCapture();
        window.dispatchEvent(new CustomEvent("MPG_INSPIRATION_ADDED"));
        toast("灵感已入箱。以后会不会用，交给以后的你。 ");
      } catch (error) {
        toast(error.message || "保存失败", true);
        saveButton.disabled = false;
        saveButton.textContent = "收进灵感箱";
      }
    });
  }

  async function startCapture() {
    if (!moduleEnabled("inspiration")) return;
    if (document.getElementById("mpg-inspiration-capture")) return;
    const request = ++UI.captureRequest;
    try {
      closeInventory();
      toast("正在冻结当前画面…");
      const [capture, library] = await Promise.all([
        send({ type: "mpg-inspiration:capture-visible" }),
        send({ type: "mpg-inspiration:get-library" })
      ]);
      if (request !== UI.captureRequest || !moduleEnabled("inspiration")) return;
      await showCapture(capture.dataUrl, library);
    } catch (error) {
      toast(error.message || "截图失败", true);
    }
  }

  function closePreview() {
    document.getElementById("mpg-inspiration-preview")?.remove();
    UI.preview = null;
  }

  function closeInventory() {
    closePreview();
    closeItemStylePicker();
    UI.inventoryRenderToken += 1;
    document.getElementById("mpg-inspiration-root")?.remove();
    UI.drag = null;
  }

  function closeItemEditor() {
    UI.editor?.remove?.();
    document.getElementById("mpg-inspiration-editor")?.remove();
    UI.editor = null;
  }

  function openItemEditor(item, onSaved) {
    if (!item?.id) return;
    closePreview();
    closeItemStylePicker();
    closeItemEditor();
    const root = document.createElement("div");
    root.id = "mpg-inspiration-editor";
    root.innerHTML = `
      <div class="mpg-inspiration-editor-backdrop"></div>
      <div class="mpg-inspiration-editor-card" role="dialog" aria-modal="true" aria-label="修改灵感">
        <header><div><strong>修改灵感</strong><small>同一张图在灵感箱和画风象限中会同步更新</small></div><button type="button" data-editor-action="close">×</button></header>
        <div class="mpg-inspiration-editor-body">
          <div class="mpg-inspiration-editor-image">
            <img src="${item.thumbDataUrl}" alt="当前灵感图">
            <button type="button" data-editor-action="upload">上传新图片</button>
          </div>
          <div class="mpg-inspiration-editor-copy">
            <div class="mpg-inspiration-editor-paste">可直接在此窗口按 <kbd>Ctrl + V</kbd> 黏贴剪贴板图片，或自己上传图片。</div>
            <div class="mpg-inspiration-editor-style" data-editor-style-row>
              <span>点击图标修改风格分类</span>
              <button type="button" data-editor-style-hold title="按住并划向象限">${stylePieMarkup(item.styleQuadrants || [])}</button>
              <small>${normalizeStyleQuadrants(item.styleQuadrants).length ? safeText(normalizeStyleQuadrants(item.styleQuadrants).map((quadrant) => STYLE_QUADRANT_LABELS[quadrant]).join("、")) : "尚未加入风格"}</small>
            </div>
            <textarea maxlength="500" placeholder="修改灵感文字或画风说明">${safeText(item.note || "")}</textarea>
            <div class="mpg-inspiration-editor-status">当前仅修改文字；换图后原图与缩略图都会同步替换。</div>
          </div>
        </div>
        <footer><button type="button" data-editor-action="close">取消</button><button type="button" class="primary" data-editor-action="save">保存修改</button></footer>
      </div>
    `;
    document.documentElement.appendChild(root);
    UI.editor = root;
    let replacement = null;

    const updateStyleRow = (quadrants) => {
      item.styleQuadrants = normalizeStyleQuadrants(quadrants);
      const row = root.querySelector("[data-editor-style-row]");
      if (!row) return;
      row.querySelector("[data-editor-style-hold]").innerHTML = stylePieMarkup(item.styleQuadrants);
      row.querySelector("small").textContent = item.styleQuadrants.length
        ? item.styleQuadrants.map((quadrant) => STYLE_QUADRANT_LABELS[quadrant]).join("、")
        : "尚未加入风格";
    };

    const useFile = async (file) => {
      if (!file || !String(file.type || "").startsWith("image/")) throw new Error("请选择图片文件");
      replacement = await prepareItemImage(await fileToDataUrl(file));
      root.querySelector(".mpg-inspiration-editor-image img").src = replacement.thumbDataUrl;
      root.querySelector(".mpg-inspiration-editor-status").textContent = `新图片：${replacement.width} × ${replacement.height}，保存后两边一起更新。`;
    };

    const chooseFile = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/png,image/jpeg,image/webp,image/gif";
      input.hidden = true;
      document.body.appendChild(input);
      input.addEventListener("change", async () => {
        try {
          if (input.files?.[0]) await useFile(input.files[0]);
        } catch (error) {
          toast(error.message || "图片读取失败", true);
        } finally {
          input.remove();
        }
      }, { once: true });
      input.click();
    };

    root.addEventListener("paste", async (event) => {
      const file = imageFileFromClipboard(event);
      if (!file) return;
      event.preventDefault();
      try {
        await useFile(file);
        toast("剪贴板图片已经放进修改框");
      } catch (error) {
        toast(error.message || "剪贴板图片读取失败", true);
      }
    }, true);

    root.querySelector("[data-editor-style-hold]")?.addEventListener("pointerdown", (event) => {
      openItemStylePicker(event, item, updateStyleRow);
    }, true);

    root.addEventListener("click", async (event) => {
      const action = event.target.closest?.("[data-editor-action]")?.getAttribute("data-editor-action");
      if (!action) return;
      if (action === "close") return closeItemEditor();
      if (action === "upload") return chooseFile();
      if (action !== "save") return;
      const button = event.target.closest("button");
      button.disabled = true;
      button.textContent = "保存中…";
      try {
        const response = await send({
          type: "mpg-inspiration:update-item",
          id: item.id,
          item: {
            note: root.querySelector("textarea").value,
            ...(replacement || {})
          }
        });
        const updated = response.item || {};
        closeItemEditor();
        toast("灵感图和画风参考已经同步修改");
        await onSaved?.(updated);
      } catch (error) {
        toast(error.message || "修改失败", true);
        button.disabled = false;
        button.textContent = "保存修改";
      }
    });
  }

  function categoryMarkup(category, active) {
    const cover = category.coverDataUrl
      ? `<img src="${category.coverDataUrl}" alt="" draggable="false">`
      : `<span class="mpg-inspiration-cover-empty">${safeText(String(category.name || "?").slice(0, 1))}</span>`;
    return `
      <div class="mpg-inspiration-category ${active ? "active" : ""}" data-inspiration-category="${safeText(category.id)}" data-inspiration-category-name="${safeText(category.name)}" role="button" tabindex="0" aria-selected="${active ? "true" : "false"}">
        <div class="mpg-inspiration-category-cover">
          ${cover}
        </div>
        <div class="mpg-inspiration-category-copy">
          <strong>${safeText(category.name)}</strong><span>${Number(category.count || 0)}</span>
        </div>
      </div>
    `;
  }

  function itemMarkup(item, inTrash) {
    const ratio = Math.max(0.4, Math.min(3.5, Number(item.width || 1) / Number(item.height || 1)));
    const styleQuadrants = normalizeStyleQuadrants(item.styleQuadrants);
    return `
      <div class="mpg-inspiration-item" draggable="true" data-inspiration-item="${safeText(item.id)}" style="--idea-ratio:${ratio}">
        <img src="${item.thumbDataUrl}" alt="" draggable="false">
        ${item.note ? `<span class="mpg-inspiration-note-dot" title="有备注">•</span>` : ""}
        ${styleQuadrants.length ? `<span class="mpg-inspiration-style-badge" title="已加入：${safeText(styleQuadrants.map((quadrant) => STYLE_QUADRANT_LABELS[quadrant]).join("、"))}">${stylePieMarkup(styleQuadrants)}</span>` : ""}
        ${inTrash ? "" : `<button type="button" draggable="false" class="mpg-inspiration-edit" data-edit-item="${safeText(item.id)}" title="修改图片或文字">改</button>`}
        ${inTrash ? "" : `<button type="button" draggable="false" class="mpg-inspiration-style-add" data-style-item="${safeText(item.id)}">${styleQuadrants.length ? "管理风格" : "加入风格"}</button>`}
        ${inTrash ? `<button type="button" class="mpg-inspiration-restore" data-restore-item="${safeText(item.id)}">还原</button>` : ""}
      </div>
    `;
  }

  function showItemPreview(card, item) {
    closePreview();
    const node = document.createElement("div");
    node.id = "mpg-inspiration-preview";
    node.innerHTML = `
      <img src="${item.thumbDataUrl}" alt="">
      <div class="mpg-inspiration-preview-note">${item.note ? safeText(item.note) : "没有备注。看来当时的你很相信现在的你。"}</div>
    `;
    document.documentElement.appendChild(node);
    const rect = card.getBoundingClientRect();
    const width = Math.min(390, window.innerWidth - 24);
    node.style.width = `${width}px`;
    const measuredHeight = node.getBoundingClientRect().height;
    const left = Math.max(12, Math.min(window.innerWidth - width - 12, rect.left + rect.width / 2 - width / 2));
    const top = rect.top - measuredHeight - 12 >= 12
      ? rect.top - measuredHeight - 12
      : Math.min(window.innerHeight - measuredHeight - 12, rect.bottom + 12);
    node.style.left = `${left}px`;
    node.style.top = `${top}px`;
    UI.preview = node;
  }

  async function dataUrlToPngBlob(dataUrl) {
    const source = await (await fetch(dataUrl)).blob();
    if (source.type === "image/png") return source;
    const bitmap = await createImageBitmap(source);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d", { alpha: true }).drawImage(bitmap, 0, 0);
    bitmap.close?.();
    return await new Promise((resolve, reject) => canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("图片转换失败")),
      "image/png"
    ));
  }

  async function fallbackCopySelectedImage(dataUrl) {
    const holder = document.createElement("div");
    holder.contentEditable = "true";
    holder.style.cssText = "position:fixed;left:-10000px;top:0;width:1px;height:1px;overflow:hidden;";
    const image = document.createElement("img");
    image.src = dataUrl;
    holder.appendChild(image);
    document.body.appendChild(holder);
    await loadImage(dataUrl);
    const selection = window.getSelection();
    const previous = selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
    const range = document.createRange();
    range.selectNode(image);
    selection?.removeAllRanges();
    selection?.addRange(range);
    let copied = false;
    try { copied = document.execCommand("copy"); } catch (_) {}
    selection?.removeAllRanges();
    if (previous) selection?.addRange(previous);
    holder.remove();
    return copied;
  }

  async function copyItem(id) {
    try {
      const response = await send({ type: "mpg-inspiration:get-item", id });
      const blob = await dataUrlToPngBlob(response.item.dataUrl);
      let copied = false;
      if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          copied = true;
        } catch (_) {}
      }
      if (!copied) copied = await fallbackCopySelectedImage(response.item.dataUrl);
      if (!copied) throw new Error("当前页面不支持图片剪贴板");
      toast("图片已复制。去画布里 Ctrl+V 吧。 ");
    } catch (error) {
      toast(`${error.message || "复制失败"}，请确认浏览器已允许剪贴板权限`, true);
      if (/原图文件夹|重新选择原图|重新授权/.test(String(error.message || ""))) {
        openStoragePicker();
      }
    }
  }

  function closeItemStylePicker() {
    const current = UI.itemStylePicker;
    if (current?.moveHandler) window.removeEventListener("pointermove", current.moveHandler, true);
    if (current?.upHandler) {
      window.removeEventListener("pointerup", current.upHandler, true);
      window.removeEventListener("pointercancel", current.upHandler, true);
    }
    current?.node?.remove?.();
    document.getElementById("mpg-item-style-picker")?.remove();
    UI.itemStylePicker = null;
  }

  async function askStyleMembershipChange(item, quadrant, removing) {
    if (!removing && await readLocalSetting(STYLE_JOIN_CONFIRM_KEY) === true) return true;
    if (!moduleEnabled("style")) return false;
    return new Promise((resolve) => {
      document.getElementById("mpg-style-membership-confirm")?.remove();
      const node = document.createElement("div");
      node.id = "mpg-style-membership-confirm";
      node.className = "mpg-inspiration-confirm";
      node.innerHTML = `
        <div class="mpg-inspiration-confirm-card">
          <strong>${removing ? "移出" : "加入"}${safeText(STYLE_QUADRANT_LABELS[quadrant])}？</strong>
          <p>${removing ? "这张图仍会留在灵感箱和其他已加入的象限中。" : "只记录象限编号，原图和缩略图不会重复保存。一张图可以加入多个象限。"}</p>
          ${removing ? "" : `<label class="mpg-style-confirm-skip"><input type="checkbox"> <span>勾选后，以后加入风格不再提醒；若需恢复提醒，请重装插件。</span></label>`}
          <div><button type="button" data-confirm="no">再想想</button><button type="button" class="${removing ? "danger" : "primary"}" data-confirm="yes">${removing ? "移出象限" : "确认加入"}</button></div>
        </div>
      `;
      document.documentElement.appendChild(node);
      node.addEventListener("click", async (event) => {
        const value = event.target.closest?.("[data-confirm]")?.getAttribute("data-confirm");
        if (!value) return;
        const skip = !removing && value === "yes" && Boolean(node.querySelector("input")?.checked);
        node.remove();
        if (skip) await writeLocalSetting(STYLE_JOIN_CONFIRM_KEY, true);
        resolve(value === "yes");
      });
    });
  }

  async function changeItemStyleMembership(item, quadrant, onUpdated) {
    if (!moduleEnabled("style")) return false;
    const current = new Set(normalizeStyleQuadrants(item.styleQuadrants));
    const removing = current.has(quadrant);
    if (!await askStyleMembershipChange(item, quadrant, removing) || !moduleEnabled("style")) return false;
    const next = new Set(current);
    if (removing) next.delete(quadrant);
    else next.add(quadrant);
    try {
      const quadrants = Array.from(next).sort((a, b) => a - b);
      await send({ type: "mpg-inspiration:set-item-styles", id: item.id, quadrants });
      item.styleQuadrants = quadrants;
      toast(removing ? `已移出${STYLE_QUADRANT_LABELS[quadrant]}` : `已加入${STYLE_QUADRANT_LABELS[quadrant]}`);
      const inventory = document.getElementById("mpg-inspiration-root");
      if (inventory) await renderItems(inventory, UI.activeCategoryId, { preserve: true });
      await onUpdated?.(quadrants);
      return true;
    } catch (error) {
      toast(error.message || "风格象限更新失败", true);
      return false;
    }
  }

  function activateItemStyleQuadrant(quadrant) {
    const picker = UI.itemStylePicker;
    if (!picker || !quadrant) return;
    picker.quadrant = quadrant;
    picker.node.querySelectorAll("[data-style-quadrant]").forEach((button) => {
      button.classList.toggle("active", Number(button.getAttribute("data-style-quadrant")) === quadrant);
    });
    const center = picker.node.querySelector(".mpg-style-radial-center");
    if (center) center.textContent = STYLE_QUADRANT_LABELS[quadrant];
  }

  function openItemStylePicker(event, item, onUpdated) {
    if (!moduleEnabled("style")) return;
    if (event.button !== 0 || !item?.id) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    closePreview();
    closeItemStylePicker();
    const current = new Set(normalizeStyleQuadrants(item.styleQuadrants));
    const node = document.createElement("div");
    node.id = "mpg-item-style-picker";
    node.className = "marking";
    node.innerHTML = `
      <div class="mpg-style-radial compact" role="menu" aria-label="选择画风象限">
        ${STYLE_QUADRANTS.map((quadrant) => `<button type="button" class="q${quadrant} ${current.has(quadrant) ? "selected" : ""}" data-style-quadrant="${quadrant}" aria-label="${safeText(STYLE_QUADRANT_LABELS[quadrant])}"><span><b>${safeText(STYLE_QUADRANT_LABELS[quadrant])}</b><small>${safeText(STYLE_QUADRANT_META[quadrant])}</small></span></button>`).join("")}
        <span class="mpg-style-radial-center">风格</span>
      </div>
    `;
    document.documentElement.appendChild(node);
    const width = 190;
    const height = 190;
    const centerX = Math.max(width / 2 + 10, Math.min(window.innerWidth - width / 2 - 10, event.clientX));
    const centerY = Math.max(height / 2 + 10, Math.min(window.innerHeight - height / 2 - 10, event.clientY));
    const left = centerX - width / 2;
    const top = centerY - height / 2;
    node.style.left = `${left}px`;
    node.style.top = `${top}px`;

    const moveHandler = (moveEvent) => {
      const picker = UI.itemStylePicker;
      if (!picker || (picker.pointerId != null && moveEvent.pointerId !== picker.pointerId)) return;
      const quadrant = quadrantFromPointer(picker.centerX, picker.centerY, moveEvent.clientX, moveEvent.clientY);
      if (quadrant) activateItemStyleQuadrant(quadrant);
    };
    const upHandler = (upEvent) => {
      const picker = UI.itemStylePicker;
      if (!picker || (picker.pointerId != null && upEvent.pointerId !== picker.pointerId)) return;
      upEvent.preventDefault();
      upEvent.stopPropagation();
      upEvent.stopImmediatePropagation?.();
      const quadrant = picker.quadrant;
      closeItemStylePicker();
      if (quadrant) changeItemStyleMembership(item, quadrant, onUpdated);
    };
    UI.itemStylePicker = {
      node,
      centerX,
      centerY,
      quadrant: 0,
      pointerId: event.pointerId,
      moveHandler,
      upHandler
    };
    window.addEventListener("pointermove", moveHandler, true);
    window.addEventListener("pointerup", upHandler, true);
    window.addEventListener("pointercancel", upHandler, true);
    node.querySelectorAll("[data-style-quadrant]").forEach((button) => {
      button.addEventListener("pointerenter", () => activateItemStyleQuadrant(Number(button.getAttribute("data-style-quadrant"))));
    });
  }

  function askPermanentDelete() {
    return new Promise((resolve) => {
      const root = document.getElementById("mpg-inspiration-root");
      if (!root) return resolve(false);
      const node = document.createElement("div");
      node.className = "mpg-inspiration-confirm";
      node.innerHTML = `
        <div class="mpg-inspiration-confirm-card">
          <strong>这次真删，回收站也救不回来。</strong>
          <p>确定把这份灵感彻底扬了吗？</p>
          <div><button type="button" data-confirm="no">再想想</button><button type="button" class="danger" data-confirm="yes">彻底删除</button></div>
        </div>
      `;
      root.appendChild(node);
      node.addEventListener("click", (event) => {
        const value = event.target.closest?.("[data-confirm]")?.getAttribute("data-confirm");
        if (!value) return;
        node.remove();
        resolve(value === "yes");
      });
    });
  }

  async function askMoveToTrash() {
    const quietUntil = Number(await readLocalSetting(TRASH_DRAG_QUIET_UNTIL_KEY) || 0);
    if (quietUntil > Date.now()) return true;
    return new Promise((resolve) => {
      const root = document.getElementById("mpg-inspiration-root");
      if (!root) return resolve(false);
      const node = document.createElement("div");
      node.className = "mpg-inspiration-confirm mpg-trash-drag-confirm";
      node.innerHTML = `
        <div class="mpg-inspiration-confirm-card">
          <strong>把这份灵感扔进回收站？</strong>
          <p>它不会被彻底删除，随时可以去回收站捞回来。</p>
          <label class="mpg-trash-drag-skip"><input type="checkbox"> <span>10 分钟内不再提醒，拖出灵感箱就直接扔进回收站。</span></label>
          <div><button type="button" data-confirm="no">手滑了</button><button type="button" class="danger" data-confirm="yes">扔进去</button></div>
        </div>
      `;
      root.appendChild(node);
      node.addEventListener("click", async (event) => {
        const value = event.target.closest?.("[data-confirm]")?.getAttribute("data-confirm");
        if (!value) return;
        const skip = value === "yes" && Boolean(node.querySelector("input")?.checked);
        node.remove();
        if (skip) await writeLocalSetting(TRASH_DRAG_QUIET_UNTIL_KEY, Date.now() + 10 * 60 * 1000);
        resolve(value === "yes");
      });
    });
  }

  function askClearTrash() {
    return new Promise((resolve) => {
      const root = document.getElementById("mpg-inspiration-root");
      if (!root) return resolve(false);
      const node = document.createElement("div");
      node.className = "mpg-inspiration-confirm";
      node.innerHTML = `
        <div class="mpg-inspiration-confirm-card">
          <strong>确定清空灵感箱回收站？</strong>
          <p>只会移除灵感箱里的回收站记录，不会删除原图文件夹里的任何图片。</p>
          <div><button type="button" data-confirm="no">再想想</button><button type="button" class="danger" data-confirm="yes">清空回收站</button></div>
        </div>
      `;
      root.appendChild(node);
      node.addEventListener("click", (event) => {
        const value = event.target.closest?.("[data-confirm]")?.getAttribute("data-confirm");
        if (!value) return;
        node.remove();
        resolve(value === "yes");
      });
    });
  }

  function askRenameInspirationCategory(currentName) {
    return new Promise((resolve) => {
      const root = document.getElementById("mpg-inspiration-root");
      if (!root) return resolve("");
      const node = document.createElement("div");
      node.className = "mpg-inspiration-confirm";
      node.innerHTML = `
        <div class="mpg-inspiration-confirm-card mpg-inspiration-category-dialog">
          <strong>修改灵感分类名称</strong>
          <p>只改分类名，里面的图片、画风归属和原图文件都不会动。</p>
          <input type="text" maxlength="30" value="${safeText(currentName || "")}" aria-label="新分类名称">
          <div><button type="button" data-confirm="no">取消</button><button type="button" class="primary" data-confirm="yes">保存名称</button></div>
        </div>
      `;
      root.appendChild(node);
      const input = node.querySelector("input");
      input.focus();
      input.select();
      const finish = (save) => {
        const value = save ? input.value.trim() : "";
        node.remove();
        resolve(value);
      };
      node.addEventListener("click", (event) => {
        const value = event.target.closest?.("[data-confirm]")?.getAttribute("data-confirm");
        if (value) finish(value === "yes");
      });
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          finish(true);
        }
      });
    });
  }

  function askDeleteInspirationCategory(name) {
    return new Promise((resolve) => {
      const root = document.getElementById("mpg-inspiration-root");
      if (!root) return resolve(false);
      const node = document.createElement("div");
      node.className = "mpg-inspiration-confirm";
      node.innerHTML = `
        <div class="mpg-inspiration-confirm-card">
          <strong>删除分类「${safeText(name)}」？</strong>
          <p>该分类下的所有灵感都会自动移入回收站，原图文件不会被删除。</p>
          <div><button type="button" data-confirm="no">再想想</button><button type="button" class="danger" data-confirm="yes">删除并移入回收站</button></div>
        </div>
      `;
      root.appendChild(node);
      node.addEventListener("click", (event) => {
        const value = event.target.closest?.("[data-confirm]")?.getAttribute("data-confirm");
        if (!value) return;
        node.remove();
        resolve(value === "yes");
      });
    });
  }

  function isOutsideInventoryPanel(root, event) {
    const panel = root?.querySelector(".mpg-inspiration-panel");
    if (!panel || !event) return false;
    const rect = panel.getBoundingClientRect();
    return event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
  }

  async function handlePermanentDelete(itemId) {
    try {
      if (!await askPermanentDelete()) return;
      await send({ type: "mpg-inspiration:delete-item", id: itemId });
      toast("彻底删除了。它现在只活在你的记忆里。 ");
      await openInventory(UI.activeCategoryId);
    } catch (error) {
      toast(error.message || "移除失败", true);
    }
  }

  async function handleMoveToTrash(itemId, categoryId) {
    try {
      if (!await askMoveToTrash()) return;
      await send({ type: "mpg-inspiration:trash-item", id: itemId });
      toast("已扔进回收站。后悔药还在。");
      await openInventory(categoryId);
    } catch (error) {
      toast(error.message || "移入回收站失败", true);
    }
  }

  async function renderItems(root, categoryId, options = {}) {
    const previousGrid = root.querySelector(".mpg-inspiration-grid");
    if (!previousGrid) return;
    const renderToken = ++UI.inventoryRenderToken;
    if (!options.preserve) previousGrid.innerHTML = `<div class="mpg-inspiration-loading">正在翻箱倒柜…</div>`;
    previousGrid.setAttribute("aria-busy", "true");
    try {
      const response = await send({ type: "mpg-inspiration:list-items", categoryId });
      if (!document.contains(root) || renderToken !== UI.inventoryRenderToken) return;
      const items = response.items || [];
      const grid = document.createElement("div");
      grid.className = "mpg-inspiration-grid";
      grid.innerHTML = items.length
        ? items.map((item) => itemMarkup(item, categoryId === TRASH_ID)).join("")
        : `<div class="mpg-inspiration-empty">${categoryId === TRASH_ID ? "回收站空空如也。难得。" : `这里还没有灵感，按 ${safeText(window.MiorningShortcutApi?.getLabel?.("inspirationCapture") || "Alt + F1")} 去捡一点。`}</div>`;
      previousGrid.replaceWith(grid);

      const itemById = new Map(items.map((item) => [item.id, item]));
      grid.querySelectorAll("[data-inspiration-item]").forEach((card) => {
        const id = card.getAttribute("data-inspiration-item");
        const item = itemById.get(id);
        card.addEventListener("mouseenter", () => showItemPreview(card, item));
        card.addEventListener("mouseleave", closePreview);
        card.addEventListener("click", (event) => {
          if (event.target.closest?.("[data-restore-item]")) return;
          const editButton = event.target.closest?.("[data-edit-item]");
          if (editButton) {
            event.preventDefault();
            event.stopPropagation();
            openItemEditor(item, async () => {
              const activeRoot = document.getElementById("mpg-inspiration-root");
              if (activeRoot) await renderItems(activeRoot, UI.activeCategoryId, { preserve: true });
            });
            return;
          }
          const styleButton = event.target.closest?.("[data-style-item]");
          if (styleButton) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          if (card.dataset.dragged === "1") {
            card.dataset.dragged = "0";
            return;
          }
          copyItem(id);
        });
        card.querySelector("[data-style-item]")?.addEventListener("pointerdown", (event) => {
          openItemStylePicker(event, item);
        });
        card.querySelector("[data-edit-item]")?.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          event.stopPropagation();
        });
        card.addEventListener("contextmenu", async (event) => {
          if (categoryId !== TRASH_ID) return;
          event.preventDefault();
          closePreview();
          try {
            await send({ type: "mpg-inspiration:restore-item", id });
            toast("已从回收站捞回来");
            await openInventory(TRASH_ID);
          } catch (error) {
            toast(error.message || "还原失败", true);
          }
        });
        card.addEventListener("dragstart", (event) => {
          closePreview();
          card.dataset.dragged = "1";
          UI.drag = {
            id,
            categoryId,
            fromTrash: categoryId === TRASH_ID,
            outsidePanel: false,
            releasedOutsidePanel: false,
            completed: false
          };
          root.classList.add("is-dragging-item");
          root.querySelector(".mpg-inspiration-drag-tip").textContent = categoryId === TRASH_ID
            ? "拖出灵感箱弹窗并放开：彻底删除"
            : "拖到左侧分类，或拖出灵感箱弹窗扔进回收站";
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", "MIORNING inspiration item");
        });
        card.addEventListener("dragend", async () => {
          root.classList.remove("is-dragging-item", "is-dragging-outside-panel");
          root.querySelectorAll(".drag-over, .drop-before, .drop-after").forEach((node) => {
            node.classList.remove("drag-over", "drop-before", "drop-after");
          });
          const drag = UI.drag;
          UI.drag = null;
          if (drag && !drag.completed && drag.releasedOutsidePanel) {
            if (drag.fromTrash) await handlePermanentDelete(drag.id);
            else await handleMoveToTrash(drag.id, drag.categoryId);
          }
        });

        card.addEventListener("dragover", (event) => {
          const drag = UI.drag;
          if (!drag || drag.id === id || drag.categoryId !== categoryId) return;
          event.preventDefault();
          event.stopPropagation();
          const rect = card.getBoundingClientRect();
          const sameRow = Math.abs(event.clientY - (rect.top + rect.height / 2)) < rect.height / 2;
          const after = sameRow
            ? event.clientX >= rect.left + rect.width / 2
            : event.clientY >= rect.top + rect.height / 2;
          card.classList.toggle("drop-before", !after);
          card.classList.toggle("drop-after", after);
          event.dataTransfer.dropEffect = "move";
        });
        card.addEventListener("dragleave", () => card.classList.remove("drop-before", "drop-after"));
        card.addEventListener("drop", async (event) => {
          const drag = UI.drag;
          if (!drag || drag.id === id || drag.categoryId !== categoryId) return;
          event.preventDefault();
          event.stopPropagation();
          const after = card.classList.contains("drop-after");
          const orderedIds = Array.from(grid.querySelectorAll("[data-inspiration-item]"))
            .map((node) => node.getAttribute("data-inspiration-item"))
            .filter((itemId) => itemId && itemId !== drag.id);
          const targetIndex = orderedIds.indexOf(id);
          orderedIds.splice(Math.max(0, targetIndex + (after ? 1 : 0)), 0, drag.id);
          drag.completed = true;
          card.classList.remove("drop-before", "drop-after");
          try {
            await send({ type: "mpg-inspiration:reorder-items", categoryId, ids: orderedIds });
            toast("顺序调好了");
            await openInventory(categoryId);
          } catch (error) {
            drag.completed = false;
            toast(error.message || "调整顺序失败", true);
          }
        });
      });

      grid.addEventListener("dragover", (event) => {
        if (!UI.drag || event.target.closest?.("[data-inspiration-item]")) return;
        if (UI.drag.categoryId !== categoryId) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      });
      grid.addEventListener("drop", async (event) => {
        const drag = UI.drag;
        if (!drag || event.target.closest?.("[data-inspiration-item]") || drag.categoryId !== categoryId) return;
        event.preventDefault();
        event.stopPropagation();
        const orderedIds = Array.from(grid.querySelectorAll("[data-inspiration-item]"))
          .map((node) => node.getAttribute("data-inspiration-item"))
          .filter((itemId) => itemId && itemId !== drag.id);
        orderedIds.push(drag.id);
        drag.completed = true;
        try {
          await send({ type: "mpg-inspiration:reorder-items", categoryId, ids: orderedIds });
          toast("已经挪到最后面");
          await openInventory(categoryId);
        } catch (error) {
          drag.completed = false;
          toast(error.message || "调整顺序失败", true);
        }
      });
    } catch (error) {
      if (!document.contains(root) || renderToken !== UI.inventoryRenderToken) return;
      const grid = root.querySelector(".mpg-inspiration-grid");
      if (grid) {
        grid.removeAttribute("aria-busy");
        grid.innerHTML = `<div class="mpg-inspiration-empty">${safeText(error.message || "读取失败")}</div>`;
      }
    }
  }

  function closeStylePickerRadial() {
    const picker = UI.stylePicker;
    if (picker?.moveHandler) window.removeEventListener("pointermove", picker.moveHandler, true);
    picker?.root?.remove?.();
    document.getElementById("mpg-style-picker-root")?.remove();
    UI.stylePicker = null;
  }

  function closeStyleCloud() {
    UI.styleCloudToken += 1;
    UI.styleCloud?.remove?.();
    document.getElementById("mpg-style-cloud")?.remove();
    UI.styleCloud = null;
  }

  function closePinnedStyle() {
    UI.pinnedStyle?.remove?.();
    document.getElementById("mpg-style-pinned")?.remove();
    UI.pinnedStyle = null;
  }

  function closeStyleSelection() {
    closeStylePickerRadial();
    closeStyleCloud();
  }

  async function copyStyleNote(note) {
    const text = String(note || "").trim();
    if (!text) {
      toast("这张参考图没有备注文字", true);
      return;
    }
    let copied = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch (_) {}
    if (!copied) {
      const input = document.createElement("textarea");
      input.value = text;
      input.style.cssText = "position:fixed;left:-10000px;top:0;";
      document.body.appendChild(input);
      input.select();
      try { copied = document.execCommand("copy"); } catch (_) {}
      input.remove();
    }
    if (!copied) return toast("文字复制失败，请确认剪贴板权限", true);
    toast("备注文字已复制");
  }

  function pinStyleItem(item, quadrant) {
    if (!moduleEnabled("style")) return;
    closeStyleSelection();
    closePinnedStyle();
    const node = document.createElement("aside");
    node.id = "mpg-style-pinned";
    node.innerHTML = `
      <div class="mpg-style-pinned-head">
        <span>${stylePieMarkup([quadrant], "mini")}<b>${safeText(STYLE_QUADRANT_LABELS[quadrant])}参考</b></span>
        <div><button type="button" data-style-pin-action="edit" aria-label="修改参考图">改</button><button type="button" data-style-pin-action="close" aria-label="关闭">×</button></div>
      </div>
      <button type="button" class="mpg-style-pinned-image" data-style-pin-action="copy-image" title="左键复制原图">
        <img src="${item.thumbDataUrl}" alt="画风参考图" draggable="false">
        <span>点击图片复制原图</span>
      </button>
      <button type="button" class="mpg-style-pinned-note ${item.note ? "" : "empty"}" data-style-pin-action="copy-note" title="左键复制备注文字">${item.note ? safeText(item.note) : "这张图没有文字备注"}<small>${item.note ? "点击文字复制" : "可在灵感箱补充备注"}</small></button>
    `;
    document.documentElement.appendChild(node);
    UI.pinnedStyle = node;
    node.addEventListener("click", (event) => {
      const action = event.target.closest?.("[data-style-pin-action]")?.getAttribute("data-style-pin-action");
      if (action === "close") return closePinnedStyle();
      if (action === "edit") return openItemEditor(item, async (updated) => pinStyleItem({ ...item, ...updated }, quadrant));
      if (action === "copy-image") return copyItem(item.id);
      if (action === "copy-note") return copyStyleNote(item.note);
    });
  }

  function bindStyleCloudCards(root, items, quadrant) {
    const cards = Array.from(root.querySelectorAll("[data-style-cloud-item]"));
    cards.forEach((card) => {
      const item = items.find((entry) => entry.id === card.getAttribute("data-style-cloud-item"));
      if (!item) return;
      card.addEventListener("mouseenter", () => {
        root.classList.add("has-hover");
        card.classList.add("active");
      });
      card.addEventListener("mouseleave", () => {
        card.classList.remove("active");
        if (!root.querySelector(".mpg-style-cloud-card.active")) root.classList.remove("has-hover");
      });
      card.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        pinStyleItem(item, quadrant);
      });
    });
  }

  async function loadStyleQuadrant(quadrant) {
    closeStyleCloud();
    const token = ++UI.styleCloudToken;
    const root = document.createElement("div");
    root.id = "mpg-style-cloud";
    root.innerHTML = `
      <div class="mpg-style-cloud-label">${stylePieMarkup([quadrant], "mini")}<strong>${safeText(STYLE_QUADRANT_LABELS[quadrant])}</strong><span>移动到图片上预览，单击固定</span></div>
      <div class="mpg-style-cloud-items"><div class="mpg-style-cloud-empty">正在翻画风牌组…</div></div>
    `;
    document.documentElement.appendChild(root);
    UI.styleCloud = root;
    try {
      const response = await send({ type: "mpg-inspiration:list-style-items", quadrant });
      if (token !== UI.styleCloudToken || !root.isConnected) return;
      const items = Array.isArray(response.items) ? response.items : [];
      const holder = root.querySelector(".mpg-style-cloud-items");
      holder.innerHTML = items.length
        ? items.map((item, index) => `<button type="button" class="mpg-style-cloud-card" data-style-cloud-item="${safeText(item.id)}" style="--float-delay:${(index % 7) * 0.025}s;--float-tilt:${((index % 5) - 2) * 1.2}deg"><img src="${item.thumbDataUrl}" alt="" draggable="false">${item.note ? `<span class="mpg-style-cloud-note-dot">•</span>` : ""}<span class="mpg-style-cloud-note">${safeText(item.note || "没有文字备注")}</span></button>`).join("")
        : `<div class="mpg-style-cloud-empty">${safeText(STYLE_QUADRANT_LABELS[quadrant])}还没有画风。去灵感箱给图片点“加入风格”。</div>`;
      bindStyleCloudCards(root, items, quadrant);
    } catch (error) {
      if (token !== UI.styleCloudToken || !root.isConnected) return;
      root.querySelector(".mpg-style-cloud-items").innerHTML = `<div class="mpg-style-cloud-empty">${safeText(error.message || "画风读取失败")}</div>`;
    }
  }

  function quadrantFromPointer(centerX, centerY, clientX, clientY) {
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    if (Math.hypot(dx, dy) < 24) return 0;
    if (dx >= 0 && dy < 0) return 1;
    if (dx < 0 && dy < 0) return 2;
    if (dx < 0 && dy >= 0) return 3;
    return 4;
  }

  function activateStyleQuadrant(quadrant) {
    const picker = UI.stylePicker;
    if (!picker || !quadrant || picker.quadrant === quadrant) return;
    picker.quadrant = quadrant;
    picker.root.querySelectorAll("[data-style-quadrant]").forEach((button) => {
      button.classList.toggle("active", Number(button.getAttribute("data-style-quadrant")) === quadrant);
    });
    const center = picker.root.querySelector(".mpg-style-radial-center");
    if (center) center.textContent = STYLE_QUADRANT_LABELS[quadrant];
    loadStyleQuadrant(quadrant);
  }

  function openStylePicker(position = {}) {
    if (!moduleEnabled("style")) return;
    closeItemStylePicker();
    closeStyleSelection();
    closeInventory();
    const radius = 94;
    const centerX = Math.max(radius + 10, Math.min(window.innerWidth - radius - 10, Number(position.x) || window.innerWidth / 2));
    const centerY = Math.max(radius + 10, Math.min(window.innerHeight - radius - 10, Number(position.y) || window.innerHeight / 2));
    const root = document.createElement("div");
    root.id = "mpg-style-picker-root";
    root.style.left = `${centerX - radius}px`;
    root.style.top = `${centerY - radius}px`;
    root.innerHTML = `
      <div class="mpg-style-radial marking" role="menu" aria-label="四象限画风选择">
        ${STYLE_QUADRANTS.map((quadrant) => `<button type="button" class="q${quadrant}" data-style-quadrant="${quadrant}" aria-label="${safeText(STYLE_QUADRANT_LABELS[quadrant])}"><span><b>${safeText(STYLE_QUADRANT_LABELS[quadrant])}</b><small>${safeText(STYLE_QUADRANT_META[quadrant])}</small></span></button>`).join("")}
        <span class="mpg-style-radial-center">画风</span>
      </div>
      <div class="mpg-style-picker-help">按住快捷键 · 移入象限 · 松手挑图</div>
    `;
    document.documentElement.appendChild(root);
    const moveHandler = (event) => {
      const picker = UI.stylePicker;
      if (!picker) return;
      const quadrant = quadrantFromPointer(picker.centerX, picker.centerY, event.clientX, event.clientY);
      if (quadrant) activateStyleQuadrant(quadrant);
    };
    UI.stylePicker = { root, centerX, centerY, quadrant: 0, moveHandler };
    window.addEventListener("pointermove", moveHandler, true);
    root.querySelectorAll("[data-style-quadrant]").forEach((button) => {
      button.addEventListener("pointerenter", () => activateStyleQuadrant(Number(button.getAttribute("data-style-quadrant"))));
    });
  }

  function releaseStylePicker() {
    const picker = UI.stylePicker;
    if (!picker) return false;
    const selected = picker.quadrant;
    closeStylePickerRadial();
    if (!selected) closeStyleCloud();
    else document.getElementById("mpg-style-cloud")?.classList.add("released");
    return true;
  }

  async function switchInventoryCategory(root, categoryId) {
    if (!root?.isConnected || !categoryId || categoryId === UI.activeCategoryId) return;
    const categoryNode = Array.from(root.querySelectorAll("[data-inspiration-category]"))
      .find((node) => node.getAttribute("data-inspiration-category") === categoryId);
    if (!categoryNode) return;
    closePreview();
    UI.activeCategoryId = categoryId;
    root.querySelectorAll("[data-inspiration-category]").forEach((node) => {
      const active = node.getAttribute("data-inspiration-category") === categoryId;
      node.classList.toggle("active", active);
      node.setAttribute("aria-selected", active ? "true" : "false");
    });
    const clearTrashButton = root.querySelector('[data-inspiration-action="empty-trash"]');
    if (clearTrashButton) clearTrashButton.hidden = categoryId !== TRASH_ID;
    root.querySelectorAll("[data-category-manage]").forEach((button) => {
      button.hidden = categoryId === TRASH_ID;
      button.setAttribute("data-category-id", categoryId);
      button.setAttribute("data-category-name", categoryNode.getAttribute("data-inspiration-category-name") || "");
    });
    await renderItems(root, categoryId, { preserve: true });
  }

  async function openStoragePicker() {
    try {
      await send({ type: "mpg-inspiration:open-storage-popup" });
    } catch (error) {
      toast(error.message || "原图位置弹窗打不开", true);
    }
  }

  async function openInventory(preferredCategoryId = "") {
    if (!moduleEnabled("inspiration")) return;
    const request = ++UI.inventoryOpenRequest;
    closeCapture();
    closeInventory();
    try {
      const [library, storageResponse] = await Promise.all([
        send({ type: "mpg-inspiration:get-library" }),
        send({ type: "mpg-inspiration:get-storage-status" })
      ]);
      const storage = storageResponse.storage || {};
      if (!moduleEnabled("inspiration") || request !== UI.inventoryOpenRequest) return;
      const shortcutLabels = window.MiorningShortcutApi?.getLabels?.() || {
        inspirationCapture: "Alt + F1",
        inspirationBox: "Alt + F2"
      };
      const categories = library.categories || [];
      const validIds = new Set([...categories.map((category) => category.id), TRASH_ID]);
      const active = validIds.has(preferredCategoryId)
        ? preferredCategoryId
        : (validIds.has(UI.activeCategoryId) ? UI.activeCategoryId : categories[0]?.id || TRASH_ID);
      const activeCategory = categories.find((category) => category.id === active);
      UI.activeCategoryId = active;

      const root = document.createElement("div");
      root.id = "mpg-inspiration-root";
      root.innerHTML = `
        <div class="mpg-inspiration-backdrop" data-inspiration-action="close"></div>
        <div class="mpg-inspiration-panel" role="dialog" aria-modal="true" aria-label="灵感箱">
          <header class="mpg-inspiration-header">
            <div><strong>灵感箱</strong><p>看到就捡，左键复制。用不用以后再说。 · ${Number(library.totalCount || 0)} 件物品</p></div>
            <div class="mpg-inspiration-header-meta">
              <span class="mpg-inspiration-hotkey-hint"><kbd>${safeText(shortcutLabels.inspirationCapture)}</kbd> 截图保存灵感　<kbd>${safeText(shortcutLabels.inspirationBox)}</kbd> 打开灵感箱　<kbd>鼠标左键</kbd> 单击复制原图</span>
              <button type="button" class="mpg-inspiration-storage-button" data-inspiration-action="storage" data-tooltip="${safeText(storage.selected ? (storage.permission === "granted" ? `原图保存在「${storage.name}」。配置只导出缩略图；换电脑后复制原图文件夹并重新选择。` : `「${storage.name}」需要重新授权。点击后授权，浏览器内暂存的新原图会自动迁移。`) : (storage.pendingRebind ? `配置记录的文件夹是「${storage.name}」，请重新选择它以恢复原图访问。` : "选择一个文件夹保存截图原图；已有浏览器内原图会自动迁移。"))}">${safeText(storage.selected ? (storage.permission === "granted" ? `原图：${storage.name}` : "重新授权原图位置") : "选择原图保存位置")}</button>
              <button type="button" data-category-manage="rename" data-category-id="${safeText(active)}" data-category-name="${safeText(activeCategory?.name || "")}" data-inspiration-action="rename-category" ${active === TRASH_ID ? "hidden" : ""}>修改分类</button>
              <button type="button" class="danger" data-category-manage="delete" data-category-id="${safeText(active)}" data-category-name="${safeText(activeCategory?.name || "")}" data-inspiration-action="delete-category" ${active === TRASH_ID ? "hidden" : ""}>删除分类</button>
              <button type="button" class="mpg-inspiration-clear-trash" data-inspiration-action="empty-trash" ${active === TRASH_ID ? "" : "hidden"}>清空回收站</button>
              <button type="button" data-inspiration-action="close">×</button>
            </div>
          </header>
          <div class="mpg-inspiration-body">
            <aside class="mpg-inspiration-sidebar">
              <div class="mpg-inspiration-categories">
                ${categories.map((category) => categoryMarkup(category, category.id === active)).join("")}
              </div>
              <div class="mpg-inspiration-category trash ${active === TRASH_ID ? "active" : ""}" data-inspiration-category="${TRASH_ID}" role="button" tabindex="0" aria-selected="${active === TRASH_ID ? "true" : "false"}">
                <div class="mpg-inspiration-category-cover trash-icon">♻</div>
                <div class="mpg-inspiration-category-copy"><strong>回收站</strong><span>${Number(library.trashCount || 0)}</span></div>
              </div>
            </aside>
            <main class="mpg-inspiration-main">
              <div class="mpg-inspiration-grid"></div>
            </main>
          </div>
          <div class="mpg-inspiration-drag-tip">拖到左侧分类或回收站</div>
        </div>
      `;
      document.documentElement.appendChild(root);
      const needsStorageAuthorization = Boolean(storage.pendingRebind) ||
        (Boolean(storage.selected) && storage.permission !== "granted");
      if (needsStorageAuthorization && !UI.storageAuthorizationPrompted) {
        UI.storageAuthorizationPrompted = true;
        openStoragePicker();
      }

      root.querySelectorAll("[data-inspiration-category]").forEach((categoryNode) => {
        const targetCategoryId = categoryNode.getAttribute("data-inspiration-category");
        categoryNode.addEventListener("dragover", (event) => {
          if (!UI.drag) return;
          event.preventDefault();
          event.stopPropagation();
          categoryNode.classList.add("drag-over");
          event.dataTransfer.dropEffect = "move";
        });
        categoryNode.addEventListener("dragleave", (event) => {
          if (!categoryNode.contains(event.relatedTarget)) categoryNode.classList.remove("drag-over");
        });
        categoryNode.addEventListener("drop", async (event) => {
          const drag = UI.drag;
          if (!drag) return;
          event.preventDefault();
          event.stopPropagation();
          categoryNode.classList.remove("drag-over");
          drag.completed = true;
          if (drag.categoryId === targetCategoryId) return;
          try {
            await send({ type: "mpg-inspiration:move-item", id: drag.id, categoryId: targetCategoryId });
            toast(targetCategoryId === TRASH_ID ? "已扔进回收站" : "已经换到新分类");
            await openInventory(UI.activeCategoryId);
          } catch (error) {
            drag.completed = false;
            toast(error.message || "移动分类失败", true);
          }
        });
      });

      root.addEventListener("click", async (event) => {
        const action = event.target.closest?.("[data-inspiration-action]")?.getAttribute("data-inspiration-action");
        if (action === "close") return closeInventory();
        if (action === "storage") return openStoragePicker();
        if (action === "rename-category") {
          const button = event.target.closest("[data-category-manage]");
          const categoryId = button?.getAttribute("data-category-id") || UI.activeCategoryId;
          const currentName = button?.getAttribute("data-category-name") || "";
          const name = await askRenameInspirationCategory(currentName);
          if (!name || name === currentName) return;
          try {
            await send({ type: "mpg-inspiration:rename-category", categoryId, name });
            toast(`分类已经改名为「${name}」`);
            await openInventory(categoryId);
          } catch (error) {
            toast(error.message || "分类改名失败", true);
          }
          return;
        }
        if (action === "delete-category") {
          const button = event.target.closest("[data-category-manage]");
          const categoryId = button?.getAttribute("data-category-id") || UI.activeCategoryId;
          const categoryName = button?.getAttribute("data-category-name") || "这个分类";
          if (!await askDeleteInspirationCategory(categoryName)) return;
          try {
            const response = await send({ type: "mpg-inspiration:delete-category", categoryId });
            toast(`分类已删除，${Number(response.result?.moved || 0)} 张图移入回收站`);
            UI.activeCategoryId = "";
            await openInventory();
          } catch (error) {
            toast(error.message || "删除分类失败", true);
          }
          return;
        }
        if (action === "empty-trash") {
          if (!await askClearTrash()) return;
          try {
            const response = await send({ type: "mpg-inspiration:clear-trash" });
            toast(`回收站已清空，共移除 ${Number(response.cleared || 0)} 项；原图文件没有动。`);
            await openInventory(TRASH_ID);
          } catch (error) {
            toast(error.message || "清空回收站失败", true);
          }
          return;
        }

        const restoreButton = event.target.closest?.("[data-restore-item]");
        if (restoreButton) {
          try {
            await send({ type: "mpg-inspiration:restore-item", id: restoreButton.getAttribute("data-restore-item") });
            toast("已从回收站捞回来");
            await openInventory(TRASH_ID);
          } catch (error) {
            toast(error.message || "还原失败", true);
          }
          return;
        }

        const category = event.target.closest?.("[data-inspiration-category]");
        if (category) return switchInventoryCategory(root, category.getAttribute("data-inspiration-category"));
      });

      root.addEventListener("dragover", (event) => {
        if (!UI.drag) return;
        event.preventDefault();
        UI.drag.outsidePanel = isOutsideInventoryPanel(root, event);
        root.classList.toggle("is-dragging-outside-panel", UI.drag.outsidePanel);
        event.dataTransfer.dropEffect = "move";
      }, true);
      root.addEventListener("drop", (event) => {
        if (!UI.drag) return;
        const outsidePanel = isOutsideInventoryPanel(root, event);
        UI.drag.outsidePanel = outsidePanel;
        UI.drag.releasedOutsidePanel = outsidePanel;
        if (!outsidePanel) return;
        event.preventDefault();
        event.stopPropagation();
      }, true);

      await renderItems(root, active);
    } catch (error) {
      toast(error.message || "灵感箱打不开", true);
    }
  }

  function closeTopmost() {
    if (document.getElementById("mpg-style-membership-confirm")) {
      document.querySelector("#mpg-style-membership-confirm [data-confirm='no']")?.click();
      return true;
    }
    if (document.getElementById("mpg-inspiration-editor")) {
      closeItemEditor();
      return true;
    }
    if (document.getElementById("mpg-item-style-picker")) {
      closeItemStylePicker();
      return true;
    }
    if (document.getElementById("mpg-style-pinned")) {
      closePinnedStyle();
      return true;
    }
    if (document.getElementById("mpg-style-picker-root") || document.getElementById("mpg-style-cloud")) {
      closeStyleSelection();
      return true;
    }
    if (document.getElementById("mpg-inspiration-capture")) {
      closeCapture();
      return true;
    }
    if (document.querySelector("#mpg-inspiration-root .mpg-inspiration-confirm")) {
      document.querySelector("#mpg-inspiration-root .mpg-inspiration-confirm [data-confirm='no']")?.click();
      return true;
    }
    if (document.getElementById("mpg-inspiration-root")) {
      closeInventory();
      return true;
    }
    return false;
  }

  async function exportData() {
    const index = (await send({ type: "mpg-inspiration:export-index" })).data;
    const items = [];
    for (let i = 0; i < (index.items || []).length; i += 1) {
      const item = (await send({ type: "mpg-inspiration:export-item", id: index.items[i].id })).item;
      items.push(item);
      if (i > 0 && i % 50 === 0) toast(`正在打包灵感缩略图 ${i}/${index.items.length}…`);
    }
    return {
      version: 3,
      storageDirectoryName: index.storageDirectoryName || "",
      categories: index.categories || [],
      items
    };
  }

  async function importData(data) {
    if (!data) return false;
    await send({
      type: "mpg-inspiration:import-start",
      categories: data.categories || [],
      storageDirectoryName: data.storageDirectoryName || ""
    });
    const items = Array.isArray(data.items) ? data.items : [];
    for (let i = 0; i < items.length; i += 1) {
      await send({ type: "mpg-inspiration:import-item", item: items[i] });
      if (i > 0 && i % 25 === 0) toast(`正在恢复灵感图片 ${i}/${items.length}…`);
    }
    return true;
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== "mpg-inspiration:storage-changed") return false;
    UI.storageAuthorizationPrompted = false;
    if (document.getElementById("mpg-inspiration-root")) openInventory(UI.activeCategoryId);
    return false;
  });

  window.MiorningInspiration = {
    syncModules: () => {
      if (!moduleEnabled("style")) {
        document.querySelector("#mpg-style-membership-confirm [data-confirm='no']")?.click();
        closeStyleSelection(); closePinnedStyle(); closeItemStylePicker();
      }
      if (!moduleEnabled("inspiration")) {
        UI.captureRequest += 1; UI.inventoryOpenRequest += 1;
        closeCapture(); closeInventory(); closePreview(); closeItemEditor();
      }
    },
    capture: startCapture,
    open: () => openInventory(UI.activeCategoryId),
    openStylePicker,
    releaseStylePicker,
    closeTopmost,
    exportData,
    importData
  };
})();
