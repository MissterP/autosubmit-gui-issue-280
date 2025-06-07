// Constants for Climate Models module

// View types
export const VIEW_TYPES = {
  AGGREGATED: 'aggregated',
  HISTORICAL: 'historical', 
  STACKED: 'stacked'
};

// Chart types and configurations
export const CHART_TYPES = {
  HISTOGRAM: 'histogram',
  LINE_CHART: 'lineChart',
  STACKED_AREA: 'stackedArea',
  SCATTER_PLOT: 'scatterPlot'
};

// Color palettes for charts
export const CHART_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1',
  '#14B8A6', '#F43F5E', '#8B5A2B', '#6366F1', '#84CC16'
];

// Default pagination settings
export const PAGINATION_DEFAULTS = {
  ITEMS_PER_PAGE: 9,
  MODELS_PER_PAGE: 2,
  MAX_BARS_DEFAULT: 10
};

// Date format defaults
export const DATE_DEFAULTS = {
  DEFAULT_DAYS_BACK: 30,
  DATE_FORMAT: 'YYYY-MM-DD'
};

// Metric configurations
export const METRICS_CONFIG = {
  POPULAR_MODELS: {
    id: 'popular-models',
    title: 'Popular Models',
    description: 'Analyze the most frequently used climate models in experiments. View aggregated usage statistics and historical trends to understand model popularity over time.',
    icon: 'fa-solid fa-chart-line',
    route: '/climate-models/popular-models'
  },
  FOOTPRINT_MODELS: {
    id: 'footprint-models',
    title: 'Models Carbon Footprint', 
    description: 'Monitor the computational footprint and resource usage of different climate models. Track energy consumption and performance metrics across simulation jobs.',
    icon: 'fa-solid fa-leaf',
    route: '/climate-models/footprint-models'
  },
  SYPD_PARALLELIZATION: {
    id: 'sypd-parallelization',
    title: 'SYPD vs Parallelization',
    description: 'Analyze Simulated Years Per Day performance against parallelization/CPU count. Compare performance across different climate models and HPC platforms.',
    icon: 'fa-solid fa-tachometer-alt',
    route: '/climate-models/sypd-parallelization'
  },
  CHSY_PARALLELIZATION: {
    id: 'chsy-parallelization', 
    title: 'CHSY vs Parallelization',
    description: 'Examine Core Hours per Simulated Year metrics versus parallelization levels. Understand scalability patterns across models and computing platforms.',
    icon: 'fa-solid fa-microchip',
    route: '/climate-models/chsy-parallelization'
  },
  JPSY_PARALLELIZATION: {
    id: 'jpsy-parallelization',
    title: 'JPSY vs Parallelization',
    description: 'Explore Joules per Simulated Year energy consumption patterns against CPU count. Evaluate energy efficiency across different parallelization strategies.',
    icon: 'fa-solid fa-bolt',
    route: '/climate-models/jpsy-parallelization'
  }
};

// Error messages
export const ERROR_MESSAGES = {
  LOADING_ERROR: 'Failed to load data. Please try again later.',
  NO_DATA: 'No data available for the selected filters.',
  NO_EXPERIMENTS: 'No experiments found.',
  SEARCH_NO_RESULTS: 'No results found matching your search criteria.'
};

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Chart dimensions and settings
export const CHART_SETTINGS = {
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 500,
  MIN_HEIGHT: 400,
  MARGIN: {
    TOP: 30,
    RIGHT: 80,
    BOTTOM: 100,
    LEFT: 240
  },
  BAR_HEIGHT: 50,
  PADDING: 0.1
};

// API endpoints (if needed for client-side configuration)
export const API_ENDPOINTS = {
  POPULAR_MODELS_AGGREGATED: '/popular-models/aggregated',
  POPULAR_MODELS_HISTORICAL: '/popular-models/historical',
  FOOTPRINT_MODELS_AGGREGATED: '/footprint-models/aggregated',
  FOOTPRINT_MODELS_HISTORICAL: '/footprint-models/historical',
  SYPD_PARALLELIZATION: '/sypd-parallelization',
  CHSY_PARALLELIZATION: '/chsy-parallelization',
  JPSY_PARALLELIZATION: '/jpsy-parallelization'
};