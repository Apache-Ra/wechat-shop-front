define(['activity/activity','util/domUtil', 'util/format', 'util/util', 'util/storageUtil', 'widget/popup'], 
	function(Activity, domUtil, format, util, storageUtil, popup) {
  
  var Address = function(){
    this.provinces = null;
    Activity.call(this);
  };

  Activity.inheritedBy(Address);

  Address.prototype.onCreate = function() {
    this.bindEvent();
  };

  Address.prototype.show = function() {
    var me = this;
    this.showDefaultAddress();
  };

  Address.prototype.bindEvent = function() {
    var me = this;
    
    $('#province-select').on('change', function() {
      me.fetchAddress(null, $('#province-select').val(), function(data) {
        me.appendAreaOption('city-select', data);
        if (data && data.length == 1) {
          me.fetchAddress(null, $('#city-select').val(), function(data) {
            me.appendAreaOption('area-select', data);
          });
        }
      });
    });

    $('#city-select').on('change', function() {
      me.fetchAddress(null, $('#city-select').val(), function(data) {
        me.appendAreaOption('area-select', data);
      });
    });


    $('#save-address').on('tap', function() {
      me.saveAddress();
    });

  };

  Address.prototype.showDefaultAddress = function() {
    var me = this;
    this.fetchAddress(this.provinces, 0, function(data) {
      me.provinces = data;
      me.appendAreaOption('province-select', data);

      me.fetchAddress(null, $('#province-select').val(), function(data) {
        me.appendAreaOption('city-select', data);

        me.fetchAddress(null, $('#city-select').val(), function(data) {
          me.appendAreaOption('area-select', data);
        });
      });

    });
  };

  Address.prototype.appendAreaOption = function(selectId, data) {
    var obj = $('#' + selectId);
    obj.html('');
    obj.append('<option value="">请选择</option>');
    for (var i = 0; data && i < data.length; i++) {
      obj.append('<option value=' + data[i].areaId + '>' + data[i].name + '</option>');
    };
  };
  
  Address.prototype.saveAddress = function (e) {
      if (!this.checkEmpty()) return;
      var me = this;
      util.post('/user/address/add', {
          "areaId": $('#area-select').val(),
          "customerName": $('#txt_recievename').val(),
          "cellphone": $('#txt_cellphone').val(),
          "address": $('#txt_detailaddress').val(),
          "selected": 1
      }).then(function (isSuccess, data) {
          if (isSuccess) {
            me.back();
          } else {
              alert("添加收货地址失败, 请稍候重试");
          }
      });
  };
  Address.prototype.checkEmpty = function () {
      var title = '收货地址有误';
      if (!$('#txt_recievename').val()) {
        popup.popup({title: title, msg: '请输入收货人'});
        return false;
      }

      if (!$('#txt_cellphone').val()) {
        popup.popup({title: title, msg: '请输入联系电话'});
        return false;
      }

      if (!/^(1[0-9][0-9]{9})$/.test($('#txt_cellphone').val())) {
        popup.popup({title: title, msg: '联系电话有误，请重新输入'});
        return false;
      }

      if (!$('#area-select').val()) {
        popup.popup({title: title, msg: '请选择省市区'});
        return false;
      }

      if (!$('#txt_detailaddress').val()) {
        popup.popup({title: title, msg: '请输入详细地址'});
        return false;
      }

      return true;
  };

  Address.prototype.fetchAddress = function (cache, areaId, callback) {
      if (cache) {
        callback ? callback(cache) : false;
        return;
      }
      util.get('area', {parentId: areaId}, true, true, true).then(function (result) {
        callback ? callback(result.data ? result.data : []) : false;
      });
  };
  
  return new Address();
});