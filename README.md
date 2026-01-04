# Planning OS - Application de gestion de tâches

Application web moderne de gestion de tâches et de réseau social, construite avec React.

## Fonctionnalités

### ✅ Gestion des tâches
- Création, modification et suppression de tâches
- Catégorisation (Études, Business, Sport)
- Timeline avec horaires
- États de complétion

### 👥 Réseau social
- Système d'amis avec demandes
- Chat général et messages privés
- Notifications en temps réel
- Statut en ligne/hors ligne

### 🤖 Coach IA
- Assistant virtuel intelligent
- Analyse des tâches
- Conseils personnalisés

### 🎨 Design moderne
- Mode sombre/clair
- Animations fluides
- Interface responsive
- Thème inspiré des OS modernes

## Améliorations récentes

### Corrections fonctionnelles
- ✅ Gestion gracieuse des champs manquants dans la base de données
- ✅ Helper functions pour les noms d'utilisateurs (fallback sur email)
- ✅ Gestion sécurisée des notifications sans `from_name` ou `from_user_id`
- ✅ Amélioration de la gestion des erreurs

### Améliorations UX
- ✅ Notifications toast pour toutes les actions
- ✅ Validation de formulaire avec champs required
- ✅ Raccourcis clavier (Escape pour fermer les modals)
- ✅ Auto-scroll pour les nouveaux messages
- ✅ États disabled pour les boutons
- ✅ Meilleurs messages d'erreur
- ✅ Accessibilité améliorée avec focus rings

### Design
- ✅ Animations CSS personnalisées
- ✅ Transitions fluides
- ✅ Scrollbar stylisée
- ✅ Outline focus pour l'accessibilité

## Installation

```bash
npm install
```

## Développement

```bash
npm start
```

Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

## Build de production

```bash
npm run build
```

## Backend

Le backend est hébergé séparément sur Railway:
- URL: `https://backend-production-c3b5.up.railway.app`

## Technologies

- React 18.2
- Tailwind CSS (via CDN)
- Lucide React (icônes)
- React Scripts 5.0.1

## Structure du projet

```
src/
├── App.js          # Composant principal avec toute la logique
├── index.js        # Point d'entrée React
├── index.css       # Styles globaux et animations
public/
├── index.html      # Template HTML avec config Tailwind
```

## Fonctions helper

### getUserDisplayName(userObj)
Retourne le nom d'affichage d'un utilisateur avec fallback sur l'email si le champ `name` n'existe pas.

### getUserInitials(userObj)
Retourne les initiales pour les avatars.

## Notes importantes

- Les champs `name`, `receiver_id`, et `from_user_id` peuvent être absents dans certaines réponses API
- Le code gère ces cas avec des fallbacks appropriés
- Toutes les erreurs réseau sont capturées et affichées à l'utilisateur