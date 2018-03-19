var res = {
    background_jpg : "res/images/background.jpg",
    music_ogg : "res/audio/music.mp3",
    sound_on : "res/audio/SoundOn.mp3",
    sound : "res/audio/SoundOff.mp3",
    sound_low : "res/audio/3_5.mp3",
    sound_middle : "res/audio/6_9.mp3",
    sound_loud : "res/audio/10.mp3",
    sound_bomb : "res/audio/bomb.mp3",
    sound_result : "res/audio/result.mp3",
    widget_plist : "res/images/widget.plist",
    widget_png : "res/images/widget.png",
    textures_plist : "res/images/textures.plist",
    textures_png : "res/images/textures.png"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}