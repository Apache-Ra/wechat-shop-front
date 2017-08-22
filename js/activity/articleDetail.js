define(['activity/activity', 'widget/toolbar', 'util/domUtil', 'util/util', 'util/format', 'util/scrollUtil', 'util/storageUtil','util/dateUtil', 'widget/toolbar'],
		function(Activity, toolbar, domUtil, util, format, scrollUtil, storageUtil,dateUtil, toolbar) {

	var ArticleDetail = function(){
		Activity.call(this);
	};

	Activity.inheritedBy(ArticleDetail);

	/**
	 * 页面第一次创建执行
	 * 这里绑定唯一事件，加载唯一数据
	 */
	ArticleDetail.prototype.onCreate = function() {
	};

	/**
	 * 加载动态数据，刷新标题等
	 */
	ArticleDetail.prototype.show = function() {
		var me = this;

		storageUtil.getParam("articleDetail")
		.then(function(result) {
			me.initData(result);
		});
	};

	ArticleDetail.prototype.initData = function(para) {
	  util.post("article/detail/" + para.articleId)
	  .then(function(result) {
	    if (result.codeText == "OK") {
	      $('.article-detail-container').html(format.formatDescription(result.data.content));
	    }
	  });
	}

	/**
	 * 执行清理工作
	 */
	ArticleDetail.prototype.hide = function(event, ui) {
	};

	return new ArticleDetail();
});


