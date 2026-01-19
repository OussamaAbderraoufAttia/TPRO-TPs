# 🧠 Guide Technique Complet : Le Solveur de Taquin 15 (TPRO)

## 1. Introduction et Enoncé du Problème
Le projet **Taquin 15** s'inscrit dans le cadre du module **Théorie de Programmation et Recherche Opérationnelle (TPRO)**. L'objectif est de concevoir un algorithme capable de résoudre de manière optimale ou sub-optimale le célèbre puzzle de 15 jetons.

L'énoncé du TP demandait spécifiquement :
- Le passage d'une file de priorité naïve ($O(N)$) à une structure de **Tas Binaire** ($O(\log N)$).
- L'implémentation de l'heuristique de la **Distance de Manhattan**.
- L'implémentation de la variante **Weighted A*** (WA*).
- Une étude comparative des performances via des métriques comme le temps CPU, le nombre de nœuds et la profondeur de la solution.

---

## 2. Architecture Logicielle (C Implementation)

### 2.1 Structures de Données Centrales
Le code est architecturé autour de la structure `noeud` :
```c
typedef char conf[4][4];
struct noeud {
    conf m;       // Etat du puzzle
    int g, h;     // Coûts g(x) et h(x)
    double cout;  // f(x)
    struct noeud *pere;
};
```
La grille est stockée sur 16 octets (`char[4][4]`), ce qui est crucial pour maintenir une faible consommation mémoire lors de l'exploration de millions d'états.

### 2.2 Le Moteur de Recherche : A* et WA*
L'algorithme A* maintient deux ensembles :
- **OPEN SET (Frontière)** : Les nœuds découverts mais non encore explorés. Géré par notre Tas Binaire.
- **CLOSED SET (Parcours)** : Pour éviter les redondances, nous vérifions si un état existe déjà dans le chemin actuel (`exists_in_path`).

L'algorithme WA* modifie la fonction d'évaluation :
$$ f(x) = g(x) + p \cdot h(x) $$
Si $p > 1$, l'algorithme privilégie les nœuds "proches" du but selon l'heuristique, ce qui accélère la convergence.

---

## 3. Analyse de la Complexité

### 3.1 Gestion de la Priorité (Heap)
L'implémentation du **Tas Min** est le coeur de l'optimisation.
- **Insertion** : $O(\log N)$. On ajoute à la fin et on rétablit l'ordre (`heapifyUp`).
- **Suppression du Min** : $O(\log N)$. On retire la racine et on rééquilibre (`heapifyDown`).
Sur une exécution explorant 100 000 nœuds, le gain de temps est de l'ordre de plusieurs magnitudes par rapport à un tableau simple.

### 3.2 Complexité des Heuristiques
- **Manhattan** : $O(16) = O(1)$. On parcourt la grille une fois.
- **Inversion Count** (Solvabilité) : $O(16^2) = O(1)$.

### 3.3 Espace de Recherche
L'espace d'états est de $16!/2 \approx 10^{13}$. Cependant, l'algorithme A* avec une bonne heuristique ne visite qu'une infime fraction de cet espace ($0.0001\%$).

---

## 4. Résultats Expérimentaux et Analyse Critique

Suite aux tests sur la configuration `init1` :

| Methode | Heuristique | Noeuds | Profondeur | Observatons |
| :--- | :--- | :--- | :--- | :--- |
| **A*** | Misplaced | 1891 | 18 | Lent mais optimal |
| **A*** | Manhattan | 191 | 18 | Rapide et optimal |
| **WA*(1.5)** | Manhattan | 105 | 18 | Ultra-rapide |
| **WA*(5.0)** | Manhattan | 813 | 28 | Rapide mais médiocre |

### Interpretations
1. **L'efficacité de Manhattan** : Manhattan est une heuristique "plus informée". Elle capture la géométrie du puzzle. Le nombre de nœuds tombe de 1891 à 191.
2. **Le poids p** : Un poids $p=1.5$ est idéal. Il réduit l'effort de recherche de 45% sans dégrader la solution. Au-delà ($p=5$), l'algorithme devient "aveugle par gourmandise" et trouve des chemins inutilement longs.

---

## 5. Guide de l'Interface (CUI et WEB)

### 5.1 Console CUI (`main.c`)
Utilise `conio2.h` pour un affichage tabulaire coloré. C'est l'outil de benchmark privilégié pour obtenir des mesures précises du temps CPU (via `clock()`).

### 5.2 Interface Web (`index.html`)
Permet une compréhension visuelle. L'animation montre comment les pièces se déplacent. C'est un excellent support pour expliquer le comportement de WA* (on voit l'algorithme "hésiter" ou au contraire "foncer" vers le but).

---

## 6. Conclusion
Le succès de ce TP repose sur la synergie entre :
1. **Optimisation Algorithmique** : Le Tas Binaire.
2. **Intelligence Heuristique** : La Distance de Manhattan.
3. **Analyse de Paramètres** : L'étude de l'influence du poids $p$.

Ce solveur est capable de traiter des configurations complexes en une fraction de seconde, validant ainsi les principes de la Recherche Opérationnelle.
