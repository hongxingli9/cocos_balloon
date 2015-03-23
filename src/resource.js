var res = {
    background_jpg : "res/images/background.jpg",
    music_ogg : "res/audio/music.ogg",
    sound_on_ogg : "res/audio/SoundOn.ogg",
    sound_off_ogg : "res/audio/SoundOff.ogg",
    panels_plist : "res/images/panels.plist",
    panels_png : "res/images/panels.png",
    balloons_png : "res/images/balloons.png",
    balloons_plist : "res/images/balloons.plist",
    widget_plist : "res/images/widget.plist",
    widget_png : "res/images/widget.png",
    texture_plist : "res/images/texture.plist",
    texture_png : "res/images/texture.png"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}