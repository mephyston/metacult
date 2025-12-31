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

        return new Response(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/png'
            }
        });

    } catch (error: any) {
        console.error('❌ [Debug/Sharp] Failed:', error);
        return new Response(JSON.stringify({
            error: 'Sharp processing failed',
            details: error.message,
            stack: error.stack,
            versions: (await import('sharp')).default?.versions
        }, null, 2), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
