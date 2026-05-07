# Next Dev Suite Design Document

**Project:** `next-dev-suite` — Next.js Scaffolding CLI with Built-in Mock API
**Author:** Wasutha Chalermsuk (Coder/CTO)
**Date:** 2025-05-07

---

## 1. Overview

A CLI tool (`create-next-pro`) that scaffolds Next.js projects with best practices and includes a zero-config API mocking system for rapid frontend development without waiting for backend.

### 1.1 Goals
- Reduce setup time for new Next.js projects from hours to minutes
- Enable frontend development without backend dependencies
- Demonstrate full-stack capabilities (CLI, Next.js, tooling)
- Build open source portfolio with real community value

### 1.2 Target Users
- Frontend developers starting new Next.js projects
- Teams needing quick API mocks during development
- Developers wanting consistent project structure

---

## 2. Architecture

### 2.1 High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                     create-next-pro CLI                     │
│                    (Node.js + Commander.js)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Template    │  │ Interactive │  │   Dependency        │  │
│  │ Engine      │  │ Prompts     │  │   Installer         │  │
│  │ (Copies     │  │ (Inquirer)  │  │   (npm/yarn/pnpm)   │  │
│  │ templates)  │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Mock API Subsystem                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ File Watch  │  │ HTTP Server │  │   Route Generator   │  │
│  │ (chokidar)  │  │ (Express)   │  │   (Dynamic routes)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Component Details

#### CLI Entry (`bin/create-next-pro.js`)
- Parse command line arguments using Commander.js
- Validate Node.js version (>=18)
- Delegate to scaffold engine

#### Template Engine (`lib/template.js`)
- Store templates in `templates/` directory
- Support multiple templates: `basic`, `full-stack`, `with-auth`
- Copy files with variable substitution (project name, etc.)

#### Interactive Prompts (`lib/prompts.js`)
- Project name validation
- Template selection
- Package manager choice (npm/yarn/pnpm)
- Feature toggles (TypeScript, Tailwind, ESLint, etc.)

#### Mock API Server (`lib/mock-server/`)
- Run on separate port (default: 3001)
- Watch `/mocks` directory for changes
- Auto-generate REST endpoints from JSON/TS files
- Support CRUD operations (GET, POST, PUT, DELETE)

---

## 3. Data Flow

### 3.1 Project Creation Flow

```
User runs: npx create-next-pro my-app --with-mock
         │
         ▼
    ┌────────────┐
    │ CLI Parse  │
    │ Arguments  │
    └─────┬──────┘
          │
         ▼
    ┌────────────┐
    │ Interactive│
    │ Prompts    │
    └─────┬──────┘
          │
         ▼
    ┌────────────┐
    │ Template   │
    │ Selection  │
    └─────┬──────┘
          │
         ▼
    ┌────────────┐
    │ Copy Files │
    │ + Inject   │
    │ Mock Code  │
    └─────┬──────┘
          │
         ▼
    ┌────────────┐
    │ Install    │
    │ Deps       │
    └─────┬──────┘
          │
         ▼
    ┌────────────┐
    │ Success    │
    │ Message    │
    └────────────┘
```

### 3.2 Mock API Flow

```
Developer starts: npm run dev
         │
         ▼
    ┌────────────┐
    │ Next.js    │
    │ Dev Server │
    └─────┬──────┘
          │
         ▼
    ┌────────────┐
    │ Mock Server│
    │ Starts     │
    │ (port 3001)│
    └─────┬──────┘
          │
         ▼
    ┌────────────┐
    │ Watch /mocks│
    │ Directory  │
    └─────┬──────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌────────┐ ┌────────┐
│File    │ │API     │
│Changed │ │Request │
└───┬────┘ └───┬────┘
    │          │
    ▼          ▼
┌────────┐ ┌────────┐
│Reload  │ │Serve   │
│Routes  │ │Data    │
└────────┘ └────────┘
```

---

## 4. File Structure

### 4.1 CLI Package Structure

```
create-next-pro/
├── bin/
│   └── create-next-pro.js          # CLI entry point
├── lib/
│   ├── index.js                    # Main orchestration
│   ├── template.js                 # Template engine
│   ├── prompts.js                  # Interactive prompts
│   ├── utils.js                    # Helper functions
│   └── mock-server/
│       ├── index.js                # Mock server entry
│       ├── watcher.js              # File watcher
│       ├── router.js               # Route generator
│       └── middleware.js           # Next.js integration
├── templates/
│   ├── basic/                      # Minimal Next.js setup
│   ├── full-stack/                 # With Prisma, Auth
│   └── with-mock/                  # Mock API template
├── mocks/
│   └── example/                    # Example mock files
├── tests/
│   └── *.test.js                   # Unit tests
├── package.json
├── README.md
└── LICENSE
```

### 4.2 Generated Project Structure

```
my-app/
├── src/
│   ├── app/                        # Next.js app router
│   ├── components/
│   ├── lib/
│   └── types/
├── mocks/                          # Mock API definitions
│   ├── users.json
│   ├── posts.ts
│   └── _config.js                  # Mock server config
├── tests/
│   └── *.test.tsx
├── next.config.js                  # With mock middleware
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## 5. Mock API Specification

### 5.1 File-Based Routing

Files in `/mocks` automatically become API endpoints:

| File | Endpoint | Methods |
|------|----------|---------|
| `users.json` | `/api/users` | GET |
| `posts.ts` | `/api/posts` | GET, POST, PUT, DELETE |
| `users/[id].ts` | `/api/users/:id` | GET, PUT, DELETE |

### 5.2 Mock File Format

**JSON (static data):**
```json
// mocks/users.json
[
  { "id": 1, "name": "John" },
  { "id": 2, "name": "Jane" }
]
```

**TypeScript (dynamic handlers):**
```typescript
// mocks/posts.ts
import { MockHandler } from 'next-dev-suite';

const posts: MockHandler = {
  GET: (req, res) => {
    res.json([{ id: 1, title: 'Hello' }]);
  },
  POST: (req, res) => {
    const newPost = { id: Date.now(), ...req.body };
    res.status(201).json(newPost);
  }
};

export default posts;
```

### 5.3 Configuration

```javascript
// mocks/_config.js
module.exports = {
  port: 3001,           // Mock server port
  delay: 300,           // Simulate network delay (ms)
  cors: true,           // Enable CORS
  basePath: '/api/mock' // URL prefix
};
```

---

## 6. CLI Interface

### 6.1 Commands

```bash
# Create new project
npx create-next-pro <project-name> [options]

# Options:
#   --template <name>    # basic, full-stack, with-auth
#   --with-mock          # Include mock API
#   --pm <manager>       # npm, yarn, pnpm
#   --typescript         # Use TypeScript
#   --tailwind           # Include Tailwind CSS
#   --eslint             # Include ESLint
#   --skip-install       # Skip dependency installation
#   --help               # Show help
```

### 6.2 Interactive Mode

```bash
$ npx create-next-pro my-app
? Select template: (Use arrow keys)
  basic
❯ full-stack 
  with-auth
? Include mock API? Yes
? Select package manager: npm
? Initialize git? Yes
✔ Project created successfully!
✔ Dependencies installed
✔ Git initialized

Next steps:
  cd my-app
  npm run dev
```

---

## 7. Templates

### 7.1 Basic Template
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- ESLint + Prettier
- Basic folder structure

### 7.2 Full-Stack Template
- Everything in Basic +
- Prisma ORM + MongoDB setup
- tRPC or REST API routes
- Authentication template (NextAuth.js)
- Testing setup (Vitest + React Testing Library)

### 7.3 With-Mock Template
- Everything in Basic +
- Pre-configured mock API
- Example mock files (users, posts)
- Documentation for mock usage

---

## 8. Error Handling

### 8.1 CLI Errors
- Invalid project names (spaces, special chars)
- Existing directory conflicts
- Network errors during dependency install
- Node.js version incompatibility

### 8.2 Mock Server Errors
- Invalid mock file syntax
- Port conflicts
- File permission issues

### 8.3 Error Messages
Clear, actionable error messages with suggestions:
```
❌ Error: Directory "my-app" already exists
   Run with --force to overwrite, or choose a different name.
```

---

## 9. Testing Strategy

### 9.1 Unit Tests
- Template engine functionality
- File utility functions
- Mock server request handlers

### 9.2 Integration Tests
- Full CLI flow (create → install → verify)
- Mock server routing
- File watching and hot reload

### 9.3 E2E Tests
- Create project with each template
- Verify dev server starts
- Verify mock API responds correctly

---

## 10. Future Enhancements

### 10.1 v1.1
- [ ] GraphQL mock support
- [ ] WebSocket mock support
- [ ] Dev Dashboard UI (`/api-mock`)

### 10.2 v1.2
- [ ] Plugin system for custom templates
- [ ] Team/company template sharing
- [ ] VS Code extension

### 10.3 v2.0
- [ ] Multiple backend integrations (Supabase, Firebase)
- [ ] Code generation from OpenAPI specs
- [ ] AI-powered mock data generation

---

## 11. Success Criteria

- [ ] CLI published to npm with 100+ downloads/week
- [ ] 3+ project templates available
- [ ] Mock API working with hot reload
- [ ] 90%+ test coverage
- [ ] Documentation and examples
- [ ] 5+ GitHub stars

---

## 12. Open Questions

1. Should mock server be a separate package for reusability?
2. How to handle mock data persistence across restarts?
3. Should we support proxying to real APIs with fallback to mocks?

---

**Next Step:** Write implementation plan using `writing-plans` skill.
