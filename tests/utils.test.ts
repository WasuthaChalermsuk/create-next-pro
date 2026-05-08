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
    const cwdDir = path.join(process.cwd(), 'test-project');
    fs.ensureDirSync(cwdDir);
    try {
      expect(validateProjectName('test-project')).toEqual({ 
        valid: false, 
        error: 'Directory "test-project" already exists' 
      });
    } finally {
      fs.removeSync(cwdDir);
    }
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
