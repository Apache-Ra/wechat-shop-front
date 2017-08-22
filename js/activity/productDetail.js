define(['activity/activity', 'widget/toolbar', 'util/domUtil', 'util/util', 'util/format', 'util/storageUtil',
        'util/imgSlider', 'util/categoryUtil', 'util/lbsUtil', 'util/dateUtil', 'core/navigation'],
    function(Activity, toolbar, domUtil, util, format, storageUtil, imgSlider, categoryUtil, lbsUtil, dateUtil, navigation) {
  
  var BLANK_CUSTOM_NAME = "无";
  var ProductDetail = function(){
    Activity.call(this);
  };
  
  Activity.inheritedBy(ProductDetail);
  
  var productDetailModal = {
      // 当前商品详细显示的商品
      curProduct: {},
      // 是否需要刷新
      needRefresh: true,
      // 选中的商品规格
      selectedProductSpec: [],
      // 当前商品的父商品下面的所有子商品
      sameProducts: [],
      // 当前商品分类下面的所有spec
      specs: {},
      getSpecs: function() {
        return this.specs;
      },
      hasSpec: function(specId) {
        for (var i in this.sameProducts) {
          var prd = this.sameProducts[i];
          for (var k in prd.productSpecs) {
            var spec = prd.productSpecs[k];
            if (spec.specId === specId && spec.specOptionId) {
              return true;
            }
          }
          
          return false;
        }
      },
      setSameProducts : function(data) {
        var me = this;
        this.sameProducts = data.products;
        
        var specs = {};
        $.each(data.specs, function() {
          // 当所有子商品都没有该规格的时候，不显示
          if (!me.hasSpec(this.specId)) {
            return;
          }
          specs[this.specId] = this;
//          if (!specs[this.specId]) {
//            specs[this.specId] = {
//                specName: this.specName,
//                specs: []
//            };
//          }
//          
//          specs[this.specId].specs.push(this);
        });
        
        this.specs = specs;
        this.initSelectedStatus();
        this.needRefresh = false;
      },
      setCurProduct: function(prd) {
        if (this.curProduct.parentId != prd.parentId) {
          this.needRefresh = true;
        } else {
          if (this.curProduct.productId != prd.productId){
            this.initSelectedStatus();
          }
        }
        
        this.curProduct = {};
        this.curProduct.productId = prd.productId;
        this.curProduct.parentId = prd.parentId;
        this.curProduct.productName = prd.productName;
        this.curProduct.productCode = prd.productCode;
        this.curProduct.productImage = prd.productImage;
        
        if (prd.productSpecs) {
          var html = [];
          for (var k in prd.productSpecs) {
            html.push(prd.productSpecs[k].optionName);
          }
          this.curProduct.productSpec = html.join(" ");
        }
        
        this.curProduct.salePrice = prd.salePrice;
      },
      setSelectedProductSpec: function(selSpec) {
        this.selectedProductSpec = selSpec;
      },
      getCurProduct: function() {
        return this.curProduct;
      },
      getParentId: function() {
        return this.curProduct && this.curProduct.parentId;
      },
      initSelectedStatus: function() {
        var me = this;
        // 初始化选中状态
        $.each(this.selectedProductSpec || [], function() {
          var subSpec = this;
          var spec = me.specs[this.specId];
          if (spec) {
            $(spec.specs).each(function() {
              if (this.specOptionId == subSpec.specOptionId) {
                this.selected = true;
              }
            })
          }
        });
      },
      getSameProducts: function() {
        return this.sameProducts;
      },
      changeSelectedProductSpec : function(specId, specOptionId, optionName) {
        var me = this;
        $.each(this.selectedProductSpec, function() {
          if (this.specId == specId) {
            this.specOptionId = specOptionId;
            this.optionName = optionName;
            return false;
          }
        });
        
        var find = me.findMatched_(me.sameProducts, this.selectedProductSpec);
        if (find) {
          this.setCurProduct($.extend(true, {}, find));
        }
        // 刷新各个span的状态
        me.refreshSpecStatus(specId, optionName);
        return !!find;
      },
      
      refreshSpecStatus: function(specId, optionName) {
        var me = this;
        var spec = me.specs[specId];
        if (!spec) {
          alert("error");
          return;
        }
        
        // 刷新选中状态
        $(spec.specOptions).each(function() {
          this.selected = (this.optionName == optionName);
          if (this.selected) {
            this.dom.addClass("current");
          } else {
            this.dom.removeClass("current");
          }
        });
      },
      testMatch : function(specName, optionName) {
        var me = this;
        var selPrdSpec = $.extend(true, {}, this.selectedProductSpec);
        $.each(selPrdSpec, function() {
          if (this.specName == specName) {
            this.optionName = optionName;
            return false;
          }
        });
        
        return !!me.findMatched_(me.sameProducts, selPrdSpec);
      },
      findMatched_ : function(mainSpecs, curSpecs) {
        var me = this;
        var found = null;
        for (var k in mainSpecs) {
          if (me.isEquals_(mainSpecs[k].productSpecs, curSpecs)) {
            found = mainSpecs[k];
            break;
          }
        }
        
        return found;
      },
      isEquals_ : function(subPrdSpecs, curSpecs) {
        var find = false;
        $(subPrdSpecs).each(function() {
          var spec = this;
          if (!spec.specOptionId) {
            return;
          }
          find = false;
          $(curSpecs).each(function() {
            if (this.specId == spec.specId) {
              if (this.specOptionId == spec.specOptionId) {
                find = true;
              }
              return false;
            }
          });
          
          if (!find) {
            return false;
          }
        });
        
        return find;
      },
      reset: function() {
        this.curProduct = {};
        this.selectedProductSpec = [];
        this.sameProducts = [];
        this.specs = {};
        this.needRefresh = true;
      }
  };
  
  /**
   * 页面第一次创建执行
   * 这里绑定唯一事件，加载唯一数据
   */
  ProductDetail.prototype.onCreate = function() {
  };
  
  ProductDetail.prototype.unBindEvent = function() {
    console.log("unbind");
    var me = this;
//    me.$data.selectOtherStore.dom.off("tap");
    
    me.$data.collectBtn.dom.off('tap');
    
    me.container_.find(".ui-tab-nav li").off("tap");
    
    // 商品描述和规格属性切换
    me.container_.find('.product-specs').off("tap");
    
    me.$data.referAllReview.dom.off("tap");
    
    me.$data.panelOk.dom.off("tap");
    
    me.$data.panelClose.dom.off("tap");

    me.$data.addShoppingCart.dom.off("tap");
    
    me.$data.appointMentBtn.dom.off("tap");
    
//    me.$data.storeDetail.dom.off("tap");
  };
  
  ProductDetail.prototype.bindEvent = function() {
    console.log("bindEvent");
    var me = this;
//    me.$data.selectOtherStore.dom.on("tap", function() {
//      navigation.moveTo("terminalStoreList", {moveTo_: "productDetail"});
//    });
    
    me.$data.collectBtn.dom.on('tap',function() {
      var $collect = me.container_.find('.collect-icon');
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
        var prd = productDetailModal.getCurProduct();
        if (prd && prd.productId) {
          var para = {};
          para.extType = 'PRODUCT';
          para.extId = prd.productId;
          util.post("customer/favorite", para)
          .then(function(result) {
            if (result.codeText == 'OK') {
              $collect.addClass("active");
              $collect.data("favoriteId", result.data.favoriteId);
            }
          });
        }
      }
    });
    
    this.container_.find(".ui-tab-nav li").on("tap", function() {
      if ($(this).hasClass("current")) {
        return;
      }
      
      $(this).siblings(".current").removeClass("current");
      $(this).addClass("current");
      var target = $(this).data("target");
      var targetTab = me.$data[target].dom.closest("li");
      targetTab.siblings().hide();
      targetTab.show();
    });
    
    // 商品描述和规格属性切换
    this.container_.find('.product-specs').on("tap", function() {
      if (!productDetailModal.needRefresh) {
        me.container_.find(".productSpecsPanel").panel( "toggle" );
        return;
      }

      var prd = productDetailModal.getCurProduct();
      util.get('product/same/' + prd.productId)
      .then(function(result) {
        if (result.codeText != "OK") {
          return;
        }
        
        productDetailModal.setSameProducts(result.data);
        me.renderSubProductPanel_();
        me.container_.find(".productSpecsPanel").panel( "toggle" );
      });
    });
    
    this.$data.referAllReview.dom.on("tap", function() {
      var prd = productDetailModal.getCurProduct();
      navigation.moveTo("evaluateList", {extType: "PRODUCT", extId: prd.productId});
    });
    
    this.$data.panelOk.dom.on("tap", function() {
      var prd = productDetailModal.getCurProduct();
      storageUtil.setParam("productDetail", {productId: prd.productId});
      me.container_.find(".productSpecsPanel").panel( "toggle" );
      me.unBindEvent();
      me.show();
    });
    
    this.$data.panelClose.dom.on("tap", function() {
      me.container_.find(".productSpecsPanel").panel( "toggle" );
    });

    this.$data.addShoppingCart.dom.on("tap", function() {
      var prd = productDetailModal.getCurProduct();
      if (!prd || !prd.productId) {
        return;
      }
//      if (!me.localPara.terminalStoreId) {
//        me.error("尚未选择服务店，无法下单。");
//        return;
//      }
      me.addToShoppingCart(productDetailModal.getCurProduct());
    });
    
    this.$data.appointMentBtn.dom.on("tap", function() {
      var prd = productDetailModal.getCurProduct();
      if (!prd || !prd.productId) {
        return;
      }
//      if (!me.localPara.terminalStoreId) {
//        me.error("尚未选择服务店，无法下单。");
//        return;
//      }

      me.addToShoppingCart(productDetailModal.getCurProduct(), true);
    });
    
//    this.$data.storeDetail.dom.on("tap", function() {
//      me.moveTo("storeDetail", {companyId: me.localPara.terminalStoreId});
//    });
  };
  
  ProductDetail.prototype.renderSubProductPanel_ = function() {
    var me = this;
    var curPrd = productDetailModal.getCurProduct();
    var sameProducts = productDetailModal.getSameProducts();
    var specs = productDetailModal.getSpecs();
    
    me.$data.productCode.val(curPrd.productCode);
    var salePrice = format.fromCurrency(curPrd.salePrice);
    me.$data.productSalePrice.val(salePrice);
    
    var $panel = this.container_.find(".m-panel-content .divTable");
    $panel.empty();
    
    for (var k in specs) {
      var spec = specs[k];
      
      
      var $html = $("<div class='drow'><div class='dcell'><span specId=" + k + ">" + spec.specName + "</span></div></div>");
      $panel.append($html);
      var $dcell = $("<div class='dcell'></div>");
      $html.append($dcell);
      
      $.each(spec.specOptions, function() {
        var $span = $("<span specOptionId=" + this.specOptionId + ">" + this.optionName + "</span>");
        $dcell.append($span);
        this.dom = $span;
        if (this.selected) {
          $span.addClass("current");
        }
      });
    }
    
    // bind sidepanel event
    me.container_.find(".divTable .dcell:last-child span").on("tap", function() {
      var $this = $(this);
      me.checkDisabledAttr($this);
    });
  };
  
  ProductDetail.prototype.checkDisabledAttr = function($this) {
    if ($this.hasClass("current")) {
      return;
    }
    
    var $thisRow = $this.closest(".drow");
    var specId = $.trim($thisRow.find(".dcell:first-child span").attr("specId"));
    var optionName = $.trim($this.html());
    var specOptionId = $this.attr("specOptionId");
    
    var find = productDetailModal.changeSelectedProductSpec(specId, specOptionId, optionName);
    if (find) {
      this.$data.panelOk.dom.removeClass("ui-disabled");
    } else {
      this.$data.panelOk.dom.addClass("ui-disabled");
    }
  };
  
  /**
   * 加载动态数据，刷新标题等
   */
  ProductDetail.prototype.show = function() {
    var me = this;
//    this.toolbar.addRightButton([{
//      cssClass: "m-share-icon",
//      callback:function(){
//        if (typeof jsnative == "undefined" || !me.product) {
//          return;
//        }
//        var prd = me.product;
//        var para = {
//            "command": "callShare",
//            "data": {
//              "title": prd.productName,
//              "shareText": "",
//              "imageUrl": format.prdImgUrl(prd.productImage, "60x0"),
//              "textUrl": ""
//            }
//        };
//        jsnative.invokeNative(JSON.stringify(para), function(e) {}, function(e){});
//      }
//    }]);
    productDetailModal.reset();

    me.localPara = {};
    storageUtil.getParam("productDetail")
    .then(function(para) {
      if (!para && !para.productId) {
        return;
      }
      
      util.get('product/detail/' + para.productId).then(function(result) {
        if(result.codeText != 'OK' || !result.data) {
          return;
        }
        
        me.renderProduct_(result.data, para);
        // 显示规格属性
        me.renderProductSpecs(result.data.productSpecs);
        me.bindEvent();
      });

      // 商品属性渲染 只执行一次
      me.descDisplay(para.productId);
      
      util.post('product/review/' + para.productId, {offset:0}).then(function(result) {
        me.renderReview_(result);
      });
    });
  };
  
//  ProductDetail.prototype.getSelfTerminalStore = function() {
//    var me = this;
//    storageUtil.get("g_selectedTerminalStore")
//    .then(function(store) {
//      if (store && store.companyId) {
//        me.renderTerminalStore_(store, false);
//        me.$data.storeInfo.dom.show();
//      } else {
//        me.$data.storeInfo.dom.hide();
//      }
//    });
//  };
  
//  ProductDetail.prototype.renderTerminalStore_ = function(store, hideSelect) {
//    this.localPara.terminalStoreId = store.companyId;
//    this.localPara.terminalStoreName = store.companyName;
//    this.$data.storeName.val(store.companyName);
//    this.$data.distance.val(format.formatDistance(store.distance));
//    this.$data.storeImg.dom.attr("src", format.storeImgUrl(store.defaultCompanyPicture, "300x0"));
//    
//    var phone = store.contactCellphone || store.phone;
//    if(phone){
//    	this.$data.nativeCall.dom.attr("href", "tel:" + phone);
//    	this.$data.nativeCall.dom.find("span").html(phone);
//    }else{
//    	this.$data.nativeCall.dom.attr("href", "");
//    	this.$data.nativeCall.dom.addClass("tel-disable");
//      this.$data.nativeCall.dom.find("span").html("未提供电话");
//    }
//    
//    var $level = this.container_.find(".m-store-level-icon")
//    $level.removeClass("level0 level1 level2 level3 level4 level5");
//    
//    var reviewScore = Math.max(store.reviewScore, 0);
//    reviewScore = Math.min(reviewScore, 5); 
//    var score = String(reviewScore || 0).split(".");
//    $level.addClass("level" + (score[0] || 5));
//
//    var displayCates = [];
//    $(store.companyServiceCategories).each(function() {
//      displayCates.push(this.category3 && this.category3.category3Name);
//    });
//    
//    if (displayCates.length == 0) {
//      displayCates.push("暂无");
//    }
//    
//    this.$data.storeService_category.val(displayCates.join(" "));
//    
//    if (hideSelect) {
//      this.$data.selectOtherStore.dom.hide();
//    } else {
//      this.$data.selectOtherStore.dom.show();
//    }
//  };
  
  ProductDetail.prototype.renderProduct_ = function(prd, para) {
    var me = this;
    
    // 获取门店信息
//    me.getSelfTerminalStore();
    
    me.product = prd;
    
    // 获取是否被收藏
    var $collect = this.container_.find('.collect-icon');
    $collect.removeClass("active");
    
    // render商品信息
    var $ul = me.container_.find(".m-slider-content");
    $ul.empty();
    var $ulIndicators = me.container_.find(".m-slider-indicators");
    $ulIndicators.empty();
    
    // 加载商品图片
    if (prd.pictures && prd.pictures.length > 0) {
      $ul.closest("div").show();
      $.each(prd.pictures, function(index) {
        var $li = $("<li><img/></li>");
        $ul.append($li);
        $li.find("img").attr("src", format.prdImgUrl(this.pictureUri, "600x0"));
        var $span = $("<span></span>");
        $ulIndicators.append($span);
      });
      
      imgSlider.bind(me.container_.find(".m-slider"));
    } else {
      $ul.closest("div").hide();
    }

    productDetailModal.setCurProduct(prd);
    var $price = this.container_.find(".ui-footer .price");
    $($price[0]).html(format.fromCurrency(prd.salePrice));
    $($price[1]).html(format.fromCurrency(prd.salePrice / 0.8));
    this.container_.find(".order-count span:last-child").html(format.formatNumber(prd.appointmentCount));

    // 商品名称
    this.$data.productName.val(prd.productName);
    
    var $fr = this.container_.find(".text-fr");
    var $level = $fr.find(".m-review-level-icon");
    $level.removeClass("level0 level1 level2 level3 level4 level5");
    
    var reviewScore = Math.max(prd.reviewScore, 0);
    reviewScore = Math.min(reviewScore, 5); 
    var score = String(reviewScore || 0).split(".")[0] || 5;
    var hScore = (parseInt(score[0]) || 5);
    var lScore = parseInt(score[1]);
    $level.addClass("level" + hScore);
    $fr.find("i").html(hScore + "<em>" + (lScore ? ("." + lScore) : "") + "</em>");
  };
  
  ProductDetail.prototype.renderReview_ = function(result) {
    if(result.codeText != "OK" || result.pageInfo.totalCount == 0 || result.data) {
      this.$data.lastReviewContainer.dom.hide();
      this.$data.noReviewContainer.dom.show();
    } else {
      this.$data.lastReviewContainer.dom.show();
      this.$data.noReviewContainer.dom.hide();
      
      var review = result.data[0];
      this.$data.lastReviewUser.val(review.cellphone);
      this.$data.lastReview.val(review.message);
      this.$data.reviewDate.val(dateUtil.dateStrFormat('yyyy.MM.dd', review.createTime));
      
      var $level = this.$data.reviewScore.dom;
      $level.removeClass("level0 level1 level2 level3 level4 level5");
      
      var reviewScore = Math.max(review.score, 0);
      reviewScore = Math.min(reviewScore, 5); 
      var score = String(reviewScore || 0).split(".");
      $level.addClass("level" + (score[0] || 5));
    }
    this.$data.reviewCount.val(result.pageInfo.totalCount);
  };
  
  /**
   * 显示规格属性
   */
  ProductDetail.prototype.renderProductSpecs = function(productSpecs) {
    var me = this;
    // 规格
    var html = [];
    if (productSpecs) {
      $.each(productSpecs, function() {
        if (this.optionName) {
          html.push(this.optionName);
        }
      });
    }
    
    productDetailModal.setSelectedProductSpec(productSpecs);
    
    if (html.length > 0) {
      me.$data.productSpecs.dom.closest("li").show();
      me.$data.productSpecs.val(html.join(" "));
    } else {
      me.$data.productSpecs.dom.closest("li").hide();
    }
  };
  
  ProductDetail.prototype.descDisplay = function(productId) {
    var me = this;
    me.$data.productAttributes.dom.empty();
    me.$data.productDescription.val("");
    
    util.get("product/attribute/" + productId)
    .then(function(result) {
      var attrs = {};
      for (var k in result.data) {
        if (!attrs[result.data[k].attribute1Name]) {
          attrs[result.data[k].attribute1Name] = [];
        }
        attrs[result.data[k].attribute1Name].push(result.data[k]);
      }

      var $attr = me.$data.productAttributes.dom;
      for (var k in attrs) {
        var $li = $("<li class='ui-border-t group-title'><span class='m-label'>" + k + "</span><span></span>");
        $attr.append($li);
        
        $.each(attrs[k], function() {
          $li = $("<li class='ui-border-t'><span class='m-label'>" + this.attribute2Name + "</span><span>" + this.optionName + "</span>");
          $attr.append($li);
        });
      }
    });

    util.get("product/desc/" + productId)
    .then(function(result) {
      // 商品描述
      var desc = format.formatDescription(result.data.description);
      if (!desc) {
        var a = 2;
      }
      me.$data.productDescription.val(desc);
    });
  };
  
  /**
   * 执行清理工作
   */
  ProductDetail.prototype.hide = function(event, ui) {
    var me = this;
    me.unBindEvent();
    me.localPara = null;
    imgSlider.unbind(me.container_.find(".m-slider"));
  };

  ProductDetail.prototype.addToShoppingCart = function(product, buyNow) {
    if (!product || !product.productId) {
      return;
    }

    var me = this;
//    if (!me.localPara.terminalStoreId) {
//      me.error("尚未选择服务店，无法下单。");
//      return;
//    }

    storageUtil.get('SHOPPING_CART').then(function(shoppingCart){
      if (!$.isArray(shoppingCart)) {
        shoppingCart = [];
      } 

      var isFound = false;
      for (var i = 0; i < shoppingCart.length; i++) {
        if (shoppingCart[i].productId == product.productId) {
//          if (shoppingCart[i].terminalStoreId == me.localPara.terminalStoreId) {
//            shoppingCart[i].count++;
            isFound = shoppingCart[i];
            break;
//          }
        }
        
        if (buyNow) {
          shoppingCart[i].checked = false;
        }
      };

      if (isFound) {
        isFound.checked = true;
        isFound.count = 1;
      } else {
        product.count = 1;
        product.checked = true;
//        product.terminalStoreId = me.localPara.terminalStoreId;
//        product.terminalStoreName = me.localPara.terminalStoreName;
        shoppingCart.push(product);
      }
      
      storageUtil.set('SHOPPING_CART', shoppingCart);
      if (buyNow) {
        me.moveTo("order");
      } else {
        me.moveTo("shoppingCart");
      }
    });
  };
  
  return new ProductDetail();
});