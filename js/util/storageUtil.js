define(function() {

  var storageUtil = {
  };

  var STORAGE_KEY = {
    PAGE_PARA : "page_parameter_v1"
  }
  
  storageUtil.get = function(key) {
    var store = localStorage.getItem(key);
    if (store) {
      try {
        store = JSON.parse(store);
      } catch (e) {
        store = undefined;
        this.remove(key);
      }
    }
    
    return $.Deferred().resolve(store || {}).promise();
  };
  
  storageUtil.set = function(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return $.Deferred().resolve(value).promise();
  };
  
  storageUtil.put = function(key, value) {
    var me = this;
    return this.get(key)
    .then(function(data) {
      value = $.extend(data || {}, value || {});
      return me.set(key, value);
    });
  };
  
  storageUtil.remove = function(key) {
    localStorage.removeItem(key);
  };
  
  storageUtil.setParam = function(key, para) {
    var me = this;
    return this.get(STORAGE_KEY.PAGE_PARA)
    .then(function(data) {
      data = data || {};
      data[key] = para;
      return me.set(STORAGE_KEY.PAGE_PARA, data);
    });
  };
  
  storageUtil.clearParam = function() {
	  this.remove(STORAGE_KEY.PAGE_PARA);
  };
  
  storageUtil.putParam = function(key, para) {
    var me = this;
    return this.get(STORAGE_KEY.PAGE_PARA)
    .then(function(data) {
      data = data || {};
      data[key] = $.extend((data[key] || {}), para);
      return me.set(STORAGE_KEY.PAGE_PARA, data);
    });
  };
  
  storageUtil.getParam = function(key) {
    var me = this;
    return this.get(STORAGE_KEY.PAGE_PARA)
    .then(function(data) {
      data = data || {};

      return $.extend(storageUtil.getUrlParam(), data[key]);
    });
  };
  
  storageUtil.removeParam = function(key) {
    return this.setParam(key);
  };
  
  storageUtil.removeSubParam = function(key, subKey) {
    var me = this;
    return this.get(STORAGE_KEY.PAGE_PARA)
    .then(function(data) {
      if (data) {
        delete data[key][subKey];
        return me.set(STORAGE_KEY.PAGE_PARA, data);
      }
    });
  };

  storageUtil.getUrlParam = function(url) {
    var query = url || window.location.search;
    var start = query.indexOf('?');
    if (start > -1) {
      query = query.substring(start + 1);
    }

    var paras = {};
    if (query) {
      var queryParams = query.split('&');
      for ( var k in queryParams) {
    	  if (!queryParams[k]) continue;
          var param = queryParams[k].split('=');
          paras[param[0]] = decodeURIComponent(param[1] || "");
      }
    }
    return paras;
  };
  
  return storageUtil;
});