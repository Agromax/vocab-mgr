var fs = require('fs');
var path = require('path');


function getURL(callback) {
    fs.readFile(path.join(__dirname, '../configs', 'dbconfig.json'), function (err, data) {
        if (err) {
            console.log(err);
            if (callback) {
                return callback(null);
            }
        }

        var dbInfo = JSON.parse(data.toString());
        var scheme = dbInfo['scheme'];
        var host = dbInfo['host'];
        var name = dbInfo['name'];

        var url = scheme + '://' + host + '/' + name;
        console.log(url);
        if (callback) {
            callback(url);
        }
    });
}


module.exports.getURL = getURL;