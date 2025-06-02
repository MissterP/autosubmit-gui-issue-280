import { useState } from "react";
import { Link } from "react-router-dom";
import useASTitle from "../../hooks/useASTitle";
import useBreadcrumb from "../../hooks/useBreadcrumb";
import { useGetFootprintModelsAggregatedQuery, useGetFootprintModelsHistoricalQuery } from "../../services/climateModelsApiV1";
import Histogram from "../components/Histogram";
import LineChart from "../components/LineChart";
import { cn } from "../../services/utils";
import { DotLoader } from "../../common/Loaders";

const FootprintModelsMetric = () => {
    useASTitle("Model Footprint - Climate Models");
    useBreadcrumb([
        { name: "Climate Models", route: "/climate-models" },
        { name: "Model Footprint" }
    ]);

    const [view, setView] = useState("aggregated"); // "aggregated" or "historical"
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [limit, setLimit] = useState(10); // Limit for aggregated data
    const [selectedSimJobs, setSelectedSimJobs] = useState([]);
    const [showSimJobs, setShowSimJobs] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [dateSearchQuery, setDateSearchQuery] = useState("");
    const [simJobSearchQuery, setSimJobSearchQuery] = useState("");

    const { 
        data: aggregatedData, 
        isFetching: isAggregatedFetching, 
        isError: isAggregatedError 
    } = useGetFootprintModelsAggregatedQuery({ limit });

    const { 
        data: historicalData, 
        isFetching: isHistoricalFetching, 
        isError: isHistoricalError 
    } = useGetFootprintModelsHistoricalQuery(
        { start_date: startDate, end_date: endDate },
        { skip: view !== "historical" }
    );

    const handleSimJobClick = (simJobId) => {
        // Extract experiment ID from sim job (pattern: aXXX_...)
        const expidMatch = simJobId.match(/^([a-zA-Z0-9]+)_/);
        if (expidMatch) {
            const expid = expidMatch[1];
            window.open(`/experiment/${expid}/quick`, '_blank');
        }
    };

    const getSimJobsForDate = (date) => {
        if (!historicalData?.models?.[date]) return [];
        
        const simJobs = [];
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
            
            if (model.sim_jobs) {
                model.sim_jobs.forEach(simJob => {
                    simJobs.push({
                        simJobId: simJob,
                        model: model.model,
                        modelName: model.model.split('/').pop(),
                        modelColor: modelColors[model.model],
                        footprint: model.footprint || 0
                    });
                });
            }
        });
        return simJobs;
    };

    const handleDateChange = (date) => {
        const simJobs = getSimJobsForDate(date);
        setSelectedSimJobs(simJobs);
        setSelectedDate(date);
        setShowSimJobs(simJobs.length > 0);
    };

    // Pagination for sim jobs
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 20;

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <i className="fa-solid fa-chart-area text-2xl text-green-500"></i>
                        <div>
                            <h1 className="text-2xl font-bold text-dark dark:text-light mb-2">
                                Model Footprint
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300">
                                Computational footprint and resource usage analysis of climate models
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
                            title={`Model Footprint (Top ${limit} Models)`}
                            xAxisLabel="Climate Models"
                            yAxisLabel="Footprint Value (gCO₂)"
                            maxBars={limit}
                            valueKey="footprint"
                            cumulativeValueKey="cumulative_footprint"
                            modelKey="model"
                            formatAsInteger={false}
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
                            title="Model Footprint Over Time (Cumulative)"
                            xAxisLabel="Date"
                            yAxisLabel="Cumulative Footprint Value (gCO₂)"
                            valueKey="footprint"
                            cumulativeValueKey="cumulative_footprint"
                            modelKey="model"
                            formatAsInteger={false}
                            showBothValues={false}
                        />
                    )}

                    {/* Date Selection for Sim Jobs */}
                    {historicalData?.models && (
                        <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                            <h3 className="text-lg font-semibold text-dark dark:text-light mb-4">
                                View Simulation Jobs by Date
                            </h3>
                            
                            {/* Search Controls */}
                            <div className="mb-4 space-y-3">
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex-1 min-w-64">
                                        <label className="block text-sm font-medium text-dark dark:text-light mb-1">
                                            Search Dates
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search dates (e.g., 2024-01-15, Jan 15, etc.)"
                                                value={dateSearchQuery}
                                                onChange={(e) => setDateSearchQuery(e.target.value)}
                                                className="form-input w-full pl-10"
                                            />
                                            <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-64">
                                        <label className="block text-sm font-medium text-dark dark:text-light mb-1">
                                            Search Simulation Jobs
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search experiments/jobs (e.g., a395, experiment name, etc.)"
                                                value={simJobSearchQuery}
                                                onChange={(e) => setSimJobSearchQuery(e.target.value)}
                                                className="form-input w-full pl-10"
                                            />
                                            <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                        </div>
                                    </div>
                                </div>
                                
                                {(dateSearchQuery || simJobSearchQuery) && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setDateSearchQuery("");
                                                setSimJobSearchQuery("");
                                            }}
                                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            <i className="fa-solid fa-times mr-1"></i>
                                            Clear filters
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {/* Filtered Date Buttons */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {Object.keys(historicalData.models)
                                    .sort()
                                    .filter(date => {
                                        if (!dateSearchQuery) return true;
                                        const searchLower = dateSearchQuery.toLowerCase();
                                        const dateStr = date.toLowerCase();
                                        const formattedDate = new Date(date).toLocaleDateString().toLowerCase();
                                        const monthName = new Date(date).toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
                                        const shortMonth = new Date(date).toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
                                        
                                        return dateStr.includes(searchLower) || 
                                               formattedDate.includes(searchLower) ||
                                               monthName.includes(searchLower) ||
                                               shortMonth.includes(searchLower);
                                    })
                                    .map(date => (
                                        <button
                                            key={date}
                                            onClick={() => {
                                                handleDateChange(date);
                                                setCurrentPage(1);
                                            }}
                                            className={cn(
                                                "px-3 py-1 text-sm rounded transition-colors",
                                                selectedDate === date
                                                    ? "bg-secondary text-white"
                                                    : "bg-primary text-white hover:bg-secondary"
                                            )}
                                        >
                                            {new Date(date).toLocaleDateString()}
                                        </button>
                                    ))}
                            </div>

                            {showSimJobs && selectedSimJobs.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-4">
                                            {(() => {
                                                const filteredJobs = selectedSimJobs.filter(job => {
                                                    if (!simJobSearchQuery) return true;
                                                    const searchLower = simJobSearchQuery.toLowerCase();
                                                    return job.simJobId.toLowerCase().includes(searchLower) ||
                                                           job.modelName.toLowerCase().includes(searchLower);
                                                });
                                                const filteredTotalPages = Math.ceil(filteredJobs.length / jobsPerPage);
                                                
                                                return filteredTotalPages > 1 && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                            disabled={currentPage === 1}
                                                            className="px-2 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <i className="fa-solid fa-chevron-left"></i>
                                                        </button>
                                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                                            {currentPage} / {filteredTotalPages}
                                                        </span>
                                                        <button
                                                            onClick={() => setCurrentPage(Math.min(filteredTotalPages, currentPage + 1))}
                                                            disabled={currentPage === filteredTotalPages}
                                                            className="px-2 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <i className="fa-solid fa-chevron-right"></i>
                                                        </button>
                                                    </div>
                                                );
                                            })()}
                                            
                                            <h4 className="font-medium text-dark dark:text-light">
                                                Simulation Jobs for {new Date(selectedDate).toLocaleDateString()}
                                                {simJobSearchQuery && ` (filtered)`} ({(() => {
                                                    const filteredJobs = selectedSimJobs.filter(job => {
                                                        if (!simJobSearchQuery) return true;
                                                        const searchLower = simJobSearchQuery.toLowerCase();
                                                        return job.simJobId.toLowerCase().includes(searchLower) ||
                                                               job.modelName.toLowerCase().includes(searchLower);
                                                    });
                                                    return filteredJobs.length;
                                                })()} total)
                                            </h4>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                                        {(() => {
                                            const filteredJobs = selectedSimJobs.filter(job => {
                                                if (!simJobSearchQuery) return true;
                                                const searchLower = simJobSearchQuery.toLowerCase();
                                                return job.simJobId.toLowerCase().includes(searchLower) ||
                                                       job.modelName.toLowerCase().includes(searchLower);
                                            });
                                            
                                            const startIndex = (currentPage - 1) * jobsPerPage;
                                            const endIndex = startIndex + jobsPerPage;
                                            return filteredJobs.slice(startIndex, endIndex);
                                        })().map((job, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSimJobClick(job.simJobId)}
                                                className="p-3 bg-gray-50 dark:bg-neutral-600 rounded border cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-500 transition-colors"
                                            >
                                                <div className="font-mono text-sm text-primary font-medium truncate mb-2" title={job.simJobId}>
                                                    {job.simJobId}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-3 h-3 rounded-full border border-gray-300" 
                                                        style={{ backgroundColor: job.modelColor }}
                                                    ></div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                                        {job.modelName}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FootprintModelsMetric;
