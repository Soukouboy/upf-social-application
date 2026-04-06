# API Endpoints Documentation

Ce document liste tous les endpoints des contrôleurs suivants avec leurs types de réponse en format JSON :
- ChatController
- AdminController
- AdminCourseController
- ProfessorController
- WebSocketController
- FollowController

## ChatController (`/messages`)

### Messages de groupe
- **POST** `/messages/groups/{groupId}`
  - **Description**: Envoyer un message dans un groupe
  - **Paramètres**: `groupId` (UUID), `content` (string)
  - **Réponse**: `ChatMessageResponse`
    ```json
    {
      "messageId": "uuid",
      "content": "string",
      "senderName": "string",
      "senderId": "uuid",
      "groupId": "uuid",
      "recipientId": null,
      "messageType": "TEXT",
      "isEdited": false,
      "editedAt": "2026-04-06T10:30:00",
      "sentAt": "2026-04-06T10:30:00"
    }
    ```

- **GET** `/messages/groups/{groupId}`
  - **Description**: Récupérer les messages d'un groupe
  - **Paramètres**: `groupId` (UUID), pagination (page, size, sort)
  - **Réponse**: `Page<ChatMessageResponse>`
    ```json
    {
      "content": [ChatMessageResponse],
      "pageable": {...},
      "totalElements": 0,
      "totalPages": 0,
      "size": 0,
      "number": 0,
      "first": true,
      "last": true,
      "empty": false
    }
    ```

### Messages privés
- **POST** `/messages/private`
  - **Description**: Envoyer un message privé
  - **Paramètres**: `recipientId` (UUID), `content` (string)
  - **Réponse**: `ChatMessageResponse` (même structure qu'au-dessus)

- **GET** `/messages/private`
  - **Description**: Lister toutes les conversations privées
  - **Paramètres**: pagination (page, size, sort)
  - **Réponse**: `Page<PrivateConversationSummaryResponse>`
    ```json
    {
      "content": [
        {
          "otherUserId": "uuid",
          "lastMessageAt": "2026-04-06T10:30:00"
        }
      ],
      "pageable": {...},
      "totalElements": 0,
      "totalPages": 0,
      "size": 0,
      "number": 0,
      "first": true,
      "last": true,
      "empty": false
    }
    ```

- **GET** `/messages/private/{otherUserId}`
  - **Description**: Récupérer la conversation privée avec un utilisateur spécifique
  - **Paramètres**: `otherUserId` (UUID), pagination (page, size, sort)
  - **Réponse**: `Page<ChatMessageResponse>` (même structure que pour les messages de groupe)

## AdminController (`/admin`)

### Bootstrap et comptes admin
- **POST** `/admin/bootstrap/initial`
  - **Description**: Créer le premier admin (bootstrap)
  - **Paramètres**: `firstName`, `lastName`, `email`, `password`, `adminLevel`
  - **Réponse**: `AdminProfileResponse`
    ```json
    {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "adminLevel": "SUPER_ADMIN|ADMIN|MODERATOR",
      "createdAt": "2026-04-06T10:30:00",
      "updatedAt": "2026-04-06T10:30:00"
    }
    ```

- **POST** `/admin/accounts`
  - **Description**: Créer un compte admin/modérateur
  - **Paramètres**: `firstName`, `lastName`, `email`, `password`, `adminLevel`
  - **Réponse**: `AdminProfileResponse` (même structure)

- **POST** `/admin/students/{studentId}/promote`
  - **Description**: Promouvoir un étudiant en admin
  - **Paramètres**: `studentId` (UUID), `adminLevel`
  - **Réponse**: `AdminProfileResponse` (même structure)

- **GET** `/admin/accounts`
  - **Description**: Lister tous les admins
  - **Réponse**: `List<AdminProfileResponse>`

- **GET** `/admin/accounts/{adminProfileId}`
  - **Description**: Récupérer un profil admin
  - **Paramètres**: `adminProfileId` (UUID)
  - **Réponse**: `AdminProfileResponse` (même structure)

- **PUT** `/admin/accounts/{adminProfileId}/level`
  - **Description**: Modifier le niveau d'un admin
  - **Paramètres**: `adminProfileId` (UUID), `adminLevel`
  - **Réponse**: `AdminProfileResponse` (même structure)

- **DELETE** `/admin/accounts/{adminProfileId}`
  - **Description**: Révoquer les droits admin
  - **Paramètres**: `adminProfileId` (UUID)
  - **Réponse**: HTTP 204 No Content

### Gestion des professeurs
- **POST** `/admin/professors`
  - **Description**: Créer un compte professeur
  - **Paramètres**: `firstName`, `lastName`, `email`, `password`, `department`, `title`, `courseIds`
  - **Réponse**: `ProfessorProfileResponse`
    ```json
    {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "department": "string",
      "title": "string",
      "courses": [CourseSummary],
      "createdAt": "2026-04-06T10:30:00",
      "updatedAt": "2026-04-06T10:30:00"
    }
    ```

- **PUT** `/admin/professors/{professorId}/courses/{courseId}`
  - **Description**: Assigner un cours à un professeur
  - **Paramètres**: `professorId` (UUID), `courseId` (UUID)
  - **Réponse**: `ProfessorProfileResponse` (même structure)

### Gestion des étudiants
- **GET** `/admin/students`
  - **Description**: Lister tous les étudiants
  - **Réponse**: `List<StudentProfileSummary>`
    ```json
    [
      {
        "id": "uuid",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "major": "string",
        "currentYear": 1,
        "profilePictureUrl": "string"
      }
    ]
    ```

- **POST** `/admin/students/{studentId}/enroll/{courseId}`
  - **Description**: Inscrire un étudiant à un cours
  - **Paramètres**: `studentId` (UUID), `courseId` (UUID)
  - **Réponse**: `EnrollmentResponse`
    ```json
    {
      "id": "uuid",
      "studentId": "uuid",
      "courseId": "uuid",
      "enrolledAt": "2026-04-06T10:30:00",
      "status": "ACTIVE|COMPLETED|DROPPED"
    }
    ```

- **DELETE** `/admin/students/{studentId}/enroll/{courseId}`
  - **Description**: Désinscrire un étudiant d'un cours
  - **Paramètres**: `studentId` (UUID), `courseId` (UUID)
  - **Réponse**: HTTP 204 No Content

## AdminCourseController (`/admin/courses`)

- **POST** `/admin/courses`
  - **Description**: Créer un cours
  - **Paramètres**: `name`, `description`, `code`, `credits`, `department`, `semester`, `professorIds`
  - **Réponse**: `CourseSummary`
    ```json
    {
      "id": "uuid",
      "name": "string",
      "code": "string",
      "description": "string",
      "credits": 0,
      "department": "string",
      "semester": "string",
      "professorNames": ["string"],
      "isActive": true,
      "createdAt": "2026-04-06T10:30:00",
      "updatedAt": "2026-04-06T10:30:00"
    }
    ```

- **PUT** `/admin/courses/{courseId}`
  - **Description**: Modifier un cours
  - **Paramètres**: `courseId` (UUID), données du cours
  - **Réponse**: `CourseSummary` (même structure)

- **GET** `/admin/courses/{courseId}`
  - **Description**: Récupérer un cours
  - **Paramètres**: `courseId` (UUID)
  - **Réponse**: `CourseSummary` (même structure)

- **GET** `/admin/courses`
  - **Description**: Lister tous les cours
  - **Paramètres**: pagination (page, size, sort)
  - **Réponse**: `Page<CourseSummary>` (même structure que Page)

- **PATCH** `/admin/courses/{courseId}/activate`
  - **Description**: Activer un cours
  - **Paramètres**: `courseId` (UUID)
  - **Réponse**: `CourseSummary` (même structure)

- **PATCH** `/admin/courses/{courseId}/deactivate`
  - **Description**: Désactiver un cours
  - **Paramètres**: `courseId` (UUID)
  - **Réponse**: `CourseSummary` (même structure)

- **DELETE** `/admin/courses/{courseId}`
  - **Description**: Supprimer un cours
  - **Paramètres**: `courseId` (UUID)
  - **Réponse**: HTTP 204 No Content

## ProfessorController (`/professors`)

- **GET** `/professors/me/courses`
  - **Description**: Récupérer mes cours (professeur)
  - **Réponse**: `List<CourseSummary>` ou HTTP 204 si vide

- **GET** `/professors/me/courses/{courseId}/students`
  - **Description**: Récupérer les étudiants d'un de mes cours
  - **Paramètres**: `courseId` (UUID)
  - **Réponse**: `List<StudentProfileSummary>` (même structure que dans AdminController)

- **POST** `/professors/me/courses/{courseId}/resources`
  - **Description**: Uploader une ressource pour un cours
  - **Paramètres**: `courseId` (UUID), `title`, `fileType`, `isExternal`, fichier multipart
  - **Réponse**: `CourseResourceResponse`
    ```json
    {
      "id": "uuid",
      "courseId": "uuid",
      "title": "string",
      "fileUrl": "string",
      "fileType": "PDF|VIDEO|IMAGE|DOCUMENT",
      "fileSize": 0,
      "isExternal": false,
      "uploadedBy": "uuid",
      "uploadedAt": "2026-04-06T10:30:00"
    }
    ```

- **POST** `/professors/me/courses/{courseId}/announcements`
  - **Description**: Créer une annonce pour un cours
  - **Paramètres**: `courseId` (UUID), `title`, `content`
  - **Réponse**: `AnnouncementResponse`
    ```json
    {
      "id": "uuid",
      "courseId": "uuid",
      "title": "string",
      "content": "string",
      "createdBy": "uuid",
      "createdAt": "2026-04-06T10:30:00",
      "updatedAt": "2026-04-06T10:30:00"
    }
    ```

- **DELETE** `/professors/me/announcements/{announcementId}`
  - **Description**: Supprimer une annonce
  - **Paramètres**: `announcementId` (UUID)
  - **Réponse**: HTTP 204 No Content

## WebSocketController (WebSocket)

### Messages WebSocket
- **WebSocket** `/app/chat/group/{groupId}`
  - **Description**: Envoyer un message de groupe via WebSocket
  - **Destination**: `/topic/group/{groupId}`
  - **Payload entrant**: `ChatMessageRequest`
    ```json
    {
      "content": "string"
    }
    ```
  - **Payload sortant**: `ChatMessageResponse` (même structure que REST)

- **WebSocket** `/app/chat/private/{recipientId}`
  - **Description**: Envoyer un message privé via WebSocket
  - **Destination**: `/user/{recipientEmail}/queue/messages`
  - **Payload entrant**: `ChatMessageRequest` (même structure)
  - **Payload sortant**: `ChatMessageResponse` (même structure)

## FollowController (`/follows`)

- **POST** `/follows/{followedId}`
  - **Description**: Suivre un utilisateur
  - **Paramètres**: `followedId` (UUID)
  - **Réponse**: HTTP 201 Created

- **DELETE** `/follows/{followedId}`
  - **Description**: Se désabonner d'un utilisateur
  - **Paramètres**: `followedId` (UUID)
  - **Réponse**: HTTP 204 No Content

- **GET** `/follows/me/followers`
  - **Description**: Récupérer mes followers
  - **Réponse**: `List<StudentProfile>`
    ```json
    [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "firstName": "string",
          "lastName": "string",
          "email": "string"
        },
        "profilePictureUrl": "string",
        "bio": "string",
        "major": "string",
        "currentYear": 1,
        "isProfilePublic": true
      }
    ]
    ```

- **GET** `/follows/me/following`
  - **Description**: Récupérer les utilisateurs que je suis
  - **Réponse**: `List<StudentProfile>` (même structure)

- **GET** `/follows/{studentId}/followers`
  - **Description**: Récupérer les followers d'un étudiant
  - **Paramètres**: `studentId` (UUID)
  - **Réponse**: `List<StudentProfile>` (même structure)

- **GET** `/follows/{followedId}/status`
  - **Description**: Vérifier si je suis un utilisateur
  - **Paramètres**: `followedId` (UUID)
  - **Réponse**: `boolean`

---

## Notes importantes

1. **Authentification**: La plupart des endpoints nécessitent une authentification (JWT token)
2. **Autorisation**: Certains endpoints ont des restrictions de rôle (@PreAuthorize)
3. **Pagination**: Les endpoints GET avec pagination utilisent les paramètres standard Spring (page, size, sort)
4. **UUID**: Tous les identifiants sont des UUID v4
5. **Dates**: Toutes les dates sont en format ISO 8601 (LocalDateTime)
6. **WebSocket**: Nécessite une connexion STOMP pour les messages temps réel
7. **Fichiers**: Les uploads utilisent multipart/form-data
8. **Erreurs**: Les erreurs suivent le format standard Spring Boot avec message et code HTTP approprié</content>
<parameter name="filePath">c:\Users\Soukouboy\OneDrive\Desktop\4e année\S8\Projet hackaton mini social media\application\API_ENDPOINTS.md