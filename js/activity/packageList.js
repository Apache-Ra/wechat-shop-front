define(['activity/activity', 'util/util', 'util/storageUtil', 'util/format', 'util/domUtil', 'core/navigation', 'widget/toolbar'],
    function(Activity, util, storageUtil, format, domUtil, navigation, toolbar) {

  var PAGE_DATA_COUNT = 3;
  
  var PackageList = function(){
    Activity.call(this);
  };
  
  Activity.inheritedBy(PackageList);
  
  /**
   * 页面第一次创建执行
   * 这里绑定唯一事件，加载唯一数据
   */
  PackageList.prototype.onCreate = function() {
  };

  /**
   * 加载动态数据，刷新标题等
   */
  PackageList.prototype.show = function() {
    var me = this;
    me.toolbar.addRightButton([{
      caption: "跳过",
      callback:function(){
        me.moveTo('productList', {
        	productType : 'product',
        	packageId: 0
        	}, {
          transition : 'slide'
        });
      }
    }]);
    
    setTimeout(function() {
      me.bind();
    }, 1000);
  };

  PackageList.prototype.bind = function() {
  	var me = this;
  	var $dom = me.container_.find(".m-h-slider");
    this.unbind();
    var $imgs = $dom.find(".m-h-slider-content");
    var height = $(".m-h-slider").height();
    $dom.on("swipeup", function() {
      me.moveUp($imgs, height);
    });
    
    $dom.on("swipedown", function() {
      me.moveDown($imgs, height);
    });
    
    $dom.find(".slideUp").on("tap", function() {
      me.moveDown($imgs, height);
    });
    
    $dom.find(".slideDown").on("tap", function() {
      me.moveUp($imgs, height);
    });
    
    $imgs.find("i").on("tap", function() {
      var packageId = $(this).attr("packageId");
      me.moveTo('productList', {
    	  productType : 'product',
        packageId : packageId
      }, {
        transition : 'slide'
      });
    });
  };

  PackageList.prototype.animate = function($a, $b) {
    var me = this;
    var $dom = me.container_.find(".m-h-slider");
    $a.removeClass("current").addClass("back");
    $b.addClass("current");
    me.unbind();
    $b.animate({top:"0px"}, 300, null, function() {
      $a.removeClass("back");
      me.bind();
    });
  };
  
  PackageList.prototype.moveUp = function($imgs, height) {
    var me = this;
    var $current = $imgs.find("li.current");
    if ($current.length == 0) {
      $current = $($imgs.find("li")[0]);
    }
    var $next = $current.next();
    if ($next.length > 0) {
      $next.css("top", height + "px");
      me.animate($current, $next);
      me.renderUpDown($next);
    }
  };
  
  PackageList.prototype.moveDown = function($imgs, height) {
    var me = this;
    var $current = $imgs.find("li.current");
    if ($current.length == 0) {
      $current = $($imgs.find("li")[0]);
    }
    var $prev = $current.prev();
    if ($prev.length > 0) {
      $prev.css("top", (-1 * height) + "px");
      me.animate($current, $prev);
      me.renderUpDown($prev);
    }
  };
  
  PackageList.prototype.renderUpDown = function($current) {
    var me = this;
    if ($current.next().length > 0) {
      me.container_.find(".m-h-slider .slideDown").show();
    } else {
      me.container_.find(".m-h-slider .slideDown").hide();
    }

    if ($current.prev().length > 0) {
      me.container_.find(".m-h-slider .slideUp").show();
    } else {
      me.container_.find(".m-h-slider .slideUp").hide();
    }
  };
  
  PackageList.prototype.unbind = function() {
    var me = this;
    var $dom = me.container_.find(".m-h-slider");
    $dom.off("swipeup");
    
    $dom.off("swipedown");
    
    $dom.find(".slideUp").off("tap");
    
    $dom.find(".slideDown").off("tap");

    var $imgs = $dom.find(".m-h-slider-content");
    $imgs.find("i").off("tap");
  };
  
  PackageList.prototype.hide = function(event, ui) {
    var me = this;
    me.unbind();
  };
  
  return new PackageList();
});