import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, emailPattern } from './validation';

describe('validateEmail', () => {
  it('accepts a well-formed email', () => {
    expect(validateEmail('student@university.edu')).toBe('');
    expect(emailPattern.test('a.b@mail.co')).toBe(true);
  });
  it('rejects a blank email', () => {
    expect(validateEmail('')).not.toBe('');
  });
  it('rejects a malformed email', () => {
    expect(validateEmail('abc@')).not.toBe('');
    expect(validateEmail('no-at-sign')).not.toBe('');
  });
});

describe('validatePassword', () => {
  it('accepts a strong password', () => {
    expect(validatePassword('roadmap2026')).toBe('');
    expect(validatePassword('Password1')).toBe('');
  });
  it('rejects a short password', () => {
    expect(validatePassword('abc12')).not.toBe('');
  });
  it('rejects a password with no digit', () => {
    expect(validatePassword('password')).not.toBe('');
  });
  it('rejects a password with no letter', () => {
    expect(validatePassword('12345678')).not.toBe('');
  });
  it('rejects an empty password', () => {
    expect(validatePassword('')).not.toBe('');
  });
});
