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
  
  function setupRoutes() {
    app._router = undefined;
    
    Object.entries(routes).forEach(([routeName, handler]) => {
      const routePath = `${config.basePath}/${routeName}`;
      
      if (typeof handler === 'object' && !Array.isArray(handler)) {
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
        app.get(routePath, (req, res) => {
          setTimeout(() => res.json(handler), config.delay);
        });
      }
    });
  }
  
  setupRoutes();
  
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

if (require.main === module) {
  const mocksDir = path.join(process.cwd(), 'mocks');
  startMockServer(mocksDir);
}
