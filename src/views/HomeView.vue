<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useTelegram } from "@/composables/useTelegram";
import TelegramUserInfo from "@/components/TelegramUserInfo.vue";

const {
  tg,
  user,
  isReady,
  showMainButton,
  hideMainButton,
  closeApp,
  sendData,
} = useTelegram();
const count = ref(0);

// Обработчик для основной кнопки
onMounted(() => {
  if (tg) {
    showMainButton("Click me!");

    // Добавляем обработчик для основной кнопки
    tg.MainButton.onClick(() => {
      sendData({ action: "main_button_click", count: count.value });
    });
  }
});

const increment = (): void => {
  count.value++;
  // Обновляем текст кнопки
  if (tg) {
    showMainButton(`Count: ${count.value}`);
  }
};

const sendTestData = (): void => {
  sendData({
    action: "test_data",
    message: "Hello from Vue!",
    count: count.value,
  });
};
</script>

<template>
  <div class="home">
    <h1>Vue 3 Telegram Web App</h1>

    <div v-if="isReady" class="status ready">✅ Telegram Web App Ready</div>
    <div v-else class="status not-ready">⏳ Loading Telegram API...</div>

    <TelegramUserInfo :user="user" />

    <div class="demo-section">
      <h2>Demo Counter</h2>
      <button @click="increment" class="counter-btn">Count: {{ count }}</button>
    </div>

    <div class="actions">
      <button @click="sendTestData" class="action-btn">Send Test Data</button>
      <button @click="closeApp" class="action-btn danger">Close App</button>
    </div>

    <div class="debug-info" v-if="tg">
      <h3>Debug Info:</h3>
      <p>Platform: {{ tg.platform }}</p>
      <p>Version: {{ tg.version }}</p>
      <p>Theme: {{ tg.colorScheme }}</p>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.status {
  padding: 10px;
  border-radius: 8px;
  margin: 10px 0;
  text-align: center;
  font-weight: bold;
}

.ready {
  background: #d4edda;
  color: #155724;
}

.not-ready {
  background: #fff3cd;
  color: #856404;
}

.demo-section {
  margin: 30px 0;
  text-align: center;
}

.counter-btn {
  padding: 15px 30px;
  font-size: 18px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.counter-btn:hover {
  background: #0056b3;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #6c757d;
  color: white;
}

.action-btn.danger {
  background: #dc3545;
}

.action-btn:hover {
  opacity: 0.8;
}

.debug-info {
  margin-top: 30px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
}
</style>
