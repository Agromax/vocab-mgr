var chokidar = require('chokidar'),
    path = require('path');
var PythonShell = require('python-shell');
var fs = require('fs');
var schema = require('../lib/schema');
var mongoose = require('mongoose');

var Triple = schema.Triple;
var TripleStore = schema.TripleStore;
var FileStore = schema.FileStore;

var scriptPath = path.join(process.cwd(), "scripts", "csvToJson.py");
var options = {
    mode: 'text',
    pythonPath: 'c:/Python27/python.exe',
    pythonOptions: ['-u'],
    args: []
};

var triples = [];
function storeTriple(sub, pre, obj) {
    triples.push({
        sub: sub,
        pre: pre,
        obj: obj
    });
}

function genTriples1(root, subj) {
    // console.log(subj + " ? " + root.text);
    storeTriple(subj, "?", root.text);
    var children = root.nodes;
    children.forEach(function (child) {
        var predicate = child.text;
        genTriples1(child, subj);
    });
}

function genTriples0(root) {
    var subj = root.text;
    root.nodes.forEach(function (node) {
        genTriples1(node, subj);
        genTriples(node);
    });
}

function genTriples(vocab) {
    var roots = vocab.nodes;
    roots.forEach(function (root) {
        genTriples0(root);
    });
}


function makeGlob(path) {
    return path.split('\\').join('/');
}
var watchPath = makeGlob(path.join(process.cwd(), "csvs", "*.csv"));

console.log("Hi, I'll be watching following glob for changes: " + watchPath);

chokidar.watch(watchPath, {
    ignored: /[\/\\]\./,
    ignoreInitial: true
}).on('all', (event, path) => {
    if (event === 'add') {
        console.log("I'll be generating triples from the file: " + path + " in a moment");
        path = path.charAt(0).toLowerCase() + path.slice(1);
        console.log(path);
        FileStore.findByCSVStoragePath(path, function (item) {
            if (!item) {
                return console.log('I choose to ignore the file: ' + path + ', as its an orphan');
            }
            options.args = [path];
            PythonShell.run(scriptPath, options, function (err, results) {
                if (err) throw err;
                triples = [];
                results.forEach(function (result) {
                    try {
                        var j = JSON.parse(results[0]);
                        genTriples(j);
                        new TripleStore({
                            fileId: item._id,
                            srcTitle: item.name,
                            triplets: triples
                        }).save(function (err, ts) {
                            if (err) {
                                console.log(err);
                            }
                        })
                    } catch (err) {
                        console.log(err);
                    }
                });
            });
        });
    }
});

