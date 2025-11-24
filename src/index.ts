import B4MFunnel, { WidgetMountOptions } from "./core/B4MFunnel";

type MountTarget = string | HTMLElement;

type PublicMount = (target: MountTarget, options: WidgetMountOptions) => void;

declare global {
  interface Window {
    B4MFunnel?: {
      mount: PublicMount;
      unmount: () => void;
    };
  }
}

const widgetSingleton = new B4MFunnel();

const isDomAvailable = typeof document !== "undefined";

const isLoaderScript = (script: HTMLScriptElement | null) => {
  if (!script) {
    return false;
  }
  const src = script.getAttribute("src") ?? "";
  return /baseformusic-widget\.umd\.js(?:\?.*)?$/.test(src);
};

const findLoaderScript = () => {
  if (!isDomAvailable) {
    return null;
  }

  const current = document.currentScript as HTMLScriptElement | null;
  if (isLoaderScript(current)) {
    return current;
  }

  const scripts = Array.from(
    document.getElementsByTagName("script")
  ) as HTMLScriptElement[];
  return scripts.find(isLoaderScript) ?? null;
};

const loaderScript = findLoaderScript();

const normalizeParam = (value: string | null | undefined) => {
  if (value == null) {
    return undefined;
  }
  return value.trim().replace(/^['"]|['"]$/g, "");
};

const normalizeSidebar = (
  value: string | null | undefined
): "horizontal" | "vertical" | undefined => {
  const v = normalizeParam(value);
  if (!v) return undefined;
  const lc = v.toLowerCase();
  return lc === "horizontal" || lc === "vertical" ? (lc as any) : undefined;
};

type ScriptConfig = Partial<WidgetMountOptions> & {
  partnerId?: string;
  targetId?: string;
  email?: string;
};

const parseScriptConfig = (script: HTMLScriptElement | null): ScriptConfig => {
  if (!script || !isDomAvailable) {
    return {};
  }

  let params: URLSearchParams | undefined;

  try {
    const base =
      document.baseURI ??
      (typeof window !== "undefined" ? window.location.href : undefined);
    if (base) {
      params = new URL(script.src, base).searchParams;
    }
  } catch {
    params = undefined;
  }

  const dataset = script.dataset;

  const partnerId = normalizeParam(
    params?.get("partnerId") ?? dataset.partnerId
  );
  const locale = normalizeParam(params?.get("locale") ?? dataset.locale);
  const srcBase = normalizeParam(params?.get("srcBase") ?? dataset.srcBase);
  const allow = normalizeParam(params?.get("allow") ?? dataset.allow);
  const minHeight = normalizeParam(
    params?.get("minHeight") ?? params?.get("min-height") ?? dataset.minHeight
  );
  const email = normalizeParam(
    params?.get("email") ?? dataset.email ?? dataset.b4mEmail
  );
  const sidebar = normalizeSidebar(
    params?.get("sidebar") ??
      dataset.sidebar ??
      (dataset as Record<string, string | undefined>)["b4mSidebar"] ??
      (dataset as Record<string, string | undefined>)["b4m-sidebar"]
  );
  const targetId = normalizeParam(
    params?.get("targetId") ??
      params?.get("target") ??
      params?.get("container") ??
      dataset.targetId ??
      dataset.target ??
      dataset.container
  );

  return {
    partnerId: partnerId ?? undefined,
    locale: locale ?? undefined,
    srcBase: srcBase ?? undefined,
    allow: allow ?? undefined,
    minHeight: minHeight ?? undefined,
    email: email ?? undefined,
    sidebar: sidebar ?? undefined,
    targetId: targetId ?? undefined,
  };
};

const scriptConfig = parseScriptConfig(loaderScript);

const ensureMountContainer = (
  script: HTMLScriptElement | null,
  preferredId?: string
) => {
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

  if (script?.parentNode) {
    script.parentNode.insertBefore(container, script.nextSibling);
  } else if (document.body) {
    document.body.appendChild(container);
  } else {
    document.documentElement.appendChild(container);
  }

  return container;
};

export const mount: PublicMount = (target, options) => {
  widgetSingleton.mount(target, options);
};

export const unmount = () => {
  widgetSingleton.unmount();
};

export const autoInit = () => {
  if (typeof document === "undefined") {
    return;
  }

  let target =
    document.getElementById("b4m-widget-funnel") ??
    document.querySelector<HTMLElement>("[data-b4m-widget-funnel]") ??
    document.getElementById("base-for-music-widget") ??
    document.querySelector<HTMLElement>("[data-base-for-music-widget]");

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
    target.dataset.partnerId ??
    target.getAttribute("data-partner-id") ??
    scriptConfig.partnerId ??
    undefined;
  if (!partnerId) {
    return;
  }

  const locale =
    target.dataset.locale ??
    target.getAttribute("data-locale") ??
    scriptConfig.locale ??
    undefined;
  const srcBase =
    target.dataset.srcBase ??
    target.getAttribute("data-src-base") ??
    scriptConfig.srcBase ??
    undefined;
  const allow =
    target.dataset.allow ??
    target.getAttribute("data-allow") ??
    scriptConfig.allow ??
    undefined;
  const minHeight =
    target.dataset.minHeight ??
    target.getAttribute("data-min-height") ??
    scriptConfig.minHeight ??
    undefined;
  const email =
    target.dataset.email ??
    target.getAttribute("data-email") ??
    scriptConfig.email ??
    undefined;
  const sidebar =
    normalizeSidebar((target as HTMLElement).dataset.sidebar) ??
    normalizeSidebar(target.getAttribute("data-sidebar")) ??
    normalizeSidebar(target.getAttribute("data-b4m-sidebar")) ??
    scriptConfig.sidebar ??
    undefined;

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

const immediateInit = () => {
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

export { B4MFunnel };
export default widgetSingleton;
