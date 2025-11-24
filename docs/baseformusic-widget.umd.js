"use strict";
var B4MFunnel = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if ((from && typeof from === "object") || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, {
            get: () => from[key],
            enumerable:
              !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
          });
    }
    return to;
  };
  var __toCommonJS = (mod) =>
    __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    B4MFunnel: () => B4MFunnel_default,
    autoInit: () => autoInit,
    default: () => src_default,
    mount: () => mount,
    unmount: () => unmount,
  });

  // src/core/B4MFunnel.ts
  var DEFAULTS = {
    locale: "en",
    srcBase: "https://funnel.baseformusic.com",
    allow:
      "payment *; clipboard-read *; clipboard-write *; fullscreen *; autoplay; encrypted-media",
    minHeight: "900px",
  };
  var SUPPORTED_LOCALES = ["en", "fr", "de", "es", "pt"];
  var DEFAULT_SIDEBAR = "vertical";
  var B4MFunnel = class {
    mount(target, options) {
      var _a, _b, _c, _d;
      if (typeof window === "undefined" || typeof document === "undefined") {
        throw new Error("B4MFunnel: mount must run in a browser environment.");
      }
      this.unmount();
      const minHeight = this.normalizeMinHeight(options.minHeight);
      const merged = {
        partnerId: options.partnerId,
        locale:
          (_a = this.normalizeLocale(options.locale)) != null
            ? _a
            : DEFAULTS.locale,
        srcBase: (_b = options.srcBase) != null ? _b : DEFAULTS.srcBase,
        allow: (_c = options.allow) != null ? _c : DEFAULTS.allow,
        minHeight,
        email: options.email,

        sidebar:
          (_d = this.normalizeSidebar(options.sidebar)) != null
            ? _d
            : DEFAULT_SIDEBAR,
      };
      if (!merged.partnerId) {
        throw new Error("B4MFunnel: partnerId is required.");
      }
      const container = this.resolveTarget(target);
      if (!container) {
        throw new Error("B4MFunnel: target container not found.");
      }
      const containerStyleSnapshot = {
        minHeight: container.style.minHeight,
        width: container.style.width,
        maxWidth: container.style.maxWidth,
        margin: container.style.margin,
      };
      const srcUrl = this.buildSrcUrl(merged.srcBase, {
        partnerId: merged.partnerId,
        locale: merged.locale,
        email: merged.email,

        sidebar: merged.sidebar,
      });
      container.innerHTML = "";
      container.style.minHeight = merged.minHeight;
      container.style.width = "100%";
      container.style.maxWidth = "1440px";
      const iframe = document.createElement("iframe");
      iframe.src = srcUrl.toString();
      iframe.allow = merged.allow;
      iframe.title = "B4M widget";
      iframe.style.width = "100%";
      iframe.style.minHeight = merged.minHeight;
      iframe.setAttribute("loading", "lazy");
      container.appendChild(iframe);
      const origin = `${srcUrl.protocol}//${srcUrl.host}`;
      iframe.onload = () => {
        var _a2;
        (_a2 = iframe.contentWindow) == null
          ? void 0
          : _a2.postMessage({ type: "getHeight" }, origin);
      };
      const widgetState = {
        container,
        iframe,
        origin,
        messageHandler: () => void 0,
        resizeHandler: () => void 0,
        containerStyleSnapshot,
      };
      const messageHandler = (event) => {
        if (event.origin !== origin) {
          return;
        }
        if (event.source !== iframe.contentWindow) {
          return;
        }
        const data = event.data;
        if (!data || typeof data !== "object") {
          return;
        }
        if (data.type === "iframeHeight") {
          const height = this.extractHeight(data);
          if (typeof height === "number" && height > 0) {
            iframe.style.height = `${height}px`;
          }
        }
      };
      const resizeHandler = () => {
        if (widgetState.resizeTimer) {
          clearTimeout(widgetState.resizeTimer);
        }
        widgetState.resizeTimer = window.setTimeout(() => {
          var _a2;
          (_a2 = iframe.contentWindow) == null
            ? void 0
            : _a2.postMessage({ type: "getHeight" }, origin);
          widgetState.resizeTimer = void 0;
        }, 150);
      };
      window.addEventListener("message", messageHandler);
      window.addEventListener("resize", resizeHandler);
      widgetState.messageHandler = messageHandler;
      widgetState.resizeHandler = resizeHandler;
      this.state = widgetState;
    }
    unmount() {
      if (!this.state) {
        return;
      }
      const {
        container,
        iframe,
        messageHandler,
        resizeHandler,
        resizeTimer,
        containerStyleSnapshot,
      } = this.state;
      window.removeEventListener("message", messageHandler);
      window.removeEventListener("resize", resizeHandler);
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      iframe.onload = null;
      iframe.remove();
      container.style.minHeight = containerStyleSnapshot.minHeight;
      container.style.width = containerStyleSnapshot.width;
      container.style.maxWidth = containerStyleSnapshot.maxWidth;
      container.style.margin = containerStyleSnapshot.margin;
      this.state = void 0;
    }
    resolveTarget(target) {
      if (typeof target === "string") {
        return document.querySelector(target);
      }
      if (target instanceof HTMLElement) {
        return target;
      }
      return null;
    }
    buildSrcUrl(base, params) {
      const url = new URL(base);
      url.searchParams.set("partnerId", params.partnerId);
      if (params.locale) {
        url.searchParams.set("locale", params.locale);
      }
      if (params.email) {
        url.searchParams.set("email", params.email);
      }
      if (params.sidebar) {
        url.searchParams.set("sidebar", params.sidebar);
      }
      return url;
    }
    extractHeight(data) {
      if (typeof data.height === "number") {
        return data.height;
      }
      if (
        data.payload &&
        typeof data.payload === "object" &&
        typeof data.payload.height === "number"
      ) {
        return data.payload.height;
      }
      return void 0;
    }
    normalizeMinHeight(value) {
      if (!value) {
        return DEFAULTS.minHeight;
      }
      const trimmed = value.trim();
      if (!trimmed) {
        return DEFAULTS.minHeight;
      }
      if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
        const num = Number(trimmed);
        if (num < 900) {
          return DEFAULTS.minHeight;
        }
        return `${trimmed}px`;
      }
      return trimmed;
    }
    normalizeLocale(value) {
      if (!value) return void 0;
      const lc = value.trim().toLowerCase();
      return SUPPORTED_LOCALES.includes(lc) ? lc : void 0;
    }
    normalizeSidebar(value) {
      if (!value) return void 0;
      const v = value.trim().toLowerCase();
      if (v === "horizontal" || v === "vertical") return v;
      return void 0;
    }
  };
  var B4MFunnel_default = B4MFunnel;

  // src/index.ts
  var widgetSingleton = new B4MFunnel_default();
  var isDomAvailable = typeof document !== "undefined";
  var isLoaderScript = (script) => {
    var _a;
    if (!script) {
      return false;
    }
    const src = (_a = script.getAttribute("src")) != null ? _a : "";
    return /baseformusic-widget\.umd\.js(?:\?.*)?$/.test(src);
  };
  var findLoaderScript = () => {
    var _a;
    if (!isDomAvailable) {
      return null;
    }
    const current = document.currentScript;
    if (isLoaderScript(current)) {
      return current;
    }
    const scripts = Array.from(document.getElementsByTagName("script"));
    return (_a = scripts.find(isLoaderScript)) != null ? _a : null;
  };
  var loaderScript = findLoaderScript();
  var normalizeParam = (value) => {
    if (value == null) {
      return void 0;
    }
    return value.trim().replace(/^['"]|['"]$/g, "");
  };
  var normalizeSidebar = (value) => {
    const v = normalizeParam(value);
    if (!v) return void 0;
    const lc = v.toLowerCase();
    return lc === "horizontal" || lc === "vertical" ? lc : void 0;
  };
  var parseScriptConfig = (script) => {
    var _a,
      _b,
      _c,
      _d,
      _e,
      _f,
      _g,
      _h,
      _i,
      _j,
      _k,
      _l,
      _m,
      _n,
      _o,
      _p,
      _q,
      _r,
      _s,
      _t,
      _u;
    if (!script || !isDomAvailable) {
      return {};
    }
    let params;
    try {
      const base =
        (_a = document.baseURI) != null
          ? _a
          : typeof window !== "undefined"
          ? window.location.href
          : void 0;
      if (base) {
        params = new URL(script.src, base).searchParams;
      }
    } catch {
      params = void 0;
    }
    const dataset = script.dataset;
    const partnerId = normalizeParam(
      (_b = params == null ? void 0 : params.get("partnerId")) != null
        ? _b
        : dataset.partnerId
    );
    const locale = normalizeParam(
      (_c = params == null ? void 0 : params.get("locale")) != null
        ? _c
        : dataset.locale
    );
    const srcBase = normalizeParam(
      (_d = params == null ? void 0 : params.get("srcBase")) != null
        ? _d
        : dataset.srcBase
    );
    const allow = normalizeParam(
      (_e = params == null ? void 0 : params.get("allow")) != null
        ? _e
        : dataset.allow
    );
    const minHeight = normalizeParam(
      (_g =
        (_f = params == null ? void 0 : params.get("minHeight")) != null
          ? _f
          : params == null
          ? void 0
          : params.get("min-height")) != null
        ? _g
        : dataset.minHeight
    );
    const email = normalizeParam(
      (_i =
        (_h = params == null ? void 0 : params.get("email")) != null
          ? _h
          : dataset.email) != null
        ? _i
        : dataset.b4mEmail
    );
    const sidebar = normalizeSidebar(
      (_p =
        (_o =
          (_n = params == null ? void 0 : params.get("sidebar")) != null
            ? _n
            : dataset.sidebar) != null
          ? _o
          : dataset["b4mSidebar"]) != null
        ? _p
        : dataset["b4m-sidebar"]
    );
    const targetId = normalizeParam(
      (_u =
        (_t =
          (_s =
            (_r =
              (_q = params == null ? void 0 : params.get("targetId")) != null
                ? _q
                : params == null
                ? void 0
                : params.get("target")) != null
              ? _r
              : params == null
              ? void 0
              : params.get("container")) != null
            ? _s
            : dataset.targetId) != null
          ? _t
          : dataset.target) != null
        ? _u
        : dataset.container
    );
    return {
      partnerId: partnerId != null ? partnerId : void 0,
      locale: locale != null ? locale : void 0,
      srcBase: srcBase != null ? srcBase : void 0,
      allow: allow != null ? allow : void 0,
      minHeight: minHeight != null ? minHeight : void 0,
      email: email != null ? email : void 0,
      sidebar: sidebar != null ? sidebar : void 0,
      targetId: targetId != null ? targetId : void 0,
    };
  };
  var scriptConfig = parseScriptConfig(loaderScript);
  var ensureMountContainer = (script, preferredId) => {
    if (!isDomAvailable) {
      return null;
    }
    const fallbackId =
      preferredId && preferredId.trim().length > 0
        ? preferredId.trim()
        : "b4m-widget-funnel";
    const existing = document.getElementById(fallbackId);
    if (existing) {
      return existing;
    }
    const container = document.createElement("div");
    container.id = fallbackId;
    if (script == null ? void 0 : script.parentNode) {
      script.parentNode.insertBefore(container, script.nextSibling);
    } else if (document.body) {
      document.body.appendChild(container);
    } else {
      document.documentElement.appendChild(container);
    }
    return container;
  };
  var mount = (target, options) => {
    widgetSingleton.mount(target, options);
  };
  var unmount = () => {
    widgetSingleton.unmount();
  };
  var autoInit = () => {
    var _a,
      _b,
      _c,
      _d,
      _e,
      _f,
      _g,
      _h,
      _i,
      _j,
      _k,
      _l,
      _m,
      _n,
      _o,
      _p,
      _q,
      _r,
      _s,
      _t,
      _u,
      _v,
      _w,
      _x,
      _y,
      _z,
      _A,
      _B,
      _C;
    if (typeof document === "undefined") {
      return;
    }
    let target =
      (_c =
        (_b =
          (_a = document.getElementById("b4m-widget-funnel")) != null
            ? _a
            : document.querySelector("[data-b4m-widget-funnel]")) != null
          ? _b
          : document.getElementById("base-for-music-widget")) != null
        ? _c
        : document.querySelector("[data-base-for-music-widget]");
    if (!target && scriptConfig.targetId) {
      target = document.getElementById(scriptConfig.targetId);
    }
    if (!target && scriptConfig.partnerId) {
      target = ensureMountContainer(loaderScript, scriptConfig.targetId);
    }
    if (!target) {
      return;
    }
    const partnerId =
      (_f =
        (_e =
          (_d = target.dataset.partnerId) != null
            ? _d
            : target.getAttribute("data-partner-id")) != null
          ? _e
          : scriptConfig.partnerId) != null
        ? _f
        : void 0;
    if (!partnerId) {
      return;
    }
    const locale =
      (_i =
        (_h =
          (_g = target.dataset.locale) != null
            ? _g
            : target.getAttribute("data-locale")) != null
          ? _h
          : scriptConfig.locale) != null
        ? _i
        : void 0;
    const srcBase =
      (_l =
        (_k =
          (_j = target.dataset.srcBase) != null
            ? _j
            : target.getAttribute("data-src-base")) != null
          ? _k
          : scriptConfig.srcBase) != null
        ? _l
        : void 0;
    const allow =
      (_o =
        (_n =
          (_m = target.dataset.allow) != null
            ? _m
            : target.getAttribute("data-allow")) != null
          ? _n
          : scriptConfig.allow) != null
        ? _o
        : void 0;
    const minHeight =
      (_r =
        (_q =
          (_p = target.dataset.minHeight) != null
            ? _p
            : target.getAttribute("data-min-height")) != null
          ? _q
          : scriptConfig.minHeight) != null
        ? _r
        : void 0;
    const email =
      (_u =
        (_t =
          (_s = target.dataset.email) != null
            ? _s
            : target.getAttribute("data-email")) != null
          ? _t
          : scriptConfig.email) != null
        ? _u
        : void 0;
    const sidebar =
      (_C =
        (_B =
          (_A =
            (_z = normalizeSidebar(target.dataset.sidebar)) != null
              ? _z
              : normalizeSidebar(target.getAttribute("data-sidebar"))) != null
            ? _A
            : normalizeSidebar(target.getAttribute("data-b4m-sidebar"))) != null
          ? _B
          : scriptConfig.sidebar) != null
        ? _C
        : void 0;
    widgetSingleton.mount(target, {
      partnerId,
      locale,
      srcBase,
      allow,
      minHeight,
      email,
      sidebar,
    });
  };
  var immediateInit = () => {
    if (typeof document === "undefined") {
      return;
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", autoInit, { once: true });
    } else {
      autoInit();
    }
  };
  if (typeof window !== "undefined") {
    window.B4MFunnel = {
      mount,
      unmount,
    };
  }
  immediateInit();
  var src_default = widgetSingleton;
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=baseformusic-widget.umd.js.map
