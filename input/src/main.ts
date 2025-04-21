import { createApp } from 'vue'

// Vuetify
import 'vuetify/styles/main.css';
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { mdi } from 'vuetify/iconsets/mdi-svg'
import router from './router/router';

// Components
import App from "./App.vue";

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdiSvg',
    sets: {
      mdiSvg: mdi,
    },
  },
})

createApp(App).use(router).use(vuetify).mount('#app')
