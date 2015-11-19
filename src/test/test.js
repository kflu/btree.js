var fs = require('fs');
var path = require('path');
var util = require('util');
var BTree = require('../btree.js').BTree;
var assert = require('assert');

if (global.v8debug) {
        global.v8debug.Debug.setBreakOnException(); // enable it, global.v8debug is only defined when the --debug or --debug-brk flag is set
}

describe('BTree', function() {
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
