# 📋 Guide d'Utilisation Complet — UPF Social

> **Version** : 1.0  
> **Application** : Mini Réseau Social Académique — UPF Campus Rabat  
> **Audience** : Testeurs fonctionnels  
> **Date** : Avril 2026

---

## 📦 1. Installation & Démarrage

### Prérequis
- **Node.js** version 18+ installé
- Un terminal (PowerShell, CMD, ou Terminal VS Code)

### Lancement
```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev
```

L'application sera accessible à l'adresse : **https://upf-social2.vercel.app**

### Configuration backend
Le fichier `.env` à la racine contient :
```env
VITE_API_URL=https://soukouboy-upf-connect-backend.hf.space
VITE_WS_URL=wss://soukouboy-upf-connect-backend.hf.space/ws
```

## 🔐 2. Comptes de Test

### Compte Étudiant
| Champ | Valeur |
|---|---|
| **Email** | `etudiant@upf.ac.ma` |
| **Mot de passe** | `Test1234@` |
| **Rôle** | `STUDENT` |

### Compte Professeur
| Champ | Valeur |
|---|---|
| **Email** | `prof@upf.ac.ma` |
| **Mot de passe** | `Test1234@` |
| **Rôle** | `PROFESSOR` |

### Compte Administrateur
| Champ | Valeur |
|---|---|
| **Email** | `admin@upf.ac.ma` |
| **Mot de passe** | `Test1234!` |
| **Rôle** | `ADMIN` |

### Compte Étudiant Secondaire (pour tester le réseau et les messages)
| Champ | Valeur |
|---|---|
| **Email** | `etudiant2@upf.ac.ma` |
| **Mot de passe** | `Test1234!` |
| **Rôle** | `STUDENT` |



## 🎓 3. Profil ÉTUDIANT — Guide de Test

### 3.1 Connexion & Inscription

| # | Action | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | **Inscription** | Aller à `/register` → Remplir tous les champs (prénom, nom, email `@upf.ac.ma`, mot de passe, filière, année) → Cliquer **S'inscrire** | Redirection vers `/student/dashboard` |
| 2 | **Connexion** | Aller à `/login` → Entrer email + mot de passe → Cliquer **Se connecter** | Redirection vers `/student/dashboard` |
| 3 | **Déconnexion** | Cliquer sur l'icône de profil (sidebar) → **Déconnexion** | Redirection vers `/login` |

---

### 3.2 Dashboard Étudiant (`/student/dashboard`)

| # | Action | Résultat attendu |
|---|---|---|
| 1 | **Voir les statistiques** | 4 cartes de stats affichées : Mes cours, Épreuves partagées, Mes groupes, Contributions — chiffres dynamiques depuis l'API |
| 2 | **Annonces récentes** | Liste des dernières annonces de cours (si existantes) |
| 3 | **Mes groupes récents** | Liste des groupes rejoints, cliquables |
| 4 | **Accès rapides** | Liens vers Déposer épreuve, Créer groupe, Explorer cours |

---

### 3.3 Cours (`/student/courses`)

| # | Action | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | **Lister les cours** | Naviguer vers `/student/courses` | Liste paginée des cours inscrits avec code, titre, filière, crédits |
| 2 | **Voir le détail** | Cliquer sur un cours | Page de détail avec description, objectifs, prérequis, ressources, annonces |
| 3 | **Télécharger une ressource** | Dans le détail → Section Ressources → Cliquer Télécharger | Le fichier est téléchargé (PDF, DOC, etc.) |

---

### 3.4 Épreuves / Annales (`/student/exams`)

| # | Action | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | **Lister les épreuves** | Naviguer vers `/student/exams` | Liste paginée avec filtres (type, matière, année) |
| 2 | **Voir le détail** | Cliquer sur une épreuve | Détail avec vue du fichier, votes, signalement |
| 3 | **Déposer une épreuve** | `/student/exams/upload` → Remplir le formulaire → Sélectionner un fichier → Cliquer **Déposer** | Épreuve créée et visible dans la liste |
| 4 | **Voter** | Dans le détail → Cliquer 👍 ou 👎 | Le compteur de votes se met à jour |
| 5 | **Signaler** | Dans le détail → Cliquer **Signaler** → Choisir une raison → Confirmer | Le signalement est envoyé (visible par l'admin) |
| 6 | **Télécharger** | Cliquer sur le bouton Télécharger | Le fichier PDF/DOC est téléchargé |

---

### 3.5 Profil & Réseau

#### Profil personnel (`/student/profile`)

| # | Action | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | **Voir mon profil** | Naviguer vers `/student/profile` | Informations complètes : photo, nom, bio, filière, année, compétences |
| 2 | **Modifier mon profil** | `/student/profile/edit` → Modifier les champs → **Enregistrer** | Modifications sauvegardées, retour au profil |
| 3 | **Voir le profil d'un autre étudiant** | `/student/profile/:id` (via le réseau ou le chat) | Affiche le profil public si profil public, sinon message restreint |

#### Réseau étudiant (`/student/network`)

| # | Action | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | **Rechercher un étudiant** | Taper un nom ou une filière dans la barre de recherche | Résultats filtrés en temps réel (avec debounce 400ms) |
| 2 | **Suivre un étudiant** | Cliquer **Suivre** sur une carte étudiant | Bouton change en **Ne plus suivre**, le compteur followers augmente |
| 3 | **Se désabonner** | Cliquer **Ne plus suivre** | Bouton revient à **Suivre** |

---

### 3.6 Groupes (`/student/groups`) ⭐ NOUVEAU

| # | Action | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | **Voir la liste des groupes** | Naviguer vers `/student/groups` | **Deux sections** : "Mes groupes" (en haut) et "Groupes recommandés" (en bas) |
| 2 | **Distinction visuelle membre** | Observer les cartes de groupes | Les groupes dont vous êtes membre ont un badge **✅ Membre** et une bordure bleue |
| 3 | **Rejoindre un groupe public** | Dans "Groupes recommandés" → Cliquer **Rejoindre** | Le groupe passe dans la section "Mes groupes" avec les boutons Chat/Membres/Quitter |
| 4 | **Demander à rejoindre un groupe privé** | Cliquer **Demander à rejoindre** sur un groupe privé | Message de confirmation, statut "En attente" |
| 5 | **Ouvrir le chat** | Sur un groupe dont vous êtes membre → Cliquer **💬 Chat** | Redirection vers `/student/groups/:id/chat` |
| 6 | **Voir les membres** | Cliquer l'icône 👥 (Membres) | Redirection vers la page de détail du groupe avec la liste des membres |
| 7 | **Quitter un groupe** | Cliquer **🚪 Quitter** → Confirmer dans la modale | Le groupe est retiré de "Mes groupes" et réapparaît dans "Recommandés" |
| 8 | **Créer un groupe** | Cliquer **+ Créer un nouveau groupe** → Remplir nom, description, filière, type → **Créer** | Groupe créé, redirection vers la page de détail |
| 9 | **Sidebar : raccourci chat** | Dans la sidebar gauche → Liste "Groupes dont vous êtes membre" → Icône 💬 | Ouvre directement le chat du groupe |

---

### 3.7 Chat de Groupe (`/student/groups/:id/chat`)

| # | Action | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | **Voir l'historique** | Ouvrir le chat d'un groupe | Messages précédents chargés via REST, puis WebSocket temps réel |
| 2 | **Envoyer un message** | Taper un texte → Appuyer Entrée ou cliquer ▶ | Le message apparaît immédiatement (côté droit, bulle bleue) |
| 3 | **Modifier un message** | Survoler son propre message → Cliquer ⋮ → **Modifier** | Champ d'édition inline apparaît, modifier le texte → ✅ Sauvegarder |
| 4 | **Supprimer un message** | ⋮ → **Supprimer** → Confirmer dans la modale | Le message disparaît du fil |
| 5 | **Indicateur temps réel** | Observer l'indicateur dans l'en-tête | 🟢 "Connecté (temps réel)" quand WebSocket actif |

---

### 3.8 Messages Privés (`/student/messages`) ⭐ AMÉLIORÉ

| # | Action | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | **Voir les conversations** | Naviguer vers `/student/messages` | Liste des conversations avec **nom et prénom** de l'interlocuteur (et non plus l'ID) |
| 2 | **Rechercher** | Taper un nom dans la barre de recherche | Filtrage par nom/prénom |
| 3 | **Ouvrir une conversation** | Cliquer sur une conversation | Redirection vers le chat privé 1-to-1 |
| 4 | **Envoyer un message privé** | Depuis le chat → Taper → Entrée | Message envoyé, WebSocket temps réel |
| 5 | **Modifier/Supprimer** | Comme pour le chat de groupe | Fonctionnement identique via menu ⋮ |

---

## 👨‍🏫 4. Profil PROFESSEUR — Guide de Test

### 4.1 Dashboard (`/professor/dashboard`)

| # | Action | Résultat attendu |
|---|---|---|
| 1 | **Statistiques** | Nombre de cours, étudiants, annonces publiées |
| 2 | **Actions rapides** | Liens vers gestion des cours et annonces |

---

### 4.2 Mes Cours (`/professor/courses`)

| # | Action | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | **Lister mes cours** | Naviguer vers `/professor/courses` | Liste des cours assignés au professeur |
| 2 | **Voir le détail** | Cliquer sur un cours | Détail avec liste d'étudiants inscrits, ressources, annonces |

---

### 4.3 Documents (`/professor/courses/:id/documents`)

| # | Action | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | **Lister les documents** | Naviguer vers la page documents d'un cours | Liste des ressources uploadées |
| 2 | **Uploader un document** | Cliquer **Ajouter** → Remplir titre + sélectionner fichier → **Uploader** | Le document apparaît dans la liste |
| 3 | **Supprimer un document** | Cliquer l'icône 🗑 → Confirmer | Document retiré de la liste |

---

### 4.4 Annonces (`/professor/announcements`)

| # | Action | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | **Voir mes annonces** | Naviguer vers `/professor/announcements` | Liste des annonces publiées |
| 2 | **Créer une annonce** | Cliquer **Nouvelle annonce** → Sélectionner le cours → Titre + Contenu → **Publier** | Annonce créée, visible par les étudiants du cours |
| 3 | **Supprimer une annonce** | Cliquer l'icône 🗑 → Confirmer | Annonce supprimée |

---

### 4.5 Mes Étudiants (`/professor/students`)

| # | Action | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | **Lister les étudiants** | Naviguer vers `/professor/students` | Liste de tous les étudiants inscrits à mes cours, avec filtre par cours |
| 2 | **Inscrire un étudiant** | Sélectionner un cours → Sélectionner un étudiant → **Inscrire** | Confirmation d'inscription |

---

## 🛡️ 5. Profil ADMINISTRATEUR — Guide de Test

### 5.1 Dashboard (`/admin/dashboard`)

| # | Action | Résultat attendu |
|---|---|---|
| 1 | **Statistiques globales** | Nombre total d'utilisateurs, étudiants, professeurs, cours, épreuves, groupes, signalements en attente |

---

### 5.2 Gestion des Utilisateurs (`/admin/users`)

| # | Action | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | **Lister les étudiants** | Naviguer vers `/admin/users` | Liste de tous les étudiants avec email, filière, statut |
| 2 | **Suspendre un utilisateur** | Cliquer **Suspendre** | Statut passe à "Inactif", le bouton change en "Réactiver" |
| 3 | **Réactiver un utilisateur** | Cliquer **Réactiver** | Statut redevient "Actif" |

---

### 5.3 Gestion des Admins (`/admin/admins`)

| # | Action | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | **Lister les admins** | Naviguer vers `/admin/admins` | Liste avec niveau (SUPER_ADMIN, ADMIN, MODERATOR) |
| 2 | **Créer un admin** | Cliquer **Créer** → Remplir formulaire (nom, email, mot de passe, niveau) → Valider | Nouveau compte admin créé |
| 3 | **Modifier le niveau** | Cliquer sur l'icône ✏️ → Changer le niveau → Confirmer | Niveau mis à jour |
| 4 | **Révoquer un admin** | Cliquer 🗑 → Confirmer | Admin supprimé de la liste |
| 5 | **Promouvoir un étudiant** | Rechecher un étudiant par ID → Sélectionner un niveau → **Promouvoir** | L'étudiant devient admin |

---

### 5.4 Gestion des Cours (`/admin/courses`)

| # | Action | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | **Lister les cours** | Naviguer vers `/admin/courses` | Liste paginée avec code, titre, filière, statut |
| 2 | **Créer un cours** | Cliquer **+ Nouveau cours** → Remplir tous les champs → **Créer** | Cours ajouté à la liste |
| 3 | **Modifier un cours** | Cliquer ✏️ → Modifier les champs → **Enregistrer** | Modifications sauvegardées |
| 4 | **Désactiver un cours** | Cliquer **Désactiver** | Statut passe à "Inactif", invisible pour les étudiants |
| 5 | **Réactiver un cours** | Cliquer **Activer** | Statut redevient "Actif" |
| 6 | **Supprimer un cours** | Cliquer 🗑 → Confirmer | Cours définitivement supprimé |
| 7 | **Gérer les ressources** | Cliquer **Ressources** → Uploader/Supprimer des fichiers | Ressources ajoutées ou retirées |

---

### 5.5 Gestion des Professeurs (`/admin/professors`)

| # | Action | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | **Lister les professeurs** | Naviguer vers `/admin/professors` | Liste avec nom, département, cours assignés, statut |
| 2 | **Créer un professeur** | Cliquer **Créer** → Remplir formulaire → **Enregistrer** | Compte professeur créé |
| 3 | **Assigner un cours** | Sélectionner un cours depuis le formulaire de modification | Cours ajouté à la liste des cours du professeur |
| 4 | **Désactiver un professeur** | Cliquer **Désactiver** | Statut passe à Inactif |
| 5 | **Supprimer un professeur** | Cliquer 🗑 → Confirmer | Professeur supprimé |

---

### 5.6 Signalements (`/admin/reports`)

| # | Action | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | **Lister les signalements** | Naviguer vers `/admin/reports` | Liste avec épreuve signalée, raison, statut, rapporteur |
| 2 | **Accepter un signalement** | Cliquer **Accepter** | L'épreuve est cachée, statut du signalement passe à "ACTIONED" |
| 3 | **Rejeter un signalement** | Cliquer **Rejeter** | L'épreuve reste visible, statut passe à "DISMISSED" |

---

## 🔧 6. Fonctionnalités Transversales

### 6.1 Notifications (Temps Réel)

| # | Fonctionnalité | Détail |
|---|---|---|
| 1 | **WebSocket** | L'application s'abonne à `/user/queue/notifications` et `/topic/announcements` |
| 2 | **Badge** | Le compteur de notifications non lues apparaît dans la barre latérale |
| 3 | **Marquer comme lu** | Cliquer sur une notification la marque comme lue |

---

### 6.2 WebSocket (Chat Temps Réel)

| # | Fonctionnalité | Détail |
|---|---|---|
| 1 | **Chat de groupe** | STOMP WebSocket `/topic/group/{groupId}` pour recevoir les messages en temps réel |
| 2 | **Messages privés** | STOMP WebSocket `/user/queue/messages` pour recevoir les DM en temps réel |
| 3 | **Indicateur de connexion** | Pastille verte/grise dans l'en-tête du chat |
| 4 | **Reconnexion auto** | Reconnexion automatique toutes les 5 secondes en cas de perte de connexion |

---

### 6.3 Sécurité JWT

| # | Fonctionnalité | Détail |
|---|---|---|
| 1 | **Token d'accès** | Stocké dans `localStorage` et ajouté automatiquement à chaque requête via l'intercepteur Axios |
| 2 | **Expiration** | Si le token expire (erreur 401), redirection automatique vers `/login` |
| 3 | **Routes protégées** | Toutes les pages sauf `/login` et `/register` nécessitent une authentification |
| 4 | **Routes par rôle** | Un étudiant ne peut pas accéder aux routes `/admin/*` ou `/professor/*` et vice versa |

---

## 📱 7. Responsive Design

L'application est responsive :
- **Desktop** (≥ 1200px) : Sidebar + zone de contenu avec layout 2 colonnes
- **Tablette** (768–1199px) : Sidebar masquée, contenu pleine largeur
- **Mobile** (< 768px) : Navigation à travers le hamburger menu

---

## 🐛 8. Problèmes Connus / Limitations

| # | Problème | Détail |
|---|---|---|
| 1 | **Status en ligne** | L'indicateur "en ligne" dans les messages privés est simulé (pas de tracking backend réel) |
| 2 | **Refresh Token** | La logique de refresh token n'est pas encore totalement implémentée — en cas d'expiration, redirection vers login |
| 3 | **Upload de fichiers** | La taille maximale dépend de la configuration du backend Spring Boot |
| 4 | **Pagination** | Certaines listes ne sont pas encore paginées côté frontend (groupes, professeurs) |

---
