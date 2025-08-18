<script setup lang="ts">
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/dashboard-ui/AppSidebar.vue";
import AppHeader from "@/components/dashboard-ui/AppHeader.vue";
</script>

<template>
  <SidebarProvider>
    <div class="flex flex-col h-screen w-full">
      <AppHeader class="fixed top-0 left-0 right-0 h-16 bg-white z-10" />
      <!-- <SidebarTrigger class="absolute top-8 left-4 z-20" /> -->
      <div class="flex pt-16 overflow-hidden">
        <AppSidebar class="h-full border-r border-gray-200" />
        <main class="flex-1 flex-col overflow-auto ">
          <router-view/>
        </main>
      </div>
    </div>
  </SidebarProvider>
</template>

