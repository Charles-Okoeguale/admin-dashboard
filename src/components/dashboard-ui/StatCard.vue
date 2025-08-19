<template>
  <div class="stat-card">
    <h2 class="stat-title">{{ title }}</h2>
    <div class="stat-content">
      <p class="stat-value">{{ value }}</p>
      <div class="trend-indicator" :class="trendClass">
        <svg
          v-if="trend === 'up'"
          class="trend-arrow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
        <svg
          v-if="trend === 'down'"
          class="trend-arrow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title: string;
  value: number;
  previousValue: number;
}

const props = defineProps<Props>();

const trend = computed(() => {
  if (props.value > props.previousValue) return 'up';
  if (props.value < props.previousValue) return 'down';
  return null;
});

const trendClass = computed(() => ({
  'trend-up': trend.value === 'up',
  'trend-down': trend.value === 'down'
}));
</script>

<style scoped>
.stat-card {
  flex: 1;
  margin: 0 0.5rem;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  text-align: center;
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.2);
  transition: box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  user-select: none;
}

.stat-card:hover {
  box-shadow: 0 12px 32px rgba(149, 157, 165, 0.3);
}

.stat-title {
  font-weight: 600;
  font-size: 0.6rem;
  color: #555555;
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.stat-value {
  font-weight: 700;
  font-size: 2.5rem;
  color: #1f2937; /* Dark slate */
  margin-bottom: 0.5rem;
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.trend-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transition: all 0.3s ease;
}

.trend-arrow {
  width: 20px;
  height: 20px;
}

.trend-up {
  color: #10b981; /* Green */
  animation: bounce-up 1s infinite;
}

.trend-down {
  color: #ef4444; /* Red */
  animation: bounce-down 1s infinite;
}

@keyframes bounce-up {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes bounce-down {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
}
</style>
