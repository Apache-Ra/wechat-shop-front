define([ 'activity/activity', 'util/domUtil', 'util/format', 'util/util',
        'util/scrollUtil', 'util/storageUtil'],
function(Activity, domUtil, format, util, scrollUtil, storageUtil) {

  var PAGE_DATA_COUNT = 10;
  var OFFSET = 0;
  var PRODUCTTYPE = 'product'
  var ORDERBY = 'price';
  var PACKAGEID = '';
  var ProductList = function() {
    Activity.call(this);
  };

  Activity.inheritedBy(ProductList);

  ProductList.prototype.onCreate = function() {
    this.renderTabNav();
  };

  ProductList.prototype.checkNextPage = function(info) {
    if (!info.data || info.pageInfo.limit > info.data.length) {
      this.dataPara.hasNext = false;
    } else {
      OFFSET = OFFSET + PAGE_DATA_COUNT;
      this.dataPara.hasNext = true;
    }
  };

  ProductList.prototype.show = function() {
    this.checkConditions_();
  };

  ProductList.prototype.checkConditions_ = function() {
    var me = this;
    storageUtil.getParam("productList").then(function(para) {
      para = para || {};
      if(para.productType){
          PRODUCTTYPE = para.productType; 
          if (para.productType == "product") {
            me.toolbar.changeTitle("产品列表");
          } else {
            me.toolbar.changeTitle("产品列表");
          }
      }
      if(para.packageId){
    	  PACKAGEID = para.packageId;
      } else {
        PACKAGEID = 0;
      }
      me.dataPara = {};
      var dataPara = me.dataPara;

      me.clearList();
      me.getProductList();
    });
  };

  ProductList.prototype.renderTabNav = function() {
    var navBar = this.find('.m_tab_nav');
    this.tabs = navBar.children();
    var navContent = this.find('.m_tab_content');
    this.filters = navContent.children();
    this.tabControl(this.tabs, this.filters, true);
    var classes = this.filters.eq(1);
    var c2s = classes.find('.cate-hd').find('li').slice(1);
    var c3s = classes.find('.cate-bd').find('ul');
    this.tabControl(c2s, c3s);
    c2s.eq(0).click(); // TODO
  };

  ProductList.prototype.tabControl = function(tabs, contents,opt_switchable) {
	  var me = this;
    tabs.each(function(index) {
      var tab = $(this);
      var content = contents.eq(index);
      tab.click(function() {
    	  if(!$(this).hasClass('current')){ 
    		  OFFSET = 0;
    		  me.clearList();
    		  tab.addClass('current').siblings(".current").removeClass('current');
    		  if($(this).hasClass('by_time')){
    			  ORDERBY = 'date';
    		  }else if($(this).hasClass('price')){
    			  ORDERBY = 'price';    			  
    		  };   		  
    		  me.getProductList();
    	  }
      });
    });
  };

  ProductList.prototype.tabCollapse = function() {
    this.find(".m_tab_nav li.current").removeClass('current');
    this.find(".m_tab_content > li").hide();
  };

  ProductList.prototype.getProductList = function(opt_categoryData, opt_sortType, opt_model, opt_keywords, opt_offset) {
    var me = this;
    var queryData = $.extend(true, {}, opt_categoryData);
    queryData.productType = 'PRODUCT';
    queryData.offset = opt_offset || 0;
    queryData.limit = PAGE_DATA_COUNT;
    if (opt_sortType) {
      queryData.sortFields = opt_sortType;
    }

    if (opt_keywords) {
      queryData.keywords = opt_keywords || '';
    }
    var data = {};
    data.offset=OFFSET;
    data.packageId = PACKAGEID;
    util.get('campaign/list').then(function(result) {
      if (result.codeText == "OK") {
        me.onCreateList(result);
      }
    });
  };

  ProductList.prototype.clearList = function() {
    this.$data['product-list-container'].dom.empty();
  };

  ProductList.prototype.onCreateList = function(result) {
    var me = this;
    for ( var k in result.data) {
      var data = result.data[k];
      var $product = me.$data["product-item-template"].dom.clone();
      $product.removeAttr("name");
      $product.find("img").attr("src",format.photoImgUrl(data.imgUrl, "300x0"));
      var $dom = domUtil.getDomByName($product);
      
      $dom.brief.val(format.subStr(data.campaignName,0,18));
      $dom.description.val(format.subStr(data.brief,0,40));

      //var $level = this.$data.reviewScore.dom;

      var reviewScore = Math.max(data.reviewScore, 0);
      reviewScore = Math.min(reviewScore, 5);
      var score = String(reviewScore || 0).split(".");
      //$level.addClass("level" + (score[0] || 0));
      
      if (data.withInstallationPrice) {
        $product.find('.list-item-txt-level .a-right').show();
      }

      me.$data['product-list-container'].dom.append($product);
      me.bindDetail($product, data);
    }
    
    me.checkNextPage(result);

    // 绑定刷新加载事件
    setTimeout(function() {
      me.bindLoadEvents_();
    }, 500);
  };

  ProductList.prototype.bindDetail = function($product, data) {
    var me = this;
    $product.on("tap", function(){
      me.tabCollapse();
      me.moveTo("videoDetail", {
      campaignId : data.campaignId
      }, {
        transition : 'slide'
      });
    });
  };

  ProductList.prototype.bindLoadEvents_ = function() {
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
    //下拉刷新
    para.pullDownAction = function() {
      OFFSET = 0;
      me.clearList();
      me.getProductList();
    };
    //加载更多
    para.pullUpAction = function() {
      me.getProductList(opt_categoryData, opt_sortType, opt_model, opt_keywords,opt_offset);
    };
    para.hasNextCb = function() {
      return me.dataPara.hasNext;
    };
    
    me.scroller = scrollUtil.bind(para);
  };

  ProductList.prototype.hide = function() {
    var me = this;
    me.clearList();
    OFFSET = 0;
    me.tabCollapse();
    if (me.scroller) {
      me.scroller.unbind();
      me.scroller = null;
    }
  };

  return new ProductList();
});