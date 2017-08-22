define(['activity/activity','util/util','util/domUtil','util/storageUtil','util/format', 'widget/toolbar', 'core/navigation'], 
		function(Activity, util, domUtil,storageUtil, format, toolbar,navigation) {

	var Search = function(){
		Activity.call(this);
	};

	Activity.inheritedBy(Search);

	/**
	 * 页面第一次创建执行
	 * 这里绑定唯一事件，加载唯一数据
	 */
	Search.prototype.onCreate = function() {
		var me = this;
		console.debug("Search.prototype.pageCreate");
	};

	/**
	 * 加载动态数据，刷新标题等
	 */
	Search.prototype.show = function() {
		var me = this;
    
		var headerEle = me.$data["searchHeader-template-container"].dom.clone();
		headerEle.removeAttr("name");
		headerEle = toolbar.customizeTitle(headerEle);

    this.toolbar.addRightButton([{
      caption: '搜索',
      callback: function() {
        storageUtil.getParam("search")
        .then(function(para) {
          me.search(headerEle, para);
        });
      }
    }]);
    
		me.$data.historyFlag.dom.show();

		me.$data.historyList.dom.on('tap', '.historyItems', function() {
      storageUtil.getParam("search")
      .then(function(para) {
        storageUtil.putParam(para.moveTo_, {keywords_: $(this).attr('historyText')})
        me.back();
      });
		});

		me.$data.clearHistory.dom.on("tap", function(){
			me.$data.historyFlag.dom.hide();
			me.searchResultHistory = [];
			storageUtil.remove('searchResultHistory');
		})

		me.searchResultHistory = [];
		storageUtil.get('searchResultHistory')
		.then(function(result){
		  me.$data.historyList.dom.empty();
			result = result && result.history;
			if(result && result.length > 0){
				me.searchResultHistory = result;
				$(result).each(function(index,element){
					me.$data.historyList.dom.append('<div class="historyItems" historyText='+this+'><span>'+this+'</span></div>');
				})
			}else{
				me.$data.historyFlag.dom.hide();
			}			
		});
	}

	Search.prototype.search = function(headerEle, para) {
	  var me = this;
	  var $input = headerEle.find("[name=productSearchInput]");
    var historyNote = $input.val();
    if(historyNote){
      me.searchResultHistory.unshift(historyNote);
      if (me.searchResultHistory.length > 5) {
        var delHistoryText = me.searchResultHistory.shift();
        $('div[historyText='+delHistoryText+']').remove();
      }
      storageUtil.set("searchResultHistory", {history: me.searchResultHistory});
      me.$data.historyList.dom.prepend('<div class="historyItems" historyText=' + historyNote + '><span>' + historyNote + '</span></div>'); 
    }
    
    storageUtil.putParam(para.moveTo_, {keywords_: historyNote})
    me.back();
	}

	/**
	 * 执行清理工作
	 */
	Search.prototype.hide = function(event, ui) {
	  this.$data.historyList.dom.off('tap', '.historyItems');
	};

	return new Search();
});

