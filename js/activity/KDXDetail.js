define(['activity/activity', 'widget/toolbar', 'util/domUtil', 'util/util', 'util/format', 'util/scrollUtil', 'util/storageUtil','util/dateUtil', 'widget/toolbar'],
		function(Activity, toolbar, domUtil, util, format, scrollUtil, storageUtil,dateUtil, toolbar) {

	var KDXDetail = function(){
		Activity.call(this);
	};

	Activity.inheritedBy(KDXDetail);

	/**
	 * 页面第一次创建执行
	 * 这里绑定唯一事件，加载唯一数据
	 */
	KDXDetail.prototype.onCreate = function() {
	};

	/**
	 * 加载动态数据，刷新标题等
	 */
	KDXDetail.prototype.show = function() {
		var me = this;
    var data = {};
    data.offset = 0;
    util.post('article/list/1002', data).then(function(result) {
      if (result.codeText == "OK" && result.data) {
        var data = result.data[0] || {};
        me.initData(data);
      }
    });
	};

	KDXDetail.prototype.initData = function(para) {
		$('.kdx-detail-container').html(format.formatDescription(para.content));
	};

	/**
	 * 执行清理工作
	 */
	KDXDetail.prototype.hide = function(event, ui) {
	};

	return new KDXDetail();
});


