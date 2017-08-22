define(['activity/activity','util/domUtil', 'util/format', 'util/util', 'util/storageUtil'], 
	function(Activity, domUtil, format, util, storageUtil) {
  
  var ShoppingCart = function(){
    Activity.call(this);
  };
  
  Activity.inheritedBy(ShoppingCart);

  ShoppingCart.prototype.onCreate = function() {
    var me = this;
    me.bindEventOnce();
  };

  ShoppingCart.prototype.show = function() {
    $('#shoppingCart #shoppint-cart-total-price').html("0.00");
    this.renderProductList();
  };

  ShoppingCart.prototype.renderProductList = function(result) {
    var me = this;
    me.$data['product-list-container'].dom.html('');
    storageUtil.get('SHOPPING_CART').then(function(result){
			for ( var k in result) {
	      var data = result[k];
	      var $product = me.$data["product-item-template"].dom.clone();
	      $product.removeAttr("name");
	      $product.attr("id", 'li-product-' + data.productId);
	      $product.find("img").attr("src", format.photoImgUrl(data.productImage, "300x0"));
	      $product.find(".list-item-checkbox-icon").attr("product", data.productId);
        $product.find(".list-item-checkbox-icon").attr("terminal-store", data.terminalStoreId);
        $product.find(".list-item-count-input").val(data.count ? data.count : 1);	
        $product.find(".terminal-store").attr('id', data.terminalStoreId);  
        
	      var $dom = domUtil.getDomByName($product);
	      $dom.productName.val(data.productName);
	      $dom.productSpec.val(data.productSpec);
	      $dom.salePrice.val(format.fromCurrency(data.salePrice));
        $dom.terminalStoreName.val(data.terminalStoreName);
	      me.$data['product-list-container'].dom.append($product);

	      me.bindEvent($product);
	    }
			
			me.renderEmpty();
    });
  };
  
  ShoppingCart.prototype.renderEmpty = function() {
    if (this.$data["product-list-container"].dom.find("li").length > 0) {
      this.container_.removeClass("empty");
    } else {
      this.container_.addClass("empty");
    }
  };

  ShoppingCart.prototype.removeFromShoppingCart = function() {
    var me = this;
    var selectedItems = $('#shoppingCart .list-item-checkbox-icon.active');
    var selectedProductIds = [];
    for (var i = 0; i < selectedItems.length; i++) {
    	var productId = $(selectedItems[i]).attr('product');
    	$('#li-product-' + productId).remove();
    	selectedProductIds.push(productId);
    };

    if (selectedProductIds.length) {
    	storageUtil.get('SHOPPING_CART').then(function(products){
    		var shoppingCartProducts = [];
    		for (var i = 0; i < products.length; i++) {
    			if (selectedProductIds.indexOf(products[i].productId + '') < 0) {
    				shoppingCartProducts.push(products[i]);
    			}
    		};
    		storageUtil.set('SHOPPING_CART', shoppingCartProducts);
    	});
    	
      me.renderEmpty();
    }
  };

  ShoppingCart.prototype.bindEvent = function($product, data) {
    var me = this;
    $product.bind("tap", function() {
			var checkbox = $product.find('.list-item-checkbox-icon');
    	if (checkbox.hasClass('active')) {
				checkbox.removeClass('active');
    	} else {
    		checkbox.addClass('active');
    	}
    	me.calcTotalPrice();
    });

    $product.find('.list-item-count-add').bind('tap', function(event){
    	event.stopPropagation();
    	event.preventDefault();

    	var input = $(this).parent().find('.list-item-count-input');
    	input.val(parseInt(input.val()) + 1);

    	me.calcTotalPrice();
    	me.saveProductCount();
    });

    $product.find('.list-item-count-minus').bind('tap', function(event){
    	event.stopPropagation();
    	event.preventDefault();

    	var input = $(this).parent().find('.list-item-count-input');
    	if (parseInt(input.val()) > 1) {
    		input.val(parseInt(input.val()) - 1);
    	}

    	me.calcTotalPrice();
    	me.saveProductCount();
    });

   $product.find('.terminal-store').bind('tap', function(event){
      event.stopPropagation();
      event.preventDefault();

      me.moveTo("storeDetail", {companyId: $(this).attr('id')});
    });
    
  };

   ShoppingCart.prototype.bindEventOnce = function($product, data) {
    var me = this;
    me.$data.removeShoppingCart.dom.on('tap', function(){
      me.removeFromShoppingCart();
      me.calcTotalPrice();
    });

    me.$data.checkOrder.dom.on('tap', function(){
      me.calcTotalPrice().then(function(totalPrice) {
        // 同步选中到localstorage
        me.checkSelectedProducts();
        if (totalPrice > 0) {
          me.moveTo('order');
        } else {
          me.info("请选择商品后再结算。");
        }
      }, function() {
        me.info("请选择同一门店的商品进行购买。");
      });
    });
  };

  ShoppingCart.prototype.calcTotalPrice = function() {
    var def = $.Deferred();
    var selectedItems = $('#shoppingCart .list-item-checkbox-icon.active');
    var selectedProductIds = [];
    var selectedTerminalStoreId;
    for (var i = 0; i < selectedItems.length; i++) {
    	var productId = $(selectedItems[i]).attr('product');
      var terminalStoreId = $(selectedItems[i]).attr('terminal-store');
    	selectedProductIds.push(productId);
      if (selectedTerminalStoreId && selectedTerminalStoreId != terminalStoreId) {
        def.reject();
        return def.promise();
      } else {
        selectedTerminalStoreId = terminalStoreId;
      }
    };

  	storageUtil.get('SHOPPING_CART').then(function(products){
  		var totalPrice = 0;
  		for (var i = 0; i < products.length; i++) {
  			if (selectedProductIds.indexOf(products[i].productId + '') >= 0 && 
          selectedTerminalStoreId == products[i].terminalStoreId) {
  				totalPrice += products[i].salePrice * parseInt(
  					$('#li-product-' + productId + ' .list-item-count-input').val())
  			}
  		};
  		$('#shoppingCart #shoppint-cart-total-price').html(format.fromCurrency(totalPrice));
  		def.resolve(totalPrice);
  	});
  	
  	return def.promise();
  };

  ShoppingCart.prototype.saveProductCount = function() {
  	storageUtil.get('SHOPPING_CART').then(function(products){
  		for (var i = 0; i < products.length; i++) {
				products[i].count = parseInt(
					$('#li-product-' + products[i].productId + ' .list-item-count-input').val());
			}
  		storageUtil.set('SHOPPING_CART', products);
  	});	
  };

  ShoppingCart.prototype.checkSelectedProducts = function() {
    var selectedItems = $('#shoppingCart .list-item-checkbox-icon.active');
    var selectedProductIds = [];
    var selectedTerminalStoreId;
    for (var i = 0; i < selectedItems.length; i++) {
      var productId = $(selectedItems[i]).attr('product');
      var terminalStoreId = $(selectedItems[i]).attr('terminal-store');
      selectedProductIds.push(productId);
      
      if (selectedTerminalStoreId && selectedTerminalStoreId != terminalStoreId) {
        return false;
      } else {
        selectedTerminalStoreId = terminalStoreId;
      }
    };

    storageUtil.get('SHOPPING_CART').then(function(products){
      for (var i = 0; i < products.length; i++) {
        if (selectedProductIds.indexOf(products[i].productId + '') >= 0 && 
            selectedTerminalStoreId == products[i].terminalStoreId) {
          products[i].checked = true;
        } else {
          products[i].checked = false;
        }
      };
      storageUtil.set('SHOPPING_CART', products);
    });
    
    return true;
  };
  
  return new ShoppingCart();
});