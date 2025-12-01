
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "conio2.h"

#define INF 1000000000
#define NON_VISITE 0
#define EN_COURS 1
#define VISITE 2

// ============================================================
//              STRUCTURES & GRAPH LOGIC
// ============================================================

typedef struct Node {
    int val;
    struct Node* next;
} Node;

void addEdge(Node* graph[], int u, int v) {
    Node* n1 = malloc(sizeof(Node));
    n1->val = v;
    n1->next = graph[u];
    graph[u] = n1;

    Node* n2 = malloc(sizeof(Node));
    n2->val = u;
    n2->next = graph[v];
    graph[v] = n2;
}

int BFS_cycle(Node* graph[], int n, int s) {
    int etat[n];
    int distance[n];
    int parent[n];
    int queue[n];
    int head = 0, tail = 0;

    for (int i = 0; i < n; i++) {
        etat[i] = NON_VISITE;
        distance[i] = INF;
        parent[i] = -1;
    }

    etat[s] = EN_COURS;
    distance[s] = 0;
    queue[tail++] = s;

    int best = INF;

    while (head < tail) {
        int v = queue[head++];
        for (Node* cur = graph[v]; cur != NULL; cur = cur->next) {
            int w = cur->val;

            if (etat[w] == NON_VISITE) {
                etat[w] = EN_COURS;
                distance[w] = distance[v] + 1;
                parent[w] = v;
                queue[tail++] = w;
            }
            else if (etat[w] == EN_COURS && parent[v] != w) {
                int cycle_length = distance[v] + distance[w] + 1;
                if (cycle_length < best)
                    best = cycle_length;
            }
        }
        etat[v] = VISITE;
    }
    return best;
}

int shortestCycle(Node* graph[], int n) {
    int best = INF;
    for (int i = 0; i < n; i++) {
        int cycle = BFS_cycle(graph, n, i);
        if (cycle < best)
            best = cycle;
    }
    return best;
}

// ============================================================
//                    ENHANCED GUI FUNCTIONS
// ============================================================

void drawBox(int x, int y, int width, int height, int color, int bg) {
    textbackground(bg);
    textcolor(color);
    
    // Top border
    gotoxy(x, y);
    putch(201);
    for(int i = 1; i < width-1; i++) putch(205);
    putch(187);
    
    // Middle lines
    for(int i = 1; i < height-1; i++) {
        gotoxy(x, y+i);
        putch(186);
        for(int j = 1; j < width-1; j++) putch(' ');
        putch(186);
    }
    
    // Bottom border
    gotoxy(x, y+height-1);
    putch(200);
    for(int i = 1; i < width-1; i++) putch(205);
    putch(188);
}

void drawShadowBox(int x, int y, int width, int height, int color, int bg) {
    // Draw shadow
    textbackground(BLACK);
    for(int i = 1; i <= height; i++) {
        gotoxy(x+2, y+i);
        for(int j = 0; j < width; j++) putch(176);
    }
    
    // Draw main box
    drawBox(x, y, width, height, color, bg);
}

void animateTitle() {
    char* title = "GRAPH CYCLE ANALYZER";
    int x = 30;
    int y = 2;
    
    textcolor(YELLOW);
    for(int i = 0; i < strlen(title); i++) {
        gotoxy(x + i, y);
        putch(title[i]);
        delay(50);
    }
}

void drawMainInterface() {
    textbackground(BLACK);
    clrscr();
    
    // Draw main border
    textcolor(CYAN);
    textbackground(BLUE);
    
    for(int i = 1; i <= 80; i++) {
        gotoxy(i, 1); putch(219);
        gotoxy(i, 25); putch(219);
    }
    for(int i = 2; i <= 24; i++) {
        gotoxy(1, i); putch(219);
        gotoxy(80, i); putch(219);
    }
    
    textbackground(BLACK);
    
    // Animated title
    animateTitle();
    
    // Draw subtitle
    gotoxy(25, 3);
    textcolor(LIGHTGRAY);
    cprintf("Plus Court Cycle - BFS Algorithm");
    
    // Draw decorative line
    textcolor(DARKGRAY);
    for(int i = 3; i <= 77; i++) {
        gotoxy(i, 4);
        putch(196);
    }
}

void displayGraphSection(Node* graph[], int n) {
    drawShadowBox(3, 6, 35, 12, WHITE, BLUE);
    
    gotoxy(12, 7);
    textbackground(BLUE);
    textcolor(YELLOW);
    cprintf("STRUCTURE DU GRAPHE");
    
    textcolor(LIGHTCYAN);
    int y = 9;
    for (int i = 0; i < n && i < 8; i++) {
        gotoxy(5, y + i);
        textbackground(BLUE);
        cprintf("Sommet [%d] -> ", i);
        
        textcolor(WHITE);
        Node* curr = graph[i];
        int count = 0;
        while(curr != NULL && count < 5) {
            cprintf("%d", curr->val);
            curr = curr->next;
            if(curr) cprintf(", ");
            count++;
        }
        if(curr != NULL) cprintf("...");
    }
}

void displayComplexitySection() {
    drawShadowBox(42, 6, 36, 8, WHITE, MAGENTA);
    
    gotoxy(50, 7);
    textbackground(MAGENTA);
    textcolor(YELLOW);
    cprintf("COMPLEXITE TEMPORELLE");
    
    textcolor(WHITE);
    gotoxy(44, 9);
    cprintf("Notation Big-O: O(V * (V + E))");
    
    textcolor(LIGHTGREEN);
    gotoxy(44, 11);
    cprintf("V = Nombre de sommets: %d", 6);
    gotoxy(44, 12);
    cprintf("E = Nombre d'aretes");
}

void displayAlgorithmSection() {
    drawShadowBox(42, 15, 36, 8, WHITE, GREEN);
    
    gotoxy(50, 16);
    textbackground(GREEN);
    textcolor(YELLOW);
    cprintf("METHODE UTILISEE");
    
    textcolor(WHITE);
    gotoxy(44, 18);
    cprintf("1. BFS depuis chaque sommet");
    gotoxy(44, 19);
    cprintf("2. Detection de cycles");
    gotoxy(44, 20);
    cprintf("3. Calcul de longueur minimale");
}

void displayStatisticsBox(int vertices, int edges) {
    drawShadowBox(3, 19, 35, 5, WHITE, CYAN);
    
    gotoxy(10, 20);
    textbackground(CYAN);
    textcolor(YELLOW);
    cprintf("STATISTIQUES DU GRAPHE");
    
    textcolor(BLACK);
    gotoxy(5, 22);
    cprintf("Sommets: %d  |  Aretes: %d", vertices, edges);
}

void animateProcessing() {
    int x = 30, y = 12;
    char spinner[] = {'|', '/', '-', '\\'};
    
    textcolor(YELLOW);
    for(int i = 0; i < 12; i++) {
        gotoxy(x, y);
        textbackground(BLACK);
        cprintf("Traitement en cours %c", spinner[i % 4]);
        delay(100);
    }
}

void displayResult(int result) {
    // Clear previous content
    for(int i = 6; i < 24; i++) {
        gotoxy(3, i);
        textbackground(BLACK);
        for(int j = 0; j < 75; j++) putch(' ');
    }
    
    // Draw result box with animation
    int width = 50;
    int height = 10;
    int x = 15;
    int y = 10;
    
    // Animated border drawing
    textbackground(RED);
    textcolor(YELLOW);
    
    // Top
    gotoxy(x, y);
    putch(201);
    for(int i = 1; i < width-1; i++) {
        putch(205);
        delay(10);
    }
    putch(187);
    
    // Sides
    for(int i = 1; i < height-1; i++) {
        gotoxy(x, y+i);
        putch(186);
        gotoxy(x+width-1, y+i);
        putch(186);
        delay(20);
    }
    
    // Bottom
    gotoxy(x, y+height-1);
    putch(200);
    for(int i = 1; i < width-1; i++) {
        putch(205);
        delay(10);
    }
    putch(188);
    
    // Fill background
    for(int i = 1; i < height-1; i++) {
        for(int j = 1; j < width-1; j++) {
            gotoxy(x+j, y+i);
            putch(' ');
        }
    }
    
    // Display title
    gotoxy(x + 15, y + 2);
    textcolor(WHITE);
    cprintf("RESULTAT FINAL");
    
    // Display result value
    gotoxy(x + 5, y + 5);
    textcolor(YELLOW);
    if (result == INF) {
        cprintf("Aucun cycle trouve dans le graphe!");
    } else {
        cprintf("Plus court cycle: ");
        textcolor(LIGHTGREEN);
        cprintf("%d aretes", result);
    }
    
    // Draw decorative elements
    textcolor(LIGHTRED);
    for(int i = 0; i < width-2; i++) {
        gotoxy(x + 1 + i, y + 7);
        putch(196);
    }
}

int countEdges(Node* graph[], int n) {
    int count = 0;
    for(int i = 0; i < n; i++) {
        Node* curr = graph[i];
        while(curr != NULL) {
            if(curr->val > i) count++; // Count each edge once
            curr = curr->next;
        }
    }
    return count;
}

void displayProgressBar(int current, int total) {
    int barWidth = 40;
    int x = 20;
    int y = 22;
    
    gotoxy(x, y);
    textbackground(BLACK);
    textcolor(CYAN);
    cprintf("Progression: [");
    
    int filled = (current * barWidth) / total;
    textcolor(LIGHTGREEN);
    for(int i = 0; i < filled; i++) putch(219);
    
    textcolor(DARKGRAY);
    for(int i = filled; i < barWidth; i++) putch(176);
    
    textcolor(CYAN);
    cprintf("] %d%%", (current * 100) / total);
}

// ============================================================
//                         MAIN
// ============================================================

int main() {
    // Initialize Graph
    int n = 6;
    Node* graph[n];
    for (int i = 0; i < n; i++) graph[i] = NULL;

    // Create graph structure (hexagon with diagonals)
    addEdge(graph, 0, 1);
    addEdge(graph, 1, 2);
    addEdge(graph, 2, 3);
    addEdge(graph, 3, 4);
    addEdge(graph, 4, 5);
    addEdge(graph, 5, 0);
    addEdge(graph, 1, 4);
    addEdge(graph, 2, 4);

    int edges = countEdges(graph, n);

    // Draw main interface
    drawMainInterface();
    
    delay(500);
    
    // Display all sections
    displayGraphSection(graph, n);
    delay(300);
    
    displayComplexitySection();
    delay(300);
    
    displayAlgorithmSection();
    delay(300);
    
    displayStatisticsBox(n, edges);
    
    // Wait for user
    gotoxy(20, 24);
    textbackground(BLACK);
    textcolor(LIGHTGRAY);
    cprintf("Appuyez sur ENTREE pour demarrer le calcul...");
    getch();
    
    // Show processing animation
    animateProcessing();
    
    // Simulate progress
    for(int i = 0; i <= n; i++) {
        displayProgressBar(i, n);
        delay(200);
    }
    
    delay(500);
    
    // Calculate result
    int result = shortestCycle(graph, n);
    
    // Display result
    displayResult(result);
    
    // Exit prompt
    gotoxy(25, 24);
    textbackground(BLACK);
    textcolor(WHITE);
    cprintf("Appuyez sur une touche pour quitter...");
    getch();
    
    // Cleanup
    textbackground(BLACK);
    textcolor(LIGHTGRAY);
    clrscr();
    
    // Free memory
    for(int i = 0; i < n; i++) {
        Node* curr = graph[i];
        while(curr != NULL) {
            Node* temp = curr;
            curr = curr->next;
            free(temp);
        }
    }

    return 0;
}