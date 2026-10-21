import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar, Dark } from 'quasar';
// Iconos con estilo redondeado (la clase .material-icons de la app apunta a esta fuente)
import '@quasar/extras/material-icons-round/material-icons-round.css';
import 'quasar/dist/quasar.css';
// Tipografías reales autoalojadas (funcionan sin internet en campo)
import '@fontsource-variable/inter';
import '@fontsource-variable/montserrat';
import './css/app.css';

import App from './App.vue';
import router from './router';

// Tema claro por defecto (identidad Gua-iti tipo turismo)
Dark.set(false);

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Quasar);

app.mount('#app');
