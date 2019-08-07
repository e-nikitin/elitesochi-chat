<template>
  <div v-if="hasChatId" class="chat">
    <div ref="top" class="chat__top">
      <div ref="productsWrapper" class="chat__wrapper--products">
        <div v-show="productsLoader" class="chat__loader chat__loader--products"></div>
        <div v-show="!productsLoader" ref="products" class="chat__products">
          <div :ref="`product_${index}`" @click="addToLocalStorage(product.site_link, product.product_id)" :class="productClass(product)" v-for="(product, index) in products" :key="index" class="chat__product">
            <div :class="product.product_id == productId ? 'attention--current' : ''" class="attention"></div>
            <img :src="product.preview_link" class="chat__img">
            <div class="chat__name">{{ product.product_name }}</div>
            <div class="chat__price">{{ price(product.product_price) }}</div>
          </div>
        </div>
      </div>
      <div class="chat__shadow chat__shadow--left"></div>
      <div class="chat__shadow chat__shadow--right"></div>
      <div v-if="isMoveProducts" @click="buttonLeft()" class="chat__button chat__button--left"></div>
      <div v-if="isMoveProducts" @click="buttonRight()" class="chat__button chat__button--right"></div>
      <!-- <div v-if="fake" @click="buttonLeft()" class="chat__button chat__button--left"></div>
      <div v-if="fake" @click="buttonRight()" class="chat__button chat__button--right"></div> -->
    </div>
    <div v-if="showChat" class="chat__chat">
      <div @click="closeChat()" role="button" tabindex="0" class="chat__button chat__button--close"></div>
      <div v-show="chatLoading" class="chat__loader chat__loader--chat"></div>
      <div ref="messages" v-show="!chatLoading" v-if="msgs && msgs.length > 0" class="chat__messages">
        <div v-for="(item, index) in msgs" :key="index" class="chat__wrapper--messages">
          <div class="chat__date">{{ item.date }}</div>
          <div :class="`chat__message--${msg.sender}`" v-for="(msg, i) in item.msgs" :key="i" class="chat__message">
            <div class="chat__text">
              {{ msg.message }}
              <img @click="openImage(msg['file-src'])" v-if="msg['message-type'] == 'image'" class="chat__preview" :src="msg['file-preview']">
              <audio controlsList="nodownload" controls v-if="msg['message-type'] == 'audio'" :src="msg['file-src']"></audio>
            </div>
            <div v-if="msg.sender == 'manager'" class="chat__rieltor">{{ currentProduct.first_name }}</div>
            <div class="chat__time">{{ msg.time }}</div>
            <img v-if="msg.sender == 'manager'" :src="currentProduct.photo || require('./../assets/avatar.png')" class="chat__avatar">
          </div>
        </div>
      </div>
    </div>
    <div @click="clickInputs($event)" class="chat__inputs" :class="inputsClass">
      <div class="chat__wrapper--inputs">
        <textarea @keydown.enter="sendMessage($event)" v-model="msg" ref="input" placeholder="Написать" class="chat__input"></textarea>
        <div @click="clickSend()" role="button" ref="send" class="chat__button chat__button--send"></div>
        <img id="last-message" :src="currentProduct.photo || require('./../assets/avatar.png')" class="chat__photo">
        <div v-if="parseInt(currentProduct.count_unread_client_messages)" class="chat__unread">{{ this.currentProduct.count_unread_client_messages }}</div>
        <div v-if="fake" class="chat__unread tourhints__fake">4</div>
        <div class="chat__message--last">{{ lastMessage }}</div>
      </div>
    </div>
    <CModalImage ref="image"></CModalImage>
    <CTourHints @end="educationEnded()" ref="hints" :steps="hintSteps"></CTourHints>
  </div>
</template>

<script>
import funcs from '@/js/funcs.js'
import carousel from '@/js/carousel.js'
import chat from '@/js/chat.js'
import { compareAsc, format } from 'date-fns'
import VueSocketIO from 'vue-socket.io'
import CModalImage from '@/components/CModalImage'
import CTourHints from '@/components/CTourHints'

export default {
  name: 'CChat',
  components: {
    CModalImage,
    CTourHints,
  },
  data() {
    return {
      fake: false,
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
      chatLoading: false,
      productsLoader: false,
      currentPage: 1,
      isMoveProducts: false,
      adminPanelHeight: 0,
      pageYOffset: 0,
      maxMessageId: 0,
      centerProduct: null,
    };
  },
  computed: {
    hintSteps(){
      let result =  this.isMoveProducts ? [{
        id: 'current-center-product',
        class: 'chat__product--current',
        text: 'Вы сейчас в этом объекте',
      },{
        classes: ['chat__button--right', 'chat__button--left'],
        text: 'Если нажать сюда, то листается список домов',
      },{
        class: 'chat__wrapper--inputs',
        text: 'нажмите сюда, чтобы открыть чат с персональным менеджером',
      },{
        classes: ['chat__unread','attention--current'],
        text: 'Эти элементы показывают, что у вас есть непрочитанные сообщения по дому и их количество',
      },] : [{
        id: 'current-center-product',
        class: 'chat__product--current',
        text: 'Вы сейчас в этом объекте',
      },{
        class: 'chat__wrapper--inputs',
        text: 'нажмите сюда, чтобы открыть чат с персональным менеджером',
      },{
        classes: ['chat__unread','attention--current'],
        text: 'Эти элементы показывают, что у вас есть непрочитанные сообщения по дому и их количество',
      },]
      return result
    },
    inputsClass(){
      let result = ''
      if(this.showChat) result += ' chat__inputs--chat'
      return result
    },
    lastMessage(){
      return this.currentProduct.last_message_from == 'manager' ? 'Прочтите сообщение' : 'Задайте вопрос'
    },
  },
  async mounted(){
    this.productsLoader = true
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
    this.sockets.subscribe('chat message', async (data) => {
      data.sender = data.is_me ? 'client' : 'manager'
      await self.addMessageReverse(self.makeMessage(data))
      if(data['id-product'] == self.currentProduct.product_id){
        if(self.showChat) await self.setReadMessages()
        else{
          if(data.is_me){
            self.$set(self.currentProduct, 'last_message_from', 'client')
          } else {
            self.$set(self.currentProduct, 'last_message_from', 'manager')
            self.currentProduct.count_unread_client_messages = parseInt(self.currentProduct.count_unread_client_messages) + 1
          }
        }
      }
    })
    let condition = window.location.href.includes
    if(this.hasChatId && this.productId && window.location.href.includes(this.productId)) {
      await this.$forceUpdate()
      let pm = document.querySelector('div.ac-panel')
      this.adminPanelHeight = pm ? pm.offsetHeight : 0
      document.getElementById('sochi__chat').style.setProperty('--admin-panel-height', this.adminPanelHeight)
      if(pm) this.$refs.top.style.top = this.adminPanelHeight + 'px'
      window.history.pushState(null, null, window.location.pathname + `?chat-id=${this.chatId}&product-id=${this.productId}`)
      await this.getProducts()
      window.addEventListener('scroll', function(e){
        if((window.scrollY < self.$refs.products.offsetHeight + 10 ||
            window.scrollY < self.pageYOffset - 10)){
            self.$refs.top.style.setProperty('--top', 0)
            self.pageYOffset = window.scrollY
        } else if(window.scrollY > self.pageYOffset + 10){
          self.$refs.top.style.setProperty('--top', -self.$refs.top.offsetHeight - 10 + 'px')
          self.pageYOffset = window.scrollY
        }
      })
      let h = document.getElementById('header')
      if(h){
        h.style.position = 'relative'
        h.style.marginTop = this.$refs.products.offsetHeight + 'px'
      }
      let m = document.getElementById('main')
      if(m) m.style.position = 'relative'
      let f = document.getElementById('footer')
      if(f) f.style.position = 'relative'
      this.hideSiteElements()
    }
    if(localStorage.getItem('chat_education_ended') != 'true'){
      self.fake = true
      setTimeout(function(){self.$refs.hints.run()}, 100)
    }
    window.addEventListener('keydown', function(e){
      if(e.code == "KeyE" && e.shiftKey && e.ctrlKey){
        localStorage.setItem('chat_education_ended', false)
      }
    })
  },
  methods: {
    hideSiteElements(){
      let arr = document.querySelectorAll('a.btn.send')
      arr.forEach(a => a.style.display = 'none')
      let blocks = document.getElementsByClassName('content-box subscribe-content')
      blocks[0].style.width = '0'
      blocks[0].style.height = '0'
      blocks[0].style.padding = '0'
    },
    educationEnded(){
      this.fake = false
      localStorage.setItem('chat_education_ended', true)
    },
    openImage(img){
      this.$refs.image.open(img)
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
      this.openChat()
    },
    async getMessages(noScroll){
      let link = 'https://serviceapi.elitesochi.com/esmain/bromobile/get-chat-messages'
      let data = {
        work_id: this.currentProduct.work_id,
        product_id: this.currentProduct.product_id,
        per_page: 10,
        page: this.currentPage,
      }
      let response = await funcs.post(this, link, data)
      if(response.status == 200){
        this.currentPage++
        this.importedMsgs = response.data
        this.maxMessageId = Math.max(this.maxMessageId, ...this.importedMsgs.map(m => m.message_id))
        let scrollHeight = 0
        if(this.$refs.messages) scrollHeight = this.$refs.messages.scrollHeight
        await this.makeMessages()
        if(noScroll){
          this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight - scrollHeight
        }
        // this.$refs.messages.scrollIntoView(false)
      }
      // console.table(this.messages)
    },
    async makeMessages(noScroll){
      let self = this
      await this.importedMsgs.forEach(await function(m){
        self.addMessage(self.makeMessage(m), noScroll)
      })
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
    async addMessage(msg, noScroll){
      if(this.msgs.find(m => m.date == msg.date)){
        await this.msgs.find(m => m.date == msg.date).msgs.unshift(msg)
      } else {
        await this.msgs.unshift({
          date: msg.date,
          msgs: [msg]
        })
      }
      if(!noScroll && this.$refs.messages) this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
    },
    async addMessageReverse(msg, noScroll){
      if(this.msgs.find(m => m.date == msg.date)){
        await this.msgs.find(m => m.date == msg.date).msgs.push(msg)
      } else {
        await this.msgs.push({
          date: msg.date,
          msgs: [msg]
        })
      }
      if(!noScroll && this.$refs.messages) this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
    },
    async openChat(){
      let self = this
      await chat.open(this)
      await this.setReadMessages()
      setTimeout(function(){self.getProducts()}, 1500)
    },
    keyClose(e){
      if(e.keyCode == 27 || e.key == 'Escape' || e.code == 'Escape'){
        this.closeChat()
        window.removeEventListener('keydown', this.keyClose)
      }
    },
    closeChat(){
      chat.close(this)
    },
    setReadMessages(){
      let formData = {}
      formData['work_id'] = this.currentProduct.work_id
      formData['product_id'] = this.currentProduct.product_id
      funcs.post(this, 'https://serviceapi.elitesochi.com/esmain/bromobile/set-read-message', formData)
    },
    productClass(prod){
      let result = ''
      if(parseInt(prod.count_unread_client_messages) > 0 || this.fake) result += " chat__product--attention"
      if(prod.product_id == this.currentProduct.product_id) result += " chat__product--current"
      return result
    },
    async getProducts(){
      let self = this
      let link = `https://serviceapi.elitesochi.com/esmain/bromobile/work-products/${ this.chatId }`
      let response = await funcs.get(this, link)
      if(response.status == 200){
        this.products = await response.data
        this.productsLoader = false
        await this.makeLinks()
        this.currentProduct = await this.products.find(p => p.product_id == this.productId)
        await this.$forceUpdate()
        await this.setProductsStyle()
        await this.setMoveProducts()
      }
    },

//              ------------------- CAROUSEL ------------------------

    setMoveProducts(e){
      let self = this
      if(document.documentElement.clientWidth > 768)
        this.$refs.products.addEventListener('mousedown', this.handleMouseDown)
      else {
        this.$refs.productsWrapper.addEventListener('scroll', function(e){
          let delta = 0
          let wrapper = self.$refs.productsWrapper
          let wrapperWidth = self.$refs.productsWrapper.offsetWidth
          let itemsWidth = self.$refs.products.offsetWidth
          let items = self.products
          let product = document.querySelector('.chat__product')
          carousel.moveProducts(delta, wrapper, wrapperWidth, itemsWidth, items, product)
        })
      }
    },
    async setProductsStyle(){
      let self = this
      let items = this.products
      let currentItem = this.currentProduct
      let itemsEl = this.$refs.products
      let wrapperEl = this.$refs.productsWrapper
      let wrapperWidth = this.$refs.productsWrapper.offsetWidth
      let itemWidth = null
      await setTimeout(function(){
        itemWidth = document.querySelector('.chat__product').offsetWidth
        self.isMoveProducts = carousel.setItemsElStyle(items, currentItem, itemsEl, wrapperEl, wrapperWidth, itemWidth)
      }, 50)
    },
    handleMouseDown(e){
      if(this.isMoveProducts) {
        window.addEventListener('mousemove', this.handleMouseMove)
        window.addEventListener('mouseup', this.handleMouseUp)
        carousel.handleMouseDown(e, this.$refs.products.style)
      }
    },
    handleMouseMove(e){
      let event = e
      let wrapper = this.$refs.productsWrapper
      let wrapperWidth = this.$refs.productsWrapper.offsetWidth
      let itemsWidth = this.$refs.products.offsetWidth
      let items = this.products
      console.log()
      let product = document.querySelector('.chat__product')
      carousel.handleMouseMove(event, wrapper, wrapperWidth, itemsWidth, items, product)
    },
    buttonLeft(){
      let wrapper = this.$refs.productsWrapper
      let wrapperWidth = this.$refs.productsWrapper.offsetWidth
      let itemsWidth = this.$refs.products.offsetWidth
      let items = this.products
      let product = document.querySelector('.chat__product')
      let delta = document.querySelector('.chat__product').offsetWidth - 25
      this.animateButton(delta, wrapper, wrapperWidth, itemsWidth, items, product)
    },
    buttonRight(){
      let wrapper = this.$refs.productsWrapper
      let wrapperWidth = this.$refs.productsWrapper.offsetWidth
      let itemsWidth = this.$refs.products.offsetWidth
      let items = this.products
      let product = document.querySelector('.chat__product')
      let delta = -document.querySelector('.chat__product').offsetWidth + 25
      this.animateButton(delta, wrapper, wrapperWidth, itemsWidth, items, product)
    },
    animateButton(delta, wrapper, wrapperWidth, itemsWidth, items, product){
      let fps = 60;
      let duration = 0.3
      let now = Date.now()
      delta = delta / (fps * duration)
      let timer = setInterval(function() {
        if ((Date.now() - now) > (duration * 1000)) clearInterval(timer);
        else {
          carousel.moveProducts(delta, wrapper, wrapperWidth, itemsWidth, items, product)
        }
      }, 1000 / fps)
    },
    handleMouseUp(e){
      let event = e
      let itemsStyle = this.$refs.products.style
      carousel.handleMouseUp(event, itemsStyle)

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
