<template>
  <div id="app">
    <!-- <CustomProducts/>
    <Page/> -->
    <TestHint/>
  </div>
</template>

<script>
import CustomProducts from '@/pages/CustomProducts'
import Page from '@/pages/Page'
import TestHint from '@/pages/TestHint'

export default {
  name: 'App',
  components: {
    Page,
    CustomProducts,
    TestHint,
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
