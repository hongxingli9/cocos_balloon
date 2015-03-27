
var WelcomeLayer = cc.Layer.extend({
    background : null,
    game_name : null,
    play_button : null,
    floatBalloonBatchNode : null,
    ctor:function () {
        this._super();

        var size = cc.winSize;
        this.background = new Cloud();
        this.background.init(true);
        this.addChild(this.background);
        var soundButton = new SoundButton();
        soundButton.x = size.width - 25;
        soundButton.y = size.height - 30;

        this.floatBalloonBatchNode = cc.SpriteBatchNode.create(res.textures_png, gameData.floatBalloons.length);
        this.addChild(this.floatBalloonBatchNode);

        this.game_name = cc.Sprite.createWithSpriteFrameName("#panel_06.png");
        this.game_name.x = size.width / 2;
        this.game_name.y = -size.height;
        this.addChild(this.game_name, 999);
        this.game_name.action = cc.moveTo(0.8, cc.p(size.width / 2, size.height / 2)).easing(cc.easeBackOut());
        this.game_name.runAction(this.game_name.action);

        this.play_button = new cc.MenuItemImage("#playBut.png");
        this.play_button.x = -size.width;
        this.play_button.y = size.height / 2 - 80;
        this.play_button.action = cc.moveTo(0.8, cc.p(size.width / 2, size.height / 2 - 120)).easing(cc.easeBackOut());
        this.play_button.runAction(this.play_button.action);
        this.play_button.setCallback(this.showHintScene, this);

        gameData.menu = new cc.Menu(soundButton, this.play_button);
        this.addChild(gameData.menu, 999);
        gameData.menu.x = gameData.menu.y = 0;

        for(var i = 0, len = gameData.floatBalloons.length; i < len; i++) {
            var balloon = new BalloonSprite();
            balloon.init(gameData.floatBalloons[i]);
            this.floatBalloonBatchNode.addChild(balloon);
        }

        this.scheduleUpdate();
    },

    update : function(dt) {
        var currentTime = new Date();
        this.play_button.y += (Math.sin(currentTime.getTime() * 0.008)) * 30 * dt ;
    },

    showHintScene : function() {
        sound.playTapMenuSound();
        cc.director.runScene(new HintScene());
    }
});

var WelcomeScene = cc.Scene.extend({
    ctor : function () {
        this._super();
        cc.spriteFrameCache.addSpriteFrames(res.widget_plist);
        cc.spriteFrameCache.addSpriteFrames(res.textures_plist);
        var layer = new WelcomeLayer();
        this.addChild(layer);
    }
});

