var Pagination = function(ele, options){
    var _default = {
        template: {
            prev: '<li ref="prev"><a href="javascript: void(0)">&laquo</a></li>',
            next: '<li ref="next"><a href="javascript: void(0)">&raquo</a></li>',
            page: function(num, hideFlag){
                if(hideFlag){
                    return '<li ref="'+num+'" class="hide"><a href="javascript: void(0)">'+num+'</a></li>'
                }
                return '<li ref="'+num+'"><a href="javascript: void(0)">'+num+'</a></li>';
            },
            dot: function(hideFlag){
                if(hideFlag){
                    return '<li ref="dot" class="hide"><a href="javascript: void(0)">. . .</a></li>';
                }
                return '<li ref="dot"><a href="javascript: void(0)">. . .</a></li>';
            },
            showAllPage: function(num){
                var optList = '';
                for(var i = 1; i <= num; i++){
                    optList += '<option>'+i+'</option>';
                }
                return '<div class="pull-left" style="margin-top: 25px;"><span style="margin: 0 15px;">跳转到第<select>'+optList+'</select>页</span>共'+num+'页</div>';
            }
        },
        perPageNum: 10,//每页的数量
        maxShow: 7,//小于等于7页时，所有页码显示
    };
    this.opts = $.extend({}, _default, options);
    //常量
    this.TBODY = 'tbody';
    this.PAGERID = '#pager';
    this.DISABLED = 'disabled';
    this.ACTIVE = 'active';
    this.HIDE = 'hide';
    //元素
    this.$ele = $(ele);
    this.$tbody = this.$ele.find(this.TBODY);
    this.$outter = this.$ele.next();
    this.$pager = $('body').find(this.PAGERID);
    this.$pageList = null;
    this.$prevBtn = null;
    this.$nextBtn = null;
    //变量
    this.listLen = 0;//总数量
    this.pageLen = 0;//总页数
    this.ellipse = false;//页码是否超过7个
    //pager的字符串模板
    this.template = this.opts.template;
    //关于页码显示的细节
    this.perPageNum = this.opts.perPageNum;
    this.maxShow = this.opts.maxShow;
    this.curPage = 0;
    //直接传递数据列表或者传递url
    this.list = options.data || null;
    this.url = options.url || null;
    //缓存拿到的数据列表
    this.cacheList = [];
};
Pagination.prototype = {
    constructor: Pagination,
    init: function(){
        //直接传递过来数据
        if(this.list){
            this.listLen = this.list.length;
            this.pageLen = Math.ceil(this.listLen / this.perPageNum);
            if(this.listLen){
                this.renderPager();
                this.renderFirstPageTable();
                this.curPage = 1;
            }
        }
    },
    renderFirstPageTable: function(){
        var listLen = Math.min(this.listLen, this.perPageNum);
        var listHtml = '';
        for(var i = 1; i <= listLen; i++){
            var item = this.list[i - 1];
            listHtml += '<tr><td>'+i+'</td><td>'+item.id+'</td><td>'+item.name+'</td><td>'+item.status+'</td></tr>';
        }
        this.cacheList.push(listHtml);
        this.$tbody.append(listHtml);
        this.cache();
    },
    cache: function(){
        //缓存本次拿到的所有数据
        for(var i = 1; i < this.pageLen; i++){
            var beginNum = this.perPageNum * i,
                stopNum = Math.min(this.perPageNum * (i + 1), this.listLen);
            var groupStr = '';
            for(; beginNum < stopNum; beginNum++){
                var item = this.list[beginNum];
                groupStr += '<tr><td>'+(beginNum + 1)+'</td><td>'+item.id+'</td><td>'+item.name+'</td><td>'+item.status+'</td></tr>';
            }
            this.cacheList.push(groupStr);
        }
        //console.log(this.cacheList);
    },
    renderPager: function(){
        var pagerHtml = '';
        pagerHtml += this.template.prev;
        pagerHtml += this.template.dot(true);
        if(this.pageLen <= this.maxShow){
            for(var i = 1; i <= this.pageLen; i++){
                pagerHtml += this.template.page(i);
            }
        }else{
            this.ellipse = true;
            for(var i = 1; i <= this.pageLen; i++){
                var flag = i <= this.maxShow ? false : true;
                pagerHtml += this.template.page(i, flag);
            }
            pagerHtml += this.template.dot();
        }
        //pagerHtml += this.template.dot;
        pagerHtml += this.template.next;
        this.$pager.append(pagerHtml);
        this.$outter.append(this.template.showAllPage(this.pageLen));
        this.pagerInit();//初始化pager的样式
    },
    pagerInit: function(){
        this.$pageList = this.$pager.children();
        this.$prevBtn = this.$pageList.eq(0);
        this.$nextBtn = this.$pageList.eq(this.$pageList.length - 1);
        this.$headDot = this.$pageList.eq(1);
        this.$tailDot = this.$pageList.eq(this.$pageList.length - 2);
        this.$prevBtn.addClass(this.DISABLED);
        this.$pageList.eq(2).addClass(this.ACTIVE);
        this.pagerBindEvents();
    },
    pagerBindEvents: function(){
        this.$pager.on('click', $.proxy(this.pagerClick, this));
    },
    pagerClick: function(e){
        e = e || window.event;
        var $this = $(e.target || e.srcElement);
        $this = this.fromAToLiTag($this);
        var pageStr = $this.attr('ref');
        var pageNum = parseInt(pageStr);
        var clickable = !($this.hasClass(this.DISABLED) || $this.hasClass(this.ACTIVE) || pageStr === 'dot');
        if(clickable){
            if(pageNum > this.curPage){
                //向右翻页
                var $next = $this.next();
                if($next.hasClass(this.HIDE) && $next.attr('ref') !== 'dot'){
                    $next.removeClass(this.HIDE);
                    this.$pageList.eq(pageNum - this.maxShow + 2).addClass(this.HIDE);
                    if(this.$headDot.hasClass(this.HIDE)){
                        this.$headDot.removeClass(this.HIDE);
                    }
                }
                if(Number($next.attr('ref')) === this.pageLen){
                    if(!this.$tailDot.hasClass(this.HIDE)){
                        this.$tailDot.addClass(this.HIDE);
                    }
                }
            }else{
                //向左翻页
                var $prev = $this.prev();
                if($prev.hasClass(this.HIDE) && $prev.attr('ref') !== 'dot'){
                    $prev.removeClass(this.HIDE);
                    this.$pageList.eq(pageNum + this.maxShow).addClass(this.HIDE);
                    if(this.$tailDot.hasClass(this.HIDE)){
                        this.$tailDot.removeClass(this.HIDE);
                    }
                }
                if(Number($prev.attr('ref')) === 1){
                    if(!this.$headDot.hasClass(this.HIDE)){
                        this.$headDot.addClass(this.HIDE);
                    }
                }
            }
            if(pageNum && pageNum !== this.curPage){
                //数字页码
                this.goPage(pageNum);
            }else{
                //prev next
                if(pageStr === 'prev'){
                    this.goPage(this.curPage - 1);
                }else{
                    this.goPage(this.curPage + 1);
                }
            }
        }
    },
    fromAToLiTag: function($obj){
        if(!$obj.attr('ref') && $obj[0].tagName.toLowerCase() === 'a'){
            return $obj.parent();
        }
        return $obj;
    },
    goPage: function(pageNum){
        //跳转页面
        this.$tbody.empty().append(this.cacheList[pageNum - 1]);
        this.$pageList.eq(this.curPage + 1).removeClass(this.ACTIVE);
        this.$pageList.eq(pageNum + 1).addClass(this.ACTIVE);
        if(pageNum !== 1){
            if(this.$prevBtn.hasClass(this.DISABLED)){
                this.$prevBtn.removeClass(this.DISABLED);
            }
        }else{
            this.$prevBtn.addClass(this.DISABLED);
        }
        if(pageNum !== this.pageLen){
            if(this.$nextBtn.hasClass(this.DISABLED)){
                this.$nextBtn.removeClass(this.DISABLED);
            }
        }else{
            this.$nextBtn.addClass(this.DISABLED);
        }
        this.curPage = pageNum;
    }
};