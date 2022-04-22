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

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    // document.getElementById("main").style.marginLeft = "0";
    document.getElementById("main").style.display = "block"
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