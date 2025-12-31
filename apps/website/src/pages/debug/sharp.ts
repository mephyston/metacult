import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
    try {
        console.log('🔧 [Debug/Sharp] Starting Sharp test...');
        const sharp = (await import('sharp')).default;

        // 1. Create a simple synthetic image
        console.log('🔧 [Debug/Sharp] Creating 200x200 red image...');
        const image = sharp({
            create: {
                width: 200,
                height: 200,
                channels: 4,
                background: { r: 255, g: 0, b: 0, alpha: 1 }
            }
        });

        // 2. Perform operations (resize, format)
        console.log('🔧 [Debug/Sharp] Resizing to 100x100 and converting to png...');
        const buffer = await image
            .resize(100, 100)
            .png()
            .toBuffer();

        console.log('✅ [Debug/Sharp] Success! Generated buffer size:', buffer.length);

        return new Response(buffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'image/png'
            }
        });

    } catch (error: any) {
        console.error('❌ [Debug/Sharp] Failed:', error);

        // 🔍 FS Debug: List files to help debug path issues if Sharp works but files are missing
        let fsReport: any = {};
        try {
            const fs = await import('node:fs/promises');
            const path = await import('node:path');
            const root = process.cwd();

            const listDir = async (dir: string) => {
                try {
                    return await fs.readdir(path.join(root, dir));
                } catch (e: any) {
                    return `Error: ${e.message}`;
                }
            };

            fsReport = {
                cwd: root,
                './': await listDir('./'),
                './dist': await listDir('./dist'),
                './dist/client': await listDir('./dist/client'),
                './dist/client/_astro': await listDir('./dist/client/_astro'),
                './public': await listDir('./public'),
            };
        } catch (e) {
            fsReport = { error: 'Could not run FS check' };
        }

        return new Response(JSON.stringify({
            error: 'Sharp processing failed',
            details: error.message,
            stack: error.stack,
            versions: (await import('sharp')).default?.versions,
            fsReport
        }, null, 2), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
