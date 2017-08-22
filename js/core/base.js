define([], function(){
	var Export = {
	};

	Export.inherits = function(childCtor, parentCtor) {
		function tempCtor() {};
		tempCtor.prototype = parentCtor.prototype;
		childCtor.superClass_ = parentCtor.prototype;
		childCtor.prototype = new tempCtor();
		childCtor.prototype.constructor = childCtor;
		childCtor.base = function(me, methodName, var_args) {
			var args = new Array(arguments.length - 2);
			for (var i = 2; i < arguments.length; i++) {
				args[i - 2] = arguments[i];
			}
			return parentCtor.prototype[methodName].apply(me, args);
		};
		
	};

	return Export;
});