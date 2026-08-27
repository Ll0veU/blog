import { createApp } from 'vue'
import { applyInitialTheme } from './theme.js'
import App from './App.vue'
import './style.css'

applyInitialTheme()
createApp(App).mount('#app')
