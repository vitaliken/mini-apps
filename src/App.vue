<template>
<div class="app">
  <component :is="layout">
    <RouterView/>
  </component>
</div>
</template>


<script setup lang="ts">
import { RouterView } from 'vue-router';
import useLayout from '@/composables/ui/layout/use-layout';

const layout = useLayout();
</script>

<style lang="scss">#app {
  font-family: IBM Plex Sans, Proxima Nova, Inter, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: hsl(0, 0%, 0%);
  font-size: 14px;
}
</style>
