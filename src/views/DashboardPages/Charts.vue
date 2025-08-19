<template>
  <div class="charts-container">
    <section class="stats-section">
      <StatCard 
        title="Active Users (Last 5 Seconds)" 
        :value="activeUsersLive.current"
        :previous-value="activeUsersLive.previous"
      />
      <StatCard 
        title="Active Users (Last 24 Hours)" 
        :value="activeUsers24Hours.current"
        :previous-value="activeUsers24Hours.previous"
      />
      <StatCard 
        title="Cards Created (Last 24 Hours)" 
        :value="cardsCreated24Hours.current"
        :previous-value="cardsCreated24Hours.previous"
      />
    </section>
    <div class="gap"></div> 
    <SectionTwo/>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import StatCard from '@/components/dashboard-ui/StatCard.vue';
import SectionTwo from '@/components/dashboard-ui/SectionTwo.vue';

interface StatValue {
  current: number;
  previous: number;
}


const activeUsersLive = ref<StatValue>({ current: 100, previous: 100 });
const activeUsers24Hours = ref<StatValue>({ current: 500, previous: 500 });
const cardsCreated24Hours = ref<StatValue>({ current: 50, previous: 50 });


const updateLiveUsers = () => {
  const change = Math.floor(Math.random() * 10) - 4; 
  activeUsersLive.value.previous = activeUsersLive.value.current;
  activeUsersLive.value.current = Math.max(0, activeUsersLive.value.current + change);
};


const update24HUsers = () => {
  const isDecrease = Math.random() < 0.2;
  const change = Math.floor(Math.random() * 8) + 1;
  activeUsers24Hours.value.previous = activeUsers24Hours.value.current;
  activeUsers24Hours.value.current += isDecrease ? -change : change;
};


const updateCardsCreated = () => {
  cardsCreated24Hours.value.previous = cardsCreated24Hours.value.current;
  cardsCreated24Hours.value.current += Math.floor(Math.random() * 5) + 1;
};


const resetCardsDaily = () => {
  cardsCreated24Hours.value = { current: 0, previous: 0 };
};

let intervals: ReturnType<typeof setInterval>[] = [];

onMounted(() => {
  intervals.push(setInterval(updateLiveUsers, 2000 + Math.random() * 3000));
  intervals.push(setInterval(update24HUsers, 60000 + Math.random() * 60000));
  intervals.push(setInterval(updateCardsCreated, 30000 + Math.random() * 30000));
  intervals.push(setInterval(resetCardsDaily, 24 * 60 * 60 * 1000));
});

onBeforeUnmount(() => {
  intervals.forEach(clearInterval);
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