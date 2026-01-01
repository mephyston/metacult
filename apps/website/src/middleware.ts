import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
    let requestId: string = crypto.randomUUID();

    // Avoid accessing headers on prerendered pages (like index.astro) to prevent warnings
    if (context.url.pathname !== '/') {
        requestId = context.request.headers.get("x-request-id") || requestId;
    }
    context.locals.requestId = requestId;
    // Note: We cannot modify context.request headers easily as they are immutable.
    // The fetch interception or explicit header passing must happen where fetch is called.
    return next();
});
