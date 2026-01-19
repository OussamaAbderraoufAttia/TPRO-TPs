class Node {
    constructor(matrix, g, h, p, parent = null) {
        this.matrix = matrix;
        this.g = g;
        this.h = h;
        this.f = g + p * h;
        this.parent = parent;
        this.id = matrix.flat().join(',');
    }
}

class MinHeap {
    constructor() {
        this.heap = [];
    }
    push(node) {
        this.heap.push(node);
        this.bubbleUp();
    }
    pop() {
        if (this.size() === 0) return null;
        if (this.size() === 1) return this.heap.pop();
        const top = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown();
        return top;
    }
    size() { return this.heap.length; }
    bubbleUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            let parent = Math.floor((index - 1) / 2);
            if (this.heap[index].f < this.heap[parent].f) {
                [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
                index = parent;
            } else break;
        }
    }
    bubbleDown() {
        let index = 0;
        while (true) {
            let left = 2 * index + 1;
            let right = 2 * index + 2;
            let smallest = index;
            if (left < this.heap.length && this.heap[left].f < this.heap[smallest].f) smallest = left;
            if (right < this.heap.length && this.heap[right].f < this.heap[smallest].f) smallest = right;
            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            } else break;
        }
    }
}

const GOAL = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 0]
];

let currentBoard = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 0, 11],
    [13, 14, 15, 12]
];

// --- Heuristics ---
function getMisplaced(matrix) {
    let count = 0;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (matrix[i][j] !== 0 && matrix[i][j] !== GOAL[i][j]) count++;
        }
    }
    return count;
}

function getManhattan(matrix) {
    let dist = 0;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const val = matrix[i][j];
            if (val !== 0) {
                const targetI = Math.floor((val - 1) / 4);
                const targetJ = (val - 1) % 4;
                dist += Math.abs(i - targetI) + Math.abs(j - targetJ);
            }
        }
    }
    return dist;
}

// --- UI Logic ---
function renderBoard(matrix) {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    matrix.flat().forEach(val => {
        const tile = document.createElement('div');
        tile.className = 'tile' + (val === 0 ? ' empty' : '');
        tile.textContent = val === 0 ? '' : val;
        board.appendChild(tile);
    });
}

function log(msg) {
    const logBox = document.getElementById('logs');
    logBox.innerHTML += `<p><i class="fas fa-chevron-right"></i> ${msg}</p>`;
    logBox.scrollTop = logBox.scrollHeight;
}

// --- Solver ---
async function solve() {
    const hType = document.getElementById('heuristic').value;
    const p = parseFloat(document.getElementById('weight-p').value);
    const speed = 1001 - parseInt(document.getElementById('speed').value);
    
    const hFunc = hType === 'manhattan' ? getManhattan : getMisplaced;
    const startNode = new Node(currentBoard, 0, hFunc(currentBoard), p);
    
    const openSet = new MinHeap();
    openSet.push(startNode);
    const closedSet = new Set();
    
    let startTime = performance.now();
    let nodesExpanded = 0;
    
    log(`Lancement de la résolution avec p=${p}...`);

    while (openSet.size() > 0) {
        const current = openSet.pop();
        nodesExpanded++;
        
        if (current.h === 0) {
            const time = ((performance.now() - startTime) / 1000).toFixed(3);
            document.getElementById('stat-time').textContent = time + 's';
            document.getElementById('stat-nodes').textContent = nodesExpanded;
            document.getElementById('stat-depth').textContent = current.g;
            
            log(`Solution trouvée ! Prof: ${current.g}, Temps: ${time}s`);
            await animatePath(current, speed);
            return;
        }
        
        closedSet.add(current.id);
        
        const nextMoves = getNextMoves(current.matrix);
        for (const move of nextMoves) {
            const mId = move.flat().join(',');
            if (closedSet.has(mId)) continue;
            
            const newNode = new Node(move, current.g + 1, hFunc(move), p, current);
            openSet.push(newNode);
        }

        if (nodesExpanded % 500 === 0) {
            document.getElementById('stat-nodes').textContent = nodesExpanded;
            await new Promise(r => setTimeout(r, 0)); 
        }
    }
    log("Aucune solution trouvée.");
}

function getNextMoves(matrix) {
    const moves = [];
    let r, c;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (matrix[i][j] === 0) { r = i; c = j; break; }
        }
    }
    
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) {
            const newMatrix = matrix.map(row => [...row]);
            newMatrix[r][c] = newMatrix[nr][nc];
            newMatrix[nr][nc] = 0;
            moves.push(newMatrix);
        }
    }
    return moves;
}

async function animatePath(node, speed) {
    const path = [];
    let curr = node;
    while (curr) {
        path.unshift(curr.matrix);
        curr = curr.parent;
    }
    
    for (const state of path) {
        renderBoard(state);
        await new Promise(r => setTimeout(r, speed));
    }
    currentBoard = path[path.length - 1];
}

// --- Interaction ---
document.getElementById('btn-solve').addEventListener('click', solve);
document.getElementById('btn-reset').addEventListener('click', () => {
    currentBoard = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 0, 11],
        [13, 14, 15, 12]
    ];
    renderBoard(currentBoard);
    log("Reset effectué.");
});

document.getElementById('btn-shuffle').addEventListener('click', () => {
    for(let i=0; i<50; i++) {
        const moves = getNextMoves(currentBoard);
        currentBoard = moves[Math.floor(Math.random() * moves.length)];
    }
    renderBoard(currentBoard);
    log("Grille mélangée.");
});

document.getElementById('weight-p').addEventListener('input', (e) => {
    document.getElementById('p-value').textContent = parseFloat(e.target.value).toFixed(1);
});

// Initial Render
renderBoard(currentBoard);
