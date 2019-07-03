// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import axios from 'axios'
import VueAxios from 'vue-axios'
import DragItDude from 'vue-drag-it-dude';

Vue.config.productionTip = false

Vue.use(VueAxios, axios)
Vue.component('vue-drag-it-dude', DragItDude)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
