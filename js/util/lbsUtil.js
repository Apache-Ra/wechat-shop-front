define(['util/storageUtil', 'util/codeUtil'], function( storageUtil, codeUtil) {

  var lbsUtil = {
    getLBS : function() {
      return storageUtil.get("LBS")
      .then(function(lbs) {
        var para = null;
        if (!lbs) {
          // 啥玩意都没找到
          para = {
              cityId: codeUtil.DEFAULT_CITY_ID
          };
        // 找到自定义城市，并且自定义城市不是当前城市
//        } else if (lbs.selfPosition && lbs.selfPosition.cityId && (lbs.selfPosition.cityId !== lbs.cityId)) {
//          para = {
//              cityId: lbs.selfPosition.cityId
//          };
//        // 使用定位城市
        } else if (lbs.cityId) {
          para = {
              longitude: lbs.longitude,
              latitude: lbs.latitude,
              cityId: lbs.cityId
          };
        // 默认上海
        } else {
          para = {
              cityId: codeUtil.DEFAULT_CITY_ID
          };
        }
        
        return para;
      });
    },
    getPosition : function() {
      return storageUtil.get("LBS")
      .then(function(lbs) {
        var para = null;
        if (!lbs) {
          // 啥玩意都没找到
          para = {
              cityId: codeUtil.DEFAULT_CITY_ID,
              cityName: "上海"
          };
        // 找到自定义城市，并且自定义城市不是当前城市
//        } else if (lbs.selfPosition && lbs.selfPosition.cityId && (lbs.selfPosition.cityId !== lbs.cityId)) {
//          para = {
//              cityId: lbs.selfPosition.cityId,
//              cityName: lbs.selfPosition.cityName
//          };
//        // 使用定位城市
        } else if (lbs.cityId) {
          para = {
              longitude: lbs.longitude,
              latitude: lbs.latitude,
              cityId: lbs.cityId,
              cityName: lbs.cityName
          };
        // 默认上海
        } else {
          para = {
              cityId: codeUtil.DEFAULT_CITY_ID,
              cityName: codeUtil.DEFAULT_CITY_NAME,
              longitude: lbs.longitude,
              latitude: lbs.latitude
          };
        }
        
        return para;
      });
    },
    existsLBS : function() {
      return storageUtil.get("LBS")
      .then(function(lbs) {
        var exists = false;
        if (!lbs) {
          // 啥玩意都没找到
          exists = false
        // 找到自定义城市，并且自定义城市不是当前城市
//        } else if (lbs.selfPosition && lbs.selfPosition.cityId && (lbs.selfPosition.cityId !== lbs.cityId)) {
//          exists = true
//        // 使用定位城市
        } else if (lbs.cityId) {
          exists = true;
        // 默认上海
        } else {
          exists = false;
        }
        
        return exists;
      });
    }
  };
  
  return lbsUtil;
});
