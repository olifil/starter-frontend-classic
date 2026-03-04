# Documentation — Starter Frontend

Ce document décrit le fonctionnement du projet **Starter Frontend**. Il s'adresse à toute personne souhaitant comprendre l'organisation du projet, qu'elle soit développeuse ou non.

---

## Qu'est-ce que ce projet ?

Starter Frontend est une **base d'application web** prête à l'emploi. Il fournit un socle technique avec les briques essentielles déjà en place : interface utilisateur, navigation entre pages, gestion du thème clair/sombre, et communication avec un serveur.

L'objectif est de pouvoir **dupliquer ce projet** (fork) pour créer rapidement de nouvelles applications sans repartir de zéro.

---

## Les technologies utilisées

| Technologie | Rôle | En bref |
|---|---|---|
| **Vue.js 3** | Framework d'interface | Construit les pages et gère les interactions utilisateur |
| **TypeScript** | Langage | JavaScript avec vérification de types, réduit les erreurs |
| **Vite** | Outil de développement | Compile le code et recharge la page automatiquement pendant le développement |
| **Tailwind CSS** | Mise en forme | Permet de styliser les pages directement dans le code HTML |
| **shadcn-vue** | Composants visuels | Bibliothèque de boutons, formulaires, menus, etc. prêts à l'emploi |
| **Pinia** | Gestion d'état | Stocke les données partagées entre les pages (ex : utilisateur connecté) |
| **Vue Router** | Navigation | Gère les adresses URL et la navigation entre les pages |
| **VueUse** | Utilitaires | Collection de fonctions réutilisables (thème sombre, stockage local, etc.) |
| **Axios** | Communication serveur | Envoie et reçoit des données depuis une API distante |
| **Vitest** | Tests | Vérifie automatiquement que le code fonctionne correctement |
| **Docker** | Conteneurisation | Lance l'application dans un environnement isolé et reproductible |

---

## Organisation des fichiers

```
src/
├── assets/                        # Styles globaux (thème, couleurs, classes CSS)
│   └── index.css                  #   Thèmes clair/sombre, classes CSS personnalisées et palette sémantique
├── api/                           # Communication avec le serveur
│   └── client.ts                  #   Client HTTP centralisé (Axios + gestion des tokens)
├── core/domain/                   # Règles métier et types de données
│   ├── types/                     #   Définitions des structures de données (ex : RegisterRequest)
│   └── ports/                     #   Interfaces des services externes (ex : AuthRepository)
├── infrastructure/                # Implémentation des services externes
│   └── adapters/http/             #   Appels HTTP vers l'API (ex : AuthHttpAdapter)
├── interface/                     # Ce que l'utilisateur voit et avec quoi il interagit
│   ├── views/                     #   Pages de l'application (ex : RegisterView.vue)
│   ├── components/                #   Composants partagés (AppHeader, AppFooter, etc.)
│   │   └── ui/                    #   Composants shadcn-vue (boutons, formulaires, etc.)
│   ├── stores/                    #   Données partagées entre les pages (Pinia)
│   └── layouts/                   #   Mises en page (ex : DefaultLayout.vue)
├── router/                        # Configuration de la navigation
│   └── index.ts                   #   Déclaration des routes de l'application
├── i18n/                          # Traductions
│   └── locales/                   #   Fichiers fr.yaml et en.yaml
└── main.ts                        # Point d'entrée technique (démarrage)
```

```
tests/                       # Tests automatisés (structure miroir de src/)
├── api/                     #   Tests du client HTTP
├── components/              #   Tests des composants partagés
├── layouts/                 #   Tests des mises en page
├── stores/                  #   Tests des stores Pinia
└── modules/                 #   Tests des pages (auth/, public/)
```

---

## Concepts clés

### Les pages

L'application comporte trois groupes de pages :

**Pages publiques** (accessibles sans connexion) :

- **Accueil** : page d'accueil de l'application.
- **Contact** : formulaire permettant d'envoyer un message.
- **Conditions Générales d'Utilisation (CGU)** : page présentant les conditions d'utilisation de la plateforme.

**Pages protégées** (accessibles uniquement après connexion) :

- **Profil** (`/profil`) : permet à l'utilisateur de consulter et modifier ses informations personnelles. La page est organisée en plusieurs sections :
  - **Informations personnelles** : affiche le prénom, le nom, l'adresse e-mail, le numéro de téléphone (format E.164, ex. `+33612345678` — affiche `—` si non renseigné) et la date d'inscription. Un bouton ouvre une dialog pour modifier le prénom, le nom et le numéro de téléphone. Le numéro est optionnel ; laisser le champ vide efface la valeur existante.
  - **Adresse e-mail** : permet de demander un changement d'adresse (un e-mail de confirmation est envoyé à la nouvelle adresse).
  - **Préférences de notifications** : active ou désactive les canaux de notification disponibles (EMAIL, SMS, PUSH, WEB_PUSH, WEBSOCKET). Les canaux non configurés côté serveur sont affichés en grisé et non interactifs.
  - **Mot de passe** : permet de changer le mot de passe en saisissant l'ancien puis le nouveau (avec confirmation). Le nouveau mot de passe doit contenir entre 8 et 128 caractères, au moins une minuscule, une majuscule, un chiffre et un caractère spécial (`@$!%*?&`).
  - **Suppression de compte** : supprime définitivement le compte après confirmation.

- **Notifications** (`/notifications`) : affiche l'historique des notifications reçues via WebSocket sous forme de cartes paginées. Chaque carte présente le sujet et la date d'envoi. Les notifications non lues (`status=SENT`) sont mises en évidence avec la couleur `info`. Un menu contextuel (icône `⋮`) permet d'**ouvrir** le détail, de **marquer comme lue** ou de **supprimer** la notification. En haut de la liste, une **barre d'actions de groupe** permet de sélectionner tout ou partie des notifications (via une checkbox tri-state), de choisir une action (**Marquer comme lues** ou **Supprimer**) et de l'appliquer en un clic. La suppression en masse affiche une confirmation avant exécution. Un sélecteur permet de choisir le nombre d'éléments affichés par page (10, 25 ou 50).

**Pages d'authentification** :

- **Connexion** : formulaire e-mail / mot de passe.
- **Inscription** : formulaire avec prénom, nom, e-mail, mot de passe et confirmation. L'utilisateur doit cocher une case confirmant l'acceptation des [Conditions Générales d'Utilisation](#) avant de pouvoir valider. Le bouton d'envoi reste inactif tant que tous les champs ne sont pas valides et que la case CGU n'est pas cochée.
- **Mot de passe oublié** / **Réinitialisation du mot de passe** : permet de récupérer l'accès à son compte.
- **Vérification de l'e-mail** : confirmation de l'adresse e-mail après inscription.

Tous les formulaires incluent une **validation côté client** (champs requis, format d'e-mail, règles de complexité du mot de passe) avec messages d'erreur affichés au fur et à mesure.

### Les mises en page (layouts)

Une mise en page définit la **structure visuelle** commune à un groupe de pages. Le projet en propose plusieurs :

- **DefaultLayout** : en-tête en haut, contenu centré, pied de page en bas. Utilisé pour les pages publiques de l'application.
- **AdminLayout** : en-tête pleine largeur, barre latérale de navigation à gauche, contenu principal à droite. Utilisé pour les pages d'administration.
  - La barre latérale peut être **réduite** (icônes seules) ou **étendue** (icônes + labels) via un bouton dans l'en-tête.
  - Chaque page peut définir un **titre** et une **description** affichés automatiquement en haut du contenu via le store `useLayoutStore` (`pageTitle`, `pageDescription`).
- **BlankLayout** : aucune structure autour du contenu. Utilisé pour les pages où l'on veut un contrôle total (ex : page de connexion).

Les mises en page sont associées aux pages via la configuration des routes. Cela permet à chaque section de l'application d'avoir sa propre présentation sans dupliquer de code.

### Le thème clair/sombre

L'application supporte deux thèmes visuels : **clair** (fond blanc) et **sombre** (fond noir). Les couleurs de chaque thème sont définies dans le fichier `src/assets/index.css` à l'aide de variables CSS.

Le basculement entre les thèmes se fait en ajoutant ou retirant la classe `dark` sur la page. La préférence de l'utilisateur peut être sauvegardée dans le navigateur.

### Les composants visuels (shadcn-vue)

Les composants visuels (boutons, champs de formulaire, menus déroulants, etc.) proviennent de la bibliothèque **shadcn-vue**. Leur particularité : ils sont **copiés dans le projet** (dans `src/components/ui/`), ce qui permet de les personnaliser librement.

#### Prop `color` — coloration sémantique

Les composants **Button**, **Card** et **Alert** acceptent une prop `color` qui applique une coloration sémantique cohérente, inspirée de Bootstrap :

| Valeur | Signification | Apparence |
|---|---|---|
| `primary` | Action principale | Couleur principale du thème |
| `secondary` | Action secondaire | Gris neutre |
| `info` | Information | Bleu |
| `success` | Succès | Vert |
| `warning` | Avertissement | Amber/jaune |
| `error` | Erreur | Rouge |
| `light` | Neutre clair | Gris très clair |
| `dark` | Neutre sombre | Gris foncé |

Exemples d'utilisation :

```html
<!-- Bouton solide coloré -->
<Button color="success">Enregistrer</Button>
<Button color="error" variant="outline">Supprimer</Button>

<!-- Carte avec fond teinté -->
<Card color="warning">
  <CardContent>Attention : cette action est irréversible.</CardContent>
</Card>

<!-- Alerte colorée -->
<Alert color="info">
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>Votre profil a bien été mis à jour.</AlertDescription>
</Alert>
```

La coloration est **cohérente** : modifier la variable CSS d'une couleur dans `src/assets/index.css` met à jour tous les composants qui l'utilisent. Les variables sont de la forme `--sem-info`, `--sem-success-muted`, etc.

Pour ajouter un nouveau composant, on utilise la commande :

```bash
npx shadcn-vue@latest add <nom-du-composant>
```

Par exemple : `npx shadcn-vue@latest add button` pour ajouter un bouton.

### Les notifications Web Push

L'application prend en charge les **notifications Web Push**, qui permettent d'envoyer des messages au navigateur de l'utilisateur même lorsqu'il n'est pas sur la page.

**Configuration** : la clé VAPID publique du serveur doit être renseignée dans `.env` :
```
VITE_WEBPUSH_PUBLIC_KEY=<clé publique VAPID>
```
Cette clé doit correspondre à `NOTIFICATION_WEB_PUSH_PUBLIC_KEY` côté backend.

**Composants** :

- **`public/sw.js`** : Service Worker enregistré dans le navigateur. Il écoute l'événement `push` (affiche la notification) et `notificationclick` (ouvre l'application au clic).
- **`WebPushAdapter`** (`src/infrastructure/adapters/webpush/`) : gère côté navigateur l'enregistrement du Service Worker, la demande de permission, l'abonnement via `PushManager.subscribe()`, et le `POST /notifications/push-subscriptions` vers le backend. La désinscription appelle `DELETE /notifications/push-subscriptions` puis `PushSubscription.unsubscribe()`.
- **`useNotificationStore`** : expose `subscribePush()` et `unsubscribePush()` qui délèguent au `WebPushAdapter`.

**UX dans le profil** : lorsque l'utilisateur active le canal **Notifications web push** dans ses préférences, l'abonnement navigateur est déclenché immédiatement (demande de permission, enregistrement du SW, POST au backend). En cas de refus ou d'environnement non compatible, le switch est automatiquement rétabli et un message d'erreur est affiché. La désactivation du canal déclenche la désinscription immédiate.

### Les notifications en temps réel (WebSocket)

Lorsqu'un utilisateur est connecté, l'application établit une connexion **WebSocket** avec le serveur via `socket.io-client`. Cette connexion est gérée par deux éléments :

- **`NotificationWsAdapter`** (`src/infrastructure/adapters/websocket/`) : ouvre la connexion sur le namespace `/notifications` et écoute l'événement `notification:new`.
- **`useNotificationStore`** (`src/interface/stores/`) : orchestre la connexion/déconnexion selon l'état d'authentification, maintient le compteur de notifications non lues (`unreadCount`) et expose les actions `fetchUnreadCount`, `markAsRead` et `deleteNotification`.

À la connexion, le compteur est initialisé via un appel HTTP (`GET /notifications/unread-count?channel=WEBSOCKET&status=SENT`). Chaque notification WebSocket reçue incrémente automatiquement ce compteur et déclenche un rechargement de la liste sur la page `/notifications` (retour automatique en page 1). Marquer une notification comme lue décrémente le compteur. Supprimer une notification (`DELETE /notifications/{id}`) la retire de la liste localement et décrémente le compteur si elle était non lue.

La liste des notifications est récupérée via `GET /notifications?channel=WEBSOCKET&page=1&pageSize=10` et retourne un objet paginé `{ data, meta }`. La page `/notifications` permet de naviguer entre les pages via un composant de pagination et de choisir le nombre d'éléments affichés (10, 25 ou 50).

### Le renouvellement automatique des jetons d'authentification

Lorsqu'un utilisateur se connecte, l'application reçoit deux **jetons** (tokens) :

- Un **jeton d'accès** (*access token*) : valide pour une courte durée, il autorise chaque requête vers le serveur.
- Un **jeton de rafraîchissement** (*refresh token*) : valide plus longtemps, il sert uniquement à obtenir un nouveau jeton d'accès quand celui-ci expire.

Quand le jeton d'accès expire, le serveur répond avec une erreur **401**. L'application intercepte cette erreur et tente automatiquement d'en obtenir un nouveau en appelant `/auth/refresh`. Si le renouvellement réussit, la requête initiale est **rejouée transparentement** : l'utilisateur ne remarque rien. Si plusieurs requêtes expirent simultanément, une seule demande de renouvellement est émise ; les autres attendent le résultat.

Si le renouvellement échoue (jeton de rafraîchissement lui-même expiré ou révoqué), l'utilisateur est redirigé vers la page de connexion.

Ce mécanisme est centralisé dans `src/api/client.ts` et fonctionne pour toutes les requêtes de l'application.

### Les auto-imports

Pour simplifier l'écriture du code, les fonctions courantes de Vue.js, du routeur, de Pinia et de VueUse sont **importées automatiquement**. Il n'est pas nécessaire de les déclarer manuellement dans chaque fichier.

---

## Tests

Les tests automatisés vérifient que chaque partie de l'application fonctionne comme prévu. Ils sont situés dans le dossier `tests/` et suivent la même organisation que le code source.

Pour lancer les tests :

```bash
npm test
```

---

## Docker

L'application peut être lancée dans un conteneur Docker selon deux modes aux objectifs distincts.

| | Production | Développement |
|---|---|---|
| **Fichier** | `docker-compose.yml` | `docker-compose.dev.yml` |
| **Serveur** | nginx (fichiers statiques) | Vite dev server |
| **Build** | `npm run build` au démarrage | Aucun — le code source est monté |
| **Hot-reload** | Non | Oui — toute modification est reflétée instantanément |
| **Variables d'env** | Intégrées au moment du build | Lues à chaud depuis `.env` |
| **Image finale** | ~50 Mo (nginx + assets) | ~300 Mo (Node.js + node_modules) |
| **Usage** | Déploiement, recette, démonstration | Développement quotidien |

### Production

```bash
docker compose up --build -d   # construire et démarrer
docker compose logs -f         # voir les logs en temps réel
docker compose down            # arrêter
```

L'application est accessible à l'adresse **http://localhost:8080**.

> Les variables d'environnement (`VITE_*`) sont intégrées au moment du build. Toute modification du `.env` nécessite de relancer `docker compose up --build`.

### Développement

```bash
docker compose -f docker-compose.dev.yml up -d
```

Le code source local est monté dans le conteneur : sauvegarder un fichier met à jour l'application dans le navigateur sans redémarrer le conteneur.
