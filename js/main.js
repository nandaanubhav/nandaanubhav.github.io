const TIME_OUT = 600 // It should be the same transition time of the sections
const body = document.querySelector('body')
const sectionsQty = document.querySelectorAll('section').length
const sectionStick = document.querySelector('.section-stick')
let startFlag = true
let initialScroll = window.scrollY
let qty = 1,
    main = null,
    next = null
// Add child elements in .section-stick as number of sections exist
Array(sectionsQty)
    .fill()
    .forEach(() => {
        sectionStick.innerHTML = sectionStick.innerHTML + '<div class="stick"></div>'
    })
// console.log('SLIDE', qty)
// Listening to scroll event
window.onscroll = () => {
    if (startFlag) {
        const scrollDown = this.scrollY >= initialScroll
        const scrollLimit = qty >= 1 && qty <= sectionsQty
        // Verify that the scroll does not exceed the number of sections
        if (scrollLimit) {
            body.style.overflowY = 'hidden' // Lock el scroll
            if (scrollDown && qty < sectionsQty) {
                main = document.querySelector(`section.s${qty}`)
                next = document.querySelector(`section.s${qty + 1}`)
                main.style.transform = 'translateY(-100vh)'
                next.style.transform = 'translateY(0)'
                qty++
            } else if (!scrollDown && qty > 1) {
                main = document.querySelector(`section.s${qty - 1}`)
                next = document.querySelector(`section.s${qty}`)
                main.style.transform = 'translateY(0)'
                next.style.transform = 'translateY(100vh)'
                qty--
            }
            // Scroll progressbar
            const active = document.querySelector('.section-stick .stick.active')
            active.style.top = (62 + 30) * (qty - 1) + 'px'
        }
        // console.log('SLIDE', qty)
        // Wait for the scrolling to finish to reset the values
        setTimeout(() => {
            initialScroll = this.scrollY
            startFlag = true
            body.style.overflowY = 'scroll' // Unlock scroll
        }, TIME_OUT)
        startFlag = false
    }
    // Keep scrollbar in the middle of the viewport
    window.scroll(0, window.screen.height)
}

//reading csv file
d3.csv("data/Market_Divers.csv", d => {
    console.log(d);
    return d;
});