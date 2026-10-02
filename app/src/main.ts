import './assets/main.less';
import { createApp } from 'vue';
import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import '@arco-design/web-vue/dist/arco.css';
import './assets/light-theme.css';
import App from './App.vue';
import router from './router';
import directive from './directive/index';


const app = createApp(App)
app.use(ArcoVue);
app.use(ArcoVueIcon);
app.use(router);
app.use(directive);
app.mount('#app');
