import { useState, useEffect, useRef, memo } from "react";
import * as d3 from "d3";
import { cn, saveSVGObj, saveSVGAsPNG } from "../../services/utils";

const LineChart = ({ 
    data, 
    title, 
    xAxisLabel = "Date", 
    yAxisLabel = "Count",
    valueKey = "count", // Key for the current value
    cumulativeValueKey = "cumulative_count", // Key for cumulative value 
    modelKey = "model", // Key for model identifier
    formatAsInteger = true, // Whether to format values as integers or floats
    showBothValues = false, // Whether to show both current and cumulative values
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
            return Math.round(value).toString();
        }
        return value.toFixed(2);
    };

    const formatAxisLabel = (value) => {
        if (formatAsInteger) {
            return Math.round(value).toString();
        }
        return value.toFixed(1);
    };

    const generateColor = (index) => {
        const colors = [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
            '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
        ];
        return colors[index % colors.length];
    };

    useEffect(() => {
        if (data && typeof data === 'object') {
            const dates = Object.keys(data).sort();
            const modelSet = new Set();
            
            // Check if we have cumulative data
            let hasCumulativeData = false;
            
            // Collect all unique models and check for cumulative data
            dates.forEach(date => {
                data[date].forEach(item => {
                    modelSet.add(item[modelKey]);
                    if (item[cumulativeValueKey] !== undefined) {
                        hasCumulativeData = true;
                    }
                });
            });
            
            const modelList = Array.from(modelSet).map((model, index) => ({
                name: getModelName(model),
                fullName: model,
                color: generateColor(index),
                hasCumulative: hasCumulativeData
            }));
            
            setModels(modelList);
            setSelectedModels(new Set(modelList.map(m => m.fullName)));
            
            // Process data for chart
            const chartData = dates.map(date => {
                const dayData = { date };
                
                if (showBothValues && hasCumulativeData) {
                    // Store both current and cumulative values for dual-line mode
                    data[date].forEach(item => {
                        const currentValue = item[valueKey] || 0;
                        const cumulativeValue = item[cumulativeValueKey] || currentValue;
                        
                        dayData[`current_${item[modelKey]}`] = currentValue;
                        dayData[`cumulative_${item[modelKey]}`] = cumulativeValue;
                    });
                } else {
                    // Store both current and cumulative values for tooltips, but display cumulative in chart
                    data[date].forEach(item => {
                        const currentValue = item[valueKey] || 0;
                        const cumulativeValue = item[cumulativeValueKey] || currentValue;
                        
                        // Main value for chart display (use cumulative if available)
                        dayData[item[modelKey]] = cumulativeValue;
                        // Store current value for tooltip
                        dayData[`current_${item[modelKey]}`] = currentValue;
                        // Store cumulative value for tooltip
                        dayData[`cumulative_${item[modelKey]}`] = cumulativeValue;
                    });
                }
                
                return dayData;
            });
            
            setProcessedData(chartData);
        }
    }, [data, valueKey, cumulativeValueKey, modelKey, showBothValues]);

    const handleModelToggle = (modelFullName) => {
        const newSelected = new Set(selectedModels);
        if (newSelected.has(modelFullName)) {
            newSelected.delete(modelFullName);
        } else {
            newSelected.add(modelFullName);
        }
        setSelectedModels(newSelected);
        if (onModelToggle) {
            onModelToggle(Array.from(newSelected));
        }
    };

    const getMaxValue = () => {
        let max = 0;
        processedData.forEach(item => {
            models.forEach(model => {
                if (selectedModels.has(model.fullName)) {
                    if (showBothValues) {
                        // Check both current and cumulative values
                        max = Math.max(max, item[`current_${model.fullName}`] || 0);
                        max = Math.max(max, item[`cumulative_${model.fullName}`] || 0);
                    } else {
                        // Use single value (cumulative if available)
                        max = Math.max(max, item[model.fullName] || 0);
                    }
                }
            });
        });
        return max;
    };

    // D3.js rendering effect
    useEffect(() => {
        if (!processedData.length || !svgRef.current || selectedModels.size === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Get container width for responsiveness
        const containerWidth = svgRef.current.parentElement.clientWidth || 800;
        
        // Dimensions and margins - adjusted for better readability
        const margin = { top: 30, right: 80, bottom: 120, left: 120 };
        const width = Math.max(containerWidth - margin.left - margin.right, 600);
        const height = 600 - margin.top - margin.bottom;

        // Update SVG dimensions
        svg.attr("width", width + margin.left + margin.right)
           .attr("height", height + margin.top + margin.bottom);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Parse dates and prepare data
        const parseDate = d3.timeParse("%Y-%m-%d");
        const parsedData = processedData.map(d => ({
            ...d,
            date: parseDate(d.date) || new Date(d.date)
        }));

        // Scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(parsedData, d => d.date))
            .range([0, width]);

        const maxValue = getMaxValue();
        const yScale = d3.scaleLinear()
            .domain([0, maxValue * 1.2]) // Add 20% padding to ensure top value is always visible
            .range([height, 0]);

        // Create tooltip
        const tooltip = d3.select("body").selectAll(".d3-line-tooltip")
            .data([0])
            .join("div")
            .attr("class", "d3-line-tooltip")
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

        // Line generator
        const line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.value))
            .curve(d3.curveMonotoneX);

        // Draw lines for selected models
        models.forEach(model => {
            if (!selectedModels.has(model.fullName)) return;

            if (showBothValues && model.hasCumulative) {
                // Draw both current and cumulative lines
                const currentData = parsedData.map(d => ({
                    date: d.date,
                    value: d[`current_${model.fullName}`] || 0
                }));

                const cumulativeData = parsedData.map(d => ({
                    date: d.date,
                    value: d[`cumulative_${model.fullName}`] || 0
                }));

                // Draw current values line (dashed)
                g.append("path")
                    .datum(currentData)
                    .attr("class", `line-current-${model.fullName.replace(/[^a-zA-Z0-9]/g, '-')}`)
                    .attr("fill", "none")
                    .attr("stroke", model.color)
                    .attr("stroke-width", 2)
                    .attr("stroke-dasharray", "4,4")
                    .attr("d", line)
                    .style("opacity", 0)
                    .transition()
                    .duration(800)
                    .style("opacity", 1);

                // Draw cumulative values line (solid)
                g.append("path")
                    .datum(cumulativeData)
                    .attr("class", `line-cumulative-${model.fullName.replace(/[^a-zA-Z0-9]/g, '-')}`)
                    .attr("fill", "none")
                    .attr("stroke", model.color)
                    .attr("stroke-width", 2)
                    .attr("d", line)
                    .style("opacity", 0)
                    .transition()
                    .duration(800)
                    .style("opacity", 1);

                // Draw points for current values (smaller, outlined)
                g.selectAll(`.point-current-${model.fullName.replace(/[^a-zA-Z0-9]/g, '-')}`)
                    .data(currentData)
                    .join("circle")
                    .attr("class", `point-current-${model.fullName.replace(/[^a-zA-Z0-9]/g, '-')}`)
                    .attr("cx", d => xScale(d.date))
                    .attr("cy", d => yScale(d.value))
                    .attr("r", 3)
                    .attr("fill", "white")
                    .attr("stroke", model.color)
                    .attr("stroke-width", 2)
                    .style("cursor", "pointer")
                    .style("opacity", 0)
                    .on("mouseover", function(event, d) {
                        d3.select(this).attr("r", 5);
                        // Get the last date's cumulative value for this model
                        const lastDate = parsedData[parsedData.length - 1];
                        const lastCumulativeValue = lastDate ? (lastDate[`cumulative_${model.fullName}`] || 0) : 0;
                        
                        tooltip
                            .style("visibility", "visible")
                            .html(`<div style="text-align: center;">
                                   <strong style="color: ${model.color};">${model.name}</strong><br/>
                                   <span style="border: 2px dashed ${model.color}; padding: 2px 4px; border-radius: 4px; display: inline-block; margin: 2px;">
                                   Day Count: <strong>${formatValue(d.value)}</strong></span><br/>
                                   <span style="background: ${model.color}; color: white; padding: 2px 4px; border-radius: 4px; display: inline-block; margin: 2px;">
                                   Cumulative: <strong>${formatValue(lastCumulativeValue)}</strong></span>
                                   </div>`);
                    })
                    .on("mousemove", function(event) {
                        const tooltipWidth = 250;
                        let left = event.pageX + 15;
                        let top = event.pageY - 60;
                        
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
                        d3.select(this).attr("r", 3);
                        tooltip.style("visibility", "hidden");
                    })
                    .transition()
                    .duration(800)
                    .delay(400)
                    .style("opacity", 1);

                // Draw points for cumulative values (larger, filled)
                g.selectAll(`.point-cumulative-${model.fullName.replace(/[^a-zA-Z0-9]/g, '-')}`)
                    .data(cumulativeData)
                    .join("circle")
                    .attr("class", `point-cumulative-${model.fullName.replace(/[^a-zA-Z0-9]/g, '-')}`)
                    .attr("cx", d => xScale(d.date))
                    .attr("cy", d => yScale(d.value))
                    .attr("r", 5)
                    .attr("fill", model.color)
                    .attr("stroke", "white")
                    .attr("stroke-width", 2)
                    .style("cursor", "pointer")
                    .style("opacity", 0)
                    .on("mouseover", function(event, d) {
                        d3.select(this).attr("r", 8);
                        const currentValue = currentData.find(cd => cd.date.getTime() === d.date.getTime())?.value || 0;
                        const formattedDate = d.date.toLocaleDateString('es-ES', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                        });
                        
                        tooltip
                            .style("visibility", "visible")
                            .html(`<div style="text-align: center;">
                                   <strong style="color: ${model.color};">${model.name}</strong><br/>
                                   <span style="opacity: 0.9;">${formattedDate}</span><br/>
                                   <span style="border: 2px dashed ${model.color}; padding: 2px 4px; border-radius: 4px; display: inline-block; margin: 2px;">
                                   Day Count: <strong>${formatValue(currentValue)}</strong></span><br/>
                                   <span style="background: ${model.color}; color: white; padding: 2px 4px; border-radius: 4px; display: inline-block; margin: 2px;">
                                   Cumulative: <strong>${formatValue(d.value)}</strong></span>
                                   </div>`);
                    })
                    .on("mousemove", function(event) {
                        const tooltipWidth = 250;
                        let left = event.pageX + 15;
                        let top = event.pageY - 60;
                        
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
                        d3.select(this).attr("r", 5);
                        tooltip.style("visibility", "hidden");
                    })
                    .transition()
                    .duration(800)
                    .delay(400)
                    .style("opacity", 1);
            } else {
                // Single line mode (cumulative values if available)
                const modelData = parsedData.map(d => ({
                    date: d.date,
                    value: d[model.fullName] || 0
                }));

                // Draw line
                g.append("path")
                    .datum(modelData)
                    .attr("class", `line-${model.fullName.replace(/[^a-zA-Z0-9]/g, '-')}`)
                    .attr("fill", "none")
                    .attr("stroke", model.color)
                    .attr("stroke-width", 2)
                    .attr("d", line)
                    .style("opacity", 0)
                    .transition()
                    .duration(800)
                    .style("opacity", 1);

                // Draw points
                g.selectAll(`.point-${model.fullName.replace(/[^a-zA-Z0-9]/g, '-')}`)
                    .data(modelData)
                    .join("circle")
                    .attr("class", `point-${model.fullName.replace(/[^a-zA-Z0-9]/g, '-')}`)
                    .attr("cx", d => xScale(d.date))
                    .attr("cy", d => yScale(d.value))
                    .attr("r", 5)
                    .attr("fill", model.color)
                    .attr("stroke", "white")
                    .attr("stroke-width", 2)
                    .style("cursor", "pointer")
                    .style("opacity", 0)
                    .on("mouseover", function(event, d) {
                        d3.select(this).attr("r", 8);
                        
                        // Get current and cumulative values for this date
                        const currentValueKey = `current_${model.fullName}`;
                        const dateData = parsedData.find(pd => pd.date.getTime() === d.date.getTime());
                        const currentValue = dateData ? (dateData[currentValueKey] || 0) : 0;
                        
                        // Get the last date's cumulative value for this model
                        const lastDate = parsedData[parsedData.length - 1];
                        const lastCumulativeValue = lastDate ? (lastDate[`cumulative_${model.fullName}`] || 0) : 0;
                        
                        tooltip
                            .style("visibility", "visible")
                            .html(`<div style="text-align: center;">
                                   <strong style="color: ${model.color};">${model.name}</strong><br/>
                                   <span style="border: 2px dashed ${model.color}; padding: 2px 4px; border-radius: 4px; display: inline-block; margin: 2px;">
                                   Day Count: <strong>${formatValue(currentValue)}</strong></span><br/>
                                   <span style="background: ${model.color}; color: white; padding: 2px 4px; border-radius: 4px; display: inline-block; margin: 2px;">
                                   Cumulative: <strong>${formatValue(lastCumulativeValue)}</strong></span>
                                   </div>`);
                    })
                    .on("mousemove", function(event) {
                        const tooltipWidth = 250;
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
                        d3.select(this).attr("r", 5);
                        tooltip.style("visibility", "hidden");
                    })
                    .transition()
                    .duration(800)
                    .delay(400)
                    .style("opacity", 1);
            }
        });

        // X-axis
        const xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.timeFormat("%m/%d"))
            .tickValues(parsedData.map(d => d.date)); // Use only actual data dates

        g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll("text")
            .style("font-size", "14px") // Increased font size
            .style("font-weight", "bold")
            .style("fill", "#374151")
            .style("text-anchor", "end")
            .attr("dx", "-1em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)"); // Reduced rotation angle for better readability

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
            .tickFormat(d => formatAxisLabel(d));

        g.append("g")
            .attr("class", "y-axis")
            .call(yAxis)
            .selectAll("text")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", "#374151");

        // X-axis label
        g.append("text")
            .attr("class", "x-axis-label")
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .style("fill", "#374151")
            .text(xAxisLabel);

        // Y-axis label
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

        // Add legend for dual-line mode
        if (showBothValues && models.some(m => m.hasCumulative && selectedModels.has(m.fullName))) {
            const legend = g.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width - 150}, 20)`);

            // Cumulative line legend item
            const cumulativeLegend = legend.append("g")
                .attr("class", "legend-item")
                .attr("transform", "translate(0, 0)");

            cumulativeLegend.append("line")
                .attr("x1", 0)
                .attr("x2", 20)
                .attr("y1", 0)
                .attr("y2", 0)
                .style("stroke", "#666")
                .style("stroke-width", 2);

            cumulativeLegend.append("text")
                .attr("x", 25)
                .attr("y", 0)
                .attr("dy", "0.35em")
                .style("font-size", "12px")
                .style("fill", "#374151")
                .text("Cumulative");

            // Current line legend item
            const currentLegend = legend.append("g")
                .attr("class", "legend-item")
                .attr("transform", "translate(0, 20)");

            currentLegend.append("line")
                .attr("x1", 0)
                .attr("x2", 20)
                .attr("y1", 0)
                .attr("y2", 0)
                .style("stroke", "#666")
                .style("stroke-width", 2)
                .style("stroke-dasharray", "4,4");

            currentLegend.append("text")
                .attr("x", 25)
                .attr("y", 0)
                .attr("dy", "0.35em")
                .style("font-size", "12px")
                .style("fill", "#374151")
                .text("Day Count");
        }

    }, [processedData, models, selectedModels, showBothValues, xAxisLabel, yAxisLabel]);

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
        <div className={cn("bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600", className)}>
            <h3 className="text-lg font-semibold text-dark dark:text-light mb-6">{title}</h3>
            
            {/* Model Selection Checkboxes */}
            <div className="mb-8 p-6 bg-gray-50 dark:bg-neutral-600 rounded-lg border-2 border-gray-200 dark:border-neutral-500">
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
                    <div className='flex justify-end gap-2 mb-4'>
                        <button 
                            className='btn btn-sm bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors'
                            onClick={() => svgRef.current && saveSVGObj(svgRef.current, `${title || 'line-chart'}.svg`)}
                            title="Download Chart as SVG"
                        >
                            <i className="fa-solid fa-download text-gray-700 dark:text-gray-300"></i>
                            <span className="ml-1 text-xs">SVG</span>
                        </button>
                        <button 
                            className='btn btn-sm bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors'
                            onClick={() => svgRef.current && saveSVGAsPNG(svgRef.current, `${title || 'line-chart'}.png`)}
                            title="Download Chart as PNG"
                        >
                            <i className="fa-solid fa-download text-gray-700 dark:text-gray-300"></i>
                            <span className="ml-1 text-xs">PNG</span>
                        </button>
                    </div>
                    {/* Chart */}
                    <div className="overflow-x-auto w-full">
                        <div className="min-w-full" style={{ minHeight: '600px' }}>
                            <svg ref={svgRef} width="100%" height="100%"></svg>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-neutral-600 rounded-lg">
                    <i className="fa-solid fa-chart-line text-4xl text-gray-400 mb-4"></i>
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

export default memo(LineChart);
