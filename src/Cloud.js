var Cloud = cc.Sprite.extend({
    dist_x : 0, //云层水平方向移动的距离
    dist_y : 0, //云层 垂直方向移动的距离
    speed : 0,  //移动速度
    //free_move : true,    //true为自由模式，做来回运动； false为垂直运动
    winWidth : null,
    winHeight : null,
    initialSpeed : 0,

    ctor : function() {
        this.winWidth = cc.winSize.width;
        this.winHeight = cc.winSize.height;
        this._super(res.background_jpg);
        this.anchorX = 0.5;
        this.anchorY = 0;
        this.x = this.winWidth / 2;
        this.y = 0;

    },

    init : function(isFreeMove) {
        //true为自由模式，做来回运动； false为垂直运动
        if(isFreeMove) {
            this.scheduleUpdate();
        } else {
            this.initialSpeed = 20;
            this.schedule(this.initialFloat, gameData.flame_rate);
        }
    },

    update : function(dt) {
        var currentTime = new Date();
        this.dist_x = (Math.sin(currentTime.getTime() * 0.0005)) * 60 * dt ;
        this.dist_y = 66 * dt ;
        this.x += this.dist_x;
        this.y -= this.dist_y;
        if(this.y < -this.winHeight) {
            this.y = 0;
        } else if(this.x <= 0) {    //云向左运动到图片边界时
            this.x = this.winWidth;
        } else if(this.x >= this.winWidth) {    //云向右运动到图片边界时
            this.x = 0;
        }
    },

    /**
     * 初始漂浮运动
     */
    initialFloat : function(dt) {
        this.y -= this.initialSpeed * dt;
        this.initialSpeed -= 3 * dt;
        if(this.y <= -this.winHeight) {
            this.y = 0;
            this.unschedule(this.initialFloat);
            return;
        }
        if(this.initialSpeed <= 0) {
            this.initialSpeed = 0;
            return;
        }
    }
});

