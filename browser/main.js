var sagent = require('superagent');
var d3 = require('d3');
var dnt = require('date-and-time');

function d3fy (person, mmax) {
  if (!person) return;
  var height = 400;
  if (screen.height <= 400) {
    height = 220;
  } else if (screen.height <= 500) {
    height = 250;
  } else if (screen.height <= 650) {
    height = 320;
  }
  var margin = {top: 40, right: 10, bottom: 30, left: 20},
    width = Math.min(screen.width - 100, 500) - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom');

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left');
  var tar = document.querySelector('#graphics');
  tar.innerHTML = '';
  var svg = d3.select('#graphics').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var data = person.data;
  x.domain(data.map(function (d) { return dnt.format(new Date(d.timeStamp), 'MM/DD'); }));
  y.domain([0, mmax]);

  var name = 'nn';
  for (var i = 0; i < data.length; ++i) {
    if ('name' in data[i]) {
      name = data[i].name;
      break;
    }
  }

  svg.append('text')
    .attr('x', (width / 2))
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .text(name);

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '5px')
    .style('text-anchor', 'end')
    .text('solved');

  svg.selectAll('.bar')
    .data(data)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', function (d) { return x(dnt.format(new Date(d.timeStamp), 'MM/DD')); })
    .attr('width', x.rangeBand())
    .attr('y', function (d) { return y(d.Solved); })
    .attr('height', function (d) { return height - y(d.Solved); });

  $('#modal-graphics').openModal();
}

function displayData (err, data) {
  var tar = document.querySelector('#profiles');
  if (err) {
    return tar.innerHTML = 'There is a problem with the data';
  }
  data = data.body;

  var mmax = 0;
  var nicks = [];

  for (var i = 0; i < data.length; ++i) {
    var person = data[i];
    person.data = JSON.parse(person.data);

    var localMax = 0;
    var raiting = [];
    for (var j = 0; j < person.data.length; ++j) {
      mmax = Math.max(mmax, person.data[j].Solved);
      name = person.data[j].name;
      raiting.push(parseInt(person.data[j].Solved));
      localMax = Math.max(localMax, person.data[j].Solved);
    }
    name = name.slice(0, 15);
    var stat = 0;
    var lenR = raiting.length;
    if (lenR >= 2) {
      stat = raiting[lenR - 1] - raiting[lenR - 2];
    }

    nicks.push({'name': name, 'solved': localMax, 'id': person.id, 'st': stat});
  }

  nicks.sort(function (a, b) {
    if (a.solved > b.solved) {
      return -1;
    }
    if (a.solved < b.solved) {
      return 1;
    }
    return 0;
  });

  for (var i = 0; i < nicks.length; i++) {
    var cur = document.createElement('li');
    var spa = document.createElement('span');
    var progress = document.createElement('span');

    cur.id = nicks[i].id;
    cur.innerHTML = nicks[i].name;
    spa.innerHTML = ' [' + nicks[i].solved + ']';
    progress.innerHTML = ' [' + nicks[i].st + ']';
    cur.title = nicks[i].st + ' solved problem(s) the last week';
    cur.appendChild(progress);
    cur.appendChild(spa);

    cur.addEventListener('click', function (event) {
      var idPerson = event.target.id;
      if (!idPerson) {
        idPerson = event.target.parentNode.id;
      }
      var personToGraph = null;
      for (var k = 0; k < data.length; k++) {
        if (data[k].id === idPerson) {
          personToGraph = data[k];
          break;
        }
      }
      d3fy(personToGraph, mmax);
    });

    tar.appendChild(cur);
  }
}

function start () {
  sagent
    .get('./data.json')
    .set('Accept', 'application/json')
    .end(displayData);
}

document.addEventListener('DOMContentLoaded', start);
