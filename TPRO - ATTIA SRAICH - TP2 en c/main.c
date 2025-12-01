/* tsp_compare_conio.c
 * Compilation: gcc -O2 -std=c99 tsp_compare_conio.c -o tsp_compare_conio -lm
 *
 * Usage: ./tsp_compare_conio
 *
 * Programme TSP avec présentation graphique via conio2
 */

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <limits.h>
#include <string.h>
#include "conio2.h"

#define INFLL LLONG_MAX/4

/* Paramètres */
#define SEED 123456
#define MIN_N 2
#define MAX_N 12
#define MAX_EXACT_N 10
#define TRIALS 3
#define MAX_DIST 100

/* Couleurs */
#define COLOR_TITLE YELLOW
#define COLOR_HEADER CYAN
#define COLOR_DATA WHITE
#define COLOR_HIGHLIGHT LIGHTGREEN
#define COLOR_WARNING LIGHTRED
#define COLOR_BORDER LIGHTBLUE

/* ---------- Utilitaires ---------- */

long long **alloc_matrix_int(int n) {
    long long **m = malloc(n * sizeof(long long*));
    for (int i=0;i<n;i++){
        m[i] = malloc(n * sizeof(long long));
    }
    return m;
}

void free_matrix_int(long long **m, int n){
    for (int i=0;i<n;i++) free(m[i]);
    free(m);
}

long long **generate_random_complete_graph(int n) {
    long long **d = alloc_matrix_int(n);
    for (int i=0;i<n;i++){
        for (int j=0;j<n;j++){
            if (i==j) d[i][j]=0;
            else if (j<i) d[i][j]=d[j][i];
            else d[i][j] = 1 + rand()%MAX_DIST;
        }
    }
    return d;
}

long long cycle_cost_from_perm(long long **d, int n, int *perm, int m) {
    long long cost = 0;
    int prev = 0;
    for (int i=0;i<m;i++) {
        int cur = perm[i];
        cost += d[prev][cur];
        prev = cur;
    }
    cost += d[prev][0];
    return cost;
}

/* ---------- Méthode exacte ---------- */

long long exact_best_cost;
int *exact_best_perm;
int *used_global;

void backtrack_perm(long long **d, int n, int *perm, int depth) {
    if (depth == n-1) {
        long long cost = cycle_cost_from_perm(d, n, perm, n-1);
        if (cost < exact_best_cost) {
            exact_best_cost = cost;
            for (int i=0;i<n-1;i++) exact_best_perm[i] = perm[i];
        }
        return;
    }
    for (int v=1; v<n; v++){
        if (!used_global[v]) {
            used_global[v] = 1;
            perm[depth] = v;
            backtrack_perm(d, n, perm, depth+1);
            used_global[v] = 0;
        }
    }
}

long long tsp_exact(long long **d, int n) {
    int m = n-1;
    int *perm = malloc(m * sizeof(int));
    exact_best_perm = malloc(m * sizeof(int));
    used_global = calloc(n, sizeof(int));
    used_global[0] = 1;
    exact_best_cost = INFLL;

    backtrack_perm(d, n, perm, 0);

    free(perm);
    free(used_global);
    free(exact_best_perm);
    return exact_best_cost;
}

/* ---------- Held-Karp ---------- */

long long held_karp(long long **d, int n) {
    int Nmask = 1<<n;
    long long *dp = malloc((size_t)Nmask * n * sizeof(long long));
    if (!dp) {
        fprintf(stderr, "Memoire insuffisante pour dp (n=%d)\n", n);
        exit(1);
    }
    
    for (int mask=0; mask<Nmask; mask++){
        for (int j=0;j<n;j++) dp[mask*n + j] = INFLL;
    }

    for (int j=1;j<n;j++){
        int mask = (1<<0) | (1<<j);
        dp[mask*n + j] = d[0][j];
    }

    for (int mask=0; mask<Nmask; mask++){
        if (!(mask & 1)) continue;
        for (int j=1;j<n;j++){
            if (!(mask & (1<<j))) continue;
            long long cur = dp[mask*n + j];
            if (cur == INFLL) continue;
            for (int k=1;k<n;k++){
                if (mask & (1<<k)) continue;
                int nmask = mask | (1<<k);
                long long cand = cur + d[j][k];
                long long *slot = &dp[nmask*n + k];
                if (cand < *slot) *slot = cand;
            }
        }
    }

    int full = (1<<n) - 1;
    long long best = INFLL;
    for (int j=1;j<n;j++){
        long long val = dp[full*n + j];
        if (val == INFLL) continue;
        long long total = val + d[j][0];
        if (total < best) best = total;
    }
    free(dp);
    return best;
}

/* ---------- Fonctions Conio2 ---------- */

void draw_box(int x1, int y1, int x2, int y2, int color) {
    textcolor(color);
    gotoxy(x1, y1); cprintf("%c", 201);
    gotoxy(x2, y1); cprintf("%c", 187);
    gotoxy(x1, y2); cprintf("%c", 200);
    gotoxy(x2, y2); cprintf("%c", 188);
    
    for (int i = x1+1; i < x2; i++) {
        gotoxy(i, y1); cprintf("%c", 205);
        gotoxy(i, y2); cprintf("%c", 205);
    }
    for (int i = y1+1; i < y2; i++) {
        gotoxy(x1, i); cprintf("%c", 186);
        gotoxy(x2, i); cprintf("%c", 186);
    }
}

void display_title() {
    clrscr();
    textcolor(COLOR_TITLE);
    textbackground(BLUE);
    gotoxy(15, 2);
    cprintf("====================================================");
    gotoxy(15, 3);
    cprintf("      COMPARAISON TSP: EXACT vs HELD-KARP         ");
    gotoxy(15, 4);
    cprintf("====================================================");
    textbackground(BLACK);
    
    textcolor(COLOR_DATA);
    gotoxy(10, 6);
    cprintf("Instance: Graphe complet, distances 1..%d", MAX_DIST);
    gotoxy(10, 7);
    cprintf("Repetitions par instance: %d", TRIALS);
    gotoxy(10, 8);
    cprintf("Plage de n: %d a %d", MIN_N, MAX_N);
}

void display_table_header(int start_y) {
    textcolor(COLOR_HEADER);
    textbackground(BLUE);
    gotoxy(5, start_y);
    cprintf(" n ");
    gotoxy(10, start_y);
    cprintf(" Exact (s) ");
    gotoxy(24, start_y);
    cprintf(" Held-Karp (s) ");
    gotoxy(42, start_y);
    cprintf(" Cout ");
    gotoxy(52, start_y);
    cprintf(" Statut ");
    textbackground(BLACK);
    
    textcolor(COLOR_BORDER);
    gotoxy(3, start_y+1);
    for (int i=0; i<70; i++) cprintf("-");
}

void display_progress(int n, int current_trial, int total_trials, int y_pos) {
    textcolor(COLOR_HIGHLIGHT);
    gotoxy(5, y_pos);
    cprintf(">>> Traitement n=%d [%d/%d]", n, current_trial, total_trials);
    
    int bar_width = 30;
    int filled = (bar_width * current_trial) / total_trials;
    gotoxy(40, y_pos);
    cprintf("[");
    for (int i=0; i<bar_width; i++) {
        if (i < filled) cprintf("%c", 219);
        else cprintf(" ");
    }
    cprintf("]");
}

void display_result_row(int n, double avg_exact, double avg_hk, long long cost, int ran_exact, int row_y) {
    textcolor(COLOR_DATA);
    gotoxy(5, row_y);
    cprintf("%2d", n);
    
    gotoxy(10, row_y);
    if (ran_exact) {
        if (avg_exact < 0.001) textcolor(LIGHTGREEN);
        else if (avg_exact < 1.0) textcolor(YELLOW);
        else textcolor(LIGHTRED);
        cprintf("%10.6f", avg_exact);
    } else {
        textcolor(COLOR_WARNING);
        cprintf("   ---    ");
    }
    
    gotoxy(24, row_y);
    if (avg_hk < 0.001) textcolor(LIGHTGREEN);
    else if (avg_hk < 1.0) textcolor(YELLOW);
    else textcolor(LIGHTRED);
    cprintf("%10.6f", avg_hk);
    
    textcolor(COLOR_DATA);
    gotoxy(42, row_y);
    cprintf("%8lld", cost);
    
    gotoxy(52, row_y);
    if (ran_exact) {
        textcolor(LIGHTGREEN);
        cprintf("OK");
    } else {
        textcolor(COLOR_WARNING);
        cprintf("Skipped");
    }
}

double time_seconds_clock(clock_t start, clock_t end) {
    return (double)(end - start) / CLOCKS_PER_SEC;
}

/* ---------- Main ---------- */

int main() {
    srand(SEED);
    
    display_title();
    
    int table_start_y = 11;
    display_table_header(table_start_y);
    
    int current_row = table_start_y + 2;
    int progress_y = 24;
    
    for (int n=MIN_N; n<=MAX_N; n++) {
        double sum_exact = 0.0;
        double sum_hk = 0.0;
        long long last_cost = -1;
        int ran_exact = (n <= MAX_EXACT_N);

        for (int t=0; t<TRIALS; t++){
            display_progress(n, t+1, TRIALS, progress_y);
            
            long long **d = generate_random_complete_graph(n);
            
            if (ran_exact) {
                clock_t s = clock();
                long long cost_exact = tsp_exact(d, n);
                clock_t e = clock();
                double dt = time_seconds_clock(s, e);
                sum_exact += dt;
                last_cost = cost_exact;
            }

            clock_t s2 = clock();
            long long cost_hk = held_karp(d, n);
            clock_t e2 = clock();
            double dt2 = time_seconds_clock(s2, e2);
            sum_hk += dt2;
            last_cost = cost_hk;

            free_matrix_int(d, n);
        }

        double avg_exact = ran_exact ? (sum_exact / TRIALS) : -1.0;
        double avg_hk = (sum_hk / TRIALS);
        
        display_result_row(n, avg_exact, avg_hk, last_cost, ran_exact, current_row);
        current_row++;
    }
    
    textcolor(COLOR_HIGHLIGHT);
    gotoxy(5, progress_y);
    cprintf(">>> Traitement termine!                                        ");
    
    draw_box(2, 10, 78, current_row + 1, COLOR_BORDER);
    
    textcolor(COLOR_DATA);
    gotoxy(20, current_row + 3);
    cprintf("Appuyez sur une touche pour quitter...");
    
    getch();
    
    textcolor(WHITE);
    textbackground(BLACK);
    clrscr();
    
    return 0;
}