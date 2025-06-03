import { useState, useEffect, useRef, memo } from "react";
import * as d3 from "d3";
import { cn, saveSVGObj, saveSVGAsPNG } from "../../services/utils";
import { formatNumberMoney } from "../../components/context/utils";

const StackedAreaChart = ({ 
    data, 
    title, 
    xAxisLabel = "Date", 
    yAxisLabel = "Count",
    valueKey = "count", // Key for the current value
    cumulativeValueKey = "cumulative_count", // Key for cumulative value 
    modelKey = "model", // Key for model identifier
    formatAsInteger = true, // Whether to format values as integers or floats
    modelFilter = [],
    onModelToggle,
    className = ""
}) => {
    const svgRef = useRef();
    const [processedData, setProcessedData] = useState([]);
    const [models, setModels] = useState([]);
    const [selectedModels, setSelectedModels] = useState(new Set());

    const getModelName = (url) => {
        if (!url) return 'Unknown';
        const parts = url.split('/');
        return parts[parts.length - 1] || 'Unknown';
    };

    const formatValue = (value) => {
        if (formatAsInteger) {
            return formatNumberMoney(Math.round(value), true);
        }
        return formatNumberMoney(value, false, 2);
    };

    const formatAxisLabel = (value) => {
        if (formatAsInteger) {
            return formatNumberMoney(Math.round(value), true);
        }
        return formatNumberMoney(value, false, 1);
    };

    const generateColor = (index) => {
        const colors = [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
            '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
        ];
        return colors[index % colors.length];
    };

    // Process data for stacked area chart
    useEffect(() => {
        if (!data || Object.keys(data).length === 0) {
            setProcessedData([]);
            setModels([]);
            return;
        }

        const modelMap = new Map();
        const uniqueModels = new Set();
        const parsedData = [];

        // First pass: collect all unique models and dates
        Object.keys(data).forEach(dateStr => {
            const date = new Date(dateStr);
            const dayData = { date };

            data[dateStr].forEach(item => {
                const modelUrl = item[modelKey];
                const modelName = getModelName(modelUrl);
                uniqueModels.add(modelUrl);

                // Use cumulative value if available, otherwise use current value
                const currentValue = item[valueKey] || 0;
                const cumulativeValue = item[cumulativeValueKey] !== undefined 
                    ? item[cumulativeValueKey] 
                    : currentValue;

                dayData[modelUrl] = cumulativeValue;

                if (!modelMap.has(modelUrl)) {
                    modelMap.set(modelUrl, {
                        fullName: modelUrl,
                        name: modelName,
                        color: generateColor(modelMap.size),
                        hasCumulative: item[cumulativeValueKey] !== undefined
                    });
                }
            });

            parsedData.push(dayData);
        });

        // Sort data by date
        parsedData.sort((a, b) => a.date - b.date);

        // Fill missing values with 0 for all models across all dates
        const allModels = Array.from(uniqueModels);
        parsedData.forEach(dayData => {
            allModels.forEach(model => {
                if (dayData[model] === undefined) {
                    dayData[model] = 0;
                }
            });
        });

        const modelsArray = Array.from(modelMap.values());
        setModels(modelsArray);
        setProcessedData(parsedData);

        // Initialize selected models with all models
        if (modelsArray.length > 0 && selectedModels.size === 0) {
            setSelectedModels(new Set(modelsArray.map(m => m.fullName)));
        }

    }, [data, valueKey, cumulativeValueKey, modelKey]);

    const handleModelToggle = (modelName) => {
        const newSelected = new Set(selectedModels);
        if (newSelected.has(modelName)) {
            newSelected.delete(modelName);
        } else {
            newSelected.add(modelName);
        }
        setSelectedModels(newSelected);
        if (onModelToggle) {
            onModelToggle(Array.from(newSelected));
        }
    };

    // D3 visualization
    useEffect(() => {
        if (!processedData.length || !models.length || selectedModels.size === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Get container width for responsiveness - matching LineChart
        const containerWidth = svg.node().getBoundingClientRect().width || 800;
        
        // Dimensions and margins - matching LineChart
        const margin = { top: 30, right: 80, bottom: 120, left: 120 };
        const width = Math.max(containerWidth - margin.left - margin.right, 600);
        const height = 600 - margin.top - margin.bottom;

        // Update SVG dimensions - matching LineChart
        svg.attr("width", width + margin.left + margin.right)
           .attr("height", height + margin.top + margin.bottom);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create a consistent order based on all available models (sorted by name for consistency)
        const allModelNames = models.map(m => m.fullName).sort();
        const selectedModelNames = Array.from(selectedModels);
        
        // Filter data for all models but set unselected models to 0
        const filteredData = processedData.map(d => {
            const filtered = { date: d.date };
            allModelNames.forEach(model => {
                // Only include actual values for selected models, others get 0
                filtered[model] = selectedModelNames.includes(model) ? (d[model] || 0) : 0;
            });
            return filtered;
        });

        // Create stack generator with consistent order
        const stack = d3.stack()
            .keys(allModelNames)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        const stackedData = stack(filteredData);

        // Scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(filteredData, d => d.date))
            .range([0, width]);

        const maxY = d3.max(stackedData, layer => d3.max(layer, d => d[1]));
        const yScale = d3.scaleLinear()
            .domain([0, maxY * 1.2]) // Add 20% padding to ensure top value is always visible
            .range([height, 0]);

        // Area generator
        const area = d3.area()
            .x(d => xScale(d.data.date))
            .y0(d => yScale(d[0]))
            .y1(d => yScale(d[1]))
            .curve(d3.curveMonotoneX);

        // Create tooltip
        const tooltip = d3.select("body").selectAll(".d3-tooltip")
            .data([0])
            .join("div")
            .attr("class", "d3-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "rgba(0, 0, 0, 0.9)")
            .style("color", "white")
            .style("padding", "12px 16px")
            .style("border-radius", "8px")
            .style("font-size", "14px")
            .style("font-weight", "500")
            .style("pointer-events", "none")
            .style("z-index", "9999")
            .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)")
            .style("border", "1px solid rgba(255,255,255,0.2)")
            .style("max-width", "250px")
            .style("line-height", "1.4");

        // Grid lines
        g.selectAll(".grid-line-x")
            .data(xScale.ticks(5))
            .join("line")
            .attr("class", "grid-line-x")
            .attr("x1", d => xScale(d))
            .attr("x2", d => xScale(d))
            .attr("y1", 0)
            .attr("y2", height)
            .style("stroke", "#e5e7eb")
            .style("stroke-width", 1)
            .style("opacity", 0.5);

        g.selectAll(".grid-line-y")
            .data(yScale.ticks(5))
            .join("line")
            .attr("class", "grid-line-y")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", d => yScale(d))
            .attr("y2", d => yScale(d))
            .style("stroke", "#e5e7eb")
            .style("stroke-width", 1)
            .style("opacity", 0.5);

        // Draw stacked areas - only for selected models
        stackedData.forEach((layer, i) => {
            const modelName = layer.key;
            const model = models.find(m => m.fullName === modelName);
            
            // Only draw areas for selected models
            if (!model || !selectedModelNames.includes(modelName)) return;

            g.append("path")
                .datum(layer)
                .attr("fill", model.color)
                .attr("fill-opacity", 0.7)
                .attr("stroke", model.color)
                .attr("stroke-width", 1)
                .attr("d", area)
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("fill-opacity", 0.9);
                    
                    const mouseX = d3.pointer(event, g.node())[0];
                    const date = xScale.invert(mouseX);
                    
                    // Find closest data point
                    const bisectDate = d3.bisector(d => d.data.date).left;
                    const index = bisectDate(layer, date, 1);
                    const d0 = layer[index - 1];
                    const d1 = layer[index];
                    const closestPoint = d1 && (date - d0.data.date > d1.data.date - date) ? d1 : d0;
                    
                    if (closestPoint) {
                        // Get the last date's cumulative value for this model instead of current hover date
                        const lastDatePoint = layer[layer.length - 1];
                        const lastDateCumulativeValue = lastDatePoint ? (lastDatePoint[1] - lastDatePoint[0]) : 0;
                        
                        tooltip
                            .style("visibility", "visible")
                            .html(`<div style="text-align: center;">
                                <strong style="color: ${model.color};">${model.name}</strong><br/>
                                <strong style="font-size: 16px;">Cumulative: ${formatValue(lastDateCumulativeValue)}</strong>
                                </div>`);
                    }
                })
                .on("mousemove", function(event) {
                    const tooltipWidth = 200;
                    let left = event.pageX + 15;
                    let top = event.pageY - 40;
                    
                    // Prevent tooltip from going off screen
                    if (left + tooltipWidth > window.innerWidth) {
                        left = event.pageX - tooltipWidth - 15;
                    }
                    if (top < 0) {
                        top = event.pageY + 15;
                    }
                    
                    tooltip
                        .style("top", top + "px")
                        .style("left", left + "px");
                })
                .on("mouseout", function() {
                    d3.select(this).attr("fill-opacity", 0.7);
                    tooltip.style("visibility", "hidden");
                });
        });

        // X-axis - matching LineChart styling
        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale)
                .tickFormat(d3.timeFormat("%d/%m/%y"))
                .tickValues(filteredData.map(d => d.date))) // Use only actual data dates
            .selectAll("text")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", "#374151")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");

        // Y-axis with intelligent tick calculation to avoid duplicates
        const yMaxValue = yScale.domain()[1];
        let yAxisTickCount;
        
        if (formatAsInteger && yMaxValue <= 10) {
            // For small integer values, use exactly the number of unique integers
            yAxisTickCount = Math.min(Math.ceil(yMaxValue) + 1, yMaxValue <= 5 ? yMaxValue + 1 : 6);
        } else if (formatAsInteger && yMaxValue <= 50) {
            // For medium integer values, use fewer ticks to avoid crowding
            yAxisTickCount = Math.min(6, Math.ceil(yMaxValue / 5));
        } else {
            // For larger values or float values, use default
            yAxisTickCount = 8;
        }

        const yAxis = d3.axisLeft(yScale)
            .ticks(yAxisTickCount)
            .tickFormat(formatAxisLabel);

        g.append("g")
            .attr("class", "y-axis")
            .call(yAxis)
            .selectAll("text")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", "#374151");

        // Axis labels - matching LineChart styling
        g.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 20)
            .attr("x", 0 - (height / 2))
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .style("fill", "#374151")
            .text(yAxisLabel);

        g.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .style("fill", "#374151")
            .text(xAxisLabel);

        // Cleanup function
        return () => {
            tooltip.remove();
        };

    }, [processedData, models, selectedModels, xAxisLabel, yAxisLabel, formatAsInteger]);

    if (!data || Object.keys(data).length === 0) {
        return (
            <div className={cn("bg-white dark:bg-neutral-700 rounded-lg p-6", className)}>
                <h3 className="text-lg font-semibold text-dark dark:text-light mb-4">{title}</h3>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No historical data available
                </div>
            </div>
        );
    }

    return (
        <div className={cn("bg-white dark:bg-neutral-700 rounded-lg p-4 border border-gray-200 dark:border-neutral-600", className)}>
            <div className="mb-3">
                <h3 className="text-lg font-semibold text-dark dark:text-light">{title}</h3>
                
            </div>
            
            {/* Model Selection Checkboxes */}
            <div className="mb-4 p-4 bg-gray-50 dark:bg-neutral-600 rounded-lg border-2 border-gray-200 dark:border-neutral-500">
                <h4 className="text-lg font-semibold text-dark dark:text-light mb-4">Select Models to Display:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {models.map(model => (
                        <label key={model.fullName} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-500 transition-colors border border-gray-200 dark:border-neutral-500">
                            <input
                                type="checkbox"
                                checked={selectedModels.has(model.fullName)}
                                onChange={() => handleModelToggle(model.fullName)}
                                className="form-checkbox h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                            />
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div 
                                    className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-400 flex-shrink-0" 
                                    style={{ backgroundColor: model.color }}
                                ></div>
                                <span className="text-base text-dark dark:text-light font-bold truncate" title={model.name}>
                                    {model.name}
                                </span>
                            </div>
                        </label>
                    ))}
                </div>
                {models.length > 0 && (
                    <div className="mt-4 flex gap-3 pt-4 border-t border-gray-200 dark:border-neutral-500">
                        <button
                            onClick={() => setSelectedModels(new Set(models.map(m => m.fullName)))}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium text-sm"
                        >
                            <i className="fa-solid fa-check-double mr-2"></i>
                            Select All
                        </button>
                        <button
                            onClick={() => setSelectedModels(new Set())}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
                        >
                            <i className="fa-solid fa-times mr-2"></i>
                            Deselect All
                        </button>
                        <div className="ml-auto flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <i className="fa-solid fa-info-circle mr-2"></i>
                            {selectedModels.size} of {models.length} models selected
                        </div>
                    </div>
                )}
            </div>
            
            {/* Chart Container with Download Buttons */}
            {processedData.length > 0 && selectedModels.size > 0 ? (
                <div className="w-full">
                    {/* Download Buttons - positioned above chart */}
                    <div className='flex justify-end gap-2 mb-2'>
                        <button 
                            className='btn btn-sm bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors'
                            onClick={() => svgRef.current && saveSVGObj(svgRef.current, `${title || 'stacked-area-chart'}.svg`)}
                            title="Download Chart as SVG"
                        >
                            <i className="fa-solid fa-download text-gray-700 dark:text-gray-300"></i>
                            <span className="ml-1 text-xs">SVG</span>
                        </button>
                        <button 
                            className='btn btn-sm bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors'
                            onClick={() => svgRef.current && saveSVGAsPNG(svgRef.current, `${title || 'stacked-area-chart'}.png`)}
                            title="Download Chart as PNG"
                        >
                            <i className="fa-solid fa-download text-gray-700 dark:text-gray-300"></i>
                            <span className="ml-1 text-xs">PNG</span>
                        </button>
                    </div>
                    {/* Chart */}
                    <div className="overflow-x-auto w-full">
                        <div className="min-w-full" style={{ minHeight: '720px' }}>
                            <svg ref={svgRef} width="100%" height="100%"></svg>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-neutral-600 rounded-lg">
                    <i className="fa-solid fa-chart-area text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-500 dark:text-gray-400">
                        {selectedModels.size === 0 ? 'Please select at least one model to display the chart' : 'No data to display'}
                    </p>
                </div>
            )}
            
            {/* HPC Platform Information */}
            {title.toLowerCase().includes('footprint') && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-neutral-600">
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <i className="fa-solid fa-info-circle"></i>
                        Data includes jobs executed on HPC MareNostrum4 and MareNostrum5 platforms
                    </p>
                </div>
            )}
        </div>
    );
};

export default memo(StackedAreaChart);
