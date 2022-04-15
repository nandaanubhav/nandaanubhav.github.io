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
        this.highlight = ["#ffd700", "#9eebcf", "#96ccff", "#ff725c", "#ffa3d7"];

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top:0, right:0, bottom:20, left:0}
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        let columns = 13, rows = 8;
        // calculate cellSize based on dimensions of svg
        // vis.cellSize;
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

        vis.svg = d3.select("#"+vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);


        // vis.svg2 = d3.select("#mySidebar")
        //     .append("svg")
        //     .attr("width", "200px")
        //     .attr("height", "200px");



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

        let dict =
            {
                // Python: 0,
                // spark: 0,
                // aws: 0,
                // excel: 0,
                // sql: 0,
                // sas: 0,
                // keras: 0,
                // pytorch: 0,
                // scikit: 0,
                // tensor: 0,
                // hadoop: 0,
                // tableau: 0,
                // bi: 0,
                // flink: 0,
                // mongo: 0,
                // google_an: 0
            }

        const unique = [...new Set(vis.mapData.map(item => item.code))];
            // console.log(unique)

        unique.forEach(row => {
            dict[row] = 0;
        })

        // console.log(dict)

        vis.data.forEach(row => {
            dict[row.State] += 1
            // for (var key in dict) {
            //     if (row[key] == 1) {
            //         dict[key] += 1
            //     }
            // }
        })
vis.mydict2 = dict
        // console.log(dict)
        // // Create items array
        var items = Object.keys(dict).map(function (key) {
            return [key, dict[key]];
        });

            // console.log(items)

        vis.displayData = items

        let maxVal = d3.max(vis.displayData, function(d) {
            return d[1];
        });

        let minVal = d3.min(vis.displayData, function(d) {
            return d[1];
        });

        // console.log(maxVal)
        // console.log(minVal)
        vis.linearColor = d3.scaleSequential(d3.interpolateBlues).domain([0, maxVal])

        vis.updateVis()
    }


    updateVis() {
        let vis = this;

        vis.states = vis.gridMap.selectAll(".state")
            .data(vis.mapData, function(d) { return d.code; });

        var colIndex=0;
        // draw state rects
        vis.states.enter()
            .append("rect")
            .attr("class", function(d) { return "state " + d.code; })
            .attr("x", function(d) { return (d.col - 1) * vis.cellSize; })
            .attr("y", function(d) { return (d.row - 1) * vis.cellSize; })
            .attr("width", vis.cellSize)
            .attr("height", vis.cellSize)
            .style("fill", function (d) {
                // console.log(d.code + ": " + vis.mydict2[d.code])
                return vis.linearColor(vis.mydict2[d.code])
            })
            .style("opacity", function (d) {
                if (vis.mydict2[d.code]==0){
                    return 0.2
                } else {
                    return 0.6
                }
            })
        // keep track of whether square is clicked through toggling class
        // cycle through five colours each time square is made active
        .on("click", function(d) {
            var square = d3.select(this);
            square.classed("active", !square.classed("active"));
            if (square.classed("active")) {
                square.style("opacity", 1);
                colIndex++;
                switch(colIndex%5) {
                    case 0:
                        square.style("fill", vis.highlight[0])
                        break;
                    case 1:
                        square.style("fill", vis.highlight[1])
                        break;
                    case 2:
                        square.style("fill", vis.highlight[2])
                        break;
                    case 3:
                        square.style("fill", vis.highlight[3])
                        break;
                    case 4:
                        square.style("fill", vis.highlight[4])
                        break;
                }
            } else {
                square.style("fill", function (d) {
                    return vis.linearColor(vis.mydict2[d.code])
                }).style("opacity", function (d) {
                    if (vis.mydict2[d.code]==0){
                        return 0.2
                    } else {
                        return 0.6
                    }
                });
            }
        })
        ;

        vis.labels = vis.gridMap.selectAll(".label")
            .data(vis.mapData, function(d) { return d.code; });

        // add state labels
        vis.labels.enter()
            .append("text")
            .attr("class", function(d) { return "label " + d.code; })
            .attr("x", function(d) {
                return ((d.col - 1) * vis.cellSize) + (vis.cellSize / 2);
            })
            .attr("y", function(d) {
                return ((d.row - 1) * vis.cellSize) + (vis.cellSize /2 + 5);
            })
            .style("text-anchor", "middle")
            .style("font-size", "12pt")
            .text(function(d) { return d.code; });

        // // vis.states = vis.gridMap.selectAll(".state")
        // //     .data(vis.mapData, function(d) { return d.code; });
        //
        // // vis.states.transition()
        // //         .duration(500)
        // //         .attr("x", function(d) { return (+d.col - 1) * vis.cellSize; })
        // //         .attr("y", function(d) { return (+d.row - 1) * vis.cellSize; })
        // //         .style("opacity", function(d) {
        // //             if (d3.select(this).classed("active")) { return 1; } else {return 0.2; }
        // //         });
        // //
        // //     // enter extra states
        //     vis.states.enter()
        //         .append("rect")
        //         .attr("class", function(d) { return "state " + d.code; })
        //         .attr("x", function(d) { return (+d.col - 1) * vis.cellSize; })
        //         .attr("y", function(d) { return (+d.row - 1) * vis.cellSize; })
        //         .attr("width", vis.cellSize)
        //         .attr("height", vis.cellSize)
        //         .style("fill", "red")
        //         // .on("click", function(d) {
        //         //     var square = d3.select(this);
        //         //     square.classed("active", !square.classed("active"));
        //         //     if (square.classed("active")) {
        //         //         square.style("opacity", 1);
        //         //         colIndex++;
        //         //         switch(colIndex%5) {
        //         //             case 0:
        //         //                 square.style("fill", highlight[0])
        //         //                 break;
        //         //             case 1:
        //         //                 square.style("fill", highlight[1])
        //         //                 break;
        //         //             case 2:
        //         //                 square.style("fill", highlight[2])
        //         //                 break;
        //         //             case 3:
        //         //                 square.style("fill", highlight[3])
        //         //                 break;
        //         //             case 4:
        //         //                 square.style("fill", highlight[4])
        //         //                 break;
        //         //         }
        //         //     } else {
        //         //         square.style("fill", "#c0c0c0").style("opacity", 0.2);
        //         //     }
        //         // });
        // //
        // //     // hide extra state by setting opacity to zero
        //     vis.states.exit()
        //         .style("opacity", 0);
        // //
        // //     // update labels
        //     vis.labels = vis.gridMap.selectAll(".label")
        //         .data(vis.mapData, function(d) { return d.code; });
        // //
        //     vis.labels.transition()
        //         .duration(500)
        //         .attr("x", function(d) {
        //             return ((d.col - 1) * vis.cellSize) + (vis.cellSize / 2);
        //         })
        //         .attr("y", function(d) {
        //             return ((d.row - 1) * vis.cellSize) + (vis.cellSize /2 + 5);
        //         })
        //         .style("opacity", 1);
        // //
        //     vis.labels.enter()
        //         .append("text")
        //         .attr("class", function(d) { return "label " + d.code; })
        //         .attr("x", function(d) {
        //             return ((d.col - 1) * vis.cellSize) + (vis.cellSize / 2);
        //         })
        //         .attr("y", function(d) {
        //             return ((d.row - 1) * vis.cellSize) + (vis.cellSize /2 + 5);
        //         })
        //         .style("text-anchor", "middle")
        //         .text(function(d) { return d.code; });
        // //
        //     vis.labels.exit()
        //         .style("opacity", 0);
        // }
    }
}

// function that generates a nested array for square grid
function makeGridData(ncol, nrow, cellsize) {
    var gridData = [];
    var xpos = 1;  // starting xpos and ypos at 1 so the stroke will show when we make the grid below
    var ypos = 1;

    // calculate width and height of the cell based on width and height of the canvas
    var cellSize = cellsize;

    // iterate for rows
    for (var row = 0; row < nrow; row++) {
        gridData.push([]);

        // iterate for cells/columns inside each row
        for (var col = 0; col < ncol; col++) {
            gridData[row].push({
                x: xpos,
                y: ypos,
                width: cellSize,
                height: cellSize
            });

            // increment x position (moving over by 50)
            xpos += cellSize;
        }

        // reset x position after a row is complete
        xpos = 1;
        // increment y position (moving down by 50)
        ypos += cellSize;
    }
    return gridData;
}
