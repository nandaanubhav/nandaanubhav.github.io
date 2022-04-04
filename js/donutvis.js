
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
        vis.margin = { top: 20, right: 20, bottom: 200, left: 60 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
        vis.radius = Math.min(vis.width, vis.height) / 2 - vis.margin.right - vis.margin.left;
        vis.color = d3.scaleOrdinal(d3.schemeBlues[9]);
        vis.radius = Math.min(vis.width, vis.height) / 2;
        vis.donutWidth = 40; //This is the size of the hole in the middle

        vis.arc = d3.arc()
            .innerRadius(vis.radius - vis.donutWidth)
            .outerRadius(vis.radius);

        vis.pie = d3.pie()
            .value(function (d) {
                return d[1];
            });

        vis.tooltip=vis.svg.append("text")
            .attr("x", vis.width/2-vis.radius/2)
            .attr("y", vis.height/2+vis.radius/2)
            .style("text-align","center");


        vis.wrangleData();
    }



    /*
     * Data wrangling
     */

    wrangleData() {

        let vis = this;
        vis.selectedCategory = document.querySelector('input[name="donutCheck"]:checked').value;
        console.log(vis.selectedCategory);
        let jobCount=Array.from(d3.rollup(vis.data, v => v.length, d => d[vis.selectedCategory]), ([key, value]) => ({key, value}))
        jobCount.sort(function(a,b){return b["value"]-a["value"]});
        if(jobCount.length>9)
        {
            let otherCount=0;
            jobCount.slice(9).forEach(d=>
                {
                otherCount+=d.value;
            })
            jobCount.splice(8);
            // console.log(jobCount);
            jobCount.push({key:"Other",value: otherCount});

        }

        console.log(jobCount);
        // console.log(c);
        vis.displayData=jobCount;
        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        vis.color.domain(vis.displayData.map(d=>d.key));

        vis.path = vis.svg.selectAll('path')
            .data(vis.pie(vis.displayData.map(Object.values)));
        vis.path.enter()
            .append('path')
            .merge(vis.path)
            .attr('d', vis.arc)
            .attr('fill', function (d, i) {
                return vis.color(d.data[0]);
            })
            .attr('transform', 'translate(200, 200)')
            .on('mouseover', function (event, d) {
                vis.tooltip.text(d.data[0]+" "+d.data[1]);
            })
            .on('mouseout', function (event, d) {
                vis.tooltip.text(" ");
            });
        vis.path.exit().remove();

        // again rebind for legend
        vis.legendG = vis.svg.selectAll(".legend")
            .data(vis.pie(vis.displayData.map(Object.values)))
            .enter().append("g")
            .attr("transform", function(d,i){
                return "translate(" + (vis.width - 250) + "," + (i * 15 + 350) + ")"; // place each legend on the right and bump each one down 15 pixels
            })
            .attr("class", "legend");

        vis.legendG.append("rect") // make a matching color rect
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", function(d, i) {
                return vis.color(i);
            });

        vis.legendG.append("text")
            .text(function(d){
                return d.data[0];
            })
            .style("font-size", 12)
            .attr("y", 10)
            .attr("x", 11);




    }


}
