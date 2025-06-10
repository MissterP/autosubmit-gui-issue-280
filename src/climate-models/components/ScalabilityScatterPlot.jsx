import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { saveSVGObj, saveSVGAsPNG } from '../../services/utils';
import { formatNumberMoney } from '../../components/context/utils';
import { getClimateModelColor, extractModelName } from '../utils/colorUtils';
import { useNavigate } from 'react-router-dom';

const ScalabilityScatterPlot = ({
    data,
    xAttribute,
    yAttribute,
    title,
    xLabel,
    yLabel,
    colorAttribute = 'model'
}) => {
    const svgRef = useRef(null);
    const navigate = useNavigate();

    // Custom download functions that exclude zoom buttons
    const downloadSVG = () => {
        const svg = svgRef.current;
        const clone = svg.cloneNode(true);
        
        // Remove export-exclude elements from clone
        const excludeElements = clone.querySelectorAll('.export-exclude');
        excludeElements.forEach(el => el.remove());
        
        saveSVGObj(clone, `${title.replace(/\s+/g, '_')}.svg`);
    };
    
    const downloadPNG = () => {
        const svg = svgRef.current;
        const clone = svg.cloneNode(true);
        
        // Create a temporary container in the DOM for proper SVG processing
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.appendChild(clone);
        document.body.appendChild(tempContainer);
        
        try {
            // Remove export-exclude elements from clone
            const excludeElements = clone.querySelectorAll('.export-exclude');
            excludeElements.forEach(el => el.remove());
            
            // Ensure SVG has proper namespace and dimensions
            clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            
            // Copy computed styles to ensure proper rendering
            const originalSvg = svgRef.current;
            const originalRect = originalSvg.getBoundingClientRect();
            clone.setAttribute('width', originalRect.width);
            clone.setAttribute('height', originalRect.height);
            
            saveSVGAsPNG(clone, `${title.replace(/\s+/g, '_')}.png`);
        } finally {
            // Clean up temporary container
            document.body.removeChild(tempContainer);
        }
    };

    useEffect(() => {
        if (!data || data.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove(); // Clear previous render

        const margin = { top: 60, right: 300, bottom: 80, left: 150 };
        const width = 1200 - margin.left - margin.right;
        const height = 800 - margin.top - margin.bottom;

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d[xAttribute]))
            .range([0, width])
            .nice();

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d[yAttribute]))
            .range([height, 0])
            .nice();

        // Color scale for different models/categories using consistent climate model colors
        const uniqueValues = [...new Set(data.map(d => d[colorAttribute]))];
        const colorScale = d3.scaleOrdinal()
            .domain(uniqueValues)
            .range(uniqueValues.map(value => getClimateModelColor(value)));

        // Create main group
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create clipping path to keep points within chart area
        svg.append("defs").append("clipPath")
            .attr("id", "chart-clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        // Apply clipping path to the main group
        g.attr("clip-path", "url(#chart-clip)");

        // Add axes with number formatting
        const xAxis = d3.axisBottom(xScale)
            .tickSize(-height)
            .tickSizeOuter(0)
            .tickPadding(10)
            .tickFormat(d => typeof d === 'number' ? formatNumberMoney(d, false, 0) : d);

        const yAxis = d3.axisLeft(yScale)
            .tickSize(-width)
            .tickSizeOuter(0)
            .tickPadding(10)
            .tickFormat(d => typeof d === 'number' ? formatNumberMoney(d, false, 0) : d);

        const xAxisGroup = svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(${margin.left},${margin.top + height})`)
            .call(xAxis);

        xAxisGroup.selectAll('.tick line')
            .style('stroke', '#e0e0e0')
            .style('stroke-width', 0.5);

        xAxisGroup.selectAll('.tick text')
            .style('fill', '#666')
            .style('font-size', '12px');

        xAxisGroup.select('.domain')
            .style('stroke', '#ccc');

        const yAxisGroup = svg.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .call(yAxis);

        yAxisGroup.selectAll('.tick line')
            .style('stroke', '#e0e0e0')
            .style('stroke-width', 0.5);

        yAxisGroup.selectAll('.tick text')
            .style('fill', '#666')
            .style('font-size', '12px');

        yAxisGroup.select('.domain')
            .style('stroke', '#ccc');

        // Create tooltip with enhanced historical styling (matching LineChart.jsx)
        const tooltip = d3.select("body").selectAll(".d3-scalability-tooltip")
            .data([0])
            .join("div")
            .attr("class", "d3-scalability-tooltip")
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

        // Create zoom behavior BEFORE adding circles
        const zoom = d3.zoom()
            .scaleExtent([1, 5])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .filter(event => {
                // Allow wheel events for zooming
                if (event.type === 'wheel') {
                    return true;
                }
                // For drag events, only allow on the background (not on circles)
                return event.target.tagName !== 'circle' && !event.target.closest('.point-group');
            })
            .on('zoom', (event) => {
                const { transform } = event;
                
                // Create new scales based on zoom transform
                const newXScale = transform.rescaleX(xScale);
                const newYScale = transform.rescaleY(yScale);
                
                // Update only the positions of the circles
                g.selectAll('.point-group circle')
                    .attr('cx', d => newXScale(d[xAttribute]))
                    .attr('cy', d => newYScale(d[yAttribute]));
                
                // Update axes
                svg.select('.x-axis')
                    .call(d3.axisBottom(newXScale).tickSize(-height).tickSizeOuter(0).tickPadding(10));
                
                svg.select('.y-axis')
                    .call(d3.axisLeft(newYScale).tickSize(-width).tickSizeOuter(0).tickPadding(10));
                
                // Re-apply axis styling
                svg.selectAll('.x-axis .tick line').style('stroke', '#e0e0e0').style('stroke-width', 0.5);
                svg.selectAll('.x-axis .tick text').style('fill', '#666').style('font-size', '12px');
                svg.selectAll('.x-axis .domain').style('stroke', '#ccc');
                
                svg.selectAll('.y-axis .tick line').style('stroke', '#e0e0e0').style('stroke-width', 0.5);
                svg.selectAll('.y-axis .tick text').style('fill', '#666').style('font-size', '12px');
                svg.selectAll('.y-axis .domain').style('stroke', '#ccc');
            });

        // Create background rectangle for zoom interactions - BEHIND everything else
        g.insert('rect', ':first-child')
            .attr('width', width)
            .attr('height', height)
            .style('fill', 'transparent')
            .style('pointer-events', 'all')
            .call(zoom);

        // Create circles for each data point using D3 data binding
        const circles = g.selectAll('.point-group')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'point-group')
            .style('cursor', 'pointer')
            .style('pointer-events', 'all'); // Ensure circles can receive events

        // Main circle with enhanced styling
        circles.append('circle')
            .attr('cx', d => xScale(d[xAttribute]))
            .attr('cy', d => yScale(d[yAttribute]))
            .attr('r', 6)
            .style('fill', d => colorScale(d[colorAttribute]))
            .style('fill-opacity', 0.8)
            .style('stroke', '#fff')
            .style('stroke-width', 2);

        // Add interactivity with enhanced tooltip
        circles
            .on('mouseover', function(event, d) {
                // Highlight the point
                d3.select(this).select('circle')
                    .transition()
                    .duration(150)
                    .attr('r', 8)
                    .style('fill-opacity', 1)
                    .style('stroke-width', 3);
                
                // Show enhanced tooltip
                const modelColor = colorScale(d[colorAttribute]);
                
                // Format values for better display
                const formatValue = (value) => {
                    if (typeof value === 'number') {
                        return formatNumberMoney(value, false, 2);
                    }
                    return value;
                };
                
                tooltip
                    .style("visibility", "visible")
                    .html(`<div style="text-align: center;">
                           <strong style="color: ${modelColor};">${d.experiment_name || d.experiment_id || 'Experiment'}</strong><br/>
                           <span style="opacity: 0.9;">${yLabel}: <strong>${formatValue(d[yAttribute])}</strong></span><br/>
                           <span style="opacity: 0.9;">Parallelization: <strong>${formatValue(d[xAttribute])}</strong></span>
                           </div>`);
            })
            .on('mousemove', function(event, d) {
                const tooltipWidth = 250;
                let left = event.pageX + 15;
                let top = event.pageY - 60;
                
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
            .on('mouseout', function(event, d) {
                // Reset highlight
                d3.select(this).select('circle')
                    .transition()
                    .duration(150)
                    .attr('r', 6)
                    .style('fill-opacity', 0.8)
                    .style('stroke-width', 2);
                    
                // Hide tooltip
                tooltip.style("visibility", "hidden");
            })
            .on('click', function(event, d) {
                // Navigate to experiment quick view in new tab
                const expName = d.experiment_name || d.experiment_id;
                if (expName) {
                    window.open(`/experiment/${expName}/quick`, '_blank');
                }
            });

        // Add title
        svg.append('text')
            .attr('x', (width + margin.left + margin.right) / 2)
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .style('font-size', '18px')
            .style('font-weight', 'bold')
            .text(title);

        // Add axis labels
        svg.append('text')
            .attr('x', (width + margin.left + margin.right) / 2)
            .attr('y', height + margin.top + 60)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .text(xLabel);

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -(height + margin.top) / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .text(yLabel);

        // Zoom control buttons - positioned outside the chart area
        const zoomButtonsContainer = svg.append("g")
            .attr("class", "zoom-buttons-container export-exclude")
            .attr("transform", `translate(${width + margin.left + 120}, ${margin.top + 10})`);

        // Zoom in button
        const zoomInGroup = zoomButtonsContainer.append("g")
            .attr("class", "zoom-button zoom-in")
            .style("cursor", "pointer");

        zoomInGroup.append("rect")
            .attr("width", 30)
            .attr("height", 30)
            .attr("fill", "steelblue")
            .attr("stroke", "darkblue")
            .attr("stroke-width", 1)
            .attr("rx", 3);

        zoomInGroup.append("text")
            .attr("x", 15)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .text("+");

        // Zoom out button
        const zoomOutGroup = zoomButtonsContainer.append("g")
            .attr("class", "zoom-button zoom-out")
            .attr("transform", "translate(0, 35)")
            .style("cursor", "pointer");

        zoomOutGroup.append("rect")
            .attr("width", 30)
            .attr("height", 30)
            .attr("fill", "steelblue")
            .attr("stroke", "darkblue")
            .attr("stroke-width", 1)
            .attr("rx", 3);

        zoomOutGroup.append("text")
            .attr("x", 15)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .text("-");

        // Reset zoom button
        const resetZoomGroup = zoomButtonsContainer.append("g")
            .attr("class", "zoom-button reset-zoom")
            .attr("transform", "translate(0, 70)")
            .style("cursor", "pointer");

        resetZoomGroup.append("rect")
            .attr("width", 30)
            .attr("height", 30)
            .attr("fill", "orange")
            .attr("stroke", "darkorange")
            .attr("stroke-width", 1)
            .attr("rx", 3);

        resetZoomGroup.append("text")
            .attr("x", 15)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .text("R");

        // Add zoom functionality to buttons
        zoomInGroup.on("click", () => {
            svg.transition().duration(300).call(zoom.scaleBy, 1.5);
        });

        zoomOutGroup.on("click", () => {
            svg.transition().duration(300).call(zoom.scaleBy, 1 / 1.5);
        });

        resetZoomGroup.on("click", () => {
            svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
        });

        // Add legend with enhanced model name highlighting using consistent colors
        const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${width + margin.left + 20}, ${margin.top + 120})`);

        uniqueValues.forEach((value, i) => {
            const modelColor = getClimateModelColor(value);
            const legendRow = legend.append('g')
                .attr('transform', `translate(0, ${i * 25})`)
                .style('cursor', 'pointer');

            legendRow.append('circle')
                .attr('r', 6)
                .style('fill', modelColor)
                .style('fill-opacity', 0.8)
                .style('stroke', '#fff')
                .style('stroke-width', 2);

            legendRow.append('text')
                .attr('x', 15)
                .attr('y', 5)
                .style('font-size', '13px')
                .style('font-weight', '500')
                .style('fill', modelColor)
                .text(extractModelName(value));

            // Add hover effects to legend items
            legendRow
                .on('mouseover', function() {
                    d3.select(this).select('circle')
                        .transition()
                        .duration(150)
                        .attr('r', 8)
                        .style('fill-opacity', 1);
                    
                    d3.select(this).select('text')
                        .transition()
                        .duration(150)
                        .style('font-weight', 'bold');
                })
                .on('mouseout', function() {
                    d3.select(this).select('circle')
                        .transition()
                        .duration(150)
                        .attr('r', 6)
                        .style('fill-opacity', 0.8);
                    
                    d3.select(this).select('text')
                        .transition()
                        .duration(150)
                        .style('font-weight', '500');
                });
        });

        // Set SVG dimensions
        svg.attr('width', width + margin.left + margin.right + 200)
           .attr('height', height + margin.top + margin.bottom);

        // Cleanup function
        return () => {
            d3.select("body").selectAll(".d3-scalability-tooltip").remove();
        };

    }, [data, xAttribute, yAttribute, title, xLabel, yLabel, colorAttribute, navigate]);

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <i className="fa-solid fa-chart-scatter text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                        No Data Available
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        No data points to display for the current selection.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="overflow-x-auto">
                <svg ref={svgRef} className="block mx-auto"></svg>
            </div>
            
            <div className="absolute top-0 right-0 flex gap-2 mt-2 mr-2">
                <button 
                    onClick={downloadSVG}
                    className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors shadow-sm"
                    title="Save chart as SVG"
                >
                    <i className="fa-solid fa-download mr-2"></i>
                    SVG
                </button>
                <button 
                    onClick={downloadPNG}
                    className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors shadow-sm"
                    title="Save chart as PNG"
                >
                    <i className="fa-solid fa-image mr-2"></i>
                    PNG
                </button>
            </div>
        </div>
    );
};

export default ScalabilityScatterPlot;
