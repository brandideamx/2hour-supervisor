/**
 * Video Player
 */

var Theater = (function() {
    this.poll = this.pollForContent();
    this.data; // xml
});

Theater.prototype = {
    pollForContent: function() {
        return setInterval(this.pollCheck, 500);
    },

    pollCheck: function() {
        if (typeof _shell !== 'undefined' && _shell !== undefined) {
            clearInterval(_Theater.poll);
            if (typeof _loadedData !== 'undefined' && _loadedData !== undefined) {
                // console.log('| _loadedData is set');
                _Theater.config(_loadedData);
            } else {
                // console.log('| Trying again...');sdfsfdsa
                _shell.tryGetData(function(data) {
                    _Theater.config(data);
                });
            }
        }
    },

    config: function(data) {
        _shell.hideLoader();
        this.data = $(data);
        this.playVideo(this.data.find('video').text(), this.enableNext);

        $('.next')
            .addClass('disabled')
            .html(this.data.find('buttons next').text())
            .click(function() {
                if (!$(this).hasClass('disabled')) {
                    _shell.activityComplete();
                    _shell.nextSection();
                }
            });
        $('.transcript')
        .html(this.data.find('buttons transcript').text())
        .click(function(){
            _shell.popup(_Theater.data.find("caption").text(),"close")
        });
    },

    playVideo: function(url, callback) {
        this.video = new VideoPlayer(url, 800, 400, '');
        this.video.attach('.videoContainer');
        this.video.onEnd = callback;
    },

    enableNext: function() {
        $('.next').removeClass('disabled');
    }
};

_Theater = new Theater();
