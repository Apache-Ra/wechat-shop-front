define(['util/util', 'util/storageUtil', 'util/wechatIf', 'widget/toolbar', 'require', 'jsWeixin'],
    function( util, storageUtil, wechatIf, toolbar, require, jsWeixin) {
  
  var NativeIf = {
      timeHandle: null,
      geocoder: null,
      g_def: null,
      wx: null,
      start: function() {
        var me = this;
        if (me.wx) {
          requirejs.undef("jsWeixin");
        }
        if (me.g_def) me.g_def.reject();
        me.g_def = $.Deferred();
        require(["jsWeixin"], function(wx) {
          me.wx = wx;
          setTimeout(function() {
            me.startInterval()
            .then(function() {
              me.g_def.resolve();
            });  
          }, 100);
        });

        me.loopLbs();
      },
      startInterval: function() {
        var me = this;
        var def = $.Deferred();

        me.initWxSDK()
        .then(function() {
          def.resolve();
//          wechatIf.start();
        });
        
        // WXJSDK初始化结束即可，定位为另外逻辑
        return def.promise();
      },
      stopInterval: function() {
        var me = this;
        if (me.timeHandle) {
          clearTimeout(me.timeHandle);
          me.timeHandle = null;
        }
      },
      initWxSDK: function() {
        var me = this;
        var def = $.Deferred();
        me.getSignature()
        .then(function(result) {
          if (!result || !result.signature) {
            def.reject();
            return;
          }
          // 微信SDK配置
          me.wx.config({
              debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
              appId: result.appId, // 必填，公众号的唯一标识
              timestamp: result.timestamp, // 必填，生成签名的时间戳
              nonceStr: result.noncestr, // 必填，生成签名的随机串
              signature: result.signature,// 必填，签名
              jsApiList: ['chooseWXPay', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ'] // 必填，需要使用的JS接口列表
          });
  
          me.wx.ready(function(){
            storageUtil.set("last_signature", result);
            def.resolve();
          });
            
          me.wx.error(function(res){
            // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
            def.reject();
          });
        });
        
        return def.promise();
      },
      // Deprecated
      getAccessToken: function(refreshToken) {
        return storageUtil.get("access_token")
        .then(function(token) {
          if (!token || !token.accessToken) {
            util.disableLoadding();
            return util.get("wechat/token", null, false)
            .then(function(result) {
              if (result.codeText == "OK") {
                var token = result.data;
                storageUtil.set("access_token", token);
                return token;
              }
            });
          } else {
            if (refresh) {
              // token已经过期，强制刷新
              util.disableLoadding();
              return util.get("wechat/token/" + token.accessToken, null, false)
              .then(function(result) {
                if (result.codeText == "OK") {
                  var token = result.data;
                  storageUtil.set("access_token", token);
                  return token;
                }
              });
            } else {
              return token;
            }
          }
        });
      },
      getSignature: function(refreshToken) {
        util.disableLoadding();
        //        return util.get("wechat/signature", {url: "http://www.shop.com/kdxwx/index.html?page=home"}, false)
        return util.get("wechat/signature", {url:window.location.href}, false)
        .then(function(result) {
          if (result.codeText == "OK") {
            return result.data;
          }
        });
      },
      loopLbs: function() {
        var me = this;
        this.getLbs()
        .then(function() {
          me.stopInterval();
          me.timeHandle = setTimeout(function() {
            me.loopLbs();
          }, 60000);
        });
      },
      getLbs: function() {
        var def = $.Deferred();
        var me = this;
        
//        (new BMap.Geolocation()).getCurrentPosition(function(res) {
//          if(this.getStatus() == BMAP_STATUS_SUCCESS){
//            me.lbsListener(res);
//          }
          def.resolve();
//        });
        return def.promise();
      },
      lbsListener : function(para) {
        var me = this;
        setTimeout(function() {
          storageUtil.get("LBS")
          .then(function(lbs) {
            lbs = $.extend({origin:{}}, lbs);
            me.lbsCallback(para, lbs);
          });
        }, 0);
      },
      lbsCallback : function(para, lbs) {
        var me = this;
        if (!para.address || !para.address.city) {
          // 未找到相关城市
        } else if (lbs.origin.city != para.address.city) {
          // 重新获取城市相关信息
          // url, param, useCache, skipValidation, usePlatform
          util.disableLoadding();
          util.get("mobile/city/" + encodeURIComponent(para.address.city), null, true, true, true)
          .then(function(result) {
            if (result.code == 200) {
              lbs.cityId = result.data.areaId;
              lbs.cityName = result.data.name;
              me.saveLbs(para, lbs);
              // trigger city changed
            } else {
              console.debug("mobile/city error.", result);
            }
          });
        } else {
          me.saveLbs(para, lbs);
        }
      },
      saveLbs: function(para, lbs) {
        lbs.origin = para;
        lbs.longitude = para.longitude;
        lbs.latitude = para.latitude;
        storageUtil.set("LBS", lbs);
      }
  };
  
  return NativeIf;
});