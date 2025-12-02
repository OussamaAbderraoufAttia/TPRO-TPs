## 🎯 Synthèse des Résultats du TP
**Module :** TPRO (Théorie de Programmation et Recherche Opérationnelle)  
**Année Universitaire :** 2025-2026  
**Encadré par :** M. HADIM Boukhalfa  

**Réalisé par :**
* **ATTIA Oussama Abderraouf**
* **SRAICH Imene**


### 1. Objectif du Projet
[cite_start]Le Travail Pratique (TP) visait à concevoir et implémenter un algorithme capable de trouver la **longueur du plus court cycle** (la maille du graphe) dans un graphe non orienté et non pondéré[cite: 20].

---

### 2. Algorithme Central et Principe
[cite_start]L'approche algorithmique utilisée est le **Parcours en Largeur (BFS - Breadth-First Search)**[cite: 23].

* [cite_start]**Méthode Globale:** Pour garantir la découverte du plus court cycle, le BFS est lancé à partir de **chaque sommet** ($s$) du graphe[cite: 26, 28].
* [cite_start]**Détection d'un Cycle:** Un cycle est détecté lorsqu'un BFS visite un sommet voisin ($w$) qui est déjà **en cours** de visite (`EN_COURS`) et qui **n'est pas** le parent direct du sommet actuel ($v$)[cite: 25, 57].
* **Calcul de la Longueur:** La longueur du cycle est déterminée par la formule :
    $$
    \text{Longueur} = \text{distance}[v] + \text{distance}[w] + 1
    $$
    [cite_start]La valeur minimale trouvée après l'exécution de tous les BFS est retenue comme le résultat final[cite: 29, 30].

---

### 3. Résultats de l'Étude de la Complexité

Les résultats de l'analyse des ressources du programme sont les suivants :

* **Complexité Temporelle (Temporelle):**
    * [cite_start]Un seul BFS coûte $O(S+A)$[cite: 73].
    * [cite_start]Puisqu'un BFS est exécuté pour chaque sommet $S$ [cite: 74][cite_start], la complexité totale est : $O(S \cdot (S + A))$[cite: 76].
    * [cite_start]Dans le pire des cas (graphe dense où $A \approx S^2$), la complexité approche $O(S^3)$[cite: 77].

* **Complexité Spatiale (Spatiale):**
    * [cite_start]L'espace est dominé par la représentation du graphe par listes d'adjacence et les tableaux auxiliaires (`etat`, `distance`, `parent`)[cite: 79].
    * $$
        \text{Espace} = O(S + A)
        [cite_start]$$ [cite: 80]

---

### 4. Résultat de l'Exemple d'Exécution

Le programme a été testé avec un graphe spécifique de 6 sommets, qui comprend :

* [cite_start]**Cycle Externe :** $0-1-2-3-4-5-0$ (Longueur 6)[cite: 95].
* [cite_start]**Cordes Ajoutées :** $1-4$ et $2-4$[cite: 95].
* [cite_start]**Cycles Courts Créés :** $1-2-4-1$ et $2-3-4-2$ (Longueur 3)[cite: 97].

**Le Résultat Final Affiché dans la Console était :**

> [cite_start]**Plus court cycle = 3 aretes** [cite: 105]

---

### 5. Intégration de l'Interface Graphique (CONIO2)
[cite_start]L'intégration de la bibliothèque `conio2.h` a permis une **présentation claire et structurée** des résultats[cite: 109]. [cite_start]Les fonctionnalités utilisées incluent[cite: 89, 90, 91]:
* Utilisation de `textcolor()` et `textbackground()` pour les couleurs.
* Dessin de cadres (boîtes) avec les caractères ASCII étendus.
* Utilisation de `gotoxy(x, y)` pour un positionnement précis du texte (affichage de la liste d'adjacence et de la complexité).