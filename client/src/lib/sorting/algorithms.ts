import type { SortAlgorithmId, SortStep } from "./types";

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

export function generateArray(length: number, minVal: number, maxVal: number) {
  const len = clampInt(length, 5, 250);
  const lo = Math.min(minVal, maxVal);
  const hi = Math.max(minVal, maxVal);
  const arr: number[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(lo + Math.floor(Math.random() * (hi - lo + 1)));
  }
  return arr;
}

export function applySortSteps(array: number[], steps: SortStep[]) {
  const a = array.slice();
  for (const s of steps) {
    if (s.type === "swap") {
      const t = a[s.i];
      a[s.i] = a[s.j];
      a[s.j] = t;
    } else if (s.type === "overwrite") {
      a[s.i] = s.value;
    }
  }
  return a;
}

export function getSortSteps(
  algorithm: SortAlgorithmId,
  input: number[],
): SortStep[] {
  const a = input.slice();
  const steps: SortStep[] = [];

  const swap = (i: number, j: number) => {
    steps.push({ type: "swap", i, j });
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  };
  const compare = (i: number, j: number) => {
    steps.push({ type: "compare", i, j });
    return a[i] - a[j];
  };
  const overwrite = (i: number, value: number) => {
    steps.push({ type: "overwrite", i, value });
    a[i] = value;
  };

  if (algorithm === "bubble") {
    for (let end = a.length - 1; end > 0; end--) {
      for (let i = 0; i < end; i++) {
        compare(i, i + 1);
        if (a[i] > a[i + 1]) swap(i, i + 1);
      }
      steps.push({ type: "markSorted", indices: [end] });
    }
    steps.push({ type: "markSorted", indices: [0] });
    return steps;
  }

  if (algorithm === "selection") {
    for (let start = 0; start < a.length; start++) {
      let minIdx = start;
      for (let j = start + 1; j < a.length; j++) {
        steps.push({ type: "compare", i: minIdx, j });
        if (a[j] < a[minIdx]) minIdx = j;
      }
      if (minIdx !== start) swap(start, minIdx);
      steps.push({ type: "markSorted", indices: [start] });
    }
    return steps;
  }

  if (algorithm === "insertion") {
    steps.push({ type: "markSorted", indices: [0] });
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      let j = i - 1;
      while (j >= 0) {
        steps.push({ type: "compare", i: j, j: i });
        if (a[j] <= key) break;
        overwrite(j + 1, a[j]);
        j--;
      }
      overwrite(j + 1, key);
      steps.push({
        type: "markSorted",
        indices: Array.from({ length: i + 1 }, (_, k) => k),
      });
    }
    return steps;
  }

  if (algorithm === "merge") {
    const aux = a.slice();
    const mergeSort = (lo: number, hi: number) => {
      if (hi - lo <= 1) return;
      const mid = lo + Math.floor((hi - lo) / 2);
      mergeSort(lo, mid);
      mergeSort(mid, hi);

      let i = lo;
      let j = mid;
      let k = lo;

      while (i < mid && j < hi) {
        steps.push({ type: "compare", i, j });
        if (a[i] <= a[j]) {
          aux[k++] = a[i++];
        } else {
          aux[k++] = a[j++];
        }
      }
      while (i < mid) aux[k++] = a[i++];
      while (j < hi) aux[k++] = a[j++];

      for (let p = lo; p < hi; p++) overwrite(p, aux[p]);
    };

    mergeSort(0, a.length);
    steps.push({
      type: "markSorted",
      indices: Array.from({ length: a.length }, (_, i) => i),
    });
    return steps;
  }

  // quick
  const quickSort = (lo: number, hi: number) => {
    if (hi - lo <= 1) return;

    const pivotIdx = hi - 1;
    const pivot = a[pivotIdx];
    let store = lo;

    for (let i = lo; i < hi - 1; i++) {
      steps.push({ type: "compare", i, j: pivotIdx });
      if (a[i] < pivot) {
        if (i !== store) swap(i, store);
        store++;
      }
    }
    if (store !== pivotIdx) swap(store, pivotIdx);
    steps.push({ type: "markSorted", indices: [store] });

    quickSort(lo, store);
    quickSort(store + 1, hi);
  };

  quickSort(0, a.length);
  steps.push({
    type: "markSorted",
    indices: Array.from({ length: a.length }, (_, i) => i),
  });
  return steps;
}

