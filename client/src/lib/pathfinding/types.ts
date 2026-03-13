export type PathfinderId = "dijkstra" | "astar";

export type Cell = { r: number; c: number };

export type PathfindingRunConfig = {
  algorithm: PathfinderId;
  rows: number;
  cols: number;
  start: Cell;
  goal: Cell;
  walls: Cell[];
};

export type PathStep =
  | { type: "visit"; cell: Cell }
  | { type: "frontier"; cell: Cell }
  | { type: "path"; cells: Cell[] };

