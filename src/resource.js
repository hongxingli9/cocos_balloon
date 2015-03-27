var res = {
    background_jpg : "res/images/background.jpg",
    music_ogg : "res/audio/music.ogg",
    sound_on : "res/audio/SoundOn.ogg",
    sound : "res/audio/SoundOff.ogg",
    sound_low : "res/audio/3_5.ogg",
    sound_middle : "res/audio/6_9.ogg",
    sound_loud : "res/audio/10.ogg",
    sound_bomb : "res/audio/bomb.ogg",
    sound_result : "res/audio/result.ogg",
    widget_plist : "res/images/widget.plist",
    widget_png : "res/images/widget.png",
    textures_plist : "res/images/textures.plist",
    textures_png : "res/images/textures.png"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}