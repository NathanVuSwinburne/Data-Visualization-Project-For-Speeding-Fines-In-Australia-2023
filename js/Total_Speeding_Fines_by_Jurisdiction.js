// Jurisdiction Horizontal Bar Chart - Road Safety Dashboard - Team 8

// Function to create the jurisdiction horizontal bar chart
function createJurisdictionChart(data = window.dashboardData.jurisdictions) {
    // Sort data by fines descending
    data = [...data].sort((a, b) => b.fines - a.fines);
    
    // Clear previous chart
    d3.select('#jurisdiction-chart').html('');
    
    // If no data, show message
    if (data.length === 0) {
        d3.select('#jurisdiction-chart')
            .append('div')
            .attr('class', 'no-data-message')
            .text('No data available for the selected filters');
        return;
    }
    
    // Set dimensions and margins
    const margin = {top: 30, right: 50, bottom: 40, left: 70};
    const width = document.getElementById('jurisdiction-chart').clientWidth - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select('#jurisdiction-chart')
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
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.fines) * 1.1])
        .range([0, width]);
    
    // Y scale
    const y = d3.scaleBand()
        .domain(data.map(d => d.jurisdiction))
        .range([0, height])
        .padding(0.2);
    
    // Add X axis
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => formatNumber(d)));
    
    // Add X axis title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 35)
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .text('Number of Fines');
    
    // Add Y axis
    svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y));
    
    // Add bars
    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'jurisdiction-bar bar')
        .attr('y', d => y(d.jurisdiction))
        .attr('height', y.bandwidth())
        .attr('x', 0)
        .attr('width', d => x(d.fines))
        .on("mouseover", function(event, d) {
            window.tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            window.tooltip.html(`${d.jurisdiction}: ${d.fines.toLocaleString()} fines`)
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
        .attr('x', d => x(d.fines) + 5) // Position label to the right of the bar
        .attr('y', d => y(d.jurisdiction) + y.bandwidth() / 2)
        .attr('dy', '0.35em') // Center vertically
        .text(d => formatNumber(d.fines))
        .attr('fill', '#333');
}

// Export the function to the global scope
window.createJurisdictionChart = createJurisdictionChart; 