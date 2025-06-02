// Detection Method Pie Chart - Road Safety Dashboard - Team 8

// Initialize function for detection method chart
window.initDetectionMethodChart = function() {
    try {
        console.log('Initializing detection method chart...');

        // Clear any existing content
        const container = d3.select("#detection-method-chart");
        container.html("");
        
        // Check if global dashboard data is available
        if (!window.dashboardData || !window.dashboardData.detectionMethod || window.dashboardData.detectionMethod.length === 0) {
            console.error("No detection method data available in dashboardData");
            container.append("div")
                .attr("class", "error-message")
                .text("No detection method data available");
            return;
        }
        d3.selectAll(".detection-method-tooltip").remove();

        const detectionMethodData = window.dashboardData.detectionMethod;
        console.log("Using detection method data from dashboardData:", detectionMethodData);
        
        const boundingRect = container.node().getBoundingClientRect();
        // Make the chart smaller to fit the container better
        const width = Math.min(boundingRect.width, 300); // Limit max width
        const height = Math.min(width, 300); // Keep it square but limited
        const margin = 30; // Increase margin
        const radius = Math.min(width, height) / 2 - margin;
        
        // Calculate total count for percentage calculation
        const totalCount = detectionMethodData.reduce((sum, d) => sum + d.count, 0);
        
        // Prepare data with percentages
        const dataWithPercentage = detectionMethodData.map(d => {
            return {
                detection_method: d.method,
                count: d.count,
                percentage: ((d.count / totalCount) * 100).toFixed(1)
            };
        });
        
        console.log("Detection method data with percentages:", dataWithPercentage);
        
        const svg = container
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%")
            .style("height", "auto")
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);
            
        // Add a title to the chart
        container.select("svg")
            .append("text")
            .attr("x", width / 2)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("DETECTION METHODS");
            
        // Create tooltip div
        const tooltip = d3.select("body").append("div")
            .attr("class", "detection-method-tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "#f9f9f9")
            .style("border", "1px solid #d3d3d3")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("pointer-events", "none")
            .style("font-family", "Arial, sans-serif")
            .style("font-size", "14px")
            .style("color", "#000000")
            .style("box-shadow", "0 4px 8px rgba(0,0,0,0.1)");

        // Color scale
        const color = d3.scaleOrdinal()
            .domain(["Police issued", "Fixed camera systems", "Mobile camera", "Fixed or mobile camera", "Other"])
            .range(["#ffd08e", "rgb(168,166,243)", "#ffa4ce", "#9a57c2", "rgb(32,199,218)"]);

        // Pie layout
        const pie = d3.pie()
            .value(d => d.percentage)
            .sort(null);

        const data_ready = pie(dataWithPercentage);

        // Arc generator
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);


        // Outer arc for labels - reduced distance for smaller chart
        const outerArc = d3.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9);

        // Pie slices with interactivity
        svg.selectAll('path')
            .data(data_ready)
            .join('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.detection_method))
            .style('stroke-width', '2px')
            .style('stroke', 'white')
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                // Highlight the slice
                d3.select(this)
                    .style('stroke', '#333')
                    .style('stroke-width', '3px');
                
                // Show tooltip
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                
                tooltip.html(`
                    <strong>${d.data.detection_method}</strong><br/>
                    <strong>Count:</strong> ${d.data.count.toLocaleString()}<br/>
                    <strong>Percentage:</strong> ${d.data.percentage}%
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on('mouseout', function() {
                // Restore original appearance
                d3.select(this)
                    .style('stroke', 'white')
                    .style('stroke-width', '2px');
                
                // Hide tooltip
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Process slices to handle potential overlap
        // Sort slices so smaller ones get special treatment
        const sortedSlices = [...data_ready].sort((a, b) => a.data.percentage - b.data.percentage);
        
        // Identify the smallest slices (those with percentage < 5%)
        const smallSlices = sortedSlices.filter(d => parseFloat(d.data.percentage) < 5);
        
        // Calculate positions for avoiding overlap
        const labelPositions = {};
        data_ready.forEach(d => {
            const slice = d.data.detection_method;
            const angle = midAngle(d);
            const isSmallSlice = parseFloat(d.data.percentage) < 5;
            
            const pos = outerArc.centroid(d);
            
            // For small slices, position differently
            if (isSmallSlice) {
                // Move labels farther out for small slices
                pos[0] = (angle < Math.PI ? 1 : -1) * (radius + 35);
                
                // Adjust vertical position to avoid overlap
                const smallSliceIndex = smallSlices.findIndex(s => s.data.detection_method === slice);
                if (smallSliceIndex > 0) {
                    // Add vertical offset for successive small slices
                    pos[1] += (smallSliceIndex * 15);
                }
            } else {
                // Regular positioning for larger slices
                pos[0] = (angle < Math.PI ? 1 : -1) * (radius + 25);
            }
            
            labelPositions[slice] = pos;
        });
        
        // Polylines with adjusted endpoints to match label positions
        svg.selectAll('polyline')
            .data(data_ready)
            .join('polyline')
            .attr('stroke', 'black')
            .style('fill', 'none')
            .style('stroke-width', '0.8px') // Thinner lines
            .attr('points', d => {
                const posA = arc.centroid(d);
                const posB = outerArc.centroid(d);
                const posC = labelPositions[d.data.detection_method].slice(0); // Use the same position as the label
                
                // Adjust the endpoint to be just before the text
                posC[0] = midAngle(d) < Math.PI ? posC[0] - 5 : posC[0] + 5;
                
                return [posA, posB, posC];
            });
        
        // Labels with adjusted positioning to avoid overlap
        svg.selectAll('text.slice-label')
            .data(data_ready)
            .join('text')
            .attr('class', 'slice-label')
            .attr('transform', d => {
                const pos = labelPositions[d.data.detection_method];
                return `translate(${pos})`;
            })
            .style('text-anchor', d => midAngle(d) < Math.PI ? 'start' : 'end')
            .style('font-size', `${width * 0.04}px`) // Slightly smaller text
            .style('font-family', 'Arial')
            .selectAll('tspan')
            .data(d => [
                { text: d.data.detection_method, dy: '0em' },
                { text: d.data.percentage + '%', dy: '1.2em' }
            ])
            .join('tspan')
            .text(d => d.text)
            .attr('x', 0)
            .attr('dy', d => d.dy);

        // Mid-angle helper
        function midAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }
            
    } catch (error) {
        console.error("Error creating detection method visualization:", error);
        // Display error message in the chart container
        d3.select("#detection-method-chart")
            .html("<div style='color: red; text-align: center; padding: 20px;'>Error loading detection method data</div>");
    }
};

// Initialize the chart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking for detection method data...');
    if (window.dashboardData && window.dashboardData.detectionMethod) {
        // Initialize the chart if data is already loaded
        initDetectionMethodChart();
    } else {
        console.log('Waiting for data to be loaded before initializing detection method chart');
        // Add the chart initialization to the dashboard init process
        const originalInitDashboard = window.initDashboard || function() {};
        window.initDashboard = function() {
            originalInitDashboard();
            if (window.dashboardData && window.dashboardData.detectionMethod) {
                setTimeout(initDetectionMethodChart, 100); // Slight delay to ensure DOM is ready
            }
        };
    }
});
