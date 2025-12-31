import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

export const GET: APIRoute = async () => {
    const root = process.cwd();
    const report: any = {
        cwd: root,
        files: {},
        errors: []
    };

    const dirsToCheck = [
        './',
        './dist',
        './dist/server',
        './dist/client',
        './dist/client/_astro'
    ];

    for (const dir of dirsToCheck) {
        try {
            const fullPath = path.join(root, dir);
            const files = await fs.readdir(fullPath);
            report.files[dir] = files;
        } catch (e: any) {
            report.errors.push(`Failed to read ${dir}: ${e.message}`);
        }
    }

    return new Response(JSON.stringify(report, null, 2), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
