<template>
  <div ref="product" class="products">
    <div class="products__loading products__products" v-if="state == 'loading'">
      <CLoadingProduct class="products__product" />
      <CLoadingProduct class="products__product" />
      <CLoadingProduct class="products__product" />
      <CLoadingProduct class="products__product" />
    </div>
    <div v-if="state == 'products'">
      <div class="products__products">
        <div v-for="(product, index) in products" :key="index" class="products__product">
          <CProduct :product="product"></CProduct>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CProduct from '@/components/CProduct'
import CLoadingProduct from '@/components/CLoadingProduct'
import funcs from '@/js/funcs.js'

export default {
  name: 'CustomProducts',
  props: {
    filter: {
      type: String,
      default: ''
    },
  },
  components: {
    CLoadingProduct,
    CProduct,
  },
  data() {
    return {
      products: [],
      state: 'loading',
      uid: '',
    };
  },
  async mounted(){
    this.uid = funcs.getURLParam('uid')
    this.getProducts()
  },
  methods: {
    async getProducts(){
      this.state='loading'
      // let filters = this.uid
      let filters = '5cd2f8d80abbf'
      let link = 'https://serviceapi.elitesochi.com/esmain/bromobile/work-products/' + filters
      let response = await funcs.get(this, link)
      if(response.status == 200){
        this.products = response.data
        this.makeLinks()
        if(this.products.length == 0) this.state = 'empty'
        else this.state = 'products'
      } else {
        this.state = 'empty'
      }
    },
    makeLinks(){
      let str = `?uidn=${this.uid}&product-id=`
      this.products.forEach(p => {
        p.site_link += str + p.product_id
      })
    },
  },
};
</script>

<style scoped lang="scss" src="@/styles/CustomProducts.scss">

</style>
