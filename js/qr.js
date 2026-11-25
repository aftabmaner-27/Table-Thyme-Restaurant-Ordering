(function () {
  "use strict";
  const app = () => window.TableThyme;
  function qrUrl(tableId) {
    const url = new URL("index.html", location.href);
    url.searchParams.set("table", tableId);
    url.hash = "menu";
    return url.href;
  }
  function renderAll() {
    const nodes = document.querySelectorAll("[data-qr-for]");
    nodes.forEach(node => {
      const tableId = Number(node.dataset.qrFor);
      const target = app()?.getTable(tableId);
      if (!target) return;
      node.innerHTML = "";
      const url = qrUrl(tableId);
      if (window.QRCode) new window.QRCode(node, { text: url, width: Number(node.dataset.qrSize || 106), height: Number(node.dataset.qrSize || 106), colorDark: "#242321", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
      else node.innerHTML = `<span class="qr-fallback">${url}</span>`;
    });
  }
  function printTable(tableId) {
    const table = app()?.getTable(tableId);
    if (!table) return;
    const url = qrUrl(tableId);
    const w = window.open("", "_blank", "width=500,height=600");
    if (!w) { app().render(); return; }
    w.document.write(`<!doctype html><html><head><title>Table ${table.name} QR</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:35px;color:#242321}.box{border:1px solid #eee;border-radius:18px;padding:30px;display:inline-block}h1{font-size:24px}p{color:#777}#qr{margin:25px auto;width:190px;min-height:190px;display:grid;place-items:center}.url{font-size:10px;max-width:300px;overflow-wrap:anywhere;color:#888}@media print{button{display:none}}</style></head><body><div class="box"><div style="color:#ff7a00;font-weight:bold;letter-spacing:2px">TABLE & THYME</div><h1>Scan to order</h1><p>Welcome! Your table is <strong>${table.name}</strong>.</p><div id="qr"></div><p class="url">${url}</p><button onclick="window.print()">Print QR code</button></div></body></html>`);
    w.document.close();
    if (w.QRCode) new w.QRCode(w.document.getElementById("qr"), { text: url, width: 190, height: 190, correctLevel: w.QRCode.CorrectLevel.M });
    else {
      const script = w.document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      script.onload = () => new w.QRCode(w.document.getElementById("qr"), { text: url, width: 190, height: 190 });
      w.document.head.appendChild(script);
    }
  }
  function downloadTable(tableId) {
    const table = app()?.getTable(tableId);
    if (!table) return;
    if (!window.QRCode) return app()?.toast("QR generation library did not load. Check your internet connection.", true);
    const holder = document.createElement("div");
    holder.style.cssText = "position:fixed;left:-10000px;top:0";
    document.body.appendChild(holder);
    new window.QRCode(holder, { text: qrUrl(tableId), width: 400, height: 400, correctLevel: window.QRCode.CorrectLevel.M });
    const canvas = holder.querySelector("canvas");
    const img = holder.querySelector("img");
    const link = document.createElement("a");
    link.download = `table-${table.name}-qr.png`;
    link.href = canvas ? canvas.toDataURL("image/png") : img?.src || "";
    if (link.href) link.click();
    else app()?.toast("Could not create the QR image.", true);
    holder.remove();
  }
  function scan() {
    if (!window.Html5Qrcode) return app()?.toast?.("QR scanner library did not load. Use your camera app to scan a table QR.", true);
    const host = document.createElement("div");
    host.id = "qr-reader";
    const modalRoot = document.getElementById("modal-root");
    modalRoot.innerHTML = `<div class="modal-backdrop" data-backdrop><section class="modal" role="dialog" aria-modal="true"><div class="modal-header"><div><h2>Scan a table QR code</h2></div><button class="close-button" data-scan-close>×</button></div><div id="qr-reader"></div><p class="muted small">Allow camera access to identify your table and open its menu.</p></section></div>`;
    let scanner;
    const close = () => { if (scanner) scanner.stop().catch(console.error); modalRoot.innerHTML = ""; };
    modalRoot.querySelector("[data-scan-close]").onclick = close;
    modalRoot.querySelector("[data-backdrop]").onclick = e => { if (e.target.hasAttribute("data-backdrop")) close(); };
    scanner = new Html5Qrcode("qr-reader");
    scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 220, height: 220 } }, text => {
      try {
        const url = new URL(text);
        const tableId = url.searchParams.get("table");
        if (tableId && app()?.getTable(Number(tableId))) {
          const current = new URL(location.href);
          current.searchParams.set("table", tableId);
          current.hash = "menu";
          close();
          location.href = current.toString();
        } else app()?.toast?.("That QR code is not for a configured restaurant table.", true);
      } catch (error) { app()?.toast?.("Could not read a valid table QR code.", true); }
    }, () => {}).catch(error => { console.error("Could not start QR scanner.", error); app()?.toast?.("Camera access is unavailable. Check your browser permissions.", true); close(); });
  }
  window.RestaurantQR = { renderAll, printTable, downloadTable, scan, qrUrl };
  document.addEventListener("click", event => {
    const btn = event.target.closest("[data-scan-qr]");
    if (btn) scan();
  });
})();
