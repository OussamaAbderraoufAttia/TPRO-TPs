# 🛍️ TP2: Problème du Voyageur de Commerce (PVC)
**Module :** TPRO (Théorie de Programmation et Recherche Opérationnelle)  
**Année Universitaire :** 2025-2026  
**Encadré par :** M. HADIM Boukhalfa  

**Réalisé par :**
* **ATTIA Oussama Abderraouf**
* **SRAICH Imene**

## Introduction

Ce projet implémente et compare deux algorithmes majeurs pour résoudre le **Problème du Voyageur de Commerce (PVC)** sur un **graphe complet et non orienté** :
1.  **La méthode exacte (Force Brute / Backtracking)**.
2.  **L'algorithme de Held-Karp (Programmation Dynamique)**.

L'objectif principal est de démontrer la supériorité en termes de performance de l'approche par Programmation Dynamique face à l'explosion combinatoire de la Force Brute.

---

## 💻 Architecture Technique et Implémentation

Le projet est entièrement implémenté en **langage C**.

### 1. Structures de Données
Le graphe complet est représenté par une **matrice d'adjacence** (`long long **d`), où la distance entre deux villes est générée aléatoirement (entre 1 et 100).

### 2. Interface Utilisateur
La bibliothèque **`conio2.h`** est utilisée pour générer une interface utilisateur en console (CUI) professionnelle, affichant clairement le tableau comparatif, les titres et les messages d'état en utilisant différentes couleurs et cadres.

---

## 🔎 Comparaison Algorithmique

### 2.1 Méthode Exacte (Force Brute - Backtracking)

| Caractéristique | Détail |
| :--- | :--- |
| **Principe** | Génère toutes les permutations possibles des $N-1$ villes restantes à partir de la ville de départ (ville 0) et calcule le coût de chaque cycle. |
| **Implémentation** | Fonction `tsp_exact` utilisant un algorithme de **Backtracking** récursif (`backtrack_perm`) pour explorer l'arbre de recherche. |
| **Complexité Temporelle** | $O(N!)$ (Factorielle) |

### 2.2 Algorithme de Held-Karp (Programmation Dynamique)

| Caractéristique | Détail |
| :--- | :--- |
| **Principe** | Utilise le principe de l'optimalité. L'état est défini par $DP[\text{masque}][j]$, représentant le coût minimal pour visiter l'ensemble des villes codées par le masque en terminant à la ville $j$. |
| **Implémentation** | Fonction `held_karp` avec un tableau de mémorisation de taille $2^N \times N$ pour stocker les résultats intermédiaires. |
| **Complexité Temporelle** | $O(N^2 \cdot 2^N)$ |

---

## 📈 Analyse des Résultats (Benchmark)

Le programme exécute un benchmark en comparant les deux algorithmes sur des graphes de taille $N$ variant de **2 à 12** villes.

### 4.1 Observation de la Complexité

Le tableau comparatif généré par le programme démontre de manière frappante l'efficacité relative des deux méthodes :

| N | Force Brute (Temps) | Held-Karp (Temps) | Coût Minimum | Note |
| :-: | :-: | :-: | :-: | :--- |
| 4 | $\approx 0.000002s$ | $\approx 0.000005s$ | $120$ | `exact OK` |
| 10 | $\approx 1.254000s$ | $\approx 0.002100s$ | $345$ | `exact OK` |
| 11 | N/A | $\approx 0.004500s$ | $410$ | `exact skipped` |
| 12 | N/A | $\approx 0.010200s$ | $450$ | `exact skipped` |

### 4.2 Conclusion sur la Performance

* Pour **$N=10$**, la méthode exacte prend plus d'une seconde, alors que Held-Karp est quasi-instantané (environ **2 millisecondes**).
* Au-delà de **$N=10$** (`MAX_EXACT_N`), la méthode Force Brute est désactivée (`exact skipped`) car son temps de calcul devient déraisonnable (temps estimé pour $12! \approx 479$ millions d'opérations).
* **Held-Karp** maintient une très haute performance jusqu'à **$N=12$**, validant la supériorité de la Programmation Dynamique pour des instances de taille moyenne du PVC.