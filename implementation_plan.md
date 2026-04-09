# Plan d'Implémentation — UPF Social (8 Corrections majeures)

## Contexte

Après analyse complète du code, voici l'état actuel et le plan pour corriger les 8 problèmes identifiés. L'application est un frontend React/TypeScript avec MUI, utilisant un backend Spring Boot. Les routes sont préfixées par rôle (`/student/`, `/professor/`, `/admin/`).

---

## Problèmes identifiés & Solutions

### #1 — Dashboards dynamiques + Navigation des boutons student

**État actuel :**
- `DashboardPage.tsx` (Student) : données 100% statiques (`MOCK_STATS`, `MOCK_ACTIVITIES`)
- `AdminDashboardPage.tsx` : appelle `getAdminStats()` → `/admin/stats` mais **cet endpoint n'existe pas** dans le backend documenté (ENDPIN.md). Il faut construire les stats côté frontend en agrégeant plusieurs appels.
- `ProfessorDashboardPage.tsx` : appelle `getMyCourses()` (✅) mais les stats étudiants et documents sont des estimations (`courses.length * 25`)
- Boutons Dashboard Student : Tous pointent vers des chemins **sans préfixe** (`/courses`, `/exams`, `/groups`) → ils doivent pointer vers `/student/courses`, `/student/exams`, `/student/groups`

**Solution :**

**Student Dashboard** — Appels API dynamiques :
- `getMyCourses()` → `/professors/me/courses` (non, pour student : utiliser les cours depuis `courseService`)
- Count de cours enrollés → `GET /courses?enrolled=true` ou endpoint étudiant
- Count d'examens → `GET /exams` (avec filtres utilisateur)
- Count de groupes → `GET /groups/me`
- Contributions → count des examens uploadés par l'utilisateur

**Ce que le backend doit envoyer pour le dashboard Student :**
```json
// GET /students/me/stats (endpoint à ajouter au backend)
{
  "enrolledCoursesCount": 5,
  "uploadedExamsCount": 8,
  "myGroupsCount": 3,
  "totalDownloadsReceived": 234
}
```
En attendant cet endpoint, on peut agréger côté frontend :
- `GET /courses` (filtré par enrolled) → `enrolledCoursesCount`
- `GET /exams` (filtré par uploader=me) → `uploadedExamsCount`
- `GET /groups/me` → `myGroupsCount`

**Ce que le backend doit envoyer pour le dashboard Admin :**
```json
// GET /admin/stats
{
  "totalUsers": 156,
  "activeUsers": 142,
  "totalStudents": 120,
  "totalProfessors": 36,
  "totalCourses": 24,
  "totalExams": 89,
  "totalGroups": 18,
  "pendingReports": 5
}
```
**Note** : Cet endpoint `/admin/stats` n'est **pas documenté** dans ENDPIN.md. Il faut le demander au backend ou en agréger les données via plusieurs appels (`/admin/students`, `/admin/professors`, `/admin/courses`, etc.)

**Ce que le backend doit envoyer pour le dashboard Professeur :**
Le dashboard prof est déjà semi-dynamique mais manque :
- Count réel d'étudiants : agréger `getCourseStudents(courseId)` pour chaque cours
- Count de documents : agréger `getCourseResources(courseId)` pour chaque cours

**Fix navigation Student** : Remplacer `/courses` → `/student/courses`, `/exams` → `/student/exams`, `/groups` → `/student/groups`, `/profile` → `/student/profile` dans `DashboardPage.tsx`

---

### #2 — Pages de profil différentes par rôle

**État actuel :**
- Une seule `ProfilePage.tsx` pour tous les rôles
- Utilise des champs legacy (`filiere`, `annee`, `competences`) non alignés sur le backend
- `ProfileEditPage.tsx` envoie `PUT /users/me` avec `{ bio, competences }` — endpoint non documenté

**Solution :**
- Créer **3 pages de profil distinctes** (ou une seule avec rendu conditionnel selon le rôle) :
  - **Student Profile** : `major`, `currentYear`, `bio`, `isProfilePublic`, `profilePictureUrl`, liste d'examens partagés, groupes
  - **Professor Profile** : `department`, `title`, `bio`, courses assignés
  - **Admin Profile** : `adminLevel`, `email`, readonly pour la plupart
- Chaque profil doit charger les données depuis l'API via `GET /users/me`
- Champs modifiables selon le rôle :
  - Student : `bio`, `isProfilePublic`, photo, (major/year en lecture seule)
  - Professor : `bio`, `department`, `title`, photo
  - Admin : `email` uniquement (si permis)

**Endpoints requis :**
```
GET  /users/me           → CurrentUserResponse (existe)
PUT  /users/me           → UpdateProfileRequest (à confirmer côté backend)
POST /users/me/avatar    → multipart (à confirmer côté backend)
```

---

### #3 — Consulter le profil d'un autre étudiant

**État actuel :**
- La route `/student/profile/:id` existe dans `App.tsx` l. 107
- `ProfilePage.tsx` reçoit `id` via `useParams` mais **ignore complètement le paramètre** : il affiche toujours le profil connecté (`user`)
- Aucun appel API pour charger le profil d'un autre étudiant

**Solution :**
Modifier `ProfilePage.tsx` pour :
1. Si `id` est absent ou == `user.id` → afficher le profil de l'utilisateur connecté (via `useAuth`)
2. Si `id` est présent → appeler `GET /users/{id}/profile` pour charger le profil public
3. Afficher différemment selon `isOwnProfile` (masquer le bouton "Modifier" si ce n'est pas son profil)
4. Afficher les boutons "Suivre/Ne plus suivre" et "Envoyer un message" pour les profils d'autres étudiants

**Endpoints requis :**
```
GET /users/{id}/profile  → StudentProfileFrontend (existe dans userService.ts)
GET /follows/{id}/status → boolean (existe dans followService.ts)
POST /follows/{id}       → suivre
DELETE /follows/{id}     → ne plus suivre
```

---

### #4 — Professeur peut enrôler des étudiants dans ses cours

**État actuel :**
- Seul `enrollStudent()` dans `adminService.ts` existe → `POST /admin/students/{studentId}/enroll/{courseId}`
- Aucune interface dans le dashboard professeur pour enrôler des étudiants

**Solution :**
Ajouter dans `ProfessorStudentsPage.tsx` (qui existe déjà) :
1. Afficher les étudiants par cours avec option d'enrôlement
2. Créer un bouton "Inscrire un étudiant" dans chaque cours du professeur
3. Un modal permettant de rechercher un étudiant et de l'inscrire

> [!IMPORTANT]
> Le backend ENDPIN.md ne montre **pas** d'endpoint `POST /professors/me/courses/{courseId}/enroll/{studentId}`. L'endpoint actuel pour inscrire est `/admin/students/{studentId}/enroll/{courseId}` qui est admin-only. **Deux options :**
> 1. Demander au backend un endpoint prof pour enrôler : `POST /professors/me/courses/{courseId}/students/{studentId}`
> 2. Utiliser l'endpoint admin existant (si les permissions le permettent)

**Endpoints à utiliser/créer :**
```
POST /professors/me/courses/{courseId}/students/{studentId}  [À CRÉER côté backend]
GET  /professors/me/courses/{courseId}/students              [Existe]
GET  /admin/students                                          [Existe, pour la liste de tous les étudiants]
```

---

### #5 — Rejoindre un groupe privé

**État actuel :**
- `requestJoinGroup()` existe dans `groupService.ts` → `POST /groups/{id}/request-join`
- La page `GroupDetailPage.tsx` ou `GroupListPage.tsx` n'expose pas ce bouton de manière claire pour les groupes privés
- Il n'y a pas de gestion des demandes en attente pour l'admin du groupe

**Solution proposée :**
Le workflow pour les groupes privés :
1. **Sur `GroupListPage`** : Pour les groupes PRIVÉS, afficher un bouton "Demander à rejoindre" (au lieu de "Voir")
2. **Sur `GroupDetailPage`** : Si groupe privé et non-membre → afficher panel "Demande d'accès" avec bouton
3. **Côté admin du groupe** : Dans `GroupDetailPage`, afficher les membres avec statut `PENDING` et permettre d'approuver/refuser

**Endpoints requis :**
```
POST /groups/{id}/request-join        → demande (existe dans groupService.ts)
GET  /groups/{id}/members?status=PENDING → membres en attente [à vérifier backend]
PUT  /groups/{id}/members/{userId}    → modifier statut → approuver (existe)
DELETE /groups/{id}/members/{userId}  → refuser (existe)
```

**UI à implémenter :**
- Badge "En attente" si la demande est déjà envoyée (vérifier status dans `members`)
- Bouton "Annuler la demande" si déjà en pending
- Section "Demandes en attente" dans la gestion du groupe (pour l'admin)

---

### #6 — Page signalements avec données dynamiques des documents signalés

**État actuel :**
- `AdminReportsPage.tsx` appelle `getReports()` → `GET /admin/reports` (✅ existe)
- Au `catch`, revient sur `MOCK_REPORTS` qui ont des types incorrects (`id: 1` number au lieu de string, `examId: 5` number, `userId: 3` number)
- Le type `ExamReport` dans `types/index.ts` attend des `string` dans les vraies définitions mais les mocks utilisent des `number`
- `toggleExamVisibility(report.examId, true)` — `examId` est `string` dans le type mais les mocks ont des `number`

**Solution :**
1. Supprimer les MOCK_REPORTS → afficher un état vide si l'API échoue
2. Corriger le type `ExamReport` pour qu'il corresponde exactement à la réponse backend
3. Ajouter l'**affichage des documents signalés** (examens) avec un lien direct vers l'épreuve
4. Ajouter une colonne "Document lié" avec prévisualisation
5. Ajouter la pagination

**Structure correcte du type ExamReport :**
```typescript
export interface ExamReport {
  id: string;           // UUID
  examId: string;       // UUID du document (ExamSummary.id)
  examTitle: string;    // Titre de l'épreuve
  reporterId: string;   // UUID StudentProfile du signaleur
  reporterName: string;
  reason: ReportReason;
  status: ReportStatus;
  description?: string;
  createdAt: string;
}
```

---

### #7 — Icône de notification dynamique

**État actuel :**
- `Topbar.tsx` : `badgeContent={3}` **hardcodé** (ligne 141)
- `NotificationContext.tsx` existe et gère `unreadCount` mais **n'est pas connecté** à la Topbar
- Le contexte est alimenté uniquement by `addNotification()` manuellement, jamais depuis une API

**Solution :**
1. **Connecter la Topbar au NotificationContext** : Utiliser `useContext(NotificationContext)` pour lire `unreadCount`
2. **Charger les notifications depuis l'API** au démarrage dans `NotificationContext.tsx`
3. **WebSocket** : S'abonner à `/user/queue/notifications` pour les nouvelles notifs en temps réel

**Endpoints requis :**
```
GET /notifications           → NotificationResponse[] (endpoint à confirmer côté backend)
GET /notifications?unread=true → count des non lues
PUT /notifications/{id}/read → marquer comme lue
PUT /notifications/read-all  → tout marquer lu
```
> [!WARNING]
> Ces endpoints de notifications ne sont **pas documentés** dans ENDPIN.md. Il faut les demander au backend ou les simuler via WebSocket uniquement.

**Implémentation WS** : Se connecter à `/user/queue/notifications` (format `WsNotification`) et incrémenter le badge à chaque nouvelle notif.

---

### #8 — Suppression/modification des messages par l'étudiant

**État actuel :**
- `DirectChatPage.tsx` : aucune option delete/edit sur les messages
- `GroupChatPage.tsx` : idem
- Le type `ChatMessageResponse` a `isEdited: boolean` et `editedAt` → le backend supporte la modification

**Solution :**
1. **Édition** : Clic droit ou bouton "..." sur les messages → mode édition inline avec sauvegarde
2. **Suppression** : Option "Supprimer" → confirmation → message remplacé par "Message supprimé"
3. **Historique** : Afficher "· modifié" si `isEdited === true` (déjà dans le code : ligne 214 de DirectChatPage)
4. **Restriction** : Seulement sur ses propres messages (`isOwnMessage === true`)

**Endpoints requis (à ajouter au backend) :**
```
PUT    /messages/{messageId}    → { content: string }  → modifier un message
DELETE /messages/{messageId}    → supprimer un message
```
> [!IMPORTANT]
> Ces endpoints de modification/suppression de messages ne sont **pas dans ENDPIN.md**. Il faudra les demander au backend.

---

## Résumé des endpoints backend nécessaires (non documentés)

| Endpoint | Méthode | Usage |
|---|---|---|
| `/admin/stats` | GET | Dashboard admin (stats globales) |
| `/students/me/stats` | GET | Dashboard student (stats perso) |
| `/professors/me/courses/{courseId}/students/{studentId}` | POST | Professeur inscrit un étudiant |
| `/notifications` | GET | Liste des notifications |
| `/notifications/{id}/read` | PUT | Marquer comme lue |
| `/messages/{messageId}` | PUT | Modifier un message |
| `/messages/{messageId}` | DELETE | Supprimer un message |
| `/users/me` | PUT | Mettre à jour le profil |

---

## Proposed Changes

### Corrections rapides (fix bugs)

#### [MODIFY] DashboardPage.tsx
- Corriger les URLs de navigation : `/courses` → `/student/courses`, `/exams` → `/student/exams`, etc.
- Appel API dynamique pour les stats student
- Activité récente dynamique

#### [MODIFY] Topbar.tsx
- Connecter `badgeContent` au `NotificationContext.unreadCount`

#### [MODIFY] AdminReportsPage.tsx
- Supprimer MOCK_REPORTS
- Corriger les types
- Ajouter colonne "Document lié"

---

### Feature : Profils différenciés par rôle

#### [MODIFY] ProfilePage.tsx
- Détecter le rôle et afficher les bons champs
- Charger le profil distant si `id` ≠ utilisateur connecté
- Bouton Suivre/Message pour les profils d'autres étudiants

#### [MODIFY] ProfileEditPage.tsx
- Adapter les champs éditables par rôle (STUDENT / PROFESSOR / ADMIN)
- Aligner les champs sur les types backend réels

---

### Feature : Enrôlement par le professeur

#### [MODIFY] ProfessorStudentsPage.tsx
- Ajouter un bouton "Inscrire un étudiant" par cours
- Modal avec recherche d'étudiant
- Appel `POST /professors/me/courses/{courseId}/students/{studentId}` (ou admin endpoint)

---

### Feature : Groupes privés — demande d'adhésion

#### [MODIFY] GroupListPage.tsx / GroupDetailPage.tsx
- Afficher "Demander à rejoindre" pour les groupes PRIVATE
- Section "En attente d'approbation" pour l'admin du groupe

---

### Feature : Chat — Édition/Suppression de messages

#### [MODIFY] DirectChatPage.tsx
- Menu contextuel sur ses propres messages
- Mode édition inline
- Confirmation de suppression

#### [MODIFY] GroupChatPage.tsx
- Même chose que DirectChatPage

#### [NEW] messageService.ts
- Ajouter `editMessage(id, content)` et `deleteMessage(id)`

---

## Verification Plan

### Tests manuels
1. Student : vérifier que les boutons du dashboard naviguent vers les bonnes pages
2. Admin : vérifier que les stats s'affichent depuis l'API (ou skeleton si KO)
3. Profil : vérifier les 3 variantes (student, prof, admin)
4. Profil public : naviguer vers `/student/profile/{id}` depuis la page réseau
5. Groupes : tester le workflow "demande → approbation" avec un groupe privé
6. Notifications : créer une annonce et vérifier que le badge se met à jour
7. Messages : modifier et supprimer un message

### Notes pour le backend
Les endpoints marqués ⚠️ dans le tableau ci-dessus doivent être implémentés côté Spring Boot avant que les fonctionnalités frontend correspondantes soient activées.
