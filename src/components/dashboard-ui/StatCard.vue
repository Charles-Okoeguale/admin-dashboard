<template>
    <div class="stat-card">
      <h2 class="stat-title">{{ title }}</h2>
      <p class="stat-value">{{ value }}</p>
      <div class="stat-trend">
        <svg
          v-if="trend === 'up'"
          class="trend-icon up"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
        <svg
          v-if="trend === 'down'"
          class="trend-icon down"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
        <span v-if="trend === 'stable'" class="trend-stable">–</span>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps } from 'vue';
  
  const props = defineProps<{
    title: string;
    value: number | string;
    trend?: 'up' | 'down' | 'stable';
  }>();
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
  
  .stat-trend {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: #6b7280; /* Gray 500 */
    margin-top: 0.25rem;
    height: 24px;
  }
  
  .trend-icon {
    width: 24px;
    height: 24px;
    stroke-width: 2;
  }
  
  .trend-icon.up {
    color: #10b981; /* Emerald */
    animation: bounce-up 1.2s infinite ease-in-out;
  }
  
  .trend-icon.down {
    color: #ef4444; /* Red */
    animation: bounce-down 1.2s infinite ease-in-out;
  }
  
  .trend-stable {
    font-weight: 700;
    color: #9ca3af; /* Gray 400 */
  }
  
  /* Simple bounce animations for trend icons */
  @keyframes bounce-up {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  
  @keyframes bounce-down {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(6px); }
  }
  </style>
  