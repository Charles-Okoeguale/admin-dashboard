<script setup lang="ts">
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { useRouter } from 'vue-router'

const router = useRouter()
const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const data = ref<any>(null)

const processMarketingData = (rawData: any[][]) => {
  console.log(rawData, 'Raw Excel data received')
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
  
    console.log('Processed Excel data:', structuredData)
    
    data.value = structuredData
  
    localStorage.setItem('fileUploaded', 'true')
    localStorage.setItem('excelData', JSON.stringify(structuredData))
    
    router.push('/dashboard')
  } catch (err: any) {
    error.value = 'Error reading file: ' + err.message
    console.error('Error processing Excel file:', err)
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <h1 class="welcome-header">Welcome to Excel Uploader</h1>
  <div class="upload-section">
    <input
      type="file"
      ref="fileInput"
      accept=".xls,.xlsx"
      style="display: none"
      @change="handleFileUpload"
    />
    <button class="upload-button" @click="fileInput?.click()">
      Upload Excel File
    </button>
  </div>
</template>


<style scoped>
.landing-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}

.welcome-header {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
}

.upload-section {
  text-align: center;
}

.upload-button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.upload-button:hover {
  background-color: #3aa876;
}
</style>

