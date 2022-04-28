
/*
 * AgeVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 */

class DonutVis {

    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.colors=["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#cab2d6","#fb9a99","#7f7f7f","#bcbd22","#17becf"]

        this.initVis();

    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {
        let vis = this;
        vis.margin = { top: 60, right: 5, bottom: 40, left: 120 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height  - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g");

        vis.radius = Math.min(vis.width/2 , vis.height/2);
        // console.log(vis.radius);
        vis.donutWidth = vis.radius/3; //This is the size of the hole in the middle

        // vis.arc = d3.arc()
        //     .innerRadius(vis.radius - vis.donutWidth)
        //     .outerRadius(vis.radius);

        vis.arc = d3.arc()
            .innerRadius(vis.radius * 0.5)         // This is the size of the donut hole
            .outerRadius(vis.radius * 0.8)

        vis.outerArc = d3.arc()
            .innerRadius(vis.radius * 0.9)
            .outerRadius(vis.radius * 0.9)

        vis.pie = d3.pie()
            .value(function (d) {
                return d[1];
            });

        vis.wrangleData();
    }



    /*
     * Data wrangling
     */

    wrangleData() {

        let vis = this;
        vis.selectedCategory = document.querySelector('input[name="donutCheck"]:checked').value;
        // console.log(vis.selectedCategory);
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

        // console.log(jobCount);
        // console.log(c);
        vis.displayData=jobCount;
        vis.updateVis();

    }


    updateVis() {
        let vis = this;

        vis.path = vis.svg.selectAll('path')
            .data(vis.pie(vis.displayData.map(Object.values)));
        vis.path.enter()
            .append('path')
            .merge(vis.path)
            .attr('d', vis.arc)
            .attr('fill', function (d, i) {
                return vis.colors[i];
            })
            .attr("transform", "translate("+(vis.width+vis.margin.left+vis.margin.right)/2 +"," +vis.height/2 + ")");


        vis.path.exit().remove();
        vis.lines=vis.svg
            .selectAll('allPolylines')
            .data(vis.pie(vis.displayData.map(Object.values)));


        vis.lines
            .join('polyline')
            .attr("stroke", "black")
            .style("fill", "none")
            .attr("stroke-width", 1)
            .attr('points', function(d) {
                const posA = vis.arc.centroid(d); // line insertion in the slice
                const posB = vis.outerArc.centroid(d) ;// line break: we use the other arc generator that has been built only for that
                const posC = vis.outerArc.centroid(d); // Label position = almost the same as posB
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                posC[0] = vis.radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                console.log(posB)
                if(d.data[0]=="Director")
                    posC[0] = vis.radius * 0.8 * 1;
                if(d.data[0]=="Machine Learning Engineer")
                {
                    posB[1]=posB[1]*0.95;
                    posC[1]=posC[1]*0.95;
                }

                    return [posA, posB, posC]
            })
            .attr("transform", "translate("+(vis.width+vis.margin.left+vis.margin.right)/2 +"," +vis.height/2 + ")")


        vis.labels=vis.svg
            .selectAll('allLabels')
            .data(vis.pie(vis.displayData.map(Object.values)));

        vis.labels
            .enter()
            .append('text')
            .text( function(d) { return d.data[0]+" "+(d.data[1]*100/732).toFixed(2)+"%"} )
            // .attr("transform", "translate("+(vis.width+vis.margin.left+vis.margin.right)/2 +"," +(vis.height+vis.margin.top)/2 + ")")
            .attr('transform', function(d) {
                console.log(d);
                var pos = vis.outerArc.centroid(d);
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                if(d.data[0]=="Director")
                    pos[0]=vis.radius * 0.99 *1;
                else
                pos[0] = vis.radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                if(d.data[0]=="Machine Learning Engineer")
                    pos[1]=pos[1]*0.95;
                pos[0]+=vis.width+vis.margin.left+vis.margin.right/2-1.33*vis.radius;
                pos[1]+=vis.height/2;
                return 'translate(' + pos + ')';
            })

            .style('text-anchor', function(d) {
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                return (midangle < Math.PI ? 'start' : 'end')
            })
        vis.lines.exit().remove();
        vis.labels.exit().remove();
    }

}
