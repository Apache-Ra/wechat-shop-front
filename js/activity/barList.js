define(['activity/activity'], function(Activity){

  var BarList = function () {
    Activity.call(this);
  };

  Activity.inheritedBy(BarList);

  BarList.prototype.onCreate = function() {
    this.findElements();
  };

  BarList.prototype.findElements = function() {
    this.listBar = this.find("."+this.theme_.listBar);
    this.barList = this.find("."+this.theme_.barList);
  };

  BarList.prototype.show = function(){
    this.findElements();
    this.container_.addClass(this.theme_.classname);
    var headerheight = this.toolbar.$header.outerHeight();
    this.listBar.height(window.innerHeight - headerheight - 20).css( "top", headerheight + 18 );
    this.bindEvents();
  };

  BarList.prototype.theme_ = {
    classname: 'activity_bar_list',
    current: '',
    listBar: 'list_bar',
    barList: 'bar_list'
  };

  BarList.prototype.offsetY = 0;

  BarList.prototype.bindEvents = function(){
    var me = this;
    this.listBar.find("li").on("mousedown", function(){
      var row = $(this);
      var top,
        letter = row.text(),
        divider = me.barList.find(".m_letter_" + letter);
      if ( divider.length > 0 ) {
        row.addClass(me.theme_.current).siblings().removeClass(me.theme_.current);
        top = divider.offset().top - divider.outerHeight(true) + me.offsetY;
        $.mobile.silentScroll( top );
      }
    });
  };

  return BarList;

});