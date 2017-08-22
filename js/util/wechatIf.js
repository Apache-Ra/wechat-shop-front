define([ 'util/util', 'util/nativeIf' ], function(util, nativeIf) {
  var WechatIf = {
    start : function() {
//      this.startListener();
      var me = this;
      if (typeof WeixinJSBridge != "undefined") {
        setTimeout(function() {
          me.startListener();
        }, 0);
      }
    }, 
    startTest: function() {
        
        var a = {
          title : '麻布爆品', // 分享标题
          desc : '互联网爆品秒杀抢购平台，享不够的低价！', // 分享描述
          link : window.location.href, // 分享链接
          imgUrl : KDXWechat.baseUrl+'/theme/css/img/MB_LOGO.jpg', // 分享图标
          success : function() {
            // 用户确认分享后执行的回调函数
          },
          cancel : function() {
            // 用户取消分享后执行的回调函数
          }
        };
        
        alert("start");
        WeixinJSBridge.on("menu:share:appmessage", function () {
              alert("menu:share:appmessage complete");
              WeixinJSBridge.invoke("sendAppMessage", {
                  title: a.title,
                  desc: a.desc,
                  link: a.link,
                  img_url: a.imgUrl
                }, function(res) {
                  alert(res.err_msg);
                });
            }, function(res) { 
              alert(res.err_msg);
            });
    },
    startListener : function() {
      // 分享到朋友圈
      nativeIf.wx.onMenuShareTimeline({
        title : '麻布爆品', // 分享标题
        desc : '互联网爆品秒杀抢购平台，享不够的低价！', // 分享描述
        link : window.location.href, // 分享链接
        imgUrl : KDXWechat.baseUrl+'/theme/css/img/MB_LOGO.jpg', // 分享图标
        success : function() {
          // 用户确认分享后执行的回调函数
        },
        cancel : function() {
          // 用户取消分享后执行的回调函数
        }
      });
      // 获取“分享给朋友”按钮点击状态及自定义分享内容接口
      nativeIf.wx.onMenuShareAppMessage({
        title : '麻布爆品', // 分享标题
        desc : '互联网爆品秒杀抢购平台，享不够的低价!', //分享描述
        link : window.location.href, // 分享链接
        imgUrl : KDXWechat.baseUrl+'/theme/css/img/MB_LOGO.jpg', //分享图标
        success : function() {
          // 用户确认分享后执行的回调函数
        },
        cancel : function() {
          // 用户取消分享后执行的回调函数
        }
      });

      // 获取“分享到QQ”按钮点击状态及自定义分享内容接口
      nativeIf.wx.onMenuShareQQ({
        title : '麻布爆品', // 分享标题
        desc : '互联网爆品秒杀抢购平台，享不够的低价！', // 分享描述
        link : window.location.href, // 分享链接
        imgUrl : KDXWechat.baseUrl+'/theme/css/img/MB_LOGO.jpg', // 分享图标
        success : function() {
          // 用户确认分享后执行的回调函数
        },
        cancel : function() {
          // 用户取消分享后执行的回调函数
        }
      });
    }
  };

  return WechatIf;
});
