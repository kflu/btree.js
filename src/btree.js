var assert = require('assert');
function BTree(minDegree) {
    this.minDegree = minDegree;
    this.root = new BTreeNode(this);
}

BTree.prototype.insert = function(key) {
    if (this.root.isFull()) {
        var oldRoot = this.root;
        var newRoot = new BTreeNode(this);
        this.root = newRoot;

        // TODO: make sure the child has its parent updated after split
        this.root.children = [oldRoot];
        this.root.splitChild(0);
    }

    this.root.insertNonFull(key);
};

function BTreeNode(tree) {
    this.tree = tree;
    this.keys = [];
    this.children = [];
}

BTreeNode.prototype.isRoot = function() { return this.tree.root === this; };
BTreeNode.prototype.isFull = function() { return this.getDegree() === this.tree.minDegree * 2; };
BTreeNode.prototype.isLeaf = function() { return this.children.length === 0; };

BTreeNode.prototype.getDegree = function() {
    var n = this.keys.length + 1;
    if (!this.isLeaf()) assert.strictEqual(this.children.length, n, "Children length unexpected");
    return n;
};

BTreeNode.prototype.search = function(key) {
    var i = 0;
    while (i <= this.keys.length - 1 && key > this.keys[i]) i++;
    if (i <= tihs.keys.length - 1 && key === this.keys[i]) return this.keys[i];
    if (this.isLeaf()) return null;
    return this.children[i].search(key);
};

BTreeNode.prototype.insertNonFull = function(key) {
    var i;
    if (this.isLeaf()) {
        i = this.keys.length - 1;
        while (i >= 0 && key < this.keys[i]) {
            this.keys[i + 1] = this.keys[i];
            i--;
        }

        this.keys[i + 1] = key;
    } else {
        i = 0;
        while (i <= this.keys.length - 1 && key > this.keys[i]) i++;
        var child = this.children[i];
        if (child.isFull()) {
            this.splitChild(i);
            if (key > this.keys[i]) i++;
            child = this.children[i];
        }

        child.insertNonFull(key);
    }
};

BTreeNode.prototype.splitChild = function(childIndex) {
    var i;
    var right = new BTreeNode(this.tree);
    var left = this.children[childIndex];
    assert(left.isFull(), "child to split must be full");

    // Insert key to this node
    i = this.keys.length - 1;
    while (i >= childIndex /* the target new key position */) {
        this.keys[i + 1] = this.keys[i];
        i--;
    }

    this.keys[i] = left.keys[this.tree.minDegree - 1];

    // copy keys to right child
    for (i = 0; i < this.tree.minDegree - 1; i++) {
        right.keys[i] = left.keys[i + this.tree.minDegree];
    }

    // delete copied keys in left child
    left.keys.splice(this.tree.minDegree /* position to remove */,
                     this.tree.minDegree - 1 /* number of keys to remove */);

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

module.exports.BTree = BTree;
module.exports.BTreeNode = BTreeNode;
