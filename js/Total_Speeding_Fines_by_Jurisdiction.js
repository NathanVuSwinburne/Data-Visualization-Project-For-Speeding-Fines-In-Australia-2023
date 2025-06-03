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

        // Create a group for the map
        const mapGroup = svg.append("g");

        // Draw states
        mapGroup.selectAll("path")
            .data(geojson.features)
            .join("path")
            .attr("d", path)
            .attr("fill", "#0288d1")
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
                
                // Adjust Tasmania's position
                if (stateCode === "TAS") {
                    return `translate(${centroid[0] + 50}, ${centroid[1] - 20})`;
                }
                // Adjust ACT's position
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
