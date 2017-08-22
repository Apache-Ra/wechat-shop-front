define(['util/util', 'formatCurrency'], function( util) {
  
  var Export = {};

  /**
   * 替换productImage这个url为80x80的url，如果该url不存在，则返回80x80的图片不存在的图片（拗口吗？就是给一个默认图）
   * @param url
   * @param size
   * @returns {String}
   */
  Export.prdImgUrl = function(url, size) {
    if (size) {
      if (size.indexOf("100x") > -1) {
        return this.photoImgUrl(url, size, "product_default_100.png");
      } else if (size.indexOf("300x") > -1) {
        return this.photoImgUrl(url, size, "product_default_320.png");
      } else {
        return this.photoImgUrl(url, size, "product_default_100.png");
      }
    } else {
      return this.photoImgUrl(url, size, "product_default_100.png");
    }
  };
  
  Export.storeImgUrl = function(url, size) {
    return this.photoImgUrl(url, size, "default-store.jpg");
  };
  
  Export.photoImgUrl = function(url, size, defautImg) {
    if (url) {
      if (!util.endWith(url, "/")) {
        url = url + "/";
      }
      if (!size) {
        size = "";
      } else if (util.startWith(size, "/")) {
        size = size.substring(1, size.length);
      }

      if (util.startWith(url, "http")) {
        return (url + size);
      } else {
        return (util.setting.SERVER_IMG_URI + url + size);
      }
    } else {
      if (defautImg) {
        return "theme/css/images/" + defautImg;
      }
    }
    
    if (size) {
      if (size.indexOf("100x") > -1) {
        return "theme/css/images/upload_100.png";
      } else if (size.indexOf("300x") > -1) {
        return "theme/css/images/upload_320.png";
      } else {
        return "theme/css/images/upload_100.png";
      }
    } else {
      return "theme/css/images/upload_320.png";
    }
  };

  /**
   * 非只读显示不要千位符
   * @param c
   * @returns {Number}
   */
  Export.fromCurrencyNoPadding = function(c) {
    return Number(c) / 10000;
  };

  /**
   * 只读显示用千位符函数
   * @param c
   * @returns
   */
  Export.fromCurrency = function(c) {
    var result = Number(c) / 10000;
    return $.formatCurrency.format(result);
  };
  
  Export.fromCurrencyWithCutZero = function(c) {
    var result = Number(c) / 10000;
    return cutZero($.formatCurrency.format(result));
  };
  
  function cutZero(old){  
    //拷贝一份 返回去掉零的新串  
    newstr=old;  
    //循环变量 小数部分长度  
    var leng = old.length-old.indexOf(".")-1  
    //判断是否有效数  
    if(old.indexOf(".")>-1){  
        //循环小数部分  
        for(i=leng;i>0;i--){  
                //如果newstr末尾有0  
                if(newstr.lastIndexOf("0")>-1 && newstr.substr(newstr.length-1,1)==0){  
                    var k = newstr.lastIndexOf("0");  
                    //如果小数点后只有一个0 去掉小数点  
                    if(newstr.charAt(k-1)=="."){  
                        return  newstr.substring(0,k-1);  
                    }else{  
                    //否则 去掉一个0  
                        newstr=newstr.substring(0,k);  
                    }  
                }else{  
                //如果末尾没有0  
                    return newstr;  
                }  
            }  
        }  
        return old;  
  };

  /**
   * 中间计算结果不用再除以10000了
   * 
   * @param c
   * @returns
   */
  Export.formatCurrency = function(c) {
    return $.formatCurrency.format(c);
  };
  
  /**
   * 非钱币使用，不要小数点，例如件数，个数
   */
  Export.formatNumber = function(c) {
    return $.formatCurrency.format(c, {roundToDecimalPlace : 0});
  };
  
  /**
   * 非钱币使用，不要小数点，例如件数，个数
   */
  Export.formatCount = function(c) {
    return $.formatCurrency.format(c, {roundToDecimalPlace : 0});
  };
  
  /**
   * 保存到服务器，去掉千位符合小数位
   * @param c
   * @returns {Number}
   */
  Export.toCurrency = function(c) {
    return parseFloat(String(c).replace(/\,/g, "")) * 10000;
  };
  
  Export.formatDistance = function(c) {
    if (!c) {
      return "";
    }
    var result = Number(c);
    return cutZero($.formatCurrency.format(result, {roundToDecimalPlace : 1})) + "km";
  };
  
  Export.formatName = function(name) {
    if (name && name.match(/^1[0-9]{10}$/)) {
      return name.substr(0, 3) + "****" + name.substr(7, 4);
    }
    
    return name || "";
  };
  Export.subStr = function(str, start, length) {
	  if (!str) {
		  return "";
	  }
	  
	  if ((start + 1) > str.length) {
		  return "";
	  }
	  
	  if (!length || ((start + length) > str.length)) {
		  return str.substr(start);
	  } else {
		  return str.substr(start, length) + "···";
	  }
  };  
  Export.formatDescription = function(desc) {
    var me = this;
    if (!desc) {
      return $("<div></div>");
    }
    
    var index = 0;
    var end = 0;
    var last = 0;
    var html = [];
    html.push("<div>");
    do {
      index = desc.indexOf("<img", last);
      if (index == -1) {
        html.push(desc.substring(last));
        break;
      } else {
        html.push(desc.substring(last, index));
        end = desc.indexOf(">", index);
        if (end == -1) {
          html.push(desc.substring(index));
          break;
        }
        var mid = desc.substring(index, end);
        html.push(mid.replace(" src", " tmpsrc"));
        last = end;
      }
    } while(index != -1)

    html.push("</div>");
    var $html = $(html.join(""));
    
    $html.find("img").each(function() {
      var $this = $(this);
      var src = $this.attr("tmpsrc");
      $this.removeAttr("tmpsrc");
      if (src.indexOf("shop") >= 0) {
        $this.attr("src", me.photoImgUrl(src, "600x0"));
        $this.removeAttr("style");
      } else {
        $this.attr("src", src);
      }
    })
    
    return $html;
  };
  
  return Export;
});