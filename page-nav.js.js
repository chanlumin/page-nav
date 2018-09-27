;(function () {
  'use strict';

  if (!Date.now)
      Date.now = function () { return new Date().getTime(); };

  var vendors = ['webkit', 'moz'];
  for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = (window[vp + 'CancelAnimationFrame']
                                 || window[vp + 'CancelRequestAnimationFrame']);
  }
  if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
      || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function (callback) {
          var now = Date.now();
          var nextTime = Math.max(lastTime + 16, now);
          return setTimeout(function () { callback(lastTime = nextTime); },
                            nextTime - now);
      };
      window.cancelAnimationFrame = clearTimeout;
  }
}())
;(function() {
  var slice = Array.prototype.slice
  // 缓动函数
  function ease(x) {
    return Math.sqrt(1 - Math.pow(x - 1, 2));
  }
  /**
   * 获取节点到document.documentElement顶部的g奥都
   * @param {节点} el 
   */
  function getOffsetHeight(el) {
    var offsetTop = el.offsetTop
    while(el.offsetParent) {
      var el = el.offsetParent 
      offsetTop += el.offsetTop
    }
    return offsetTop
  }
  function hasClass(el, className) {
    var reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
    return reg.test(el.className)
  }
  function addClass(el, newClassName) {
    if(hasClass(el, className)) return 
    var className = el.className + ' '+newClassName
    var classStr = className.split(' ').filter(function(el){return el!=""}).join(' ')
    el.className = classStr
  }
  function removeClass(el, className) {
    var index 
    if(!hasClass(el, className)) return 
    var classNames= el.className.split(' ').filter(function(el){return el!=""})
    if((index = classNames.indexOf(className)) > -1) {
      classNames.splice(index, 1)
    }
    el.className =  classNames.join(' ')
  }
  var PageNav = function(el, options) {
    // 初始化参数
    function noop() {}
    this.els = typeof el === 'string' ? document.querySelectorAll(el+ ' a') : el // 保存节点
    this.offset = options.offset || 0  //  hash值移动的增减偏移量
    this.time = options.time || 600 // 动画时间 默认600ms
    this._hashHeight = {} // 初始化就来hash值的高度
    this.threshold = options.threshold || 120 // 距离顶部多少距离就切换class
    this.activeClass = options.activeClass || 'navActive' // active样式
    this.complete =  options.complete || noop  // 移动执行完毕的回调函数
    this.beforeStart = options.beforeStart || noop
    

    this._getHashHeight(this.els)
    var self = this
    if(this.els.length) {
      for(var elIndex = 0; elIndex < this.els.length; elIndex++) {
        this.els[elIndex].addEventListener('click', function(e){
         e.preventDefault()
         // 获取hash值 
        //  console.log(e.target.hash,e.target, e.target, e.target.getBoundingClientRect())
         var value = e.target.hash && e.target.hash.slice(1)
         self._to(value,self.time,self.offset,ease,self.complete)
        })
      }
    }
    window.addEventListener('scroll', function(e) {
      //  1. 获取文档offsetTop (
      // ?e.target.documentElement.scrollTop : e.target.scrollingElement.scrollTop
      var scrollTop =   e.target.documentElement.scrollTop 
      var hashHeight = self._hashHeight
      for(key in hashHeight) {
        if(hashHeight[key] - scrollTop < self.threshold && hashHeight[key] - scrollTop >= 0) {
         self._toggleClass(key)
        }
      }
    })

    window.addEventListener('resize',function(e) {
      self._getHashHeight(self.els)
    })
  
  }

  PageNav.prototype = {
    _getHashHeight: function(elements) {
      if(!elements.length) throw new Error('没有传入 选择器类名')
      for(var i = 0; i < elements.length; i++) {
        var elementsId = elements[i].hash.slice(1)// #home
        var mapDOM = document.getElementById(elementsId)
        mapDOM && (this._hashHeight[elementsId] = getOffsetHeight(mapDOM))
        // {home: 0, service: 1230}
      }
    },
    /**
     * 执行动画 默认欢动函数为ease
     */
    _to: function(value, time, offset, ease, onEnd) {
      var el = document.documentElement
      var beginScrollTop = el.scrollTop
      var destinationPos = this._hashHeight[value]
      var beginTime = Date.now()
      var distanceDiff = destinationPos - el.scrollTop - offset  
      // console.log(el.scrollTop, destinationPos, beginTime,distanceDiff, time)
      var self = this
      var toTick = function() {

        var timeDiff = Date.now() - beginTime // 610ms
        if(timeDiff >= time) {
          onEnd && onEnd.call(self, value)
          return
        }
        // self.onchage && self.onchage()
        el.scrollTop = distanceDiff * ease(timeDiff/time) + beginScrollTop    
        self.tickID = requestAnimationFrame(toTick)
      }
      toTick()
    },
    /**
     * 判断移动方向
     */
    _cross: function(defaultPos, destinationPos) {
        return destinationPos - defaultPos > 0 ? 1 : -1
    },
    _toggleClass: function(hash) {
      var self = this
      console.log(this.els)
      // console.log(hash, 'hash+type', typeof(hash) Fix IE
      for(var i = 0; i < this.els.length; i++) {
        var el = this.els[i]
        if(el.hash && el.hash.slice(1) == hash) {
          // console.log(hash,self.activeClass)
          if(!hasClass(el, self.activeClass)) {
            addClass(el,self.activeClass)
          }
        } else {
          if(hasClass(el, self.activeClass)) {
            removeClass(el, self.activeClass)
          }
        }
      }
      // this.els.forEach(function(el) {
      //   if(el.hash && el.hash.slice(1) == hash) {
      //     // console.log(hash,self.activeClass)
      //     if(!hasClass(el, self.activeClass)) {
      //       addClass(el,self.activeClass)
      //     }
      //   } else {
      //     if(hasClass(el, self.activeClass)) {
      //       removeClass(el, self.activeClass)
      //     }
      //   }
      // })
    }
  }
  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = PageNav;
  } else {
    window.PageNav = PageNav;
  }
})()

var options = {
  offset:70 ,// 减少的偏移量
  complete: function(value) {
    console.log(value)
    console.log('已经完成了')
  }
}
window.page = new PageNav('.nav',options)