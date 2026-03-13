import { useCallback, useEffect, useMemo, useState } from "react";
import {
  applySortSteps,
  generateArray,
  getSortSteps,
} from "../lib/sorting/algorithms";
import type { SortAlgorithmId, SortStep } from "../lib/sorting/types";
import { useInterval } from "../lib/hooks/useInterval";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { Slider } from "../ui/Slider";
import { createPreset } from "../lib/api/presets";
import { loadLocalPreset } from "../lib/presets/local";

const algorithms: { id: SortAlgorithmId; label: string }[] = [
  { id: "bubble", label: "Bubble sort" },
  { id: "selection", label: "Selection sort" },
  { id: "insertion", label: "Insertion sort" },
  { id: "merge", label: "Merge sort" },
  { id: "quick", label: "Quick sort" },
];

function stepDelayMs(speed: number) {
  // speed 1..100 -> 180..8 ms
  const s = Math.max(1, Math.min(100, speed));
  return Math.round(180 - (s - 1) * (172 / 99));
}

export function SortingPage() {
  const [algorithm, setAlgorithm] = useState<SortAlgorithmId>("merge");
  const [length, setLength] = useState(60);
  const [minVal, setMinVal] = useState(5);
  const [maxVal, setMaxVal] = useState(100);
  const [speed, setSpeed] = useState(55);

  const [baseArray, setBaseArray] = useState<number[]>(
    () => generateArray(length, minVal, maxVal),
  );
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [active, setActive] = useState<{ i?: number; j?: number }>({});
  const [sortedSet, setSortedSet] = useState<Set<number>>(() => new Set());
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    const maybe = loadLocalPreset();
    if (!maybe || maybe.kind !== "sorting") return;
    const d = maybe.data as Partial<{
      algorithm: SortAlgorithmId;
      array: number[];
      speed: number;
    }>;
    if (d.algorithm) setAlgorithm(d.algorithm);
    if (Array.isArray(d.array) && d.array.every((n) => typeof n === "number")) {
      setBaseArray(d.array);
      setLength(d.array.length);
    }
    if (typeof d.speed === "number") setSpeed(d.speed);
    resetRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetRun = useCallback(() => {
    setSteps([]);
    setStepIndex(0);
    setIsRunning(false);
    setActive({});
    setSortedSet(new Set());
  }, []);

  const regenerate = useCallback(() => {
    const next = generateArray(length, minVal, maxVal);
    setBaseArray(next);
    resetRun();
  }, [length, minVal, maxVal, resetRun]);

  const computed = useMemo(() => {
    const shown = steps.length
      ? applySortSteps(baseArray, steps.slice(0, stepIndex))
      : baseArray;
    return {
      array: shown,
      max: Math.max(...shown, 1),
    };
  }, [baseArray, steps, stepIndex]);

  const prepare = useCallback(() => {
    const st = getSortSteps(algorithm, baseArray);
    setSteps(st);
    setStepIndex(0);
    setSortedSet(new Set());
    setActive({});
  }, [algorithm, baseArray]);

  const tick = useCallback(() => {
    setStepIndex((idx) => {
      if (idx >= steps.length) return idx;
      const s = steps[idx];
      if (s.type === "compare") setActive({ i: s.i, j: s.j });
      if (s.type === "swap") setActive({ i: s.i, j: s.j });
      if (s.type === "overwrite") setActive({ i: s.i });
      if (s.type === "markSorted") {
        setSortedSet((prev) => {
          const next = new Set(prev);
          for (const v of s.indices) next.add(v);
          return next;
        });
      }

      const nextIdx = idx + 1;
      if (nextIdx >= steps.length) {
        setIsRunning(false);
        setActive({});
      }
      return nextIdx;
    });
  }, [steps]);

  useInterval(isRunning ? tick : () => {}, isRunning ? stepDelayMs(speed) : null);

  const canRun = steps.length > 0 && stepIndex < steps.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-lg font-semibold">Sorting Visualizer</div>
          <div className="text-sm text-white/60">
            Watch comparisons, swaps, and overwrites step-by-step.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={regenerate}
            disabled={isRunning}
          >
            New Array
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={resetRun}
            disabled={isRunning}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (!steps.length) prepare();
              setIsRunning(true);
            }}
            disabled={isRunning || (!canRun && steps.length > 0)}
          >
            Play
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsRunning(false)}
            disabled={!isRunning}
          >
            Pause
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (!steps.length) prepare();
              tick();
            }}
            disabled={isRunning || (steps.length > 0 && stepIndex >= steps.length)}
          >
            Step
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={isRunning || saving}
            onClick={async () => {
              setSaving(true);
              setSaveMsg(null);
              const name = `Sorting • ${algorithm} • ${new Date().toLocaleString()}`;
              const res = await createPreset({
                kind: "sorting",
                name,
                data: { algorithm, array: baseArray, speed },
              });
              setSaving(false);
              setSaveMsg(res.ok ? "Saved preset to MongoDB." : `Save failed: ${res.error}`);
            }}
          >
            {saving ? "Saving…" : "Save preset"}
          </Button>
        </div>
      </div>
      {saveMsg ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
          {saveMsg}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs font-semibold text-white/70">Algorithm</div>
          <div className="mt-2">
            <Select
              value={algorithm}
              onChange={(e) => {
                setAlgorithm(e.target.value as SortAlgorithmId);
                resetRun();
              }}
              disabled={isRunning}
              className="w-full"
            >
              {algorithms.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="mt-3 text-xs text-white/60">
            Steps:{" "}
            <span className="font-mono text-white/80">
              {steps.length ? `${stepIndex}/${steps.length}` : "—"}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs font-semibold text-white/70">Array</div>
          <div className="mt-3 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Length</span>
                <span className="font-mono text-white/80">{length}</span>
              </div>
              <Slider
                min={10}
                max={160}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                onMouseUp={regenerate}
                onTouchEnd={regenerate}
                disabled={isRunning}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setMinVal(5);
                  setMaxVal(100);
                  setLength(60);
                  setBaseArray(generateArray(60, 5, 100));
                  resetRun();
                }}
                disabled={isRunning}
              >
                Default
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  prepare();
                  setIsRunning(false);
                }}
                disabled={isRunning}
              >
                Prepare steps
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs font-semibold text-white/70">Speed</div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Animation</span>
              <span className="font-mono text-white/80">{speed}</span>
            </div>
            <Slider
              min={1}
              max={100}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <div className="mt-2 text-xs text-white/50">
              Delay:{" "}
              <span className="font-mono text-white/70">
                {stepDelayMs(speed)}ms
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-4 shadow-2xl shadow-black/30">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">Bars</div>
          <div className="text-xs text-white/60">
            Active:{" "}
            <span className="font-mono text-white/80">
              {active.i ?? "—"}
              {active.j !== undefined ? `,${active.j}` : ""}
            </span>
          </div>
        </div>

        <div className="mt-4 flex h-[360px] items-end gap-[2px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/50 p-3">
          {computed.array.map((v, idx) => {
            const heightPct = (v / computed.max) * 100;
            const isActive = idx === active.i || idx === active.j;
            const isSorted = sortedSet.has(idx);
            const cls = isSorted
              ? "bg-emerald-400/70"
              : isActive
                ? "bg-fuchsia-400/80"
                : "bg-white/30";
            return (
              <div
                key={idx}
                className={["w-full rounded-[4px] transition", cls].join(" ")}
                style={{ height: `${heightPct}%` }}
                title={`${idx}: ${v}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

