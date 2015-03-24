var Explosion = cc.Sprite.extend({
    active : true,
    animation: null,

    ctor : function() {
        var pFrame = cc.spriteFrameCache.getSpriteFrame("blast_00.png");
        this._super(pFrame);
        //this.animation = cc.animationCache.getAnimation("Explosion");
    },

    play : function() {
        var str = "";
        var animation = new cc.Animation();
        for(var i = 0, len = gameData.blast_frame_length; i < len ; i++) {
            str = "blast_" + ("00" + i).slice(-2) + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            animation.addSpriteFrame(frame);
        }
        //var animation = new cc.Animation(animFrames, 0.08);
        animation.setDelayPerUnit(0.07);
        this.runAction(cc.sequence(
            cc.animate(animation),
            cc.callFunc(this.destory, this)
        ));
    },

    destory : function() {
        this.visible = false;
        this.active = false;
    }
});
Explosion.sharedExplosion = function() {
    var animFrames = [];
    var str = "";
    var animation = new cc.Animation();
    for(var i = 0, len = gameData.blast_frame_length; i < len ; i++) {
        str = "blast_" + ("00" + i).slice(-2) + ".png";
        var frame = cc.spriteFrameCache.getSpriteFrame(str);
        animation.addSpriteFrame(frame);
    }
    //var animation = new cc.Animation(animFrames, 0.08);
    animation.setDelayPerUnit(0,08);
    cc.animationCache.addAnimation(animation, "Explosion");
};

Explosion.getOrCreateExplosion = function() {
    var selChild = null;
    for(var i = 0, len = ExplosionArray.length; i < len; i++) {
        selChild = ExplosionArray[i];
        if(selChild.active == false) {
            selChild.active = true;
            selChild.visible = true;
            selChild.play();
            return selChild;
        }
    }
    selChild = Explosion.create();
    selChild.play();
    return selChild;
};

Explosion.create = function() {
    var explosion = new Explosion();
    _gameLayer.addExplosions(explosion);
    ExplosionArray.push(explosion);
    return explosion;
};

Explosion.preSet = function() {
    var explosion = null;
    for(var i = 0; i < 6; i++) {
        explosion = Explosion.create();
        explosion.visible = false;
        explosion.active = false;
    }
};
