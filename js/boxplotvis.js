/*
 * BoxPlotVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 */

class BoxPlotVis {

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

        vis.margin = {top: 20, right: 20, bottom: 200, left: 60};
        vis.barWidth = 20;

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        var svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // var groupCounts = {};
        // var globalCounts = [];
        // var meanGenerator = d3.randomUniform(10);
        // for(let i=0; i<7; i++) {
        //     var randomMean = meanGenerator();
        //     var generator = d3.randomNormal(randomMean);
        //     var key = i.toString();
        //     groupCounts[key] = [];
        //
        //     for(let j=0; j<100; j++) {
        //         var entry = generator();
        //         groupCounts[key].push(entry);
        //         globalCounts.push(entry);
        //     }
        // }
        //
        // // Sort group counts so quantile methods work
        // for(var key in groupCounts) {
        //     var groupCount = groupCounts[key];
        //     groupCounts[key] = groupCount.sort(sortNumber);
        // }
        //
        console.log("BoxPlot");

        // // Perform a numeric sort on an array
        // function sortNumber(a,b) {
        //     return a - b;
        // }


        // Prepare the data for the box plots
        var boxPlotData = [];
        // console.log(groupCounts);
        // console.log(globalCounts);
        // console.log(vis.data);
        let unique = [...new Set(vis.data.map(item => item["Sector"]))];
        console.log(unique);

        var result = {};
        unique.forEach(d => {
            let test = vis.data.filter(obj => {
                return obj["Sector"] === d;
            });
            var col3 = test.map(function (value, index) { //console.log(value.Avg_Salary);
                return value.Avg_Salary;
            });
            col3.sort();
            result[d] = col3;
        });

        // Setup a color scale for filling each box
        var colorScale = d3.scaleOrdinal()
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#98abc5", "#8a89a6", "#7b6888"])
            .domain(Object.keys(result));


        // console.log(Math.max.apply(Math, vis.data.map(function(o) { return o.Avg_Salary; })));
        // console.log(Math.min.apply(Math, vis.data.map(function(o) { return o.Avg_Salary; })));
        // console.log(result);

        // vis.displayData = Array.from(d3.rollup(vis.data, v => v.length, d => d.job_title_sim), ([key, value]) => ({key, value}))

        for (var [key, groupCount] of Object.entries(result)) {

            var record = {};
            var localMin = d3.min(groupCount);
            var localMax = d3.max(groupCount);

            console.log(key);
            console.log(groupCount);

            record["key"] = key;
            record["counts"] = groupCount;
            record["quartile"] = vis.boxQuartiles(groupCount);
            record["whiskers"] = [localMin, localMax];
            record["color"] = colorScale(key);

            boxPlotData.push(record);
        }


        // Compute an ordinal xScale for the keys in boxPlotData
        var xScale = d3.scalePoint()
            .domain(Object.keys(result))
            .rangeRound([0, vis.width])
            .padding([0.5]);

        // Compute a global y scale based on the global counts
        var max = Math.max.apply(Math, vis.data.map(function (o) {
            return o.Avg_Salary;
        }));
        var min = Math.min.apply(Math, vis.data.map(function (o) {
            return o.Avg_Salary;
        }));
        var yScale = d3.scaleLinear()
            .domain([min, max])
            .range([0, vis.height]);

        var axisG = svg.append("g").attr("transform", "translate(25,0)");
        var axisTopG = svg.append("g").attr("transform", "translate(35,0)");

        // Setup the group the box plot elements will render in
        var g = svg.append("g")
            .attr("transform", "translate(20,5)");

        // Draw the box plot vertical lines
        var verticalLines = g.selectAll(".verticalLines")
            .data(boxPlotData)
            .enter()
            .append("line")
            .attr("x1", function (datum) {
                    return xScale(datum.key) + vis.barWidth / 2;
                }
            )
            .attr("y1", function (datum) {
                    var whisker = datum.whiskers[0];
                    return yScale(whisker);
                }
            )
            .attr("x2", function (datum) {
                    return xScale(datum.key) + vis.barWidth / 2;
                }
            )
            .attr("y2", function (datum) {
                    var whisker = datum.whiskers[1];
                    return yScale(whisker);
                }
            )
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("fill", "none");

        // Draw the boxes of the box plot, filled in white and on top of vertical lines
        var rects = g.selectAll("rect")
            .data(boxPlotData)
            .enter()
            .append("rect")
            .attr("width", vis.barWidth)
            .attr("height", function (datum) {
                    var quartiles = datum.quartile;
                    var height = yScale(quartiles[2]) - yScale(quartiles[0]);
                    return height;
                }
            )
            .attr("x", function (datum) {
                    return xScale(datum.key);
                }
            )
            .attr("y", function (datum) {
                    return yScale(datum.quartile[0]);
                }
            )
            .attr("fill", function (datum) {
                    return datum.color;
                }
            )
            .attr("stroke", "#000")
            .attr("stroke-width", 1);

        // Now render all the horizontal lines at once - the whiskers and the median
        var horizontalLineConfigs = [
            // Top whisker
            {
                x1: function (datum) {
                    return xScale(datum.key)
                },
                y1: function (datum) {
                    return yScale(datum.whiskers[0])
                },
                x2: function (datum) {
                    return xScale(datum.key) + vis.barWidth
                },
                y2: function (datum) {
                    return yScale(datum.whiskers[0])
                }
            },
            // Median line
            {
                x1: function (datum) {
                    return xScale(datum.key)
                },
                y1: function (datum) {
                    return yScale(datum.quartile[1])
                },
                x2: function (datum) {
                    return xScale(datum.key) + vis.barWidth
                },
                y2: function (datum) {
                    return yScale(datum.quartile[1])
                }
            },
            // Bottom whisker
            {
                x1: function (datum) {
                    return xScale(datum.key)
                },
                y1: function (datum) {
                    return yScale(datum.whiskers[1])
                },
                x2: function (datum) {
                    return xScale(datum.key) + vis.barWidth
                },
                y2: function (datum) {
                    return yScale(datum.whiskers[1])
                }
            }
        ];

        for (var i = 0; i < horizontalLineConfigs.length; i++) {
            var lineConfig = horizontalLineConfigs[i];

            // Draw the whiskers at the min for this series
            var horizontalLine = g.selectAll(".whiskers")
                .data(boxPlotData)
                .enter()
                .append("line")
                .attr("x1", lineConfig.x1)
                .attr("y1", lineConfig.y1)
                .attr("x2", lineConfig.x2)
                .attr("y2", lineConfig.y2)
                .attr("stroke", "#000")
                .attr("stroke-width", 1)
                .attr("fill", "none");
        }
        ;

        // Setup a scale on the left
        var axisLeft = d3.axisLeft(yScale);
        axisG.append("g")
            .call(axisLeft);

        // Setup a series axis on the top
        var axisTop = d3.axisTop(xScale);
        axisTopG.append("g")
            .call(axisTop);


        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }

    /*
     * Data wrangling
     */
    wrangleData() {
        let vis = this;
        // Here you want to aggregate the data by age, not by day (as it is given)!
        vis.updateVis();
    }

    /*
     * The drawing function
     */
    updateVis() {
        let vis = this;

    }

    boxQuartiles(d) {
        return [
            d3.quantile(d, .25),
            d3.quantile(d, .5),
            d3.quantile(d, .75)
        ];
    }
}
