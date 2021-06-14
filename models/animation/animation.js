/**
 * Intro Animation
 */

var Animation = (function() {
    this.xml;
    this.poll = this.pollForContent();
});

Animation.prototype = {
    pollForContent: function() {
        return setInterval(this.pollCheck, 500);
    },

    pollCheck: function() {
        if (typeof _shell !== 'undefined' && _shell !== undefined) {
            clearInterval(_anim.poll);
            if (typeof _loadedData !== 'undefined' && _loadedData !== undefined) {
                // console.log('| _loadedData is set');
                _anim.config(_loadedData);
            } else {
                // console.log('| Trying again...');
                _shell.tryGetData(function(data) {
                    _anim.config(data);
                });
            }
        }
    },

    config: function(xml) {
        _shell.hideLoader();
        this.xml = $(xml);

        $('.welcome-to').html(this.xml.find('top').text());
        $('.course-title').html(this.xml.find('bottom').text());

        // Set next button text
        $('.btn.next')
            .html(this.xml.find('buttons next').text())
            .bind('click', function(e) {
                // console.log('animation done');
                _shell.activityComplete();
            });

        this.play();
    },

    play: function() {
        TweenMax.set('.line-mask', {
            autoAlpha: 1
        });
        TweenMax.set('.line', {
            left: 0
        });
        TweenMax.set('.shift-text', {
            top: 0
        });
        TweenMax.set('.sub-text', {
            top: -62
        });
        TweenMax.set('#atl', {
            left: 198,
            top: 205
        });
        TweenMax.set('#abl', {
            left: 198,
            top: 322
        });
        TweenMax.set('#abr', {
            left: 338,
            top: 342
        });
        TweenMax.set('#atr', {
            left: 211,
            top: 322
        });


        TweenMax.to('.line', 0.75, {
            left: 430,
            autoAlpha: 1,
            ease: Cubic.easeOut
        });
        TweenMax.to('.shift-text', 0.5, {
            delay: 0.75,
            top: -87,
            autoAlpha: 1,
            ease: Cubic.easeOut
        });
        TweenMax.to('.sub-text', 0.5, {
            delay: 0.75,
            top: 29,
            autoAlpha: 1,
            ease: Cubic.easeOut
        });

        var arrowDelay = 1;
        TweenMax.to('#atl', 0.75, {
            delay: arrowDelay,
            top: 225,
            left: 218,
            autoAlpha: 1,
            ease: Cubic.easeOut
        });
        TweenMax.to('#abl', 0.75, {
            delay: arrowDelay,
            top: 322,
            left: 218,
            autoAlpha: 1,
            ease: Cubic.easeOut
        });
        TweenMax.to('#abr', 0.75, {
            delay: arrowDelay,
            top: 322,
            left: 318,
            autoAlpha: 1,
            ease: Cubic.easeOut
        });

        TweenMax.to('#atr', 0.75, {
            delay: arrowDelay,
            top: 225,
            left: 312,
            autoAlpha: 1,
            ease: Cubic.easeOut
        });


        TweenMax.to('.welcome-to', 0.5, {
            delay: 2,
            autoAlpha: 1
        });
        TweenMax.to('.course-title', 0.5, {
            delay: 2.25,
            autoAlpha: 1
        });
        TweenMax.to('.btn.next', 0.5, {
            delay: 2.5,
            autoAlpha: 1
        });
    }
};

var _anim = new Animation();
