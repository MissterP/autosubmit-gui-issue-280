import { useState } from "react";
import { DotLoader } from "../../common/Loaders";
import CarbonFootprintComparison from "./shared/CarbonFootprintComparison";
import { formatNumberMoney } from "../../components/context/utils";

const TopExperimentsSection = ({ 
    data, 
    isLoading, 
    isError, 
    handleExperimentClick 
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const modelsPerPage = 2;

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-neutral-700 rounded-lg p-8 border border-gray-200 dark:border-neutral-600">
                <h3 className="text-3xl font-semibold text-dark dark:text-light mb-6">
                    Top 3 Experiments per Model
                </h3>
                <div className="flex justify-center py-8">
                    <DotLoader />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-white dark:bg-neutral-700 rounded-lg p-8 border border-gray-200 dark:border-neutral-600">
                <h3 className="text-3xl font-semibold text-dark dark:text-light mb-6">
                    Top 3 Experiments per Model
                </h3>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <p className="text-red-600 dark:text-red-400 text-lg">
                        Error loading experiment data. Please try again.
                    </p>
                </div>
            </div>
        );
    }

    if (!data?.models || data.models.length === 0) {
        return (
            <div className="bg-white dark:bg-neutral-700 rounded-lg p-8 border border-gray-200 dark:border-neutral-600">
                <h3 className="text-3xl font-semibold text-dark dark:text-light mb-6">
                    Top 3 Experiments per Model
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xl">
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

    const getExperimentName = (experimentName) => {
        if (!experimentName) return 'Unknown Experiment';
        return experimentName;
    };

    // Pagination logic
    const totalModels = data.models.length;
    const totalPages = Math.ceil(totalModels / modelsPerPage);
    const startIndex = (currentPage - 1) * modelsPerPage;
    const endIndex = startIndex + modelsPerPage;
    const currentModels = data.models.slice(startIndex, endIndex);

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const goToPrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Calculate total footprint across all models
    const totalFootprint = data.models.reduce((total, model) => {
        return total + (model.footprint || 0);
    }, 0);

    return (
        <div className="space-y-6">
            {/* Carbon Footprint Comparison Section */}
            <CarbonFootprintComparison footprintGrams={totalFootprint} />

            {/* Top Experiments Section */}
            <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <i className="fa-solid fa-trophy text-yellow-500 text-2xl"></i>
                        <h3 className="text-xl font-semibold text-dark dark:text-light">
                            Top 3 Experiments per Model
                        </h3>
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400 mr-3">
                                Page {currentPage} of {totalPages} ({totalModels} models)
                            </span>
                            <button
                                onClick={goToPrevious}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-gray-200 dark:bg-neutral-600 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-neutral-500 transition-colors"
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            <button
                                onClick={goToNext}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 bg-gray-200 dark:bg-neutral-600 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-neutral-500 transition-colors"
                            >
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    {currentModels.map((model, modelIndex) => {
                        const modelName = getModelName(model.model);
                        const topExperiments = model.top_experiments || [];

                        return (
                            <div 
                                key={model.model || modelIndex} 
                                className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-6 border border-gray-100 dark:border-neutral-600"
                            >
                                {/* Model Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <i className="fa-solid fa-cube text-blue-500 text-2xl"></i>
                                        <h4 className="text-lg font-semibold text-dark dark:text-light">
                                            {modelName}
                                        </h4>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Carbon Footprint</div>
                                        <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                            {formatFootprint(model.footprint)} gCO₂
                                        </div>
                                    </div>
                                </div>

                                {/* Top Experiments */}
                                {topExperiments.length > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {topExperiments.map((experiment, expIndex) => (
                                            <div
                                                key={experiment.experiment_name || expIndex}
                                                className="bg-white dark:bg-neutral-700 rounded-lg p-8 border border-gray-200 dark:border-neutral-600 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
                                                onClick={() => handleExperimentClick(experiment.experiment_name)}
                                            >
                                                {/* Ranking Badge */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        {expIndex === 0 && (
                                                            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-sm font-bold px-3 py-1 rounded-full">
                                                                #1
                                                            </span>
                                                        )}
                                                        {expIndex === 1 && (
                                                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-sm font-bold px-3 py-1 rounded-full">
                                                                #2
                                                            </span>
                                                        )}
                                                        {expIndex === 2 && (
                                                            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-sm font-bold px-3 py-1 rounded-full">
                                                                #3
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Experiment Info */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <i className="fa-solid fa-flask text-blue-500 text-3xl"></i>
                                                        <div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Experiment</div>
                                                            <div className="font-semibold text-dark dark:text-light text-2xl">
                                                                {getExperimentName(experiment.experiment_name)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4">
                                                        <i className="fa-solid fa-leaf text-orange-500 text-3xl"></i>
                                                        <div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Carbon Footprint</div>
                                                            <div className="font-bold text-orange-600 dark:text-orange-400 text-2xl">
                                                                {formatFootprint(experiment.footprint)} gCO₂
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {experiment.job_count && (
                                                        <div className="flex items-center gap-3">
                                                            <i className="fa-solid fa-tasks text-purple-500 text-lg"></i>
                                                            <div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">Jobs</div>
                                                                <div className="font-semibold text-dark dark:text-light text-lg">
                                                                    {experiment.job_count}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Progress Bar (percentage of model's total footprint) */}
                                                {model.footprint > 0 && (
                                                    <div className="mt-6">
                                                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                            <span>% of model</span>
                                                            <span className="font-semibold">{((experiment.footprint / model.footprint) * 100).toFixed(1)}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                                                            <div 
                                                                className={`h-3 rounded-full transition-all duration-500 ${
                                                                    expIndex === 0 ? 'bg-yellow-500' :
                                                                    expIndex === 1 ? 'bg-gray-500' :
                                                                    'bg-orange-500'
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
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <i className="fa-solid fa-info-circle text-2xl mb-3"></i>
                                        <p className="text-lg">No experiments available for this model</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Pagination Controls Bottom */}
                {totalPages > 1 && (
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-neutral-600">
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={goToPrevious}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-gray-200 dark:bg-neutral-600 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-neutral-500 transition-colors"
                            >
                                <i className="fa-solid fa-chevron-left mr-2"></i>
                                Previous
                            </button>
                            
                            {/* Page Numbers */}
                            <div className="flex gap-1 mx-4">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`px-3 py-2 rounded-md transition-colors ${
                                            page === currentPage
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 dark:bg-neutral-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-500'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={goToNext}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-gray-200 dark:bg-neutral-600 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-neutral-500 transition-colors"
                            >
                                Next
                                <i className="fa-solid fa-chevron-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-neutral-600">
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <i className="fa-solid fa-info-circle"></i>
                        Click on any experiment card to view its complete details
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TopExperimentsSection;
