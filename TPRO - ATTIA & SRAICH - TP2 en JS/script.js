// --- VARIABLES GLOBALES & ÉTAT ---
let cities = []; 
let adjMatrix = []; 
let mode = 'add';
let currentRunID = 0; // Pour annuler les boucles async
let animationSpeed = 50; 
let animationDelay = 500;

// Historique pour le benchmark (pour le popup)
let benchmarkHistory = []; 

const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Initialisation
window.onload = () => {
    resizeAllCanvases();
    window.addEventListener('resize', resizeAllCanvases);
    setupEvents();
    // Dessin initial boucle principale
    requestAnimationFrame(drawMainLoop);
};

// --- GESTION DE L'INTERFACE ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    // Trouver le bouton correspondant (un peu hacky mais simple)
    const btns = document.querySelectorAll('.tab-btn');
    if(tabId === 'visualizer') btns[0].classList.add('active');
    if(tabId === 'race') btns[1].classList.add('active');
    if(tabId === 'benchmark') btns[2].classList.add('active');

    // Reset animations quand on change d'onglet
    currentRunID++; 
    resizeAllCanvases();
}

function resizeAllCanvases() {
    // Redimensionner tous les canvas aux dimensions de leur parent
    document.querySelectorAll('canvas').forEach(cvs => {
        const parent = cvs.parentElement;
        if(parent.clientWidth > 0) {
            cvs.width = parent.clientWidth;
            cvs.height = parent.clientHeight;
        }
    });
    drawGraph('mainCanvas', cities, adjMatrix);
}

function setupEvents() {
    // Canvas principal Clics
    const mainCanvas = document.getElementById('mainCanvas');
    mainCanvas.addEventListener('mousedown', (e) => handleCanvasClick(e, mainCanvas));

    // Slider
    document.getElementById('speedRange').oninput = function() {
        animationDelay = 1010 - (this.value * 10);
    };
}

function setMode(m) { mode = m; }

function clearGraph() {
    currentRunID++; // Stop tout
    cities = [];
    adjMatrix = [];
    drawGraph('mainCanvas', cities, adjMatrix);
    log("Tout effacé.");
}

// --- LOGIQUE GRAPHE & INTERACTIONS ---
function handleCanvasClick(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'add') {
        if (cities.length >= 26) return alert("Limite de villes atteinte (26).");
        addCity(x, y);
    } else if (mode === 'edit') {
        // Logique modifier coût
        let clickedEdge = getClickedEdge(x, y);
        if (clickedEdge) {
            const current = adjMatrix[clickedEdge.i][clickedEdge.j];
            const newVal = prompt(`Nouveau coût ${labels[clickedEdge.i]}-${labels[clickedEdge.j]} :`, current);
            if (newVal && !isNaN(newVal)) {
                const v = parseInt(newVal);
                adjMatrix[clickedEdge.i][clickedEdge.j] = v;
                adjMatrix[clickedEdge.j][clickedEdge.i] = v;
                drawGraph('mainCanvas', cities, adjMatrix);
            }
        }
    }
}

function addCity(x, y) {
    const idx = cities.length;
    cities.push({ x, y, label: labels[idx] });

    if (idx === 0) adjMatrix = [[0]];
    else {
        adjMatrix.push(new Array(idx + 1).fill(0));
        for (let i = 0; i <= idx; i++) {
            if (i === idx) adjMatrix[i][i] = 0;
            else {
                const dist = Math.floor(Math.hypot(cities[i].x - x, cities[i].y - y) / 5);
                adjMatrix[i][idx] = dist;
                adjMatrix[idx][i] = dist;
            }
        }
    }
    drawGraph('mainCanvas', cities, adjMatrix);
}

function getClickedEdge(x, y) {
    let minDist = 10;
    let edge = null;
    for (let i = 0; i < cities.length; i++) {
        for (let j = i + 1; j < cities.length; j++) {
            const p1 = cities[i], p2 = cities[j];
            const dist = pointToSegment(x, y, p1.x, p1.y, p2.x, p2.y);
            if (dist < minDist) { minDist = dist; edge = {i, j}; }
        }
    }
    return edge;
}

function pointToSegment(px, py, x1, y1, x2, y2) {
    const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;
    let xx, yy;
    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param * C; yy = y1 + param * D; }
    return Math.hypot(px - xx, py - yy);
}

// --- DESSIN GÉNÉRIQUE ---
// path: array of indices, color: hex string
function drawGraph(canvasId, _cities, _matrix, path = null, color = "#2ecc71") {
    const cvs = document.getElementById(canvasId);
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    // Ajuster l'échelle si on dessine dans un petit canvas (Duel ou Modal)
    // On assume que les coords des villes sont basées sur le mainCanvas (800x500 par défaut)
    // On calcule un ratio simple
    const scaleX = cvs.width / document.getElementById('mainCanvas').width;
    const scaleY = cvs.height / document.getElementById('mainCanvas').height;
    // Pour simplifier, on redessine avec les coords brutes si c'est le main, 
    // sinon on scale tout. 
    // Mais pour garder la simplicité, on utilise scale() du contexte.
    
    ctx.save();
    // Si ce n'est pas le mainCanvas, on scale
    if(canvasId !== 'mainCanvas') {
        // Petit fix pour garder l'aspect ratio
        const scale = Math.min(cvs.width/800, cvs.height/500); 
        ctx.scale(scale, scale);
    }

    // Arêtes
    ctx.lineWidth = 1; ctx.font = "12px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let i = 0; i < _cities.length; i++) {
        for (let j = i + 1; j < _cities.length; j++) {
            ctx.strokeStyle = "#eee";
            ctx.beginPath();
            ctx.moveTo(_cities[i].x, _cities[i].y);
            ctx.lineTo(_cities[j].x, _cities[j].y);
            ctx.stroke();
            
            // Texte coût
            const mx = (_cities[i].x + _cities[j].x) / 2;
            const my = (_cities[i].y + _cities[j].y) / 2;
            ctx.fillStyle = "#aaa";
            if(_cities.length < 10) ctx.fillText(_matrix[i][j], mx, my); // Masquer si trop de villes
        }
    }

    // Chemin actif
    if (path && path.length > 0) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(_cities[path[0]].x, _cities[path[0]].y);
        for (let k = 1; k < path.length; k++) {
            ctx.lineTo(_cities[path[k]].x, _cities[path[k]].y);
        }
        ctx.stroke();
    }

    // Villes
    for (let i = 0; i < _cities.length; i++) {
        ctx.beginPath();
        ctx.arc(_cities[i].x, _cities[i].y, 15, 0, Math.PI * 2);
        ctx.fillStyle = "#3498db"; ctx.fill();
        ctx.strokeStyle = "#2c3e50"; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = "white"; ctx.font = "bold 14px Arial";
        ctx.fillText(_cities[i].label, _cities[i].x, _cities[i].y);
    }
    ctx.restore();
}

// Pour l'animation main loop (rafraichissement continu si besoin, ici on redessine à la demande)
function drawMainLoop() {
    // Rien à faire en boucle ici car on dessine à chaque étape de l'algo
    // Mais on peut l'utiliser pour des effets visuels plus tard
    requestAnimationFrame(drawMainLoop);
}

// --- ALGORITHMES & EXÉCUTION ---

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function log(m) { document.getElementById('consoleLog').innerHTML = `> ${m}`; }

// 1. EXECUTION SIMPLE (ONGLET 1)
async function runSingleAlgo(type) {
    if (cities.length < 2) return alert("2 villes min.");
    currentRunID++;
    const myRunID = currentRunID;

    if (type === 'bf') {
        log("Force Brute en cours...");
        const t0 = performance.now();
        await runBruteForceAnim('mainCanvas', cities, adjMatrix, myRunID, (cost, path) => {
            document.getElementById('singleCost').innerText = cost;
        });
        const t1 = performance.now();
        document.getElementById('singleTime').innerText = (t1 - t0).toFixed(0) + " ms";
        log("Force Brute Terminée.");
    } else {
        log("DP en cours...");
        const t0 = performance.now();
        const res = solveDP(adjMatrix);
        const t1 = performance.now();
        drawGraph('mainCanvas', cities, adjMatrix, res.path, "#8e44ad");
        document.getElementById('singleCost').innerText = res.cost;
        document.getElementById('singleTime').innerText = (t1 - t0).toFixed(4) + " ms";
        log("DP Terminé.");
    }
}

// 2. DUEL (ONGLET 2)
async function startRace() {
    if (cities.length < 3) return alert("Il faut au moins 3 villes pour une course intéressante.");
    
    // Copier le graphe actuel pour la course
    const raceCities = [...cities];
    const raceMatrix = JSON.parse(JSON.stringify(adjMatrix));
    
    currentRunID++; // Stop tout autre process
    const myRunID = currentRunID;

    // Reset UI
    document.getElementById('statsBF').querySelector('.status').innerText = "Calcul...";
    document.getElementById('statsDP').querySelector('.status').innerText = "Calcul...";
    
    // Lancer DP (quasi instantané)
    const t0_dp = performance.now();
    const resDP = solveDP(raceMatrix);
    const t1_dp = performance.now();
    
    // Afficher résultat DP tout de suite (c'est le but de montrer que c'est rapide)
    drawGraph('raceCanvasDP', raceCities, raceMatrix, resDP.path, "#8e44ad");
    const dpStats = document.getElementById('statsDP');
    dpStats.querySelector('.status').innerText = "TERMINÉ";
    dpStats.querySelector('.status').className = "status finished";
    dpStats.querySelector('.time').innerText = (t1_dp - t0_dp).toFixed(3) + " ms";
    dpStats.querySelector('.current-p').innerText = "Optimal trouvé";

    // Lancer BF (Animé)
    const bfStats = document.getElementById('statsBF');
    bfStats.querySelector('.status').innerText = "EN COURS";
    bfStats.querySelector('.status').className = "status running";
    
    const t0_bf = performance.now();
    
    // On lance l'anim BF
    await runBruteForceAnim('raceCanvasBF', raceCities, raceMatrix, myRunID, (cost, path) => {
        bfStats.querySelector('.current-p').innerText = "Coût actuel: " + cost;
    }, true); // true = mode course (plus lent ou adapté)

    const t1_bf = performance.now();
    
    // Si pas annulé
    if(currentRunID === myRunID) {
        bfStats.querySelector('.status').innerText = "TERMINÉ";
        bfStats.querySelector('.status').className = "status finished";
        bfStats.querySelector('.time').innerText = (t1_bf - t0_bf).toFixed(0) + " ms";
    }
}

// --- COEUR DE L'ALGO FORCE BRUTE ANIMÉ ---
async function runBruteForceAnim(canvasId, _cities, _matrix, runID, onUpdateCallback, isRace = false) {
    let n = _cities.length;
    let arr = []; 
    for(let i=1; i<n; i++) arr.push(i);

    let minCost = Infinity;
    let bestPath = [];

    // Générateur de permutations
    function* permute(permutation) {
        let length = permutation.length, c = Array(length).fill(0), i = 1, k, p;
        yield permutation.slice();
        while (i < length) {
            if (c[i] < i) {
                k = i % 2 && c[i];
                p = permutation[i]; permutation[i] = permutation[k]; permutation[k] = p;
                ++c[i]; i = 1; yield permutation.slice();
            } else { c[i] = 0; ++i; }
        }
    }

    const gen = permute(arr);
    let counter = 0;

    for (let p of gen) {
        if (currentRunID !== runID) return; // Arrêt d'urgence

        let currentPath = [0].concat(p).concat([0]);
        let cost = 0;
        for(let k=0; k<currentPath.length-1; k++) {
            cost += _matrix[currentPath[k]][currentPath[k+1]];
        }

        // Si meilleur trouvé
        if (cost < minCost) {
            minCost = cost;
            bestPath = currentPath;
            onUpdateCallback(minCost, bestPath);
            // Dessiner en vert le nouveau meilleur
            drawGraph(canvasId, _cities, _matrix, bestPath, "#27ae60");
            await sleep(isRace ? 200 : animationDelay); // Pause pour admirer
        } else {
            // Dessiner en jaune le test actuel (sauter des frames si très rapide)
            if (animationDelay > 10 || counter % 50 === 0) {
                drawGraph(canvasId, _cities, _matrix, currentPath, "#f1c40f");
                // On redessine le meilleur par dessus si on veut (optionnel)
            }
        }
        
        // Délai d'animation standard
        if(animationDelay > 5) await sleep(animationDelay);
        else if(counter % 100 === 0) await sleep(1); // Anti-freeze
        
        counter++;
    }
    
    // Dessin final
    drawGraph(canvasId, _cities, _matrix, bestPath, "#27ae60");
}

// --- ALGO DP (Non animé visuellement, juste calcul) ---
function solveDP(m) {
    const n = m.length;
    const VISITED_ALL = (1 << n) - 1;
    let dp = Array(1 << n).fill(null).map(() => Array(n).fill(Infinity));
    let parent = Array(1 << n).fill(null).map(() => Array(n).fill(-1));

    for (let i = 1; i < n; i++) {
        dp[1 | (1 << i)][i] = m[0][i];
        parent[1 | (1 << i)][i] = 0;
    }

    for (let mask = 1; mask < (1 << n); mask++) {
        if (!(mask & 1)) continue;
        for (let next = 1; next < n; next++) {
            if (!((mask >> next) & 1)) continue;
            let prevMask = mask ^ (1 << next);
            if (prevMask === 0) continue;
            for (let curr = 0; curr < n; curr++) {
                if ((prevMask >> curr) & 1) {
                    let newCost = dp[prevMask][curr] + m[curr][next];
                    if (newCost < dp[mask][next]) {
                        dp[mask][next] = newCost;
                        parent[mask][next] = curr;
                    }
                }
            }
        }
    }

    let minCost = Infinity, lastNode = -1;
    for (let i = 1; i < n; i++) {
        let total = dp[VISITED_ALL][i] + m[i][0];
        if (total < minCost) { minCost = total; lastNode = i; }
    }

    let path = [];
    let currNode = lastNode;
    let currMask = VISITED_ALL;
    if(minCost === Infinity) return {cost:0, path:[]};

    while (currNode !== -1 && currNode !== 0) {
        path.unshift(currNode);
        let temp = currNode;
        currNode = parent[currMask][currNode];
        currMask = currMask ^ (1 << temp);
    }
    path.unshift(0); path.push(0);
    return { cost: minCost, path: path };
}

// --- BENCHMARK & CHART.JS & MODAL ---

let myChart = null;

async function runBenchmark() {
    benchmarkHistory = []; // Reset historique
    const tbody = document.querySelector('#statsTable tbody');
    tbody.innerHTML = "<tr><td colspan='4'>Calcul en cours...</td></tr>";

    let chartDataLabels = [];
    let chartDataBF = [];
    let chartDataDP = [];

    // Initialiser le graph vide
    updateChart([], [], []);

    for(let n = 3; n <= 10; n++) {
        // Générer random
        let mat = [], pos = [];
        for(let i=0; i<n; i++) {
            // Position aléatoire fictive pour l'affichage modal (sur 800x500)
            pos.push({ x: 50 + Math.random()*700, y: 50 + Math.random()*400, label: labels[i] });
            mat[i] = [];
            for(let j=0; j<n; j++) mat[i][j] = 0;
        }
        for(let i=0; i<n; i++) {
            for(let j=i+1; j<n; j++) {
                const dist = Math.floor(Math.hypot(pos[i].x - pos[j].x, pos[i].y - pos[j].y) / 5);
                mat[i][j] = dist; mat[j][i] = dist;
            }
        }

        // Test BF
        const t0 = performance.now();
        solveBruteForceSilent(mat, n);
        const t1 = performance.now();
        
        // Test DP
        const t2 = performance.now();
        const resDP = solveDP(mat);
        const t3 = performance.now();

        const timeBF = t1 - t0;
        const timeDP = t3 - t2;

        // Sauvegarder pour le modal
        benchmarkHistory.push({
            n: n,
            cities: pos,
            matrix: mat,
            res: resDP, // On garde le chemin du DP car c'est le même optimal
            timeBF: timeBF,
            timeDP: timeDP
        });

        // Mise à jour Tableau
        if(n === 3) tbody.innerHTML = ""; // Clear loading
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${n}</td>
            <td>${timeBF.toFixed(2)}</td>
            <td>${timeDP.toFixed(3)}</td>
            <td><button class="btn" onclick="openModal(${benchmarkHistory.length - 1})">🔍 Voir</button></td>
        `;
        // Click ligne -> Modal
        tr.onclick = (e) => {
            if(e.target.tagName !== 'BUTTON') openModal(benchmarkHistory.length - 1);
        };
        tbody.appendChild(tr);

        // Mise à jour Graph
        chartDataLabels.push(n);
        chartDataBF.push(timeBF);
        chartDataDP.push(timeDP);
        updateChart(chartDataLabels, chartDataBF, chartDataDP);

        await sleep(50);
    }
}

function solveBruteForceSilent(mat, n) {
    let minCost = Infinity;
    let arr = []; for(let i=1; i<n; i++) arr.push(i);
    function permute(arr, m=[]) {
        if (arr.length === 0) {
            let cost = 0, curr = 0;
            for(let i=0; i<m.length; i++) { cost += mat[curr][m[i]]; curr = m[i]; }
            cost += mat[curr][0];
            if(cost < minCost) minCost = cost;
        } else {
            for (let i = 0; i < arr.length; i++) {
                let curr = arr.slice(), next = curr.splice(i, 1);
                permute(curr, m.concat(next));
            }
        }
    }
    permute(arr);
}

function updateChart(labels, dataBF, dataDP) {
    const ctx = document.getElementById('myChart').getContext('2d');
    
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Force Brute (ms)',
                    data: dataBF,
                    borderColor: '#e67e22',
                    backgroundColor: 'rgba(230, 126, 34, 0.2)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Bellman-Held-Karp (ms)',
                    data: dataDP,
                    borderColor: '#8e44ad',
                    backgroundColor: 'rgba(142, 68, 173, 0.2)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: { mode: 'index', intersect: false },
                zoom: { // Note: nécessite chartjs-plugin-zoom si on veut le vrai zoom
                    zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }
                }
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false }
        }
    });
}

// --- MODAL FUNCTIONS ---
function openModal(index) {
    const data = benchmarkHistory[index];
    if(!data) return;

    document.getElementById('graphModal').style.display = 'block';
    document.getElementById('modalN').innerText = data.n;
    document.getElementById('modalCost').innerText = data.res.cost;
    document.getElementById('modalPath').innerText = data.res.path.map(i => labels[i]).join(' → ');

    // Dessiner dans le canvas modal
    // Petit timeout pour s'assurer que le modal est rendu
    setTimeout(() => {
        drawGraph('modalCanvas', data.cities, data.matrix, data.res.path, "#2ecc71");
    }, 50);
}

function closeModal() {
    document.getElementById('graphModal').style.display = 'none';
}

// Fermer modal si clic en dehors
window.onclick = function(event) {
    const modal = document.getElementById('graphModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}