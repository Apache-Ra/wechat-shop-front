define([ 'activity/activity', 'util/storageUtil', 'util/util', 'util/format', 'util/domUtil',
        'widget/toolbar', 'widget/confirm' ], function(Activity, storageUtil, util,
        format, domUtil, toolbar, confirm) {

    var PreOrderDetail = function() {
        Activity.call(this);
    };

    Activity.inheritedBy(PreOrderDetail);

    /**
     * 页面第一次创建执行 这里绑定唯一事件，加载唯一数据
     */
    PreOrderDetail.prototype.onCreate = function() {
        this.bindEvent();
    };

    PreOrderDetail.prototype.bindEvent = function() {
        this.container_.find("textarea").on("propertychange input", function(event) {        
            if(this.value.length >= 200) {
                this.value = this.value.substring(0, 200); 
            }
        }); 
    };

    /**
     * 加载动态数据，刷新标题等
     */
    PreOrderDetail.prototype.show = function() {
        var me = this;
        storageUtil.getParam("preOrderDetail").then(function(para) {
            if (!para || !para.appointmentId) {
                return;
            }

            me.para = para;
            me.getPreOrderDetail_(para);
        });
    };

    PreOrderDetail.prototype.getPreOrderDetail_ = function(para) {
        var me = this;
        util.get("appointment/" + para.appointmentId).then(function(result) {
            if (result.codeText != "OK") {
                me.error("查询预约单失败+" + para.appointmentId);
                return;
            }
            me.renderPreOrderDetail_(result.data);
        });
    };

    PreOrderDetail.prototype.renderPreOrderDetail_ = function(order) {
        var me = this;
        me.showAddress(order);
        me.showDescription(order);
                
        me.$data["product-item-container"].val("");
        var prds = order.customerAppointmentItems;
        if (prds) {
            for (var k in prds) {
                var $product = me.$data["product-item-template"].dom.clone();
                $product.removeAttr("name");
                var $dom = domUtil.getDomByName($product);
                var product = prds[k];
                $dom.productName.val(product.productName);
                
                if (product.productSpec) {
                    var spec = [];
                    try {
                        var productSpec = JSON.parse(product.productSpec);
                        for (var i in productSpec) {
                            if (productSpec[i]) {
                                spec.push(productSpec[i]);
                            }
                        }
                        $dom.productSpec.val(spec.join(" "));
                    } catch (e) {}
                }
                
                $dom.salePrice.val(format.fromCurrency(product.actualPrice));
                $dom.productCount.val(product.quantity);
                $dom.image.dom.attr('src', format.photoImgUrl(product.productImage, "300x0"));
                me.$data["product-item-container"].dom.append($product);
            }
        }
        
        me.$data.appointmentCode.val(order.appointmentCode);
//        me.$data.terminalStoreName.val(order.terminalStore.companyName + " Tel：" + (order.terminalStore.contactPhone || order.terminalStore.contactCellphone));
        me.$data.saleAmount.val(format.fromCurrency(order.saleAmount));
        
        if (order.saleOrder) {
        	me.$data.appointmentStatus.val(order.saleOrder.saleOrderStatus.text);
        } else {
        	me.$data.appointmentStatus.val(order.appointmentStatus.text);
        }
//        if (order.invoiceType == 0) {
//            me.$data.invoice.dom.remove();
//        } else if (order.invoiceType == 1002) {
//            me.$data.invoiceItem.dom.remove();
//            me.$data.invoiceType.val('个人');
//        } else if (order.invoiceType == 1001) {
//            me.$data.invoiceType.val('公司');
//            me.$data.invoiceTitle.val(order.invoiceTitle);
//        }

        if (order.saleOrder) {
        	var saleOrderStatus = order.saleOrder.saleOrderStatus.name;
	        if (saleOrderStatus == "RECEIVED") {
	            if (order.reviewed) {
	                me.$data.footer.dom.addClass("hide");
	            } else {
	                me.$data.footerFunc.val("请评价");
	                me.bindReview(order);
	            }
	        } else {
	            me.$data.footer.dom.addClass("hide");
	        }
        } else {
        	if (order.appointmentStatus.name == "NEW") {
	            me.$data.footerFunc.val("立即支付");
	            me.bindPayment(order);
	        } else {
	            me.$data.footer.dom.addClass("hide");
        	}
        }
    };

    PreOrderDetail.prototype.showDescription = function(order){
        if (order.appointmentStatus.name == "NEW") {
            this.$data.noteText.dom.show();
            this.$data.noteTextArea.val(order.description);
            this.$data.noteContainer.dom.hide();
        } else {
            this.$data.noteText.dom.hide();
            this.$data.noteContainer.dom.show();
            
            if (order.saleOrder && order.saleOrder.shippings && order.saleOrder.shippings.length) {
            	var desc = [];
            	$.each(order.saleOrder.shippings, function() {
            		desc.push(this.shippingCompany + ":" + this.shippingNo);
            	});
            	desc.push(order.description);
            	this.$data.noteContainer.val(desc.join("<br/>"));
            } else {
            	var desc = (order.description || "") + "<br/>订单配货中"; 
            	this.$data.noteContainer.val(desc);
            }
        }
    };

    PreOrderDetail.prototype.showAddress = function(order){
        var me = this;
        me.addressId = 0;
        if (order.appointmentStatus.name == "NEW") {
            storageUtil.get('g_defaultAddress').then(function(address) {
                storageUtil.remove('g_defaultAddress');
                if (address && address.addressId) {
                    me.renderAddress(address);
                } else if (order.address && order.address.addressId) {
                    me.renderAddress(order.address);
                } else {
                    util.get('user/address/default').then(function(result) {
                        if (result && result.data) {
                            me.renderAddress(result.data);
                        } else {
                            me.renderAddress();
                        }
                    });
                }
            });
            
            me.bindAddressEvent();
        } else {
            me.renderAddress(order.address);
        }
    };
    
    PreOrderDetail.prototype.bindAddressEvent = function() {
        var me = this;
        $('#order_detail .address-box').on('tap', function(){
            me.moveTo('addressList', {moveTo_: "preOrderDetail"});
        });
    };
    
    PreOrderDetail.prototype.renderAddress = function(address) {
        var me = this;
        if (address && address.addressId) {
            var data = address;

            me.$data.addressName.val(address.customerName);
            me.$data.addressPhone.val(address.cellphone);
            me.$data.addressText.val(address.provinceName + ' ' + address.cityName + 
        		    address.areaName + '' + address.address);
            
            me.addressId = data.addressId;
        } else {
            me.$data.addressName.val('无默认收货地址');
            me.$data.addressText.val('请添加新的收货地址');
        }
    };
    
    PreOrderDetail.prototype.bindReview = function(order) {
        var me = this;
        me.$data.footer.dom.removeClass("hide");
        this.$data.footerFunc.dom.off("tap").on("tap", function() {
            me.moveTo("evaluate", {extType: "APPOINTMENT", extId: order.appointmentId});
        });
    };
    
    PreOrderDetail.prototype.bindPayment = function(order) {
        var me = this;
        me.$data.footer.dom.removeClass("hide");
        this.$data.footerFunc.dom.off("tap").on("tap", function() {
            if (order.appointmentStatus.name != "NEW") {
                return;
            }
            
            var description = me.$data.noteTextArea.val();
            if (description) {
                description = description.substring(0, 200);
            }
            util.put("appointment/" + order.appointmentId, {addressId: me.addressId, description: description})
            .then(function(result) {
                if (result.codeText == "OK") {
                    var para = {
                            totalAmount : order.saleAmount,
                            item : [order.appointmentCode]
                    }
                    me.moveTo("payment", {data:para});
                } else {
                    me.info("订单保存失败");
                }
            });
        });
    };

    /**
     * 可以在这里阻止页面跳转
     */
    PreOrderDetail.prototype.beforechange = function(event, ui) {
        console.debug("PreOrderDetail.beforechange");
    };

    /**
     * 执行清理工作
     */
    PreOrderDetail.prototype.hide = function(event, ui) {
        this.$data.footerFunc.dom.off("tap");
        $('#order_detail .address-box').off('tap');

        this.$data.noteText.dom.hide();
        this.$data.noteContainer.dom.hide();
        this.$data.noteContainer.val("");
        this.$data.noteTextArea.val("");
        console.debug("PreOrderDetail.hide");
    };

    return new PreOrderDetail();
});