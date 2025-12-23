<script setup lang="ts">
import { Button } from '@metacult/shared-ui';
</script>

<template>
  <div class="bg-background min-h-screen text-white p-10 font-sans">
    <h1 class="text-4xl font-display mb-8 text-primary">Metacult WebApp (Nuxt)</h1>
    
    <div class="space-y-4">
        <p>Demonstration of Shared UI:</p>
        <div class="space-x-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
        </div>
    </div>
  </div>
</template>
