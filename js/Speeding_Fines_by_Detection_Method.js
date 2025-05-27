// Detection Method Pie Chart - Road Safety Dashboard - Team 8

// Function to create the detection method pie chart
function createDetectionMethodChart(data = window.dashboardData.detectionMethods) {
    data = [...data];
    
    // Clear previous chart
    d3.select('#detection-method-chart').html('');
    
    // If no data, show message
    if (data.length === 0) {
        d3.select('#detection-method-chart')
            .append('div')
            .attr('class', 'no-data-message')
            .text('No data available for the selected filters');
        return;
    }
    
    // Set dimensions
    const width = document.getElementById('detection-method-chart').clientWidth;
    const height = 250;
    const radius = Math.min(width, height) / 2.5 - 20;
    
    // Create SVG container
    const svg = d3.select('#detection-method-chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create pie chart group centered in the SVG
    const pieGroup = svg.append('g')
        .attr('transform', `translate(${width/2 - 30},${height/2 - 10})`);
    
    // Set colors from our CSS variables
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.method))
        .range([
            getComputedStyle(document.documentElement).getPropertyValue('--chart-color3').trim(), // Blue
            getComputedStyle(document.documentElement).getPropertyValue('--chart-color4').trim(), // Orange 
            getComputedStyle(document.documentElement).getPropertyValue('--chart-color5').trim(), // Green
            getComputedStyle(document.documentElement).getPropertyValue('--chart-color2').trim(), // Red
            getComputedStyle(document.documentElement).getPropertyValue('--chart-color6').trim(), // Pink
            getComputedStyle(document.documentElement).getPropertyValue('--chart-color7').trim()  // Gray
        ]);
    
    // Compute pie data
    const pie = d3.pie()
        .value(d => d.fines)
        .sort(null);
    
    const pieData = pie(data);
    
    // Build arcs
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);
    
    // Add pie segments
    const segments = pieGroup.selectAll('.arc')
        .data(pieData)
        .enter()
        .append('g')
        .attr('class', 'arc');
    
    segments.append('path')
        .attr('d', arc)
        .attr('class', 'pie-slice')
        .attr('fill', d => color(d.data.method))
        .on("mouseover", function(event, d) {
            window.tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            const percentage = ((d.data.fines / d3.sum(data, d => d.fines)) * 100).toFixed(1);
            window.tooltip.html(`${d.data.method}: ${d.data.fines.toLocaleString()} fines (${percentage}%)`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            window.tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    // Add percentage labels
    segments.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text(d => {
            const percentage = ((d.data.fines / d3.sum(data, d => d.fines)) * 100).toFixed(1);
            return percentage >= 5 ? `${percentage}%` : ''; // Only show if segment is large enough
        });
    
    // Create a new legend container positioned properly
    const legendContainer = svg.append('g')
        .attr('transform', `translate(${width - 100}, 20)`);
    
    // Calculate total fines for percentage display
    const totalFines = d3.sum(data, d => d.fines);
    
    // Add a legend at the right side
    const legend = legendContainer.selectAll('.legend-item')
        .data(pieData)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 20})`);
    
    legend.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('class', 'legend-color')
        .attr('fill', d => color(d.data.method));
    
    legend.append('text')
        .attr('x', 18)
        .attr('y', 9)
        .attr('fill', '#333')
        .attr('font-size', '11px')
        .text(d => {
            const percentage = ((d.data.fines / totalFines) * 100).toFixed(1);
            // Format method name - don't truncate but ensure proper display
            return `${d.data.method} (${percentage}%)`;
        });
}

// Export the function to the global scope
window.createDetectionMethodChart = createDetectionMethodChart; 