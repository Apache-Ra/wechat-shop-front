define(['activity/activity', 'core/navigation', 'widget/confirm', 'util/storageUtil', 'util/util'],
    function(Activity, navigation, confirm, storageUtil, util) {
  
  var More = function(){
    Activity.call(this);
  };
  
  Activity.inheritedBy(More);
  
  /**
   * 页面第一次创建执行
   * 这里绑定唯一事件，加载唯一数据
   */
  More.prototype.onCreate = function() {
    this.$data.curVersion.val(KDXWechat.version);
    this.bindEvent();
  };
  
  /**
   * 加载动态数据，刷新标题等
   */
  More.prototype.show = function() {
    util.post("/user/address/list", {offset: 0});
    var me = this;
    storageUtil.get("LBS")
    .then(function(lbs) {
      var cityName = "";
      if (lbs) {
//        if (lbs.selfPosition && lbs.selfPosition.cityId) {
//          cityName = lbs.selfPosition.cityName;
//        } else {
          cityName = lbs.cityName;
//        }
      }
      
      me.$data.curCity.val(cityName);
    });
  };
  
  More.prototype.bindEvent = function() {
    var me = this;
    this.container_.find("li").bind("tap", function(e) {
      var activityId = $(this).attr("activityId");
      if (!activityId) {
        return;
      }
      
      if (activityId == "logout") {
        confirm.confirm({
          message: "确认要退出登录吗？",
          okCb: function() {
            me.clearLogin();
            me.logout();
          }
        });
      } else if (activityId == "checkupd") {

      } else if (activityId == "clearCache") {
        
      } else {
        navigation.moveTo(activityId);
      }
      e.preventDefault();
    });
  };
  
  More.prototype.clearLogin = function() {
    storageUtil.remove("profile");
    storageUtil.remove("profile_cars");
    storageUtil.remove("profile_validation");
    var stack = $.mobile.navigate.history.stack[$.mobile.navigate.history.activeIndex];
    $.mobile.navigate.history.stack = [];
    $.mobile.navigate.history.stack.push(stack);
    $.mobile.navigate.history.activeIndex = 0;
  };
  
  More.prototype.logout = function() {
  };
  
  /**
   * 可以在这里阻止页面跳转
   */
  More.prototype.beforechange = function(event, ui) {
    console.debug("More.beforechange");
  };
  
  /**
   * 执行清理工作
   */
  More.prototype.hide = function(event, ui) {
    console.debug("More.hide");
  };
  
  return new More();
});