var GameLayer = cc.Layer.extend({
    background : null,
    winSize : null,
    slectedArray : [],  //选中气球的数组
    balloonSpr : [],    //气球矩阵数组，存储气球精灵
    balloonPos : [],    //气球位置矩阵数组
    spriteBatchNode : null,
    pauseButton : null,
    clockPanel : null,
    scorePanel : null,
    soundButton : null,
    controlPanel : null,
    isInitial : true,
    balloonFallTime : 0.4,
    score : 0,
    time : 60,

    ctor : function() {
        this._super();
        this.init();
    },

    init : function() {
        this.winSize = cc.winSize;
        this.background = new Cloud();
        this.background.init(false);
        this.addChild(this.background);
        this.initWidgetUI();
    },

    /**
     * 初始化按钮及panel控件
     */
    initWidgetUI : function() {
        this.pauseButton = new cc.MenuItemImage("#pause_button.png");
        this.pauseButton.x = this.winSize.width - 65;
        this.pauseButton.y = this.winSize.height - 35;

        this.pauseButton.setCallback(this.pauseGame, this);

        this.clockPanel = new cc.MenuItemImage("#clock.png");
        this.clockPanel.x = 30;
        this.clockPanel.y = this.winSize.height - 35;
        this.addChild(this.clockPanel, 999);

        this.scorePanel = new cc.MenuItemImage("#score_panel.png");
        this.scorePanel.x = 180;
        this.scorePanel.y = this.winSize.height - 35;
        this.addChild(this.scorePanel, 999);

        this.soundButton = new SoundButton();
        this.soundButton.x = this.winSize.width - 25;
        this.soundButton.y = this.winSize.height - 30;

        this.controlPanel = new cc.Menu(this.pauseButton, this.soundButton);
        this.controlPanel.x = this.controlPanel.y = 0;
        this.addChild(this.controlPanel);
    },

    /**
    * 创建矩阵数组
    */
    createArray : function(row, col, value) {
        var arr = [];
        for(var i = 0; i < row; i++) {
            row[i] = [];
            for(var j = 0; j < col; j++) {
                row[i][j] = value;
            }
        }
        return arr;
    },

    /**
     * 初始化气球矩阵数组
     */
    initMatrix : function() {
        var baseX = balloonWidth / 2;
        var baseY = this.winSize.height - offsetTop - balloonHeight / 2;
        var row, col;

        for(row = 0; row < MATRIX_ROW_MAX; row++) {
            for(col = 0; col < MATRIX_COL_MAX; col++) {
                this.balloonPos[row][col] = cc.p(baseX + col * balloonWidth, baseY - row * offsetTop);
            }
        }

        //添加水果矩阵
        for(row = 0; row < MATRIX_ROW_MAX; row++) {
            for(col = 0; col < MATRIX_COL_MAX; col++) {
                this.addOnePattern(row, col);
            }
        }
    },

    /**
     * 添加一个气球精灵节点
     */
    addOnePattern : function(row, col) {
        var temp = 0 | (Math.random() * 100);
        var prob = temp % 100;
        var type = balloonTypes.Normal;
        if(bBombAmbientProb !=0 && prob < bBombAmbientProb) {
            type = balloonTypes.ambientBomb;
        } else if(bBombHorizonProb != 0 && prob < bBombAmbientProb + bBombHorizonProb) {
            type = balloonTypes.horizonBomb;
        } else if(bBombVerticalProb != 0 && prob < bBombAmbientProb + bBombHorizonProb + bBombVerticalProb) {
            type = balloonTypes.verticalBomb;
        } else if(bBombTimeProb != 0 && prob < bBombAmbientProb + bBombHorizonProb + bBombVerticalProb + bBombTimeProb) {
            type = balloonTypes.timeBomb;
        } else if(bBombRainbowProb !=0 && prob < bBombAmbientProb + bBombHorizonProb + bBombVerticalProb + bBombTimeProb + bBombRainbowProb) {
            type = balloonTypes.rainbowBomb;
        } else if(bBombScoreProb != 0 && prob < bBombAmbientProb + bBombHorizonProb + bBombVerticalProb + bBombTimeProb + bBombRainbowProb + bBombScoreProb) {
            type = balloonTypes.scoreBomb;
        }
        var color, attr;
        if(type == 0) {
            color = balloonColorArray[temp % bNomalTypeMax];
        }
        attr = {
            "type" : type,
            "color" : color,
            "inGame" : true
        };
        this.balloonSpr[row][col] = new BalloonSprite();
        this.balloonSpr[row][col].init(attr);
        this.balloonSpr[row][col].rowIndex = row;
        this.balloonSpr[row][col].colIndex = col;
        this.balloonSpr[row][col].setPosition(this.balloonPos[row][col].x, this.balloonPos[row][col].y - this.winSize.height);
        if(this.isInitial) {
            this.balloonFallTime = this.balloonFallTime + 0.01;
        } else {
            this.balloonFallTime = 0.4;
        }
        this.balloonSpr[row][col].moveTo(this.balloonFallTime, this.balloonPos[row][col]);
    },

    /**
     * 创建时间和分数的数字精灵
     */
    buildNumber : function() {

    },

    /**
     * 初始化事件监听
     */
    initEventListener : function() {

    },

    /**
     * 清除掉爆炸后的气球
     */
    clearSomePatterns : function() {

    },

    /**
     * 清除后的处理操作
     */
    onClearFinish : function() {

    },

    /**
     * 暂停游戏
     */
    pauseGame : function() {

    },

    /**
     * 更新时间
     */
    updateTime : function() {

    },

    /**
     * 更新分数
     */
    updateScore : function() {

    }
});

var GameScene = cc.Scene.extend({
       onEnter : function() {
           this._super();
           var layer = new GameLayer();
           this.addChild(layer);
       }

});
