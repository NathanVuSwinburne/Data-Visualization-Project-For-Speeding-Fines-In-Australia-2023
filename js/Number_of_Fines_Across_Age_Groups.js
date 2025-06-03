document.addEventListener('DOMContentLoaded', function () {
    const container = d3.select("#age-groups-chart");
    const containerDiv = container.node();
    const width = containerDiv.clientWidth;
    const height = containerDiv.clientHeight || 900;

    const margin = { top: 10, right: 80, bottom: 20, left: 100 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const data = [
        { age_group: "17-25", value: 250000 },
        { age_group: "65 and over", value: 280000 },
        { age_group: "26-39", value: 700000 },
        { age_group: "40-64", value: 1100000 }
    ];

    const x = d3.scaleBand()
        .domain(data.map(d => d.age_group))
        .range([margin.left, width - margin.right])
        .padding(0.4);

    const y = d3.scaleLinear()
        .domain([0, 1200000])
        .range([height - margin.bottom, margin.top]);

    // Create custom ticks for y-axis (increments of 200,000)
    const yTicks = [];
    for (let i = 0; i <= 1200000; i += 200000) {
        yTicks.push(i);
    }

    const colors = ["#20c7da", "#ffa726", "#ffa4ce", "#9a57c2"];
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.age_group))
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

    // Bars
    svg.selectAll("rect.bar")
        .data(data)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.age_group))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.value))
        .attr("fill", d => color(d.age_group));

    // X Axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "middle")
        .style("font-size", "12px");

    // Y Axis with custom ticks
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y)
            .tickValues(yTicks)
            .tickFormat(d => d.toLocaleString()))
        .selectAll("text")
        .style("font-size", "12px");

    // X Axis Label
    svg.append("text")
        .attr("x", width - -10)
        .attr("y", height - 3)
        .attr("text-anchor", "end")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Age Group");

    // Y Axis Label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Number of Fines");
});
