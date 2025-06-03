import { useState, useEffect, useRef, memo } from "react";
import * as d3 from "d3";
import { cn, saveSVGObj, saveSVGAsPNG } from "../../services/utils";
import { formatNumberMoney } from "../../components/context/utils";

const Histogram = ({ 
    data, 
    title, 
    xAxisLabel = "Models", 
    yAxisLabel = "Count",
    maxBars = 10,
    onBarClick,
    className = "",
    valueKey = "count", // Key for the main value to display
    cumulativeValueKey = "cumulative_count", // Key for cumulative value 
    modelKey = "model", // Key for model identifier
    formatAsInteger = true // Whether to format values as integers or floats
}) => {
    const svgRef = useRef();
    const [sortedData, setSortedData] = useState([]);
    const [displayCount, setDisplayCount] = useState(maxBars);
    
    useEffect(() => {
        if (data && data.length > 0) {
            // Always use cumulative values when available, fallback to regular values
            const processedData = data.map(item => ({
                ...item,
                [valueKey]: item[cumulativeValueKey] || item[valueKey] || 0
            }));
            
            const sorted = processedData.sort((a, b) => (b[valueKey] || 0) - (a[valueKey] || 0));
            setSortedData(sorted);
        }
    }, [data, valueKey, cumulativeValueKey]);

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
        const margin = { top: 30, right: 80, bottom: 100, left: 240 };
        const width = Math.max(containerWidth - margin.left - margin.right, 600);
        
        // Calculate height based on number of bars and ensure minimum height
        const barHeight = 50; // Increased height per bar for better spacing
        const height = Math.max(500, displayData.length * barHeight) - margin.top - margin.bottom;

        // Update SVG dimensions
        svg.attr("width", width + margin.left + margin.right)
           .attr("height", height + margin.top + margin.bottom);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales - improved domain to ensure top tick is always visible
        const maxValue = d3.max(displayData, d => d[valueKey] || 0);
        const xScale = d3.scaleLinear()
            .domain([0, maxValue * 1.2]) // Add 20% padding to ensure top value is always visible
            .range([0, width]);

        const yScale = d3.scaleBand()
            .domain(displayData.map(d => getModelName(d[modelKey])))
            .range([0, height])
            .padding(0.1);

        // Color scale
        const colorScale = d3.scaleOrdinal()
            .domain(displayData.map(d => getModelName(d[modelKey])))
            .range(d3.schemeCategory10);

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

        // Create bars
        g.selectAll(".bar")
            .data(displayData)
            .join("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => yScale(getModelName(d[modelKey])))
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScale(getModelName(d[modelKey])))
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                d3.select(this).style("opacity", 0.8);
                const modelName = getModelName(d[modelKey]);
                const value = d[valueKey] || 0;
                
                tooltip
                    .style("visibility", "visible")
                    .html(`<div style="text-align: center;">
                           <strong style="color: ${colorScale(modelName)};">${modelName}</strong><br/>
                           <strong style="font-size: 16px;">Total Count: ${formatValue(value)}</strong>
                           </div>`);
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
                d3.select(this).style("opacity", 1);
                tooltip.style("visibility", "hidden");
            })
            .on("click", function(event, d) {
                handleBarClick(d);
            })
            .transition()
            .duration(800)
            .ease(d3.easeQuadOut)
            .attr("width", d => xScale(d[valueKey] || 0));

        // Add value labels on bars
        g.selectAll(".bar-label")
            .data(displayData)
            .join("text")
            .attr("class", "bar-label")
            .attr("x", d => xScale(d[valueKey] || 0) + 10) // Increased spacing
            .attr("y", d => yScale(getModelName(d[modelKey])) + yScale.bandwidth() / 2)
            .attr("dy", "0.35em")
            .style("font-size", "14px") // Larger font size
            .style("font-weight", "bold")
            .style("fill", "#374151")
            .text(d => formatValue(d[valueKey] || 0))
            .style("opacity", 0)
            .transition()
            .duration(800)
            .delay(400)
            .style("opacity", 1);

        // X-axis with better tick configuration
        const xAxis = d3.axisBottom(xScale)
            .ticks(6) // Increase number of ticks to ensure better coverage
            .tickFormat(d => formatAxisLabel(d));

        g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll("text")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .style("fill", "#374151")
            .style("text-anchor", "middle");

        // Y-axis with larger font
        const yAxis = d3.axisLeft(yScale);

        g.append("g")
            .attr("class", "y-axis")
            .call(yAxis)
            .selectAll("text")
            .style("font-size", "14px") // Reduced font size to prevent overlap
            .style("font-weight", "bold")
            .style("fill", "#374151")
            .style("text-anchor", "end") // Right alignment for better readability
            .attr("dx", "-1.2em"); // Increased space between text and axis

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
            .attr("y", 0 - margin.left + 40)
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

    }, [sortedData, displayCount, valueKey, cumulativeValueKey, modelKey, formatValue, formatAxisLabel, handleBarClick]);

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
        <div className={cn("bg-white dark:bg-neutral-700 rounded-lg p-4 border border-gray-200 dark:border-neutral-600", className)}>
            <div className="mb-3 flex justify-between items-center">
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
            
            {/* Chart and Download Buttons - only show when there's data */}
            {sortedData.length > 0 ? (
                <div className="w-full">
                    {/* Download Buttons - positioned above chart */}
                    <div className='flex justify-end gap-2 mb-2'>
                        <button 
                            className='btn btn-sm bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors'
                            onClick={() => svgRef.current && saveSVGObj(svgRef.current, `${title || 'histogram'}.svg`)}
                            title="Download Chart as SVG"
                        >
                            <i className="fa-solid fa-download text-gray-700 dark:text-gray-300"></i>
                            <span className="ml-1 text-xs">SVG</span>
                        </button>
                        <button 
                            className='btn btn-sm bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors'
                            onClick={() => svgRef.current && saveSVGAsPNG(svgRef.current, `${title || 'histogram'}.png`)}
                            title="Download Chart as PNG"
                        >
                            <i className="fa-solid fa-download text-gray-700 dark:text-gray-300"></i>
                            <span className="ml-1 text-xs">PNG</span>
                        </button>
                    </div>
                    
                    {/* Chart */}
                    <div className="overflow-x-auto">
                        <div className="min-w-full" style={{ minHeight: '600px' }}>
                            <svg ref={svgRef} width="100%" height="100%"></svg>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-neutral-600 rounded-lg">
                    <i className="fa-solid fa-chart-bar text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-500 dark:text-gray-400">No data to display</p>
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

export default memo(Histogram);
