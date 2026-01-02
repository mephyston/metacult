/**
 * Schémas Drizzle centralisés (Infrastructure Layer).
 * 
 * Les schemas auth sont maintenant dans le module @metacult/backend-identity.
 * Ce fichier est conservé pour compatibilité et réexporte les schémas identity.
 */

// Re-export auth schemas depuis le module Identity
export {
    user,
    session,
    account,
    verification,
    identitySchema,
    type SelectUser,
    type InsertUser,
    type SelectSession,
    type InsertSession,
    type SelectAccount,
    type InsertAccount
} from '@metacult/backend-identity';



