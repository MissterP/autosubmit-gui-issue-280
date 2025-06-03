import { DotLoader } from "../../../common/Loaders";
import CarbonFootprintComparison from "./CarbonFootprintComparison";
import { formatNumberMoney } from "../../../components/context/utils";

const TopExperimentsSection = ({ 
    data, 
    isLoading, 
    isError, 
    handleExperimentClick 
}) => {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                <h3 className="text-lg font-semibold text-dark dark:text-light mb-4">
                    Top 3 Experiments by Model
                </h3>
                <div className="flex justify-center py-8">
                    <DotLoader />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                <h3 className="text-lg font-semibold text-dark dark:text-light mb-4">
                    Top 3 Experiments by Model
                </h3>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-600 dark:text-red-400">
                        Error loading experiment data. Please try again.
                    </p>
                </div>
            </div>
        );
    }

    if (!data?.models || data.models.length === 0) {
        return (
            <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                <h3 className="text-lg font-semibold text-dark dark:text-light mb-4">
                    Top 3 Experiments by Model
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                    No experiment data available.
                </p>
            </div>
        );
    }

    const getModelName = (modelPath) => {
        if (!modelPath) return 'Unknown Model';
        const parts = modelPath.split('/');
        return parts[parts.length - 1] || 'Unknown Model';
    };

    const formatFootprint = (value) => {
        if (!value || isNaN(value)) return '0.00';
        // Convert to number if it's a string and ensure proper formatting
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return '0.00';
        return formatNumberMoney(numValue, false, 2);
    };

    // Calculate total footprint across all models
    const totalFootprint = data.models.reduce((total, model) => {
        return total + (model.footprint || 0);
    }, 0);

    return (
        <>
            <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                <div className="flex items-center gap-3 mb-6">
                    <i className="fa-solid fa-trophy text-yellow-500 text-xl"></i>
                    <h3 className="text-lg font-semibold text-dark dark:text-light">
                        Top 3 Experiments by Model
                    </h3>
                </div>

                <div className="space-y-6">
                    {data.models.map((model, modelIndex) => {
                        const modelName = getModelName(model.model);
                        const topExperiments = model.top_experiments || [];

                        return (
                            <div 
                                key={model.model || modelIndex} 
                                className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-5 border border-gray-100 dark:border-neutral-600"
                            >
                                {/* Model Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <i className="fa-solid fa-cube text-blue-500"></i>
                                        <h4 className="text-base font-semibold text-dark dark:text-light">
                                            {modelName}
                                        </h4>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Total Footprint: <span className="font-medium text-black dark:text-white">
                                            {formatFootprint(model.footprint)} gCO₂
                                        </span>
                                    </div>
                                </div>

                                {/* Top Experiments */}
                                {topExperiments.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {topExperiments.map((experiment, expIndex) => (
                                            <div
                                                key={experiment.expid || expIndex}
                                                className="bg-white dark:bg-neutral-700 rounded-lg p-4 border border-gray-200 dark:border-neutral-600 hover:shadow-md transition-shadow cursor-pointer group"
                                                onClick={() => handleExperimentClick(experiment.expid)}
                                            >
                                                {/* Ranking Badge */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        {expIndex === 0 && (
                                                            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-bold px-2 py-1 rounded-full">
                                                                #1
                                                            </span>
                                                        )}
                                                        {expIndex === 1 && (
                                                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded-full">
                                                                #2
                                                            </span>
                                                        )}
                                                        {expIndex === 2 && (
                                                            <span className="bg-bronze-100 dark:bg-amber-900/30 text-bronze-800 dark:text-amber-300 text-xs font-bold px-2 py-1 rounded-full">
                                                                #3
                                                            </span>
                                                        )}
                                                    </div>
                                                    <i className="fa-solid fa-external-link-alt text-gray-400 group-hover:text-blue-500 transition-colors"></i>
                                                </div>

                                                {/* Experiment Info */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <i className="fa-solid fa-flask text-blue-500 text-sm"></i>
                                                        <span className="font-medium text-dark dark:text-light text-sm">
                                                            {experiment.expid}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <i className="fa-solid fa-leaf text-black dark:text-white text-sm"></i>
                                                        <span className="text-sm text-black dark:text-white">
                                                            {formatFootprint(experiment.footprint)} gCO₂
                                                        </span>
                                                    </div>

                                                    {experiment.job_count && (
                                                        <div className="flex items-center gap-2">
                                                            <i className="fa-solid fa-tasks text-purple-500 text-sm"></i>
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                {formatNumberMoney(experiment.job_count, true)} jobs
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Progress Bar (percentage of model's total footprint) */}
                                                {model.footprint > 0 && (
                                                    <div className="mt-3">
                                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                            <span>% of model</span>
                                                            <span>{((experiment.footprint / model.footprint) * 100).toFixed(1)}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                            <div 
                                                                className={`h-2 rounded-full transition-all duration-500 ${
                                                                    expIndex === 0 ? 'bg-yellow-500' :
                                                                    expIndex === 1 ? 'bg-gray-500' :
                                                                    'bg-amber-600'
                                                                }`}
                                                                style={{ 
                                                                    width: `${Math.min((experiment.footprint / model.footprint) * 100, 100)}%` 
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                        <i className="fa-solid fa-info-circle mb-2"></i>
                                        <p className="text-sm">No experiments available for this model</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-neutral-600">
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <i className="fa-solid fa-info-circle"></i>
                        Click on any experiment to view its complete details
                    </p>
                </div>
            </div>

            {/* Carbon Footprint Comparison Section */}
            <CarbonFootprintComparison 
                footprintGrams={totalFootprint}
                title="Climate Models Carbon Footprint Comparison"
            />
        </>
    );
};

export default TopExperimentsSection;
