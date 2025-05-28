document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Clear any existing content
        const container = d3.select("#jurisdiction-chart");
        container.html("");
        
        // Load the data
        const data = await loadData();
        console.log("Loaded data for jurisdiction chart:", data);
        
        if (!data || !data.jurisdictionData || data.jurisdictionData.length === 0) {
            throw new Error("No jurisdiction data available");
        }

        // Process the data into the format we need
        const processedData = {};
        data.jurisdictionData.forEach(row => {
            processedData[row.Jurisdiction] = {
                fines: parseInt(row.Fines),
                percentage: parseFloat(row.Percentage)
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

        // Create a color scale for the heatmap
        const fineValues = Object.values(processedData).map(d => d.fines);
        const colorScale = d3.scaleSequential()
            .domain([0, d3.max(fineValues)])
            .interpolator(d3.interpolateReds);

        // Create a group for the map
        const mapGroup = svg.append("g");

        // Draw states with heatmap colors
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
            .attr("stroke-width", 1);

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
                
                // State name
                g.append("text")
                    .attr("text-anchor", "middle")
                    .attr("dy", "-1em")
                    .style("font-size", "16px")
                    .style("font-weight", "bold")
                    .style("fill", "white")
                    .text(stateCode);
                
                // Percentage
                g.append("text")
                    .attr("text-anchor", "middle")
                    .attr("dy", "1em")
                    .style("font-size", "20px")
                    .style("font-weight", "bold")
                    .style("fill", "white")
                    .text(stateData.percentage + "%");
                
                // Value in parentheses
                g.append("text")
                    .attr("text-anchor", "middle")
                    .attr("dy", "2.5em")
                    .style("font-size", "14px")
                    .style("fill", "white")
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
                .attr("stroke", "white")
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

        // Add legend title
        legend.append("text")
            .attr("x", 0)
            .attr("y", -5)
            .style("font-size", "12px")
            .style("fill", "white")
            .text("Number of Fines");

    } catch (error) {
        console.error("Error creating jurisdiction visualization:", error);
        // Display error message in the chart container
        d3.select("#jurisdiction-chart")
            .html("<div style='color: red; text-align: center; padding: 20px;'>Error loading jurisdiction data</div>");
    }
});

// Helper function to convert state names to codes
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
