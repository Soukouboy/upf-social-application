# Admin - Endpoints et format des requêtes JSON

Ce document liste l'ensemble des endpoints ajoutés récemment dans `AdminController` et précise le format exact des requêtes JSON attendues par le frontend.

> Base path : `/admin`

---

## 1. Création initiale d'un compte admin

- Méthode : `POST`
- URL : `/admin/bootstrap/initial`
- Corps JSON attendu :

```json
{
  "firstName": "Alice",
  "lastName": "Dupont",
  "email": "alice@example.com",
  "password": "MonMotDePasse123",
  "adminLevel": "SUPER_ADMIN"
}
```

- Notes : endpoint public utilisable uniquement si aucun admin n'existe encore.

---

## 2. Création d'un compte admin/modérateur

- Méthode : `POST`
- URL : `/admin/accounts`
- Corps JSON attendu :

```json
{
  "firstName": "Bob",
  "lastName": "Martin",
  "email": "bob@example.com",
  "password": "SecurePass",
  "adminLevel": "MODERATOR"
}
```

- Notes : nécessite un admin authentifié.

---

## 3. Promotion d'un étudiant en admin/modérateur

- Méthode : `POST`
- URL : `/admin/students/{studentId}/promote`
- Corps JSON attendu :

```json
{
  "adminLevel": "ADMIN"
}
```

- Notes : `{studentId}` est un UUID d'étudiant.

---

## 4. Liste des admins

- Méthode : `GET`
- URL : `/admin/accounts`
- Corps : aucun
- Notes : nécessite un admin authentifié.

---

## 5. Récupération d'un profil admin

- Méthode : `GET`
- URL : `/admin/accounts/{adminProfileId}`
- Corps : aucun
- Notes : `{adminProfileId}` est un UUID de profil admin.

---

## 6. Mise à jour du niveau d'un admin

- Méthode : `PUT`
- URL : `/admin/accounts/{adminProfileId}/level`
- Corps JSON attendu :

```json
{
  "adminLevel": "MODERATOR"
}
```

- Notes : nécessite un admin authentifié.

---

## 7. Révocation des droits admin

- Méthode : `DELETE`
- URL : `/admin/accounts/{adminProfileId}`
- Corps : aucun
- Notes : nécessite un admin authentifié.

---

## 8. Création d'un compte professeur

- Méthode : `POST`
- URL : `/admin/professors`
- Corps JSON attendu :

```json
{
  "firstName": "Claire",
  "lastName": "Bernard",
  "email": "claire@example.com",
  "password": "ProfPass456",
  "department": "Informatique",
  "title": "Maître de conférences",
  "courseIds": [
    "11111111-1111-1111-1111-111111111111",
    "22222222-2222-2222-2222-222222222222"
  ]
}
```

- Notes : `courseIds` peut être vide ou contenir plusieurs UUID de cours.

---

## 9. Affectation d'un cours à un professeur

- Méthode : `PUT`
- URL : `/admin/professors/{professorId}/courses/{courseId}`
- Corps : aucun
- Notes : utilise uniquement des paramètres de chemin.

---

## 10. Liste des professeurs

- Méthode : `GET`
- URL : `/admin/professors`
- Corps : aucun
- Notes : nécessite un admin authentifié.

---

## 11. Liste des étudiants

- Méthode : `GET`
- URL : `/admin/students`
- Corps : aucun

---

## 12. Inscription d'un étudiant à un cours

- Méthode : `POST`
- URL : `/admin/students/{studentId}/enroll/{courseId}`
- Corps : aucun
- Notes : `{studentId}` et `{courseId}` sont des UUID.

---

## 13. Désinscription d'un étudiant d'un cours

- Méthode : `DELETE`
- URL : `/admin/students/{studentId}/enroll/{courseId}`
- Corps : aucun

---

## 14. Statistiques admin

- Méthode : `GET`
- URL : `/admin/stats`
- Corps : aucun
- Notes : nécessite un admin authentifié.

---

## 15. Liste des rapports

- Méthode : `GET`
- URL : `/admin/reports`
- Corps : aucun
- Notes : nécessite un admin authentifié.

---

## 16. Résolution d'un rapport

- Méthode : `PUT`
- URL : `/admin/reports/{reportId}/resolve`
- Paramètre de requête : `accept` (boolean)

Exemple :

```
PUT /admin/reports/33333333-3333-3333-3333-333333333333/resolve?accept=true
```

- Corps : aucun
- Notes : nécessite un admin authentifié.

---

## 17. Suppression d'un professeur

- Méthode : `DELETE`
- URL : `/admin/professors/{professorId}`
- Corps : aucun
- Notes : nécessite un admin authentifié.

---

## 18. Désactivation d'un professeur

- Méthode : `PUT`
- URL : `/admin/professors/{professorId}/deactivate`
- Corps : aucun
- Notes : nécessite un admin authentifié.

---

## 19. Suspension d'un utilisateur

- Méthode : `PUT`
- URL : `/admin/users/{userId}/suspend`
- Corps : aucun
- Notes : `{userId}` peut être un étudiant ou un professeur.

---

## 20. Réactivation d'un utilisateur

- Méthode : `PUT`
- URL : `/admin/users/{userId}/reactivate`
- Corps : aucun

---

## 21. Suppression d'un groupe

- Méthode : `DELETE`
- URL : `/admin/groups/{groupId}`
- Corps : aucun
- Notes : nécessite un admin authentifié.

---

## 22. Désactivation d'un groupe

- Méthode : `PUT`
- URL : `/admin/groups/{groupId}/deactivate`
- Corps : aucun

---

## 23. Désactivation d'un cours

- Méthode : `PUT`
- URL : `/admin/courses/{courseId}/deactivate`
- Corps : aucun
- Notes : nécessite un admin authentifié.

---

## Valeurs possibles pour `adminLevel`

Les valeurs valides de l'enum `AdminLevel` sont :

- `SUPER_ADMIN`
- `ADMIN`
- `MODERATOR`

---

## Rappels importants

- Pour tous les endpoints protégés par `@PreAuthorize("hasRole('ADMIN')")`, le frontend doit envoyer le token JWT dans l'en-tête `Authorization: Bearer <token>`.
- Les endpoints sans corps JSON attendent uniquement les paramètres de chemin ou de requête.
- Pour les corps JSON, le backend attend des noms de champs en `camelCase` exactement comme indiqué ci-dessus.
