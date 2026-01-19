/* 
    TP : Probleme du taquin a 15 jetons (puzzle 4x4) / Algo A* et WA*
    Dans la version actuelle du programme, on a l'algorithme A* pour le taquin 4x4 incluant entre autre :
    - implémentation naive de la file de priorité (défielemnt en O(n) / enfilement en O(1))
    - fonction heuristique h(x) : nb de jetons mal placés dans la config x par rapport à la config solution

    TODO:
    - Implémentation efficace de la file de priorité: à l'aide d'un heap (tas) (O(log n))
    - Ajouter une autre fonction heuristique basée sur la somme des distances de manhattan des jetons mal placés
      (éventuellement d'autres fonctions heuristiques aussi)
    - Implémenter WA* (WA* c'est A* avec f(x) = g(x) + p*h(x) et p>1)
    - Effectuer des tests (à partir de plusieurs configurations initiales de votre choix) pour comparer les performances :
        influence du heap, influence de la fonction heuristique, influence du paramètre p pour WA*
      Voici quelques exemples de métriques pour les tests :
        temps d'exécution, nombre de noeuds explorés, taille max de la frontière d'exploration, qualité de la solution ...

      Hidouci & Hadim - TPRO 2CS - ESI 2025
*/



#include <stdio.h>
#include <stdlib.h>


// Taille de la file de priorité (pour une implémentation statique)
#define MAXFILE 50000000


// une configuration = matrice de 4x4 de caractères
typedef char conf[4][4];

// un noeud est une config avec quelques information en plus ...
struct noeud {
   conf m;
   int g;        // g(x)
   int h;        // h(x)
   double cout;  // f(x)
   struct noeud *pere;  // pour garder la trace du chemin de la racine au but
};

// la file de priorite de chemins
typedef struct tfile {	
   struct noeud **tab;    // Tableau sequentiel de noeuds
   int nbElem;	          // nombre d'éléments dans la file
} TypeFile;


void A_star( struct noeud *rac );
int test_conf( conf m1, conf m2 );
int Existe_dans_chemin(struct noeud *e, struct noeud *ch);
void CreerFile( TypeFile *f );
void Enfiler( TypeFile *f, struct noeud *x );
void Defiler( TypeFile *f, struct noeud **x );
int FileVide( TypeFile *f );
void Affich_sol( struct noeud *x );
int etat_sol( struct noeud *e );
void pos_vide(conf m , int *iv, int *jv);	   
double estimation( struct noeud *e );
double fonc_h( conf mat );		// la fonction d'estimation: nb de jeton mal places


/* configuration solution (but)
            | a | b | c | d |
            |---|---|---|---|
            | e | f | g | h |
            |---|---|---|---|
            | i | j | k | l |
            |---|---|---|---|
            | m | n | o |   |
*/
conf but = {
             1 , 2 , 3 , 4 ,
             5 , 6 , 7 , 8 ,
             9 , 10, 11, 12,
             13, 14, 15, 0
           };


/* exemple de configurations initiales :  */

/* init1 :
            | b | f | j | d |
            |---|---|---|---|
            | i |   | c | h |
            |---|---|---|---|
            | a | e | g | l |
            |---|---|---|---|
            | m | n | k | o |
*/
conf init1 = {
               2 , 6 , 10, 4 ,
               9 , 0 , 3 , 8 ,
               1 , 5 , 7 , 12,
               13, 14, 11, 15
             };

/* init2 :
            | i |   | f | j |
            |---|---|---|---|
            | c | b | l | d |
            |---|---|---|---|
            | a | e | h | g |
            |---|---|---|---|
            | m | n | k | o |
*/
conf init2 = {
               9 , 0 , 6 , 10 ,
               3 , 2 , 12 , 4 ,
               1 , 5 , 8 ,  7 ,
               13, 14, 11, 15
             };




int main( int argc, char *argv[] )
{

    struct noeud *p;

    int i,j , pf;
    
    p = malloc( sizeof(struct noeud) );

    for (i=0; i<4; i++)
        for( j=0; j<4; j++ )
            p->m[i][j] = init2[i][j];     // ou init2 ou ...

    p->g = 0;
    p->h = fonc_h( p->m );
    p->pere = NULL;

    // recherche d'une solution optimale avec A* ...'
    A_star( p ); 
    
    return 0;
 
}  // main



void A_star( struct noeud *rac )
{
   TypeFile f;
   struct noeud *e;
   int i, j, iv, jv, k, stop;
   long cpt = 0;
   char rep[10];
   
   struct noeud *v[4];
   
   CreerFile( &f );
   rac->cout = estimation( rac );
   Enfiler(&f, rac);
   stop = 0;
   while ( !FileVide( &f ) && !stop ) {
       
	  Defiler( &f, &e );
	
	  if ( etat_sol( e ) ) {
	     Affich_sol( e );
         printf("Cout = %d\n", e->g);
         stop = 1;
	  }
	  else {
	     // enfiler les successeurs ...
	   
         // trouve les coordonnees (iv,jv) de la case vide dans la grille e->m
         pos_vide(e->m , &iv, &jv);

         // generer les differents deplacements possible (max 4 depl)
	     k = 0;
         if (iv > 0) {  // du haut vers le bas
             v[k] = malloc( sizeof(struct noeud) );
             for (i=0; i<4; i++)
                 for (j=0; j<4; j++)
                     v[k]->m[i][j] = e->m[i][j];
              
             v[k]->m[iv][jv] = e->m[iv-1][jv];
             v[k]->m[iv-1][jv] = 0;
              
             k++;
         }

         if (iv < 4-1) {  // du bas vers le haut
             v[k] = malloc( sizeof(struct noeud) );
             for (i=0; i<4; i++)
                 for (j=0; j<4; j++)
                     v[k]->m[i][j] = e->m[i][j];
              
             v[k]->m[iv][jv] = e->m[iv+1][jv];
             v[k]->m[iv+1][jv] = 0;
              
             k++;
         }

         if (jv > 0) {  // de la gauche vers la droite
             v[k] = malloc( sizeof(struct noeud) );
             for (i=0; i<4; i++)
                 for (j=0; j<4; j++)
                     v[k]->m[i][j] = e->m[i][j];
              
             v[k]->m[iv][jv] = e->m[iv][jv-1];
             v[k]->m[iv][jv-1] = 0;
              
             k++;
         }

         if (jv < 4-1) {  // de la droite vers la gauche
             v[k] = malloc( sizeof(struct noeud) );
             for (i=0; i<4; i++)
                 for (j=0; j<4; j++)
                     v[k]->m[i][j] = e->m[i][j];

             v[k]->m[iv][jv] = e->m[iv][jv+1];
             v[k]->m[iv][jv+1] = 0;
              
             k++;
         }
           
         // Enfiler les successeurs non encore visites
         for (j=0; j<k; j++)
             if ( !Existe_dans_chemin(v[j],e) )  {
                 v[j]->g = e->g + 1;
                 v[j]->h = fonc_h( v[j]->m );
                 v[j]->pere = e;
                 v[j]->cout = estimation( v[j] );
                 
		         Enfiler( &f, v[j] );
	         }
	         else {
	           
	             free( v[j] );
	         }
	      
      } // fin else
        
        
   } // fin while 
	      
} // A_star


void Affich_sol( struct noeud *e )
{
    int i,j;
    struct noeud *p;

    p = e;
    while ( p != NULL ) {
        printf("\t\t\t\t\tg=%d  h=%d    f=%d\n", p->g, p->h, p->g + p->h);
        for (i=0; i<4; i++) {
            for (j=0; j<4; j++)
                if ( p->m[i][j] == 0 )
                   printf("   ");
                else
                   printf(" %2c", 'a'-1+p->m[i][j]);
            printf("\n");
        }
        printf("-------------\n");
        p = p->pere;
    }    
    printf("\n");
} // Afficher_sol


void pos_vide(conf m , int *iv, int *jv)
{
    int i, j;

    for (i=0; i < 4; i++)
        for (j=0; j < 4; j++)
            if ( m[i][j] == 0 ) {
               *iv = i;
               *jv = j;
               return;
            }
            
    printf("*** PB dans pos_vide: la conf testee ne contient pas de case vide ! ***\n");
}


int test_conf( conf m1, conf m2 )
{
    int i, j, stop;
    
    stop = 0;
    for (i=0; i<4 && !stop; i++)
        for (j=0; j<4 && !stop; j++)
            if ( m1[i][j] != m2[i][j] ) stop = 1;
            
    return !stop;
}


int etat_sol( struct noeud *e )
{
    int i, j, stop;
    
    stop = 0;
    for (i=0; i<4 && !stop; i++)
        for (j=0; j<4 && !stop; j++)
            if ( e->m[i][j] != but[i][j] ) stop =1;
            
    return !stop;
}


int Existe_dans_chemin( struct noeud *v, struct noeud *ch )
{
   int trouv = 0;
   struct noeud *p;
   
   if ( ch == NULL ) return 0;
   
   // else ...
   p = ch;
   while ( p != NULL && !trouv )  
       if ( test_conf( v->m , p->m ) )
          trouv = 1;
       else
          p = p->pere;
 
   return trouv;
}


// la fonction h : nb de jetons mal places
double fonc_h( conf mat )
{
    int i, j, nb;
    
    nb = 0;
    for (i=0; i<4; i++)
        for (j=0; j<4; j++)
            if ( mat[i][j] != 0 ) 
                if ( mat[i][j] != but[i][j] ) 
                   nb++;

   return nb;
}


// la fonction d'estimation : f = g + h
double estimation( struct noeud *e )
{
   if ( e != NULL )
      return e->g + e->h;
   else {
      printf("\n*** estimation sur un chemin vide !!! retourne 0 ***\n");
      return 0;
   }
}


// Allouer un tableau de MAXFILE elts et initialise la file à vide
void CreerFile( TypeFile *f )
{
   f->tab = malloc(MAXFILE * sizeof(struct noeud **));
   f->nbElem = 0;
}


// Enfiler le noeud ch dans la file
void Enfiler( TypeFile *f, struct noeud *ch )
{

   if ( f->nbElem < MAXFILE ) {
       f->tab[ f->nbElem ] = ch;
       f->nbElem++;
   }
   else
       printf("*** Enfiler: overflow de la file de priorité - opération ignorée\n");

}


// Défiler dans ch l'élément le plus prioritaire (celui ayant la plus petite valeur f(x))
void Defiler( TypeFile *f, struct noeud **ch )
{
   int i, ind, minprio;

   if ( f->nbElem > 0 ) {
       minprio = f->tab[0]->cout;
       ind = 0;
       for (i=1; i < f->nbElem; i++)
           if ( f->tab[i]->cout < minprio ) {
               minprio = f->tab[i]->cout;
               ind = i;
           }

        *ch = f->tab[ ind ];
        f->nbElem--;
        f->tab[ ind ] = f->tab[ f->nbElem ];
   }
   else
       printf("*** Defiler: underflow de la file de priorité - opération ignorée\n");

}


// Tester si la file est vide
int FileVide( TypeFile *f )
{
   return (f->nbElem == 0);
}



