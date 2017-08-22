define(['activity/activity', 'util/util', 'util/lbsUtil', 'util/format', 'util/storageUtil', 'util/imgSlider', 'widget/toolbar'],
    function(Activity,util, lbsUtil, format, storageUtil, imgSlider, toolbar) {
  
  var Home = function(){
    Activity.call(this);
  };
  
  Activity.inheritedBy(Home);
  
  /**
   * 页面第一次创建执行
   * 这里绑定唯一事件，加载唯一数据
   */
  Home.prototype.onCreate = function() {
    this.bindEvent();
  };
  
  Home.prototype.bindEvent = function() {
    var me = this;
    me.container_.find('.home_film').on("tap", function(){
    	me.moveTo('productList', {
        productType : 'product'
      });
    });
    me.container_.find('.home_coupon').on("tap", function(){
    	me.moveTo('couponList');
    });
    me.container_.find('.home_beauty').on("tap", function(){
    	me.moveTo('productList', {
    		productType : 'beauty'
      });
    });
    me.container_.find('.home_store').on("tap", function(){
    	me.moveTo('terminalStoreList', {moveTo_: "home"});
    });
    me.container_.find('.home_article').on("tap", function(){
    	me.moveTo('articleList');
    });
    me.container_.find('.home_aboutme').on("tap", function(){
      me.moveTo("KDXDetail");
    });
    /**
     * 进入直播
     */
//    me.container_.find(".enter_video").on("tap",function(){
//  	  me.moveTo('videoDetail',{
//  		  productType:'video'
//  	  });
//    })
    me.container_.find('.enter_video').on("tap", function(){
    	me.moveTo('productList', {
    		productType : 'product'
      });
    });
    me.container_.find('.about_us').on("tap", function(){
    	me.moveTo('aboutUS');
    }); 
    me.container_.find('.use_process').on("tap", function(){
    	me.moveTo('useProcess');
    }); 
  };

  /**
   * 加载动态数据，刷新标题等
   */
  Home.prototype.show = function() {
    var me = this;
    me.renderPage();
    lbsUtil.getPosition()
    .then(function(lbs) {
      toolbar.addLeftButton({
        caption: lbs.cityName
      });
    });
  };
  
  Home.prototype.renderPage = function() {
    var totalHeight = $("body").height();
    totalHeight = totalHeight - 41 - 49;
    var totalWidth = $("body").width();
    var bannerHeight = Math.min(totalWidth * 588 / 1080, totalHeight * 2/3);
    imgHeight = Math.max((totalHeight - bannerHeight) / 2 - 30, 50);
    
    this.container_.find(".shoticon>div>div").css("height", imgHeight + "px");
  };

  Home.prototype.afterShow = function() {
    imgSlider.bind(this.container_.find(".m-slider"));
  };
  
  return new Home();
});