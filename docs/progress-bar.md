# Progress Bar: Single-Line Updates

## The Problem

When running a load test, we want to show progress like:

```
[████████░░░░░░░░░░░░] 50/100
```

But we want this to **update in place**, not print a new line each time. Otherwise we'd get:

```
[██░░░░░░░░░░░░░░░░░░] 10/100
[████░░░░░░░░░░░░░░░░] 20/100
[██████░░░░░░░░░░░░░░] 30/100
... 100 lines of output!
```

## The Solution: Overwrite the Line

Three terminal methods make this work:

```typescript
process.stderr.clearLine(0)   // 1. Erase current line
process.stderr.cursorTo(0)    // 2. Move cursor to start
process.stderr.write(output)  // 3. Write new content (no newline)
```

### Why Each Step Matters

**`clearLine(0)`** - Erases everything on the current line. The `0` means "entire line."

**`cursorTo(0)`** - Moves the cursor back to column 0 (the beginning). Without this, you'd write starting wherever the cursor was left.

**`write()` vs `console.log()`** - The key difference:
- `console.log("hi")` outputs `hi\n` — adds a newline, cursor moves down
- `process.stderr.write("hi")` outputs `hi` — no newline, cursor stays at end

## Why stderr?

We write progress to `stderr` so it doesn't interfere with piped output:

```bash
curly -n 100 https://api.example.com > results.txt
```

| Stream | Goes to | Contains |
|--------|---------|----------|
| stdout | results.txt | Actual data (stats, JSON) |
| stderr | Terminal | Progress bar, errors |

This is a Unix convention: `stdout` for data, `stderr` for status messages.

## Visual Walkthrough

```
Initial state:
|                         <- cursor at start, line empty

After write("[██░░] 1/3"):
[██░░] 1/3|               <- cursor at end

Before next update - clearLine(0):
          |               <- line erased, cursor still at end

After cursorTo(0):
|                         <- cursor moves to start

After write("[████] 2/3"):
[████] 2/3|               <- new content, same line
```

## TTY Detection

Progress bars only make sense in interactive terminals. When output is piped or redirected, we skip the progress:

```typescript
this.isInteractive = process.stderr.isTTY ?? false

if (this.isInteractive) {
  this.render()
}
```

This prevents garbage characters in log files or piped output.
