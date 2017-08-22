define(['activity/activity', 'core/navigation', 'widget/confirm', 'util/storageUtil', 'util/util'],
    function(Activity, navigation, confirm, storageUtil, util) {
  
  var Mine = function(){
    Activity.call(this);
  };
  
  Activity.inheritedBy(Mine);
  
  /**
   * 页面第一次创建执行
   * 这里绑定唯一事件，加载唯一数据
   */
  Mine.prototype.onCreate = function() {
    //this.$data.curVersion.val(KDXWechat.version);
    this.bindEvent();
  };
  
  /**
   * 加载动态数据，刷新标题等
   */
  Mine.prototype.show = function() {
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
      //获取用户数据
		storageUtil.get("userprofile").then(function(userprofile) {
			var userInfo = userprofile.userInfo;
			$(".infoImg").find("img").attr("src",userInfo.portrait);
			$(".infoNickName").html(userInfo.nickName);
		});
		
      me.$data.curCity.val(cityName);
    });
  };
  
  Mine.prototype.bindEvent = function() {
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
  

  
  Mine.prototype.logout = function() {
  };
  
  /**
   * 可以在这里阻止页面跳转
   */
  Mine.prototype.beforechange = function(event, ui) {
    console.debug("Mine.beforechange");
  };
  
  /**
   * 执行清理工作
   */
  Mine.prototype.hide = function(event, ui) {
    console.debug("Mine.hide");
  };
  
  return new Mine();
});