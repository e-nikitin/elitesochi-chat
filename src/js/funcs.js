let funcs = {
  isElementInViewport(el) {
    var rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document. documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document. documentElement.clientWidth) &&
      (rect.width > 0 || rect.hight > 0)
    );
  },
  degFromSides(leg, hypotenuse){
    let sin = leg / hypotenuse
    if(!Math.asin(sin)) console.log(leg, '  ', hypotenuse, '  ', sin)
    let result = ((Math.asin(sin)) / Math.PI) * 180
    return result
  },
  clone(obj){
    var newObj = (obj instanceof Array) ? [] : {};
    for (let i in obj) {
      if (i == 'clone') continue;
      if (obj[i] && typeof obj[i] == "object") {
        newObj[i] = funcs.clone(obj[i]);
      } else newObj[i] = obj[i]
    }
    return newObj;
  },
  getURLParam(param){
    let search = window.location.search
    let str = param + '='
    let strLen = str.length + 1
    let start = search.indexOf('?' + str)
    if(start == -1) start = search.indexOf('&' + str)
    if(start > -1){
      let end = search.indexOf('&', start + strLen)
      if(end > -1) return search.substr(start + strLen, end - start - strLen)
      else return search.substr(start + strLen, search.length - start - strLen)
    }
    return ''
  },
  getEventPath(el, arr){
    arr = arr ? [...arr, el] : [el]
    if(el.parentNode){
      return this.getEventPath(el.parentNode, arr)
    }
    return arr
  },
  get(self, link){
    return new Promise(resolve => {
      self.axios
      .get(link)
      .then(response => resolve(response))
      .catch(errors => resolve(errors.response))
    })
  },
  post(self, link, data){
    return new Promise(resolve => {
      self.axios
      .post(link, data)
      .then(response => resolve(response))
      .catch(errors => resolve(errors.response))
    })
  },
  number(priceVar){
    return priceVar != null && priceVar != 0 ? parseInt(priceVar).toLocaleString('ru-RU', { minimumFractionDigits: 0 }) : ''
  },
  price(priceVar){
    return priceVar != null ? parseInt(priceVar).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }) : ''
  },
  m2(m2Var){
    return m2Var != null ? parseInt(m2Var).toLocaleString('ru-RU', { minimumFractionDigits: 0 }) + ' м²' : ''
  },
}

export default funcs
