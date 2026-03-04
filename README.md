# Starter Frontend

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vuedotjs)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite)](https://vite.dev/)

Base de démarrage pour application frontend production-ready construite avec Vue.js 3 et architecture modulaire. Embarque dès le départ : routing, structure par modules, configuration Docker et hot-reload.

> **[Documentation complète](DOC.md)** — Architecture, concepts et organisation du projet.

---

## Prérequis

- **Node.js** ≥ 22
- **Docker** et **Docker Compose** v2

---

## Installation

```bash
# 1. Cloner le dépôt
git clone https://codeberg.org/olifil/starter-frontend.git && cd starter-frontend

# 2. Installer les dépendances
npm install

# 3. Démarrer via Docker
docker compose up -d
```

---

## Démarrage

```bash
docker compose up -d       # démarrer l'application
docker compose logs -f     # suivre les logs
docker compose down        # arrêter
```

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:8080 |

---

## Structure du projet

```
src/
├── layouts/           # mises en page (DefaultLayout, etc.)
├── components/        # composants partagés (AppHeader, AppFooter, ui/)
├── modules/           # modules métier (structure modulaire)
│   └── <module>/
│       ├── components/
│       ├── views/
│       └── routes.ts
├── router/            # configuration du router
├── assets/            # styles globaux et thèmes
├── lib/               # fonctions utilitaires
├── App.vue            # composant racine
└── main.ts            # point d'entrée
```

---

## License

Ce projet est distribué sous licence MIT. Voir [LICENSE.md](LICENSE.md) pour plus de détails.
