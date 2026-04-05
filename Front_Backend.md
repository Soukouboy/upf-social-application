# Communication Frontend ↔ Backend (UPF Social)

Ce document détaille l'ensemble des requêtes (endpoints) disponibles dans l'application, les données attendues par le frontend (types), ainsi que la manière dont les requêtes sont formatées et sécurisées.

## 1. Principe de communication

L'application frontend React interagit avec le backend Spring Boot au format **JSON**, et via **Multipart/form-data** pour les envois de fichiers.
Toutes les requêtes HTTP passent par une instance centralisée d'Axios (`src/services/api.ts`).

### Authentification (JWT)
- **Token d'accès (Access Token)** : Envoyé dans l'en-tête `Authorization: Bearer <token>` de toutes les requêtes sécurisées.
- **Refresh Token** : Envoyé automatiquement par un intercepteur Axios lors de la réception d'une erreur `401 Unauthorized` pour rafraîchir le token d'accès sans déconnecter l'utilisateur.

---

## 2. Endpoints et Modèles de données

Voici la liste exhaustive des endpoints utilisés, classée par service. Tous ces appels requièrent le JWT (sauf `login` et `register`).

### A. Authentification (`/auth`)

| Action | Méthode | Endpoint | Payload (Frontend envoie) | Réponse (Frontend reçoit) |
| :--- | :--- | :--- | :--- | :--- |
| **Connexion** | `POST` | `/auth/login` | `{ email, password }` | `{ accessToken, refreshToken }` |
| **Inscription** | `POST` | `/auth/register` | `{ firstName, lastName, email, password, role... }` | `{ accessToken, refreshToken }` |
| **Profil courant** | `GET` | `/users/me` | *Aucun* | `Student` (voir modèle) |
| **Refresh Token**| `POST` | `/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| **Déconnexion** | `POST` | `/auth/logout` | *Aucun* | *Aucun* (Status 200) |

### B. Utilisateurs & Réseau (`/users`)

| Action | Méthode | Endpoint | Payload (Frontend envoie) | Réponse (Frontend reçoit) |
| :--- | :--- | :--- | :--- | :--- |
| **Recherche étudiants** | `GET` | `/users` | `?search=xyz` | `PaginatedResponse<StudentNetwork>` |
| **Suivre un étudiant** | `POST` | `/users/:id/follow` | *Aucun* | *Aucun* (Status 200/201) |
| **Ne plus suivre** | `DELETE`| `/users/:id/follow` | *Aucun* | *Aucun* (Status 204) |

### C. Cours (`/courses`)

| Action | Méthode | Endpoint | Payload (Frontend envoie) | Réponse (Frontend reçoit) |
| :--- | :--- | :--- | :--- | :--- |
| **Liste des cours** | `GET` | `/courses` | `?page, ?size, ?filiere...` | `PaginatedResponse<Course>` |
| **Détail du cours** | `GET` | `/courses/:id` | *Aucun* | `Course` |
| **Ressources du cours**| `GET` | `/courses/:id/resources` | *Aucun* | `CourseResource[]` |

### D. Épreuves / Annales (`/exams`)

| Action | Méthode | Endpoint | Payload (Frontend envoie) | Réponse (Frontend reçoit) |
| :--- | :--- | :--- | :--- | :--- |
| **Liste des épreuves** | `GET` | `/exams` | `?page, ?type, ?matiere...` | `PaginatedResponse<Exam>` |
| **Détail épreuve** | `GET` | `/exams/:id` | *Aucun* | `Exam` |
| **Dépôt épreuve** | `POST` | `/exams` | FormData (file, title, etc.) | `Exam` |
| **Télécharger fichier**| `GET` | `/exams/:id/download` | *Aucun* | `Blob` (Fichier binaire) |
| **Voter (Up/Down)** | `POST` | `/exams/:id/vote` | `{ type: "UP" | "DOWN" }` | *Aucun* |
| **Signaler** | `POST` | `/exams/:id/report` | `{ reason, description }` | `ExamReport` |

### E. Groupes de travail (`/groups`)

| Action | Méthode | Endpoint | Payload (Frontend envoie) | Réponse (Frontend reçoit) |
| :--- | :--- | :--- | :--- | :--- |
| **Liste des groupes** | `GET` | `/groups` | *Aucun* | `Group[]` |
| **Détail du groupe** | `GET` | `/groups/:id` | *Aucun* | `Group` |
| **Créer groupe** | `POST` | `/groups` | FormData (name, image...) | `Group` |
| **Rejoindre public** | `POST` | `/groups/:id/join` | *Aucun* | *Aucun* |
| **Demande privé** | `POST` | `/groups/:id/request`| *Aucun* | *Aucun* |
| **Membres du groupe** | `GET` | `/groups/:id/members`| *Aucun* | `GroupMembership[]` |
| **Modifier rôle** | `PUT` | `/groups/:id/members/:userId` | `{ role: "ADMIN" | "MEMBER" }` | *Aucun* |
| **Exclure membre** | `DELETE`| `/groups/:id/members/:userId` | *Aucun* | *Aucun* |

### F. Messagerie de Groupe & Privée (`/messages`)

| Action | Méthode | Endpoint | Payload (Frontend envoie) | Réponse (Frontend reçoit) |
| :--- | :--- | :--- | :--- | :--- |
| **Historique groupe** | `GET` | `/messages` | `?groupId=X, ?page, ?size` | `PaginatedResponse<Message>` |
| **Conversations DM** | `GET` | `/messages/conversations` | *Aucun* | `Conversation[]` |
| **Historique DM** | `GET` | `/messages/direct/:userId` | `?page, ?size` | `PaginatedResponse<DirectMessage>` |
| **Envoyer DM** | `POST` | `/messages/direct/:userId` | `{ content: "Texte" }` | `DirectMessage` |

### G. Espace Professeur (`/professor`)

| Action | Méthode | Endpoint | Payload (Frontend envoie) | Réponse (Frontend reçoit) |
| :--- | :--- | :--- | :--- | :--- |
| **Mes cours** | `GET` | `/professor/courses` | *Aucun* | `Course[]` |
| **Mes étudiants (cours)`| `GET` | `/professor/courses/:id/students` | *Aucun* | `Student[]` |
| **Upload Ressource** | `POST` | `/professor/courses/:id/documents`| FormData (fichier, etc.) | `CourseResource` |
| **Suppr. Ressource** | `DELETE`| `/professor/courses/:courseId/documents/:docId` | *Aucun* | *Aucun* |
| **Mes Annonces** | `GET` | `/professor/announcements` | *Aucun* | `Announcement[]` |
| **Créer Annonce** | `POST` | `/professor/announcements` | `{ courseId, title, content }` | `Announcement` |

### H. Espace Administration (`/admin`)

| Action | Méthode | Endpoint | Payload (Frontend envoie) | Réponse (Frontend reçoit) |
| :--- | :--- | :--- | :--- | :--- |
| **Statistiques glob.** | `GET` | `/admin/stats` | *Aucun* | `AdminStats` |
| **Lister Utilisateurs**| `GET` | `/admin/users` | `?page, ?size...` | `PaginatedResponse<Student>` |
| **Activer/Désactiver** | `PUT` | `/admin/users/:id/status` | `{ isActive: true/false }` | *Aucun* |
| **Changer Rôle (Prom.)**| `PUT` | `/admin/users/:id/role` | `{ role: "ADMIN" | "USER"... }` | *Aucun* |
| **Créer Cours** | `POST` | `/admin/courses` | `{ title, description... }` | `Course` |
| **Modifier Cours** | `PUT` | `/admin/courses/:id` | `{ title, description... }` | `Course` |
| **Signalements** | `GET` | `/admin/reports` | `?status` | `ExamReport[]` |
| **Masquer Épreuve** | `PUT` | `/admin/exams/:id/visibility`| `{ isHidden: true }` | *Aucun* |

---

## 3. Caching et Stockage Local (Stratégie)

Afin d'éviter de multiplier les requêtes identiques (par exemple, pour afficher un même cours ou une même épreuve sur plusieurs pages, ou récupérer la liste des groupes encore et encore), il est impératif de mettre en place un **gestionnaire d'état asynchrone** avec mise en cache.

L'outil standard et le plus performant pour accomplir cela dans le frontend React actuellement est **React Query (TanStack Query)**.

### Avantages de l'adoption de React Query
1. **Cache automatique** : Lors de l'appel d'un endpoint (ex: `getCourseById(1)`), la donnée est conservée en mémoire (ex: clé `['course', 1]`). Les appels suivants retournent instantanément la donnée en cache au lieu de refaire la requête HTTP immédiatement.
2. **Déduplication** : Si plusieurs composants demandent la même donnée au même moment, une seule requête HTTP part vers le backend.
3. **Invalidation ciblée** : Lorsqu'une modification survient (ex: `uploadDocument()`), le frontend peut indiquer *"Invalide le cache des ressources de ce cours"*, et les nouvelles données se récupèrent de manière quasi-invisible en arrière-plan.
4. **Récupération en arrière-plan** (Background Fetching) : Garde l'UI rapide tout en s'assurant que l'information n'est pas obsolète.

*(Voir l'implementation plan pour procéder à son installation)*
