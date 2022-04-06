
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
        vis.margin = { top: 40, right: 20, bottom: 180, left: 60 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height  - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g");

        vis.color = d3.scaleOrdinal(d3.schemeBlues[9]);
        vis.radius = Math.min(vis.width/2 , vis.height/2);
        console.log(vis.radius);
        vis.donutWidth = vis.radius/3; //This is the size of the hole in the middle

        vis.arc = d3.arc()
            .innerRadius(vis.radius - vis.donutWidth)
            .outerRadius(vis.radius);

        vis.pie = d3.pie()
            .value(function (d) {
                return d[1];
            });

        vis.tooltip=vis.svg.append("text")
            .attr("x",(vis.width+vis.margin.left+vis.margin.right)/2-vis.radius/9)
            .attr("y",(vis.height+vis.margin.top)/2-vis.radius/8)
            .attr("class", "tooltip-text");

        vis.tooltipPercent=vis.svg.append("text")
            .attr("x",(vis.width+vis.margin.left+vis.margin.right)/2-vis.radius/5)
            .attr("y",(vis.height+vis.margin.top)/2+vis.radius/8)
            .attr("class", "tooltip-text")
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
        jobCount.sort(function(a,b){return b["value"]-a["value"]});

        console.log(jobCount);
        // console.log(c);
        vis.displayData=jobCount;
        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        vis.color.domain(vis.displayData.reverse().map(d=>d.key));

        vis.path = vis.svg.selectAll('path')
            .data(vis.pie(vis.displayData.map(Object.values)));
        vis.path.enter()
            .append('path')
            .merge(vis.path)
            .attr('d', vis.arc)
            .attr('fill', function (d, i) {
                return vis.color(d.data[0]);
            })
            .attr("transform", "translate("+(vis.width+vis.margin.left+vis.margin.right)/2 +"," +(vis.height+vis.margin.top)/2 + ")")
            .on('mouseover', function (event, d) {

                vis.tooltip.text(d.data[1]);
                vis.tooltipPercent.text((d.data[1]*100/732).toFixed(2)+"%");

            })
            .on('mouseout', function (event, d) {
                vis.tooltip.text("");
                vis.tooltipPercent.text("");

            });

        vis.path.exit().remove();

        vis.legendG = vis.svg.selectAll(".legend")
            .data(vis.pie(vis.displayData.reverse().map(Object.values)));


        vis.legendG.enter().append("text")
            .merge(vis.legendG)
            .text(function(d){
                return d.data[0];
            })
            .attr("transform", function(d,i){
                return "translate(" + (vis.width+vis.margin.left+vis.margin.right-vis.radius/2)/2 + "," + (i * 15 + (vis.height+vis.margin.top+vis.donutWidth)/2+vis.radius) + ")"; // place each legend on the right and bump each one down 15 pixels
            })
            .attr("class", "legend")
            .style("font-size", 12)
            .attr("y", 10)
            .attr("x", 15);



        vis.legendRect = vis.svg.selectAll(".legend-rect")
            .data(vis.pie(vis.displayData.map(Object.values)));
        vis.legendRect.enter()
            .append("rect") // make a matching color rect
            .merge(vis.legendRect)
                .attr("class", "legend-rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", function(d, i) {
                return vis.color(d.data[0]);
            })
            .attr("transform", function(d,i){
                return "translate(" + (vis.width+vis.margin.left+vis.margin.right-vis.radius/2)/2 + "," + (i * 15 + (vis.height+vis.margin.top+vis.donutWidth)/2+vis.radius) + ")"; // place each legend on the right and bump each one down 15 pixels
            });


        vis.legendG.exit().remove();
        vis.legendRect.exit().remove();
    }

}
