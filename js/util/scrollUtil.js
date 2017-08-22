define(['util/util', 'iscroll'],
  function( util) {
  
  function touchMoveListener(e) {
    e.preventDefault();
  }
  
  var scrollUtil = {
      option: {}
  };
  
  var defaultOption = {
    para: null,
    wrapperSelector: "",
    hasNextCb: null,
    content: {
      refresh: '松开刷新',
      beforeRefresh: '上拉刷新',
      load: '松开加载更多',
      beforeLoad: '准备加载'
    },
    setting : {
      probeType : 2,
      tap : true,
//      click : true,
      mouseWheel : false,
      scrollbars : true,
      useTransition: false,
      useTransform: true,
      momentum: true,
      keyBindings : false,
      fadeScrollbars : true,
      interactiveScrollbars : true,
      startY : 0
    }
  };
  
  scrollUtil.bind = function(option) {
    var util = $.extend(true, {}, this);
    util.bind_(option);
    return util;
  };

  scrollUtil.refresh = function() {
    var para = this.option;
    if (para.wrapperScroll) {
      para.pullDownEl && para.pullDownEl.removeClass("flip load loading");
      para.pullUpEl && para.pullUpEl.removeClass("flip load loading");
      para.wrapperScroll.refresh();
      return;
    }
  };
  
  scrollUtil.bind_ = function(option) {
    var me = this;
    option = option || {};
    option.setting = option.setting || {};
    this.option = $.extend(true, {}, defaultOption, option || {});
    if (option.content) {
      this.option.content = option.content;
    }
    
    if (typeof option.setting.click == 'undefined') {
      var isMobile = {};
      if (navigator.userAgent.match(/Android/i)) {
        isMobile.Android = true;
      }

      // [ ! ] Important Note: if click:true then on Android > 4.0 (but
      // < 4.4) the onclick is fired twice.
      // So we must use click:false, however that does NOT affect
      // functionality when using the actual mobile device.
      this.option.setting.click = (isMobile.Android && parseFloat(navigator.userAgent.match(/Android [\d+\.]{3,5}/)[0].replace('Android ', '')) < 4.4 ? false : true);
    }
    
    me.createScroll(this.option);
  };
  
  scrollUtil.createScroll = function(para) {
    var me = this;
    var strs = me.option.content;
    para.wrapperScroll = new IScroll(para.wrapperSelector, para.setting);
    
    para.onScroll = function() {
      if (this.y >= 25 && para.pullDownEl) {
        para.pullDownEl.addClass("flip");
        if (this.y >= 35) {
          para.pullDownEl.addClass("load");
          strs.refresh && para.pullDownEl.children().html(strs.refresh);
        } else {
          para.pullDownEl.removeClass("load");
          strs.beforeRefresh && para.pullDownEl.children().html(strs.beforeRefresh);
        }
      } else {
        para.pullDownEl && para.pullDownEl.removeClass("flip load");
      }
  
      if ((!para.hasNextCb || para.hasNextCb()) && para.pullUpEl) {
        if (this.y <= (this.maxScrollY - 25)) {
          para.pullUpEl.addClass("flip");
          if (this.y <= (this.maxScrollY - 35)) {
            para.pullUpEl.addClass("load");
            strs.load && para.pullUpEl.children().html(strs.load);
          } else {
            para.pullUpEl.removeClass("load");
            strs.beforeLoad && para.pullUpEl.children().html(strs.beforeLoad);
          }
        } else {
          para.pullUpEl.removeClass("flip load");
        }
      }
    };
    
    para.onScrollEnd = function() {
      if (para.pullDownEl) {
        if (para.pullDownEl.hasClass('load') && !para.pullDownEl.hasClass('loading')) {
          para.pullDownEl.addClass('loading');
          para.pullDownAction();
        } else if (para.pullDownEl.hasClass('flip')) {
          para.pullUpEl.removeClass("flip load");
        }
      }
      
      if (para.pullUpEl) {
        if (para.pullUpEl && para.pullUpEl.hasClass('load') && !para.pullUpEl.hasClass('loading')) {
          para.pullUpEl.addClass('loading');
          para.pullUpAction();
        } else if (para.pullUpEl.hasClass('flip')) {
          para.pullUpEl.removeClass("flip load");
        }
      }
    };
    
    para.wrapperScroll.on('scroll', para.onScroll);
    para.wrapperScroll.on('scrollEnd', para.onScrollEnd);
    
    document.addEventListener('touchmove', touchMoveListener, false);
  };

  scrollUtil.releaseEvent = function() {
    this.option.wrapperScroll.off('scroll', this.option.onScroll);
    this.option.wrapperScroll.off('scrollEnd', this.option.onScrollEnd);
  };

  scrollUtil.unbind = function() {
    var me = this;
    setTimeout(function() {
      var para = me.option;
      if (para.wrapperScroll) {
        document.removeEventListener('touchmove', touchMoveListener, false);
        $(para.wrapperScroll.scroller).attr('style', '');
        para.wrapperScroll.destroy();
      }
      
      me.option = {};
    }, 500);
  };
  
  return scrollUtil;
});