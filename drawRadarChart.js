function drawRadarChart(data, category, x, y) {
  var cfg = {
    w: 1440,	//Width of the circle			
    h: 1000,	//Height of the circle
    margin: { top: 20, right: 20, bottom: 20, left: 20 }, //The margins of the SVG
    levels: 5,	//How many levels or circles should there be drawn			
    maxValue: 1, 	//The value that the biggest circle will represent		
    labelFactor: 1.2, 	//How much farther than the radius of the outer circle should the labels be placed
    wrapWidth: 60, 	//The number of pixels after which a label needs to be given a new line	
    opacityArea: 0.35, 	//The opacity of the area of the blob
    dotRadius: 4, 	//The size of the colored circles of each blog		
    opacityCircles: 0.1, 	//The opacity of the circles of each blob
    strokeWidth: 2, 	//The width of the stroke around each blob	
    roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
    color: d3.scaleOrdinal(d3.schemeCategory10)	
  };

  console.log(data.length);
  // SET UP DATASET
  let data1 = [];
  var data1Cat = data.filter(function(d) {
    return d.Category.includes(category); // Filter category
  });
  // Transform the data
  var data1Cat = data1Cat.map(function(entry) {
    return {
      axis: entry['Criteria'],
      value: entry['Value']
    };
  });
  data1 = [data1Cat];
  console.log(data1);


  // SET UP 
  var allAxis = data1Cat.map(function (i, j) {return i.axis}), 
  total = allAxis.length, //The number of different axes
  radius = 180 //Radius of the outermost circle
  Format = d3.format('.0%'), //Percentage formatting
  angleSlice = Math.PI * 2 / total; //The width in radians of each "slice"
  var rScale = d3.scaleLinear() //Scale for the radius
    .range([0, radius])
    .domain([0, cfg.maxValue]);

  //Remove whatever chart with the same id/class was present before
	d3.select(".chart").select("svg").remove();
  // Initiate the radar chart SVG
  let svg = d3.select(".chart").append("svg")
  .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
  .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom);
  //Append a g element
  var g = svg.append("g")
    .attr("transform", "translate(" + (x + cfg.margin.left) + "," + (y + cfg.margin.top) + ")");
  /////////////////////////////////////////////////////////
  /////////////// Draw the Circular grid //////////////////
  /////////////////////////////////////////////////////////
  // 1.
  //Wrapper for the grid & axes
  var axisGrid = g.append("g").attr("class", "axisWrapper");

  //Draw the background circles
  axisGrid.selectAll(".levels")
    .data(d3.range(1, (cfg.levels + 1)).reverse())
    .enter()
    .append("circle")
    .attr("class", "gridCircle")
    .attr("r", function (d) { return radius / cfg.levels * d; })
    .style("fill", "#CDCDCD")
    .style("stroke", "#CDCDCD")
    .style("fill-opacity", cfg.opacityCircles)
    .style("filter", "url(#glow)");

  //Text indicating at what % each level is
  axisGrid.selectAll(".axisLabel")
    .data(d3.range(1, (cfg.levels + 1)).reverse())
    .enter().append("text")
    .attr("class", "axisLabel")
    .attr("x", 4)
    .attr("y", function (d) { return -d * radius / cfg.levels; })
    .attr("dy", "0.4em")
    .style("font-size", "11px")
    .attr("fill", "#737373")
    .text(function (d) { return Format(d / cfg.levels); });

  /////////////////////////////////////////////////////////
  //////////////////// Draw the axes //////////////////////
  /////////////////////////////////////////////////////////
  //Create the straight lines radiating outward from the center
  var axis = axisGrid.selectAll(".axis")
    .data(allAxis)
    .enter()
    .append("g")
    .attr("class", "axis");
  //Append the lines
  axis.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", function (d, i) { return rScale(cfg.maxValue) * Math.cos(angleSlice * i - Math.PI / 2); })
    .attr("y2", function (d, i) { return rScale(cfg.maxValue) * Math.sin(angleSlice * i - Math.PI / 2); })
    .attr("class", "line")
    .style("stroke", "white")
    .style("stroke-width", "2px");
  //Append the labels at each axis
  axis.append("text")
    .attr("class", "legend")
    .style("font-size", "14px")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr("x", function (d, i) { return rScale(cfg.maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2); })
    .attr("y", function (d, i) { return rScale(cfg.maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2); })
    .text(function (d) { return d; })
    .call(wrap, cfg.wrapWidth);

  /////////////////////////////////////////////////////////
  ///////////// Draw the radar chart blobs ////////////////
  /////////////////////////////////////////////////////////
  //The radial line function
  var radarLine = d3.lineRadial()
    .curve(d3.curveCardinalClosed)
    .radius(function (d) { return rScale(d.value); })
    .angle(function (d, i) { return i * angleSlice; });

  //Create a wrapper for the blobs
  var blobWrapper = g.selectAll(".radarWrapper")
    .data(data1)
    .enter().append("g")
    .attr("class", "radarWrapper");

  //Append the backgrounds
  blobWrapper
    .append("path")
    .attr("class", "radarArea")
    .attr("d", function (d, i) { return radarLine(d); })
    .style("fill", function (d, i) { return cfg.color(i); })
    .style("fill-opacity", cfg.opacityArea)
    .on('mouseover', function (d, i) {
      //Dim all blobs
      d3.selectAll(".radarArea")
        .transition().duration(200)
        .style("fill-opacity", 0.1);
      //Bring back the hovered over blob
      d3.select(this)
        .transition().duration(200)
        .style("fill-opacity", 0.7);
    })
    .on('mouseout', function () {
      d3.selectAll(".radarArea")
        .transition().duration(200)
        .style("fill-opacity", cfg.opacityArea);
    });

  //Create the outlines
  blobWrapper.append("path")
    .attr("class", "radarStroke")
    .attr("d", function (d, i) { return radarLine(d); })
    .style("stroke-width", cfg.strokeWidth + "px")
    .style("stroke", function (d, i) { return cfg.color(i); })
    .style("fill", "none")
    .style("filter", "url(#glow)");
  //Append the data points
  blobWrapper.selectAll(".radarCircle")
    .data(function (d, i) { return d; })
    .enter().append("circle")
    .attr("class", "radarCircle")
    .attr("r", cfg.dotRadius)
    .attr("cx", function (d, i) { return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);})
    .attr("cy", function (d, i) { return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2); })
    .style("fill", function (d, i, j) { return cfg.color(j); })
    .style("fill-opacity", 0.8);

  /////////////////////////////////////////////////////////
  //////// Append invisible data points for tooltip ///////////
  /////////////////////////////////////////////////////////
  //Wrapper for the invisible data points on top
  var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
    .data(data1)
    .enter().append("g")
    .attr("class", "radarCircleWrapper");

  //Append a set of invisible data points on top for the mouseover pop-up
  blobCircleWrapper.selectAll(".radarInvisibleCircle")
    .data(function (d, i) { return d; })
    .enter().append("circle")
    .attr("class", "radarInvisibleCircle")
    .attr("r", cfg.dotRadius * 1.5)
    .attr("cx", function (d, i) { return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2); })
    .attr("cy", function (d, i) { return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2); })
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", (event, d) => {
      console.log(d.value);
      var newX = event.x - 20;
      var newY = event.y + 20;

      tooltip
        .attr('x', newX)
        .attr('y', newY)
        .text(Format(d.value))
        .transition().duration(200)
        .style('opacity', 1);
    })
    .on("mouseout", () => {
      tooltip.transition().duration(200)
        .style("opacity", 0);
    });

  //Set up the small tooltip for when you hover over a data point
  var tooltip = svg.append("text")
    .attr("class", "tooltip")
    .style("opacity", 0);
  // DECORATION
  //Filter for the outside glow
  var filter = g.append('defs').append('filter').attr('id', 'glow'), 
  feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'), 
  feMerge = filter.append('feMerge'), 
  feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'), 
  feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  /////////////////////////////////////////////////////////
  /////////////////// Helper Function /////////////////////
  /////////////////////////////////////////////////////////
  //Wraps SVG text	
  function wrap(text, width) {
    text.each(function () {
      var text = d3.select(this), words = text.text().split(/\s+/).reverse(), word, line = [], lineNumber = 0, lineHeight = 1.4, y = text.attr("y"), x = text.attr("x"), dy = parseFloat(text.attr("dy")), tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }
}



