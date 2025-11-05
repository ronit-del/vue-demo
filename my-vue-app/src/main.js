// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './components/route';
import './assets/styles/global.css';

const app = createApp(App);
app.use(router);
app.mount('#app');