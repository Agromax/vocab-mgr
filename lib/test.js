var PythonShell = require('python-shell');
var path = require('path');
var fs = require('fs');

var scriptPath = path.join(process.cwd(), "scripts", "csvToJson.py");
var csvFilePath = path.join(process.cwd(), "csvs", "jgabnf3g_7a4d818c72d7cd12b7646b5edc8530f5_1469975432454.csv");

var options = {
    mode: 'text',
    pythonPath: 'c:/Python27/python.exe',
    pythonOptions: ['-u'],
    args: [csvFilePath, 'value2', 'value3']
};

console.log(scriptPath);
console.log(csvFilePath);

PythonShell.run(scriptPath, options, function (err, results) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    var j = JSON.parse(results[0]);
    // console.log(JSON.stringify(j));
    fs.writeFile('test.json', JSON.stringify(j));
});