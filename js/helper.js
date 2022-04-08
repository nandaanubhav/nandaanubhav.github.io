var $header_top = $('.header-top');
var $nav = $('nav');

$header_top.find('a').on('click', function () {
    $(this).parent().toggleClass('open-menu');
});

$('#fullpage').fullpage({
    sectionsColor: ['#83adb5', '#EBC1A2', '#c7bbc9', '#bfb5b2', '#ffd03c', '#f2e090', '#F4AC90', '#ff8b20'],
    sectionSelector: '.vertical-scrolling',
    navigation: true,
    slidesNavigation: true,
    controlArrows: false,
    anchors: ['firstSection', 'secondSection', 'thirdSection', 'fourthSection', 'fifthSection', 'sixthSection', 'seventhSection', 'eighthSection'],
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