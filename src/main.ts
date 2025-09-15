import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import '@/assets/styles/styles.scss';

const app = createApp(App);

app.use(router);

// Мобильная оптимизация
document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
window.addEventListener('resize', () => {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
});

app.mount('#app');
