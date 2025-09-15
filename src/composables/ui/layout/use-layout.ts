import { computed } from 'vue';
import { useRoute } from 'vue-router';

export default function useLayout() {
  const route = useRoute();
  const layout = computed(() =>
    route.meta && route.meta.layout ? route.meta.layout : 'layout-default'
  );

  return layout;
}
