import Vue from 'vue';
import Vuetify, {VBtn, VIcon, VSnackbar} from 'vuetify/lib';
import VuetifyToast from 'vuetify-toast-snackbar';
import {SpaceConfigModule} from '@/store/modules/space-config'

Vue.use(Vuetify, {
  components: {
    VSnackbar,
    VBtn,
    VIcon
  }
});

Vue.use(VuetifyToast, {
  x: 'right',
  y: 'top',
  multiLine: true,
  timeout: 5000
});

export default new Vuetify({
  theme: {
    options: {
      customProperties: true,
    },
    dark: true
  }
});
