# TODO

## Features

### Interactive TUI for Load Testing

A real-time terminal UI dashboard for load testing that displays live metrics, charts, and statistics during test execution.

---

#### Overview

The TUI provides a visual dashboard during load tests, showing progress, latency charts, status code distribution, and percentiles in real-time. It's opt-in and gracefully degrades in non-TTY environments.

**Inspiration:**

- [ali](https://github.com/nakabonne/ali) - HTTP load testing with embedded terminal UI
- [vegeta + jplot](https://github.com/tsenart/vegeta) - Real-time terminal charts
- [blessed-contrib](https://github.com/yaronn/blessed-contrib) - Node.js terminal dashboards

---

#### Activation Methods

**1. CLI Flag**

```bash
curly https://api.example.com -n 1000 -c 50 --tui
curly https://api.example.com -n 1000 -c 50 -T   # short form
```

**2. Profile Setting**

```json
{
  "profiles": {
    "load-test": {
      "baseUrl": "https://api.example.com",
      "requests": 1000,
      "concurrency": 50,
      "tui": true
    }
  }
}
```

**3. Environment Variable**

```bash
CURLY_TUI=1 curly https://api.example.com -n 1000 -c 50
```

**Precedence:** CLI flag > Environment variable > Profile setting

Non-TTY environments (CI, piped output) automatically disable TUI regardless of settings.

---

#### TUI Layout

**Full Layout (≥80 columns)**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Curly Load Test: https://api.example.com/users                             │
│  Requests: 1000 | Concurrency: 50 | Profile: production                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Progress: ████████████████████░░░░░░░░░░░░░░░░░  523/1000 (52.3%)         │
│  Elapsed: 12.4s | ETA: 11.2s | RPS: 42.1                                    │
│                                                                             │
├───────────────────────────────────┬─────────────────────────────────────────┤
│  Request Rate (req/s)             │  Latency (ms)                           │
│       ╭──────────────╮            │       ╭──────────────╮                  │
│   50 ─┤    ╭─╮  ╭───╮│            │  200 ─┤         ╭────│                  │
│   40 ─┤   ╭╯ ╰──╯   ││            │  150 ─┤    ╭────╯    │                  │
│   30 ─┤  ╭╯         ││            │  100 ─┤╭───╯         │                  │
│   20 ─┤ ╭╯          ╰│            │   50 ─┤╯             │                  │
│       ╰──────────────╯            │       ╰──────────────╯                  │
├───────────────────────────────────┴─────────────────────────────────────────┤
│  Latency Distribution                                                        │
│  0-50ms   ████████████████████████████████  312 (59.7%)                     │
│  50-100ms ████████████████                  156 (29.8%)                      │
│  100-150ms ████                              42 (8.0%)                       │
│  150-200ms █                                  9 (1.7%)                       │
│  200ms+   ░                                   4 (0.8%)                       │
├───────────────────────────────────┬─────────────────────────────────────────┤
│  Status Codes                     │  Percentiles                            │
│  2xx ████████████████████ 489     │  p50:   45ms                            │
│  3xx ██                    23     │  p75:   78ms                            │
│  4xx █                      8     │  p90:  112ms                            │
│  5xx ░                      3     │  p99:  198ms                            │
├───────────────────────────────────┴─────────────────────────────────────────┤
│  [Space] Pause  [+/-] Adjust RPS  [r] Reset Stats  [q] Quit                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Compact Layout (<80 columns)**

```
┌─────────────────────────────────────────────┐
│ Curly: https://api.example.com/users        │
├─────────────────────────────────────────────┤
│ ████████████░░░░░░░░  523/1000 (52.3%)      │
│ RPS: 42.1 | Avg: 67ms | Errors: 3           │
├─────────────────────────────────────────────┤
│ 2xx: 489  3xx: 23  4xx: 8  5xx: 3           │
│ p50: 45ms  p95: 145ms  p99: 198ms           │
├─────────────────────────────────────────────┤
│ [Space] Pause  [q] Quit                     │
└─────────────────────────────────────────────┘
```

---

#### Keyboard Controls

| Key | Action | Description |
|-----|--------|-------------|
| `Space` | Pause/Resume | Cancel in-flight requests and halt dispatch |
| `q` / `Ctrl+C` | Quit | Stop test and show final summary |
| `+` / `-` | Adjust RPS | Increase/decrease concurrency by 10% |
| `r` | Reset Stats | Clear accumulated metrics |
| `?` | Help | Show keyboard shortcuts |

---

#### Metrics Displayed

**Real-time (updated every 100ms)**
- Requests completed / total
- Current RPS (rolling 1s average)
- Average latency
- Error count
- Active connections

**Aggregated**
- Total duration
- Fastest / Slowest / Average response time
- Percentiles: p50, p75, p90, p95, p99
- Status code distribution (2xx, 3xx, 4xx, 5xx)
- Latency histogram (10 buckets)

---

#### Graceful Degradation

**Non-TTY environments** (piped output, CI):
- Falls back to simple text progress bar
- Periodic stat updates every 5 seconds
- No interactive controls

**Terminal resize**:
- Auto-switches between full and compact layouts
- Minimum: 45 columns for compact, 80 for full

---

#### CLI Flags

```bash
--tui, -T         # Enable TUI mode
--tui-compact     # Force compact layout
```

---

#### Library Recommendation

**Primary: [Ink](https://github.com/vadimdemedes/ink)**
- React-based component model
- Active maintenance, good TypeScript support
- Flexbox layout for responsive design

**Charts: [asciichart](https://github.com/kroitor/asciichart)**
- Lightweight, no dependencies
- Simple API for time-series rendering

---

#### Module Structure

```
src/commands/load-test/
├── index.ts           # Entry point (existing)
├── stats.ts           # Stats collection (existing)
└── tui/
    ├── index.ts       # TUI orchestrator
    ├── layout.ts      # Layout management
    └── components/
        ├── progress.ts
        ├── chart.ts
        ├── histogram.ts
        ├── stats.ts
        └── controls.ts
```

---

#### Implementation Phases

**Phase 1: Foundation**
- [ ] Add `--tui` / `-T` flag to CLI parser
- [ ] Add `tui: boolean` to profile schema
- [ ] Create basic TUI module structure
- [ ] Implement progress bar and stats display

**Phase 2: Core Features**
- [ ] Add time-series charts (RPS, latency)
- [ ] Add latency histogram
- [ ] Add status code distribution
- [ ] Implement keyboard controls (pause/quit)

**Phase 3: Polish**
- [ ] Add interactive rate adjustment (+/-)
- [ ] Implement compact layout
- [ ] Add terminal resize handling
- [ ] Add graceful degradation for non-TTY

**Phase 4: Future Enhancements** (optional)
- [ ] Add `tuiConfig` for customization (refresh rate, chart height, etc.)
- [ ] Color themes
- [ ] Export results to JSON/HTML report
- [ ] Comparison mode vs. previous run

---

#### Open Questions

1. **Chart history**: How many seconds of time-series data to display? (Suggest: 60s rolling window)

2. **Memory**: Should we cap data points to prevent growth during long tests?

3. **Sound**: Support audio alerts for completion/errors?

---

## Housekeeping

### Publish to NPM

#### Pre-publish Checklist

1. **Verify package.json fields:**
   - [ ] Add `"license": "MIT"` (or appropriate license)
   - [ ] Add `"repository"` field pointing to GitHub repo
   - [ ] Add `"files"` field to control what gets published (e.g., `["dist", "bin"]`)
   - [ ] Consider adding `"homepage"` and `"bugs"` URLs
   - [ ] Update `"keywords"` for discoverability

2. **Add recommended scripts to package.json:**
   ```json
   "prepublishOnly": "npm run types && npm run lint && npm run test && npm run build"
   ```

3. **Ensure build is clean:**
   ```sh
   npm run types && npm run lint && npm run test
   ```

#### Publishing Steps

1. **Create npm account** (if needed):
   - Sign up at https://www.npmjs.com/signup
   - Enable 2FA for security

2. **Login to npm:**
   ```sh
   npm login
   ```

3. **For scoped packages (`@cwl/curly`), choose visibility:**
   - Public (free): `npm publish --access public`
   - Private (requires paid plan): `npm publish`

4. **Dry run first** to see what will be published:
   ```sh
   npm publish --dry-run
   ```

5. **Publish:**
   ```sh
   npm publish --access public
   ```

#### Version Management

Use semantic versioning and npm's version command:

```sh
npm version patch  # 0.0.1 → 0.0.2 (bug fixes)
npm version minor  # 0.0.2 → 0.1.0 (new features)
npm version major  # 0.1.0 → 1.0.0 (breaking changes)
```

This automatically:
- Updates package.json version
- Creates a git commit
- Creates a git tag

Then push with tags:
```sh
git push && git push --tags
```

#### Post-publish Verification

```sh
# Install globally to test
npm install -g @cwl/curly

# Verify it works
curly --version
curly --help

# Check the package page
open https://www.npmjs.com/package/@cwl/curly
```

#### Optional: Automate with GitHub Actions

Consider adding `.github/workflows/publish.yml` to auto-publish on new tags/releases.
