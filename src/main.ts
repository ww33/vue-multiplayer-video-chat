import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from '@/store';
import vuetify from "@/plugins/vuetify";
import VueClipboard from 'vue-clipboard2'
import Spinner from 'vue-spinkit'
import VModal from 'vue-js-modal'
import VueProgressiveImage from 'vue-progressive-image'
import {Config} from './config'
import Croppa from 'vue-croppa';
import { VueHammer } from 'vue2-hammer';
import VTitle from 'v-title';
import 'v-title/lib/element-ui';

Vue.config.productionTip = false;
Vue.prototype.$isDev = Config.ENV !== 'production';

Vue.use(VTitle);
Vue.use(VueClipboard);
Vue.use(VModal);
Vue.component('Spinner', Spinner);
Vue.use(VueProgressiveImage);
Vue.use(Croppa);
Vue.use(VueHammer);

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app');
