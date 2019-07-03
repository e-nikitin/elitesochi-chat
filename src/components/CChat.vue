<template>
  <div v-if="hasUID" class="chat">
    <div v-if="showChat" class="chat__chat">
      <div @click="closeChat()" role="button" tabindex="0" class="chat__button chat__button--close"></div>
      <div v-if="msgs && msgs.length > 0" class="chat__messages">
        <div v-for="(item, index) in msgs" :key="index" class="chat__wrapper--messages">
          <div class="chat__date">{{ item.date }}</div>
          <div :class="`chat__message--${msg.sender}`" v-for="(msg, i) in item.msgs" :key="i" class="chat__message">
            <div class="chat__text">
              {{ msg.message }}
              <div class="chat__time">{{ msg.time }}</div>
            </div>
            <!-- <div class="chat__avatar">{{  }}</div> -->
            <!-- <div class="chat__user-name"></div> -->
          </div>
        </div>
      </div>
    </div>
    <div class="chat__top">
      <div class="chat__wrapper--products">
        <div ref="products" class="chat__products">
          <a :href="product.site_link" :class="productClass(product)" v-for="(product, index) in products" :key="index" class="chat__product">
            <img :src="product.preview_link" class="chat__img">
            <div class="chat__name">{{ product.product_name }}</div>
            <div class="chat__price">{{ price(product.product_price) }}</div>
          </a>
        </div>
      </div>
      <div class="chat__button chat__button--left"></div><div class="chat__button chat__button--right"></div>
    </div>
    <div @click="clickInputs($event)" class="chat__inputs" :class="inputsClass">
      <div class="chat__wrapper--inputs">
        <textarea v-model="msg" ref="input" placeholder="Написать" class="chat__input"></textarea>
        <div @click="clickSend()" role="button" ref="send" class="chat__button chat__button--send"></div>
        <img src="https://crm.elitesochi.com//upload/main/d8d/21233.jpg" alt="" class="chat__photo">
        <div class="chat__unread">2</div>
        <div class="chat__message--last">{{ currentProduct.last_memeger_message }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import funcs from '@/js/funcs.js'
import { compareAsc, format } from 'date-fns'
let ru = require('date-fns/locale/ru')

export default {
  name: 'CChat',
  data() {
    return {
      showChat: false,
      products: [],
      currentProduct: {},
      msgs: [],
      msg: '',
      hasUID: '',
    };
  },
  computed: {
    inputsClass(){
      let result = ''
      if(this.showChat) result += ' chat__inputs--chat'
      return result
    },
  },
  async mounted(){
    let uid = funcs.getURLParam('uid')
    this.productId = funcs.getURLParam('product-id')
    this.hasUID = !!uid
    this.uid = uid
    if(this.hasUID) this.getProducts()
  },
  methods: {
    clickSend(){
      this.$refs.input.focus()
      if(this.msg){

      }
    },
    clickInputs(e){
      if(this.showChat) return
      let el = funcs.getEventPath(e.target).find(x => Object.is(this.$refs.send, x))
      if(!el){
        this.openChat()
      }
    },
    async getMessages(){
      let link = 'https://serviceapi.elitesochi.com/esmain/bromobile/get-chat-messages'
      let data = {
        work_id: this.currentProduct.work_id,
        product_id: this.currentProduct.product_id,
        per_page: 50,
      }
      console.time('post')
      let response = await funcs.post(this, link, data)
      console.timeEnd('post')
      if(response.status == 200){
        this.msgs = response.data.data.reverse()
        this.makeMessages()
      }
    },
    makeMessages(){
      let self = this
      let msgs = []
      this.msgs.forEach(m => {
        self.$set(m, 'date', format(m['datetime-add'], 'dddd, D.M.YYYY', { locale: ru }))
        self.$set(m, 'time', format(m['datetime-add'], 'hh:mm:ss', { locale: ru }))
        if(msgs[msgs.length - 1] && msgs[msgs.length - 1].date == m.date){
          msgs[msgs.length - 1].msgs.push(m)
        } else {
          msgs.push({
            date: m.date,
            msgs: [m]
          })
        }
      })
      this.msgs = msgs
    },
    openChat(){
      this.showChat = true
      this.getMessages()
    },
    closeChat(){
      this.showChat = false
    },
    productClass(prod){
      let result = ''
      if(parseInt(prod.count_unread_client_messages) > 0) result += " chat__product--attention"
      if(prod.product_id == this.currentProduct.product_id) result += " chat__product--current"
      return result
    },
    async getProducts(){
      // let filters = funcs.getURLParam('uid')
      let filters = '5cd2f8d80abbf'
      let link = 'https://serviceapi.elitesochi.com/esmain/bromobile/work-products/' + filters
      let response = await funcs.get(this, link)
      if(response.status == 200){
        this.products = response.data
        this.makeLinks()
        this.currentProduct = this.products[Math.round(this.products.length / 2)]
      }
    },
    makeLinks(){
      let str = `?uidn=${this.uid}&product-id=`
      this.products.forEach(p => {
        p.site_link += str + p.product_id
      })
    },
    price(a){
      let b = funcs.price(a)
      return b
    }
  },
};
</script>

<style scoped lang="scss" src="@/styles/CChat.scss">

</style>
