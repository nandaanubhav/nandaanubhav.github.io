/*
 * BoxPlotVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 */

class CircularVis {

    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.barCharts = [];
        this.initVis();

    }

    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */
    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 170, left: 70};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr('transform', 'translate(' + 200 + ',' + 200 + ')');

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }

    /*
     * Data wrangling
     */
    wrangleData() {
        let vis = this;

        let jobCountbySector = Array.from(d3.rollup(vis.data, v => v.length, d => d["job_title_sim"]), ([key, value]) => ({
            key,
            value
        }))
        jobCountbySector.sort(function (a, b) {
            return b["value"] - a["value"]
        });
        // if(jobCountbySector.length>9)
        // {
        //     let otherCount=0;
        //     jobCountbySector.slice(9).forEach(d=>
        //     {
        //         otherCount+=d.value;
        //     })
        //     jobCountbySector.splice(8);
        //     // console.log(jobCount);
        //     jobCountbySector.push({key:"Other",value: otherCount});
        // }
        //
        // jobCountbySector.sort(function(a,b){return b["value"]-a["value"]});
        console.log(jobCountbySector);
        vis.displayData = jobCountbySector;

        // Here you want to aggregate the data by age, not by day (as it is given)!

        vis.updateVis();
    }

    /*
     * The drawing function
     */
    updateVis() {
        let vis = this;

        var r = 200,
            w = r * 3.5,
            h = w,
            rad = Math.PI / 180,
            interval = 360 / vis.displayData.length;

        let radiusScale = d3.scaleSqrt()
            .domain(d3.extent(vis.displayData, d => d.value))
            .range([10, 40]);

        // (radiusScale(vis.stateInfo[index][selectedCategory]));

        vis.svg.selectAll('g')
            .data(vis.displayData)
            .enter()
            .append('circle')
            .attr('fill', 'steelblue')
            .transition()
            .delay(function (d, i) {
                console.log(i);
                return i * 400;
            })
            .attr('r', function (d) {
                console.log(radiusScale(d.value));
                return radiusScale(d.value);
            })
            .attr('transform', function (d, i) {

                return "translate(" + ((w / 2 - r) * Math.cos((interval * i) * Math.PI / 180)) + "," + ((w / 2 - r) * Math.sin((interval * i) * Math.PI / 180)) + ")";
            })
            .on('click', function (d, i) {
                vis.barCharts.push(i);
                vis.barCharts.push(i);
                vis.barCharts.push(i);

                vis.svg.append('circle')
                    .attr('cx', 100)
                    .attr('cy', 100)
                    .attr('r', 50)
                    .attr("class", "delete")
                    .attr('stroke', 'black')
                    .attr('fill', '#69a3b2')
                    .on('click', function () {
                        console.log(vis.barCharts);
                        vis.barCharts = [];
                        console.log(vis.barCharts);
                        vis.svg.selectAll(".delete").remove();
                    });
            });

    }

}
