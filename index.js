#!/usr/bin/env node

import fs from "fs";
import path from "path";

const command = process.argv[2];

const root = process.cwd();
const devsmithDir = path.join(root, ".devsmith");
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

## Stack
- Not detected yet.

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

function getFiles(dir) {
  const ignored = new Set([
    ".git",
    ".devsmith",
    "node_modules",
    "dist",
    "build",
    ".next",
  ]);

  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function detectStack(files) {
  const stack = new Set();

  for (const file of files) {
    const name = path.basename(file);
    const ext = path.extname(file);

    if (ext === ".js" || ext === ".jsx") stack.add("JavaScript");
    if (ext === ".ts" || ext === ".tsx") stack.add("TypeScript");
    if (ext === ".go") stack.add("Go");
    if (ext === ".java") stack.add("Java");
    if (ext === ".py") stack.add("Python");
    if (ext === ".rs") stack.add("Rust");
    if (ext === ".cpp" || ext === ".cc" || ext === ".h") stack.add("C++");

    if (name === "package.json") {
      stack.add("Node.js");

      try {
        const packageJson = JSON.parse(
          fs.readFileSync(file, "utf8")
        );

        const dependencies = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        const frameworks = {
          react: "React",
          next: "Next.js",
          express: "Express",
          fastify: "Fastify",
          vue: "Vue",
          angular: "Angular",
          svelte: "Svelte",
          vite: "Vite",
          tailwindcss: "Tailwind CSS",
          typescript: "TypeScript",
        };

        for (const dependency of Object.keys(dependencies)) {
          if (frameworks[dependency]) {
            stack.add(frameworks[dependency]);
          }
        }
      } catch {
        // Ignore invalid package.json
      }
    }

    if (name === "go.mod") stack.add("Go");
    if (name === "pom.xml") stack.add("Java / Maven");
    if (name === "requirements.txt") stack.add("Python");
  }

  return [...stack];
}

function context() {
  if (!fs.existsSync(devsmithDir)) {
    console.log("DevSmith is not initialized. Run `devsmith init` first.");
    return;
  }

  const files = getFiles(root);
  const stack = detectStack(files);
  const projectName = path.basename(root);

  let memory = fs.readFileSync(memoryFile, "utf8");

  memory = memory.replace(
    /- Name: .*/,
    `- Name: ${projectName}`
  );

  if (stack.length > 0) {
    const stackSection = stack.map((item) => `- ${item}`).join("\n");

    memory = memory.replace(
      /## Stack\n[\s\S]*?(?=\n## Architecture)/,
      `## Stack\n${stackSection}\n`
    );
  }

  fs.writeFileSync(memoryFile, memory);

  console.log("DevSmith context updated.");
}

if (command === "init") {
  init();
} else if (command === "context") {
  context();
} else {
  console.log("Hello from Maurya Suryakant - Devsmith");
}