// Age Groups Bar Chart - Road Safety Dashboard - Team 8

// Initialize function for age group chart
window.initAgeGroupChart = function() {
    try {
        console.log('Initializing age group chart...');

        // Clear any existing content
        const container = d3.select("#age-groups-chart");
        container.html("");
        
        // Check if global dashboard data is available
        if (!window.dashboardData || !window.dashboardData.ageGroup || window.dashboardData.ageGroup.length === 0) {
            console.error("No age group data available in dashboardData");
            container.append("div")
                .attr("class", "error-message")
                .text("No age group data available");
            return;
        }
        d3.selectAll(".age-group-tooltip").remove();

        const ageGroupData = window.dashboardData.ageGroup;
        console.log("Using age group data from dashboardData:", ageGroupData);
        
        const containerDiv = container.node();
        const width = containerDiv.clientWidth;
        const height = containerDiv.clientHeight || 400;

        const margin = { top: 30, right: 80, bottom: 60, left: 100 };

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = container.append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");
            
        // Create tooltip div
        const tooltip = d3.select("body").append("div")
            .attr("class", "age-group-tooltip")
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

        // Add a title to the chart
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("FINES BY AGE GROUP");
            
        const x = d3.scaleBand()
            .domain(ageGroupData.map(d => d.ageGroup))
            .range([margin.left, width - margin.right])
            .padding(0.4);

        const y = d3.scaleLinear()
            .domain([0, d3.max(ageGroupData, d => d.fines) * 1.1])
            .range([height - margin.bottom, margin.top]);

        // Create custom ticks for y-axis
        const maxFines = d3.max(ageGroupData, d => d.fines);
        const tickInterval = Math.ceil(maxFines / 5 / 100000) * 100000;
        const yTicks = [];
        for (let i = 0; i <= maxFines * 1.1; i += tickInterval) {
            yTicks.push(i);
        }

        const colors = ["#20c7da", "#ffa726", "#ffa4ce", "#9a57c2"];
        const color = d3.scaleOrdinal()
            .domain(ageGroupData.map(d => d.ageGroup))
            .range(colors);

    // Gridlines
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y)
            .tickValues(yTicks)
            .tickSize(-innerWidth)
            .tickFormat("")
        )
        .call(g => g.select(".domain").remove())
        .selectAll("line")
        .attr("stroke", "#e0e0e0")
        .attr("stroke-dasharray", "2,2");

        // Gridlines
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y)
                .tickValues(yTicks)
                .tickSize(-innerWidth)
                .tickFormat("")
            )
            .call(g => g.select(".domain").remove())
            .selectAll("line")
            .attr("stroke", "#e0e0e0")
            .attr("stroke-dasharray", "2,2");

        // Bars with interactivity
        svg.selectAll("rect.bar")
            .data(ageGroupData)
            .join("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.ageGroup))
            .attr("y", d => y(d.fines))
            .attr("width", x.bandwidth())
            .attr("height", d => height - margin.bottom - y(d.fines))
            .attr("fill", d => color(d.ageGroup))
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
                    <strong>${d.ageGroup}</strong><br/>
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

        // X Axis
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("font-size", "12px");

        // Y Axis with custom ticks
        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y)
                .tickValues(yTicks)
                .tickFormat(d => d3.format(",")(d)))
            .selectAll("text")
            .style("font-size", "12px");

        // X Axis Label
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 5)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text("Age Group");

        // Y Axis Label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text("Number of Fines");
            
        // Add value labels on top of bars
        svg.selectAll(".value-label")
            .data(ageGroupData)
            .join("text")
            .attr("class", "value-label")
            .attr("x", d => x(d.ageGroup) + x.bandwidth() / 2)
            .attr("y", d => y(d.fines) - 5)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#333")
            .text(d => d3.format(",")(d.fines));
            
    } catch (error) {
        console.error("Error creating age group visualization:", error);
        // Display error message in the chart container
        d3.select("#age-groups-chart")
            .html("<div style='color: red; text-align: center; padding: 20px;'>Error loading age group data</div>");
    }
};

// Function to update the age group chart with transitions
window.updateAgeGroupChartWithTransition = function(newData) {
    try {
        console.log('Updating age group chart with transitions...');
        
        // Get the container and SVG
        const container = d3.select("#age-groups-chart");
        const svg = container.select("svg");
        
        if (svg.empty()) {
            console.error("SVG not found for age group chart, initializing instead");
            initAgeGroupChart();
            return;
        }
        
        // Get the dimensions
        const containerDiv = container.node();
        const width = containerDiv.clientWidth;
        const height = containerDiv.clientHeight || 400;
        const margin = { top: 30, right: 80, bottom: 60, left: 100 };
        
        // Update scales with new data
        const x = d3.scaleBand()
            .domain(newData.map(d => d.ageGroup))
            .range([margin.left, width - margin.right])
            .padding(0.4);
            
        const y = d3.scaleLinear()
            .domain([0, d3.max(newData, d => d.fines) * 1.1])
            .range([height - margin.bottom, margin.top]);
            
        // Create custom ticks for y-axis
        const maxFines = d3.max(newData, d => d.fines);
        const tickInterval = Math.ceil(maxFines / 5 / 100000) * 100000;
        const yTicks = [];
        for (let i = 0; i <= maxFines * 1.1; i += tickInterval) {
            yTicks.push(i);
        }
        
        const colors = ["#20c7da", "#ffa726", "#ffa4ce", "#9a57c2"];
        const color = d3.scaleOrdinal()
            .domain(newData.map(d => d.ageGroup))
            .range(colors);
            
        // Update y-axis with transition
        svg.select("g.y-axis")
            .transition()
            .duration(750)
            .call(d3.axisLeft(y)
                .tickValues(yTicks)
                .tickFormat(d => d3.format(",")(d)));
                
        // Update grid lines with transition
        svg.select("g.grid")
            .transition()
            .duration(750)
            .call(d3.axisLeft(y)
                .tickValues(yTicks)
                .tickSize(-width + margin.left + margin.right)
                .tickFormat(""))
            .call(g => g.select(".domain").remove())
            .selectAll("line")
            .attr("stroke", "#e0e0e0")
            .attr("stroke-dasharray", "2,2");
            
        // Update bars with transition
        svg.selectAll("rect.bar")
            .data(newData)
            .join(
                enter => enter.append("rect")
                    .attr("class", "bar")
                    .attr("x", d => x(d.ageGroup))
                    .attr("y", height - margin.bottom)
                    .attr("width", x.bandwidth())
                    .attr("height", 0)
                    .attr("fill", d => color(d.ageGroup))
                    .style("cursor", "pointer"),
                update => update,
                exit => exit.transition()
                    .duration(750)
                    .attr("y", height - margin.bottom)
                    .attr("height", 0)
                    .remove()
            )
            .transition()
            .duration(750)
            .attr("x", d => x(d.ageGroup))
            .attr("y", d => y(d.fines))
            .attr("width", x.bandwidth())
            .attr("height", d => height - margin.bottom - y(d.fines))
            .attr("fill", d => color(d.ageGroup));
            
        // Update value labels with transition
        svg.selectAll(".value-label")
            .data(newData)
            .join(
                enter => enter.append("text")
                    .attr("class", "value-label")
                    .attr("x", d => x(d.ageGroup) + x.bandwidth() / 2)
                    .attr("y", height - margin.bottom)
                    .attr("text-anchor", "middle")
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
            .attr("x", d => x(d.ageGroup) + x.bandwidth() / 2)
            .attr("y", d => y(d.fines) - 5)
            .style("opacity", 1)
            .text(d => d3.format(",")(d.fines));
            
        // Update tooltip behavior
        const tooltip = d3.select("body").select(".age-group-tooltip");
        
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
                    <strong>${d.ageGroup}</strong><br/>
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
        console.error("Error updating age group chart with transitions:", error);
        // Fallback to full initialization if transition fails
        initAgeGroupChart();
    }
};

// Initialize the chart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking for age group data...');
    if (window.dashboardData && window.dashboardData.ageGroup) {
        // Initialize the chart if data is already loaded
        initAgeGroupChart();
    } else {
        console.log('Waiting for data to be loaded before initializing age group chart');
        // Add the chart initialization to the dashboard init process
        const originalInitDashboard = window.initDashboard || function() {};
        window.initDashboard = function() {
            originalInitDashboard();
            if (window.dashboardData && window.dashboardData.ageGroup) {
                setTimeout(initAgeGroupChart, 100); // Slight delay to ensure DOM is ready
            }
        };
    }
});
