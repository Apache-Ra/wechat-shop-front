define([ 'util/util', 'manifest', 'core/navigation' ],
    		function( util, manifest, navigation) {

	var toolbar = {
	};
	
	/**
	 * 初始化
	 */
	toolbar.init = function() {
    	// 初始化header footer
		this.$header = $( "[data-role='header']" );
		this.$footer = $( "[data-role='footer']" );
		this.$header.toolbar();
		this.$footer.toolbar({transition: "none"});
    this.bindFooterEvent_();
	};
	
	/**
	 * 切换footer显隐
	 */
	toolbar.switchFooter = function(show) {
    this.$footer.toolbar(show);
    if (show == "hide") {
      this.$footer.toolbar({fullscreen: true});
    } else {
      this.$footer.toolbar({fullscreen: false});
    }
	};
	
	/**
	 * 根据配置刷新header/footer
	 */
	toolbar.refresh = function(activityId) {
	  this.removeRightHeaderBtns();
	  this.removeLeftHeaderBtns();
	  if (!activityId) {
	    var para = util.getUrlParam();
	    activityId = para.page;
	  }
	  var config = manifest.application.activity.getActivityById(activityId);
	  if (!config) {
	    return;
	  }
	  var toolbar = config.toolbar || {};
	  if (toolbar.footer && toolbar.footer.show) {
	    this.$footer.find(".m-footer-icon.active").removeClass("active");
	    if (toolbar.footer.activityId) {
	      this.$footer.find("[activityId=" + toolbar.footer.activityId + "] i").addClass("active");
	    }
	    this.switchFooter("show");
	  } else {
	    this.switchFooter("hide");
	  }
	  
	  // 切换标题和自定义标题
	  // 当未给出标题的情况，一般是自定义标题，不予刷新/清空操作
    if (toolbar.header && toolbar.header.title) {
      // 如果只有一个title，显示
      if (toolbar.header.title.length == 1) {
        this.$header.find("h1").html(toolbar.header.title[0]);
      }
	  }
	  
	  var $backBtn = this.$header.find("[name=backBtn]");
    $backBtn.off("click");
	  if (toolbar.header && toolbar.header.backBtn) {
	    $backBtn.on("click", function() {
	      navigation.back();
	    });
      $backBtn.removeClass("hide");
	  } else {
	    $backBtn.addClass("hide");
	  }
	};
	
	toolbar.triggerBack = function() {
    var $backBtn = this.$header.find("[name=backBtn]");
    if ($backBtn.is(":visible")) {
      $backBtn.click(); // TODO
      return true;
    } else {
      return false;
    }
	};
	
	/**
	 * 改变header默认动作
	 */
	toolbar.changeBackBtnBehavior = function(callback) {
	  if (callback) {
	    this.addLeftButton({
	      cssClass: "m-icon m-icon-back",
	      callback: callback
	    });
	  }
	};
	
	/**
	 * 移除所有默认按钮
	 */
	toolbar.removeLeftHeaderBtns = function() {
		this.$header.find("[name=headerLeftCtrls]").children().not("[name=backBtn]").remove();
		this.$header.find("[name=backBtn]").removeClass("hide");
	};
  
  /**
   * 移除所有默认按钮
   */
  toolbar.removeRightHeaderBtns = function() {
    this.$header.find("[name=headerRightCtrls]").empty();
  };
  
  /**
   * 增加右侧按钮
   */
  toolbar.addLeftButton = function(setting) {
    this.removeLeftHeaderBtns();
    var headerLeftCtrls = this.$header.find("[name=headerLeftCtrls]");
    headerLeftCtrls.find("[name=backBtn]").addClass("hide");
    return this.addHeaderButton_(setting, headerLeftCtrls);
  };
	
	/**
	 * 增加右侧按钮
	 */
  toolbar.addRightButton = function(setting) {
    this.removeRightHeaderBtns();
    var $headerRightCtrls = this.$header.find("[name=headerRightCtrls]");
    return this.addHeaderButton_(setting, $headerRightCtrls);
  };
  
	toolbar.addHeaderButton_ = function(setting, $container) {
	  if (!setting) {
	    return;
	  }
	  
	  if (!$.isArray(setting)) {
	    setting = [setting];
	  }

    var $eles = [];
	  $(setting).each(function() {
	    var $btn = $('<a href="javascript:void(0)" class="m-header-btn"></a>');
	    $container.append($btn);
	    $eles.push($btn);
	    var data = this;
	    // link
	    if (data.href) {
	      $btn.attr("href", data.href);
	    }
	    
	    if (data.caption) {
	      $btn.html(data.caption);
	    }
	    
	    if (data.cssClass) {
	      var $i = $("<i></i>")
	      $btn.append($i);
	      // css class
	      $i.addClass(data.cssClass);
	    }
	    
	    // callback
	    if (data.callback) {
	      $btn.on("click", data.callback);
	    } else if (data.activityId) {
	      $btn.on("click", function() {
	        navigation.moveTo(data.activityId, data.para)
	      });
	    }
	  });
		
		return $eles;
	};
  
  toolbar.customizeTitle = function(ele) {
	  var $h1 = this.$header.find("h1");
	  $h1.empty();
	  $h1.append(ele);
    return ele;
  };
  
  toolbar.changeTitle = function(title) {
    this.$header.find("h1").html(title);
  };
  
  toolbar.bindFooterEvent_ = function() {
    this.$footer.children().on("click", function() {
      var activityId = $(this).attr("activityId");
      var para = util.getUrlParam();
      if (activityId && activityId != para.page) {

        var stack = $.mobile.navigate.history.stack[$.mobile.navigate.history.activeIndex];
        $.mobile.navigate.history.stack = [];
        $.mobile.navigate.history.stack.push(stack);
        $.mobile.navigate.history.activeIndex = 0;
        
        navigation.moveTo(activityId, null, {transition: "fade"});
      }
    });
  };
	
	return toolbar
});