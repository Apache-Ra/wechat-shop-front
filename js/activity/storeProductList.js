define(['activity/activity', 'util/domUtil', 'util/format', 'util/util', 'util/scrollUtil', 'util/storageUtil', 'widget/toolbar'],
    function(Activity, domUtil, format, util, scrollUtil, storageUtil, toolbar) {

  var PAGE_DATA_COUNT = 10;
  
  var ProductList = function(){
    Activity.call(this);
  };
  
  Activity.inheritedBy(ProductList);
  
  ProductList.prototype.onCreate = function() {
  };
  
  ProductList.prototype.checkNextPage = function(info){
    this.dataPara.offset_ = info.offset + PAGE_DATA_COUNT;
    if (!info.data || info.pageInfo.limit > info.data.length) {
      this.dataPara.hasNext = false;
    } else {
      this.dataPara.hasNext = true;
    }
  };

  ProductList.prototype.show = function() {
  	var me = this;
  	me.$data.storeProductDropdown.dom.hide();
    var headerEle = me.$data["searchHeader-template-container"].dom.clone();
  	headerEle.removeAttr("name");
  	toolbar.customizeTitle(headerEle);

  	me.dataPara = {
  	    productType: "NORMAL"
  	};
    
    storageUtil.getParam("storeProductList")
    .then(function(para) {
    	me.companyId = para.companyId;
    });
    
    headerEle.find("[name=productOrservice]").on('tap', function() {
      var dropdown = headerEle.find("[name=storeProductDropdown]");
      if (dropdown.is(":visible")) {
        dropdown.hide();
      } else {
        dropdown.show();
      }
    });

    headerEle.find('[name=storeProductDropdown] div').on('tap', function() {
      var $this = $(this);
      $this.closest("li").hide();
      headerEle.find('span[name=productServiceName]').html($this.html());
      var type = $this.attr("type");
      if (type != me.dataPara.productType) {
        me.dataPara.productType = type;
        me.dataPara.offset_ = 0;
        me.clearList();
        me.getProductList();
      }
    });
    
    me.getProductList();
  };

  ProductList.prototype.getProductList = function(opt_offset) {
    var me = this;
    var queryData = {};
    queryData.productType = me.dataPara.productType;
    queryData.offset = opt_offset || 0;
    queryData.extId = me.companyId;
    queryData.extType = 'TERMINAL_STORE';
    queryData.limit = PAGE_DATA_COUNT;
    util.get('mobile/product/search', queryData)
    .then(function(result) {
      if (result.code == 200) {
        me.onCreateList(result);
      }
    });
  };

  ProductList.prototype.clearList = function() {
    this.$data['product-list-container'].dom.empty();
  };

  ProductList.prototype.onCreateList = function(result){
    var me = this;
    for (var k in result.data) {
      var data = result.data[k];
      var $product = me.$data["product-item-template"].dom.clone();
      $product.removeAttr("name");
      $product.find("img").attr("src", format.photoImgUrl(data.productImage, "300x0"));
      var $dom = domUtil.getDomByName($product);
      if(data.isForAll !== 0) {
        $dom.isForAll.dom.remove();
      }
      $dom.productName.val(data.productName);
      $dom.salePrice.val(format.fromCurrency(data.salePrice));   
      $dom.appointmentCount.val(data.appointmentCount);

      var $level = this.$data.reviewScore.dom;
      
      var reviewScore = Math.max(data.reviewScore, 0);
      reviewScore = Math.min(reviewScore, 5); 
      var score = String(reviewScore || 0).split(".");
      $level.addClass("level" + (score[0] || 0));
      
      me.$data['product-list-container'].dom.append($product);
      me.bindDetail($product, data);
    }
    this.checkNextPage(result);

    // 绑定刷新加载事件
    setTimeout(function() {
      me.bindLoadEvents_();
    }, 500);
  };
  
  ProductList.prototype.bindDetail = function($product, data) {
    var me = this;
    $product.bind("tap", function() {
      if (me.dataPara.productType == "SERVICE") {
        me.moveTo("serviceDetail", {productId: data.productId}, {transition: 'slide'});
      } else {
        me.moveTo("productDetail", {productId: data.productId}, {transition: 'slide'});
      }
    });
  };

  ProductList.prototype.bindLoadEvents_ = function(){
    var me = this;
    this.$data.m_list_load.dom.("tap", function(){
      me.getProductList();
      me.$data.m_list_load.dom.hide();
      me.$data.m_list_loading.dom.show();
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
    para.pullDownAction = function() {
      me.clearList();
      me.getProductList();
    };
    
    para.pullUpAction = function() {
      me.getProductList(dataPara.offset_);
    };
    para.hasNextCb = function() {
      return me.dataPara.hasNext;
    };
    
    me.scroller = scrollUtil.bind(para);
  };

  ProductList.prototype.hide = function() {
    var me = this;
    me.clearList();
    me.scroller.unbind();
    me.scroller = null;
  };

  return new ProductList();
});