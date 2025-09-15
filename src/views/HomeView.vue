<template>
  <div class="home-container" :class="{ navigating: isNavigating }">
    <!-- Фон с анимацией -->
    <div class="cosmic-background">
      <div class="stars"></div>
      <div class="twinkling"></div>
      <div class="clouds"></div>
    </div>

    <!-- Шапка с информацией пользователя -->
    <header class="app-header">
      <div class="user-info">
        <div class="avatar" v-if="user?.photo_url">
          <img :src="user.photo_url" alt="User avatar" />
        </div>
        <div class="avatar" v-else>
          <div class="avatar-default">👤</div>
        </div>
        <div class="username">
          {{
            user?.first_name ||
            'Player layer layer layer layer layer layer layer layer layer layer layer layer '
          }}
        </div>
      </div>
      <div class="user-details">
        <div class="stats">
          <span class="balance">🪙 {{ formatNumber(balance) }}</span>
          <span class="rating">⭐ {{ formatNumber(rating) }}</span>
        </div>
      </div>
    </header>

    <!-- Основной контент с играми -->
    <main class="games-grid">
      <div class="title-section">
        <h1 class="main-title">Hello world</h1>
        <p class="subtitle">Выберите игру</p>
      </div>

      <div class="games-container">
        <div
          v-for="game in games"
          :key="game.id"
          class="game-card"
          @click="navigateTo(game.route)"
          :style="{ '--hue': game.color }"
          :disabled="isNavigating"
        >
          <div class="card-content">
            <div class="game-icon">
              {{ game.emoji }}
            </div>
            <h3 class="game-title">{{ game.title }}</h3>
            <p class="game-description">{{ game.description }}</p>
          </div>
          <div class="game-glow"></div>
          <div class="card-shine"></div>
          <div class="loading-overlay" v-if="isNavigating">
            <div class="spinner"></div>
          </div>
        </div>
      </div>

      <!-- Футер с информацией -->
      <footer class="app-footer">
        <p class="footer-text">🎯 Daily bonuses available!</p>
        <div class="online-count">
          <span class="online-dot"></span>
          {{ onlinePlayers }} players online
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTelegram } from '@/composables/useTelegram';

const router = useRouter();
const { user, tg } = useTelegram();

const balance = ref(0);
const rating = ref(0);
const onlinePlayers = ref(0);
const isNavigating = ref(false);

const games = ref([
  {
    id: 1,
    title: 'Crash',
    emoji: '🚀',
    description: 'Ride the rocket',
    route: '/crash',
    color: 200,
  },
  {
    id: 2,
    title: 'Slots',
    emoji: '🎰',
    description: 'Spin to win',
    route: '/slots',
    color: 280,
  },
  {
    id: 3,
    title: 'Dice',
    emoji: '🎲',
    description: 'Roll for fortune',
    route: '/dice',
    color: 50,
  },
  {
    id: 4,
    title: 'Coin Flip',
    emoji: '🪙',
    description: 'Heads or tails?',
    route: '/coinflip',
    color: 120,
  },
  {
    id: 5,
    title: 'Roulette',
    emoji: '🎡',
    description: 'Spin the wheel',
    route: '/roulette',
    color: 300,
  },
]);

const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

const navigateTo = async (route: string) => {
  if (isNavigating.value) return;

  isNavigating.value = true;

  // Добавляем небольшую задержку для анимации
  await new Promise((resolve) => setTimeout(resolve, 150));

  try {
    await router.push(route);
  } catch (error) {
    console.error('Navigation error:', error);
  } finally {
    isNavigating.value = false;
  }
};

// Функция для получения данных пользователя
const fetchUserData = async () => {
  try {
    // Здесь будет запрос к вашему бэкенду
    // Пример: const response = await fetch('/api/user/data');
    // const data = await response.json();

    // Временные данные для примера
    balance.value = 1000;
    rating.value = 42;
    onlinePlayers.value = 1250;
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

// Функция для получения данных из Telegram
const initTelegramData = () => {
  if (tg) {
    // Расширяем на весь экран
    tg.expand();
    tg.enableClosingConfirmation();

    // Можно получить дополнительные данные из Telegram
    const initData = tg.initData;
    if (initData) {
      console.log('Telegram init data:', initData);
    }
  }
};

onMounted(() => {
  initTelegramData();
  fetchUserData();
});
</script>

<style scoped lang="scss">
.home-container {
  min-height: calc(100vh - 58px);
  position: relative;
  overflow-x: hidden;
  color: white;
  padding: 12px;
}

/* Космический фон с улучшенной анимацией */
.cosmic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(135deg, #0a0a2a 0%, #1a1a4a 30%, #2d2d5a 70%, #3a3a6a 100%);
}

.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(3px 5px at 10% 10%, #ffffff, transparent),
    radial-gradient(1px 1px at 30% 40%, #cccccc, transparent),
    radial-gradient(1px 1px at 50% 20%, #eeeeee, transparent),
    radial-gradient(1px 1px at 70% 70%, #ffffff, transparent),
    radial-gradient(1px 1px at 90% 30%, #cccccc, transparent),
    radial-gradient(1px 1px at 20% 80%, #eeeeee, transparent),
    radial-gradient(1px 1px at 80% 50%, #ffffff, transparent),
    radial-gradient(1px 1px at 40% 60%, #cccccc, transparent),
    radial-gradient(2px 2px at 20% 30%, #ffffff, transparent),
    radial-gradient(1px 1px at 40% 70%, #cccccc, transparent),
    radial-gradient(1px 1px at 60% 20%, #eeeeee, transparent),
    radial-gradient(2px 2px at 80% 50%, #ffffff, transparent),
    radial-gradient(1px 1px at 30% 80%, #cccccc, transparent),
    radial-gradient(1px 1px at 70% 40%, #eeeeee, transparent),
    radial-gradient(2px 2px at 50% 60%, #ffffff, transparent),
    radial-gradient(1px 1px at 90% 30%, #cccccc, transparent),
    radial-gradient(1px 1px at 10% 50%, #eeeeee, transparent),
    radial-gradient(2px 2px at 25% 75%, #ffffff, transparent),
    radial-gradient(1px 1px at 75% 15%, #cccccc, transparent),
    radial-gradient(1px 1px at 85% 85%, #eeeeee, transparent),
    radial-gradient(2px 2px at 15% 25%, #ffffff, transparent),
    radial-gradient(1px 1px at 55% 35%, #cccccc, transparent),
    radial-gradient(1px 1px at 35% 55%, #eeeeee, transparent),
    radial-gradient(2px 2px at 45% 45%, #ffffff, transparent),
    radial-gradient(1px 1px at 65% 65%, #cccccc, transparent),
    radial-gradient(1px 1px at 95% 95%, #eeeeee, transparent),
    radial-gradient(2px 2px at 5% 5%, #ffffff, transparent),
    radial-gradient(1px 1px at 50% 90%, #cccccc, transparent),
    radial-gradient(1px 1px at 90% 50%, #eeeeee, transparent),
    radial-gradient(2px 2px at 20% 20%, #ffffff, transparent),
    radial-gradient(1px 1px at 40% 40%, #cccccc, transparent),
    radial-gradient(1px 1px at 60% 80%, #eeeeee, transparent),
    radial-gradient(2px 2px at 80% 20%, #ffffff, transparent),
    radial-gradient(1px 1px at 30% 60%, #cccccc, transparent),
    radial-gradient(1px 1px at 70% 40%, #eeeeee, transparent),
    radial-gradient(2px 2px at 10% 90%, #ffffff, transparent),
    radial-gradient(1px 1px at 90% 10%, #cccccc, transparent),
    radial-gradient(1px 1px at 25% 35%, #eeeeee, transparent),
    radial-gradient(2px 2px at 75% 65%, #ffffff, transparent),
    radial-gradient(1px 1px at 55% 55%, #cccccc, transparent),
    radial-gradient(1px 1px at 35% 25%, #eeeeee, transparent),
    radial-gradient(2px 2px at 65% 75%, #ffffff, transparent),
    radial-gradient(1px 1px at 15% 45%, #cccccc, transparent),
    radial-gradient(1px 1px at 85% 85%, #eeeeee, transparent);
  background-repeat: repeat;
  animation: starsMove 120s linear infinite;
}

.twinkling {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(1px 1px at 25% 35%, rgba(255, 255, 255, 0.8), transparent),
    radial-gradient(3px 3px at 75% 65%, rgba(200, 200, 255, 0.6), transparent),
    radial-gradient(1px 1px at 50% 50%, rgba(255, 255, 200, 0.7), transparent),
    radial-gradient(4px 4px at 10% 80%, rgba(255, 200, 200, 0.5), transparent),
    radial-gradient(2px 2px at 90% 20%, rgba(200, 255, 200, 0.6), transparent),
    radial-gradient(1px 1px at 40% 70%, rgba(255, 255, 255, 0.8), transparent),
    radial-gradient(3px 3px at 60% 30%, rgba(200, 200, 255, 0.6), transparent),
    radial-gradient(1px 1px at 20% 40%, rgba(255, 255, 200, 0.7), transparent),
    radial-gradient(4px 4px at 80% 90%, rgba(255, 200, 200, 0.5), transparent),
    radial-gradient(2px 2px at 30% 10%, rgba(200, 255, 200, 0.6), transparent);
  background-repeat: repeat;
  animation: twinkle 4s ease-in-out infinite alternate;
}

.clouds {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(8px 8px at 20% 40%, rgba(100, 100, 255, 0.15), transparent),
    radial-gradient(12px 12px at 70% 60%, rgba(150, 150, 255, 0.1), transparent),
    radial-gradient(10px 10px at 50% 20%, rgba(120, 120, 255, 0.12), transparent),
    radial-gradient(15px 15px at 80% 80%, rgba(180, 180, 255, 0.1), transparent),
    radial-gradient(9px 9px at 30% 70%, rgba(130, 130, 255, 0.13), transparent),
    radial-gradient(14px 14px at 60% 30%, rgba(160, 160, 255, 0.11), transparent),
    radial-gradient(11px 11px at 40% 50%, rgba(140, 140, 255, 0.12), transparent),
    radial-gradient(13px 13px at 90% 10%, rgba(170, 170, 255, 0.1), transparent),
    radial-gradient(7px 7px at 10% 90%, rgba(110, 110, 255, 0.14), transparent),
    radial-gradient(16px 16px at 25% 25%, rgba(190, 190, 255, 0.1), transparent),
    radial-gradient(8px 8px at 75% 75%, rgba(100, 100, 255, 0.15), transparent),
    radial-gradient(12px 12px at 35% 15%, rgba(150, 150, 255, 0.1), transparent),
    radial-gradient(10px 10px at 55% 85%, rgba(120, 120, 255, 0.12), transparent),
    radial-gradient(15px 15px at 85% 45%, rgba(180, 180, 255, 0.1), transparent),
    radial-gradient(9px 9px at 45% 65%, rgba(130, 130, 255, 0.13), transparent),
    radial-gradient(14px 14px at 65% 35%, rgba(160, 160, 255, 0.11), transparent),
    radial-gradient(11px 11px at 95% 55%, rgba(140, 140, 255, 0.12), transparent),
    radial-gradient(13px 13px at 5% 5%, rgba(170, 170, 255, 0.1), transparent),
    radial-gradient(7px 7px at 15% 95%, rgba(110, 110, 255, 0.14), transparent),
    radial-gradient(16px 16px at 50% 50%, rgba(190, 190, 255, 0.1), transparent);
  background-repeat: repeat;
  animation: cloudsMove 80s linear infinite;
}

@keyframes starsMove {
  from {
    transform: translateY(0) rotate(0deg);
  }
  to {
    transform: translateY(-100px) rotate(1deg);
  }
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

@keyframes cloudsMove {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(50px);
  }
}

/* Шапка */
.app-header {
  padding: 12px 16px;
  backdrop-filter: blur(15px);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.user-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.username {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(45deg, #ffffff, #cccccc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @include lines-limit(1);
}

.avatar {
  width: 44px;
  height: 44px;
  min-width: fit-content;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
}

.avatar-default {
  width: 40px;
  height: 40px;
  min-width: fit-content;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: fit-content;
}

.stats {
  display: flex;
  gap: 10px;
  margin-top: 2px;
  font-size: 12px;
}

.balance,
.rating {
  padding: 2px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

/* Основной контент */
.games-grid {
  padding: 20px 16px;
  text-align: center;
}

.title-section {
  margin-bottom: 30px;
}

.main-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 6px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
  background-size: 300% 300%;
  animation: gradientFlow 4s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 14px;
  opacity: 0.7;
  margin: 0;
  font-weight: 400;
}

.games-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 30px;
}

.game-card {
  position: relative;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  min-height: 120px;
}

.game-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(
    45deg,
    hsl(var(--hue, 200), 80%, 60%),
    hsl(calc(var(--hue, 200) + 40), 80%, 60%),
    hsl(var(--hue, 200), 80%, 60%)
  );
  z-index: -1;
  border-radius: 20px;
  opacity: 0.7;
  animation: borderPulse 3s ease-in-out infinite;
}

.card-content {
  position: relative;
  z-index: 2;
}

.game-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
}

.game-card:hover::before {
  opacity: 0.9;
}

.game-icon {
  font-size: 32px;
  margin-bottom: 8px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.game-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 4px;
  background: linear-gradient(45deg, #ffffff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.game-description {
  font-size: 11px;
  opacity: 0.8;
  margin: 0;
  line-height: 1.3;
}

.game-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  transform: rotate(45deg);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.game-card:hover .game-glow {
  opacity: 1;
}

.game-card:hover .card-shine {
  opacity: 1;
  animation: shine 1.5s ease-in-out;
}

/* Футер */
.app-footer {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.footer-text {
  font-size: 13px;
  opacity: 0.8;
  margin: 0 0 8px 0;
}

.online-count {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.7;
}

.online-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ecdc4;
  animation: pulse 2s ease-in-out infinite;
}

/* Анимации */
@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }
  20% {
    background-position: 100% 50%;
  }
  30% {
    background-position: 50% 100%;
  }
  40% {
    background-position: 0% 50%;
  }
  60% {
    background-position: 100% 50%;
  }
  70% {
    background-position: 50% 100%;
  }
  80% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

@keyframes borderPulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.9;
  }
}

@keyframes shine {
  0% {
    transform: rotate(45deg) translateX(-100%) translateY(-100%);
  }
  100% {
    transform: rotate(45deg) translateX(100%) translateY(100%);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* Адаптивность для мобильных устройств */
@media (max-width: 480px) {
  .games-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .game-card {
    padding: 16px 12px;
    min-height: 110px;
  }

  .main-title {
    font-size: 36px;
    line-height: normal;
  }

  .game-icon {
    font-size: 28px;
  }

  .game-title {
    font-size: 14px;
  }

  .game-description {
    font-size: 10px;
  }
}

@media (max-width: 360px) {
  .games-container {
    grid-template-columns: 1fr;
  }

  .app-header {
    padding: 10px 12px;
  }

  .avatar {
    width: 40px;
    height: 40px;
  }
}
</style>
