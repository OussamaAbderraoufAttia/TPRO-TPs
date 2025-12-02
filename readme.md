# 📂 TPRO – Travaux Pratiques : Algorithmes & Optimisation

## Introduction

Ce dépôt regroupe l’ensemble des Travaux Pratiques réalisés dans le cadre du module **Théorie de Programmation et Recherche Opérationnelle (TPRO)**.  
Il présente des implémentations en **C** — privilégié pour ses performances — ainsi qu’une **visualisation Web (HTML/CSS/JS)** pour offrir une interaction graphique avec certains algorithmes.

---

## ℹ️ Informations Administratives

**Module :** Théorie de Programmation et Recherche Opérationnelle (TPRO)  
**Année Universitaire :** 2025–2026  
**Encadré par :** **M. HADIM Boukhalfa**

**Réalisé par :**  
- **ATTIA Oussama Abderraouf**  
- **SRAICH Imene**

---

## 🌳 Structure du Dépôt

L'organisation du dépôt est pensée pour séparer clairement les différents TPs ainsi que leurs rapports associés.

TPRO-Repo/
├── TP1-ShortestCycle/
│ ├── C/
│ │ └── main.c # Calcul du plus court cycle (maille) via BFS.
│ └── WebVisualisation/
│ ├── index.html # Interface utilisateur.
│ ├── script.js # Algorithme BFS + rendu Canvas.
│ └── style.css # Thème et mise en forme.
│
├── TP2-TSP/
│ └── main.c # Held-Karp (PD) & Force Brute pour le PVC.
│
├── Reports/
│ ├── TPRO - ATTIA SRAICH - TP1.pdf
│ └── TPRO - ATTIA SRAICH - TP2.pdf
│
└── README.md

---

## 🧪 Contenu des Travaux Pratiques

### **TP1 – Détection du Plus Court Cycle (Maille du Graphe)**  
**Objectif :** Déterminer la longueur du cycle simple minimal dans un graphe non orienté.  
**Méthode :** Parcours en Largeur (BFS), répété depuis chaque sommet.  

Deux implémentations sont fournies :
- **Version Console (C)** — avec `conio2.h` pour une interface enrichie (tableaux, couleurs, étapes).  
- **Version Web** — permettant une animation pas à pas de l’algorithme via Canvas (édition de graphe, vitesse, visualisation dynamique).

---

### **TP2 – Problème du Voyageur de Commerce (TSP / PVC)**  
**Objectif :** Comparer deux approches exactes pour résoudre le TSP sur un graphe complet pondéré.  

**Algorithmes :**  
- **Force Brute / Backtracking** — Complexité : $O(N!)$  
- **Held-Karp (Programmation Dynamique)** — Complexité : $O(N^2 \cdot 2^N)$  

L’implémentation réalise :
- la génération aléatoire de graphes,  
- l’exécution des deux algorithmes,  
- un tableau comparatif clair des temps d'exécution.

Les rapports PDF du TP synthétisent l’analyse théorique et expérimentale.

---

## 📌 Remarques

Ce dépôt est pensé comme un support académique combinant :
- rigueur algorithmique,  
- implémentations performantes,  
- visualisations pédagogiques.

Il peut servir de base pour d’autres projets en optimisation ou en théorie des graphes.