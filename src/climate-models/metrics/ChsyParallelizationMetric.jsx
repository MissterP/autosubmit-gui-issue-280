import React, { useState } from 'react';
import { useGetChsyParallelizationModelsQuery } from '../../services/climateModelsApiV1';
import useASTitle from '../../hooks/useASTitle';
import useBreadcrumb from '../../hooks/useBreadcrumb';
import ScalabilityScatterPlot from '../components/ScalabilityScatterPlot';
import { ModelFilter, HpcFilter } from '../components/ui/FilterComponents';
import { useParallelizationData } from '../hooks/useDataProcessing';
import { LoadingSpinner, ErrorState, NoDataState } from '../components/ui/StateComponents';

const ChsyParallelizationMetric = () => {
    useASTitle("CHSY vs Parallelization");
    useBreadcrumb([
        { name: "Climate Models", route: "/climate-models" },
        { name: "CHSY vs Parallelization" }
    ]);

    const [selectedModel, setSelectedModel] = useState('');
    const [selectedHpc, setSelectedHpc] = useState('');

    const { data, isFetching, isError } = useGetChsyParallelizationModelsQuery();

    // Use custom hook for data processing
    const { models, hpcs, filteredData } = useParallelizationData(data, selectedModel, selectedHpc);

    if (isError) {
        return <ErrorState message="Failed to load CHSY vs Parallelization data. Please try again later." />;
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-primary text-white">
                        <i className="fa-solid fa-microchip text-2xl"></i>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-dark dark:text-light">
                            CHSY vs Parallelization
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Examine Core Hours per Simulated Year metrics versus parallelization levels
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    <ModelFilter
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                        models={models}
                    />
                    <HpcFilter
                        selectedHpc={selectedHpc}
                        onHpcChange={setSelectedHpc}
                        hpcs={hpcs}
                    />
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                {isFetching ? (
                    <LoadingSpinner message="Loading chart data..." />
                ) : filteredData.length === 0 ? (
                    <NoDataState 
                        icon="fa-solid fa-chart-scatter"
                        title="No Data Available"
                        message="No CHSY vs Parallelization data found for the selected filters."
                    />
                ) : (
                    <ScalabilityScatterPlot
                        data={filteredData}
                        xAttribute="parallelization"
                        yAttribute="chsy"
                        title="CHSY vs Parallelization"
                        xLabel="Parallelization (CPU Count)"
                        yLabel="CHSY (Core Hours per Simulated Year)"
                        colorAttribute="model"
                    />
                )}
            </div>

            {/* Info Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <i className="fa-solid fa-info-circle text-blue-600 dark:text-blue-400 mt-1"></i>
                    <div>
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">About CHSY vs Parallelization</h3>
                        <p className="text-blue-700 dark:text-blue-300 text-sm">
                            This metric displays Core Hours per Simulated Year (CHSY) against the number of CPU cores used. 
                            CHSY represents the computational cost per simulated year. Lower values indicate better efficiency, 
                            while the relationship with parallelization helps understand scalability patterns and identify 
                            optimal resource allocation strategies.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChsyParallelizationMetric;
