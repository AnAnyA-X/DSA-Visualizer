class MaxHeap {
    constructor() {
        this.heap = [];
        this.history = []; // Stack to store snapshots
    }

    // --- UNDO LOGIC ---
    saveState() {
        // Push a copy of the current heap into history
        this.history.push([...this.heap]);
    }

    undo() {
        if (this.history.length === 0) {
            this.addLog("Nothing to undo!");
            return;
        }
        this.heap = this.history.pop();
        this.addLog("Undo: Restored previous state.");
        this.renderAll();
    }

    // --- CORE LOGIC ---
    insert(val) {
        if (isNaN(val)) return;
        this.saveState(); // Save state BEFORE inserting
        this.heap.push(val);
        this.addLog(`Inserted ${val}. "Bubbling up" to check parent.`);
        this.bubbleUp();
        this.renderAll();
    }

    bubbleUp() {
        let idx = this.heap.length - 1;
        while (idx > 0) {
            let parentIdx = Math.floor((idx - 1) / 2);
            if (this.heap[idx] > this.heap[parentIdx]) {
                this.addLog(`Swap: Child (${this.heap[idx]}) > Parent (${this.heap[parentIdx]}).`);
                [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
                idx = parentIdx;
            } else { break; }
        }
    }

    extractMax() {
        if (this.heap.length === 0) return;
        this.saveState(); // Save state BEFORE extracting
        const max = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.addLog(`Max ${max} removed. Moving ${last} to root and "Bubbling down".`);
            this.bubbleDown(0);
        } else {
            this.addLog(`Removed ${max}. Heap is now empty.`);
        }
        this.renderAll();
    }

    bubbleDown(idx) {
        while (true) {
            let left = 2 * idx + 1;
            let right = 2 * idx + 2;
            let largest = idx;

            if (left < this.heap.length && this.heap[left] > this.heap[largest]) largest = left;
            if (right < this.heap.length && this.heap[right] > this.heap[largest]) largest = right;

            if (largest !== idx) {
                this.addLog(`Swap: Parent (${this.heap[idx]}) < Child (${this.heap[largest]}).`);
                [this.heap[idx], this.heap[largest]] = [this.heap[largest], this.heap[idx]];
                idx = largest;
            } else { break; }
        }
    }

    // --- UTILS ---
    addLog(msg) {
        const list = document.getElementById('trace-list');
        if (!list) return;
        const entry = document.createElement('li');
        entry.textContent = `> ${msg}`;
        list.prepend(entry);
    }

    renderAll() {
        this.renderTree();
        this.renderArray();
    }

    renderArray() {
        const container = document.getElementById('array-visualizer');
        if (!container) return;
        container.innerHTML = '';
        this.heap.forEach((val, i) => {
            const box = document.createElement('div');
            box.className = 'array-box';
            box.innerHTML = `<span class="index">${i}</span>${val}`;
            container.appendChild(box);
        });
    }

    renderTree() {
        const canvas = document.getElementById('heap-canvas');
        if (!canvas) return;
        canvas.innerHTML = '<svg id="heap-lines" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;"></svg>';
        const svg = document.getElementById('heap-lines');
        if (this.heap.length === 0) return;

        const positions = [];
        this.heap.forEach((val, i) => {
            const level = Math.floor(Math.log2(i + 1));
            const posInLevel = i - (Math.pow(2, level) - 1);
            const totalInLevel = Math.pow(2, level);
            const x = (canvas.offsetWidth / (totalInLevel + 1)) * (posInLevel + 1);
            const y = (level + 1) * 80;
            positions[i] = { x, y };

            if (i > 0) {
                const pIdx = Math.floor((i - 1) / 2);
                const parentPos = positions[pIdx];
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", parentPos.x); line.setAttribute("y1", parentPos.y);
                line.setAttribute("x2", x); line.setAttribute("y2", y);
                line.setAttribute("stroke", "#ccc"); line.setAttribute("stroke-width", "2");
                svg.appendChild(line);
            }

            const node = document.createElement('div');
            node.className = 'node';
            node.style.left = `${x - 22}px`; 
            node.style.top = `${y - 22}px`;
            node.textContent = val;
            canvas.appendChild(node);
        });
    }
}

const myHeap = new MaxHeap();

function handleInsert() {
    const input = document.getElementById('heapInput');
    const val = parseInt(input.value);
    if (!isNaN(val)) {
        myHeap.insert(val);
        input.value = '';
        input.focus();
    }
}

function handleExtract() { myHeap.extractMax(); }
function handleUndo() { myHeap.undo(); } // New global undo function

document.getElementById('heapInput').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleInsert();
});