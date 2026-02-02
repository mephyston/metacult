---
type: 'prd-addendum'
parent: 'prd.md'
version: '1.0'
date: '2026-01-12'
author: 'David (via PM Agent)'
status: 'draft'
---

# PRD Addendum - UX Mobile-First

Ce document complète le PRD principal avec les spécifications détaillées de l'expérience mobile PWA.

---

## 1. Onboarding (Première Connexion)

### Objectif

Collecter le minimum de préférences pour générer un premier Swipe pertinent.

### Flow Utilisateur

```
[Splash] → [Sign Up/Login] → [Onboarding 3 étapes] → [Swipe Forcé] → [Dashboard]
```

### Étapes de l'Onboarding (3 étapes)

| Étape | Écran           | Données Collectées                               | UX                                                |
| ----- | --------------- | ------------------------------------------------ | ------------------------------------------------- |
| 1     | **Bienvenue**   | -                                                | Animation Lottie + "Découvre tes goûts en 30 sec" |
| 2     | **Préférences** | `preferred_media_types[]` + `preferred_genres[]` | Voir détail ci-dessous                            |
| 3     | **Let's Go !**  | -                                                | CTA animé → Première session Swipe                |

### Détail Étape 2 : Préférences (Catégories + Genres)

L'utilisateur sélectionne d'abord les catégories, puis pour chaque catégorie sélectionnée, les genres associés.

**Flow UX :**

```
┌─────────────────────────────────────────┐
│  Quels types de contenus t'intéressent ? │
│                                          │
│  [🎬 Films]  [📺 Séries]                 │
│  [🎮 Jeux]   [📚 Livres]                 │
│                                          │
│              [Continuer →]               │
└──────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Quels genres de Films ?                 │
│                                          │
│  [Action] [SF] [Comédie] [Thriller]      │
│  [Drame] [Horreur] [Animation] [Romance] │
│                                          │
│              [Continuer →]               │
└──────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Quels genres de Jeux ?                  │
│                                          │
│  [RPG] [FPS] [Aventure] [Stratégie]      │
│  [Indie] [Puzzle] [Sport] [Simulation]   │
│                                          │
│              [Continuer →]               │
└──────────────────────────────────────────┘
```

### Mapping Genres par Catégorie

| Catégorie | Genres disponibles                                                              |
| --------- | ------------------------------------------------------------------------------- |
| Films     | Action, SF, Comédie, Thriller, Drame, Horreur, Animation, Romance, Documentaire |
| Séries    | Idem Films + Reality TV, Sitcom                                                 |
| Jeux      | RPG, FPS, Aventure, Stratégie, Indie, Puzzle, Sport, Simulation, Roguelike      |
| Livres    | Roman, SF, Fantasy, Thriller, Essai, BD, Manga, Biographie                      |

### Règles Métier

- **FR-ONB-01** : L'utilisateur DOIT sélectionner au moins 1 catégorie pour continuer.
- **FR-ONB-02** : Pour chaque catégorie sélectionnée, l'utilisateur DOIT sélectionner au moins 2 genres.
- **FR-ONB-03** : Les préférences sont modifiables ultérieurement depuis le Profil.
- **FR-ONB-04** : Un utilisateur ayant complété l'onboarding (`onboarding_completed: true`) ne le revoit jamais.
- **FR-ONB-05** : Le nom/prénom sont récupérés automatiquement depuis OAuth (Google/Apple).

### Première Session ("Swipe Forcé")

Après l'onboarding, l'utilisateur est redirigé vers une session de Swipe obligatoire :

- **Objectif** : Minimum 10 swipes pour débloquer les recommandations.
- **UX** : Barre de progression visible ("10/10 pour débloquer tes recos").
- **Gamification** : Animation de célébration + Badge "Explorer" débloqué.

---

## 2. Navigation Mobile (TabBar)

### Philosophie

Le pouce est en bas → la TabBar est le pattern natif pour la navigation mobile.

### Structure (5 items max)

| Position | Nom        | Icône | Route         | Description                       |
| -------- | ---------- | ----- | ------------- | --------------------------------- |
| 1        | Découvrir  | 🎯    | `/swipe`      | Core loop - Swipe de médias       |
| 2        | Arène      | ⚔️    | `/arena`      | Duels ELO issus des swipes        |
| 3        | Reco       | ✨    | `/` (home)    | "Quoi ce soir ?" + Dashboard      |
| 4        | Collection | 📚    | `/collection` | Ma bibliothèque, watchlist, stats |
| 5        | Profil     | 👤    | `/profile`    | Préférences, social, paramètres   |

### Comportement

- **FR-NAV-01** : La TabBar est visible sur toutes les pages principales.
- **FR-NAV-02** : La TabBar est masquée pendant le Swipe actif (mode immersif).
- **FR-NAV-03** : L'item actif est visuellement différencié (couleur + animation subtile).
- **FR-NAV-04** : Badge de notification sur Arène si duels en attente (pastille rouge).

---

## 3. Responsive Design (Mobile vs Desktop)

### Breakpoints

```scss
$mobile: 0 - 767px;
$tablet: 768px - 1023px;
$desktop: 1024px+;
```

### Navigation par Breakpoint

| Breakpoint | Header       | TabBar     | Sidebar      |
| ---------- | ------------ | ---------- | ------------ |
| Mobile     | ❌ Masqué    | ✅ Visible | ❌ Non       |
| Tablet     | ✅ Simplifié | ❌ Masqué  | ❌ Non       |
| Desktop    | ✅ Complet   | ❌ Masqué  | ✅ Optionnel |

### Header Desktop

- Logo à gauche
- Barre de recherche centrale
- Icônes : Notifications, Profil à droite
- Navigation secondaire : Découvrir, Arène, Collection

---

## 4. Install Banner (PWA)

### Trigger d'Affichage

- **FR-PWA-01** : Afficher la bannière après le 3ème lancement OU le 20ème swipe.
- **FR-PWA-02** : Respecter le cookie `pwa_install_dismissed` (ne pas réafficher avant 7 jours).
- **FR-PWA-03** : Ne pas afficher si déjà installé (`display-mode: standalone`).

### Design

```
┌─────────────────────────────────────────────────┐
│ 🚀 Metacult est mieux en app !                  │
│ Accès rapide et hors-ligne.   [Installer] [✕]  │
└─────────────────────────────────────────────────┘
```

### Comportement

- Position : Bottom sticky (au-dessus de la TabBar).
- Animation : Slide-in depuis le bas.
- Bouton "Installer" → `beforeinstallprompt.prompt()`.

---

## 5. Push Notifications (MVP)

### Use Cases Prioritaires

| Priorité | Notification                 | Trigger                        |
| -------- | ---------------------------- | ------------------------------ |
| P0       | "Tu as X duels en attente !" | Nouveaux duels générés (daily) |
| P1       | "Reco du jour : [Titre]"     | Daily digest à 19h             |
| P2       | "Ton classement a changé !"  | Mouvement significatif ELO     |

### Architecture Technique

1. **Service Worker** : Enregistrement via Nuxt PWA module.
2. **VAPID Keys** : Générés et stockés dans `ConfigurationService`.
3. **Table DB** : `push_subscriptions (user_id, endpoint, p256dh, auth)`.
4. **Backend** : Endpoint `POST /api/notifications/subscribe`.

### Demande de Permission

- **FR-PUSH-01** : Ne PAS demander la permission au premier lancement.
- **FR-PUSH-02** : Demander après le premier duel complété OU 30 swipes.
- **FR-PUSH-03** : Expliquer la valeur avant de demander ("Sois notifié de tes nouveaux duels").

---

## 6. Page d'Accueil Conditionnelle

### Logique de Routage

```typescript
if (!user.onboarding_completed) {
  redirect('/onboarding');
} else if (user.total_swipes < 10) {
  redirect('/swipe?mode=onboarding');
} else {
  redirect('/'); // Dashboard avec recos
}
```

### Dashboard (après déblocage)

- **Section 1** : "Quoi ce soir ?" → 3-5 recos basées sur similarité.
- **Section 2** : "Dernières activités" → Résumé des swipes récents.
- **Section 3** : "Tes duels" → CTA vers l'Arène.
- **Section 4** : "Tendances" → Médias populaires dans la communauté.

---

## Prochaines Étapes

1. [ ] Créer les wireframes Figma pour validation.
2. [ ] Implémenter le composant `TabBar.vue`.
3. [ ] Ajouter le flow d'onboarding.
4. [ ] Configurer Nuxt PWA pour les notifications.
5. [ ] Créer les endpoints backend pour les subscriptions push.
