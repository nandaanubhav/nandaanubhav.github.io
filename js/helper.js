var $header_top = $('.header-top');
var $nav = $('nav');

$header_top.find('a').on('click', function () {
    $(this).parent().toggleClass('open-menu');
});

$('#fullpage').fullpage({
    sectionsColor: ['#FFC14D', '#FFC14D', '#FFC14D', '#FFC14D', '#FFC14D', '#FFC14D', '#FFC14D', '#FFC14D', '#FFC14D', '#FFC14D'],

    sectionSelector: '.vertical-scrolling',
    navigation: true,
    slidesNavigation: true,
    controlArrows: false,
    anchors: ['firstSection', 'secondSection', 'thirdSection', 'fourthSection', 'fifthSection', 'sixthSection', 'seventhSection', 'eighthSection', 'ninthSection'],
    menu: '#menu',

    afterLoad: function (anchorLink, index) {
        $header_top.css('background', 'rgba(0, 47, 77, .3)');
        $nav.css('background', 'rgba(0, 47, 77, .25)');
        if (index == 8) {
            $('#fp-nav').hide();
        }
    },

    onLeave: function (index, nextIndex, direction) {
        if (index == 8) {
            $('#fp-nav').show();
        }
    },


});


// From stack overflow
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

function wrapText(text, width) {
    text.each(function () {
            var text = d3.select(this);
            if (text.text() == "Biotech & Pharmaceuticals" || text.text() == "Information Technology") {
                wrap(text, 100);
            }
            ;
        })
}


// function that generates a nested array for square grid
function makeGridData(ncol, nrow, cellsize) {
    var gridData = [];
    var xpos = 1;  // starting xpos and ypos at 1 so the stroke will show when we make the grid below
    var ypos = 1;

    // calculate width and height of the cell based on width and height of the canvas
    var cellSize = cellsize;

    // iterate for rows
    for (var row = 0; row < nrow; row++) {
        gridData.push([]);

        // iterate for cells/columns inside each row
        for (var col = 0; col < ncol; col++) {
            gridData[row].push({
                x: xpos,
                y: ypos,
                width: cellSize,
                height: cellSize
            });

            // increment x position (moving over by 50)
            xpos += cellSize;
        }

        // reset x position after a row is complete
        xpos = 1;
        // increment y position (moving down by 50)
        ypos += cellSize;
    }
    return gridData;
}