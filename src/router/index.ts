import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/characters/:id',
      name: 'character',
      component: () => import('@/pages/CharacterPage.vue'),
      props: true,
    },
  ],
})

export default router
