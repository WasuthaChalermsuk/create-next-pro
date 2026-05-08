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
