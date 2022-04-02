// init global variables & switches
let barchart
let parseDate = d3.timeParse("%m/%d/%Y");

//reading csv file
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
    // console.log(csv);
    mainPage(csv)
});

function mainPage(data) {
    console.log(data)
    barchart = new BarChart("barchart-div", data);
}