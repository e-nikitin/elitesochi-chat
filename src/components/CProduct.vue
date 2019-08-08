<template>
  <a v-if="product" @click="addToLocalStorage()" :href="product.site_link" class="product">
    <img :src="product.preview_link" alt="Не удалось загрузить изображение" class="product__img">
    <span v-for="(attr, index) in product.attr_blocks" :style="{ color: attr.color, 'background-color': attr.bg_color }" :key="index" class="product__attr">{{ attr.name }}</span>
    <div class="product__title">{{ product.product_name }}</div>
    <div class="product__price">{{ price(product.product_price) }}</div>
    <div class="product__m2">{{ m2(product.area) }}</div>
    <div class="product__location">{{ product.microdistrict }}</div>
  </a>
</template>

<script>
import funcs from '@/js/funcs.js'

export default {
  props: {
    product: Object,
    category: {
      type: String,
      default: '',
    },
    token: {
      type: String,
      default: '',
    }
  },
  name: 'CProduct',
  data() {
    return {
      searchCategory: false
    }
  },
  computed: {
    location(){
      let microdistrict = this.product.microdistrict ? this.product.microdistrict + ' ' : ''
      let street = this.product.street ? this.product.street : ''
      return microdistrict + street
    },
    productClass(){
      let result = ''
      result += this.searchCategory ? ' product--search' : ''
      return result
    }
  },
  mounted(){
    this.searchCategory = this.category == 'search' ? true : false
  },
  methods: {
    addToLocalStorage(){
      let a = funcs.getURLParam('uid')
      localStorage.setItem('chatId', a)
      localStorage.setItem('productId', this.product.product_id)
    },
    defineWordForm(num){
      if(num == null) return ''
      if(num % 100 >= 5 && num % 100 <= 20) return 'квартир'
      let lastdigit = num % 10
      if(lastdigit == 0 || (lastdigit <= 9 && lastdigit >= 5)) return 'квартир'
      if(lastdigit == 1) return 'квартира'
      return 'квартиры'
    },
    price(str){
      return funcs.price(str)
    },
    m2(str){
      return funcs.m2(str)
    }
  }
};
</script>

<style scoped lang="scss" src="@/styles/CProduct.scss">

</style>
