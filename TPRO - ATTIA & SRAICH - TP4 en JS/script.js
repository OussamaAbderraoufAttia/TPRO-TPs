/**
 * TP4: Taquin 15 - Core Logic & Benchmarking Suite
 * Equipe: ATTIA Oussama & SRAICH Imene
 */

// --- CLASSES CORE ---

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
    constructor() { this.heap = []; }
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
        let idx = this.heap.length - 1;
        while (idx > 0) {
            let p = Math.floor((idx - 1) / 2);
            if (this.heap[idx].f < this.heap[p].f) {
                [this.heap[idx], this.heap[p]] = [this.heap[p], this.heap[idx]];
                idx = p;
            } else break;
        }
    }
    bubbleDown() {
        let idx = 0;
        while (true) {
            let l = 2 * idx + 1, r = 2 * idx + 2, min = idx;
            if (l < this.heap.length && this.heap[l].f < this.heap[min].f) min = l;
            if (r < this.heap.length && this.heap[r].f < this.heap[min].f) min = r;
            if (min !== idx) {
                [this.heap[idx], this.heap[min]] = [this.heap[min], this.heap[idx]];
                idx = min;
            } else break;
        }
    }
}

// --- CONSTANTES & ETAT ---

const GOAL = [
    [1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 0]
];

let state = {
    currentBoard: [
        [1, 2, 5, 3],
        [6, 10, 4, 8],
        [9, 13, 7, 0],
        [14, 11, 15, 12]
    ],
    selectedTile: null, // Pour le mode manuel
    isSolving: false
};

const CHART_CONFIGS = {
    current: null,
    globalCombined: null
};

// --- HEURISTIQUES ---

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
                const ti = Math.floor((val - 1) / 4);
                const tj = (val - 1) % 4;
                dist += Math.abs(i - ti) + Math.abs(j - tj);
            }
        }
    }
    return dist;
}

// --- CORE SOLVER ENGINE (Sync & Async) ---

function internalSolve(startMatrix, hFunc, p) {
    const startNode = new Node(startMatrix, 0, hFunc(startMatrix), p);
    const openSet = new MinHeap();
    openSet.push(startNode);
    const closedSet = new Set();

    let startTime = performance.now();
    let nodesExpanded = 0;

    while (openSet.size() > 0) {
        const current = openSet.pop();
        nodesExpanded++;

        if (current.h === 0) {
            return {
                time: performance.now() - startTime,
                nodes: nodesExpanded,
                depth: current.g,
                path: reconstructPath(current)
            };
        }

        closedSet.add(current.id);

        const moves = getNextMoves(current.matrix);
        for (const move of moves) {
            const mId = move.flat().join(',');
            if (closedSet.has(mId)) continue;
            const newNode = new Node(move, current.g + 1, hFunc(move), p, current);
            openSet.push(newNode);
        }

        if (nodesExpanded > 100000) break; // Sécurité
    }
    return null;
}

function reconstructPath(node) {
    const path = [];
    let curr = node;
    while (curr) { path.unshift(curr.matrix); curr = curr.parent; }
    return path;
}

function getNextMoves(matrix) {
    const moves = [];
    let r, c;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (matrix[i][j] === 0) { r = i; c = j; break; }
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) {
            const newM = matrix.map(row => [...row]);
            newM[r][c] = newM[nr][nc]; newM[nr][nc] = 0;
            moves.push(newM);
        }
    }
    return moves;
}

// --- UI : NAVIGATION & RENDU ---

function initTabs() {
    document.querySelectorAll('.nav-links li').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.nav-links li').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });
}

function renderBoard(matrix) {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    matrix.flat().forEach((val, idx) => {
        const tile = document.createElement('div');
        tile.className = 'tile' + (val === 0 ? ' empty' : '');
        tile.textContent = val === 0 ? '' : val;
        tile.dataset.idx = idx;

        if (state.selectedTile !== null && state.selectedTile === idx) {
            tile.classList.add('selected');
        }

        tile.addEventListener('click', () => handleTileClick(idx));
        board.appendChild(tile);
    });
}

function handleTileClick(idx) {
    if (state.isSolving) return;

    if (state.selectedTile === null) {
        state.selectedTile = idx;
    } else {
        // Swap
        const flat = state.currentBoard.flat();
        const tmp = flat[state.selectedTile];
        flat[state.selectedTile] = flat[idx];
        flat[idx] = tmp;

        // Reconstruct matrix
        state.currentBoard = [];
        for (let i = 0; i < 4; i++) state.currentBoard.push(flat.slice(i * 4, (i + 1) * 4));

        state.selectedTile = null;
        log("Echange manuel effectué.");
    }
    renderBoard(state.currentBoard);
}

function log(msg) {
    const logs = document.getElementById('logs-content');
    logs.innerHTML += `<p><i class="fas fa-chevron-right"></i> ${msg}</p>`;
    logs.scrollTop = logs.scrollHeight;
}

// --- BOUTONS ACTIONS ---

async function solveAndAnimate() {
    if (state.isSolving) return;
    state.isSolving = true;

    const hType = document.getElementById('heuristic').value;
    const p = parseFloat(document.getElementById('weight-p').value);
    const speed = 1001 - parseInt(document.getElementById('speed').value);

    log(`Démarrage du solveur (p=${p}, ${hType})...`);

    const result = internalSolve(state.currentBoard, hType === 'manhattan' ? getManhattan : getMisplaced, p);

    if (result) {
        document.getElementById('stat-time').textContent = (result.time / 1000).toFixed(3) + 's';
        document.getElementById('stat-nodes').textContent = result.nodes;
        document.getElementById('stat-depth').textContent = result.depth;

        log(`Résolution terminée : ${result.depth} pas.`);
        for (const step of result.path) {
            renderBoard(step);
            await new Promise(r => setTimeout(r, speed));
        }
        state.currentBoard = result.path[result.path.length - 1];
    } else {
        log("Erreur : Impossible de trouver une solution (limite atteinte ou impossible).");
    }

    state.isSolving = false;
}

function shuffleBoard() {
    for (let i = 0; i < 60; i++) {
        const moves = getNextMoves(state.currentBoard);
        state.currentBoard = moves[Math.floor(Math.random() * moves.length)];
    }
    renderBoard(state.currentBoard);
    log("Grille mélangée.");
}

// --- BENCHMARKING SUITE ---

async function runCurrentBench() {
    const tbody = document.getElementById('current-bench-body');
    tbody.innerHTML = '';
    const loader = document.getElementById('loader-overlay');
    loader.classList.remove('hidden');

    const configs = [
        { name: "A* (Manhattan)", p: 1.0, h: getManhattan },
        { name: "WA* p=1.5 (Manhattan)", p: 1.5, h: getManhattan },
        { name: "WA* p=3.0 (Manhattan)", p: 3.0, h: getManhattan },
        { name: "WA* p=5.0 (Manhattan)", p: 5.0, h: getManhattan },
        { name: "A* (Misplaced)", p: 1.0, h: getMisplaced }
    ];

    const results = [];

    // Pause UI before heavy work
    await new Promise(r => setTimeout(r, 100));

    for (const conf of configs) {
        const res = internalSolve(state.currentBoard, conf.h, conf.p);
        if (res) {
            results.push({ ...conf, ...res });
            const row = tbody.insertRow();
            row.innerHTML = `<td>${conf.name}</td><td>${conf.h === getManhattan ? 'Manhattan' : 'Tiles'}</td><td>${res.time.toFixed(1)}</td><td>${res.nodes}</td><td>${res.depth}</td>`;
        }
    }

    renderCurrentBenchChart(results);
    loader.classList.add('hidden');
}

async function runGlobalBench() {
    const loader = document.getElementById('loader-overlay');
    loader.classList.remove('hidden');
    await new Promise(r => setTimeout(r, 100));

    const pValues = [1.0, 1.5, 2.0, 3.0, 5.0];
    const dataNodes = pValues.map(() => 0);
    const dataDepth = pValues.map(() => 0);

    const count = 5; // 5 grilles aléatoires pour le test rapide

    for (let i = 0; i < count; i++) {
        // Generate random board
        let board = GOAL.map(row => [...row]);
        for (let j = 0; j < 40; j++) {
            const moves = getNextMoves(board);
            board = moves[Math.floor(Math.random() * moves.length)];
        }

        pValues.forEach((p, idx) => {
            const res = internalSolve(board, getManhattan, p);
            if (res) {
                dataNodes[idx] += res.nodes / count;
                dataDepth[idx] += res.depth / count;
            }
        });
    }

    renderGlobalCharts(pValues, dataNodes, dataDepth);
    loader.classList.add('hidden');
}

// --- CHARTS RENDERING ---

function renderCurrentBenchChart(results) {
    const ctx = document.getElementById('current-bench-chart').getContext('2d');
    if (CHART_CONFIGS.current) CHART_CONFIGS.current.destroy();

    CHART_CONFIGS.current = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: results.map(r => r.name),
            datasets: [{
                label: 'Nœuds Explorés',
                data: results.map(r => r.nodes),
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: '#3b82f6',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } } },
            plugins: { legend: { display: false } }
        }
    });
}

function renderGlobalCharts(pValues, nodes, depths) {
    const ctx = document.getElementById('global-combined-chart').getContext('2d');

    if (CHART_CONFIGS.globalCombined) CHART_CONFIGS.globalCombined.destroy();

    CHART_CONFIGS.globalCombined = new Chart(ctx, {
        type: 'line',
        data: {
            labels: pValues.map(p => `p = ${p}`),
            datasets: [
                {
                    label: 'Nœuds Explorés (Moyenne)',
                    data: nodes,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    yAxisID: 'yNodes',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Profondeur (Moyenne)',
                    data: depths,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    yAxisID: 'yDepth',
                    tension: 0.3,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                yNodes: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Nœuds', color: '#10b981' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                yDepth: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Profondeur', color: '#f59e0b' },
                    grid: { drawOnChartArea: false }
                },
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8' }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: '#f8fafc', font: { family: 'Inter', size: 12 } }
                }
            }
        }
    });
}

// --- LISTENERS ---

document.getElementById('btn-solve').addEventListener('click', solveAndAnimate);
document.getElementById('btn-shuffle').addEventListener('click', shuffleBoard);
document.getElementById('btn-reset').addEventListener('click', () => {
    state.currentBoard = GOAL.map(row => [...row]);
    renderBoard(state.currentBoard);
    log("Reset à l'état cible effectué.");
});

document.getElementById('weight-p').addEventListener('input', (e) => {
    document.getElementById('p-value').textContent = parseFloat(e.target.value).toFixed(1);
});

document.getElementById('btn-run-current-bench').addEventListener('click', runCurrentBench);
document.getElementById('btn-run-global-bench').addEventListener('click', runGlobalBench);

// --- INITIALISATION ---

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    renderBoard(state.currentBoard);
    log("Système prêt.");
});
