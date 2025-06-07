import { extractModelName } from '../../utils';

/**
 * Reusable Model Filter Component
 */
export const ModelFilter = ({ 
  selectedModel, 
  onModelChange, 
  models, 
  label = "Climate Model",
  className = "min-w-48" 
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-dark dark:text-light focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <option value="">All Models</option>
        {models.map(model => (
          <option key={model} value={model}>
            {extractModelName(model)}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * Reusable HPC Filter Component
 */
export const HpcFilter = ({ 
  selectedHpc, 
  onHpcChange, 
  hpcs, 
  label = "HPC Platform",
  className = "min-w-48" 
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <select
        value={selectedHpc}
        onChange={(e) => onHpcChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-dark dark:text-light focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <option value="">All HPCs</option>
        {hpcs.map(hpc => (
          <option key={hpc} value={hpc}>
            {hpc}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * Reusable Search Filter Component
 */
export const SearchFilter = ({ 
  searchValue, 
  onSearchChange, 
  placeholder = "Search...",
  className = "max-w-md" 
}) => {
  return (
    <div className={className}>
      <div className="relative">
        <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-dark dark:text-light focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
    </div>
  );
};

/**
 * Reusable Date Range Filter Component
 */
export const DateRangeFilter = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  className = "flex gap-4" 
}) => {
  return (
    <div className={className}>
      <div className="min-w-40">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-dark dark:text-light focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <div className="min-w-40">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          End Date
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-dark dark:text-light focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
    </div>
  );
};

/**
 * Reusable Limit Filter Component
 */
export const LimitFilter = ({ 
  limit, 
  onLimitChange, 
  options = [3, 5, 10, 15, 20],
  label = "Limit",
  className = "min-w-32" 
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <select
        value={limit}
        onChange={(e) => onLimitChange(Number(e.target.value))}
        className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-dark dark:text-light focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * Combined Filter Container Component
 */
export const FilterContainer = ({ children, className = "flex flex-wrap gap-4" }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};