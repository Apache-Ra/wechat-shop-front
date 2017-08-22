define(['util/storageUtil'],
        function(storageUtil) {
    
    var PLATFORM_SERVER_URI = "http://" + SERVER_DOMAIN + "/" + platformContext + "/";
    var SERVER_URI = "http://" + SERVER_DOMAIN + "/" + frontContext + "/";
    
    var ERR_SECURITY_URI = "./err_security.html";
    var ERR_INTERNAL_URI = "./err_internal.html";
    var ERR_PAGE_NOT_FOUND_RUI = "./err_page_not_found.html";
    var ERR_OTHER = "./error.html";
    
    var SERVER_IMG_URI = "http://" + SERVER_DOMAIN + "/" + platformContext + "/image";
    var SERVER_FILE_URI = "http://" + SERVER_DOMAIN + "/" + platformContext + "/file";
    var BLANK_IMG_URL = "../theme/default/image/shop/noprdimg300.png";
    var DEFAULT_CUSTOMER_PIC = "./theme/css/images/user_avatar.png";
    
    var appId = "";
    if(window.location.host.indexOf('wechat.mbqianbao.com') > -1){
	    appId = "wx4453e33d9edf7859";
    }else{
	    appId = "wx80e93f0ed4a043c8";
    }
    
    var WECHAT_URL = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + appId + "&redirect_uri="; 
    
    var loaddingDisabled = false;
    var Export = {};

    Export.setting = {
            templateBase : "",
            appVersion : null, // 版本号会在config.js里面设置，不要在这里更改，这里只是声明
            SERVER_URI : SERVER_URI,
            SERVER_IMG_URI : SERVER_IMG_URI,
            SERVER_FILE_URI : SERVER_FILE_URI,
            BLANK_IMG_URL : BLANK_IMG_URL,
            DEFAULT_CUSTOMER_PIC : DEFAULT_CUSTOMER_PIC,
            ERR_SECURITY_URI : ERR_SECURITY_URI,
            ERR_INTERNAL_URI : ERR_INTERNAL_URI,
            ERR_PAGE_NOT_FOUND_RUI : ERR_PAGE_NOT_FOUND_RUI,
            ERR_OTHER : ERR_OTHER,
            SERVER_DOMAIN : SERVER_DOMAIN,
            PLATFORM_SERVER_URI : PLATFORM_SERVER_URI
    };

    function loadTemplateComplete(def, ele, content, data) {
        var html = $(content.render(data));
        if (ele) {
            ele.empty();
            ele.append(html);
            def.resolve(ele);
        } else {
            def.resolve(html);
        }
        
        // 图片不能成功显示的时候
        /*$("img", html).each(function() {
            var error = false;
            if (!this.complete) {
                error = true;
            }

            if (typeof this.naturalWidth != "undefined" && this.naturalWidth == 0) {
                error = true;
            }

            if (error) {
                $(this).bind('error.replaceSrc', function() {
                    this.src = "default_image_here.png";
                    $(this).unbind('error.replaceSrc');
                }).trigger('load');
            }
        });*/
    }
    
    Export.disableLoadding = function() {
        loaddingDisabled = true;
    };
    
    Export.isLoaddingDisabled = function() {
        return loaddingDisabled;
    };
    
    Export.resetLoadding = function() {
        loaddingDisabled = false;
    };
    
    Export.loadTemplate = function(ele, tplId, url, data) {
        url = Export.setting.templateBase + url;
        var newDef = $.Deferred();
        if ($("#" + tplId).length > 1) {
            alert("duplicate template error");
            return;
        }
        if ($("#" + tplId).length > 0) {
            loadTemplateComplete(newDef, ele, $('#' + tplId), data);
            return newDef.promise();
        }
        
        $.get(url, {v: this.setting.appVersion}, function(content) {
            $('#template-container').append($(content));
            loadTemplateComplete(newDef, ele, $('#' + tplId), data);
        });

        return newDef.promise();
    };
    
    // 直接加载已经load完毕的template，例如商品管理，在主模板load之后，table模板也已经load完毕，所以就是同步获取模板并render，简化datatable操作.
    Export.loadTemplateLocal = function(ele, tplId, data) {
        if ($("#" + tplId).length == 0) {
            console.error("===========:", ele, tplId, data);
            alert("no template error");
            return;
        }
        if ($("#" + tplId).length > 1) {
            alert("duplicate template error");
            return;
        }
        
        data = data || {};
        var html = $($('#' + tplId).render(data));
        if (ele) {
            ele.empty();
            ele.append(html);
            return ele;
        }
        
        return html;
    };
    
    Export.loadDialogTemplate = function(dlgId, tplId, data) {
        if ($("#" + dlgId).length == 0) {
            $("#content").append($('#' + tplId).render(data));
        }
        if ($("#" + tplId).length > 1) {
            alert("duplicate template error");
            return;
        }
        
        var form = $("form", $("#" + dlgId))[0];
        form && form.reset();
        
        return $("#" + dlgId);
    };
    
    function openLoginDialog() {
    }
    
    function handleApiResponseStatus(url, data) {
        if (!data || (!data.code)) {
            console.error(url, data);
            return false;
        }

        var status = Number(data.code);
        if (data.codeText == "RESULT_LOGIN_EXPIRED") { // 登录超时重新登录
            Export.gotoLogin();
            return false;
        } else if (data.codeText == "RESULT_NEED_ADVANCE_AUTH") { // 登录超时重新登录
            Export.gotoLogin(true);
            return false;
        } else if (status == 403) { // 权限验证失败
            Export.message("您没有权限进行此操作");
            return false;
        } 

        return true;
    }
    
    Export.message = function(msg) {
	    if ($.mobile) {
	        requirejs([ 'widget/popup' ], function(popup) {
                popup.popup({msg: msg});
            });
	    } else {
		    alert(msg);
	    }
	    
    };
    
    Export.gotoLogin = function(advance) {
        var para = this.getUrlParam();
        delete para.code;
        delete para.scope;
        delete para.state;
        if (para && para.page) {
            storageUtil.getParam(para.page)
            .then(function(result) {
                storageUtil.setParam(para.page, $.extend(result, para));
            });
        }

  	  	$.cookie('_IDENTIY_KEY_', null, { expires: -1, path: "/"});
		if(advance){
			window.location.href = WECHAT_URL + encodeURIComponent(location.href) + "&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect";
		}else{
			window.location.href = WECHAT_URL + encodeURIComponent(location.href) + "&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect";
		}
    };
    
    function replace(url){
	    location.replace(url);
    };
    
    function handleHttpResponseStatus(url, status) {
        var status = Number(status);
        if (status == 404) { // 页面未找到
            Export.message("发生404错误");
        } else if (status >= 500) { // 内部错误
            Export.message("发生系统错误");
//            alert(url + " " + status)
//            window.location.href = ERR_INTERNAL_URI;
        } else { // 其他错误
            Export.message("发生未知错误");
//            alert(url + " " + status)
//            window.location.href = ERR_OTHER;
        }
    }

    Export.ajax = function(url, param, method, skipValidation, useCache, usePlatform) {
        return this.jqAjax(url, param, method, skipValidation, useCache, usePlatform);
    }
    
    Export.jqAjax = function(url, param, method, skipValidation, useCache, usePlatform) {
        var newDef = $.Deferred();
        if (url) {
            if (url.indexOf("http") == -1) {
                if (usePlatform) {
                    url = PLATFORM_SERVER_URI + url;
                } else {
                    url = SERVER_URI + url;
                }
            }
        } else {
//            alert('error');
            throw 'no url';
        }
        
        if (method !== "GET") {
            param = (typeof param === "string") ? param : JSON.stringify(param);
        }
        
        var testToken = null;
        if (!isWx) {
            testToken = "pEy2XxcX3bndE2i3AraRtmNmQrhCUz3Tj4sa2yn+GWM=";
        }
        
        $.ajax({    
            url: url,    
            type: method.toUpperCase(),    
            dataType: "json",    
            contentType: "application/json; charset=utf-8",    
            data: param,    
            cache: !!useCache,
            success: function(data) {    
                if (skipValidation) {
                    newDef.resolve(data);
                } else if (handleApiResponseStatus(url, data)) {
                    newDef.resolve(data);
                }
            },
            error: function(request, textStatus) { 
                handleHttpResponseStatus(url, request.code);
                console.error(request, textStatus);
            }
        });    

        this.resetLoadding();
        
        return newDef.promise();
    };

    Export.post = function(url, param, skipValidation, usePlatform) {
        return Export.ajax(url, param, 'POST', skipValidation, false, usePlatform);
    };

    Export.put = function(url, param, skipValidation, usePlatform) {
        return Export.ajax(url, param, 'PUT', skipValidation, false, usePlatform);
    };

    Export.get = function(url, param, useCache, skipValidation, usePlatform) {
        if (!param) {
            param = "v=" + this.setting.appVersion;
        } else {
            if (typeof param == 'string') {
                param += "&v=" + this.setting.appVersion;
            } else    {
                param.v = this.setting.appVersion;
            }
        }
        return Export.ajax(url, param, "GET", skipValidation, useCache, usePlatform);
    };

    Export.del = function(url, param, skipValidation, usePlatform) {
        return Export.ajax(url, param, "DELETE", skipValidation, false, usePlatform);
    };
    
    Export.createUrlParam = function(para) {
//        var uri = [];
//        for (var k in para) {
//            uri.push(k + "=" + encodeURIComponent(para[k]));
//        }
//        
//        return "?" + uri.join("&");
    	return "?" + $.param(para);
    };
    
    Export.serializeForm = function(id) {
        var arr = $("#" + id).serializeArray();
    
        var ret = {};
        for (var k in arr) {
            if (ret[arr[k].name]) {
                ret[arr[k].name] = this.toArray(ret[arr[k].name]);
                ret[arr[k].name].push(arr[k].value);
            } else {
                ret[arr[k].name] = arr[k].value;
            }
        }
        
        return ret;
    };
    
    Export.toArray = function(obj) {
        return (!obj || $.isArray(obj)) ? obj : [obj];
    };
    
    Export.inArr = function(arr, val) {
        if (!arr) {
            return false;
        }
        
        for (var i in arr) {
            if (arr[i] == val) {
                return true;
            }
        }
        
        return false;
    };
    
    Export.getActivityId = function(url) {
        var query = url || window.location.href;
        var start = query.indexOf('#');
        if (start > -1) {
            return query.substring(start + 1);
        }

        return null;
    };
    
    Export.getUrlParam = function(url) {
        var query = url || window.location.search;
        var start = query.indexOf('?');
        if (start > -1) {
            query = query.substring(start + 1);
        }

        var paras = {};
        if (query) {
            var queryParams = query.split('&');
            for ( var k in queryParams) {
          	  if (!queryParams[k]) continue;
              var param = queryParams[k].split('=');
              paras[param[0]] = decodeURIComponent(param[1] || "");
            }
        }
        return paras;
    };
    
    Export.startWith = function(str, find){         
        var reg = new RegExp("^"+find);         
        return reg.test(str);                
    };

    Export.endWith = function(str, find){         
        var reg = new RegExp(find+"$");         
        return reg.test(str);                
    };
    
    Export.concat = function(arr1, arr2) {
        if (!arr1 || !arr2) {
            return;
        }
        
        $(arr2).each(function() {
            arr1.push(this);
        });
    };
    
    Export.delHtmlTag = function(str){    
        str = $.trim(str);
        if (!str) return "";
        
        return $.trim(str.replace(/<[^>]+>/g,"").replace(/&[^;]{2,6};/g, ""));//去掉所有的html标记
    }; 
    
    return Export;
});