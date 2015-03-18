var GameLayer = cc.Layer.extend({
    background : null,
    winSize : null,
    selectedArray : [],  //选中气球的数组
    blastArray : [],    //保存等待爆炸的气球
    balloonSpr : [],    //气球矩阵数组，存储气球精灵
    balloonPos : [],    //气球位置矩阵数组
    ColorArray : [],  //保存滑动轨迹中选择不同的颜色
    currentColor : null,  //当前可选择的颜色
    lastOne : null,        //最近经过的气球
    balloonBatchNode : null,
    pauseButton : null,
    clockPanel : null,
    scorePanel : null,
    soundButton : null,
    controlPanel : null,
    listener : null,
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
        this.balloonBatchNode = cc.SpriteBatchNode.create(res.balloons_png, MATRIX_COL_MAX * MATRIX_ROW_MAX);
        this.addChild(this.balloonBatchNode);
        this.initWidgetUI();
        this.balloonPos = this.createArray(MATRIX_ROW_MAX, MATRIX_COL_MAX, null);
        this.balloonSpr = this.createArray(MATRIX_ROW_MAX, MATRIX_COL_MAX, null);
        this.initMatrix();
        this.initEventListener();
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
            arr[i] = [];
            for(var j = 0; j < col; j++) {
                arr[i][j] = value;
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

        this.balloonFallTime = 0.4;
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
        this.balloonSpr[row][col]._gameLayer = this;
        this.balloonSpr[row][col].rowIndex = row;
        this.balloonSpr[row][col].colIndex = col;
        this.balloonSpr[row][col].setPosition(this.balloonPos[row][col].x, this.balloonPos[row][col].y - this.winSize.height);
        if(this.isInitial) {
            this.balloonFallTime = this.balloonFallTime + 0.02;
        }
        this.balloonSpr[row][col].runAction(cc.moveTo(this.balloonFallTime, this.balloonPos[row][col]));
        this.balloonBatchNode.addChild(this.balloonSpr[row][col]);
    },

    /**
     * 初始化事件监听
     */
    initEventListener : function() {
        var _gameLayer = this;
        this.listener = cc.EventListener.create({
            event : cc.EventListener.CUSTOM,
            eventName : TOUCH_BALLOON,
            callback : function(event) {
                var target = event.getUserData();
                _gameLayer.checkColorAndPosition(target);
            }
        });
        cc.eventManager.addListener(this.listener, 1);
    },

    /*
     * 检查是否颜色与前一个相同，且为前一个四周相邻的气球
     */
    checkColorAndPosition : function(target) {
        //还要检查target是否已在selectedArray中了
        if(target.isReady) {
            //target已经在selectedArray中，则数组中target位置后面的气球被剔除出去
        }
        var xAxis = [-1, 0, 1], //x轴方向增量
            yAxis = [-1, 0, 1]; //y轴方向增量
        for(var i = 0, xlen = xAxis.length; i < xlen; i++) {
            for(var j = 0, ylen = yAxis.length; j < ylen; j++) {
                if(i == 0 && j ==0) {
                    continue;
                } else if((target.rowIndex == this.lastOne.rowIndex + j) && (target.colIndex == this.lastOne.colIndex + i) && target.color == this.currentColor){
                    return true;
                }
                return false;
            }
        }
    },

    /*
     * 添加气球进selectedArray
     */
    addBalloons : function(balloon) {
        this.selectedArray.push(balloon);
        this.lastOne = balloon;
    },

    /**
     * 创建时间和分数的数字精灵
     */
    buildNumber : function() {

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
