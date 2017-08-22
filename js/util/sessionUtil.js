define(['util/cacheUtil'],
    function( cacheUtil) {
  var sessionUtil = {
      KEY_USER_INFO : "data_user_info",
      KEY_PRIVILEGE : "data_user_privilege",
      KEY_PARAMETER : "page_parameter",
  };

  sessionUtil.set = function(key, data) {
    var str = JSON.stringify(data);
    sessionStorage.setItem(key, str);
    cacheUtil.removeKey(key);
  };

  sessionUtil.get = function(key) {
    return cacheUtil.localCacheGet(key, function() {
      var str = sessionStorage.getItem(key);
      if (str) {
        return JSON.parse(str);
      }
      return undefined;
    });
  };

  sessionUtil.clear = function(key) {
    sessionStorage.removeItem(key);
  };
  
  sessionUtil.setPara = function(id, data) {
    var para = sessionStorage.getItem(this.KEY_PARAMETER);
    para = para ? JSON.parse(para) : {};
    para[id] && delete para[id];
    para[id] = data;

    var str = JSON.stringify(para);
    sessionStorage.setItem(this.KEY_PARAMETER, str);
  };
  
  sessionUtil.getPara = function(id, para) {
    var para = sessionStorage.getItem(this.KEY_PARAMETER);
    para = para ? JSON.parse(para) : {};
    return para[id] || {};
  };
  
  return sessionUtil;
});