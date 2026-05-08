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
