/**
 * JWT Utilities
 *
 * Generate and verify JWT tokens for employee authentication
 * Managers use Supabase Auth, employees use custom JWT
 */

import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';

const JWT_SECRET = (process.env.JWT_SECRET as string) || 'fallback-secret-change-in-production';
const JWT_EXPIRY: StringValue = (process.env.JWT_EXPIRY as StringValue) || '7d';

/**
 * JWT Payload Interface
 */
export interface JWTPayload {
  user_id: string;
  user_type: 'employee' | 'manager';
  manager_id: string;
  username: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT Token
 *
 * @param payload - User information to encode in token
 * @returns JWT token string
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
}

/**
 * Verify JWT Token
 *
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

/**
 * Decode JWT Token (without verification)
 * Use only for debugging, NOT for authentication
 *
 * @param token - JWT token string
 * @returns Decoded payload or null
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
