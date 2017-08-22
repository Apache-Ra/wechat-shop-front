define(['core/base'], function(base) {

	var Export = {};

	// 顺序比较
	Export.compare = {
		numberLike: function(a, b, asc) {
			if ((typeof a == "string") && a.match(/\d+/)) {
				a = a.match(/\d+/gi);
				a = parseFloat(Array.prototype.join.apply(a, [""]));
			}
			if ((typeof b == "string") && b.match(/\d+/)) {
				b = b.match(/\d+/gi);
				b = parseFloat(Array.prototype.join.apply(b, [""]));
			}
			return Export.compare.number(a, b, asc || false);
		},
		number: function(a, b, asc) {
			return asc ? parseFloat(a) < parseFloat(b): parseFloat(a) > parseFloat(b);
		},
		pinyin: function(a, b, asc) {
			var result = asc ? (b+"").localeCompare(a+"") : (a+"").localeCompare(b+"");
			return result>0 ? true : false;
		}
	};

	// 数组排序
	Export.sort = {
		// 希尔排序
		shell: function(array, type, asc, getValue){
			var stepArr = [1750, 701, 301, 132, 57, 23, 10, 4, 1];
			var fn = Export.compare[type];
			if($.isFunction(fn)){
				var i = 0;
				var stepArrLength = stepArr.length;
				var len = array.length;
				var len2 =  parseInt(len/2);
				for(;i < stepArrLength; i++){
					if(stepArr[i] > len2){
						continue;
					}
					stepSort(stepArr[i]);
				}
			}
			function valueOf(value){
				return $.isFunction(getValue) ? getValue(value) : value;
			}
			function stepSort(step){
				var i = 0, j = 0, f, tem, key;
				var stepLen = len%step > 0 ?  parseInt(len/step) + 1 : len/step;
				for(;i < step; i++){
					for(j=1;step*j+i<len; j++){
						tem = f = step * j + i;
						key = array[f];
						while((tem-=step) >= 0){
							if(fn(valueOf(array[tem]), valueOf(key), asc || false)){
								array[tem+step] = array[tem];
							}else{
								break;
							}
						}
						array[tem + step ] = key;
					}
				}	
			}
			return array;
		}
	}

	return Export;

});