# Diffing Algorithm Explained

## Overview

Curly's diff feature compares two JSON responses and shows what changed. It works in two stages:

1. **Structural diff** (`diff.ts`) — Recursively walks two JSON values and lists every field that was added, removed, or changed.
2. **Line-level diff** (`format.ts`) — Pretty-prints both values as JSON, then uses the Longest Common Subsequence (LCS) algorithm to produce a unified diff with colored `+`/`-` lines.

This doc focuses on the LCS algorithm in `format.ts`, since the structural diff is a straightforward recursive comparison.

## The Problem

Given two lists of lines (old and new), we want to figure out:

- Which lines stayed the same (keep)
- Which lines were removed from the old (remove)
- Which lines were added in the new (add)

To do this well, we need to find the **longest common subsequence** — the largest set of lines that appear in both lists in the same order. Everything not in the LCS is either an addition or a removal.

## A Simple Example

Let's diff these two JSON values:

**Old (baseline):**
```json
{
  "name": "Alice",
  "age": 30
}
```

**New (current):**
```json
{
  "name": "Bob",
  "age": 30
}
```

Split into lines, we get:

```
Old lines:              New lines:
0: {                    0: {
1:   "name": "Alice",   1:   "name": "Bob",
2:   "age": 30          2:   "age": 30
3: }                    3: }
```

Lines 0, 2, and 3 are identical. Line 1 differs. So the LCS is `["{", "  \"age\": 30", "}"]` — three lines that match in order.

The final diff output:

```
  {
-   "name": "Alice",
+   "name": "Bob",
    "age": 30
  }
```

## Step 1: Build the LCS Table

The algorithm uses dynamic programming. We build a 2D table where `table[i][j]` holds the length of the longest common subsequence between the first `i` old lines and the first `j` new lines.

The table starts filled with zeros and has dimensions `(m+1) x (n+1)` where `m` and `n` are the lengths of the old and new line arrays.

```typescript
const table: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
```

For our example (`m = 4`, `n = 4`), we start with a 5x5 table of zeros:

```
        ""   {   "Bob"  age  }
  ""  [  0,  0,  0,     0,   0 ]
  {   [  0,  ?,  ?,     ?,   ? ]
  "Alice" [  0,  ?,  ?,     ?,   ? ]
  age [  0,  ?,  ?,     ?,   ? ]
  }   [  0,  ?,  ?,     ?,   ? ]
```

### Filling the table

We scan row by row, left to right. For each cell `(i, j)`:

- **If `oldLines[i-1] === newLines[j-1]`** (the lines match): take the diagonal value and add 1.
  ```
  table[i][j] = table[i-1][j-1] + 1
  ```
- **Otherwise**: take the larger of the cell above or to the left.
  ```
  table[i][j] = Math.max(table[i-1][j], table[i][j-1])
  ```

Walking through our example:

**Row 1** — old line `{` vs each new line:
- `j=1`: `{` === `{` → `table[0][0] + 1 = 1`
- `j=2`: `{` !== `"Bob"` → `max(table[0][2], table[1][1]) = max(0, 1) = 1`
- `j=3`: `{` !== `age` → `max(table[0][3], table[1][2]) = max(0, 1) = 1`
- `j=4`: `{` !== `}` → `max(table[0][4], table[1][3]) = max(0, 1) = 1`

**Row 2** — old line `"Alice"` vs each new line:
- `j=1`: `"Alice"` !== `{` → `max(table[1][1], table[2][0]) = max(1, 0) = 1`
- `j=2`: `"Alice"` !== `"Bob"` → `max(table[1][2], table[2][1]) = max(1, 1) = 1`
- `j=3`: `"Alice"` !== `age` → `max(table[1][3], table[2][2]) = max(1, 1) = 1`
- `j=4`: `"Alice"` !== `}` → `max(table[1][4], table[2][3]) = max(1, 1) = 1`

**Row 3** — old line `age` vs each new line:
- `j=1`: `age` !== `{` → `max(1, 0) = 1`
- `j=2`: `age` !== `"Bob"` → `max(1, 1) = 1`
- `j=3`: `age` === `age` → `table[2][2] + 1 = 1 + 1 = 2`
- `j=4`: `age` !== `}` → `max(table[2][4], table[3][3]) = max(1, 2) = 2`

**Row 4** — old line `}` vs each new line:
- `j=1`: `}` !== `{` → `max(1, 0) = 1`
- `j=2`: `}` !== `"Bob"` → `max(1, 1) = 1`
- `j=3`: `}` !== `age` → `max(2, 1) = 2`
- `j=4`: `}` === `}` → `table[3][3] + 1 = 2 + 1 = 3`

Final table:

```
        ""   {   "Bob"  age  }
  ""  [  0,  0,  0,     0,   0 ]
  {   [  0,  1,  1,     1,   1 ]
  "Alice" [  0,  1,  1,     1,   1 ]
  age [  0,  1,  1,     2,   2 ]
  }   [  0,  1,  1,     2,   3 ]
```

The bottom-right cell `table[4][4] = 3` tells us the LCS is 3 lines long.

## Step 2: Backtracking

Building the table tells us the *length* of the LCS, but we need the actual diff. We recover it by **backtracking** from the bottom-right corner `(m, n)` to the top-left `(0, 0)`.

### Why backtrack?

The table only stores counts, not the actual subsequence. But the decisions we made while filling the table leave a trail we can follow backwards. At each cell, we can figure out *which* decision was made (match, skip old, or skip new) and reconstruct the diff from that.

We walk backwards because the table was built forward — each cell depends on cells above and to the left. Starting from the final answer `table[m][n]` and working back lets us trace the path that produced that answer.

### The backtracking rules

Starting at `i = m, j = n`, at each step:

1. **If the lines match** (`oldLines[i-1] === newLines[j-1]`): this line is in the LCS. Emit a **keep** and move diagonally: `i--, j--`.
2. **Else if `table[i][j-1] >= table[i-1][j]`**: the LCS came from the left. The new line has no match — emit an **add** and move left: `j--`.
3. **Otherwise**: the LCS came from above. The old line has no match — emit a **remove** and move up: `i--`.

### Walking through our example

Start at `(4, 4)`:

```
(4,4): old="}" new="}" → match! → keep "}", move to (3,3)
(3,3): old="age" new="age" → match! → keep "age", move to (2,2)
(2,2): old="Alice" new="Bob" → no match
        table[2][1]=1, table[1][2]=1 → 1 >= 1, so move left
        → add "Bob", move to (2,1)
(2,1): old="Alice" new="{" → no match
        table[2][0]=0, table[1][1]=1 → 0 < 1, so move up
        → remove "Alice", move to (1,1)
(1,1): old="{" new="{" → match! → keep "{", move to (0,0)
(0,0): done.
```

This produces (in reverse order): `keep "{"`, `remove "Alice"`, `add "Bob"`, `keep "age"`, `keep "}"`

After reversing (`result.reverse()`), the final diff:

```
  {
-   "name": "Alice",
+   "name": "Bob",
    "age": 30
  }
```

## Step 3: Formatting

The `formatDiff` function takes the list of keep/add/remove operations and colors them:

- **keep** lines → gray with `  ` prefix (two spaces)
- **remove** lines → red with `- ` prefix
- **add** lines → green with `+ ` prefix

It also appends a summary line like `1 additions, 1 removals, 3 unchanged`.

## The Structural Diff (`diff.ts`)

Separately from the line-level LCS diff, `diff.ts` provides a recursive structural comparison that reports *which JSON paths* changed. It walks both values:

- **Both objects**: iterate all keys from both sides. Keys only in `b` are `added`, keys only in `a` are `removed`, shared keys are compared recursively.
- **Both arrays**: iterate up to the longer length. Extra elements in `b` are `added`, extra elements in `a` are `removed`, shared indices are compared recursively.
- **Primitives**: if `a !== b`, report a `changed` entry.

This gives output like `path: "users[0].name", type: "changed", oldValue: "Alice", newValue: "Bob"` — useful for programmatic comparison and summary counts.

## Key Concepts Summary

- **LCS (Longest Common Subsequence)**: The largest set of lines common to both inputs, in order. Everything else is an addition or removal.
- **Dynamic Programming Table**: Builds up the LCS length bottom-up, avoiding exponential brute-force search.
- **Backtracking**: Recovers the actual diff operations by tracing the path through the table from end to start.
- **Time Complexity**: O(m × n) for both table construction and backtracking, where m and n are the line counts.
- **Space Complexity**: O(m × n) for the table.
