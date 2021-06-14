/**
 * Bullying Model
 */
var Bullying = (function() {
    this.xml;
    this.root;
    this.idx;
    this.poll = this.pollForContent();
});

Bullying.prototype = {
    pollForContent: function() {
        return setInterval(this.pollCheck, 500);
    },

    pollCheck: function() {
        if (typeof _shell !== 'undefined' && _shell !== undefined) {
            clearInterval(_bullying.poll);
            if (typeof _loadedData !== 'undefined' && _loadedData !== undefined) {
                // console.log('| _loadedData is set');
                _bullying.config(_loadedData);
            } else {
                // console.log('| Trying again...');
                _shell.tryGetData(function(data) {
                    _bullying.config(data);
                });
            }
        }
    },

    config: function(xml) {
        _shell.hideLoader();
        this.xml = $(xml);
        this.root = this.xml.find('contentRoot').text();

        this.introVideo();
        // this.intro();
    },

    introVideo: function() {
        var theater = new Theater(this.xml.find('introvideo'), function() {
            _bullying.intro();
        });
    },

    intro: function() {
        log('Bullying::Intro');
        window.parent.setJiraLocation('Bullying::Intro');
        this.pager = new Pager(this.xml.find('intropager'), this.root);
        this.pager.attach($('#bullying'));
        this.pager.setButtonText(this.xml.find('buttons next').text());
        this.pager.addEventListener('Complete', function() {
            TweenMax.to(_bullying.pager, 0.3, {
                autoAlpha: 0,
                onComplete: function() {
                    _bullying.pager.remove();
                    _bullying.pager = null;
                    _bullying.buildExamples();
                }
            });
        });

    },

    buildExamples: function() {
        log('Bullying::Examples');
        window.parent.setJiraLocation('Bullying::Interaction');
        var examples = new ClickReveal(this.xml.find('examples'));
        examples.attach($('.examples-container'));
        examples.init();
        examples.addEventListener('Complete', function() {
            TweenMax.to('.examples-container, .examples-feedback', 0.3, {
                autoAlpha: 0,
                onComplete: function() {
                    _bullying.middle();
                }
            });
        });
    },

    middle: function() {
        log('Bullying::Middle');
        window.parent.setJiraLocation('Bullying::Middle');
        this.pager = new Pager(this.xml.find('midpager'), this.root);
        this.pager.attach($('#bullying'));
        this.pager.setButtonText(this.xml.find('buttons next').text());
        this.pager.addEventListener('Complete', function() {
            TweenMax.to(_bullying.pager, 0.3, {
                autoAlpha: 0,
                onComplete: function() {
                    _bullying.pager.remove();
                    _bullying.pager = null;
                    _bullying.buildClickThrough();
                }
            });
        });
    },

    buildClickThrough: function() {
        log('Bullying::ClickThrough');
        window.parent.setJiraLocation('Bullying::Interaction');
        var ct = new ClickThrough(this.xml.find('clickthrough'));
        ct.attach($('.clickthrough-container'));
        ct.init();
        ct.addEventListener('Complete', function() {
            TweenMax.to('.clickthrough-container', 0.3, {
                autoAlpha: 0,
                onComplete: function() {
                    _bullying.end();
                }
            });
        });
    },

    end: function() {
        log('Bullying::End');
        window.parent.setJiraLocation('Bullying::End');
        this.pager = new Pager(this.xml.find('endpager'), this.root);
        this.pager.attach($('#bullying'));
        this.pager.setButtonText(this.xml.find('buttons next').text());
        this.pager.addEventListener('Complete', function() {
            TweenMax.to(_bullying.pager, 0.3, {
                autoAlpha: 0,
                onComplete: function() {
                    _bullying.pager.remove();
                    _bullying.pager = null;
                    _bullying.buildThink();
                }
            });
        });
    },

    buildThink: function() {
        log('Bullying::PauseToThink');
        window.parent.setJiraLocation('Bullying::Interaction');
        var examples = new ClickReveal(this.xml.find('think'));
        examples.attach($('.examples-container'));
        examples.init();
        examples.addEventListener('Complete', function() {
            TweenMax.to('.examples-container, .examples-feedback', 0.3, {
                autoAlpha: 0,
                onComplete: function() {
                    _bullying.outro();
                }
            });
        });
    },

    outro: function() {
        log('Bullying::Outro');
        window.parent.setJiraLocation('Bullying::Outro');
        this.pager = new Pager(this.xml.find('outropager'), this.root);
        this.pager.attach($('#bullying'));
        this.pager.setButtonText(this.xml.find('buttons next').text());
        this.pager.addEventListener('Complete', function() {
            TweenMax.to(_bullying.pager, 0.3, {
                autoAlpha: 0,
                onComplete: function() {
                    _shell.activityComplete();
                    _shell.gotoSection(0);
                }
            });
        });
    }
};

var _bullying = new Bullying();


/**
 * Theater
 */
var Theater = (function(xml, callback) {
    _theater = this;
    this.data; // xml
    this.callback = callback;
    this.config(xml);
});

Theater.prototype = {
    config: function(data) {
        // console.log(data);
        this.data = $(data);
        this.playVideo(this.data.find('video').text(), this.enableNext);

        $('.next')
            //.addClass('disabled')
            .html(this.data.find('vidnext').text())
            .click(function() {
                if (!$(this).hasClass('disabled')) {
                    TweenMax.to('.theater', 0.3, { autoAlpha: 0, onComplete: function() { $('.theater').remove(); }});
                    _theater.callback();
                    //_shell.activityComplete();
                    //_shell.nextSection();
                }
            });
    },

    playVideo: function(url, callback) {
        this.video = new VideoPlayer(url, 800, 400, '<track src="../../content/self-awareness/video/ubcaption.vtt" label="English" kind="captions" srclang="en-us" >');
        this.video.attach('.videoContainer');
        this.video.volume(0.25);
        this.video.onEnd = callback;
    },

    enableNext: function() {
        var n = $('.theater .next');
        $('.next').removeClass('disabled');
        TweenMax.to('.next', 0.3, { autoAlpha: 1 });
    }
};
