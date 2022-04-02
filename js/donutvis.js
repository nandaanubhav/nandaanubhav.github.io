
/*
 * AgeVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 */

class DonutVis {

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
        console.log("here");
        vis.margin = { top: 20, right: 20, bottom: 200, left: 60 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right,
            vis.height = 500 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
        vis.radius = Math.min(vis.width, vis.height) / 2 - vis.margin.right - vis.margin.left;

        vis.data = {a: 9, b: 20, c: 30, d: 8, e: 12};
        //console.log(Object.entries(vis.data).map(function(value,index) {return value[0]; }));
        // vis.color = d3.scaleOrdinal()
        //     .domain(Object.entries(vis.data).map(function(value,index) {return value[0]; }))
        //     .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56","#98abc5", "#8a89a6", "#7b6888"]);

        vis.color = d3.scaleOrdinal()
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#98abc5", "#8a89a6", "#7b6888"]);

        console.log(1);

        vis.radius = Math.min(vis.width, vis.height) / 2;
        vis.donutWidth = 75; //This is the size of the hole in the middle

        vis.arc = d3.arc()
            .innerRadius(vis.radius - vis.donutWidth)
            .outerRadius(vis.radius);

        vis.pie = d3.pie()
            .value(function (d) {
                console.log(d[1]);
                return d[1];
            })
            .sort(null);

        vis.path = vis.svg.selectAll('path')
            .data(vis.pie(Object.entries(vis.data)))
            .enter()
            .append('path')
            .attr('d', vis.arc)
            .attr('fill', function (d, i) {
                console.log(d.data[0]);
                return vis.color(d.data[0]);
            })
            .attr('transform', 'translate(200, 200)');

        // vis.pie = d3.pie()
        //     .value(function(d) {console.log(d); Object.entries(vis.data).map(function(value,index) {return value[1]; })});
        // // vis.data_ready = vis.pie(d3.entries(vis.data));
        //
        // // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        // vis.svg
        //     .selectAll('whatever')
        //     .data(vis.data,d=>d.job_title_sim)
        //     .enter()
        //     .append('path')
        //     .attr('d', function(d) {
        //         console.log(d);
        //         return d3.arc()
        //             .innerRadius(100)         // This is the size of the donut hole
        //             .outerRadius(200);
        //     })
        //     .attr('fill', function(d){ return(vis.color(d.job_title_sim)) })
        //     .attr("stroke", "black")
        //     .style("stroke-width", "2px")
        //     .style("opacity", 0.7);
        //
        //

        // Scales and axes
        // vis.x = d3.scaleLinear()
        //     .range([0, vis.width])
        //     .domain([0, 99]);
        //
        // vis.y = d3.scaleLinear()
        //     .range([vis.height, 0]);
        //
        // vis.xAxis = d3.axisBottom()
        //     .scale(vis.x);
        //
        // vis.yAxis = d3.axisLeft()
        //     .scale(vis.y);



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


}
