(() => {
  "use strict";

  if (window.__TRACK_JS__) return;
  window.__TRACK_JS__ = true;

  const STORAGE_KEYS = {
    ttclid: "track_ttclid",
    subid: "track_subid",
    params: "track_params"
  };

  const LINK_SELECTOR = "a.track-utms[href]";
  const INTERNAL_FLAG = "trackUpdating";

  function normalize(value) {
    return String(value || "").trim();
  }

  function safeGetStorage(key) {
    try {
      return localStorage.getItem(key) || "";
    } catch (_) {
      return "";
    }
  }

  function safeSetStorage(key, value) {
    try {
      if (value) localStorage.setItem(key, value);
    } catch (_) {}
  }

  function getCurrentUrl() {
    try {
      return new URL(window.location.href);
    } catch (_) {
      return null;
    }
  }

  function collectParamsFromUrl() {
    const current = getCurrentUrl();
    const data = {
      ttclid: "",
      subid: "",
      allParams: {},
      utms: {}
    };

    if (!current) return data;

    current.searchParams.forEach((value, key) => {
      const v = normalize(value);
      if (!v) return;

      data.allParams[key] = v;

      if (key === "ttclid") data.ttclid = v;
      if (key === "subid") data.subid = v;
      if (key.toLowerCase().startsWith("utm_")) {
        data.utms[key] = v;
      }
    });

    return data;
  }

  function getStoredParamsObject() {
    try {
      const raw = safeGetStorage(STORAGE_KEYS.params);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function buildFullSubid(ttclid) {
    return ttclid || "";
  }

  function persistTrackingData() {
    const fromUrl = collectParamsFromUrl();
    const storedParams = getStoredParamsObject();
    const mergedParams = { ...storedParams, ...fromUrl.allParams };

    const ttclid =
      fromUrl.ttclid ||
      safeGetStorage(STORAGE_KEYS.ttclid) ||
      normalize(mergedParams.ttclid) ||
      "";

    if (ttclid) {
      safeSetStorage(STORAGE_KEYS.ttclid, ttclid);
      mergedParams.ttclid = ttclid;
    }

    const utms = {};
    Object.keys(mergedParams).forEach((key) => {
      const value = normalize(mergedParams[key]);
      if (key.toLowerCase().startsWith("utm_") && value) {
        utms[key] = value;
      }
    });

    const fullSubid = buildFullSubid(ttclid);

    if (fullSubid) {
      safeSetStorage(STORAGE_KEYS.subid, fullSubid);
      mergedParams.subid = fullSubid;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.params, JSON.stringify(mergedParams));
    } catch (_) {}
  }

  function getTrackingData() {
    const fromUrl = collectParamsFromUrl();
    const storedParams = getStoredParamsObject();

    const ttclid =
      fromUrl.ttclid ||
      safeGetStorage(STORAGE_KEYS.ttclid) ||
      normalize(storedParams.ttclid) ||
      "";

    const utms = {};

    Object.keys(storedParams).forEach((key) => {
      const value = normalize(storedParams[key]);
      if (key.toLowerCase().startsWith("utm_") && value) {
        utms[key] = value;
      }
    });

    Object.keys(fromUrl.utms).forEach((key) => {
      const value = normalize(fromUrl.utms[key]);
      if (value) utms[key] = value;
    });

    const subid =
      safeGetStorage(STORAGE_KEYS.subid) ||
      buildFullSubid(ttclid);

    return { ttclid, subid, utms };
  }

  function shouldSkipHref(href) {
    const raw = normalize(href).toLowerCase();
    return (
      !raw ||
      raw === "#" ||
      raw.startsWith("javascript:") ||
      raw.startsWith("mailto:") ||
      raw.startsWith("tel:")
    );
  }

  function buildUrl(destinationHref) {
    const raw = normalize(destinationHref);
    if (shouldSkipHref(raw)) return raw;

    try {
      const target = new URL(raw, window.location.href);
      const data = getTrackingData();

      Object.entries(data.utms).forEach(([key, value]) => {
        if (value && !target.searchParams.has(key)) {
          target.searchParams.set(key, value);
        }
      });

      if (data.ttclid) {
        target.searchParams.set("ttclid", data.ttclid);
      }

      if (data.subid) {
        target.searchParams.set("subid", data.subid);
      }

      return target.toString();
    } catch (_) {
      return raw;
    }
  }

  function markUpdating(link, value) {
    if (!link || !link.dataset) return;
    if (value) link.dataset[INTERNAL_FLAG] = "1";
    else delete link.dataset[INTERNAL_FLAG];
  }

  function isUpdating(link) {
    return !!(link && link.dataset && link.dataset[INTERNAL_FLAG] === "1");
  }

  function updateLink(link) {
    if (!link || typeof link.getAttribute !== "function") return;
    if (isUpdating(link)) return;

    const originalHref =
      normalize(link.getAttribute("data-original-href")) ||
      normalize(link.getAttribute("href"));

    if (shouldSkipHref(originalHref)) return;

    if (!link.hasAttribute("data-original-href")) {
      link.setAttribute("data-original-href", originalHref);
    }

    const trackedHref = buildUrl(originalHref);
    if (!trackedHref) return;

    const currentHref = normalize(link.getAttribute("href"));
    if (currentHref === trackedHref) {
      link.dataset.trackReady = "true";
      return;
    }

    markUpdating(link, true);

    try {
      link.setAttribute("href", trackedHref);
      link.dataset.trackReady = "true";
    } finally {
      setTimeout(() => {
        markUpdating(link, false);
      }, 0);
    }
  }

  function updateAllLinks(root = document) {
    const links = root.querySelectorAll(LINK_SELECTOR);
    links.forEach(updateLink);
  }

  function handleDocumentClick(event) {
    const link = event.target.closest(LINK_SELECTOR);
    if (!link) return;
    updateLink(link);
  }

  function observeDynamicLinks() {
    if (!("MutationObserver" in window)) return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;

            if (node.matches?.(LINK_SELECTOR)) {
              updateLink(node);
            }

            if (node.querySelectorAll) {
              updateAllLinks(node);
            }
          });
        }

        if (
          mutation.type === "attributes" &&
          mutation.target instanceof Element &&
          mutation.target.matches(LINK_SELECTOR)
        ) {
          if (isUpdating(mutation.target)) continue;
          updateLink(mutation.target);
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["href", "data-href", "data-original-href"]
    });
  }

  function init() {
    persistTrackingData();
    updateAllLinks(document);
    document.addEventListener("click", handleDocumentClick, true);
    observeDynamicLinks();
  }

  window.TRACK = {
    persist: persistTrackingData,
    getData: getTrackingData,
    buildUrl,
    updateLink,
    updateAllLinks
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
