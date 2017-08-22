define(['util/util', 'util/cacheUtil'], function( utils, cacheUtil) {
  var Export = {};
  
  Export.setting = {
  };
  
  Export.getCarBrand = function() {
    return cacheUtil.cacheGet("carBrand/brand");
  };
  
  Export.clearCarBrand = function() {
    cacheUtil.removeUrl("carBrand/brand");
  };

  Export.getCarSeries = function(carBrandId, group) {
    return cacheUtil.cacheGet("carBrand/brand/" + carBrandId + "/series?group=" + (!!group));
  };

  Export.clearCarSeries = function(carBrandId, group) {
    cacheUtil.removeUrl("carBrand/brand/" + carBrandId + "/series?group=" + (!!group));
  };
  
  Export.getCarModel = function(carSeriesId) {
    return cacheUtil.cacheGet("carBrand/series/" + carSeriesId + "/model");
  };
  
  Export.clearCarModel = function(carSeriesId) {
    cacheUtil.removeUrl("carBrand/series/" + carSeriesId + "/model");
  };

  return Export;
});