define([ 'activity/activity', 'util/domUtil', 'util/format', 'util/util', 'util/dateUtil',
        'util/scrollUtil', 'util/storageUtil'],
function(Activity, domUtil, format, util, dateUtil, scrollUtil, storageUtil) {

  var PAGE_DATA_COUNT = 10;
  var OFFSET = 0;
  var hasNext = false;

  var CouponList = function() {
    Activity.call(this);
  };

  Activity.inheritedBy(CouponList);

  CouponList.prototype.onCreate = function() {
  };

  CouponList.prototype.checkNextPage = function(info) {
    if (!info.data || info.pageInfo.limit > info.data.length) {
      hasNext = false;
    } else {
      hasNext = true;
      OFFSET = OFFSET + PAGE_DATA_COUNT;
    }
  };

  CouponList.prototype.show = function() {  
    this.getCouponList();
  };

  CouponList.prototype.getCouponList = function() {
    var me = this;

    var data = {};
    data.offset= OFFSET;
    util.get("coupon/search", data).then(function(result) {
      if (result.codeText == "OK") {
        storageUtil.getParam("couponList")
        .then(function(param) {
          me.clearList();
          me.renderCouponList(result, param);
          me.renderEmpty();
        });
      }
    });
  };
  
  CouponList.prototype.renderEmpty = function() {
    if (this.$data["coupon-list-container"].dom.find("li").length > 0) {
      this.container_.removeClass("empty");
    } else {
      this.container_.addClass("empty");
    }
  };

  CouponList.prototype.clearList = function() {
    this.$data['coupon-list-container'].dom.empty();
  };

  CouponList.prototype.renderCouponList = function(result, param) {
    var moveTo_ = null;
    if (param) {
      moveTo_ = param.moveTo_;
    }
    var me = this;
    for ( var k in result.data) {
      var data = result.data[k];
      var $coupon = me.$data["coupon-item-template"].dom.clone();
      $coupon.removeAttr("name");
      
      var $dom = domUtil.getDomByName($coupon);
      // GIFT_LIMITED(1, "满减"),
      if (data.couponType == 1) {
        $dom.desc1.val("减" + format.fromCurrencyWithCutZero(data.param1));
        $dom.desc2.val("满" + format.fromCurrencyWithCutZero(data.param2) + "使用");
      } else if (data.couponType == 2) {
        // DISCOUNT(2, "打折"),
        $dom.desc1.val(format.fromCurrencyWithCutZero(data.param1) + "%折");
        $dom.desc2.val("满" + format.fromCurrencyWithCutZero(data.param2) + "使用");
      }
      
      $dom.endTime.val(dateUtil.dateStrFormat("yyyy年MM月dd日", data.endTime));
      
      var couponStatus = "";
      var needAction = false;
      var valid = false;
      if (data.expired) {
        couponStatus = "过期";
      } else {
        if (!data.validFlg) {
          couponStatus = "无效";
        } else {
          if (!data.cValidFlg) {
            couponStatus = "已使用";
          } else {
            valid = true;
            if (moveTo_ == "payment") {
              couponStatus = "使用";
              needAction = true;
            } else {
              couponStatus = "有效";
            }
          }
        }
      }
      
      $dom.operation.val(couponStatus);
      if (!valid) {
        $coupon.find(".quan").addClass("invalid");
      }
      me.$data['coupon-list-container'].dom.append($coupon);
      
      if (needAction) {
        me.bindDetail($dom, data, param);
      }
    }
    
    me.checkNextPage(result);

    // 绑定刷新加载事件
    setTimeout(function() {
      me.bindLoadEvents_();
    }, 500);
  };

  CouponList.prototype.bindDetail = function($dom, data, param) {
    var moveTo_ = null;
    if (param) {
      moveTo_ = param.moveTo_;
    }
    var me = this;
    if (moveTo_ !== "payment") {
      return;
    }
    $dom.operation.dom.on("tap", function() {
      if (param.totalAmount) {
        if (param.totalAmount < data.param2) {
          me.info("您的订单金额小于优惠券的最低限额。")
          return;
        }
      }
      
      storageUtil.set("g_selectedCoupon", data);
      me.back();
    });
  };

  CouponList.prototype.bindLoadEvents_ = function() {
    var me = this;
    if (me.scroller) {
      me.scroller.refresh();
      return;
    }
    var dataPara = me.dataPara;
    var para = {};
    para.pullDownEl = me.$data.m_list_refresh.dom;
    para.pullUpEl = me.$data.m_list_loadmore.dom;
    para.wrapperSelector = me.$data.wrapper.dom[0];
    para.pullDownAction = function() {
    	OFFSET = 0;
      me.clearList();
      me.getCouponList();
    };
    
    para.pullUpAction = function() {
      me.getCouponList();
    };
    para.hasNextCb = function() {
      return hasNext;
    };
    
    me.scroller = scrollUtil.bind(para);
  };

  CouponList.prototype.hide = function() {
    var me = this;
    OFFSET = 0;
    storageUtil.removeParam("couponList");
    me.clearList();
    
    if (me.scroller) {
      me.scroller.unbind();
      me.scroller = null;
    }
  };

  return new CouponList();
});