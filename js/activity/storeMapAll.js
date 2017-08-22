define(['activity/activity', 'util/imgSlider', 'util/format', 'util/util', 'util/storageUtil', 'util/dateUtil', 'util/lbsUtil', 'util/domUtil'],
    function(Activity, imgSlider, format, util, storageUtil, dateUtil, lbsUtil, domUtil) {
  
  var _centerInit;
  
  var StoreMapAll = function(){
    Activity.call(this);
  };
  Activity.inheritedBy(StoreMapAll);
  
  StoreMapAll.prototype.onCreate = function(){
  };

  StoreMapAll.prototype.show = function(){
    var me = this;
    me.showMap();
  };

  StoreMapAll.prototype.showMap = function(){
    if (!BMap) {
      return;
    }
    
    var me = this;

    $('#storeMapAll .mapPanel').height($('#storeMapAll').height());
    var map = new BMap.Map($("#storeMapAll .mapPanel")[0]);

    lbsUtil.getPosition()
    .then(function(lbs) {
      if (!lbs) {
        return;
      }
      
      map.enableScrollWheelZoom(); 
      map.addControl(new BMap.NavigationControl()); 
      var data = {};
      data.lng = lbs.longitude;
      data.lat = lbs.latitude;
      data.areaId = lbs.cityId;

      storageUtil.getParam("storeMapAll")
      .then(function(param) {
        util.post(param.storeUrl, data).then(function(result) {
          if (result.codeText == "OK") {
            me.renderStore(map, result.data, lbs);
            
            // 描画自己位置
            if (lbs.longitude && lbs.latitude) {
              lbs.lng = lbs.longitude;
              lbs.lat = lbs.latitude;
              me.renderPoint(map, lbs, 0 - 10 * 25);
            }
          }
        });
      });
    });
  };
  
  StoreMapAll.prototype.renderStore = function(map, data, lbs) {
    _centerInit = false;
    if (!data || data.length == 0) {
      return;
    }
    
    
    for (var i=0; i<data.length; i++) {
      this.renderPoint(map, data[i], this.calculateOffset(i), lbs);
    }
  };

  StoreMapAll.prototype.calculateOffset = function(index) {
    if (index > 9) {
      index = 11;
    }
    return 0 - index * 25;
  };

  StoreMapAll.prototype.renderPoint = function(map, data, offset, lbs) {
    var me = this;
    if (!data.lng || !data.lat) {
      return;
    }

    var pt = new BMap.Point(data.lng, data.lat);
    
    // 设置第一个点位中心
    if (!_centerInit) {
      _centerInit = true;
      map.centerAndZoom(pt, 12);
    }

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
        
        if (lbs && lbs.lng && lbs.lat) {
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
             driving.search(new BMap.Point(lbs.lng, lbs.lat), new BMap.Point(data.lng, data.lat));
             me.bindResultPanel();
          });
        }
      });
    }
    
    map.addOverlay(marker); 
  };
  
  StoreMapAll.prototype.bindResultPanel = function() {
    $("#storeMapAll .route-panel").show();
    $("#storeMapAll .t-arrow").off("tap").on("tap", function() {
      $("#storeMapAll .route-panel").toggleClass("close open");
    });
  };
  
  StoreMapAll.prototype.unbindResultPanel = function() {
    $("#storeMapAll .route-panel").hide();
    $("#storeMapAll .route-panel").removeClass("open");
  };
  
  StoreMapAll.prototype.hide = function() {
    this.unbindResultPanel();
  };

  return new StoreMapAll();
});