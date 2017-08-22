define(['activity/activity','util/domUtil', 'util/format', 'util/util', 'util/storageUtil', 'util/nativeIf', 'widget/popup'], 
	function(Activity, domUtil, format, util, storageUtil, nativeIf, popup) {
  
  var Payment = function(){
    Activity.call(this);
  };
  
  Activity.inheritedBy(Payment);

  Payment.prototype.onCreate = function() {
  };

  Payment.prototype.show = function() {
    var me = this;
    storageUtil.getParam("payment")
    .then(function(result) {
      if (result.data) {
//        storageUtil.get("g_selectedCoupon")
//        .then(function(coupon) {
          me.renderPage(result.data);
//          storageUtil.remove("g_selectedCoupon");
//        });
      }
    });
  };
  
  Payment.prototype.renderPage = function(data) {
    if (!data.item) {
      return;
    }
    
    this.$data.appointmentCode.val(data.item.join(" "));
    this.$data.totalAmount.val(format.fromCurrency(data.totalAmount));
    
//    var couponName = "";
    var paymentAmount = data.totalAmount;
//    if (coupon.couponType == 1) {
//      couponName = "减" + format.fromCurrencyWithCutZero(coupon.param1) + " 满" + format.fromCurrencyWithCutZero(coupon.param2) + "使用";
//      // 满减
//      if (paymentAmount > coupon.param2) {
//        paymentAmount -= parseInt(paymentAmount / coupon.param2) * coupon.param1;
//      }
//    } else if (coupon.couponType == 2) {
//      // DISCOUNT(2, "打折"),
//      couponName = format.fromCurrencyWithCutZero(coupon.param1) + "%折扣" + " 满" + format.fromCurrencyWithCutZero(coupon.param2) + "使用";
//
//      // 打折
//      if (paymentAmount > coupon.param2) {
//        paymentAmount *= coupon.param1 / 1000000.0;
//      }
//    } else {
//      couponName = "未选择优惠券";
//    }
    
    this.$data.paymentAmount.val(format.fromCurrency(paymentAmount));
    
//    this.$data.couponInfo.val(couponName);
    
    var me = this;
//    this.$data.couponButton.dom.on("tap", function() {
//      me.moveTo("couponList", {moveTo_: "payment", totalAmount: data.totalAmount})
//    });
    
    this.$data["pay_now"].dom.on("tap", function() {
      storageUtil.get("wechatCode")
      .then(function(wechatCode) {
        me.payNow(data, wechatCode);
      });
    });
  };

  Payment.prototype.payNow = function(data, wechatCode) {
    var me = this;
    var para = {
        code: wechatCode.wechatCode,
//        couponId: coupon.couponId,
        appointmentCodes: data.item
    };
    util.post("wechat/pay/paystatus", para)
    .then(function(result) {
      if (result.codeText == "WECHAT_PAY_CAN_PAY") {
        util.post("wechat/pay/signature", para)
        .then(function(result) {
          if (result.codeText == "OK") {
            me.callWxPayIf(result.data);
          } else {
            me.error("微信签名失败");
          }
        });
      } else {
        me.error("该订单状态已改变，请刷新后重试");
        me.back();
      }
    });
  };
  
  Payment.prototype.callWxPayIf = function(data) {
    var me = this;
//    nativeIf.g_def
//    .then(function() {
    	nativeIf.wx.chooseWXPay({
        "timestamp": data.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
        "nonceStr": data.nonceStr, // 支付签名随机串，不长于 32 位
        "package": data["package"], // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
        "signType": data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
        "paySign": data.paySign, // 支付签名
        "success": function (res) {
          // 支付成功后的回调函数
        	me.moveTo("preOrderList");
        },
        "fail": function(res) {
          me.info(res.errMsg);
        }
      });
//    });
  };
  
  Payment.prototype.hide = function() {
//    this.$data.couponButton.dom.off("tap");
    this.$data["pay_now"].dom.off("tap");
  };

  return new Payment();
});