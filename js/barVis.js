/* * * * * * * * * * * * * *
*      class BarVis        *
* * * * * * * * * * * * * */


class BarVis {

    // constructor method to initialize BarVis object
    constructor(parentElement, data, jobTitle, sector, otherSector) {
        this.parentElement = parentElement;
        this.data = data;
        this.jobTitle = jobTitle;
        this.sector = sector;
        this.otherSector = otherSector;
        this.displayData = [];

        this.initVis()
    }


    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 60};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // // Overlay with path clipping
        // vis.svg.append("defs").append("clipPath")
        //     .attr("id", "clip")
        //     .append("rect")
        //     .attr("width", vis.width)
        //     .attr("height", vis.height);


        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip');

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .attr('transform', `translate(${vis.width / 4}, 10)`)
            .attr('text-anchor', 'middle');

        // Scales
        vis.x = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(0.1);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom(vis.x);

        vis.yAxis = d3.axisLeft(vis.y);

        vis.svg.append("g")
            .attr("class", "y-axis-bar y-axis axis");

        vis.svg.append("g")
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
        vis.displayData.push({'Skill': 'Python', 'Count': filteredData.filter(x => x.Python === 1).length});
        vis.displayData.push({'Skill': 'spark', 'Count': filteredData.filter(x => x.spark === 1).length});
        vis.displayData.push({'Skill': 'aws', 'Count': filteredData.filter(x => x.aws === 1).length});

        vis.otherSectorData = [];
        let filteredDataOtherSector = vis.data.filter(x => x["job_title_sim"] === jobTitle).filter(x => x["Sector"] === otherSector);
        vis.otherSectorData.push({
            'Skill': 'Python',
            'Count': filteredDataOtherSector.filter(x => x.Python === 1).length
        });
        vis.otherSectorData.push({
            'Skill': 'spark',
            'Count': filteredDataOtherSector.filter(x => x.spark === 1).length
        });
        vis.otherSectorData.push({'Skill': 'aws', 'Count': filteredDataOtherSector.filter(x => x.aws === 1).length});


        // console.log(jobTitle + ' ' + sector);
        // console.log(vis.displayData);
        vis.updateVis()

    }

    updateVis() {
        let vis = this;

        // console.log('here');

        // (1) Update domains
        // (2) Draw rectangles
        // (3) Draw labels

        // * TO-DO *

        document.getElementById(vis.parentElement).style.display = "block";
        vis.x.domain(vis.displayData.map(d => d.Skill));
        vis.y.domain([0, Math.max(d3.max(vis.displayData, d => d["Count"]), d3.max(vis.otherSectorData, d => d["Count"]))]);

        // console.log(d3.max(vis.displayData, d => d["Count"]));

        let bar = vis.svg.selectAll(".bar")
            .data(vis.displayData);

        bar.enter().append("rect")
            .attr("class", "bar")
            .merge(bar)
            .attr("fill", function (d) {
                return "steelblue";
            })
            .attr("x", d => vis.x(d.Skill))
            .attr("y", d => vis.y(d["Count"]))
            .attr("width", vis.x.bandwidth())
            .attr("height", d => vis.height - vis.y(d["Count"]));


        bar.exit().remove();

        // vis.svg.select(".bar-title").enter().text(vis.sector);

        // Update the x-axis
        vis.svg.select(".x-axis").call(vis.xAxis);

        // Update the y-axis
        vis.svg.select(".y-axis").call(vis.yAxis);
    }

    deleteVis() {
        let vis = this;
        document.getElementById(vis.parentElement).style.display = "none";
    }
}