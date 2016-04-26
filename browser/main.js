var sagent = require('superagent');
var d3 = require('d3');

function d3fy (person, mmax) {
  var margin = {top: 40, right: 20, bottom: 30, left: 40},
  width = 400 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  var svg = d3.select('main').append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var data = person.data;
  x.domain(data.map(function(d) { return d.timeStamp; }));
  y.domain([0, mmax]);

  var name = 'nn';
  for (var i = 0; i < data.length; ++i) {
    if ('name' in data[i]) {
      name = data[i].name;
      break;
    }
  }

  svg.append("text")
        .attr("x", (width / 2))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(name);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "5px")
    .style("text-anchor", "end")
    .text("solved");

  svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.timeStamp); })
    .attr("width", x.rangeBand())
    .attr("y", function(d) { return y(d.Solved); })
    .attr("height", function(d) { return height - y(d.Solved); });
}

function displayData (err, data) {
  var tar = document.querySelector("#profiles");
  if (err) {
    return tar.innerHTML = 'There is a problem with the data';
  }
  data = data.body;
  var mmax = 0;
  for (var i = 0; i < data.length; ++i) {
    var person = data[i];
    person.data = JSON.parse(person.data);
    for (var j = 0; j < person.data.length; ++j)
      mmax = Math.max(mmax, person.data[j].Solved);
  }
  for (var i = 0; i < data.length; ++i) {
    var person = data[i];
    d3fy(person, mmax);
  }
}

function start() {
  sagent
    .get('./data.json')
    .set('Accept', 'application/json')
    .end(displayData);
}

document.addEventListener('DOMContentLoaded', start);
