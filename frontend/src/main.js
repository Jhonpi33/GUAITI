import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar, Dark, Notify, Dialog } from 'quasar';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/dist/quasar.css';
import './css/app.css';

import App from './App.vue';
import router from './router';

// Tema oscuro por defecto (identidad Gua-iti)
Dark.set(true);

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Quasar, { plugins: { Notify, Dialog } });

app.mount('#app');
