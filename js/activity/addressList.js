define(['activity/activity','util/domUtil', 'util/format', 'util/util', 'util/storageUtil'], 
	function(Activity, domUtil, format, util, storageUtil) {
  
  var AddressList = function(){
    Activity.call(this);
  };
  
  Activity.inheritedBy(AddressList);

  AddressList.prototype.onCreate = function() {
    var me = this;
    $('#addressList .add-address').on("tap", function() {
      me.moveTo('address');
    });
  };

  AddressList.prototype.show = function() {
    var me = this;
    me.$data['address-list-container'].dom.html('');
    util.post('user/address/list', {offset: 0}).then(function(result){
      if (result && result.data){
         for ( var k in result.data) {
          var data = result.data[k];
          var $address = me.$data["address-list-template"].dom.clone();
          $address.removeAttr("name");
          $address.data("address", data);
          $address.find('.address-delete-icon').attr("addressId", data.addressId);

          var $dom = domUtil.getDomByName($address);
          $dom.addressName.val(data.customerName);
          $dom.addressPhone.val(data.cellphone);
          $dom.addressText.val(data.provinceName + ' ' + data.cityName + 
            data.areaName + '' + data.address);
          me.$data['address-list-container'].dom.append($address);
          me.bindEvent($address);
        }
      }
    });
  };

  AddressList.prototype.bindEvent = function(address) {
    var me = this;
    address.on('tap', function(event){
    	storageUtil.getParam("addressList")
    	.then(function(result) {
    		if (result.moveTo_) {
    	    	storageUtil.set("g_defaultAddress", address.data('address'));
    			me.moveTo(result.moveTo_);
    		}
    	});
    });

    address.find('.address-delete-icon').on('tap', function(event) {
      event.stopPropagation();
      event.preventDefault();

      util.del('user/address/delete/' + $(this).attr('addressId')).then(function() {
        address.remove();
      });
    });
  };

  AddressList.prototype.hide = function() {
    this.$data['address-list-container'].dom.html('');
  };

  return new AddressList();
});