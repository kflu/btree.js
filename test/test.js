var fs = require('fs');
var path = require('path');
var util = require('util');
var BTree = require('../lib/btree.js').BTree;
var assert = require('assert');
var Provider = require('../lib/InMemoryProvider');
var createTree = require('../lib/btreep.js').createTree;

if (global.v8debug) {
        global.v8debug.Debug.setBreakOnException(); // enable it, global.v8debug is only defined when the --debug or --debug-brk flag is set
}

describe('new test', function () {
    it('', function (done) {
        createTree(2, new Provider()).then(function (tree) {
            console.log('tree created ');
            console.log("inserting 1a");
            return tree.insertP(1, '1a')
            .then(function () {
                console.log("inserting 1b");
                return tree.insertP(1, '1b');
            })
            .then(function () {
                console.log("inserting 2a");
                return tree.insertP(2, '2a');
            })
            .then(function () {
                return tree.insertP(2, '2b');
            })
            .then(function () {
                return tree.insertP(3, '3a');
            })
            .then(function () {
                return tree.insertP(3, '3b');
            })
            .then(function () {
                return tree.insertP(3, '3c');
            })
            .then(function () {
                console.log('tree population finished. tree: ' + util.inspect(tree, {depth: null, color: true}));
                done();
            }, function (err) {
                done(err);
            });
        });
    });
});

/*
describe('BTree', function() {
    describe('isFull', function() {
        var t = null;
        var i = 0;

        beforeEach(function() {
            console.log("BeforeEach: ==========================");
            console.log("BeforeEach: " + util.inspect(t, {depth: null, colors: true}));
        });

        afterEach(function() {
            console.log("AfterEach: insert " + i);
            t.insert(i++);
        });

        // fresh new
        it('should not be full', function() { assert.strictEqual(t.root.isFull(), false); });

        // insert 0
        it('should not be full', function() { assert.strictEqual(t.root.isFull(), false); });

        // insert 1
        it('should not be full', function() { assert.strictEqual(t.root.isFull(), false); });

        // insert 2
        it('should be full', function() { assert.strictEqual(t.root.isFull(), true); });

        // insert 3
        it('should not be full', function() { assert.strictEqual(t.root.isFull(), false); });
    });

    describe('search', function() {
        var tree = new BTree(2);
        tree.insert(1, "1a");
        tree.insert(1, "1b");
        tree.insert(2, "2a");
        tree.insert(2, "2b");
        tree.insert(2, "2c");
        tree.insert(2, "2d");
        tree.insert(3, "3a");

        var cursor;
        var result;

        var dataeq = function(x, y, cb) {
            if (cb) cb(x, y);
            if (x === y) return true;
            return x.key === y.key && x.payload === y.payload;
        };

        var logdata = function(x, y) {
            console.log("x: " + util.inspect(x));
            console.log("y: " + util.inspect(y));
        };

        it('should find the first object', function() {
            cursor = tree.searchFirst(1);
            assert(cursor !== null, 'cursor !== null');
            assert(dataeq(cursor.getData(), {key: 1, payload: '1a'}, logdata));
        });

        it('cursor can move to next', function() {
            result = cursor.moveNext();
            assert(result === true, 'moveNext() === true');
            assert(dataeq(cursor.getData(), {key: 1, payload: '1b'}, logdata));

            result = cursor.moveNext();
            assert(result === true, 'moveNext() === true');
            assert(dataeq(cursor.getData(), {key: 2, payload: '2a'}, logdata));

            result = cursor.moveNext();
            assert(result === true, 'moveNext() === true');
            assert(dataeq(cursor.getData(), {key: 2, payload: '2b'}, logdata));

            result = cursor.moveNext();
            assert(result === true, 'moveNext() === true');
            assert(dataeq(cursor.getData(), {key: 2, payload: '2c'}, logdata));

            result = cursor.moveNext();
            assert(result === true, 'moveNext() === true');
            assert(dataeq(cursor.getData(), {key: 2, payload: '2d'}, logdata));

            result = cursor.moveNext();
            assert(result === true, 'moveNext() === true');
            assert(dataeq(cursor.getData(), {key: 3, payload: '3a'}, logdata));

            result = cursor.moveNext();
            assert(result === false, 'moveNext() === false');
            assert(dataeq(cursor.getData(), {key: 3, payload: '3a'}, logdata));
        });

        it('should find the last object', function() {
            cursor = tree.searchFirst(3);
            assert(dataeq(cursor.getData(), {key: 3, payload: '3a'}, logdata));
        });

        it('can find the data in the middle, and cursor can advance', function() {
            cursor = tree.searchFirst(2);
            assert(dataeq(cursor.getData(), {key: 2, payload: '2a'}, logdata));

            result = cursor.moveNext();
            assert(dataeq(cursor.getData(), {key: 2, payload: '2b'}, logdata));
        });

        it('can find using the key transformer', function() {
            cursor = tree.searchFirst(4, function (x) { return 2 * x; });
            assert(dataeq(cursor.getData(), {key: 2, payload: '2a'}, logdata));
        });
    });
});

describe('Populating BTree', function() {
    var tree = new BTree(2);

    it('can populate large corpus', function(done) {
        fs.readFile(path.join(__dirname, './shakespeare.txt'), {encoding: 'utf8'}, function(err, data) {
            if (err) {
                throw err;
            }

            data = data.slice(0, 10000);
            var words = data.replace(/\r\n/g, " ").split(" ").filter(function(word) { return word !== ''; });
            console.log(words.length + " words to insert");

            words.forEach(function(w) {
                tree.insert(w);
            });

            done();
        });
    });

    it('can find inserted keys', function() {
        var cursor = tree.root.search('his');
        assert.strictEqual(cursor.getData().key, 'his', 'unexpected found key');
    });
});
*/
