// set the dimensions and margins of the graph
var margin = {top: 30, right: 10, bottom: 10, left: 0},
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#parallelvis")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv", function(data) {
    // console.log(Object.keys(data));
    // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
    dimensions = Object.keys(data).filter(function(d) { return d != "Species" })
    // console.log(dimensions.indexOf('Sepal_Length'));
    // For each dimension, I build a linear scale. I store all in a y object
    var y = {}
    for (i in dimensions) {
        name = dimensions[i]
        y[i] = d3.scaleLinear()
            .domain( d3.extent(Object.values(data), function(d) { return +d[name]; }) )
            .range([height, 0])
    }
    // console.log(y["Sepal_Length"]);

    // Build the X scale -> it find the best position for each Y axis
    x = d3.scalePoint()
        .range([0, width])
        .padding(1)
        .domain(dimensions);

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        return d3.line()(dimensions.map(function(p) {
            let len=(dimensions.indexOf(p)+1);
            console.log(d);
            return [x(p), y[len-1](d[len])]; }));
    }

    // Draw the lines
    svg
        .selectAll("myPath")
        .data(Object.values(data))
        .enter().append("path")
        .attr("d",  path)
        .style("fill", "none")
        .style("stroke", "#69b3a2")
        .style("opacity", 0.5)

    // Draw the axis:
    svg.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions).enter()
        .append("g")
        // I translate this element to its right position on the x axis
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        // And I build the axis with the call function
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        // Add axis title
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black")

})