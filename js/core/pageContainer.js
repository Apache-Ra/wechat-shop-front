define(['manifest', 'core/navigation', 'util/util', 'util/wechatIf', 'util/nativeIf', 'util/lbsUtil', 'util/storageUtil', 'widget/toolbar'],
    function(manifest, navigation, util, wechatIf, nativeIf, lbsUtil, storageUtil, toolbar) {
  var KDXWechat_CONTROLLER = "appController";
  var pageContainer = {
      createActivityUrl: function(config) {
        return [manifest.path.activity + config.activity, "text!" + manifest.path.layout + config.layout, "css!" + manifest.path.css + config.activity + ".css" ];
      },
      start: function(specialPage) {

      	storageUtil.clearParam();
        console.log("start pagecontainer");
        nativeIf.start();
        // 旧page_parameter有错误内容，移除一下，后续使用page_parameter_v1
        storageUtil.remove("page_parameter");
        
        var me = this;
        $( ":mobile-pagecontainer" ).pagecontainer({
          /**
           * 可以在这里阻止页面跳转
           */
          beforechange: function(event, ui) {
            if (typeof ui.toPage === "object") {
              var activity = ui.toPage.data(KDXWechat_CONTROLLER);
              if (!activity) {
                return;
              }
              toolbar.refresh(activity.id_);
              if (activity && activity.beforechange) {
                return activity.beforechange(event, ui);
              }
            } else {
              console.debug("beforechange");
              var activity = ui.prevPage.data(KDXWechat_CONTROLLER);
              var container = ui.prevPage.data(KDXWechat_CONTROLLER);
              if (activity && activity.beforechange) {
                return activity.beforechange(event, ui);
              }
            }
          },
          /**
           * 很神奇的方法，用于自己加载html，例如用requiretext插件或者用jsrender，可以在这里替换原始load
           */
          beforeload: function(event, ui) {
            console.debug("beforeload");
            var para = util.getUrlParam(ui.toPage);
            var activityId = para.page;
            if (!activityId) {
              return;
            }
            var config = manifest.application.activity.getActivityById(activityId);
            if (!config) {
              return;
            }
            
            
            
            document.title = config.mainTitle || "美贝直通车";
            
            event.preventDefault();
            require(me.createActivityUrl(config), function(activity, template) {
                var $page = $("#" + activityId);
                if ($page.length == 0) {
                  $page = $(template);
                  $("body").append($page);
                  $page.data(KDXWechat_CONTROLLER, activity);
                  activity.create($page, activityId);
                  $page.attr("data-url", $.mobile.path.convertUrlToDataUrl(ui.toPage));
                }
                
                ui.deferred.resolve(ui.absUrl, ui.options, $page)
            });
          },
          /**
           * 可以在这时候加载数据
           */
          beforeshow: function(event, ui) {
            if (ui.toPage) {
              var activity = ui.toPage.data(KDXWechat_CONTROLLER);
              if (activity && activity.show) {
                setTimeout(function() {
                  $.mobile.loading('hide');
                  activity.show(event, ui);
//                  nativeIf.start();
//                  nativeIf.g_def.then(function() {
                    wechatIf.start();
//                  });
                }, 200);
              }
            }
            console.debug("beforeshow");
          },
          /**
           * 所有加载和动画完成
           */
          change: function(event, ui) {
            console.debug("change");
          },
          /**
           * Triggered when the pagecontainer is created.
           */
          create: function() {
            // ignore 暂时不用
            console.debug("create");
          },
          /**
           * 执行清理工作
           */
          hide: function(event, ui) {
            console.debug("hide");
            if (ui.prevPage) {
              var activity = ui.prevPage.data(KDXWechat_CONTROLLER);
              if (activity && activity.hide) {
                activity.hide(event, ui);
              }
              
              ui.prevPage.remove();
            }
          },
          load: function(event, ui) {
            console.debug("load");
            // ignore;
          },
          /**
           * 加载数据
           */
          show: function(event, ui) {
            if (ui.toPage) {
              var activity = ui.toPage.data(KDXWechat_CONTROLLER);
              if (activity && activity.afterShow) {
                return activity.afterShow(event, ui);
              }
            }
          },
          _eof:null
        });
        
        setTimeout(function() {
          var para = util.getUrlParam();
          var activityId = para.page || manifest.application.activity.getLauncherId();
          if (specialPage) {
            storageUtil.set("afterSpecialPage", {activityId:activityId});
            activityId = specialPage;
          }
          
          if (para.code) {
            delete para.code;
          }
          storageUtil.putParam(activityId, para);
          
          var config = manifest.application.activity.getActivityById(activityId);
          if (!config) {
            alert("非法页面ID");
            return;
          }
          
          var dataUrl = window.location.href;
          toolbar.init();
          require(me.createActivityUrl(config), function(activity, template) {
            var $page = $(template);
            $("body").append($page);
            $page.data(KDXWechat_CONTROLLER, activity);
            activity.create($page, activityId);
            $page.attr("data-url", $.mobile.path.convertUrlToDataUrl(dataUrl));

            navigation.moveTo(activityId, para, {changeHash: (!para.page || para.page != activityId) ? true : false, transition: "fade"});
            
            $("#global_footer").removeClass("hide");
          });
        }, 0);
      }
  };
  
  return pageContainer;
});
