/**
 * Transform backend image path to frontend accessible URL
 * Backend stores: /src/assets/img/book/hp1.webp
 * But actual files are in: public/img/book/hp1.webp
 * We need to convert to: /img/book/hp1.webp (public URL)
 */
export function transformImageUrl(backendPath: string | undefined | null): string | null {
  if (!backendPath || backendPath.trim() === "") {
    return null;
  }

  // If already a full URL (http/https), return as is
  if (backendPath.startsWith("http://") || backendPath.startsWith("https://")) {
    return backendPath;
  }

  // Convert backend path format to public URL format
  // /src/assets/img/book/hp1.webp → /img/book/hp1.webp
  let publicPath = backendPath;
  
  if (publicPath.startsWith("/src/assets/img/")) {
    publicPath = publicPath.replace("/src/assets/img/", "/img/");
  } else if (publicPath.startsWith("src/assets/img/")) {
    publicPath = "/" + publicPath.replace("src/assets/img/", "img/");
  } else if (publicPath.startsWith("/src/assets/")) {
    publicPath = publicPath.replace("/src/assets", "");
  } else if (publicPath.startsWith("src/assets/")) {
    publicPath = "/" + publicPath.replace("src/assets/", "");
  }
  
  return publicPath;
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
