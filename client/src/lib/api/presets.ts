import { API_BASE_URL } from "../../env";
import { http } from "./http";

export type PresetKind = "sorting" | "pathfinding";

export type Preset = {
  _id: string;
  kind: PresetKind;
  name: string;
  data: unknown;
  createdAt: string;
  updatedAt: string;
};

export async function listPresets(kind?: PresetKind) {
  const q = kind ? `?kind=${encodeURIComponent(kind)}` : "";
  return http<{ presets: Preset[] }>(`${API_BASE_URL}/api/presets${q}`);
}

export async function createPreset(input: {
  kind: PresetKind;
  name: string;
  data: unknown;
}) {
  return http<{ preset: Preset }>(`${API_BASE_URL}/api/presets`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

