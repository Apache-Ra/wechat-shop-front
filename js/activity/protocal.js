define(['activity/activity'], function(Activity) {
  
  var Protocal = function(){
    Activity.call(this);
  };
  
  Activity.inheritedBy(Protocal);
  
  Protocal.prototype.onCreate = function() {
    console.debug("Protocal.pageCreate");
  };
  
  return new Protocal();
});