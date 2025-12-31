import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
    requestId: string;
}

const contextStorage = new AsyncLocalStorage<RequestContext>();

export const requestContext = {
    run: <T>(context: RequestContext, callback: () => T): T => {
        return contextStorage.run(context, callback);
    },
    get: (): RequestContext | undefined => {
        return contextStorage.getStore();
    },
    getRequestId: (): string | undefined => {
        return contextStorage.getStore()?.requestId;
    }
};
