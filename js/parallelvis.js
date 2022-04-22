class ParallelVis {

    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.initVis();

    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {
        let vis = this;
        vis.margin = {top: 30, right: 50, bottom: 10, left: 80};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.x = d3.scalePoint().range([0, vis.width]);
        vis.y = {};
        vis.dragging = {};

        vis.line = d3.line();
        vis.axis = d3.axisLeft();
        vis.background, vis.foreground, vis.csv;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.wrangleData();
    }

    wrangleData() {

        let vis = this;

        vis.dimensions = ["Size", "Founded", "Revenue", "Avg_Salary"]

        // For each dimension, I build a linear scale. I store all in a y object
        vis.y["Size"] = d3.scalePoint().domain(vis.data.map(d => d["Size"])).rangeRound([vis.height, 0]);
        vis.y["Revenue"] = d3.scalePoint().domain(vis.data.map(d => d["Revenue"])).rangeRound([vis.height, 0]);
        vis.y["Founded"] = d3.scaleLinear().domain(d3.extent(vis.data, function (d) {
            return +d["Founded"];
        })).range([vis.height, 0]);
        vis.y["Avg_Salary"] = d3.scaleLinear().domain(d3.extent(vis.data, function (d) {
            return +d["Avg_Salary"];
        })).range([vis.height, 0]);

        vis.brush=function (event,d) {

            var actives = [];
            //filter brushed extents
            vis.svg.selectAll(".brush")
                .filter(function (d) {
                    return d3.brushSelection(this);
                })
                .each(function (d) {
                    actives.push({
                        dimension: d,
                        extent: d3.brushSelection(this)
                    });
                });
            if (!event.selection && actives.length > 0) {
                console.log("inside");
                actives = actives.filter(active => active.dimension != d)
            }


            // console.log(csv);
            var selected = vis.data.filter(function (d) {
                if (actives.every(function (active) {
                    var dim = active.dimension;
                    // test if point is within extents for each active brush
                    return active.extent[0] <= vis.y[dim](d[dim]) && vis.y[dim](d[dim]) <= active.extent[1];
                })) {
                    return true;
                }
            });
            console.log(selected);
            if (selected.length != 0)
                document.getElementById("salary").innerHTML = "Average Salary of selection :" + selected.reduce((r, c) => r + c.Avg_Salary, 0) / selected.length;
            else
                document.getElementById("salary").innerHTML = "  ";

            //set un-brushed foreground line disappear
            vis.foreground.classed("fade", function (d, i) {

                return !actives.every(function (active) {
                    var dim = active.dimension;
                    // console.log(y[dim](d[dim]));
                    return active.extent[0] <= vis.y[dim](d[dim]) && vis.y[dim](d[dim]) <= active.extent[1];
                });
            });

        }
        vis.dimensions.forEach(d => {
            vis.y[d].brush = d3.brushY()
                .extent([[-8, vis.y[d].range()[1]], [8, vis.y[d].range()[0]]])
                .on('brush', vis.brush);
        });

        vis.x.domain(vis.dimensions);
        // Extract the list of dimensions and create a scale for each.


        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        // Add grey background lines for context.
        vis.background = vis.svg.append("g")
            .attr("class", "background")
            .selectAll("path")
            .data(vis.data)
            .enter().append("path")
            .attr("d", path);

        // Add blue foreground lines for focus.
        vis.foreground = vis.svg.append("g")
            .attr("class", "foreground")
            .selectAll("path")
            .data(vis.data)
            .enter().append("path")
            .attr("d", path);

        //// ==== Draw Axis START ==== ////
        vis.g = vis.svg.selectAll(".dimension")
            .data(vis.dimensions).enter() // g's data is the dimensions
            .append("g")
            .attr("class", "dimension")
            // Give the axis it's propper x pos
            .attr("transform", function (d) {
                return "translate(" + vis.x(d) + ")";
            });
        vis.g.append("g") // The Axis
            .attr("class", "axis")
            .each(function (d) {
                d3.select(this).call(vis.axis.scale(vis.y[d]));
            });
        vis.g.append("text") // Axis Label
            .attr("class", "title")
            .style("text-anchor", "middle")
            .attr("y", -10)
            .attr("font-size", 15)
            .text(function (d) {
                return d;
            });
        //// ==== Draw Axis END ==== ////

        vis.g.append('g')
            .attr('class', 'brush')
            .each(function (d) {
                d3.select(this).call(vis.y[d].brush);
            })
            .selectAll('rect')
            .attr('x', -8)
            .attr('width', 16);

        vis.svg.selectAll(".brush").selectAll(".overlay")
            .on("mousedown", vis.brush);



        function position(d) {
            var v = vis.dragging[d];
            return v == null ? vis.x(d) : v;
        }


    // Returns the path for a given data point.
        function path(d) {
            return vis.line(vis.dimensions.map(function (p) {
                return [position(p), vis.y[p](d[p])];
            }));
        }
    }




}