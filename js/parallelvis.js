// set the dimensions and margins of the graph
let csv;
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
d3.csv("data/Market_Divers.csv").then(data => {
    data.forEach(function (d) {
        d["Founded"]=2022-(+d["Founded"]);
    });


    // console.log(data);


    dimensions=["Calculated_Size","Founded","Calculated_Revenue","Avg_Salary"]
    // console.log(dimensions);
    // For each dimension, I build a linear scale. I store all in a y object
    var y = {}
    y["Calculated_Size"]=d3.scalePoint().domain(data.map(d=>d["Calculated_Size"])).rangeRound([height,0]);

    // console.log(y);
    y["Calculated_Revenue"]=d3.scalePoint().domain(data.map(d=>d["Calculated_Revenue"])).rangeRound([height,0]);
    y["Founded"]=d3.scaleLinear()
            .domain(d3.extent(data, function (d) {
                return +d["Founded"];
            }))
            .range([height, 0]);
    y["Avg_Salary"]=d3.scaleLinear()
        .domain(d3.extent(data, function (d) {
            return +d["Avg_Salary"];
        }))
        .range([height, 0]);

    var color = d3.scaleOrdinal()
        .domain(["Small", "Medium", "Large","Enterprise" ])
        .range(["grey","grey","grey","black"])

    // Build the X scale -> it find the best position for each Y axis
    x = d3.scalePoint()
        .range([0, width])
        .padding(1)
        .domain(dimensions);


    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        return d3.line()(dimensions.map(function (p) {
            return [x(p), y[p](d[p])];
        }));
    };

    // Draw the lines
    svg
        .selectAll("myPath")
        .data(data)
        .enter().append("path")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", "blue")
        // .style("stroke", function(d){ return( color(d["Calculated_Size"]))} )
        .style("opacity", 0.5);


    // Draw the axis:
    svg.selectAll("myAxis")
        .data(dimensions).enter()
        .append("g")
        .attr("transform", function (d) {
            return "translate(" + x(d) + ")";
        })

        .each(function (d) {
            d3.select(this).call(d3.axisLeft().scale(y[d]));
        })
        // Add axis title
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function (d) {
            return d;
        })
        .style("fill", "black")

});