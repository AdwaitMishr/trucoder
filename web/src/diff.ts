/** Tiny LCS line diff for the attempt-history view. Returns one entry per
 *  line of the old file in order; entries whose `a` is null are insertions
 *  from the new file. Pure — no dependencies, fine for <1k-line attempts. */
export interface DiffLine {
  /** Line index in the old file (null for insertions). */
  a: number | null;
  /** Line index in the new file (null for deletions). */
  b: number | null;
  kind: "same" | "del" | "add";
  text: string;
}

export function diffLines(oldText: string, newText: string): DiffLine[] {
  const A = oldText.split("\n");
  const B = newText.split("\n");
  const n = A.length;
  const m = B.length;

  // LCS table: lcs[i][j] = LCS length of A[i..] and B[j..].
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = A[i] === B[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      out.push({ a: i, b: j, kind: "same", text: A[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      out.push({ a: i, b: null, kind: "del", text: A[i] });
      i++;
    } else {
      out.push({ a: null, b: j, kind: "add", text: B[j] });
      j++;
    }
  }
  while (i < n) out.push({ a: i++, b: null, kind: "del", text: A[i - 1] });
  while (j < m) out.push({ a: null, b: j++, kind: "add", text: B[j - 1] });
  return out;
}
