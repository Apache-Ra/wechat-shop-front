define(function() {

  var MAP = {
    home : {'activity': 'home', 'layout' : 'home.html', toolbar : {header : {title : ["美贝直通车直播购物平台"]}, footer: {show: true, activityId: "home"}}},
    bindPhone: {'activity': 'bindPhone', 'layout' : 'bindPhone.html', toolbar : {header : {title : ["手机绑定"], backBtn: false}}},
    position: {'activity': 'position', 'layout' : 'position.html', toolbar : {header : {title : ["位置"], backBtn: true}}},
    articleList: {'activity': 'articleList', 'layout' : 'articleList.html', toolbar : {header : {title : ["知识库"], backBtn: true}, footer: {show: false, activityId: "articleList"}}},
    articleDetail: {'activity': 'articleDetail', 'layout' : 'articleDetail.html', toolbar : {header : {title : ["知识库"], backBtn: true}}},
    KDXDetail: {'activity': 'KDXDetail', 'layout' : 'KDXDetail.html', toolbar : {header : {title : ["了解美贝直通车"], backBtn: true}}},
    aboutUS: {'activity': 'aboutUS', 'layout' : 'aboutUS.html', toolbar : {header : {title : ["了解美贝直通车"], aboutUS: true}}},
    useProcess: {'activity': 'useProcess', 'layout' : 'useProcess.html', toolbar : {header : {title : ["使用流程"], useProcess: true}}},
    customerServiceDetail: {'activity': 'customerServiceDetail', 'layout' : 'customerServiceDetail.html', toolbar : {header : {title : ["售后服务"], backBtn: false}, footer: {show: true, activityId: "customerServiceDetail"}}},
    terminalStoreList: {'activity': 'terminalStoreList', 'layout' : 'terminalStoreList.html', toolbar : {header : {title : ["服务门店"], backBtn: true}, footer: {show: false}}},
    packageList: {'activity': 'packageList', 'layout' : 'packageList.html', toolbar : {header : {title : ["功能分类"], backBtn: true}, footer: {show: false, activityId: "packageList"}}},
    productList: {'activity': 'productList', 'layout' : 'productList.html', toolbar : {header : {title : ["产品列表"], backBtn: true}, footer: {show: false, activityId: "productList"}}},
    videoDetail: {'activity': 'videoDetail', 'layout' : 'videoDetail.html',mainTitle:"麻布爆品", toolbar : {header : {title : ["麻布爆品"], backBtn: false}, footer: {show: true, activityId: "videoDetail"}}},
    productDetail: {'activity': 'productDetail', 'layout' : 'productDetail.html', toolbar : {header : {title : ["产品详情"], backBtn: true}, footer: {show: false}}},
    preOrderList: {'activity': 'preOrderList', 'layout' : 'preOrderList.html', toolbar : {header : {title : ["我的订单"], backBtn: true}, footer: {show: true, activityId: "mine"}}},
    preOrderDetail: {'activity': 'preOrderDetail', 'layout' : 'preOrderDetail.html', toolbar : {header : {title : ["预约详情"], backBtn: true}, footer: {show: false}}},
    protocal: {'activity': 'protocal', 'layout' : 'protocal.html', toolbar : {header : {title : ["服务条款"], backBtn: true}}},
    search: {'activity': 'search', 'layout' : 'search.html', toolbar : {header : {title : [], backBtn: true}, footer: {show: false, activityId: "productList"}}},
    mine: {'activity': 'mine', 'layout' : 'mine.html', toolbar : {header : {title : ["个人中心"]}, footer: {show: true, activityId: "mine"}}},
    more: {'activity': 'more', 'layout' : 'more.html', toolbar : {header : {title : ["更多"], backBtn: true}}},
    about: {'activity': 'about', 'layout' : 'about.html', toolbar : {header : {title : ["关于我们"], backBtn: true}}},
    opinion: {'activity': 'opinion', 'layout' : 'opinion.html', toolbar : {header : {title : ["意见&建议"], backBtn: true}}},
    evaluateList: {'activity': 'evaluateList', 'layout' : 'evaluateList.html', toolbar : {header : {title : [""], backBtn: true}}},
    evaluate: {'activity': 'evaluate', 'layout' : 'evaluate.html', toolbar : {header : {title : [""], backBtn: true}}},
    createOrder: {'activity': 'createOrder', 'layout' : 'createOrder.html', toolbar : {header : {title : ["确认预约"], backBtn: true}, footer: {show: false}}},
    storeDetail: {'activity': 'storeDetail', 'layout' : 'storeDetail.html', toolbar : {header : {title : ["门店详情"], backBtn: true}}},
    editProfile: {'activity': 'editProfile', 'layout' : 'editProfile.html', toolbar : {header : {title : ["个人资料"], backBtn: true}}},
    storeProductList: {'activity': 'storeProductList', 'layout' : 'storeProductList.html', toolbar : {header : {title : [""], backBtn: true}}},
    shoppingCart: {'activity': 'shoppingCart', 'layout' : 'shoppingCart.html', toolbar : {header : {title : ["我的购物车"]}, footer: {show: true, activityId: "shoppingCart"}}},
    order: {'activity': 'order', 'layout' : 'order.html', toolbar : {header : {title : ["订单确认"], backBtn: true}}},
    couponList: {'activity': 'couponList', 'layout' : 'couponList.html', toolbar : {header : {title : ["我的优惠券"], backBtn: true}, footer: {show: false}}},
    address: {'activity': 'address', 'layout' : 'address.html', toolbar : {header : {title : ["添加收货地址"], backBtn: true}, footer: {show: false}}},
    addressList: {'activity': 'addressList', 'layout' : 'addressList.html', toolbar : {header : {title : ["收货地址列表"], backBtn: true}, footer: {show: false}}},
    payment: {'activity': 'payment', 'layout' : 'payment.html', toolbar : {header : {title : ["支付确认"], backBtn: true}, footer: {show: false}}},
    storeMap: {'activity': 'storeMap', 'layout' : 'storeMap.html', toolbar : {header : {title : ["门店地图"], backBtn: true}, footer: {show: false}}},
    storeMapAll: {'activity': 'storeMapAll', 'layout' : 'storeMapAll.html', toolbar : {header : {title : ["门店地图"], backBtn: true}, footer: {show: false}}},
    _eof : null
  };

  //var LAUNCHER = 'home';
  var LAUNCHER = 'videoDetail';
  var activity = {};
  
  activity.getLauncherId = function(){
  	return LAUNCHER;
  };

  activity.getActivityById = function(id){
  	return MAP[id];
  };

  return activity;
});