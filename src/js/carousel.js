const carousel = {
  moved: false,
  setItemsElStyle(items, currentItem, itemsEl, wrapperEl, wrapperWidth, itemWidth){
    let isMove = false
    let width = 0
    let l = items.length
    width = `${ items.length * itemWidth }px`
    if(wrapperWidth < parseInt(width)){
      isMove = true
      items.push(...items.slice(0, Math.floor(l / 2)))
      items.unshift(...items.slice(Math.floor(l / 2), l))
      width = `${ items.length * itemWidth }px`
    }
    let currentIndex = Math.floor(l / 2) + items.slice(Math.floor(l / 2), l + Math.floor(l / 2)).findIndex(x => x.product_id == currentItem.product_id)
    let productsWrapper = wrapperWidth
    let left = productsWrapper / 2 - (currentIndex +  0.5) * itemWidth
    itemsEl.style.width = width
    wrapperEl.scrollLeft = -left
    return isMove
  },

  handleMouseDown(event, itemStyle){
    event.preventDefault()
    itemStyle.transition = 'none'
    document.body.style.cursor = 'grab'
    itemStyle.cursor = 'grab'
  },

  handleMouseMove(event, wrapperEl, wrapperWidth, itemsWidth, items, product){
    event.preventDefault()
    carousel.moved = true
    let delta = event.movementX
    carousel.moveProducts(delta, wrapperEl, wrapperWidth, itemsWidth, items, product)
  },

  handleMouseUp(event, itemsStyle){
    document.body.style.cursor = ''
    itemsStyle.transition = ''
    itemsStyle.cursor = ''
    event.preventDefault()
  },

  moveProducts(delta, wrapperEl, wrapperWidth, itemsWidth, items, product){
    let left
    if(wrapperEl.scrollLeft){
      left = -wrapperEl.scrollLeft + delta * 2
    } else {
      left = delta
    }
    if(parseInt(left) > 0) left = 0
    if(parseInt(left) < (wrapperWidth - itemsWidth)) left = wrapperWidth - itemsWidth
    let productLength = 0
    if(product) productLength = product.offsetWidth
    let l = items.length / 2
    let edgeLeft = -(productLength * Math.ceil(l/2) -
                    parseInt(productLength * 0.75))
    let edgeRight = -(productLength * Math.ceil(l/2) +
                    parseInt(productLength * 0.75 - wrapperWidth) +
                    productLength * l)
    if(edgeRight && left < edgeRight){
      items.push(items.shift())
      left += productLength
    } else if(edgeLeft && left > edgeLeft){
      items.unshift(items.pop())
      left -= productLength
    }
    wrapperEl.scrollLeft = -left
  },
}

export default carousel
