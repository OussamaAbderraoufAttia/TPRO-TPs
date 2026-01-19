/* tsp_compare.c
 * Compilation: gcc -O2 -std=c99 tsp_compare.c -o tsp_compare -lm
 *
 * Usage: ./tsp_compare
 *
 * Le programme:
 * - génère des graphes complets (matrices de distances symétriques)
 * - pour chaque n de MIN_N à MAX_N:
 *     - lance la méthode exacte (permutations) si n <= MAX_EXACT_N
 *     - lance Held-Karp (DP bitmask)
 *     - mesure les temps CPU (clock())
 * - affiche un tableau comparatif (n, temps_exact, temps_HK, coût trouvé)
 *
 * ATTENTION: la méthode exacte explose en factorielle. MAX_EXACT_N est petit (<=11).
 */

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <limits.h>
#include <string.h>

#define INFLL LLONG_MAX/4

/* Paramètres que vous pouvez ajuster */
#define SEED 123456
#define MIN_N 2
#define MAX_N 12           /* test jusqu'à 12 (Held-Karp OK, exact lourd) */
#define MAX_EXACT_N 10     /* exécution exacte autorisée (n! croît vite) */
#define TRIALS 3           /* répétitions pour moyennes de temps */
#define MAX_DIST 100

/* ---------- utilitaires ---------- */

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

/* Génère une matrice de distances symétrique avec diagonale 0 */
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

/* Calcule le coût d'un cycle: 0 -> perm[0] -> perm[1] -> ... -> perm[m-1] -> 0
 * Ici perm contient les villes visitées après 0 (par ex. {1,3,2,4}).
 */
long long cycle_cost_from_perm(long long **d, int n, int *perm, int m) {
    long long cost = 0;
    int prev = 0;
    for (int i=0;i<m;i++) {
        int cur = perm[i];
        cost += d[prev][cur];
        prev = cur;
    }
    cost += d[prev][0]; /* retour à 0 */
    return cost;
}

/* ---------- Méthode exacte: énumération des permutations par backtracking ---------- */

/* Variables globales utilisées pour la recherche exhaustive */
long long exact_best_cost;
int *exact_best_perm;
int *used_global;

/* backtrack_perm:
 * - perm: tableau courant d'ordre des villes (taille m = depth)
 * - depth: profondeur actuelle (= nombre de villes déjà placées)
 * - n: nombre total de villes
 */
void backtrack_perm(long long **d, int n, int *perm, int depth) {
    if (depth == n-1) {
        /* perm est complet : calcule coût total du cycle */
        long long cost = cycle_cost_from_perm(d, n, perm, n-1);
        if (cost < exact_best_cost) {
            exact_best_cost = cost;
            for (int i=0;i<n-1;i++) exact_best_perm[i] = perm[i];
        }
        return;
    }
    /* essayer toutes les villes non utilisées (1..n-1) */
    for (int v=1; v<n; v++){
        if (!used_global[v]) {
            used_global[v] = 1;
            perm[depth] = v;
            backtrack_perm(d, n, perm, depth+1);
            used_global[v] = 0;
        }
    }
}

/* wrapper pour la méthode exacte */
long long tsp_exact(long long **d, int n) {
    /* initialisations */
    int m = n-1;
    int *perm = malloc(m * sizeof(int));
    exact_best_perm = malloc(m * sizeof(int));
    used_global = calloc(n, sizeof(int)); /* index 0..n-1 */
    used_global[0] = 1; /* ville 0 fixée comme départ */
    exact_best_cost = INFLL;

    backtrack_perm(d, n, perm, 0);

    free(perm);
    free(used_global);
    free(exact_best_perm);
    return exact_best_cost;
}

/* ---------- Held-Karp (DP bitmask) ---------- */

/* Held-Karp: dp[mask][j] = coût minimal pour partir de 0, visiter l'ensemble 'mask' (qui contient 0),
 * et finir en j (j dans mask). mask est représenté par entiers 0..(1<<n)-1.
 *
 * On n'inclut jamais la ville 0 dans la partie "liste des finis" explicitement: ici on conserve 0 dans mask 
 * pour simplicité.
 *
 * Complexité: O(n^2 * 2^n) en temps et O(n * 2^n) en mémoire.
 */

long long held_karp(long long **d, int n) {
    int Nmask = 1<<n;
    /* dp: tableau (Nmask) x n */
    long long *dp = malloc((size_t)Nmask * n * sizeof(long long));
    if (!dp) {
        fprintf(stderr, "Memoire insuffisante pour dp (n=%d)\n", n);
        exit(1);
    }
    /* indexation: dp[mask * n + j] */
    for (int mask=0; mask<Nmask; mask++){
        for (int j=0;j<n;j++) dp[mask*n + j] = INFLL;
    }

    /* Initialisation: pour tout j != 0, C({0,j}, j) = d(0,j) -> mask with bits 0 and j set */
    for (int j=1;j<n;j++){
        int mask = (1<<0) | (1<<j);
        dp[mask*n + j] = d[0][j];
    }

    /* Itérer sur les tailles croissantes de sous-ensembles */
    for (int mask=0; mask<Nmask; mask++){
        /* si mask ne contient pas 0, on l'ignore */
        if (!(mask & 1)) continue;
        /* pour chaque j tel que j est dans mask et j != 0 */
        for (int j=1;j<n;j++){
            if (!(mask & (1<<j))) continue;
            long long cur = dp[mask*n + j];
            if (cur == INFLL) continue;
            /* on essaie d'étendre le chemin en ajoutant une ville k non encore dans mask */
            for (int k=1;k<n;k++){
                if (mask & (1<<k)) continue;
                int nmask = mask | (1<<k);
                long long cand = cur + d[j][k];
                long long *slot = &dp[nmask*n + k];
                if (cand < *slot) *slot = cand;
            }
        }
    }

    /* solution finale: min_{j!=0} dp[(1<<n)-1][j] + d[j][0] */
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

/* ---------- Mesure de temps et comparaisons ---------- */

double time_seconds_clock(clock_t start, clock_t end) {
    return (double)(end - start) / CLOCKS_PER_SEC;
}

int main() {
    srand(SEED);

    printf("TSP: comparaison Exact (permutations) vs Held-Karp (DP bitmask)\n");
    printf("Instance: graph complet, distances entieres 1..%d (diagonale 0)\n", MAX_DIST);
    printf("Repetitions par instance: %d\n\n", TRIALS);

    printf(" n | exact_time(s) | heldkarp_time(s) | best_cost | note\n");
    printf("--------------------------------------------------------------\n");

    for (int n=MIN_N; n<=MAX_N; n++) {
        double sum_exact = 0.0;
        double sum_hk = 0.0;
        long long last_cost = -1;
        int ran_exact = 1;
        if (n > MAX_EXACT_N) ran_exact = 0;

        for (int t=0;t<TRIALS;t++){
            long long **d = generate_random_complete_graph(n);
            /* Exact */
            if (ran_exact) {
                clock_t s = clock();
                long long cost_exact = tsp_exact(d, n);
                clock_t e = clock();
                double dt = time_seconds_clock(s,e);
                sum_exact += dt;
                last_cost = cost_exact;
            }

            /* Held-Karp */
            clock_t s2 = clock();
            long long cost_hk = held_karp(d, n);
            clock_t e2 = clock();
            double dt2 = time_seconds_clock(s2,e2);
            sum_hk += dt2;
            last_cost = cost_hk; /* store to display */

            free_matrix_int(d, n);
        } /* trials */

        double avg_exact = ran_exact ? (sum_exact / TRIALS) : -1.0;
        double avg_hk = (sum_hk / TRIALS);
        if (ran_exact)
            printf("%2d |   %10.6f  |   %10.6f    |  %8lld | exact OK\n", n, avg_exact, avg_hk, last_cost);
        else
            printf("%2d |       ---     |   %10.6f    |  %8lld | exact skipped\n", n, avg_hk, last_cost);
    }

    return 0;
}