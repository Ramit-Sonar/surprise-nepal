/** Format a price value with the Nepali Rupee symbol */
export function formatPrice(value: number): string {
  return `रु ${value.toLocaleString()}`
}

/** Validate an email address */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/** Validate a Nepali phone number (10 digits, starts with 9) */
export function isValidPhone(phone: string): boolean {
  return /^9\d{9}$/.test(phone.replace(/\s/g, ""))
}

export const VALIDATION_MESSAGES = {
  required: (field: string) => `${field} is required`,
  email: "Enter a valid email address",
  phone: "Enter a valid 10-digit Nepali phone number",
  password: "Password must be at least 8 characters",
  passwordConfirmation: "Passwords do not match",
  imageType: "Upload a valid JPG, PNG, or WebP image",
  imageSize: "Image must be under 5 MB",
} as const

export function getImageValidationError(
  file: File,
  maxSizeMb = 5,
): string | null {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return VALIDATION_MESSAGES.imageType
  }
  if (file.size > maxSizeMb * 1024 * 1024) return VALIDATION_MESSAGES.imageSize
  return null
}
