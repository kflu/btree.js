var btree = require('./btree');

/*
 * A provider implements:
 *  getId
 *  createNode
 *  load
 *  save
 *
 */

function InMemoryProvider() {
}

InMemoryProvider.prototype.getId = function (node) {
    return node;
};

InMemoryProvider.prototype.save = function (node, cb) {
    cb();
};

InMemoryProvider.prototype.load = function (id, cb) {
    // for in memory provider, id is node
    cb(undefined, id);
};

InMemoryProvider.prototype.createNode = function (tree, parentId, cb) {
    var node = new btree.BTreeNode(tree, parentId);
    cb(undefined, node);
};

module.exports = InMemoryProvider;
