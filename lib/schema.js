var mongoose = require('mongoose');

var _db = require('./db');

_db.getURL(function (url) {
    if (url) {
        mongoose.connect(url);
    }
    else {
        console.log("Cannot connect to the database");
    }
});


var TripleSchema = mongoose.Schema({
    sub: String,
    pre: String,
    obj: String
});


var TripleStoreSchema = mongoose.Schema({
    fileId: mongoose.Schema.ObjectId,
    srcTitle: String,
    srcURI: String,
    triplets: [TripleSchema]
});


var FileStoreSchema = mongoose.Schema({
    storagePath: String,
    csvStoragePath: String,
    name: String,
    fileSize: Number,
    time: Date
});


FileStoreSchema.statics.findByCSVStoragePath = function (csvStoragePath, cb) {
    this.findOne({csvStoragePath: csvStoragePath}, function (err, data) {
        if (err) {
            console.log(err);
            return cb(null);
        }
        cb(data);
    });
};

var Triple = mongoose.model('Triple', TripleSchema);
var TripleStore = mongoose.model('TripleStore', TripleStoreSchema);
var FileStore = mongoose.model('FileStore', FileStoreSchema);


module.exports.Triple = Triple;
module.exports.TripleStore = TripleStore;
module.exports.FileStore = FileStore;