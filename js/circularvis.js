/*
 * CircularVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 */

class CircularVis {

    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.lollipopChart = [];
        this.wordCloud = [];
        this.initVis();

    }

    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */
    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 50, left: 70};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height- vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr('transform', 'translate(' + vis.width / 1.75 + ',' + vis.height / 2 + ')');

        // console.log(vis.width);
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
        vis.displayData = jobCountbySector;

        // Here you want to aggregate the data by age, not by day (as it is given)!

        vis.updateVis();
    }

    /*
     * The drawing function
     */
    updateVis() {
        let vis = this;

        var r = vis.width / 2,
            w = r * 3,
            h = r * 3,
            rad = Math.PI / 180,
            interval = 360 / vis.displayData.length;

        let radiusScale = d3.scaleSqrt()
            .domain(d3.extent(vis.displayData, d => d.value))
            .range([vis.width / 30, vis.width / 10]);

        // (radiusScale(vis.stateInfo[index][selectedCategory]));

        vis.svg.selectAll('g')
            .data(vis.displayData)
            .enter()
            .append('circle')
            .attr("class", "job-title-circle")
            .on('click', function (d, i) {

                // console.log(i);

                let overallSectorCount = vis.data.filter(x => x["job_title_sim"] === i.key).reduce(function (r, a) {
                    r[a.Sector] = (r[a.Sector] || 0) + 1;
                    return r;
                }, {});

                // console.log(overallSectorCount);
                let topSector = Object.keys(overallSectorCount).sort(function (a, b) {
                    return overallSectorCount[b] - overallSectorCount[a]
                });

                document.getElementById("circular-vis-text").style.display = "none";
                document.getElementById("circular-vis-sidebar").style.display = "block";

                // console.log(overallSectorCount);
                // console.log(i.key + ' ' + topSector[0] + ' ' + topSector[1]);

                if (vis.lollipopChart.length != 0) {
                    vis.lollipopChart[0].wrangleData(i.key, topSector[0], topSector[1]);
                } else {
                    vis.lollipopChart.push(new LollipopVis("bar-chart", vis.data, i.key, topSector[0], topSector[1]));
                }
                if (vis.wordCloud.length != 0) {
                    vis.wordCloud[0].wrangleData(i.key, topSector[0], topSector[1]);
                } else {
                    vis.wordCloud.push(new WordCloudVis("word-cloud", vis.data, i.key, topSector[0], topSector[1]));
                }
            })
            .attr('fill', 'steelblue')
            .transition()
            .delay(function (d, i) {
                return i * 400;
            })
            .attr('r', function (d) {
                // console.log(d.value);
                return radiusScale(d.value);
            })
            .attr('transform', function (d, i) {
                return "translate(" + ((w / 2 - r) * Math.cos((interval * i) * Math.PI / 180)) + "," + ((w / 2 - r) * Math.sin((interval * i) * Math.PI / 180)) + ")";
            });

        vis.svg.selectAll('g')
            .data(vis.displayData)
            .enter()
            .append('text')
            .text(d => (d.value*100/732).toFixed(2)+"%")
            .attr("alignment-baseline","middle")
            .attr("x",d => {
                if (radiusScale(d.value) >= 70)
                    return -radiusScale(d.value)/4;
                else if((radiusScale(d.value) >= 50) && (radiusScale(d.value) < 70))
                    return -radiusScale(d.value)/3;
                else if((radiusScale(d.value) >= 30) && (radiusScale(d.value) < 50))
                    return -radiusScale(d.value)/2;
                else
                    return -radiusScale(d.value)/1.5;

            })
            .attr('transform', function (d, i) {
                return "translate(" + ((w / 2 - r) * Math.cos((interval * i) * Math.PI / 180)) + "," + ((w / 2 - r) * Math.sin((interval * i) * Math.PI / 180)) + ")";
            });

        vis.svg.selectAll(".textLabel")
            .data(vis.displayData)
            .enter()
            .append("text")
            .attr("class","textLabel")
            // Add your code below this line
            .attr("text-anchor", function (d, i) {
                if ((w / 2 - r) * Math.cos((interval * i) * Math.PI / 180) > 0) return "start";
                else return "end";
            })
            .attr("x", function (d, i) {
                if ((w / 2 - r) * Math.cos((interval * i) * Math.PI / 180) > 0) return (radiusScale(d.value) + 5);
                else return -(radiusScale(d.value) + 5);
            })
            .attr("y", function (d, i) {
                if ((w / 2 - r) * Math.sin((interval * i) * Math.PI / 180) > 0) return (radiusScale(d.value) + 5);
                else return -(radiusScale(d.value) + 5);
            })
            .text((d) => d.key)
            .call(wrap, 50)
            .style("font-size", function () {
                // console.log(vis.width);
                if (vis.width < 200) {
                    return "6px";
                }
                return "15px"
            })
            .style("opacity", "0")
            .transition()
            .delay(function (d, i) {
                return i * 400;
            })
            .style("opacity", "1")
            .attr('transform', function (d, i) {
                return "translate(" + ((w / 2 - r) * Math.cos((interval * i) * Math.PI / 180)) + "," + ((w / 2 - r) * Math.sin((interval * i) * Math.PI / 180)) + ")";
            });
    }
}

// function wrap(text, width) {
//     text.each(function () {
//         var text = d3.select(this),
//             words = text.text().split(/\s+/).reverse(),
//             word,
//             line = [],
//             lineNumber = 0,
//             lineHeight = 1.1, // ems
//             x = text.attr("x"),
//             y = text.attr("y"),
//             dy = 0, //parseFloat(text.attr("dy")),
//             tspan = text.text(null)
//                 .append("tspan")
//                 .attr("x", x)
//                 .attr("y", y)
//                 .attr("dy", dy + "em");
//         while (word = words.pop()) {
//             line.push(word);
//             tspan.text(line.join(" "));
//             if (tspan.node().getComputedTextLength() > width) {
//                 line.pop();
//                 tspan.text(line.join(" "));
//                 line = [word];
//                 tspan = text.append("tspan")
//                     .attr("x", x)
//                     .attr("y", y)
//                     .attr("dy", ++lineNumber * lineHeight + dy + "em")
//                     .text(word);
//             }
//         }
//     });
// }