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
