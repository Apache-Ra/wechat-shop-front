define(['util/domUtil'], function( domUtil) {

  var imgSlider = {
      bind: function($dom) {
        var me = this;
        this.unbind($dom);
        var $imgs = $dom.find(".m-slider-content");
        var $indict = $dom.find(".m-slider-indicators");
        var width = $dom.width();
        $imgs.css("left", "0px");
        $indict.find("span.current").removeClass("current");
        $indict.find("span:first-child").addClass("current");
//        $dom.bind("swipeleft", function() {
//          me.slidLeft($dom);
//        });
//        
//        $dom.bind("swiperight", function() {
//          me.slidRight($dom);
//        });
//        
        if ($indict.find("span").length > 1) {
          var handle = setInterval(function() {
            if (!me.slidLeft($dom)) {
              me.slidBack($dom);
            }
          }, 3000);
        }
        
        $dom.data("time-handle", handle);
      },
      slidBack: function($dom) {
        var $imgs = $dom.find(".m-slider-content");
        var $indict = $dom.find(".m-slider-indicators");
        $imgs.animate({left: '0px'}, 600); 
        $indict.find("span.current").removeClass("current");
        $indict.find("span:first-child").addClass("current");
      },
      slidLeft: function($dom) {
        var $imgs = $dom.find(".m-slider-content");
        var $indict = $dom.find(".m-slider-indicators");
        var width = $dom.width();
        var $current = $indict.find("span.current");
        var left = domUtil.getPosition($imgs, "left");
        var $next = $current.next();
        if ($next.length > 0) {
          $current.removeClass("current");
          $next.addClass("current");
          $imgs.animate({left:'-=' + width + 'px'}, 600); 
          return true;
        } else {
          return false;
        }
      },
      slidRight: function($dom) {
        var $imgs = $dom.find(".m-slider-content");
        var $indict = $dom.find(".m-slider-indicators");
        var width = $dom.width();
        var $current = $indict.find("span.current");
        var left = domUtil.getPosition($imgs, "left");
        var $prev = $current.prev();
        if ($prev.length > 0) {
          $current.removeClass("current");
          $prev.addClass("current");
          $imgs.animate({left:'+=' + width + 'px'}, 600); 
          $imgs.css("left", (left + width) + "px");
          return true;
        } else {
          return false;
        }
      },
      unbind: function($dom) {
        var handle = $dom.data("time-handle");
        if (handle) {
          clearInterval(handle);
          $dom.removeData("time-handle");
        }
//        $dom.unbind("swipeleft");
//        $dom.unbind("swiperight");
      }
  };
  return imgSlider;
});
