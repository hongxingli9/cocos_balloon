var GameResultLayer = cc.Layer.extend({
    PlayButton : null,
    QuitButton : null,
    ResultPanel : null,

    ctor : function() {
        this._super();
        this.init();
        this.showResult();
    },

    init : function() {
        var Background = new Cloud();
        Background.init(true);
        this.addChild(Background);


        var soundButton = new SoundButton();
        soundButton.x = cc.winSize.width - 25;
        soundButton.y = cc.winSize.height - 30;
        sound.playResultSound();


        this.ResultPanel = cc.Sprite.createWithSpriteFrameName("#panel_05.png");
        this.ResultPanel.x = cc.winSize.width / 2;
        this.ResultPanel.y = -cc.winSize.height;
        this.addChild(this.ResultPanel);
        this.ResultPanel.action = cc.moveTo(0.8, cc.p(cc.winSize.width / 2, cc.winSize.height / 2)).easing(cc.easeBackOut());
        this.ResultPanel.runAction(this.ResultPanel.action);

        this.PlayButton = new cc.MenuItemImage("#playBut.png");
        this.PlayButton.x = cc.winSize.width * 2;
        this.PlayButton.y = cc.winSize.height / 2 - 80;
        this.PlayButton.action = cc.moveTo(0.8, cc.p(cc.winSize.width / 2 + 70, cc.winSize.height / 2 - 200)).easing(cc.easeBackOut());
        this.PlayButton.runAction(this.PlayButton.action);
        this.PlayButton.setCallback(this.showHintScene, this);

        this.QuitButton = new cc.MenuItemImage("#quitBut.png");
        this.QuitButton.x = -cc.winSize.width;
        this.QuitButton.y = cc.winSize.height / 2 - 80;
        this.QuitButton.action = cc.moveTo(0.8, cc.p(cc.winSize.width / 2 - 70, cc.winSize.height / 2 - 200)).easing(cc.easeBackOut());
        this.QuitButton.runAction(this.QuitButton.action);
        this.QuitButton.setCallback(this.showWelcomeScene, this);

        gameData.menu = new cc.Menu(soundButton, this.PlayButton, this.QuitButton);
        this.addChild(gameData.menu);
        gameData.menu.x = gameData.menu.y = 0;

        this.scheduleUpdate();
    },

    showResult : function() {
        var score = new cc.LabelTTF(gameResult.score, 'Arial', 36, cc.size(240, 40), cc.TEXT_ALIGNMENT_CENTER);
        score.x = cc.winSize.width / 2;
        score.y = cc.winSize.height / 2 + 60;
        this.ResultPanel.addChild(score);

        var chain = new cc.LabelTTF(gameResult.longestChain, 'Arial', 30, cc.size(100, 40), cc.TEXT_ALIGNMENT_CENTER);
        chain.x = cc.winSize.width / 2 + 70;
        chain.y = cc.winSize.height / 2;
        this.ResultPanel.addChild(chain);

        var amount = new cc.LabelTTF(gameResult.amount, 'Arial', 30, cc.size(100, 40), cc.TEXT_ALIGNMENT_CENTER);
        amount.x = cc.winSize.width / 2 + 70;
        amount.y = cc.winSize.height / 2 - 30;
        this.ResultPanel.addChild(amount);

        var highestScore = new cc.LabelTTF(gameResult.highestScore, 'Arial', 30, cc.size(240, 40), cc.TEXT_ALIGNMENT_CENTER);
        highestScore.x = cc.winSize.width / 2 + 20;
        highestScore.y = cc.winSize.height / 2 - 83;
        this.ResultPanel.addChild(highestScore);
    },

    reset : function() {
        ExplosionArray = [];    //加上这条语句，不然重新开始游戏的时候第一次爆破不出现爆炸动画
        gameResult = {
            score : "0",
            amount : "0",
            longestChain : "0",
            highestScore : "0"
        };
    },

    update : function(dt) {
        var currentTime = new Date();
        this.PlayButton.y += (Math.sin(currentTime.getTime() * 0.008)) * 30 * dt ;
        this.QuitButton.y += (Math.cos(currentTime.getTime() * 0.008)) * 30 * dt ;
    },

    showHintScene : function() {
        this.reset();
        var gameLayer = new GameLayer();
        var scene = new cc.Scene();
        scene.addChild(gameLayer);
        sound.playTapMenuSound();
        cc.director.runScene(scene);

    },

    showWelcomeScene : function() {
        this.reset();
        sound.playTapMenuSound();
        cc.director.runScene(new WelcomeScene());
    }
})

var GameResultScene = cc.Scene.extend({
    onEnter : function() {
        this._super();
        var layer = new  GameResultLayer();
        this.addChild(layer);
    }
});
