/* nekoOS 端末専用ページ: ?d=<codename> を読み、device.json からその端末だけを描画する。
   導入前の注意だけは全体共通なので site.json の notes を使う。
   device.json が読めなければ静的 HTML (Pixel 2 XL) のまま。codename が無い/一致しなければ notfound を出す。 */
(function () {
"use strict";
function el(id) { return document.getElementById(id); }

function render(d) {
  el("d-eyebrow").textContent = d.name + " / " + d.codename;
  el("d-version").textContent = d.version;
  el("d-lead").textContent = d.lead || "";
  var badges = el("d-badges");
  badges.innerHTML = "";
  (d.badges || []).forEach(function (b) {
    var s = document.createElement("span");
    s.className = "badge";
    s.textContent = b;
    badges.appendChild(s);
  });
  el("d-phone-version").textContent = d.version;
  el("d-spec-name").textContent = d.name;
  el("d-spec-code").textContent = d.codename;
  el("d-spec-base").textContent = d.base;
  el("d-spec-theme").textContent = d.theme;
  el("d-about").textContent = d.about || "";
  var inst = el("d-installer");
  if (d.installer && d.installer.url) {
    inst.href = d.installer.url;
    if (d.installer.label) inst.textContent = d.installer.label;
    inst.hidden = false;
  } else {
    inst.hidden = true;
  }
  var dl = d.download || null;
  var btn = el("dl-btn");
  if (dl && dl.file) {
    el("dl-file").textContent = dl.file;
    el("dl-meta").textContent = "サイズ: " + (dl.size || "—") + " / 対象: " + d.name + " (" + d.codename + ")";
    el("dl-hash").textContent = dl.sha256 || "—";
    if (dl.url) {
      btn.href = dl.url;
      btn.removeAttribute("aria-disabled");
    } else {
      btn.href = "#";
      btn.setAttribute("aria-disabled", "true");
    }
  } else {
    el("dl-file").textContent = "公開ダウンロードはまだありません";
    el("dl-meta").textContent = "ベータ／個人ビルドです。公開ダウンロードの準備ができたら、ここに案内を掲載します。";
    el("dl-hash").textContent = "—";
    btn.href = "#";
    btn.setAttribute("aria-disabled", "true");
  }
  var tl = el("d-changelog");
  tl.innerHTML = "";
  (d.changelog || []).forEach(function (c) {
    var art = document.createElement("article");
    art.className = "card entry";
    var date = document.createElement("div");
    date.className = "date";
    date.textContent = c.date;
    var body = document.createElement("div");
    var h3 = document.createElement("h3");
    h3.textContent = c.title;
    var p = document.createElement("p");
    p.textContent = c.body;
    body.appendChild(h3);
    body.appendChild(p);
    art.appendChild(date);
    art.appendChild(body);
    tl.appendChild(art);
  });
  document.title = "nekoOS " + d.version + " — " + d.name + " (" + d.codename + ")";
}

function notFound() {
  el("d-notfound").hidden = false;
  el("d-main").hidden = true;
  document.title = "nekoOS — 端末が見つかりません";
}

var code = new URLSearchParams(location.search).get("d");

fetch("device.json", { cache: "no-store" })
  .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(function (data) {
    var devices = (data && data.devices) || [];
    if (!devices.length) return;
    if (!code) { notFound(); return; }
    var found = null;
    devices.forEach(function (d) {
      if (d.codename === code || d.id === code) found = d;
    });
    if (!found) { notFound(); return; }
    render(found);
  })
  .catch(function () { /* 読めなければ静的表示のまま */ });

/* 導入前の注意 (全体共通) */
fetch("site.json", { cache: "no-store" })
  .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(function (site) {
    if (!site.notes || !site.notes.length) return;
    var grid = el("d-notes");
    grid.innerHTML = "";
    site.notes.forEach(function (n) {
      var art = document.createElement("article");
      art.className = "card";
      var h3 = document.createElement("h3");
      h3.textContent = n.title || "";
      var p = document.createElement("p");
      p.textContent = n.body || "";
      art.appendChild(h3);
      art.appendChild(p);
      grid.appendChild(art);
    });
  })
  .catch(function () { /* 読めなければ静的表示のまま */ });
})();
