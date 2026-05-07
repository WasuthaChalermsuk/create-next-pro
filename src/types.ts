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
