import { useState } from "react";
import { Link } from "react-router-dom";
import useASTitle from "../../hooks/useASTitle";
import useBreadcrumb from "../../hooks/useBreadcrumb";
import { useGetPopularModelsAggregatedQuery, useGetPopularModelsHistoricalQuery } from "../../services/climateModelsApiV1";
import Histogram from "../components/Histogram";
import LineChart from "../components/LineChart";
import { cn } from "../../services/utils";
import { DotLoader } from "../../common/Loaders";

const PopularModelsMetric = () => {
    useASTitle("Popular Models - Climate Models");
    useBreadcrumb([
        { name: "Climate Models", route: "/climate-models" },
        { name: "Popular Models" }
    ]);

    const [view, setView] = useState("aggregated"); // "aggregated" or "historical"
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [limit, setLimit] = useState(10); // Limit for aggregated data
    const [selectedExperiments, setSelectedExperiments] = useState([]);
    const [showExperiments, setShowExperiments] = useState(false);
    const [dateSearchQuery, setDateSearchQuery] = useState("");
    const [experimentSearchQuery, setExperimentSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const experimentsPerPage = 20;

    const { 
        data: aggregatedData, 
        isFetching: isAggregatedFetching, 
        isError: isAggregatedError 
    } = useGetPopularModelsAggregatedQuery({ limit });

    const { 
        data: historicalData, 
        isFetching: isHistoricalFetching, 
        isError: isHistoricalError 
    } = useGetPopularModelsHistoricalQuery(
        { start_date: startDate, end_date: endDate },
        { skip: view !== "historical" }
    );

    const handleExperimentClick = (expid) => {
        window.open(`/experiment/${expid}/quick`, '_blank');
    };

    const getExperimentsForDate = (date) => {
        if (!historicalData?.models?.[date]) return [];
        
        const experiments = [];
        const modelColors = {};
        let colorIndex = 0;
        
        // Generate colors for models
        const colors = [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
            '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
        ];
        
        historicalData.models[date].forEach(model => {
            if (!modelColors[model.model]) {
                modelColors[model.model] = colors[colorIndex % colors.length];
                colorIndex++;
            }
            
            if (model.experiments) {
                model.experiments.forEach(exp => {
                    experiments.push({
                        expid: exp,
                        model: model.model,
                        modelName: model.model.split('/').pop(),
                        modelColor: modelColors[model.model]
                    });
                });
            }
        });
        return experiments;
    };

    const handleDateChange = (date) => {
        const experiments = getExperimentsForDate(date);
        setSelectedExperiments(experiments);
        setShowExperiments(experiments.length > 0);
        setCurrentPage(1); // Reset to first page when changing date
        setExperimentSearchQuery(""); // Clear search when changing date
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <i className="fa-solid fa-chart-line"></i>
                        <div>
                            <h1 className="text-2xl font-bold text-dark dark:text-light mb-2">
                                Popular Models
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300">
                                Analysis of the most frequently used climate models in experiments
                            </p>
                        </div>
                    </div>
                    <Link 
                        to="/climate-models"
                        className="btn btn-light dark:btn-dark"
                    >
                        <i className="fa-solid fa-arrow-left mr-2"></i>
                        Back to Metrics
                    </Link>
                </div>
            </div>

            {/* View Toggle */}
            <div className="bg-white dark:bg-neutral-700 rounded-lg p-4 border border-gray-200 dark:border-neutral-600">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-dark dark:text-light">View:</span>
                    <div className="flex bg-gray-100 dark:bg-neutral-600 rounded-lg p-1">
                        <button
                            onClick={() => setView("aggregated")}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                view === "aggregated"
                                    ? "bg-primary text-white"
                                    : "text-gray-600 dark:text-gray-300 hover:text-dark dark:hover:text-light"
                            )}
                        >
                            Aggregated
                        </button>
                        <button
                            onClick={() => setView("historical")}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                view === "historical"
                                    ? "bg-primary text-white"
                                    : "text-gray-600 dark:text-gray-300 hover:text-dark dark:hover:text-light"
                            )}
                        >
                            Historical
                        </button>
                    </div>

                    {view === "aggregated" && (
                        <div className="flex items-center gap-4 ml-auto">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">Show top:</label>
                                <select
                                    value={limit}
                                    onChange={(e) => setLimit(Number(e.target.value))}
                                    className="form-select text-sm border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-dark dark:text-light rounded"
                                >
                                    <option value={5}>5 models</option>
                                    <option value={10}>10 models</option>
                                    <option value={15}>15 models</option>
                                    <option value={20}>20 models</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {view === "historical" && (
                        <div className="flex items-center gap-4 ml-auto">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">From:</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="form-input text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">To:</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="form-input text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            {view === "aggregated" && (
                <div>
                    {isAggregatedFetching && (
                        <div className="flex justify-center py-12">
                            <DotLoader />
                        </div>
                    )}
                    
                    {isAggregatedError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-red-600 dark:text-red-400">
                                Error loading aggregated data. Please try again.
                            </p>
                        </div>
                    )}

                    {aggregatedData?.models && (
                        <Histogram
                            data={aggregatedData.models}
                            title={`Model Usage (Top ${limit} Models)`}
                            xAxisLabel="Climate Models"
                            yAxisLabel="Number of Experiments"
                            maxBars={limit}
                            valueKey="count"
                            cumulativeValueKey="cumulative_count"
                            modelKey="model"
                            formatAsInteger={true}
                        />
                    )}
                </div>
            )}

            {view === "historical" && (
                <div className="space-y-6">
                    {isHistoricalFetching && (
                        <div className="flex justify-center py-12">
                            <DotLoader />
                        </div>
                    )}
                    
                    {isHistoricalError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-red-600 dark:text-red-400">
                                Error loading historical data. Please try again.
                            </p>
                        </div>
                    )}

                    {historicalData?.models && (
                        <LineChart
                            data={historicalData.models}
                            title="Model Usage Over Time (Cumulative)"
                            xAxisLabel="Date"
                            yAxisLabel="Cumulative Experiments Count"
                            valueKey="count"
                            cumulativeValueKey="cumulative_count"
                            modelKey="model"
                            formatAsInteger={true}
                            showBothValues={false}
                        />
                    )}

                    {/* Date Selection for Experiments */}
                    {historicalData?.models && (
                        <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                            <h3 className="text-lg font-semibold text-dark dark:text-light mb-4">
                                View Experiments by Date
                            </h3>
                            
                            {/* Date Search */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-dark dark:text-light mb-2">
                                    Search Dates:
                                </label>
                                <input
                                    type="text"
                                    value={dateSearchQuery}
                                    onChange={(e) => setDateSearchQuery(e.target.value)}
                                    placeholder="Search dates (e.g., 2024-01, 01/15, etc.)"
                                    className="form-input w-full max-w-xs"
                                />
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-4 max-h-32 overflow-y-auto">
                                {Object.keys(historicalData.models)
                                    .sort()
                                    .filter(date => {
                                        if (!dateSearchQuery) return true;
                                        const formattedDate = new Date(date).toLocaleDateString();
                                        return date.includes(dateSearchQuery) || formattedDate.includes(dateSearchQuery);
                                    })
                                    .map(date => (
                                    <button
                                        key={date}
                                        onClick={() => handleDateChange(date)}
                                        className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-secondary transition-colors"
                                    >
                                        {new Date(date).toLocaleDateString()}
                                    </button>
                                ))}
                            </div>

                            {showExperiments && selectedExperiments.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-dark dark:text-light">
                                            Experiments for selected date ({selectedExperiments.length} total):
                                        </h4>
                                    </div>
                                    
                                    {/* Pagination Navigation and Search */}
                                    <div className="flex items-center justify-between mb-4">
                                        {/* Pagination Navigation */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-600"
                                            >
                                                <i className="fa-solid fa-chevron-left"></i>
                                            </button>
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                Page {currentPage} of {Math.ceil(selectedExperiments.filter(exp => {
                                                    if (!experimentSearchQuery) return true;
                                                    return exp.expid.toLowerCase().includes(experimentSearchQuery.toLowerCase()) ||
                                                           exp.modelName.toLowerCase().includes(experimentSearchQuery.toLowerCase());
                                                }).length / experimentsPerPage) || 1}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(prev => prev + 1)}
                                                disabled={currentPage >= Math.ceil(selectedExperiments.filter(exp => {
                                                    if (!experimentSearchQuery) return true;
                                                    return exp.expid.toLowerCase().includes(experimentSearchQuery.toLowerCase()) ||
                                                           exp.modelName.toLowerCase().includes(experimentSearchQuery.toLowerCase());
                                                }).length / experimentsPerPage)}
                                                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-600"
                                            >
                                                <i className="fa-solid fa-chevron-right"></i>
                                            </button>
                                        </div>
                                        
                                        {/* Search Input */}
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium">Search:</label>
                                            <input
                                                type="text"
                                                value={experimentSearchQuery}
                                                onChange={(e) => {
                                                    setExperimentSearchQuery(e.target.value);
                                                    setCurrentPage(1); // Reset to first page when searching
                                                }}
                                                placeholder="Search experiments..."
                                                className="form-input text-sm w-48"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                                        {selectedExperiments
                                            .filter(exp => {
                                                if (!experimentSearchQuery) return true;
                                                return exp.expid.toLowerCase().includes(experimentSearchQuery.toLowerCase()) ||
                                                       exp.modelName.toLowerCase().includes(experimentSearchQuery.toLowerCase());
                                            })
                                            .slice((currentPage - 1) * experimentsPerPage, currentPage * experimentsPerPage)
                                            .map((exp, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleExperimentClick(exp.expid)}
                                                className="p-3 bg-gray-50 dark:bg-neutral-600 rounded border cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-500 transition-colors"
                                            >
                                                <div className="font-mono text-sm text-primary font-medium mb-2">
                                                    {exp.expid}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-3 h-3 rounded-full border border-gray-300" 
                                                        style={{ backgroundColor: exp.modelColor }}
                                                    ></div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                                        {exp.modelName}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {selectedExperiments.filter(exp => {
                                        if (!experimentSearchQuery) return true;
                                        return exp.expid.toLowerCase().includes(experimentSearchQuery.toLowerCase()) ||
                                               exp.modelName.toLowerCase().includes(experimentSearchQuery.toLowerCase());
                                    }).length === 0 && experimentSearchQuery && (
                                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                            No experiments found matching "{experimentSearchQuery}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PopularModelsMetric;
