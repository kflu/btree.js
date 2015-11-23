var Q = require('Q');
var btree = require('./btree');

function createTree(minDegree, provider) {
    var d = Q.defer();
    new btree.BTree(2, provider, function (err, tree) {
        if (err) { d.reject(new Error(err)); } else {
            d.resolve(tree);
        }
    });
    return d.promise;
}

btree.BTree.prototype.insertP = function (key, payload) {
    var d = Q.defer();
    this.insert(key, payload, function (err) {
        if (err) { d.reject(new Error(err)); } else {
            d.resolve();
        }
    });
    return d.promise;
};

btree.BTree.prototype.searchP = function (key) {
    var d = Q.defer();
    this.search(key, function (err, cursor) {
        if (err) { d.reject(new Error(err)); } else {
            d.resolve(cursor);
        }
    });
    return d.promise;
};

btree.BTree.prototype.searchFirstP = function (key, f) {
    var d = Q.defer();
    this.searchFirst(key, f, function (err, cursor) {
        if (err) { d.reject(new Error(err)); } else {
            d.resolve(cursor);
        }
    });
    return d.promise;
};

btree.Cursor.prototype.getDataP = function () {
    var d = Q.defer();
    this.getData(function (err, data) {
        if (err) { d.reject(new Error(err)); } else {
            d.resolve(data);
        }
    });
    return d.promise;
};

btree.Cursor.prototype.moveNextP = function () {
    var d = Q.defer();
    this.moveNext(function (err, cursor) {
        if (err) { d.reject(new Error(err)); } else {
            d.resolve(cursor);
        }
    });
    return d.promise;
};

module.exports.createTree = createTree;
