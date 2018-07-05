var w = 1000;
var h = 750;

var svg = d3
  .select("#chart")
  .attr("width", w)
  .attr("height", h);

var path = d3.geoPath();

d3.json(
  "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json",
  function(error, countyData) {
    if (error) throw error;

    d3.json(
      "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json",
      function(error, eduData) {
        if (error) throw error;

        var minVal = d3.min(eduData, function(d) {
          return d.bachelorsOrHigher;
        });
        var maxVal = d3.max(eduData, function(d) {
          return d.bachelorsOrHigher;
        });

        var scale = d3
          .scaleThreshold()
          .domain(d3.range(minVal, maxVal, (maxVal - minVal) / 8))
          .range(d3.schemeGreens[9]);

        var tip = d3
          .tip()
          .attr("class", "d3-tip")
          .attr("id", "tooltip")
          .html(function(d) {
            var county = eduData.filter(function(x) {
              return x.fips == d.id;
            });
            return (
              county[0].area_name +
              ", " +
              county[0].state +
              ": " +
              county[0].bachelorsOrHigher +
              "%"
            );
          })
          .direction("ne");
        svg.call(tip);

        svg
          .append("text")
          .text("United States Educational Attainment")
          .attr("id", "title")
          .attr("transform", "translate(0,30)")
          .attr("font-size", "30px");

        svg
          .append("text")
          .text(
            "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
          )
          .attr("id", "description")
          .attr("transform", "translate(0,60)");

        var defs = svg.append("defs");

        var gradient = defs
          .append("linearGradient")
          .attr("id", "legendGradient")
          .attr("x1", "0%")
          .attr("x2", "100%")

        gradient
          .append("stop")
          .attr("class", "start")
          .attr("offset", "0%")
          .attr("stop-color", scale(minVal))
          .attr("stop-opacity", 1);

        gradient
          .append("stop")
          .attr("class", "end")
          .attr("offset", "100%")
          .attr("stop-color", scale(maxVal))
          .attr("stop-opacity", 1);
        
        var legendScale = d3.scaleLinear()
          .domain([minVal, maxVal])
          .range([0, 200]);
        
        var legendAxis = d3.axisTop(legendScale)
          .tickFormat(function(d) {
            return d + "%";
          });

        var legend = svg
          .append("g")
          .attr("id", "legend")
          .attr("transform", "translate(650,100)");

        legend
          .append("rect")
          .attr("width", 200)
          .attr("height", 10)
          .attr("fill", "url(#legendGradient)")
          .attr("stroke", "black")
          .attr("shape-rendering", "crispEdges")
        
        legend
          .append("g")
          .attr("shape-rendering", "crispEdges")
          .call(legendAxis);

        var counties = topojson.feature(countyData, countyData.objects.counties)
          .features;

        svg
          .selectAll("path")
          .data(counties)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("class", "county")
          .attr("fill", function(d) {
            var county = eduData.filter(function(x) {
              return x.fips == d.id;
            });
            if (county[0]) {
              return scale(county[0].bachelorsOrHigher);
            } else {
              return "white";
            }
          })
          .attr("transform", "translate(30, 100)")
          .on("mouseover", tip.show)
          .on("mouseout", tip.hide);
      }
    );
  }
);
