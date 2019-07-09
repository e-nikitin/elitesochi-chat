<template>
  <div v-if="hasChatId" class="chat">
    <div ref="top" class="chat__top">
      <div ref="productsWrapper" class="chat__wrapper--products">
        <div ref="products" class="chat__products">
          <div @mouseup="preventDefault($event)" @click="addToLocalStorage(product.site_link, product.product_id)" :class="productClass(product)" v-for="(product, index) in products" :key="index" class="chat__product">
            <img :src="product.preview_link" class="chat__img">
            <div class="chat__name">{{ product.product_name }}</div>
            <div class="chat__price">{{ price(product.product_price) }}</div>
          </div>
        </div>
      </div>
      <div @click="buttonLeft()" class="chat__button chat__button--left"></div>
      <div @click="buttonRight()" class="chat__button chat__button--right"></div>
    </div>
    <div v-if="showChat" class="chat__chat">
      <div @click="closeChat()" role="button" tabindex="0" class="chat__button chat__button--close"></div>
      <div ref="messages" v-if="msgs && msgs.length > 0" class="chat__messages">
        <div v-for="(item, index) in msgs" :key="index" class="chat__wrapper--messages">
          <div class="chat__date">{{ item.date }}</div>
          <div :class="`chat__message--${msg.sender}`" v-for="(msg, i) in item.msgs" :key="i" class="chat__message">
            <div class="chat__text">
              {{ msg.message }}
            </div>
            <div class="chat__time">{{ msg.time }}</div>
            <img v-if="msg.sender == 'manager'" :src="currentProduct.photo" class="chat__avatar">
            <!-- <div class="chat__user-name"></div> -->
          </div>
        </div>
      </div>
    </div>
    <div @click="clickInputs($event)" class="chat__inputs" :class="inputsClass">
      <div class="chat__wrapper--inputs">
        <textarea @keydown.enter="sendMessage($event)" v-model="msg" ref="input" placeholder="Написать" class="chat__input"></textarea>
        <div @click="clickSend()" role="button" ref="send" class="chat__button chat__button--send"></div>
        <img :src="currentProduct.photo" alt=":)" class="chat__photo">
        <div class="chat__unread">{{ this.currentProduct.count_unread_client_messages }}</div>
        <div class="chat__message--last">{{ this.currentProduct.last_manager_message }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import funcs from '@/js/funcs.js'
import { compareAsc, format } from 'date-fns'
import VueSocketIO from 'vue-socket.io'

// let socket = new WebSocket('wss://www.elitesochi.com:10000/socket.io/?EIO=3&transport=websocket&sid=A_gX7DsPLwZZu-_1AkZb')
// let socket = new WebSocket('wss://www.elitesochi.com:10000/socket.io/?EIO=3&transport=websocket&sid=A_gX7DsPLwZZu-_1AkZb')


export default {
  name: 'CChat',
  data() {
    return {
      showChat: false,
      products: [],
      currentProduct: {},
      msgs: [],
      importedMsgs: [],
      msg: '',
      hasChatId: '',
      echo: null,
      messages: [],
      users: [],
      chatId: null,
      productId: null,
      moved: false,
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
    let self = this
    this.chatId = funcs.getURLParam('chat-id')
    this.productId = funcs.getURLParam('product-id')
    if(!this.chatId) {
      this.chatId = localStorage['chatId']
      localStorage.removeItem('chatId')
    }
    if(!this.productId) {
      this.productId = localStorage['productId']
      localStorage.removeItem('productId')
    }
    this.hasChatId = !!this.chatId
    this.sockets.subscribe('chat message', (data) => {
      data.sender = data.is_me ? 'client' : 'manager'
      self.addMessage(self.makeMessage(data))
    })
    if(this.hasChatId && this.productId) {
      await this.$forceUpdate()
      let pm = document.querySelector('div.ac-panel')
      if(pm) this.$refs.top.style.top = pm.offsetHeight + 'px'
      window.history.pushState(null, null, window.location.pathname + `?chat-id=${this.chatId}&product-id=${this.productId}`)
      this.getProducts()
    }
  },
  methods: {
    preventDefault(e){
      console.log(e)
      e.preventDefault()
    },
    addToLocalStorage(link, id){
      if(!this.moved) {
        localStorage.setItem('chatId', this.chatId)
        localStorage.setItem('productId', id)
        window.location.href = link
      } else this.moved = false
    },
    getMessage(msg){
      this.addMessage(this.makeMessage(msg))
    },
    sendMessage(e){
      if(e) e.preventDefault()
      if (!this.msg.replace(/\s/g, '').length) return
      let data = {
        'file-name': null,
        'file-preview': null,
        'file-src': null,
        'id-product': this.productId,
        'id_loading_dom_e': this.makeid(10),
        'is_me': true,
        'message': this.msg,
        'message-type': "text",
      }
      let postData = {
        event: 'api.mobile.server-chat-new-message',
        message: this.msg,
        uid: this.chatId,
        id_product: this.productId,
      }
      let fd = new FormData()
      Object.keys(postData).forEach(k => fd.append(k, postData[k]))
      this.$socket.emit('chat message', data)
      funcs.post(this, 'https://www.elitesochi.com/ajax/router.php', fd)
      this.msg = ''
    },
    makeid(count) {
      var count = (!count) ? 10 : parseInt(count);
			var text = '',
				possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			for( var i=0; i < count; i++ )
				text += possible.charAt(Math.floor(Math.random() * possible.length));
			return text;
		},
    async clickSend(){
      let data = {
        counter_not_read_messages: this.currentProduct.count_unread_client_messages,
        id_product: this.currentProduct.product_id,
        id_work: this.currentProduct.work_id
      }
      this.$socket.emit('chat counter', data)
      this.$refs.input.focus()
      if(this.msg){
        this.sendMessage()
      }
    },
    clickInputs(e){
      if(this.showChat) return
      let el = funcs.getEventPath(e.target).find(x => Object.is(this.$refs.send, x))
      this.$refs.input.focus()
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
      let response = await funcs.post(this, link, data)
      if(response.status == 200){
        this.importedMsgs = response.data.data.reverse()
        await this.makeMessages()
        this.$refs.messages.scrollIntoView(false)
      }
    },
    async makeMessages(){
      let self = this
      await this.importedMsgs.forEach(await function(m){
        self.addMessage(self.makeMessage(m))
      })
      this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
    },
    makeMessage(msg){
      let ru = require('date-fns/locale/ru')
      if(msg['datetime-add']){
        this.$set(msg, 'date', format(msg['datetime-add'], 'dddd, DD.MM.YYYY', { locale: ru }))
        this.$set(msg, 'time', format(msg['datetime-add'], 'HH:mm:ss', { locale: ru }))
      } else {
        this.$set(msg, 'date', format(new Date(), 'dddd, DD.MM.YYYY', { locale: ru }))
        this.$set(msg, 'time', format(new Date, 'HH:mm:ss', { locale: ru }))
      }
      return msg
    },
    async addMessage(msg){
      if(this.msgs[this.msgs.length - 1] && this.msgs[this.msgs.length - 1].date == msg.date){
        await this.msgs[this.msgs.length - 1].msgs.push(msg)
      } else {
        await this.msgs.push({
          date: msg.date,
          msgs: [msg]
        })
      }
      this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
    },
    openChat(){
      this.showChat = true
      this.getMessages()
      document.getElementsByTagName('body')[0].style.overflow = 'hidden'
    },
    closeChat(){
      this.showChat = false
      this.msgs = []
      this.importedMsgs = []
      document.getElementsByTagName('body')[0].style.overflow = ''
    },
    productClass(prod){
      let result = ''
      if(parseInt(prod.count_unread_client_messages) > 0) result += " chat__product--attention"
      if(prod.product_id == this.currentProduct.product_id) result += " chat__product--current"
      return result
    },
    async getProducts(){
      let link = `https://serviceapi.elitesochi.com/esmain/bromobile/work-products/${ this.chatId }`
      let response = await funcs.get(this, link)
      if(response.status == 200){
        this.products = await response.data
        await this.makeLinks()
        this.currentProduct = await this.products.find(p => p.product_id == this.productId)
        await this.$forceUpdate()
        this.setProductsStyle()
        this.setMoveProducts()
      }
    },
    setProductsStyle(){
      let self = this
      let productLength = document.querySelector('.chat__product').offsetWidth
      let style = {}
      style.width = `${ this.products.length * productLength }px`
      Object.keys(style).forEach(k => this.$refs.products.style[k] = style[k])
    },
    setMoveProducts(e){
      this.$refs.products.addEventListener('mousedown', this.handleMouseDown)
    },
    handleMouseDown(e){
      e.preventDefault()
      this.$refs.products.style.transition = 'none'
      window.addEventListener('mousemove', this.handleMouseMove)
      window.addEventListener('mouseup', this.handleMouseUp)
      document.body.style.cursor = 'grab'
      this.$refs.products.style.cursor = 'grab'
    },
    handleMouseMove(e){
      e.preventDefault()
      this.moved = true
      let left
      if(parseInt(this.$refs.products.style.left)){
        left = parseInt(this.$refs.products.style.left) + e.movementX + 'px'
      } else {
        left = e.movementX + 'px'
      }
      if(parseInt(left) > 30) left = `30px`
      if(parseInt(left) < (this.$refs.productsWrapper.offsetWidth - this.$refs.products.offsetWidth - 30)) left = `${this.$refs.productsWrapper.offsetWidth - this.$refs.products.offsetWidth - 30}px`
      this.$refs.products.style.left = left
      this.$refs.products.style.left
    },
    buttonLeft(){
      let left
      let w = document.querySelector('.chat__product').offsetWidth - 25
      if(parseInt(this.$refs.products.style.left)){
        left = parseInt(this.$refs.products.style.left) + w + 'px'
      } else {
        left = w + 'px'
      }
      if(parseInt(left) > 30) left = `30px`
      if(parseInt(left) < (this.$refs.productsWrapper.offsetWidth - this.$refs.products.offsetWidth - 30)) left = `${this.$refs.productsWrapper.offsetWidth - this.$refs.products.offsetWidth - 30}px`
      this.$refs.products.style.left = left
    },
    buttonRight(){
      let left
      let w = -document.querySelector('.chat__product').offsetWidth + 25
      if(parseInt(this.$refs.products.style.left)){
        left = parseInt(this.$refs.products.style.left) + w + 'px'
      } else {
        left = w + 'px'
      }
      if(parseInt(left) > 30) left = `30px`
      if(parseInt(left) < (this.$refs.productsWrapper.offsetWidth - this.$refs.products.offsetWidth - 30)) left = `${this.$refs.productsWrapper.offsetWidth - this.$refs.products.offsetWidth - 30}px`
      this.$refs.products.style.left = left
    },
    handleMouseUp(e){
      document.body.style.cursor = ''
      this.$refs.products.style.transition = ''
      this.$refs.products.style.cursor = ''
      e.preventDefault()
      window.removeEventListener('mouseup', this.handleMouseUp)
      window.removeEventListener('mousemove', this.handleMouseMove)
    },
    makeLinks(){
      this.products.forEach(p => {
        p.site_link += `?chat-id=${this.chatId}&product-id=${p.product_id}`
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
