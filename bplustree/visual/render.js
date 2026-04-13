export function renderTree(tree) {
    const svg = document.getElementById("treeCanvas");
    if (!svg) return;
    svg.innerHTML = ""; 

    const levelHeight = 100;
    const nodeHeight = 40;
    const horizontalGap = 20; 
    const leafPositions = []; // To store leaf coords for horizontal links

    // 1. Measure text width for boxes
    function getNodeWidth(node) {
        const textValue = node.keys.join(", ");
        return textValue.length * 8 + 30; 
    }

    // 2. Pass 1: Recursive Width Calculation
    function calculateWidths(node) {
        const minWidth = getNodeWidth(node);
        if (node.isLeaf) {
            node._subtreeWidth = minWidth;
            return minWidth;
        }
        let totalChildrenWidth = 0;
        node.children.forEach(child => {
            totalChildrenWidth += calculateWidths(child) + horizontalGap;
        });
        node._subtreeWidth = Math.max(minWidth, totalChildrenWidth - horizontalGap);
        return node._subtreeWidth;
    }

    // 3. The Draw Function
    function drawNode(node, x, y) {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const nodeWidth = getNodeWidth(node);
        const textValue = node.keys.join(", ");

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x - nodeWidth / 2);
        rect.setAttribute("y", y);
        rect.setAttribute("width", nodeWidth);
        rect.setAttribute("height", nodeHeight);
        rect.setAttribute("fill", node.isLeaf ? "#328f30ff" : "#503accff"); // Purple leaf, Blue internal
        rect.setAttribute("rx", 8);
        rect.setAttribute("stroke", "white");
        rect.setAttribute("stroke-width", "1");

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y + 25);
        text.setAttribute("fill", "white");
        text.setAttribute("font-size", "14");
        text.setAttribute("text-anchor", "middle");
        text.textContent = textValue;

        group.appendChild(rect);
        group.appendChild(text);
        svg.appendChild(group);

        // Store Leaf data for horizontal links (Center-Right and Center-Left points)
        if (node.isLeaf) {
            leafPositions.push({ 
                rightX: x + nodeWidth / 2, 
                leftX: x - nodeWidth / 2, 
                y: y + nodeHeight / 2 
            });
        }

        return { cx: x, cy: y + nodeHeight, topY: y };
    }

    // 4. Pass 2: The Traverse Function (Vertical Lines)
    function traverse(node, depth, centerX) {
        const y = depth * levelHeight + 20;
        const nodePos = drawNode(node, centerX, y);

        if (!node.isLeaf && node.children.length > 0) {
            let currentX = centerX - (node._subtreeWidth / 2);

            node.children.forEach((child) => {
                const childWidth = child._subtreeWidth;
                const childCenterX = currentX + (childWidth / 2);
                
                const childPos = traverse(child, depth + 1, childCenterX);

                // --- ROOT-TO-LEAF (VERTICAL) LINES ---
               const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                
                // Start from parent center-bottom
                line.setAttribute("x1", nodePos.cx);
                line.setAttribute("y1", nodePos.cy); 
                
                // End at child center-top
                line.setAttribute("x2", childPos.cx);
                line.setAttribute("y2", y + levelHeight); // This forces it to the next level's top
                
                line.setAttribute("stroke", "brown"); // Change to white for high contrast
                line.setAttribute("stroke-width", 2);
                
                // Use appendChild instead of prepend to make sure they are on top if needed
                svg.appendChild(line); 

               

                currentX += childWidth + horizontalGap;
            });
        }
        return nodePos;
    }

    // --- EXECUTION ---
    calculateWidths(tree.root);
    const svgWidth = svg.clientWidth || 1000; 
    traverse(tree.root, 0, svgWidth / 2);

    // --- LEAF-TO-LEAF (HORIZONTAL) LINES ---
    for (let i = 0; i < leafPositions.length - 1; i++) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", leafPositions[i].rightX);
        line.setAttribute("y1", leafPositions[i].y);
        line.setAttribute("x2", leafPositions[i + 1].leftX);
        line.setAttribute("y2", leafPositions[i + 1].y);
        line.setAttribute("stroke", "#90791dff"); // Gold color for the B+ sequence link
        line.setAttribute("stroke-width", 2);
        line.setAttribute("stroke-dasharray", "5,5"); // Dashed line
        svg.appendChild(line);
    }
}