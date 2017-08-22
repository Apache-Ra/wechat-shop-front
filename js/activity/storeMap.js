define(['activity/activity', 'util/imgSlider', 'util/format', 'util/util', 'util/storageUtil', 'util/dateUtil', 'util/lbsUtil', 'util/domUtil'],
    function(Activity, imgSlider, format, util, storageUtil, dateUtil, lbsUtil, domUtil) {
  
  var StoreMap = function(){
    Activity.call(this);
  };
  Activity.inheritedBy(StoreMap);
  
  StoreMap.prototype.onCreate = function(){
  };

  StoreMap.prototype.show = function(){
    var me = this;
    me.showMap();
  };

  StoreMap.prototype.showMap = function(){
    if (!BMap) {
      return;
    }
    
    var me = this;
    
    $('#storeMap .mapPanel').height($('#storeMap').height());
    var map = new BMap.Map($("#storeMap .mapPanel")[0]);
    
    lbsUtil.getPosition()
    .then(function(lbs) {
      if (!lbs) {
        return;
      }
      me.renderPoint(map, lbs, 0 - 10 * 25); 

      storageUtil.getParam("storeMap").then(function(address) {
        if (!address) {
          return;
        }
        
        var point = new BMap.Point(address.longitude, address.latitude); 
        map.centerAndZoom(point, 18);                 
        map.enableScrollWheelZoom();
        map.addControl(new BMap.NavigationControl()); 
  
        me.renderPoint(map, address, 0 - 11 * 25, lbs); 
      });
    });
  };

  StoreMap.prototype.renderPoint = function(map, data, offset, lbs) {
    var me = this;
    if (!data.longitude || !data.latitude) {
      return;
    }
    
    var pt = new BMap.Point(data.longitude, data.latitude);
    var myIcon = new BMap.Icon("http://api.map.baidu.com/img/markers.png", new BMap.Size(23, 25), {  
      offset: new BMap.Size(10, 25), // 指定定位位置  
      imageOffset: new BMap.Size(0, offset) // 设置图片偏移  
    });  
    var marker = new BMap.Marker(pt, {icon:myIcon});
    if (data.companyName) {
      var $item = this.$data["info-wind-content-template"].dom.clone();
      $item.removeAttr("name");
      var $dom = domUtil.getDomByName($item);
      $dom.companyName.val(data.companyName);
      $dom.address.val(data.address);
      marker.infoWindow = new BMap.InfoWindow($item[0]);//创建窗口信息
//      marker.infoWindow.setTitle(title);
      marker.addEventListener("click", function(e) {
        this.openInfoWindow(e.target.infoWindow);
        
        if (lbs && lbs.longitude && lbs.latitude) {
          var content = e.target.infoWindow.getContent();
          var $content = $(content);
          $content.find("[name=rightPanel]").off("click").on("click", function() {
            var driving = new BMap.DrivingRoute(map, {    
              renderOptions: {    
                map: map,    
                panel: "r-result",
                autoViewport: true    
              }    
            });    
            driving.search(new BMap.Point(lbs.longitude, lbs.latitude), new BMap.Point(data.longitude, data.latitude));
            
            me.bindResultPanel();
          });
        }
      });
    }
    map.addOverlay(marker);
  };
  
  StoreMap.prototype.bindResultPanel = function() {
    $("#storeMap .route-panel").show();
    $("#storeMap .t-arrow").off("tap").on("tap", function() {
      $("#storeMap .route-panel").toggleClass("close open");
    });
  };
  
  StoreMap.prototype.unbindResultPanel = function() {
    $("#storeMap .route-panel").hide();
    $("#storeMap .route-panel").removeClass("open");
  };
  
  StoreMap.prototype.hide = function() {
    this.unbindResultPanel();
  };
  
  return new StoreMap();
});