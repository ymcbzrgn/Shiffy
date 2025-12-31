/**
 * Password Utilities Tests
 *
 * Tests for password generation, hashing, and comparison
 */

import {
  generateRandomPassword,
  hashPassword,
  comparePassword,
} from './password.utils';

describe('Password Utilities', () => {
  describe('generateRandomPassword', () => {
    it('should generate a password of default length (12)', () => {
      const password = generateRandomPassword();
      expect(password).toHaveLength(12);
    });

    it('should generate a password of specified length', () => {
      const password = generateRandomPassword(16);
      expect(password).toHaveLength(16);
    });

    it('should enforce minimum length of 8', () => {
      const password = generateRandomPassword(4);
      expect(password).toHaveLength(8);
    });

    it('should only contain alphanumeric characters', () => {
      const password = generateRandomPassword(100);
      expect(password).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('should generate unique passwords', () => {
      const passwords = new Set<string>();
      for (let i = 0; i < 100; i++) {
        passwords.add(generateRandomPassword());
      }
      // All 100 passwords should be unique
      expect(passwords.size).toBe(100);
    });

    it('should use cryptographically secure randomness', () => {
      // Verify that crypto.randomBytes is used (check for good distribution)
      const charCounts: Record<string, number> = {};
      const iterations = 1000;
      const passwordLength = 50;

      // Generate passwords and count character occurrences
      for (let i = 0; i < iterations; i++) {
        const password = generateRandomPassword(passwordLength);
        for (const char of password) {
          charCounts[char] = (charCounts[char] || 0) + 1;
        }
      }

      // With 62 possible chars and 50000 total chars, each should appear ~806 times
      // All 62 characters should be represented
      const uniqueChars = Object.keys(charCounts).length;
      expect(uniqueChars).toBeGreaterThanOrEqual(55); // At least 55 of 62 chars should appear

      // No single character should dominate
      const counts = Object.values(charCounts);
      const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;
      const maxDeviation = Math.max(...counts.map(c => Math.abs(c - avgCount)));

      // Max deviation should be reasonable (not more than 50% of average)
      expect(maxDeviation).toBeLessThan(avgCount * 0.5);
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[ab]\$\d{2}\$/); // bcrypt format
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const hash = await hashPassword('');
      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[ab]\$\d{2}\$/);
    });

    it('should handle long passwords', async () => {
      const longPassword = 'a'.repeat(100);
      const hash = await hashPassword(longPassword);
      expect(hash).toBeDefined();
    });

    it('should handle special characters', async () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await hashPassword(specialPassword);
      expect(hash).toBeDefined();
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      const result = await comparePassword('wrongPassword', hash);
      expect(result).toBe(false);
    });

    it('should return false for invalid hash', async () => {
      const result = await comparePassword('password', 'invalid-hash');
      expect(result).toBe(false);
    });

    it('should return false for empty hash', async () => {
      const result = await comparePassword('password', '');
      expect(result).toBe(false);
    });

    it('should be case sensitive', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);

      const resultLower = await comparePassword('testpassword123', hash);
      const resultUpper = await comparePassword('TESTPASSWORD123', hash);

      expect(resultLower).toBe(false);
      expect(resultUpper).toBe(false);
    });

    it('should work with generated passwords', async () => {
      const password = generateRandomPassword();
      const hash = await hashPassword(password);

      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });
  });
});
