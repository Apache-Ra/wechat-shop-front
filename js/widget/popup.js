define(["text!../../template/widget/popup.html", "css!../../theme/css/popup.css"],
    		function(template) {

	var popup ={
	    POPUP_ID : "common_popup_alert"
	};
	
	/**
	 * 初始化
	 */
	popup.popup = function(setting) {
    $.mobile.loading('hide');
	  this.setting = setting;
	  var $dom = this.getContent();
	  $dom.find(".m-popup-content").html(setting.msg);
	  $dom.show();
    setTimeout(function() {
      $dom.fadeOut(1000);
    }, 0);
	};
	
	popup.getContent = function() {
	  var me = this;
	  if ($("#common_popup_alert").length > 0) {
      return $("#common_popup_alert");
    }
    
    $( ":mobile-pagecontainer" ).append(template);
    
    return $("#common_popup_alert");
	};
	
	return popup
});
