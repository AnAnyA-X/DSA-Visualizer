import { logLogic } from "../main.js";

export class BPlusNode {
    constructor(isLeaf = false) {
        this.isLeaf = isLeaf;
        this.keys = [];
        this.children = [];
        this.next = null;
        this.parent = null; 
    }
}

export class BPlusTree {
    constructor(order = 3) {
        this.order = order;
        this.root = new BPlusNode(true);
        this.history = [];
    }

    cloneNode(node) {
        if (!node) return null;
        const copy = new BPlusNode(node.isLeaf);
        copy.keys = [...node.keys];
        copy.children = node.children.map(child => {
            const childCopy = this.cloneNode(child);
            childCopy.parent = copy; // Reattach parent pointers during clone
            return childCopy;
        });
        copy.next = node.next; 
        return copy;
    }

    insert(value) {
        this.history.push(this.cloneNode(this.root));
        logLogic(`Searching... finding where <b>${value}</b> belongs.`);
        
        const leaf = this.findLeaf(this.root, value);
        this.insertIntoLeaf(leaf, value);

        if (leaf.keys.length > this.order - 1) {
            this.splitLeaf(leaf);
        }
    }

    findLeaf(node, value) {
        if (node.isLeaf) return node;
        let i = 0;
        while (i < node.keys.length && value >= node.keys[i]) i++;
        return this.findLeaf(node.children[i], value);
    }

    insertIntoLeaf(leaf, value) {
        if (leaf.keys.includes(value)) {
            logLogic(`👯 <b>${value}</b> is a duplicate! Adding it to the right.`);
        } else {
            logLogic(`Found a spot for <b>${value}</b>. It fits between the existing keys.`);
        }
        leaf.keys.push(value);
        leaf.keys.sort((a, b) => a - b);
    }

    splitLeaf(leaf) {
        const newLeaf = new BPlusNode(true);
        const mid = Math.floor(leaf.keys.length / 2);
        
        // The value at mid is the "median" we promote
        const promoteKey = leaf.keys[mid]; 
        logLogic(`Leaf full! Pushing median <b>${promoteKey}</b> up to act as a separator.`);

        newLeaf.keys = leaf.keys.splice(mid);
        newLeaf.next = leaf.next;
        leaf.next = newLeaf;
        newLeaf.parent = leaf.parent;

        if (leaf === this.root) {
            logLogic(`🚀 Root overflow! Creating a new level to stay balanced.`);
            const newRoot = new BPlusNode(false);
            newRoot.keys = [promoteKey];
            newRoot.children = [leaf, newLeaf];
            this.root = newRoot;
            leaf.parent = newRoot;
            newLeaf.parent = newRoot;
        } else {
            this.insertIntoParent(leaf, promoteKey, newLeaf);
        }
    }

    insertIntoParent(leftNode, key, rightNode) {
        const parent = leftNode.parent;
        const index = parent.children.indexOf(leftNode);

        parent.keys.splice(index, 0, key);
        parent.children.splice(index + 1, 0, rightNode);
        rightNode.parent = parent;

        if (parent.keys.length > this.order - 1) {
            this.splitInternal(parent);
        }
    }

    splitInternal(node) {
        const newInternal = new BPlusNode(false);
        const midIndex = Math.floor(node.keys.length / 2);
        const promoteKey = node.keys[midIndex];

        logLogic(`Internal node full! Promoting <b>${promoteKey}</b> to the next level.`);

        newInternal.keys = node.keys.splice(midIndex + 1);
        newInternal.children = node.children.splice(midIndex + 1);
        node.keys.splice(midIndex); // Remove promoted key from current node

        newInternal.children.forEach(child => child.parent = newInternal);
        newInternal.parent = node.parent;

        if (node === this.root) {
            logLogic(`🚀 Root overflow! The tree is growing taller.`);
            const newRoot = new BPlusNode(false);
            newRoot.keys = [promoteKey];
            newRoot.children = [node, newInternal];
            this.root = newRoot;
            node.parent = newRoot;
            newInternal.parent = newRoot;
        } else {
            this.insertIntoParent(node, promoteKey, newInternal);
        }
    }

    undo() {
        if (this.history.length > 0) {
            this.root = this.history.pop();
            logLogic("Undo successful. Reverted to previous state.");
        }
    }
}