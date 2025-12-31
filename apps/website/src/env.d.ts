/// <reference types="astro/client" />
/// <reference types="vite/client" />

declare namespace App {
    interface Locals {
        requestId: string;
    }
}

declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
}
