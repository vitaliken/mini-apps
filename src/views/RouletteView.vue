<template>
  <div class="roulette-mobile-container">
    <!-- Фон -->
    <div class="mobile-background">
      <div class="mobile-stars"></div>
    </div>

    <!-- Шапка -->
    <div class="mobile-header">
      <button class="mobile-back-btn" @click="$router.push('/')">←</button>
      <div class="mobile-title">
        <span class="mobile-emoji">🎡</span>
        <h1>Roulette</h1>
      </div>
      <div class="mobile-balance">🪙 {{ formatNumber(balance) }}</div>
    </div>

    <!-- Основной контент -->
    <main class="mobile-content">
      <!-- Рулетка -->
      <div class="roulette-wheel-area">
        <div class="wheel-container">
          <div class="wheel" :class="{ spinning: isSpinning }" :style="wheelStyle">
            <div class="wheel-numbers">
              <div
                v-for="number in numbers"
                :key="number.value"
                class="wheel-number"
                :class="getNumberClass(number)"
                :style="getNumberStyle(number)"
              >
                {{ number.value }}
              </div>
            </div>
            <div class="wheel-center"></div>
          </div>
          <div class="wheel-pointer"></div>
        </div>

        <!-- Результат -->
        <div class="result-display" v-if="showResult">
          <div class="result-number" :class="getNumberClass(currentResult)">
            {{ currentResult.value }}
          </div>
          <div class="result-text" :class="{ win: isWin, loss: !isWin }">
            {{ isWin ? "YOU WIN!" : "YOU LOSE!" }}
          </div>
          <div class="result-amount" v-if="isWin">+{{ formatNumber(winAmount) }} 🪙</div>
        </div>
      </div>

      <!-- Ставки -->
      <div class="betting-panel">
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

        <div class="bet-type-section">
          <div class="section-title">Bet Type</div>
          <div class="bet-type-buttons">
            <button
              v-for="type in betTypes"
              :key="type.id"
              class="bet-type-btn"
              :class="{ active: currentBetType === type.id }"
              @click="currentBetType = type.id"
            >
              <span class="bet-type-emoji">{{ type.emoji }}</span>
              <span class="bet-type-name">{{ type.name }}</span>
              <span class="bet-type-payout">x{{ type.payout }}</span>
            </button>
          </div>
        </div>

        <div class="info-section">
          <div class="info-item">
            <span>Payout:</span>
            <span class="info-value">x{{ currentPayout }}</span>
          </div>
          <div class="info-item">
            <span>Win Chance:</span>
            <span class="info-value">{{ winChance }}%</span>
          </div>
        </div>
      </div>

      <!-- Кнопка вращения -->
      <button
        class="spin-btn"
        :class="{ spinning: isSpinning }"
        @click="spinWheel"
        :disabled="isSpinning || balance < betAmount"
      >
        <span v-if="!isSpinning">🎯 SPIN WHEEL</span>
        <span v-else>SPINNING...</span>
        <div class="bet-cost">-{{ betAmount }} 🪙</div>
      </button>

      <!-- Статистика -->
      <div class="stats-panel">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">Last Number</div>
            <div class="stat-value" :class="getNumberClass(lastResult)">
              {{ lastResult?.value || "-" }}
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Last Win</div>
            <div class="stat-value">{{ formatNumber(lastWin) }} 🪙</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Total Spins</div>
            <div class="stat-value">{{ totalSpins }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Win Rate</div>
            <div class="stat-value">{{ winRate }}%</div>
          </div>
        </div>

        <div class="history-section">
          <div class="section-title">Recent Numbers</div>
          <div class="history-list">
            <div
              v-for="(result, index) in spinHistory"
              :key="index"
              class="history-item"
              :class="getNumberClass(result)"
            >
              {{ result.value }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Уведомление -->
    <div v-if="showResultNotification" class="result-notification">
      <div class="notification-content" :class="{ win: isWin, loss: !isWin }">
        <div class="notification-emoji">{{ isWin ? "🎉" : "🎡" }}</div>
        <div class="notification-title">{{ isWin ? "WINNER!" : "BETTER LUCK!" }}</div>
        <div class="notification-text">
          {{
            isWin
              ? `You won ${formatNumber(winAmount)} coins!`
              : `Landed on: ${currentResult.value}`
          }}
        </div>
        <div class="notification-details" v-if="isWin">
          {{ currentBetType }} • x{{ currentPayout }}
        </div>
        <button class="notification-btn" @click="showResultNotification = false">
          CONTINUE
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Номера рулетки (европейская - только 0)
const numbers = ref([
  { value: 0, color: "green" },
  { value: 32, color: "red" },
  { value: 15, color: "black" },
  { value: 19, color: "red" },
  { value: 4, color: "black" },
  { value: 21, color: "red" },
  { value: 2, color: "black" },
  { value: 25, color: "red" },
  { value: 17, color: "black" },
  { value: 34, color: "red" },
  { value: 6, color: "black" },
  { value: 27, color: "red" },
  { value: 13, color: "black" },
  { value: 36, color: "red" },
  { value: 11, color: "black" },
  { value: 30, color: "red" },
  { value: 8, color: "black" },
  { value: 23, color: "red" },
  { value: 10, color: "black" },
  { value: 5, color: "red" },
  { value: 24, color: "black" },
  { value: 16, color: "red" },
  { value: 33, color: "black" },
  { value: 1, color: "red" },
  { value: 20, color: "black" },
  { value: 14, color: "red" },
  { value: 31, color: "black" },
  { value: 9, color: "red" },
  { value: 22, color: "black" },
  { value: 18, color: "red" },
  { value: 29, color: "black" },
  { value: 7, color: "red" },
  { value: 28, color: "black" },
  { value: 12, color: "red" },
  { value: 35, color: "black" },
  { value: 3, color: "red" },
  { value: 26, color: "black" },
]);

// Типы ставок
const betTypes = ref([
  { id: "number", name: "Number", emoji: "🔢", payout: 36, chance: 2.7 },
  { id: "red", name: "Red", emoji: "🔴", payout: 2, chance: 48.6 },
  { id: "black", name: "Black", emoji: "⚫", payout: 2, chance: 48.6 },
  { id: "even", name: "Even", emoji: "🔢", payout: 2, chance: 48.6 },
  { id: "odd", name: "Odd", emoji: "🔢", payout: 2, chance: 48.6 },
  { id: "dozen1", name: "1-12", emoji: "1️⃣", payout: 3, chance: 32.4 },
  { id: "dozen2", name: "13-24", emoji: "2️⃣", payout: 3, chance: 32.4 },
  { id: "dozen3", name: "25-36", emoji: "3️⃣", payout: 3, chance: 32.4 },
]);

// Состояние игры
const balance = ref(1000);
const betAmount = ref(50);
const isSpinning = ref(false);
const showResult = ref(false);
const showResultNotification = ref(false);
const isWin = ref(false);
const currentBetType = ref("red");
const currentResult = ref({ value: 0, color: "green" });
const winAmount = ref(0);
const lastWin = ref(0);
const lastResult = ref();
const totalSpins = ref(0);
const wins = ref(0);
const spinHistory = ref<{ value: number; color: string }[]>([]);
const wheelRotation = ref(0);

// Вычисляемые свойства
const currentPayout = computed(() => {
  return betTypes.value.find((t) => t.id === currentBetType.value)?.payout || 2;
});

const winChance = computed(() => {
  return betTypes.value.find((t) => t.id === currentBetType.value)?.chance || 48.6;
});

const winRate = computed(() => {
  return totalSpins.value > 0 ? Math.round((wins.value / totalSpins.value) * 100) : 0;
});

const wheelStyle = computed(() => {
  return {
    transform: `rotate(${wheelRotation.value}deg)`,
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

const getNumberClass = (number: any) => {
  if (!number || typeof number === "undefined") return "";

  // Если передано просто число, находим соответствующий объект
  if (typeof number === "number") {
    const numberObj = numbers.value.find((n) => n.value === number);
    return numberObj ? `number-${numberObj.color}` : "";
  }

  // Если передан объект с цветом
  if (number.color) {
    return `number-${number.color}`;
  }

  return "";
};

const getNumberStyle = (number: any) => {
  const index = numbers.value.findIndex((n) => n.value === number.value);
  const angle = (index / numbers.value.length) * 360;
  return {
    transform: `rotate(${angle}deg)`,
  };
};

const checkWin = (result: any) => {
  const betType = currentBetType.value;

  switch (betType) {
    case "number":
      return result.value === 0; // Для простоты всегда выигрывает 0
    case "red":
      return result.color === "red";
    case "black":
      return result.color === "black";
    case "even":
      return result.value !== 0 && result.value % 2 === 0;
    case "odd":
      return result.value % 2 === 1;
    case "dozen1":
      return result.value >= 1 && result.value <= 12;
    case "dozen2":
      return result.value >= 13 && result.value <= 24;
    case "dozen3":
      return result.value >= 25 && result.value <= 36;
    default:
      return false;
  }
};

const spinWheel = () => {
  if (isSpinning.value || balance.value < betAmount.value) return;

  // Списываем ставку
  balance.value -= betAmount.value;
  isSpinning.value = true;
  showResult.value = false;
  showResultNotification.value = false;
  totalSpins.value++;

  // Анимация вращения
  const spinDuration = 3000;
  const startRotation = wheelRotation.value;
  const targetRotation = startRotation + 360 * 5 + Math.random() * 360;

  let startTime: number;
  const animate = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / spinDuration, 1);

    // Эффект замедления
    const easeOut = 1 - Math.pow(1 - progress, 3);
    wheelRotation.value = startRotation + (targetRotation - startRotation) * easeOut;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      finishSpin();
    }
  };

  requestAnimationFrame(animate);
};

const finishSpin = () => {
  // Определяем выпавший номер
  const finalRotation = wheelRotation.value % 360;
  const sectorAngle = 360 / numbers.value.length;
  const winningIndex =
    Math.floor((360 - finalRotation) / sectorAngle) % numbers.value.length;
  const result = numbers.value[winningIndex];

  currentResult.value = result;
  lastResult.value = result;

  // Проверяем выигрыш
  isWin.value = checkWin(result);
  showResult.value = true;

  // Сохраняем в историю
  spinHistory.value.unshift(result);
  if (spinHistory.value.length > 8) spinHistory.value.pop();

  if (isWin.value) {
    // Выигрыш
    wins.value++;
    winAmount.value = Math.floor(betAmount.value * currentPayout.value);
    lastWin.value = winAmount.value;
    balance.value += winAmount.value;
  }

  // Показываем уведомление
  setTimeout(() => {
    isSpinning.value = false;
    showResultNotification.value = true;
  }, 1000);
};

// Инициализация
onMounted(() => {
  // Заполняем историю начальными значениями
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * numbers.value.length);
    spinHistory.value.push(numbers.value[randomIndex]);
  }
});
</script>

<style scoped>
.roulette-mobile-container {
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
  background-image: radial-gradient(1px 1px at 20% 30%, #ffffff40, transparent),
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

.roulette-wheel-area {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.wheel-container {
  position: relative;
  width: 250px;
  height: 250px;
  margin: 0 auto 20px;
}

.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #0a5c36;
  position: relative;
  transition: transform 3s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
}

.wheel.spinning {
  transition: transform 3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.wheel-numbers {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.wheel-number {
  position: absolute;
  width: 30px;
  height: 30px;
  background: var(--number-bg, #d32f2f);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  transform-origin: center;
  left: calc(50% - 15px);
  top: 10px;
}

.number-red {
  --number-bg: #d32f2f;
  background: #d32f2f;
}

.number-black {
  --number-bg: #2c2c2c;
  background: #2c2c2c;
}

.number-green {
  --number-bg: #0a5c36;
  background: #0a5c36;
  color: white;
}

.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: gold;
  border-radius: 50%;
  border: 4px solid #ff6b6b;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.wheel-pointer {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 20px solid #ff6b6b;
  z-index: 10;
}

.result-display {
  margin-top: 20px;
}

.result-number {
  display: inline-block;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  margin: 0 auto 10px;
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

.betting-panel {
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

.bet-type-section {
  margin-bottom: 20px;
}

.bet-type-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.bet-type-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 15px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.bet-type-btn.active {
  border-color: #4ecdc4;
  background: rgba(78, 205, 196, 0.2);
  box-shadow: 0 0 15px rgba(78, 205, 196, 0.3);
}

.bet-type-emoji {
  font-size: 20px;
}

.bet-type-name {
  font-size: 12px;
  font-weight: 600;
}

.bet-type-payout {
  font-size: 11px;
  opacity: 0.8;
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

.spin-btn {
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

.spin-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin-btn.spinning {
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
  margin-bottom: 12px;
  opacity: 0.9;
}

.notification-details {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 20px;
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
@keyframes starsMove {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-100px);
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

/* Адаптация для мобильных */
@media (max-width: 360px) {
  .wheel-container {
    width: 200px;
    height: 200px;
  }

  .wheel-number {
    width: 25px;
    height: 25px;
    font-size: 10px;
    top: 8px;
  }

  .wheel-center {
    width: 50px;
    height: 50px;
  }

  .bet-type-buttons {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-height: 700px) {
  .mobile-content {
    gap: 16px;
  }

  .roulette-wheel-area,
  .betting-panel,
  .stats-panel {
    padding: 20px;
  }

  .wheel-container {
    width: 220px;
    height: 220px;
  }
}

/* Специфичные стили для номеров */
.number-red {
  background: linear-gradient(45deg, #d32f2f, #ff5252);
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.4);
}

.number-black {
  background: linear-gradient(45deg, #2c2c2c, #555555);
  box-shadow: 0 2px 8px rgba(44, 44, 44, 0.4);
}

.number-green {
  background: linear-gradient(45deg, #0a5c36, #0d8a4f);
  box-shadow: 0 2px 8px rgba(10, 92, 54, 0.4);
}

/* Плавное вращение для рулетки */
.wheel {
  transition: transform 3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* Эффект блеска для центрума рулетки */
.wheel-center {
  background: linear-gradient(45deg, #ffd700, #ffed4e, #ffd700);
  animation: shine 2s ease-in-out infinite;
}

@keyframes shine {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  }

  50% {
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
  }
}

/* Анимация указателя */
.wheel-pointer {
  animation: pointerPulse 1s ease-in-out infinite;
}

@keyframes pointerPulse {
  0%,
  100% {
    transform: translateX(-50%) scale(1);
  }

  50% {
    transform: translateX(-50%) scale(1.1);
  }
}

/* Адаптация истории для маленьких экранов */
@media (max-width: 320px) {
  .history-item {
    width: 35px;
    height: 35px;
    font-size: 12px;
  }

  .bet-type-btn {
    padding: 12px;
  }

  .bet-type-name {
    font-size: 11px;
  }
}

/* Портретная ориентация на планшетах */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
  .wheel-container {
    width: 300px;
    height: 300px;
  }

  .wheel-number {
    width: 35px;
    height: 35px;
    font-size: 14px;
    top: 12px;
  }

  .wheel-center {
    width: 70px;
    height: 70px;
  }
}

/* Ландшафтная ориентация на мобильных */
@media (max-height: 500px) and (orientation: landscape) {
  .mobile-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }

  .roulette-wheel-area {
    grid-column: 1 / -1;
  }

  .wheel-container {
    width: 180px;
    height: 180px;
  }
}

/* Высокие экраны */
@media (min-height: 800px) {
  .wheel-container {
    width: 280px;
    height: 280px;
  }

  .wheel-number {
    width: 32px;
    height: 32px;
    font-size: 13px;
    top: 15px;
  }
}

/* Поддержка темной темы */
@media (prefers-color-scheme: dark) {
  .number-red {
    background: linear-gradient(45deg, #c62828, #e53935);
  }

  .number-black {
    background: linear-gradient(45deg, #212121, #424242);
  }

  .number-green {
    background: linear-gradient(45deg, #1b5e20, #2e7d32);
  }
}

/* Оптимизация для медленных устройств */
@media (prefers-reduced-motion: reduce) {
  .wheel {
    transition: none;
  }

  .wheel.spinning {
    transition: none;
  }

  .wheel-center {
    animation: none;
  }

  .wheel-pointer {
    animation: none;
  }

  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Поддержка различных соотношений сторон */
@media (aspect-ratio: 9/16) {
  /* Вертикальные экраны */
  .mobile-content {
    gap: 15px;
  }

  .wheel-container {
    width: 220px;
    height: 220px;
  }
}

@media (aspect-ratio: 10/16) {
  .wheel-container {
    width: 240px;
    height: 240px;
  }
}

/* Обеспечиваем хорошую читаемость на всех устройствах */
.wheel-number {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  font-weight: 800;
}

/* Улучшаем видимость активных элементов */
.bet-type-btn:active,
.bet-btn:active {
  transform: scale(0.95);
}

/* Плавные переходы для всех интерактивных элементов */
button,
.wheel,
.wheel-number {
  transition: all 0.2s ease;
}

/* Гарантируем, что текст остается читаемым */
.mobile-header,
.section-title,
.result-text,
.notification-title {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

/* Оптимизация для очень маленьких экранов */
@media (max-width: 280px) {
  .mobile-header {
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }

  .mobile-title h1 {
    font-size: 18px;
  }

  .wheel-container {
    width: 180px;
    height: 180px;
  }

  .bet-type-buttons {
    grid-template-columns: 1fr;
  }
}

/* Поддержка различных плотностей пикселей */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .wheel-number {
    font-weight: 900;
  }

  .wheel-pointer {
    border-top-width: 22px;
    border-left-width: 11px;
    border-right-width: 11px;
  }
}

/* Гарантируем, что кнопки достаточно большие для touch */
@media (max-width: 480px) {
  .bet-btn,
  .bet-type-btn,
  .spin-btn,
  .notification-btn {
    min-height: 44px;
    /* Минимальный размер для touch */
  }
}

/* Предотвращаем масштабирование текста на iOS */
@media (max-width: 480px) {
  .mobile-content {
    -webkit-text-size-adjust: 100%;
  }
}

/* Улучшаем производительность анимаций */
.wheel {
  will-change: transform;
  backface-visibility: hidden;
}

/* Гарантируем, что вращение выглядит плавно */
.wheel.spinning {
  transform-style: preserve-3d;
}
</style>
