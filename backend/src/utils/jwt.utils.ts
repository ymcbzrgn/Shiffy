/**
 * JWT Utilities
 *
 * Generate and verify JWT tokens for employee authentication
 * Managers use Supabase Auth, employees use custom JWT
 */

import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { config } from '../config/env.config';

const JWT_SECRET = config.jwt.secret;
const JWT_EXPIRY: StringValue = (config.jwt.expiry as StringValue);

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
    console.log(`[JWT] ✅ Token verified successfully`);
    console.log(`[JWT] User: ${decoded.user_id}, Type: ${decoded.user_type}, Exp: ${decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A'}`);
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error(`[JWT] ❌ Token expired at: ${error.expiredAt}`);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error(`[JWT] ❌ Invalid token: ${error.message}`);
    } else {
      console.error('[JWT] ❌ Token verification failed:', error);
    }
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
