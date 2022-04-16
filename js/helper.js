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