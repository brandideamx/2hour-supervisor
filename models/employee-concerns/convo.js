function Convo() {
    this.poll = this.pollForContent();
    this.data; // xml
    this.globals; // xml
    this.root; // string
    this.vid; // html5 video player
    this.phaseData; //xml
    this.optData; // xml
    this.nextQuestion; // string
    this.log = [];
    this.finalGrade; // string
    this.outcome;
    this.currentVideo; // string
    this.convoVolume = 1;
    this.passed = false;
    this.currentVidObj;
    this.transcriptData;
    this.videoOptionsBeingBuilt;
}
Convo.prototype.pollForContent = function() {
    return setInterval(this.pollCheck, 500);
}
Convo.prototype.pollCheck = function() {
    if (typeof _shell !== 'undefined' && _shell !== undefined) {
        clearInterval(_Convo.poll);
        if (typeof _loadedData !== 'undefined' && _loadedData !== undefined) {
            // console.log('| _loadedData is set');
            _Convo.config(_loadedData);
        } else {
            // console.log('| Trying again...');
            _shell.tryGetData(function (data) {
                _Convo.config(data);
            });
        }
    }
}
Convo.prototype.config = function (data) {
    _shell.hideLoader();
    this.data = $(data);
    this.root = this.data.find('contentRoot').text();
    $.get('../../content/employee-concerns/globals.xml', function(data) {
        _Convo.globals = $(data);
        _Convo.init(data);
    });
}
Convo.prototype.init = function(data) {
    _shell.jiraLocation('intro');
    $('.infoTab').html(this.globals.find('transcript').text())
        .click(function() {
            _shell.popupStyled(_Convo.transcriptData);
        });
    $('.phase .question').html(this.globals.find('question').text());
    $('.phase .inst').html(this.globals.find('inst').text());
    $('.coachBox .next').html(this.globals.find('buttons next').text())
        .click(function() {
            _Convo.tearDown(function() {
                _Convo.advance();
            })
        });
    this.showPhase($(this.data.find('phase')[0]).attr('id'));
    //this.fakeConvo();
}
Convo.prototype.showPhase = function(id) {
    _shell.jiraLocation('convo');
    _shell.jiraItem(id);
    TweenMax.set('.leftCol', {
        alpha: 0
    });
    this.phaseData = this.data.find('phase[id="' + id + '"]');

    var vidURL = this.phaseData.find('customer_says video').text();
    this.transcriptData = this.phaseData.find('customer_says transcript').text();

    if (vidURL != '' && vidURL != this.currentVideo) {
        this.playVideo(vidURL, function() {
            //_Convo.currentVidObj.goToTime(0);
            // console.log('-- Video Callback');
            // console.log('-- Current video', _Convo.currentVideo);
            // console.log('-- Video played', vidURL);
            if (_Convo.videoOptionsBeingBuilt != _Convo.currentVideo)
                _Convo.buildOptions();
        });
    } else {
        this.buildOptions();
    }
}
Convo.prototype.buildOptions = function() {
    this.videoOptionsBeingBuilt = this.currentVideo;
    this.phaseData.find('option').each(function(i) {
        var opt = $('<div class="option"></div>');
        opt.html($(this).find('you_say').text())
            .attr('index', i)
            .mouseover(function() {
                $(this).addClass('hover');
            })
            .mouseout(function() {
                $(this).removeClass('hover');
            })
            .click(function() {
                _Convo.chooseOption(this);
            });
        $('.options').append(opt);
    })
    TweenMax.to('.leftCol', 0.5, {
        alpha: 1
    });

}
Convo.prototype.playVideo = function(url, end) {
    if (url != this.currentVideo) {
        $('.rightCol .videoContainer').empty();
        var vid = new VideoPlayer(this.root + url, 500, "");
        vid.attach('.rightCol .videoContainer');
        vid.volume(this.convoVolume);

        this.currentVideo = url;
        this.currentVidObj = vid;
        vid.onVolume = function() {
            _Convo.convoVolume = vid.volume();
        }
        if (end != undefined) {
            // console.log('VIDEO HAS CALLBACK');
            vid.onEnd = end;
        }
    }
}
Convo.prototype.chooseOption = function(opt) {
    $(opt).addClass('selected');
    $('.option').unbind().addClass('disabled');
    this.optData = $(this.phaseData.find('option')[$(opt).attr('index')]);
    this.nextQuestion = this.optData.find('link').text();

    if (this.nextQuestion == 'END') {
        this.log.push({
            question: this.phaseData.find('customer_says transcript'),
            you: this.optData.find('you_say').text(),
            score: Number(this.optData.find('score').text())
        });
        this.gradeConversation();
        this.log[this.log.length - 1].response = this.outcome.find('transcript').text();
        this.log[this.log.length - 1].coach = this.outcome.find('feedback').text();
        $('.coach .content').html(this.optData.find('coach').text());
        _Convo.playVideo(_Convo.outcome.find('video').text(), function() {
            // console.log('CHOICE callback');
            //_Convo.currentVidObj.goToTime(0);
            TweenMax.fromTo('.coachBox', 0.3, {
                autoAlpha: 0,
                x: 30
            }, {
                autoAlpha: 1,
                x: 0
            });
        });
    } else {
        this.transcriptData = this.optData.find('response transcript').text();
        this.log.push({
            question: this.phaseData.find('customer_says transcript').text(),
            you: this.optData.find('you_say').text(),
            response: this.optData.find('response transcript').text(),
            score: Number(this.optData.find('score').text()),
            coach: this.optData.find('coach').text()
        });
        $('.coach .content').html(this.optData.find('coach').text());
        _Convo.playVideo(_Convo.optData.find('response video').text(), function() {
            //_Convo.currentVidObj.goToTime(0);
            TweenMax.fromTo('.coachBox', 0.3, {
                autoAlpha: 0,
                x: 30
            }, {
                autoAlpha: 1,
                x: 0
            });
        });
    }
}
Convo.prototype.fakeConvo = function() {
    for (var i = 0; i < 2; i++) {
        var obj = {
            question: "Question " + i,
            you: 'You say ' + i,
            score: 5 - Math.round(Math.random() * 10),
            response: 'Response ' + i,
            coach: 'Coach ' + i
        }
        this.log.push(obj);
    }
    this.nextQuestion = 'END';
    this.gradeConversation();
    this.advance();
}
Convo.prototype.gradeConversation = function() {
    var userScore = Number(this.data.find('initScore').text());
    for (var i = 0; i < this.log.length; i++) {
        userScore += Number(this.log[i].score);
    }
    if (userScore >= 16) {
        finalGrade = 'best';
        this.passed = true;
        // _shell.activityComplete();
    } else if (userScore >= 8) {
        finalGrade = 'average';
        this.passed = 'almost';
        // _shell.activityComplete();
    } else if (userScore >= 5) {
        finalGrade = 'below';
    } else {
        finalGrade = 'fail';
    }
    this.outcome = this.data.find('ending ' + finalGrade);
    this.transcriptData = this.data.find('ending ' + finalGrade + ' transcript').text();
}
Convo.prototype.advance = function() {
    if (this.nextQuestion == 'END') {
        TweenMax.to('.leftCol, .rightCol', 0.3, {
            autoAlpha: 0
        });
        this.showOutro();
    } else {
        _Convo.showPhase(_Convo.nextQuestion);
    }
}
Convo.prototype.tearDown = function(callback) {
    TweenMax.to('.option', 0.3, {
        alpha: 0,
        onComplete: function() {
            $('.option').remove();
            callback();
        }
    });
    TweenMax.to('.coachBox', 0.3, {
        x: 30,
        autoAlpha: 0
    });
}
Convo.prototype.showOutro = function() {
    _shell.jiraLocation('outro');
    var _me = this;
    TweenMax.to('.outro', 0.3, {
        autoAlpha: 1
    });
    this.graph = new Graph($('.graph'), this.log.length);
    this.graph.addPoints(Number(this.data.find('initScore').text()));
    for (var i = 0; i < this.log.length; i++) {
        this.graph.addPoints(this.log[i].score);
    }
    this.graph.showHotspot = function(n) {
        _me.recapQuestion(n);
    }
    $('.outro .text').html(this.globals.find('feedbackInst').text() + '<br><br>' + this.outcome.find('feedback').text());
    $('.outro .label.top').html(this.globals.find('graph top').text());
    $('.outro .label.bottom').html(this.globals.find('graph bottom').text());

    $('.outro .textCol .header .headertext').html(this.globals.find('graph recap').text());
    if (!this.passed || this.passed == 'almost') {
        $('.outro .next').addClass('disabled');
        $('.outro .tryagain').html(this.globals.find('buttons tryagain').text())
            .css('display', 'block')
            .unbind()
            .click(function() {
                _me.tryagain();
            })
    } else {
        $('.outro .next').removeClass('disabled');
        $('.outro .tryagain').css('display', 'none');
    }
    if (this.passed == 'almost') $('.outro .next').removeClass('disabled');
    $('.outro .next').html(this.globals.find('buttons next').text())
        .unbind()
        .click(function() {
            if (!$(this).hasClass('disabled')) {
                _shell.activityComplete();
            }
        });
}
Convo.prototype.tryagain = function() {
    TweenMax.to('.outro', 0.3, {
        autoAlpha: 0
    });
    TweenMax.to('.leftCol, .rightCol', 0.3, {
        autoAlpha: 1
    });
    this.log = [];
    $('canvas').remove();
    this.init();
}
Convo.prototype.recapQuestion = function(n) {
    // console.log('recap ' + n);
    $('.outro .textCol .id').html(Number(n) + 1);
    var b = $('.outro .body');
    b.empty();
    var q = this.log[n];
    b.append(this.makeFeedbackBlock('They said:', q.question));
    b.append(this.makeFeedbackBlock('You said:', q.you));
    b.append(this.makeFeedbackBlock('Their response:', q.response));
    b.append(this.makeFeedbackBlock('Coach Says:', q.coach));
    TweenMax.fromTo('.outro .textCol', 0.3, {
        autoAlpha: 0
    }, {
        autoAlpha: 1
    });
}
Convo.prototype.makeFeedbackBlock = function(title, txt) {
    var div = $('<div class="block"></div>');
    div.append('<div class="title">' + title + '</div>')
        .append(txt);
    return div;
}
_Convo = new Convo();
