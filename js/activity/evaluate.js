define(['activity/activity', 'util/storageUtil', 'util/util', 'widget/toolbar'],
    function(Activity, storageUtil, util, toolbar) {
  
  var Evaluate = function(){
    Activity.call(this);
  };
  
  Activity.inheritedBy(Evaluate);
  
  /**
   * 页面第一次创建执行
   * 这里绑定唯一事件，加载唯一数据
   */
  Evaluate.prototype.onCreate = function() {
    console.debug("Evaluate.pageCreate");
    this.bindEvent();
  };
  
  Evaluate.prototype.bindEvent = function() {
    var me = this;
    this.container_.find(".m-footer").bind("tap", function() {
      storageUtil.getParam("evaluate")
      .then(function(para) {
        me.submitEvaluate(para);
      });
    });
  };
  
  Evaluate.prototype.submitEvaluate = function(para) {
    var me = this;
    var message = $.trim(me.container_.find("textarea").val());
    if (!message) {
      me.info("请输入您的评价内容");
      return;
    }
    
    var $score = me.container_.find(".m-evaluate b:eq(0)");
    var data = {
      "message": message,
      "reviewItems": []
    };
    
    me.container_.find(".m-evaluate > div").each(function() {
      var $this = $(this);
      data.reviewItems.push({
        "itemName": $.trim($this.find("span:first-child").html()),
        "score": parseInt($.trim($this.find("b").html()))
      });
    });
    
    var score = 0, k = 0;
    for (; k<data.reviewItems.length; k++) {
      score += data.reviewItems[k].score;
    }
    data.score = score / k;
    
    util.post(me.reviewUrl, data).then(function(result) {
      if (result.codeText != "OK") {
        return;
      }
      
      me.back();
    });
  };
  
  /**
   * 加载动态数据，刷新标题等
   */
  Evaluate.prototype.show = function() {
    var me = this;
    storageUtil.getParam("evaluate")
    .then(function(para) {
      me.renderContent_(para);
    });
  };
  
  Evaluate.prototype.renderContent_ = function(para) {
    if (para.extType == "PRODUCT") {
      toolbar.customizeTitle("评价商品");
    } else if (para.extType == "TERMINALSTORE") {
      toolbar.customizeTitle("评价门店");
      this.reviewUrl = "store/creview/" + para.extId
    } else if (para.extType == "APPOINTMENT") {
      toolbar.customizeTitle("评价订单");
      this.reviewUrl = "appointment/creview/" + para.extId
    } else {
      this.reviewUrl = "";
      return;
    }
  };
  
  /**
   * 可以在这里阻止页面跳转
   */
  Evaluate.prototype.beforechange = function(event, ui) {
    console.debug("Evaluate.beforechange");
  };
  
  /**
   * 执行清理工作
   */
  Evaluate.prototype.hide = function(event, ui) {
    this.container_.find(".m-evaluate i").removeClass("cur");
    this.container_.find("textarea").val("");
  };
  
  return new Evaluate();
});