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
