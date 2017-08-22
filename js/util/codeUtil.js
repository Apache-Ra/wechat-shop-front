define(['util/util'], function( util ) {
  var Export = {
      DEFAULT_CITY_ID : 103,
      DEFAULT_CITY_NAME : "上海",
      STATUS_PRODUCT : 20,
      STATUS_ORDER : 10,
      PRODUCT_CODE : {
        'DRAFT' : {code: 'DRAFT', text: '未提交'},
        'PENDING' : {code: 'PENDING', text: '待审核'},
        'ONLINE' : {code: 'ONLINE', text: '已上架'},
        'OFFLINE' : {code: 'OFFLINE', text: '已下架'},
        'AUDITED' : {code: 'AUDITED', text: '已审核'},
        'DELIVERING' : {code: 'DELIVERING', text: '待发货'},
        'DELIVERED': {code: 'DELIVERED', text: '已发货'},
        'REJECTED' : {code: 'REJECTED', text: '审核不通过'}
      },
      ACCOUNT_CODE : {
        'NORMAL' : {code: 'NORMAL', text: '正常'},
        'CLOSED' : {code: 'CLOSED', text: '冻结'}
      },
      USER_PROP_TYPE : ['manufacturer',
                        'serviceProvider', 
                        'terminalstore']
  };
  
  return Export;
});