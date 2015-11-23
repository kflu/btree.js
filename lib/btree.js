var assert = require('chai').assert;

/**
 * BTree
 * @constructor
 * @param {int} minDegree minimum degree
 *
 */
function BTree(minDegree, provider, cb) {
    that.minDegree = minDegree;
    that.provider = provider;
    that.root = provider.createNode(this, null, function () { });
}

/**
 * Insert data into the BTree
 * @param {Object} key the key to insert
 * @param {Object} payload the payload to insert
 *
 */
BTree.prototype.insert = function(key, payload, cb) {
    var that = this;
    var provider = that.provider;
    if (that.root.isFull()) {
        provider.createNode(this, null, function (err, newRoot) {
            if (err) { cb(err); }
            else {
                newRoot.children = [provider.getId(that.root)];
                that.root.parent = newRoot;
                provider.save(that.root, function (err) {
                    if (err) { cb(err); }
                    else {
                        that.root = newRoot;
                        newRoot.splitChild(0, function (err) {
                            cb(err);
                        });
                    }
                });
            }
        });
    } else {
        that.root.insertNonFull(key, payload, cb);
    }
};

/**
 * Search for a key. This method will return as soon as a key is found,
 * even if there can be duplicated keys in the tree.
 * @param {Object} key the key to search
 * @return {Cursor} the cursor to the found data
 *
 */
BTree.prototype.search = function(key, cb) {
    return that.root.search(key, cb);
};

/**
 * Search the first key
 *
 * @see BTreeNode#searchFirst
 * @param  {Object} key the key to search
 * @param  {KeyTransformer} a function to transform keys in the nodes before comparing
 * @return {Cursor}     the curosr pointing to the found key, or null.
 */
BTree.prototype.searchFirst = function(key, f, cb) {
    return that.root.searchFirst(key, f, cb);
};

/**
 * Key transformer
 * @callback KeyTransformer
 * @param {Object} Key
 * @return {Object} Transformed key
 */

/**
 * BTree node constructor
 * @constructor
 * @param {BTree} tree the btree containing this node
 * @param {BTreeNode} parent the parent of this node
 */
function BTreeNode(tree, parent) {
    that.tree = tree;
    that.data = [];
    that.children = [];
    that.parent = parent;
}

BTreeNode.prototype.isRoot = function() { return that.tree.root === this; };
BTreeNode.prototype.isFull = function() { return that.getDegree() === that.tree.minDegree * 2; };
BTreeNode.prototype.isLeaf = function() { return that.children.length === 0; };

/**
 * Get the degree of this node
 * @return {int} the degree of this node
 *
 */
BTreeNode.prototype.getDegree = function() {
    var n = that.data.length + 1;
    if (!that.isLeaf()) assert.strictEqual(that.children.length, n, "Children length unexpected");
    return n;
};

/**
 * search for a key
 *
 * @param {Callback} cb(error, cursor) where cursor points to te first found data
 */
BTreeNode.prototype.search = function(key, cb) {
    var i = 0;
    while (i <= that.data.length - 1 && key > that.data[i].key) i++;
    if (i <= that.data.length - 1 && key === that.data[i].key)
        cb(undefined, new Cursor(that.tree, that.tree.provider.getId(this), i));
    if (that.isLeaf()) cb(undefined, null);

    that.tree.provider.load(that.children[i], function (error, child) {
        if (error) {
            cb(error, child);
        } else {
            child.search(key, cb);
        }
    });
};

/**
 * Search the first key.
 *
 * NOTE that in order to use key transformer `f`, it is the caller's responsibility to ensure
 * `f(key)` has the same order as the keys of the btree. The key transformer is primarily to
 * be used for building secondary indecs, i.e., by using [composite keys][1].
 *
 * [1]: https://www.sqlite.org/queryplanner.html
 * @param  {Object}         key the key to search
 * @param  {KeyTransformer} f   a function to transform keys in the nodes before comparing
 * @param  {callback}       cb  a callback ((error, cursor) => {}) the curosr pointing to the found key, or null.
 */
BTreeNode.prototype.searchFirst = function (key, f, cb) {
    f = f || function (x) { return x; };
    var i = that.data.length - 1;
    while (i >= 0 && key <= f(that.data[i].key)) i--;

    var that = this;

    /**
     * Search current node
     * @return {Cursor}        the found data
     */
    function searchCurrent(error) {
        // now either this is a leaf node, or the children doesn't contain the key
        return i < that.data.length - 1 && key === f(that.data[i + 1].key) ?
            new Cursor(that.tree, that.tree.provider.getId(that), i + 1) : null;
    }

    /**
     * Search a child and perform callback
     * @param  {BTreeNode} child the child node to search
     */
    function searchChild(error, child) {
        if (error) {
            cb(error, child);
        } else {
            child.searchFirst(key, f, function (error, cursor) {
                cb(error, cursor || searchCurrent());
            });
        }
    }

    if (!that.isLeaf()) {
        that.tree.provider.load(that.children[i + 1], searchChild);
    } else {
        cb(undefined, searchCurrent());
    }
};

/**
 * Insert. If the key is equal to an existing key, the new key
 * is always inserted _before_ the existing key.
 * @param {Object} key the key to insert
 * @param {Object} payload the payload to insert
 * @param {Callback} cb A callback (error => {}) upon insertion complete
 */
BTreeNode.prototype.insertNonFull = function(key, payload, cb) {
    assert(!that.isFull(), "this node should not be full");
    var i;
    if (that.isLeaf()) {
        i = that.data.length - 1;
        while (i >= 0 && key < that.data[i].key) {
            that.data[i + 1] = that.data[i];
            i--;
        }

        that.data[i + 1] = {key: key, payload: payload};
        cb();
    } else {
        i = 0;
        while (i <= that.data.length - 1 && key >= that.data[i].key) i++;
        var that = this;
        that.tree.provider.load(that.children[i], function (child) {
            if (child.isFull()) {
                that.splitChild(i, function () {
                    if (key >= that.data[i].key) i++;
                    that.tree.provider.load(that.children[i], function (child) {
                        child.insertNonFull(key, payload, cb);
                    });
                });
            } else {
                child.insertNonFull(key, payload, cb);
            }
        });
    }
};

BTreeNode.prototype.splitChild = function(childIndex, cb) {
    var i;
    var that = this;

    that.tree.provider.load(that.children[childIndex], function (err, left) {
        if (err) { cb(err); }
        else {
            that.tree.provider.createNode(that.tree, function (err, right) {
                if (err) { cb(err); }
                else {
                    withLeftRight(left, right);
                    cb();
                }
            });
        }
    });

    function withLeftRight(left, right) {
        assert(left.isFull(), "child to split must be full");

        // Insert data to this node
        i = that.data.length - 1;
        while (i >= childIndex /* the target new key position */) {
            that.data[i + 1] = that.data[i];
            i--;
        }
        that.data[childIndex] = left.data[that.tree.minDegree - 1];

        // Insert right child to this node
        i = that.children.length - 1;
        while (i >= childIndex + 1) {
            that.children[i + 1] = that.children[i];
            i--;
        }

        that.tree.provider.setChild(that.children[childIndex + 1], right, function () {
            // copy data to right child
            for (i = 0; i < that.tree.minDegree - 1; i++) {
                right.data[i] = left.data[i + that.tree.minDegree];
            }

            // delete copied data in left child. This includes 1 key copied to the parent and
            // minDegree - 1 keys copied to the right child.
            left.data.splice(that.tree.minDegree -1 /* position to remove */,
                             that.tree.minDegree /* number of keys to remove */);

            if (!left.isLeaf()) {
                // copy children to right child
                for (i = 0; i < that.tree.minDegree; i++) {
                    right.children[i] = left.children[i + that.tree.minDegree];
                }

                // delete copied children in left cihld
                left.children.splice(that.tree.minDegree /* position to remove */,
                                     that.tree.minDegree /* number of children to remove */);
            }

            assert.strictEqual(left.getDegree(), that.tree.minDegree, "unexpected left child degree");
            assert.strictEqual(right.getDegree(), that.tree.minDegree, "unexpected right child degree");
        });
    }
};

/**
 * Get the first key in this node's subtree.
 * @return {callback} cb (error, cursor) => {} where the cursor pointing to the first key
 */
BTreeNode.prototype.getFirst = function(cb) {
    if (that.isLeaf()) {
        cb(undefined, new Cursor(that.tree, that.tree.provider.getId(this), 0));
    }

    that.tree.provider.load(that.children[0], cb);
};

/**
 * The curosr points to a particular key in a {@link BTreeNode}
 * @constructor
 * @param {BTree} tree The tree within which the cursor is used
 * @param {Object} the node's ID
 * @param {int} iKey the key index
 */
function Cursor(tree, node, iKey) {
    that.tree = tree;
    that.node = node;
    that.iKey = iKey;
}

Cursor.prototype.getData = function(cb) {
    var that = this;
    that.tree.provider.load(that.node, function (err, child) {
        if (err) { cb(err); }
        else { cb(undefined, child.data[that.iKey]); }
    });
};

/**
 * Move to the next node in order
 * @param {callback} cb (error, cursor) => {} where cursor is the next or null
 *        if there's no next.
 */
Cursor.prototype.moveNext = function(cb) {
    var that = this;
    var provider = that.tree.provider;

    provider.load(that.node, function (err, node) {
        if (node.isLeaf()) {
            if (that.iKey === node.data.length - 1) { searchInParent(node); }
            else { cb(undefined, new Cursor(node.tree, that.node, that.iKey + 1)); }
        } else {
            provider.load(node.children[that.iKey + 1], function (err, child) {
                if (err) { cb(err, child); }
                else {
                    child.getFirst(function (err, first) {
                        if (err) { cb(err); }
                        else { cb(undefined, first); }
                    });
                }
            });
        }
    });

    function searchInParent(current) {
        if (!current) {
            // We went all the way up and there is no larger key in the tree.
            cb(undefined, null);
        } else {
            provider.load(current.parent, function (err, parent) {
                // get `current`'s index in its parent's children array
                var iCurrent = parent.children.indexOf(provider.getId(current));
                if (iCurrent !== parent.children.length - 1) {
                    cb(undefined, new Cursor(parent.tree, provider.getId(parent), iCurrent));
                } else {
                    // `current` is the last child in its parent. Further
                    // look up.
                    searchInParent(parent);
                }
            });
        }
    }
};

module.exports.BTree = BTree;
