
let donutVis, boxPlotVis, barchart, miniBarChart, tileMap
let parseDate = d3.timeParse("%m/%d/%Y");
let selectedRange = [];
let mainData;
//reading csv file
loadData();
function loadData() {
    d3.csv("data/Market_Divers.csv").then(csv => {
        csv.forEach(function (d) {
            d.index = +d.index;
            d.Rating = +d.Rating;
            d.Founded = +d.Founded;
            d.Lower_Salary = +d.Lower_Salary;
            d.Upper_Salary = +d.Upper_Salary;
            d.Avg_Salary = +d.Avg_Salary;
            d.Python = +d.Python;
            d.spark = +d.spark;
            d.aws = +d.aws;
            d.excel = +d.excel;
            d.sql = +d.sql;
            d.sas = +d.sas;
            d.keras = +d.keras;
            d.pytorch = +d.pytorch;
            d.scikit = +d.scikit;
            d.tensor = +d.tensor;
            d.hadoop = +d.hadoop;
            d.tableau = +d.tableau;
            d.bi = +d.bi;
            d.flink = +d.flink;
            d.mongo = +d.mongo;
            d.google_an = +d.google_an;
        });
        donutVis = new DonutVis("donutvis", csv);
        boxPlotVis = new BoxPlotVis("boxplotvis", csv);
        barchart = new BarChart("barchart-div", csv);
        miniBarChart = new MiniBarChart("mini-barchart-div", csv);
        selectedRange = [5, miniBarChart.height/3];
        mainData = csv;
        loadTileMap();
    });
};

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

/* Set the width of the sidebar to 250px and the left margin of the page content to 250px */
function openNav() {
    // console.log( document.getElementById("tilemap-div").getBoundingClientRect().width)
    document.getElementById("mySidebar").style.width = (document.getElementById("blabla").getBoundingClientRect().width) + "px";
    // sleep(2000);
sdanl()

    // document.getElementById("main").style.marginLeft = "250px";
}

function sdanl() {
    let myBar = new BoxPlotVis("mySidebar", mainData);
}


/* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}

function loadTileMap() {
    d3.csv("data/publication-grids.csv").then(csv => {
        tileMap = new TileMap("tilemap-div", mainData, csv);
    })
}


function switchView() {
    donutVis.wrangleData();
}

function boxPlotCategoryChange() {
    boxPlotVis.wrangleData();
};

// React to 'brushed' event and update all bar charts
function brushed() {
    let selectionRange = d3.brushSelection(d3.select(".brush").node());
    selectedRange = selectionRange;
    barchart.selectionRange = selectionRange;
    barchart.wrangleData()
    if ((selectedRange[0] != 5)&&(selectedRange[1] != miniBarChart.height/3)) {
        miniBarChart.selectionRange = selectionRange;
        miniBarChart.wrangleData()
    }
}
