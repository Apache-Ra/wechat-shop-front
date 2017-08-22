define([ 'activity/activity', 'util/domUtil', 'util/format', 'util/util',
        'util/scrollUtil', 'util/storageUtil'],
function(Activity, domUtil, format, util, scrollUtil, storageUtil) {

  var PAGE_DATA_COUNT = 10;
  var OFFSET = 0;
  var STORE_URL = "store/view/near";

  var TerminalStoreList = function() {
    Activity.call(this);
  };

  Activity.inheritedBy(TerminalStoreList);

  TerminalStoreList.prototype.onCreate = function() {
	  var me = this;
	  me.bindNavEvents();
  };
  TerminalStoreList.prototype.bindNavEvents = function() {
	    var navBar = this.find('.m_tab_nav');
	    this.tabs = navBar.children();
	    var navContent = this.find('.m_tab_content');
	    this.filters = navContent.children();
	    this.tabControl(this.tabs, this.filters, true);
	  };

  TerminalStoreList.prototype.checkNextPage = function(info) {
    if (!info.data || info.pageInfo.limit > info.data.length) {
      this.dataPara.hasNext = false;
    } else {
      this.dataPara.hasNext = true;
      OFFSET = OFFSET + PAGE_DATA_COUNT;
    }
  };

  TerminalStoreList.prototype.show = function() {
    var me = this;
    this.toolbar.addRightButton([{
      cssClass: 'm-icon-position',
//      activityId: 'storeMap',
      callback: function() {
        me.openMap();
      }
    }]);
    this.checkConditions_();
  };
  
  TerminalStoreList.prototype.openMap = function() {
    this.moveTo("storeMapAll", {storeUrl: STORE_URL});
  };

  TerminalStoreList.prototype.checkConditions_ = function() {
    var me = this;
    storageUtil.getParam("terminalStoreList").then(function(para) {
      para = para || {};
      me.dataPara = {};
      var dataPara = me.dataPara;

      me.clearList();
      if (para.keywords) {
        me.getTerminalStoreList(null, null, null, dataPara.keywords_ = para.keywords);
      } else if (para.category2Id) {
        dataPara.categoryData_ = {
          category2Id : para.category2Id
        }
        me.getTerminalStoreList(dataPara.categoryData_);
        $('ul[name=category2Container] li.current').removeClass(
            "current");
        $('li[category2id=' + para.category2Id + ']').addClass(
            "current");
      } else {
        me.getTerminalStoreList();
      }
    });
  };

  TerminalStoreList.prototype.tabControl = function(tabs, contents,
      opt_switchable) {
	  var me = this;
    tabs.each(function(index) {
      var tab = $(this);
      var content = contents.eq(index);
      tab.click(function() {   	  
    	  if(!$(this).hasClass('current')){ 
    		  OFFSET = 0;
    		  me.clearList();
    		  tab.addClass('current').siblings(".current").removeClass('current');
    		  if($(this).hasClass('by_near')){
    			  STORE_URL = "store/view/near";
    		  }else if($(this).hasClass('by_score')){
    			  STORE_URL = "store/view/score";
    		  }
    		  me.getTerminalStoreList();
    	  }
      });
    });
  };

  TerminalStoreList.prototype.tabCollapse = function() {
    this.find(".m_tab_nav li.current").removeClass('current');
    this.find(".m_tab_content > li").hide();
  };

  TerminalStoreList.prototype.SORT_TYPE = [ {
    'label' : '默认排序',
    'key' : ''
  }, {
    'label' : '价格从低到高',
    'key' : 'salePrice:asc'
  }, {
    'label' : '服务店最近',
    'key' : ''
  }, {
    'label' : '好评优先',
    'key' : ''
  } ];

  TerminalStoreList.prototype.bindSortEvents = function() {
    var me = this;
    this.find('[skey]').on(
        "click",
        function() {
          var key = $(this).attr("skey");
          me.tabCollapse();
          me.clearList();
          var dataPara = me.dataPara;
          dataPara.sortType_ = key;
          me.getTerminalStoreList(dataPara.categoryData_, dataPara.sortType_, dataPara.model_, dataPara.keywords_);
        });
  };

  TerminalStoreList.prototype.bindFilterEvents = function() {
    var me = this;
    this.filters.eq(1).find('[cid]').click(
        function() {
          var $type = $(this);
          me.tabCollapse();
          me.clearList();
          var categoryId = $type.attr('cid');
          var categoryName = $type.attr('level');
          if (categoryName && categoryId) {
            var dataPara = me.dataPara;
            dataPara.categoryData_ = {};
            dataPara.categoryData_[categoryName] = categoryId;
            me.getTerminalStoreList(dataPara.categoryData_, dataPara.sortType_,
                dataPara.model_);
          }
        });
  };

  TerminalStoreList.prototype.getTerminalStoreList = function(opt_categoryData, opt_sortType, opt_model, opt_keywords, opt_offset) {
    var me = this;
    var queryData = $.extend(true, {}, opt_categoryData);
    queryData.offset = opt_offset || 0;
    queryData.limit = PAGE_DATA_COUNT;
    var data = {};
    data.offset= OFFSET;
    
    storageUtil.get("LBS")
    .then(function(lbs) {
      if (lbs) {
        data.lat = lbs.latitude;
        data.lng = lbs.longitude;
        data.areaId = lbs.cityId;
      }
      
      util.post(STORE_URL, data).then(function(result) {
        if (result.codeText == "OK") {
          me.onCreateList(result);
        }
      });
    });
  };

  TerminalStoreList.prototype.clearList = function() {
    this.$data['terminal-store-list-container'].dom.empty();
  };

  TerminalStoreList.prototype.onCreateList = function(result) {
    var me = this;
    for ( var k in result.data) {
      var data = result.data[k];
      var $terminalStore = me.$data["terminal-store-item-template"].dom.clone();
      $terminalStore.removeAttr("name");
      
      var $dom = domUtil.getDomByName($terminalStore);
      $dom.companyPicturer.dom.attr("src", format.storeImgUrl(data.defaultCompanyPicture, "300x0"));
      $dom.terminalStoreName.val(data.companyName);
      $dom.distance.val(format.formatDistance(data.distance));
      $dom.phone.val(data.contactCellphone || data.phone);
      $dom.address.val(data.address);

      var $level = $dom.levelIcon.dom;
      $level.removeClass("level0 level1 level2 level3 level4 level5");
      
      var reviewScore = Math.max(data.reviewScore, 0);
      reviewScore = Math.min(reviewScore, 5); 
      var score = String(reviewScore || 0).split(".");
      $level.addClass("level" + (score[0] || 0));
      
      me.$data['terminal-store-list-container'].dom.append($terminalStore);
      me.bindDetail($terminalStore, data);
    }
    
    me.checkNextPage(result);

    // 绑定刷新加载事件
    setTimeout(function() {
      me.bindLoadEvents_();
    }, 500);
  };

  TerminalStoreList.prototype.bindDetail = function($terminalStore, data) {
    var me = this;
    $terminalStore.on('tap',function() {
      storageUtil.getParam("terminalStoreList")
      .then(function(result) {
        me.tabCollapse();
        me.moveTo("storeDetail", {
          companyId : data.companyId,
          moveTo_: result.moveTo_
        });
      });
    });
  };

  TerminalStoreList.prototype.bindLoadEvents_ = function() {
    var me = this;
    if (me.scroller) {
      me.scroller.refresh();
      return;
    }
    var dataPara = me.dataPara;
    var para = {};
    para.pullDownEl = me.$data.m_list_refresh.dom;
    para.pullUpEl = me.$data.m_list_loadmore.dom;
    para.wrapperSelector = me.$data.wrapper.dom[0];
    para.pullDownAction = function() {
    	OFFSET = 0;
      me.clearList();
      me.getTerminalStoreList(dataPara.categoryData_, dataPara.sortType_, dataPara.model_, dataPara.keywords_);
    };
    
    para.pullUpAction = function() {
//    	OFFSET = OFFSET + 1;
      me.getTerminalStoreList(dataPara.categoryData_, dataPara.sortType_, dataPara.model_, dataPara.keywords_, dataPara.offset_);
    };
    para.hasNextCb = function() {
      return me.dataPara.hasNext;
    };
    
    me.scroller = scrollUtil.bind(para);
  };

  TerminalStoreList.prototype.hide = function() {
    var me = this;
    OFFSET = 0;
    me.clearList();
    me.tabCollapse();
    if (me.scroller) {
      me.scroller.unbind();
      me.scroller = null;
    }
  };

  return new TerminalStoreList();
});