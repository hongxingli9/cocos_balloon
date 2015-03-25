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
var TOUCH_BALLOON = "TOUCH_BALLOON"; //自定义事件标示
var balloonClip = cc.rect(13, 30, 38, 40); //触摸精灵时所在的有效范围
var effectiveRange = 625; //触摸点与气球坐标有效范围
var ExplosionArray = [];
var scoreBase = 130;  //加分基数

