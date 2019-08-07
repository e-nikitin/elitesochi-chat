<template>
  <div ref="main" v-if="showHints" class="tourhints">
    <div class="tourhints__bg"></div>
    <div ref="text" class="tourhints__text">{{ text }}
      <div v-if="showNext" @click="next()" role="button" tabindex="0" class="tourhints__button tourhints__button--next">{{ nextButtonName }}</div>
      <div v-if="showPrev" @click="prev()" role="button" tabindex="0" class="tourhints__button tourhints__button--prev">Назад</div>
    </div>
    <div v-for="(arrow, index) in arrowsParams" :key="index" :style="arrowStyle(arrow)" :class="arrowClass(arrow)" class="tourhints__arrow"></div>
    <div v-if="showSkip" @click="skip()" role="button" tabindex="0" class="tourhints__button tourhints__button--skip"></div>
  </div>
</template>

<script>
import funcs from '@/js/funcs.js'
import chat from '@/js/chat.js'

export default {
  name: 'CTourHints',
  props: {
    steps: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      currentElements: [],
      showHints: false,
      currentStep: 0,
      arrowsParams: [],
    };
  },
  computed:{
    text(){
      return this.steps[this.currentStep] && this.steps[this.currentStep].text ? this.steps[this.currentStep].text : ''
    },
    nextButtonName(){
      return this.currentStep < this.steps.length - 1 ? 'Далее' : 'Закончить'
    },
    showNext(){
      return true
    },
    showPrev(){
      return this.currentStep > 0
    },
    showSkip(){
      return true
    }
  },
  methods: {
    async run(){
      if(!this.steps.length) return
      this.currentStep = 0
      chat.setFixedPosition(document.getElementById('site-content'))
      chat.setOverflow(document.getElementsByTagName('body')[0], 'hidden')
      chat.setFixedPosition()
      await this.setStep()
    },
    next(){
      this.dropStep()
      this.currentStep++
      if(this.currentStep < this.steps.length){
        this.setStep()
      } else {
        chat.setOverflow(document.getElementsByTagName("body")[0], "");
        chat.unsetFixedPosition(document.getElementById("site-content"));
        this.$emit('end')
        this.showHints = false
      }
    },
    prev(){
      this.dropStep()
      this.currentStep--
      if(this.currentStep < 0){
        this.showHints = false
      } else this.setStep()
    },
    skip(){
      this.dropStep()
      chat.setOverflow(document.getElementsByTagName("body")[0], "");
      chat.unsetFixedPosition(document.getElementById("site-content"));
      this.$emit('end')
      this.showHints = false
      this.currentStep = -1
    },
    async setStep(step){
      step = step ? step : this.currentStep
      this.currentStep = step
      await (this.showHints = true)
      this.currentElements = this.getEls(this.steps[step])
      this.currentElements = await this.setHints(this.currentElements)
      if(this.currentElements.length == 0){
        this.next()
        return
      }
      await this.setTextLocation(this.currentElements)
      await this.setArrows(this.currentElements)
    },
    dropStep(){
      this.currentElements.forEach(el => el.parentNode.removeChild(el))
      this.arrowsParams = []
      this.$refs.text.style.left = ''
      this.$refs.text.style.top = ''
    },
    async setTextLocation(els){
      let params = els.map(el => this.setTextParams(el))
      let resultParams = { top: 0, left: 0 }
      params.forEach(param => {
        resultParams.left = resultParams.left + param.left
        resultParams.top = resultParams.top + param.top
      })
      resultParams.left = resultParams.left / params.length
      resultParams.top = resultParams.top / params.length
      this.$refs.text.style.left = resultParams.left + 'px'
      this.$refs.text.style.top = resultParams.top + 'px'
    },
    setHints(els){
      let self = this
      return els.map(el => this.setHint(el))
    },
    setHint(elNative){
      if(!elNative) return
      let el = elNative.cloneNode(true)
      let dataset = Object.keys(this.$refs.main.dataset)
      el.classList.add('tourhints__el')
      el.style.setProperty('--width', elNative.getBoundingClientRect().width + 'px')
      el.style.setProperty('--height', elNative.getBoundingClientRect().height + 'px')
      el.style.top = `${elNative.getBoundingClientRect().top}px`
      el.style.left = `${elNative.getBoundingClientRect().left}px`
      dataset.forEach(d => el.dataset[d] = '')
      this.$refs.main.appendChild(el)
      return el
    },
    getEls(step){
      let result = []
      let el = null
      let classes = []
      if(step.class) {
        let i = 0
        classes = document.getElementsByClassName(step.class)
        do{
          el = classes[i]
          i++
        } while ((!el || !funcs.isElementInViewport(el)) && i < classes.length)
        if(el && funcs.isElementInViewport(el)) result.push(el)
        else console.error(`CTourHint: can not find element in viewport (class = ${step.class})`)
      }
      if(step.classes && step.classes.length > 0){
        step.classes.forEach(_class => {
          classes = document.getElementsByClassName(_class)
          let i = 0
          do{
            el = classes[i]
            i++
          } while ((!el || !funcs.isElementInViewport(el)) && i < classes.length)
          if(el && funcs.isElementInViewport(el)) result.push(el)
          else console.error(`CTourHint: can not find element in viewport (in classes class = ${_class})`)
        })
      }
      if(step.id) {
        el = document.getElementById(step.id)
        if(el && funcs.isElementInViewport(el)) result.push(el)
        else console.error(`CTourHint: can not find element in viewport (id = ${step.id})`)
      }
      if(step.ids && step.ids.length > 0){
        step.ids.forEach(id => {
          el = document.getElementById(id)
          if(el && funcs.isElementInViewport(el)) result.push(el)
          else console.error(`CTourHint: can not find element in viewport (in ids id = ${id})`)
        })
      }
      if(step.el && funcs.isElementInViewport(el)) result.push(step.el)
      else console.error('CTourHint: can not find element in viewport el = ', step.el)
      if(step.els && step.els.length > 0){
        step.els.forEach(_el => {
          if(_el && funcs.isElementInViewport(el)) result.push(_el)
          else console.error('CTourHint: can not find element in viewport in els el = ', _el)
        })
      }
      return result
    },
    setTextParams(el){
      let text = this.$refs.text
      let elRect = el.getBoundingClientRect()
      let elCX = elRect.left + elRect.width / 2
      let elCY = elRect.top + elRect.height / 2
      let textRect = text.getBoundingClientRect()
      let top = 0
      let left = 0
      let offsetX = 200
      let offsetY = 300
      let offsetSide = 20
      if(elCY > window.innerHeight / 2){
        top = elCY - textRect.height / 2 - offsetY
        top = top < 0 ? 0 + offsetSide : top
      } else {
        top = elCY - elRect.height / 2 + offsetY
        top = top + textRect.height > window.innerHeight ? window.innerHeight - textRect.height - offsetSide : top
      }
      if(elCX > window.innerWidth / 2){
        left = elCX - textRect.width / 2 - offsetX
        left = left < 0 ? 0 + offsetSide : left
      } else {
        left = elCX - textRect.width / 2 + offsetX
        left = left + textRect.width > window.innerWidth ? window.innerWidth - textRect.width - offsetSide : left
      }
      return {top: top, left: left + 60}
    },
    setArrows(els){
      let result = []
      result = els.map(el => this.setArrow(el, this.$refs.text))
      this.arrowsParams = result
    },
    setArrow(el, text){
      let elRect = el.getBoundingClientRect()
      let textRect = text.getBoundingClientRect()
      let elCX = elRect.left + elRect.width / 2
      let elCY = elRect.top + elRect.height / 2
      let textCX = textRect.left + textRect.width / 2
      let textCY = textRect.top + textRect.height / 2
      let offsetDefine = 0
      let offsetDraw = 30
      let arrowSize = 30
      let result = {}
      // class is location of element in depends of text
      if(elCY < textRect.top - offsetDefine){
        if(elCX < textRect.left - offsetDefine){
          result.left = elRect.right + arrowSize + offsetDraw
          result.top = elCY
          result.width = textCX - elCX - arrowSize - offsetDraw - elRect.width / 2
          result.height = textCY - elCY - offsetDraw
          result.class = 'top-left'
        } else if(elCX > textRect.left + textRect.width + offsetDefine){
          result.left = textCX
          result.top = elCY
          result.width = elRect.left - textCX - arrowSize - offsetDraw
          result.height = textCY - elCY - offsetDraw
          result.class = 'top-right'
        } else {
          result.left = (elCX + textCX) / 2
          result.top = elRect.bottom + arrowSize + offsetDraw
          result.width = 3
          result.height = Math.sqrt(((textRect.top - elRect.bottom) ** 2) + ((elCX - textCX) ** 2))
          result.rotateDegree = funcs.degFromSides((elCX - textCX), result.height)
          result.height = result.height - offsetDraw - offsetDraw - arrowSize
          result.class = 'top'
        }
      } else if(elCY > textRect.top + textRect.height + offsetDefine){
        if(elCX < textRect.left - offsetDefine){
          result.left = elCX
          result.top = textCY
          result.width = textRect.left - elCX - arrowSize - offsetDraw
          result.height = elRect.top - arrowSize - offsetDraw - textCY
          result.class = 'bottom-left'
        } else if(elCX > textRect.left + textRect.width + offsetDefine){
          result.left = textRect.right + offsetDraw
          result.top = textCY
          result.width = elCX - textRect.right - offsetDraw
          result.height = elRect.top - textCY - arrowSize - offsetDraw
          result.class = 'bottom-right'
        } else {
          result.left = (textCX + elCX) / 2
          result.top = textRect.bottom
          result.width = 3
          result.height = Math.sqrt(((elCX - textCX) ** 2) + ((elRect.top - textRect.bottom) ** 2))
          result.rotateDegree = -funcs.degFromSides((elCX - textCX), result.height)
          result.height = result.height - offsetDraw - offsetDraw - arrowSize
          result.top = result.top + offsetDraw
          result.class = 'bottom'
        }
      } else {
        if(elCX < textRect.left - offsetDefine){
          result.left = elRect.right
          result.top = (textCY + elCY) / 2
          result.width = Math.sqrt(((elCY - textCY) ** 2) + ((textRect.left - elRect.right) ** 2))
          result.height = 3
          result.rotateDegree = -funcs.degFromSides((elCY - textCY), result.width)
          result.width = result.width - offsetDraw - offsetDraw - arrowSize
          result.left = result.left + offsetDraw + arrowSize
          result.class = 'left'
        } else if(elCX > textRect.left + textRect.width + offsetDefine){
          result.left = textRect.right
          result.top = (textCY + elCY) / 2
          result.width = Math.sqrt(((elCY - textCY) ** 2) + ((elRect.left - textRect.right) ** 2))
          result.height = 3
          result.rotateDegree = funcs.degFromSides((elCY - textCY), result.width)
          result.width = result.width - offsetDraw - offsetDraw - arrowSize
          result.left = result.left + arrowSize
          result.class = 'right'
        }
      }
      return result
    },
    arrowStyle(arrow){
      let result = {}
      result.left = arrow.left + 'px'
      result.top = arrow.top + 'px'
      result.width = arrow.width + 'px'
      result.height = arrow.height + 'px'
      if(arrow.rotateDegree) result.transform = `rotate(${arrow.rotateDegree}deg)`
      return result
    },
    arrowClass(arrow){
      return `tourhints__arrow--${ arrow.class }`
    }
  }
};
</script>

<style scoped lang="scss" src="@/styles/CTourHints.scss">

</style>
