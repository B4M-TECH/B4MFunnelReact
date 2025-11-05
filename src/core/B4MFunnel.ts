export interface WidgetMountOptions {
  partnerId: string;
  locale?: string;
  srcBase?: string;
  allow?: string;
  minHeight?: string;
  email?: string;
  artistSpotifyId?: string;
  sidebar?: "horizontal" | "vertical";
}

type MountTarget = string | HTMLElement;

interface ContainerStyleSnapshot {
  minHeight: string;
  width: string;
  maxWidth: string;
  margin: string;
}

interface WidgetState {
  container: HTMLElement;
  iframe: HTMLIFrameElement;
  origin: string;
  messageHandler: (event: MessageEvent) => void;
  resizeHandler: () => void;
  resizeTimer?: number;
  containerStyleSnapshot: ContainerStyleSnapshot;
}

const DEFAULTS: Required<
  Omit<
    WidgetMountOptions,
    "partnerId" | "email" | "artistSpotifyId" | "sidebar"
  >
> = {
  locale: "en",
  srcBase: "https://funnel.baseformusic.com",
  allow:
    "payment *; clipboard-read *; clipboard-write *; fullscreen *; autoplay; encrypted-media",
  minHeight: "900px",
};

const SUPPORTED_LOCALES = ["en", "fr", "de", "es", "pt"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_SIDEBAR: "horizontal" | "vertical" = "vertical";

export class B4MFunnel {
  private state?: WidgetState;

  mount(target: MountTarget, options: WidgetMountOptions): void {
    if (typeof window === "undefined" || typeof document === "undefined") {
      throw new Error("B4MFunnel: mount must run in a browser environment.");
    }

    this.unmount();

    const minHeight = this.normalizeMinHeight(options.minHeight);

    const merged = {
      partnerId: options.partnerId,
      locale: this.normalizeLocale(options.locale) ?? DEFAULTS.locale,
      srcBase: options.srcBase ?? DEFAULTS.srcBase,
      allow: options.allow ?? DEFAULTS.allow,
      minHeight,
      email: options.email,
      artistSpotifyId: options.artistSpotifyId,
      sidebar: this.normalizeSidebar(options.sidebar) ?? DEFAULT_SIDEBAR,
    };

    if (!merged.partnerId) {
      throw new Error("B4MFunnel: partnerId is required.");
    }

    const container = this.resolveTarget(target);
    if (!container) {
      throw new Error("B4MFunnel: target container not found.");
    }

    const containerStyleSnapshot: ContainerStyleSnapshot = {
      minHeight: container.style.minHeight,
      width: container.style.width,
      maxWidth: container.style.maxWidth,
      margin: container.style.margin,
    };

    const srcUrl = this.buildSrcUrl(merged.srcBase, {
      partnerId: merged.partnerId,
      locale: merged.locale,
      email: merged.email,
      artistSpotifyId: merged.artistSpotifyId,
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
      iframe.contentWindow?.postMessage({ type: "getHeight" }, origin);
    };

    const widgetState: WidgetState = {
      container,
      iframe,
      origin,
      messageHandler: () => undefined,
      resizeHandler: () => undefined,
      containerStyleSnapshot,
    };

    const messageHandler = (event: MessageEvent) => {
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
        iframe.contentWindow?.postMessage({ type: "getHeight" }, origin);
        widgetState.resizeTimer = undefined;
      }, 150);
    };

    window.addEventListener("message", messageHandler);
    window.addEventListener("resize", resizeHandler);

    widgetState.messageHandler = messageHandler;
    widgetState.resizeHandler = resizeHandler;

    this.state = widgetState;
  }

  unmount(): void {
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

    this.state = undefined;
  }

  private resolveTarget(target: MountTarget): HTMLElement | null {
    if (typeof target === "string") {
      return document.querySelector<HTMLElement>(target);
    }
    if (target instanceof HTMLElement) {
      return target;
    }
    return null;
  }

  private buildSrcUrl(
    base: string,
    params: {
      partnerId: string;
      locale?: string;
      email?: string;
      artistSpotifyId?: string;
      sidebar?: "horizontal" | "vertical";
    }
  ): URL {
    const url = new URL(base);
    url.searchParams.set("partnerId", params.partnerId);
    if (params.locale) {
      url.searchParams.set("locale", params.locale);
    }
    if (params.email) {
      url.searchParams.set("email", params.email);
    }
    if (params.artistSpotifyId) {
      url.searchParams.set("artistSpotifyId", params.artistSpotifyId);
    }
    if (params.sidebar) {
      url.searchParams.set("sidebar", params.sidebar);
    }
    return url;
  }

  private extractHeight(data: Record<string, unknown>): number | undefined {
    if (typeof data.height === "number") {
      return data.height;
    }
    if (
      data.payload &&
      typeof data.payload === "object" &&
      typeof (data.payload as { height?: unknown }).height === "number"
    ) {
      return (data.payload as { height?: number }).height;
    }
    return undefined;
  }

  private normalizeMinHeight(value?: string): string {
    if (!value) {
      return DEFAULTS.minHeight;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return DEFAULTS.minHeight;
    }
    // If it's a plain number, enforce minimum 900 and append "px"
    if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
      const num = Number(trimmed);
      if (num < 900) {
        return DEFAULTS.minHeight;
      }
      return `${trimmed}px`;
    }
    return trimmed;
  }

  private normalizeLocale(value?: string): SupportedLocale | undefined {
    if (!value) return undefined;
    const lc = value.trim().toLowerCase();
    return (SUPPORTED_LOCALES as readonly string[]).includes(lc)
      ? (lc as SupportedLocale)
      : undefined;
  }

  private normalizeSidebar(
    value?: string
  ): "horizontal" | "vertical" | undefined {
    if (!value) return undefined;
    const v = value.trim().toLowerCase();
    if (v === "horizontal" || v === "vertical") return v;
    return undefined;
  }
}

export default B4MFunnel;
