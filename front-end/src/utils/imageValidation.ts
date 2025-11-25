/**
 * Image Upload & URL Validation Utilities
 * Validates file types, sizes, and URL formats for image uploads
 */

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate an image file for upload
 * Checks file type, extension, and size
 */
export function validateImageFile(file: File): ValidationResult {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Only image files (JPG, PNG, GIF, WEBP, SVG) are allowed' 
    };
  }
  
  // Check file extension
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return { 
      valid: false, 
      error: 'Invalid file extension. Allowed: JPG, PNG, GIF, WEBP, SVG' 
    };
  }
  
  // Check file size (max 5MB)
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return { 
      valid: false, 
      error: `File size (${sizeMB}MB) exceeds 5MB limit` 
    };
  }
  
  return { valid: true };
}

/**
 * Validate an image URL
 * Checks URL format and ensures it points to an image
 */
export function validateImageUrl(url: string): ValidationResult {
  if (!url || url.trim() === '') {
    return { valid: false, error: 'Image URL cannot be empty' };
  }
  
  const trimmedUrl = url.trim();
  
  // Check URL format - must start with http://, https://, or /
  const urlPattern = /^(https?:\/\/|\/)/i;
  if (!urlPattern.test(trimmedUrl)) {
    return { 
      valid: false, 
      error: 'URL must start with http://, https://, or /' 
    };
  }
  
  // Check if URL ends with image extension (optional query params allowed)
  const imageExtPattern = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
  if (!imageExtPattern.test(trimmedUrl)) {
    return { 
      valid: false, 
      error: 'URL must point to an image file (JPG, PNG, GIF, WEBP, SVG)' 
    };
  }
  
  return { valid: true };
}
