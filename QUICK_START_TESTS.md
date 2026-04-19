# 🚀 QUICK START GUIDE - TESTER LES ENDPOINTS ATTENDANCE

## 📋 Prérequis

1. **Application running**: `mvn spring-boot:run`
2. **Database ready**: Tables créées via Hibernate (ou exécuter db-attendance-migration.sql)
3. **JWT Token**: Obtenez un token via `/api/v1/auth/login`
4. **Postman/Thunder Client**: Client HTTP pour les requêtes

---

## 🔐 Authentification

### Étape 1: Obtenir un Token JWT

```bash
POST http://localhost:8080/auth/login
Content-Type: application/json

{
  "email": "professor@upf.ac.ma",  
  "password": "password123"
}

# Réponse:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "expiresIn": 3600
}
```

### Étape 2: Ajouter Token dans Header (pour toutes les requêtes)

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧪 Scénarios de Test

### Scénario 1: Créer une Séance (Professeur/Admin)

**Endpoint**: `POST /api/v1/attendance/courses/{courseId}/sessions`

```bash
POST http://localhost:8080/attendance/courses/550e8400-e29b-41d4-a716-446655440001/sessions
Content-Type: application/json
Authorization: Bearer [JWT_TOKEN]

{
  "sessionDate": "2024-01-15",
  "sessionNumber": 1,
  "description": "Introduction au cours"
}

# ✅ Réponse 201 Created:
{
  "id": "660e8400-e29b-41d4-a716-446655440002",
  "courseId": "550e8400-e29b-41d4-a716-446655440001",
  "sessionDate": "2024-01-15",
  "sessionNumber": 1,
  "description": "Introduction au cours",
  "isLocked": false,
  "lockedAt": null,
  "createdAt": "2024-01-15T10:30:00"
}

# ❌ Erreur 400 Bad Request (date invalide):
{
  "errors": {
    "sessionDate": "La date de séance est obligatoire"
  }
}

# ❌ Erreur 403 Forbidden (pas assez de permissions):
{
  "error": "Access Denied"
}
```

**Points de Test**:
- [ ] Format date YYYY-MM-DD accepté
- [ ] sessionNumber >= 1 exigé
- [ ] description max 300 caractères
- [ ] Non-ADMIN/MODERATOR reçoit 403

---

### Scénario 2: Lister les Séances d'un Cours

**Endpoint**: `GET /api/v1/attendance/courses/{courseId}/sessions`

```bash
GET http://localhost:8080/attendance/courses/550e8400-e29b-41d4-a716-446655440001/sessions
Authorization: Bearer [JWT_TOKEN]

# ✅ Réponse 200 OK:
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440002",
    "courseId": "550e8400-e29b-41d4-a716-446655440001",
    "sessionDate": "2024-01-15",
    "sessionNumber": 1,
    "description": "Introduction au cours",
    "isLocked": false,
    "createdAt": "2024-01-15T10:30:00"
  }
]

# ❌ Erreur 404 Not Found (course inexistante):
{
  "error": "Course not found"
}
```

---

### Scénario 3: Marquer une Présence

**Endpoint**: `POST /api/v1/attendance/sessions/{sessionId}/attendances`

```bash
POST http://localhost:8080/attendance/sessions/660e8400-e29b-41d4-a716-446655440002/attendances
Content-Type: application/json
Authorization: Bearer [JWT_TOKEN]

{
  "enrollmentId": "770e8400-e29b-41d4-a716-446655440003",
  "status": "PRESENT",
  "justification": null
}

# ✅ Réponse 201 Created:
{
  "id": "880e8400-e29b-41d4-a716-446655440004",
  "sessionId": "660e8400-e29b-41d4-a716-446655440002",
  "enrollmentId": "770e8400-e29b-41d4-a716-446655440003",
  "studentId": "550e8400-e29b-41d4-a716-446655440005",
  "firstName": "Jean",
  "lastName": "Dupont",
  "major": "Informatique",
  "currentYear": 3,
  "status": "PRESENT",
  "justification": null,
  "markedAt": "2024-01-15T10:35:00"
}

# ❌ Erreur 400 Bad Request (status invalide):
{
  "errors": {
    "status": "Le statut est obligatoire"
  }
}

# ❌ Erreur 409 Conflict (présence déjà enregistrée):
{
  "error": "Attendance already recorded for this session"
}
```

**Statuts Acceptés**: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`

---

### Scénario 4: Marquer Présences en Bulk

**Endpoint**: `POST /api/v1/attendance/sessions/{sessionId}/attendances/bulk`

```bash
POST http://localhost:8080/attendance/sessions/660e8400-e29b-41d4-a716-446655440002/attendances/bulk
Content-Type: application/json
Authorization: Bearer [JWT_TOKEN]

{
  "attendances": [
    {
      "enrollmentId": "770e8400-e29b-41d4-a716-446655440003",
      "status": "PRESENT"
    },
    {
      "enrollmentId": "770e8400-e29b-41d4-a716-446655440006",
      "status": "ABSENT"
    },
    {
      "enrollmentId": "770e8400-e29b-41d4-a716-446655440007",
      "status": "LATE",
      "justification": "Problème de transport"
    }
  ]
}

# ✅ Réponse 200 OK:
[
  { "id": "...", "status": "PRESENT", ... },
  { "id": "...", "status": "ABSENT", ... },
  { "id": "...", "status": "LATE", ... }
]

# ❌ Erreur 400 Bad Request (liste vide):
{
  "errors": {
    "attendances": "La liste des présences ne peut pas être vide"
  }
}
```

**Points de Test**:
- [ ] Transaction rollback si une seule est invalide
- [ ] Tous les statuts acceptés
- [ ] Justification optionnelle pour tous

---

### Scénario 5: Verrouiller une Séance

**Endpoint**: `PATCH /api/v1/attendance/sessions/{sessionId}/lock`

```bash
PATCH http://localhost:8080/attendance/sessions/660e8400-e29b-41d4-a716-446655440002/lock
Authorization: Bearer [JWT_TOKEN]

# ✅ Réponse 200 OK:
{
  "id": "660e8400-e29b-41d4-a716-446655440002",
  "isLocked": true,
  "lockedAt": "2024-01-15T17:00:00"
}

# ❌ Erreur 400 Bad Request (séance dans le futur):
{
  "error": "Cannot lock future session"
}
```

**Points de Test**:
- [ ] Séance future ne peut pas être verrouillée
- [ ] Une fois verrouillée, isLocked = true
- [ ] Les présences ne peuvent pas être modifiées après verrouillage

---

### Scénario 6: Obtenir Rapport de Présence d'un Cours

**Endpoint**: `GET /api/v1/attendance/courses/{courseId}/report`

```bash
GET http://localhost:8080/attendance/courses/550e8400-e29b-41d4-a716-446655440001/report
Authorization: Bearer [JWT_TOKEN]

# ✅ Réponse 200 OK:
[
  {
    "studentId": "550e8400-e29b-41d4-a716-446655440005",
    "firstName": "Jean",
    "lastName": "Dupont",
    "major": "Informatique",
    "courseId": "550e8400-e29b-41d4-a716-446655440001",
    "courseTitle": "Algorithmes Avancés",
    "totalSessions": 10,
    "presentCount": 8,
    "absentCount": 1,
    "lateCount": 1,
    "excusedCount": 0,
    "absenceRate": 0.1,
    "eligibility": "ELIGIBLE"  # < 30% absence
  },
  {
    "studentId": "550e8400-e29b-41d4-a716-446655440006",
    "firstName": "Marie",
    "lastName": "Martin",
    "major": "Informatique",
    "courseId": "550e8400-e29b-41d4-a716-446655440001",
    "courseTitle": "Algorithmes Avancés",
    "totalSessions": 10,
    "presentCount": 5,
    "absentCount": 4,
    "lateCount": 1,
    "excusedCount": 0,
    "absenceRate": 0.4,
    "eligibility": "RATTRAPAGE_ONLY"  # 30-50% absence
  }
]
```

**Calcul Eligibility**:
- `ELIGIBLE`: absence_rate < 30%
- `RATTRAPAGE_ONLY`: 30% ≤ absence_rate < 50%
- `EXCLUDED`: absence_rate ≥ 50%

---

### Scénario 7: Mon Rapport Personnel (Étudiant)

**Endpoint**: `GET /api/v1/attendance/my/report`

```bash
GET http://localhost:8080/attendance/my/report
Authorization: Bearer [JWT_TOKEN_STUDENT]

# ✅ Réponse 200 OK:
[
  {
    "studentId": "550e8400-e29b-41d4-a716-446655440005",
    "firstName": "Jean",
    "lastName": "Dupont",
    "major": "Informatique",
    "courseTitle": "Algorithmes Avancés",
    "totalSessions": 10,
    "presentCount": 8,
    "absentCount": 1,
    "lateCount": 1,
    "absenceRate": 0.1,
    "eligibility": "ELIGIBLE"
  }
  # Autres cours...
]

# ❌ Erreur 401 Unauthorized:
{
  "error": "Unauthorized"
}
```

**Points de Test**:
- [ ] Étudiant ne voit que ses propres données
- [ ] JWT invalide retourne 401

---

## 📊 Checklist de Tests

### Tests de Succès
- [ ] POST create session → 201
- [ ] GET list sessions → 200
- [ ] POST mark attendance → 201
- [ ] POST bulk attendance → 200
- [ ] PATCH lock session → 200
- [ ] GET course report → 200
- [ ] GET my report → 200

### Tests d'Erreur Validation
- [ ] sessionDate format invalide → 400
- [ ] sessionNumber < 1 → 400
- [ ] status invalide → 400
- [ ] attendances[] vide → 400
- [ ] enrollmentId manquant → 400

### Tests de Sécurité
- [ ] Sans JWT token → 401
- [ ] JWT expiré → 401
- [ ] STUDENT crée session → 403
- [ ] Accès report d'un autre étudiant → 403

### Tests de Logique Métier
- [ ] Enregistrer deux fois même étudiant → 409 Conflict
- [ ] Verrouiller séance future → 400
- [ ] Eligibility calcul: 0% abs → ELIGIBLE
- [ ] Eligibility calcul: 35% abs → RATTRAPAGE_ONLY
- [ ] Eligibility calcul: 60% abs → EXCLUDED

---

## 🔧 Troubleshooting

### Erreur: "Could not commit JPA transaction"
**Cause**: @Transactional manquant  
**Vérification**: Service a `@Service @Transactional` ✅ (déjà fait)

### Erreur: "No endpoint found"
**Cause**: Controller mal configuré  
**Vérification**: Controller a `@RestController @RequestMapping` ✅ (déjà fait)

### Erreur: "NullPointerException on major"
**Cause**: Enum non converti  
**Vérification**: Code utilise `getMajor().getLabel()` ✅ (déjà fait)

### Erreur: "Table not found"
**Cause**: Migration SQL non exécutée  
**Solution**: 
1. Vérifier Hibernate crée tables (logs)
2. Ou exécuter db-attendance-migration.sql manuellement
3. Ou vérifier `spring.jpa.hibernate.ddl-auto=update` dans application.properties

### Erreur: "Access Denied"
**Cause**: @PreAuthorize restrictif  
**Vérification**: Utiliser JWT token avec rôle ADMIN/MODERATOR pour create session

---

## 📝 Notes Important

1. **Uniqueness**: Un seul enregistrement de présence par (session, student)
2. **Locking**: Une fois verrouillée, les présences ne peuvent pas être modifiées
3. **Eligibility**: Calculée automatiquement basée sur taux d'absence
4. **Cascade**: Supprimer une séance supprime toutes ses présences

---

*Prêt à tester? Commencez par le Scénario 1! 🚀*
