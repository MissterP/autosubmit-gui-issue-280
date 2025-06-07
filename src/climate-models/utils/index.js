// Utility functions for Climate Models module

import { CHART_COLORS } from '../constants';

/**
 * Extracts model name from a URL or path
 * @param {string} url - The URL or path containing the model name
 * @returns {string} - The extracted model name
 */
export const extractModelName = (url) => {
  if (!url) return 'Unknown';
  const parts = url.split('/');
  return parts[parts.length - 1] || 'Unknown';
};

/**
 * Generates a color based on index for consistent chart coloring
 * @param {number} index - The index for color generation
 * @returns {string} - The hex color code
 */
export const generateColor = (index) => {
  return CHART_COLORS[index % CHART_COLORS.length];
};

/**
 * Formats numeric values for display in charts
 * @param {number} value - The numeric value to format
 * @param {boolean} formatAsInteger - Whether to format as integer
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - The formatted value
 */
export const formatChartValue = (value, formatAsInteger = true, decimals = 2) => {
  if (value == null || isNaN(value)) return '0';
  
  if (formatAsInteger) {
    return Math.round(value).toLocaleString();
  }
  
  return Number(value).toFixed(decimals);
};

/**
 * Formats axis labels for charts with abbreviated values
 * @param {number} value - The numeric value to format
 * @param {boolean} formatAsInteger - Whether to format as integer
 * @returns {string} - The formatted axis label
 */
export const formatAxisLabel = (value, formatAsInteger = true) => {
  if (value == null || isNaN(value)) return '0';
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1e9) {
    return formatAsInteger ? 
      `${(value / 1e9).toFixed(0)}B` : 
      `${(value / 1e9).toFixed(1)}B`;
  } else if (absValue >= 1e6) {
    return formatAsInteger ? 
      `${(value / 1e6).toFixed(0)}M` : 
      `${(value / 1e6).toFixed(1)}M`;
  } else if (absValue >= 1e3) {
    return formatAsInteger ? 
      `${(value / 1e3).toFixed(0)}K` : 
      `${(value / 1e3).toFixed(1)}K`;
  }
  
  return formatAsInteger ? 
    Math.round(value).toString() : 
    value.toFixed(1);
};

/**
 * Processes experiment data by flattening nested structures
 * @param {Object} data - The raw experiment data
 * @returns {Array} - Flattened array of experiments
 */
export const flattenExperimentData = (data) => {
  if (!data || !data.experiments) {
    return [];
  }

  const flattenedData = [];
  
  Object.entries(data.experiments).forEach(([modelHpcKey, experiments]) => {
    // Extract HPC from the key (format: "model,hpc")
    const hpc = modelHpcKey.split(',')[1];
    
    experiments.forEach(experiment => {
      flattenedData.push({
        ...experiment,
        hpc: hpc || experiment.hpc // Use extracted HPC or fallback to experiment's HPC
      });
    });
  });
  
  return flattenedData;
};

/**
 * Filters data based on selected model and HPC
 * @param {Array} data - The data array to filter
 * @param {string} selectedModel - The selected model filter
 * @param {string} selectedHpc - The selected HPC filter
 * @returns {Array} - Filtered data array
 */
export const filterExperimentData = (data, selectedModel, selectedHpc) => {
  let filtered = [...data];
  
  if (selectedModel) {
    filtered = filtered.filter(item => item.model === selectedModel);
  }
  
  if (selectedHpc) {
    filtered = filtered.filter(item => item.hpc === selectedHpc);
  }
  
  return filtered;
};

/**
 * Extracts unique values from data array for filter options
 * @param {Array} data - The data array
 * @param {string} key - The key to extract unique values from
 * @returns {Array} - Sorted array of unique values
 */
export const getUniqueValues = (data, key) => {
  if (!Array.isArray(data)) return [];
  
  const uniqueValues = [...new Set(data.map(item => item[key]))];
  return uniqueValues.filter(Boolean).sort();
};

/**
 * Formats footprint values for display
 * @param {number} value - The footprint value
 * @returns {string} - Formatted footprint string
 */
export const formatFootprint = (value) => {
  if (value == null || isNaN(value)) return '0 gCO₂';
  
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)} MgCO₂`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)} kgCO₂`;
  }
  
  return `${value.toFixed(2)} gCO₂`;
};

/**
 * Gets experiment name from full experiment identifier
 * @param {string} experimentName - Full experiment identifier
 * @returns {string} - Cleaned experiment name
 */
export const getExperimentName = (experimentName) => {
  if (!experimentName) return 'Unknown';
  
  // Remove common prefixes and clean up the name
  return experimentName
    .replace(/^(exp_|experiment_)?/, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Debounce function for search inputs
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Creates default date range (30 days back from today)
 * @returns {Object} - Object with startDate and endDate
 */
export const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

/**
 * Validates date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {boolean} - Whether the date range is valid
 */
export const isValidDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return start <= end && start <= new Date();
};