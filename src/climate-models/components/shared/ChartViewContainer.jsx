import { DotLoader } from "../../../common/Loaders";
import Histogram from "../Histogram";
import LineChart from "../LineChart";
import StackedAreaChart from "../StackedAreaChart";
import { cn } from "../../../services/utils";

const ChartViewContainer = ({
    // View state
    view,
    setView,
    
    // Date controls for historical/stacked views
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    
    // Limit control for aggregated view
    limit,
    setLimit,
    
    // Data and loading states
    aggregatedData,
    isAggregatedFetching,
    isAggregatedError,
    historicalData,
    isHistoricalFetching,
    isHistoricalError,
    
    // Chart configuration
    chartProps
}) => {
    return (
        <div className="space-y-4">
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
                        <button
                            onClick={() => setView("stacked")}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                view === "stacked"
                                    ? "bg-primary text-white"
                                    : "text-gray-600 dark:text-gray-300 hover:text-dark dark:hover:text-light"
                            )}
                        >
                            Stacked Area
                        </button>
                    </div>

                    {/* Aggregated View Controls */}
                    {view === "aggregated" && (
                        <div className="flex items-center gap-4 ml-auto">
                            <div className="flex items-center gap-2">
                                <label className="text-base font-medium">Show top:</label>
                                <select
                                    value={limit}
                                    onChange={(e) => setLimit(Number(e.target.value))}
                                    className="form-select text-base border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-dark dark:text-light rounded px-3 py-2 min-w-[140px]"
                                >
                                    <option value={3}>3 models</option>
                                    <option value={5}>5 models</option>
                                    <option value={10}>10 models</option>
                                    <option value={15}>15 models</option>
                                    <option value={20}>20 models</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Historical/Stacked View Controls */}
                    {(view === "historical" || view === "stacked") && (
                        <div className="flex items-center gap-4 ml-auto">
                            <div className="flex items-center gap-2">
                                <label className="text-base font-medium">From:</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="form-input text-base px-3 py-2"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-base font-medium">To:</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="form-input text-base px-3 py-2"
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
                            {...chartProps.histogram}
                        />
                    )}
                </div>
            )}

            {view === "historical" && (
                <div>
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
                            {...chartProps.lineChart}
                        />
                    )}
                </div>
            )}

            {view === "stacked" && (
                <div>
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
                        <StackedAreaChart
                            data={historicalData.models}
                            {...chartProps.stackedArea}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default ChartViewContainer;