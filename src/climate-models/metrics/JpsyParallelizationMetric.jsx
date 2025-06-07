import React, { useState, useMemo } from 'react';
import { useGetJpsyParallelizationModelsQuery } from '../../services/climateModelsApiV1';
import useASTitle from '../../hooks/useASTitle';
import useBreadcrumb from '../../hooks/useBreadcrumb';
import ScalabilityScatterPlot from '../components/ScalabilityScatterPlot';
import { extractModelName } from '../../services/utils';

const JpsyParallelizationMetric = () => {
    useASTitle("JPSY vs Parallelization");
    useBreadcrumb([
        { name: "Climate Models", route: "/climate-models" },
        { name: "JPSY vs Parallelization" }
    ]);

    const [selectedModel, setSelectedModel] = useState('');
    const [selectedHpc, setSelectedHpc] = useState('');

    const { data, isFetching, isError } = useGetJpsyParallelizationModelsQuery();

    // Extract unique models and HPCs for filters
    const { models, hpcs, filteredData } = useMemo(() => {
        
        if (!data || !data.experiments) {
            console.log('JPSY: No data or experiments found');
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

    if (isError) {
        return (
            <div className="flex flex-col gap-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <i className="fa-solid fa-exclamation-triangle text-red-600 dark:text-red-400"></i>
                        <div>
                            <h3 className="font-semibold text-red-800 dark:text-red-200">Error Loading Data</h3>
                            <p className="text-red-600 dark:text-red-400">
                                Failed to load JPSY vs Parallelization data. Please try again later.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-primary text-white">
                        <i className="fa-solid fa-bolt text-2xl"></i>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-dark dark:text-light">
                            JPSY vs Parallelization
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Explore Joules per Simulated Year energy consumption patterns against CPU count
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    <div className="min-w-48">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Climate Model
                        </label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-dark dark:text-light focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">All Models</option>
                            {models.map(model => (
                                <option key={model} value={model}>{extractModelName(model)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="min-w-48">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            HPC Platform
                        </label>
                        <select
                            value={selectedHpc}
                            onChange={(e) => setSelectedHpc(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-dark dark:text-light focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">All HPCs</option>
                            {hpcs.map(hpc => (
                                <option key={hpc} value={hpc}>{hpc}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                {isFetching ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-spinner fa-spin text-primary text-xl"></i>
                            <span className="text-gray-600 dark:text-gray-300">Loading chart data...</span>
                        </div>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <i className="fa-solid fa-chart-scatter text-4xl text-gray-400 mb-4"></i>
                            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                                No Data Available
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                No JPSY vs Parallelization data found for the selected filters.
                            </p>
                        </div>
                    </div>
                ) : (
                    <ScalabilityScatterPlot
                        data={filteredData}
                        xAttribute="parallelization"
                        yAttribute="jpsy"
                        title="JPSY vs Parallelization"
                        xLabel="Parallelization (CPU Count)"
                        yLabel="JPSY (Joules per Simulated Year)"
                        colorAttribute="model"
                    />
                )}
            </div>

            {/* Info Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <i className="fa-solid fa-info-circle text-blue-600 dark:text-blue-400 mt-1"></i>
                    <div>
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">About JPSY vs Parallelization</h3>
                        <p className="text-blue-700 dark:text-blue-300 text-sm">
                            This metric shows Joules per Simulated Year (JPSY) energy consumption versus the number of CPU cores. 
                            JPSY measures the energy cost of climate simulations. Lower values indicate better energy efficiency, 
                            while the relationship with parallelization helps identify energy-optimal scaling strategies for 
                            different models and HPC platforms.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JpsyParallelizationMetric;
