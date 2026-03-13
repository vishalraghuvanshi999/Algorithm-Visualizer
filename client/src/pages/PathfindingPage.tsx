import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clampGrid,
  getPathSteps,
} from "../lib/pathfinding/algorithms";
import type { Cell, PathfinderId, PathStep } from "../lib/pathfinding/types";
import { useInterval } from "../lib/hooks/useInterval";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { Slider } from "../ui/Slider";
import { createPreset } from "../lib/api/presets";
import { loadLocalPreset } from "../lib/presets/local";

const algorithms: { id: PathfinderId; label: string }[] = [
  { id: "dijkstra", label: "Dijkstra" },
  { id: "astar", label: "A* (Manhattan)" },
];

const keyOf = (r: number, c: number) => `${r},${c}`;

function delayMs(speed: number) {
  // speed 1..100 -> 140..10 ms
  const s = Math.max(1, Math.min(100, speed));
  return Math.round(140 - (s - 1) * (130 / 99));
}

type EditMode = "walls" | "start" | "goal";

export function PathfindingPage() {
  const [{ rows, cols }, setGridSize] = useState(() => clampGrid(22, 44));
  const [algorithm, setAlgorithm] = useState<PathfinderId>("astar");
  const [mode, setMode] = useState<EditMode>("walls");
  const [speed, setSpeed] = useState(55);

  const [start, setStart] = useState<Cell>(() => ({
    r: Math.floor(rows / 2),
    c: Math.floor(cols / 4),
  }));
  const [goal, setGoal] = useState<Cell>(() => ({
    r: Math.floor(rows / 2),
    c: Math.floor((cols * 3) / 4),
  }));

  const [walls, setWalls] = useState<Set<string>>(() => new Set());
  const [isMouseDown, setIsMouseDown] = useState(false);

  const [steps, setSteps] = useState<PathStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [visited, setVisited] = useState<Set<string>>(() => new Set());
  const [frontier, setFrontier] = useState<Set<string>>(() => new Set());
  const [pathSet, setPathSet] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const maybe = loadLocalPreset();
    if (!maybe || maybe.kind !== "pathfinding") return;
    const d = maybe.data as Partial<{
      algorithm: PathfinderId;
      rows: number;
      cols: number;
      start: Cell;
      goal: Cell;
      walls: Cell[];
      speed: number;
    }>;
    if (d.algorithm) setAlgorithm(d.algorithm);
    if (typeof d.rows === "number" && typeof d.cols === "number") {
      const next = clampGrid(d.rows, d.cols);
      setGridSize(next);
    }
    if (d.start) setStart(d.start);
    if (d.goal) setGoal(d.goal);
    if (Array.isArray(d.walls)) {
      setWalls(new Set(d.walls.map((w) => keyOf(w.r, w.c))));
    }
    if (typeof d.speed === "number") setSpeed(d.speed);
    resetRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetRun = useCallback(() => {
    setSteps([]);
    setStepIndex(0);
    setIsRunning(false);
    setVisited(new Set());
    setFrontier(new Set());
    setPathSet(new Set());
  }, []);

  const clearWalls = useCallback(() => {
    setWalls(new Set());
    resetRun();
  }, [resetRun]);

  const prepare = useCallback(() => {
    const st = getPathSteps({ algorithm, rows, cols, start, goal, wallsSet: walls });
    setSteps(st);
    setStepIndex(0);
    setVisited(new Set());
    setFrontier(new Set());
    setPathSet(new Set());
  }, [algorithm, rows, cols, start, goal, walls]);

  const tick = useCallback(() => {
    setStepIndex((idx) => {
      if (idx >= steps.length) return idx;
      const s = steps[idx];
      if (s.type === "frontier") {
        const k = keyOf(s.cell.r, s.cell.c);
        setFrontier((prev) => new Set(prev).add(k));
      } else if (s.type === "visit") {
        const k = keyOf(s.cell.r, s.cell.c);
        setVisited((prev) => new Set(prev).add(k));
        setFrontier((prev) => {
          const next = new Set(prev);
          next.delete(k);
          return next;
        });
      } else if (s.type === "path") {
        const next = new Set<string>();
        for (const cell of s.cells) next.add(keyOf(cell.r, cell.c));
        setPathSet(next);
        setIsRunning(false);
      }

      const nextIdx = idx + 1;
      if (nextIdx >= steps.length) setIsRunning(false);
      return nextIdx;
    });
  }, [steps]);

  useInterval(isRunning ? tick : () => {}, isRunning ? delayMs(speed) : null);

  const toggleWallAt = useCallback(
    (cell: Cell) => {
      const k = keyOf(cell.r, cell.c);
      if (k === keyOf(start.r, start.c) || k === keyOf(goal.r, goal.c)) return;
      setWalls((prev) => {
        const next = new Set(prev);
        if (next.has(k)) next.delete(k);
        else next.add(k);
        return next;
      });
    },
    [start, goal],
  );

  const handleCellAction = useCallback(
    (cell: Cell) => {
      if (isRunning) return;
      resetRun();

      if (mode === "walls") toggleWallAt(cell);
      if (mode === "start") {
        const k = keyOf(cell.r, cell.c);
        if (walls.has(k)) return;
        setStart(cell);
      }
      if (mode === "goal") {
        const k = keyOf(cell.r, cell.c);
        if (walls.has(k)) return;
        setGoal(cell);
      }
    },
    [isRunning, mode, toggleWallAt, walls, resetRun],
  );

  const grid = useMemo(() => {
    const arr: Cell[] = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) arr.push({ r, c });
    return arr;
  }, [rows, cols]);

  const canRun = steps.length > 0 && stepIndex < steps.length;

  return (
    <div
      className="space-y-4"
      onMouseUp={() => setIsMouseDown(false)}
      onMouseLeave={() => setIsMouseDown(false)}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-lg font-semibold">Pathfinding Visualizer</div>
          <div className="text-sm text-white/60">
            Paint walls, then watch the search explore the grid.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
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
          <Button variant="secondary" size="sm" onClick={resetRun} disabled={isRunning}>
            Reset run
          </Button>
          <Button variant="secondary" size="sm" onClick={clearWalls} disabled={isRunning}>
            Clear walls
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={isRunning || saving}
            onClick={async () => {
              setSaving(true);
              setSaveMsg(null);
              const name = `Path • ${algorithm} • ${new Date().toLocaleString()}`;
              const res = await createPreset({
                kind: "pathfinding",
                name,
                data: {
                  algorithm,
                  rows,
                  cols,
                  start,
                  goal,
                  walls: Array.from(walls).map((k) => {
                    const [r, c] = k.split(",").map(Number);
                    return { r, c };
                  }),
                  speed,
                },
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
              className="w-full"
              value={algorithm}
              disabled={isRunning}
              onChange={(e) => {
                setAlgorithm(e.target.value as PathfinderId);
                resetRun();
              }}
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
          <div className="text-xs font-semibold text-white/70">Edit</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={mode === "walls" ? "primary" : "secondary"}
              onClick={() => setMode("walls")}
              disabled={isRunning}
            >
              Walls
            </Button>
            <Button
              size="sm"
              variant={mode === "start" ? "primary" : "secondary"}
              onClick={() => setMode("start")}
              disabled={isRunning}
            >
              Start
            </Button>
            <Button
              size="sm"
              variant={mode === "goal" ? "primary" : "secondary"}
              onClick={() => setMode("goal")}
              disabled={isRunning}
            >
              Goal
            </Button>
          </div>
          <div className="mt-3 text-xs text-white/60">
            Tip: drag to paint walls.
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs font-semibold text-white/70">Speed</div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Animation</span>
              <span className="font-mono text-white/80">{speed}</span>
            </div>
            <Slider min={1} max={100} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
            <div className="mt-2 text-xs text-white/50">
              Delay: <span className="font-mono text-white/70">{delayMs(speed)}ms</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-4 shadow-2xl shadow-black/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold">
            Grid{" "}
            <span className="text-white/60">
              ({rows}×{cols})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="secondary"
              disabled={isRunning}
              onClick={() => {
                const next = clampGrid(rows - 2, cols - 4);
                setGridSize(next);
                setStart({ r: Math.floor(next.rows / 2), c: Math.floor(next.cols / 4) });
                setGoal({ r: Math.floor(next.rows / 2), c: Math.floor((next.cols * 3) / 4) });
                setWalls(new Set());
                resetRun();
              }}
            >
              Smaller
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={isRunning}
              onClick={() => {
                const next = clampGrid(rows + 2, cols + 4);
                setGridSize(next);
                setStart({ r: Math.floor(next.rows / 2), c: Math.floor(next.cols / 4) });
                setGoal({ r: Math.floor(next.rows / 2), c: Math.floor((next.cols * 3) / 4) });
                setWalls(new Set());
                resetRun();
              }}
            >
              Bigger
            </Button>
            <Button size="sm" variant="secondary" disabled={isRunning} onClick={prepare}>
              Prepare steps
            </Button>
          </div>
        </div>

        <div
          className="mt-4 grid select-none gap-[2px] rounded-2xl border border-white/10 bg-zinc-950/50 p-3"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          onMouseDown={() => setIsMouseDown(true)}
        >
          {grid.map((cell) => {
            const k = keyOf(cell.r, cell.c);
            const isStart = k === keyOf(start.r, start.c);
            const isGoal = k === keyOf(goal.r, goal.c);
            const isWall = walls.has(k);
            const isPath = pathSet.has(k);
            const isVisited = visited.has(k);
            const isFrontier = frontier.has(k);

            const bg = isStart
              ? "bg-emerald-500/80"
              : isGoal
                ? "bg-rose-500/80"
                : isWall
                  ? "bg-white/10"
                  : isPath
                    ? "bg-indigo-400/70"
                    : isVisited
                      ? "bg-fuchsia-400/35"
                      : isFrontier
                        ? "bg-white/25"
                        : "bg-white/5 hover:bg-white/10";

            return (
              <div
                key={k}
                className={[
                  "aspect-square rounded-[3px] border border-white/5 transition",
                  bg,
                ].join(" ")}
                title={`${cell.r},${cell.c}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleCellAction(cell);
                }}
                onMouseEnter={() => {
                  if (!isMouseDown) return;
                  if (mode !== "walls") return;
                  handleCellAction(cell);
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

