/**
 * Get image URL from assets
 * All images are stored in src/assets/img/
 * Import them to make Vite bundle them correctly
 */
export function transformImageUrl(imagePath: string | undefined | null): string | null {
  if (!imagePath || imagePath.trim() === "") {
    return null;
  }

  // If already a full URL (http/https), return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // DB stores: /src/assets/img/book/hp1.webp
  // We need to import from: src/assets/img/book/hp1.webp
  // Vite will handle the transformation
  
  // Remove leading slash if present for consistent handling
  let cleanPath = imagePath;
  if (cleanPath.startsWith("/src/assets/")) {
    cleanPath = cleanPath.substring(1); // Remove leading /
  } else if (cleanPath.startsWith("src/assets/")) {
    // Already correct format
  } else if (cleanPath.startsWith("/assets/")) {
    cleanPath = "src" + cleanPath; // Convert /assets/ -> src/assets/
  } else if (cleanPath.startsWith("assets/")) {
    cleanPath = "src/" + cleanPath; // Convert assets/ -> src/assets/
  } else {
    // Unknown format, return as is
    return imagePath;
  }

  // Dynamic import the image
  // Note: This requires all images to actually exist in src/assets/img/
  try {
    // For Vite to work with dynamic imports, we need to use import.meta.glob
    // But for now, we'll construct the path that Vite can resolve
    return `/${cleanPath}`;
  } catch (error) {
    console.error("Failed to load image:", cleanPath, error);
    return null;
  }
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
 * These should exist in src/assets/img/
 */
export const FALLBACK_IMAGES = {
  book: "/src/assets/img/book/b1.webp",
  author: "/src/assets/img/avatar/sample-user-avatar.png",
  publisher: "/src/assets/img/publisher/georgenewnes.webp",
  user: "/src/assets/img/avatar/sample-user-avatar.png",
} as const;
