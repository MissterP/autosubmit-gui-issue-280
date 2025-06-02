import { useState } from "react";
import useASTitle from "../../hooks/useASTitle";
import useBreadcrumb from "../../hooks/useBreadcrumb";
import { useGetPopularModelsAggregatedQuery, useGetPopularModelsHistoricalQuery } from "../../services/climateModelsApiV1";
import MetricPageHeader from "../components/shared/MetricPageHeader";
import ChartViewContainer from "../components/shared/ChartViewContainer";
import HistoricalDataSection from "../components/shared/HistoricalDataSection";

const PopularModelsMetric = () => {
    useASTitle("Popular Models - Climate Models");
    useBreadcrumb([
        { name: "Climate Models", route: "/climate-models" },
        { name: "Popular Models" }
    ]);

    const [view, setView] = useState("aggregated");
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [limit, setLimit] = useState(10);
    const [selectedExperiments, setSelectedExperiments] = useState([]);
    const [showExperiments, setShowExperiments] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [dateSearchQuery, setDateSearchQuery] = useState("");
    const [experimentSearchQuery, setExperimentSearchQuery] = useState("");

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
        { skip: view !== "historical" && view !== "stacked" }
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


    // Chart configuration
    const chartProps = {
        histogram: {
            title: `Model Usage (Top ${limit} Models)`,
            xAxisLabel: "Climate Models",
            yAxisLabel: "Number of Experiments",
            maxBars: limit,
            valueKey: "count",
            cumulativeValueKey: "cumulative_count",
            modelKey: "model",
            formatAsInteger: true
        },
        lineChart: {
            title: "Model Usage Over Time (Cumulative)",
            xAxisLabel: "Date",
            yAxisLabel: "Cumulative Experiments Count",
            valueKey: "count",
            cumulativeValueKey: "cumulative_count",
            modelKey: "model",
            formatAsInteger: true,
            showBothValues: false
        },
        stackedArea: {
            title: "Model Usage Over Time (Stacked Areas)",
            xAxisLabel: "Date",
            yAxisLabel: `Cumulative Number of Experiments`,
            valueKey: "count",
            cumulativeValueKey: "cumulative_count",
            modelKey: "model",
            formatAsInteger: true
        }
    };

    // Historical data section configuration
    const itemDisplayConfig = {
        searchLabel: "Search Experiments",
        searchPlaceholder: "Search experiments (e.g., a395, experiment name, etc.)",
        itemIdKey: "expid",
        itemNameKey: "modelName",
        gridTitle: "Experiments for selected date",
        noItemsMessage: "No experiments found matching"
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <MetricPageHeader
                icon="fa-solid fa-chart-line"
                iconColor="text-blue-500"
                title="Popular Models"
                description="Analysis of the most frequently used climate models in experiments"
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

            {/* Historical Data Section */}
            <HistoricalDataSection
                historicalData={historicalData}
                view={view}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedItems={selectedExperiments}
                setSelectedItems={setSelectedExperiments}
                showItems={showExperiments}
                setShowItems={setShowExperiments}
                dateSearchQuery={dateSearchQuery}
                setDateSearchQuery={setDateSearchQuery}
                itemSearchQuery={experimentSearchQuery}
                setItemSearchQuery={setExperimentSearchQuery}
                getItemsForDate={getExperimentsForDate}
                handleItemClick={handleExperimentClick}
                itemDisplayConfig={itemDisplayConfig}
            />
        </div>
    );
};

export default PopularModelsMetric;
