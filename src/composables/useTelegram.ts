import { ref, onMounted } from "vue";

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export function useTelegram() {
  const tg = window.Telegram?.WebApp;
  const user = ref<TelegramUser | null>(null);
  const isExpanded = ref(false);
  const isReady = ref(false);

  // Инициализация
  const init = (): void => {
    if (!tg) {
      console.error("Telegram Web App not available");
      return;
    }

    tg.ready();
    isReady.value = true;

    // Получаем данные пользователя
    if (tg.initDataUnsafe?.user) {
      user.value = tg.initDataUnsafe.user as TelegramUser;
    }

    // Расширяем приложение на весь экран
    tg.expand();
    isExpanded.value = true;

    console.log("Telegram Web App initialized:", tg);
  };

  // Показать основную кнопку
  const showMainButton = (
    text: string = "Continue",
    color: string = "#0088cc"
  ): void => {
    if (!tg) return;

    tg.MainButton.setText(text);
    tg.MainButton.setParams({ color });
    tg.MainButton.show();
  };

  // Скрыть основную кнопку
  const hideMainButton = (): void => {
    if (!tg) return;
    tg.MainButton.hide();
  };

  // Закрыть приложение
  const closeApp = (): void => {
    if (!tg) return;
    tg.close();
  };

  // Отправить данные
  const sendData = (data: unknown): void => {
    if (!tg) return;
    tg.sendData(JSON.stringify(data));
  };

  // Показать всплывающее окно
  const showPopup = (params: any): void => {
    if (!tg) return;
    tg.showPopup(params);
  };

  onMounted(() => {
    if (tg) {
      init();
    }
  });

  return {
    tg,
    user,
    isReady,
    isExpanded,
    init,
    showMainButton,
    hideMainButton,
    closeApp,
    sendData,
    showPopup,
  };
}
