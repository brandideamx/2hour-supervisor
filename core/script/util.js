var queryParams = {};
var tmp = document.location.href.split('?');
if (tmp.length > 1) {
    var params = tmp[1].split('&');
    for (var i = 0; i < params.length; i++) {
        var tmp2 = params[i].split('=');
        queryParams[tmp2[0]] = tmp2[1];
    }
}

function makeBool(val) {
    if (val == 'true') {
        return true;
    }
    return false;
}

function leadZero(num) {
    if (num < 10)
        return '0'+num;
    else
        return num;
}

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function strnumber(n) {
    if (n == 0) {
        return 'zero';
    } else if (n == 1) {
        return 'one';
    } else if (n == 2) {
        return 'two';
    } else if (n == 3) {
        return 'three';
    } else if (n == 4) {
        return 'four';
    } else if (n == 5) {
        return 'five';
    } else if (n == 6) {
        return 'six';
    } else if (n == 7) {
        return 'seven';
    } else if (n == 8) {
        return 'eight';
    } else if (n == 9) {
        return 'nine';
    }
}

function str_replace(txt, was, is) {
    var tmp = txt.split(was);
    return tmp.join(is);
}

function isIE9() {
    //alert(navigator.userAgent);
    if (navigator.userAgent.indexOf('MSIE 9') > -1) {
        return true;
    } else {
        return false;
    }
}

function isIE11() {
    if (navigator.userAgent.toLowerCase().indexOf('trident') > -1) {
        if (ie_ver() >= 11) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function ie_ver() {
    var iev = 0;
    var ieold = (/MSIE (\d+\.\d+);/.test(navigator.userAgent));
    var trident = !!navigator.userAgent.match(/Trident\/7.0/);
    var rv = navigator.userAgent.indexOf("rv:11.0");

    if (ieold) iev = new Number(RegExp.$1);
    if (navigator.appVersion.indexOf("MSIE 10") != -1) iev = 10;
    if (trident && rv != -1) iev = 11;

    return iev;
}

function isIpad() {
    //alert(navigator.userAgent);
    //return true;
    if (navigator.userAgent.toLowerCase().indexOf('ipad') > -1) {
        return true;
    } else {
        return false;
    }
}


function isFlashCapable() {
    //return false;
    if (navigator.userAgent.indexOf('iPad') > -1 || navigator.userAgent.indexOf('Android') > -1) {
        return false;
    }
    return true;
}

function FlashDemo(src, w, h) {
    this.url = src;
    this.width = w;
    this.height = h;
    this.div;
}
FlashDemo.prototype.attach = function(id) {
    var params = {
        wmode: "transparent"
    }
    swfobject.embedSWF(this.url + ".swf", id, this.width, this.height, "9.0.0", '', {}, params);
}

function VideoPlayer(src, w, h,spectrack, poster) {
    poster = poster || '';
    this.div = $('<div class="video" style="width:' + w + 'px; height:' + h + 'px"></div>');
    this.onEnd; // function
    this.onVolume; // function
    this.vid = $('<video autoplay controls width="' + w + '" height="' + h + '" src="'+ src +'">' + spectrack + '</video>');
    this.vid.append('<source src="' + src + '">');
    this.div.append(this.vid);

    if (poster != '') this.div.attr('poster', poster);

    var _me = this;
    this.vid.bind('ended', function() {
        try {
            _me.onEnd();
        } catch (e) {
            //console.log(e);
            // no callback
        }
    });
    this.vid.bind('volumechange', function() {
        try {
            _me.onVolume(this.volume);
        } catch (e) {
            //
        }
    })
}
VideoPlayer.prototype.setParams = function(p) {
    _v = this;
    $.each(p, function(i, e) {
        _v.vid.attr(e.name, e.value);
    });
}
VideoPlayer.prototype.goToTime = function(n) {
    this.vid[0].currentTime = n;
    this.vid[0].pause();
}
VideoPlayer.prototype.attach = function(sel) {
    $(sel).append(this.div);
};
VideoPlayer.prototype.setDevice = function(n) {
    this.div.addClass(n);
}
VideoPlayer.prototype.play = function() {
    this.vid[0].play();
}
VideoPlayer.prototype.pause = function() {
    this.vid[0].pause();
}
VideoPlayer.prototype.volume = function(n) {
    if (n != undefined) {
        this.vid[0].volume = n;
    }
    return this.vid[0].volume;
}


function checkUrlParam(str) {
    var sPageUrl = window.parent.location.href;
    var sURLVariables = '';
    if (sPageUrl.indexOf('?') > -1) {
        sURLVariables = sPageUrl.split('?');
    }
    if (sURLVariables != '') {
        sURLVariables = sURLVariables[1].split('&');
    } else {
        sURLVariables = [];
    }

    if (sURLVariables.length > 0) {
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == str) {
                return true;
            }
        }
    }

    return false;
}

function getQueryVariable(variable) {
    var query = window.top.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
           var pair = vars[i].split("=");
           if(pair[0] == variable){return pair[1];}
    }
    return(false);
}