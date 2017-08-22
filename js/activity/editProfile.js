define(['activity/activity', 'widget/toolbar', 'util/domUtil', 'util/util', 'util/format', 'core/navigation'],
		function(Activity, toolbar, domUtil, util, format, navigation) {

	var editProfile = function(){
		Activity.call(this);
	};

	Activity.inheritedBy(editProfile);

	/**
	 * 页面第一次创建执行
	 * 这里绑定唯一事件，加载唯一数据
	 */
	editProfile.prototype.onCreate = function() {
		var me = this;
		me.offset = 0;
		me.limit = 5;
		
		console.debug("ProductList.prototype.pageCreate");
	};
	
	editProfile.prototype.changeBackBtn = function(isInit) {
	  var me = this;
      toolbar.addRightButton([{
        caption: "保存",
        callback:function() {
        	var para = {};
        	para.name = $('#name').val();
        	para.phone = $('#cellphone').val();
        	util.put("mobile/customer/my", para).then(function(result) {
    			if (result.code == "200") {
    				navigation.moveTo('more');
    			}
    		});
        }
      }]);
	};

	/**
	 * 加载动态数据，刷新标题等
	 */
	editProfile.prototype.show = function() {
		var me = this;
		me.changeBackBtn(true);
		util.get("mobile/customer/my", null).then(function(result) {
			if (result.code == "200") {
				$('#name').val(result.data.name);
				$('#cellphone').val(result.data.cellphone);
			}
		});
		
	};

	/**
	 * 执行清理工作
	 */
	editProfile.prototype.hide = function(event, ui) {
	};

	return new editProfile();
});