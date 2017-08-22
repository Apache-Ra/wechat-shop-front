define([ 'util/util', 'util/domUtil', 'manifest', 'core/navigation',  "text!../../template/widget/confirm.html", "css!../../theme/css/confirm.css"],
    		function( util, domUtil, manifest, navigation, template) {

	var confirm ={
	    confirm_ID : "common_confirm_alert"
	};
	
	/**
	 * 初始化
	 */
	confirm.confirm = function(setting) {
    $.mobile.loading('hide');
	  var me = this;
	  var $dom = this.getContent();
	  var $data = domUtil.getDomByName($dom);
	  
	  if (setting.title) {
	    $data.title.val(setting.title);
	  }
	  
    if (setting.message) {
      $data.message.val(setting.message);
    }
	  
    if (setting.cancelBtn) {
      $data.cancelBtn.val(setting.cancelBtn);
    }

    $data.cancelBtn.dom.one("tap", function() {
      me.close();
      if (setting.cancelCb) {
        setting.cancelCb();
      }
    });

	  if (setting.okBtn) {
      $data.okBtn.val(setting.okBtn);
    }

    $data.okBtn.dom.one("tap", function() {
      me.close();
      if (setting.okCb) {
        setting.okCb();
      }
    });

    $dom.popup("open");
	};
	
	confirm.getContent = function() {
	  var me = this;
	  if ($("#common_confirm_alert").length > 0) {
      return $("#common_confirm_alert");
    }
    
    $( ":mobile-pagecontainer" ).append(template);
    var $dom = $("#common_confirm_alert");
    
    return $dom.popup({history: false}).enhanceWithin();
	};
	
	confirm.close = function() {
	  this.getContent().popup("close");
	};
	
	return confirm
});
