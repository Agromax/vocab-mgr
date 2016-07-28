var mongoose = require('mongoose');

var _db = require('db');

_db.getURL(function (url) {
    if (url) {
        mongoose.connect(url);
    }
    else {
        console.log("Cannot connect to the database");
    }
});




