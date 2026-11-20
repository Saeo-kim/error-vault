// Error Vault: local-first store of software errors.
// Data lives in this browser's localStorage. Use Export to back it up.
(() => {
  "use strict";

  const STORAGE_KEY = "error-vault:entries";

  const $ = (id) => document.getElementById(id);
  const els = {
    form: $("entry-form"),
    id: $("entry-id"),
    title: $("f-title"),
    message: $("f-message"),
    cause: $("f-cause"),
    solution: $("f-solution"),
    tags: $("f-tags"),
    save: $("btn-save"),
    cancel: $("btn-cancel"),
    list: $("list"),
    empty: $("empty"),
    count: $("count"),
    search: $("search"),
    exportBtn: $("btn-export"),
    importInput: $("file-import"),
    toast: $("toast"),
  };

  // ---------- storage ----------
  function loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveEntries(entries) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      return true;
    } catch {
      toast("Could not save. Storage may be full or blocked.");
      return false;
    }
  }

  let entries = loadEntries();

  // ---------- helpers ----------
  const uid = () =>
    (crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

  const parseTags = (s) =>
    [...new Set(s.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))];

  let toastTimer;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (els.toast.hidden = true), 2200);
  }

  // Build elements with textContent so saved text is never run as HTML.
  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.assign(node, props);
    for (const c of children) node.append(c);
    return node;
  }

  function labelled(label, text) {
    return el("p", {}, [el("strong", { textContent: label + ": " }), document.createTextNode(text)]);
  }

  // ---------- rendering ----------
  function render() {
    const q = els.search.value.trim().toLowerCase();
    const shown = entries
      .filter((e) => {
        if (!q) return true;
        const hay = [e.title, e.message, e.cause, e.solution, (e.tags || []).join(" ")].join(" ").toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);

    els.list.replaceChildren(...shown.map(renderItem));
    els.empty.hidden = entries.length > 0;
    els.empty.textContent = entries.length
      ? "No errors match your search."
      : "No errors saved yet. Add your first one above.";
    els.count.textContent = entries.length ? `(${shown.length}/${entries.length})` : "";
  }

  function renderItem(e) {
    const li = el("li", { className: "item" });
    li.append(el("h3", { className: "item-title", textContent: e.title }));

    if (e.message) li.append(el("pre", { textContent: e.message }));
    if (e.cause) li.append(labelled("Cause", e.cause));
    if (e.solution) li.append(labelled("Fix", e.solution));

    if (e.tags && e.tags.length) {
      li.append(el("div", { className: "tags" }, e.tags.map((t) => el("span", { className: "tag", textContent: t }))));
    }

    const actions = el("div", { className: "item-actions" }, [
      el("button", { type: "button", className: "ghost", textContent: "Edit", onclick: () => startEdit(e.id) }),
      el("button", { type: "button", className: "ghost danger", textContent: "Delete", onclick: () => remove(e.id) }),
    ]);
    li.append(actions);
    return li;
  }

  // ---------- actions ----------
  function resetForm() {
    els.form.reset();
    els.id.value = "";
    els.save.textContent = "Save";
    els.cancel.hidden = true;
  }

  function startEdit(id) {
    const e = entries.find((x) => x.id === id);
    if (!e) return;
    els.id.value = e.id;
    els.title.value = e.title;
    els.message.value = e.message || "";
    els.cause.value = e.cause || "";
    els.solution.value = e.solution || "";
    els.tags.value = (e.tags || []).join(", ");
    els.save.textContent = "Update";
    els.cancel.hidden = false;
    els.title.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function remove(id) {
    const e = entries.find((x) => x.id === id);
    if (!e || !confirm(`Delete "${e.title}"?`)) return;
    entries = entries.filter((x) => x.id !== id);
    if (saveEntries(entries)) {
      render();
      toast("Deleted");
    }
  }

  els.form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const title = els.title.value.trim();
    if (!title) return;

    const now = Date.now();
    const data = {
      title,
      message: els.message.value.trim(),
      cause: els.cause.value.trim(),
      solution: els.solution.value.trim(),
      tags: parseTags(els.tags.value),
      updatedAt: now,
    };

    const id = els.id.value;
    if (id) {
      entries = entries.map((x) => (x.id === id ? { ...x, ...data } : x));
    } else {
      entries = [...entries, { id: uid(), createdAt: now, ...data }];
    }

    if (saveEntries(entries)) {
      toast(id ? "Updated" : "Saved");
      resetForm();
      render();
    }
  });

  els.cancel.addEventListener("click", resetForm);
  els.search.addEventListener("input", render);

  els.exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ version: 1, entries }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = el("a", { href: url, download: `error-vault-${new Date().toISOString().slice(0, 10)}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  els.importInput.addEventListener("change", async () => {
    const file = els.importInput.files[0];
    els.importInput.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const incoming = Array.isArray(parsed) ? parsed : parsed.entries;
      if (!Array.isArray(incoming)) throw new Error("bad shape");

      const byId = new Map(entries.map((e) => [e.id, e]));
      let added = 0;
      for (const raw of incoming) {
        if (!raw || typeof raw.title !== "string") continue;
        const e = {
          id: typeof raw.id === "string" ? raw.id : uid(),
          title: raw.title,
          message: raw.message || "",
          cause: raw.cause || "",
          solution: raw.solution || "",
          tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
          createdAt: raw.createdAt || Date.now(),
          updatedAt: raw.updatedAt || Date.now(),
        };
        if (!byId.has(e.id)) added++;
        byId.set(e.id, e);
      }
      entries = [...byId.values()];
      if (saveEntries(entries)) {
        render();
        toast(`Imported ${added} new`);
      }
    } catch {
      toast("That file is not a valid Error Vault export.");
    }
  });

  // ---------- service worker ----------
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

  render();
})();
