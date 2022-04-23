/* * * * * * * * * * * * * *
*      class WordCloudVis  *
* * * * * * * * * * * * * */


class WordCloudVis {

    // constructor method to initialize WordCloudVis object
    constructor(parentElement, data, jobTitle, sector, otherSector) {
        this.parentElement = parentElement;
        this.data = data;
        this.jobTitle = jobTitle;
        this.sector = sector;
        this.otherSector = otherSector;
        this.states = ["NM", "MD", "FL", "WA", "NY", "TX", "CA", "VA", "MA", "NJ", "CO", "IL", "KY", "OR", "CT", "MI", "DC", "OH", "AL", "MO", "PA", "GA", "IN", "LA", "WI", "NC", "AZ",
            "NE", "MN", "TN", "DE", "UT", "ID", "RI", "IA", "SC", "KS"];
        this.displayData = [];

        this.initVis()
    }


    initVis() {
        let vis = this;

        vis.margin = {top: 0, right: 0, bottom: 20, left: 25};
        vis.marginSecond = {top: 0, right: 15, bottom: 20, left: 0};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width / 2 - vis.margin.left - vis.margin.right;
        vis.widthSecond = document.getElementById(vis.parentElement).getBoundingClientRect().width / 2 - vis.marginSecond.left - vis.marginSecond.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.width / 2 + vis.margin.left}, ${vis.height / 3})`);

        vis.svgSecond = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.marginSecond.left + vis.marginSecond.right)
            .attr("height", vis.height + vis.marginSecond.top + vis.marginSecond.bottom)
            .append('g')
            .attr('transform', `translate (${vis.width / 2}, ${vis.height / 3})`);


        // // Overlay with path clipping
        // vis.svg.append("defs").append("clipPath")
        //     .attr("id", "clip")
        //     .append("rect")
        //     .attr("width", vis.width)
        //     .attr("height", vis.height);

        vis.xScale = d3.scaleLinear()
            .range([15, 30]);

        vis.xScaleSecond = d3.scaleLinear()
            .range([15, 30]);

        vis.colorScale = d3.scaleLinear()
            .range([0.25, 1]);

        vis.colorScaleSecond = d3.scaleLinear()
            .range([0.25, 1]);

        vis.svgSecond.append('line')
            .style("stroke", "black")
            .style("stroke-width", 1)
            .attr("x1", -vis.width / 2)
            .attr("y1", -vis.height / 3)
            .attr("x2", -vis.width / 2)
            .attr("y2", vis.height / 3);

        // Scales
        this.wrangleData(vis.jobTitle, vis.sector, vis.otherSector);
    }

    wrangleData(jobTitle, sector, otherSector) {
        let vis = this;

        vis.sector = sector;
        vis.otherSector = otherSector;
        vis.displayData = [];
        let filteredData = vis.data.filter(x => x["job_title_sim"] === jobTitle).filter(x => x["Sector"] === sector);
        vis.states.forEach(d => {
            vis.displayData.push({'State': d, 'Count': filteredData.filter(x => x.State === d).length});
        });
        vis.displayData = vis.displayData.filter(x => x["Count"] != 0);

        vis.otherSectorData = [];
        let filteredDataOtherSector = vis.data.filter(x => x["job_title_sim"] === jobTitle).filter(x => x["Sector"] === otherSector);
        vis.states.forEach(d => {
            vis.otherSectorData.push({'State': d, 'Count': filteredDataOtherSector.filter(x => x.State === d).length});
        });
        vis.otherSectorData = vis.otherSectorData.filter(x => x["Count"] != 0);

        // console.log(jobTitle + ' ' + sector);
        // console.log(vis.displayData);
        // console.log(vis.otherSectorData);
        vis.updateVis()

    }

    updateVis() {
        let vis = this;

        // console.log('here');

        // (1) Update domains
        // (2) Draw rectangles
        // (3) Draw labels

        // * TO-DO *

        vis.xScale.domain(d3.extent(vis.displayData, function (d) {
            return d.Count;
        }));
        vis.xScaleSecond.domain(d3.extent(vis.otherSectorData, function (d) {
            return d.Count;
        }));
        vis.colorScale.domain(d3.extent(vis.displayData, function (d) {
            return d.Count;
        }));
        vis.colorScaleSecond.domain(d3.extent(vis.otherSectorData, function (d) {
            return d.Count;
        }));

        d3.layout.cloud().size([vis.width, vis.height])
            .words(vis.displayData)
            .fontSize(function (d) {
                return vis.xScale(+d.Count);
            })
            .text(function (d) {
                return d.State;
            })
            .rotate(function () {
                return ~~(Math.random() * 2) * 90;
            })
            .font("Impact")
            .on("end", draw)
            .start();

        d3.layout.cloud().size([vis.width, vis.height])
            .words(vis.otherSectorData)
            .fontSize(function (d) {
                return vis.xScaleSecond(+d.Count);
            })
            .text(function (d) {
                return d.State;
            })
            .rotate(function () {
                return ~~(Math.random() * 2) * 90;
            })
            .font("Impact")
            .on("end", drawSecond)
            .start();

        function draw(words) {

            vis.words = vis.svg.selectAll("text")
                .data(words);

            vis.words.enter().append("text")
                .style("class", "small")
                .style("font-family", "Impact")
                .style("fill", function (d) {
                    // console.log(vis.colorScale(d.Count));
                    return d3.interpolateBlues(vis.colorScale(d.Count));
                })
                .style("stroke", d3.interpolateBlues(1))
                .attr("text-anchor", "middle")
                .merge(vis.words)
                .style("font-size", function (d) {
                    return vis.xScale(d.Count) + "px";
                })
                .attr("transform", function (d) {
                    // console.log(d.x + "" + d.y);
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function (d) {
                    return d.State;
                });

            vis.words.exit().remove();


        }

        function drawSecond(words) {

            vis.wordsSecond = vis.svgSecond.selectAll("text")
                .data(words);

            vis.wordsSecond.enter().append("text")
                .style("class", "small")
                .style("font-family", "Impact")
                .style("fill", function (d) {
                    return d3.interpolateBlues(vis.colorScaleSecond(d.Count));
                })
                .style("stroke", d3.interpolateBlues(1))
                .attr("text-anchor", "middle")
                .merge(vis.wordsSecond)
                .style("font-size", function (d) {
                    return vis.xScaleSecond(d.Count) + "px";
                })
                .attr("transform", function (d) {
                    // console.log(d.x + "" + d.y);
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function (d) {
                    return d.State;
                });

            vis.wordsSecond.exit().remove();
        }

        d3.layout.cloud().stop();
    }
}