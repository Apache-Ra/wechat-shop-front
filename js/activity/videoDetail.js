define(['activity/activity', 'util/util', 'util/storageUtil', 'util/format', 'util/domUtil', 'core/navigation', 'widget/toolbar','../../lib/swiper/swiper'],
    function(Activity, util, storageUtil, format, domUtil, navigation, toolbar,swiper) {

	var VideoDetail = function(){
		Activity.call(this);
	};

	Activity.inheritedBy(VideoDetail);

	/**
	 * 页面第一次创建执行
	 * 这里绑定唯一事件，加载唯一数据
	 */
	VideoDetail.prototype.onCreate = function() {
	};

	/**
	 * 加载动态数据，刷新标题等
	 */
	VideoDetail.prototype.show = function() {
		var me = this;

		storageUtil.getParam("videoDetail")
		.then(function(result) {
			me.initData(result);

			setTimeout(function() {
				/*同场直播banner*/
				var swiper = new Swiper('.swiper-container', {
				  pagination: '.swiper-pagination',
				  slidesPerView: 2,
				  paginationClickable: true,
				  spaceBetween: 5
				  //loop: true
				});
			}, 1000);
		});
	};

	VideoDetail.prototype.initData = function(para) {
	  var me = this;
	  util.get("campaign/detail/" + para.campaignId).then(function(result) {
	    if (result.codeText == "OK") {
	    	//同场直播
	    	var videoDataList = result.data.videoList;
	    	if(!videoDataList || !videoDataList.length){
	    		$(".goodStuff_recommendation").hide();
	    		$(".same_liveRadio").hide();
	    		return;
	    	}
    		$(".goodStuff_recommendation").show();
    		$(".same_liveRadio").show();
	    	
    		changeVideo(videoDataList[0]);
	    	for (var i in videoDataList) {
	    		var $item = me.$data['video-item-template'].dom.clone();
//	    		$item.attr("videosource", videoDataList[i].videoIdentify);
//	    		$item.attr("videtxt", videoDataList[i].videoName);
	    		//$product.find("img").attr("src",format.photoImgUrl(data.imgUrl, "300x0"));
	    		
	    		$item.find("img").attr("src",format.photoImgUrl(videoDataList[i].imgUrl,"300x0"));
	    		$item.find(".banner_text").html(videoDataList[i].videoName);	               
	    		me.$data["video-container"].dom.append($item);
//	    		$("#media").attr("poster",format.photoImgUrl(videoDataList[0].imgUrl, "300x0"));
//	    		$("#media").attr("src",videoDataList[0].videoIdentify);
	    		
	    		//点击切换视屏
	    		bindVideoChange($item, videoDataList[i]);
	    		
				//对video进行监听
				setTimeout(function() {
			    	exitFullscreen();
			    }, 5000);
			    function exitFullscreen() {	
					var vdo = $("video");
					if(vdo.exitFullscreen) { 
						vdo[0].exitFullscreen(); 
					} else if(vdo.mozExitFullScreen) { 
						vdo[0].mozExitFullScreen(); 
					} else if(vdo.webkitExitFullscreen) { 
						vdo[0].webkitExitFullscreen(); 
					} 
				//vdo[0].play();
				}	    	    
	    	}
	    	//好货推荐
	    	var productDataList = result.data.productList;
	    	for (var j in productDataList) {
	    		var $item = me.$data['product-item-template'].dom.clone();
	    		$item.find("p").find("img").attr("src",format.photoImgUrl(productDataList[j].productImage, "300x0"));
	    		$item.find(".product_title").html(productDataList[j].briefName);
	    		me.$data["product-container"].dom.append($item);
	    		me.gotoProductDetail($item, productDataList[j]);
	    	}
	    }
	    
	  });
	  
	  function bindVideoChange($item, data) {
		  $item.on("click",function(){
  	    	//将点击对象的数据传递给第一个  获取当前div的序列
  			if($(this).before()){
  				//$(this).next().after($(this));
  				$(".swiper-slide:eq(0)").before($(this));
  				$(this).addClass("the_current_color");
  				$(this).siblings().removeClass("the_current_color");
  			}
  			
  			changeVideo(data);
//  	    	var newvideo = $("video");
//  	    	var sourceID = $(this).attr("videosource");
//  	    	var newVdeoTxt = $(this).attr("videtxt");
//  	    	var thisImg = $(this).find("img").attr("src");
//  	    	
//  			newvideo.attr({"src":sourceID});
//  			
//  			$(".videoShare_title").html(newVdeoTxt);
//  			
//  			newvideo[0].load();
//  			newvideo[0].play();
  	    })
	  }

					  
	  function changeVideo(data) {
		var $obj;
		var videoIdentify = $.trim(data.videoIdentify);
		$("#video-container").empty();
		if (util.startWith(videoIdentify, "http")) {
			$obj = $("<video controls='controls' autoplay></video>");
			$obj.attr("src", videoIdentify);
			$obj.attr("poster",format.photoImgUrl(data.imgUrl, "300x0"));
			
		} else if (util.startWith(videoIdentify, "<iframe")) {
			$obj = $(videoIdentify);
		} else {
			return;
		}

		$obj.css({width:"100%",height:"100%"});
		$("#video-container").append($obj);
		$(".videoShare_title").html(data.videoName);
	  }
  
	  //爆品推荐
	  util.get('campaign/list', {offset:0, limit:2}).then(function(result) {
        if (result.codeText == "OK") {
          //me.onCreateList(result);
          var productDataList = result.data;
          if(productDataList == null || productDataList == "" || productDataList == undefined){
        	  $(".detonation_recommendation").hide();
          }
          for(var k in productDataList){
        	  var $item = me.$data['detonation-item-template'].dom.clone();
        	  $item.find("p").find("img").attr("src",format.photoImgUrl(productDataList[k].imgUrl, "300x0"));
        	  $item.attr("campaignId",productDataList[k].campaignId);
        	  $item.find(".detonation_title").html(productDataList[k].campaignName);
        	  me.$data["detonation-container"].dom.append($item);
        	  //爆品推荐切换
    		  me.gotoAnotherCampaign($item, productDataList[k]);
          }
        }
      });
	};
	
	VideoDetail.prototype.gotoProductDetail = function($item, prd) {
		var me = this;
		$item.on("click", function() {
			me.moveTo("productDetail", {productId: prd.productId});
		});
	};
	
	VideoDetail.prototype.gotoAnotherCampaign = function($item, data) {
		var me = this;
  	  	$item.on("click",function(){
  	  		me.clearDom();
  	  		storageUtil.setParam("videoDetail", {campaignId: data.campaignId});
  	  		var param = util.getUrlParam();
  	  		param.campaignId = data.campaignId;

  	  		window.history.replaceState(null, null, util.createUrlParam(param));
  	  		me.show();
  	  	});
	};
	
	VideoDetail.prototype.clearDom = function() {
		var me = this;
		me.$data["video-container"].val("");
		me.$data["product-container"].val("");
		me.$data["detonation-container"].val("");
	};
	/**
	 * 执行清理工作
	 */
	VideoDetail.prototype.hide = function(event, ui) {
		this.clearDom();
	};

	return new VideoDetail();

});