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

        var data = [1, 2, 3, 4, 5, 6, 7];

        var r = 200,
            w = r * 3,
            h = w,
            rad = Math.PI / 180,
            interval = 360 / data.length;

        var month = {
            "January": 1,
            "February": 2,
            "March": 3,
            "April": 4
        };

        // Calling the d3.keys() function
        console.log(d3.keys(month));

        vis.svg.selectAll('g')
            .data(data)
            .enter()
            .append('circle')
            .attr('fill', 'steelblue')
            .attr('r', w / interval)
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
