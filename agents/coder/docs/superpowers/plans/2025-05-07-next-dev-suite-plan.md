# Next Dev Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `create-next-pro` CLI tool that scaffolds Next.js projects with best practices and includes a zero-config API mocking system.

**Architecture:** CLI built with Node.js + Commander.js, template engine for project scaffolding, mock API server with file watching and hot reload, separate packages for reusability.

**Tech Stack:** Node.js 18+, TypeScript, Commander.js, Inquirer.js, Chokidar, Express.js, Vitest

---

## File Structure Map

```
create-next-pro/
├── bin/
│   └── create-next-pro.js              # CLI entry point
├── src/
│   ├── cli.ts                          # Argument parsing
│   ├── prompts.ts                      # Interactive prompts
│   ├── template.ts                     # Template engine
│   ├── utils.ts                        # File utilities
│   └── types.ts                        # TypeScript types
├── templates/
│   ├── basic/
│   │   ├── src/
│   │   │   └── app/
│   │   │       ├── layout.tsx
│   │   │       └── page.tsx
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   └── next.config.js
│   └── with-mock/
│       ├── mocks/
│       │   ├── _config.js
│       │   └── users.json
│       └── src/
│           └── lib/
│               └── mock-client.ts
├── tests/
│   ├── cli.test.ts
│   ├── template.test.ts
│   └── utils.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "create-next-pro",
  "version": "1.0.0",
  "description": "CLI tool to scaffold Next.js projects with built-in mock API",
  "main": "dist/index.js",
  "bin": {
    "create-next-pro": "./bin/create-next-pro.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest",
    "test:run": "vitest run",
    "lint": "eslint src --ext .ts",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["next.js", "cli", "scaffold", "mock-api"],
  "author": "",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "commander": "^11.0.0",
    "inquirer": "^9.2.0",
    "chalk": "^5.3.0",
    "ora": "^7.0.0",
    "fs-extra": "^11.1.0",
    "chokidar": "^3.5.0",
    "express": "^4.18.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/fs-extra": "^11.0.0",
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "typescript": "^5.2.0",
    "vitest": "^0.34.0",
    "eslint": "^8.50.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 3: Create .gitignore**

```gitignore
node_modules/
dist/
*.log
.DS_Store
coverage/
*.tsbuildinfo
.env
.env.local
```

- [ ] **Step 4: Install dependencies**

```bash
npm install
```

Expected output: `added X packages in Xs`

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json .gitignore
git commit -m "chore: initial project setup"
```

---

## Task 2: Type Definitions

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: Create types.ts**

```typescript
export interface CLIOptions {
  template?: string;
  withMock?: boolean;
  pm?: 'npm' | 'yarn' | 'pnpm';
  typescript?: boolean;
  tailwind?: boolean;
  eslint?: boolean;
  skipInstall?: boolean;
  force?: boolean;
}

export interface PromptAnswers {
  projectName: string;
  template: string;
  withMock: boolean;
  pm: 'npm' | 'yarn' | 'pnpm';
  initializeGit: boolean;
}

export interface TemplateConfig {
  name: string;
  description: string;
  dependencies: string[];
  devDependencies: string[];
}

export interface MockConfig {
  port: number;
  delay: number;
  cors: boolean;
  basePath: string;
}

export interface MockHandler {
  GET?: (req: any, res: any) => void;
  POST?: (req: any, res: any) => void;
  PUT?: (req: any, res: any) => void;
  DELETE?: (req: any, res: any) => void;
  PATCH?: (req: any, res: any) => void;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
```

- [ ] **Step 2: Commit**

```bash
git add src/types.ts
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 3: Utility Functions

**Files:**
- Create: `src/utils.ts`
- Test: `tests/utils.test.ts`

- [ ] **Step 1: Create utils.ts**

```typescript
import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';

export function validateProjectName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Project name cannot be empty' };
  }
  
  if (!/^[a-z0-9-_]+$/i.test(name)) {
    return { valid: false, error: 'Project name can only contain letters, numbers, hyphens, and underscores' };
  }
  
  if (fs.existsSync(name)) {
    return { valid: false, error: `Directory "${name}" already exists` };
  }
  
  return { valid: true };
}

export function copyTemplate(src: string, dest: string, variables: Record<string, string>): void {
  fs.copySync(src, dest);
  
  const files = fs.readdirSync(dest, { recursive: true }) as string[];
  
  for (const file of files) {
    const filePath = path.join(dest, file);
    if (fs.statSync(filePath).isFile()) {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
      
      fs.writeFileSync(filePath, content);
    }
  }
}

export function installDependencies(projectPath: string, packageManager: string): void {
  const command = packageManager === 'yarn' ? 'yarn' : `${packageManager} install`;
  execSync(command, { cwd: projectPath, stdio: 'inherit' });
}

export function initializeGit(projectPath: string): void {
  execSync('git init', { cwd: projectPath, stdio: 'ignore' });
  execSync('git add .', { cwd: projectPath, stdio: 'ignore' });
  execSync('git commit -m "Initial commit from create-next-pro"', { cwd: projectPath, stdio: 'ignore' });
}

export function getPackageManagerVersion(pm: string): string | null {
  try {
    const output = execSync(`${pm} --version`, { encoding: 'utf-8' });
    return output.trim();
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Create utils.test.ts**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import { validateProjectName, copyTemplate, getPackageManagerVersion } from '../src/utils';

describe('validateProjectName', () => {
  const testDir = path.join(__dirname, 'test-project');
  
  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.removeSync(testDir);
    }
  });
  
  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.removeSync(testDir);
    }
  });
  
  it('should accept valid project names', () => {
    expect(validateProjectName('my-app')).toEqual({ valid: true });
    expect(validateProjectName('MyApp')).toEqual({ valid: true });
    expect(validateProjectName('my_app_123')).toEqual({ valid: true });
  });
  
  it('should reject empty names', () => {
    expect(validateProjectName('')).toEqual({ 
      valid: false, 
      error: 'Project name cannot be empty' 
    });
  });
  
  it('should reject names with special characters', () => {
    expect(validateProjectName('my app')).toEqual({ 
      valid: false, 
      error: 'Project name can only contain letters, numbers, hyphens, and underscores' 
    });
  });
  
  it('should reject existing directories', () => {
    fs.ensureDirSync(testDir);
    expect(validateProjectName('test-project')).toEqual({ 
      valid: false, 
      error: 'Directory "test-project" already exists' 
    });
  });
});

describe('copyTemplate', () => {
  const srcDir = path.join(__dirname, 'test-src');
  const destDir = path.join(__dirname, 'test-dest');
  
  beforeEach(() => {
    fs.ensureDirSync(srcDir);
    fs.writeFileSync(path.join(srcDir, 'test.txt'), 'Hello {{name}}!');
  });
  
  afterEach(() => {
    fs.removeSync(srcDir);
    fs.removeSync(destDir);
  });
  
  it('should copy files with variable substitution', () => {
    copyTemplate(srcDir, destDir, { name: 'World' });
    const content = fs.readFileSync(path.join(destDir, 'test.txt'), 'utf-8');
    expect(content).toBe('Hello World!');
  });
});

describe('getPackageManagerVersion', () => {
  it('should return version for npm', () => {
    const version = getPackageManagerVersion('npm');
    expect(version).toBeTruthy();
    expect(version).toMatch(/^\d+\.\d+/);
  });
});
```

- [ ] **Step 3: Run tests to verify they pass**

```bash
npm run test:run
```

Expected output: All tests pass (3 passed)

- [ ] **Step 4: Commit**

```bash
git add src/utils.ts tests/utils.test.ts
git commit -m "feat: add utility functions with tests"
```

---

## Task 4: CLI Argument Parser

**Files:**
- Create: `src/cli.ts`
- Test: `tests/cli.test.ts`

- [ ] **Step 1: Create cli.ts**

```typescript
import { Command } from 'commander';
import { CLIOptions } from './types';

const program = new Command();

export function parseArguments(): CLIOptions {
  program
    .name('create-next-pro')
    .description('CLI to scaffold Next.js projects with built-in mock API')
    .version('1.0.0')
    .argument('[project-name]', 'Name of the project to create')
    .option('-t, --template <name>', 'Template to use (basic, full-stack, with-mock)')
    .option('--with-mock', 'Include mock API server')
    .option('--pm <manager>', 'Package manager (npm, yarn, pnpm)', 'npm')
    .option('--typescript', 'Use TypeScript', true)
    .option('--tailwind', 'Include Tailwind CSS', true)
    .option('--eslint', 'Include ESLint', true)
    .option('--skip-install', 'Skip dependency installation')
    .option('--force', 'Overwrite existing directory')
    .parse();

  const options = program.opts();
  const [projectName] = program.args;

  return {
    template: options.template,
    withMock: options.withMock,
    pm: options.pm,
    typescript: options.typescript,
    tailwind: options.tailwind,
    eslint: options.eslint,
    skipInstall: options.skipInstall,
    force: options.force,
  };
}

export function getProjectNameFromArgs(): string | undefined {
  return program.args[0];
}

export { program };
```

- [ ] **Step 2: Create cli.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import { Command } from 'commander';

describe('CLI Parser', () => {
  it('should parse default options', () => {
    const program = new Command();
    program
      .option('--typescript', 'Use TypeScript', true)
      .option('--pm <manager>', 'Package manager', 'npm');
    
    program.parse(['node', 'script']);
    const opts = program.opts();
    
    expect(opts.typescript).toBe(true);
    expect(opts.pm).toBe('npm');
  });
  
  it('should parse custom options', () => {
    const program = new Command();
    program
      .option('--with-mock', 'Include mock API')
      .option('--pm <manager>', 'Package manager');
    
    program.parse(['node', 'script', '--with-mock', '--pm', 'yarn']);
    const opts = program.opts();
    
    expect(opts.withMock).toBe(true);
    expect(opts.pm).toBe('yarn');
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm run test:run
```

Expected output: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/cli.ts tests/cli.test.ts
git commit -m "feat: add CLI argument parser"
```

---

## Task 5: Interactive Prompts

**Files:**
- Create: `src/prompts.ts`
- Test: `tests/prompts.test.ts`

- [ ] **Step 1: Create prompts.ts**

```typescript
import inquirer from 'inquirer';
import { CLIOptions, PromptAnswers } from './types';
import { validateProjectName } from './utils';

const templates = [
  { name: 'basic', value: 'basic', description: 'Minimal Next.js setup with TypeScript and Tailwind' },
  { name: 'with-mock', value: 'with-mock', description: 'Next.js with built-in mock API server' },
];

const packageManagers = [
  { name: 'npm', value: 'npm' },
  { name: 'yarn', value: 'yarn' },
  { name: 'pnpm', value: 'pnpm' },
];

export async function runPrompts(cliOptions: CLIOptions, projectNameArg?: string): Promise<PromptAnswers> {
  const questions: any[] = [];

  if (!projectNameArg) {
    questions.push({
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      validate: (input: string) => {
        const result = validateProjectName(input);
        return result.valid || result.error || 'Invalid project name';
      },
    });
  }

  if (!cliOptions.template) {
    questions.push({
      type: 'list',
      name: 'template',
      message: 'Select template:',
      choices: templates.map(t => ({ name: `${t.name} - ${t.description}`, value: t.value })),
      default: 'basic',
    });
  }

  if (cliOptions.withMock === undefined) {
    questions.push({
      type: 'confirm',
      name: 'withMock',
      message: 'Include mock API server?',
      default: false,
    });
  }

  if (!cliOptions.pm) {
    questions.push({
      type: 'list',
      name: 'pm',
      message: 'Select package manager:',
      choices: packageManagers,
      default: 'npm',
    });
  }

  questions.push({
    type: 'confirm',
    name: 'initializeGit',
    message: 'Initialize git repository?',
    default: true,
  });

  const answers = await inquirer.prompt(questions);

  return {
    projectName: projectNameArg || answers.projectName,
    template: cliOptions.template || answers.template || 'basic',
    withMock: cliOptions.withMock ?? answers.withMock ?? false,
    pm: cliOptions.pm || answers.pm || 'npm',
    initializeGit: answers.initializeGit,
  };
}
```

- [ ] **Step 2: Create prompts.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import { validateProjectName } from '../src/utils';

describe('Prompts', () => {
  describe('validateProjectName', () => {
    it('should validate project names correctly', () => {
      expect(validateProjectName('valid-name').valid).toBe(true);
      expect(validateProjectName('invalid name').valid).toBe(false);
      expect(validateProjectName('').valid).toBe(false);
    });
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm run test:run
```

Expected output: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/prompts.ts tests/prompts.test.ts
git commit -m "feat: add interactive prompts"
```

---

## Task 6: Template Engine

**Files:**
- Create: `src/template.ts`
- Create: `templates/basic/package.json`
- Create: `templates/basic/tsconfig.json`
- Create: `templates/basic/tailwind.config.ts`
- Create: `templates/basic/next.config.js`
- Create: `templates/basic/src/app/layout.tsx`
- Create: `templates/basic/src/app/page.tsx`
- Create: `templates/basic/src/app/globals.css`
- Test: `tests/template.test.ts`

- [ ] **Step 1: Create template.ts**

```typescript
import * as path from 'path';
import { copyTemplate } from './utils';
import { PromptAnswers, TemplateConfig } from './types';

const templateConfigs: Record<string, TemplateConfig> = {
  basic: {
    name: 'basic',
    description: 'Minimal Next.js setup',
    dependencies: ['next', 'react', 'react-dom'],
    devDependencies: ['typescript', '@types/node', '@types/react', '@types/react-dom', 'tailwindcss', 'postcss', 'autoprefixer', 'eslint', 'eslint-config-next'],
  },
  'with-mock': {
    name: 'with-mock',
    description: 'Next.js with mock API',
    dependencies: ['next', 'react', 'react-dom', 'chokidar', 'express', 'cors'],
    devDependencies: ['typescript', '@types/node', '@types/react', '@types/react-dom', '@types/express', '@types/cors', 'tailwindcss', 'postcss', 'autoprefixer', 'eslint', 'eslint-config-next'],
  },
};

export function getTemplateConfig(templateName: string): TemplateConfig | undefined {
  return templateConfigs[templateName];
}

export function scaffoldProject(answers: PromptAnswers, templatesDir: string): void {
  const templateDir = path.join(templatesDir, answers.template);
  const projectDir = path.join(process.cwd(), answers.projectName);
  
  copyTemplate(templateDir, projectDir, {
    projectName: answers.projectName,
  });
  
  if (answers.withMock && answers.template !== 'with-mock') {
    const mockTemplateDir = path.join(templatesDir, 'with-mock');
    copyTemplate(mockTemplateDir, projectDir, {
      projectName: answers.projectName,
    });
  }
}

export { templateConfigs };
```

- [ ] **Step 2: Create templates/basic/package.json**

```json
{
  "name": "{{projectName}}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "14.0.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.2.0"
  }
}
```

- [ ] **Step 3: Create templates/basic/tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create templates/basic/tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: Create templates/basic/next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
```

- [ ] **Step 6: Create templates/basic/src/app/layout.tsx**

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '{{projectName}}',
  description: 'Generated by create-next-pro',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Create templates/basic/src/app/page.tsx**

```typescript
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to {{projectName}}
        </h1>
        <p className="text-xl">
          Generated by create-next-pro
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 8: Create templates/basic/src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
```

- [ ] **Step 9: Create template.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import { getTemplateConfig, templateConfigs } from '../src/template';

describe('Template Engine', () => {
  it('should return template config for basic', () => {
    const config = getTemplateConfig('basic');
    expect(config).toBeDefined();
    expect(config?.name).toBe('basic');
  });
  
  it('should return undefined for unknown template', () => {
    const config = getTemplateConfig('unknown');
    expect(config).toBeUndefined();
  });
  
  it('should have all required template configs', () => {
    expect(templateConfigs.basic).toBeDefined();
    expect(templateConfigs['with-mock']).toBeDefined();
    expect(templateConfigs.basic.dependencies).toContain('next');
  });
});
```

- [ ] **Step 10: Run tests**

```bash
npm run test:run
```

Expected output: All tests pass

- [ ] **Step 11: Commit**

```bash
git add src/template.ts templates/ tests/template.test.ts
git commit -m "feat: add template engine with basic template"
```

---

## Task 7: CLI Entry Point

**Files:**
- Create: `bin/create-next-pro.js`
- Create: `src/index.ts`

- [ ] **Step 1: Create bin/create-next-pro.js**

```javascript
#!/usr/bin/env node

const path = require('path');

// Check Node.js version
const nodeVersion = process.versions.node;
const majorVersion = parseInt(nodeVersion.split('.')[0]);

if (majorVersion < 18) {
  console.error('Error: create-next-pro requires Node.js 18 or higher.');
  console.error(`Current version: ${nodeVersion}`);
  process.exit(1);
}

// Run the compiled CLI
require(path.join(__dirname, '..', 'dist', 'index.js'));
```

- [ ] **Step 2: Make bin script executable**

```bash
chmod +x bin/create-next-pro.js
```

- [ ] **Step 3: Create src/index.ts**

```typescript
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { parseArguments, getProjectNameFromArgs } from './cli';
import { runPrompts } from './prompts';
import { scaffoldProject } from './template';
import { installDependencies, initializeGit } from './utils';
import { PromptAnswers } from './types';

async function main() {
  console.log(chalk.bold.blue('\n🚀 Create Next Pro\n'));

  try {
    const cliOptions = parseArguments();
    const projectNameArg = getProjectNameFromArgs();

    if (projectNameArg) {
      const validation = validateProjectName(projectNameArg);
      if (!validation.valid) {
        console.error(chalk.red(`Error: ${validation.error}`));
        process.exit(1);
      }
    }

    const answers: PromptAnswers = await runPrompts(cliOptions, projectNameArg);

    const spinner = ora('Creating project...').start();

    const templatesDir = path.join(__dirname, '..', 'templates');
    scaffoldProject(answers, templatesDir);

    spinner.succeed('Project created');

    if (!cliOptions.skipInstall) {
      const installSpinner = ora('Installing dependencies...').start();
      installDependencies(answers.projectName, answers.pm);
      installSpinner.succeed('Dependencies installed');
    }

    if (answers.initializeGit) {
      const gitSpinner = ora('Initializing git...').start();
      initializeGit(answers.projectName);
      gitSpinner.succeed('Git initialized');
    }

    console.log(chalk.green('\n✅ Project created successfully!\n'));
    console.log(chalk.white('Next steps:'));
    console.log(chalk.cyan(`  cd ${answers.projectName}`));
    console.log(chalk.cyan('  npm run dev'));
    
    if (answers.withMock) {
      console.log(chalk.gray('\n  Mock API will start automatically on port 3001'));
    }
    
    console.log();

  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function validateProjectName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Project name cannot be empty' };
  }
  
  if (!/^[a-z0-9-_]+$/i.test(name)) {
    return { valid: false, error: 'Project name can only contain letters, numbers, hyphens, and underscores' };
  }
  
  return { valid: true };
}

main();
```

- [ ] **Step 4: Build the project**

```bash
npm run build
```

Expected output: Compiled successfully

- [ ] **Step 5: Test CLI locally**

```bash
node bin/create-next-pro.js --help
```

Expected output: Show help message with options

- [ ] **Step 6: Commit**

```bash
git add bin/create-next-pro.js src/index.ts
git commit -m "feat: add CLI entry point and main orchestration"
```

---

## Task 8: Mock API Server

**Files:**
- Create: `templates/with-mock/mocks/_config.js`
- Create: `templates/with-mock/mocks/users.json`
- Create: `templates/with-mock/mocks/posts.ts`
- Create: `templates/with-mock/src/lib/mock-server.ts`
- Create: `templates/with-mock/scripts/start-mock.js`

- [ ] **Step 1: Create templates/with-mock/mocks/_config.js**

```javascript
module.exports = {
  port: 3001,
  delay: 0,
  cors: true,
  basePath: '/api',
};
```

- [ ] **Step 2: Create templates/with-mock/mocks/users.json**

```json
[
  { "id": 1, "name": "John Doe", "email": "john@example.com" },
  { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
]
```

- [ ] **Step 3: Create templates/with-mock/mocks/posts.ts**

```typescript
export default {
  GET: (req: any, res: any) => {
    const posts = [
      { id: 1, title: 'First Post', content: 'Hello World' },
      { id: 2, title: 'Second Post', content: 'Another post' },
    ];
    res.json(posts);
  },
  
  POST: (req: any, res: any) => {
    const newPost = {
      id: Date.now(),
      ...req.body,
    };
    res.status(201).json(newPost);
  },
};
```

- [ ] **Step 4: Create templates/with-mock/src/lib/mock-server.ts**

```typescript
import express from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
import chokidar from 'chokidar';

interface MockConfig {
  port: number;
  delay: number;
  cors: boolean;
  basePath: string;
}

function loadConfig(mocksDir: string): MockConfig {
  const configPath = path.join(mocksDir, '_config.js');
  if (fs.existsSync(configPath)) {
    delete require.cache[require.resolve(configPath)];
    return require(configPath);
  }
  return { port: 3001, delay: 0, cors: true, basePath: '/api' };
}

function loadMockRoutes(mocksDir: string): Record<string, any> {
  const routes: Record<string, any> = {};
  
  if (!fs.existsSync(mocksDir)) {
    return routes;
  }
  
  const files = fs.readdirSync(mocksDir);
  
  for (const file of files) {
    if (file.startsWith('_')) continue;
    
    const filePath = path.join(mocksDir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Handle subdirectories for nested routes
      const subRoutes = loadMockRoutes(filePath);
      Object.assign(routes, subRoutes);
    } else {
      const ext = path.extname(file);
      const name = path.basename(file, ext);
      
      if (ext === '.json') {
        routes[name] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } else if (ext === '.ts' || ext === '.js') {
        delete require.cache[require.resolve(filePath)];
        routes[name] = require(filePath).default || require(filePath);
      }
    }
  }
  
  return routes;
}

export function startMockServer(mocksDir: string): void {
  const config = loadConfig(mocksDir);
  const app = express();
  
  if (config.cors) {
    app.use(cors());
  }
  
  app.use(express.json());
  
  let routes = loadMockRoutes(mocksDir);
  
  // Setup routes
  function setupRoutes() {
    app._router = undefined; // Clear existing routes
    
    Object.entries(routes).forEach(([routeName, handler]) => {
      const routePath = `${config.basePath}/${routeName}`;
      
      if (typeof handler === 'object' && !Array.isArray(handler)) {
        // Handler object with methods
        if (handler.GET) {
          app.get(routePath, (req, res) => {
            setTimeout(() => handler.GET(req, res), config.delay);
          });
        }
        if (handler.POST) {
          app.post(routePath, (req, res) => {
            setTimeout(() => handler.POST(req, res), config.delay);
          });
        }
        if (handler.PUT) {
          app.put(routePath, (req, res) => {
            setTimeout(() => handler.PUT(req, res), config.delay);
          });
        }
        if (handler.DELETE) {
          app.delete(routePath, (req, res) => {
            setTimeout(() => handler.DELETE(req, res), config.delay);
          });
        }
      } else if (Array.isArray(handler)) {
        // Static JSON array
        app.get(routePath, (req, res) => {
          setTimeout(() => res.json(handler), config.delay);
        });
      }
    });
  }
  
  setupRoutes();
  
  // Watch for changes
  const watcher = chokidar.watch(mocksDir, { ignored: /node_modules/ });
  
  watcher.on('change', () => {
    console.log('📝 Mock files changed, reloading...');
    routes = loadMockRoutes(mocksDir);
    setupRoutes();
  });
  
  app.listen(config.port, () => {
    console.log(`🚀 Mock API server running at http://localhost:${config.port}`);
  });
}

// Auto-start if called directly
if (require.main === module) {
  const mocksDir = path.join(process.cwd(), 'mocks');
  startMockServer(mocksDir);
}
```

- [ ] **Step 5: Create templates/with-mock/scripts/start-mock.js**

```javascript
const path = require('path');

// Use ts-node or compiled version
const { startMockServer } = require('../src/lib/mock-server');

const mocksDir = path.join(process.cwd(), 'mocks');
startMockServer(mocksDir);
```

- [ ] **Step 6: Commit**

```bash
git add templates/with-mock/
git commit -m "feat: add mock API server with file watching"
```

---

## Task 9: Mock Template Package.json

**Files:**
- Create: `templates/with-mock/package.json`

- [ ] **Step 1: Create templates/with-mock/package.json**

```json
{
  "name": "{{projectName}}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"next dev\" \"npm run mock\"",
    "dev:mock": "concurrently \"next dev\" \"npm run mock\"",
    "mock": "node scripts/start-mock.js",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "chokidar": "^3.5.0",
    "express": "^4.18.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "autoprefixer": "^10.4.0",
    "concurrently": "^8.2.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "14.0.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.2.0"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add templates/with-mock/package.json
git commit -m "feat: add package.json for with-mock template"
```

---

## Task 10: Documentation

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README.md**

```markdown
# create-next-pro

CLI tool to scaffold Next.js projects with best practices and built-in API mocking.

## Installation

```bash
npx create-next-pro@latest my-app
```

## Usage

### Interactive Mode
```bash
npx create-next-pro
```

### CLI Options
```bash
npx create-next-pro my-app --template with-mock --pm npm
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--template <name>` | Template to use (basic, with-mock) | basic |
| `--with-mock` | Include mock API server | false |
| `--pm <manager>` | Package manager (npm, yarn, pnpm) | npm |
| `--typescript` | Use TypeScript | true |
| `--tailwind` | Include Tailwind CSS | true |
| `--eslint` | Include ESLint | true |
| `--skip-install` | Skip dependency installation | false |
| `--force` | Overwrite existing directory | false |

## Templates

### basic
Minimal Next.js setup with TypeScript, Tailwind CSS, ESLint, and Prettier.

### with-mock
Everything in basic plus a built-in mock API server for rapid frontend development.

## Mock API

When using the `with-mock` template, your project includes a mock API server.

### Starting the dev server
```bash
npm run dev
```

This starts both the Next.js dev server (port 3000) and mock API server (port 3001).

### Creating mock endpoints

Create files in the `/mocks` directory:

**Static JSON (GET only):**
```json
// mocks/users.json
[
  { "id": 1, "name": "John" }
]
```

**Dynamic handlers:**
```typescript
// mocks/posts.ts
export default {
  GET: (req, res) => res.json([{ id: 1, title: 'Hello' }]),
  POST: (req, res) => res.status(201).json({ id: Date.now(), ...req.body }),
};
```

### Configuration

Edit `mocks/_config.js`:
```javascript
module.exports = {
  port: 3001,      // Mock server port
  delay: 300,      // Simulate network delay (ms)
  cors: true,      // Enable CORS
  basePath: '/api' // URL prefix
};
```

## Contributing

Contributions welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

## License

MIT
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with usage instructions"
```

---

## Task 11: Final Testing

**Files:**
- Test all functionality

- [ ] **Step 1: Run all tests**

```bash
npm run test:run
```

Expected output: All tests pass

- [ ] **Step 2: Build project**

```bash
npm run build
```

Expected output: Compiled successfully

- [ ] **Step 3: Test CLI locally**

```bash
node bin/create-next-pro.js --help
```

Expected output: Show help message

- [ ] **Step 4: Create test project**

```bash
node bin/create-next-pro.js test-project --template basic --skip-install
```

Expected output: Project created successfully

- [ ] **Step 5: Verify project structure**

```bash
ls test-project/
```

Expected output: src/, package.json, tsconfig.json, etc.

- [ ] **Step 6: Cleanup test project**

```bash
rm -rf test-project
```

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "chore: final testing and cleanup"
```

---

## Task 12: Publish Preparation

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add files field to package.json**

Add to package.json:
```json
"files": [
  "bin/",
  "dist/",
  "templates/",
  "README.md",
  "LICENSE"
]
```

- [ ] **Step 2: Add repository field**

Add to package.json:
```json
"repository": {
  "type": "git",
  "url": "https://github.com/yourusername/create-next-pro.git"
}
```

- [ ] **Step 3: Build for production**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "chore: prepare for npm publish"
```

---

## Summary

This implementation plan creates a complete CLI tool with:

1. ✅ Argument parsing with Commander.js
2. ✅ Interactive prompts with Inquirer.js
3. ✅ Template engine for project scaffolding
4. ✅ File utilities for copying and variable substitution
5. ✅ Mock API server with file watching
6. ✅ Two templates: basic and with-mock
7. ✅ Comprehensive test coverage
8. ✅ Documentation and usage instructions

**After completing all tasks:**
- Run `npm publish` to publish to npm
- Or `npm link` to test locally
