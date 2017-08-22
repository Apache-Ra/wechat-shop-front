define(['activity/activity', 'util/storageUtil', 'util/util', 'util/domUtil'],
    function(Activity, storageUtil, util, domUtil) {
  
  var BindPhone = function(){
    Activity.call(this);
  };
  
  Activity.inheritedBy(BindPhone);

  BindPhone.prototype.onCreate = function() {
    this.bindEvents_();
  };

  BindPhone.prototype.bindEvents_ = function(){
    this.bindSendEvent_();
    this.bindRegisterEvent_();
  };

  BindPhone.prototype.bindSendEvent_ = function(){
    var me = this;
    this.$data.cellphone.dom.on("propertychange input", function() {
      if (me.$data.sendButton.dom.hasClass("timing")) {
        return;
      }
      if(this.value.length == 11) {
        me.$data.sendButton.dom.removeClass("ui-disabled");
      } else {
        me.$data.sendButton.dom.addClass("ui-disabled");
      }
    });    
    this.$data.phoneCode.dom.on("propertychange input", function() {
      if(this.value.length == 6) {
        me.$data.bindPhoneButton.dom.removeClass("ui-disabled");
      } else {
        me.$data.bindPhoneButton.dom.addClass("ui-disabled");
      }
    });    
    
    this.$data.sendButton.dom.on("tap", function(e){
      if(!$(this).hasClass('ui-disabled') && me.validatePhoneNumber_()){
        me.waitPhoneCode_();
        me.sendPhoneCode_();
      }
      
    });
  };

  BindPhone.prototype.bindRegisterEvent_ = function(){
    var me = this;
    this.$data.bindPhoneButton.dom.on("tap", function(e){
      if(me.validatePhoneNumber_() && me.validatePhoneCode_()){
        me.bind_();
      }
      
    });
  };

  BindPhone.prototype.waitPhoneCode_ = function(){
    var me = this;
    var $btn = this.$data.sendButton.dom;
    $btn.addClass('ui-disabled timing');
    $btn.data('text', $btn.html());
    var count_ = 60;
    var dida_ = setInterval(function(){
      count_--;
      if (count_ == 0) {
        clearInterval(dida_);
        $btn.removeClass('timing');
        if (me.$data.cellphone.val().length == 11) {
          $btn.removeClass('ui-disabled');
        }
        $btn.html("验证");
        return false;
      } else if (count_ < 0) {
        return false;
      }
      $btn.html(count_ + ' s');
    }, 1000);
  };

  BindPhone.prototype.sendPhoneCode_ = function(){
    var me = this;
    var phone = this.$data['cellphone'].val();
    util.post('app/gcode', {phone: phone})
    .then(function(result) {
      if (result.codeText != "OK") {
        me.error(result.msg);
      }
    });
  };

  BindPhone.prototype.bind_ = function(){
    var me = this;
    storageUtil.get("wechatCode")
    .then(function(wechatCode) {
      if (!wechatCode || !wechatCode.wechatCode) {
        alert("系统错误");
        return;
      }
      
      var formData = {};
      formData.phone = me.phone_;
      formData.code = me.phoneCode_;
      formData.wechatCode = wechatCode.wechatCode;
      
      util.post("wechat/bind", formData)
      .then(function(result) {
        alert(JSON.stringify(result));
        if (result.codeText == "OK") {
          me.onSuccess(result);
        } else {
          me.error(result.msg);
        }
      });
    })
  };

  BindPhone.prototype.onSuccess = function(result){
    var me = this;

    storageUtil.set("userprofile", {userInfo:result.userInfo});
    
    storageUtil.get("afterSpecialPage")
    .then(function(result) {
      me.moveTo(result.activityId || "home");
    });
  };

  BindPhone.prototype.validatePhoneNumber_ = function(){
    this.phone_ = this.$data['cellphone'].val();
    if(this.phone_){
      // 这里不要动了，只验证数字就可以，不要做复杂验证
      if(this.phone_.match(/^1[0-9]{10}$/)){
        return true;
      }else{
        this.remind("请输入一个有效的手机号");
      }
    }else{
      this.remind('请输入您的手机号码');
    }
    return false;
  };

  BindPhone.prototype.validatePhoneCode_ = function(){
    this.phoneCode_ = this.$data['phoneCode'].val();
    if(this.phoneCode_){
      return true;
    } else {
      this.remind("请输入短信验证码");
      return false;
    }
  };
  
  return new BindPhone();
});