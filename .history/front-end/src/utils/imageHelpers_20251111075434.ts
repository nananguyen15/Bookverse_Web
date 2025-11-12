/**
 * Convert backend image path to frontend public path
 * Backend: /src/assets/img/book/hp1.webp
 * Frontend: /img/book/hp1.webp
 */
export function transformImageUrl(backendPath: string | undefined | null): string | null {
  if (!backendPath || backendPath.trim() === "") {
    return null;
  }

  // If already a full URL (http/https), return as is
  if (backendPath.startsWith("http://") || backendPath.startsWith("https://")) {
    return backendPath;
  }

  // Remove /src/assets prefix from backend path
  const cleanPath = backendPath.replace(/^\/src\/assets/, "");
  
  // Return the cleaned path (should start with /img/)
  return cleanPath;
}

/**
 * Get image URL with fallback for different entity types
 */
export function getImageUrl(
  imagePath: string | undefined | null,
  fallback: string
): string {
  const transformed = transformImageUrl(imagePath);
  return transformed || fallback;
}

/**
 * Fallback images for different entity types
 */
export const FALLBACK_IMAGES = {
  book: "/img/book/b1.webp",
  author: "/img/avatar/sample-user-avatar.png",
  publisher: "/img/publisher/georgenewnes.webp",
  user: "/img/avatar/sample-user-avatar.png",
} as const;
