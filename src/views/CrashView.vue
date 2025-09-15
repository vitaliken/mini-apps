<template>
  <div class="crash-container">
    <!-- Фон -->
    <div class="game-background">
      <div class="stars"></div>
      <div class="particles"></div>
    </div>

    <!-- Шапка -->
    <header class="game-header">
      <button class="back-button" @click="$router.push('/')">←</button>
      <h1>🚀 Crash</h1>
      <div class="balance">🪙 {{ formatNumber(balance) }}</div>
    </header>

    <!-- Основной игровой экран -->
    <main class="game-content">
      <!-- График и ракета -->
      <div class="crash-area">
        <div class="graph-container">
          <div class="graph" ref="graphRef">
            <div class="rocket" :style="rocketStyle">🚀</div>
            <div class="crash-line" :style="{ height: crashPoint * 100 + '%' }">
              <span class="multiplier">x{{ crashPoint.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Текущий множитель -->
        <div class="current-multiplier" :class="{ crashing: isCrashing }">
          x{{ currentMultiplier.toFixed(2) }}
        </div>
      </div>

      <!-- Статистика -->
      <div class="stats">
        <div class="stat">
          <span>Last crash:</span>
          <span class="value">x{{ lastCrash.toFixed(2) }}</span>
        </div>
        <div class="stat">
          <span>Players:</span>
          <span class="value">{{ activePlayers }}</span>
        </div>
      </div>

      <!-- Панель ставок -->
      <div class="bet-panel">
        <div class="bet-controls">
          <div class="bet-amount">
            <span>Bet amount:</span>
            <div class="amount-controls">
              <button @click="changeBet(-10)">-10</button>
              <input
                v-model.number="betAmount"
                type="number"
                min="10"
                max="1000"
                @input="validateBet"
              />
              <button @click="changeBet(10)">+10</button>
            </div>
          </div>

          <div class="auto-cashout">
            <span>Auto cashout: x{{ autoCashout.toFixed(2) }}</span>
            <input v-model.number="autoCashout" type="range" min="1.1" max="10" step="0.1" />
          </div>
        </div>

        <!-- Кнопка игры -->
        <button
          class="play-button"
          :class="{
            playing: isPlaying,
            'cashing-out': isCashingOut,
            crashed: isCrashing,
          }"
          @click="handlePlayClick"
          :disabled="isPlaying && !canCashout"
        >
          {{ buttonText }}
        </button>

        <!-- История игры -->
        <div class="history">
          <h3>History</h3>
          <div class="history-items">
            <div
              v-for="(item, index) in history"
              :key="index"
              class="history-item"
              :class="{ red: item < 2, green: item >= 2 }"
            >
              x{{ item.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Уведомление о результате -->
    <div v-if="showWinNotification" class="win-notification">
      <div class="win-content" :class="{ crash: winAmount === 0 }">
        <div class="win-emoji">{{ winAmount > 0 ? '🎉' : '💥' }}</div>
        <h3>{{ winAmount > 0 ? 'Cashed out!' : 'Crashed!' }}</h3>
        <p :class="{ win: winAmount > 0, loss: winAmount === 0 }">
          {{ winAmount > 0 ? '+' + formatNumber(winAmount) + ' 🪙' : 'Better luck next time!' }}
        </p>
        <button @click="showWinNotification = false">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

// Состояние игры
const balance = ref(1000);
const betAmount = ref(50);
const isPlaying = ref(false);
const isCashingOut = ref(false);
const isCrashing = ref(false);
const currentMultiplier = ref(1.0);
const crashPoint = ref(0);
const lastCrash = ref(2.5);
const activePlayers = ref(24);
const autoCashout = ref(2.0);
const history = ref([1.25, 3.78, 1.01, 5.43, 2.15, 1.67]);
const showWinNotification = ref(false);
const winAmount = ref(0);

// Вычисляемые свойства
const buttonText = computed(() => {
  if (isCashingOut.value) return 'Cashing out...';
  if (isPlaying.value) return 'Cash Out';
  if (isCrashing.value) return 'Place Bet';
  return 'Place Bet';
});

const canCashout = computed(() => {
  return isPlaying.value && !isCashingOut.value && !isCrashing.value;
});

const rocketStyle = computed(() => {
  const progress = Math.min(currentMultiplier.value / 10, 1);
  return {
    bottom: `${progress * 100}%`,
    transform: `scale(${1 + progress * 0.5})`,
  };
});

// Методы
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

const changeBet = (amount: number) => {
  const newBet = betAmount.value + amount;
  if (newBet >= 10 && newBet <= balance.value) {
    betAmount.value = newBet;
  }
};

const validateBet = () => {
  if (betAmount.value < 10) betAmount.value = 10;
  if (betAmount.value > balance.value) betAmount.value = balance.value;
};

const generateCrashPoint = (): number => {
  const rand = Math.random();
  if (rand < 0.3) return 1 + Math.random() * 1;
  if (rand < 0.6) return 2 + Math.random() * 2;
  if (rand < 0.8) return 4 + Math.random() * 3;
  if (rand < 0.95) return 7 + Math.random() * 5;
  return 12 + Math.random() * 20;
};

const startGame = () => {
  if (isPlaying.value || balance.value < betAmount.value) return;

  balance.value -= betAmount.value;
  isPlaying.value = true;
  isCrashing.value = false;
  currentMultiplier.value = 1.0;
  crashPoint.value = generateCrashPoint();

  lastCrash.value = crashPoint.value;
  history.value.unshift(crashPoint.value);
  if (history.value.length > 10) history.value.pop();
};

const cashOut = () => {
  if (!isPlaying.value || isCashingOut.value) return;

  isCashingOut.value = true;

  setTimeout(() => {
    const win = Math.floor(betAmount.value * currentMultiplier.value);
    winAmount.value = win;
    balance.value += win;
    isPlaying.value = false;
    isCashingOut.value = false;
    showWinNotification.value = true;
  }, 1000);
};

const showCrashNotification = () => {
  winAmount.value = 0;
  showWinNotification.value = true;
};

const handlePlayClick = () => {
  if (isPlaying.value && canCashout.value) {
    cashOut();
  } else if (!isPlaying.value && !isCrashing.value) {
    startGame();
  } else if (isCrashing.value) {
    isCrashing.value = false;
  }
};

// Игровой цикл
let gameInterval: number;
let gameStartTime: number;

const updateGame = () => {
  if (!isPlaying.value) return;

  const elapsed = (Date.now() - gameStartTime) / 1000;
  const growthRate = Math.max(0.1, 1 - elapsed * 0.05);
  currentMultiplier.value += 0.02 * growthRate;

  if (currentMultiplier.value >= autoCashout.value && !isCashingOut.value) {
    cashOut();
  }

  if (currentMultiplier.value >= crashPoint.value) {
    isCrashing.value = true;
    isPlaying.value = false;

    setTimeout(() => {
      isCrashing.value = false;
      showCrashNotification();
    }, 2000);
  }
};

// Watchers и lifecycle hooks
watch(isPlaying, (playing) => {
  if (playing) {
    gameStartTime = Date.now();
    gameInterval = setInterval(updateGame, 50);
  } else {
    clearInterval(gameInterval);
  }
});

onMounted(() => {
  setInterval(() => {
    activePlayers.value = 20 + Math.floor(Math.random() * 15);
  }, 5000);
});

onUnmounted(() => {
  clearInterval(gameInterval);
});
</script>

<style scoped>
.crash-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a2a 0%, #1a1a4a 50%, #2d2d5a 100%);
  color: white;
  padding: 16px;
  position: relative;
  overflow-x: hidden;
}

.game-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.stars {
  background-image:
    radial-gradient(2px 2px at 20% 30%, #ffffff, transparent),
    radial-gradient(1px 1px at 40% 70%, #cccccc, transparent);
  background-repeat: repeat;
  animation: starsMove 60s linear infinite;
}

.particles {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(1px 1px at 50% 20%, rgba(255, 200, 100, 0.6), transparent),
    radial-gradient(1px 1px at 30% 60%, rgba(100, 200, 255, 0.6), transparent);
  animation: particlesFloat 20s ease-in-out infinite alternate;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 18px;
}

.game-header h1 {
  margin: 0;
  font-size: 24px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.balance {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 600;
}

.crash-area {
  position: relative;
  margin-bottom: 20px;
}

.graph-container {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  padding: 20px;
  height: 200px;
  position: relative;
}

.graph {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #1a1a4a 0%, #2d2d5a 100%);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.rocket {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  transition:
    bottom 0.1s ease-out,
    transform 0.2s ease-out;
  z-index: 10;
}

.crash-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(0deg, rgba(255, 107, 107, 0.3), transparent);
  border-top: 2px dashed #ff6b6b;
  transition: height 0.3s ease;
}

.multiplier {
  position: absolute;
  top: -25px;
  right: 10px;
  background: #ff6b6b;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
}

.current-multiplier {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(45deg, #4ecdc4, #45b7d1);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(78, 205, 196, 0.5);
}

.current-multiplier.crashing {
  animation: crashPulse 0.5s ease-in-out infinite;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.stat {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 12px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.stat .value {
  display: block;
  font-weight: 700;
  font-size: 18px;
  margin-top: 4px;
}

.bet-panel {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 20px;
  backdrop-filter: blur(15px);
}

.bet-controls {
  margin-bottom: 20px;
}

.bet-amount,
.auto-cashout {
  margin-bottom: 16px;
}

.amount-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.amount-controls input {
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  color: white;
  text-align: center;
}

.amount-controls button {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.auto-cashout input {
  width: 100%;
  margin-top: 8px;
}

.play-button {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(45deg, #4ecdc4, #45b7d1);
  color: white;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.play-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.play-button.playing {
  background: linear-gradient(45deg, #ffd93d, #ff6b6b);
}

.play-button.cashing-out {
  background: linear-gradient(45deg, #6c5ce7, #a29bfe);
  animation: pulse 1s ease-in-out infinite;
}

.play-button.crashed {
  background: linear-gradient(45deg, #ff6b6b, #c23616);
}

.history h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  opacity: 0.8;
}

.history-items {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.history-item {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.history-item.red {
  background: rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
}

.history-item.green {
  background: rgba(78, 205, 196, 0.3);
  color: #4ecdc4;
}

.win-notification {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.win-content {
  background: linear-gradient(135deg, #1a1a4a, #2d2d5a);
  padding: 30px;
  border-radius: 20px;
  text-align: center;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.win-content.crash {
  background: linear-gradient(135deg, #2d1a1a, #5a2d2d);
}

.win-content.crash h3 {
  color: #ff6b6b;
}

.win-emoji {
  font-size: 48px;
  margin-bottom: 16px;
}

.win-content h3 {
  margin: 0 0 8px 0;
  color: #4ecdc4;
}

.win-content p {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 700;
}

.win {
  color: #4ecdc4;
}

.loss {
  color: #ff6b6b;
}

.win-content button {
  background: #4ecdc4;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.win-content.crash button {
  background: #ff6b6b;
}

@keyframes starsMove {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100px);
  }
}

@keyframes particlesFloat {
  from {
    transform: translateX(0) translateY(0);
  }
  to {
    transform: translateX(20px) translateY(20px);
  }
}

@keyframes crashPulse {
  0%,
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@media (max-width: 480px) {
  .game-header h1 {
    font-size: 20px;
  }

  .graph-container {
    height: 150px;
    padding: 15px;
  }

  .current-multiplier {
    font-size: 24px;
  }

  .bet-panel {
    padding: 16px;
  }

  .play-button {
    padding: 14px;
    font-size: 16px;
  }
}
</style>
