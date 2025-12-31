import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
    const requestId = context.request.headers.get("x-request-id") || crypto.randomUUID();
    context.locals.requestId = requestId;
    // Note: We cannot modify context.request headers easily as they are immutable.
    // The fetch interception or explicit header passing must happen where fetch is called.
    return next();
});
