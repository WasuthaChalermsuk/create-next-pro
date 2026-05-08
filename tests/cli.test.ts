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
