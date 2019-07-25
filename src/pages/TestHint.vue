<template>
  <div>
    <div class="el el-1">1</div>
    <div class="el el-2">2</div>
    <div class="el el-3">3</div>
    <div class="el el-4">4</div>
    <div class="el el-5">5</div>
    <div class="el el-6">6</div>
    <div class="el el-7">7</div>
    <div class="el el-8">8</div>
    <CTourHints ref="hints" :steps="hintSteps"></CTourHints>
  </div>
</template>

<script>
import CTourHints from '@/components/CTourHints'


export default {
  name: 'TestHint',
  components: {
    CTourHints,
  },
  data() {
    return {
      hintSteps: [{
        classes: ['el-1','el-2','el-3','el-4','el-5','el-6','el-7','el-8'],
        text: 'Все элементы',
      },{
        class: 'el-1',
        text: 'Элемент №1',
      },{
        class: 'el-2',
        text: 'Элемент №2',
      },{
        class: 'el-3',
        text: 'Элемент №3',
      },{
        class: 'el-4',
        text: 'Элемент №4',
      },{
        class: 'el-5',
        text: 'Элемент №5',
      },{
        class: 'el-6',
        text: 'Элемент №6',
      },{
        class: 'el-7',
        text: 'Элемент №7',
      },{
        class: 'el-8',
        text: 'Элемент №8',
      },]
    };
  },
  mounted(){
    this.$refs.hints.run()
  }
};
</script>

<style scoped lang="scss">
.el{
  --size: 10px;
  --cx: calc(50vw - var(--size) / 2);
  --cy: calc(50vh - var(--size) / 2);
  --offset-x: 600px;
  --offset-y: 350px;
  width: var(--size);
  height: var(--size);
  position: fixed;
  background-color: yellowgreen;
  border-radius: 50%;
  text-align: center;
  line-height: var(--size);
  font-size: 35px;
  font-family: sans-serif;
  &-1{
    left: calc(var(--cx) - var(--offset-x));
    top: calc(var(--cy) - var(--offset-y));
  }
  &-2{
    left: calc(var(--cx));
    top: calc(var(--cy) - var(--offset-y));
  }
  &-3{
    left: calc(var(--cx) + var(--offset-x));
    top: calc(var(--cy) - var(--offset-y));
  }
  &-4{
    left: calc(var(--cx) - var(--offset-x));
    top: calc(var(--cy));
  }
  &-5{
    left: calc(var(--cx) + var(--offset-x));
    top: calc(var(--cy));
  }
  &-6{
    left: calc(var(--cx) - var(--offset-x));
    top: calc(var(--cy) + var(--offset-y));
  }
  &-7{
    left: calc(var(--cx));
    top: calc(var(--cy) + var(--offset-y));
  }
  &-8{
    left: calc(var(--cx) + var(--offset-x));
    top: calc(var(--cy) + var(--offset-y));
  }
}
</style>
