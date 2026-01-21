/**
 * Security utilities for input sanitization and XSS prevention.
 * 
 * These functions help prevent cross-site scripting (XSS) attacks
 * by sanitizing user input before display or submission.
 */

/**
 * Escape HTML special characters to prevent XSS.
 * Use this when displaying user-generated content in HTML.
 * 
 * @param str - The string to escape
 * @returns The escaped string safe for HTML display
 */
export function escapeHtml(str: string): string {
  if (!str) return str;
  
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return str.replace(/[&<>"'/]/g, (char) => htmlEscapes[char]);
}

/**
 * Sanitize text input by removing potentially dangerous content.
 * Use this before submitting user input to the API.
 * 
 * @param str - The string to sanitize
 * @param maxLength - Optional maximum length to truncate to
 * @returns The sanitized string
 */
export function sanitizeInput(str: string, maxLength?: number): string {
  if (!str) return str;
  
  // Remove null bytes and control characters (except newlines/tabs)
  let sanitized = str.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Truncate if needed
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Check if a string contains HTML-like content.
 * Use this to validate user input before submission.
 * 
 * @param str - The string to check
 * @returns True if the string contains HTML tags
 */
export function containsHtml(str: string): boolean {
  if (!str) return false;
  return /<[^>]+>/.test(str);
}

/**
 * Check if a string contains script tags or JavaScript.
 * Use this to detect potential XSS attempts.
 * 
 * @param str - The string to check
 * @returns True if the string contains script-related content
 */
export function containsScript(str: string): boolean {
  if (!str) return false;
  const scriptPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,  // Event handlers like onclick=, onerror=
    /data:\s*text\/html/i,
  ];
  return scriptPatterns.some(pattern => pattern.test(str));
}

/**
 * Validate and sanitize form data before submission.
 * Returns sanitized data and any validation errors.
 * 
 * @param data - Object containing form field values
 * @param rules - Validation rules for each field
 * @returns Object with sanitized data and errors
 */
export function validateAndSanitize<T extends Record<string, unknown>>(
  data: T,
  rules: Partial<Record<keyof T, { maxLength?: number; required?: boolean; noHtml?: boolean }>>
): { sanitized: T; errors: Partial<Record<keyof T, string>> } {
  const sanitized = { ...data };
  const errors: Partial<Record<keyof T, string>> = {};
  
  for (const [key, value] of Object.entries(data)) {
    const rule = rules[key as keyof T];
    
    if (typeof value === 'string') {
      // Sanitize string values
      let sanitizedValue = sanitizeInput(value, rule?.maxLength);
      
      // Check for required fields
      if (rule?.required && !sanitizedValue.trim()) {
        errors[key as keyof T] = `${key} is required`;
        continue;
      }
      
      // Check for HTML if not allowed
      if (rule?.noHtml && containsHtml(sanitizedValue)) {
        errors[key as keyof T] = `HTML is not allowed in ${key}`;
        continue;
      }
      
      // Check for script content (always blocked)
      if (containsScript(sanitizedValue)) {
        errors[key as keyof T] = `Invalid content in ${key}`;
        continue;
      }
      
      (sanitized as Record<string, unknown>)[key] = sanitizedValue;
    }
  }
  
  return { sanitized, errors };
}

/**
 * Safely set innerHTML with escaped content.
 * Prefer using React's JSX which auto-escapes, but use this
 * when you must set innerHTML directly.
 * 
 * @param element - The DOM element
 * @param content - The content to set (will be escaped)
 */
export function safeSetInnerHTML(element: HTMLElement, content: string): void {
  element.textContent = content; // textContent is always safe
}

/**
 * Create a safe URL by validating the protocol.
 * Prevents javascript: and data: URL attacks.
 * 
 * @param url - The URL to validate
 * @returns The URL if safe, or '#' if potentially dangerous
 */
export function safeUrl(url: string): string {
  if (!url) return '#';
  
  try {
    const parsed = new URL(url, window.location.origin);
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    
    if (!allowedProtocols.includes(parsed.protocol)) {
      console.warn(`Blocked potentially dangerous URL: ${url}`);
      return '#';
    }
    
    return url;
  } catch {
    // Relative URLs are fine
    if (url.startsWith('/') || url.startsWith('#')) {
      return url;
    }
    return '#';
  }
}
