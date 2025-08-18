<script setup lang="ts">
import { ref } from 'vue'
import readXlsxFile from 'read-excel-file'
import { useRouter } from 'vue-router'

const router = useRouter()
const fileInput = ref<HTMLInputElement | null>(null)

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'
    ) {
      try {
        const rows = await readXlsxFile(file)
        console.log('Excel file contents:', rows)
        router.push('/dashboard')
      } catch (error) {
        console.error('Error reading Excel file:', error)
        alert('Error reading the Excel file')
      }
    } else {
      alert('Please select an Excel file')
    }
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
