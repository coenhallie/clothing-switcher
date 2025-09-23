import { createRouter, createWebHistory } from 'vue-router';
import TryOnView from '../views/ClothingMimicView.vue';
import SettingsView from '../views/SettingsView.vue';

const routes = [
  {
    path: '/',
    name: 'TryOn',
    component: TryOnView,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
