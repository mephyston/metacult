<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Test Page</h1>
    <p>If you can see this, the Nuxt app is working!</p>
    <div class="mt-4">
      <p>API URL: {{ apiUrl }}</p>
      <p>Website URL: {{ websiteUrl }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApiUrl, useWebsiteUrl } from '../composables/useApiUrl';

const apiUrl = useApiUrl();
const websiteUrl = useWebsiteUrl();
</script>
