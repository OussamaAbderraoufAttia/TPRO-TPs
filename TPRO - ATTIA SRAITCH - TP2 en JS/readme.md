# TP2 : Le Problème du Voyageur de Commerce (PVC)
## Comparaison Force Brute vs Programmation Dynamique (Bellman-Held-Karp)

**Module :** TPRO (Théorie de Programmation et Recherche Opérationnelle)  
**Année Universitaire :** 2025-2026  
**Encadré par :** M. HADIM Boukhalfa  

**Réalisé par :**
* **ATTIA Oussama Abderraouf**
* **SRAICH Imene**

---

## 📋 Description du Projet

Ce projet est une application web interactive développée dans le cadre du TP2. Elle vise à résoudre et visualiser le **Problème du Voyageur de Commerce** (Traveling Salesperson Problem - TSP) dans un graphe complet.

L'objectif principal est d'implémenter et de comparer deux approches algorithmiques :
1.  **Méthode Exacte (Force Brute) :** Énumération de toutes les permutations possibles ($O(n!)$).
2.  **Méthode Bellman-Held-Karp :** Utilisation de la programmation dynamique avec masques de bits ($O(n^2 2^n)$).

## ✨ Fonctionnalités

L'application est structurée en trois onglets principaux :

### 1. Éditeur & Visualisation
*   **Interactivité :** Ajoutez des villes en cliquant sur le canvas.
*   **Modification des coûts :** Cliquez sur une arête pour modifier son poids manuellement.
*   **Animation :** Visualisez l'algorithme de Force Brute tester les chemins en temps réel.

### 2. Duel (Comparaison Temps Réel)
*   Lancez les deux algorithmes simultanément sur le même graphe.
*   Observez la différence de vitesse d'exécution entre l'approche naïve et l'approche dynamique.

### 3. Benchmark & Statistiques
*   **Analyse de performance :** Exécution automatique de tests pour $n$ allant de 3 à 12 villes.
*   **Graphiques :** Visualisation des courbes de temps d'exécution (Chart.js) montrant l'explosion exponentielle de la force brute.
*   **Inspection :** Cliquez sur une ligne du tableau de résultats pour voir le graphe exact généré lors du test via une fenêtre modale.

## 🛠️ Technologies Utilisées

*   **HTML5 / CSS3 :** Structure et Design (Interface moderne et responsive).
*   **JavaScript (ES6+) :** Logique des algorithmes, gestion du DOM et Canvas.
*   **Chart.js :** Librairie pour le tracé des graphiques de performance.

## 🚀 Comment lancer le projet

Aucune installation serveur n'est nécessaire.

1.  Téléchargez les fichiers (`index.html`, `style.css`, `script.js`).
2.  Ouvrez le fichier `index.html` dans un navigateur web moderne (Chrome, Firefox, Edge).
3.  L'application est prête à l'emploi.

## 🧠 Algorithmes

### Force Brute
Test de toutes les permutations des villes intermédiaires $(n-1)!$.
*   Complexité : $O(n!)$

### Bellman-Held-Karp
Utilise la relation de récurrence suivante :
$$C(S, j) = \min_{i \in S, i \neq j} [C(S-\{j\}, i) + d(i, j)]$$
Où $S$ est un sous-ensemble de villes visitées se terminant par $j$.
*   Complexité : $O(n^2 2^n)$

---
*TP Noté - Université 2025*