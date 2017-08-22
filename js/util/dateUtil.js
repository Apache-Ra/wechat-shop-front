define(['util/util'],
  function( util) {
  
  /**
   * 日期函数
   */
  var dateUtil = {
    /**
     * 指定日期的第一天
     * @param dt
     * @returns {Date}
     */
    getFirstDayOfMonth : function(dt) {
      dt = dt || new Date();
      return new Date(dt.getFullYear(), dt.getMonth(), 1);
    },
    /**
     * 指定日期的最后一天
     * @param dt
     * @returns {Date}
     */
    getLastDayOfMonth : function(dt) {
      dt = dt || new Date();
      return new Date(dt.getFullYear(), dt.getMonth() + 1, 0);
    },
    /**
     * 指定日期的前一个月的第一天
     * @param dt
     * @returns {Date}
     */
    getPreMonth : function(dt) {
      dt = dt || new Date();
      return new Date(dt.getFullYear(), dt.getMonth() - 1, 1);
    },
    /**
     * 指定日期的后一个月的第一天
     * @param dt
     * @returns {Date}
     */
    getNextMonth : function(dt) {
      dt = dt || new Date();
      return new Date(dt.getFullYear(), dt.getMonth() + 1, 1);
    },
    /**
     * 指定日期变换成中国标准日期
     *
     * @param dt
     * @returns
     */
    toStandarDateStr : function(dt) {
      if (!dt) {
        return "";
      }
      if (typeof dt === 'string') {
        dt = this.strToDate(dt);
      }
      
      var localTime = dt.getTime();
      var localOffset = dt.getTimezoneOffset() * 60000;
      var utc = localTime + localOffset;
      
      var chineseOffset = 8; // 
      var chineseTime = utc + (3600000 * chineseOffset);
      // 固定为东+8TimeZone
      var nd = new Date(chineseTime);
      
      return this.dateFormat('yyyy-MM-ddThh:mm:ss+08:00', nd);
    },
    /**
     * 标准日期字符串转成Date
     *
     * @param str
     * @returns {Date}
     */
    standarDateStrToDate : function(str) {
      return new Date(str);
    },
    dateStrFormat : function(format, dt) {
      return this.dateFormat(format, this.convert(dt));
    },
    /**
     * 格式化日期
     *
     * @param format 
     * @param dt
     * @returns
     */
    dateFormat : function(format, dt) {
      if (!dt) {
        return "";
      }
      var o = {
        "M+" : dt.getMonth() + 1, // 月
        "d+" : dt.getDate(), // 日
        "h+" : dt.getHours(), // 时
        "m+" : dt.getMinutes(), // 分
        "s+" : dt.getSeconds(), // 秒
        "S" : dt.getMilliseconds()
      };
  
      // 年份格式化
      if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (dt.getFullYear() + "")
            .substr(4 - RegExp.$1.length));
      }
  
      // 根据参数顺序格式化
      for ( var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
          format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] :
              ("00" + o[k]).substr(("" + o[k]).length));
        }
      }
      return format;
    },
    /**
     * 根据日期格式，转化成Date
     *
     * @param date
     * @param onlyTime
     * @returns {Date}
     */
    strToDate : function(date, onlyTime) {
      try {
        if (onlyTime) {
          date = this.dateFormat('yyyy/MM/dd', new Date()) + " " + date;
        }
        var matches = /^(\d{4})[-\/年](\d{1,2})[-\/月](\d{1,2})(日)?([\s](\d{1,2})[:](\d{1,2})([:](\d{1,2}))?)?$/.exec(date);        
        if (matches === null)
          return undefined;
        var y = matches[1];
        var m = (matches[2]-1);
        var d = matches[3];
        var hh = matches[6] || 0;
        var mm = matches[7] || 0;
        var ss = matches[9] || 0;
        return new Date(y, m, d, hh, mm, ss);
      } catch (e) {
        return undefined;
      }
    },
    /**
     * 日期文字转换成，后台识别的格式
     *
     * @param dtstr 
     * @returns {String}
     */
    dateOnlyStrToDBFormat : function(dt) {
      if (typeof dt === "string") {
        dt = this.strToDate(dt);
      }
      return this.dateFormat('yyyy-MM-ddT00:00:00' + this.getTimeZone(), dt);
    },
    /**
     * 后台格式转换成前台格式
     * 只是用在输入字段上
     *
     * @param dtstr
     * @returns {String}
     */
    dbDateToDateOnlyStrForInputCtrl : function(date) {
      if (!date) {
        return "";
      }
      
      if (typeof date == "string") {
        var index = ((index = date.indexOf("T")) === -1) ? 10 : index;
        date = this.strToDate(date.substr(0, index));
      }
      
      return this.dateFormat('yyyy-MM-dd', date);
    },
    /**
     * 当前不带时间的日期
     *
     * @returns {Date}
     */
    today : function() {
      var dt = new Date();
      return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    },
    /**
     * 常用格式转换成Date
     *
     * @param d
     * @returns {Date}
     */
    convert : function(d) {
      if (!d) {
        return null;
      }
      
      if (d.constructor === Date) {
        return d;
      }
      
      if (d.constructor === Array) {
        var ret = null;
        if (d.length == 3) {
          ret = new Date(d[0], d[1], d[2]);
        } else if (d.length > 5) {
          ret = new Date(d[0], d[1] - 1, d[2], d[3], d[4], d[5] || 0);
        }
        
        return ret;
      }
      
      if (d.constructor === Number) {
        return new Date(d);
      }
      
      if (typeof d === "object") {
        return new Date(d.year, d.month, d.date);
      }
  
      if (typeof d === 'string') {
        // yyyy-MM-dd
        if (d.length <= 20) {
          return this.strToDate(d);
        } else {
          // yyyy-MM-ddThh:mm:ss+08:00
          return this.strToDate(this.dbDateToDateOnlyStr(d));
        }
      }
    },
    getTimeZone: function() {
      var zone = (new Date()).getTimezoneOffset();
      // 此时区的正负正好与实际的相反
      var isNegative = true;
      if (zone < 0) {
        zone = zone * -1;
        isNegative = false;
      }
      var hour = parseInt(zone / 60);
      var minutes = zone % 60;
      if (hour < 10) {
        hour = "0" + hour;
      }
      
      if (isNegative) {
        hour = "-" + hour;
      } else {
        hour = "+" + hour;
      }
      
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      
      zone = hour + ":" + minutes;
  
      return zone;
    },
    /**
     * 日期比较
     *
     * @param a
     * @param d
     * @returns {Number}
     */
    compare : function(a, b) {
      return (isFinite(a = this.dateToMillisecond(a)) &&
        isFinite(b = this.dateToMillisecond(b)) ? (a > b) - (a < b) : NaN);
    },
    /**
     * 日期是否在指定时间区间内
     *
     * @param a
     * @param d
     * @returns {Number}
     */
    inRange : function(d, start, end) {
      return (isFinite(d = this.dateToMillisecond(d)) &&
          isFinite(start = this.dateToMillisecond(start)) &&
          isFinite(end = this.dateToMillisecond(end)) ? start <= d &&
          d <= end : NaN);
    },
    /**
     * 日期转换成微秒
     *
     * @param dt
     * @returns {Number} milliseccond
     */
    dateToMillisecond : function(dt) {
      return (dt && (dt = this.convert(dt))) ? dt.valueOf() : 0;
    },
    /**
     * 算日期差
     *
     * @param a
     * @param d
     * @returns {Number}
     */
    diffDays : function(a, b) {
      return parseInt(Math.abs(this.dateToMillisecond(a) -
        this.dateToMillisecond(b)) / (1000 * 60 * 60 * 24), 10);
    },
    /**
     * 日期往前推移
     *
     * @param date
     * @param days
     * @returns {Date}
     */
    subtractDays : function(date, days) {
      return this.addDays(date, (-1) * days);
    },
    /**
     * 日期往后推移
     *
     * @param date
     * @param days
     * @returns {Date}
     */
    addDays : function(date, days) {
      if (date && (date = this.convert(date))) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
      }
      
      return NaN;
    },
    /**
     * 减月份
     *
     * @param date
     * @param months
     * @returns {Date}
     */
    subtractMonths : function(date, months) {
      return this.addMonths(date, (-1) * months);
    },
    /**
     * 加月份
     *
     * @param date
     * @param months
     * @returns {Date}
     */
    addMonths : function(date, months) {
      if (date && (date = this.convert(date))) {
        var d = date.getDate();
        var nd = new Date(date.getFullYear(), date.getMonth() + months, 1);
        nd = this.getLastDayOfMonth(nd);
        nd.setDate(Math.min(nd.getDate(), d));
        return nd;
      }
      
      return NaN;
    },
    /**
     * 是否有效日期
     *
     * @param date 
     * @returns {boolean}　
     */
    isValidDate : function(date) {
      try {
        var matches = /^(\d{4})[-\/年](\d{1,2})[-\/月](\d{1,2})([日])$/.exec($.trim(date));
        if (matches === null)
          return false;
        var y = matches[1];
        var m = matches[2] - 1;
        var d = matches[3];
        var composedDate = new Date(y, m, d);
        return composedDate.getDate() == d && composedDate.getMonth() ==
          m && composedDate.getFullYear() == y;
      } catch (e) {
        return false;
      }
    },
    /**
     * 是否有效时间
     *
     * @param date
     * @returns {boolean}
     */
    isValidTime : function(time) {
      try {
        var matches = /^(\d{1,2})[:](\d{1,2})([:](\d{1,2}))?$/.exec($.trim(time));
        if (matches === null)
          return false;
        var h = matches[1];
        var m = matches[2];
        var s = matches[3] || 0;
        return (h >= 0 && h < 24) && (m >= 0 && m < 60) &&
            (s >= 0 && s < 60) == y;
      } catch (e) {
        return false;
      }
    },
    /**
     * 是否有效的日期+时间
     *
     * @param date
     * @returns {boolean}
     */
    isValidDateTime : function(date) {
      if (!date)
        return false;
  
      var tokens = date.split(" ");
      if (!tokens[0] || !this.isValidDate(tokens[0])) {
        return false;
      }
  
      if (!tokens[1] || !this.isValidTime(tokens[1])) {
        return false;
      }
  
      return true;
    },
    /**
     * 拼接标准开始时间
     */
    makeStartTime: function(dt, h, m) {
      dt = $.trim(dt);
      h = $.trim(h) || "00";
      m = $.trim(m) || "00";
      if (!dt) {
        return null;
      }
      
      var dtStr = dt + " " + h + ":" + m;
      return this.toStandarDateStr(dtStr);
    },
    /**
     * 拼接标准结束时间
     */
    makeEndTime: function(dt, h, m) {
      dt = $.trim(dt);
      h = $.trim(h) || "23";
      m = $.trim(m) || "59";
      if (!dt) {
        return null;
      }
      
      var dtStr = dt + " " + h + ":" + m;
      dt = this.strToDate(dtStr);
      
      dt = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes() + 1);
      return this.toStandarDateStr(dt);
    }
  };

  return dateUtil;
});