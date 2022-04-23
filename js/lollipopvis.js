/* * * * * * * * * * * * * *
*      class LollipopVis   *
* * * * * * * * * * * * * */


class LollipopVis {

    // constructor method to initialize LollipopVis object
    constructor(parentElement, data, jobTitle, sector, otherSector) {
        this.parentElement = parentElement;
        this.data = data;
        this.jobTitle = jobTitle;
        this.sector = sector;
        this.otherSector = otherSector;
        this.displayData = [];
        this.skills = ["Python", "spark", "aws", "excel", "sql", "sas", "keras", "pytorch", "scikit", "tensor", "hadoop", "tableau", "bi", "flink", "mongo", "google_an"];

        this.initVis()
    }


    initVis() {
        let vis = this;

        vis.margin = {top: 40, right: 0, bottom: 50, left: 25};
        vis.marginSecond = {top: 40, right: 15, bottom: 50, left: 0};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width / 2 - vis.margin.left - vis.margin.right;
        vis.widthSecond = document.getElementById(vis.parentElement).getBoundingClientRect().width / 2 - vis.marginSecond.left - vis.marginSecond.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.svgSecond = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.marginSecond.left + vis.marginSecond.right)
            .attr("height", vis.height + vis.marginSecond.top + vis.marginSecond.bottom)
            .append('g')
            .attr('transform', `translate (${vis.marginSecond.left}, ${vis.marginSecond.top})`);

        // // Overlay with path clipping
        // vis.svg.append("defs").append("clipPath")
        //     .attr("id", "clip")
        //     .append("rect")
        //     .attr("width", vis.width)
        //     .attr("height", vis.height);

        vis.title = vis.svg.append('g')
            .attr('class', 'title lollipop-title')
            .append('text')
            .attr('transform', `translate(${vis.width / 2}, -10)`)
            .attr('text-anchor', 'middle');

        vis.titleSecond = vis.svgSecond.append('g')
            .attr('class', 'title lollipop-title')
            .append('text')
            .attr('transform', `translate(${vis.width / 2}, -10)`)
            .attr('text-anchor', 'middle');

        // Scales
        vis.x = d3.scaleBand()
            .rangeRound([0, vis.width])
            .padding(1.2);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom(vis.x);

        vis.yAxisTicks = [];

        vis.yAxis = d3.axisLeft(vis.y);

        vis.xSecond = d3.scaleBand()
            .rangeRound([0, vis.width])
            .padding(1.2);

        vis.ySecond = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxisSecond = d3.axisBottom(vis.xSecond);

        vis.yAxisSecond = d3.axisLeft(vis.ySecond);

        vis.svg.append("g")
            .attr("class", "y-axis-bar y-axis axis");

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + (vis.height) + ")");

        vis.svgSecond.append("g")
            .attr("class", "y-axis-bar y-axis axis");

        vis.svgSecond.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + (vis.height) + ")");


        this.wrangleData(vis.jobTitle, vis.sector, vis.otherSector);
    }

    wrangleData(jobTitle, sector, otherSector) {
        let vis = this;

        // console.log(sector);
        vis.sector = sector;
        vis.otherSector = otherSector;
        vis.displayData = [];
        let filteredData = vis.data.filter(x => x["job_title_sim"] === jobTitle).filter(x => x["Sector"] === sector);
        vis.skills.forEach(d => {
            vis.displayData.push({'Skill': d, 'Count': filteredData.filter(x => x[d] === 1).length});
        });

        vis.otherSectorData = [];
        let filteredDataOtherSector = vis.data.filter(x => x["job_title_sim"] === jobTitle).filter(x => x["Sector"] === otherSector);

        vis.skills.forEach(d => {
            vis.otherSectorData.push({'Skill': d, 'Count': filteredDataOtherSector.filter(x => x[d] === 1).length});
        });

        vis.displayData.sort((a, b) => b.Count - a.Count);
        vis.otherSectorData.sort((a, b) => b.Count - a.Count);
        vis.displayData = vis.displayData.slice(0, 3);
        vis.otherSectorData = vis.otherSectorData.slice(0, 3);


        vis.updateVis()

    }

    updateVis() {
        let vis = this;

        // (1) Update domains
        // (2) Draw rectangles
        // (3) Draw labels

        // * TO-DO *

        vis.x.domain(vis.displayData.map(d => d.Skill));
        vis.y.domain([0, Math.max(d3.max(vis.displayData, d => d["Count"]), d3.max(vis.otherSectorData, d => d["Count"]))]);
        vis.xSecond.domain(vis.otherSectorData.map(d => d.Skill));
        vis.ySecond.domain([0, Math.max(d3.max(vis.displayData, d => d["Count"]), d3.max(vis.otherSectorData, d => d["Count"]))]);
        vis.yAxisTicks = vis.y.ticks().filter(tick => Number.isInteger(tick));

        vis.title.text(vis.sector);
        vis.titleSecond.text(vis.otherSector);
        // console.log(d3.max(vis.displayData, d => d["Count"]));

        let line = vis.svg.selectAll(".line")
            .data(vis.displayData);

        line.enter().append("line")
            .attr("class", "line")
            .merge(line)
            .attr("stroke", "grey")
            .attr("x1", d => vis.x(d.Skill))
            .attr("y1", d => vis.y(d.Count))
            .attr("x2", d => vis.x(d.Skill))
            .attr("y2", d => vis.y(0));

        line.exit().remove();

        let circle = vis.svg.selectAll(".circle")
            .data(vis.displayData);

        circle.enter()
            .append("circle")
            .attr("class", "circle")
            .merge(circle)
            .attr("cx", function (d) {
                return vis.x(d.Skill);
            })
            .attr("cy", function (d) {
                return vis.y(d.Count);
            })
            .attr("r", "4")
            .style("fill", "#69b3a2")
            .attr("stroke", "black");

        circle.exit().remove();

        let lineSecond = vis.svgSecond.selectAll(".lineSecond")
            .data(vis.otherSectorData);

        lineSecond.enter().append("line")
            .attr("class", "lineSecond")
            .merge(lineSecond)
            .attr("stroke", "grey")
            .attr("x1", d => vis.xSecond(d.Skill))
            .attr("y1", d => vis.ySecond(d.Count))
            .attr("x2", d => vis.xSecond(d.Skill))
            .attr("y2", d => vis.ySecond(0));


        lineSecond.exit().remove();

        let circleSecond = vis.svgSecond.selectAll(".circleSecond")
            .data(vis.otherSectorData);

        circleSecond.enter()
            .append("circle")
            .attr("class", "circleSecond")
            .merge(circleSecond)
            .attr("cx", function (d) {
                return vis.xSecond(d.Skill);
            })
            .attr("cy", function (d) {
                return vis.ySecond(d.Count);
            })
            .attr("r", "4")
            .style("fill", "#69b3a2")
            .attr("stroke", "black")

        circleSecond.exit().remove();

        vis.svg.select(".x-axis").call(vis.xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("class", "axis-title")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function (d) {
                return "rotate(-45)"
            });

        // Update the y-axis
        vis.svg.select(".y-axis").call(vis.yAxis.tickValues(vis.yAxisTicks).tickFormat(d3.format('d')));

        vis.svgSecond.select(".x-axis").call(vis.xAxisSecond)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("class", "axis-title")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function (d) {
                return "rotate(-45)"
            });

        // Update the y-axis
        vis.svgSecond.select(".y-axis").call(vis.yAxisSecond);

    }

}