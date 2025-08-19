<script setup lang="ts">
import AppHeader from "@/components/dashboard-ui/AppHeader.vue";
import Charts from '@/views/DashboardPages/Charts.vue';
import { ref, onMounted } from 'vue';
import * as XLSX from 'xlsx'

const hasFileUploaded = ref(false);

const openFileInput = () => {
  fileInput.value?.click(); 
};

const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const data = ref<any>(null)

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  
  if (
    file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
    file.type !== 'application/vnd.ms-excel'
  ) {
    error.value = 'Please select an Excel file'
    return
  }

  loading.value = true
  error.value = null

  try {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    const rawData : any = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null })

    const structuredData = processMarketingData(rawData)    
    data.value = structuredData
  
    localStorage.setItem('fileUploaded', 'true')
    localStorage.setItem('excelData', JSON.stringify(structuredData))

    hasFileUploaded.value = true
  } catch (err: any) {
    error.value = 'Error reading file: ' + err.message
    console.error('Error processing Excel file:', err)
  } finally {
    loading.value = false
  }
}

const processMarketingData = (rawData: any[][]) => {
  const headerRow = rawData[1] || []
  const months = headerRow.slice(2).filter(month => month)

  const processedData = {
    metadata: {
      fileName: "Marketing Forecasts.xlsx",
      months: months,
      totalMonths: months.length
    },
    metrics: [] as any[]
  }

  for (let i = 2; i < rawData.length; i++) {
    const row = rawData[i]
    if (!row || !row[0] || row[0].toString().trim() === '') continue 

    const metricName = row[0]
    let benchmark = row[1]
    const monthlyData: any = {}

    months.forEach((month, index) => {
      const value = row[index + 2] 
      monthlyData[month] = value !== null && value !== undefined ? value : null
    })

    if (!benchmark) {
      const values = Object.values(monthlyData).filter(v => v !== null) as number[]
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        benchmark = Number(avg.toFixed(2))
      } else {
        benchmark = 0
      }
    }

    processedData.metrics.push({
      metricName: metricName,
      benchmark: benchmark,
      monthlyData: monthlyData,
      hasData: Object.values(monthlyData).some(val => val !== null),
      dataPoints: Object.values(monthlyData).filter(val => val !== null).length
    })
  }

  return processedData
}

onMounted(() => {
  hasFileUploaded.value = localStorage.getItem('fileUploaded') === 'true';
});
</script>

<template>
  <div class="dashboard-layout">
    <AppHeader />
    <main class="dashboard-main">
      <div v-if="!hasFileUploaded" class="upload-prompt">
        <div class="upload-card">
          <h2 class="upload-title">Upload Your Marketing Data</h2>
          <p class="upload-description">
            Drag and drop your Excel file here, or click below to browse
          </p>

          <div class="upload-dropzone" @click="openFileInput">
            <p class="drop-text">Drop your .xls or .xlsx file</p>
            <button class="upload-button">Choose File</button>
          </div>

          <input
            type="file"
            ref="fileInput"
            @change="handleFileUpload"
            accept=".xls,.xlsx"
            style="display: none"
          />

          <p class="file-types">Supported formats: .xls, .xlsx</p>
        </div>
      </div>

      <Charts v-else />
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-main {
  margin-top: 64px;
  padding: 24px;
  flex: 1;
  background: linear-gradient(to bottom right, #f9fafb, #eef2f7);
}

/* Mobile screens */
@media (max-width: 640px) {
  .dashboard-main {
    padding: 12px 8px;
    margin-top: 56px;
  }

  .upload-card {
    padding: 1.5rem 1rem;
    margin: 0 8px;
  }
}

/* Tablet screens */
@media (min-width: 641px) and (max-width: 1024px) {
  .dashboard-main {
    padding: 16px 12px;
  }
}

.upload-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px);
}

.upload-card {
  background: white;
  padding: 3rem 2.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  max-width: 480px;
  width: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.upload-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
}

.upload-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.75rem;
}

.upload-description {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

.upload-dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  background-color: #fafafa;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.upload-dropzone:hover {
  border-color: #42b883;
  background-color: #f0fdf4;
}

.drop-text {
  color: #374151;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.upload-button {
  font-size: 0.875rem;
  padding: 0.75rem 1.5rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.upload-button:hover {
  background-color: #3aa876;
  box-shadow: 0 4px 8px rgba(66, 184, 131, 0.3);
}

.file-types {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #9ca3af;
}
</style>
