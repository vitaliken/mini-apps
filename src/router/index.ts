import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/crash',
      name: 'crash',
      component: () => import('../views/CrashView.vue'),
    },
    {
      path: '/slots',
      name: 'slots',
      component: () => import('../views/SlotsView.vue'),
    },
    {
      path: '/dice',
      name: 'dice',
      component: () => import('../views/DiceView.vue'),
    },
    {
      path: '/coinflip',
      name: 'coinflip',
      component: () => import('../views/CoinFlipView.vue'),
    },
    {
      path: '/roulette',
      name: 'roulette',
      component: () => import('../views/RouletteView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
});

// Навигационный guard для Telegram Mini Apps
router.beforeEach((to, from, next) => {
  console.log('Navigation to:', to.name);
  next();
});

export default router;
