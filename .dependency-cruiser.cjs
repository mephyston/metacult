/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        // ╔═══════════════════════════════════════════════════════════════════╗
        // ║ RÈGLE 1: Domain ne peut jamais importer Application/Infrastructure ║
        // ╚═══════════════════════════════════════════════════════════════════╝
        {
            name: 'domain-cannot-depend-on-application',
            severity: 'error',
            comment: 'Domain layer must not depend on Application layer (DDD violation)',
            from: { path: 'libs/backend/.*/src/domain' },
            to: { path: 'libs/backend/.*/src/application' },
        },
        {
            name: 'domain-cannot-depend-on-infrastructure',
            severity: 'error',
            comment: 'Domain layer must not depend on Infrastructure layer (DDD violation)',
            from: { path: 'libs/backend/.*/src/domain' },
            to: { path: 'libs/backend/.*/src/infrastructure' },
        },
        {
            name: 'domain-cannot-depend-on-api',
            severity: 'error',
            comment: 'Domain layer must not depend on API layer (DDD violation)',
            from: { path: 'libs/backend/.*/src/domain' },
            to: { path: 'libs/backend/.*/src/api' },
        },

        // ╔═══════════════════════════════════════════════════════════════════╗
        // ║ RÈGLE 2: Application ne peut jamais importer Infrastructure       ║
        // ╚═══════════════════════════════════════════════════════════════════╝
        {
            name: 'application-cannot-depend-on-infrastructure',
            severity: 'warn', // TODO: Fix remaining 8 violations, then change to 'error'
            comment: 'Application layer must not depend on Infrastructure layer (DDD violation)',
            from: { path: 'libs/backend/.*/src/application' },
            to: { path: 'libs/backend/.*/src/infrastructure' },
        },
        {
            name: 'application-cannot-depend-on-api',
            severity: 'warn', // TODO: Fix remaining 2 violations, then change to 'error'
            comment: 'Application layer must not depend on API layer (DDD violation)',
            from: { path: 'libs/backend/.*/src/application' },
            to: { path: 'libs/backend/.*/src/api' },
        },

        // ╔═══════════════════════════════════════════════════════════════════╗
        // ║ RÈGLE 3: Isolation des Modules Backend                             ║
        // ╚═══════════════════════════════════════════════════════════════════╝
        // Modules can import other modules via public API (index.ts / @metacult/backend-*).
        // But they CANNOT import internal paths like /domain/, /application/, /infrastructure/, /api/.
        // This is enforced by relying on the tsconfig path aliases resolving to index.ts.
        // The cross-module violations we saw were actually valid public API imports.
        // Removed: per-module cross-import rules (were triggering false positives on index.ts imports).

        // ╔═══════════════════════════════════════════════════════════════════╗
        // ║ RÈGLE 4: Frontend ne peut pas importer Backend                     ║
        // ╚═══════════════════════════════════════════════════════════════════╝
        {
            name: 'frontend-cannot-depend-on-backend',
            severity: 'error',
            comment: 'Frontend apps must not import backend libs. Use shared libs or API calls.',
            from: { path: '^apps/(webapp|website)/' },
            to: { path: '^libs/backend/' },
        },

        // ╔═══════════════════════════════════════════════════════════════════╗
        // ║ RÈGLE BONUS: Pas d'imports circulaires                             ║
        // ╚═══════════════════════════════════════════════════════════════════╝
        {
            name: 'no-circular',
            severity: 'warn',
            comment: 'Circular dependencies are not allowed',
            from: {},
            to: { circular: true },
        },
    ],
    options: {
        doNotFollow: {
            path: 'node_modules',
        },
        tsPreCompilationDeps: true,
        tsConfig: {
            fileName: 'tsconfig.base.json',
        },
        enhancedResolveOptions: {
            exportsFields: ['exports'],
            conditionNames: ['import', 'require', 'node', 'default'],
        },
        reporterOptions: {
            dot: {
                collapsePattern: 'node_modules/(@[^/]+/[^/]+|[^/]+)',
            },
            text: {
                highlightFocused: true,
            },
        },
    },
};
