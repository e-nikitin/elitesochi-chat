<template>
  <div class="page" style="pointer-events: none;">
    <CChat style="pointer-events: all;"></CChat>
  </div>
</template>

<script>
import CChat from '@/components/CChat'

export default {
  name: 'Page',
  components: {
    CChat,
  },
  data() {
    return {

    };
  },
};
</script>

<style scoped lang="scss">
.page{
  position: absolute;
  display: block;
  top: 0;
  left: 0;
  width: calc(100vw - 24px);
  height: 100vh;
}
</style>
