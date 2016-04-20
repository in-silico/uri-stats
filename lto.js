var level = require('level');

var dbpath = process.argv[2];
var db = level(dbpath);

var stream = db.createReadStream();

var data = [];

stream
  .on('data', function (cur) {
    var m = {id: cur.key, data: cur.value};
    data.push(m);
  })
  .on('error', function (err) {
    throw err;
  })
  .on('end', function() {
    console.log(JSON.stringify(data));
  });
