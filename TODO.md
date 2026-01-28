# TODO

## Features

### Response Diffing

Compare responses between environments or over time to detect API changes.

---

#### Usage

```bash
# Save a baseline using -o
curly --quiet -o baseline.json https://api.example.com/users

# Compare against saved baseline
curly https://api.example.com/users --diff baseline.json

# Compare between profiles/environments (future)
curly diff /api/users -p staging -p production

# Diff specific fields only (future)
curly diff /api/users -p staging -p production --diff-only '.data'

# Ignore volatile fields (future)
curly diff /api/users -p staging -p production --diff-ignore '.timestamp,.requestId'
```

#### Output

```
Comparing: staging vs production
Endpoint:  /api/users

 {
   "users": [
     {
       "id": 1,
-      "name": "John Doe",
+      "name": "John D.",
       "email": "john@example.com"
     }
   ],
-  "total": 10
+  "total": 12
 }

Differences: 2 fields changed
```

#### Implementation Considerations

- Side-by-side and unified diff formats
- JSON-aware diffing (ignore key order, format differences)
- Field filtering with `--diff-only` and `--diff-ignore`
- Exit codes for CI integration (0 = same, 1 = different)
- HTML report output option

---

#### Implementation Phases

**Phase 1: Foundation** ✓

- [x] Add `--diff` flag to CLI parser
- [x] Add types to `FetchOptions`
- [x] Create `src/commands/diff/` module structure
- [x] Implement JSON-aware recursive diffing algorithm (`diff.ts`)
- [x] Implement LCS-based unified diff formatting (`format.ts`)
- [x] Implement orchestrator with baseline load and comparison (`index.ts`)
- [x] Wire into `stdout()` in formatters following existing patterns
- [x] Add help text
- [x] Add bash/zsh completions
- [x] Add README documentation
- [x] Add example script (`14-diffing.sh`)

**Phase 2: Field Filtering**

- [ ] Implement `--diff-only` path filtering
- [ ] Implement `--diff-ignore` path filtering
- [ ] Add examples and documentation for filtering

**Phase 3: Profile Comparison**

- [ ] Add `curly diff` subcommand mode
- [ ] Support `-p staging -p production` dual-profile comparison
- [ ] Execute both requests and diff the responses

**Phase 4: Polish**

- [ ] Side-by-side diff format option
- [ ] HTML report output
- [ ] Comparison mode vs. previous run

---

### Mock Server Mode

Spin up a lightweight mock server from recorded responses for local development and testing.

---

#### Usage

```bash
# Start mock server from recorded session
curly mock --port 3000 --from recorded-session.json

# Record responses for mocking
curly https://api.example.com/users --record-mock mocks/users.json

# Mock with latency simulation
curly mock --port 3000 --from mocks/ --latency 100-500ms

# Mock with custom response rules
curly mock --port 3000 --config mock-config.json
```

#### Mock Configuration

```json
{
  "port": 3000,
  "routes": [
    {
      "path": "/users",
      "method": "GET",
      "response": { "file": "fixtures/users.json" },
      "delay": "100ms"
    },
    {
      "path": "/users/:id",
      "method": "GET",
      "response": { "status": 404, "body": { "error": "Not found" } }
    }
  ]
}
```

#### Implementation Considerations

- Built on Node's native HTTP server (no deps)
- Directory-based mocking (path → file mapping)
- Response delay simulation for realistic testing
- Request logging for debugging
- Hot reload when mock files change

---

## Feature Implementation Checklist

When adding a new CLI flag or feature, update these locations:

| Location             | File                                  | Always?             | Description                              |
| -------------------- | ------------------------------------- | ------------------- | ---------------------------------------- |
| CLI Parser           | `src/lib/cli/parser.ts`               | ✓                   | Define flag in `options` object          |
| Types                | `src/types.ts`                        | ✓                   | Add to `FetchOptions` interface          |
| Help Text            | `src/lib/cli/help.ts`                 | ✓                   | Add description and examples             |
| Bash Completions     | `src/commands/completions/scripts.ts` | ✓                   | Add to `OPTIONS` array and case handling |
| Zsh Completions      | `src/commands/completions/scripts.ts` | ✓                   | Add `_arguments` entry                   |
| README Options Table | `README.md`                           | ✓                   | Add row to options table                 |
| README Examples      | `README.md`                           | ✓                   | Add usage examples                       |
| Example Scripts      | `examples/*.sh`                       | ✓                   | Add working examples to appropriate file |
| Profile Schema       | `src/lib/utils/config.ts`             | If saveable         | Add to `Profile` interface               |
| Alias Schema         | `src/lib/utils/aliases.ts`            | If saveable         | Add to `SavedAlias` interface            |
| HTTP Client          | `src/core/http/client.ts`             | If affects requests | Implement behavior                       |
| Main Entry           | `src/index.ts`                        | If special handling | Add early exit or validation             |

**Example file mapping:**

- Output flags → `examples/06-output-control.sh`
- Auth flags → `examples/02-headers-and-auth.sh`
- Load test flags → `examples/09-load-testing.sh`
- Error handling → `examples/07-error-handling.sh`
- Diffing → `examples/14-diffing.sh`

### Docs

- ~~Add doc for TUI~~ ✓
- ~~Add doc for diffing algorithm~~ ✓
