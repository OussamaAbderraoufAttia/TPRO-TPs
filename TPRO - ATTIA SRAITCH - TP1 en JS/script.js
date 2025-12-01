/**
 * TP Graphes: Plus Court Cycle (Exercise 5)
 * Logic: JavaScript implementation of the C Algorithm using BFS.
 * Interactive Visualization.
 */

// --- CONFIGURATION & STATE ---
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

// Graph State
let nodes = []; // Array of {id, x, y, label}
let edges = []; // Array of {source: id, target: id}
let nodeCounter = 0;

// Interaction State
let currentMode = 'node'; // 'node', 'edge', 'move'
let selectedNode = null; // For edge creation
let draggedNode = null; // For moving

// Algorithm State
let isRunning = false;
let animationSpeed = 500; // ms delay
const INF = 1000000000;

// Colors
const COL_NODE_DEFAULT = '#ffffff';
const COL_NODE_START = '#4facfe';  // Blue (Current BFS Source)
const COL_NODE_VISIT = '#00e676';  // Green (Visited)
const COL_NODE_QUEUE = '#ffa500';  // Orange (In Queue)
const COL_EDGE_DEFAULT = '#aaaaaa';
const COL_CYCLE = '#ff5252';       // Red (Result)

// Resize Canvas
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    drawGraph();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- UI HELPERS ---
function log(message, type = 'info') {
    const logs = document.getElementById('logs');
    const div = document.createElement('div');
    div.className = `log-entry log-${type}`;
    const time = new Date().toLocaleTimeString();
    div.innerText = `[${time}] ${message}`;
    logs.appendChild(div);
    logs.scrollTop = logs.scrollHeight;
}

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.btn-group button').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-mode-${mode}`).classList.add('active');
    selectedNode = null; // Reset selection
    drawGraph();
}

document.getElementById('speedRange').addEventListener('input', (e) => {
    animationSpeed = 1010 - e.target.value; // Invert logic: higher value = faster = less delay
});

// --- GRAPH DRAWING ---

function drawGraph(highlightNodes = {}, highlightEdges = []) {
    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Edges
    edges.forEach(edge => {
        const n1 = nodes.find(n => n.id === edge.source);
        const n2 = nodes.find(n => n.id === edge.target);
        if (!n1 || !n2) return;

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        
        // Check if this edge is part of the highlight list
        const isHighlighted = highlightEdges.some(e => 
            (e.u === edge.source && e.v === edge.target) || 
            (e.u === edge.target && e.v === edge.source)
        );

        ctx.strokeStyle = isHighlighted ? COL_CYCLE : COL_EDGE_DEFAULT;
        ctx.lineWidth = isHighlighted ? 4 : 2;
        ctx.stroke();
    });

    // Draw Nodes
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
        
        // Determine Color
        let fill = COL_NODE_DEFAULT;
        if (highlightNodes[node.id]) {
            fill = highlightNodes[node.id];
        } else if (selectedNode === node) {
            fill = '#ffff00'; // Yellow for selection
        }
        
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text Label
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y);
    });
}

// --- INTERACTION HANDLERS ---

canvas.addEventListener('mousedown', (e) => {
    if (isRunning) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clickedNode = nodes.find(n => Math.hypot(n.x - x, n.y - y) < 25);

    if (currentMode === 'node') {
        if (!clickedNode) {
            addNode(x, y);
        }
    } else if (currentMode === 'edge') {
        if (clickedNode) {
            if (!selectedNode) {
                selectedNode = clickedNode;
            } else {
                if (selectedNode !== clickedNode) {
                    addEdge(selectedNode.id, clickedNode.id);
                }
                selectedNode = null;
            }
            drawGraph();
        }
    } else if (currentMode === 'move') {
        if (clickedNode) {
            draggedNode = clickedNode;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (currentMode === 'move' && draggedNode) {
        const rect = canvas.getBoundingClientRect();
        draggedNode.x = e.clientX - rect.left;
        draggedNode.y = e.clientY - rect.top;
        drawGraph();
    }
});

canvas.addEventListener('mouseup', () => {
    draggedNode = null;
});

// --- GRAPH LOGIC FUNCTIONS ---

function addNode(x, y) {
    nodes.push({ id: nodeCounter, label: nodeCounter.toString(), x, y });
    nodeCounter++;
    drawGraph();
    log(`Nœud ${nodeCounter-1} ajouté.`);
}

function addEdge(u, v) {
    // Check if edge exists
    const exists = edges.some(e => (e.source === u && e.target === v) || (e.source === v && e.target === u));
    if (!exists) {
        edges.push({ source: u, target: v });
        log(`Arête ajoutée: ${u} - ${v}`);
        drawGraph();
    }
}

function clearGraph() {
    nodes = [];
    edges = [];
    nodeCounter = 0;
    document.getElementById('logs').innerHTML = '';
    document.getElementById('result-display').innerText = "En attente...";
    drawGraph();
}

function generateRandomGraph() {
    clearGraph();
    log("Génération du graphe exemple...", "info");
    
    // Create same graph as in the C code example
    // Positions are manual for visualization
    const w = canvas.width / 2;
    const h = canvas.height / 2;
    
    const positions = [
        {x: w, y: h - 150},      // 0
        {x: w + 100, y: h - 50}, // 1
        {x: w + 100, y: h + 50}, // 2
        {x: w, y: h + 150},      // 3
        {x: w - 100, y: h + 50}, // 4
        {x: w - 100, y: h - 50}  // 5
    ];

    for(let i=0; i<6; i++) {
        nodes.push({ id: i, label: i.toString(), x: positions[i].x, y: positions[i].y });
    }
    nodeCounter = 6;

    // Cycle extern
    addEdge(0, 1); addEdge(1, 2); addEdge(2, 3); 
    addEdge(3, 4); addEdge(4, 5); addEdge(5, 0);
    // Chords
    addEdge(1, 4); addEdge(2, 4);

    drawGraph();
}

// --- ALGORITHM: SHORTEST CYCLE (BFS) ---

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runAlgorithm() {
    if (nodes.length < 3) {
        alert("Veuillez ajouter au moins 3 nœuds.");
        return;
    }
    if (isRunning) return;
    isRunning = true;
    document.getElementById('result-display').innerText = "Calcul en cours...";
    log("=== Début de l'Algorithme ===", "info");

    // Build Adjacency List for easy traversal
    const adj = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(e => {
        adj[e.source].push(e.target);
        adj[e.target].push(e.source);
    });

    let bestCycleLength = INF;
    let bestCyclePath = []; // To reconstruct the visual cycle

    // Run BFS from every node
    for (let i = 0; i < nodes.length; i++) {
        const startNode = nodes[i].id;
        log(`BFS depuis le sommet ${startNode}...`);
        
        // Data structures for BFS
        let dist = {};
        let parent = {};
        let visited = {}; // 0: non, 1: queue/en cours, 2: fini
        
        nodes.forEach(n => {
            dist[n.id] = INF;
            parent[n.id] = -1;
            visited[n.id] = 0; // NON_VISITE
        });

        let queue = [];
        
        // Init Source
        visited[startNode] = 1; // EN_COURS
        dist[startNode] = 0;
        queue.push(startNode);

        // Visualization State for this BFS
        let nodeColors = {};
        nodeColors[startNode] = COL_NODE_START;
        drawGraph(nodeColors);
        await sleep(animationSpeed);

        while (queue.length > 0) {
            let u = queue.shift();
            
            // Visual: processing u
            if (u !== startNode) nodeColors[u] = COL_NODE_QUEUE;
            drawGraph(nodeColors);

            // Neighbors
            let neighbors = adj[u] || [];
            for (let v of neighbors) {
                if (visited[v] === 0) {
                    visited[v] = 1;
                    dist[v] = dist[u] + 1;
                    parent[v] = u;
                    queue.push(v);
                    
                    // Visual: added to queue
                    nodeColors[v] = '#ffffaa'; 
                    drawGraph(nodeColors);
                    await sleep(animationSpeed / 2);

                } else if (visited[v] === 1 && parent[u] !== v) {
                    // CYCLE DETECTED
                    let currentCycleLen = dist[u] + dist[v] + 1;
                    log(`  -> Cycle détecté (arête ${u}-${v}), Longueur: ${currentCycleLen}`, "cycle");
                    
                    if (currentCycleLen < bestCycleLength) {
                        bestCycleLength = currentCycleLen;
                        // We could store the path logic here for complex highlighting
                        // For now, we just store the edges involved roughly or simply the fact we found it
                        // Reconstructing the exact path involves backtracking parents
                        bestCyclePath = reconstructPath(u, v, parent, startNode);
                        // Add edge u-v
                        bestCyclePath.push({u: u, v: v}); 
                    }
                }
            }
            visited[u] = 2; // VISITE
            if (u !== startNode) nodeColors[u] = COL_NODE_VISIT;
            drawGraph(nodeColors);
        }
    }

    // Final Result
    isRunning = false;
    if (bestCycleLength === INF) {
        document.getElementById('result-display').innerText = "Aucun cycle trouvé.";
        log("Fin: Pas de cycle.", "info");
        drawGraph();
    } else {
        document.getElementById('result-display').innerText = `Plus court cycle: ${bestCycleLength} arêtes`;
        log(`Fin: Meilleur cycle = ${bestCycleLength}`, "success");
        
        // Highlight the best cycle found
        // We need to construct the visual object
        let cycleNodesHighlight = {};
        // Since we stored edges in bestCyclePath, let's highlight the edges
        drawGraph({}, bestCyclePath);
        log("Cycle affiché en ROUGE.", "cycle");
    }
}

// Helper to reconstruct path for visualization
function reconstructPath(u, v, parent, startNode) {
    let pathEdges = [];
    
    // Backtrack from u to root
    let curr = u;
    while (curr !== -1 && parent[curr] !== -1) {
        pathEdges.push({u: curr, v: parent[curr]});
        curr = parent[curr];
    }
    
    // Backtrack from v to root
    curr = v;
    while (curr !== -1 && parent[curr] !== -1) {
        pathEdges.push({u: curr, v: parent[curr]});
        curr = parent[curr];
    }
    
    return pathEdges;
}