var _gameLayer;

var GameLayer = cc.Layer.extend({
    background : null,
    winSize : null,
    gameTime : 60,  //游戏时间
    score : 0,      //得分
    //selectedArray : [],  //选中气球的数组
   // blastArray : [],    //保存等待爆炸的气球
   // balloonSpr : [],    //气球矩阵数组，存储气球精灵
   // balloonPos : [],    //气球位置矩阵数组
   // bombMark : [],    //保存bomb的坐标和bomb的类型
    timerAmount : 0,  //加时个数
    scoreAddAmount : 0,   //加分气球个数
    longestAmount: 0,     //最长链数
    highestScore : null,  //最高分数
    totalBalloons : 0,     //爆破气球数
    currentColor : null,  //当前可选择的颜色
    lastOne : null,        //最近经过的气球
    balloonBatchNode : null,
    isFirstTap : true,       //是否第一次触摸
    canBeTaped : true,      //是否可以触摸
    pauseButton : null,
    clockPanel : null,
    scorePanel : null,
    soundButton : null,
    controlPanel : null,
    scoreLabel : null,
    timeLabel : null,
    listener : null,
    isInitial : true,
    isPause : false,
    balloonFallTime : 0.3,


    ctor : function() {
        this._super();
        _gameLayer = this;
        this.init();

    },

    init : function() {
        this.winSize = cc.winSize;
        this.background = new Cloud();
        this.background.init(false);
        this.addChild(this.background);
        this.balloonBatchNode = cc.SpriteBatchNode.create(res.textures_png, MATRIX_COL_MAX * MATRIX_ROW_MAX);
        this.explosionBatchNode = cc.SpriteBatchNode.create(res.textures_png);
        this.addChild(this.balloonBatchNode);
        this.addChild(this.explosionBatchNode);
       // Explosion.preSet();
       // Explosion.sharedExplosion();
        this.initWidgetUI();
        this.balloonPos = this.createArray(MATRIX_ROW_MAX, MATRIX_COL_MAX, null);
        this.balloonSpr = this.createArray(MATRIX_ROW_MAX, MATRIX_COL_MAX, null);
        this.initMatrix();
        this.initEventListener();
        this.schedule(this.updateTimer, 1);
        //重置一下
        this.selectedArray = [];
        this.blastArray = [];
        this.bombMark = [];
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
        this.addChild(this.clockPanel);

        this.scorePanel = new cc.MenuItemImage("#score_panel.png");
        this.scorePanel.x = 180;
        this.scorePanel.y = this.winSize.height - 35;
        this.addChild(this.scorePanel);
        this.soundButton = new SoundButton();
        this.soundButton.x = this.winSize.width - 25;
        this.soundButton.y = this.winSize.height - 30;

        this.PlayButton = new cc.MenuItemImage("#playBut.png");
        this.PlayButton.x = this.winSize.width / 2 + 70;
        this.PlayButton.y = this.winSize.height / 2 - 200;
        this.PlayButton.setCallback(this.showHintScene, this);

        this.QuitButton = new cc.MenuItemImage("#quitBut.png");
        this.QuitButton.x = this.winSize.width / 2 - 70;
        this.QuitButton.y = this.winSize.height / 2 - 200;
        this.QuitButton.setCallback(this.showWelcomeScene, this);

        this.controlPanel = new cc.Menu(this.pauseButton, this.soundButton, this.PlayButton, this.QuitButton);
        this.controlPanel.x = this.controlPanel.y = 0;
        this.addChild(this.controlPanel, 1000);

        //时间
        this.timeLabel = new cc.LabelTTF(this.gameTime, 'Arial', 32, cc.size(40, 40), cc.TEXT_ALIGNMENT_CENTER);
        this.timeLabel.x = this.clockPanel.x + 2;
        this.timeLabel.y = this.clockPanel.y - 5;
        this.addChild(this.timeLabel);

        this.scoreLabel = new cc.LabelTTF("0", 'Arial', 40, cc.size(240, 40), cc.TEXT_ALIGNMENT_CENTER);
        this.scoreLabel.x = this.scorePanel.x;
        this.scoreLabel.y = this.scorePanel.y;
        this.addChild(this.scoreLabel);

        this.pausePanel = new cc.Sprite("#panel_07.png");
        this.pausePanel.x = this.winSize.width / 2;
        this.pausePanel.y = this.winSize.height / 2;
        this.addChild(this.pausePanel, 999);

        this.PlayButton.visible = false;
        this.QuitButton.visible = false;
        this.pausePanel.visible = false;

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
        this.isInitial = false;
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
        var self = this;
        this.listener = cc.EventListener.create({
            event : cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches : true,
            onTouchBegan: function(touch, event) {
                var target = event.getCurrentTarget();
                var balloon = null;
                var coordinate = self.getBalloonCoordinate(target, touch);
                coordinate && (balloon = self.balloonSpr[coordinate.x][coordinate.y]);
                if(self.canBeTaped && balloon && balloon.type == balloonTypes.normal && !balloon.isReady) {
                    self.selectBalloons(balloon);
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
                var coordinate = self.getBalloonCoordinate(target, touch);
                coordinate && (balloon = self.balloonSpr[coordinate.x][coordinate.y]);
                balloon && (isMoving = true);
                if(isMoving && self.isCoincided(balloon)) {
                     self.selectBalloons(balloon);
                     balloon.showInflatedAnimation();
                     balloon.index = self.selectedArray.length - 1; //这步忽略了已selectBalloons，length已经+1，所以这里要-1；
                     return true;
                }
                return false;
            },

            onTouchEnded : function() {
                if(self.selectedArray.length < 3) {
                    self.abandonAndRecover();
                } else {
                    //做爆炸处理
                    self.explodeBalloons();
                    self.runAction(cc.sequence(cc.delayTime(0.6), cc.callFunc(self.clearAfrerExplosion, self)));
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
    selectBalloons : function(balloon) {
        sound.playTapSound();
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
        var _self = this;
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

        //最长链数
        if(this.longestAmount < this.selectedArray.length) {
            this.longestAmount = this.selectedArray.length;
        }
        this.totalBalloons  += this.blastArray.length;

        //blastArray里的balloon产生爆炸动画
        for(var i = 0,len = this.blastArray.length; i < len; i++) {
            if(this.blastArray[i].type == balloonTypes.scoreBomb) {
                this.scoreAddAmount++;
            } else if(this.blastArray[i].type == balloonTypes.timeBomb) {
                this.timerAmount++;
            }
            this.blastArray[i].showExplosionAnimation();
        }

        this.background.playFlyEffect();

        if(0 == this.bombMark.length) {
            sound.playExplosionSound(this.blastArray.length);
        } else {
            sound.playBombSound();
        }
        this.canBeTaped = false;

        this.updateScore();
        gameResult.score = this.score;
        gameResult.longestChain = this.longestAmount;
        gameResult.amount = this.totalBalloons;
    },

    /*
     * clear after explosion
     */
    clearAfrerExplosion : function() {
        //清除节点
        this.clearBalloons();
        //补充
        this.coverBlank();
        this.scoreAddAmount > 0 && (this.scoreAddAmount = 0);
        this.timerAmount > 0 && (this.timerAmount = 0);
    },

    /*
     * 爆炸后清除工作
     */
    clearBalloons : function() {
        for(var i = 0, len = this.blastArray.length; i < len; i++) {
            this.balloonBatchNode.removeChild(this.balloonSpr[this.blastArray[i].rowIndex][this.blastArray[i].colIndex], true);
            this.balloonSpr[this.blastArray[i].rowIndex][this.blastArray[i].colIndex] = null;
        }

        this.currentColor = null;
        this.lastOne = null;
        this.selectedArray = [];
        this.blastArray = [];
        this.bombMark = [];
    },

    /*
     * 空白处补充气球
     */
    coverBlank : function() {
        var index;
        var self = this;
        for(var i = 0; i < MATRIX_ROW_MAX; i++) {
            for(var j = 0; j < MATRIX_COL_MAX; j++) {
                if(!this.balloonSpr[i][j] && i != MATRIX_ROW_MAX) {
                    var _blank = i;
                    index = i + 1;
                    while(index < MATRIX_ROW_MAX) {
                       if(this.balloonSpr[index][j]) {
                           this.balloonSpr[index][j].runAction(cc.moveTo(this.balloonFallTime, this.balloonPos[_blank][j]));
                           this.balloonSpr[_blank][j] = this.balloonSpr[index][j];
                           this.balloonSpr[_blank][j].rowIndex = _blank;
                           this.balloonSpr[_blank][j].colIndex = j;
                           this.balloonSpr[index][j] = null;
                           _blank += 1;
                           index = _blank + 1;
                       } else {
                           index ++;
                       }
                    }
                }
            }
        }

        for(var i = 0; i < MATRIX_ROW_MAX; i++) {
            for(var j = 0; j < MATRIX_COL_MAX; j++) {
                if(!this.balloonSpr[i][j]) {
                    this.addOnePattern(i, j);
                }
            }
        }
        this.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {self.canBeTaped = true;}, this)));
    },

    /*
     * 更新时间
     */
    updateTimer : function() {
        this.gameTime -= 1;
        if(this.gameTime < 0) {
            //结束
            this.unschedule(this.updateTimer);
            //this.clearBalloons();
            //this.coverBlank();
            if(window.localStorage.highestScore) {
                window.localStorage.highestScore = window.localStorage.highestScore > this.score ? window.localStorage.highestScore : this.score;
            } else {
                window.localStorage.highestScore = this.score;
            }
            gameResult.highestScore = window.localStorage.highestScore;
            cc.director.runScene(new GameResultScene());
        } else {
            if(this.timerAmount > 0) {
                this.gameTime += this.timerAmount * 5;
            }
            this.timeLabel.string = this.gameTime;
        }
    },

    /**
     * 暂停游戏
     */
    pauseGame : function() {
        if(!this.isPause) {
            this.isPause = true;
            this.PlayButton.visible = true;
            this.QuitButton.visible = true;
            this.pausePanel.visible = true;
            cc.director.pause();
            sound.pauseMusic();
        } else {
            this.isPause = false;
            this.PlayButton.visible = false;
            this.QuitButton.visible = false;
            this.pausePanel.visible = false;
            cc.director.resume();
            sound.resumeMusic();
        }
    },

    /**
     * 更新分数
     */
    updateScore : function() {
        this.score += this.scoreAddAmount > 0 ? scoreBase * this.blastArray.length * this.scoreAddAmount : scoreBase * this.blastArray.length;
        this.scoreLabel.string = this.score;
    },

    showHintScene : function() {
        cc.director.resume();
        sound.resumeMusic();
        ExplosionArray = [];
        var hintLayer = new HintLayer();
        var scene = new cc.Scene();
        scene.addChild(hintLayer);
        sound.playTapMenuSound();
        cc.director.runScene(scene);
    },

    showWelcomeScene : function() {
        cc.director.resume();
        sound.resumeMusic();
        ExplosionArray = [];
        var welcomeLayer = new WelcomeLayer();
        var scene = new  cc.Scene();
        scene.addChild(welcomeLayer);
        sound.playTapMenuSound();
        cc.director.runScene(scene);
    },

    addExplosions : function(explosion) {
        this.explosionBatchNode.addChild(explosion);
    }
});

var GameScene = cc.Scene.extend({
       ctor : function() {
           this._super();
           var layer = new GameLayer();
           this.addChild(layer);
       }
});

