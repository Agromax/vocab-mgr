var mongoose = require('mongoose');
var hash = require('./hash');

mongoose.connect('mongodb://localhost/intersect');
mongoose.Promise = require('promise');


