import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './assets/styles/main.css';
import { useAppStore } from './stores/app.js';

// Create app instance
const app = createApp(App);

// Use plugins
const pinia = createPinia();
app.use(pinia);
app.use(router);

// Initialize app store
const appStore = useAppStore();
appStore.initialize();

// Mount app
app.mount('#app');
