/* * * * * * * * * * * * * *
*         tilemap          *
* * * * * * * * * * * * * */

// Made with help from https://bl.ocks.org/

class TileMap {

    constructor(parentElement, data, mapData) {
        this.parentElement = parentElement;
        this.data = data;
        this.mapData = mapData;
        this.displayData = [];
        this.highlight = "#6AB89D";
        this.activeSquares = [];
        this.initVis();
        this.navBarSvg = null;
    }

    openNav(stateName, state) {
        document.getElementById("mySidebar").style.display = "block";
        document.getElementById("text-map").style.display = "none";
        if (this.navBarSvg == null)
            this.navBarSvg = new NavBarVis("miniBar-div", this.data);
        this.navBarSvg.updateCountry(stateName, state)
        this.navBarSvg.wrangleData();
    }

    closeNav(fromMain = false) {
        var vis = this;

        vis.activeSquares.forEach(sq => {
            sq.style("fill", function (d) {
                return vis.linearColor(vis.mydict2[d.code])
            }).style("opacity", function (d) {
                if (vis.mydict2[d.code] == 0) {
                    return 0.2
                } else {
                    return 1
                }
            });
            if (fromMain)
                sq.classed("active", !sq.classed("active"));
        })
        vis.activeSquares = [];


        document.getElementById("mySidebar").style.display = "none";
        document.getElementById("text-map").style.display = "block"
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 0, right: 0, bottom: 0, left: 0}
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        let columns = 13, rows = 8;
        var colWidth = Math.floor(vis.width / columns);
        var rowWidth = Math.floor(vis.height / rows);

        // take the smaller of the calculated cell sizes
        if (colWidth <= rowWidth) {
            vis.cellSize = colWidth;
        } else {
            vis.cellSize = rowWidth;
        }

        // generate grid data with specified number of columns and rows
        vis.gridData = makeGridData(13, 8, vis.cellSize);

        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title2')
            .append('text')
            .text("Industry Sectors to lookout for")
            .attr('transform', `translate(0, -5)`)
            .attr('text-anchor', 'middle');

        // draw gridlines
        var grid = vis.svg.append("g")
            .attr("class", "gridlines")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.row = grid.selectAll(".row")
            .data(vis.gridData)
            .enter()
            .append("g")
            .attr("class", "row");

        vis.gridMap = vis.svg.append("g")
            .attr("class", "gridmap")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        let dict = {}

        const unique = [...new Set(vis.mapData.map(item => item.code))];

        unique.forEach(row => {
            dict[row] = 0;
        })


        vis.data.forEach(row => {
            dict[row.State] += 1
        })

        vis.mydict2 = dict

        // // Create items array
        vis.displayData = Object.keys(dict).map(function (key) {
            return [key, dict[key]];
        });

        let maxVal = d3.max(vis.displayData, function (d) {
            return d[1];
        });

        //for axis below legend
        vis.axisScale = d3.scaleSequential()
            .domain([0, maxVal])
            .range([0, vis.width / 6]);

        vis.xAxis = d3.axisBottom(vis.axisScale).tickValues([0, maxVal]);
        vis.linearColor = d3.scaleSequential(d3.interpolateBlues).domain([0, maxVal])

        vis.updateVis()
    }


    updateVis() {
        let vis = this;

        vis.states = vis.gridMap.selectAll(".state")
            .data(vis.mapData, function (d) {
                return d.code;
            });

        var colIndex = 0;
        // draw state rects
        vis.states.enter()
            .append("rect")
            .attr("class", function (d) {
                return "state " + d.code;
            })
            .attr("x", function (d) {
                return (d.col - 1) * vis.cellSize;
            })
            .attr("y", function (d) {
                return (d.row - 1) * vis.cellSize;
            })
            .attr("width", vis.cellSize)
            .attr("height", vis.cellSize)
            .style("fill", function (d) {
                return vis.linearColor(vis.mydict2[d.code])
            })
            .style("opacity", function (d) {
                if (vis.mydict2[d.code] == 0) {
                    return 0.2
                } else {
                    return 1
                }
            })
            .style("cursor", function (d) {
                if (vis.mydict2[d.code] == 0) {
                    return "not-allowed"
                } else {
                    return "pointer"
                }
            })
            .on("click", function (d) {
                var square = d3.select(this);
                // console.log(square["_groups"][0][0]["__data__"])

                if (vis.mydict2[square["_groups"][0][0]["__data__"].code] == 0)
                    return;

                vis.openNav(square["_groups"][0][0]["__data__"].state, square["_groups"][0][0]["__data__"].code);

                square.classed("active", !square.classed("active"));
                if (square.classed("active")) {
                    vis.activeSquares.forEach(sq => {
                        sq.style("fill", function (d) {
                            return vis.linearColor(vis.mydict2[d.code])
                        }).style("opacity", function (d) {
                            if (vis.mydict2[d.code] == 0) {
                                return 0.2
                            } else {
                                return 1
                            }
                        });
                        sq.classed("active", !sq.classed("active"));
                    })
                    vis.activeSquares = [];
                    square.style("opacity", 1);
                    square.style("fill", vis.highlight)
                    vis.activeSquares.push(square);
                } else {
                    //remove from square array
                    // vis.activeSquares = [];
                    vis.closeNav();
                    // square.style("fill", function (d) {
                    //     return vis.linearColor(vis.mydict2[d.code])
                    // }).style("opacity", function (d) {
                    //     if (vis.mydict2[d.code] == 0) {
                    //         return 0.2
                    //     } else {
                    //         return 1
                    //     }
                    // });
                }
            })
        ;

        vis.labels = vis.gridMap.selectAll(".label")
            .data(vis.mapData, function (d) {
                return d.code;
            });

        // add state labels
        vis.labels.enter()
            .append("text")
            .attr("class", function (d) {
                return "label stateText " + d.code;
            })
            .attr("x", function (d) {
                return ((d.col - 1) * vis.cellSize) + (vis.cellSize / 2);
            })
            .attr("y", function (d) {
                return ((d.row - 1) * vis.cellSize) + (vis.cellSize / 2 + 5);
            })
            .style("text-anchor", "middle")
            .style("font-size", "12pt")
            .text(function (d) {
                return d.code;
            })
            .style("opacity", function (d) {
                if (vis.mydict2[d.code] == 0) {
                    return 0.2
                } else {
                    return 1
                }
            })
            .style("cursor", function (d) {
                if (vis.mydict2[d.code] == 0) {
                    return "not-allowed"
                } else {
                    return "pointer"
                }
            })
            .on("click", function (d) {
                var square = d3.select(this);
                if (vis.mydict2[square["_groups"][0][0]["__data__"].code] == 0)
                    return;

                square = d3.select("." + square["_groups"][0][0]["__data__"].code);
                vis.openNav(square["_groups"][0][0]["__data__"].state, square["_groups"][0][0]["__data__"].code);

                square.classed("active", !square.classed("active"));
                if (square.classed("active")) {
                    vis.activeSquares.forEach(sq => {
                        sq.style("fill", function (d) {
                            return vis.linearColor(vis.mydict2[d.code])
                        }).style("opacity", function (d) {
                            if (vis.mydict2[d.code] == 0) {
                                return 0.2
                            } else {
                                return 1
                            }
                        });
                        sq.classed("active", !sq.classed("active"));
                    })
                    vis.activeSquares = [];
                    square.style("opacity", 1);
                    square.style("fill", vis.highlight)
                    vis.activeSquares.push(square);
                } else {
                    //remove from square array
                    // vis.activeSquares = [];
                    vis.closeNav();
                    // square.style("fill", function (d) {
                    //     return vis.linearColor(vis.mydict2[d.code])
                    // }).style("opacity", function (d) {
                    //     if (vis.mydict2[d.code] == 0) {
                    //         return 0.2
                    //     } else {
                    //         return 1
                    //     }
                    // });
                }
            });

        var defs = vis.svg.append("defs");

        //Append a linearGradient element to the defs and give it a unique id
        var linearGradient = defs.append("linearGradient")
            .attr("id", "linear-gradient");

        //Set the color for the start (0%)
        linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", d3.interpolateBlues(0)); //light blue

        //Set the color for the end (100%)
        linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", d3.interpolateBlues(1)); //dark blue

        // Draw the rectangle and fill with gradient
        vis.svg.append("rect")
            .attr("width", vis.width / 6)
            .attr("x", function (d) {
                // return document.getElementById(vis.parentElement).getBoundingClientRect().right - (vis.width/6)
                return 0.8 * vis.width
            })
            .attr("y", 5 * vis.height / 7)
            .attr("height", 15)
            .style("fill", "url(#linear-gradient)")
            .style("opacity", 1);

        // Legend Text
        vis.svg.append("text")
            .attr("x", function (d) {
                return 0.8 * vis.width + 2
            })
            .attr("y", (5 * vis.height / 7) - 4)
            .text("no. of opportunities")

        //group the axis for legend
        vis.axisGroup = vis.svg.append("g")
            .attr('transform', `translate(${vis.width * 0.8}, ${5 * vis.height / 7 + 15})`)
            .attr('class', "x-axis");

        vis.svg.select(".x-axis").call(vis.xAxis);
    }
}
