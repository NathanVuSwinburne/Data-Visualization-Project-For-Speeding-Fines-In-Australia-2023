const container = d3.select("#detection-method-chart");
const boundingRect = container.node().getBoundingClientRect();
const width = boundingRect.width;
const height = width; // keep it square
const margin = 20;
const radius = Math.min(width, height) / 2 - margin;

const svg = container
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "auto")
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`);



// Color scale
const color = d3.scaleOrdinal()
  .domain(["Fixed camera systems", "Mobile camera", "Fixed or mobile camera", "Police issued", "Other", "Unknown"])
  .range(["rgb(168,166,243)", "#ffa4ce", "#9a57c2", "#ffd08e", "rgb(32,199,218)", "rgb(245,162,80)"]);

// Data
const data = [
  { detection_method: "Unknown", percentage: 2.4 },
  { detection_method: "Fixed camera systems", percentage: 28.8 },
  { detection_method: "Fixed or mobile camera", percentage: 2.8 },
  { detection_method: "Mobile camera", percentage: 23.6 },
  { detection_method: "Other", percentage: 3.1 },
  { detection_method: "Police issued", percentage: 39.3 },
];

// Pie layout
const pie = d3.pie()
  .value(d => d.percentage)
  .sort(null);

const data_ready = pie(data);

// Arc generator
const arc = d3.arc()
  .innerRadius(0)
  .outerRadius(radius);


// Outer arc for labels
const outerArc = d3.arc()
  .innerRadius(radius + 10)
  .outerRadius(radius + 10);

// Pie slices
svg.selectAll('path')
  .data(data_ready)
  .join('path')
  .attr('d', arc)
  .attr('fill', d => color(d.data.detection_method))
  .style('stroke-width', '0');

// Polylines
svg.selectAll('polyline')
  .data(data_ready)
  .join('polyline')
  .attr('stroke', 'black')
  .style('fill', 'none')
  .style('stroke-width', '1px')
  .attr('points', d => {
    const posA = arc.centroid(d);
    const posB = outerArc.centroid(d);
    const posC = outerArc.centroid(d);
    posC[0] = (midAngle(d) < Math.PI ? 1 : -1) * (radius + 50);
    return [posA, posB, posC];
  });

// Labels
svg.selectAll('text')
  .data(data_ready)
  .join('text')
  .attr('transform', d => {
    const pos = outerArc.centroid(d);
    pos[0] = (midAngle(d) < Math.PI ? 1 : -1) * (radius + 55);
    return `translate(${pos})`;
  })
  .style('text-anchor', d => midAngle(d) < Math.PI ? 'start' : 'end')
  .style('font-size', `${width * 0.07}px`) 
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
