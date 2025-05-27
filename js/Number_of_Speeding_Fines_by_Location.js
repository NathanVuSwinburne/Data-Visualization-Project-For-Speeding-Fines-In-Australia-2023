// Location Bar Chart - Road Safety Dashboard - Team 8

// Function to create the location bar chart
function createLocationChart(data = window.dashboardData.locations) {
    data = [...data].sort((a, b) => b.fines - a.fines);
    
    // Clear previous chart
    d3.select('#location-chart').html('');
    
    // If no data, show message
    if (data.length === 0) {
        d3.select('#location-chart')
            .append('div')
            .attr('class', 'no-data-message')
            .text('No data available for the selected filters');
        return;
    }
    
    // Set dimensions and margins
    const margin = {top: 30, right: 30, bottom: 40, left: 60};
    const width = document.getElementById('location-chart').clientWidth - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select('#location-chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // X scale
    const x = d3.scaleBand()
        .domain(data.map(d => d.location))
        .range([0, width])
        .padding(0.2);
    
    // Y scale
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.fines) * 1.1])
        .range([height, 0]);
    
    // Format number for display
    const formatNumber = num => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num;
    };
    
    // Add X axis
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));
    
    // Add Y axis with formatted numbers
    svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y).tickFormat(d => formatNumber(d)));
    
    // Add Y axis title
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -height / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .text('Number of Fines');
    
    // Add bars
    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'location-bar bar')
        .attr('x', d => x(d.location))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d.fines))
        .attr('height', d => height - y(d.fines))
        .on("mouseover", function(event, d) {
            window.tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            window.tooltip.html(`${d.location}: ${d.fines.toLocaleString()} fines`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            window.tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    // Add data labels
    svg.selectAll('.data-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'data-label')
        .attr('x', d => x(d.location) + x.bandwidth() / 2)
        .attr('y', d => y(d.fines) - 5)
        .text(d => formatNumber(d.fines))
        .attr('text-anchor', 'middle')
        .attr('fill', '#333');
}

// Export the function to the global scope
window.createLocationChart = createLocationChart; 