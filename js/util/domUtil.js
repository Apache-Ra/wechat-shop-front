define(['util/format'], function( formatUtil) {

  var DomUtil = {
      // 纯数字
      TYPE_NUMBER : 1,
      // 带小数
      TYPE_DECIMAL : 2,
      // 从server返回，或者将要传给server的金额，需要10000换算
      TYPE_CURRENCY_SERVER : 3,
      // 调整过金额，不需要除以10000
      TYPE_CURRENCY: 4
  };

  DomUtil.find = function(selecter, opt_container){
    if(selecter instanceof $){
      return selecter;
    }
    return $(opt_container || body).find(selecter);
  };

  DomUtil.getDomByName = function(dom) {
    return this.getDomByAttr(dom, "name");
  };
  
  DomUtil.getDomByAttr = function(dom, attrName) {
    if (!dom) return {};
    
    var ret = {};
    $("[" + attrName + "]", dom).each(function() {
      var $this = $(this);
      ret[$this.attr(attrName)] = {
          dom : $this,
          val : function(val, type) {
            if (!arguments || arguments.length == 0) {
              return this.getVal();
            }
            if ($this.is("input") || $this.is("select") || $this.is("textarea")) {
              $this.val(val);
            } else {
              var newVal = val;
              if (val !== '--') {
                if (type == DomUtil.TYPE_NUMBER) {
                  newVal = formatUtil.formatNumber(val);
                } else if (type == DomUtil.TYPE_DECIMAL) {
                  newVal = formatUtil.formatCurrency(val).toFix(2);
                } else if (type == DomUtil.TYPE_CURRENCY_SERVER) {
                  newVal = formatUtil.fromCurrency(val);
                } else if (type == DomUtil.TYPE_CURRENCY) {
                  newVal = formatUtil.formatCurrency(val);
                }
              }
              
              $this.html(newVal);
            }
            
            return $this;
          },
          getVal : function(type) {
            var val = null;
            if ($this.is("input") || $this.is("select") || $this.is("textarea")) {
              val = $this.val();
            } else {
              val = $.trim($this.html());
            }
            
            if (type == DomUtil.TYPE_NUMBER) {
              val = Number(val);
            } else if (type == DomUtil.TYPE_DECIMAL) {
              val = Number(val);
            } else if (type == DomUtil.TYPE_CURRENCY_SERVER) {
              val = formatUtil.toCurrency(val);
            } else if (type == DomUtil.TYPE_CURRENCY) {
              val = Number(val);
            }
            
            return val;
          }
      };
    });
    
    return ret;
  };
  
  DomUtil.setPosition = function($dom, prop, val) {
    var p = $dom.css(prop);
    p = Number(p.substring(0, p.indexOf("px")));
    $dom.css(prop, (p + val)) + "px";
  };
  
  DomUtil.getPosition = function($dom, prop) {
    var p = $dom.css(prop);
    p = Number(p.substring(0, p.indexOf("px")));
    return p;
  };
  
  DomUtil.bindClearButton = function($dom) {
    $dom.find('.ui-icon-close').on("tap", function(){
      $(this).siblings('input[name]').val('');
      $(this).hide();
    });
    
    $dom.find('.ui-form-item input').on("change", function() {
      var value = $(this).val();
      $(this).siblings('.ui-icon-close')[(value) ? "show" : "hide"]();
    });
  };
  
  return DomUtil;
});
