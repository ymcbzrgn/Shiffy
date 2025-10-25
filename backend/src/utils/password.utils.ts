/**
 * Password Utilities
 *
 * Handle password generation, hashing, and comparison
 * Used for employee authentication
 */

import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 10; // Cost factor for bcrypt hashing

/**
 * Generate Random Password
 *
 * Creates a random alphanumeric password for new employees
 *
 * @param length - Length of password (default: 8)
 * @returns Random password string
 *
 * @example
 * const tempPassword = generateRandomPassword(8);
 * // Output: "aB3dE9fG"
 */
export function generateRandomPassword(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
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
