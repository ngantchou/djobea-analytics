# Guide de Configuration Locale - Djobea Analytics

## Prérequis

- Node.js 18+ 
- npm, yarn ou pnpm
- Git

## Installation

### 1. Cloner le projet

\`\`\`bash
git clone <repository-url>
cd djobea-analytics
\`\`\`

### 2. Installer les dépendances

\`\`\`bash
# Avec npm
npm install

# Avec yarn
yarn install

# Avec pnpm (recommandé)
pnpm install
\`\`\`

### 3. Configuration des variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Modifier le fichier `.env.local` avec vos valeurs :

\`\`\`env
# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
ENABLE_AI_PREDICTIONS=true
ENABLE_GEOLOCATION=true
ENABLE_REALTIME=true
ENABLE_WHATSAPP=false

# Google Maps (optionnel)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# WebSocket (optionnel)
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_WS_PORT=3001
\`\`\`

### 4. Vérifier la configuration Tailwind

Assurez-vous que les fichiers suivants existent :

- `tailwind.config.js`
- `postcss.config.js`
- `app/globals.css` avec les directives Tailwind

### 5. Démarrer le serveur de développement

\`\`\`bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
\`\`\`

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

## Résolution des problèmes de styles

### Problème 1: Styles Tailwind non appliqués

**Solution :**
1. Vérifiez que `tailwind.config.js` existe et contient la bonne configuration
2. Assurez-vous que `postcss.config.js` est présent
3. Vérifiez que `app/globals.css` contient les directives Tailwind :
   \`\`\`css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   \`\`\`

### Problème 2: Variables CSS non définies

**Solution :**
Les variables CSS personnalisées sont définies dans `app/globals.css`. Assurez-vous que le fichier contient toutes les variables nécessaires.

### Problème 3: Thème sombre/clair ne fonctionne pas

**Solution :**
1. Vérifiez que `next-themes` est installé
2. Assurez-vous que le `ThemeProvider` est correctement configuré dans `app/layout.tsx`
3. Vérifiez que les variables CSS pour les thèmes sont définies

### Problème 4: Composants shadcn/ui non stylés

**Solution :**
1. Vérifiez que tous les packages Radix UI sont installés
2. Assurez-vous que `lib/utils.ts` contient la fonction `cn`
3. Vérifiez que les composants importent correctement les styles

## Structure des fichiers de style

\`\`\`
app/
├── globals.css          # Styles globaux et variables CSS
├── layout.tsx           # Layout principal avec ThemeProvider
components/
├── ui/                  # Composants UI de base
├── theme-provider.tsx   # Provider pour le thème
lib/
├── utils.ts            # Utilitaires incluant cn()
tailwind.config.js      # Configuration Tailwind
postcss.config.js       # Configuration PostCSS
\`\`\`

## Commandes utiles

\`\`\`bash
# Nettoyer le cache Next.js
npm run clean

# Vérifier les types TypeScript
npm run type-check

# Linter le code
npm run lint

# Build de production
npm run build
\`\`\`

## Support

Si vous rencontrez des problèmes :

1. Vérifiez que toutes les dépendances sont installées
2. Supprimez `node_modules` et `.next`, puis réinstallez
3. Vérifiez la console du navigateur pour les erreurs
4. Consultez la documentation des composants utilisés

## Développement avec Docker (optionnel)

\`\`\`bash
# Développement
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose -f docker-compose.prod.yml up
