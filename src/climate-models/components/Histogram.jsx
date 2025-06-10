import { useState, useEffect, useRef, useCallback, memo } from "react";
import * as d3 from "d3";
import { cn, saveSVGObj, saveSVGAsPNG } from "../../services/utils";
import { formatNumberMoney } from "../../components/context/utils";
import { getClimateModelColor, extractModelName } from "../utils/colorUtils";

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
            // Process data without aggregation since API provides individual counts
            // Each model entry should remain separate even if they have the same extracted name
            const processedData = data.map((item, index) => {
                const modelName = extractModelName(item[modelKey]);
                const value = item[cumulativeValueKey] || item[valueKey] || item.count || 0;
                
                return {
                    ...item,
                    [valueKey]: value,
                    modelName: modelName,
                    originalModelName: item[modelKey], // Keep original model name for color consistency
                    uniqueId: `${item[modelKey]}_${index}` // Add unique identifier to prevent merging
                };
            });
            
            // Sort by value (no aggregation needed)
            const sorted = processedData.sort((a, b) => (b[valueKey] || 0) - (a[valueKey] || 0));
            setSortedData(sorted);
        }
    }, [data, valueKey, cumulativeValueKey, modelKey]);

    // Sync displayCount with maxBars when it changes from parent
    useEffect(() => {
        setDisplayCount(maxBars);
    }, [maxBars]);

    const formatValue = useCallback((value) => {
        if (formatAsInteger) {
            return formatNumberMoney(Math.round(value), true);
        }
        return formatNumberMoney(value, false, 2);
    }, [formatAsInteger]);

    const formatAxisLabel = useCallback((value) => {
        if (formatAsInteger) {
            return formatNumberMoney(Math.round(value), true);
        }
        return formatNumberMoney(value, false, 1);
    }, [formatAsInteger]);

    const getModelName = useCallback((item) => {
        return item.modelName || extractModelName(item[modelKey]);
    }, [modelKey]);

    const handleBarClick = useCallback((item) => {
        if (onBarClick) {
            onBarClick(item);
        }
    }, [onBarClick]);

    useEffect(() => {
        if (!sortedData.length || !svgRef.current) {
            return;
        }

        const displayData = sortedData.slice(0, displayCount);
        
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Get container width for responsiveness
        const containerWidth = svgRef.current.parentElement.clientWidth || 800;
        
        // Dimensions and margins - adjusted for better display
        const margin = { top: 30, right: 80, bottom: 100, left: 240 };
        const width = Math.max(containerWidth - margin.left - margin.right, 600);
        
        // Calculate height based on number of bars and ensure minimum height
        const barHeight = 50; // Height per bar for better spacing
        const minHeight = 400; // Minimum chart height
        const calculatedHeight = Math.max(minHeight, displayData.length * barHeight);
        const height = calculatedHeight - margin.top - margin.bottom;

        // Update SVG dimensions - ensure proper sizing for varying number of bars
        const totalSVGHeight = height + margin.top + margin.bottom;
        const totalSVGWidth = width + margin.left + margin.right;
        
        svg.attr("width", totalSVGWidth)
           .attr("height", totalSVGHeight);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales - improved domain to ensure top tick is always visible
        const maxValue = d3.max(displayData, d => d[valueKey] || 0);
        const xScale = d3.scaleLinear()
            .domain([0, maxValue * 1.2]) // Add 20% padding to ensure top value is always visible
            .range([0, width]);

        const yScale = d3.scaleBand()
            .domain(displayData.map(d => d.uniqueId)) // Use unique ID to ensure separate bars
            .range([0, height])
            .padding(0.1);

        // Color scale using consistent climate model colors
        // Use original model name (URL) for color consistency across charts
        // This ensures each unique model URL gets a different color
        const colorScale = (item) => {
            const originalName = item.originalModelName || item[modelKey];
            return getClimateModelColor(originalName);
        };

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
            .attr("y", d => yScale(d.uniqueId))
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScale(d))
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                d3.select(this).style("opacity", 0.8);
                const modelName = getModelName(d);
                const value = d[valueKey] || 0;
                
                tooltip
                    .style("visibility", "visible")
                    .html(`<div style="text-align: center;">
                           <strong style="color: ${colorScale(d)};">${modelName}</strong><br/>
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
            .attr("y", d => yScale(d.uniqueId) + yScale.bandwidth() / 2)
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

        // Y-axis with custom labels showing model names
        const yAxis = d3.axisLeft(yScale)
            .tickSize(0) // Remove tick lines to prevent vertical lines
            .tickPadding(10) // Add padding between text and axis
            .tickFormat(d => {
                // Find the data item with this unique ID and return its model name
                const item = displayData.find(item => item.uniqueId === d);
                return item ? getModelName(item) : d;
            });

        const yAxisGroup = g.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        // Style the Y-axis and completely remove any vertical lines
        yAxisGroup.selectAll("text")
            .style("font-size", "14px") // Reduced font size to prevent overlap
            .style("font-weight", "bold")
            .style("fill", "#374151")
            .style("text-anchor", "end") // Right alignment for better readability
            .attr("dx", "-1.2em"); // Increased space between text and axis

        // Remove the Y-axis domain line and any tick lines to clean up appearance
        yAxisGroup.select(".domain").remove();
        yAxisGroup.selectAll(".tick line").remove();

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

        // Grid lines - properly constrained within chart area and exclude zero line
        g.selectAll(".grid-line")
            .data(xScale.ticks(5).filter(d => d > 0)) // Exclude the zero line to prevent overlap with Y-axis
            .join("line")
            .attr("class", "grid-line")
            .attr("x1", d => Math.max(0, Math.min(width, xScale(d))))
            .attr("x2", d => Math.max(0, Math.min(width, xScale(d))))
            .attr("y1", 0)
            .attr("y2", height)
            .style("stroke", "#e5e7eb")
            .style("stroke-width", 1)
            .style("opacity", 0.5);

    }, [sortedData, displayCount, valueKey, modelKey, formatAsInteger]);

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
                            onChange={(e) => {
                                const newValue = Number(e.target.value);
                                setDisplayCount(newValue);
                            }}
                            className="form-select text-sm border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-dark dark:text-light rounded"
                        >
                            {(() => {
                                const options = [5, 10, 15, 20];
                                // Add additional options for larger datasets
                                if (sortedData.length > 20) {
                                    options.push(25, 30, 50);
                                }
                                // Always add "All" option if there are more than maxBars items
                                if (sortedData.length > maxBars) {
                                    options.push(sortedData.length);
                                }
                                // Filter out duplicates and sort
                                const finalOptions = [...new Set(options)].filter(num => num <= sortedData.length).sort((a, b) => a - b);
                                return finalOptions;
                            })().map(num => (
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
                        <div className="min-w-full" style={{ 
                            minHeight: displayCount <= 10 ? '600px' : `${Math.max(600, displayCount * 50 + 200)}px` 
                        }}>
                            <svg ref={svgRef} key={`histogram-${displayCount}-${sortedData.length}`} width="100%" height="100%"></svg>
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

// Custom comparison function for memo to prevent unnecessary re-renders
// Only compare props that actually affect the chart rendering
const arePropsEqual = (prevProps, nextProps) => {
    // Compare primitive props
    if (
        prevProps.title !== nextProps.title ||
        prevProps.xAxisLabel !== nextProps.xAxisLabel ||
        prevProps.yAxisLabel !== nextProps.yAxisLabel ||
        prevProps.maxBars !== nextProps.maxBars ||
        prevProps.className !== nextProps.className ||
        prevProps.valueKey !== nextProps.valueKey ||
        prevProps.cumulativeValueKey !== nextProps.cumulativeValueKey ||
        prevProps.modelKey !== nextProps.modelKey ||
        prevProps.formatAsInteger !== nextProps.formatAsInteger
    ) {
        return false;
    }

    // Compare data array - this is the most important comparison
    if (prevProps.data !== nextProps.data) {
        // If references are different, check if the content is actually different
        if (!prevProps.data || !nextProps.data) {
            return prevProps.data === nextProps.data;
        }
        if (prevProps.data.length !== nextProps.data.length) {
            return false;
        }
        // For performance, just check if the first and last items are the same
        // Since this is sorted data, if these match, the middle probably does too
        if (prevProps.data.length > 0) {
            const prevFirst = prevProps.data[0];
            const nextFirst = nextProps.data[0];
            const prevLast = prevProps.data[prevProps.data.length - 1];
            const nextLast = nextProps.data[nextProps.data.length - 1];
            
            if (
                prevFirst[nextProps.modelKey] !== nextFirst[nextProps.modelKey] ||
                prevFirst[nextProps.valueKey] !== nextFirst[nextProps.valueKey] ||
                prevLast[nextProps.modelKey] !== nextLast[nextProps.modelKey] ||
                prevLast[nextProps.valueKey] !== nextLast[nextProps.valueKey]
            ) {
                return false;
            }
        }
    }

    // Don't compare onBarClick callback as it might change reference but not functionality
    return true;
};

export default memo(Histogram, arePropsEqual);
