#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <math.h>
#include "conio2.h"

// Configuration
#define MAX_NODES 1000000
#define WEIGHT_P 1.5

// Types
typedef char conf[4][4];

struct noeud {
    conf m;
    int g;        // g(x)
    int h;        // h(x)
    double cout;  // f(x) = g(x) + p*h(x)
    struct noeud *pere;
};

// Priority Queue (Min-Heap)
typedef struct {
    struct noeud **tab;
    int nbElem;
} Heap;

// Metrics
typedef struct {
    long nodesExpanded;
    int maxFrontier;
    double timeTaken;
    int solutionDepth;
} Metrics;

// Global Solution state
conf but = {
    {1, 2, 3, 4},
    {5, 6, 7, 8},
    {9, 10, 11, 12},
    {13, 14, 15, 0}
};

// --- Heap Functions ---

void swap(struct noeud **a, struct noeud **b) {
    struct noeud *tmp = *a;
    *a = *b;
    *b = tmp;
}

void heapifyUp(Heap *h, int idx) {
    while (idx > 0) {
        int p = (idx - 1) / 2;
        if (h->tab[idx]->cout < h->tab[p]->cout) {
            swap(&h->tab[idx], &h->tab[p]);
            idx = p;
        } else break;
    }
}

void heapifyDown(Heap *h, int idx) {
    while (1) {
        int l = 2 * idx + 1;
        int r = 2 * idx + 2;
        int minIdx = idx;
        if (l < h->nbElem && h->tab[l]->cout < h->tab[minIdx]->cout) minIdx = l;
        if (r < h->nbElem && h->tab[r]->cout < h->tab[minIdx]->cout) minIdx = r;
        if (minIdx != idx) {
            swap(&h->tab[idx], &h->tab[minIdx]);
            idx = minIdx;
        } else break;
    }
}

void HeapPush(Heap *h, struct noeud *n) {
    if (h->nbElem >= MAX_NODES) return;
    h->tab[h->nbElem] = n;
    heapifyUp(h, h->nbElem);
    h->nbElem++;
}

struct noeud* HeapPop(Heap *h) {
    if (h->nbElem == 0) return NULL;
    struct noeud *root = h->tab[0];
    h->nbElem--;
    if (h->nbElem > 0) {
        h->tab[0] = h->tab[h->nbElem];
        heapifyDown(h, 0);
    }
    return root;
}

// --- Heuristics ---

int h_misplaced(conf m) {
    int count = 0;
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4; j++) {
            if (m[i][j] != 0 && m[i][j] != but[i][j]) count++;
        }
    }
    return count;
}

int h_manhattan(conf m) {
    int dist = 0;
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4; j++) {
            int val = m[i][j];
            if (val != 0) {
                int targetI = (val - 1) / 4;
                int targetJ = (val - 1) % 4;
                dist += abs(i - targetI) + abs(j - targetJ);
            }
        }
    }
    return dist;
}

// --- Utils ---

void pos_vide(conf m, int *iv, int *jv) {
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4; j++) {
            if (m[i][j] == 0) { *iv = i; *jv = j; return; }
        }
    }
}

int solve_state(struct noeud *e) {
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4; j++) {
            if (e->m[i][j] != but[i][j]) return 0;
        }
    }
    return 1;
}

int test_conf(conf m1, conf m2) {
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4; j++) {
            if (m1[i][j] != m2[i][j]) return 0;
        }
    }
    return 1;
}

int exists_in_path(struct noeud *v, struct noeud *ch) {
    struct noeud *p = ch;
    while (p != NULL) {
        if (test_conf(v->m, p->m)) return 1;
        p = p->pere;
    }
    return 0;
}

// --- Search ---

Metrics run_WA_star(conf initial, int useManhattan, double p_weight) {
    Heap h;
    h.tab = malloc(MAX_NODES * sizeof(struct noeud *));
    h.nbElem = 0;

    Metrics met = {0, 0, 0.0, 0};
    clock_t start = clock();

    struct noeud *root = malloc(sizeof(struct noeud));
    memcpy(root->m, initial, sizeof(conf));
    root->g = 0;
    root->h = useManhattan ? h_manhattan(root->m) : h_misplaced(root->m);
    root->cout = root->g + p_weight * root->h;
    root->pere = NULL;

    HeapPush(&h, root);

    while (h.nbElem > 0) {
        if (h.nbElem > met.maxFrontier) met.maxFrontier = h.nbElem;

        struct noeud *e = HeapPop(&h);
        met.nodesExpanded++;

        if (solve_state(e)) {
            met.timeTaken = (double)(clock() - start) / CLOCKS_PER_SEC;
            met.solutionDepth = e->g;
            // Note: In a complete implementation we'd free the memory, 
            // but for a benchmark we might want to keep the tree or just return metrics.
            free(h.tab);
            return met;
        }

        int iv, jv;
        pos_vide(e->m, &iv, &jv);

        int di[] = {-1, 1, 0, 0};
        int dj[] = {0, 0, -1, 1};

        for (int k = 0; k < 4; k++) {
            int ni = iv + di[k];
            int nj = jv + dj[k];

            if (ni >= 0 && ni < 4 && nj >= 0 && nj < 4) {
                struct noeud *v = malloc(sizeof(struct noeud));
                memcpy(v->m, e->m, sizeof(conf));
                v->m[iv][jv] = e->m[ni][nj];
                v->m[ni][nj] = 0;

                if (!exists_in_path(v, e)) {
                    v->g = e->g + 1;
                    v->h = useManhattan ? h_manhattan(v->m) : h_misplaced(v->m);
                    v->cout = v->g + p_weight * v->h;
                    v->pere = e;
                    HeapPush(&h, v);
                } else {
                    free(v);
                }
            }
        }
    }

    free(h.tab);
    met.timeTaken = (double)(clock() - start) / CLOCKS_PER_SEC;
    return met;
}

// --- UI & Main ---

void draw_box(int x1, int y1, int x2, int y2, int color) {
    textcolor(color);
    gotoxy(x1, y1); cprintf("%c", 201);
    gotoxy(x2, y1); cprintf("%c", 187);
    gotoxy(x1, y2); cprintf("%c", 200);
    gotoxy(x2, y2); cprintf("%c", 188);
    for (int i = x1 + 1; i < x2; i++) {
        gotoxy(i, y1); cprintf("%c", 205);
        gotoxy(i, y2); cprintf("%c", 205);
    }
    for (int i = y1 + 1; i < y2; i++) {
        gotoxy(x1, i); cprintf("%c", 186);
        gotoxy(x2, i); cprintf("%c", 186);
    }
}

void display_header() {
    clrscr();
    draw_box(2, 1, 78, 5, LIGHTBLUE);
    textcolor(YELLOW);
    gotoxy(25, 2); cprintf("TP4: TAQUIN 15 - BENCHMARKING");
    textcolor(WHITE);
    gotoxy(20, 3); cprintf("Algorithmes: A* vs WA* | Heuristiques: Tiles vs Manhattan");
    gotoxy(22, 4); cprintf("Equipe: ATTIA Oussama & SRAICH Imene");
}

void display_results_table(int start_y) {
    textcolor(CYAN);
    gotoxy(5, start_y);     cprintf("Algo (p)");
    gotoxy(15, start_y);    cprintf("Heuristic");
    gotoxy(28, start_y);    cprintf("Time(s)");
    gotoxy(38, start_y);    cprintf("Nodes");
    gotoxy(48, start_y);    cprintf("Frontier");
    gotoxy(60, start_y);    cprintf("Depth");
    
    textcolor(LIGHTGRAY);
    gotoxy(3, start_y + 1);
    for (int i = 0; i < 74; i++) cprintf("-");
}

void add_result_row(int row, const char* algo, const char* heur, Metrics m) {
    textcolor(WHITE);
    gotoxy(5, row);  cprintf("%s", algo);
    gotoxy(15, row); cprintf("%s", heur);
    
    if (m.timeTaken < 0.1) textcolor(LIGHTGREEN);
    else if (m.timeTaken < 1.0) textcolor(YELLOW);
    else textcolor(LIGHTRED);
    gotoxy(28, row); cprintf("%.4f", m.timeTaken);
    
    textcolor(WHITE);
    gotoxy(38, row); cprintf("%ld", m.nodesExpanded);
    gotoxy(48, row); cprintf("%d", m.maxFrontier);
    gotoxy(60, row); cprintf("%d", m.solutionDepth);
}

int main() {
    srand(time(NULL));
    display_header();

    conf init1 = {
        {2, 6, 10, 4},
        {9, 0, 3, 8},
        {1, 5, 7, 12},
        {13, 14, 11, 15}
    };

    int table_y = 8;
    display_results_table(table_y);
    int current_row = table_y + 2;

    // Test Cases
    struct {
        char* name;
        int useManhattan;
        double p;
    } configs[] = {
        {"A*", 0, 1.0},
        {"A*", 1, 1.0},
        {"WA*", 0, 1.5},
        {"WA*", 1, 1.5},
        {"WA*", 1, 3.0},
        {"WA*", 1, 5.0}
    };

    for (int i = 0; i < 6; i++) {
        gotoxy(5, 24); textcolor(LIGHTGREEN);
        cprintf("Running %s with %s...", configs[i].name, configs[i].useManhattan ? "Manhattan" : "Tiles");
        
        Metrics m = run_WA_star(init1, configs[i].useManhattan, configs[i].p);
        
        char algo_p[10];
        if (configs[i].p == 1.0) strcpy(algo_p, "A*");
        else sprintf(algo_p, "WA*(%.1f)", configs[i].p);
        
        add_result_row(current_row++, algo_p, configs[i].useManhattan ? "Manhattan" : "Tiles", m);
    }

    textcolor(YELLOW);
    gotoxy(5, 24); cprintf("Benchmarking complete! Press any key to exit.         ");
    draw_box(2, 7, 78, current_row + 1, LIGHTBLUE);
    
    getch();
    clrscr();
    return 0;
}
