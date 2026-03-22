import { BPlusTree } from "./logic/BPlusTree.js";
import { renderTree } from "./visual/render.js";

let tree = new BPlusTree(4);

const insertBtn = document.getElementById("insertBtn");
const valueInput = document.getElementById("valueInput");
const resetBtn = document.getElementById("resetBtn");
const orderSelect = document.getElementById("orderSelect");
const undoBtn = document.getElementById("undoBtn");

// Helper to count nodes (used to detect splits for the logic trace)
function countNodes(node) {
    if (!node) return 0;
    if (node.isLeaf) return 1;
    return 1 + node.children.reduce((acc, child) => acc + countNodes(child), 0);
}

insertBtn.addEventListener("click", () => {
    const value = parseInt(valueInput.value);

    if (!isNaN(value)) {
        // 1. Capture state before insertion
        const nodeCountBefore = countNodes(tree.root);
        const alreadyExists = tree.search ? tree.search(value) : false; // Check for duplicates if search exists

        // 2. Perform Insertion
        tree.insert(value);
       // 3. Logic Trace Messaging
        const nodeCountAfter = countNodes(tree.root);
        
        if (alreadyExists) {
            logLogic(`<b>${value}</b> is a duplicate. Appending to the leaf sequence.`);
        } else if (nodeCountAfter > nodeCountBefore) {
            // If more nodes exist now, a split happened!
            logLogic(`Leaf full! Pushing the median up to act as a separator.`);
        } else {
            logLogic(`Inserted <b>${value}</b>. It fits perfectly in the current leaf.`);
        }


        renderTree(tree);

        valueInput.value = "";
        valueInput.focus();   // 👈 brings cursor back automatically
    }
});

undoBtn.addEventListener("click", () => {
    tree.undo();
    renderTree(tree);
});


// 👇 Press Enter to trigger insert
valueInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        insertBtn.click();
    }
});


resetBtn.addEventListener("click", () => {
    tree = new BPlusTree(parseInt(orderSelect.value));
    logLogic("<b>Reset Done!</b> System cleared.")
    renderTree(tree);
});

orderSelect.addEventListener("change", () => {
    tree = new BPlusTree(parseInt(orderSelect.value));
    renderTree(tree);
});

// Function to update the sidebar logic trace
export function logLogic(msg) {
    const el = document.getElementById("step-desc");
    if (!el) return;
    el.innerHTML = msg;
    el.style.color = "#2ecc71"; // Flash green
    setTimeout(() => { el.style.color = "#ffffff"; }, 400);
}

renderTree(tree);
