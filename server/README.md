# AS FIVE 94 - Backend (NestJS)

Architecture professionnelle pour la gestion de l'association sportive, générée avec les patterns `nestjs-expert` et `multi-agent`.

## Structure
- **Members** : Gestion des membres, catégories et cotisations.
- **Events** : Gestion du planning, calcul automatique des résultats de matchs (Victoire/Nul/Défaite) et stockage des buteurs/passeurs.
- **Finances** : Suivi des transactions avec relations membres et identifiants PayPal.
- **API (Swagger)** : Documentation interactive disponible sur `/api`.

## Installation (à faire par l'utilisateur)
1. Assurez-vous d'avoir Node.js installé.
2. Ouvrez un terminal dans ce dossier (`/server`).
3. Exécutez :
   ```bash
   npm install
   ```

## Lancement
```bash
npm run start:dev
```

Le serveur sera accessible sur `http://localhost:3000`.
Accédez à `http://localhost:3000/api` pour voir et tester les endpoints.

## Base de données
Utilise **SQLite** par défaut (`sportflow.sqlite` sera créé au premier lancement).
