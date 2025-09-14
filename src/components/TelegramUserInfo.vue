<template>
  <div v-if="user" class="user-info">
    <h2>User Information</h2>
    <div class="user-data">
      <img
        :src="user.photo_url"
        alt="User photo"
        class="user-photo"
        v-if="user.photo_url"
      />
      <div class="user-details">
        <p><strong>ID:</strong> {{ user.id }}</p>
        <p><strong>First Name:</strong> {{ user.first_name }}</p>
        <p v-if="user.last_name">
          <strong>Last Name:</strong> {{ user.last_name }}
        </p>
        <p v-if="user.username">
          <strong>Username:</strong> @{{ user.username }}
        </p>
        <p v-if="user.language_code">
          <strong>Language:</strong> {{ user.language_code }}
        </p>
      </div>
    </div>
  </div>
  <div v-else class="no-user">
    <p>User data not available</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
  } | null;
}

defineProps<Props>();
</script>

<style scoped>
.user-info {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 12px;
  margin: 20px 0;
}

.user-data {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-photo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.user-details p {
  margin: 5px 0;
  font-size: 14px;
}

.no-user {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>
