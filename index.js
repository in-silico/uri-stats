var fetchUser = require('fetch-user-uri');
var levelup = require('levelup');

function fetchUsers (opts) {
  if (!opts) opts = {};

  var userPath = opts.userPath || './users.js';
  var dbPath = opts.dbPath || './uri-users';
  var db = levelup(dbPath);

  function saveEntry (key, data) {
    db.put(key, JSON.stringify(data));
  }

  function updateEntry (key, data) {
    db.get(key, function (err, value) {
      if (err) {
        if (err.notFound) saveEntry(key, [data]);
        else throw err;
      } else {
        var tmp = JSON.parse(value);
        tmp.push(data);
        saveEntry(key, tmp);
      }
    });
  }

  var users = require(userPath);
  for (var i = 0; i < users.length; ++i) {
    var cur = users[i];
    (function (cur) {
      fetchUser(cur, function (user) {
        user.timeStamp = Date.now();
        updateEntry(cur, user);
      });
    })(cur);
  }
}

fetchUsers();
