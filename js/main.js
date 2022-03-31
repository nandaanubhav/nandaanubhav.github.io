//reading csv file
d3.csv("data/Market_Divers.csv").then(csv => {
    csv.forEach(function (d) {
        d.index = +d.index;
        d.Rating = +d.Rating;
        d.Founded = +d.Founded;
        d["Lower Salary"] = +d["Lower Salary"];
        d["Upper Salary"] = +d["Upper Salary"];
        d["Avg Salary(K)"] = +d["Avg Salary(K)"];
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
    console.log(csv);
});