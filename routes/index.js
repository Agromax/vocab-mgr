var express = require('express');
var router = express.Router();
var path = require('path');
var multer = require('multer');
var crypto = require('crypto');
var schema = require('../lib/schema');
var fs = require('fs');
var toCSV = require('../lib/xlsToCSV');
var mongoose = require('mongoose');

var FileStore = schema.FileStore;
var Triple = schema.Triple;
var TripleStore = schema.TripleStore;

function getExtension(name) {
    var dot = name.lastIndexOf('.');
    if (dot >= 0) {
        return name.slice(dot + 1);
    }
    return null;
}

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, path.join(process.cwd(), 'uploads'));
    },
    filename: function (req, file, callback) {
        var md5sum = crypto.createHash('md5');
        md5sum.update(file.originalname);
        console.log("Original name: " + file.originalname);
        var ext = getExtension(file.originalname) || "";
        callback(null, Math.random().toString(36).slice(2, 10) + '_' + md5sum.digest('hex') + '_' + Date.now() + "." + ext);
    }
});

var upload = multer({storage: storage, fileSize: 10 * 1024 * 1024}).single('payload');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});


router.get('/relations', function (req, res, next) {
    res.download(path.join(__dirname, "../assets", "relations.txt"));
});


router.get('/files', function (req, res) {
    FileStore.find().then(function (files) {
        res.json(files);
    });
});

router.get('/download', function (req, res) {
    var fileId = req.query.id;
    FileStore.findOne({_id: fileId}, function (err, file) {
        if (!err) {
            res.download(file.storagePath);
        } else {
            res.json({
                code: -1,
                msg: err
            });
        }
    });
});


router.get('/delete', function (req, res) {
    var fileId = req.query.id;
    FileStore.findOne({_id: fileId}, function (err, file) {
        if (err) {
            return res.json({
                code: -1,
                msg: err
            });
        }
        file.remove(function (err, file) {
            if (err) {
                return res.json({
                    code: -1,
                    msg: err
                });
            }

            fs.unlink(file.storagePath);
            if (file.csvStoragePath) {
                fs.unlink(file.csvStoragePath);
            }

            res.json({
                code: 0,
                msg: 'Deleted'
            });
        });
    });
});

router.post('/updateName', function (req, res, next) {
    var fileId = req.body.id;
    var fileName = req.body.name;

    FileStore.findOne({_id: fileId}, function (err, file) {
        if (err) {
            return res.json({
                code: -1,
                msg: err
            });
        }
        file.name = fileName;
        file.save(function (err, file) {
            if (err) {
                return res.json({
                    code: -1,
                    msg: err
                });
            }

            res.json({
                code: 0,
                msg: 'Updated the file name'
            });
        });
    });
});


router.get('/upload', function (req, res, next) {
    FileStore.find().then(function (files) {
        res.render('upload', {
            files: files,
            title: 'File Manager'
        });
    });
});


router.post('/upload', function (req, res, next) {
    upload(req, res, function (err) {
        if (err) {
            // An error occurred when uploading
            return res.json(err);
        }
        var filename = req.body.filename;
        var storagePath = req.file.path;

        // Test if its an xls file
        if (storagePath.endsWith('.xls') || storagePath.endsWith('.xlsx')) { // Convert these files to csv
            var csvDump = toCSV(storagePath);
            var storagePathElements = path.parse(storagePath);
            var csvStoragePath = path.join(process.cwd(), "csvs", storagePathElements.name + ".csv");
            new FileStore({
                storagePath: storagePath,
                csvStoragePath: csvStoragePath,
                name: filename,
                time: Date.now()
            }).save().then(function (fs1) {
                if (fs1) {
                    fs.writeFile(csvStoragePath, csvDump, 0);
                    res.json({
                        code: 0,
                        msg: 'File uploaded successfully!'
                    });
                } else {
                    res.json({
                        code: -1
                    });
                }
            });
        } else {
            res.json({
                code: -1,
                msg: 'Incorrect file format, only xls, xlsx formats are supported'
            });
        }
    });
});

router.get('/triples', function (req, res) {
    var fileId = req.query.fileId;
    var page = req.query.page;
    if (!page) page = 0;
    var limit = 25;

    TripleStore.findOne({fileId: fileId}, function (err, file) {
        if (err) {
            return res.json({
                code: -1,
                msg: err
            });
        }

        var triplets = file.triplets;
        if (triplets) {
            var start = page * limit;
            var end = page * limit + limit;
            if (end > triplets.length) {
                end = triplets.length;
            }

            if (start >= 0 && start < end) {
                var result = triplets.slice(start, end);
                return res.json({
                    code: 0,
                    msg: result
                });
            } else {
                return res.json({
                    code: -1,
                    msg: 'Assertion Failure'
                });
            }
        } else {
            return res.json({
                code: -1,
                msg: 'No triplets found'
            });
        }
    });

});

router.post('/updateTriple', function (req, res) {
    var tripleId = req.body.tripleId;
    var sub = req.body.sub;
    var pre = req.body.pre;
    var obj = req.body.obj;
    var fileId = req.body.fileId;

    TripleStore.findOne({fileId: fileId}, function (err, store) {
        if (err) {
            console.log(err);
            return res.json({
                code: -1,
                msg: err
            });
        }

        if (store) {
            // console.log(store);
            var triplets = store.triplets;
            if (triplets) {
                triplets.forEach(function (t) {
                    if (t._id.toString() === tripleId) {
                        t.sub = sub;
                        t.pre = pre;
                        t.obj = obj;

                        store.save(function (err, store1) {
                            if (err) {
                                return res.json({
                                    code: -1,
                                    msg: err
                                });
                            }
                            return res.json({
                                code: 0,
                                msg: 'Done'
                            });
                        });
                    }
                });
                
            } else {
                return res.json({
                    code: -1,
                    msg: 'Triplets are null'
                });
            }
        } else {
            return res.json({
                code: -1,
                msg: 'Store is null'
            });
        }
    });
});

module.exports = router;
