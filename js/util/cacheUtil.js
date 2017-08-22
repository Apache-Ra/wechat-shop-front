define(['util/util'], function( util) {
  var KEY_WAIT = "waitobject";
  var RETRY_COUNT = 100;
  var Export = {
  };
  
  var cache = {};

  Export.cacheGet = function(url, para) {
    var key = url + "_" + ((para) ? JSON.stringify(para) : "");
    var def = $.Deferred();
    
    var retryCnt = 0;
    _cacheGet(def, url, key, para, retryCnt);
    
    return def.promise();
  };
  
  Export.localCacheGet = function(key, callback) {
    var cacheVal = cache[key];
    if (cacheVal) {
      return JSON.parse(cacheVal);
    }
    
    cacheVal = callback();
    cache[key] = JSON.stringify(cacheVal);
    return cacheVal;
  };
  
  Export.removeKey = function(key) {
    cache[key] && (delete cache[key]);
  };
  
  Export.removeUrl = function(url, para) {
    var key = url + "_" + ((para) ? JSON.stringify(para) : "");
    this.removeKey(key);
  };
  
  function _cacheGet(def, url, key, para, retryCnt) {
    var cacheVal = cache[key];
    if (cacheVal) {
      if (cacheVal == KEY_WAIT) {
        if (retryCnt > RETRY_COUNT) {
          cache[key] = null;
        } else {
          setTimeout(function() {
            _cacheGet(def, url, key, para, ++retryCnt);
          }, 100);
  
          return;
        }
      } else {
        def.resolve(JSON.parse(cache[key]));
        return;
      }
    } else {
      cache[key] = KEY_WAIT;
    }
    
    setTimeout(function() {
      util.get(url, para)
      .then(function(result) {
        cache[key] = JSON.stringify(result.data);
        def.resolve(result.data);
      }); 
    }, 10);
  }
  
  return Export;
});