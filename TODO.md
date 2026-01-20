# TODO

## Features

### Interactive TUI for load testing

Explore adding a real-time terminal UI dashboard for load testing that displays live metrics, charts, and statistics during test execution.

**Inspiration:**

- [ali](https://github.com/nakabonne/ali) - HTTP load testing with embedded terminal UI, real-time latency charts, percentiles, and zoomable graphs
- [vegeta + jplot](https://github.com/tsenart/vegeta) - Vegeta integrates with jplot/jaggr for real-time terminal charts
- [blessed-contrib](https://github.com/yaronn/blessed-contrib) - Node.js terminal dashboards with charts, maps, and gauges

**Potential features:**

- Live request rate and latency charts
- Response code distribution histogram
- P50/P95/P99 percentile tracking
- Error rate visualization
- Interactive controls (pause/resume, adjust rate)

**Libraries to evaluate:**

- [blessed](https://github.com/chjj/blessed) / [blessed-contrib](https://github.com/yaronn/blessed-contrib) - Terminal UI for Node.js
- [ink](https://github.com/vadimdemedes/ink) - React for CLI apps
- [terminal-kit](https://github.com/cronvel/terminal-kit) - Terminal utilities with drawing capabilities

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
