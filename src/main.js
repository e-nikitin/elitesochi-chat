// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import CustomProducts from './pages/CustomProducts'
import Page from './pages/Page'
import TestHint from './pages/TestHint'
import axios from 'axios'
import VueAxios from 'vue-axios'
import DragItDude from 'vue-drag-it-dude';
import VueSocketIO from 'vue-socket.io'

Vue.use(new VueSocketIO({
  debug: true,
  connection: 'https://www.elitesochi.com:10000',
}))
Vue.config.productionTip = false

Vue.use(VueAxios, axios)
Vue.component('vue-drag-it-dude', DragItDude)

/* eslint-disable no-new */
new Vue({
  el: '#sochi__chat',
  components: { CustomProducts, Page, TestHint },
})
