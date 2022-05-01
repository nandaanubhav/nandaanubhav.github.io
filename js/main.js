let donutVis, boxPlotVis, barchart, miniBarChart, tileMap, circularVis,parallelChart;
let parseDate = d3.timeParse("%m/%d/%Y");
let selectedRange = [];
let mainData;

// $("#tip").delay(5000).fadeOut();

function hideTip() {
    var v = document.getElementById("tip");
    v.style.display = "none";
}

function hideTip2() {
    var m = document.getElementById("tip2");
    m.style.display = "none";
}

function hideTip3() {
    var m = document.getElementById("tip3");
    m.style.display = "none";
}

function hideTip4() {
    var m = document.getElementById("tip4");
    m.style.display = "none";
}

//reading csv file
loadData();

function loadData() {
    d3.csv("data/Market_Divers.csv").then(csv => {
        csv.forEach(function (d) {
            // d["Founded"] = 2022 - (+d["Founded"]);
            d.Size = d.Calculated_Size;
            d.Revenue = d.Calculated_Revenue;
            d.index = +d.index;
            d.Rating = +d.Rating;
            d.Age = +(2022 - d.Founded);
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
        circularVis = new CircularVis("circularvis", csv);
        parallelChart = new ParallelVis("parallelvis", csv);
        selectedRange = [5, miniBarChart.height / 3];
        mainData = csv;
        loadTileMap();
    });
};

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
var check = 0;
// React to 'brushed' event and update all bar charts
function brushed() {
    let selectionRange = d3.brushSelection(d3.select(".brush").node());
    selectedRange = selectionRange;
    barchart.selectionRange = selectionRange;
    barchart.wrangleData()
    check++;
    if ((check>1) || (selectedRange[0] != 5)) {
        check =1;
        miniBarChart.selectionRange = selectionRange;
        miniBarChart.wrangleData()
    }
}

function closeCilcularVis() {
    circularVis.closeNav();
}


function closeNav() {
    tileMap.closeNav(true)
}

var parallelChartAnimation = setInterval(function(){parallelChart.generateClick();},3000);