<template>
  <div class="coin-mobile-container">
    <!-- Фон -->
    <div class="mobile-background">
      <div class="mobile-stars"></div>
    </div>

    <!-- Шапка -->
    <div class="mobile-header">
      <button class="mobile-back-btn" @click="$router.push('/')">←</button>
      <div class="mobile-title">
        <span class="mobile-emoji">🪙</span>
        <h1>Coin Flip</h1>
      </div>
      <div class="mobile-balance">🪙 {{ formatNumber(balance) }}</div>
    </div>

    <!-- Основной контент -->
    <main class="mobile-content">
      <!-- Область монеты -->
      <div class="coin-flip-area">
        <div class="coin-display">
          <div class="coin" :class="{ flipping: isFlipping, won: isWin && showResult }">
            <div class="coin-front">H</div>
            <div class="coin-back">T</div>
            <div class="coin-edge"></div>
          </div>
        </div>

        <!-- Результат -->
        <div class="result-display" v-if="showResult">
          <div class="result-text" :class="{ win: isWin, loss: !isWin }">
            {{ isWin ? 'YOU WIN!' : 'YOU LOSE!' }}
          </div>
          <div class="result-details">
            {{ resultSide }} • {{ currentChoice === 'heads' ? 'Heads' : 'Tails' }}
          </div>
          <div class="result-amount" v-if="isWin">
            +{{ formatNumber(winAmount) }} 🪙
          </div>
        </div>
      </div>

      <!-- Выбор стороны -->
      <div class="choice-panel">
        <div class="section-title">Choose Side</div>
        <div class="choice-buttons">
          <button 
            class="choice-btn heads-btn"
            :class="{ active: currentChoice === 'heads', disabled: isFlipping }"
            @click="selectChoice('heads')"
          >
            <span class="choice-emoji">👑</span>
            <span class="choice-text">Heads</span>
          </button>
          
          <button 
            class="choice-btn tails-btn"
            :class="{ active: currentChoice === 'tails', disabled: isFlipping }"
            @click="selectChoice('tails')"
          >
            <span class="choice-emoji">🐍</span>
            <span class="choice-text">Tails</span>
          </button>
        </div>
      </div>

      <!-- Панель ставок -->
      <div class="bet-panel">
        <div class="bet-section">
          <div class="section-title">Bet Amount</div>
          <div class="bet-controls">
            <button class="bet-btn" @click="changeBet(-10)">-10</button>
            <div class="bet-amount-display">
              <span class="bet-value">{{ betAmount }}</span>
              <span class="bet-currency">🪙</span>
            </div>
            <button class="bet-btn" @click="changeBet(10)">+10</button>
          </div>
        </div>

        <div class="info-section">
          <div class="info-item">
            <span>Payout:</span>
            <span class="info-value">x2.00</span>
          </div>
          <div class="info-item">
            <span>Win Chance:</span>
            <span class="info-value">50%</span>
          </div>
        </div>
      </div>

      <!-- Кнопка броска -->
      <button 
        class="flip-btn"
        :class="{ flipping: isFlipping }"
        @click="flipCoin"
        :disabled="isFlipping || balance < betAmount || !currentChoice"
      >
        <span v-if="!isFlipping">🎯 FLIP COIN</span>
        <span v-else>FLIPPING...</span>
        <div class="bet-cost">-{{ betAmount }} 🪙</div>
      </button>

      <!-- Статистика -->
      <div class="stats-panel">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">Last Result</div>
            <div class="stat-value">{{ lastResult || '-' }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Last Win</div>
            <div class="stat-value">{{ formatNumber(lastWin) }} 🪙</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Total Flips</div>
            <div class="stat-value">{{ totalFlips }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Win Rate</div>
            <div class="stat-value">{{ winRate }}%</div>
          </div>
        </div>

        <div class="history-section">
          <div class="section-title">Recent Flips</div>
          <div class="history-list">
            <div 
              v-for="(result, index) in flipHistory" 
              :key="index"
              class="history-item"
              :class="{ win: result.win, loss: !result.win }"
            >
              <span class="history-side">{{ result.side === 'heads' ? 'H' : 'T' }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Уведомление -->
    <div v-if="showResultNotification" class="result-notification">
      <div class="notification-content" :class="{ win: isWin, loss: !isWin }">
        <div class="notification-emoji">{{ isWin ? '🎉' : '🪙' }}</div>
        <div class="notification-title">{{ isWin ? 'WINNER!' : 'BETTER LUCK!' }}</div>
        <div class="notification-text">
          {{ isWin ? `You won ${formatNumber(winAmount)} coins!` : `Landed on: ${resultSide}` }}
        </div>
        <button class="notification-btn" @click="showResultNotification = false">
          CONTINUE
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Состояние игры
const balance = ref(1000);
const betAmount = ref(50);
const isFlipping = ref(false);
const showResult = ref(false);
const showResultNotification = ref(false);
const isWin = ref(false);
const currentChoice = ref<'heads' | 'tails' | null>(null);
const resultSide = ref<'Heads' | 'Tails'>('Heads');
const winAmount = ref(0);
const lastWin = ref(0);
const lastResult = ref('');
const totalFlips = ref(0);
const wins = ref(0);
const flipHistory = ref<Array<{side: string, win: boolean}>>([]);

// Вычисляемые свойства
const winRate = computed(() => {
  return totalFlips.value > 0 ? Math.round((wins.value / totalFlips.value) * 100) : 0;
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

const selectChoice = (choice: 'heads' | 'tails') => {
  if (!isFlipping.value) {
    currentChoice.value = choice;
  }
};

const flipCoin = () => {
  if (isFlipping.value || balance.value < betAmount.value || !currentChoice.value) return;

  // Списываем ставку
  balance.value -= betAmount.value;
  isFlipping.value = true;
  showResult.value = false;
  showResultNotification.value = false;
  totalFlips.value++;

  // Анимация броска
  const flipDuration = 2000;
  const flipInterval = setInterval(() => {
    // Случайное вращение во время анимации
    resultSide.value = Math.random() > 0.5 ? 'Heads' : 'Tails';
  }, 100);

  // Завершение броска
  setTimeout(() => {
    clearInterval(flipInterval);
    finishFlip();
  }, flipDuration);
};

const finishFlip = () => {
  // Финальный результат
  const randomSide = Math.random() > 0.5 ? 'Heads' : 'Tails';
  resultSide.value = randomSide;
  
  // Проверяем выигрыш
  const win = currentChoice.value === 'heads' ? randomSide === 'Heads' : randomSide === 'Tails';
  isWin.value = win;
  showResult.value = true;

  // Сохраняем в историю
  const resultEntry = {
    side: randomSide.toLowerCase(),
    win: win
  };
  flipHistory.value.unshift(resultEntry);
  if (flipHistory.value.length > 8) flipHistory.value.pop();

  lastResult.value = `${randomSide === 'Heads' ? 'H' : 'T'} • ${win ? 'Win' : 'Lose'}`;

  if (win) {
    // Выигрыш
    wins.value++;
    winAmount.value = betAmount.value * 2;
    lastWin.value = winAmount.value;
    balance.value += winAmount.value;
  }

  // Показываем уведомление
  setTimeout(() => {
    isFlipping.value = false;
    showResultNotification.value = true;
  }, 800);
};

// Инициализация
onMounted(() => {
  // Заполняем историю начальными значениями
  for (let i = 0; i < 5; i++) {
    const side = Math.random() > 0.5 ? 'heads' : 'tails';
    const win = Math.random() > 0.5;
    flipHistory.value.push({ side, win });
  }
});
</script>

<style scoped>
.coin-mobile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f2d 0%, #1c1c4c 50%, #2a2a5c 100%);
  color: white;
  padding: 16px;
  position: relative;
  overflow-x: hidden;
}

.mobile-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.mobile-stars {
  background-image: 
    radial-gradient(1px 1px at 20% 30%, #ffffff40, transparent),
    radial-gradient(1px 1px at 80% 70%, #cccccc40, transparent);
  background-repeat: repeat;
  animation: starsMove 80s linear infinite;
}

.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  margin-bottom: 20px;
}

.mobile-back-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 20px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-emoji {
  font-size: 28px;
}

.mobile-title h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.mobile-balance {
  background: rgba(255, 255, 255, 0.15);
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

.mobile-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.coin-flip-area {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.coin-display {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  perspective: 1000px;
}

.coin {
  width: 100px;
  height: 100px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.3s ease-out;
}

.coin.flipping {
  animation: coinFlip 2s ease-in-out;
}

.coin.won {
  filter: drop-shadow(0 0 20px gold);
}

.coin-front, .coin-back {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 800;
  backface-visibility: hidden;
}

.coin-front {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #2a2a5c;
  transform: rotateY(0deg);
}

.coin-back {
  background: linear-gradient(45deg, #c0c0c0, #e0e0e0);
  color: #2a2a5c;
  transform: rotateY(180deg);
}

.coin-edge {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(45deg, #d4af37, #f9d423);
  transform: rotateY(90deg);
}

.result-display {
  margin-top: 20px;
}

.result-text {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 8px;
}

.result-text.win {
  color: #4ecdc4;
  text-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
}

.result-text.loss {
  color: #ff6b6b;
}

.result-details {
  font-size: 16px;
  opacity: 0.8;
  margin-bottom: 8px;
}

.result-amount {
  font-size: 18px;
  font-weight: 700;
  color: #4ecdc4;
}

.choice-panel {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #ffd93d;
  text-align: center;
}

.choice-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.choice-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.choice-btn.active {
  border-color: #4ecdc4;
  background: rgba(78, 205, 196, 0.2);
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.3);
}

.choice-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.heads-btn.active {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.2);
}

.tails-btn.active {
  border-color: #c0c0c0;
  background: rgba(192, 192, 192, 0.2);
}

.choice-emoji {
  font-size: 24px;
}

.choice-text {
  font-size: 16px;
  font-weight: 600;
}

.bet-panel {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.bet-section {
  margin-bottom: 20px;
}

.bet-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bet-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bet-amount-display {
  flex: 1;
  background: rgba(255, 255, 255, 0.15);
  padding: 15px;
  border-radius: 12px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.bet-value {
  font-size: 20px;
  font-weight: 700;
}

.bet-currency {
  font-size: 16px;
}

.info-section {
  display: flex;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.info-item span:first-child {
  font-size: 12px;
  opacity: 0.8;
}

.info-value {
  font-size: 14px;
  font-weight: 700;
  color: #4ecdc4;
}

.flip-btn {
  width: 100%;
  background: linear-gradient(45deg, #4ecdc4, #45b7d1);
  border: none;
  padding: 20px;
  border-radius: 16px;
  color: white;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 10px 30px rgba(78, 205, 196, 0.3);
}

.flip-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.flip-btn.flipping {
  background: linear-gradient(45deg, #ffd93d, #ff6b6b);
  animation: pulse 1s ease-in-out infinite;
}

.bet-cost {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff6b6b;
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.stats-panel {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 12px;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #4ecdc4;
}

.history-section {
  margin-top: 20px;
}

.history-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.history-item {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.history-item.win {
  background: rgba(78, 205, 196, 0.2);
  color: #4ecdc4;
  border: 1px solid rgba(78, 205, 196, 0.3);
}

.history-item.loss {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.result-notification {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.notification-content {
  background: linear-gradient(135deg, #2a2a5c, #3a3a6c);
  padding: 30px;
  border-radius: 20px;
  text-align: center;
  border: 2px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 300px;
}

.notification-content.win {
  border-color: #4ecdc4;
  background: linear-gradient(135deg, #2a5c4c, #3a6c5c);
}

.notification-content.loss {
  border-color: #ff6b6b;
  background: linear-gradient(135deg, #5c2a2a, #6c3a3a);
}

.notification-emoji {
  font-size: 48px;
  margin-bottom: 16px;
}

.notification-title {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 8px;
}

.notification-text {
  font-size: 16px;
  margin-bottom: 20px;
  opacity: 0.9;
}

.notification-btn {
  width: 100%;
  background: #4ecdc4;
  border: none;
  padding: 15px;
  border-radius: 12px;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.notification-content.loss .notification-btn {
  background: #ff6b6b;
}

/* Анимации */
@keyframes coinFlip {
  0% {
    transform: rotateY(0deg);
  }
  25% {
    transform: rotateY(900deg);
  }
  50% {
    transform: rotateY(1800deg);
  }
  75% {
    transform: rotateY(2700deg);
  }
  100% {
    transform: rotateY(3600deg);
  }
}

@keyframes starsMove {
  from { transform: translateY(0); }
  to { transform: translateY(-100px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Адаптация для мобильных */
@media (max-width: 360px) {
  .coin {
    width: 80px;
    height: 80px;
  }
  
  .coin-front, .coin-back {
    font-size: 28px;
  }
  
  .choice-buttons {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-height: 700px) {
  .mobile-content {
    gap: 16px;
  }
  
  .coin-flip-area,
  .choice-panel,
  .bet-panel,
  .stats-panel {
    padding: 20px;
  }
  
  .coin {
    width: 80px;
    height: 80px;
  }
}
</style>