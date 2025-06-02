import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { cn } from "../../services/utils";

const LineChart = ({ 
    data, 
    title, 
    xAxisLabel = "Date", 
    yAxisLabel = "Count",
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
                    modelSet.add(item.model);
                    if (item.cumulative_count !== undefined || item.cumulative_footprint !== undefined) {
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
                data[date].forEach(item => {
                    // Use cumulative values if available, otherwise fallback to regular values
                    dayData[item.model] = item.cumulative_count || item.cumulative_footprint || item.count || item.footprint || 0;
                });
                return dayData;
            });
            
            setProcessedData(chartData);
        }
    }, [data]);

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
                    max = Math.max(max, item[model.fullName] || 0);
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
            .domain([0, maxValue])
            .range([height, 0]);

        // Create tooltip
        const tooltip = d3.select("body").selectAll(".d3-line-tooltip")
            .data([0])
            .join("div")
            .attr("class", "d3-line-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "rgba(0, 0, 0, 0.85)")
            .style("color", "white")
            .style("padding", "10px 14px")
            .style("border-radius", "6px")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("pointer-events", "none")
            .style("z-index", "1000")
            .style("box-shadow", "0 4px 6px rgba(0,0,0,0.1)");

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
                .attr("r", 5) // Increased point size
                .attr("fill", model.color)
                .attr("stroke", "white")
                .attr("stroke-width", 2)
                .style("cursor", "pointer")
                .style("opacity", 0)
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("r", 8); // Larger point on hover
                    
                    // Check if current data has cumulative values
                    const hasCumulativeData = models.length > 0 && models[0].hasCumulative;
                    const valueLabel = hasCumulativeData ? "Cumulative Value" : "Current Value";
                    
                    tooltip
                        .style("visibility", "visible")
                        .html(`<strong>${model.name}</strong><br/>
                               Date: ${d.date.toLocaleDateString()}<br/>
                               ${valueLabel}: ${d.value.toFixed(2)}`);
                })
                .on("mousemove", function(event) {
                    tooltip
                        .style("top", (event.pageY - 10) + "px")
                        .style("left", (event.pageX + 10) + "px");
                })
                .on("mouseout", function() {
                    d3.select(this).attr("r", 5);
                    tooltip.style("visibility", "hidden");
                })
                .transition()
                .duration(800)
                .delay(400)
                .style("opacity", 1);
        });

        // X-axis
        const xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.timeFormat("%m/%d"))
            .ticks(Math.min(processedData.length, 7)); // Reduce number of ticks to prevent overlapping

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

        // Y-axis
        const yAxis = d3.axisLeft(yScale)
            .ticks(8); // Control number of ticks on Y axis

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

    }, [processedData, models, selectedModels, xAxisLabel, yAxisLabel]);

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
            <div className="mb-8 p-4 bg-gray-50 dark:bg-neutral-600 rounded-lg">
                <h4 className="text-sm font-semibold text-dark dark:text-light mb-3">Select Models to Display:</h4>
                <div className="flex flex-wrap gap-4">
                    {models.map(model => (
                        <label key={model.fullName} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedModels.has(model.fullName)}
                                onChange={() => handleModelToggle(model.fullName)}
                                className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                            />
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-4 h-4 rounded border border-gray-300" 
                                    style={{ backgroundColor: model.color }}
                                ></div>
                                <span className="text-sm text-dark dark:text-light font-medium">
                                    {model.name}
                                </span>
                            </div>
                        </label>
                    ))}
                </div>
                {models.length > 0 && (
                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={() => setSelectedModels(new Set(models.map(m => m.fullName)))}
                            className="text-xs px-3 py-1 bg-primary text-white rounded hover:bg-secondary transition-colors"
                        >
                            Select All
                        </button>
                        <button
                            onClick={() => setSelectedModels(new Set())}
                            className="text-xs px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            Deselect All
                        </button>
                    </div>
                )}
            </div>
            
            {/* Chart Container */}
            {processedData.length > 0 && selectedModels.size > 0 ? (
                <div className="overflow-x-auto w-full">
                    <div className="min-w-full" style={{ minHeight: '600px' }}>
                        <svg ref={svgRef} width="100%" height="100%"></svg>
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
        </div>
    );
};

export default LineChart;
