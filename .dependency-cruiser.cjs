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
            severity: 'error',
            comment: 'Application layer must not depend on Infrastructure layer (DDD violation)',
            from: { path: 'libs/backend/.*/src/application' },
            to: { path: 'libs/backend/.*/src/infrastructure' },
        },
        {
            name: 'application-cannot-depend-on-api',
            severity: 'error',
            comment: 'Application layer must not depend on API layer (DDD violation)',
            from: { path: 'libs/backend/.*/src/application' },
            to: { path: 'libs/backend/.*/src/api' },
        },

        // ╔═══════════════════════════════════════════════════════════════════╗
        // ║ RÈGLE 3: Isolation des Modules Backend                             ║
        // ╚═══════════════════════════════════════════════════════════════════╝
        {
            name: 'module-isolation',
            severity: 'error',
            comment: 'Modules must not rely on other modules internals. Use public API (index.ts).',
            from: { path: 'libs/backend/([^/]+)/src' },
            to: {
                path: 'libs/backend/(?!$1)([^/]+)/src/(?!index\\.ts)',
                pathNot: 'libs/backend/(?!$1)([^/]+)/src/index\\.ts', // Explicitly allow index.ts (though logically implied by negation above, helps clarity)
            },
        },

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
            severity: 'error',
            comment: 'Circular dependencies are not allowed',
            from: {},
            to: { circular: true },
        },
    ],
    options: {
        doNotFollow: {
            path: 'node_modules|dist|\\.output',
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
