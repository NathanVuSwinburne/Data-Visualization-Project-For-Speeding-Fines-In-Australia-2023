// Location Bar Chart - Road Safety Dashboard - Team 8
// Initialize function for location chart
window.initLocationChart = function() {
    try {
        console.log('Initializing location chart...');

        // Clear any existing content
        const container = d3.select("#location-chart");
        container.html("");
        
        // Check if global dashboard data is available
        if (!window.dashboardData || !window.dashboardData.location || window.dashboardData.location.length === 0) {
            console.error("No location data available in dashboardData");
            container.append("div")
                .attr("class", "error-message")
                .text("No location data available");
            return;
        }

        const locationData = window.dashboardData.location;
        console.log("Using location data from dashboardData:", locationData);
        
        const containerDiv = container.node();
        const width = containerDiv.clientWidth * 1.3;
        const height = containerDiv.clientHeight || 400;
        const margin = { top: 30, right: 60, bottom: 30, left: 68 }; // Reduced left margin

        const svg = container
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");
            
        // Create tooltip div
        const tooltip = d3.select("body").append("div")
            .attr("class", "location-tooltip")
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

        const x = d3.scaleLinear()
            .domain([0, d3.max(locationData, d => d.fines) * 1.1])
            .range([margin.left, width - margin.right]);

        const y = d3.scaleBand()
            .domain(locationData.map(d => d.location))
            .range([margin.top, height - margin.bottom])
            .padding(0.04);

        const color = d3.scaleOrdinal()
            .domain(["Urban", "Regional", "Remote"])
            .range(["#20c7da", "#74beed", "#448aff"]);

        // Add a title to the chart
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("FINES BY LOCATION");

        // X-axis
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x)
                .ticks(5)
                .tickFormat(d => d3.format(",")(d)))
            .selectAll("text")
            .style("font-size", "12px");

        // Y-axis
        svg.append("g")
            .attr("class", "y-axis location-y-axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove())
            .selectAll("text")
            .style("font-size", "14px");

        // Bars with interactivity
        svg.selectAll("rect.bar")
            .data(locationData)
            .join("rect")
            .attr("class", "bar")
            .attr("x", margin.left)
            .attr("y", d => y(d.location))
            .attr("width", d => x(d.fines) - margin.left)
            .attr("height", y.bandwidth())
            .attr("fill", d => color(d.location))
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                // Highlight the bar
                d3.select(this)
                    .attr("stroke", "#333")
                    .attr("stroke-width", 2);
                
                // Show tooltip
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                
                tooltip.html(`
                    <strong>${d.location}</strong><br/>
                    <strong>Fines:</strong> ${d.fines.toLocaleString()}
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                // Restore original appearance
                d3.select(this)
                    .attr("stroke", "none");
                
                // Hide tooltip
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Value labels
        svg.selectAll("text.value-label")
            .data(locationData)
            .join("text")
            .attr("class", "value-label")
            .attr("x", d => x(d.fines) + 5)
            .attr("y", d => y(d.location) + y.bandwidth() / 2)
            .attr("dy", ".35em")
            .style("font-size", "12px")
            .style("fill", "#333")
            .text(d => d3.format(",")(d.fines));
            
    } catch (error) {
        console.error("Error creating location visualization:", error);
        // Display error message in the chart container
        d3.select("#location-chart")
            .html("<div style='color: red; text-align: center; padding: 20px;'>Error loading location data</div>");
    }
};

// Function to update the location chart with transitions
window.updateLocationChartWithTransition = function(newData) {
    try {
        console.log('Updating location chart with transitions...');
        
        // Get the container and SVG
        const container = d3.select("#location-chart");
        const svg = container.select("svg");
        
        if (svg.empty()) {
            console.error("SVG not found for location chart, initializing instead");
            initLocationChart();
            return;
        }
        
        // Get the dimensions
        const containerDiv = container.node();
        const width = containerDiv.clientWidth * 1.3;
        const height = containerDiv.clientHeight || 400;
        const margin = { top: 30, right: 60, bottom: 30, left: 68 }; // Reduced left margin
        
        // Update scales with new data
        const x = d3.scaleLinear()
            .domain([0, d3.max(newData, d => d.fines) * 1.1])
            .range([margin.left, width - margin.right]);
            
        const y = d3.scaleBand()
            .domain(newData.map(d => d.location))
            .range([margin.top, height - margin.bottom])
            .padding(0.04);
            
        const color = d3.scaleOrdinal()
            .domain(["Urban", "Regional", "Remote"])
            .range(["#20c7da", "#74beed", "#448aff"]);
            
        // Update x-axis with transition
        svg.select("g.x-axis")
            .transition()
            .duration(750)
            .call(d3.axisBottom(x)
                .ticks(5)
                .tickFormat(d => d3.format(",")(d)))
            .selectAll("text")
            .style("font-size", "12px");
                
        // Update y-axis with transition
        svg.select("g.location-y-axis")
            .transition()
            .duration(750)
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove());
            
        // Update bars with transition
        svg.selectAll("rect.bar")
            .data(newData)
            .join(
                enter => enter.append("rect")
                    .attr("class", "bar")
                    .attr("x", margin.left)
                    .attr("y", d => y(d.location))
                    .attr("width", 0)
                    .attr("height", y.bandwidth())
                    .attr("fill", d => color(d.location))
                    .style("cursor", "pointer"),
                update => update,
                exit => exit.transition()
                    .duration(750)
                    .attr("width", 0)
                    .remove()
            )
            .transition()
            .duration(750)
            .attr("x", margin.left)
            .attr("y", d => y(d.location))
            .attr("width", d => x(d.fines) - margin.left)
            .attr("height", y.bandwidth())
            .attr("fill", d => color(d.location));
            
        // Update value labels with transition
        svg.selectAll("text.value-label")
            .data(newData)
            .join(
                enter => enter.append("text")
                    .attr("class", "value-label")
                    .attr("x", margin.left)
                    .attr("y", d => y(d.location) + y.bandwidth() / 2)
                    .attr("dy", ".35em")
                    .style("font-size", "12px")
                    .style("fill", "#333")
                    .style("opacity", 0),
                update => update,
                exit => exit.transition()
                    .duration(750)
                    .style("opacity", 0)
                    .remove()
            )
            .transition()
            .duration(750)
            .attr("x", d => x(d.fines) + 5)
            .attr("y", d => y(d.location) + y.bandwidth() / 2)
            .style("opacity", 1)
            .text(d => d3.format(",")(d.fines));
            
        // Update tooltip behavior
        const tooltip = d3.select("body").select(".location-tooltip");
        
        svg.selectAll("rect.bar")
            .on("mouseover", function(event, d) {
                // Highlight the bar
                d3.select(this)
                    .attr("stroke", "#333")
                    .attr("stroke-width", 2);
                
                // Show tooltip
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                
                tooltip.html(`
                    <strong>${d.location}</strong><br/>
                    <strong>Fines:</strong> ${d.fines.toLocaleString()}
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                // Restore original appearance
                d3.select(this)
                    .attr("stroke", "none");
                
                // Hide tooltip
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
            
    } catch (error) {
        console.error("Error updating location chart with transitions:", error);
        // Fallback to full initialization if transition fails
        initLocationChart();
    }
};

// Initialize the chart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking for location data...');
    if (window.dashboardData && window.dashboardData.location) {
        // Initialize the chart if data is already loaded
        initLocationChart();
    } else {
        console.log('Waiting for data to be loaded before initializing location chart');
        // Add the chart initialization to the dashboard init process
        const originalInitDashboard = window.initDashboard || function() {};
        window.initDashboard = function() {
            originalInitDashboard();
            if (window.dashboardData && window.dashboardData.location) {
                setTimeout(initLocationChart, 100); // Slight delay to ensure DOM is ready
            }
        };
    }
});
