# 🌐 TP1: Plus Court Cycle - Visualisation Web Interactive

**Module :** TPRO (Théorie de Programmation et Recherche Opérationnelle)  
**Année Universitaire :** 2025-2026  
**Encadré par :** M. HADIM Boukhalfa  

**Réalisé par :**
* **ATTIA Oussama Abderraouf**
* **SRAICH Imene**


## Introduction

Ce document décrit la version de **Visualisation Web** du Travaux Pratiques (TP) sur la recherche du plus court cycle, faisant suite à l'implémentation initiale en C.

L'objectif de cette version est de fournir une interface interactive permettant de :
1. Construire et modifier un graphe non orienté.
2. Visualiser, étape par étape, l'exécution de l'algorithme de **Breadth-First Search (BFS) itératif** pour la détection de la maille du graphe.

---

## 💻 Architecture Technique

Le projet est une application web front-end standard, construite avec les technologies suivantes :

| Fichier | Rôle | Technologie |
| :--- | :--- | :--- |
| `index.html` | Structure de la page et de l'interface utilisateur. | HTML5 |
| `style.css` | Mise en page, couleurs et style moderne (mode sombre). | CSS3 |
| `script.js` | **Logique de l'algorithme BFS** et gestion de l'interactivité. | JavaScript (ES6+) |
| **Visualisation** | Utilisation de l'API **HTML Canvas** pour le dessin dynamique du graphe. | JavaScript |
| **Iconographie** | Utilisation de la bibliothèque **Font Awesome** pour les icônes de contrôle. | CSS (via CDN) |

---

## 🎨 Fonctionnalités de l'Interface Utilisateur

L'application est divisée en une barre latérale (`sidebar`) pour les contrôles et une zone principale (`main-content`) pour la visualisation et les journaux.

### 1. Modes d'Édition du Graphe

L'utilisateur peut basculer entre trois modes d'interaction via des boutons dédiés :
* **<i class="fas fa-circle"></i> Ajouter Nœud (Node):** Clique pour placer un nouveau sommet.
* **<i class="fas fa-link"></i> Ajouter Arête (Edge):** Clique sur deux nœuds consécutifs pour les connecter.
* **<i class="fas fa-arrows-alt"></i> Déplacer (Move):** Permet de glisser-déposer les sommets existants sur le canvas.

### 2. Contrôle et Journalisation de l'Algorithme

* **Vitesse d'Animation:** Un curseur permet d'ajuster la vitesse d'exécution de l'animation BFS, via la variable `animationSpeed` (inversement proportionnelle à la valeur du curseur).
* **Journal d'exécution (`logs`):** Un terminal affiche les étapes clés de l'algorithme, notamment le lancement de chaque BFS et la détection d'un cycle avec sa longueur.
* **Graphe de Test Aléatoire:** Un bouton permet de générer automatiquement l'exemple de graphe utilisé dans le TP initial (6 sommets).

---

## 🔎 Implémentation de l'Algorithme (JavaScript)

La logique du plus court cycle est entièrement implémentée dans la fonction asynchrone `runAlgorithm()` du fichier `script.js`.

### 1. BFS Itératif
L'algorithme effectue une boucle sur tous les nœuds disponibles et lance un BFS à partir de chacun, cherchant le minimum de la variable `bestCycleLength`. Les états des nœuds sont gérés par un tableau `visited`:
* `0`: Non Visité (`NON_VISITE`)
* `1`: En Queue (`EN_COURS`)
* `2`: Visité (`VISITE`)

### 2. Détection de Cycle
La détection de cycle se produit lorsqu'un voisin `v` du sommet en cours `u` est rencontré dans l'état `visited[v] === 1` (EN_COURS) et que `v` n'est pas le parent direct de `u`.
La longueur du cycle est calculée comme : `currentCycleLen = dist[u] + dist[v] + 1`.

### 3. Visualisation Dynamique
Le `script.js` utilise un système de couleurs pour visualiser l'état du parcours :
* **Bleu (`COL_NODE_START`):** Sommet de départ du BFS actuel.
* **Orange/Jaune (`COL_NODE_QUEUE`):** Sommet en cours de traitement.
* **Vert (`COL_NODE_VISIT`):** Sommet finalisé (VISITE).
* **Rouge (`COL_CYCLE`):** Les arêtes du cycle le plus court trouvé (`bestCyclePath`) sont mises en évidence à la fin de l'exécution.