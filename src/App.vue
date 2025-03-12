<template>
  <h1 text-center mb-1>Hello Vue 3 + TypeScript</h1>
  <RouterView />
</template>
<script setup lang="ts">
useHead({
  title: 'vue3-ts-template',
  meta: [
    { name: 'description', content: 'es6-vue-template' },
    {
      name: 'theme-color',
      content: () => (isDark.value ? '#00aba9' : '#ffffff'),
    },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: () => '/logo.png',
    },
  ],
});
</script>
