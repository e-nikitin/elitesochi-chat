<template>
  <div id="app">
    <CustomProducts/>
    <Page/>
  </div>
</template>

<script>
import CustomProducts from '@/pages/CustomProducts'
import Page from '@/pages/Page'

export default {
  name: 'App',
  components: {
    Page,
    CustomProducts,
  }
}
</script>

<style>
*,*::before,*::after{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
