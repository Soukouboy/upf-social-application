# Mini Réseau Social Académique UPF — Frontend (React SPA)

Une application web monopage (SPA) en React + TypeScript destinée aux étudiants, professeurs et administrateurs de l'UPF Campus Rabat. L'application permet de gérer les cours, épreuves, groupes d'étude, annonces et messages privés dans une interface moderne et sécurisée.

## 🚀 Fonctionnalités Clés

L'application est divisée en 3 interfaces distinctes selon le rôle de l'utilisateur.

### 🎓 1. Étudiant (`STUDENT`)
- **Dashboard (`/student/dashboard`)** : Vue d'ensemble (épreuves récentes, raccourcis).
- **Cours & Épreuves (`/student/courses`, `/student/exams`)** : Consulter les cours, télécharger et uploader des épreuves.
- **Profil & Réseau (`/student/profile`, `/student/network`)** : Gérer son profil, compétences, portfolio et suivre d'autres étudiants.
- **Groupes (`/student/groups`)** : Créer et rejoindre des groupes d'étude (publics ou privés). Chat de groupe en temps réel (WebSocket).
- **Messages Privés (`/student/messages`)** : Discuter en 1-à-1 avec d'autres étudiants ou professeurs.

### 👨‍🏫 2. Professeur (`PROFESSOR`)
- **Dashboard (`/professor/dashboard`)** : Statistiques rapides sur ses cours et annonces.
- **Mes Cours (`/professor/courses`)** : Liste des cours assignés au professeur.
- **Mes Étudiants (`/professor/students`)** : Liste globale de tous les étudiants inscrits à ses cours.
- **Documents (`/professor/courses/:id/documents`)** : Uploader, lister et supprimer des ressources et documents de cours.
- **Annonces (`/professor/announcements`)** : Publier des annonces ciblées pour les étudiants d'un cours spécifique.

### 🛡️ 3. Administrateur (`ADMIN`)
- **Dashboard (`/admin/dashboard`)** : Statistiques globales de la plateforme.
- **Utilisateurs & Admins (`/admin/users`, `/admin/admins`)** : Gérer les statuts de compte (Actif/Inactif), bloquer et promouvoir des modérateurs.
- **Gestion des Cours (`/admin/courses`)** : Créer, modifier, désactiver des cours (CRUD) et gérer leurs ressources associées.
- **Signalements (`/admin/reports`)** : Modérer les documents et épreuves signalés (plagiat, erreur, spam) en les cachant ou en rejetant le signalement.

---

## 🛠️ Stack Technique

- **Framework** : React 18 avec TypeScript
- **Routing** : React Router v6
- **Styling & Composants UI** : Material-UI (MUI) v5 + Vanilla CSS (`index.css`)
- **Appels API** : Axios (avec intercepteurs pour JWT)
- **Temps Réel** : `@stomp/stompjs` et `sockjs-client` (WebSocket pour les chats de groupe)
- **Développement & Mock** : Vite + `axios-mock-adapter` pour le test sans backend

---

## ⚙️ Prérequis & Installation

Assurez-vous d'avoir [Node.js](https://nodejs.org/) (version 18+ recommandée) installé.

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:5173`.

---

## 🧪 Fausse API (Mock API) pour le développement

Actuellement, l'application fonctionne avec une **Mock API** interceptant les appels Axios (`src/mocks/mockApi.ts`), ce qui permet de tester les interfaces complètes sans backend réel.

### Tester les différents rôles
Par défaut, le compte mocké a le rôle `ADMIN`. Pour voir l'interface Étudiant ou Professeur, ouvrez le fichier `src/mocks/mockApi.ts` et modifiez la ligne `21` :

```typescript
// ⚠️ Changez le rôle ici pour tester différentes interfaces :
const MOCK_ROLE: 'STUDENT' | 'PROFESSOR' | 'ADMIN' = 'PROFESSOR';
```

---

## 🔌 Intégration Backend (Spring Boot)

Pour connecter la SPA à votre vrai backend Spring Boot :

### 1. Variables d'Environnement
Créez un fichier `.env` à la racine du projet et définissez vos URLs (désactivez temporairement le mock dans `main.tsx` en supprimant `startMockApi()`) :

```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080/ws
```

### 2. Contrat d'Interface (Types)
Le dossier `src/types/index.ts` contient tous les modèles métier TypeScript alignés sur les DTOs Spring Boot. Si vous modifiez un nom de champ dans votre DTO Java (ex: `datePublication` à la place de `createdAt`), mettez à jour `types/index.ts`.

#### Rôles attendus (`UserRole`) :
Le token JWT ou l'endpoint `/users/me` doit renvoyer un champ `role` valant exactement `"STUDENT"`, `"PROFESSOR"` ou `"ADMIN"`.

### 3. Authentification & Sécurité (JWT)
- Le login (`/auth/login`) attend une réponse JSON `{ accessToken: "...", refreshToken: "..." }`.
- L'intercepteur Axios (`src/services/api.ts`) ajoute automatiquement : `Authorization: Bearer <accessToken>`.
- **Note pour le renouvellement** : La logique 401 globale se charge de rediriger vers le login si le token expire (le refresh n'est pas encore totalement implémenté).

### 4. Endpoints à implémenter (Résumé)

- **Auth** : `POST /auth/login`, `POST /auth/register`, `GET /users/me`
- **Utilisateurs / Réseau** : `GET /users`, `POST/DELETE /users/{id}/follow`
- **Cours (Étudiants)** : `GET /courses`, `GET /courses/{id}`, `GET /courses/{id}/resources`
- **Professeurs** :
  - `GET /professor/courses`
  - `GET /professor/courses/{id}/students`
  - `POST/DELETE /professor/courses/{id}/documents`
  - `GET/POST /professor/announcements`
- **Épreuves** : `GET /exams`, `GET /exams/{id}`, `POST /exams/upload`
- **Groupes** : `GET /groups`, `POST /groups`, `GET /groups/{id}`, `GET /groups/{id}/members`
- **Messages (DM)** : `GET /messages/conversations`, `GET/POST /messages/direct/{userId}`
- **Admin** :
  - `GET /admin/stats`
  - `GET /admin/users`, `PUT /admin/users/{id}/status`, `PUT /admin/users/{id}/role`
  - `GET/POST/PUT/DELETE /admin/courses`
  - `POST/DELETE /admin/courses/{id}/resources`
  - `GET /admin/reports`, `PUT /admin/reports/{id}`
  - `PUT /admin/exams/{id}/visibility`

---

## 🎨 Personnalisation (Thème)

Le design exploite les couleurs institutionnelles supposées de l'UPF Campus Rabat.
Toute la personnalisation MUI se trouve dans `src/theme/theme.ts`.

- **Couleurs Principales** :
  - `primary.main`: `#001A36` (Bleu de Prusse foncé, branding header)
  - `secondary.main`: `#E0A96D` (Or/Beige institutionnel)
- **Radiuses (Bordures)** : Le composant de base MUI est redéfini avec arrondis (`borderRadius: 12` sur la plupart des cartes/boutons).
- **CSS Vanilla (Animations/Scrollbar)** : Éditez `src/index.css` pour personnaliser les dégradés fluides, la scrollbar Webkit profilée, et les micro-animations (keyframe `fadeIn`, `slideUp`).

---

## 📁 Structure du Projet

```text
src/
├── components/
│   ├── common/        # Composants partagés (EmptyState, ErrorBoundary, RoleRoute...)
│   ├── layout/        # Layouts spécifiques aux rôles (StudentLayout, AdminLayout...)
│   └── ui/            # UI kit basé sur MUI (UPFButton, UPFCard, UPFModal...)
├── context/           # React Context (AuthContext, ChatContext, NotificationContext)
├── hooks/             # Custom Hooks (useAuth, useWebSocket)
├── mocks/             # Fausse API (axios-mock-adapter)
├── pages/
│   ├── admin/         # 6 pages (Tableau de bord, Utilisateurs, Cours, Signalements...)
│   ├── professor/     # 5 pages (Tableau de bord, Mes étudiants, Documents, Annonces)
│   ├── auth/          # Login et Inscription
│   ├── courses/       # Liste et détails des cours
│   ├── exams/         # Espace de partage d'épreuves (Dépôt)
│   ├── groups/        # Groupes d'études
│   ├── messages/      # Discussions 1-à-1
│   ├── profile/       # Profil et édition
│   └── network/       # Annuaire et réseau étudiant
├── services/          # Wrappers Axios pour requêtes HTTP vers l'API
├── theme/             # Configuration principale `theme.ts` (palette, polices, composants)
└── types/             # Types TypeScript liés aux DTO backend (`index.ts`)
```
