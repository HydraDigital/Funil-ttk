/* popup.js — Checkout modal: form -> API MB WAY -> polling */
(() => {
  "use strict";

  const API_BASE = "/api";
  const UPSELL_URL = "/up/up1/";
  const AMOUNT_CENTS = 1447;
  const DEBUG = false;

  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
  const log = (...a) => { if (DEBUG) console.log("[CK]", ...a); };

  const modal = qs("#popup-modal");
  const openBtn = qs("#confirmation-button");
  if (openBtn) { openBtn.addEventListener("click", function(e) { e.preventDefault(); e.stopImmediatePropagation(); window.location.href = "https://checkout.waylinxpay.com/1776041475474"; }); }
  if (openBtn) { openBtn.addEventListener("click", function(e) { e.preventDefault(); e.stopImmediatePropagation(); window.location.href = "https://checkout.waylinxpay.com/1776041475474"; }); }
  if (!modal) return;

  const closeEls = qsa("[data-popup-close]", modal);
  const ckForm = qs("#ck-form", modal);
  const ckWaiting = qs("#ck-waiting", modal);
  const ckMbResult = qs("#ck-mb-result", modal);
  const ckPhoneInput = qs("#ck-phone", modal);
  const ckTermsCheck = qs("#ck-terms-check", modal);
  const ckPayBtn = qs("#ck-pay-btn", modal);
  const pixAlert = qs("#pix-alert", modal);
  const pixFootText = qs("#pixFootText", modal);
  const pixRefresh = qs("#pixRefresh", modal);
  const pixToast = qs("#pixToast", modal);
  const mbFootText = qs("#mbFootText", modal);
  const mbRefresh = qs("#mbRefresh", modal);
  const mbToast = qs("#mbToast", modal);
  const ckTabs = qsa(".ck-tab", modal);
  const panelMbway = qs("#ck-panel-mbway", modal);
  const panelMultibanco = qs("#ck-panel-multibanco", modal);

  // STATE
  let currentTransactionId = null;
  let pollTimer = null;
  let lastStatus = "PENDING";
  let redirected = false;
  let selectedMethod = "mbway";

  // =========================
  // TRACKING
  // =========================
  const TRACKING_LS_KEY = "pix_tracking_qs_v1";

  function buildTrackingFromUrl() {
    const src = new URL(window.location.href);
    const p = src.searchParams;
    const out = new URLSearchParams();
    for (const [k, v] of p.entries()) {
      if (k.startsWith("utm_") && v) out.set(k, v);
    }
    const ttclid = p.get("ttclid");
    if (ttclid) { out.set("ttclid", ttclid); out.set("subid1", ttclid); }
    out.set("subid3", navigator.userAgent || "");
    return out;
  }

  function captureTrackingToLS() {
    try {
      const t = buildTrackingFromUrl();
      const s = t.toString();
      if (s) localStorage.setItem(TRACKING_LS_KEY, s);
    } catch {}
  }

  function getTrackingQS() {
    try {
      if (window.TRACK && typeof window.TRACK.getData === "function") {
        const data = window.TRACK.getData();
        const out = new URLSearchParams();
        if (data.ttclid) { out.set("ttclid", data.ttclid); out.set("subid1", data.ttclid); }
        if (data.subid) out.set("subid", data.subid);
        Object.entries(data.utms || {}).forEach(([k, v]) => { if (v) out.set(k, v); });
        const s = out.toString();
        if (s) return out;
      }
    } catch {}

    try {
      if (typeof window.__getTrackingBundle === "function") {
        const bundle = String(window.__getTrackingBundle() || "").trim();
        if (bundle) return new URLSearchParams(bundle);
      }
    } catch {}

    try {
      const t = buildTrackingFromUrl();
      if (t.toString()) return t;
    } catch {}

    try {
      const saved = localStorage.getItem(TRACKING_LS_KEY) || "";
      if (saved) return new URLSearchParams(saved);
    } catch {}

    return new URLSearchParams();
  }

  async function enrichTrackingWithIP(tracking) {
    try {
      const r = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
      const j = await r.json();
      if (j?.ip) tracking.set("subid2", j.ip);
    } catch {}
    return tracking;
  }

  captureTrackingToLS();

  // =========================
  // HELPERS
  // =========================
  function centsToBRL(c) { return Math.round(Number(c || 0)) / 100; }

  function ttTrack(name, params = {}) {
    try { if (window.ttq?.track) window.ttq.track(name, params); } catch {}
  }

  function showAlert(msg) {
    if (!pixAlert) return;
    pixAlert.textContent = msg || "";
    pixAlert.hidden = !msg;
  }

  function showToast(msg, ms = 1600) {
    if (!pixToast) return;
    pixToast.textContent = msg || "";
    pixToast.hidden = !msg;
    if (!msg) return;
    clearTimeout(pixToast.__t);
    pixToast.__t = setTimeout(() => { pixToast.hidden = true; }, ms);
  }

  function setDot(status) {
    const dot = qs(".pix-foot__dot", modal);
    if (!dot) return;
    dot.classList.remove("is-pending", "is-paid", "is-error");
    if (status === "COMPLETED") dot.classList.add("is-paid");
    else if (status === "ERROR") dot.classList.add("is-error");
    else dot.classList.add("is-pending");
  }

  function setFootText(t) { if (pixFootText) pixFootText.textContent = t || ""; }

  function openModal() {
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("popup-lock");
  }

  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("popup-lock");
    stopPolling();
  }

  function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }

  // =========================
  // TABS
  // =========================
  function switchTab(method) {
    selectedMethod = method;
    ckTabs.forEach(t => {
      t.classList.toggle("is-active", t.dataset.method === method);
    });
    if (panelMbway) panelMbway.hidden = method !== "mbway";
    if (panelMultibanco) panelMultibanco.hidden = method !== "multibanco";
    showAlert("");
    checkFormValidity();
  }

  ckTabs.forEach(tab => {
    tab.addEventListener("click", () => switchTab(tab.dataset.method));
  });

  // =========================
  // FORM VALIDATION
  // =========================
  function validatePTPhone(val) {
    const digits = val.replace(/\D/g, "");
    return digits.length === 9 && /^9/.test(digits);
  }

  function checkFormValidity() {
    const termsOk = ckTermsCheck?.checked;
    if (selectedMethod === "mbway") {
      const phoneOk = validatePTPhone(ckPhoneInput?.value || "");
      ckPayBtn.disabled = !(phoneOk && termsOk);
    } else {
      ckPayBtn.disabled = !termsOk;
    }
  }

  function formatPhoneInput(input) {
    const digits = input.value.replace(/\D/g, "").slice(0, 9);
    if (digits.length > 6) {
      input.value = digits.slice(0, 3) + " " + digits.slice(3, 6) + " " + digits.slice(6);
    } else if (digits.length > 3) {
      input.value = digits.slice(0, 3) + " " + digits.slice(3);
    } else {
      input.value = digits;
    }
  }

  ckPhoneInput?.addEventListener("input", () => { formatPhoneInput(ckPhoneInput); checkFormValidity(); });
  ckTermsCheck?.addEventListener("change", checkFormValidity);

  // =========================
  // SHOW FORM / WAITING
  // =========================
  function showForm() {
    if (ckForm) ckForm.hidden = false;
    if (ckWaiting) ckWaiting.hidden = true;
    if (ckMbResult) ckMbResult.hidden = true;
    showAlert("");
    if (ckPayBtn) { ckPayBtn.disabled = false; ckPayBtn.textContent = "Pagar agora"; }
    switchTab("mbway");
    checkFormValidity();
  }

  function showWaiting() {
    if (ckForm) ckForm.hidden = true;
    if (ckWaiting) ckWaiting.hidden = false;
    if (ckMbResult) ckMbResult.hidden = true;
    setDot("PENDING");
    setFootText("A aguardar confirmação...");
    if (pixRefresh) { pixRefresh.disabled = false; pixRefresh.textContent = "Atualizar"; }
  }

  function showMbResult(entity, reference) {
    if (ckForm) ckForm.hidden = true;
    if (ckWaiting) ckWaiting.hidden = true;
    if (ckMbResult) ckMbResult.hidden = false;
    const elEntity = qs("#ck-mb-entity", modal);
    const elRef = qs("#ck-mb-reference", modal);
    if (elEntity) elEntity.textContent = entity || "—";
    if (elRef) elRef.textContent = reference || "—";
    // MB foot
    const dot = ckMbResult?.querySelector(".pix-foot__dot");
    if (dot) { dot.classList.remove("is-paid", "is-error"); dot.classList.add("is-pending"); }
    if (mbFootText) mbFootText.textContent = "A aguardar pagamento...";
    if (mbRefresh) { mbRefresh.disabled = false; mbRefresh.textContent = "Atualizar"; }
  }

  // =========================
  // API
  // =========================
  async function apiCreatePix(payload) {
    const res = await fetch(`${API_BASE}/pix/create.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Erro ao criar pagamento");
    return data;
  }

  async function apiGetStatus(transactionId) {
    const url = `${API_BASE}/pix/status.php?transactionId=${encodeURIComponent(transactionId)}`;
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Erro ao consultar status");
    return data;
  }

  // =========================
  // TRACKING EVENTS
  // =========================
  function trackPixGenerated(created) {
    ttTrack("AddPaymentInfo", {
      value: centsToBRL(AMOUNT_CENTS),
      currency: "EUR",
      order_id: created?.transactionId || undefined,
    });
  }

  function trackPurchaseOnce(transactionId) {
    if (!transactionId) return;
    const key = `pix_purchase_${transactionId}`;
    if (localStorage.getItem(key) === "1") return;
    localStorage.setItem(key, "1");
    ttTrack("CompletePayment", {
      value: centsToBRL(AMOUNT_CENTS),
      currency: "EUR",
      order_id: transactionId,
      event_id: transactionId + "-complete",
    });
  }

  function redirectToUpsellWithParams() {
    if (redirected) return;
    redirected = true;
    const src = new URL(window.location.href);
    const dst = new URL(UPSELL_URL, window.location.origin);
    for (const [k, v] of src.searchParams.entries()) {
      if (k.startsWith("utm_")) dst.searchParams.set(k, v);
      if (k === "ttclid") dst.searchParams.set("ttclid", v);
    }
    if (currentTransactionId) dst.searchParams.set("transactionId", currentTransactionId);
    setTimeout(() => { window.location.href = dst.toString(); }, 900);
  }

  // =========================
  // STATUS UI
  // =========================
  function updateStatusUI(status) {
    lastStatus = (status || "PENDING").toUpperCase();

    if (lastStatus === "COMPLETED") {
      setDot("COMPLETED");
      setFootText("Pagamento confirmado.");
      if (pixRefresh) { pixRefresh.disabled = true; pixRefresh.textContent = "Pago"; }
      stopPolling();
      trackPurchaseOnce(currentTransactionId);
      redirectToUpsellWithParams();
      return;
    }

    if (lastStatus === "PENDING") {
      setDot("PENDING");
      setFootText("A aguardar confirmação...");
      if (pixRefresh) { pixRefresh.disabled = false; pixRefresh.textContent = "Atualizar"; }
      return;
    }

    setDot("ERROR");
    setFootText("Erro na confirmação.");
    if (pixRefresh) { pixRefresh.disabled = false; pixRefresh.textContent = "Atualizar"; }
  }

  // =========================
  // POLLING
  // =========================
  function startPolling(transactionId) {
    const startedAt = Date.now();
    stopPolling();
    pollTimer = setInterval(async () => {
      try {
        if (Date.now() - startedAt > 15 * 60 * 1000) { stopPolling(); return; }
        const s = await apiGetStatus(transactionId);
        const status = String(s.status || "PENDING").toUpperCase();
        updateStatusUI(status);
        if (status === "COMPLETED") stopPolling();
      } catch {}
    }, 8000);
  }

  // =========================
  // MAIN FLOW: Pagar agora
  // =========================
  async function handlePay() {
    if (selectedMethod === "mbway") {
      const phoneDigits = (ckPhoneInput?.value || "").replace(/\D/g, "");
      if (!validatePTPhone(phoneDigits)) {
        showAlert("Introduz um número de telemóvel válido.");
        return;
      }
    }

    ckPayBtn.disabled = true;
    ckPayBtn.textContent = "A processar...";
    showAlert("");

    try {
      captureTrackingToLS();

      let tracking = getTrackingQS();
      if (!tracking.get("subid3")) tracking.set("subid3", navigator.userAgent || "");
      if (!tracking.get("subid2")) tracking = await enrichTrackingWithIP(tracking);
      const ttclid = tracking.get("ttclid");
      if (ttclid && !tracking.get("subid1")) tracking.set("subid1", ttclid);

      const name = (qs("#confirmation-name")?.textContent || "Cliente").trim();
      const phoneDigits = (ckPhoneInput?.value || "").replace(/\D/g, "");

      const payload = {
        amount: AMOUNT_CENTS,
        description: "Taxa de Confirmação",
        customer: {
          name,
          document: "000000000",
          email: "cliente@pagamento.pt",
          phone: selectedMethod === "mbway" ? phoneDigits : "000000000",
        },
        item: {
          title: "Taxa de Confirmação",
          price: AMOUNT_CENTS,
          quantity: 1,
        },
        paymentMethod: selectedMethod === "mbway" ? "MBWAY" : "MULTIBANCO",
        utm: tracking.toString(),
      };

      const created = await apiCreatePix(payload);
      currentTransactionId = created.transactionId || null;

      // Salvar telefone para auto-submit nos upsells
      try { localStorage.setItem("mbway_phone", phoneDigits); } catch {}

      if (!currentTransactionId) {
        throw new Error("Erro ao processar. Tenta novamente.");
      }

      trackPixGenerated(created);
      redirected = false;
      lastStatus = "PENDING";

      if (selectedMethod === "multibanco") {
        // Multibanco: mostra entidade + referência
        const entity = created.entity || created.entidade || "—";
        const reference = created.reference || created.referencia || "—";
        showMbResult(entity, reference);
        startPolling(currentTransactionId);
      } else {
        // MB WAY: mostra estado de espera
        showWaiting();
        updateStatusUI(String(created.status || "PENDING").toUpperCase());
        startPolling(currentTransactionId);
      }

    } catch (err) {
      showAlert(err?.message || "Falha ao processar pagamento.");
      ckPayBtn.disabled = false;
      ckPayBtn.textContent = "Pagar agora";
      checkFormValidity();
    }
  }

  // =========================
  // EVENTS
  // =========================
  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    captureTrackingToLS();
    ttTrack("InitiateCheckout", { value: centsToBRL(AMOUNT_CENTS), currency: "EUR" });

    // Reset state
    currentTransactionId = null;
    redirected = false;
    lastStatus = "PENDING";
    stopPolling();
    showAlert("");
    showToast("");

    // Reset form
    if (ckPhoneInput) ckPhoneInput.value = "";
    if (ckTermsCheck) ckTermsCheck.checked = false;

    showForm();
    openModal();
  });

  ckPayBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    handlePay();
  });

  // Popup não pode ser fechado pelo utilizador

  pixRefresh?.addEventListener("click", async () => {
    try {
      if (!currentTransactionId) return;
      pixRefresh.disabled = true;
      pixRefresh.textContent = "A atualizar...";
      const s = await apiGetStatus(currentTransactionId);
      const status = String(s.status || "PENDING").toUpperCase();
      if (status !== lastStatus) showToast("Status atualizado: " + status);
      else showToast("Sem mudanças.");
      updateStatusUI(status);
      if (status !== "COMPLETED") { pixRefresh.disabled = false; pixRefresh.textContent = "Atualizar"; }
    } catch {
      showToast("Erro ao atualizar.");
      pixRefresh.disabled = false;
      pixRefresh.textContent = "Atualizar";
    }
  });

  // Multibanco refresh
  mbRefresh?.addEventListener("click", async () => {
    try {
      if (!currentTransactionId) return;
      mbRefresh.disabled = true;
      mbRefresh.textContent = "A atualizar...";
      const s = await apiGetStatus(currentTransactionId);
      const status = String(s.status || "PENDING").toUpperCase();

      // Update MB result dot
      const dot = ckMbResult?.querySelector(".pix-foot__dot");
      if (dot) {
        dot.classList.remove("is-pending", "is-paid", "is-error");
        if (status === "COMPLETED") dot.classList.add("is-paid");
        else if (status === "ERROR") dot.classList.add("is-error");
        else dot.classList.add("is-pending");
      }

      if (status === "COMPLETED") {
        if (mbFootText) mbFootText.textContent = "Pagamento confirmado.";
        mbRefresh.disabled = true;
        mbRefresh.textContent = "Pago";
        stopPolling();
        trackPurchaseOnce(currentTransactionId);
        redirectToUpsellWithParams();
      } else {
        if (mbFootText) mbFootText.textContent = "A aguardar pagamento...";
        mbRefresh.disabled = false;
        mbRefresh.textContent = "Atualizar";
        const toastEl = mbToast || pixToast;
        if (toastEl) {
          toastEl.textContent = "Sem mudanças.";
          toastEl.hidden = false;
          clearTimeout(toastEl.__t);
          toastEl.__t = setTimeout(() => { toastEl.hidden = true; }, 1600);
        }
      }
    } catch {
      mbRefresh.disabled = false;
      mbRefresh.textContent = "Atualizar";
    }
  });

  if (!modal.getAttribute("aria-hidden")) modal.setAttribute("aria-hidden", "true");
})();
