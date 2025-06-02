import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { cn } from "../../services/utils";

const Histogram = ({ 
    data, 
    title, 
    xAxisLabel = "Models", 
    yAxisLabel = "Count",
    maxBars = 10,
    onBarClick,
    className = "",
    isPopularityMetric = false,
    showAccumulated = false
}) => {
    const svgRef = useRef();
    const [sortedData, setSortedData] = useState([]);
    const [displayCount, setDisplayCount] = useState(maxBars);
    
    useEffect(() => {
        if (data && data.length > 0) {
            let processedData = [...data];
            
            if (showAccumulated) {
                // Calculate accumulated values for each model
                const modelTotals = {};
                processedData.forEach(item => {
                    const modelName = getModelName(item.model);
                    const value = item.count || item.footprint || 0;
                    modelTotals[modelName] = (modelTotals[modelName] || 0) + value;
                });
                
                // Transform data to show accumulated values
                processedData = Object.entries(modelTotals).map(([modelName, total]) => {
                    const originalItem = data.find(item => getModelName(item.model) === modelName);
                    return {
                        ...originalItem,
                        count: originalItem.count ? total : undefined,
                        footprint: originalItem.footprint ? total : undefined
                    };
                });
            }
            
            const sorted = processedData.sort((a, b) => (b.count || b.footprint || 0) - (a.count || a.footprint || 0));
            setSortedData(sorted);
        }
    }, [data, showAccumulated]);

    const formatValue = (value) => {
        if (isPopularityMetric) {
            return Math.round(value).toString();
        }
        return value.toFixed(2);
    };

    const formatAxisLabel = (value) => {
        if (isPopularityMetric) {
            return Math.round(value).toString();
        }
        return value.toFixed(1);
    };

    const getModelName = (url) => {
        if (!url) return 'Unknown';
        const parts = url.split('/');
        return parts[parts.length - 1] || 'Unknown';
    };

    const handleBarClick = (item) => {
        if (onBarClick) {
            onBarClick(item);
        }
    };

    useEffect(() => {
        if (!sortedData.length || !svgRef.current) return;

        const displayData = sortedData.slice(0, displayCount);
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Get container width for responsiveness
        const containerWidth = svgRef.current.parentElement.clientWidth || 800;
        
        // Dimensions and margins - adjusted for better display
        const margin = { top: 30, right: 80, bottom: 100, left: 180 };
        const width = Math.max(containerWidth - margin.left - margin.right, 600);
        
        // Calculate height based on number of bars and ensure minimum height
        const barHeight = 50; // Increased height per bar for better spacing
        const height = Math.max(500, displayData.length * barHeight) - margin.top - margin.bottom;

        // Update SVG dimensions
        svg.attr("width", width + margin.left + margin.right)
           .attr("height", height + margin.top + margin.bottom);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(displayData, d => d.count || d.footprint || 0)])
            .range([0, width]);

        const yScale = d3.scaleBand()
            .domain(displayData.map(d => getModelName(d.model)))
            .range([0, height])
            .padding(0.1);

        // Color scale
        const colorScale = d3.scaleOrdinal()
            .domain(displayData.map(d => getModelName(d.model)))
            .range(d3.schemeCategory10);

        // Create tooltip
        const tooltip = d3.select("body").selectAll(".d3-tooltip")
            .data([0])
            .join("div")
            .attr("class", "d3-tooltip")
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

        // Create bars
        g.selectAll(".bar")
            .data(displayData)
            .join("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => yScale(getModelName(d.model)))
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScale(getModelName(d.model)))
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                d3.select(this).style("opacity", 0.8);
                tooltip
                    .style("visibility", "visible")
                    .html(`${getModelName(d.model)}: ${formatValue(d.count || d.footprint || 0)}`);
            })
            .on("mousemove", function(event) {
                tooltip
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).style("opacity", 1);
                tooltip.style("visibility", "hidden");
            })
            .on("click", function(event, d) {
                handleBarClick(d);
            })
            .transition()
            .duration(800)
            .ease(d3.easeQuadOut)
            .attr("width", d => xScale(d.count || d.footprint || 0));

        // Add value labels on bars
        g.selectAll(".bar-label")
            .data(displayData)
            .join("text")
            .attr("class", "bar-label")
            .attr("x", d => xScale(d.count || d.footprint || 0) + 10) // Increased spacing
            .attr("y", d => yScale(getModelName(d.model)) + yScale.bandwidth() / 2)
            .attr("dy", "0.35em")
            .style("font-size", "14px") // Larger font size
            .style("font-weight", "bold")
            .style("fill", "#374151")
            .text(d => formatValue(d.count || d.footprint || 0))
            .style("opacity", 0)
            .transition()
            .duration(800)
            .delay(400)
            .style("opacity", 1);

        // X-axis
        const xAxis = d3.axisBottom(xScale)
            .ticks(5) // Limit number of ticks to prevent overlapping
            .tickFormat(d => isPopularityMetric ? Math.round(d) : d.toFixed(1));

        g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll("text")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", "#374151")
            .style("text-anchor", "middle");

        // Y-axis
        const yAxis = d3.axisLeft(yScale);

        g.append("g")
            .attr("class", "y-axis")
            .call(yAxis)
            .selectAll("text")
            .style("font-size", "14px") // Increased font size
            .style("font-weight", "bold")
            .style("fill", "#374151")
            .style("text-anchor", "end") // Right alignment for better readability
            .attr("dx", "-0.8em"); // More space between text and axis

        // X-axis label
        g.append("text")
            .attr("class", "x-axis-label")
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 20})`)
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .style("fill", "#374151")
            .text(yAxisLabel);

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
            .text(xAxisLabel);

        // Grid lines
        g.selectAll(".grid-line")
            .data(xScale.ticks(5))
            .join("line")
            .attr("class", "grid-line")
            .attr("x1", d => xScale(d))
            .attr("x2", d => xScale(d))
            .attr("y1", 0)
            .attr("y2", height)
            .style("stroke", "#e5e7eb")
            .style("stroke-width", 1)
            .style("opacity", 0.5);

    }, [sortedData, displayCount, isPopularityMetric, formatValue, formatAxisLabel, handleBarClick]);

    if (!data || data.length === 0) {
        return (
            <div className={cn("bg-white dark:bg-neutral-700 rounded-lg p-6", className)}>
                <h3 className="text-lg font-semibold text-dark dark:text-light mb-4">{title}</h3>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No data available
                </div>
            </div>
        );
    }

    return (
        <div className={cn("bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600", className)}>
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-dark dark:text-light">{title}</h3>
                {sortedData.length > maxBars && (
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-dark dark:text-light">Show:</label>
                        <select 
                            value={displayCount} 
                            onChange={(e) => setDisplayCount(Number(e.target.value))}
                            className="form-select text-sm border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-dark dark:text-light rounded"
                        >
                            {[5, 10, 15, 20, sortedData.length].filter(num => num <= sortedData.length).map(num => (
                                <option key={num} value={num}>
                                    {num === sortedData.length ? 'All' : num}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            
            <div className="overflow-x-auto">
                <div className="min-w-full" style={{ minHeight: '600px' }}>
                    <svg ref={svgRef} width="100%" height="100%"></svg>
                </div>
            </div>
        </div>
    );
};

export default Histogram;
