<template>
  <div class="slots-container">
    <!-- Фон -->
    <div class="game-background">
      <div class="stars"></div>
      <div class="particles"></div>
    </div>

    <!-- Шапка -->
    <header class="game-header">
      <button class="back-button" @click="$router.push('/')">←</button>
      <h1>🎰 Slots</h1>
      <div class="balance">🪙 {{ formatNumber(balance) }}</div>
    </header>

    <!-- Основной игровой экран -->
    <main class="game-content">
      <!-- Слот-машина -->
      <div class="slot-machine">
        <div class="slot-frame">
          <!-- Барабаны -->
          <div class="reels-container">
            <div 
              v-for="(reel, index) in 3" 
              :key="index" 
              class="reel-wrapper"
            >
              <div 
                class="reel"
                :class="{ spinning: isSpinning }"
                :style="reelStyle(index)"
              >
                <!-- Бесконечные символы -->
                <div 
                  v-for="symbolIndex in visibleSymbolIndices" 
                  :key="symbolIndex"
                  class="symbol"
                  :class="{ 
                    winning: isWinning && symbolIndex % symbols.length === targetOffsets[index] 
                  }"
                >
                  {{ symbols[symbolIndex % symbols.length] }}
                </div>
              </div>
              <div class="reel-overlay top"></div>
              <div class="reel-overlay bottom"></div>
              <div class="reel-mask"></div>
            </div>
          </div>

          <!-- Линия выплат -->
          <div class="payline"></div>
        </div>

        <!-- Кнопка Spin -->
        <div class="spin-section">
          <button 
            class="spin-button"
            :class="{ spinning: isSpinning }"
            @click="startSpin"
            :disabled="isSpinning || balance < betAmount"
          >
            {{ isSpinning ? 'SPINNING...' : 'SPIN' }}
            <div class="spin-cost">-{{ formatNumber(betAmount) }} 🪙</div>
          </button>
        </div>

        <!-- Информация о выплатах -->
        <div class="paytable">
          <h3>Paytable</h3>
          <div class="paytable-items">
            <div v-for="(payout, symbol) in paytable" :key="symbol" class="paytable-item">
              <span class="symbol">{{ symbol }}</span>
              <span class="multiplier">x{{ payout }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Панель управления -->
      <div class="control-panel">
        <div class="bet-controls">
          <div class="bet-info">
            <span>Bet: {{ formatNumber(betAmount) }} 🪙</span>
          </div>
          
          <div class="bet-buttons">
            <button 
              v-for="bet in [10, 50, 100]" 
              :key="bet"
              @click="betAmount = bet"
              :class="{ active: betAmount === bet }"
            >
              {{ bet }}
            </button>
          </div>
        </div>

        <!-- Статистика -->
        <div class="stats">
          <div class="stat">
            <span>Last win:</span>
            <span class="value">{{ formatNumber(lastWin) }} 🪙</span>
          </div>
          <div class="stat">
            <span>Total spins:</span>
            <span class="value">{{ totalSpins }}</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Уведомление о результате -->
    <div v-if="showResult" class="result-notification">
      <div class="result-content" :class="{ win: resultWin > 0, loss: resultWin === 0 }">
        <div class="result-emoji">{{ resultWin > 0 ? '🎉' : '😢' }}</div>
        <h3>{{ resultWin > 0 ? 'YOU WIN!' : 'NO WIN' }}</h3>
        <p>{{ resultWin > 0 ? `+${formatNumber(resultWin)} 🪙` : 'Try again!' }}</p>
        <button @click="showResult = false">CONTINUE</button>
      </div>
    </div>

    <!-- Большой выигрыш -->
    <div v-if="showBigWin" class="big-win-notification">
      <div class="big-win-content">
        <div class="confetti"></div>
        <div class="confetti"></div>
        <div class="confetti"></div>
        <div class="big-win-emoji">💰</div>
        <h2>BIG WIN!</h2>
        <p class="big-win-amount">+{{ formatNumber(winAmount) }} 🪙</p>
        <button @click="showBigWin = false">COLLECT</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Символы для слотов
const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '7️⃣', '🔔', '💎'];
const paytable = {
  '🍒': 2,
  '🍋': 3,
  '🍊': 4,
  '🍇': 5,
  '⭐': 10,
  '🔔': 15,
  '7️⃣': 20,
  '💎': 50
};

// Состояние игры
const balance = ref(1000);
const betAmount = ref(50);
const isSpinning = ref(false);
const isWinning = ref(false);
const showResult = ref(false);
const showBigWin = ref(false);
const winAmount = ref(0);
const resultWin = ref(0);
const lastWin = ref(0);
const totalSpins = ref(0);
const reelOffsets = ref([0, 0, 0]);
const targetOffsets = ref([0, 0, 0]);
const spinProgress = ref(0);

// Индексы для бесконечных символов
const visibleSymbolIndices = computed(() => {
  return Array.from({ length: 100 }, (_, i) => i); // 20 символов для бесконечной прокрутки
});

// Видимые символы на барабанах
const visibleSymbols = computed(() => {
  return reelOffsets.value.map((offset, reelIndex) => {
    const currentSymbolIndex = Math.floor(offset) % symbols.length;
    return symbols[currentSymbolIndex];
  });
});

// Стиль для барабана
const reelStyle = (reelIndex: number) => {
  const offset = -reelOffsets.value[reelIndex] * 33; // 33px высота символа
  return {
    transform: `translateY(${offset}px)`,
    transition: isSpinning.value ? 'transform 0.1s linear' : 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)'
  };
};

// Методы
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

const calculateWin = (): number => {
  // Проверяем выигрышные комбинации (3 одинаковых символа)
  if (visibleSymbols.value[0] === visibleSymbols.value[1] && 
      visibleSymbols.value[1] === visibleSymbols.value[2]) {
    return betAmount.value * paytable[visibleSymbols.value[0] as keyof typeof paytable];
  }
  
  return 0;
};

const startSpin = () => {
  if (isSpinning.value || balance.value < betAmount.value) return;

  // Списываем ставку
  balance.value -= betAmount.value;
  isSpinning.value = true;
  isWinning.value = false;
  showResult.value = false;
  showBigWin.value = false;
  totalSpins.value++;
  spinProgress.value = 0;

  // Генерируем конечные позиции
  targetOffsets.value = [
    Math.floor(Math.random() * symbols.length),
    Math.floor(Math.random() * symbols.length),
    Math.floor(Math.random() * symbols.length)
  ];

  // Запускаем вращение
  const spinInterval = setInterval(() => {
    spinProgress.value += 0.1;
    reelOffsets.value = reelOffsets.value.map((offset, index) => {
      // Ускоряем вращение в начале и замедляем к концу
      const speed = index === 0 ? 0.8 : index === 1 ? 0.6 : 0.4;
      return offset + speed;
    });
  }, 16);

  // Останавливаем через случайное время
  setTimeout(() => {
    clearInterval(spinInterval);
    finishSpin();
  }, 2000);
};

const finishSpin = () => {
  // Устанавливаем конечные позиции
  reelOffsets.value = targetOffsets.value.map(offset => offset);
  
  // Рассчитываем выигрыш
  const win = calculateWin();
  resultWin.value = win;
  
  if (win > 0) {
    // Выигрыш
    winAmount.value = win;
    lastWin.value = win;
    balance.value += win;
    isWinning.value = true;
    
    setTimeout(() => {
      showResult.value = true;
      if (win > betAmount.value * 10) {
        showBigWin.value = true;
      }
    }, 500);
  } else {
    // Проигрыш
    setTimeout(() => {
      showResult.value = true;
    }, 500);
  }
  setTimeout(() => {
    isSpinning.value = false;
  }, 500);
};

// Инициализация
onMounted(() => {
  // Устанавливаем начальные позиции
  reelOffsets.value = [
    Math.floor(Math.random() * symbols.length),
    Math.floor(Math.random() * symbols.length),
    Math.floor(Math.random() * symbols.length)
  ];
  targetOffsets.value = [...reelOffsets.value];
});
</script>

<style scoped>
.slots-container {
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
    radial-gradient(1px 1px at 50% 20%, rgba(255,200,100,0.6), transparent),
    radial-gradient(1px 1px at 30% 60%, rgba(100,200,255,0.6), transparent);
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
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.balance {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 600;
}

.slot-machine {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
}

.slot-frame {
  background: linear-gradient(135deg, #2d2d5a, #3a3a6a);
  border: 4px solid #ffd93d;
  border-radius: 16px;
  padding: 20px;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  margin-bottom: 20px;
}

.reels-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
  height: 120px;
}

.reel-wrapper {
  position: relative;
  height: 120px;
  overflow: hidden;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.reel {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
}

.symbol {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  min-height: 40px;
}

.symbol.winning {
  animation: symbolWin 0.5s ease-in-out infinite;
  transform: scale(1.2);
  filter: drop-shadow(0 0 10px gold);
}

.reel-overlay {
  position: absolute;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(180deg, 
    rgba(0,0,0,0.9) 0%, 
    transparent 50%, 
    rgba(0,0,0,0.9) 100%);
  pointer-events: none;
  z-index: 2;
}

.reel-overlay.top {
  top: 0;
}

.reel-overlay.bottom {
  bottom: 0;
}

.reel-mask {
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  bottom: 40px;
  background: linear-gradient(180deg, 
    rgba(0,0,0,0.6) 0%, 
    transparent 20%,
    transparent 80%,
    rgba(0,0,0,0.6) 100%);
  pointer-events: none;
  z-index: 1;
}

.payline {
  position: absolute;
  top: 50%;
  left: 20px;
  right: 20px;
  height: 3px;
  background: linear-gradient(90deg, 
    transparent, 
    #ffd93d, 
    #ff6b6b, 
    #ffd93d, 
    transparent);
  transform: translateY(-20px);
  box-shadow: 0 0 20px rgba(255, 217, 61, 0.7);
  z-index: 3;
}

/* Кнопка Spin */
.spin-section {
  text-align: center;
  margin: 20px 0;
}

.spin-button {
  width: 100%;
  max-width: 280px;
  padding: 18px;
  border: none;
  border-radius: 20px;
  font-size: 20px;
  font-weight: 800;
  cursor: pointer;
  background: linear-gradient(45deg, #4ecdc4, #45b7d1);
  color: white;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 10px 30px rgba(78, 205, 196, 0.4);
}

.spin-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin-button.spinning {
  background: linear-gradient(45deg, #ffd93d, #ff6b6b);
  animation: pulse 1s ease-in-out infinite;
}

.spin-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(78, 205, 196, 0.6);
}

.spin-cost {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff6b6b;
  padding: 6px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}

.paytable {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  margin-top: 20px;
}

.paytable h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  opacity: 0.8;
}

.paytable-items {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.paytable-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.paytable-item .symbol {
  font-size: 20px;
  margin-bottom: 4px;
}

.paytable-item .multiplier {
  font-size: 12px;
  font-weight: 600;
  color: #4ecdc4;
}

.control-panel {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 20px;
  backdrop-filter: blur(15px);
}

.bet-controls {
  margin-bottom: 20px;
}

.bet-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  opacity: 0.8;
}

.bet-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.bet-buttons button {
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bet-buttons button.active {
  background: linear-gradient(45deg, #4ecdc4, #45b7d1);
  box-shadow: 0 0 15px rgba(78, 205, 196, 0.4);
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 12px;
  text-align: center;
}

.stat .value {
  display: block;
  font-weight: 700;
  font-size: 14px;
  margin-top: 4px;
  color: #4ecdc4;
}

/* Уведомления */
.result-notification, .big-win-notification {
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

.result-content {
  background: linear-gradient(135deg, #1a1a4a, #2d2d5a);
  padding: 30px;
  border-radius: 20px;
  text-align: center;
  border: 3px solid rgba(255, 255, 255, 0.2);
  min-width: 280px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.result-content.win {
  border-color: #4ecdc4;
  background: linear-gradient(135deg, #1a4a3a, #2d5a4a);
}

.result-content.loss {
  border-color: #ff6b6b;
  background: linear-gradient(135deg, #4a1a1a, #5a2d2d);
}

.result-emoji {
  font-size: 48px;
  margin-bottom: 16px;
}

.result-content h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.result-content.win h3 {
  color: #4ecdc4;
}

.result-content.loss h3 {
  color: #ff6b6b;
}

.result-content p {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 700;
}

.result-content button {
  background: #4ecdc4;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}

.result-content.loss button {
  background: #ff6b6b;
}

.big-win-content {
  background: linear-gradient(135deg, #4a3a1a, #5a4a2d);
  padding: 40px;
  border-radius: 25px;
  text-align: center;
  border: 4px solid gold;
  min-width: 300px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 50px rgba(255, 215, 0, 0.5);
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #ffd700;
  animation: confettiFall 3s linear infinite;
}

.confetti:nth-child(1) { left: 10%; animation-delay: 0s; }
.confetti:nth-child(2) { left: 50%; animation-delay: 1s; }
.confetti:nth-child(3) { left: 90%; animation-delay: 2s; }

.big-win-emoji {
  font-size: 64px;
  margin-bottom: 16px;
  animation: bounce 1s ease-in-out infinite;
}

.big-win-content h2 {
  margin: 0 0 8px 0;
  font-size: 32px;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.big-win-amount {
  margin: 0 0 25px 0;
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
}

.big-win-content button {
  background: #ffd700;
  border: none;
  padding: 15px 30px;
  border-radius: 15px;
  color: #000;
  font-weight: 700;
  cursor: pointer;
  font-size: 18px;
}

/* Анимации */
@keyframes symbolWin {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1) drop-shadow(0 0 5px gold);
  }
  50% {
    transform: scale(1.3);
    filter: brightness(1.5) drop-shadow(0 0 15px gold);
  }
}

@media (max-width: 480px) {
  .reels-container {
    height: 100px;
    gap: 8px;
  }
  
  .reel-wrapper {
    height: 100px;
  }
  
  .symbol {
    height: 33px;
    font-size: 20px;
    min-height: 33px;
  }
  
  .reel-overlay {
    height: 33px;
  }
  
  .reel-mask {
    top: 33px;
    bottom: 33px;
  }
  
  .payline {
    transform: translateY(-2px);
    opacity: 0.3;
  }
}
</style>