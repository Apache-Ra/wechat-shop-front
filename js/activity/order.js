define(['activity/activity','util/domUtil', 'util/format', 'util/util', 'util/storageUtil', 'widget/popup'], 
	function(Activity, domUtil, format, util, storageUtil, popup) {
  
  var Order = function(){
    Activity.call(this);
  };
  
  Activity.inheritedBy(Order);

  Order.prototype.onCreate = function() {
    $('#order #order-container').html('');
    var orderTemplate = this.$data["order-template"].dom.clone();
    this.$data['order-container'].dom.append(orderTemplate);
    this.bindEvent();
  };

  Order.prototype.show = function() {
    this.showDefautlAddress();
    this.renderProductList();
  };

  Order.prototype.showDefautlAddress = function(){
    var me = this;
    me.addressId = 0;
    storageUtil.get('g_defaultAddress').then(function(address) {
      storageUtil.remove('g_defaultAddress');
      if (address && address.addressId) {
        me.renderAddress(address);
      } else {
        util.get('user/address/default').then(function(result) {
          if (result && result.data) {
            me.renderAddress(result.data);
          } else {
            me.renderAddress();
          }
        });
      }
    });
  };
  
  Order.prototype.renderAddress = function(address) {
    var me = this;
    if (address && address.addressId) {
      var data = address;
      var $address = me.$data["address-template"].dom.clone();
      var $dom = domUtil.getDomByName($address);

      $dom.addressName.val(data.customerName);
      $dom.addressPhone.val(data.cellphone);
      $dom.addressText.val(data.provinceName + ' ' + data.cityName + 
        data.areaName + '' + data.address);
      $('#order-container .address-container').html($address);
      me.addressId = data.addressId;
    } else {
      var $address = me.$data["address-template"].dom.clone();
      var $dom = domUtil.getDomByName($address);
      $dom.addressName.val('无默认收货地址');
      $dom.addressText.val('请添加新的收货地址');
      $('#order-container .address-container').html($address);
    }
  };

  Order.prototype.renderProductList = function(result) {
    var me = this;
    
    $('#order .order-product-container').html('');
    storageUtil.get('SHOPPING_CART').then(function(result){
      for ( var k in result) {
        var data = result[k];
        if (data.checked) {
          var $product = me.$data["product-item-template"].dom.clone();
          $product.removeAttr("name");
          $product.attr("id", data.productId);
          $product.attr("terminal-store-id", data.terminalStoreId);
          $product.addClass('order-product-for-save');
          $product.find("img").attr("src",
              format.photoImgUrl(data.productImage, "300x0"));
          $product.find(".list-item-checkbox-icon").attr("product",
              data.productId);
          $product.find(".list-item-count-input").val(data.count ? data.count : 1); 
          var $dom = domUtil.getDomByName($product);
          $dom.productName.val(data.productName);
          $dom.productSpec.val(data.productSpec);
          $dom.salePrice.val(format.fromCurrency(data.salePrice));
          $dom.salePrice.val(format.fromCurrency(data.salePrice));
          $dom.productCount.val(data.count);
          $dom.terminalStoreName.val(data.terminalStoreName);
          $('#order #order-container .order-product-container').append($product);

          me.calcTotalPrice(function(price) {
            $('#order #order-total-price').html(format.fromCurrency(price));
          });

          me.container_.find("textarea").on("propertychange input", function(event) {    
            if(this.value.length >= 200) {
              this.value = this.value.substring(0, 200); 
            }
          }); 
        }
      }
    });
  };

  Order.prototype.calcTotalPrice = function(callback) {
    storageUtil.get('SHOPPING_CART').then(function(products){
      var totalPrice = 0;
      for (var i = 0; i < products.length; i++) {
        if (products[i].checked) {
          totalPrice += products[i].salePrice * products[i].count;
        }
      };
      callback(totalPrice);
    }); 
  };

  Order.prototype.saveOrder = function(callback) {
    var me = this;
    var order = {};
//    order.invoiceType = 0;
//
//    if ($('#order .invoice-active').hasClass('invoice-company')) {
//      order.invoiceType = 1001;
//    }
//
//    if ($('#order .invoice-active').hasClass('invoice-personal')) {
//      order.invoiceType = 1002;
//    }
//
//    order.invoiceTitle = $('.invoice-input').val();
    order.addressId = me.addressId;
    
    var description = me.find("textArea").val();
    if (description) {
      description = description.substring(0, 200);
    }
    
    order.description = description;

    order.products = [];
    $('#order .order-product-for-save').each(function(index, element){
      var product = {productId: parseInt($(element).attr('id'))};
      product.num = parseInt($(element).find('[name=productCount]').html());
      product.terminal = parseInt($(element).attr('terminal-store-id'));
      order.products.push(product);
    });
    
    function inOrder(orderProducts, productId) {
      for (var i in orderProducts) {
        if (orderProducts[i].productId == productId) {
          return true;
        }
      }
      
      return false;
    }

    util.post('product/order', order).then(function(result){
      if (result && result.codeText == "OK") {

        // 清除购物车
        storageUtil.get('SHOPPING_CART').then(function(products){
          var shoppingCartProducts = [];
          for (var i = 0; i < products.length; i++) {
            if (!inOrder(order.products, products[i].productId)) {
              shoppingCartProducts.push(products[i]);
            }
          };
          storageUtil.set('SHOPPING_CART', shoppingCartProducts);
        });
        
        me.moveTo("payment", {data: result.data});
      } else {
        popup.popup({title: '新建订单', msg:'订单创建失败。'});
      }
    });
  };
 
  Order.prototype.bindEvent = function() {
    var me = this;
    $('#order .invoice-company').on('tap', function(){
      $('#order .invoice-input-box').show();
      $(this).addClass('invoice-active');
      $('#order .invoice-personal').removeClass('invoice-active');
    });

    $('#order .invoice-personal').on('tap', function(){
      $('#order .invoice-input-box').hide();
      $(this).addClass('invoice-active');
      $('#order .invoice-company').removeClass('invoice-active');
    });

    $('#order .address-container').on('tap', function(){
      me.moveTo('addressList', {moveTo_: "order"});
    });

    $('#order .buy-now').on('tap', function() {
      if (!me.addressId) {
        me.info("请输入您的收货地址。");
        return;
      }
      me.saveOrder();
    });
  };
  
  Order.prototype.hide = function() {
    $('#order #order-container .order-product-container').html("");
  }

  return new Order();
});