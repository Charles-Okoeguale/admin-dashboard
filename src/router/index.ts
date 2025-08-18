import { createRouter, createWebHistory } from 'vue-router'
import Uploads from '@/views/Uploads.vue';
import DashboardLayout from '@/views/DashboardLayout.vue';
import Charts from '@/views/DashboardPages/Charts.vue';
import Tables from '@/views/DashboardPages/Tables.vue';

const routes = [
  {
    path: '/',
    component: Uploads,
  },
  {
    path: '/dashboard', 
    component: DashboardLayout,
    meta: { requiresUpload: true },
    children: [
      {
        path: 'charts',
        component: Charts,
      },
      {
        path: 'tables',
        component: Tables,   
      },
    ]
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const isUploaded = localStorage.getItem('fileUploaded') === 'true'

  if (to.meta.requiresUpload && !isUploaded) {
    next({ path: '/' })
  } else {
    next()
  }
})

export default router
