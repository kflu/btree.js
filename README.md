# btree.js

## TODOs

- Think about data access layer abstraction
- Implement deletion
- trees can specify a key comparison for JavaScript cannot override comparison operators

## Designing Providers

    provider.load(this.children[i], function(childNode) {
        // use child node here...
    });

Since this is a async fashioin, all things need to be asyn for good. E.g., `node.search`:

    node.search(key, function(result) {
        // use the result...
    })

Internally `search` does:

    node.prototype.search = function(key, cb) {
        // ...
        provider.load(this.children[i], function(childnode) {
            // continue search, if found, call the callback:
            cb(result);
        })
    };
