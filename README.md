# btree.js

## TODOs

- Think about data access layer abstraction
    - ~~`Cursor` constructor changed~~
    - ~~`provider.getChild()` should really be `load()`~~
    - ~~`Cursor.node` is no longer the loaded node~~
    - ~~`createChild` -> `createNode`~~
    - Some callbacks with a node need to save the node when done.
- Implement deletion
- trees can specify a key comparison for JavaScript cannot override comparison operators

###Callbacks with a node instance to save when done

- How to handle error along the way? seems to need some sort of "finally"
    - transaction ? Log replay at btree level?
