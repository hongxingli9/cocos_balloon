var BalloonSprite = cc.Sprite.extend({
    b_color : null,
    type : 0,
    rowIndex : 0,
    colIndex : 0,
    idle : true,
    index : 0,  //
    isReady : false,  //是否准备爆炸状态
    animation : null,
    winWidth : null,
    winHeight : null,
    _gameLayer : null,

    ctor : function() {
        this._super();
        this.winWidth = cc.winSize.width;
        this.winHeight = cc.winSize.height;
    },

    init : function(attr) {
        if(attr.type == 0) {
            this.initWithSpriteFrameName(attr.color + "_balloon_00.png");
            this.type = attr.type;
            this.b_color = attr.color;
            this.showFaceAnimation();
        }else {
            this.initWithSpriteFrameName("bomb_" + attr.type + ".png");
        }
        this.idle = !attr.inGame;
        if(this.idle) {
            this.setRandomPosition();
            this.schedule(this.floatMove);
        }
    },

    showFaceAnimation : function() {
        this.animation = new cc.Animation();
        var i;
        var len = gameData.balloon_frame_length;
        for (i = 0; i < len; i++) {
           this.animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame(this.b_color + "_balloon_" + ("00" + i).slice(-2) + ".png"));
        }
        var interval = Math.random() * 0.03 + 0.06;
        this.animation.setDelayPerUnit(interval);
        var action = cc.animate(this.animation).repeatForever();
        this.runAction(action);
    },

    showInflatedAnimation : function() {

    },

    setRandomPosition : function() {
        this.x = Math.floor(Math.random() * this.winWidth);
        this.y = Math.floor(Math.random() * this.winHeight);
        this.dist_x = Math.floor(Math.random() * 61 + 10);
        this.dist_y = Math.floor(Math.random() * 21 + 20);
    },

    setX : function() {
        return Math.floor(Math.random() * this.winWidth);
    },

    setY : function()  {
        var range = 200 - 30 + 1;
        return -Math.floor(Math.random() * range + 30 );    //产生Y方向-200<Y<-30的随机数
    },

    floatMove : function(dt) {
        var currentTime = new Date();
        this.y += 38 * dt;
        if(this.b_color == "red" || this.b_color == "blue" || this.b_color == "green") {
            this.x += (Math.sin(currentTime.getTime() * 0.0005)) * this.dist_x * dt;
        } else {
            this.x += (Math.cos(currentTime.getTime() * 0.0005)) * this.dist_x * dt;
        }
        if(this.y > this.winHeight + 200) {
            this.x = this.setX();
            this.y = this.setY();
            this.dist_x = Math.floor(Math.random() * 61 + 10);
            this.dist_y = Math.floor(Math.random() * 21 + 20);
        }
    }


});