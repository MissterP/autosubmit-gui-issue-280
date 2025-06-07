import { useMemo } from 'react';

/**
 * Custom hook for processing parallelization metrics data
 * @param {Object} data - Raw API data
 * @param {string} selectedModel - Selected model filter
 * @param {string} selectedHpc - Selected HPC filter
 * @returns {Object} Processed data including models, hpcs, and filtered data
 */
export const useParallelizationData = (data, selectedModel, selectedHpc) => {
  return useMemo(() => {
    if (!data || !data.experiments) {
      console.log('No data or experiments found');
      return { models: [], hpcs: [], filteredData: [] };
    }

    // Flatten the nested experiments structure
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
    
    const uniqueModels = [...new Set(flattenedData.map(item => item.model))].sort();
    const uniqueHpcs = [...new Set(flattenedData.map(item => item.hpc))].sort();

    let filtered = flattenedData;
    if (selectedModel) {
      filtered = filtered.filter(item => item.model === selectedModel);
    }
    if (selectedHpc) {
      filtered = filtered.filter(item => item.hpc === selectedHpc);
    }

    return {
      models: uniqueModels,
      hpcs: uniqueHpcs,
      filteredData: filtered
    };
  }, [data, selectedModel, selectedHpc]);
};

/**
 * Custom hook for processing aggregated metric data
 * @param {Object} data - Raw API data
 * @param {number} limit - Number of items to limit
 * @returns {Object} Processed aggregated data
 */
export const useAggregatedData = (data, limit) => {
  return useMemo(() => {
    if (!data?.models) {
      return { models: [], totalCount: 0 };
    }

    const processedModels = data.models
      .slice(0, limit)
      .map(model => ({
        ...model,
        displayName: model.model?.split('/').pop() || model.model || 'Unknown'
      }));

    return {
      models: processedModels,
      totalCount: data.models.length
    };
  }, [data, limit]);
};

/**
 * Custom hook for processing historical metric data
 * @param {Object} data - Raw API data
 * @param {string} selectedDate - Selected date filter
 * @returns {Object} Processed historical data
 */
export const useHistoricalData = (data, selectedDate) => {
  return useMemo(() => {
    if (!data?.models) {
      return { chartData: [], dateOptions: [], experimentsForDate: [] };
    }

    // Process chart data for line/stacked charts
    const chartData = Object.entries(data.models).map(([date, models]) => ({
      date,
      models: models.map(model => ({
        ...model,
        displayName: model.model?.split('/').pop() || model.model || 'Unknown'
      }))
    }));

    // Get available dates for dropdown
    const dateOptions = Object.keys(data.models).sort();

    // Get experiments for selected date
    const experimentsForDate = selectedDate && data.models[selectedDate] 
      ? data.models[selectedDate].flatMap(model => 
          (model.experiments || []).map(exp => ({
            expid: exp,
            model: model.model,
            displayName: model.model?.split('/').pop() || model.model || 'Unknown'
          }))
        )
      : [];

    return {
      chartData,
      dateOptions,
      experimentsForDate
    };
  }, [data, selectedDate]);
};