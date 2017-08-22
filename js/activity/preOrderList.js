define(['activity/activity', 'widget/toolbar', 'util/domUtil', 'util/util', 'util/format', 'util/scrollUtil', 'util/storageUtil','util/dateUtil', 'widget/toolbar'],
		function(Activity, toolbar, domUtil, util, format, scrollUtil, storageUtil,dateUtil, toolbar) {

    var PAGE_DATA_COUNT = 10;
    var OFFSET = 0;
	var preProductList = function(){
		Activity.call(this);
	};

	Activity.inheritedBy(preProductList);

	/**
	 * 页面第一次创建执行
	 * 这里绑定唯一事件，加载唯一数据
	 */
	preProductList.prototype.onCreate = function() {
	};

	/**
	 * 加载动态数据，刷新标题等
	 */
	preProductList.prototype.show = function() {
		var me = this;
        
		storageUtil.getParam("preOrderList")
		.then(function(result) {
	        me.initData(result);
		});
	};
	
    preProductList.prototype.initData = function(para) {
        var me = this;

        me.dataPara = {};
        me.dataPara.offset = 0;
        me.dataPara.limit = PAGE_DATA_COUNT;
        
//        me.appointmentStatus = para.appointmentStatus;
        var target = null;
        var container = null;
//        if (me.appointmentStatus.name == "CONVERTORDER") {
//            target = me.$data.service.dom;
//        } else if (me.appointmentStatus.name == "COMPLETED") {
//            target = me.$data.appointment.dom;
//        } else {
//            target = me.$data.allProduct.dom;
//        }
        
		me.getData(container);
		
		me.$data.allProduct.dom.on("tap", function(){
			if($(this).attr('class') == 'current'){
				return;
			}
			me.appointmentStatus = {};
			me.getData();
		});
		
//		me.container_.on("tap", ".itemHeader", function() {
//		    me.moveTo("storeDetail", {companyId: $(this).attr("companyId"), moveTo_: "preOrderList"});
//		});
		
		me.container_.on('tap', 'div[name=preOrderItems]', function() {
			var appointmentId = $(this).data("appointmentId");
			me.moveTo("preOrderDetail", {appointmentId: appointmentId});
		});
	};

	preProductList.prototype.getData = function(offset) {
		var me = this;
		var para = {};
//		para.productType = "PRODUCT";
//		if(me.appointmentStatus){
//			para.appointmentStatus = me.appointmentStatus;
//		}
		
		var dataPara = me.dataPara;
		dataPara.offset = offset || 0;
//		para.offset = dataPara.offset;
//		para.limit = PAGE_DATA_COUNT;
		para.offset = OFFSET;
		util.post('appointment/myorder', para).then(function(result) {
			if (result.codeText == "OK" && result.data) {
				var orders = result.data;
				for (var k in orders) {
					var preOrder = orders[k];
					var orderItems = preOrder.customerAppointmentItems;
					if (!orderItems) {
					    continue;
					}

					var $orderItem;
					if (orderItems.length == 1) {
					    $orderItem = me.$data["order-item-template-signle"].dom.clone();
					} else {
					    $orderItem = me.$data["order-item-template-multi"].dom.clone();
					}
					$orderItem.removeAttr("name");

					var $dom = domUtil.getDomByName($orderItem);
					
					$dom.appointmentCode.val(preOrder.appointmentCode);
//					$dom.terminalStoreName.val(preOrder.terminalStore.companyName);
	                if (orderItems.length == 1) {
                        var prd = orderItems[0];
                        $dom.productName.val(prd.productName);
                        if (prd.productSpec) {
                            try {
                                var productSpec = JSON.parse(prd.productSpec);
                                var html = [];
                                for (var k in productSpec) {
                                    html.push(productSpec[k]);
                                }
                                $dom.productSpec.val(html.join(" "));
                            } catch(e) {}
                        }
                        $dom.quantity.val("x" + prd.quantity);
                        $dom.salePrice.val(format.fromCurrency(prd.actualPrice));
                        $orderItem.find("img").attr("src", format.photoImgUrl(prd.productImage, "300x0"));
                    } else if (orderItems.length > 1) {
                        var len = Math.min(3, orderItems.length);
                        var html = [];
                        for (var i=0; i<len; i++) {
                            var prd = orderItems[i];
                            html.push("<img src='" + format.photoImgUrl(prd.productImage, "300x0") + "' />");
                        }
                        $dom.preOrderItems.dom.html(html.join(" "));
					}
					
					$dom.preOrderItems.dom.data("appointmentId", preOrder.appointmentId);
//								$orderItem.find(".itemHeader").attr("companyId", preOrder.terminalStoreId);
//								$dom.orderTime.val(dateUtil.dateStrFormat("yyyy/MM/dd hh:mm:ss", preOrder.createTime));

			        if (preOrder.saleOrder) {
			        	$dom.statusName.val("支付状态："+preOrder.saleOrder.saleOrderStatus.text);
			        } else {
			        	$dom.statusName.val("支付状态："+preOrder.appointmentStatus.text);
			        }
					
					me.$data['list-container'].dom.append($orderItem);
				}
			}
			
            me.checkNextPage(result);
            me.renderEmpty();

            // 绑定刷新加载事件
            setTimeout(function() {
                me.bindLoadEvents_();
            }, 500);
		});
	};
    
	preProductList.prototype.renderEmpty = function() {
        if (this.$data["list-container"].dom.find("li").length > 0) {
            this.container_.removeClass("empty");
        } else {
            this.container_.addClass("empty");
        }
    };

	preProductList.prototype.checkNextPage = function(info) {
        this.dataPara.offset = info.offset + PAGE_DATA_COUNT;
        if (!info.data || info.pageInfo.limit > info.data.length) {
            this.dataPara.hasNext = false;
        } else {
        	OFFSET = OFFSET + PAGE_DATA_COUNT;
            this.dataPara.hasNext = true;
        }
    };

    preProductList.prototype.bindLoadEvents_ = function() {
        var me = this;
        if (me.scroller) {
            me.scroller.refresh();
            return;
        }
        var dataPara = me.dataPara;
        var para = {};
        para.pullDownEl = me.$data.m_list_refresh.dom;
        para.pullUpEl = me.$data.m_list_loadmore.dom;
        para.wrapperSelector = me.$data.wrapper.dom[0];
        //下拉刷新
        para.pullDownAction = function() {
        	OFFSET = 0;
        	me.clearList();
                //me.clearCurrent();
                me.getData();
        };
        //加载更多
        para.pullUpAction = function() {
            me.getData(dataPara.offset);
        };
        para.hasNextCb = function() {
            return me.dataPara.hasNext;
        };
        
        me.scroller = scrollUtil.bind(para);
    };
    
    preProductList.prototype.clearList = function() {
        this.$data['list-container'].dom.empty();
    };
	
    /**
	 * 执行清理工作
	 */
	preProductList.prototype.hide = function(event, ui) {
		var me = this;
		me.$data['list-container'].dom.empty();
		me.container_.off('tap', 'div[name=preOrderItems]');
		me.container_.off("tap", ".itemHeader");
        me.clearList();

        OFFSET = 0;
		if (me.scroller) {
            me.scroller.unbind();
            me.scroller = null;
		}
	};

	return new preProductList();
});


