define([ 'activity/activity', 'widget/toolbar', 'util/domUtil', 'util/util',
    'util/format', 'util/scrollUtil', 'util/storageUtil', 'util/dateUtil',
    'widget/toolbar' ], function(Activity, toolbar, domUtil, util, format,
    scrollUtil, storageUtil, dateUtil, toolbar) {

  var CustomerServiceDetail = function() {
    Activity.call(this);
  };

  Activity.inheritedBy(CustomerServiceDetail);

  /**
   * 页面第一次创建执行 这里绑定唯一事件，加载唯一数据
   */
  CustomerServiceDetail.prototype.onCreate = function() {
  };

  /**
   * 加载动态数据，刷新标题等
   */
  CustomerServiceDetail.prototype.show = function() {
    var me = this;

    storageUtil.getParam("customerServiceDetail").then(function(result) {
      me.initData(result);
    });
  };

  CustomerServiceDetail.prototype.initData = function(para) {
    var data = {};
    data.offset = 0;
    util.post('article/list/1003', data).then(function(result) {
      if (result.codeText == "OK" && result.data) {
        var data = result.data[0];
        if (data) {
        	$('.customer-service-detail-container').html(format.formatDescription(data.content));
        }
      }
    });

  }

  /**
   * 执行清理工作
   */
  CustomerServiceDetail.prototype.hide = function(event, ui) {
  };

  return new CustomerServiceDetail();
});
