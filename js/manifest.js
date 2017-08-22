define(['config/application'], function(application) {

  var manifest = {
  	'isHybrid': true,
  	'path': {
  		'layout': '../template/',
  		'css': '../theme/css/',
  		'baseUrl': '',
  		'activity': 'activity/'
  	},
    'application': application,
      _eof : null
  };
  
  return manifest;
});