import { promises as fs } from 'fs';
import { join, dirname, basename, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Script is in tools/scripts/sync-docs.ts. Root is ../..
const ROOT = resolve(__dirname, '../../');
const DOCS_CONTENT_ROOT = join(ROOT, 'apps/docs/src/content/docs');

async function ensureDir(path: string) {
  await fs.mkdir(path, { recursive: true });
}

async function copyWithFrontmatter(
  src: string,
  dest: string,
  titleOverride?: string,
) {
  try {
    const content = await fs.readFile(src, 'utf-8');
    let finalContent = content;

    // Check if frontmatter exists
    if (!content.trim().startsWith('---')) {
      const title = titleOverride || basename(dirname(src));
      finalContent = `---
title: ${title.charAt(0).toUpperCase() + title.slice(1)}
---

${content}`;
    }

    await ensureDir(dirname(dest));
    await fs.writeFile(dest, finalContent);
    console.log(`✅ Synced: ${src} -> ${dest}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.warn(`⚠️ Failed to sync ${src}: ${message}`);
  }
}

async function syncModules() {
  const libsDir = join(ROOT, 'libs');
  // Simple recursive search or just known paths.
  // Let's assume standard structure libs/<domain>/<name> or libs/<name>
  // We'll search for README.md in libs/**/*

  // Helper to find readmes
  async function findReadmes(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist') continue;
        await findReadmes(fullPath);
      } else if (entry.name === 'README.md') {
        // Determine destination
        // libs/backend/identity/README.md -> modules/backend-identity.md ?
        // OR modules/identity.md if unique.
        // Let's use the parent directory name as the module name.
        // Check if it's a "real" module (has package.json or project.json)
        // For now, sync all READMEs in libs.

        const relPath = fullPath.replace(libsDir, '').replace('/README.md', '');
        // relPath: /backend/identity
        const slug = relPath.split('/').filter(Boolean).join('-');
        // slug: backend-identity

        await copyWithFrontmatter(
          fullPath,
          join(DOCS_CONTENT_ROOT, 'modules', `${slug}.md`),
          slug,
        );
      }
    }
  }

  await findReadmes(libsDir);
}

async function sync() {
  console.log('🔄 Syncing Documentation...');

  // 1. Sync Root README -> Intro
  await copyWithFrontmatter(
    join(ROOT, 'README.md'),
    join(DOCS_CONTENT_ROOT, 'intro.md'),
    'Introduction',
  );

  // 2. Sync Modules
  await syncModules();

  // 3. Sync Workspace Docs (if any)
  // const workspaceDocs = join(ROOT, 'docs'); // If exists
  // ...

  console.log('✨ Documentation Sync Complete.');
}

sync().catch(console.error);
