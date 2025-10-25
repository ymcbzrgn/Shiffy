// Form validation functions
// Return null if valid, error message string if invalid

export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email gerekli';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Geçersiz email formatı';
  }
  
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Şifre gerekli';
  }
  
  if (password.length < 6) {
    return 'Şifre en az 6 karakter olmalı';
  }
  
  return null;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
  if (password !== confirmPassword) {
    return 'Şifreler eşleşmiyor';
  }
  
  return null;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === '') {
    return `${fieldName} gerekli`;
  }
  
  return null;
};

// Password strength calculator
export type PasswordStrength = 'weak' | 'medium' | 'good' | 'strong';

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) return 'weak';
  
  let strength = 0;
  
  // Length check
  if (password.length >= 6) strength++;
  if (password.length >= 8) strength++;
  
  // Has lowercase
  if (/[a-z]/.test(password)) strength++;
  
  // Has uppercase
  if (/[A-Z]/.test(password)) strength++;
  
  // Has number
  if (/[0-9]/.test(password)) strength++;
  
  // Has special char
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  if (strength <= 2) return 'weak';
  if (strength <= 3) return 'medium';
  if (strength <= 4) return 'good';
  return 'strong';
};

// Get password strength as number (0-3 for easy styling)
export const getPasswordStrength = (password: string): number => {
  if (!password) return 0;
  
  let strength = 0;
  
  // Has minimum length (6 chars)
  if (password.length >= 6) strength++;
  
  // Has uppercase
  if (/[A-Z]/.test(password)) strength++;
  
  // Has lowercase
  if (/[a-z]/.test(password)) strength++;
  
  // Has number
  if (/[0-9]/.test(password)) strength++;
  
  // Calculate final strength (0-3)
  // All 4 criteria met = 3 (strong)
  // 3 criteria = 2 (medium)
  // 2 criteria = 1 (weak)
  // 0-1 criteria = 0 (very weak)
  if (strength >= 4) return 3;
  if (strength >= 3) return 2;
  if (strength >= 2) return 1;
  return 0;
};

