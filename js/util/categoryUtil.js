define(['util/util', 'util/cacheUtil'], function( util, cacheUtil) {
  var Export = {};
  
  Export.setting = {
      ID_DEFAULT_CATEGORY1 : 1,
      TYPE_CATEGORY : "PRODUCT"
  };
  
  function noDef() {
    return $.Deferred().resolve().promise();
  }
  
  Export.getServiceType = function() {
    return serviceInstance;
  };
  
  Export.extendPara = function(para) {
    return $.extend(para || {}, {categoryType : this.setting.TYPE_CATEGORY});
  };

  Export.getCategory1 = function() {
    return cacheUtil.cacheGet("category/c1", this.extendPara());
  };
  
  Export.clearCategory1 = function() {
    cacheUtil.removeUrl("category/c1", this.extendPara());
  };

  Export.getCategory2 = function(c1) {
    return cacheUtil.cacheGet("category/c2", {c1: c1 || Export.setting.ID_DEFAULT_CATEGORY1});
  };
  
  Export.clearCategory2 = function(c1) {
    cacheUtil.removeUrl("category/c2", {c1: c1 || Export.setting.ID_DEFAULT_CATEGORY1});
  };
  
  Export.getCategory3 = function(c2) {
    return c2 ? cacheUtil.cacheGet("category/c3", {c2: Number(c2)}) : noDef();
  };
  
  Export.clearCategory3 = function(c2) {
    cacheUtil.removeUrl("category/c3", {c2: Number(c2)});
  };

  Export.getA1 = function(c3) {
    return c3 ? cacheUtil.cacheGet("category/a1", {c3: Number(c3)}) : noDef();
  };
  
  Export.clearA1 = function(c3) {
    cacheUtil.removeUrl("category/a1", {c3: Number(c3)});
  };
  
  Export.getA2 = function(a1) {
    return a1 ? cacheUtil.cacheGet("category/a2", {a1: Number(a1)}) : noDef();
  };
  
  Export.clearA2 = function(a1) {
    cacheUtil.removeUrl("category/a2", {a1: Number(a1)});
  };

  Export.getA2Option = function(a2) {
    return a2 ? cacheUtil.cacheGet("category/a2Option", {a2: Number(a2)}) : noDef();
  };
  
  Export.clearA2Option = function(a2) {
    cacheUtil.removeUrl("category/a2Option", {a2: Number(a2)});
  };
  
  Export.getCategorySpecAttr = function(c3) {
    return c3 ? cacheUtil.cacheGet("category/spec", {c3: Number(c3)}) : noDef();
  };
  
  Export.clearCategorySpecAttr = function(c3) {
    cacheUtil.removeUrl("category/spec", {c3: Number(c3)});
  };
  
  Export.getCategorySpecAttrOption = function(spec) {
    return spec ? cacheUtil.cacheGet("category/specOption", {spec: Number(spec)}) : noDef();
  };
  
  Export.clearCategorySpecAttrOption = function(spec) {
    cacheUtil.removeUrl("category/specOption", {spec: Number(spec)});
  };

  var serviceInstance = $.extend(true, {}, Export);
  serviceInstance.setting.TYPE_CATEGORY = "SERVICE";
  return Export;
});