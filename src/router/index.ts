import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue';
import Uploads from '@/views/Uploads.vue';

const routes = [
  {
    path: '/',
    component: Uploads,
  },
  {
    path: '/dashboard', 
    component: Dashboard,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
