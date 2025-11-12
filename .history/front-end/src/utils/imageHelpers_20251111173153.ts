/**
 * Transform backend image path to frontend accessible URL
 * Backend now stores: /img/avatar/123-photo.jpg (directly accessible)
 * If old format exists (/src/assets/img/...), convert it to /img/...
 */
export function transformImageUrl(backendPath: string | undefined | null): string | null {
  if (!backendPath || backendPath.trim() === "") {
    return null;
  }

  // If already a full URL (http/https), return as is
  if (backendPath.startsWith("http://") || backendPath.startsWith("https://")) {
    return backendPath;
  }

  // If already correct format (/img/...), return as is
  if (backendPath.startsWith("/img/")) {
    return backendPath;
  }

  // Convert old backend path format to public URL format (backward compatibility)
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
