var sagent = require('superagent');

function displayData(err, data) {
  var tar = document.querySelector("#profiles");
  if (err) {
   return tar.innerHTML = 'There is a problem with the data';
  }
  data = data.body;
  for (var i = 0; i < data.length; ++i) {
    var person = data[i];
    var cur = document.createElement('div');
    cur.id = person.id;
    cur.innerHTML = 'Profile of ' + person.id;
    tar.appendChild(cur);
  }
}

function start() {
  sagent
    .get('./data.json')
    .set('Accept', 'application/json')
    .end(displayData);
}

document.addEventListener('DOMContentLoaded', start);
