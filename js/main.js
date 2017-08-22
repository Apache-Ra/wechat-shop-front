var TEST_DOMAIN = false;
var SERVER_DOMAIN = document.domain;
var platformContext = "mbayShopConsoleBackend";
var frontContext = "mbayShopH5Backend";
var isWx = false;

var href = location.href;
if (href.indexOf("officetest1") > -1) {
	if (href.indexOf("mbay-shoph5-front1") > -1) {
		platformContext = "mbayShopConsoleBackend1";
		frontContext = "mbayShopH5Backend1";
	}
}

var KDXWechat = {
    version : ""
};
 
KDXWechat.baseUrl = location.href.split("index.html")[0];

var GLOBAL_PARA = {};

globalInit();

function globalInit() {
    if (SERVER_DOMAIN.indexOf('mbqianbao.com') < 0) {
        TEST_DOMAIN = true;
    }
    
    requirejs.config({
        urlArgs : 'v=' + (new Date()).getTime(),
        waitSeconds: 0,
        paths : {
            'ver' : KDXWechat.baseUrl + "data/ver"
        }
    });
    
    requirejs([ 'ver' ], function(ver) {
        isWx = isWeiXin();
        enterApp(ver.version);
    });
}

function isWeiXin() {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
        return true;
    } else {
        return false;
    }
}

// 执行时，将错误信息打印出来
// window.onerror = function(msg, url, line) {
// var idx = url.lastIndexOf("/");
// if (idx > -1) {
// url = url.substring(idx + 1);
// }
// alert("ERROR in " + url + " (line #" + line + "): " + msg);
// return false;
// };

function enterApp(version) {
    KDXWechat.version = version;

    requirejs.config({
        baseUrl : KDXWechat.baseUrl + 'js/',
        urlArgs : 'v=' + KDXWechat.version,
        waitSeconds: 0,
        paths : {
            'jquery' : '../lib/jquery/jquery-2.1.1.min',
            'jqueryCookie' : '../lib/jquery/jquery.cookie-1.4.1.min',
            'jqm' : '../lib/jquery/jquery.mobile-1.4.5.min',
            'formatCurrency' : '../lib/jquery/jquery.formatCurrency',
            'jsWeixin' : 'https://res.wx.qq.com/open/js/jweixin-1.1.0',
            'text' : '../lib/requirejs/require_text',
            'css' : '../lib/requirejs/css.min',
            'iscroll' : '../lib/iscroll-probe',
            'fastclick' : '../lib/fastclick'

        },
        shim : {
        	'jqueryCookie' : "jquery"
        }
    });
    
    requirejs([ 'util/util', 'service/login', 'jqueryCookie' ],
	            function(util, login) {
        // 微信登陆验证
        var para = util.getUrlParam(location.href);
        var param = util.getUrlParam();
        delete param.code;
        delete param.state;
        delete param.ver;
        window.history.replaceState(null, null, util.createUrlParam(param));
        if (para.code) {
            // 通过微信登录跳转
            login.login(para.code).then(function(result) {
                if (result.codeText == "OK") {
                    // 启动页面监听程序
                    startContainer(result.nextPage);
                } else if (result.codeText == "RESULT_NEED_ADVANCE_AUTH") {
                    util.gotoLogin(true);
                } else {
                    // TODO 登录错误
                    alert("发生系统错误，请稍后重试");
                    return;
                }
            });
        } else {
            login.testLogined().then(function(logined) {
                if (logined) {
                    // 启动页面监听程序
                	startContainer();
                } else {
                    util.gotoLogin();
                }
            });
        }
    });
} // end enterApp

function startContainer(nextPage) {
    requirejs([ 'core/pageContainer', 'util/util', 'util/nativeIf', 'service/login', 'fastclick', 'manifest'],
            function(pageContainer, util, nativeIf, login, fastclick, manifest) {
		
        // 初始化jqm，必须在加载jqm的js之前绑定
        $(document).one("mobileinit", function() {
            // 使jQuery支持跨域访问
            $.support.cors = true;

            // 如果需要跨域访问页面文件，设置为true；
            $.mobile.allowCrossDomainPages = true;

            $.mobile.loader.prototype.options.text = "loading";
            $.mobile.loader.prototype.options.textVisible = false;
            $.mobile.loader.prototype.options.theme = "a";
            $.mobile.loader.prototype.options.html = "";
            $.mobile.buttonMarkup.hoverDelay = "false";

            // 取消jqm默认class加载
            $.mobile.keepNative = "select, input, button, a, textarea";

            $.mobile.window.one("pagecontainercreate", function(e) {
                var para = util.getUrlParam(location.href);
                GLOBAL_PARA.campaignId = para.campaignId;
                pageContainer.start(nextPage);
            });
        });

        requirejs([ 'manifest',
                    'jqm',
                    'css!' + manifest.path.css + 'lib/frozen/frozen.min',
                    'css!' + manifest.path.css + 'lib/swiper/swiper',
                    'css!' + manifest.path.css + 'common',
                    'css!' + manifest.path.css + 'slider',
                    'css!' + manifest.path.css + 'toolbar',
                    ], function(
                manifest) {
        	$("div[data-role=header]").show();
//        	$("div[data-role=footer]").show();
            manifest.path.baseUrl = KDXWechat.baseUrl;

            util.setting.appVersion = KDXWechat.version;
            $(document).ajaxStart(function() {
                if (!util.isLoaddingDisabled()) {
                    $.mobile.loading('show');
                }
            });

            $(document).ajaxStop(function() {
                $.mobile.loading('hide');
            });

            fastclick.attach(document.body);
        });
    });
}// end startContainer