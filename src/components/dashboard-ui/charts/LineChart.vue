<template>
    <div class="metric-chart-card">
        <div class="chart-container">
        <div v-if="!metric.hasData" class="no-data-message">
            No data available
        </div>
        
        <div v-else class="unovis-wrapper" ref="unovisWrapper">
            <VisXYContainer 
              :data="chartData" 
              :width="chartWidth" 
              :height="chartHeight"
              :margin="chartMargin"
              :yDomain = "[0, niceMax]"
            >
            <VisLine 
                :x="(d: any, i: any) => i"  
                :y="(d: { value: any }) => d.value"
                color="#3b82f6"
                :strokeWidth="2"
                :pointSize="4"
                :showPoints="true"
            />
            <VisAxis 
                type="x" 
                :numTicks="chartData.length"
                :tickFormat="(value: string | number) => chartData[value as any]?.month?.substring(0, 3) || ''"
            />
            <VisAxis 
                type="y" 
                :tickFormat="getYAxisFormatter(metric.rowType)"
                :tickValues="yTickValues"
            />
            <VisScatter
                :x="(d: any, i: any) => i" 
                :y="(d: { value: any }) => d.value"
                :size="10"
                color="blue"
            />
            <VisTooltip :triggers="triggers" :allowHover="true" verticalPlacement="top" />
            </VisXYContainer>
        </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, toRaw, computed, defineProps } from 'vue'
import { VisXYContainer, VisLine, VisAxis, VisTooltip, VisScatter } from '@unovis/vue'
import { Scatter } from '@unovis/ts'

interface MetricData {
  metricName: string
  benchmark: number | null
  monthlyData: Record<string, number | null>
  hasData: boolean
  dataPoints: number
  rowType?: 'currency' | 'percentage' | 'count'
}

const props = defineProps<{
  metric: MetricData
  chartWidth?: number
  chartHeight?: number
}>()


const unovisWrapper = ref<HTMLElement | null>(null)
const internalChartWidth = ref(0)
const containerWidth = ref(0)
const resizeObserver = ref<ResizeObserver | null>(null)
const maxValue = computed(() => Math.max(...chartData.value.map(d => d.value)))
const chartHeight = computed(() => props.chartHeight || 100)
const chartMargin = computed(() => ({
  top: 20,
  right: 12,
  bottom: 12,
  left: 12
}))

const tickCount = computed(() => {
  const range = niceMax.value;
  if (range < 10) {
    return Math.min(range + 1, 5);
  }
  if (range < 100) {
    return 5;
  }
  if (range < 1000) {
    return 6;
  }
  if (range < 2000) { 
    return 5;
  }
  return 6;
});

const niceMax = computed(() => {
  const max = maxValue.value;
  if (max === 0) return 10;
  
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const normalizedMax = max / magnitude;
  let multiplier;
  
  if (normalizedMax <= 1) multiplier = 1;
  else if (normalizedMax <= 2) multiplier = 2;
  else if (normalizedMax <= 5) multiplier = 5;
  else if (normalizedMax <= 10) multiplier = 10;
  else multiplier = 20;
  
  return multiplier * magnitude;
});

const chartWidth = computed(() => {
  if (!unovisWrapper.value) return containerWidth.value || 600;
  return unovisWrapper.value.clientWidth;
});

const yTickValues = computed(() => {
  const max = niceMax.value;
  const count = tickCount.value; 
  const step = max / (count - 1);
  
  return Array.from({ length: count }, (_, i) => i * step);
});

const handleResize = () => {
  if (unovisWrapper.value) {
    containerWidth.value = unovisWrapper.value.clientWidth;
    internalChartWidth.value = containerWidth.value;
  }
};

onMounted(() => {
  // Initial size
  handleResize();

  // ResizeObserver for container changes
  resizeObserver.value = new ResizeObserver(() => {
    handleResize();
  });

  if (unovisWrapper.value) {
    resizeObserver.value.observe(unovisWrapper.value);
  }

  // Window resize listener
  window.addEventListener('resize', handleResize);
});


onUnmounted(() => {
  // Clean up resize observer
  if (resizeObserver.value && unovisWrapper.value) {
    resizeObserver.value.unobserve(unovisWrapper.value);
    resizeObserver.value.disconnect();
  }
  
  // Remove window resize listener
  window.removeEventListener('resize', handleResize);
});

const getYAxisFormatter = (rowType: any) => {
  return (value: number) => formatYAxisValue(value, rowType)
}

const chartData = computed(() => { 
  if (!props.metric.hasData) return []

  const rowType = props.metric.rowType

  const cleanData = Object.entries(toRaw(props.metric.monthlyData))
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([month, value], index) => {
      let numericValue = Number(value)
      let formattedValue: string

      if (rowType === 'percentage') {
        numericValue = numericValue * 100
        formattedValue = `${numericValue.toFixed(2)}%`
      } else if (rowType === 'currency') {
        numericValue = Math.round(numericValue) 
        formattedValue = `£${numericValue.toLocaleString()}`
      } else {
        numericValue = Math.round(numericValue)   
        formattedValue = numericValue.toLocaleString()
      }

      return {
        month: month.trim(),
        value: numericValue,  
        index,
        formattedValue      
      }
    })

  return cleanData
})


const formatYAxisValue = (value: number, rowType?: 'currency' | 'percentage' | 'count'): string => {
  const numValue = Number(value)
  let formattedValue: string
  
  if (numValue >= 1000000) {
    formattedValue = `${(numValue / 1000000).toFixed(1)}M`
  } else if (numValue >= 1000) {
    formattedValue = `${(numValue / 1000).toFixed(1)}K`
  } else if (numValue < 1 && numValue > 0) {
    formattedValue = numValue.toFixed(2)
  } else {
    formattedValue = numValue.toFixed(1)
  }

  switch (rowType) {
    case 'currency':
      return `£${formattedValue}`
    case 'percentage':
      return `${formattedValue}%`
    default:
      return formattedValue
  }
}

const triggers = {
  [Scatter.selectors.point]: (datum: any) => {
    if (!datum) return ''
    return `${datum.month}: ${datum.formattedValue}`
  }
}


</script>

<style scoped>
.metric-chart-card {
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius) - 2px);
  
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.2);
  transition: box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  height: auto; 
  min-height: 320px; 
  user-select: none;
}

.metric-chart-card:hover {
  box-shadow: 0 12px 32px rgba(149, 157, 165, 0.3);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  min-height: 40px;
}

.chart-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: hsl(var(--foreground));
  margin: 0;
  line-height: 1.2;
  flex: 1;
}

.benchmark-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.75rem;
}

.benchmark-label {
  color: hsl(var(--muted-foreground));
  font-weight: 500;
}

.benchmark-value {
  color: hsl(var(--destructive));
  font-weight: 600;
  margin-top: 2px;
}

.chart-container {
  flex: 1;
  display: flex;
  width: 100%;
  align-items: stretch;
  justify-content: stretch; 
  justify-content: center;
  min-height: 200px;
  padding: 1rem;
}

@media (max-width: 640px) {
  .metric-chart-card {
    min-height: 250px;
  }
  
  .chart-container {
    padding: 0.5rem;
    min-height: 150px;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .metric-chart-card {
    min-height: 280px;
  }
}

@media (min-width: 1025px) and (max-width: 1440px) {
  .metric-chart-card {
    min-height: 320px;
  }
}

@media (min-width: 1441px) {
  .metric-chart-card {
    min-height: 360px;
  }
}

.no-data-message {
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
  font-style: italic;
  text-align: center;
}

.recharts-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-footer {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid hsl(var(--border));
}

.data-points-info {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}

.data-count {
  font-weight: 500;
}
 .unovis-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
 }

:root {
  --color-primary: hsl(var(--primary));
}
</style>