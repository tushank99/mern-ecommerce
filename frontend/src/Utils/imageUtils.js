/**
 * Image URL Helper Utility
 * 
 * Handles image URLs for both development and production environments.
 * - Cloudinary URLs (production): Returned as-is
 * - External URLs (http/https): Returned as-is  
 * - Local paths (development): Prepended with backend URL
 */

import { BASE_URL } from "../redux/constants";

// Default placeholder image when no image is available or image fails to load
// Using free Unsplash image - no signup required
export const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop";

/**
 * Resolves an image URL to work in both development and production
 * @param {string} imagePath - The image path from the database
 * @returns {string} - Fully qualified image URL
 */
export const getImageUrl = (imagePath) => {
  // If no image path provided, return placeholder
  if (!imagePath) {
    return PLACEHOLDER_IMAGE;
  }

  // If it's already an absolute URL (Cloudinary, external), return as-is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // If it's a local path (starts with / or uploads/)
  // In development, prepend the backend URL
  // In production on Vercel, local uploads won't work - this is a fallback
  const backendUrl = BASE_URL || "";
  
  // Ensure the path starts with /
  const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  
  return `${backendUrl}${normalizedPath}`;
};

/**
 * Error handler for image loading failures
 * Sets the image source to a placeholder
 * @param {Event} event - The error event from img onError
 */
export const handleImageError = (event) => {
  event.target.onerror = null; // Prevent infinite loop
  event.target.src = PLACEHOLDER_IMAGE;
};

/**
 * Image component props helper - returns props for img element
 * @param {string} imagePath - The image path from the database
 * @param {string} alt - Alt text for the image
 * @returns {object} - Props object for img element
 */
export const getImageProps = (imagePath, alt = "Product") => ({
  src: getImageUrl(imagePath),
  alt,
  onError: handleImageError,
});
