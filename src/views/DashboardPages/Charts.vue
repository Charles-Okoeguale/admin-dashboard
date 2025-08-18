<template>
  <div class="charts-container">
    <section class="stats-section">
      <StatCard title="Active Users (Last 5 Seconds)" :value="100" />
      <StatCard title="Active Users (Last 24 Hours)" :value="500" />
      <StatCard title="Cards Created (Last 24 Hours)" :value="50" />
    </section>
    <div class="gap"></div>
    <section class="section-two">
      <h2>Section 2</h2>
    </section>
  </div>
</template>

<script setup lang="ts">
import StatCard from '@/components/dashboard-ui/StatCard.vue';
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