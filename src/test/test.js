var util = require('util');
var BTree = require('../btree.js').BTree;
var assert = require('assert');
describe('BTree', function() {
    var t = new BTree(2);
    var i = 0;

    beforeEach(function() {
        console.log("BeforeEach: " + util.inspect(t));
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
