
/*
 * DonutVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 */
class DonutVis {

    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.colors=["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#cab2d6","#fb9a99","#7f7f7f","#bcbd22","#17becf"];
        this.initVis();
    }

    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {
        let vis = this;
        vis.margin = { top: 50, right: 120, bottom: 10, left: 140 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height  - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g");

        vis.radius = Math.min(vis.width/2 , vis.height/2);

        vis.donutWidth = vis.radius/3; //This is the size of the hole in the middle

        // vis.arc = d3.arc()
        //     .innerRadius(vis.radius - vis.donutWidth)
        //     .outerRadius(vis.radius);
        //
        vis.arc = d3.arc()
            .innerRadius(vis.radius * 0.5)         // This is the size of the donut hole
            .outerRadius(vis.radius * 0.8)

        vis.outerArc = d3.arc()
            .innerRadius(vis.radius * 0.83)
            .outerRadius(vis.radius * 0.83)

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
            jobCount.push({key:"Other",value: otherCount});

        }
        jobCount.sort(function(a,b){return b["value"]-a["value"]});
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
            .attr("transform", "translate("+(vis.width+vis.margin.left+vis.margin.right)/1.72+"," +vis.height/1.75 + ")");


        vis.path.exit().remove();
        vis.lines=vis.svg
            .selectAll('.allPolylines')
            .data(vis.pie(vis.displayData.map(Object.values)));


        vis.lines
            .join('polyline')
            .attr("class","allPolylines")
            .merge(vis.lines)
            .attr("stroke", "black")
            .style("fill", "none")
            .attr("stroke-width", 1)
            .attr('points', function(d) {
                const posA = vis.arc.centroid(d); // line insertion in the slice
                const posB = vis.outerArc.centroid(d) ;// line break: we use the other arc generator that has been built only for that
                const posC = vis.outerArc.centroid(d); // Label position = almost the same as posB
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                posC[0] = vis.radius * 0.84 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                if(d.data[0]=="Director") {
                    posB[1] = posB[1] * 1.1;
                    posC[1] = posC[1] * 1.1;
                }
                if(d.data[0]=="Machine Learning Engineer"||d.data[0]=="Manufacturing"||d.data[0]=="Finance")
                {
                    posB[1]=posB[1]*0.9;
                    posC[1]=posC[1]*0.9;
                }

                    return [posA, posB, posC]
            })
            .attr("transform", "translate("+(vis.width+vis.margin.left+vis.margin.right)/1.72+"," +vis.height/1.75 + ")")


        vis.labels=vis.svg
            .selectAll('.allLabels')
            .data(vis.pie(vis.displayData.map(Object.values)));

        vis.labels
            .enter()
            .append('text')
            .attr("class","allLabels")
            .merge(vis.labels)

            .attr('y', function(d) {
                var pos = vis.outerArc.centroid(d);
                if(d.data[0]=="Director")
                    pos[1]=pos[1]*1.1;
                if(d.data[0]=="Machine Learning Engineer"||d.data[0]=="Manufacturing"||d.data[0]=="Finance")
                    pos[1]=pos[1]*0.9;
                pos[1]+=vis.height/1.75;
                return pos[1];
            })
            .attr("x",function(d)
                {
                    var pos;
                    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                    pos = vis.radius * 0.85 * (midangle < Math.PI ? 1 : -1);
                    return pos+(vis.width+vis.margin.left+vis.margin.right)/1.72})
            .text( function(d) { return d.data[0]} ).call(wrapText)

            .style('text-anchor', function(d) {
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                return (midangle < Math.PI ? 'start' : 'end')
            })


        vis.labelPercent=vis.svg
            .selectAll('.labelPercent')
            .data(vis.pie(vis.displayData.map(Object.values)));

        vis.labelPercent
            .enter()
            .append('text')
            .attr("class","labelPercent")
            .merge(vis.labelPercent)
            .text( function(d) { return (d.data[1]*100/732).toFixed(2)+"%"} )
            // .attr("transform", "translate("+(vis.width+vis.margin.left+vis.margin.right)/2 +"," +(vis.height+vis.margin.top)/2 + ")")
            .attr('transform', function(d) {
                var pos = vis.outerArc.centroid(d);
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                pos[0] = vis.radius * 0.85 * (midangle < Math.PI ? 1 : -1);

                if(d.data[0]=="Machine Learning Engineer"||d.data[0]=="Manufacturing"||d.data[0]=="Finance")
                    pos[1]=pos[1]*0.9;
                else if(d.data[0]=="Director")
                    pos[1]=pos[1]*1.1;
                pos[0]+=(vis.width+vis.margin.left+vis.margin.right)/1.72;
                if (d.data[0]== "Biotech & Pharmaceuticals" || d.data[0]== "Information Technology")
                    pos[1]+=vis.height/1.75+23;
                else
                    pos[1]+=vis.height/1.75+12;
                return 'translate(' + pos + ')';
            })

            .style('text-anchor', function(d) {
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                return (midangle < Math.PI ? 'start' : 'end')
            })

        vis.lines.exit().remove();
        vis.labels.exit().remove();
        vis.labelPercent.exit().remove();
    }

}

