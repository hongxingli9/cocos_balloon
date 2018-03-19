var gameData = {
    menu : null, //游戏菜单
    balloon_frame_length : 20,   //气球帧长度
    inflated_frame_length : 4,  //膨胀气球帧长度
    blast_frame_length : 11,    //爆炸帧长度
    floatBalloons : [    //菜单界面漂浮的气球
        {   "type" : 0,
            "color" : "red",
            "inGame" : false
        },
        {   "type" : 0,
            "color" : "green",
            "inGame" : false
        },
        {   "type" : 0,
            "color" : "orange",
            "inGame" : false
        },
        {   "type" : 0,
            "color" : "yellow",
            "inGame" : false
        },
        {   "type" : 0,
            "color" : "purple",
            "inGame" : false
        },
        {   "type" : 0,
            "color" : "blue",
            "inGame" : false
        }
    ],
    hint_panels_length : 5,  //提示板张数
    flame_rate : 0.016
}
var MATRIX_ROW_MAX = 7; //行数
var MATRIX_COL_MAX = 6; //列数
var bNomalTypeMax = 6; //普通气球类型总数
var bBombAmbientProb = 1; //大炸弹几率
var bBombHorizonProb = 2; //水平方向炸弹几率
var bBombVerticalProb = 2; //垂直方向炸弹几率
var bBombTimeProb = 2; //加时炸弹几率
var bBombRainbowProb = 2; //彩虹炸弹几率
var bBombScoreProb = 2; //双倍加分炸弹几率
var balloonWidth = 64; //气球精灵的宽度为64px
var balloonHeight = 86; //气球精灵的高度为86px
var offsetTop = 66;
var balloonTypes = {
    "normal" : 0,
    "ambientBomb" : 1,
    "horizonBomb" : 2,
    "verticalBomb" : 3,
    "timeBomb" : 4,
    "rainbowBomb" : 5,
    "scoreBomb" : 6
};
var balloonColorArray = ["red","green","blue","orange","yellow","purple"];
var effectiveRange = 625; //触摸点与气球坐标有效范围
var ExplosionArray = [];
var scoreBase = 130;  //加分基数
var gameResult = {
    score : "0",
    amount : "0",
    longestChain : "0",
    highestScore : "0"
};

var isMute = false;
var sound = {
    toggleMusic : function() {
        if(!isMute) {
            cc.audioEngine.pauseMusic();
            cc.audioEngine.playEffect(res.sound_on);
            isMute = true;
        } else {
            cc.audioEngine.resumeMusic();
            cc.audioEngine.playEffect(res.sound);
            isMute = false;
        }
    },

    resumeMusic : function() {
        if(isMute) {
            return;
        }
        cc.audioEngine.resumeMusic();
    },

    pauseMusic : function() {
        if(isMute) {
            return;
        }
        cc.audioEngine.pauseMusic();
    },

    playTapSound : function() {
        !isMute && cc.audioEngine.playEffect(res.sound) ;
    },

    playTapMenuSound : function() {
        !isMute && cc.audioEngine.playEffect(res.sound_on);
    },

    playExplosionSound : function(blast_len) {
        if(isMute) {
            return;
        }
        if(3 <= blast_len && 5 >= blast_len) {
            cc.audioEngine.playEffect(res.sound_low);
        } else if(6 <= blast_len && 9 >= blast_len) {
            cc.audioEngine.playEffect(res.sound_middle);
        } else if(10 < blast_len) {
            cc.audioEngine.playEffect(res.sound_loud);
        }
    },

    playBombSound : function() {
        if(isMute) {
            return;
        }
        cc.audioEngine.playEffect(res.sound_bomb);
    },

    playResultSound : function() {
        if(isMute) {
            return;
        }
        cc.audioEngine.playEffect(res.sound_result);
    }
}
