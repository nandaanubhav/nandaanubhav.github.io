class BarChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];
        this.selectionRange = []
        this.initVis()
    }

    initVis() {
        let vis = this;

        // set width and height
        vis.margin = {top: 60, right: 30, bottom: 30, left: 200};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
        vis.selectionRange = [0, vis.height];

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // // add title
        // vis.svg.append('g')
        //     .attr('class', 'title bar-title')
        //     .append('text')
        //     .text("Skills in Demand")
        //     .attr('transform', `translate(${vis.width / 2}, 0)`)
        //     .attr('text-anchor', 'middle');

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

        // set x and y axis scales
        vis.x = d3.scaleLinear().range([0, vis.width - vis.margin.right - vis.margin.left]);
        vis.y = d3.scaleBand().rangeRound([vis.height, 0]).padding(0.2);


        // Append x and y axis
        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "y-axis axis")
            .call(vis.yAxis);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.svg.append("g")
            .attr("class", "x-axis2 axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);

        this.wrangleData();
    }

    wrangleData() {
        let vis = this;
        vis.displayData = [];

        let dict =
            {
                Python: 0,
                spark: 0,
                aws: 0,
                excel: 0,
                sql: 0,
                sas: 0,
                keras: 0,
                pytorch: 0,
                scikit: 0,
                tensor: 0,
                hadoop: 0,
                tableau: 0,
                bi: 0,
                flink: 0,
                mongo: 0,
                google_an: 0
            }

        vis.data.forEach(row => {
            for (var key in dict) {
                if (row[key] == 1) {
                    dict[key] += 1
                }
            }
        })

        // Create items array
        var items = Object.keys(dict).map(function (key) {
            return [key, dict[key]];
        });

        // Sort the array based on the second element
        items.sort(function (first, second) {
            return second[1] - first[1];
        });

        // Create a new array with only the first 10 items
        vis.displayData = items.reverse(); //.slice(0, 10)

        vis.y.domain(vis.displayData.map(function (d) {
            return d[0];
        }));

        let maxVal = d3.max(vis.displayData, function(d) {
            return d[1];
        });

        let minVal = d3.min(vis.displayData, function(d) {
            return d[1];
        });

        vis.linearColor = d3.scaleSequential(d3.interpolateOrRd).domain([minVal,maxVal])

        vis.displayData = [];

        items.forEach(d => {
            console.log("--------------------")


            if ((vis.y(d[0]) > vis.selectionRange[0])&&(vis.y(d[0]) < vis.selectionRange[1])) {
                vis.displayData.push(d);
            }
            console.log("END--------------------")
        })


        vis.y.domain(vis.displayData.map(function (d) {
            return d[0];
        }));
        vis.x.domain([0, d3.max(vis.displayData, function (d) {
            return d[1];
        })])

        this.updateVis()
    }

    updateVis() {
        let vis = this;
console.log(vis.displayData)
        // select all bars
        let bars = vis.svg.selectAll("." + vis.parentElement + "Rect")
            .data(vis.displayData);

        // enter, merge the bars
        bars.enter().append("rect")
            .attr("class", vis.parentElement + "Rect")
            .merge(bars)
            .transition()
            .style("fill", function (d) {
                // return 'blue';
                return vis.linearColor(d[1]);
            })
            .attr("x", 1)
            .attr("y", function (d) {
                return vis.y(d[0]);
            })
            .attr("width", function (d) {
                return vis.x(d[1]);
            })
            .attr("height", vis.y.bandwidth())
        ;

        // add hover functionality for tooltip
        vis.svg.selectAll("." + vis.parentElement + "Rect").on('mouseover', function (event, d) {
            d3.select(this)
                .transition()
                .style('fill', 'green');
            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 5 + "px")
                .style("top", event.pageY + "px")
                .html(`
                         <div style="border: thin solid red; border-radius: 5px; background: wheat; padding: 15px">
                             <h3> ${d[0]}</h3>
                             <h4> Total Listings: ${d[1].toLocaleString("en-US")}</h4>                          
                         </div>`);
        })
            .on('mouseout', function (event, d) {
                d3.select(this)
                    .transition()
                    .style('fill', function (d) {
                        return vis.linearColor(d[1]);
                    })
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })

        // update x and y axis
        vis.svg.select(".y-axis").transition().call(vis.yAxis);
        vis.svg.select(".x-axis2").transition().call(vis.xAxis);


        bars.exit().remove();
    }
}