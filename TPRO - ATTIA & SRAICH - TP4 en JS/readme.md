# 🌐 TP1: Taquin 15 - Visualisation Web Interactive

**Module :** TPRO (Théorie de Programmation et Recherche Opérationnelle)  
**Année Universitaire :** 2025-2026  
**Encadré par :** M. HADIM Boukhalfa  

**Réalisé par :**
* **ATTIA Oussama Abderraouf**
* **SRAICH Imene**

---

## ℹ️ Introduction
Cette version Web du TP4 sur le **Taquin 15** complète l'implémentation en langage C par une interface interactive et dynamique. Elle permet de visualiser l'exécution des algorithmes A* et WA* étape par étape.

L'objectif est de fournir un support pédagogique pour comprendre l'impact des heuristiques (Manhattan vs Jetons mal placés) et du paramètre de pondération $p$.

---

## 💻 Architecture Technique

Le projet est une application web front-end moderne utilisant :
- **HTML5/CSS3** : Pour une interface en mode sombre (Dark Mode) élégante et ergonomique.
- **JavaScript (ES6+)** : Pour la logique algorithmique et le moteur de recherche.
- **Font Awesome** : Pour l'iconographie des contrôles.

---

## 🎨 Fonctionnalités de l'Interface

### 1. Configuration de l'Algorithme
- **Heuristique** : Choix entre la Distance de Manhattan et les Jetons mal placés.
- **Poids WA* (p)** : Curseur permettant d'ajuster l'agressivité de la recherche (de 1.0 à 10.0).
- **Vitesse d'Animation** : Contrôle du délai entre chaque déplacement visuel.

### 2. Contrôles de la Grille
- **Mélanger** : Génère une configuration aléatoire (garantie solvable par mouvements successifs).
- **Résoudre** : Lance le solver et anime le chemin trouvé.
- **Reset** : Remet la grille dans l'état initial ordonné.

---

## 🔎 Implémentation Algorithmique

### 1. Recherche Heuristique
Le solver utilise l'algorithme A* avec une gestion efficace de la frontière via un **Tas Binaire (Min-Heap)** implémenté en JavaScript. Cela garantit une réactivité immédiate même pour des résolutions demandant des milliers de nœuds.

### 2. Analyse des Performances
Tout comme la version C, la version Web affiche en temps réel les métriques critiques :
- **Temps d'exécution** : Mesuré avec `performance.now()`.
- **Nombre de nœuds explorés** : Compteur d'expansion.
- **Profondeur de la solution** : Longueur du chemin trouvé.

---

## 📈 Guide d'Utilisation
1. Ouvrez `index.html` dans n'importe quel navigateur moderne.
2. Cliquez sur **Mélanger**.
3. Sélectionnez l'heuristique **Distance de Manhattan**.
4. Cliquez sur **Résoudre** pour voir l'animation du puzzle se résoudre automatiquement.
