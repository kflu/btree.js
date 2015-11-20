var assert = require('chai').assert;

/**
 * BTree
 * @constructor
 * @param {int} minDegree minimum degree
 *
 */
function BTree(minDegree) {
    this.minDegree = minDegree;
    this.root = new BTreeNode(this, null);
}

/**
 * Insert data into the BTree
 * @param {Object} key the key to insert
 * @param {Object} payload the payload to insert
 *
 */
BTree.prototype.insert = function(key, payload) {
    if (this.root.isFull()) {
        // create a new root. Properly update the parent-child
        // relationship between the new and old root, and update
        // the tree root reference.
        var newRoot = new BTreeNode(this, null);
        newRoot.children = [this.root];
        this.root.parent = newRoot;
        this.root = newRoot;

        newRoot.splitChild(0);
    }

    this.root.insertNonFull(key, payload);
};

/**
 * Search for a key. This method will return as soon as a key is found,
 * even if there can be duplicated keys in the tree.
 * @param {Object} key the key to search
 * @return {Cursor} the cursor to the found data
 *
 */
BTree.prototype.search = function(key) {
    return this.root.search(key);
};

/**
 * BTree node constructor
 * @constructor
 * @param {BTree} tree the btree containing this node
 * @param {BTreeNode} parent the parent of this node
 */
function BTreeNode(tree, parent) {
    this.tree = tree;
    this.data = [];
    this.children = [];
    this.parent = parent;
}

BTreeNode.prototype.isRoot = function() { return this.tree.root === this; };
BTreeNode.prototype.isFull = function() { return this.getDegree() === this.tree.minDegree * 2; };
BTreeNode.prototype.isLeaf = function() { return this.children.length === 0; };

/**
 * Get the degree of this node
 * @return {int} the degree of this node
 *
 */
BTreeNode.prototype.getDegree = function() {
    var n = this.data.length + 1;
    if (!this.isLeaf()) assert.strictEqual(this.children.length, n, "Children length unexpected");
    return n;
};

/**
 * search for a key
 *
 * @return {Cursor} the cursor pointing to the first key found
 */
BTreeNode.prototype.search = function(key) {
    var i = 0;
    while (i <= this.data.length - 1 && key > this.data[i].key) i++;
    if (i <= this.data.length - 1 && key === this.data[i].key) return new Cursor(this, i);
    if (this.isLeaf()) return null;
    return this.children[i].search(key);
};

/**
 * search the first key
 * @param  {Object} key the key to search
 * @return {Cursor}     the curosr pointing to the found key, or null.
 */
BTreeNode.prototype.searchFirst = function (key) {
    var i = this.data.length - 1;
    while (i >= 0 && key <= this.data[i].key) i--;
    if (!this.isLeaf()) {
        var found = this.children[i + 1].searchFirst(key);
        if (found) return found;
    }

    // now either this is a leaf node, or the children doesn't contain the key
    return i < this.data.length - 1 && key === this.data[i + 1].key ?
        new Cursor(this, i + 1) : null;
};

/**
 * Insert. If the key is equal to an existing key, the new key
 * is always inserted _before_ the existing key.
 * @param {Object} key the key to insert
 * @param {Object} payload the payload to insert
 */
BTreeNode.prototype.insertNonFull = function(key, payload) {
    assert(!this.isFull(), "this node should not be full");
    var i;
    if (this.isLeaf()) {
        i = this.data.length - 1;
        while (i >= 0 && key <= this.data[i].key) {
            this.data[i + 1] = this.data[i];
            i--;
        }

        this.data[i + 1] = {key: key, payload: payload};
    } else {
        i = 0;
        while (i <= this.data.length - 1 && key > this.data[i].key) i++;
        var child = this.children[i];
        if (child.isFull()) {
            this.splitChild(i);
            if (key > this.data[i].key) i++;
            child = this.children[i];
        }

        child.insertNonFull(key);
    }
};

BTreeNode.prototype.splitChild = function(childIndex) {
    var i;
    var right = new BTreeNode(this.tree, this);
    var left = this.children[childIndex];
    assert(left.isFull(), "child to split must be full");

    // Insert data to this node
    i = this.data.length - 1;
    while (i >= childIndex /* the target new key position */) {
        this.data[i + 1] = this.data[i];
        i--;
    }
    this.data[childIndex] = left.data[this.tree.minDegree - 1];

    // Insert right child to this node
    i = this.children.length - 1;
    while (i >= childIndex + 1) {
        this.children[i + 1] = this.children[i];
        i--;
    }
    this.children[childIndex + 1] = right;

    // copy data to right child
    for (i = 0; i < this.tree.minDegree - 1; i++) {
        right.data[i] = left.data[i + this.tree.minDegree];
    }

    // delete copied data in left child. This includes 1 key copied to the parent and
    // minDegree - 1 keys copied to the right child.
    left.data.splice(this.tree.minDegree -1 /* position to remove */,
                     this.tree.minDegree /* number of keys to remove */);

    if (!left.isLeaf()) {
        // copy children to right child
        for (i = 0; i < this.tree.minDegree; i++) {
            right.children[i] = left.children[i + this.tree.minDegree];
        }

        // delete copied children in left cihld
        left.children.splice(this.tree.minDegree /* position to remove */,
                             this.tree.minDegree /* number of children to remove */);
    }

    assert.strictEqual(left.getDegree(), this.tree.minDegree, "unexpected left child degree");
    assert.strictEqual(right.getDegree(), this.tree.minDegree, "unexpected right child degree");
};

/**
 * Get the first key in this node's subtree.
 * @return {Cursor} The cursor pointing to the first key
 */
BTreeNode.prototype.getFirst = function() {
    if (this.isLeaf()) {
        return new Cursor(this, 0);
    }

    return this.children[0].getFirst();
};

/**
 * The curosr points to a particular key in a {@link BTreeNode}
 * @constructor
 * @param {BTreeNode} btreeNode The node it's pointing to
 * @param {int} iKey the key index
 */
function Cursor(btreeNode, iKey) {
    this.node = btreeNode;
    this.iKey = iKey;
}

Cursor.prototype.getData = function() {
    return this.node.data[this.iKey];
};

/**
 * Move to the next node in order
 * @return {bool} if there is next key or not
 */
Cursor.prototype.moveNext = function() {
    if (this.node.isLeaf()) {
        if (this.iKey === this.node.data.length - 1) {
            var current = this.node;
            // TODO: implement parent
            while (current.parent) {
                // get `current`'s index in its parent's children array
                var iCurrent = current.parent.children.indexOf(current);
                if (iCurrent !== current.parent.children.length - 1) {
                    this.node = current.parent;
                    this.iKey = iCurrent;
                    return true;
                } else {
                    // `current` is the last child in its parent. Further
                    // look up.
                    current = current.parent;
                }
            }

            // There is no larger key in the tree.
            return false;
        } else {
            this.iKey++;
            return true;
        }
    } else {
        var first = this.node.getFirst();
        this.node = first.node;
        this.iKey = first.iKey;
        return true;
    }
};

module.exports.BTree = BTree;
