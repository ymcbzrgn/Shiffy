/**
 * Password Utilities
 *
 * Handle password generation, hashing, and comparison
 * Used for employee authentication
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';

const BCRYPT_ROUNDS = 10; // Cost factor for bcrypt hashing

/**
 * Generate Cryptographically Secure Random Password
 *
 * Creates a random alphanumeric password for new employees
 * Uses crypto.randomBytes for cryptographic security
 *
 * @param length - Length of password (default: 12, minimum: 8)
 * @returns Random password string
 *
 * @example
 * const tempPassword = generateRandomPassword(12);
 * // Output: "aB3dE9fGhK2m"
 */
export function generateRandomPassword(length: number = 12): string {
  // Enforce minimum length for security
  const actualLength = Math.max(length, 8);

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = crypto.randomBytes(actualLength);
  let password = '';

  for (let i = 0; i < actualLength; i++) {
    // Use cryptographically secure random bytes
    const randomIndex = randomBytes[i] % chars.length;
    password += chars[randomIndex];
  }

  return password;
}

/**
 * Hash Password
 *
 * Hash password using bcrypt (cost factor: 10)
 *
 * @param password - Plain text password
 * @returns Hashed password
 *
 * @example
 * const hash = await hashPassword('myPassword123');
 * // Output: "$2b$10$..."
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    return hash;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error}`);
  }
}

/**
 * Compare Password
 *
 * Verify plain text password against bcrypt hash
 *
 * @param plainPassword - Plain text password from user input
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match, false otherwise
 *
 * @example
 * const isValid = await comparePassword('myPassword123', storedHash);
 * if (isValid) {
 *   // Login successful
 * }
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    // If comparison fails, treat as invalid password (don't leak error details)
    return false;
  }
}
