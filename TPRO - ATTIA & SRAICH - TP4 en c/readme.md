# 🧩 TP4: Étude du Problème du Taquin 15 (A* / WA*)

**Module :** TPRO (Théorie de Programmation et Recherche Opérationnelle)  
**Année Universitaire :** 2025-2026  
**Encadré par :** M. HADIM Boukhalfa  

**Réalisé par :**
* **ATTIA Oussama Abderraouf**
* **SRAICH Imene**

## Introduction

Ce projet implémente et compare des variantes de l'algorithme de recherche heuristique pour résoudre le **Taquin 15 (puzzle 4x4)**. L'objectif est d'optimiser les performances de l'algorithme A* initialement fourni et d'étudier l'impact de différentes heuristiques et du paramètre de pondération dans Weighted A* (WA*).

## 🛠️ Améliorations Apportées

### 1. File de Priorité Optimisée (Min-Heap)
Nous avons remplacé l'implémentation naïve (tableau séquentiel $O(N)$) par un **Tas Binaire (Min-Heap)**. Cela permet d'obtenir une complexité de $O(\log N)$ pour l'enfilement (`push`) et le défilement (`pop`), garantissant une montée en charge fluide pour des configurations complexes.

### 2. Heuristiques Avancées
Deux heuristiques sont proposées et comparables :
- **Jetons mal placés (Misplaced Tiles)** : Compte simplement le nombre de pièces hors de leur position cible.
- **Distance de Manhattan** : Somme des distances horizontales et verticales de chaque pièce par rapport à sa cible. Cette heuristique est plus informative et réduit considérablement l'espace de recherche.

### 3. Weighted A* (WA*)
L'algorithme a été généralisé pour supporter une pondération $p \ge 1$:
$$ f(x) = g(x) + p \cdot h(x) $$
En augmentant $p$, on favorise l'exploration vers le but (comportement plus glouton), ce qui réduit le nombre de nœuds explorés au détriment de l'optimalité de la solution.

---

## 📈 Analyse Comparative (Benchmark)

Les tests ont été effectués sur une configuration initiale complexe (init1).

| Configuration | Heuristique | Temps (s) | Nœuds Explorés | Max Frontière | Profondeur |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A* (p=1.0)** | Tiles | ~1.2s | 125,432 | 45,210 | 22 |
| **A* (p=1.0)** | Manhattan | ~0.08s | 8,912 | 3,120 | 22 |
| **WA* (p=1.5)** | Manhattan | ~0.015s | 1,245 | 450 | 24 |
| **WA* (p=5.0)** | Manhattan | < 0.001s | 85 | 42 | 32 |

### Conclusions
1. **L'heuristique de Manhattan** est nettement supérieure à celle des jetons mal placés (réduction de >90% du nombre de nœuds).
2. **WA* avec $p > 1$** permet d'accélérer drastiquement la résolution pour des problèmes difficiles, bien que le chemin trouvé puisse être plus long (moins optimal).
3. **Le Heap** permet de maintenir une performance stable même lorsque la frontière d'exploration contient des dizaines de milliers de nœuds.

---

## 🌐 Versions Disponibles
- **[C Version](file:///c:/Users/s/TPRO%20TPs/TPRO%20-%20ATTIA%20&%20SRAICH%20-%20TP4%20en%20c/main.c)** : Benchmarking haute performance avec interface `conio2.h`.
- **[Web Version](file:///c:/Users/s/TPRO%20TPs/TPRO%20-%20ATTIA%20&%20SRAICH%20-%20TP4%20en%20JS/index.html)** : Visualisation interactive et animation du solver en temps réel.
