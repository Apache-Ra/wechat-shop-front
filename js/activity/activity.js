define(['core/base', 'core/navigation',
        'util/util','util/domUtil', 'util/storageUtil', 'util/format',
        'widget/toolbar', 'widget/popup'],
        
  function( base, navigation, util, domUtil,
      storageUtil, formatUtil, toolbar, popup) {
  
  var Activity = function(){
    this.toolbar = toolbar;
  };

  Activity.prototype.create = function(el, id, opt_bundle) {
    this.setId(id);
    this.container_ = el || '';
    this.getDataDom();
    if (this.onCreate) {
      this.onCreate(opt_bundle);
    }
  };

  /**
   * 加载动态数据，刷新标题等
   */
  Activity.prototype.show = function() {
  };
  
  /**
   * 可以在这里阻止页面跳转
   */
  Activity.prototype.beforechange = function(event, ui) {
  };
  
  /**
   * 执行清理工作
   */
  Activity.prototype.hide = function(event, ui) {
  };

  Activity.prototype.moveTo = function(activityId, opt_bundle, opt_options){
    navigation.moveTo(activityId, opt_bundle, opt_options || {});
  };
  
  Activity.prototype.back = function(activityId) {
    navigation.back(activityId);
  };

  // maybe popup(msg, icon, customized)
  Activity.prototype.remind = function(msg){
    popup.popup({msg: msg});
  };

  Activity.prototype.success = function(msg){
    var def = $.Deferred();
    popup.popup({msg: msg, def: def});
    return def.promise();
  };

  Activity.prototype.error = function(msg){
    var def = $.Deferred();
    popup.popup({msg: msg, def: def});
    return def.promise();
  };

  Activity.prototype.info = function(msg){
    var def = $.Deferred();
    popup.popup({msg: msg, def: def});
    return def.promise();
  };

  Activity.prototype.trace = function(){
    console.log.apply(logger, arguments);
  };

  Activity.prototype.getDataDom = function(){
    return this.$data = domUtil.getDomByName(this.container_);
  };
  
  Activity.prototype.setId = function(id){
    if(this.id_) return;
    if(id){
      this.id_ = id;
    }else if(id = util.getUrlParam()){
      this.id_ = id.page;
    }
  };

  Activity.prototype.getId = function(id){
    return this.id_;
  };
  
  Activity.prototype.find = function(selector) {
    return this.container_.find(selector);
  };

  Activity.inheritedBy = function(childActivity) {
    base.inherits(childActivity, Activity);
    
    childActivity.inheritedBy = function(grandsonActivity){
      base.inherits.call(this, grandsonActivity, childActivity);
    };
  };
  
  return Activity;
});