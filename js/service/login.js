define([ 'core/base', 'util/util', 'util/storageUtil', 'util/lbsUtil',
		'core/navigation' ], function(base, util, storageUtil, lbsUtil,
		navigation) {

	var id_ = 'profile_validation';
	var key_ = 'KDXWechatSHOW';

	var service = {
		login : function(wechatCode) {
			var me = this;
			if (!wechatCode) {
				return {
					codeText : "SYSTEM_ERROR"
				};
			}
			storageUtil.set("wechatCode", {
				wechatCode : wechatCode
			});
			return util.post('wechat/login', {
				wechatCode : wechatCode
			}, true).then(function(result) {
				var nextPage = null;
				if (result.codeText == "OK") {
					// 正常跳转
					storageUtil.set("userprofile", {
						userInfo : result.data
					});
				} else if (result.codeText == "WECHAT_NEEDBIND_PHONE") {
					nextPage = "bindPhone";
				} else {
					return {
						codeText : result.codeText
					};
				}

				return {
					codeText : "OK",
					nextPage : nextPage
				};
			});
		},

		testLogined : function() {
			return storageUtil.get("userprofile")
			.then(function(profile) {
				if (!profile || $.isEmptyObject(profile) || !$.cookie("_IDENTIY_KEY_")) {
					return false;
				}
				
				return true;
			});
		}
	};

	return service;
});
