
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
        // console.log(vis.data);
        // var arr=d3.rollup(vis.data, v => v.length, d => d.job_title_sim);
        // console.log(arr);
        let c=Array.from(d3.rollup(vis.data, v => v.length, d => d.job_title_sim), ([key, value]) => ({key, value}))
        // c.sort((a,b)=>b.value-a.value);
        console.log(c);
        // console.log(c.map(d=>d.key));
        // console.log(c.map(d=>d.value));
        vis.displayData=c;

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
        // console.log("domain"+(vis.displayData).map(d=>d.key));
        // console.log("d"+Object.entries(vis.data).map(function(value,index) {return value[0]; }));
        vis.color = d3.scaleOrdinal(d3.schemeBlues[7])
            .domain(vis.displayData.map(d=>d.key));

        // console.log(1);

        vis.radius = Math.min(vis.width, vis.height) / 2;
        vis.donutWidth = 60; //This is the size of the hole in the middle

        vis.arc = d3.arc()
            .innerRadius(vis.radius - vis.donutWidth)
            .outerRadius(vis.radius);

        vis.pie = d3.pie()
            .value(function (d) {
                // console.log(d[1]);
                return d[1];
            })
            .sort(null);
        // console.log(vis.displayData.map(Object.values));
        vis.path = vis.svg.selectAll('path')
            .data(vis.pie(vis.displayData.map(Object.values)))
            .enter()
            .append('path')
            .attr('d', vis.arc)
            .attr('fill', function (d, i) {
                 // console.log(d.data[0]);
                return vis.color(d.data[0]);
            })
            .attr('transform', 'translate(200, 200)');


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
