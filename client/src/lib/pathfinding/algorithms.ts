import type { Cell, PathfinderId, PathStep } from "./types";

const keyOf = (r: number, c: number) => `${r},${c}`;

export function clampGrid(rows: number, cols: number) {
  const r = Math.max(8, Math.min(60, Math.trunc(rows)));
  const c = Math.max(12, Math.min(80, Math.trunc(cols)));
  return { rows: r, cols: c };
}

export function manhattan(a: Cell, b: Cell) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
}

export function neighbors4(cell: Cell, rows: number, cols: number): Cell[] {
  const out: Cell[] = [];
  const { r, c } = cell;
  if (r > 0) out.push({ r: r - 1, c });
  if (r < rows - 1) out.push({ r: r + 1, c });
  if (c > 0) out.push({ r, c: c - 1 });
  if (c < cols - 1) out.push({ r, c: c + 1 });
  return out;
}

function reconstructPath(
  cameFrom: Map<string, string>,
  start: Cell,
  goal: Cell,
): Cell[] {
  const startK = keyOf(start.r, start.c);
  let curK = keyOf(goal.r, goal.c);
  if (curK !== startK && !cameFrom.has(curK)) return [];
  const path: Cell[] = [{ ...goal }];
  while (curK !== startK) {
    const prev = cameFrom.get(curK);
    if (!prev) break;
    const [pr, pc] = prev.split(",").map(Number);
    path.push({ r: pr, c: pc });
    curK = prev;
  }
  path.reverse();
  return path;
}

type PQItem = { k: string; cell: Cell; priority: number };

class MinPQ {
  private heap: PQItem[] = [];
  get size() {
    return this.heap.length;
  }
  push(x: PQItem) {
    this.heap.push(x);
    this.bubbleUp(this.heap.length - 1);
  }
  pop(): PQItem | undefined {
    if (!this.heap.length) return;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }
  private bubbleUp(i: number) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.heap[p].priority <= this.heap[i].priority) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }
  private bubbleDown(i: number) {
    for (;;) {
      const l = i * 2 + 1;
      const r = l + 1;
      let m = i;
      if (l < this.heap.length && this.heap[l].priority < this.heap[m].priority)
        m = l;
      if (r < this.heap.length && this.heap[r].priority < this.heap[m].priority)
        m = r;
      if (m === i) break;
      [this.heap[m], this.heap[i]] = [this.heap[i], this.heap[m]];
      i = m;
    }
  }
}

export function getPathSteps(opts: {
  algorithm: PathfinderId;
  rows: number;
  cols: number;
  start: Cell;
  goal: Cell;
  wallsSet: Set<string>;
}): PathStep[] {
  const { algorithm, rows, cols, start, goal, wallsSet } = opts;
  const steps: PathStep[] = [];

  const startK = keyOf(start.r, start.c);
  const goalK = keyOf(goal.r, goal.c);

  const dist = new Map<string, number>();
  const cameFrom = new Map<string, string>();
  const visited = new Set<string>();
  const inFrontier = new Set<string>();

  dist.set(startK, 0);

  const pq = new MinPQ();
  pq.push({ k: startK, cell: start, priority: 0 });
  inFrontier.add(startK);
  steps.push({ type: "frontier", cell: start });

  while (pq.size) {
    const cur = pq.pop()!;
    inFrontier.delete(cur.k);
    if (visited.has(cur.k)) continue;
    visited.add(cur.k);
    steps.push({ type: "visit", cell: cur.cell });

    if (cur.k === goalK) break;

    const curDist = dist.get(cur.k) ?? Infinity;
    for (const nb of neighbors4(cur.cell, rows, cols)) {
      const nbK = keyOf(nb.r, nb.c);
      if (wallsSet.has(nbK)) continue;
      if (visited.has(nbK)) continue;

      const tentative = curDist + 1;
      const old = dist.get(nbK);
      if (old === undefined || tentative < old) {
        dist.set(nbK, tentative);
        cameFrom.set(nbK, cur.k);
        const h = algorithm === "astar" ? manhattan(nb, goal) : 0;
        pq.push({ k: nbK, cell: nb, priority: tentative + h });
        if (!inFrontier.has(nbK)) {
          inFrontier.add(nbK);
          steps.push({ type: "frontier", cell: nb });
        }
      }
    }
  }

  const path = reconstructPath(cameFrom, start, goal);
  steps.push({ type: "path", cells: path });
  return steps;
}

