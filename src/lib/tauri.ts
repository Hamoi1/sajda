import { emit, listen } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow, WebviewWindow } from "@tauri-apps/api/webviewWindow";

/** False when the UI runs in a plain browser (vite dev preview), so Tauri calls are skipped. */
export const inTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export type WindowLabel = "main" | "widget" | "reader";

export function currentLabel(): WindowLabel {
  if (inTauri) {
    const label = getCurrentWebviewWindow().label;
    return label === "widget" || label === "reader" ? label : "main";
  }
  // Browser preview: open /?widget or /?reader to see those windows.
  const params = new URLSearchParams(window.location.search);
  if (params.has("reader")) return "reader";
  return params.has("widget") ? "widget" : "main";
}

export async function emitEvent(event: string, payload?: unknown): Promise<void> {
  if (!inTauri) return;
  try {
    await emit(event, payload);
  } catch (err) {
    console.error(`emit ${event} failed`, err);
  }
}

/** Subscribes to a Tauri event and returns a synchronous cleanup for useEffect. */
export function onEvent<T>(event: string, handler: (payload: T) => void): () => void {
  if (!inTauri) return () => {};
  let unlisten: (() => void) | undefined;
  let disposed = false;
  listen<T>(event, (e) => handler(e.payload))
    .then((fn) => {
      if (disposed) fn();
      else unlisten = fn;
    })
    .catch((err) => console.error(`listen ${event} failed`, err));
  return () => {
    disposed = true;
    unlisten?.();
  };
}

export async function getWindow(label: WindowLabel): Promise<WebviewWindow | null> {
  if (!inTauri) return null;
  return WebviewWindow.getByLabel(label);
}
