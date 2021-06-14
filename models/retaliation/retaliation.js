function Retaliation() {
    this.poll = this.pollForContent();
    this.data; // xml
    this.scenarios = [];
    this.currscenario;
}
Retaliation.prototype.pollForContent = function() {
    return setInterval(this.pollCheck, 500);
}
Retaliation.prototype.pollCheck = function() {
    if (typeof _shell !== 'undefined' && _shell !== undefined) {
        clearInterval(_retaliation.poll);
        if (typeof _loadedData !== 'undefined' && _loadedData !== undefined) {
            // console.log('| _loadedData is set');
            _retaliation.config(_loadedData);
        } else {
            // console.log('| Trying again...');
            _shell.tryGetData(function(data) {
                _retaliation.config(data);
            });
        }
    }
}
Retaliation.prototype.config = function(data) {
    _shell.hideLoader();
    this.data = $(data);
    this.root = this.data.find('contentRoot').text();
    this.meter = new ProgressMeter();
    for (i = 0; i < this.data.find('scenario').length; i++) {
        _retaliation.scenarios.push(this.data.find('scenario')[i]);
        this.meter.addBox();
    }
    $('#progress-meter-text').html(this.data.find('global scenarioLabel').text() + '<span id="curr-scenario"></span>')
    $('#definitionbtn').html(_retaliation.data.find('buttons definition').text()).click(function() {
        _shell.popupURL('content/retaliation/definition_popup.html')
    })

    var theater = new Theater(this.data.find('introvideo'), function() {
            _retaliation.intro1();
    });

    
}

Retaliation.prototype.intro1 = function() {
    this.intro = new Pager(this.data.find('intro'), this.root);
            this.intro.attach($('body'));
            this.intro.setButtonText(this.data.find('buttons next').text());
            this.intro.addEventListener('Complete', function() {
                _retaliation.intro.remove();
                _retaliation.setQuestion();
                $('#definitionbtn').animate({
                    left: 0
                }, 300);
                $('#progress-meter').fadeIn();
            })


}

Retaliation.prototype.setQuestion = function() {
    this.currscenario = $(_retaliation.scenarios[0]);
    var question = '<div id="question">' + _retaliation.currscenario.find('question').text() + '</div>';
    var background = '<div id="background">' + _retaliation.currscenario.find('background').text() + '</div>';
    var img = '<div id="scenario-image"><img src="../../content/retaliation/img/' + _retaliation.currscenario.find('img').text() + '" /></div>';
    var yesbtn = $('<div class="btn" id="yesbtn">' + this.data.find('buttons yes').text() + '</div>');
    var nobtn = $('<div class="btn" id="nobtn">' + this.data.find('buttons no').text() + '</div>');
    $('#curr-scenario').html(this.currscenario.attr('id'))
    $('.progress-indicator').removeClass('active');
    $('#indicator' + (this.currscenario.attr('id') - 1)).addClass('active');

    $('#question-wrapper').html(background + img + question)
        .append(yesbtn)
        .append(nobtn)
        .append('<div class="inst">' + this.data.find('instructions').text() + '</div>');
    nobtn.add(yesbtn).bind('click', function() {
        $('.inst').remove();
        $(yesbtn).add(nobtn).unbind().fadeOut(function() {
            $('#yesbtn,#nobtn').remove()
        });
        if (_retaliation.currscenario.find('question').attr('key') == $(this).attr('id') || _retaliation.currscenario.find('question').attr('key') == 'bothbtn') {
            _retaliation.correctClick(this);
        } else {
            $('#question').remove();
            _retaliation.incorrectClick();
        }
    })
}
Retaliation.prototype.correctClick = function(btnclicked) {
    $('#feedback-wrapper').css({
        'background-color': 'rgba(19,176,200,0.8)'
    })
    if ($(btnclicked).attr('id') == 'yesbtn' && _retaliation.currscenario.find('question').attr('key') != 'bothbtn') {
        TweenMax.to('#background, #scenario-image', 0.5, {
            x: -137,
            /* y: -70, */ onComplete: function() {
                var feedback = '<div class="feedbackhead">' + _retaliation.data.find('global correctheadline').text() + '</div>';
                feedback += _retaliation.currscenario.find('correctfeedback').text();
                $('#feedback-wrapper').html(feedback);
                TweenMax.to('#feedback-wrapper', 0.3, {
                    autoAlpha: 1
                });
            }
        });
        var nextbtn = $('<div class="btn" id="nextq">' + this.data.find('buttons next').text() + '</div>');
        $('#question-wrapper').append(nextbtn);
        nextbtn.click(function() {
            _retaliation.whyQuestion();
            $(this).remove();
        });
        $('#question').empty();
    } else {
        $('#question').remove();
        TweenMax.to('#background, #scenario-image', 0.5, {
            x: -137,
            onComplete: function() {
                if(_retaliation.currscenario.find('question').attr('key') == 'bothbtn'){
                    var feedback = '<div class="feedbackhead">' + _retaliation.data.find('global maybeheadline').text() + '</div>';
                }else{
                    var feedback = '<div class="feedbackhead">' + _retaliation.data.find('global correctheadline').text() + '</div>';
                }
                feedback += _retaliation.currscenario.find('correctfeedback').text();
                $('#feedback-wrapper').html(feedback).css({
                    'top': '176px'
                });
                TweenMax.to('#feedback-wrapper', 0.3, {
                    autoAlpha: 1
                });
                $('.progress-indicator').removeClass('active');
                $('#indicator' + (_retaliation.currscenario.attr('id') - 1)).addClass('complete');
                _retaliation.wrapupQuestion();
                _retaliation.scenarios.shift();
            }
        });
    }
}
Retaliation.prototype.whyQuestion = function() {
    TweenMax.set('#why-buttons', {
        alpha: 0
    });
    TweenMax.to('#question-wrapper, #feedback-wrapper', 0.4, {
        y: -70
    });
    $('#question').html(_retaliation.currscenario.find('whyquestion').text()).css('font-size', '18px');

    for (i = 0; i < _retaliation.currscenario.find('why').length; i++) {
        var why = $(_retaliation.currscenario.find('why')[i]);
        var btn = '<div class="whybtn" key="' + why.attr('id') + '">' + why.text() + '</div>';
        $('#why-buttons').append(btn);

    }
    $('.whybtn').each(function(i) {
        $(this).bind('click', function() {
            _retaliation.whyButtonClick(this);
        })
    })
    TweenMax.to('#why-buttons', 0.5, {
        delay: 0.5,
        autoAlpha: 1
    })
}
Retaliation.prototype.whyButtonClick = function(clicked) {
    $(clicked).addClass('clicked');
    var whyfeedback = _retaliation.currscenario.find('whyfeedback[id="' + $(clicked).attr('key') + '"]').text();
    $('.whybtn').unbind().each(function() {
        if (!$(this).hasClass('clicked')) {
            $(this).remove();
        } else {
            $(this).append('<div id="whyfeedback">' + whyfeedback + '</div>')
        }
    });
    if (_retaliation.currscenario.find('why[id="' + $(clicked).attr('key') + '"]').attr('correct') == 't') {
        $('.progress-indicator').removeClass('active');
        $('#indicator' + (_retaliation.currscenario.attr('id') - 1)).addClass('complete');
        _retaliation.scenarios.shift();
    } else {
        var incorrect = _retaliation.scenarios.shift();
        _retaliation.scenarios.push(incorrect);
        _retaliation.meter.shuffleProgress($(incorrect).attr('id'));
    }
    _retaliation.wrapupQuestion();
}
Retaliation.prototype.incorrectClick = function() {
    $('#feedback-wrapper').css({
        'background-color': 'rgba(140,198,63,0.8)',
        'top': '176px'
    })
    TweenMax.to('#background, #scenario-image', 0.5, {
        x: -137,
        onComplete: function() {
            var feedback = '<div class="feedbackhead">' + _retaliation.data.find('global incorrectheadline').text() + '</div>';
            feedback += _retaliation.currscenario.find('incorrectfeedback').text();
            $('#feedback-wrapper').html(feedback);
            TweenMax.to('#feedback-wrapper', 0.3, {
                autoAlpha: 1
            });
        }
    });

    var incorrect = _retaliation.scenarios.shift();
    _retaliation.scenarios.push(incorrect);
    _retaliation.meter.shuffleProgress($(incorrect).attr('id'));
    _retaliation.wrapupQuestion();
}
Retaliation.prototype.wrapupQuestion = function() {
    $('#nobtn, #yesbtn').remove();
    var nextbtn = $('<div class="btn" id="nextq">' + this.data.find('buttons next').text() + '</div>');
    $('#question-wrapper').append(nextbtn);
    nextbtn.bind('click', _retaliation.clearQuestion)
}
Retaliation.prototype.clearQuestion = function() {
    TweenMax.to('#feedback-wrapper, #background, #why-buttons, #scenario-image', 0.3, {
        autoAlpha: 0,
        onComplete: function() {
            TweenMax.set('#feedback-wrapper, #question-wrapper', {
                y: 0
            });
            $('#background, #scenario-image, #question').remove();
            $('#feedback-wrapper, #why-buttons').empty();
            if (_retaliation.scenarios.length >= 1) {
                _retaliation.setQuestion();
            } else {
                _retaliation.outro = new Pager(_retaliation.data.find('outro'), _retaliation.root);
                _retaliation.outro.attach($('body'));
                _retaliation.outro.setButtonText(_retaliation.data.find('buttons next').text());
                _retaliation.outro.addEventListener('Complete', function() {
                    _retaliation.completemodule();
                })
            }
        }
    });
}
Retaliation.prototype.completemodule = function() {
    _shell.activityComplete();
    _shell.nextSection();
}
_retaliation = new Retaliation();


function ProgressMeter() {
    this.boxes = [];
}
ProgressMeter.prototype.addBox = function() {
    var box = $('<div class="progress-indicator" id="indicator' + this.boxes.length + '"></div>');
    $
    box.css('left', 100 + 31 * i);
    $('#progress-meter').append(box);
    this.boxes.push(box);
}
ProgressMeter.prototype.shuffleProgress = function(n) {
    var shiftIndex = -1;
    for (var i = 0; i < this.boxes.length; i++) {
        if (this.boxes[i].attr('id') == 'indicator' + (n - 1)) {
            shiftIndex = i;
        }
    }
    if (shiftIndex != -1 && shiftIndex != this.boxes.length - 1) {
        for (var i = shiftIndex + 1; i < this.boxes.length; i++) {
            var Xpos = this.boxes[i].position().left;
            TweenMax.to(this.boxes[i], 0.3, {
                left: this.boxes[i - 1].position().left,
                delay: 0.2
            });
        }
        var shifter = this.boxes.splice(shiftIndex, 1)[0];
        this.boxes.push(shifter);

        TweenMax.to(shifter, 0.2, {
            y: -30,
            onComplete: function() {
                TweenMax.to(shifter, 0.3, {
                    left: Xpos,
                    onComplete: function() {
                        TweenMax.to(shifter, 0.2, {
                            y: 0
                        });
                    }
                })
            }
        });
    }
}



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
