---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
inputDocuments:
  [
    '/Users/david/Lab/metacult/metacult/_bmad-output/planning-artifacts/research/market-discovery_culture_swipe-research-2026-01-06.md',
  ]
documentCounts:
  briefs: 1
  research: 1
  brainstorming: 0
  projectDocs: 0
workflowType: 'prd'
lastStep: 1
---

# Product Requirements Document - metacult

**Author:** David
**Date:** 2026-01-06

## Executive Summary

Metacult est une plateforme de découverte culturelle unifiée qui résout la fragmentation et la fatigue des avis traditionnels par une approche **"Swipe-First" et Gamifiée**. En consolidant Films, Séries, Jeux et Livres dans une seule interface fluide, elle permet aux utilisateurs de construire leur "Graph de Goût" en quelques secondes via des interactions rapides (Like/Dislike) et des Duels de classement (ELO).

### What Makes This Special ("The Metacult Loop")

Contrairement aux bases de données statiques (IMDB/SensCritique), Metacult est un moteur de découverte actif. Son différenciateur clé est la **"Boucle de 5 Cartes"** : un flux structuré qui intercale découverte organique et **Recommandations Affiliées Intelligentes**.

- **La Promesse** : "Ne cherchez plus, swipez."
- **La Monétisation** : Tous les X swipes, une recommandation ciblée (basée sur les profils similaires) propose un contenu pertinent avec un lien d'action direct (Abonnement Netflix, Achat Amazon, Clé Instant Gaming), transformant la découverte en conversion naturelle.

## Project Classification

**Technical Type:** Mobile/Web App (PWA)
**Domain:** Social / Entertainment
**Complexity:** Medium
**Project Context:** Brownfield - extending existing system

## Success Criteria

### User Success

- **Activation Instantanée** : L'utilisateur swipe 10 items et reçoit sa première recommandation pertinente (via `SimilarityCalculator` existant).
- **Rétention "Daily Ritual"** : Les utilisateurs reviennent quotidiennement pour vider leur "Daily Stack" de recommandations (UX fluide).
- **Satisfaction "Flow"** : L'expérience de Swipe est aussi fluide que TikTok (Latence < 16ms), sans friction cognitive entre les types de médias.

### Business Success

- **Affiliation Contextuelle** : CTR > 1% sur les liens Amazon/Netflix/IGDB intégrés dans la boucle de 5 cartes.
- **Qualité du Data Graph** : Chaque utilisateur génère au moins 5 points de comparaison (Duels) par semaine pour affiner l'algo.

### Technical Success

- **Solidité Backend** : Architecture Hexagonale et Tests (couverture actuelle bonne) maintenus.
- **Performance API** : Temps de réponse < 50ms pour le calcul de similarité (vecteurs pré-calculés).
- **Auth Premium** : Google & Apple Auth fonctionnels et fluides.

### Product Scope

#### MVP (Minimum Viable Product)

- **Verticales** : Toutes (Films, Séries, Jeux, Livres) - Connecteurs existants.
- **Expérience "Swipe" Nuancée** :
  - **Like** : Distinction "Banger" (Top tiers) vs "Bien".
  - **Dislike** : Note négative.
  - **Not Seen** : Neutre.
  - **Wishlist** : Neutre mais réinjection dans le deck futur.
- **Duels (Ranking)** : Mécanique de comparaison A/B pour affiner le score (ex: Matrix vs Jurassic Park).
- **Auth** : Google & Apple.

#### Growth (Post-MVP)

- **Social Graph** : Comparaison de goût avec amis.
- **Deep Stats** : Analyses avancées pour Premium.

## User Journeys

### Journey 1: The "Daily Ritual" (Focus: Rapid Triage & Affiliation)

**Persona**: Alex, 28, "Culture Snacker".
**Context**: 8:30 AM, Subway commute. Alex wants to log his recent consumption and find a quick win.

**The Narrative**:

1.  **Opening**: Alex opens Metacult. Instant load to "Daily Stack" (20 cards).
2.  **The Flow (Reptilian Brain)**:
    - Card 1 (The Bear S3): "Seen it, loved it". **Swipe Right (Like)**. _Green flash_.
    - Card 2 (Random RomCom): "Not for me". **Swipe Left (Dislike)**. _Red tint_.
3.  **The Opportunity (Affiliation)**:
    - Card 3 is **Zelda: Echoes of Wisdom** (Wishlist Item).
    - **Action**: Alex Swipes Up (Wishlist).
    - **Reaction**: A subtle "Action Card" slides in next: _"Available on Instant Gaming (-25%)"_.
    - **Conversion**: Alex taps the link, buys the key. _Business Goal Met_.
4.  **The Hook (Deferred Refinement)**:
    - Alex finishes his stack. A summary screen appears: _"You liked Dune 2. Quick question: Was it better than Star Wars?"_
    - **Resolution**: Alex answers "Yes" without breaking his initial swipe flow.

**Key Requirement Revealed**:

- _Non-Intrusive Refinement_: Ranking questions appear _after_ the flow or in dedicated slots, never blocking the swipe loop.
- _Smart Injection_: Affiliation links appear contextually after high-intent actions (Wishlist).

### Journey 2: The "Visceral Duel" (Focus: Identity & Precision)

**Persona**: Sarah, 34, "The Curator".
**Goal**: She wants recommendations that feel "earned" and biologically accurate.

**The Narrative**:

1.  **Opening**: Sarah enters "Versus Mode". The UI darkens. Cinematic sound design.
2.  **The Clash**: Two massive posters appear. **Succession** vs **The Wire**. The phone vibrates slightly on impact.
3.  **The Choice**: It's difficult. She drags "The Wire" to the center. The card glows gold. "Succession" shatters or fades.
    - _Feedback_: "Critique Score Integrated. Your 'Gritty Realistic' vector increased."
4.  **The Payoff (Optimistic UI)**:
    - Instantly, a new recommendation card unlocks: **The Shield**.
    - _System Note_: Backend updates ELO asynchronously; Frontend simulates immediate impact.

**Key Requirement Revealed**:

- _Haptic & Visual Density_: Duels must feel "heavier" and more significant than swiping (+16ms animation budget).
- _Optimistic Updates_: Results must feel instant even if the calc takes 50ms.

### Journey Requirements Summary

- **Triage UX**: 3 Gestures (Right/Left/Up) + Contextual Affiliation Injection.
- **Refinement**: Asynchronous/Deferred.
- **Performance**: Optimistic UI for Duel results.

## Innovation & Novel Patterns

### Detected Innovation Areas

#### 1. "Reptilian Culture Triage" (UX Innovation)

- **Concept**: Remplacer l'échelle cognitive lourde (0-10, 5 étoiles) par des gestes instinctifs (Moteur de tri vs Moteur de notation).
- **Différenciateur**: Vitesse d'exécution x10 par rapport à SensCritique/Letterboxd. Transforme la corvée de "mise à jour du profil" en un jeu addictif ("Flow").

#### 2. "Gamified Elo Taxonomy" (Data Innovation)

- **Concept**: Le goût n'est pas absolu, il est relatif. Utilisation de l'algorithme ELO (issu des Échecs) pour classer les oeuvres culturelles.
- **Différenciateur**: "Matrix > Jurassic Park" est une donnée plus robuste que "Matrix = 8/10". Permet de construire un "Graph de Goût" unique et ultra-précis sans que l'utilisateur n'ait à intellectualiser sa note.

#### 3. "Native Affiliation Loop" (Business Innovation)

- **Concept**: La publicité est traitée comme du contenu. Si l'algo sait que l'utilisateur veut jouer à _Zelda_ (Wishlist), lui proposer le lien d'achat n'est pas une intrusion, c'est un service.
- **Différenciateur**: Modèle immunisé contre la "Banner Blindness". Taux de conversion estimé supérieur grâce au contexte (Wishlist -> Offre).

### Market Context & Competitive Landscape

- **Concurrents Directs**: SensCritique, Letterboxd, TV Time (Approche "Base de données", notation classique).
- **Inspiration**: Tinder (UX Swipe), TikTok (Algorithme de flux), Facemash (Origin story de Facebook pour le ELO).

### Validation Approach

- **Test A/B "Flow"**: Comparer le nombre d'items traités par minute entre une interface "Notation Etoiles" et "Swipe Triage".
- **Test de Conversion**: Valider le CTR sur les cartes d'affiliation insérées dans le loop.

### Risk Mitigation

- **Risque "Bulle de Filtre"**: L'ELO enferme dans les favoris. -> _Atténuation_: Injection forcée de découverte (Serendipity) dans le feed (1 carte sur 5).

## Mobile/Web App Specific Requirements

### Project-Type Overview

Metacult est une **Progressive Web App (PWA)** "Mobile-First". L'expérience doit égaler celle d'une application native en termes de fluidité et de résilience réseau, tout en restant accessible via le web pour le partage et le SEO.

### Technical Architecture Considerations

#### 1. PWA & Offline Strategy

- **Preventive Caching ("Subway Mode")**: L'application doit pré-charger le "Daily Stack" (20 cartes + images) dès l'ouverture.
  - _Implementation_: Utilisation de `IndexedDB` (via VueUse/LocalForage) pour stocker le JSON du feed et les assets critiques.
  - _Comportement_: Si coupure réseau, le swipe continue sans erreur. La synchro des actions se fait au retour du réseau (Queue de requêtes).
- **Installabitily**: Prompt "Add to Home Screen" intelligent (déclenché après le 3ème lancement ou le 50ème swipe).

#### 2. Mobile Experience Constraints

- **Gesture Conflict Management**:
  - Le geste "Swipe Up" (Wishlist) entre en conflit avec le "Pull-to-Refresh" natif des navigateurs mobiles (Chrome/Safari).
  - _Requirement_: Désactiver le Pull-to-Refresh (`overscroll-behavior-y: contain`) sur les vues de Deck.
- **Haptic Feedback**: Utiliser `Navigator.vibrate()` pour confirmer physiquement les triages (Like/Dislike/Duel).

#### 3. SEO & Sharing (Nuxt SSR)

- **Public Profiles**: Les profils utilisateurs (ex: `metacult.gg/u/alex`) doivent être rendus côté serveur (SSR) pour générer des meta-tags Open Graph riches (Twitter Card avec le Top 3 films de l'utilisateur).
- **Deep Linking**: Les liens de partage doivent ouvrir l'app au bon endroit (et non la home), avec fallback web si l'app n'est pas installée.

### Implementation Considerations

- **Performance Budget**:
  - First Contentful Paint (FCP) < 1.0s.
  - Time to Interactive (TTI) < 2.5s.
  - Animation Frame Budget: 16ms (60fps) strict pendant le swipe.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP ("The Culture Flow").
**Philosophy:** L'objectif n'est pas la richesse fonctionnelle (Social, Stats) mais la perfection de l'expérience de base (Swipe, Triage, Découverte). On ne lance pas une "Base de données", on lance un "Rituel".

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**

- Journey 1: Daily Ritual (Triage Rapide)
- Journey 2: Visceral Duel (Identity Building)

**Must-Have Capabilities:**

- **Auth**: Google & Apple Login (Pas de Discord public).
- **Feed**: Algorithme unifié (Films, Séries, Jeux, Livres).
- **Swipe**: Moteur performant (<16ms), Offline-ready.
- **Duels**: Comparaison 1v1 basique pour calibrer l'ELO.
- **Affiliation**: Liens sortants simples vers partenaires (Amazon, IGDB).

### Post-MVP Features

**Phase 2: Growth (Social & Retention)**

- Social Graph (Amis, Follow).
- Duels Sociaux (Envoyer un défi à un ami).
- Metacult Pro (Statistiques avancées).

**Phase 3: Expansion (The OS)**

- API Publique.
- Groupes & Communautés.
- Applications Natives (iOS/Android Store Wrappers).

### Risk Mitigation Strategy

- **Risk**: Lancement sans social = Solitude ?
  - _Mitigation_: Le contenu (Feed) doit être intrinsèquement intéressant même seul (Découverte de pépites).
- **Risk**: Rétention faible sans gamification sociale.
  - _Mitigation_: Focus sur la gamification personnelle (Badges, Streaks, "Identity Building").

## Functional Requirements

### 1. Core & Authentication

- **FR-AUTH-01**: Le système doit permettre l'authentification via **Google OAuth** et **Apple ID** (Mobile & Web).
- **FR-AUTH-02**: Le système doit supporter un mode "Invité" (Guest) créant un profil temporaire local, convertible ultérieurement en compte complet sans perte de données.
- **FR-CORE-01**: Le système doit gérer un profil utilisateur unifié contenant l'historique de navigation et les scores ELO.

### 2. The "Daily Stack" (Content Discovery)

- **FR-DISC-01**: Le système doit générer quotidiennement un "Stack" unique de 20 cartes pour chaque utilisateur actifs.
- **FR-DISC-02**: L'algorithme de génération doit respecter une diversité de verticalité (Max 3 films, 3 jeux, etc. consécutifs ou par stack) sauf préférence explicite.
- **FR-DISC-03**: L'application doit pré-charger le contenu du Stack (Métadonnées + Images) pour permettre une consultation sans connexion Internet (Offline First).

### 3. Interaction Engine (Triage)

- **FR-INT-01**: L'utilisateur doit pouvoir "Liker" (Swipe Right) un contenu (Approbation).
- **FR-INT-02**: L'utilisateur doit pouvoir "Disliker" (Swipe Left) un contenu (Rejection).
- **FR-INT-03**: L'utilisateur doit pouvoir ajouter à sa "Wishlist" (Swipe Up) un contenu (Intent).
- **FR-INT-04**: L'utilisateur doit pouvoir "Passer" (Swipe Down) un contenu (No Opinion / Skip).
- **FR-INT-05**: L'utilisateur doit pouvoir accéder aux détails "Back of Card" via une interaction de Flip (Double Tap ou CTA dédié).
- **FR-INT-06**: Le système doit permettre l'annulation de la dernière action (Undo).

### 4. Elo Duels (Refinement)

- **FR-DUEL-01**: Le système doit proposer des "Duels" contextuels (Item A vs Item B) pour affiner les préférences.
- **FR-DUEL-02**: Le système doit recalculer et mettre à jour le score ELO de l'utilisateur pour les entités concernées immédiatement après un duel.
- **FR-DUEL-03**: Le système doit maintenir un classement (Leaderboard) personnel des Top 100 oeuvres préférées de l'utilisateur basé sur l'ELO.
- **FR-DUEL-04**: Les duels ne peuvent opposer que des médias du **même type** (Film vs Film, Jeu vs Jeu, etc.).

### 5. Affiliation & Monetization

- **FR-AFF-01**: Le système doit détecter les opportunités commerciales pour les items lors de l'ajout en Wishlist (Swipe Up) et notifier l'utilisateur (Offre immédiate ou différée via Worker).
- **FR-AFF-02**: Le système doit injecter des cartes "Gold" (Recommandation personnalisée à haute affinité) et "Sponsorisée" (Partenaire) dans le flux.
- **FR-AFF-03**: Les cartes Gold et Sponsorisées doivent afficher un CTA explicite en bas de carte pour rediriger vers l'action/partenaire.

## Non-Functional Requirements

### Performance

- **Time to Interact**: L'application doit être interactive (Swipable) en **< 1000ms** (Cold Start sur 4G).
- **Swipe Latency**: La boucle d'animation du Deck doit maintenir **60fps** (16ms) constants. Aucun "jank" n'est tolérable pendant le geste.
- **Optimistic UI**: Toutes les actions (Like/Dislike) doivent être reflétées instantanément dans l'interface, la synchronisation API se faisant en arrière-plan.

### Security & Privacy

- **Data Minimization**: Le système ne doit collecter et stocker que les données strictement nécessaires au fonctionnement du graphe de goût (Pas de tracking publicitaire tiers).
- **Right to be Forgotten**: Un mécanisme simple (Bouton "Supprimer mon compte") doit permettre l'effacement total et irréversible de toutes les données utilisateur (y compris les scores ELO) immédiatement.

### Scalability

- **Concurrency**: L'infrastructure backend doit supporter une charge initiale de **1000 utilisateurs simultanés** sans dégradation de performance, en s'appuyant sur l'architecture existante (Railway/Bun).
