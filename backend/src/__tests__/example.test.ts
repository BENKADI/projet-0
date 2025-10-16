import { describe, it, expect } from '@jest/globals';

describe('Example Test Suite', () => {
  it('should pass basic math test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    const str = 'Hello World';
    expect(str).toContain('World');
    expect(str.length).toBe(11);
  });

  it('should work with arrays', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr).toHaveLength(5);
    expect(arr).toContain(3);
  });

  it('should handle async operations', async () => {
    const promise = Promise.resolve('success');
    await expect(promise).resolves.toBe('success');
  });
});

describe('Environment Variables', () => {
  it('should load test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should have JWT_SECRET configured', () => {
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.JWT_SECRET!.length).toBeGreaterThanOrEqual(32);
  });
});
