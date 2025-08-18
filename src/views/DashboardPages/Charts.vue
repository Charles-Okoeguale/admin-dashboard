<template>
  <div class="charts-container">
    <section class="stats-section">
      <StatCard title="Active Users (Last 5 Seconds)" :value="activeUsersLive" />
      <StatCard title="Active Users (Last 24 Hours)" :value="activeUsers24Hours" />
      <StatCard title="Cards Created (Last 24 Hours)" :value="cardsCreated24Hours" />
    </section>
    <div class="gap"></div> 
    <SectionTwo/>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import StatCard from '@/components/dashboard-ui/StatCard.vue';
import SectionTwo from '@/components/dashboard-ui/SectionTwo.vue';

const initialActiveUsersLive = 100; 
const initialActiveUsers24Hours = 500; 
const initialCardsCreated24Hours = 50; 

const activeUsersLive = ref(initialActiveUsersLive);
const activeUsers24Hours = ref(initialActiveUsers24Hours);
const cardsCreated24Hours = ref(initialCardsCreated24Hours);

const updateStats = () => {
  activeUsersLive.value += Math.floor(Math.random() * 3) * 2 + 1; 
};

const updateActiveUsers24Hours = () => {
  activeUsers24Hours.value += Math.floor(Math.random() * 3) * 2 + 5; 
};

const updateCardsCreated24Hours = () => {
  cardsCreated24Hours.value += Math.floor(Math.random() * 3) * 2 + 5; 
};

let liveUsersInterval: ReturnType<typeof setInterval>;
let activeUsersInterval: ReturnType<typeof setInterval>;
let cardsCreatedInterval: ReturnType<typeof setInterval>;

onMounted(() => {
  liveUsersInterval = setInterval(updateStats, 5000); 
  activeUsersInterval = setInterval(updateActiveUsers24Hours, 10000); 
  cardsCreatedInterval = setInterval(updateCardsCreated24Hours, 20000); 
});

onBeforeUnmount(() => {
  clearInterval(liveUsersInterval);
  clearInterval(activeUsersInterval);
  clearInterval(cardsCreatedInterval);
  
  activeUsersLive.value = initialActiveUsersLive;
  activeUsers24Hours.value = initialActiveUsers24Hours;
  cardsCreated24Hours.value = initialCardsCreated24Hours;
});
</script>

<style scoped>
.charts-container {
  width: 100%; 
  display: flex;
  flex-direction: column;
}

.stats-section {
  display: flex; 
  justify-content: space-between; 
  width: 100%; 
  padding: 1rem; 
}

.stats-section > * {
  margin: 0 0.5rem;
  flex: 1; 
  min-width: 140px; 
}

.gap {
  height: 2rem; 
}

.section-two {
  width: 100%; 
  padding: 1rem; 
  text-align: center;
}
</style>