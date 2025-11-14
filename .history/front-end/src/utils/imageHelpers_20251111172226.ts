/**
 * Transform backend image path to frontend accessible URL
 * Backend stores: /src/assets/img/avatar/123-photo.jpg
 * Frontend needs: /src/assets/img/avatar/123-photo.jpg (Vite will handle via import.meta.url)
 * 
 * For dynamic imports in Vite, we use new URL() with import.meta.url
 */
export function transformImageUrl(backendPath: string | undefined | null): string | null {
  if (!backendPath || backendPath.trim() === "") {
    return null;
  }

  // If already a full URL (http/https), return as is
  if (backendPath.startsWith("http://") || backendPath.startsWith("https://")) {
    return backendPath;
  }

  // For paths starting with /src/assets/img/, use Vite's dynamic import
  // We need to construct the full path for new URL()
  if (backendPath.startsWith("/src/assets/img/") || backendPath.startsWith("src/assets/img/")) {
    // Remove leading slash if exists
    const cleanPath = backendPath.startsWith("/") ? backendPath.slice(1) : backendPath;
    
    // Vite requires explicit path in new URL(), so we'll return the path
    // and let the component handle the import
    return backendPath;
  }
  
  // For paths already in correct format (e.g., /img/avatar/photo.jpg)
  return backendPath;
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
 * These files exist in public/img/
 */
export const FALLBACK_IMAGES = {
  book: "/img/book/b1.webp",
  author: "/img/avatar/sample-user-avatar.png",
  publisher: "/img/publisher/georgenewnes.webp",
  user: "/img/avatar/sample-user-avatar.png",
} as const;
