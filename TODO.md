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

---

## Feature Implementation Checklist

When adding a new CLI flag or feature, update these locations:

| Location | File | Always? | Description |
|----------|------|---------|-------------|
| CLI Parser | `src/lib/cli/parser.ts` | ✓ | Define flag in `options` object |
| Types | `src/types.ts` | ✓ | Add to `FetchOptions` interface |
| Help Text | `src/lib/cli/help.ts` | ✓ | Add description and examples |
| Bash Completions | `src/commands/completions/scripts.ts` | ✓ | Add to `OPTIONS` array and case handling |
| Zsh Completions | `src/commands/completions/scripts.ts` | ✓ | Add `_arguments` entry |
| README Options Table | `README.md` | ✓ | Add row to options table |
| README Examples | `README.md` | ✓ | Add usage examples |
| Example Scripts | `examples/*.sh` | ✓ | Add working examples to appropriate file |
| Profile Schema | `src/lib/utils/config.ts` | If saveable | Add to `Profile` interface |
| Alias Schema | `src/lib/utils/aliases.ts` | If saveable | Add to `SavedAlias` interface |
| HTTP Client | `src/core/http/client.ts` | If affects requests | Implement behavior |
| Main Entry | `src/index.ts` | If special handling | Add early exit or validation |

**Example file mapping:**
- Output flags → `examples/06-output-control.sh`
- Auth flags → `examples/02-headers-and-auth.sh`
- Load test flags → `examples/09-load-testing.sh`
- Error handling → `examples/07-error-handling.sh`

---

## Upcoming Features

### Remove Unit Tests

Consolidate testing strategy around the `examples/` directory for end-to-end validation rather than maintaining unit tests.

---

#### Rationale

- E2E tests via shell scripts test actual CLI behavior
- Unit tests add maintenance burden without proportional value
- Examples serve dual purpose: documentation and testing

---

#### Implementation

- [ ] Remove `src/__tests__/` directory
- [ ] Remove vitest from devDependencies in `package.json`
- [ ] Remove `test` script from `package.json`
- [ ] Update `prepublishOnly` script to exclude test step
- [ ] Ensure `examples/run-all-examples.sh` covers all critical paths
- [ ] Update CLAUDE.md to reflect testing philosophy

---

### ~~Dry Run Mode (`--dry-run`)~~ ✓

~~Validate and display request details without actually sending the HTTP request. Useful for debugging complex requests.~~

---

#### Usage

```bash
curly https://api.example.com/users \
  -X POST \
  -H "Authorization: Bearer {{TOKEN}}" \
  -d '{"name": "test"}' \
  --dry-run
```

**Output:**
```
DRY RUN - Request not sent

Method:  POST
URL:     https://api.example.com/users
Headers:
  Authorization: Bearer sk-xxx...
  Content-Type: application/json
Body:
  {"name": "test"}
```

---

#### Implementation

**1. CLI Parser** (`src/lib/cli/parser.ts`)
```typescript
dryRun: { type: 'boolean', short: 'n' }  // Note: -n conflicts with requests count
// Consider: --dry-run only (no short form) to avoid conflicts
```

**2. Types** (`src/types.ts`)
```typescript
dryRun?: boolean
```

**3. Main Entry** (`src/index.ts`)
- After building the request config, check `options.dryRun`
- If true, print formatted request details and exit before `fetch()`
- Show: method, full URL (with query params), headers, body (truncated if large)

**4. Help Text** (`src/lib/cli/help.ts`)
- Add under a "Debugging" section

**5. Documentation**
- [x] Add to README options table
- [x] Add to `examples/07-error-handling.sh` (or create new `examples/14-debugging.sh`)
- [x] Update bash/zsh completions

---

### ~~JSON Output Mode (`--json`)~~ ✓

~~Output structured JSON containing request metadata, response headers, timing, and body for programmatic consumption.~~

---

#### Usage

```bash
# Pipe to jq for processing
curly https://api.example.com/users --json | jq '.timing.total'

# Save structured response
curly https://api.example.com/users --json -o response.json
```

**Output:**
```json
{
  "request": {
    "method": "GET",
    "url": "https://api.example.com/users"
  },
  "response": {
    "status": 200,
    "statusText": "OK",
    "headers": {
      "content-type": "application/json",
      "x-request-id": "abc123"
    }
  },
  "timing": {
    "total": 145
  },
  "body": { ... }
}
```

---

#### Implementation

**1. CLI Parser** (`src/lib/cli/parser.ts`)
```typescript
json: { type: 'boolean', short: 'j' }
```

**2. Types** (`src/types.ts`)
```typescript
json?: boolean
```

**3. Output Formatter** (`src/lib/output/formatters.ts`)
- Create `formatJsonOutput()` function
- Collect: request config, response status/headers, timing, body
- Output single JSON object to stdout

**4. Main Entry** (`src/index.ts`)
- If `options.json`, use JSON formatter instead of default output
- Suppress status line and other decorative output

**5. Documentation**
- [x] Add to README options table
- [x] Add to `examples/06-output-control.sh`
- [x] Update bash/zsh completions
- [x] Note: differs from `--quiet` (which just suppresses status line)

---

### ~~Load Test Export Formats~~ ✓

~~Export load test results to JSON or CSV for reporting and analysis.~~

---

#### Usage

```bash
# Export to JSON
curly https://api.example.com -n 1000 -c 50 --export json -o results.json

# Export to CSV
curly https://api.example.com -n 1000 -c 50 --export csv -o results.csv
```

---

#### Export Formats

**JSON** - Machine-readable, includes all metrics:
```json
{
  "summary": {
    "totalRequests": 1000,
    "successful": 987,
    "failed": 13,
    "duration": 23.4
  },
  "latency": {
    "min": 12,
    "max": 456,
    "avg": 67,
    "p50": 45,
    "p90": 112,
    "p99": 198
  },
  "statusCodes": { "200": 987, "500": 13 },
  "histogram": [ ... ],
  "timeSeries": [ ... ]
}
```

**CSV** - For spreadsheet analysis:
```csv
timestamp,latency_ms,status_code,success
1705849200000,45,200,true
1705849200010,67,200,true
...
```

---

#### Implementation

**1. CLI Parser** (`src/lib/cli/parser.ts`)
```typescript
export: { type: 'string' }  // 'json' | 'csv'
```

**2. Types** (`src/types.ts`)
```typescript
export?: 'json' | 'csv'
```

**3. New Module** (`src/commands/load-test/export/`)
```
src/commands/load-test/export/
├── index.ts      # Export orchestrator
├── json.ts       # JSON formatter
└── csv.ts        # CSV formatter
```

**4. Load Test Command** (`src/commands/load-test/index.ts`)
- After test completion, check `options.export`
- Call appropriate exporter with stats data
- Write to `-o` file or stdout

**5. Documentation**
- [x] Add to README options table
- [x] Add to `examples/09-load-testing.sh`
- [x] Update bash/zsh completions (with format choices)

---

### Config Init Wizard (`curly --init`)

Interactive wizard to generate `~/.config/curly/config.json` with common settings and profiles.

---

#### Usage

```bash
curly --init
```

**Interactive Flow:**
```
Welcome to Curly! Let's set up your configuration.

? Do you want to set a default base URL? (y/N) y
? Base URL: https://api.mycompany.com

? Create a profile? (Y/n) y
? Profile name: production
? Base URL for 'production': https://api.mycompany.com
? Default headers? (e.g., Authorization: Bearer {{TOKEN}})
  > Authorization: Bearer {{API_TOKEN}}
  > (empty to finish)

? Create another profile? (y/N) y
? Profile name: staging
? Base URL for 'staging': https://staging-api.mycompany.com

Configuration saved to ~/.config/curly/config.json

Tip: Use profiles with -p flag:
  curly /users -p production
```

---

#### Implementation

**1. CLI Parser** (`src/lib/cli/parser.ts`)
```typescript
init: { type: 'boolean' }
```

**2. Main Entry** (`src/index.ts`)
- Early exit handler for `--init` (like `--help`, `--version`)
- Call init wizard function

**3. New Module** (`src/commands/init/`)
```
src/commands/init/
├── index.ts      # Wizard orchestrator
├── prompts.ts    # Question definitions
└── writer.ts     # Config file writer
```

**4. Dependencies**
- Consider using Node's built-in `readline` for prompts (no new deps)
- Or lightweight prompt library if needed

**5. Features**
- Detect existing config and offer to merge/overwrite
- Validate URLs and header formats
- Show example usage after completion

**6. Documentation**
- [ ] Add to README options table
- [ ] Add to `examples/10-profiles-aliases.sh`
- [ ] Update bash/zsh completions
- [ ] Add "Getting Started" section to README referencing `--init`

---

### CI/CD Integration

GitHub Actions workflows for automated testing and publishing.

---

#### Workflows

**1. Test on PR** (`.github/workflows/test.yml`)
- Trigger: Pull requests to main
- Steps: Install deps, type check, lint, run examples
- Matrix: Node 20.x, 22.x

**2. Publish on Release** (`.github/workflows/publish.yml`)
- Trigger: New GitHub release or version tag
- Steps: Build, publish to npm
- Requires: `NPM_TOKEN` secret

---

#### Implementation

**1. Test Workflow** (`.github/workflows/test.yml`)
```yaml
name: Test
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x, 22.x]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run types
      - run: npm run lint
      - run: npm run build
      - run: ./examples/run-all-examples.sh
```

**2. Publish Workflow** (`.github/workflows/publish.yml`)
```yaml
name: Publish
on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20.x
          registry-url: https://registry.npmjs.org
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**3. Setup**
- [ ] Create `.github/workflows/` directory
- [ ] Add `test.yml` workflow
- [ ] Add `publish.yml` workflow
- [ ] Add `NPM_TOKEN` to repository secrets
- [ ] Update `examples/run-all-examples.sh` to exit with proper codes for CI

**4. Documentation**
- [ ] Add CI badge to README
- [ ] Document release process in CONTRIBUTING.md (if created)
