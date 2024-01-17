//Data
const data2 = [
    { label: "Bachelor Of Arts Degree", value: 115 },
    { label: "Bachelor of Science Degree", value: 42 },
    { label: "Master of Science", value: 15 },
    { label: "PhD", value: 5},
];
console.log(data2);

function drawBarChart(data, category, x, y){
    // Set up the chart dimensions
    const width = 1440;
    const height = 1000;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const chartWidth = 450;
    const chartHeight = 300;

    let data1 = [];
    var data1Cat = data.filter(function(d) {
        return d.Category.includes(category); // Filter category
    });
    // Transform the data
    data1Cat.forEach(element => {
        var formattedData = Object.keys(element)
          .filter(key => key !== 'Category')
          .map(key => ({ label: key, value: parseFloat(element[key]) }));
        data1.push(formattedData);
      });
    console.log(data1[0]);

    //Remove whatever chart with the same id/class was present before
	d3.select(".chart").select("svg").remove();
    // Create the SVG container
    const svg = d3.select(".chart").append("svg")
        .attr("width", width+margin.left+margin.right)
        .attr("height", height+margin.top+margin.bottom);

    // Create the chart group
    const g = svg.append("g")
        .attr("transform", `translate(${x+margin.left-200}, ${y+margin.top-200})`);

    // Create the x and y scales
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data1[0], d => d.value)])
        .range([0, chartWidth]);
    console.log(d3.max(data1[0], d => d.value));
    const yScale = d3.scaleBand()
        .domain(data1[0].map(d => d.label))
        .range([0, chartHeight])
        .padding(0.1);

    // Create the x and y axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Add the x axis to the chart
    g.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis);

    // Add the y axis to the chart
    g.append("g")
        .call(yAxis);

    // Create the bars
    g.selectAll(".bar")
        .data(data1[0])
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => yScale(d.label))
        .attr("width", d => xScale(d.value))
        .attr("height", yScale.bandwidth())
        .attr("fill", "#89CFF0");
}