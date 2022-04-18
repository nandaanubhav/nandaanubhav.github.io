class NavBarVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];
        this.state = "none"
        this.initVis()
    }

    updateCountry(countryText, state) {
        document.getElementById("selectedCountry").innerHTML = countryText;
        this.state = state
    }

    updateTotalOpportunities(text) {
        document.getElementById("totalOpportunities-text").innerHTML = "Total Opportunities: " + text
    }

    updateSalaryData(row) {
        const avgSalary = d3.sum(row, d => d.Avg_Salary) / row.length;
        const maxSalary = d3.sum(row, d => d.Upper_Salary) / row.length;
        const lowSalary = d3.sum(row, d => d.Lower_Salary) / row.length;

        document.getElementById("salaryRange-text").innerHTML = "$" + parseInt(lowSalary) + "K to $" + parseInt(maxSalary) + "K"
        document.getElementById("salaryAvg-text").innerHTML = "$" + parseInt(avgSalary) + ",000"
    }

    initVis() {
        let vis = this;

        // set width and height
        vis.margin = {top: 0, right: 5, bottom: 5, left: 5};
        vis.width = (document.getElementById("blabla").getBoundingClientRect().width) - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;


        // append the svg object to the body of the page
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);


// tooltip
        vis.tooltip = d3.select("#" + vis.parentElement).append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip1')
        this.wrangleData();
    }

    wrangleData() {
        let vis = this;
        vis.displayData = [];
        let dict = {};
        if (vis.state == "none")
            return

        var grouped_data = Array.from(d3.group(vis.data, d => d.State), ([key, value]) => ({key, value}))
        var selectedRow;

        grouped_data.forEach(row => {
            if (row.key == vis.state)
                selectedRow = row.value
        })

        vis.updateTotalOpportunities(selectedRow.length)
        vis.updateSalaryData(selectedRow)

        const unique = [...new Set(selectedRow.map(item => item.Sector))];

        unique.forEach(row => {
            dict[row] = 0;
        })

        selectedRow.forEach(row => {
            dict[row.Sector] += 1
        })

        var letstry = []
        for (var key in dict) {
            letstry.push({name: key, parent: 'Origin', value: dict[key]})
        }

        var temp = letstry.sort(function (first, second) {
            return second["value"] - first["value"];
        }).slice(0, 5);

        letstry = []
        letstry.push({name: 'Origin', parent: '', value: ''})
        temp.forEach(row => {
            letstry.push(row)
        })

        console.log(d3.max(letstry, function (d) {
            return d["value"];
        }))

        vis.linearColor = d3.scaleSequential(d3.interpolateBlues).domain([0, d3.max(letstry, function (d) {
            return d["value"];
        })])

        vis.root = d3.stratify()
            .id(function (d) {
                return d.name;
            })   // Name of the entity (column name is name in csv)
            .parentId(function (d) {
                return d.parent;
            })   // Name of the parent (column name is parent in csv)
            (letstry);

        vis.root.sum(function (d) {
            return +d.value
        })

        d3.treemap()
            .size([vis.width, vis.height])
            .padding(4)
            (vis.root)

        this.updateVis()
    }

    updateVis() {
        let vis = this;

        let rect = vis.svg
            .selectAll("." + vis.parentElement + "Rect")
            .data(vis.root.leaves())

        rect.enter()
            .append("rect")
            .attr("class", vis.parentElement + "Rect")
            .merge(rect)
            .attr('x', function (d) {
                return d.x0;
            })
            .attr('y', function (d) {
                return d.y0;
            })
            .attr('width', function (d) {
                return d.x1 - d.x0;
            })
            .attr('height', function (d) {
                return d.y1 - d.y0;
            })
            .style("stroke", "black")
            .style("fill", function (d) {
                return vis.linearColor(d["value"]);
            })
            .style("opacity", 0.8);


        let labelOne = vis.svg
            .selectAll(vis.parentElement + "text1")
            .data(vis.root.leaves())

        labelOne.enter()
            .append("text")
            .attr("class", vis.parentElement + "text1")
            .merge(rect)
            .attr("x", function (d) {
                return d.x0 + 10
            })    // +10 to adjust position (more right)
            .attr("y", function (d) {
                return d.y0 + 20
            })    // +20 to adjust position (lower)
            .text(function (d) {
                return d.data.name
            })
            .call(wrap, 10); // wrap the text in <= 30 pixels
        // .attr("font-size", "15px")
        // .attr("fill", "white")

        let labelTwo = vis.svg
            .selectAll(vis.parentElement + "text2")
            .data(vis.root.leaves())

        labelTwo.enter()
            .append("text")
            .attr("class", vis.parentElement + "text2")
            .merge(labelTwo)
            .attr("x", function (d) {
                return d.x0 + 10
            })    // +10 to adjust position (more right)
            .attr("y", function (d) {
                return d.y0 + 40
            })    // +20 to adjust position (lower)
            .text(function (d) {
                return d.data.value
            })

        // add hover functionality for tooltip
        vis.svg.selectAll("." + vis.parentElement + "Rect").on('mouseover', function (event, d) {
            d3.select(this)
                .transition()
                .style('fill', '#800000');
            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 5 + "px")
                .style("top", event.pageY + "px")
                .html(`
                         <div>
                         asdcsdcasdcsdcacsdaascd
                                             
                         </div>`);
        })
            .on('mouseout', function (event, d) {
                d3.select(this)
                    .transition()
                    .style('fill', function (d) {
                        return vis.linearColor(d[1]);
                    })
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })


        rect.exit().remove();
        labelOne.exit().remove();
        labelTwo.exit().remove();
    }
}

function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                .append("tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .text(word);
            }
        }
    });
}