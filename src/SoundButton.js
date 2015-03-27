var SoundButton = cc.MenuItemToggle.extend({

    ctor : function() {

        var rect_a = cc.rect(0, 0, 35, 35);
        var rect_b = cc.rect(35, 0, 35, 35);
        var item_a = new cc.Sprite("#mute.png");
        item_a.setTextureRect(rect_a);
        var item_b = new cc.Sprite("#mute.png");
        item_b.setTextureRect(rect_b);
        if(isMute) {
            this._super( new cc.MenuItemSprite(item_b, null, null), new cc.MenuItemSprite(item_a, null, null));
        } else {
            this._super(new cc.MenuItemSprite(item_a, null, null), new cc.MenuItemSprite(item_b, null, null));
        }
        this.setCallback(this.toggleMusic, this);
    },

    toggleMusic : function() {
        sound.toggleMusic();
    }


});




