// Monthly Trend Line Chart - Road Safety Dashboard - Team 8

// Function to create the monthly trend line chart
function createMonthlyTrendChart(data = window.dashboardData.monthlyTrend) {
    // Clone to avoid modifying original
    data = [...data];
    
    // Sort months in chronological order
    const monthOrder = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    data.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
    
    // Clear previous chart
    d3.select('#monthly-trend-chart').html('');
    
    // If no data, show message
    if (data.length === 0) {
        d3.select('#monthly-trend-chart')
            .append('div')
            .attr('class', 'no-data-message')
            .text('No data available for the selected filters');
        return;
    }
    
    // Set dimensions and margins
    const margin = {top: 30, right: 30, bottom: 50, left: 60};
    const width = document.getElementById('monthly-trend-chart').clientWidth - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select('#monthly-trend-chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Format number for display
    const formatNumber = num => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num;
    };
    
    // X scale
    const x = d3.scaleBand()
        .domain(data.map(d => d.month))
        .range([0, width])
        .padding(0.1);
    
    // Y scale
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.fines) * 1.1])
        .range([height, 0]);
    
    // Add X axis
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "10px");
    
    // Add Y axis
    svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y).ticks(8).tickFormat(d => formatNumber(d)));
        
    // Add Y axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .text('Number of Fines');
    
    // Add line
    const line = d3.line()
        .x(d => x(d.month) + x.bandwidth()/2)
        .y(d => y(d.fines))
        .curve(d3.curveMonotoneX);
    
    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim())
        .attr("stroke-width", 2.5)
        .attr("d", line);
    
    // Add circles for data points
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.month) + x.bandwidth()/2)
        .attr("cy", d => y(d.fines))
        .attr("r", 5)
        .attr("fill", getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim())
        .on("mouseover", function(event, d) {
            // Enlarge the circle on hover
            d3.select(this).attr("r", 7);
            
            window.tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            window.tooltip.html(`${d.month}: ${d.fines.toLocaleString()} fines`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            // Restore normal size
            d3.select(this).attr("r", 5);
            
            window.tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    // Add data value labels at peak points
    svg.selectAll(".peak-label")
        .data(data)
        .enter()
        .filter(d => d.fines === d3.max(data, d => d.fines)) // Only label the peak value
        .append("text")
        .attr("class", "data-label")
        .attr("x", d => x(d.month) + x.bandwidth()/2)
        .attr("y", d => y(d.fines) - 15)
        .text(d => formatNumber(d.fines))
        .attr("text-anchor", "middle")
        .attr("fill", "#333")
        .style("font-weight", "bold");
}

// Export the function to the global scope
window.createMonthlyTrendChart = createMonthlyTrendChart; 