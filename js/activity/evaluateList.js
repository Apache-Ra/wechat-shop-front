define(['activity/activity', 'util/util', 'util/storageUtil', 'util/format', 'util/scrollUtil', 'core/navigation', 'widget/toolbar'],
    function(Activity, util, storageUtil, format, scrollUtil, navigation, toolbar) {

  var PAGE_DATA_COUNT = 3;
  
  var EvaluateList = function(){
    Activity.call(this);
  };
  
  Activity.inheritedBy(EvaluateList);
  
  /**
   * 页面第一次创建执行
   * 这里绑定唯一事件，加载唯一数据
   */
  EvaluateList.prototype.onCreate = function() {
  };

  /**
   * 加载动态数据，刷新标题等
   */
  EvaluateList.prototype.show = function() {
    var me = this;
    storageUtil.getParam("evaluateList")
    .then(function(pageParam) {
      if (pageParam.extType == "PRODUCT") {
        toolbar.customizeTitle("商品评价列表");
      } else if (pageParam.extType == "TERMINAL_STORE") {
        toolbar.customizeTitle("门店评价列表");
      } else {
        return;
      }
      
      me.dataPara = {
          offset: 0,
          extType: pageParam.extType,
          extId: pageParam.extId
      };
      
      me.getReviewList();
    });
  };

  EvaluateList.prototype.getReviewList = function(offset) {
    var me = this;
    me.dataPara.offset = offset || 0;
    
    var url;
    if (me.dataPara.extType == "PRODUCT") {
      url = "product/review/" + me.dataPara.extId;
    } else if (me.dataPara.extType == "TERMINAL_STORE") {
      url = "store/review/" + me.dataPara.extId;
    }
    
    return util.post(url, {offset: me.dataPara.offset}).then(function(result) {
      me.renderReviewList(result);
    });
  };
  
  EvaluateList.prototype.renderReviewList = function(result) {
    var me = this;
    var $container = me.$data["review-item-container"].dom;
    me.checkNextPage(result);
    // 绑定刷新加载事件
    setTimeout(function() {
      me.bindLoadEvents_();
    }, 500);
    
    if (result.codeText != "OK" || result.pageInfo.totalCount == 0) {
      me.$data.totalCount.val("0");
      me.container_.addClass("empty");
      return;
    } else {
      me.container_.removeClass("empty");
    }
    
    me.$data.totalCount.val(result.pageInfo.totalCount);
    var items = result.data;
    $.each(items, function() {
      var $item = me.$data["review-item-template"].dom.clone();
      $item.removeAttr("name");
      var $name = $item.find(".m-name");
      if (this.user) {
        $name.html(format.formatName(this.user.name));
      }
      $name.next().html(this.createTime);
      $item.find(".text-fr i").html(this.score + "<em></em>");
      var $score = $item.find(".text-fr em");
      $score.addClass("level" + this.score);
      $item.find(".m-review").html(this.message);
      $container.append($item);
    });
  };
  
  EvaluateList.prototype.checkNextPage = function(result){
    var info = result.data;
    this.dataPara.offset = info.offset + PAGE_DATA_COUNT;
    this.dataPara.hasNext = true;
  };
  
  EvaluateList.prototype.bindLoadEvents_ = function() {
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
      me.$data["review-item-container"].dom.empty();
      me.getReviewList();
    };
    
    para.pullUpAction = function() {
      me.getReviewList(dataPara.offset);
    };
    para.hasNextCb = function() {
      return me.dataPara.hasNext;
    };
    
    me.scroller = scrollUtil.bind(para);
  };

  EvaluateList.prototype.hide = function() {
    var me = this;
    this.$data["review-item-container"].dom.empty();
    me.scroller.unbind();
    me.scroller = null;
  };
  
  return new EvaluateList();
});