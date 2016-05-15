var sagent = require('superagent');
var d3 = require('d3');
var dnt = require('date-and-time');
var c3 = require('c3');

function c3G(data) {

  var height = 400;
  var width = 700;
  if (screen.height <= 400) {
    height = 220;
    width = 200;
  } else if (screen.height <= 500) {
    height = 250;
    width = 230;
  } else if (screen.height <= 650) {
    height = 320;
    width = 280;
  }

  problems = ["name"];
  delta = ["delta", 0];
  dates = ["date"];
  
  for(var i = 0; i < data.data.length; i++) {
    if(data.data[i].name != null) problems[0] = data.data[i].name;
    problems.push(parseInt(data.data[i].Solved));
    if (i)
      delta.push(problems[i + 1] - problems[i]);
    dates.push(dnt.format(new Date(data.data[i].timeStamp), 'MM-DD'));
  }

  var chart = c3.generate({
    bindto: '#graphics',
    data: {
      x: 'date',
      xFormat: '%m-%d',
      
      columns: [
        dates,
        problems,
        delta
      ],
      type: 'spline',
      axes: {
        delta: 'y2'
      }
    },

    axis : {
      x : {
        type : 'timeseries',
        tick: {
          format: '%m-%d'
        }
      },
      y: {
        label: {
          text: 'Solved problems',
          position: 'outer-middle'
        }
      },
      y2: {
        show: true,
        label: {
          text: 'Problems by week',
          position: 'outer-middle'
          
        }
      }
    }

  });

  chart.resize({height: height, width: width});
  $('#modal-graphics').openModal();
}

function displayData (err, data) {
  var urlProfile = 'https://www.urionlinejudge.com.br/judge/en/profile/';
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
    var name = null;
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
    var cur = document.createElement('div');
    var divInfo = document.createElement('div');
    var divName = document.createElement('div');
    
    cur.id = nicks[i].id;
    cur.className = 'floating-box';
    divName.innerHTML = '<a href="' + urlProfile + nicks[i].id + '" target=_blank>' +nicks[i].name + '</a><br />';
    divInfo.innerHTML = 'Problems Solved: ' + ' <span>[' + nicks[i].solved + ']<span><br />';
    divInfo.innerHTML += 'Last Week: ' + ' <span>[' + nicks[i].st + ']<span>';

    
    divInfo.addEventListener('click', function (event) {
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

      c3G(personToGraph);
    });
    cur.appendChild(divName);
    cur.appendChild(divInfo);
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
