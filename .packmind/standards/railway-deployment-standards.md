# Railway Deployment Standards

Ce standard définit les pratiques pour déployer des applications sur Railway avec configuration optimale, healthchecks, watch patterns intelligents, gestion des variables d'environnement et intégration CI/CD.

## Rules

* Créer un railway.json par application déployable avec configuration spécifique.
* Utiliser builder DOCKERFILE et spécifier dockerfilePath relatif à la racine.
* Configurer watchPatterns pour rebuild uniquement si fichiers pertinents modifiés.
* Définir un healthcheckPath pour vérifier le démarrage de l'application.
* Utiliser restartPolicyType ON_FAILURE pour auto-restart en cas d'erreur.
* Injecter les variables d'environnement via Railway Dashboard (jamais .env en production).
* Configurer startCommand avec le binaire et chemin corrects (bun, node).
* Activer le build cache Docker avec multi-stage builds.
* Documenter les variables d'environnement requises dans README.md par app.
