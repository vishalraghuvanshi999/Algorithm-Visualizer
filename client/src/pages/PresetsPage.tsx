import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Preset, PresetKind } from "../lib/api/presets";
import { listPresets } from "../lib/api/presets";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { saveLocalPreset } from "../lib/presets/local";

function fmt(dt: string) {
  const d = new Date(dt);
  return Number.isNaN(d.valueOf()) ? dt : d.toLocaleString();
}

export function PresetsPage() {
  const [kind, setKind] = useState<PresetKind | "all">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    listPresets(kind === "all" ? undefined : kind).then((res) => {
      if (!alive) return;
      setLoading(false);
      if (!res.ok) {
        setError(res.error);
        setPresets([]);
        return;
      }
      setPresets(res.data.presets);
    });
    return () => {
      alive = false;
    };
  }, [kind]);

  const grouped = useMemo(() => {
    const s: Preset[] = [];
    const p: Preset[] = [];
    for (const x of presets) (x.kind === "sorting" ? s : p).push(x);
    return { sorting: s, pathfinding: p };
  }, [presets]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-lg font-semibold">Presets</div>
          <div className="text-sm text-white/60">
            Load saved scenarios from the MongoDB API.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={kind}
            onChange={(e) => setKind(e.target.value as PresetKind | "all")}
          >
            <option value="all">All</option>
            <option value="sorting">Sorting</option>
            <option value="pathfinding">Pathfinding</option>
          </Select>
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          API error: <span className="font-mono">{error}</span>. Make sure the
          server is running and `server/.env` has `MONGODB_URI`.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {(["sorting", "pathfinding"] as const).map((k) => {
          const list = grouped[k];
          return (
            <div
              key={k}
              className="rounded-3xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold capitalize">{k}</div>
                <div className="text-xs text-white/60">
                  {loading ? "Loading…" : `${list.length} items`}
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {list.slice(0, 20).map((p) => (
                  <div
                    key={p._id}
                    className="rounded-2xl border border-white/10 bg-zinc-950/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {p.name}
                        </div>
                        <div className="mt-1 text-xs text-white/60">
                          {fmt(p.createdAt)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            saveLocalPreset({
                              kind: p.kind,
                              name: p.name,
                              data: p.data,
                            });
                          }}
                        >
                          Stage
                        </Button>
                        <Link
                          to={p.kind === "sorting" ? "/sorting" : "/pathfinding"}
                          className="inline-flex items-center justify-center rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-white/90"
                          onClick={() => {
                            saveLocalPreset({
                              kind: p.kind,
                              name: p.name,
                              data: p.data,
                            });
                          }}
                        >
                          Load →
                        </Link>
                      </div>
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-white/60 hover:text-white/80">
                        View data
                      </summary>
                      <pre className="mt-2 max-h-48 overflow-auto rounded-xl border border-white/10 bg-black/30 p-3 text-[11px] text-white/70">
{JSON.stringify(p.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
                {list.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                    No presets yet. Save one from{" "}
                    <Link className="text-white underline" to={`/${k}`}>
                      {k}
                    </Link>
                    .
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

