define(['activity/activity', 'util/util', 'util/format', 'util/storageUtil', 'widget/confirm'], function(Activity, util, format, storageUtil, confirm) {
  
  var CreateOrder = function(){
    Activity.call(this);
  };
  
  Activity.inheritedBy(CreateOrder);
  
  /**
   * 页面第一次创建执行
   * 这里绑定唯一事件，加载唯一数据
   */
  CreateOrder.prototype.onCreate = function() {
    this.bindEvent();
  };
  
  CreateOrder.prototype.bindEvent = function() {
    var me = this;
    this.container_.find(".createorder-footer-info").bind("tap", function() {
      storageUtil.getParam("createOrder")
      .then(function(data) {
        storageUtil.get("profile")
        .then(function(profile) {
          var para = {
              "cellphone": profile.cellphone,
              "appointmentType": data.extType,
              "terminalStoreId": data.terminalStoreId,
              "customerAppointmentItems": [{
                "productId": data.productId,
                "quantity" : 1
              }]
          };
          
          util.post("mobile/customer/appointment", para)
          .then(function(result) {
            if (result.code != 200) {
              me.error("下单失败。");
              return;
            }
            
            me.moveTo("preOrderDetail", {appointmentId: result.data.appointmentId, extType: data.extType});
          });
        });
      });
    });
  };
  
  /**
   * 加载动态数据，刷新标题等
   */
  CreateOrder.prototype.show = function() {
    var me = this;
    storageUtil.get("profile_cars")
    .then(function(result) {
      result = result.cars;
      var car = null;
      if (result && result.length > 0) {
        $(result).each(function() {
          if (this.isDefault) {
            car = this;
            return false;
          }
        });
        
        if (!car) {
          car = result[0];
        }
      }
      
      if (car) {
        me.$data.customName.val(car.owner || "");
        me.$data.carName.val(car.carModelName);
      }
      
      storageUtil.getParam("createOrder")
      .then(function(para) {
        if (!para && !para.productId) {
          return;
        }
        
        util.get('mobile/product/' + para.productId, {productType: para.extType}).then(function(result) {
          if(result.code !== "200" || !result.data) {
            return;
          }
          
          me.renderProduct_(result.data);
        });
        
        util.get('mobile/terminalStore/' + para.terminalStoreId).then(function(result) {
          if(result.code !== "200" || !result.data) {
            return;
          }
          me.renderTerminalStore_(result.data);
        });
      });
    });
    
  };
  
  CreateOrder.prototype.renderProduct_ = function(prd) {
    var me = this;
    
    if(prd.isForAll !== 0) {
      me.container_.find(".list-item-txt-title-icon").hide();
    } else {
      me.container_.find(".list-item-txt-title-icon").show();
    }
    
    this.$data.productImg.dom.attr("src", format.photoImgUrl(prd.productImage, "300x0"));
    var salePrice = format.fromCurrency(prd.salePrice);
    this.$data.salePrice.val(salePrice);

    var html = [prd.productName];
    $.each(prd.productSpecs || [], function() {
      if (this.customName) {
        html.push(this.customName);
      }
    });
    this.$data.productName.val(html.join(" "));
    this.$data.reviewLevel.dom.removeClass("level0 level1 level2 level3 level4 level5");
    var reviewScore = Math.max(prd.reviewScore, 0);
    reviewScore = Math.min(reviewScore, 5); 
    var score = String(reviewScore || 0).split(".");
    this.$data.reviewLevel.dom.addClass("level" + (score[0] || 0));
    
    this.$data.appointmentCount.val(format.formatNumber(prd.appointmentCount));
  };
  
  CreateOrder.prototype.renderTerminalStore_ = function(store) {
    var $span = this.container_.find(".m-cont span");
    $span[0].innerHTML = store.companyName;
    $span[1].innerHTML = store.cellphone;
    $span[2].innerHTML = store.address;
  };
  
  /**
   * 执行清理工作
   */
  CreateOrder.prototype.hide = function(event, ui) {
    var me = this;
    me.$data.customName.val("");
    me.$data.carName.val("");
    me.$data.productImg.dom.attr("src", "");
    me.$data.salePrice.val("");
    me.$data.productName.val("");
    me.$data.appointmentCount.val("");
    var $span = this.container_.find(".m-cont span");
    $span[0].innerHTML = "";
    $span[1].innerHTML = "";
    $span[2].innerHTML = "";
    $span[3].innerHTML = "";
  };
  
  return new CreateOrder();
});