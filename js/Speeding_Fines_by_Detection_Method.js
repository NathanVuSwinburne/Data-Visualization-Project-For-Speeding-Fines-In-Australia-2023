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
        svg.selectAll('path.slice') // Added .slice class for specific selection in update
            .data(data_ready)
            .join('path')
            .attr('class', 'slice') // Add class for selection
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
                    Percentage: ${d.data.percentage}%<br/>
                    Count: ${d.data.count}
                `) // Updated tooltip content
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on('mouseout', function(event, d) {
                // Restore slice appearance
                d3.select(this)
                    .style('stroke', 'white')
                    .style('stroke-width', '2px');
                
                // Hide tooltip
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Add polylines for labels (only for slices larger than a threshold)
        svg.selectAll('polyline.label-line')
            .data(data_ready.filter(d => (d.endAngle - d.startAngle) > 0.1)) // Filter small slices
            .join('polyline')
            .attr('class', 'label-line')
            .attr("stroke", "black")
            .style("fill", "none")
            .attr("stroke-width", 1)
            .attr('points', function(d) {
                const posA = arc.centroid(d); // line insertion in the slice
                const posB = outerArc.centroid(d); // line break: we use the other arc generator that has been defined only for the labels
                const posC = outerArc.centroid(d); // Label position = almost the same as posB
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // extend line further for label
                return [posA, posB, posC];
            });

        // Add text labels (only for slices larger than a threshold)
        svg.selectAll('text.label-text')
            .data(data_ready.filter(d => (d.endAngle - d.startAngle) > 0.1)) // Filter small slices
            .join('text')
            .attr('class', 'label-text')
            .text(d => `${d.data.detection_method} (${d.data.percentage}%)`)
            .attr('transform', function(d) {
                const pos = outerArc.centroid(d);
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1); // Adjust label position
                return `translate(${pos})`;
            })
            .style('text-anchor', function(d) {
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                return (midangle < Math.PI ? 'start' : 'end');
            })
            .style("font-size", "10px");

    } catch (error) {
        console.error("Error initializing detection method chart:", error);
        const container = d3.select("#detection-method-chart");
        container.html(""); // Clear previous content on error
        container.append("div")
            .attr("class", "error-message")
            .text("Error initializing chart.");
    }
};

window.updateDetectionMethodChartWithTransition = function(newData) {
    try {
        console.log('Updating detection method chart with transition. New data:', newData);

        const container = d3.select("#detection-method-chart");
        const svg = container.select("svg g"); // Select the existing group

        if (svg.empty()) {
            console.error("Detection method chart SVG group not found. Initializing.");
            window.initDetectionMethodChart(); // Fallback to init if SVG is not there
            return;
        }

        // --- Dimensions and Radius (should match init or be dynamic) ---
        const boundingRect = container.node().getBoundingClientRect();
        const width = Math.min(boundingRect.width, 300);
        const height = Math.min(width, 300);
        const margin = 30;
        const radius = Math.min(width, height) / 2 - margin;

        // --- Data Preparation ---
        if (!newData || newData.length === 0) {
            console.warn("No new detection method data provided for update. Clearing chart.");
            svg.selectAll("*").remove(); // Clear slices, labels, etc.
            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "0.35em")
                .text("No data available");
            return;
        }
        
        const totalCount = newData.reduce((sum, d) => sum + d.count, 0);
        const dataWithPercentage = newData.map(d => ({
            detection_method: d.method,
            count: d.count,
            percentage: totalCount > 0 ? ((d.count / totalCount) * 100) : 0 
        }));

        // --- Color Scale (same as init) ---
        const color = d3.scaleOrdinal()
            .domain(["Police issued", "Fixed camera systems", "Mobile camera", "Fixed or mobile camera", "Other"])
            .range(["#ffd08e", "rgb(168,166,243)", "#ffa4ce", "#9a57c2", "rgb(32,199,218)"]);

        // --- Pie Layout (same as init) ---
        const pie = d3.pie()
            .value(d => d.percentage)
            .sort(null); 

        const data_ready = pie(dataWithPercentage);

        // --- Arc Generators (same as init) ---
        const arcGenerator = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        const outerArcForLabels = d3.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9);

        // --- Store old angles for tweening ---
        svg.selectAll("path.slice")
            .each(function(d) { this._current = d; });


        // --- SLICES (Paths) ---
        const slices = svg.selectAll("path.slice")
            .data(data_ready, d => d.data.detection_method); 

        slices.join(
            enter => enter.append("path")
                .attr("class", "slice")
                .attr("fill", d => color(d.data.detection_method))
                .style("stroke-width", "2px")
                .style("stroke", "white")
                .style("cursor", "pointer")
                .each(function(d) { 
                    this._current = { startAngle: d.startAngle, endAngle: d.startAngle }; 
                })
                .call(path => path.transition().duration(750)
                    .attrTween("d", function(d) {
                        const interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(0); 
                        return function(t) {
                            return arcGenerator(interpolate(t));
                        };
                    })),
            update => update
                .call(path => path.transition().duration(750)
                    .attrTween("d", function(d) {
                        const interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(0); 
                        return function(t) {
                            return arcGenerator(interpolate(t));
                        };
                    })),
            exit => exit
                .call(path => path.transition().duration(750)
                    .attrTween("d", function(d) {
                        const end = { startAngle: d.startAngle, endAngle: d.startAngle };
                        const interpolate = d3.interpolate(this._current, end);
                        return function(t) {
                            return arcGenerator(interpolate(t));
                        };
                    })
                    .remove())
        );
        
         svg.selectAll("path.slice")
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .style('stroke', '#333')
                    .style('stroke-width', '3px');
                
                const tooltip = d3.select(".detection-method-tooltip"); 
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`<strong>${d.data.detection_method}</strong><br/>Percentage: ${d.data.percentage.toFixed(1)}%<br/>Count: ${d.data.count}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on('mouseout', function(event, d) {
                d3.select(this)
                    .style('stroke', 'white')
                    .style('stroke-width', '2px');
                
                const tooltip = d3.select(".detection-method-tooltip");
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // --- POLYLINES for LABELS ---
        const polylines = svg.selectAll("polyline.label-line")
            .data(data_ready.filter(d => (d.endAngle - d.startAngle) > 0.1), d => d.data.detection_method); 

        polylines.join(
            enter => enter.append("polyline")
                .attr("class", "label-line")
                .style("fill", "none")
                .attr("stroke", "black")
                .style("opacity", 0) 
                .attr("stroke-width", 1)
                .attr("points", function(d) {
                    const posA = arcGenerator.centroid(d); 
                    const posB = outerArcForLabels.centroid(d); 
                    const posC = outerArcForLabels.centroid(d); 
                    return [posA, posB, posC];
                })
                .call(line => line.transition().duration(750)
                    .style("opacity", 1)
                    .attr("points", function(d) {
                        const posA = arcGenerator.centroid(d);
                        const posB = outerArcForLabels.centroid(d);
                        const posC = outerArcForLabels.centroid(d);
                        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                        posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
                        return [posA, posB, posC];
                    })),
            update => update
                .call(line => line.transition().duration(750)
                    .style("opacity", 1) 
                    .attr("points", function(d) {
                        const posA = arcGenerator.centroid(d);
                        const posB = outerArcForLabels.centroid(d);
                        const posC = outerArcForLabels.centroid(d);
                        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                        posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
                        return [posA, posB, posC];
                    })),
            exit => exit
                .call(line => line.transition().duration(750)
                    .style("opacity", 0)
                    .attr("points", function(d) { 
                        const posA = arcGenerator.centroid(d);
                        return [posA, posA, posA];
                    })
                    .remove())
        );

        // --- TEXT LABELS ---
        const labels = svg.selectAll("text.label-text")
            .data(data_ready.filter(d => (d.endAngle - d.startAngle) > 0.1), d => d.data.detection_method);

        labels.join(
            enter => enter.append("text")
                .attr("class", "label-text")
                .style("opacity", 0)
                .text(d => `${d.data.detection_method} (${d.data.percentage.toFixed(1)}%)`)
                .attr("transform", function(d) {
                    const pos = outerArcForLabels.centroid(d);
                    const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                    pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1); 
                    return `translate(${pos})`;
                })
                .style("text-anchor", function(d) {
                    const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                    return (midangle < Math.PI ? "start" : "end");
                })
                .style("font-size", "10px") 
                .call(text => text.transition().duration(750)
                    .style("opacity", 1)
                    .attr("transform", function(d) {
                        const pos = outerArcForLabels.centroid(d);
                        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                        return `translate(${pos})`;
                    })),
            update => update
                .text(d => `${d.data.detection_method} (${d.data.percentage.toFixed(1)}%)`) 
                .call(text => text.transition().duration(750)
                    .style("opacity", 1)
                    .attr("transform", function(d) {
                        const pos = outerArcForLabels.centroid(d);
                        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                        return `translate(${pos})`;
                    })
                    .style("text-anchor", function(d) {
                        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                        return (midangle < Math.PI ? "start" : "end");
                    })),
            exit => exit
                .call(text => text.transition().duration(750)
                    .style("opacity", 0)
                    .attr("transform", function(d) { 
                        const pos = outerArcForLabels.centroid(d);
                        return `translate(${pos[0]*0.1}, ${pos[1]*0.1})`; 
                    })
                    .remove())
        );

    } catch (error) {
        console.error("Error updating detection method chart with transitions:", error);
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