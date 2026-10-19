/**
 * Validation utilities for LVL Fashion Runway Checkout & Organiser Portal
 * Enforces email domain validity and Kenyan phone number format (07... or 011...)
 */

/**
 * Normalizes input phone number to local Kenyan 10-digit format (07... or 011...).
 * Handles +254 7..., 254 7..., +254 11..., 254 11..., 07..., 011...
 */
export function normalizeKenyanPhone(rawPhone: string): string {
  if (!rawPhone) return '';
  // Remove all non-digits except a leading plus
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, '');

  // Handle +254 or 254 prefix
  if (cleaned.startsWith('+254')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('254') && cleaned.length >= 11) {
    cleaned = '0' + cleaned.slice(3);
  }

  // Remove any remaining non-digit characters
  return cleaned.replace(/\D/g, '');
}

/**
 * Validates whether the phone number is a valid 10-digit Kenyan number starting with 07 or 011
 */
export function isValidKenyanPhone(phone: string): boolean {
  const normalized = normalizeKenyanPhone(phone);
  // Must be 10 digits and start with 07 (07XXXXXXXX) or 011 (011XXXXXXX)
  return /^(07\d{8}|011\d{7})$/.test(normalized);
}

/**
 * Returns a human-friendly error string if phone is invalid, or null if valid.
 */
export function getPhoneValidationError(phone: string, isRequired = true): string | null {
  const raw = phone.trim();
  if (!raw) {
    return isRequired ? 'Phone number is required' : null;
  }

  const normalized = normalizeKenyanPhone(raw);

  if (!normalized.startsWith('07') && !normalized.startsWith('011')) {
    return 'Phone number must start with 07 or 011 (e.g. 0712345678 or 0112345678)';
  }

  if (normalized.length !== 10) {
    return `Phone number must be exactly 10 digits (currently ${normalized.length} digits)`;
  }

  if (!/^(07\d{8}|011\d{7})$/.test(normalized)) {
    return 'Phone number must contain only numbers and start with 07 or 011';
  }

  return null;
}

/**
 * Validates that an email address has a valid syntax and ends with a recognized domain
 * (e.g. @gmail.com, @yahoo.com, @outlook.com, @icloud.com, .co.ke, .ac.ke, or any valid TLD)
 */
export function isValidEmail(email: string): boolean {
  if (!email || !email.trim()) return false;
  const trimmed = email.trim().toLowerCase();

  // Basic RFC 5322 compliant regex for emails with at least a 2-letter TLD
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(trimmed)) {
    return false;
  }

  // Ensure there is a domain with a valid dot and extension
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;

  const domain = parts[1];
  if (!domain.includes('.')) return false;

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  
  // TLD must be at least 2 characters (e.g., com, org, ke, uk, net, io)
  if (!tld || tld.length < 2 || !/^[a-zA-Z]{2,}$/.test(tld)) {
    return false;
  }

  return true;
}

/**
 * Returns a human-friendly error string if email is invalid, or null if valid.
 */
export function getEmailValidationError(email: string, isRequired = false): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return isRequired ? 'Email address is required' : null;
  }

  if (!trimmed.includes('@')) {
    return 'Email must include "@" (e.g. yourname@gmail.com, yourname@yahoo.com)';
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return 'Please enter a complete email address (e.g. yourname@gmail.com)';
  }

  const domain = parts[1];
  if (!domain.includes('.')) {
    return 'Email domain must end with a valid extension (e.g. gmail.com, yahoo.com, or yourdomain.com)';
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-zA-Z]{2,}$/.test(tld)) {
    return 'Email address must end with a valid domain extension (e.g. .com, .yahoo.com, .co.ke, .org)';
  }

  if (!isValidEmail(trimmed)) {
    return 'Please enter a valid email address ending with a valid domain (e.g. gmail.com, yahoo.com, etc.)';
  }

  return null;
}
