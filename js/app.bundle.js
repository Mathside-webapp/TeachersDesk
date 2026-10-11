(() => {
  // outputs/TeacherDesk/js/utils.js
  var esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  function url(value, optional = false) {
    if (!value && optional) return "";
    const u = new URL(value);
    if (!["https:", "http:"].includes(u.protocol) || u.username || u.password) throw Error("Use a complete https:// or http:// URL without embedded credentials.");
    return u.href;
  }
  function safeUrl(v) {
    try {
      return url(v);
    } catch {
      return "";
    }
  }
  var color = (v) => /^#[0-9a-f]{6}$/i.test(v || "") ? v : "#701B32";
  var id = () => crypto.randomUUID();
  function relative(date) {
    const mins = Math.max(0, Math.floor((Date.now() - new Date(date)) / 6e4));
    return mins < 1 ? "Just now" : mins < 60 ? `${mins} minutes ago` : mins < 1440 ? `${Math.floor(mins / 60)} hours ago` : mins < 2880 ? "Yesterday" : `${Math.floor(mins / 1440)} days ago`;
  }
  var paths = { home: "m3 10 9-7 9 7v10H3z M9 20v-7h6v7", websites: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z", categories: "M3 6h7l2 3h9v11H3z M3 6V3h7l2 3", favorites: "m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3-5.7-3-5.7 3 1.1-6.3-4.6-4.5 6.4-.9z", recent: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v6l4 2", notes: "M5 3h14v18H5z M8 7h8 M8 11h8 M8 15h5", resources: "m10 14 4-4 M8 16l-1 1a4 4 0 0 1-5-5l4-4a4 4 0 0 1 5 0 M13 16a4 4 0 0 0 5 0l4-4a4 4 0 0 0-5-5l-1 1", settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z", external: "M14 3h7v7 M21 3 11 13 M10 5H4v15h15v-6", search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14 M15 15l6 6", plus: "M12 5v14 M5 12h14", close: "m6 6 12 12 M18 6 6 18", menu: "M4 6h16 M4 12h16 M4 18h16", logout: "M9 3H3v18h6 M10 12h11 M17 8l4 4-4 4", book: "M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2v16", check: "M6 4h12v17H6z M9 3h6v3H9z m0 10 2 2 4-5", people: "M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M2 21v-4a6 6 0 0 1 12 0v4 M17 4a3 3 0 0 1 0 6 M18 14a4 4 0 0 1 4 4v3", leaf: "M4 20C2 8 10 4 21 3c-1 13-5 20-17 17 M4 20 16 8", gem: "m12 2 9 8-9 12-9-12z M3 10h18 M12 2 8 10l4 12 4-12z", heart: "M12 21 3 12C-3 3 8-1 12 6c4-7 15-3 9 6z", more: "M5 12h.01 M12 12h.01 M19 12h.01", arrow: "M4 12h16 M15 7l5 5-5 5", up: "m6 14 6-6 6 6", down: "m6 10 6 6 6-6", edit: "m4 16 12-12 4 4L8 20H4z M14 6l4 4", trash: "M3 6h18 M9 6V3h6v3 M6 6l1 15h10l1-15", pin: "m8 3 8 0-1 7 4 4H5l4-4z M12 14v8" };
  var icon = (name, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.websites}"/></svg>`;

  // outputs/TeacherDesk/js/store.js
  var config = globalThis.TEACHER_DESK_CONFIG || {};
  var tables = ["categories", "websites", "favorites", "recent", "shortcuts", "notes", "tasks", "resources", "profiles", "preferences"];
  var state = Object.fromEntries(tables.map((t) => [t, []]));
  var cloud = Boolean(config.supabaseUrl && config.supabasePublishableKey);
  var client;
  var user;
  var key = "teacherdesk-preview-v1";
  var cats = [["Class Websites", "#2176ce"], ["Teaching Tools", "#e97136"], ["Journals and Publications", "#c73556"], ["Personal Projects", "#9164c7"], ["Resources", "#25865d"], ["Others", "#786D72"]];
  function defaults() {
    return cats.map(([name, color2]) => ({ id: id(), name, color: color2 }));
  }
  function seed() {
    const categories2 = defaults(), names = [["Mathside", "Mathematics Class Website", "math", "#ff793c", 0], ["EduCore", "General Subject Management", "book", "#1596f5", 0], ["GradeDock", "OMR Answer Sheet Scanner", "check", "#156eff", 1], ["ClassCheck", "Attendance Management", "people", "#c60035", 1], ["Beryl 9", "Classroom Website", "leaf", "#18a95d", 0], ["Cobalt 9", "Classroom Website", "gem", "#18b5ec", 0], ["East-Washington Times", "School Publication", "notes", "#f83b63", 2], ["Teacher Desk", "Personal Workspace", "desk", "#aa7843", 3], ["Relationship Board", "Memories", "heart", "#ff6082", 3], ["Research", "Study Files", "notes", "#9a70e6", 3]];
    const websites = names.map(([name, description, icon2, color2, cat]) => ({ id: id(), name, description, icon: icon2, color: color2, category: categories2[cat].id, url: "", repo: "", example: true, created_at: (/* @__PURE__ */ new Date()).toISOString() }));
    return { ...Object.fromEntries(tables.map((t) => [t, []])), categories: categories2, websites, favorites: [1, 3, 7].map((i) => ({ id: websites[i].id, position: i })), shortcuts: [["Google Classroom", "https://classroom.google.com", "book", "#409c42"], ["DepEd Commons", "https://commons.deped.gov.ph", "notes", "#d12336"], ["Canva", "https://www.canva.com", "C", "#20adbc"], ["ChatGPT", "https://chatgpt.com", "gem", "#00a77c"], ["Google Drive", "https://drive.google.com", "gem", "#f6ba26"]].map(([name, url2, icon2, color2], position) => ({ id: id(), name, url: url2, icon: icon2, color: color2, position })), tasks: ["Check submissions (Mathside)", "Encode attendance (ClassCheck)", "Prepare activity for Grade 10", "Update East-Washington Times"].map((title) => ({ id: id(), title, done: false, due: "" })), profiles: [{ id: "preview", name: "Simon Gruba Jr." }], preferences: [{ id: "preview", showTasks: true, showShortcuts: true }] };
  }
  function unpack(rows) {
    return rows.map((r) => ({ ...r.data, id: r.id }));
  }
  async function init() {
    if (!cloud) {
      Object.assign(state, JSON.parse(localStorage.getItem(key) || "null") || seed());
      return;
    }
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL("js/vendor/supabase.js", document.baseURI);
      script.onload = resolve;
      script.onerror = () => reject(Error("Could not load the Supabase SDK."));
      document.head.append(script);
    });
    client = globalThis.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey);
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    user = data.session?.user;
    if (user) await load();
  }
  async function load() {
    if (!cloud) return;
    if (!user) {
      tables.forEach((t) => state[t] = []);
      return;
    }
    const results = await Promise.all(tables.map((t) => client.from(t).select("id,data")));
    const failed = results.find((r) => r.error);
    if (failed) throw failed.error;
    results.forEach((r, i) => state[tables[i]] = unpack(r.data));
    if (!state.categories.length) {
      const { error } = await client.rpc("initialize_workspace");
      if (error) throw error;
      const r = await client.from("categories").select("id,data");
      if (r.error) throw r.error;
      state.categories = unpack(r.data);
    }
  }
  function setUser(u) {
    user = u;
  }
  function online() {
    if (cloud && !navigator.onLine) throw Error("You are offline. Changes have not been saved. Reconnect and try again.");
    if (cloud && !user) throw Error("Sign in to save your workspace.");
  }
  function persist(next) {
    if (!cloud) localStorage.setItem(key, JSON.stringify(next));
    Object.assign(state, next);
  }
  async function save(table, item) {
    online();
    const row = { ...item, id: item.id || id() };
    if (cloud) {
      const { id: rowId, ...data } = row;
      const r = await client.from(table).upsert({ id: rowId, user_id: user.id, data }).select("id,data").single();
      if (r.error) throw r.error;
    }
    const next = { ...state, [table]: [...state[table].filter((x) => x.id !== row.id), row] };
    persist(next);
    return row;
  }
  async function saveWebsite(item, favorite) {
    online();
    const row = { ...item, id: item.id || id() };
    if (cloud) {
      const { id: rowId, ...payload } = row;
      const { error } = await client.rpc("save_website", { website_id: rowId, payload, starred: favorite });
      if (error) throw error;
    }
    const favorites = state.favorites.filter((f) => f.id !== row.id);
    if (favorite) favorites.push(state.favorites.find((f) => f.id === row.id) || { id: row.id, position: Date.now() });
    persist({ ...state, websites: [...state.websites.filter((w) => w.id !== row.id), row], favorites });
    return row;
  }
  async function reorderRows(table, rows) {
    online();
    if (cloud) {
      const result = await client.from(table).upsert(rows.map(({ id: id2, ...data }) => ({ id: id2, user_id: user.id, data }))).select("id");
      if (result.error) throw result.error;
    }
    const ids = new Set(rows.map((r) => r.id));
    persist({ ...state, [table]: [...state[table].filter((r) => !ids.has(r.id)), ...rows] });
  }
  async function remove(table, rowId) {
    online();
    if (cloud) {
      const r = await client.from(table).delete().eq("id", rowId).select("id");
      if (r.error) throw r.error;
      if (!r.data.length) throw Error("This item was already removed. Refresh your workspace.");
    }
    const next = { ...state, [table]: state[table].filter((x) => x.id !== rowId) };
    if (table === "websites") {
      next.favorites = state.favorites.filter((x) => x.id !== rowId);
      next.recent = state.recent.filter((x) => x.id !== rowId);
    }
    persist(next);
  }
  async function moveCategory(from, to) {
    online();
    if (!to || from === to) throw Error("Choose another category.");
    if (cloud) {
      const { error } = await client.rpc("move_and_delete_category", { source_id: from, target_id: to });
      if (error) throw error;
      await load();
      return;
    }
    persist({ ...state, categories: state.categories.filter((c) => c.id !== from), websites: state.websites.map((w) => w.category === from ? { ...w, category: to } : w), resources: state.resources.map((w) => w.category === from ? { ...w, category: to } : w) });
  }
  async function upload(file) {
    online();
    if (file.size > 2 * 1024 * 1024) throw Error("Choose an image smaller than 2 MB.");
    if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) throw Error("Use PNG, JPG, SVG or WebP.");
    const source = URL.createObjectURL(file);
    let blob;
    try {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      const scale = Math.min(256 / image.width, 256 / image.height);
      ctx.drawImage(image, (256 - image.width * scale) / 2, (256 - image.height * scale) / 2, image.width * scale, image.height * scale);
      blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
      if (!blob) throw Error("Could not read this image.");
    } finally {
      URL.revokeObjectURL(source);
    }
    if (!cloud) return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const path = `${user.id}/${id()}.png`;
    const { error } = await client.storage.from("logos").upload(path, blob, { contentType: "image/png" });
    if (error) throw error;
    return path;
  }
  var signed = /* @__PURE__ */ new Map();
  async function imageUrl(path) {
    if (!path) return "";
    if (!cloud) return /^data:image\/png;base64,/.test(path) ? path : "";
    if (!path.startsWith(user?.id + "/")) return "";
    const old = signed.get(path);
    if (old && old.until > Date.now()) return old.url;
    const { data, error } = await client.storage.from("logos").createSignedUrl(path, 3600);
    if (error) return "";
    signed.set(path, { url: data.signedUrl, until: Date.now() + 3e6 });
    return data.signedUrl;
  }

  // outputs/TeacherDesk/js/ui.js
  var $ = (s) => document.querySelector(s);
  async function withProgress(message, action) {
    const popup = document.createElement("div");
    popup.className = "operation-progress";
    popup.setAttribute("role", "status");
    popup.setAttribute("aria-live", "polite");
    popup.innerHTML = '<img src="assets/logo.png" alt=""><div><strong></strong><span>Please wait a moment</span><progress aria-label="Operation in progress"></progress></div>';
    popup.querySelector("strong").textContent = message;
    const host = $("#modal")?.open ? $("#modal-body") : document.body;
    host.append(popup);
    const started = performance.now();
    try {
      return await action();
    } finally {
      await new Promise((resolve) => setTimeout(resolve, Math.max(0, 380 - (performance.now() - started))));
      popup.remove();
    }
  }
  function operationLabel(title, label) {
    if (/sign out/i.test(title)) return "Signing out\u2026";
    if (/delete/i.test(title)) return "Deleting\u2026";
    if (/sign in/i.test(label)) return "Signing in\u2026";
    if (/create account/i.test(label)) return "Creating your account\u2026";
    if (/reset/i.test(title)) return "Sending reset email\u2026";
    if (/password/i.test(title)) return "Updating password\u2026";
    if (/website/i.test(title)) return "Saving website\u2026";
    return "Saving changes\u2026";
  }
  function toast(message, options) {
    if (typeof window.TeacherDeskNotify === "function") window.TeacherDeskNotify(message, options);
    else console.info(message);
  }
  var empty = (title, description) => `<div class="empty"><img src="assets/logo.png" alt=""><h3>${esc(title)}</h3><p>${esc(description)}</p></div>`;
  // Try app/PWA icons from the website's own folder before falling back to a favicon service.
  // GitHub Pages project websites need the project path, not just github.io/favicon.ico.
  function websiteIcons(live){
   const u=new URL(live);
   const last=u.pathname.split('/').pop();
   const directory=u.pathname.endsWith('/')?u.href:/\.[a-z0-9]+$/i.test(last)?new URL('.',u).href:u.href+'/';
   const paths=['assets/icons/icon-192.png','assets/icons/icon-512.png','assets/icons/apple-touch-icon.png','favicon.ico','assets/logo.png','logo.png'];
   return [...new Set([...paths.map(path=>new URL(path,directory).href),new URL('/favicon.ico',u.origin).href,`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(u.origin)}&sz=128`])];
  }
  function fallbackIcon(w){
   if(w.icon==='desk')return '<img src="assets/logo.png" alt="">';
   if(w.icon==='math')return '<span class="math-mark">e<sup>x</sup></span>';
   if(w.icon==='letter'||w.icon?.length===1)return esc(w.icon?.length===1?w.icon:w.name?.[0]||'W');
   return icon(w.icon||'websites');
  }
  function appIcon(w){
   const live=safeUrl(w.url);
   let contents;
   if(w.logo)contents=`<img data-logo="${esc(w.logo)}" alt="">`;
   else if(live && (w.category||w.icon==='favicon')){
    const options=websiteIcons(live);
    contents=`<img class="website-logo" src="${esc(options[0])}" data-favicon-list="${esc(JSON.stringify(options.slice(1)))}" data-fallback="${esc(w.name?.[0]||'W')}" alt="" loading="lazy" referrerpolicy="no-referrer">`;
   } else contents=fallbackIcon(w);
   return `<span class="app-icon ${w.icon==='desk'&&!live?'desk':''}" style="--app-color:${color(w.color)}">${contents}</span>`;
  }
  async function hydrate(root=document){
   for(const img of root.querySelectorAll('img[data-logo]')){
    const src=await imageUrl(img.dataset.logo);
    if(src)img.src=src;else img.replaceWith(document.createTextNode('W'));
   }
   for(const img of root.querySelectorAll('img[data-favicon-list]')){
    let options=[];
    try{options=JSON.parse(img.dataset.faviconList||'[]');}catch{}
    const fallback=img.dataset.fallback||'W';
    const next=()=>{if(options.length)img.src=options.shift();else img.replaceWith(document.createTextNode(fallback));};
    img.addEventListener('error',next);
    if(img.complete&&!img.naturalWidth)next();
   }
   for(const img of root.querySelectorAll('img[data-fallback]:not([data-favicon-list])'))img.onerror=()=>img.replaceWith(document.createTextNode(img.dataset.fallback));
  }
  function categoryOptions(selected) {
    return state.categories.map((c) => `<option value="${esc(c.id)}" ${c.id === selected ? "selected" : ""}>${esc(c.name)}</option>`).join("");
  }
  function field(name, label, value = "", type = "text", extra = "") {
    return `<div class="field"><label for="f-${name}">${label}</label><input id="f-${name}" name="${name}" type="${type}" value="${esc(value)}" ${extra}></div>`;
  }
  function textarea(name, label, value = "") {
    return `<div class="field"><label for="f-${name}">${label}</label><textarea id="f-${name}" name="${name}" maxlength="20000">${esc(value)}</textarea></div>`;
  }
  function select(name, label, options) {
    return `<div class="field"><label for="f-${name}">${label}</label><select id="f-${name}" name="${name}">${options}</select></div>`;
  }
  function check(name, label, checked) {
    return `<label class="check-label"><input name="${name}" type="checkbox" ${checked ? "checked" : ""}>${label}</label>`;
  }
  var closeGuard = null;
  function close() {
    $("#modal").close();
    closeGuard = null;
  }
  async function requestClose() {
    if ($("#editor")?.dataset.busy) return;
    if (closeGuard && !await closeGuard()) return;
    close();
  }
  function modal(title, html, { submit, label = "Save", setup, guard } = {}) {
    closeGuard = guard || null;
    $("#modal-body").innerHTML = `<div class="dialog-head"><h2 id="modal-title">${esc(title)}</h2><button type="button" class="icon-button" data-close aria-label="Close dialog">${icon("close")}</button></div>${submit ? '<form id="editor" method="post">' : ""}${html}${submit ? `<p class="error" role="alert"></p><div class="dialog-actions"><button type="button" class="secondary" data-close>Cancel</button><button type="submit" class="primary">${label}</button></div></form>` : ""}`;
    $("#modal-body").querySelectorAll("[data-close]").forEach((b) => b.onclick = requestClose);
    if (submit) $("#editor").onsubmit = async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      if (form.dataset.busy) return;
      form.dataset.busy = "1";
      const btn = form.querySelector("[type=submit]"), old = btn.textContent;
      btn.disabled = true;
      btn.textContent = operationLabel(title, label);
      form.querySelector(".error").textContent = "";
      try {
        await withProgress(operationLabel(title, label), () => submit(new FormData(form), form));
        close();
      } catch (error) {
        form.querySelector(".error").textContent = error.message || "Unable to save. Please try again.";
      } finally {
        delete form.dataset.busy;
        btn.disabled = false;
        btn.textContent = old;
      }
    };
    if (!$("#modal").open) $("#modal").showModal();
    setup?.($("#modal-body"));
    hydrate($("#modal-body"));
  }
  function confirm(title, message, action) {
    modal(title, `<p>${esc(message)}</p>`, { label: "Confirm", submit: async () => {
      await action();
    } });
  }
  $("#modal").addEventListener("cancel", (e) => {
    e.preventDefault();
    requestClose();
  });

  // outputs/TeacherDesk/js/websites.js
  function card(w, { preview = false } = {}) {
    const cat = state.categories.find((c) => c.id === w.category), fav = state.favorites.some((f) => f.id === w.id), live = safeUrl(w.url);
    return `<article class="site-card" ${preview ? "" : `data-site="${w.id}"`}>
 ${preview ? "" : `<span class="open-mark">${icon("external")}</span><div class="card-controls"><button class="icon-button star ${fav ? "on" : ""}" data-action="favorite" data-id="${w.id}" aria-label="${fav ? "Unfavorite" : "Favorite"} ${esc(w.name)}" aria-pressed="${fav}">${icon("favorites")}</button><button class="icon-button manage" data-action="manage-site" data-id="${w.id}" aria-label="Manage ${esc(w.name)}">${icon("more")}</button></div>`}
 <${preview ? "div" : live ? "a" : "button"} class="site-open" ${preview ? "" : live ? `href="${esc(live)}" target="_blank" rel="noopener noreferrer" data-launch="${w.id}" aria-label="Open ${esc(w.name)} website"` : `data-action="edit-site" data-id="${w.id}" aria-label="Add the live website link for ${esc(w.name)}"`}>${appIcon(w)}<div class="site-text"><h3>${esc(w.name || "Your website")}</h3><p>${esc(w.description || "Your next favorite teaching tool")}</p><span class="badge" style="--badge-color:${color(cat?.color)}">${esc(cat?.name.replace(" Websites", "").replace("Teaching ", "").replace("Journals and Publications", "Journal").replace(" Projects", "") || "Others")}</span></div></${preview ? "div" : live ? "a" : "button"}></article>`;
  }
  async function toggleFavorite(rowId) {
    const f = state.favorites.find((x) => x.id === rowId);
    if (f) await remove("favorites", rowId);
    else await save("favorites", { id: rowId, position: Date.now() });
  }
  function websiteEditor(existing, refresh) {
    const w = existing || { name: "", description: "", url: "", repo: "", category: state.categories[0]?.id, icon: "favicon", color: "#f68b42" };
    let logo = w.logo || "";
    const icons = [["favicon", "Website logo (automatic)"], ["letter", "First letter"], ["math", "Mathematics"], ["book", "Book"], ["check", "Checklist"], ["people", "Classroom"], ["leaf", "Leaf"], ["gem", "Gem"], ["notes", "Document"], ["heart", "Heart"], ["desk", "Teacher desk"]];
    modal(existing ? "Edit Website" : "Add Website", `<div class="form-columns"><div class="preview"><small>Card preview</small><div id="card-preview">${card(w, { preview: true })}</div><p class="help">Your live website and repository are separate links.</p></div><div>${field("name", "Website name *", w.name, "text", 'required maxlength="100"')}${field("url", "Live website URL *", w.url, "url", 'required placeholder="https://your-site.github.io" autocapitalize="off"')}${field("repo", "GitHub repository URL", w.repo, "url", 'placeholder="https://github.com/you/repository" autocapitalize="off"')}${select("category", "Category *", categoryOptions(w.category))}${field("description", "Short description", w.description, "text", 'maxlength="180"')}${select("icon", "Website icon", icons.map(([v, n]) => `<option value="${v}" ${w.icon === v ? "selected" : ""}>${n}</option>`).join(""))}${field("color", "Icon color", w.color, "color")}${field("logo", "Upload a custom logo (PNG, JPG, SVG, WebP; 2 MB max)", "", "file", 'accept="image/png,image/jpeg,image/svg+xml,image/webp"')}${check("removeLogo", "Remove existing logo", false)}${check("favorite", "Add to favorites", state.favorites.some((f) => f.id === w.id))}</div></div>`, { label: "Save Website", setup: (root) => {
      root.querySelector("form").addEventListener("input", () => {
        const d = new FormData(root.querySelector("form"));
        root.querySelector("#card-preview").innerHTML = card({ ...w, ...Object.fromEntries(d), logo: d.get("removeLogo") ? null : logo }, { preview: true });
        const preview = root.querySelector("#card-preview");
        const file = d.get("logo");
        if (file?.size && file.size <= 2097152 && ["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) {
          const image = new Image();
          const source = URL.createObjectURL(file);
          image.src = source;
          image.alt = "Selected logo preview";
          image.onload = image.onerror = () => URL.revokeObjectURL(source);
          preview.querySelector(".app-icon").replaceChildren(image);
        } else hydrate(preview);
      });
    }, submit: async (d) => {
      const live = url(d.get("url")), repo = url(d.get("repo"), true);
      if (repo && new URL(repo).hostname !== "github.com") throw Error("Enter a github.com repository URL.");
      const name = d.get("name").trim();
      if (!name) throw Error("Enter a website name.");
      if (d.get("removeLogo")) logo = "";
      const file = d.get("logo");
      if (file?.size) logo = await upload(file);
      await saveWebsite({ ...w, id: w.id || id(), name, description: d.get("description").trim(), url: live, repo, category: d.get("category"), icon: d.get("icon"), color: d.get("color"), logo, example: false, created_at: w.created_at || (/* @__PURE__ */ new Date()).toISOString() }, Boolean(d.get("favorite")));
      refresh();
      toast("Website saved.");
    } });
  }
  function manageWebsite(w, refresh) {
    modal(w.name, `<div class="menu-actions"><button data-do="edit">${icon("edit")}Edit website</button><button data-do="duplicate">${icon("websites")}Duplicate website</button>${safeUrl(w.repo) ? `<a href="${esc(safeUrl(w.repo))}" target="_blank" rel="noopener noreferrer">${icon("external")}View GitHub repository</a>` : '<p class="help">No GitHub repository added yet.</p>'}<button class="danger" data-do="delete">${icon("trash")}Delete website</button></div>`, { setup: (root) => {
      root.querySelector("[data-do=edit]").onclick = () => websiteEditor(w, refresh);
      root.querySelector("[data-do=duplicate]").onclick = () => websiteEditor({ ...w, id: void 0, name: w.name + " (copy)" }, refresh);
      root.querySelector("[data-do=delete]").onclick = () => confirm("Delete website?", `Remove ${w.name} from your desk? This also removes its favorite and recent activity.`, async () => {
        await remove("websites", w.id);
        refresh();
        toast("Website deleted.");
      });
    } });
  }

  // outputs/TeacherDesk/js/editors.js
  function categoryEditor(c, refresh) {
    modal(c ? "Edit Category" : "Add Category", field("name", "Category name *", c?.name, "text", 'required maxlength="60"') + field("color", "Category color", c?.color || "#2176ce", "color"), { label: "Save Category", submit: async (d) => {
      const name = d.get("name").trim();
      if (!name) throw Error("Enter a category name.");
      await save("categories", { id: c?.id, name, color: d.get("color") });
      refresh();
      toast("Category saved.");
    } });
  }
  function deleteCategory(c, refresh) {
    if (state.categories.length < 2) {
      toast("Keep at least one category.");
      return;
    }
    modal("Delete Category", `<p>Move websites and resources in <strong>${esc(c.name)}</strong> to:</p>` + select("target", "Destination category", state.categories.filter((x) => x.id !== c.id).map((x) => `<option value="${x.id}">${esc(x.name)}</option>`).join("")), { label: "Move & Delete", submit: async (d) => {
      await moveCategory(c.id, d.get("target"));
      refresh();
      toast("Items moved and category deleted.");
    } });
  }
  function taskEditor(t, refresh) {
    modal(t ? "Edit Task" : "Add Task", field("title", "Task *", t?.title, "text", 'required maxlength="300"') + field("due", "Due date (optional)", t?.due, "date") + check("done", "Completed", t?.done), { label: "Save Task", submit: async (d) => {
      const title = d.get("title").trim();
      if (!title) throw Error("Enter a task.");
      await save("tasks", { id: t?.id, title, due: d.get("due"), done: Boolean(d.get("done")) });
      refresh();
      toast("Task saved.");
    } });
  }
  function linkEditor(table, item, refresh) {
    const resource = table === "resources";
    modal(item ? "Edit " + (resource ? "Resource" : "Shortcut") : "Add " + (resource ? "Resource" : "Shortcut"), field("name", "Title *", item?.name, "text", 'required maxlength="100"') + field("url", "Website URL *", item?.url, "url", 'required placeholder="https://"') + (resource ? field("description", "Description", item?.description, "text", 'maxlength="500"') + select("category", "Category", categoryOptions(item?.category)) : field("color", "Icon color", item?.color || "#25865d", "color")), { label: "Save", submit: async (d) => {
      const name = d.get("name").trim();
      if (!name) throw Error("Enter a title.");
      await save(table, { ...item, id: item?.id, name, url: url(d.get("url")), description: d.get("description") || "", category: d.get("category") || "", color: d.get("color") || "#25865d", icon: item?.icon || "letter", position: item?.position ?? Date.now() });
      refresh();
      toast("Link saved.");
    } });
  }
  function deleteItem(table, item, refresh) {
    confirm("Delete item?", `Delete \u201C${item.name || item.title}\u201D? This cannot be undone.`, async () => {
      await remove(table, item.id);
      refresh();
      toast("Item deleted.");
    });
  }
  function noteEditor(note, refresh) {
    let current = note || { id: id(), title: "", content: "", color: "#fff5d9", pinned: false, created_at: (/* @__PURE__ */ new Date()).toISOString() }, timer, busy = null, dirty = false, form;
    async function flush() {
      clearTimeout(timer);
      if (busy) await busy;
      if (!dirty) return true;
      const status = form.querySelector("#save-status");
      const d = new FormData(form);
      if (!d.get("title").trim()) {
        status.textContent = "Add a title to save this note.";
        return false;
      }
      const snapshot = { ...current, title: d.get("title").trim(), content: d.get("content"), color: d.get("color"), pinned: Boolean(d.get("pinned")), updated_at: (/* @__PURE__ */ new Date()).toISOString() };
      dirty = false;
      status.textContent = "Saving\u2026";
      busy = (async () => {
        try {
          current = await withProgress("Saving note\u2026", () => save("notes", snapshot));
          status.textContent = "Saved";
          refresh();
          return true;
        } catch (e) {
          dirty = true;
          status.textContent = "Not saved: " + e.message;
          return false;
        } finally {
          busy = null;
        }
      })();
      const ok = await busy;
      return ok && dirty ? flush() : ok;
    }
    modal(note ? "Edit Note" : "New Note", `<form id="note-form" method="post">${field("title", "Note title *", current.title, "text", 'required maxlength="160"')}${textarea("content", "Your note", current.content)}${select("color", "Note color", [["#fff5d9", "Warm yellow"], ["#f1e8fa", "Soft lilac"], ["#e7f4ec", "Sage green"], ["#fbe7e3", "Blush"], ["#ffffff", "White"]].map(([v, n]) => `<option value="${v}" ${v === current.color ? "selected" : ""}>${n}</option>`).join(""))}${check("pinned", "Pin this note", current.pinned)}<p id="save-status" class="status-text" role="status">${note ? "Saved" : "Give your note a title. Changes save automatically."}</p><div class="dialog-actions"><button class="primary" type="submit">Save & Close</button></div></form>`, { guard: async () => {
      const ok = await flush();
      if (ok) clearTimeout(timer);
      return ok;
    }, setup: (root) => {
      form = root.querySelector("form");
      form.addEventListener("input", () => {
        dirty = true;
        form.querySelector("#save-status").textContent = "Unsaved changes\u2026";
        clearTimeout(timer);
        timer = setTimeout(flush, 800);
      });
      form.onsubmit = async (e) => {
        e.preventDefault();
        if (await flush()) close();
      };
    } });
  }

  // outputs/TeacherDesk/js/auth.js
  const passwordEye=(visible)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${visible?'<path d="M3 3l18 18 M10.6 10.6a2 2 0 0 0 2.8 2.8 M9.8 5.2A10.9 10.9 0 0 1 12 5c4.7 0 8.6 2.8 10 7-0.6 1.8-1.7 3.4-3.1 4.6 M6.6 6.6C4.4 7.8 2.9 9.6 2 12c1.4 4.2 5.3 7 10 7 1.3 0 2.6-.2 3.8-.7"/>':'<path d="M2 12c1.7-4.4 5.4-7 10-7s8.3 2.6 10 7c-1.7 4.4-5.4 7-10 7S3.7 16.4 2 12"/><circle cx="12" cy="12" r="3"/>'}</svg>`;
  function authDialog(refresh, mode2 = "signin") {
    if (!cloud) {
      modal("Connect your private workspace", '<p>This is a local preview. Your changes are saved only in this browser.</p><p class="help">To enable teacher accounts and cross-device sync, run sql/setup.sql in your Supabase project, then add the project URL and publishable key to js/config.js. Full instructions are in README.md.</p>');
      return;
    }
    const reset = mode2 === "reset", signup = mode2 === "signup";
    modal(reset ? "Reset Password" : signup ? "Create Account" : "Welcome to Teacher Desk", `<div class="auth-form"><img src="assets/logo.png" alt="">${signup ? field("name", "Display name *", "", "text", 'required maxlength="100" autocomplete="name"') : ""}${field("email", "Email address *", "", "email", 'required autocomplete="email" autocapitalize="off"')}${reset ? "" : `<div class="field"><label for="f-password">Password *</label><div class="password-wrap"><input id="f-password" name="password" type="password" required minlength="8" autocomplete="${signup ? "new-password" : "current-password"}"><button type="button" id="show-password" class="password-eye" aria-label="Show password" title="Show password" aria-pressed="false">${passwordEye(false)}</button></div></div>`}<p class="help">${reset ? "We\u2019ll email you a link to choose a new password." : "Your websites, notes, and resources belong to your private account."}</p><div class="auth-tabs">${!reset ? `<button type="button" class="secondary" data-mode="${signup ? "signin" : "signup"}">${signup ? "Sign in" : "Create account"}</button><button type="button" data-mode="reset">Forgot password?</button>` : '<button type="button" class="secondary" data-mode="signin">Back to sign in</button>'}</div></div>`, { label: reset ? "Send reset link" : signup ? "Create Account" : "Sign In", setup: (root) => {
      root.querySelectorAll("[data-mode]").forEach((b2) => b2.onclick = () => authDialog(refresh, b2.dataset.mode));
      const b = root.querySelector("#show-password");
      if (b) b.onclick = () => {
        const p = root.querySelector("#f-password");
        p.type = p.type === "password" ? "text" : "password";
        b.innerHTML = passwordEye(p.type === "text");
        b.setAttribute("aria-label", p.type === "text" ? "Hide password" : "Show password");
        b.setAttribute("title", p.type === "text" ? "Hide password" : "Show password");
        b.setAttribute("aria-pressed", p.type === "text");
      };
    }, submit: async (d) => {
      const email = d.get("email").trim(), password = d.get("password"), redirectTo = new URL("./", location.href).href;
      const r = reset ? await client.auth.resetPasswordForEmail(email, { redirectTo }) : signup ? await client.auth.signUp({ email, password, options: { data: { display_name: d.get("name").trim() }, emailRedirectTo: redirectTo } }) : await client.auth.signInWithPassword({ email, password });
      if (r.error) throw r.error;
      if (reset) {
        toast("Reset email requested. Check your inbox.");
        return;
      }
      if (signup && !r.data.session) {
        toast("Check your email to confirm your account, then sign in.");
        return;
      }
      setUser(r.data.user);
      await load();
      refresh();
      toast("Welcome to your desk.");
    } });
  }
  function passwordDialog() {
    modal("Change Password", field("password", "New password (at least 8 characters)", "", "password", 'required minlength="8" autocomplete="new-password"') + field("confirmation", "Confirm new password", "", "password", 'required minlength="8" autocomplete="new-password"'), { label: "Update Password", submit: async (d) => {
      if (d.get("password") !== d.get("confirmation")) throw Error("Passwords do not match.");
      const { error } = await client.auth.updateUser({ password: d.get("password") });
      if (error) throw error;
      toast("Password updated.");
    } });
  }
  function profileForm() {
    const p = state.profiles[0] || {}, pref = state.preferences[0] || {};
    return `<form id="profile-form" method="post"><h2>Your profile</h2>${field("name", "Display name *", p.name || user?.user_metadata?.display_name || "", "text", 'required maxlength="100" autocomplete="name"')}<h2>Make this desk yours</h2>${check("showTasks", "Show To-Do Today on Home", pref.showTasks !== false)}${check("showShortcuts", "Show Quick Access on Home", pref.showShortcuts !== false)}<p class="error" role="alert"></p><button class="primary" type="submit">Save Preferences</button></form>`;
  }
  function bindProfile(refresh) {
    document.querySelector("#profile-form").onsubmit = async (e) => {
      e.preventDefault();
      const f = e.currentTarget, b = f.querySelector("[type=submit]");
      if (b.disabled) return;
      b.disabled = true;
      b.textContent = "Saving\u2026";
      try {
        const d = new FormData(f), name = d.get("name").trim();
        if (!name) throw Error("Enter your display name.");
        await save("profiles", { id: cloud ? user.id : "preview", name });
        await save("preferences", { id: cloud ? user.id : "preview", showTasks: Boolean(d.get("showTasks")), showShortcuts: Boolean(d.get("showShortcuts")) });
        refresh();
        toast("Preferences saved.");
      } catch (err) {
        f.querySelector(".error").textContent = err.message;
      } finally {
        b.disabled = false;
        b.textContent = "Save Preferences";
      }
    };
  }

  // outputs/TeacherDesk/js/app.js
  var nav = [["home", "Home"], ["websites", "My Websites"], ["categories", "Categories"], ["notes", "Notes"], ["settings", "Settings"]];
  var page = nav.some(([p]) => p === location.hash.slice(1)) ? location.hash.slice(1) : "home";
  var query = "";
  var category = "all";
  var taskFilter = "pending";
  var ready = false;
  var mode = "full";
  try {
    mode = localStorage.getItem("teacherdesk-mode-v1") === "shortcuts" ? "shortcuts" : "full";
  } catch {
  }
  var byPosition = (a, b) => (a.position || 0) - (b.position || 0);
  $("#menu-toggle").innerHTML = icon("menu");
  function menu(open) {
    document.body.classList.toggle("menu-open", open);
    $("#menu-toggle").setAttribute("aria-expanded", open);
  }
  $("#menu-toggle").onclick = () => menu(!document.body.classList.contains("menu-open"));
  $("#scrim").onclick = () => menu(false);
  function connection() {
    const el = $("#connection");
    el.classList.toggle("offline", !navigator.onLine);
    el.textContent = !navigator.onLine ? cloud ? "Offline \u2014 cloud changes are unavailable. Reconnect to sync." : "Offline \u2014 preview changes stay in this browser." : cloud ? user ? "" : "Sign in to open your private workspace." : "Local preview \xB7 Saved on this browser only \xB7 Connect Supabase in Settings";
  }
  function currentName() {
    return state.profiles[0]?.name || user?.user_metadata?.display_name || "Teacher";
  }
  function filters() {
    return `<div class="filters" aria-label="Filter by category"><button class="pill ${category === "all" ? "active" : ""}" data-category="all" aria-pressed="${category === "all"}">All</button>${state.categories.map((c) => `<button class="pill ${category === c.id ? "active" : ""}" data-category="${c.id}" aria-pressed="${category === c.id}">${esc(c.name.replace(" Websites", "").replace("Teaching ", "").replace("Journals and Publications", "Journals").replace(" Projects", ""))}</button>`).join("")}</div>`;
  }
  function searchBar(hero2 = false) {
    return `<label class="${hero2 ? "hero-search" : "page-search"}">${icon("search")}<span class="visually-hidden">Search ${page === "notes" ? "notes" : "websites, tools, or categories"}</span><input type="search" id="search" value="${esc(query)}" placeholder="${page === "notes" ? "Search your notes\u2026" : "Search websites, tools, or categories\u2026"}" autocomplete="off"></label>`;
  }
  function hero() {
    const h = (/* @__PURE__ */ new Date()).getHours(), g = h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
    return `<section class="hero" aria-label="Welcome"><div class="greeting">Good ${g},</div><h1>${esc(currentName().split(" ")[0])}!</h1><p>Your teacher workspace for a more<br>organized and productive day.</p><div class="hero-meta"><div class="date-box">${(/* @__PURE__ */ new Date()).toLocaleDateString(void 0, { weekday: "long" })}<br>${(/* @__PURE__ */ new Date()).toLocaleDateString(void 0, { month: "short", day: "numeric", year: "numeric" })} &nbsp;\u2600\uFE0F</div><div class="quote">\u201CSame purpose,<br>more possibilities.\u201D</div></div>${searchBar(true)}</section>`;
  }
  function filteredSites() {
    const starred = new Map(state.favorites.map((f) => [f.id, f.position || 0]));
    let rows = state.websites.filter((w) => (mode === "shortcuts" || category === "all" || w.category === category) && [w.name, w.description, state.categories.find((c) => c.id === w.category)?.name].join(" ").toLowerCase().includes(mode === "shortcuts" ? "" : query.toLowerCase()));
    if (page === "home" || mode === "shortcuts") rows.sort((a, b) => Number(starred.has(b.id)) - Number(starred.has(a.id)) || (starred.has(a.id) && starred.has(b.id) ? starred.get(a.id) - starred.get(b.id) : 0));
    return rows;
  }
  function siteGrid() {
    const rows = filteredSites();
    return (rows.length ? rows.map((w) => card(w)).join("") : mode === "shortcuts" ? "" : empty("Make room for your next great tool", query ? "No matching websites. Try another search." : "Add a website to start organizing your desk.")) + (mode === "shortcuts" ? '<button class="add-tile" data-action="add-site" aria-label="Add Website"><span class="add-tile-icon">' + icon("plus") + "</span><strong>Add Website</strong></button>" : "");
  }
  function quick() {
    return `<section><div class="section-heading"><h2>Quick Access</h2><button class="primary" data-action="add-shortcut" aria-label="Add Quick Access">${icon("plus")}Add Quick Access</button></div><div class="quick-grid" tabindex="0" role="region" aria-label="Quick Access, scroll left or right">${[...state.shortcuts].sort(byPosition).map((s) => `<div class="quick"><a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${appIcon(s)}<span>${esc(s.name)}</span></a><button class="icon-button" data-action="manage-shortcut" data-id="${s.id}" aria-label="Manage ${esc(s.name)}">${icon("more")}</button></div>`).join("") || '<p class="help">Add your everyday links.</p>'}</div></section>`;
  }
  function tasks() {
    const rows = state.tasks.filter((t) => taskFilter === "all" || (taskFilter === "completed" ? t.done : !t.done));
    return `<section class="task-panel"><div class="section-heading"><h2>To Do Today</h2><button class="pill" data-action="add-task">+ Add</button></div><div class="task-filters">${["pending", "completed", "all"].map((v) => `<button class="${taskFilter === v ? "active" : ""}" data-task-filter="${v}">${v[0].toUpperCase() + v.slice(1)}</button>`).join("")}</div>${rows.map((t) => `<div class="task-row ${t.done ? "done" : ""}"><input type="checkbox" ${t.done ? "checked" : ""} data-task="${t.id}" aria-label="Complete ${esc(t.title)}"><button class="task-title" data-action="edit-task" data-id="${t.id}">${esc(t.title)}${t.due ? `<small>Due ${esc(t.due)}</small>` : ""}</button><button class="icon-button" data-action="delete-task" data-id="${t.id}" aria-label="Delete ${esc(t.title)}">${icon("trash")}</button></div>`).join("") || '<p class="help">All clear. A little breathing room.</p>'}</section>`;
  }
  function header(title, description, action, label) {
    return `<div class="page-head"><div><h1>${title}</h1><p>${description}</p></div>${action ? `<button class="primary" data-action="${action}">${icon("plus")}${label}</button>` : ""}</div>`;
  }
  function categories() {
    return header("Categories", "A place for every part of your teaching day.", "add-category", "Add Category") + `<div class="workspace"><div class="list">${state.categories.map((c) => `<div class="list-row">${appIcon({ icon: "categories", color: c.color })}<button class="grow" style="text-align:left" data-open-category="${c.id}"><strong>${esc(c.name)}</strong><p>${state.websites.filter((w) => w.category === c.id).length} websites</p></button><button class="icon-button" data-action="edit-category" data-id="${c.id}" aria-label="Edit ${esc(c.name)}">${icon("edit")}</button><button class="icon-button danger" data-action="delete-category" data-id="${c.id}" aria-label="Delete ${esc(c.name)}">${icon("trash")}</button></div>`).join("")}</div></div>`;
  }
  function noteGrid() {
    return [...state.notes].filter((n) => (n.title + " " + n.content).toLowerCase().includes(query.toLowerCase())).sort((a, b) => Number(b.pinned) - Number(a.pinned) || (b.updated_at || "").localeCompare(a.updated_at || "")).map((n) => `<article class="note" style="--note-color:${color(n.color)}"><div class="section-heading"><h3>${esc(n.title)}</h3><button class="icon-button" data-action="pin-note" data-id="${n.id}" aria-label="${n.pinned ? "Unpin" : "Pin"} ${esc(n.title)}" aria-pressed="${Boolean(n.pinned)}">${icon("pin")}</button></div><div class="note-content">${esc(n.content)}</div><footer><span>Updated ${relative(n.updated_at || n.created_at)}<br>Created ${new Date(n.created_at).toLocaleDateString()}</span><span><button class="icon-button" data-action="edit-note" data-id="${n.id}" aria-label="Edit ${esc(n.title)}">${icon("edit")}</button><button class="icon-button" data-action="delete-note" data-id="${n.id}" aria-label="Delete ${esc(n.title)}">${icon("trash")}</button></span></footer></article>`).join("") || empty("A little space for your ideas", "Keep lesson ideas, reminders, and moments worth remembering.");
  }
  function settings() {
    return header("Settings", "Make yourself at home.") + `<div class="workspace"><div class="settings">${profileForm()}<h2>Account</h2><p class="help">${cloud ? esc(user?.email || "Sign in to your teacher account.") : "Local preview mode. To sync across devices, follow README.md and configure Supabase in js/config.js."}</p><div class="settings-actions"><button class="secondary" data-action="account">${cloud && user ? "Sign Out" : "Sign In / Create Account"}</button>${cloud && user ? '<button class="secondary" data-action="password">Change Password</button>' : ""}<button class="secondary" data-action="install">Install Teacher Desk</button></div><h2>Pinned website order</h2><p class="help">Starred websites come first on Home and in shortcut mode. Use the arrows to arrange them.</p>${[...state.favorites].sort(byPosition).map((f, i) => {
      const w = state.websites.find((w2) => w2.id === f.id);
      return w ? `<div class="order-row"><span>${esc(w.name)}</span><button class="icon-button" data-action="favorite-up" data-id="${f.id}" ${i === 0 ? "disabled" : ""} aria-label="Move ${esc(w.name)} up">${icon("up")}</button><button class="icon-button" data-action="favorite-down" data-id="${f.id}" ${i === state.favorites.length - 1 ? "disabled" : ""} aria-label="Move ${esc(w.name)} down">${icon("down")}</button></div>` : "";
    }).join("") || '<p class="help">Star websites to arrange them here.</p>'}<h2>Category colors</h2><p class="help">Choose a category to change its name or color.</p><div class="filters">${state.categories.map((c) => `<button class="pill" data-action="edit-category" data-id="${c.id}">${esc(c.name)}</button>`).join("")}</div></div></div>`;
  }
  function modeDock() {
    return '<div class="mode-dock"><span class="mode-caption">' + (mode === "shortcuts" ? "Shortcut mode" : "Full desk") + '</span><button type="button" role="switch" aria-label="Switch between Full desk and Shortcut mode" aria-checked="' + (mode === "shortcuts") + '" class="mode-switch" data-action="switch-mode"><span></span></button><span class="mode-hint">' + (mode === "shortcuts" ? "Switch to full desk" : "Switch to shortcuts") + "</span></div>";
  }
  function bindSearch() {
    const search = $("#search");
    if (search) search.oninput = () => {
      query = search.value;
      refreshSites();
      refreshNotes();
    };
  }
  function refreshSites() {
    const el = $("#site-grid");
    if (el) {
      el.innerHTML = siteGrid();
      hydrate(el);
    }
  }
  function refreshTasks() {
    const el = $(".task-panel");
    if (!el) return;
    const height = el.getBoundingClientRect().height;
    const temp = document.createElement("div");
    temp.innerHTML = tasks();
    el.style.minHeight = height + "px";
    el.innerHTML = temp.firstElementChild.innerHTML;
  }
  function refreshNotes() {
    const el = $("#note-grid");
    if (el) el.innerHTML = noteGrid();
  }
  function refreshCategories() {
    if (page !== "categories") return;
    const temp = document.createElement("div");
    temp.innerHTML = categories();
    $("#content .list").innerHTML = temp.querySelector(".list").innerHTML;
  }
  function refreshShortcuts() {
    const el = $(".quick-grid");
    if (!el) return;
    const temp = document.createElement("div");
    temp.innerHTML = quick();
    el.innerHTML = temp.querySelector(".quick-grid").innerHTML;
    hydrate(el);
  }
  function render() {
    const guest = cloud && !user;
    document.body.classList.toggle('td-guest', guest);
    document.body.classList.remove('td-loading');
    const welcome = $('#landing'); if (welcome) welcome.hidden = !guest;
    if (guest) { document.body.classList.remove('shortcut-mode'); $('#mode-dock').hidden = true; $('#content').replaceChildren(); menu(false); return; }
    connection();
    document.body.classList.toggle("shortcut-mode", mode === "shortcuts" && (!cloud || Boolean(user)));
    $("#mode-dock").innerHTML = modeDock();
    $("#mode-dock").hidden = cloud && !user;
    $("#nav").innerHTML = nav.map(([p, n]) => '<button class="nav-button ' + (page === p ? "active" : "") + '" data-nav="' + p + '" ' + (page === p ? 'aria-current="page"' : "") + ">" + icon(p) + n + "</button>").join("");
    $("#bottom-nav").innerHTML = nav.filter(([p]) => ["home", "websites", "notes", "settings"].includes(p)).map(([p, n]) => '<button class="' + (page === p ? "active" : "") + '" data-nav="' + p + '" ' + (page === p ? 'aria-current="page"' : "") + ">" + icon(p) + n.replace("My ", "") + "</button>").join("");
    $("#profile-name").textContent = currentName();
    $("#avatar").textContent = currentName().charAt(0).toUpperCase() || "T";
    $("#account").innerHTML = icon("logout") + (cloud && user ? "Sign Out" : "Sign In");
    if (mode === "shortcuts") {
      $("#content").innerHTML = '<section class="launcher"><header class="launcher-header"><img src="assets/logo.png" alt="" width="76" height="76"><div><h1>My Websites</h1><p>Your teaching tools, one click away.</p></div></header><div class="grid launcher-grid" id="site-grid">' + siteGrid() + "</div></section>";
      hydrate();
      return;
    }
    if (page === "home" || page === "websites") {
      const home = page === "home", prefs = state.preferences[0] || {};
      if (home) {
        $("#content").innerHTML = hero() + `<div class="workspace home-workspace"><div class="home-board"><div class="home-main"><section class="home-card-container home-strip-section"><div class="section-heading"><h2>My Websites</h2><button class="primary" data-action="add-site">${icon("plus")}Add Website</button></div><div class="scroll-row websites-scroll" id="site-grid" tabindex="0" role="region" aria-label="My Websites, scroll left or right">${siteGrid()}</div></section>${prefs.showShortcuts !== false ? `<div class="home-card-container home-shortcuts-container">${quick()}</div>` : ""}</div><aside class="home-side"><section class="home-category-container"><div class="section-heading"><h2>Categories</h2></div>${filters()}</section>${prefs.showTasks !== false ? tasks() : ""}</aside></div></div>`;
      } else {
        $("#content").innerHTML = header("My Websites", "Every classroom, tool, and project in one place.") + '<div class="workspace">' + searchBar() + '<div class="section-heading"><div class="right">' + filters() + '<button class="primary" data-action="add-site">' + icon("plus") + 'Add Website</button></div></div><div class="grid" id="site-grid">' + siteGrid() + '</div></div>';
      }
    } else if (page === "categories") $("#content").innerHTML = categories();
    else if (page === "notes") $("#content").innerHTML = header("Notes", "Small thoughts. Big ideas. All kept here.", "add-note", "New Note") + '<div class="workspace">' + searchBar() + '<div class="note-grid" id="note-grid">' + noteGrid() + "</div></div>";
    else if (page === "settings") {
      $("#content").innerHTML = settings();
      bindProfile(render);
    }
    bindSearch();
    hydrate();
  }
  function navigate(p) {
    page = p;
    query = "";
    category = "all";
    menu(false);
    if (location.hash !== "#" + p) history.pushState(null, "", "#" + p);
    render();
    window.scrollTo({ top: 0 });
  }
  window.addEventListener("popstate", () => {
    page = nav.some(([p]) => p === location.hash.slice(1)) ? location.hash.slice(1) : "home";
    query = "";
    category = "all";
    render();
  });
  async function reorder(table, rowId, direction) {
    const rows = [...state[table]].sort(byPosition), i = rows.findIndex((x) => x.id === rowId), other = rows[i + direction];
    if (!other) return;
    [rows[i], rows[i + direction]] = [rows[i + direction], rows[i]];
    await reorderRows(table, rows.map((r, position) => ({ ...r, position })));
    if (table === "shortcuts") refreshShortcuts();
    else render();
  }
  function manageShortcut(s) {
    modal(s.name, `<div class="menu-actions"><button data-short="edit">Edit shortcut</button><button data-short="up">Move earlier</button><button data-short="down">Move later</button><button data-short="delete" class="danger">Remove shortcut</button></div>`, { setup: (root) => root.querySelectorAll("[data-short]").forEach((b) => b.onclick = async () => {
      if (b.disabled) return;
      b.disabled = true;
      try {
        if (b.dataset.short === "edit") linkEditor("shortcuts", s, refreshShortcuts);
        if (b.dataset.short === "delete") deleteItem("shortcuts", s, refreshShortcuts);
        if (["up", "down"].includes(b.dataset.short)) {
          await reorder("shortcuts", s.id, b.dataset.short === "up" ? -1 : 1);
          toast("Shortcut order updated.");
        }
      } catch (e) {
        toast(e.message, "error");
      } finally {
        b.disabled = false;
      }
    }) });
  }
  async function account() {
    if (cloud && user) confirm("Sign Out?", "Your cloud workspace will be available when you sign back in.", async () => {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      setUser(null);
      await load();
      render();
      toast("Signed out.", {type:"success"});
    });
    else authDialog(render);
  }
  $("#account").onclick = account;
  document.querySelectorAll('[data-welcome-auth]').forEach(button => {
    button.addEventListener('click', () => authDialog(render, button.dataset.welcomeAuth));
  });

// Smoothly switch between Full Desk and Shortcut Mode without changing the
// layout, saved preference, or the fixed welcome banner. View Transitions
// animate viewport snapshots; the opacity-only fallback leaves fixed elements fixed.
let teacherDeskModeIsAnimating = false;
function animateDeskModeSwitch() {
  if (teacherDeskModeIsAnimating) return;
  teacherDeskModeIsAnimating = true;
  const nextMode = mode === 'full' ? 'shortcuts' : 'full';
  const html = document.documentElement;
  const directionClass = nextMode === 'shortcuts' ? 'td-to-shortcuts' : 'td-to-full';
  html.classList.add(directionClass);
  const finish = () => {
    html.classList.remove('td-to-shortcuts', 'td-to-full', 'td-mode-exit', 'td-mode-enter');
    teacherDeskModeIsAnimating = false;
  };
  const changeView = () => {
    mode = nextMode;
    try {
      localStorage.setItem('teacherdesk-mode-v1', mode);
    } catch {
      toast('Mode changed for this visit. Browser storage is unavailable.');
    }
    query = '';
    category = 'all';
    render();
    window.scrollTo(0, 0);
  };
  // Prefer no animation when the user has requested reduced motion.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    changeView();
    finish();
    return;
  }
  if (typeof document.startViewTransition === 'function') {
    try {
      const transition = document.startViewTransition(changeView);
      transition.finished.then(finish, finish);
      return;
    } catch { /* The opacity fallback below also works on older browsers. */ }
  }
  html.classList.add('td-mode-exit');
  window.setTimeout(() => {
    changeView();
    html.classList.remove('td-mode-exit');
    html.classList.add('td-mode-enter');
    window.setTimeout(finish, 340);
  }, 135);
}

  document.addEventListener("click", async (e) => {
    const navButton = e.target.closest("[data-nav]");
    if (navButton) {
      navigate(navButton.dataset.nav);
      return;
    }
    const filter = e.target.closest("[data-category]");
    if (filter) {
      category = filter.dataset.category;
      render();
      return;
    }
    const openCat = e.target.closest("[data-open-category]");
    if (openCat) {
      navigate("websites");
      category = openCat.dataset.openCategory;
      render();
      return;
    }
    const tf = e.target.closest("[data-task-filter]");
    if (tf) {
      taskFilter = tf.dataset.taskFilter;
      refreshTasks();
      return;
    }
    const launch = e.target.closest("[data-launch]");
    if (launch) return;
    const b = e.target.closest("[data-action]");
    if (!b || b.disabled) return;
    const a = b.dataset.action, rid = b.dataset.id;
    const w = state.websites.find((x) => x.id === rid), c = state.categories.find((x) => x.id === rid), t = state.tasks.find((x) => x.id === rid), n = state.notes.find((x) => x.id === rid), r = state.resources.find((x) => x.id === rid);
    b.disabled = true;
    try {
      if (a === "switch-mode") {
        animateDeskModeSwitch();
      } else if (a === "add-site" || a === "edit-site") websiteEditor(w, refreshSites);
      else if (a === "manage-site") manageWebsite(w, refreshSites);
      else if (a === "favorite") {
        await toggleFavorite(rid);
        refreshSites();
      } else if (a === "add-category" || a === "edit-category") categoryEditor(c, refreshCategories);
      else if (a === "delete-category") deleteCategory(c, refreshCategories);
      else if (a === "add-task" || a === "edit-task") taskEditor(t, refreshTasks);
      else if (a === "delete-task") deleteItem("tasks", t, refreshTasks);
      else if (a === "add-note" || a === "edit-note") noteEditor(n, refreshNotes);
      else if (a === "pin-note") {
        await save("notes", { ...n, pinned: !n.pinned });
        refreshNotes();
      } else if (a === "delete-note") deleteItem("notes", n, refreshNotes);
      else if (a === "add-shortcut") linkEditor("shortcuts", null, refreshShortcuts);
      else if (a === "manage-shortcut") manageShortcut(state.shortcuts.find((s) => s.id === rid));
      else if (a === "favorite-up" || a === "favorite-down") await reorder("favorites", rid, a.endsWith("up") ? -1 : 1);
      else if (a === "account") await account();
      else if (a === "password") passwordDialog();
      else if (a === "install") install();
    } catch (error) {
      toast(error.message || "Something went wrong. Try again.", "error");
    } finally {
      b.disabled = false;
    }
  });
  document.addEventListener("change", async (e) => {
    if (e.target.matches("[data-task]")) {
      const b = e.target, t = state.tasks.find((t2) => t2.id === b.dataset.task);
      b.disabled = true;
      try {
        await save("tasks", { ...t, done: b.checked });
        refreshTasks();
      } catch (err) {
        b.checked = t.done;
        toast(err.message, "error");
      } finally {
        b.disabled = false;
      }
    }
  });
  var deferredInstall;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstall = e;
  });
  function install() {
    if (deferredInstall) {
      deferredInstall.prompt();
      deferredInstall.userChoice.finally(() => deferredInstall = null);
    } else modal("Install Teacher Desk", '<p>On iPhone or iPad, open this site in Safari, tap Share, then Add to Home Screen.</p><p class="help">On Android or desktop, use your browser\u2019s Install app / Add to Home screen menu when available. Installation requires HTTPS (or localhost). If already installed, open Teacher Desk from your apps.</p>');
  }
  $("#install").onclick = install;
  window.addEventListener("online", async () => {
    connection();
    if (cloud && user) try {
      await load();
      render();
    } catch (e) {
      toast(e.message, "error");
    }
  });
  window.addEventListener("offline", connection);
  var refreshing = false;
  async function sync() {
    if (!ready || !cloud || !user || !navigator.onLine || document.hidden || $("#modal").open || refreshing) return;
    refreshing = true;
    try {
      const before = JSON.stringify(state);
      await load();
      if (before !== JSON.stringify(state)) {
        refreshSites();
        refreshTasks();
        refreshNotes();
        refreshCategories();
        refreshShortcuts();
      }
    } catch (e) {
      toast("Could not refresh your desk: " + e.message, "error");
    } finally {
      refreshing = false;
    }
  }
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) sync();
  });
  setInterval(sync, 3e4);
  async function boot() {
    try {
      await withProgress("Opening your desk\u2026", () => init());
      ready = true;
      render();
      if (cloud) {
        client.auth.onAuthStateChange((event, session) => {
          const changed = user?.id !== session?.user?.id;
          setUser(session?.user);
          if (changed) setTimeout(async () => {
            try {
              await load();
              render();
            } catch (e) {
              toast(e.message, "error");
            }
          }, 0);
          if (event === "PASSWORD_RECOVERY") setTimeout(passwordDialog, 0);
        });
      }
    } catch (e) {
      document.body.classList.remove('td-loading', 'td-guest');
      $('#landing').hidden = true;
      $("#content").innerHTML = header("Your desk couldn\u2019t open", "Check your connection and Supabase configuration.") + `<div class="workspace"><p class="error">${esc(e.message)}</p><button class="primary" id="retry">Try Again</button></div>`;
      $("#retry").onclick = () => location.reload();
    }
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      try {
        const hadController = Boolean(navigator.serviceWorker.controller);
        const reg = await navigator.serviceWorker.register("./service-worker.js");
        const update = () => {
          if (reg.waiting && !document.querySelector("dialog").open) modal("A fresh desk is ready", "<p>A new version of Teacher Desk is available. Reload to update the app.</p>", { label: "Update Now", submit: async () => {
            reg.waiting.postMessage({ type: "SKIP_WAITING" });
          } });
        };
        reg.addEventListener("updatefound", () => {
          reg.installing?.addEventListener("statechange", () => {
            if (reg.waiting && navigator.serviceWorker.controller) update();
          });
        });
        if (reg.waiting) update();
        let reload = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (hadController && !reload) {
            reload = true;
            location.reload();
          }
        });
      } catch (e) {
        console.warn("Offline shell unavailable:", e.message);
      }
    }
  }
  boot();
})();
