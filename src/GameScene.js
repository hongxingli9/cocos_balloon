var GameLayer = cc.Layer.extend({
    background : null,
    winSize : null,
    selectedArray : [],  //选中气球的数组
    blastArray : [],    //保存等待爆炸的气球
    balloonSpr : [],    //气球矩阵数组，存储气球精灵
    balloonPos : [],    //气球位置矩阵数组
    ColorArray : [],  //保存滑动轨迹中选择不同的颜色
    bombMark : [],    //保存bomb的坐标和bomb的类型
    currentColor : null,  //当前可选择的颜色
    lastOne : null,        //最近经过的气球
    balloonBatchNode : null,
    isFirstTap : true,       //是否第一次触摸
    pauseButton : null,
    clockPanel : null,
    scorePanel : null,
    soundButton : null,
    controlPanel : null,
    listener : null,
    isInitial : true,
    balloonFallTime : 0.3,
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
        var type = balloonTypes.normal;
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
            event : cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches : true,
            onTouchBegan: function(touch, event) {
                var target = event.getCurrentTarget();
                var balloon = null;
                var coordinate = _gameLayer.getBalloonCoordinate(target, touch);
                coordinate && (balloon = _gameLayer.balloonSpr[coordinate.x][coordinate.y]);
                if(balloon && balloon.type == balloonTypes.normal && !balloon.isReady) {
                    _gameLayer.addBalloons(balloon);
                    balloon.showInflatedAnimation();
                    balloon.index = 0;
                     return true;
                } else {
                     return false;
                }
            },

            onTouchMoved : function(touch, event) {
                var isMoving = false;
                var target = event.getCurrentTarget();
                var balloon = null;
                var coordinate = _gameLayer.getBalloonCoordinate(target, touch);
                coordinate && (balloon = _gameLayer.balloonSpr[coordinate.x][coordinate.y]);
                balloon && (isMoving = true);
                if(isMoving && _gameLayer.isCoincided(balloon)) {
                     _gameLayer.addBalloons(balloon);
                     balloon.showInflatedAnimation();
                     balloon.index = _gameLayer.selectedArray.length - 1; //这步忽略了已addBalloons，length已经+1，所以这里要-1；
                     return true;
                }
                return false;
            },

            onTouchEnded : function() {
                if(_gameLayer.selectedArray.length < 3) {
                    _gameLayer.abandonAndRecover();
                } else {
                    //做爆炸处理

                }
            }
        });
        cc.eventManager.addListener(this.listener, this.balloonBatchNode);
    },

    /*
     * 检查气球跟触摸点是否在有效范围
     * 如果在范围内返回触摸选择到的气球在矩阵中的坐标
     */
    getBalloonCoordinate : function(target, touch) {
        var locationInNode = target.convertToNodeSpace(touch.getLocation());
        for(var i = 0; i < MATRIX_ROW_MAX; i++) {
            for(var j = 0; j < MATRIX_COL_MAX; j++) {
                if(i == target.rowIndex && j == target.colIndex && this.balloonSpr[i][j].isReady) {
                    continue;
                } else {
                    var x_Dist = this.balloonSpr[i][j].x - locationInNode.x;
                    var y_Dist = this.balloonSpr[i][j].y - locationInNode.y;
                    var sq_Dist = x_Dist * x_Dist + y_Dist * y_Dist;
                    if(sq_Dist < effectiveRange) {
                        return {
                            x : i,
                            y : j
                        };
                    } else if(i == MATRIX_ROW_MAX - 1 && j == MATRIX_COL_MAX) {
                        return false;
                    }
                }
            }
        }
    },

    /*
     * 检查是否颜色与前一个相同，且为前一个四周相邻的气球
     */
    isCoincided : function(target) {
        //还要检查target是否已在selectedArray中了
        //cc.log(target && target.index);
        if(target.isReady && target.index == this.lastOne.index) {
            //touchMove的时候坐标点还在命中的范围内时target还是当前的气球
            return false;
        } else if(target.isReady && target.index < this.lastOne.index) {
            //target已经在selectedArray中，则数组中target位置后面的气球被剔除出去
            var del_index = target.index + 1,  //开始删除的索引
                len = this.selectedArray.length;
            for(var i = del_index; i < len; i++) {
                this.selectedArray[i].showFaceAnimation();
                this.selectedArray[i].isReady = false;
                this.selectedArray[i].index = -1;
            }
            this.selectedArray.splice(del_index, len - del_index);
            this.lastOne = target;
            return false;
        }

        //相邻且颜色符合选中的要求
        if( this.isAdjacent(target, this.lastOne)  && this.isPeaceColor(target, this.currentColor)) {
            return true;
        }

        return false;
    },

    /*
     * 判断目标气球是否在当前气球的相邻四周位置
     */
    isAdjacent : function(target, lastOne) {
        //对角线方向上
        if(1 == Math.abs(target.rowIndex - this.lastOne.rowIndex) && 1 == Math.abs(target.colIndex - this.lastOne.colIndex )) {
            return true;
        } else if((0 == Math.abs(target.rowIndex - this.lastOne.rowIndex) && 1 == Math.abs(target.colIndex - this.lastOne.colIndex )) || (1 == Math.abs(target.rowIndex - this.lastOne.rowIndex) && 0 == Math.abs(target.colIndex - this.lastOne.colIndex ))) {
            //水平方向上
            return true;
        }
        return false;
    },

    /*
     * 目标气球颜色是否符合
     */
    isPeaceColor : function(target, currentColor) {
        if(target.type != 0) {
            return true;
        }
        return (target.b_color == currentColor || currentColor == "rainbow");
    },

    /*
     * 添加气球进selectedArray
     */
    addBalloons : function(balloon) {
        balloon.isReady = true;
        this.selectedArray.push(balloon);
        this.lastOne = balloon;
        //普通类型
        if(balloon.type == balloonTypes.normal) {
            this.currentColor = balloon.b_color;
        } else if(balloon.type == balloonTypes.rainbowBomb) { //彩虹类型
            this.currentColor = "rainbow";
        } else { //其他类型，不重设currentColor
            return;
        }

    },

    /*
     * 个数不足3个，恢复选中气球的状态
     */
    abandonAndRecover : function() {
        for(var i = 0,len = this.selectedArray.length, balloons = this.selectedArray; i < len; i++) {
            balloons[i].isReady = false;
            balloons[i].index = -1;
            balloons[i].showFaceAnimation();
        }
        this.currentColor = null;
        this.lastOne = null;
        this.selectedArray = [];
    },

    /*
     * 爆炸处理
     */
    explodeBalloons : function() {
        //会爆炸及会被波及的气球添加进blastArray数组中
        for(var i = 0, len = this.selectedArray.length; i < len; i++) {
            var balloon = this.selectedArray[i];
            if( balloon.type == balloonTypes.ambientBomb || balloon.type == balloonTypes.horizonBomb || balloon.type == balloonTypes.verticalBomb) {
                this.bombMark.push(balloon);
            }
            this.blastArray.push(balloon);
        }
        if(0 < this.bombMark.length) {
            for(var i = 0; i < this.bombMark.length; i++) {
                var bomb = this.bombMark[i];
                //十字型炸弹
                if(this.bombMark[i].type == balloonTypes.ambientBomb) {
                    for(var j = 0; j < MATRIX_COL_MAX; j++) {
                        var balloon = this.balloonSpr[bomb.rowIndex][j];
                        !balloon.isReady && (this.blastArray.push(balloon), balloon.isReady = true);
                    }
                    for(var j = 0; j < MATRIX_ROW_MAX; j++) {
                        var balloon = this.balloonSpr[j][bomb.colIndex];
                        !balloon.isReady && (this.blastArray.push(balloon), balloon.isReady = true);
                    }
                } else if(this.bombMark[i].type == balloonTypes.horizonBomb) {  //水平方向型炸弹
                    for(var j = 0; j < MATRIX_COL_MAX; j++) {
                        var balloon = this.balloonSpr[bomb.rowIndex][j];
                        !balloon.isReady && (this.blastArray.push(balloon), balloon.isReady = true);
                    }
                } else if(this.bombMark[i].type == balloonTypes.verticalBomb) {  //垂直方向型炸弹
                    for(var j = 0; j < MATRIX_ROW_MAX; j++) {
                        var balloon = this.balloonSpr[j][bomb.colIndex];
                        !balloon.isReady && (this.blastArray.push(balloon), balloon.isReady = true);
                    }
                }
            }
        }
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
