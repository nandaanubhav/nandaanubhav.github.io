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
        vis.margin = {top: 30, right: 50, bottom: 10, left: 100};

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

        vis.dimensions = ["Size", "Age", "Revenue", "Avg_Salary"]

        // For each dimension, I build a linear scale. I store all in a y object
        vis.y["Size"] = d3.scalePoint().domain(vis.data.map(d => d["Size"])).rangeRound([vis.height, 0]);
        vis.y["Revenue"] = d3.scalePoint().domain(vis.data.map(d => d["Revenue"])).rangeRound([vis.height, 0]);
        vis.y["Age"] = d3.scaleLinear().domain(d3.extent(vis.data, function (d) {
            return +d["Age"];
        })).range([vis.height, 0]);
        vis.y["Avg_Salary"] = d3.scaleLinear().domain(d3.extent(vis.data, function (d) {
            return +d["Avg_Salary"];
        })).range([vis.height, 0]);
        var extents=[];
        vis.brush = function (event) {
            //filter brushed extents

            if (event.path) {

                extents[vis.dimensions.indexOf(event.path[1].__data__)] = [0, 0];
            }

            for (var i = 0; i < vis.dimensions.length; ++i) {
                if (event.target == vis.y[vis.dimensions[i]].brush) {
                    if (vis.dimensions[i] == "Size" || vis.dimensions[i]== "Revenue") {
                        var selected = vis.y[vis.dimensions[i]].domain().filter(function (d) {
                            var s = event.selection;
                            return (s[0] <= vis.y[vis.dimensions[i]](d)) && (vis.y[vis.dimensions[i]](d) <= s[1])
                        });
                        var temp = selected.sort();
                        extents[i] = [temp[temp.length - 1], temp[0]];
                    } else {
                        extents[i] = event.selection.map(vis.y[vis.dimensions[i]].invert, vis.y[vis.dimensions[i]]);
                    }
                }
            }

            var selected = vis.data.filter(function (d) {
                return vis.dimensions.every(function (p, i) {
                    if (!extents[i] || (extents[i][0] == 0 && extents[i][1] == 0)) {
                        return true;
                    }
                    return extents[i][1] <= d[p] && d[p] <= extents[i][0];
                }) ? true : false;
            });
            // console.log(selected);
            if (selected.length != 0)
                document.getElementById("salary").innerHTML = "Average Salary of selection : $" + Math.floor(selected.reduce((r, c) => r + c.Avg_Salary, 0) / selected.length)+",000";
            else
                document.getElementById("salary").innerHTML = "  ";


            // console.log(extents);
            vis.foreground.style("display", function (d) {
                return vis.dimensions.every(function (p, i) {
                    if (!extents[i] || (extents[i][0] == 0 && extents[i][1] == 0)) {
                        return true;
                    }
                    return extents[i][1] <= d[p] && d[p] <= extents[i][0];
                }) ? null : "none";
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


        updateVis()
        {
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
