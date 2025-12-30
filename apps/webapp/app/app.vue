<script setup lang="ts">
import Header from './components/Header.vue';
</script>

<template>
  <div class="relative flex min-h-screen flex-col bg-background">
    <Header />
    <main class="flex-1">
      <nuxt-page />
    </main>
  </div>
</template>

<style scoped lang="css">
header {
  line-height: 1.5;
  max-width: 100vw;
}

nav > a {
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 768px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
    margin-left: auto;
    margin-right: auto;
    max-width: 768px;
  }

  nav {
    text-align: left;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
