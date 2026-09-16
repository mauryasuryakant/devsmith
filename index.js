#!/usr/bin/env node

import fs from "fs";
import path from "path";

const command = process.argv[2];

const devsmithDir = path.join(process.cwd(), ".devsmith");
const memoryFile = path.join(devsmithDir, "memory.md");
const stateFile = path.join(devsmithDir, "state.json");

function init() {
  if (fs.existsSync(devsmithDir)) {
    console.log("DevSmith is already initialized.");
    return;
  }

  fs.mkdirSync(devsmithDir);

  fs.writeFileSync(
    memoryFile,
    `# DevSmith Memory

## Project
- Name: unknown
- Description: unknown

## Architecture
- Not detected yet.

## Decisions
- None yet.

## Conventions
- None yet.
`
  );

  fs.writeFileSync(
    stateFile,
    JSON.stringify(
      {
        version: 1,
        initializedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  console.log("DevSmith initialized.");
}

if (command === "init") {
  init();
} else {
  console.log("Hello from Maurya Suryakant - Devsmith");
}
