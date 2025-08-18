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
                :tickFormat="formatYAxisValue"
                :domain="[0, niceMax]"
                :numTicks="tickCount"
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
const tickCount = 5
const maxValue = computed(() => Math.max(...chartData.value.map(d => d.value)))
const chartHeight = computed(() => props.chartHeight || 100)
const chartMargin = computed(() => ({
  top: 20,
  right: 12,
  bottom: 12,
  left: 12
}))



const niceMax = computed(() => {
  const max = maxValue.value;
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const multiplier = Math.ceil(max / magnitude);
  return multiplier * magnitude * 1.2;
})

const chartWidth = ref(600) 

onMounted(() => {
  const updateWidth = () => {
    if (unovisWrapper.value) {
      internalChartWidth.value = unovisWrapper.value.clientWidth
    }
  }
  updateWidth()


  let resizeObserver = new ResizeObserver(() => {
    updateWidth()
  })
  if (unovisWrapper.value) {
    resizeObserver.observe(unovisWrapper.value)
  }

  console.log("chartData on mount:", chartData.value)

  onUnmounted(() => {
    if (resizeObserver && unovisWrapper.value) {
      resizeObserver.unobserve(unovisWrapper.value)
    }
    resizeObserver.disconnect()
  })
})

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

const formatYAxisValue = (value: number): string => {
  const numValue = Number(value)
  if (numValue >= 1000000) {
    return `${(numValue / 1000000).toFixed(1)}M`
  } else if (numValue >= 1000) {
    return `${(numValue / 1000).toFixed(1)}K`
  } else if (numValue < 1 && numValue > 0) {
    return numValue.toFixed(2)
  }
  return numValue.toString()
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
  height: 520px;
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
 }

:root {
  --color-primary: hsl(var(--primary));
}
</style>