define(['activity/activity'], function(Activity) {
  
  var About = function(){
    Activity.call(this);
  };
  
  Activity.inheritedBy(About);
  
  return new About();
});