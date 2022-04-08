class MiniBarChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];
        this.initVis()
    }

    initVis() {
        let vis = this;

        // set width and height
        vis.margin = {top: 60, right: 30, bottom: 30, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

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


        let brush = d3.brushY()
            .extent([[0, 0], [vis.width, vis.height]])
            .on("brush", brushed);

        vis.svg.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, [5, 128])
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", 128 + 7);

        vis.svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height);

        // var verticalRectangle = d3.select("#clip")
        //     .attr("width", 100)
        //     .attr("height", 500)
        //     .append("g")

        // var yBrush = d3.brushY()
        //     .extent([[0,0], [100,500]]) //Area you want your brush to be movable in
        //     .on("brush", brushed);

        // verticalRectangle.append("g")
        //     .attr("class", "brush")
        //     .call(yBrush)
        //     .call(yBrush.move, [5, 100]);

        // Append x and y axis
        // vis.yAxis = d3.axisLeft()
        //     .scale(vis.y);
        //
        // vis.svg.append("g")
        //     .attr("class", "y-axis axis")
        //     .call(vis.yAxis);
        //
        // vis.xAxis = d3.axisBottom()
        //     .scale(vis.x);
        //
        // vis.svg.append("g")
        //     .attr("class", "x-axis2 axis")
        //     .attr("transform", "translate(0," + vis.height + ")")
        //     .call(vis.xAxis);

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
        vis.displayData = items.reverse();//.slice(0, 10).reverse();

        vis.y.domain(vis.displayData.map(function (d) {
            return d[0];
        }));
        vis.x.domain([0, d3.max(vis.displayData, function (d) {
            return d[1];
        })])

        let maxVal = d3.max(vis.displayData, function(d) {
            return d[1];
        });

        let minVal = d3.min(vis.displayData, function(d) {
            return d[1];
        });

        vis.linearColor = d3.scaleSequential(d3.interpolateOrRd).domain([minVal,maxVal])

        this.updateVis()
    }

    updateVis() {
        let vis = this;

        // select all bars
        let bars = vis.svg.selectAll("." + vis.parentElement + "Rect")
            .data(vis.displayData);

        // enter, merge the bars
        bars.enter().append("rect")
            .attr("class", vis.parentElement + "Rect")
            .merge(bars)
            // .transition(500)
            .style("fill", function (d) {
                return 'grey';
                // return vis.linearColor(d[1]);
            })
            .attr("x", 1)
            .attr("y", function (d) {
                console.log(vis.y(d[0]))
                return vis.y(d[0]);
            })
            .attr("width", function (d) {
                return vis.x(d[1]);
            })
            .attr("height", vis.y.bandwidth())
        ;

        bars.exit().remove();
    }
}