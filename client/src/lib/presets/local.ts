import type { PresetKind } from "../api/presets";

export type LocalPresetPayload = {
  kind: PresetKind;
  name: string;
  data: unknown;
};

const KEY = "av:lastPreset";

export function saveLocalPreset(p: LocalPresetPayload) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function loadLocalPreset(): LocalPresetPayload | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalPresetPayload;
  } catch {
    return null;
  }
}

export function clearLocalPreset() {
  localStorage.removeItem(KEY);
}

