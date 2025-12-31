import { requestContext } from '../context/request-context';

export function patchConsole() {
    const originalLog = console.log;
    const originalInfo = console.info;
    const originalWarn = console.warn;
    const originalError = console.error;

    function formatMessage(args: any[]) {
        const requestId = requestContext.getRequestId();
        const prefix = requestId ? `[Req: ${requestId}]` : '';

        // If first arg is string, prepend. Otherwise unshift.
        if (args.length > 0 && typeof args[0] === 'string') {
            args[0] = `${prefix} ${args[0]}`.trim();
        } else if (requestId) {
            args.unshift(prefix);
        }
        return args;
    }

    console.log = (...args: any[]) => originalLog.apply(console, formatMessage(args));
    console.info = (...args: any[]) => originalInfo.apply(console, formatMessage(args));
    console.warn = (...args: any[]) => originalWarn.apply(console, formatMessage(args));
    console.error = (...args: any[]) => originalError.apply(console, formatMessage(args));
}
