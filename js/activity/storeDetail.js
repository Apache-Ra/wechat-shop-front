define(['activity/activity', 'util/imgSlider', 'util/format', 'util/util', 'util/storageUtil', 'util/dateUtil'],
    function(Activity, imgSlider, format, util, storageUtil, dateUtil) {
  
  var StoreDetail = function(){
    Activity.call(this);
  };
  Activity.inheritedBy(StoreDetail);
  
  StoreDetail.prototype.onCreate = function(){
    this.bindEvents_();
  };

  StoreDetail.prototype.show = function(){
    var me = this;
//    this.toolbar.addRightButton([{
//      cssClass: "m-share-icon",
//      callback:function(){
//        if (typeof jsnative == "undefined" || !me.product) {
//          return;
//        }
//        var store = me.store;
//        var para = {
//            "command": "callShare",
//            "data": {
//              "title": store.companyName,
//              "shareText": "",
//              "imageUrl": format.prdImgUrl(store.defaultCompanyPicture, "60x0"),
//              "textUrl": ""
//            }
//        };
//        jsnative.invokeNative(JSON.stringify(para), function(e) {}, function(e){});
//      }
//    }]);
//    

//    this.toolbar.changeBackBtnBehavior(function() {
//      me.moveTo("terminalStoreList", null, {changeHash : true})
//    });
    
    storageUtil.getParam("storeDetail")
    .then(function(para) {
      if (!para.moveTo_ || para.moveTo_ == "preOrderList") {
        me.find(".m-panel-footer").hide();
      } else {
        me.find(".m-panel-footer").show();
      }
      
      me.companyId = para.companyId
      util.get('store/' + me.companyId)
      .then(function(result) {
        if (result.codeText == "OK") {
          me.store = result.data;
          me.renderDetail(result.data);
          me.getReviews_(para);
        }
      });
    });
  };

  StoreDetail.prototype.renderDescTab = function(index, display) {
    var $container = this.find(".ui-tab-content > div:eq(" + index + ")");
    var $nodata = $container.find(".nodata");
    if (display) {
      $nodata.hide();
      $nodata.siblings().show();
    } else {
      $nodata.show();
      $nodata.siblings().hide();
    }
  };
  
  StoreDetail.prototype.afterShow = function() {
    // 解决footer显示问题
    this.container_.css("padding-bottom", "50px");
  };
  
  StoreDetail.prototype.openMap = function(data) {
    // wx.openLocation({
    //   latitude: data.lat, // 纬度，浮点数，范围为90 ~ -90
    //   longitude: data.lng, // 经度，浮点数，范围为180 ~ -180。
    //   name: data.companyName, // 位置名
    //   address: data.address, // 地址详情说明
    //   scale: 26, // 地图缩放级别,整形值,范围从1~28。默认为最大
    //   infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
    // });

    //this.moveTo('storeMap', );

    var address = {longitude: data.lng, latitude: data.lat, companyName: data.companyName, address: data.address};
    this.moveTo('storeMap', address);
  };
  
  StoreDetail.prototype.renderDetail = function(store) {
    var me = this;
    me.storeData = store;
    
//    if (store.lat && store.lng) {
//      this.$data.positionMap.dom.removeClass("disabled");
//    } else {
//      this.$data.positionMap.dom.addClass("disabled");
//    }
    
    var scoreDetail = store.reviewScoreDetail || {};
    var $li = this.find(".m-store-status li");
    
    var lastIndex = $li.length-1;
    for (var index=0; index<lastIndex; index++) {
      var $item = $($li[index]);
      var type = $item.attr("type");
      $item.find("em").html(scoreDetail[type] || "5");
    }
    
    $($li[lastIndex]).find("em").html(store.appointmentCount);
    
    var $container = me.find(".m-slider-content");
    $container.empty();
    var $indicator = me.find(".m-slider-indicators");
    $indicator.empty();
    if (store.companyPictures && store.companyPictures.length > 0) {
      $container.closest("div").show();
      $(store.companyPictures).each(function() {
        var $pic = me.$data.storeDetail_image_template.dom.clone();
        $pic.removeAttr("name");
        $pic.find("img").attr("src", format.storeImgUrl(this.pictureUri, "600x0"));
        $container.append($pic);
        $indicator.append("<span></span>");
      });
      imgSlider.bind(this.find('.m_slider'));
    } else {
      $container.closest("div").hide();
    }
    
    me.$data.companyName.val(store.companyName);
    me.$data.distance.val(format.formatDistance(store.distance));
    var reviewScore = Math.max(store.reviewScore, 0);
    reviewScore = Math.min(reviewScore, 5); 
    var score = String(reviewScore || 0).split(".");
    me.find(".m-store-level-icon").addClass("level" + score[0] || 0);
    me.$data.cellphone.val(store.contactCellphone || store.phone);
    me.$data.address.val(store.address);
    if (store.lng && store.lat) {
       me.$data.address.dom.parent().off("click").on("click", function() {
         me.openMap(store);
       });
    }
//    if(store.cellphone){
//    	me.$data.callPhone.dom.attr("href", "tel:" + store.cellphone);
//    }else{
//    	me.$data.callPhone.dom.attr("href", "");
//    	me.$data.callPhone.dom.addClass("tel-disable");
//    }
    var displayCates = [];
    $(store.companyServiceCategories).each(function() {
      displayCates.push(this.category3 && this.category3.category3Name);
    });

    me.$data.companyServiceCategories.val(displayCates.join('、'));
    me.renderDescTab(0, (displayCates.length > 0));
    
    if (store.description) {
      me.$data.description.dom.closest(".list-view").one("m-tabshow", function() {
        me.$data.description.val(format.formatDescription(store.description));
      });
    }
    
    me.renderDescTab(1, !!store.description);

    // 获取是否被收藏
//    var $collect = this.find('.collect-icon');
//    $collect.removeClass("active");
//    util.get("customer/favorite", {extType: "TERMINAL_STORE", extId: store.companyId}, false, true)
//    .then(function(result) {
//      if (result.codeText == "OK" && result.data.favoriteId) {
//        $collect.addClass("active");
//        $collect.data("favoriteId", result.data.favoriteId);
//      }
//    });
  };

  StoreDetail.prototype.getReviews_ = function(para){
    var me = this;
    var param = {};
//    param.extType = "TERMINAL_STORE";
//    param.extId = para.companyId;
//    param.limit = 1;
    param.offset = 0;
    util.post('store/review/'+para.companyId, param)
    .then(function(result){
      me.renderReview_(result);
    });
  };
  
  StoreDetail.prototype.renderReview_ = function(result) {
    var review = null;
    if(result.codeText != "OK" || result.pageInfo.totalCount == 0) {
      review = {};
      this.$data.lastReviewContainer.dom.hide();
      this.$data.noReviewContainer.dom.show();
    } else {
      review = result.data[0];
      this.$data.lastReviewContainer.dom.show();
      this.$data.noReviewContainer.dom.hide();
    }
    
    this.$data.reviewCount.val(result.data.pageInfo.totalCount || 0);
    this.$data.lastReviewUser.val(review.cellphone);
    this.$data.lastReview.val(review.message);
    this.$data.reviewDate.val(dateUtil.dateStrFormat('yyyy.MM.dd', review.createTime));
    
    var $level = this.container_.find(".m-review-level-icon");
    $level.removeClass("level0 level1 level2 level3 level4 level5");
    
    var reviewScore = Math.max(review.score, 0);
    reviewScore = Math.min(reviewScore, 5); 
    var score = String(reviewScore || 0).split(".");
    $level.addClass("level" + (score[0] || 0));
  };

  StoreDetail.prototype.bindEvents_ = function(){
    var me = this;
//    this.find('.m-link2').on("tap", function(){
//    	var storeMessage = {};
//    	storeMessage.companyId = me.companyId;
//    	me.moveTo('storeProductList', storeMessage);
//    })
//    
    
    this.find('.m_evaluate').on("tap", function(){
      storageUtil.getParam("storeDetail")
      .then(function(para) {
        var bundle = {};
        bundle.extType = "TERMINALSTORE";
        bundle.extId = para.companyId;
        me.moveTo('evaluate', bundle, {transition: 'slide'});
      });
    });
    
    this.find(".m-panel-footer").on("tap", function() {
      storageUtil.getParam("storeDetail")
      .then(function(result) {
        var backPage = "terminalStoreList";
        if (result.moveTo_) {
          backPage = result.moveTo_;
        }
        
        storageUtil.set("g_selectedTerminalStore", me.storeData);
        me.moveTo(result.moveTo_);
      });
    });
    
    this.$data.referAllReview.dom.on("tap", function(){
      storageUtil.getParam("storeDetail")
      .then(function(para) {
        var bundle = {};
        bundle.extType = "TERMINAL_STORE";
        bundle.extId = para.companyId;
        me.moveTo('evaluateList', bundle, {transition: 'slide'});
      });
    });
    
    var contents = this.find('.m_tab_content').children();
    var tabs = this.find('.m_tab').children().each(function(index){
      $(this).on('tap',function(){
        var tab = tabs.removeClass('current').eq(index);
        tab.addClass('current');
        tab = contents.removeClass('current').eq(index);
        tab.addClass('current');
        tab.trigger("m-tabshow");
      });
    });
    
    me.$data.collectBtn.dom.bind('tap',function() {
      var $collect = me.find('.collect-icon');
      if ($collect.hasClass("active")) {
        var favoriteId = $collect.data("favoriteId");
        util.del("customer/favorite/" + favoriteId)
        .then(function(result) {
          if (result.codeText == "OK") {
            $collect.removeClass("active");
            $collect.removeData("favoriteId");
          }
        });
      } else {
        storageUtil.getParam("storeDetail")
        .then(function(para) {
          var bundle = {};
          bundle.extType = "TERMINAL_STORE";
          bundle.extId = para.companyId;
          util.post("customer/favorite", bundle)
          .then(function(result) {
            if (result.codeText == 'OK') {
              $collect.addClass("active");
              $collect.data("favoriteId", result.data.favoriteId);
            }
          });
        });
      }
    });
  };
  
  StoreDetail.prototype.hide = function() {
    this.$data.description.dom.closest(".list-view").off("m-tabshow");
    this.find(".m-panel-footer").hide();
    delete this.storeData;
  };
  
  return new StoreDetail();
});