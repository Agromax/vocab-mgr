var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});


router.get('/relations', function (req, res, next) {
    res.download(path.join(__dirname, "../assets", "relations.txt"));
});
module.exports = router;
