// Initialize function for jurisdiction chart
window.initJurisdictionChart = async function() {
    try {
        console.log('Initializing jurisdiction chart...');
        
        // Clear any existing content
        const container = d3.select("#jurisdiction-chart");
        container.html("");
        
        // Check if global dashboard data is available
        if (!window.dashboardData || !window.dashboardData.jurisdiction || window.dashboardData.jurisdiction.length === 0) {
            console.error("No jurisdiction data available in dashboardData");
            container.append("div")
                .attr("class", "error-message")
                .text("No jurisdiction data available");
            return;
        }

        const jurisdictionData = window.dashboardData.jurisdiction;
        console.log("Using jurisdiction data from dashboardData:", jurisdictionData);
        
        // Calculate total fines for percentage calculation
        const totalFines = jurisdictionData.reduce((sum, d) => sum + d.fines, 0);
        
        // Process the data into the format we need for the map
        const processedData = {};
        jurisdictionData.forEach(row => {
            processedData[row.jurisdiction] = {
                fines: row.fines,
                percentage: ((row.fines / totalFines) * 100).toFixed(1)
            };
        });
        
        console.log("Processed jurisdiction data for map:", processedData);
        
        const margin = { top: 20, right: 20, bottom: 20, left: 20 };
        const width = 800;
        const height = 600;

        const svg = container
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("background-color", "white");

        // Create a projection for Australia
        const projection = d3.geoMercator()
            .center([134, -28])
            .scale(width * 1.3)
            .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        // Load Australia GeoJSON data
        const geojson = await d3.json("https://raw.githubusercontent.com/rowanhogan/australian-states/master/states.geojson");
        console.log("Loaded GeoJSON:", geojson);

        if (!geojson || !geojson.features) {
            throw new Error("Invalid GeoJSON data");
        }

        // Create a color scale for the heatmap - using blues instead of reds
        const fineValues = Object.values(processedData).map(d => d.fines);
        const colorScale = d3.scaleSequential()
            .domain([0, d3.max(fineValues)])
            .interpolator(d3.interpolateBlues);

        // Create a group for the map
        const mapGroup = svg.append("g");
        
        // Create a div for the tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
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

        // Draw states with heatmap colors and add interactivity
        mapGroup.selectAll("path")
            .data(geojson.features)
            .join("path")
            .attr("d", path)
            .attr("fill", d => {
                const stateCode = getStateCode(d.properties.STATE_NAME);
                const stateData = processedData[stateCode];
                return stateData ? colorScale(stateData.fines) : "#ccc";
            })
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                const stateCode = getStateCode(d.properties.STATE_NAME);
                const stateData = processedData[stateCode];
                
                if (stateData) {
                    // Highlight the state
                    d3.select(this)
                        .attr("stroke", "#333")
                        .attr("stroke-width", 2);
                    
                    // Show tooltip
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    
                    tooltip.html(`
                        <strong>${stateCode}</strong><br/>
                        <strong>Fines:</strong> ${stateData.fines.toLocaleString()}<br/>
                        <strong>Percentage:</strong> ${stateData.percentage}%
                    `)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                }
            })
            .on("mouseout", function() {
                // Restore original appearance
                d3.select(this)
                    .attr("stroke", "white")
                    .attr("stroke-width", 1);
                
                // Hide tooltip
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Create a group for labels
        const labelGroup = svg.append("g");

        // Add labels and data
        labelGroup.selectAll("g")
            .data(geojson.features)
            .join("g")
            .attr("transform", d => {
                const centroid = path.centroid(d);
                const stateCode = getStateCode(d.properties.STATE_NAME);
                
                if (stateCode === "TAS") {
                    return `translate(${centroid[0] + 50}, ${centroid[1] - 20})`;
                }
                if (stateCode === "ACT") {
                    return `translate(${centroid[0] + 60}, ${centroid[1]})`;
                }
                return `translate(${centroid[0]}, ${centroid[1]})`;
            })
            .each(function(d) {
                const stateCode = getStateCode(d.properties.STATE_NAME);
                const stateData = processedData[stateCode];
                
                console.log("Adding label for:", stateCode, "Data:", stateData);

                if (!stateData) {
                    console.warn(`No data found for ${stateCode}`);
                    return;
                }

                const g = d3.select(this);
                
                // State name - changed from white to black text
                g.append("text")
                    .attr("text-anchor", "middle")
                    .attr("dy", "-1em")
                    .style("font-size", "16px")
                    .style("font-weight", "bold")
                    .style("fill", "black")
                    .text(stateCode);
                
                // Percentage - changed from white to black text
                g.append("text")
                    .attr("text-anchor", "middle")
                    .attr("dy", "1em")
                    .style("font-size", "20px")
                    .style("font-weight", "bold")
                    .style("fill", "black")
                    .text(stateData.percentage + "%");
                
                // Value in parentheses - changed from white to black text
                g.append("text")
                    .attr("text-anchor", "middle")
                    .attr("dy", "2.5em")
                    .style("font-size", "14px")
                    .style("fill", "black")
                    .text("(" + Math.round(stateData.fines/1000).toLocaleString() + "k)");
            });

        // Add connecting lines for TAS and ACT
        const addConnectingLine = (state, offset) => {
            const feature = geojson.features.find(f => getStateCode(f.properties.STATE_NAME) === state);
            if (!feature) return;
            
            const centroid = path.centroid(feature);
            const x1 = centroid[0];
            const y1 = centroid[1];
            const x2 = x1 + offset.x;
            const y2 = y1 + offset.y;

            svg.append("line")
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2)
                .attr("stroke", "#333")
                .attr("stroke-width", 1);
        };

        // Add connecting lines for Tasmania and ACT
        addConnectingLine("TAS", { x: 50, y: -20 });
        addConnectingLine("ACT", { x: 60, y: 0 });

        // Add a legend
        const legendWidth = 200;
        const legendHeight = 20;
        
        const legendScale = d3.scaleLinear()
            .domain([0, d3.max(fineValues)])
            .range([0, legendWidth]);

        const legendAxisScale = d3.scaleLinear()
            .domain([0, d3.max(fineValues)])
            .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendAxisScale)
            .ticks(5)
            .tickFormat(d => Math.round(d/1000) + "k");

        const legend = svg.append("g")
            .attr("transform", `translate(${width - legendWidth - 20}, ${height - 50})`);

        // Create gradient for legend
        const defs = svg.append("defs");
        const linearGradient = defs.append("linearGradient")
            .attr("id", "heatmap-gradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");

        // Add color stops
        const numStops = 10;
        for (let i = 0; i <= numStops; i++) {
            const offset = i / numStops;
            const value = d3.max(fineValues) * offset;
            linearGradient.append("stop")
                .attr("offset", `${offset * 100}%`)
                .attr("stop-color", colorScale(value));
        }

        // Draw legend rectangle
        legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#heatmap-gradient)");

        // Add legend axis
        legend.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(legendAxis);

        // Add legend title - changed from white to black text
        legend.append("text")
            .attr("x", 0)
            .attr("y", -5)
            .style("font-size", "12px")
            .style("fill", "black")
            .text("Number of Fines");

    } catch (error) {
        console.error("Error creating jurisdiction visualization:", error);
        // Display error message in the chart container
        d3.select("#jurisdiction-chart")
            .html("<div style='color: red; text-align: center; padding: 20px;'>Error loading jurisdiction data</div>");
    }
}

// Helper function to convert state names to codes
// Initialize the chart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking for jurisdiction data...');
    if (window.dashboardData && window.dashboardData.jurisdiction) {
        // Initialize the chart if data is already loaded
        initJurisdictionChart();
    } else {
        console.log('Waiting for data to be loaded before initializing jurisdiction chart');
        // Add the chart initialization to the dashboard init process
        const originalInitDashboard = window.initDashboard || function() {};
        window.initDashboard = function() {
            originalInitDashboard();
            if (window.dashboardData && window.dashboardData.jurisdiction) {
                setTimeout(initJurisdictionChart, 100); // Slight delay to ensure DOM is ready
            }
        };
    }
});

function getStateCode(stateName) {
    const stateMapping = {
        "New South Wales": "NSW",
        "Victoria": "VIC",
        "Queensland": "QLD",
        "Western Australia": "WA",
        "South Australia": "SA",
        "Tasmania": "TAS",
        "Northern Territory": "NT",
        "Australian Capital Territory": "ACT"
    };
    return stateMapping[stateName] || stateName;
}
