#!/usr/bin/env node

import { main } from '../dist/index.js'
import fs from 'fs'
import { fileURLToPath } from 'url'

const packageJsonPath = fileURLToPath(new URL('../package.json', import.meta.url))
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath))

// TODO: probably should use semver package. This should do for now though...
const requiredNodeVersion = Number(packageJson.engines?.node.slice(2)) ?? 20
const currentNodeVersion = Number(process.versions.node.split('.')[0])

if (currentNodeVersion < requiredNodeVersion) {
  console.error(
    `Required node version: ${requiredNodeVersion} is less than your current node version: ${currentNodeVersion} `,
  )
}

main()
