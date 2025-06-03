document.addEventListener('DOMContentLoaded', function() {
    const container = d3.select("#location-chart");
    const containerDiv = container.node();
    const width = containerDiv.clientWidth * 1.3;
    const height = containerDiv.clientHeight || 400;
    const margin = { top: 30, right: 60, bottom: 30, left: 100 }; 

    const svg = container
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const data = [
        { location: "Urban", value: 1170872 },
        { location: "Regional", value: 353147 },
        { location: "Remote", value: 2287 }
    ];

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) * 1.1])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleBand()
        .domain(data.map(d => d.location))
        .range([margin.top, height - margin.bottom])
        .padding(0.04);

    const color = d3.scaleOrdinal()
        .domain(["Urban", "Regional", "Remote"])
        .range(["#20c7da", "#74beed", "#448aff"]);

    // Bars
    svg.selectAll("rect.bar")
        .data(data)
        .join("rect")
        .attr("class", "bar")
        .attr("x", margin.left)
        .attr("y", d => y(d.location))
        .attr("width", d => x(d.value) - margin.left)
        .attr("height", y.bandwidth())
        .attr("fill", d => color(d.location));

    // Value labels
    svg.selectAll("text.value-label")
        .data(data)
        .join("text")
        .attr("class", "value-label")
        .attr("x", d => x(d.value) + 5)
        .attr("y", d => y(d.location) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .style("font-size", "14px") // increased font size
        .style("fill", "#333")
        .text(d => d.value.toLocaleString());

    // Y-axis labels
    svg.selectAll("text.location-label")
        .data(data)
        .join("text")
        .attr("class", "location-label")
        .attr("x", margin.left - 10)
        .attr("y", d => y(d.location) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .style("font-size", "14px") // increased font size
        .style("fill", "#333")
        .text(d => d.location);

    // X-axis
    const xAxis = d3.axisBottom(x)
        .ticks(5)
        .tickFormat(d => d.toLocaleString());

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "14px"); // increased font size
});
