<template>
  <div class="dice-mobile-container">
    <!-- Фон -->
    <div class="mobile-background">
      <div class="mobile-stars"></div>
    </div>

    <!-- Шапка -->
    <div class="mobile-header">
      <button class="mobile-back-btn" @click="$router.push('/')">←</button>
      <div class="mobile-title">
        <span class="mobile-emoji">🎲</span>
        <h1>Dice</h1>
      </div>
      <div class="mobile-balance">🪙 {{ formatNumber(balance) }}</div>
    </div>

    <!-- Основной контент -->
    <main class="mobile-content">
      <!-- Область броска -->
      <div class="dice-roll-area">
        <div class="dice-display">
          <div class="dice-wrapper">
            <div class="dice" :class="{ rolling: isRolling }">
              <div class="dice-number">{{ currentDice1 }}</div>
            </div>
            <div class="dice-plus">+</div>
            <div class="dice" :class="{ rolling: isRolling }">
              <div class="dice-number">{{ currentDice2 }}</div>
            </div>
            <div class="dice-equals">=</div>
            <div class="dice-total" :class="{ win: isWin && showResult, loss: !isWin && showResult }">
              {{ currentRoll }}
            </div>
          </div>
        </div>

        <!-- Результат -->
        <div class="result-display" v-if="showResult">
          <div class="result-text" :class="{ win: isWin, loss: !isWin }">
            {{ isWin ? 'YOU WIN!' : 'YOU LOSE!' }}
          </div>
          <div class="result-amount" v-if="isWin">
            +{{ formatNumber(winAmount) }} 🪙
          </div>
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

        <div class="target-section">
          <div class="section-title">Target Number</div>
          <div class="target-buttons">
            <button 
              v-for="num in [4, 5, 6, 7, 8, 9]" 
              :key="num"
              class="target-btn"
              :class="{ active: target === num }"
              @click="target = num"
            >
              {{ num }}+
            </button>
          </div>
        </div>

        <div class="info-section">
          <div class="info-item">
            <span>Payout:</span>
            <span class="info-value">x{{ payoutMultiplier.toFixed(2) }}</span>
          </div>
          <div class="info-item">
            <span>Win Chance:</span>
            <span class="info-value">{{ winChance }}%</span>
          </div>
        </div>
      </div>

      <!-- Кнопка броска -->
      <button 
        class="roll-btn"
        :class="{ rolling: isRolling }"
        @click="rollDice"
        :disabled="isRolling || balance < betAmount"
      >
        <span v-if="!isRolling">🎲 ROLL DICE</span>
        <span v-else>ROLLING...</span>
        <div class="bet-cost">-{{ betAmount }} 🪙</div>
      </button>

      <!-- Статистика -->
      <div class="stats-panel">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">Last Roll</div>
            <div class="stat-value">{{ lastRoll || '-' }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Last Win</div>
            <div class="stat-value">{{ formatNumber(lastWin) }} 🪙</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Total Rolls</div>
            <div class="stat-value">{{ totalRolls }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Win Rate</div>
            <div class="stat-value">{{ winRate }}%</div>
          </div>
        </div>

        <div class="history-section">
          <div class="section-title">Recent Rolls</div>
          <div class="history-list">
            <div 
              v-for="(roll, index) in rollHistory" 
              :key="index"
              class="history-item"
              :class="{ win: roll >= target, loss: roll < target }"
            >
              {{ roll }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Уведомление -->
    <div v-if="showResultNotification" class="result-notification">
      <div class="notification-content" :class="{ win: isWin, loss: !isWin }">
        <div class="notification-emoji">{{ isWin ? '🎉' : '🎲' }}</div>
        <div class="notification-title">{{ isWin ? 'WINNER!' : 'TRY AGAIN' }}</div>
        <div class="notification-text">
          {{ isWin ? `You won ${formatNumber(winAmount)} coins!` : `Rolled: ${currentRoll}` }}
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
const target = ref(5);
const isRolling = ref(false);
const currentRoll = ref(0);
const currentDice1 = ref(1);
const currentDice2 = ref(1);
const showResult = ref(false);
const showResultNotification = ref(false);
const isWin = ref(false);
const winAmount = ref(0);
const lastWin = ref(0);
const lastRoll = ref(0);
const totalRolls = ref(0);
const wins = ref(0);
const rollHistory = ref<number[]>([]);

// Вычисляемые свойства
const payoutMultiplier = computed(() => {
  const chance = (13 - target.value) / 36;
  return 1 / chance;
});

const winChance = computed(() => {
  return Math.round(((13 - target.value) / 36) * 100);
});

const winRate = computed(() => {
  return totalRolls.value > 0 ? Math.round((wins.value / totalRolls.value) * 100) : 0;
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

const rollDice = () => {
  if (isRolling.value || balance.value < betAmount.value) return;

  // Списываем ставку
  balance.value -= betAmount.value;
  isRolling.value = true;
  showResult.value = false;
  showResultNotification.value = false;
  totalRolls.value++;

  // Анимация броска
  let rollCount = 0;
  const maxRolls = 15;
  const rollInterval = setInterval(() => {
    currentDice1.value = Math.floor(Math.random() * 6) + 1;
    currentDice2.value = Math.floor(Math.random() * 6) + 1;
    
    rollCount++;
    if (rollCount >= maxRolls) {
      clearInterval(rollInterval);
      finishRoll();
    }
  }, 80);
};

const finishRoll = () => {
  // Финальный бросок
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const roll = dice1 + dice2;
  
  currentDice1.value = dice1;
  currentDice2.value = dice2;
  currentRoll.value = roll;
  lastRoll.value = roll;
  rollHistory.value.unshift(roll);
  if (rollHistory.value.length > 8) rollHistory.value.pop();

  // Проверяем выигрыш
  isWin.value = roll >= target.value;
  showResult.value = true;

  if (isWin.value) {
    // Выигрыш
    wins.value++;
    winAmount.value = Math.floor(betAmount.value * payoutMultiplier.value);
    lastWin.value = winAmount.value;
    balance.value += winAmount.value;
  }

  // Показываем уведомление
  setTimeout(() => {
    isRolling.value = false;
    showResultNotification.value = true;
  }, 800);
};

// Инициализация
onMounted(() => {
  // Заполняем историю начальными значениями
  for (let i = 0; i < 5; i++) {
    rollHistory.value.push(Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1);
  }
});
</script>

<style scoped>
.dice-mobile-container {
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

.dice-roll-area {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dice-display {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.dice-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dice {
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #2a2a5c;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  border: 2px solid #ffd93d;
}

.dice.rolling {
  animation: diceBounce 0.5s ease-in-out infinite;
}

.dice-number {
  font-size: 24px;
  font-weight: 800;
}

.dice-plus, .dice-equals {
  font-size: 20px;
  font-weight: 700;
  color: #ffd93d;
  margin: 0 8px;
}

.dice-total {
  font-size: 28px;
  font-weight: 800;
  padding: 12px 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  min-width: 60px;
  text-align: center;
}

.dice-total.win {
  background: linear-gradient(45deg, #4ecdc4, #45b7d1);
  color: white;
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.4);
}

.dice-total.loss {
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  color: white;
}

.result-display {
  text-align: center;
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

.result-amount {
  font-size: 18px;
  font-weight: 700;
  color: #4ecdc4;
}

.bet-panel {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #ffd93d;
}

.bet-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
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

.target-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.target-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.target-btn.active {
  background: linear-gradient(45deg, #4ecdc4, #45b7d1);
  box-shadow: 0 0 15px rgba(78, 205, 196, 0.3);
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

.roll-btn {
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

.roll-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.roll-btn.rolling {
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

.history-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.history-item {
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 700;
  min-width: 40px;
  text-align: center;
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
@keyframes diceBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
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

/* Адаптация для очень маленьких экранов */
@media (max-width: 360px) {
  .dice {
    width: 50px;
    height: 50px;
  }
  
  .dice-number {
    font-size: 20px;
  }
  
  .dice-total {
    font-size: 24px;
    padding: 10px 16px;
  }
  
  .target-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* Портретная ориентация */
@media (max-height: 700px) {
  .mobile-content {
    gap: 16px;
  }
  
  .dice-roll-area,
  .bet-panel,
  .stats-panel {
    padding: 20px;
  }
  
  .dice {
    width: 50px;
    height: 50px;
  }
}
</style>