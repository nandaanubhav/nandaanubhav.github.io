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

        vis.margin = {top: 50, right: 0, bottom: 170, left: 120};
        vis.barWidth = 20;

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "box-plot-tooltip")
            .attr('id', 'boxPlotTooltip');

        // Compute an ordinal xScale for the keys in boxPlotData
        vis.x = d3.scalePoint()
            .rangeRound([0, vis.width])
            .padding([0.5]);

        // Compute a global y scale based on the global counts
        vis.y = d3.scaleLinear()
            .domain([0, Math.max.apply(Math, vis.data.map(function (o) {
                return o.Avg_Salary;
            }))])
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom(vis.x);
        vis.yAxis = d3.axisLeft(vis.y);

        // vis.colorScale = d3.scaleOrdinal(d3.schemeBlues[7]);

        // vis.xAxisGroup = vis.svg.append("g").attr("transform", "translate(35,"+vis.height+")");
        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis")
            .attr("text-anchor", "middle")
            .append("text")
            .attr("x", 20)
            .attr("y", -10)
            .attr("transform", "translate(0,0)");

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }

    /*
     * Data wrangling
     */
    wrangleData() {
        let vis = this;

        // Here you want to aggregate the data by age, not by day (as it is given)!
        // Prepare the data for the box plots

        // vis.selectedCategory = document.getElementById("boxPlotCategorySelector").value;
        vis.selectedCategory = document.querySelector('input[name="boxPlotCategorySelector"]:checked').value;

        var boxPlotData = [];
        let unique = [...new Set(vis.data.map(item => item[vis.selectedCategory]))];
        // console.log(unique);

        var result = {};
        unique.forEach(d => {
            let test = vis.data.filter(obj => {
                return obj[vis.selectedCategory] === d;
            });
            var col3 = test.map(function (value, index) { //console.log(value.Avg_Salary);
                return value.Avg_Salary;
            });
            col3.sort();
            result[d] = col3;
        });

        // console.log(result);
        // vis.displayData = Array.from(d3.rollup(vis.data, v => v.length, d => d.job_title_sim), ([key, value]) => ({key, value}))

        for (var [key, groupCount] of Object.entries(result)) {

            var record = {};
            var localMin = d3.min(groupCount);
            var localMax = d3.max(groupCount);

            // console.log(key);
            // console.log(groupCount);

            record["key"] = key;
            record["counts"] = groupCount;
            record["quartile"] = vis.boxQuartiles(groupCount);
            record["whiskers"] = [localMin, localMax];
            // record["color"] = vis.colorScale(key);

            boxPlotData.push(record);
        }

        if (boxPlotData.length > 8) {
            vis.displayData = boxPlotData.filter(obj => {
                // console.log(obj.counts.length);
                return obj.counts.length > 5;
            });
        } else {
            vis.displayData = boxPlotData;
        }

        vis.displayData.sort((a, b) => {
            return b["quartile"][1] - a["quartile"][1]
        });
        // console.log(vis.displayData);
        // vis.displayData = boxPlotData;

        vis.updateVis();
    }

    /*
     * The drawing function
     */
    updateVis() {
        let vis = this;


        // Setup a color scale for filling each box
        // vis.colorScale.domain(vis.displayData.map(d => d.key));
        vis.x.domain(vis.displayData.map(d => d.key));

        // Draw the box plot vertical lines
        let verticalLines = vis.svg.selectAll(".verticalLines")
            .data(vis.displayData);

        verticalLines
            .enter()
            .append("line")
            .attr("class", "verticalLines")
            .merge(verticalLines)
            .attr("x1", function (datum) {
                    return vis.x(datum.key);
                }
            )
            .attr("y1", function (datum) {
                    var whisker = datum.whiskers[0];
                    return vis.y(whisker);
                }
            )
            .attr("x2", function (datum) {
                    return vis.x(datum.key);
                }
            )
            .attr("y2", function (datum) {
                    var whisker = datum.whiskers[1];
                    return vis.y(whisker);
                }
            )
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("fill", "none");

        verticalLines.exit().remove();

        // Draw the boxes of the box plot, filled in white and on top of vertical lines
        let rects = vis.svg.selectAll("rect")
            .data(vis.displayData);

        rects
            .enter()
            .append("rect")
            .merge(rects)
            .attr("width", vis.barWidth)
            .attr("height", function (datum) {
                    var quartiles = datum.quartile;
                    var height = vis.y(quartiles[0]) - vis.y(quartiles[2]);
                    // console.log(height);
                    return height;
                }
            )
            .attr("x", function (datum) {
                return vis.x(datum.key) - vis.barWidth / 2;
            })
            .attr("y", function (datum) {
                return vis.y(datum.quartile[2]);
            })
            .attr("fill", d3.interpolateBlues(0.7))
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .on('mouseover', function (event, d) {
                // console.log(d);
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(` <table style="margin-top: 2.5px;">
                            <tr><td>Max: </td><td style="text-align: right">${d3.format(".2f")(d.whiskers[1])}</td></tr>
                            <tr><td>Q3: </td><td style="text-align: right">${d3.format(".2f")(d.quartile[2])}</td></tr>
                            <tr><td>Median: </td><td style="text-align: right">${d3.format(".2f")(d.quartile[1])}</td></tr>
                            <tr><td>Q1: </td><td style="text-align: right">${d3.format(".2f")(d.quartile[0])}</td></tr>
                            <tr><td>Min: </td><td style="text-align: right">${d3.format(".2f")(d.whiskers[0])}</td></tr>
                            </table>`
                    );
            })
            .on('mouseout', function (event, d) {
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        rects.exit().remove();

        // Now render all the horizontal lines at once - the whiskers and the median
        var horizontalLineConfigs = [
            // Top whisker
            {
                x1: function (datum) {
                    return vis.x(datum.key) - vis.barWidth / 2
                },
                y1: function (datum) {
                    return vis.y(datum.whiskers[0])
                },
                x2: function (datum) {
                    return vis.x(datum.key) + vis.barWidth / 2
                },
                y2: function (datum) {
                    return vis.y(datum.whiskers[0])
                }
            },
            // Median line
            {
                x1: function (datum) {
                    return vis.x(datum.key) - vis.barWidth / 2
                },
                y1: function (datum) {
                    return vis.y(datum.quartile[1])
                },
                x2: function (datum) {
                    return vis.x(datum.key) + vis.barWidth / 2
                },
                y2: function (datum) {
                    return vis.y(datum.quartile[1])
                }
            },
            // Bottom whisker
            {
                x1: function (datum) {
                    return vis.x(datum.key) - vis.barWidth / 2
                },
                y1: function (datum) {
                    return vis.y(datum.whiskers[1])
                },
                x2: function (datum) {
                    return vis.x(datum.key) + vis.barWidth / 2
                },
                y2: function (datum) {
                    return vis.y(datum.whiskers[1])
                }
            }
        ];

        // console.log(horizontalLineConfigs);

        // Draw the whiskers at the min for this series
        let topWhisker = vis.svg.selectAll(".top-whisker")
            .data(vis.displayData);

        topWhisker
            .enter()
            .append("line")
            .attr("class", "top-whisker")
            .merge(topWhisker)
            .attr("x1", horizontalLineConfigs[0].x1)
            .attr("y1", horizontalLineConfigs[0].y1)
            .attr("x2", horizontalLineConfigs[0].x2)
            .attr("y2", horizontalLineConfigs[0].y2)
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("fill", "none");

        let medianLine = vis.svg.selectAll(".median-line")
            .data(vis.displayData);

        medianLine
            .enter()
            .append("line")
            .attr("class", "median-line")
            .merge(medianLine)
            .attr("x1", horizontalLineConfigs[1].x1)
            .attr("y1", horizontalLineConfigs[1].y1)
            .attr("x2", horizontalLineConfigs[1].x2)
            .attr("y2", horizontalLineConfigs[1].y2)
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("fill", "none");


        let bottomWhisker = vis.svg.selectAll(".bottom-whisker")
            .data(vis.displayData);

        bottomWhisker
            .enter()
            .append("line")
            .attr("class", "bottom-whisker")
            .merge(bottomWhisker)
            .attr("x1", horizontalLineConfigs[2].x1)
            .attr("y1", horizontalLineConfigs[2].y1)
            .attr("x2", horizontalLineConfigs[2].x2)
            .attr("y2", horizontalLineConfigs[2].y2)
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("fill", "none");

        topWhisker.exit().remove();
        medianLine.exit().remove();
        bottomWhisker.exit().remove();

        // Setup a scale on the left
        vis.svg.select(".x-axis").call(vis.xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function (d) {
                return "rotate(-45)"
            });

        // Setup a series axis on the top
        vis.svg.select(".y-axis")
            .call(vis.yAxis)
        vis.yAxisGroup.merge(vis.yAxisGroup).text("Avg Salary (in K)");


        // vis.yAxisGroup.text("Te");


    }

    boxQuartiles(d) {
        return [
            d3.quantile(d, .25),
            d3.quantile(d, .5),
            d3.quantile(d, .75)
        ];
    }
}