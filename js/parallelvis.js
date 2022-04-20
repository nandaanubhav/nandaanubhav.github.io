var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = 760 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scalePoint().range([0, width]),
// var x = d3.scaleOrdinal().rangePoints([0, width], 1),
    y = {},
    dragging = {};

var line = d3.line(),
    axis = d3.axisLeft(),
    background,
    foreground,
    csv;

var svg = d3.select("#parallelvis").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/Market_Divers.csv").then(data => {

    data.forEach(function (d) {
        d["Founded"] = 2022 - (+d["Founded"]);
        d["Avg_Salary"] = +d["Avg_Salary"];
    });

    csv = data;
    // console.log(Object.keys(cars[0]));

    dimensions = ["Calculated_Size", "Founded", "Calculated_Revenue", "Avg_Salary"]
    // console.log(dimensions);
    // For each dimension, I build a linear scale. I store all in a y object
    y["Calculated_Size"] = d3.scalePoint().domain(data.map(d => d["Calculated_Size"])).rangeRound([height, 0]);
    y["Calculated_Revenue"] = d3.scalePoint().domain(data.map(d => d["Calculated_Revenue"])).rangeRound([height, 0]);
    y["Founded"] = d3.scaleLinear().domain(d3.extent(data, function (d) {
        return +d["Founded"];
    })).range([height, 0]);
    y["Avg_Salary"] = d3.scaleLinear().domain(d3.extent(data, function (d) {
        return +d["Avg_Salary"];
    })).range([height, 0]);
    dimensions.forEach(d => {
        y[d].brush = d3.brushY()
            .extent([[-8, y[d].range()[1]], [8, y[d].range()[0]]])
            .on('brush', brush);
    });

    x.domain(dimensions);
    // Extract the list of dimensions and create a scale for each.
    // console.log(y["Calculated_Size"]);

    // Add grey background lines for context.
    background = svg.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("d", path);

    // Add blue foreground lines for focus.
    foreground = svg.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("d", path);

    //// ==== Draw Axis START ==== ////
    var g = svg.selectAll(".dimension")
        .data(dimensions).enter() // g's data is the dimensions
        .append("g")
        .attr("class", "dimension")
        // Give the axis it's propper x pos
        .attr("transform", function (d) {
            return "translate(" + x(d) + ")";
        });
    g.append("g") // The Axis
        .attr("class", "axis")
        .each(function (d) {
            d3.select(this).call(axis.scale(y[d]));
        });
    g.append("text") // Axis Label
        .attr("class", "title")
        .style("text-anchor", "middle")
        .attr("y", -10)
        .attr("font-size", 15)
        .text(function (d) {
            return d;
        });
    //// ==== Draw Axis END ==== ////

    g.append('g')
        .attr('class', 'brush')
        .each(function (d) {
            d3.select(this).call(y[d].brush);
        })
        .selectAll('rect')
        .attr('x', -8)
        .attr('width', 16);

});

function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
}

function transition(g) {
    return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
    return line(dimensions.map(function (p) {
        return [position(p), y[p](d[p])];
    }));
}

//
function brushstart(event, d) {
    event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
// function brush() {
//     console.log("Brushing");
//     var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
//         extents = actives.map(function(p) { return y[p].brush.extent(); });
//     foreground.style("display", function(d) {
//         return actives.every(function(p, i) {
//             return extents[i][0] <= d[p] && d[p] <= extents[i][1];
//         }) ? null : "none";
//     });
// }

function brush() {
    var actives = [];
    //filter brushed extents
    svg.selectAll(".brush")
        .filter(function (d) {
            return d3.brushSelection(this);
        })
        .each(function (d) {
            actives.push({
                dimension: d,
                extent: d3.brushSelection(this)
            });
        });


    // console.log(csv);
    var selected = csv.filter(function (d) {
        if (actives.every(function (active) {
            var dim = active.dimension;
            // test if point is within extents for each active brush
            return active.extent[0] <= y[dim](d[dim]) && y[dim](d[dim]) <= active.extent[1];
        })) {
            return true;
        }
    });

    console.log(selected);
    document.getElementById("salary").innerHTML = selected.reduce((r, c) => r + c.Avg_Salary, 0) / selected.length;

    // console.log(actives);
    //set un-brushed foreground line disappear
    foreground.classed("fade", function (d, i) {

        return !actives.every(function (active) {
            var dim = active.dimension;
            // console.log(y[dim](d[dim]));
            return active.extent[0] <= y[dim](d[dim]) && y[dim](d[dim]) <= active.extent[1];
        });
    });

}