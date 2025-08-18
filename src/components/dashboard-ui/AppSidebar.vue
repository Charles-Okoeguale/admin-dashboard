<script setup lang="ts">
import { LineChart, TableIcon } from "lucide-vue-next"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Chart",
    url: "#",
    icon: LineChart,
  },
  {
    title: "Table",
    url: "#",
    icon: TableIcon,
  },
];
</script>

<template>
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel class="sidebar-label">Admin Dashboard</SidebarGroupLabel>
          <SidebarGroupContent class="sidebar-content">
            <SidebarMenu>
              <SidebarMenuItem v-for="item in items" :key="item.title">
                <SidebarMenuButton asChild>
                  <a :href="item.url">
                    <component :is="item.icon" class="icon-size"/>
                    <span>{{item.title}}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  </template>
  
  <style scoped>
  .sidebar-label {
    font-size: 1.2rem; 
    margin-bottom: 3rem; 
  }
  
  .icon-size {
    width: 24px;
    height: 24px;
  }
  </style>