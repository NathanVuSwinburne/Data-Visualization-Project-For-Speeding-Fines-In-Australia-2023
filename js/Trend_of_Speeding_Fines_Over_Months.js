// Initialize the monthly trend chart
function initMonthlyTrendChart() {
    console.log('Initializing monthly trend chart');
    
    if (!window.dashboardData || !window.dashboardData.monthlyTrend) {
        console.error('No data available for chart');
        return;
    }
    
    const data = window.dashboardData.monthlyTrend;
    console.log('Chart data:', data);
    
    const container = d3.select("#monthly-trend-chart");
    if (container.empty()) {
        console.error('Container #monthly-trend-chart not found');
        return;
    }
    
    // Create tooltip div if it doesn't exist
    let tooltip = d3.select("body").select(".tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "rgba(0, 0, 0, 0.8)")
            .style("color", "white")
            .style("padding", "8px 12px")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("z-index", "100");
    }
    
    // Clear any existing content
    container.selectAll("*").remove();
    
    // Get container dimensions
    const containerWidth = container.node().getBoundingClientRect().width;
    const containerHeight = 400; // Fixed height, can be made responsive if needed
    
    // Set up margins
    const margin = {top: 20, right: 60, bottom: 60, left: 60};
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    // Create SVG element
    const svg = container
        .append("svg")
        .attr("width", "100%")
        .attr("height", containerHeight)
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Set up scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.month))
        .range([0, width])
        .padding(0.2);
    
    const y1 = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.totalFines * 1.1)])
        .range([height, 0]);
    
    // Calculate domain for percentage change (add some padding)
    const minPct = Math.min(0, d3.min(data, d => d.percentageChange || 0));
    const maxPct = d3.max(data, d => d.percentageChange || 0);
    const pctPadding = (maxPct - minPct) * 0.2;
    
    const y2 = d3.scaleLinear()
        .domain([minPct - pctPadding, maxPct + pctPadding])
        .range([height, 0]);
    
    // Add bars for total fines with tooltips
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.month))
        .attr("y", d => y1(d.totalFines))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y1(d.totalFines))
        .attr("fill", "#4e79a7")
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            // Highlight the bar
            d3.select(this)
                .transition()
                .duration(100)
                .attr("fill", "#375a80");
            
            // Show tooltip
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
                
            tooltip.html(`<strong>${d.month}</strong><br>Total Fines: ${d.totalFines.toLocaleString()}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            // Restore bar color
            d3.select(this)
                .transition()
                .duration(100)
                .attr("fill", "#4e79a7");
                
            // Hide tooltip
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    // Add line for percentage change
    const line = d3.line()
        .x(d => x(d.month) + x.bandwidth() / 2)
        .y(d => y2(d.percentageChange || 0));
    
    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .attr("stroke", "#e15759")
        .attr("stroke-width", 2)
        .attr("fill", "none");
    
    // Add circles for data points on the line with tooltips
    svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.month) + x.bandwidth() / 2)
        .attr("cy", d => y2(d.percentageChange || 0))
        .attr("r", 4)
        .attr("fill", "#e15759")
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            // Enlarge the dot
            d3.select(this)
                .transition()
                .duration(100)
                .attr("r", 6)
                .attr("fill", "#c73a3c");
            
            // Format the percentage with the correct sign
            const formattedPct = d.percentageChange !== null 
                ? (d.percentageChange >= 0 ? '+' : '') + d.percentageChange.toFixed(2) + '%'
                : 'N/A';
            
            // Show tooltip
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
                
            tooltip.html(`<strong>${d.month}</strong><br>Month-over-Month Change: <span style="color: ${d.percentageChange >= 0 ? '#2ecc71' : '#e74c3c'}">${formattedPct}</span>`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            // Restore dot size and color
            d3.select(this)
                .transition()
                .duration(100)
                .attr("r", 4)
                .attr("fill", "#e15759");
                
            // Hide tooltip
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    // Add X axis
    const xAxis = svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
    
    // Rotate x-axis labels if needed
    xAxis.selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");
    
    // Add Y axis for total fines (left)
    svg.append("g")
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(y1).ticks(5).tickFormat(d3.format(",d")));
    
    // Add left Y axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 10)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .style("fill", "#4e79a7")
        .text("Total Fines");
    
    // Add Y axis for percentage change (right)
    svg.append("g")
        .attr("class", "axis y2-axis")
        .attr("transform", `translate(${width},0)`)
        .call(d3.axisRight(y2).ticks(5).tickFormat(d => `${d}%`));
    
    // Add right Y axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(90)")
        .attr("y", width + margin.right - 10)
        .attr("x", height / 2)
        .style("text-anchor", "middle")
        .style("fill", "#e15759")
        .text("Monthly Change (%)");
    
    // Add legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 180}, -20)`);
    
    // Total fines legend
    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", "#4e79a7");
    
    legend.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .style("font-size", "11px")
        .text("Total Fines");
    
    // Monthly change legend
    legend.append("line")
        .attr("x1", 100)
        .attr("y1", 6)
        .attr("x2", 130)
        .attr("y2", 6)
        .attr("stroke", "#e15759")
        .attr("stroke-width", 2);
    
    legend.append("text")
        .attr("x", 135)
        .attr("y", 10)
        .style("font-size", "11px")
        .style("fill", "#e15759")
        .text("Monthly Change");
};

// Function to update the monthly trend chart with transitions
window.updateMonthlyTrendChartWithTransition = function(newData) {
    try {
        console.log('Updating monthly trend chart with transitions...');
        
        // Get the container and SVG
        const container = d3.select("#monthly-trend-chart");
        const svg = container.select("svg").select("g");
        
        if (svg.empty()) {
            console.error("SVG not found for monthly trend chart, initializing instead");
            initMonthlyTrendChart();
            return;
        }
        
        // Get container dimensions
        const containerWidth = container.node().getBoundingClientRect().width;
        const containerHeight = 400; // Fixed height, same as in initialization
        
        // Set up margins
        const margin = {top: 20, right: 60, bottom: 60, left: 190};
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;
        
        // Update scales with new data
        const x = d3.scaleBand()
            .domain(newData.map(d => d.month))
            .range([0, width])
            .padding(0.2);
        
        const y1 = d3.scaleLinear()
            .domain([0, d3.max(newData, d => d.totalFines * 1.1)])
            .range([height, 0]);
        
        // Calculate domain for percentage change (add some padding)
        const minPct = Math.min(0, d3.min(newData, d => d.percentageChange || 0));
        const maxPct = d3.max(newData, d => d.percentageChange || 0);
        const pctPadding = (maxPct - minPct) * 0.2;
        
        const y2 = d3.scaleLinear()
            .domain([minPct - pctPadding, maxPct + pctPadding])
            .range([height, 0]);
        
        // Get tooltip
        const tooltip = d3.select("body").select(".tooltip");
        
        // Update x-axis with transition
        svg.select(".x-axis")
            .transition()
            .duration(750)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");
        
        // Update left y-axis with transition
        svg.select(".y-axis")
            .transition()
            .duration(750)
            .call(d3.axisLeft(y1).ticks(5).tickFormat(d => d3.format(",")(d)));
        
        // Update right y-axis with transition
        svg.select(".y2-axis")
            .transition()
            .duration(750)
            .call(d3.axisRight(y2).ticks(5).tickFormat(d => d3.format("+.1f")(d) + "%"));
        
        // Update bars with transition
        svg.selectAll(".bar")
            .data(newData)
            .join(
                enter => enter.append("rect")
                    .attr("class", "bar")
                    .attr("x", d => x(d.month))
                    .attr("y", height)
                    .attr("width", x.bandwidth())
                    .attr("height", 0)
                    .attr("fill", "#4e79a7")
                    .style("cursor", "pointer"),
                update => update,
                exit => exit.transition()
                    .duration(750)
                    .attr("y", height)
                    .attr("height", 0)
                    .remove()
            )
            .transition()
            .duration(750)
            .attr("x", d => x(d.month))
            .attr("y", d => y1(d.totalFines))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y1(d.totalFines))
            .attr("fill", "#4e79a7");
        
        // Update line for percentage change
        const line = d3.line()
            .x(d => x(d.month) + x.bandwidth() / 2)
            .y(d => y2(d.percentageChange || 0));
        
        svg.select(".line")
            .datum(newData)
            .transition()
            .duration(750)
            .attr("d", line);
        
        // Update circles for data points
        svg.selectAll(".dot")
            .data(newData)
            .join(
                enter => enter.append("circle")
                    .attr("class", "dot")
                    .attr("cx", d => x(d.month) + x.bandwidth() / 2)
                    .attr("cy", height)
                    .attr("r", 0)
                    .attr("fill", "#e15759")
                    .style("cursor", "pointer"),
                update => update,
                exit => exit.transition()
                    .duration(750)
                    .attr("r", 0)
                    .remove()
            )
            .transition()
            .duration(750)
            .attr("cx", d => x(d.month) + x.bandwidth() / 2)
            .attr("cy", d => y2(d.percentageChange || 0))
            .attr("r", 4)
            .attr("fill", "#e15759");
        
        // Update event handlers for bars
        svg.selectAll(".bar")
            .on("mouseover", function(event, d) {
                // Highlight the bar
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("fill", "#375a80");
                
                // Show tooltip
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                    
                tooltip.html(`<strong>${d.month}</strong><br>Total Fines: ${d.totalFines.toLocaleString()}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                // Restore bar color
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("fill", "#4e79a7");
                    
                // Hide tooltip
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        
        // Update event handlers for dots
        svg.selectAll(".dot")
            .on("mouseover", function(event, d) {
                // Enlarge the dot
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("r", 6)
                    .attr("fill", "#c73a3c");
                
                // Format the percentage with the correct sign
                const formattedPct = d.percentageChange !== null 
                    ? (d.percentageChange >= 0 ? '+' : '') + d.percentageChange.toFixed(2) + '%'
                    : 'N/A';
                
                // Show tooltip
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                    
                tooltip.html(`<strong>${d.month}</strong><br>Change: ${formattedPct}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                // Restore dot appearance
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("r", 4)
                    .attr("fill", "#e15759");
                
                // Hide tooltip
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
            
    } catch (error) {
        console.error("Error updating monthly trend chart with transitions:", error);
        // Fallback to full initialization if transition fails
        initMonthlyTrendChart();
    }
};