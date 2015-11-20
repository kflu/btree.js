var fs = require('fs');
var path = require('path');
var util = require('util');
var BTree = require('../lib/btree.js').BTree;
var assert = require('assert');

if (global.v8debug) {
        global.v8debug.Debug.setBreakOnException(); // enable it, global.v8debug is only defined when the --debug or --debug-brk flag is set
}

describe('BTree', function() {
    describe('isFull', function() {
        var t = new BTree(2);
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

    /*
     * FIXME: These tests fail because if there're duplicated keys, the search can land on
     * a key in the middle. So the cursor needs to go both directions to find all dups.
     * Not really a btree implementation problem, but the expection was wrong.
     */
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
            cursor = tree.search(1);
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
            assert(result === true, 'moveNext() === true');
            assert(dataeq(cursor.getData(), {key: 3, payload: '3a'}, logdata));
        });

        it('should find the last object', function() {
            cursor = tree.search(3);
            assert.strictEqual(cursor, true, "cursor");
            assert(dataeq(cursor.getData(), {key: 3, payload: '3a'}, logdata));
        });

        it('can find the data in the middle, and cursor can adcance', function() {
            cursor = tree.search(2);
            assert.strictEqual(cursor, true, "cursor");
            assert(dataeq(cursor.getData(), {key: 2, payload: '2a'}, logdata));

            result = cursor.moveNext();
            assert.strictEqual(cursor, true, "cursor");
            assert(dataeq(cursor.getData(), {key: 2, payload: '2b'}, logdata));
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
