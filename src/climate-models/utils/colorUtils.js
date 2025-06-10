/**
 * Color utilities for consistent color generation across charts
 */

// Extended color palette for climate models - 60+ unique colors
const CLIMATE_MODEL_COLORS = [
  // Primary colors (bright and distinct)
  '#3B82F6', // blue-500
  '#EF4444', // red-500  
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#F97316', // orange-500
  '#84CC16', // lime-500
  '#EC4899', // pink-500
  '#6366F1', // indigo-500
  '#14B8A6', // teal-500
  '#F43F5E', // rose-500
  '#8B5A2B', // brown-500
  '#6B7280', // gray-500
  '#7C2D12', // orange-900
  
  // Secondary colors (medium brightness)
  '#059669', // emerald-600
  '#DC2626', // red-600
  '#7C3AED', // violet-600
  '#0891B2', // cyan-600
  '#EA580C', // orange-600
  '#65A30D', // lime-600
  '#DB2777', // pink-600
  '#4F46E5', // indigo-600
  '#0D9488', // teal-600
  '#E11D48', // rose-600
  '#92400E', // amber-700
  '#5B21B6', // violet-700
  '#0F766E', // teal-700
  '#BE185D', // pink-700
  '#7E22CE', // purple-700
  
  // Darker colors (good for contrast)
  '#1E40AF', // blue-800
  '#B91C1C', // red-800
  '#047857', // emerald-800
  '#92400E', // amber-800
  '#5B21B6', // violet-800
  '#155E75', // cyan-800
  '#9A3412', // orange-800
  '#365314', // lime-800
  '#BE185D', // pink-800
  '#312E81', // indigo-800
  '#134E4A', // teal-800
  '#881337', // rose-800
  
  // Additional unique colors
  '#DC8850', // Custom orange
  '#50C878', // Emerald green
  '#9966CC', // Amethyst
  '#FF6B6B', // Coral red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky blue
  '#96CEB4', // Mint green
  '#FFEAA7', // Warm yellow
  '#DDA0DD', // Plum
  '#F0A500', // Bright orange
  '#20B2AA', // Light sea green
  '#FF69B4', // Hot pink
  '#32CD32', // Lime green
  '#FF1493', // Deep pink
  '#00CED1', // Dark turquoise
  '#FFB347', // Peach
  '#DA70D6', // Orchid
  '#87CEEB', // Sky blue
  '#98FB98', // Pale green
  '#F0E68C', // Khaki
];

/**
 * Global color cache to ensure consistent colors across all charts
 * Also tracks used colors to prevent duplicates
 */
const modelColorCache = new Map();
const usedColors = new Set();

/**
 * Generates a consistent color for a climate model name
 * Uses a hash-based approach with fallback to ensure uniqueness
 * 
 * @param {string} modelName - The name of the climate model
 * @returns {string} - Hex color code
 */
export const getClimateModelColor = (modelName) => {
  if (!modelName) return CLIMATE_MODEL_COLORS[0];
  
  // Check if we already have a color for this model
  if (modelColorCache.has(modelName)) {
    return modelColorCache.get(modelName);
  }
  
  // Generate a deterministic hash for the model name
  const hash = hashString(modelName);
  let colorIndex = Math.abs(hash) % CLIMATE_MODEL_COLORS.length;
  let color = CLIMATE_MODEL_COLORS[colorIndex];
  
  // If this color is already used, find the next available color
  let attempts = 0;
  while (usedColors.has(color) && attempts < CLIMATE_MODEL_COLORS.length) {
    colorIndex = (colorIndex + 1) % CLIMATE_MODEL_COLORS.length;
    color = CLIMATE_MODEL_COLORS[colorIndex];
    attempts++;
  }
  
  // If all colors are used, we need to generate a new unique color
  if (attempts === CLIMATE_MODEL_COLORS.length) {
    console.warn(`All ${CLIMATE_MODEL_COLORS.length} predefined colors are in use. Generating a fallback color for model '${modelName}'.`);
    // Generate a deterministic but unique color based on the hash
    const hue = Math.abs(hash) % 360;
    const saturation = 50 + (Math.abs(hash * 2) % 50); // 50-100%
    const lightness = 40 + (Math.abs(hash * 3) % 20); // 40-60%
    color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
  
  // Cache the color for future use and mark as used
  modelColorCache.set(modelName, color);
  usedColors.add(color);
  
  console.log(`🎨 Assigned color ${color} to model: ${modelName}`);
  return color;
};

/**
 * Simple hash function for string input
 * @param {string} str - Input string
 * @returns {number} - Hash value
 */
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
};

/**
 * Generates colors for multiple models ensuring consistency
 * @param {string[]} modelNames - Array of model names
 * @returns {Object} - Map of model names to colors
 */
export const getClimateModelColors = (modelNames) => {
  const colorMap = {};
  modelNames.forEach(modelName => {
    colorMap[modelName] = getClimateModelColor(modelName);
  });
  return colorMap;
};

/**
 * Extracts model name from URL or full path
 * @param {string} modelUrl - Model URL or path
 * @returns {string} - Extracted model name
 */
export const extractModelName = (modelUrl) => {
  if (!modelUrl) return 'Unknown';
  const parts = modelUrl.split('/');
  return parts[parts.length - 1] || 'Unknown';
};

/**
 * Clear the color cache (useful for testing or resetting)
 */
export const clearColorCache = () => {
  modelColorCache.clear();
  usedColors.clear();
};

/**
 * Get all cached model colors
 * @returns {Map} - Current color cache
 */
export const getColorCache = () => {
  return new Map(modelColorCache);
};

/**
 * Get statistics about color usage
 * @returns {Object} - Color usage statistics
 */
export const getColorStats = () => {
  return {
    totalColors: CLIMATE_MODEL_COLORS.length,
    usedColors: usedColors.size,
    cachedModels: modelColorCache.size,
    availableColors: CLIMATE_MODEL_COLORS.length - usedColors.size
  };
};
