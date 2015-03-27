var HintLayer = cc.Layer.extend({
    winWidth : null,
    winHeight : null,
    currentIndex : 0,
    startX : 0,
    endX : 0,
    isMoving : false,
    panelsLength : 0,
    panelsBatchNode : null,
    ctor : function() {
        this._super();
        this.init();
    },

    init : function() {
        this.winWidth = cc.winSize.width;
        this.winHeight = cc.winSize.height;
        this.background = new Cloud();
        this.background.init(true);
        this.addChild(this.background);
        var soundButton = new SoundButton();
        soundButton.x = this.winWidth - 25;
        soundButton.y = this.winHeight - 30;
        this.play_button = new cc.MenuItemImage("#playBut.png");
        this.play_button.x = -this.winWidth;
        this.play_button.y = this.winHeight / 2 - 200;
        this.play_button.action = cc.moveTo(0.8, cc.p(this.winWidth / 2, this.winHeight / 2 - 200)).easing(cc.easeBackOut());
        this.play_button.runAction(this.play_button.action);
        this.play_button.setCallback(this.runGame, this);

        gameData.menu = new cc.Menu(soundButton, this.play_button);
        this.addChild(gameData.menu, 999);
        gameData.menu.x = gameData.menu.y = 0;

        this.panelsBatchNode = cc.SpriteBatchNode.create(res.textures_png, gameData.hint_panels_length);
        this.addChild(this.panelsBatchNode,900);
        this.hintPanels = [];
        this.initHintPanels();
        this.showPanel(0);
        this.scheduleUpdate();

        var self = this;
        var touchListener = cc.EventListener.create({
                event : cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches : true,
                onTouchBegan : function(touch, event) {
                   self.startX = touch.getLocationX();
                    return true;
                },
                onTouchMoved : function(touch, event) {
                    self.endX = touch.getLocationX();
                    var dst = self.endX - self.startX;
                    if(Math.abs(dst) > 30) {
                        if(dst > 0 && !self.isMoving) {
                            self.wipeRight();
                        } else if(dst < 0 && !self.isMoving){
                            self.wipeLeft();
                        }
                        self.isMoving = true;
                    }
                    return true;
                }
        });

        cc.eventManager.addListener(touchListener, this);
    },

    runGame : function() {
        sound.playTapMenuSound();
        cc.director.runScene(new GameScene());
    },

    update : function(dt) {
        var currentTime = new Date();
        this.play_button.y += (Math.sin(currentTime.getTime() * 0.008)) * 30 * dt ;
    },

    initHintPanels : function() {
        this.panelsLength = gameData.hint_panels_length;
        for(var i = 0; i < this.panelsLength; i++) {
            //var panel = cc.spriteFrameCache.getSpriteFrame("panel_0" + i + ".png");
            var panel = new cc.Sprite("#panel_0" + i + ".png");
            var index = i;
            panel.index = index;
            panel.x = this.winWidth + 400;
            panel.y = this.winHeight / 2;
            panel.visible = false;
            panel.visible = true;
            this.hintPanels.push(panel);
            this.panelsBatchNode.addChild(panel);
        }
    },

   wipeLeft : function() {
        if(this.currentIndex == this.panelsLength - 1) {
            this.hintPanels[0].x = this.winWidth + 400;
            this.hidePanel(this.currentIndex, "left");
            this.showPanel(0);
            this.currentIndex = 0;
        } else {
            this.hintPanels[this.currentIndex + 1].x = this.winWidth + 400;
            this.hidePanel(this.currentIndex, "left");
            this.showPanel(this.currentIndex + 1);
            this.currentIndex += 1;
        }
    },

   wipeRight : function() {
        if(this.currentIndex == 0) {
            this.hintPanels[this.panelsLength - 1].x = -400;
            this.hidePanel(this.currentIndex, "right");
            this.showPanel(this.panelsLength - 1);
            this.currentIndex = this.panelsLength - 1;
        } else {
            this.hintPanels[this.currentIndex - 1].x = -400;
            this.hidePanel(this.currentIndex, "right");
            this.showPanel(this.currentIndex - 1);
            this.currentIndex -= 1;
        }
   },

    showPanel : function(index) {
        var self = this;
        var action = cc.sequence(cc.delayTime(0.1), cc.moveTo(0.8, cc.p(this.winWidth / 2, this.winHeight / 2)).easing(cc.easeBackOut()), cc.callFunc(function() {
            self.isMoving = false;
        }));
        this.hintPanels[index].runAction(action);
    },

    hidePanel : function(index, direction) {
        if(direction == "left") {
            var action = cc.moveTo(0.8, cc.p(-400, this.winHeight / 2)).easing(cc.easeBackOut());
        } else {
            var action = cc.moveTo(0.8, cc.p(this.winWidth + 400, this.winHeight / 2)).easing(cc.easeBackOut());
        }
        this.hintPanels[index].runAction(action);
    }
});

var HintScene = cc.Scene.extend({
   ctor : function() {
       this._super();
       var layer = new HintLayer();
       this.addChild(layer);
   }
});
