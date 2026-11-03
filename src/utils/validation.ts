// ============================================================================
// AP VIDYACONNECT — CENTRAL VALIDATION UTILITIES
// Strict Email (username with >=1 alphabet) & Indian Phone (+91, exactly 10 digits 0-9)
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validates that an email has:
 * 1. Standard email format: username@domain.extension
 * 2. Email username MUST contain at least one alphabet (A–Z / a–z).
 *    - Rejects numeric-only usernames such as 123@gmail.com and 1@gmail.com.
 *    - Allows usernames containing both alphabets and numbers, such as jasim123@gmail.com.
 * 3. Domain must contain valid labels and a domain extension with at least 2 letters (e.g., .com, .edu.in).
 */
export const validateEmail = (email: string | undefined | null): ValidationResult => {
  const clean = email ? email.trim() : '';
  if (!clean) {
    return { isValid: false, error: 'Email address is required.' };
  }

  // Must have exactly one @
  const atParts = clean.split('@');
  if (atParts.length !== 2) {
    return { isValid: false, error: 'Please enter a valid email address with an "@" symbol.' };
  }

  const [username, domain] = atParts;
  if (!username) {
    return { isValid: false, error: 'Email username cannot be empty.' };
  }
  if (!domain) {
    return { isValid: false, error: 'Email domain cannot be empty.' };
  }

  // 1. Strict Username Rule: Must contain AT LEAST ONE ALPHABET (A-Z)
  if (!/[a-zA-Z]/.test(username)) {
    return {
      isValid: false,
      error: 'Email username cannot be numeric-only. It must contain at least one alphabet (e.g. jasim123@gmail.com).'
    };
  }

  // 2. Validate allowed username characters: letters, numbers, dots, underscores, percents, plus, hyphens
  if (!/^[a-zA-Z0-9._%+-]+$/.test(username)) {
    return { isValid: false, error: 'Email username contains invalid characters.' };
  }

  // Username cannot start or end with a dot, or have consecutive dots
  if (username.startsWith('.') || username.endsWith('.') || username.includes('..')) {
    return { isValid: false, error: 'Email username contains consecutive or misplaced dots.' };
  }

  // 3. Validate Domain & Extension
  const domainParts = domain.split('.');
  if (domainParts.length < 2 || domainParts.some(part => !part.trim())) {
    return { isValid: false, error: 'Please enter a complete domain name with extension (e.g. domain.com or college.edu.in).' };
  }

  const tld = domainParts[domainParts.length - 1];
  if (!/^[a-zA-Z]{2,}$/.test(tld)) {
    return { isValid: false, error: 'Email must end with a valid domain extension with at least 2 letters (e.g. .com, .in).' };
  }

  // Check valid domain characters (labels separated by dots)
  if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
    return { isValid: false, error: 'Email domain contains invalid characters.' };
  }

  return { isValid: true, error: null };
};

export const isValidEmail = (email: string | undefined | null): boolean => {
  return validateEmail(email).isValid;
};

/**
 * Sanitizes phone number input:
 * - Allows digits 0–9 ONLY.
 * - Blocks alphabets, spaces and special characters.
 * - Prevents users from entering more than 10 digits.
 */
export const sanitizePhoneDigits = (val: string | undefined | null): string => {
  if (!val) return '';
  // Strip everything that is not 0-9 and restrict to max 10 digits
  return val.replace(/\D/g, '').slice(0, 10);
};

/**
 * Extracts 10 raw digits from any stored format (e.g., "+91 98480 12345" or "9848012345")
 */
export const extractTenDigits = (val: string | undefined | null): string => {
  if (!val) return '';
  const digits = val.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length > 10) {
    return digits.slice(2, 12);
  }
  return digits.slice(-10);
};

/**
 * Strict Phone Validation:
 * - Accepts exactly 10 digits after +91.
 * - Digits 0–9 only.
 * - Shows a clear message if fewer than 10 digits are entered.
 */
export const validatePhone = (digitsOrFull: string | undefined | null): ValidationResult => {
  const clean = sanitizePhoneDigits(extractTenDigits(digitsOrFull));
  if (!clean) {
    return { isValid: false, error: 'Phone number is required.' };
  }
  if (clean.length < 10) {
    return {
      isValid: false,
      error: `Phone number must be exactly 10 digits (currently ${clean.length}/10 digits entered).`
    };
  }
  if (clean.length > 10) {
    return { isValid: false, error: 'Phone number cannot exceed 10 digits.' };
  }
  if (!/^[0-9]{10}$/.test(clean)) {
    return { isValid: false, error: 'Phone number must contain digits (0–9) only.' };
  }
  return { isValid: true, error: null };
};

export const isValidPhone = (digitsOrFull: string | undefined | null): boolean => {
  return validatePhone(digitsOrFull).isValid;
};

/**
 * Formats 10 digits with India country code for database and display: "+91 98480 12345"
 */
export const formatWithCountryCode = (val: string | undefined | null): string => {
  const digits = extractTenDigits(val);
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return digits ? `+91 ${digits}` : '';
};

