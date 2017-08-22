define(['manifest', 'util/storageUtil'],
    function( manifest, storageUtil, util) {
  var navigation = {
      moveTo: function(activityId, bundle, slidPara) {
        if (bundle) {
          storageUtil.setParam(activityId, bundle || {});
        }
        //var dataUrl = manifest.path.baseUrl + "index.html?page=" + activityId + "&aaa=" + (new Date()).getTime();
        var dataUrl = manifest.path.baseUrl + "index.html?page=" + activityId;
        if (bundle && bundle.page) {
          delete bundle.page;
        }
        
        if (!bundle) {
        	bundle = {};
        }

        dataUrl += '&' + $.param(bundle || {campaignId: GLOBAL_PARA.campaignId});
        //slidPara = $.extend({dataUrl: dataUrl}, slidPara || {transition: "slide"});
        slidPara = $.extend({dataUrl: dataUrl}, slidPara, {transition: "none"});
        $.mobile.loading('show');
        $( ":mobile-pagecontainer" ).pagecontainer( "change", dataUrl, slidPara);
        console.log("moveTo " + activityId);
      },
      back: function(activityId) {
        if ($.mobile.navigate.history.activeIndex > 1) {
          $.mobile.back();
        } else {
          this.moveTo(activityId || "home");
        }
      }
  };
  
  return navigation;
});
