<script setup lang="ts">
import { LineChart, TableIcon } from "lucide-vue-next"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Chart",
    url: "/dashboard/charts",
    icon: LineChart,
  },
  {
    title: "Table",
    url: "/dashboard/tables",
    icon: TableIcon,
  },
];
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <Sidebar class="w-64 bg-white shadow-lg flex flex-col">
      <SidebarHeader>
        <div class="mt-10 mb-6 px-6 text-xl font-bold text-gray-800 border-b border-gray-200">
          Admin Dashboard
        </div>
      </SidebarHeader>

      <SidebarContent class="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu class="space-y-1 px-2">
              <SidebarMenuItem
                v-for="item in items"
                :key="item.title"
                class="rounded-md hover:bg-gray-100 transition-colors"
              >
                <SidebarMenuButton asChild>
                  <a
                    :href="item.url"
                    class="flex items-center gap-3 text-gray-700 px-4 py-3 font-medium rounded-md"
                  >
                    <component
                      :is="item.icon"
                      class="icon-size text-gray-500 group-hover:text-indigo-600 transition-colors"
                    />
                    <span class="truncate">{{ item.title }}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <div class="px-6 py-4 border-t border-gray-200 text-sm text-gray-500">
        &copy; 2025 Your Company
      </div>
    </Sidebar>
  </div>
</template>

<style scoped>
.icon-size {
  width: 24px;
  height: 24px;
}

.sidebar-content::-webkit-scrollbar {
  width: 8px;
}
.sidebar-content::-webkit-scrollbar-thumb {
  background-color: rgba(99, 102, 241, 0.4); 
  border-radius: 4px;
}
.sidebar-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(99, 102, 241, 0.6);
}
</style>
