export type SortAlgorithmId =
  | "bubble"
  | "selection"
  | "insertion"
  | "merge"
  | "quick";

export type SortStep =
  | { type: "compare"; i: number; j: number }
  | { type: "swap"; i: number; j: number }
  | { type: "overwrite"; i: number; value: number }
  | { type: "markSorted"; indices: number[] };

export type SortRunConfig = {
  algorithm: SortAlgorithmId;
  array: number[];
};

