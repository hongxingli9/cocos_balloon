var BalloonSprite = cc.Sprite.extend({
    b_color : null,
    type : 0,
    rowIndex : 0,
    colIndex : 0,
    idle : true,
    index : -1,  // gameLayer中选中精灵数组的索引
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
        this.type = attr.type;
        if(this.type == balloonTypes.normal) {
            this.initWithSpriteFrameName(attr.color + "_balloon_00.png");
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
        this.stopAllActions();
        if(this.type != balloonTypes.normal) {
            this.initWithSpriteFrameName("bomb_" + this.type + ".png");
            return;
        }
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
        this.stopAllActions();
        var animation = new cc.Animation(),
            i,
            len = gameData.inflated_frame_length;
        if(this.type == 0) {
            for(i = 0; i < len; i++) {
                animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame(this.b_color + "_balloon_inflated_" + ("00" + i).slice(-2) + ".png"));
            }
        } else {
            for(i = 0; i < len; i++) {
                animation.addSpriteFrame(cc.spriteFrameCache.getSpriteFrame("bomb_" + this.type + "_" + ("00" + i).slice(-2) + ".png"));
            }
        }
        var interval = 0.06;
        animation.setDelayPerUnit(interval);
        var action = cc.animate(animation).repeatForever();
        this.runAction(action);
    },

    /*
     * 气球爆炸效果
     */
    showExplosionAnimation : function() {
        this.stopAllActions();
        var explosion = Explosion.getOrCreateExplosion();
        explosion.x = this.x;
        explosion.y = this.y;
        this.visible = false;

    },

    /*
     * 竖直方向下面一格位置的元素
     */
    belowBalloon : function() {
        var row_below = this.rowIndex + 1;
        return _gameLayer.balloonSpr[row_below][this.colIndex];
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
