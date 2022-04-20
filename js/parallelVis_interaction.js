var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scalePoint().range([0, width]),
// var x = d3.scaleOrdinal().rangePoints([0, width], 1),
    y = {},
    dragging = {};

var line = d3.line(),
    axis = d3.axisLeft(),
    background,
    foreground;

var svg = d3.select("#parallelvis").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/cars.csv").then(cars => {

    // console.log(Object.keys(cars[0]));


    // Extract the list of dimensions and create a scale for each.
    x.domain(dimensions = Object.keys(cars[0]).filter(function(d) {
        return d != "name" && (y[d] = d3.scaleLinear()
            .domain(d3.extent(cars, function(p) { return +p[d]; }))
            .range([height, 0]));
    }));

    // Add grey background lines for context.
    background = svg.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(cars)
        .enter().append("path")
        .attr("d", path);

    // Add blue foreground lines for focus.
    foreground = svg.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(cars);

    foreground.enter().append("path")
        .attr("d", path);

    // // Add a group element for each dimension.
    // var g = svg.selectAll(".dimension")
    //     .data(dimensions)
    //     .enter().append("g")
    //     .attr("class", "dimension")
    //     .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    //     .call(d3.drag()
    //         .subject(function(d) { return {x: x(d)}; })
    //         .on("start", function(d) {
    //             dragging[d] = x(d);
    //             background.attr("visibility", "hidden");
    //         })
    //         .on("drag", function(d) {
    //             dragging[d] = Math.min(width, Math.max(0, d3.event.x));
    //             foreground.attr("d", path);
    //             dimensions.sort(function(a, b) { return position(a) - position(b); });
    //             x.domain(dimensions);
    //             g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
    //         })
    //         .on("end", function(d) {
    //             delete dragging[d];
    //             transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
    //             transition(foreground).attr("d", path);
    //             background
    //                 .attr("d", path)
    //                 .transition()
    //                 .delay(500)
    //                 .duration(0)
    //                 .attr("visibility", null);
    //         }));

    //// ==== Draw Axis START ==== ////
    var g = svg.selectAll(".dimension")
        .data(dimensions).enter() // g's data is the dimensions
        .append("g")
        .attr("class", "dimension")
        // Give the axis it's propper x pos
        .attr("transform", function(d) {return "translate("+x(d)+ ")"; });
    g.append("g") // The Axis
        .attr("class", "axis")
        .each(function(d) { d3.select(this).call(axis.scale(y[d])); });
    g.append("text") // Axis Label
        .attr("class", "title")
        .style("text-anchor", "middle")
        .attr("y", -10)
        .attr("font-size", 15)
        .text(function(d) { return d; });
    //// ==== Draw Axis END ==== ////

    //// ==== Axis dragging START ==== ////
    g.call(d3.drag()
        .on("start", function(d) {
            dragging[d] = x(d);
            background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
            // Make sure the dragging is within the range.
            dragging[d] = Math.min(width, Math.max(0, d.x));
            // console.log(Math.min(width, Math.max(0, d.x)));
            // console.log(d);
            foreground.merge(foreground).attr("d", path) // Redraw the lines when draging an axis
            dimensions.sort(function(a,b) {return position(a) - position(b)});
            // Set the domain to the new order of the dimension
            x.domain(dimensions);
            // console.log(position(d));
            // Translate the axis to mouse position
            g.attr("transform", function(d) { return "translate("+ position(d) +")";
            })
        })
        .on("end", function(d) {
            // console.log(this);
            // console.log(x(d.subject));
            delete dragging[d];
            d3.select(this).transition().duration(200)
                .attr("transform", "translate("+d.x+")");
            foreground
                .merge(foreground)
                .transition().duration(200)
                .attr("d", path)
            background
                .attr("d", path)
                .transition().delay(200).duration(0)
                .attr("visibility", null);
        }));
    //// ==== Axis dragging END ==== ////

    // Add an axis and title.
    // g.append("g")
    //     .attr("class", "axis")
    //     .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
    //     .append("text")
    //     .style("text-anchor", "middle")
    //     .attr("y", -9)
    //     .text(function(d) { return d; });


    //on("brush start", brushstart(event)).

    // // Add and store a brush for each axis.
    // g.append("g")
    //     .attr("class", "brush")
    //     .each(function(d) {
    //         console.log(y[d]+" "+d);
    //         d3.select(this).call(y[d].brush = d3.brushY(y[d]).on("mousedown",d3.event.stopPropagation()).on("brush", brush));
    //     })
    //     .selectAll("rect")
    //     .attr("x", -8)
    //     .attr("width", 16);
    //// ==== Brushing START ==== ////
    // g.append("g")
    //     .attr("class", "brush")
    //     .each(function(d){
    //         d3.select(this).call(d3.brushY()
    //             .on("start", function(d,i){
    //                 console.log(d)
    //                 d3.event.sourceEvent.stopPropagation();
    //                 g.selectAll("rect")
    //                     .attr("width", 20)
    //                     .attr("x", -10)
    //             })
    //             .on("brush", function(d, i){
    //                 // console.log(d)
    //                 g.selectAll("rect")
    //                     .attr("width", 20)
    //                     .attr("x", -10)
    //             }))
    //     })
//// ==== Brushing END ==== ////
});

function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
}
function xPosition(d) {
    var v = dragging[d]; // This array holds the temporary positions when dragging.
    if(v == null) return x(d);
    return v;
}

function transition(g) {
    return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
    return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
}
//
// function brushstart(event) {
//     console.log(event);
//     d3.event.sourceEvent.stopPropagation();
// }

// Handles a brush event, toggling the display of foreground lines.
function brush() {
    var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
        extents = actives.map(function(p) { return y[p].brush.extent(); });
    foreground.style("display", function(d) {
        return actives.every(function(p, i) {
            return extents[i][0] <= d[p] && d[p] <= extents[i][1];
        }) ? null : "none";
    });
}