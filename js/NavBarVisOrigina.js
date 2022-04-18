class NavBarVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];
        this.selectedCountry = "none"
        this.state = "none"
        this.initVis()
    }

    updateCountry(someText, state) {
        document.getElementById("selectedCountry").innerHTML = someText;
        this.selectedCountry = someText;
        this.state = state
    }

    updateTotalOpportunities(text) {
        document.getElementById("totalOpportunities-text").innerHTML = "Total Opportunities: " + text
    }

    updateSalaryData(row) {
        const avgSalary = d3.sum(row, d => d.Avg_Salary) / row.length;
        const maxSalary = d3.sum(row, d => d.Upper_Salary) / row.length;
        const lowSalary = d3.sum(row, d => d.Lower_Salary) / row.length;

        document.getElementById("salaryRange-text").innerHTML = "$" + parseInt(lowSalary) + "K to $" + parseInt(maxSalary) + "K"
        document.getElementById("salaryAvg-text").innerHTML = "$" + parseInt(avgSalary) + ",000"
    }

    initVis() {
        let vis = this;

        // set width and height
        vis.margin = {top: 20, right: -80, bottom: 30, left: 180};
        vis.width = (document.getElementById("blabla").getBoundingClientRect().width) - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title2')
            .append('text')
            .text("Top Sectors")
            .attr('transform', `translate(0, -5)`)
            .attr('text-anchor', 'middle');

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
        let dict = {};
        if (vis.state == "none")
            return

        var grouped_data = Array.from( d3.group(vis.data, d => d.State), ([key, value]) => ({key, value}))
        var selectedRow;

        grouped_data.forEach(row => {
            if (row.key == vis.state)
                selectedRow = row.value
        })

        vis.updateTotalOpportunities(selectedRow.length)
        vis.updateSalaryData(selectedRow)

        const unique = [...new Set(selectedRow.map(item => item.Sector))];

        unique.forEach(row => {
            dict[row] = 0;
        })

        selectedRow.forEach(row => {
            dict[row.Sector] += 1
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
        vis.displayData = items.slice(0, 5).reverse()

        vis.linearColor = d3.scaleSequential(d3.interpolateBlues).domain([0, d3.max(vis.displayData, function(d) {
            return d[1];
        })])

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

        // update x and y axis
        vis.svg.select(".y-axis").transition().call(vis.yAxis);
        vis.svg.select(".x-axis2").transition().call(vis.xAxis);


        bars.exit().remove();
    }
}