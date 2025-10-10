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

// Initialize deep link listener for Tauri mobile platforms
// This handles OAuth callbacks and magic link authentication on iOS/Android
if (window.__TAURI__) {
  // Dynamically import to avoid errors in non-Tauri environments
  import('./services/deepLinkHandler.js')
    .then(({ initializeDeepLinkListener }) => {
      initializeDeepLinkListener(router)
        .then((unlisten) => {
          if (unlisten) {
            console.log('[App] Deep link listener initialized successfully');
            // Store unlisten function for cleanup if needed
            window.__DEEP_LINK_UNLISTEN__ = unlisten;
          }
        })
        .catch((error) => {
          console.error('[App] Failed to initialize deep link listener:', error);
        });
    })
    .catch((error) => {
      console.error('[App] Failed to import deep link handler:', error);
    });
}

// Mount app
app.mount('#app');
