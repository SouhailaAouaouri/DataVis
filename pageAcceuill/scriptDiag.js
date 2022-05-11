// identification des diagrame pie/bar/rowchar
var yearRingChart   = dc.pieChart("#chart-ring-year"),
    spendHistChart  = dc.barChart("#chart-hist-spend"),
    spenderRowChart = dc.rowChart("#chart-row-spenders");

//identification de tableau des données initial/selectionnées
var table = dc.dataTable('#table');
//import data csv
d3.csv("data.csv", function(spendData) {spendData.forEach(function(d) {
    //d+: calculer tout chiffre de 0 à 9
    // normalize/parse data
     d.Emails = d.Emails.match(/\d+/)[0];
 });
/*var spendData = [
    {Name: 'Jeff', Emails: '1400', Year: 2001},
    {Name: 'James', Emails: '1000', Year: 2001},
    {Name: 'Kay', Emails: '4000', Year: 2001},
    {Name: 'Jeff', Emails: '7000', Year: 2000},
    {Name: 'James', Emails: '2000', Year: 2000},
    {Name: 'James', Emails: '5000', Year: 1999},
    {Name: 'Kay', Emails: '3000', Year: 1999},
    {Name: 'Richard', Emails: '6000', Year: 2001},
    {Name: 'Mathew', Emails: '1000', Year: 2001},
    {Name: 'Sally', Emails: '4000', Year: 2001},
    {Name: 'Richard', Emails: '2000', Year: 2000},
    {Name: 'Mathew', Emails: '8000', Year: 2000},
    {Name: 'Mathew', Emails: '5000', Year: 1999},
    {Name: 'Sally', Emails: '3000', Year: 1999}
];*/

// set crossfilter
var ndx = crossfilter(spendData),
    yearDim  = ndx.dimension(function(d) {return +d.Year;}),
    spendDim = ndx.dimension(function(d) {return Math.floor(d.Emails/10);}),
    nameDim  = ndx.dimension(function(d) {return d.Name;}),
    spendPerYear = yearDim.group().reduceSum(function(d) {return +d.Emails;}),
    spendPerName = nameDim.group().reduceSum(function(d) {return +d.Emails;}),
    spendHist    = spendDim.group().reduceCount();


var colorScale = d3.scale.ordinal()
            .domain(["Year 1", "Year 2", "Year 3","Year 4"])
            .range(["#fc8d59", "#998ec3", "#7fbf7b", "#1c789b"]);

  
  yearRingChart
    .width(300)
    .height(300)
    .dimension(yearDim)
    .group(spendPerYear)
    .innerRadius(50)
    .colors(colorScale)
    .controlsUseVisibility(true);


var colorScale1 = d3.scale.ordinal().range(["#99d8c9"]);

  spendHistChart
    .dimension(spendDim)
    .group(spendHist)
    .x(d3.scale.linear().domain([100,1000]))
    .xUnits(function(){return 25;})
    .elasticY(true)
    .colors(colorScale1)
    .controlsUseVisibility(true);
  //controlsUseVisibility :utilise l'attribut de visibilité au lieu de l'attribut d'affichage pour afficher/masquer une réinitialisation du graphique et filtrer les contrôles.

    spendHistChart.xAxis().tickFormat(function(d) {return d*10}); // convert back to base unit
    spendHistChart.yAxis().ticks(2);

    //chercher par nom /spendPerName /diag3 bl 3ordh
spenderRowChart
    .dimension(nameDim)
    .group(spendPerName)
    .elasticX(true)
    .colors(colorScale1)
    .controlsUseVisibility(true);
//Elasticsearch elasticX

  //  tabl des données
    var allDollars = ndx.groupAll().reduceSum(function(d) { return +d.Emails; });
table
    .dimension(spendDim)
    .group(function(d) {
        return d.value;
    })
    .showGroups(false)
    .columns(['Name',
              {
                  label: 'Emails',
                  format: function(d) {
                      return '' + d.Emails;
                  }
              },
              'Year',
              {
                  label: 'Percent of Total',
                  format: function(d) {
                      return Math.floor((d.Emails / allDollars.value()) * 100) + '%';
                  }
              }]);
//download data
d3.select('#download')
    .on('click', function() {
        var data = nameDim.top(Infinity);
        if(d3.select('#download-type input:checked').node().value==='table') {
            data = data.map(function(d) {
                var row = {};
                table.columns().forEach(function(c) {
                    row[table._doColumnHeaderFormat(c)] = table._doColumnValueFormat(c, d);
                });
                return row;
            });
        }
        var blob = new Blob([d3.csv.format(data)], {type: "text/csv;charset=utf-8"});
        saveAs(blob, 'data.csv');
    });
dc.renderAll();
 });
