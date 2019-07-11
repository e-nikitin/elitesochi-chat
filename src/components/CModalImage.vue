<template>
  <div v-if="showImg" class="image">
    <div @click="close()" class="image__bg"></div>
    <img :src="img" class="image__image">
  </div>
</template>

<script>
export default {
  name: 'CModalImage',
  data() {
    return {
      img: '',
      showImg: false,
    };
  },
  methods: {
    open(img){
      this.img = img
      this.showImg = true
    },
    close(){
      this.showImg = false
    }
  }
};
</script>

<style scoped lang="scss" src="@/styles/CModalImage.scss">

</style>
