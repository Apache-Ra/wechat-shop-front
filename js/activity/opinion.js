define(['activity/activity', 'util/domUtil', 'util/util', 'core/navigation'], 
		function(Activity, domUtil, util, navigation) {
  
  var Opinion = function(){
    Activity.call(this);
  };
  
  Activity.inheritedBy(Opinion);
  
  /**
   * 页面第一次创建执行
   * 这里绑定唯一事件，加载唯一数据
   */
  Opinion.prototype.onCreate = function() {
    var me = this;
    me.$data.opinionCommit.dom.bind('tap',function(){
        var para = {};  
        para.note = me.$data.note.val();
        para.content = me.$data.contact.val();
          util.post("feedback", para).then(function(result) {
            if (result.code == "200") {
            	navigation.moveTo('more');
            } else {
              alert('提交失败');              
            }
          });
    });
  };
  
  /**
   * 加载动态数据，刷新标题等
   */
  Opinion.prototype.show = function() {	  
    console.debug("Opinion.beforeshow");
  };
  
  /**
   * 可以在这里阻止页面跳转
   */
  Opinion.prototype.beforechange = function(event, ui) {
    console.debug("Opinion.beforechange");
  };
  
  /**
   * 执行清理工作
   */
  Opinion.prototype.hide = function(event, ui) {
	  var me = this;
	  me.$data.note.val('');
      me.$data.contact.val('');
    console.debug("Opinion.hide");
  };
  
  return new Opinion();
});