---
type: 'epics-stories'
parent: 'prd-mobile-ux-addendum.md'
version: '1.0'
date: '2026-01-12'
author: 'David (via PM Agent)'
status: 'ready-for-dev'
---

# Epics & Stories - Mobile-First PWA

Ce document découpe le PRD Mobile-First en Epics et User Stories implémentables.

---

## Epic 1: Onboarding Flow

**Objectif :** Collecter les préférences utilisateur pour personnaliser le premier feed.

### Story 1.1: Écran Bienvenue

**En tant qu'** utilisateur non-onboardé  
**Je veux** voir un écran d'accueil attrayant  
**Afin de** comprendre la proposition de valeur de l'app

**Critères d'acceptation :**

- [ ] Animation Lottie avec médias flottants
- [ ] Titre "Découvre tes goûts en 30 sec"
- [ ] CTA "C'est parti !" redirige vers étape 2
- [ ] Design dark theme + violet

**Estimation :** 2 points

---

### Story 1.2: Sélection Catégories + Genres

**En tant qu'** utilisateur en onboarding  
**Je veux** sélectionner mes types de contenus préférés et leurs genres  
**Afin de** recevoir des recommandations pertinentes

**Critères d'acceptation :**

- [ ] Grille 2x2 : Films, Séries, Jeux, Livres
- [ ] Multi-sélection avec feedback visuel (glow violet)
- [ ] Minimum 1 catégorie requise
- [ ] Pour chaque catégorie → afficher les genres associés
- [ ] Minimum 2 genres par catégorie requise
- [ ] Barre de progression (étape 2/3)
- [ ] Bouton "Continuer" disabled si validation échoue

**Estimation :** 5 points

---

### Story 1.3: Écran Let's Go + Redirection Swipe

**En tant qu'** utilisateur ayant complété ses préférences  
**Je veux** être redirigé vers ma première session de swipe  
**Afin de** commencer à découvrir des contenus

**Critères d'acceptation :**

- [ ] Animation de transition célébratoire
- [ ] Redirection automatique vers `/swipe?mode=onboarding`
- [ ] Flag `onboarding_completed: true` dans user profile
- [ ] Préférences sauvegardées en DB

**Estimation :** 2 points

---

### Story 1.4: Swipe Forcé (10 min)

**En tant qu'** nouvel utilisateur  
**Je veux** être guidé pour swiper 10 médias  
**Afin de** débloquer mes premières recommandations

**Critères d'acceptation :**

- [ ] Barre de progression "X/10 pour débloquer tes recos"
- [ ] Feed filtré selon préférences onboarding
- [ ] Animation de célébration à 10/10
- [ ] Badge "Explorateur" débloqué (gamification)
- [ ] Redirection vers Dashboard après complétion

**Estimation :** 3 points

---

## Epic 2: Navigation Mobile (TabBar)

**Objectif :** Implémenter la navigation mobile-first avec TabBar.

### Story 2.1: Composant TabBar

**En tant qu'** utilisateur mobile  
**Je veux** une barre de navigation en bas de l'écran  
**Afin de** naviguer facilement avec mon pouce

**Critères d'acceptation :**

- [ ] 5 items : Découvrir, Arène, Reco, Collection, Profil
- [ ] Icônes + labels
- [ ] Item actif highlighted (couleur violet)
- [ ] Animation subtile au tap
- [ ] Position fixed bottom
- [ ] Safe area respect (iPhone notch)

**Estimation :** 3 points

---

### Story 2.2: Responsive Navigation

**En tant qu'** utilisateur desktop  
**Je veux** voir un header classique au lieu de la TabBar  
**Afin d'** avoir une navigation adaptée à mon écran

**Critères d'acceptation :**

- [ ] Breakpoint : mobile < 768px (TabBar), desktop >= 768px (Header)
- [ ] Header : Logo, Search, Icons (Notifs, Profil)
- [ ] Transition fluide entre les deux modes
- [ ] Pas de TabBar visible sur desktop

**Estimation :** 3 points

---

### Story 2.3: Badge Notifications TabBar

**En tant qu'** utilisateur  
**Je veux** voir un badge sur l'icône Arène  
**Afin de** savoir que j'ai des duels en attente

**Critères d'acceptation :**

- [ ] Pastille rouge avec count sur icône Arène
- [ ] Count = nombre de duels en attente
- [ ] Update en temps réel (ou au focus)
- [ ] Disparaît quand count = 0

**Estimation :** 2 points

---

### Story 2.4: Swipe Desktop (Clavier + Boutons)

**En tant qu'** utilisateur desktop  
**Je veux** pouvoir swiper avec mon clavier ou des boutons  
**Afin de** profiter de l'expérience même sans écran tactile

**Critères d'acceptation :**

- [ ] Raccourcis clavier : `←` Dislike, `→` Like, `↑` Wishlist, `↓` Skip
- [ ] Boutons visibles sous la card sur desktop
- [ ] Même feedback visuel que le swipe tactile
- [ ] Focus keyboard accessible (a11y)

**Estimation :** 3 points

---

## Epic 3: Dashboard Recommandations

**Objectif :** Créer la page d'accueil avec recommandations personnalisées.

### Story 3.1: Section "Quoi ce soir ?"

**En tant qu'** utilisateur  
**Je veux** voir 3-5 recommandations personnalisées  
**Afin de** trouver rapidement quoi regarder/jouer

**Critères d'acceptation :**

- [ ] Carousel horizontal de 3-5 cards
- [ ] Cards avec poster, titre, type, match score
- [ ] Tap → détail média
- [ ] Algorithme basé sur similarité existante
- [ ] Fallback si pas assez de data : "Swipe plus pour des recos !"

**Estimation :** 5 points

---

### Story 3.2: Section "Tes duels en attente"

**En tant qu'** utilisateur  
**Je veux** voir mes duels non complétés  
**Afin de** les résoudre rapidement

**Critères d'acceptation :**

- [ ] Liste de 2-3 duels max
- [ ] Format : "Film A vs Film B" avec miniatures
- [ ] Tap → ouvre le duel dans l'Arène
- [ ] Badge count synchronisé avec TabBar

**Estimation :** 3 points

---

### Story 3.3: Section "Tendances"

**En tant qu'** utilisateur  
**Je veux** voir ce qui est populaire dans la communauté  
**Afin de** découvrir des contenus trending

**Critères d'acceptation :**

- [ ] Grid de 4-6 thumbnails
- [ ] Triés par activité récente (swipes communauté)
- [ ] Tap → détail média

**Estimation :** 2 points

---

## Epic 4: PWA Features

**Objectif :** Implémenter les fonctionnalités PWA (install, push).

### Story 4.1: Install Banner

**En tant qu'** utilisateur mobile récurrent  
**Je veux** être invité à installer l'app  
**Afin de** l'avoir sur mon home screen

**Critères d'acceptation :**

- [ ] Affichage après 3ème visite OU 20 swipes
- [ ] Respect du dismiss (cookie 7 jours)
- [ ] Détection `display-mode: standalone` (déjà installé)
- [ ] Bouton "Installer" → `beforeinstallprompt`
- [ ] Position : bottom sticky, au-dessus TabBar

**Estimation :** 3 points

---

### Story 4.2: Push Notifications - Backend

**En tant que** système  
**Je veux** pouvoir envoyer des push notifications  
**Afin de** réengager les utilisateurs

**Critères d'acceptation :**

- [ ] VAPID keys générés et stockés
- [ ] Endpoint `POST /api/notifications/subscribe`
- [ ] Table `push_subscriptions` (user_id, endpoint, p256dh, auth)
- [ ] Service d'envoi de notifications (web-push lib)

**Estimation :** 5 points

---

### Story 4.3: Push Notifications - Frontend

**En tant qu'** utilisateur  
**Je veux** recevoir des notifications push  
**Afin de** ne pas manquer mes duels

**Critères d'acceptation :**

- [ ] Demande permission après 30 swipes OU premier duel
- [ ] Explication de la valeur avant de demander
- [ ] Enregistrement subscription côté backend
- [ ] Service Worker configuré (Nuxt PWA)

**Estimation :** 3 points

---

## Récapitulatif

| Epic          | Stories | Points Total  |
| ------------- | ------- | ------------- |
| 1. Onboarding | 4       | 12            |
| 2. Navigation | 3       | 8             |
| 3. Dashboard  | 3       | 10            |
| 4. PWA        | 3       | 11            |
| **TOTAL**     | **13**  | **41 points** |

---

## Ordre de Priorité (Sprint Planning)

1. **Sprint 1 (MVP Core)** : Epic 2 (TabBar) + Story 1.1-1.3 (Onboarding base)
2. **Sprint 2 (Engagement)** : Story 1.4 (Swipe Forcé) + Epic 3 (Dashboard)
3. **Sprint 3 (Growth)** : Epic 4 (PWA Features)
