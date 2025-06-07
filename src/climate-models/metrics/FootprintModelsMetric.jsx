import { useState } from "react";
import useASTitle from "../../hooks/useASTitle";
import useBreadcrumb from "../../hooks/useBreadcrumb";
import { useGetFootprintModelsAggregatedQuery, useGetFootprintModelsHistoricalQuery } from "../../services/climateModelsApiV1";
import MetricPageHeader from "../components/shared/MetricPageHeader";
import ChartViewContainer from "../components/shared/ChartViewContainer";
import HistoricalDataSection from "../components/shared/HistoricalDataSection";
import TopExperimentsSection from "../components/TopExperimentsSection";
import { extractModelName } from '../../services/utils';

const FootprintModelsMetric = () => {
    useASTitle("Model Carbon Footprint - Climate Models");
    useBreadcrumb([
        { name: "Climate Models", route: "/climate-models" },
        { name: "Model Carbon Footprint" }
    ]);

    const [view, setView] = useState("aggregated");
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [limit, setLimit] = useState(3);
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
        { skip: view !== "historical" && view !== "stacked" }
    );

    const handleSimJobClick = (simJobId) => {
        // Extract experiment ID from sim job (pattern: aXXX_...)
        const expidMatch = simJobId.match(/^([a-zA-Z0-9]+)_/);
        if (expidMatch) {
            const expid = expidMatch[1];
            window.open(`/experiment/${expid}/quick`, '_blank');
        }
    };

    const handleExperimentClick = (expid) => {
        if (expid) {
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
                        modelName: extractModelName(model.model),
                        modelColor: modelColors[model.model],
                        footprint: model.footprint || 0
                    });
                });
            }
        });
        return simJobs;
    };

    // Chart configuration
    const chartProps = {
        histogram: {
            title: `Model Carbon Footprint (Top ${limit} Models)`,
            xAxisLabel: "Climate Models",
            yAxisLabel: "Footprint Value (gCO₂)",
            maxBars: limit,
            valueKey: "footprint",
            cumulativeValueKey: "cumulative_footprint",
            modelKey: "model",
            formatAsInteger: false
        },
        lineChart: {
            title: "Model Carbon Footprint Over Time (Cumulative)",
            xAxisLabel: "Date",
            yAxisLabel: "Cumulative Footprint Value (gCO₂)",
            valueKey: "footprint",
            cumulativeValueKey: "cumulative_footprint",
            modelKey: "model",
            formatAsInteger: false,
            showBothValues: false
        },
        stackedArea: {
            title: "Model Carbon Footprint Over Time (Stacked Areas)",
            xAxisLabel: "Date",
            yAxisLabel: `Cumulative gCO₂`,
            valueKey: "footprint",
            cumulativeValueKey: "cumulative_footprint",
            modelKey: "model",
            formatAsInteger: false
        }
    };

    // Historical data section configuration
    const itemDisplayConfig = {
        searchLabel: "Search Simulation Jobs",
        searchPlaceholder: "Search SIM jobs (e.g., a395, SIM job name, etc.)",
        itemIdKey: "simJobId",
        itemNameKey: "modelName",
        gridTitle: "Simulation Jobs for",
        noItemsMessage: "No simulation jobs found matching"
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <MetricPageHeader
                icon="fa-solid fa-leaf"
                iconColor="text-green-500"
                title="Model Carbon Footprint"
                description="Computational footprint and resource usage of climate models"
                backTo="/climate-models"
                backText="Back to Metrics"
            />

            {/* Chart View Container */}
            <ChartViewContainer
                view={view}
                setView={setView}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                limit={limit}
                setLimit={setLimit}
                aggregatedData={aggregatedData}
                isAggregatedFetching={isAggregatedFetching}
                isAggregatedError={isAggregatedError}
                historicalData={historicalData}
                isHistoricalFetching={isHistoricalFetching}
                isHistoricalError={isHistoricalError}
                chartProps={chartProps}
            />

            {/* Top 3 Experiments Section - Only show in aggregated view */}
            {view === "aggregated" && aggregatedData && (
                <TopExperimentsSection
                    data={aggregatedData}
                    isLoading={isAggregatedFetching}
                    isError={isAggregatedError}
                    handleExperimentClick={handleExperimentClick}
                />
            )}

            {/* Historical Data Section */}
            <HistoricalDataSection
                historicalData={historicalData}
                view={view}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedItems={selectedSimJobs}
                setSelectedItems={setSelectedSimJobs}
                showItems={showSimJobs}
                setShowItems={setShowSimJobs}
                dateSearchQuery={dateSearchQuery}
                setDateSearchQuery={setDateSearchQuery}
                itemSearchQuery={simJobSearchQuery}
                setItemSearchQuery={setSimJobSearchQuery}
                getItemsForDate={getSimJobsForDate}
                handleItemClick={handleSimJobClick}
                itemDisplayConfig={itemDisplayConfig}
            />
        </div>
    );
};

export default FootprintModelsMetric;
