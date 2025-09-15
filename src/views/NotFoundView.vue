<template>
  <div class="not-found-container">
    <div class="cosmic-background">
      <div class="stars"></div>
      <div class="twinkling"></div>
    </div>
    
    <div class="content">
      <div class="emoji">🌌</div>
      <h1>404</h1>
      <p>Page not found in this galaxy</p>
      <button class="home-button" @click="$router.push('/')">
        Back to Home
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: white;
}

.content {
  text-align: center;
  z-index: 1;
}

.emoji {
  font-size: 80px;
  margin-bottom: 20px;
}

h1 {
  font-size: 48px;
  margin-bottom: 10px;
}

p {
  font-size: 18px;
  opacity: 0.8;
  margin-bottom: 30px;
}

.home-button {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.home-button:hover {
  transform: translateY(-2px);
}

/* Космический фон */
.cosmic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(135deg, #0a0a2a 0%, #1a1a4a 100%);
}

.stars {
  background: transparent;
  background-image: radial-gradient(2px 2px at 40px 60px, #ccc, transparent),
                    radial-gradient(2px 2px at 20px 50px, #fff, transparent);
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: stars 100s linear infinite;
}

.twinkling {
  background: transparent;
  background-image: radial-gradient(1px 1px at 25px 35px, #fff, transparent);
  background-repeat: repeat;
  background-size: 100px 100px;
  animation: twinkling 3s ease-in-out infinite alternate;
}

@keyframes stars {
  from { background-position: 0 0; }
  to { background-position: 100% 100%; }
}

@keyframes twinkling {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}
</style>