define(['activity/barList', 'util/storageUtil', 'util/util', 'util/lbsUtil'],
    function(BarList, storageUtil, util, lbsUtil) {
  
  var Position = function(){
    BarList.call(this);
  };

  BarList.inheritedBy(Position);
  
  Position.prototype.onCreate = function() {
    Position.superClass_.onCreate.apply(this, arguments);
    this.getCities_();
  };

  // override. do later in getCities_
  Position.prototype.show = function(){
  };

  Position.prototype.offsetY = -20;

  Position.prototype.bindEvents = function(){
    Position.superClass_.bindEvents.call(this);
    this.bindSelectedEvents();
  };

  Position.prototype.bindSelectedEvents = function(){
    var me = this;
    this.find('.m_letter_item').on("tap", function(){
      var city = $(this);
      var bundle = {};
      bundle.cityId = city.attr('code');
      bundle.cityName = $.trim(city.text());
      
      storageUtil.put("LBS", {selfPosition:bundle})
      .then(function() {
        me.back();
      });
    });
  };

  Position.prototype.getCities_ = function() {
    var me = this;
    util.get('mobile/city', null, false, false, true)
    .then(function(result) {
      me.renderCities_(result.data);
      Position.superClass_.show.call(me);
    });
  };

  Position.prototype.renderCities_ = function(data) {
    var me = this;
    storageUtil.get("LBS")
    .then(function(lbs) {
      if (lbs && lbs.cityId && lbs.cityName) {
        me.find('.m_location').html(lbs.cityName).attr('code', lbs.cityId);
        me.find('.defaultpos').show();
      } else {
        me.find('.defaultpos').hide();
      }
    });
    
    if (data.hot) {
      $(data.hot).each(function() {
        var $item = me.$data.area_item_template.dom.clone();
        $item.removeAttr("name");
        $item.attr("code", this.areaId);
        $item.find("p").html(this.name);
        me.$data.hot_container.dom.append($item);
      });
    }
    
    if (data.list) {
      var letter = null;
      $(data.list).each(function() {
        if (letter != this.letter) {
          letter = this.letter;
          var $letter = me.$data.area_letter_template.dom.clone();
          $letter.removeAttr("name");
          $letter.html(letter);
          $letter.addClass("m_letter_" + letter);
          me.$data.city_container.dom.append($letter);
        }
        
        var $item = me.$data.area_item_template.dom.clone();
        $item.removeAttr("name");
        $item.attr("code", this.areaId);
        $item.find("p").html(this.name);
        me.$data.city_container.dom.append($item);
      });
    }
  };

  return new Position();
});