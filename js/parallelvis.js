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
    // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
    // dimensions = Object.keys(data).filter(function(d) { return d != "Species" });

    dimensions=["Calculated Size","Founded","Calculated_Revenue","Avg_Salary"]
    console.log(dimensions);
    // For each dimension, I build a linear scale. I store all in a y object
    var y = {}
    y["Calculated Size"]=d3.scalePoint().domain(data.map(function(d){if(d["Calculated Size"]=="")return "Small"; return d["Calculated Size"]})).rangeRound([height,0]);

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
        .range([ "grey","grey","grey","#440154ff"])

    // Build the X scale -> it find the best position for each Y axis
    x = d3.scalePoint()
        .range([0, width])
        .padding(1)
        .domain(dimensions);

    // var color = d3.scaleOrdinal()
    //     .domain(["setosa", "versicolor", "virginica" ])
    //     .range([ "#440154ff", "#21908dff", "#fde725ff"]);
    //
    // // Highlight the specie that is hovered
    // var highlight = function(d){
    //
    //     console.log(d);
    //     selected_specie = d.Species;
    //     console.log(selected_specie);
    //
    //     // first every group turns grey
    //     d3.selectAll(".line")
    //         .transition().duration(200)
    //         .style("stroke", "lightgrey")
    //         .style("opacity", "0.2")
    //     // Second the hovered specie takes its color
    //     d3.selectAll("." + selected_specie)
    //         .transition().duration(200)
    //         .style("stroke", color(selected_specie))
    //         .style("opacity", "1")
    // }
    //
    // // Unhighlight
    // var doNotHighlight = function(d){
    //     d3.selectAll(".line")
    //         .transition().duration(200).delay(1000)
    //         .style("stroke", function(d){ return( color(d.Species))} )
    //         .style("opacity", "1")
    // }

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        return d3.line()(dimensions.map(function (p) {
            // console.log(d);
            // console.log(p + ' ' + len + ' ' + d + ' ' + y[len](d));
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
        // .style("stroke", "#69b3a2")
        .style("stroke", function(d){ return( color(d["Calculated Size"]))} )
        .style("opacity", 0.5);
    // .attr("class", function (d) { return "line " + d.Species } ) // 2 class for each line: 'line' and the group name
    // .attr("d",  path)
    // .style("fill", "none" )
    // .style("stroke", function(d){ return( color(d.Species))} )
    // .style("opacity", 0.5)
    // .on("mouseover", highlight)
    // .on("mouseleave", doNotHighlight );

    // Draw the axis:
    svg.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions).enter()
        .append("g")
        // I translate this element to its right position on the x axis
        .attr("transform", function (d) {
            return "translate(" + x(d) + ")";
        })
        // And I build the axis with the call function
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