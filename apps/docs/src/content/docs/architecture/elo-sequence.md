---
title: Séquence de calcul Elo
description: Diagramme de séquence du flux de vote Duel.
---

Ce diagramme détaille le flux d'exécution lors d'un vote sur un duel.
À noter : Le calcul Elo est asynchrone (Worker), tandis que le gain d'XP est actuellement déclenché de manière synchrone par le contrôleur.

```mermaid
sequenceDiagram
    actor User
    participant API as API (DuelController)
    participant Auth as IdentityModule
    participant Queue as Redis (RankingQueue)
    participant Game as GamificationService
    participant Worker as Worker (RankingProcessor)
    participant Handler as UpdateEloHandler
    participant Service as EloCalculatorService
    participant Repo as DuelRepository (DB)

    User->>API: POST /duel/vote {winner, loser}
    activate API

    API->>Auth: resolveUserOrThrow()
    Auth-->>API: User (id)

    %% 1. Async Elo Update
    API->>Queue: addDuelResult(winner, loser)
    note right of Queue: Job "duel-result" added

    %% 2. Sync Gamification (Current Implementation)
    API->>Game: addXp(userId, 50)
    activate Game
    Game-->>API: void (Log Success/Error)
    deactivate Game

    API-->>User: 200 OK
    deactivate API

    %% Background Process
    rect rgb(240, 248, 255)
        note right of Worker: Background Job Processing
        Worker->>Queue: pop job
        activate Worker
        Worker->>Handler: execute(command)
        activate Handler

        Handler->>Repo: findById(winner), findById(loser)
        Repo-->>Handler: Media Entities

        Handler->>Service: calculateNewScores(wElo, lElo)
        Service-->>Handler: {newWinnerElo, newLoserElo}

        Handler->>Repo: updateEloScores(w, newW, l, newL)
        activate Repo
        note right of Repo: Transaction SQL
        Repo-->>Handler: void
        deactivate Repo

        Handler-->>Worker: Result.ok()
        deactivate Handler
        deactivate Worker
    end
```
