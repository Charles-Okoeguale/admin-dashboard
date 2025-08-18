<script setup lang="ts">
import { computed } from 'vue'
import { useSidebar } from '@/components/ui/sidebar'
import { ref } from 'vue';

const fileInput = ref<HTMLInputElement | null>(null);

const openFileInput = () => {
  fileInput.value?.click(); 
};

const { state } = useSidebar()
const isCollapsed = computed(() => state.value === 'collapsed')
const headerPadding = computed(() => (isCollapsed.value ? 'pl-4' : 'pl-68'))

</script>

<template>
    <header :class="['fixed top-0 right-0 h-16 flex items-center bg-white', headerPadding]">
      <div class="ml-auto"> 
        <button @click="openFileInput" class="upload-button">
          Upload New File
        </button>
        <input
          type="file"
          ref="fileInput"
          accept=".xls,.xlsx"
          style="display: none"
        />
      </div>
    </header>
  </template>
  
  <style scoped>
  .upload-button {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
    background-color: #42b883; 
    color: white; 
    border: none; 
    border-radius: 4px; 
    cursor: pointer; 
    margin-right: 10px;
    transition: background-color 0.3s; 
  }
  
  .upload-button:hover {
    background-color: #3aa876; 
  }
  
  .ml-auto {
    margin-left: auto;
  }
  </style>
