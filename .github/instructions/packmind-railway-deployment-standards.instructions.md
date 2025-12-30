---
applyTo: '**'
---
## Standard: Railway Deployment Standards

Pratiques de déploiement sur Railway avec configuration optimale et healthchecks. :
* Activer le build cache Docker avec multi-stage builds.
* Configurer startCommand avec le binaire et chemin corrects (bun, node).
* Configurer watchPatterns pour rebuild uniquement si fichiers pertinents modifiés.
* Créer un railway.json par application déployable avec configuration spécifique.
* Définir un healthcheckPath pour vérifier le démarrage de l'application.
* Documenter les variables d'environnement requises dans README.md par app.
* Injecter les variables d'environnement via Railway Dashboard (jamais .env en production).
* Utiliser builder DOCKERFILE et spécifier dockerfilePath relatif à la racine.
* Utiliser restartPolicyType ON_FAILURE pour auto-restart en cas d'erreur.

Full standard is available here for further request: [Railway Deployment Standards](../../.packmind/standards/railway-deployment-standards.md)