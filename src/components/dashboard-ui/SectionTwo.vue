<template>
  <section class="section-two">
    <div class="search-container">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search metrics..."
        class="search-input"
        @input="onSearchInput"
      />
      <div v-if="isSearching && searchQuery" class="search-info">
        Showing {{ filteredMetrics.length }} of {{ metricsWithData.length }} metrics
      </div>
    </div>
    
    <div v-if="error" class="error-state">
      <div class="error-message">
        <h3>No Metrics Found</h3>
        <p>{{ error }}</p>
      </div>
    </div>

    <div v-else-if="loading" class="grid-container">
      <div v-for="n in 8" :key="`skeleton-${n}`" class="grid-item skeleton-item">
        <div class="skeleton-header">
          <div class="skeleton-title"></div>
          <div class="skeleton-benchmark"></div>
        </div>
        <div class="skeleton-chart"></div>
        <div class="skeleton-footer"></div>
      </div>
    </div>

    <div v-else-if="isSearching && !hasFilteredMetrics" class="error-state">
      <div class="error-message">
        <h3>No Metrics Found</h3>
        <p>No metrics match your search for "{{ searchQuery }}"</p>
        <button @click="clearSearch" class="clear-search-btn">Clear Search</button>
      </div>
    </div>

    <div v-else class="grid-container">
      <div 
        v-for="(metric, index) in displayMetrics" 
        :key="metric.metricName"
        :ref="el => setChartRef(el, index)"
        class="grid-item chart-container"
      >
        
        <div v-if="!visibleCharts[index]" class="skeleton-item">
          <div class="skeleton-header">
            <div class="skeleton-title"></div>
            <div class="skeleton-benchmark"></div>
          </div>
          <div class="skeleton-chart"></div>
          <div class="skeleton-footer"></div>
        </div>
        
        <div v-else class="chart-wrapper">
          <div class="metric-header">
            <h3 class="metric-title">{{ metric.metricName }}</h3>
          </div>
          
          <LineChart 
            :metric="metric"
            :chart-width="chartDimensions.width"
            :chart-height="chartDimensions.height"
          />
          
          <div v-if="metric.benchmark" class="metric-footer">
            <span class="target-label">Target: </span>
            <span class="target-value">{{ formatBenchmark(metric) }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch, type ComponentPublicInstance } from 'vue'
import LineChart from './charts/LineChart.vue'

interface MetricData {
  metricName: string
  benchmark: number | null
  monthlyData: Record<string, number | null>
  hasData: boolean
  dataPoints: number
}

interface ExcelData {
  metadata: {
    fileName: string
    months: string[]
    totalMonths: number
  }
  metrics: MetricData[]
}

// Core data refs
const loading = ref(true)
const searchQuery = ref('')
const error = ref<string | null>(null)
const metricsWithData = ref<MetricData[]>([]) // Single source of truth
const visibleCharts = ref<boolean[]>([])
const chartRefs = ref<(Element | null)[]>([])
const observer = ref<IntersectionObserver | null>(null)

// Constants
const currencyFields = ["New MRR", "Current total MRR", "Current total ARR"]

// Computed properties
const chartDimensions = computed(() => {
  return {
    width: 280,
    height: 320  
  }
})

// Search state - determines if we're in search mode
const isSearching = computed(() => {
  return searchQuery.value.trim().length > 0
})

// Filtered metrics based on search query
const filteredMetrics = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  
  if (!query) {
    return metricsWithData.value
  }
  
  return metricsWithData.value.filter(metric => 
    metric.metricName.toLowerCase().includes(query)
  )
})

// Display metrics - what actually gets rendered
const displayMetrics = computed(() => {
  return isSearching.value ? filteredMetrics.value : metricsWithData.value
})

// Check if we have any metrics to display after filtering
const hasFilteredMetrics = computed(() => {
  return displayMetrics.value.length > 0
})

// Methods
const setChartRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  chartRefs.value[index] = el instanceof Element ? el : null
}

const onSearchInput = () => {
  // Reset visibility when search changes
  resetVisibility()
}

const clearSearch = () => {
  searchQuery.value = ''
  resetVisibility()
}

const resetVisibility = () => {
  // Reset all charts to be visible (or use intersection observer logic)
  visibleCharts.value = new Array(displayMetrics.value.length).fill(true)
  
  nextTick(() => {
    setupIntersectionObserver()
    observeChartContainers()
  })
}

function formatBenchmark(metric: any) {
  if (!metric.benchmark) return null

  let numericValue = Number(metric.benchmark)

  if (metric.rowType === 'percentage') {
    numericValue = numericValue * 100
    return `${numericValue.toFixed(2)}%`
  } else if (metric.rowType === 'currency') {
    numericValue = Math.round(numericValue)   
    return `£${numericValue.toLocaleString()}`
  } else {
    numericValue = Math.round(numericValue)
    return numericValue.toLocaleString()
  }
}

const setupIntersectionObserver = () => {
  // Disconnect existing observer
  if (observer.value) {
    observer.value.disconnect()
  }
  
  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = chartRefs.value.indexOf(entry.target)
          if (index !== -1) {
            visibleCharts.value[index] = true
          }
        }
      })
    },
    {
      rootMargin: '50px',
      threshold: 0.1
    }
  )
}

const observeChartContainers = async () => {
  await nextTick()
  
  // Clear previous refs
  chartRefs.value = chartRefs.value.slice(0, displayMetrics.value.length)
  
  chartRefs.value.forEach((ref) => {
    if (ref && observer.value) {
      observer.value.observe(ref)
    }
  })
}

const normalizeMonthly = (obj: Record<string, number | null>) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.trim(), v == null ? null : Number(v)])
  )

const loadMetricsData = async () => {
  try {
    const excelDataString = localStorage.getItem('excelData')
    
    if (!excelDataString) {
      error.value = 'Please upload an Excel file to view metrics'
      loading.value = false
      return
    }

    const structuredData: ExcelData = JSON.parse(excelDataString)
    console.log('Structured Excel Data:', structuredData)

    const validMetrics = structuredData.metrics
      .filter(m => m.hasData)
      .map(m => ({ ...m, monthlyData: normalizeMonthly(m.monthlyData) }))
    
    if (validMetrics.length === 0) {
      error.value = 'No metrics with data found in the uploaded file'
      loading.value = false
      return
    }

    const processed = validMetrics.map(metric => {
      const values = Object.values(metric.monthlyData).filter(v => v !== null) as number[]

      let rowType: 'currency' | 'percentage' | 'count'

      if (currencyFields.includes(metric.metricName)) {
        rowType = 'currency'
      } else if (values.every(v => v <= 1)) {
        rowType = 'percentage'
      } else {
        rowType = 'count'
      }

      return {
        ...metric,
        rowType
      }
    })
    
    console.log('Valid Metrics:', processed)
    
    // Set the single source of truth
    metricsWithData.value = processed
    
    // Initialize visibility for all metrics
    visibleCharts.value = new Array(processed.length).fill(true)
    
    loading.value = false
 
    nextTick(() => {
      setupIntersectionObserver()
      observeChartContainers()
    })

  } catch (parseError) {
    console.error('Error parsing Excel data from localStorage:', parseError)
    error.value = 'Error loading metrics data. Please try uploading the file again.'
    loading.value = false
  }
}

// Watchers
watch(displayMetrics, () => {
  // When display metrics change, update visibility array
  visibleCharts.value = new Array(displayMetrics.value.length).fill(true)
  
  nextTick(() => {
    setupIntersectionObserver()
    observeChartContainers()
  })
}, { immediate: false })

watch(searchQuery, (newQuery, oldQuery) => {
  // Log search state changes for debugging
  console.log('Search query changed:', { newQuery, oldQuery, isSearching: isSearching.value })
})

// Lifecycle hooks
onMounted(() => {
  setTimeout(() => {
    loadMetricsData()
  }, 300)
})

onBeforeUnmount(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})
</script>

<style scoped>
.section-two {
  width: 100%; 
  padding: 1rem;
}

.search-container {
  max-width: 1200px;
  margin: 0 auto 1rem;
  padding: 0 1rem;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  background-color: white;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-info {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.clear-search-btn {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s ease;
}

.clear-search-btn:hover {
  background-color: #369870;
}

.grid-container {
  display: grid;
  gap: 1rem;
  width: 100%;
  margin: 0 auto;
}

/* Mobile */
@media (max-width: 640px) {
  .grid-container {
    grid-template-columns: 1fr;
    padding: 0.5rem;
  }

  .search-container {
    padding: 0.5rem;
  }

  .search-input {
    width: 100%;
    max-width: none;
  }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Laptop */
@media (min-width: 1025px) and (max-width: 1440px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
    max-width: 1200px;
  }
}

/* Desktop */
@media (min-width: 1441px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr);
    max-width: 1600px;
  }
}

@media (min-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1023px) and (min-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
  
  .section-two {
    padding: 0.5rem;
  }
}

.grid-item {
  border-radius: 12px;
  height: 400px;
  overflow: hidden;
}

.chart-container {
  background: transparent;
  padding: 0;
}

.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.error-message {
  text-align: center;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.2);
  max-width: 400px;
}

.chart-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.metric-header {
  padding: 8px 0;
  text-align: center;
}

.metric-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
}

.metric-footer {
  padding: 8px 0;
  text-align: center;
  font-size: 0.75rem;
}

.error-message h3 {
  color: #1f2937;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.error-message p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

/* Skeleton Loading States */
.skeleton-item {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.2);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  min-height: 40px;
}

.skeleton-title {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  width: 60%;
}

.skeleton-benchmark {
  height: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  width: 20%;
}

.skeleton-chart {
  flex: 1;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
  margin-bottom: 1rem;
  min-height: 200px;
}

.skeleton-footer {
  height: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  width: 40%;
  margin: 0 auto;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Smooth transitions */
.grid-item {
  transition: all 0.3s ease;
}

.chart-container:hover {
  transform: translateY(-2px);
}
</style>