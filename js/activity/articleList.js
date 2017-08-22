define([ 'activity/activity', 'util/domUtil', 'util/format', 'util/util',
        'util/scrollUtil', 'util/storageUtil','util/dateUtil'],
function(Activity, domUtil, format, util, scrollUtil, storageUtil,dateUtil) {

  var PAGE_DATA_COUNT = 10;
  var OFFSET = 0;

  var ArticleList = function() {
    Activity.call(this);
  };

  Activity.inheritedBy(ArticleList);

  ArticleList.prototype.onCreate = function() {
  };

  ArticleList.prototype.checkNextPage = function(info) {
    this.dataPara.offset_ = info.offset + PAGE_DATA_COUNT;
    if (!info.data || info.pageInfo.limit > info.data.length) {
      this.dataPara.hasNext = false;
    } else {
    	OFFSET = OFFSET + PAGE_DATA_COUNT;
      this.dataPara.hasNext = true;
    }
  };

  ArticleList.prototype.show = function() {
    this.getData();
  };

  ArticleList.prototype.getData = function() {
    var me = this;
    me.dataPara = {};
    var dataPara = me.dataPara;

    me.clearList();
    me.getArticleList();
  };

  ArticleList.prototype.getArticleList = function() {
    var me = this;
    var data = {};
    data.offset=OFFSET;
    util.post('article/list/1001', data).then(function(result) {
      if (result.codeText == "OK") {
        me.onCreateList(result);
      }
    });
  };

  ArticleList.prototype.clearList = function() {
    this.$data['article-list-container'].dom.empty();
  };
  
  ArticleList.prototype.onCreateList = function(result) {
    var me = this;
    for ( var k in result.data) {
      var data = result.data[k];
      var $article = me.$data["article-item-template"].dom.clone();
      $article.removeAttr("name");
      $article.find("img").attr("src", format.photoImgUrl(data.picture, "300x0"));
      var $dom = domUtil.getDomByName($article);
      $dom.articleName.val(data.title);
      $dom.createTime.val(dateUtil.dateStrFormat("yyyy/MM/dd hh:mm:ss", data.updateTime));
      var content = util.delHtmlTag(data.content);
      $dom.articleContent.val(content.substring(0, 70) + ((content.length > 70) ? "..." : ""));
      me.$data['article-list-container'].dom.append($article);
      me.bindDetail($article, data);
    }
    
    me.checkNextPage(result);

    // 绑定刷新加载事件
    setTimeout(function() {
      me.bindLoadEvents_();
    }, 500);
  };

  ArticleList.prototype.bindDetail = function($article, data) {
    var me = this;
    $article.on('tap',function(){
      me.moveTo("articleDetail", {
        articleId : data.articleId
      }, {
        transition : 'slide'
      });
    });
  };

  ArticleList.prototype.bindLoadEvents_ = function() {
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
    para.pullDownAction = function() {
    	OFFSET = 0;
      me.clearList();
      me.getArticleList();
    };
    
    para.pullUpAction = function() {
      me.getArticleList();
    };
    para.hasNextCb = function() {
      return me.dataPara.hasNext;
    };
    
    me.scroller = scrollUtil.bind(para);
  };

  ArticleList.prototype.hide = function() {
    var me = this;
    OFFSET = 0;
    me.clearList();
    if (me.scroller) {
      me.scroller.unbind();
      me.scroller = null;
    }
  };

  return new ArticleList();
});