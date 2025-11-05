import { createApp } from 'vue'
import App from './App.vue'
import router from './components/router.js'
import store from './services/stores/index.js'

const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
