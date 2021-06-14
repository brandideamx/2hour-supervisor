/**
 * Convo Model
 * Audio only version
 */

var Convo = (function() {
    this.xml;
    this.globals;
    this.optData;
    this.phaseData;
    this.transcriptData;

    this.root;
    this.finalGrade;
    this.nextQuestion;
    this.currentVideo;

    this.vid;
    this.outcome;
    this.log = [];
    this.currentVideoObj;
    this.videoOptionsBeingBuilt;

    this.passed = false;
    this.convoVolume = 1;

    this.poll = this.pollForContent();
});

Convo.prototype = {

    pollForContent: function() {
        return setInterval(this.pollCheck, 500);
    },

    pollCheck: function() {
        _shell.hideLoader();
        if (typeof _shell !== 'undefined' && _shell !== undefined) {
            clearInterval(_Convo.poll);
            if (typeof _loadedData !== 'undefined' && _loadedData !== undefined) {
                // console.log('| _loadedData is set');
                _Convo.config(_loadedData);
            } else {
                // console.log('| Trying again...');
                _shell.tryGetData(function(data) {
                    _Convo.config(data);
                });
            }
        }
    },

    config: function(xml) {
        this.xml = $(xml);
        this.root = this.xml.find('contentRoot').text();
        $.get('../../content/bullying-behavior/globals.xml', function(xml) {
            _Convo.globals = $(xml);
            _Convo.init(xml);
        });
    },

    init: function(xml) {
        _shell.jiraLocation('Convo::Intro');

        $('.videoContainer').css({
            backgroundImage: 'url(../../content/bullying-behavior/'+ this.xml.find('poster').text() +')'
        });

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
        //_shell.audio.controller.attach($('.videoContainer'), $('.videoContainer').width());
        this.showPhase($(this.xml.find('phase')[0]).attr('id'));
        if(isIpad()){
            var playBut = $('<img src="../../core/img/big_play_but.png" class="play" />');
            $('.videoContainer').append(playBut);
            playBut.click(function(){
                _shell.audio.resume();
                $(this).remove();
            })
        }
    },

    showPhase: function(id) {
        _shell.jiraLocation('convo');
        _shell.jiraItem(id);
        TweenMax.set('.leftCol', {
            alpha: 0
        });
        this.phaseData = this.xml.find('phase[id="' + id + '"]');

        var vidURL = this.phaseData.find('customer_says audio').attr('src');
        this.transcriptData = this.phaseData.find('customer_says transcript').text();

        log(vidURL, this.currentVideo);

        if (vidURL != '' && vidURL != this.currentVideo) {
			_shell.audio.play(this.root.replace('../../', '')+vidURL, {
				'complete': function() {
					if (_Convo.videoOptionsBeingBuilt != _Convo.currentVideo
						|| _Convo.currentVideo == undefined)
						_Convo.buildOptions();
				}
			});
        } else {
            this.buildOptions();
        }
    },

    buildOptions: function() {
        this.videoOptionsBeingBuilt = this.currentVideo;
        var options =  [];
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
            options.push(opt);
           // $('.options').append(opt);
        });
        options = shuffle(options);
        for(var i = 0; i<options.length; i++){
            $('.options').append(options[i]);
        }
        TweenMax.to('.leftCol', 0.5, {
            alpha: 1
        });
    },

    playVideo: function(url, end) {
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
                log('VIDEO HAS CALLBACK');
                vid.onEnd = end;
            }
        }
    },

    chooseOption: function(opt) {
        $(opt).addClass('selected');
        $('.option').unbind().addClass('disabled');
        this.optData = $(this.phaseData.find('option')[$(opt).attr('index')]);
        log(this.optData);
        this.nextQuestion = this.optData.find('link').text();
        log('Next Question', this.nextQuestion);
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

            this.currentVideo = _Convo.outcome.find('audio').text();
			_shell.audio.play(this.root.replace('../../', '')+_Convo.outcome.find('audio').text(), {
				'complete': function() {
					TweenMax.fromTo('.coachBox', 0.3, {
					    autoAlpha: 0,
					    x: 30
					}, {
					    autoAlpha: 1,
					    x: 0
					});
				}
			});
        } else {
        	this.currentVideo = _Convo.optData.find('response audio').attr('src');
            this.transcriptData = this.optData.find('response transcript').text();
            this.log.push({
                question: this.phaseData.find('customer_says transcript').text(),
                you: this.optData.find('you_say').text(),
                response: this.optData.find('response transcript').text(),
                score: Number(this.optData.find('score').text()),
                coach: this.optData.find('coach').text()
            });
            $('.coach .content').html(this.optData.find('coach').text());

            _shell.audio.play(this.root.replace('../../', '')+_Convo.optData.find('response audio').attr('src'), {
				'complete': function() {
					TweenMax.fromTo('.coachBox', 0.3, {
					    autoAlpha: 0,
					    x: 30
					}, {
					    autoAlpha: 1,
					    x: 0
					});
				}
			});
        }
    },

    fakeConvo: function() {
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
    },

    gradeConversation: function() {
        var userScore = Number(this.xml.find('initScore').text());
        for (var i = 0; i < this.log.length; i++) {
            userScore += Number(this.log[i].score);
        }
        log('User Score', userScore);
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
        this.outcome = this.xml.find('ending ' + finalGrade);
        this.transcriptData = this.xml.find('ending ' + finalGrade + ' transcript').text();
    },

    advance: function() {
        if (this.nextQuestion == 'END') {
            TweenMax.to('.leftCol, .rightCol', 0.3, {
                autoAlpha: 0
            });
            this.showOutro();
        } else {
            _Convo.showPhase(_Convo.nextQuestion);
        }
    },

    tearDown: function(callback) {
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
    },

    showOutro: function() {
        _shell.jiraLocation('outro');
        var _me = this;
        TweenMax.to('.outro', 0.3, {
            autoAlpha: 1
        });
        TweenMax.to('#definitionbtn', 0.3, { autoAlpha: 0 });
        this.graph = new Graph($('.graph'), this.log.length);
        this.graph.addPoints(Number(this.xml.find('initScore').text()));
        for (var i = 0; i < this.log.length; i++) {
            this.graph.addPoints(this.log[i].score);
        }
        this.graph.showHotspot = function(n) {
            _me.recapQuestion(n);
        }
        $('.outro .text').html(this.outcome.find('feedback').text() + '<br><br>' + this.globals.find('feedbackInst').text());
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
                    _shell.gotoSection(10);
                }
            });
    },

    tryagain: function() {
        TweenMax.to('.outro', 0.3, {
            autoAlpha: 0
        });
        TweenMax.to('.leftCol, .rightCol', 0.3, {
            autoAlpha: 1
        });
        TweenMax.to('.outro .textCol', 0.3, {
            autoAlpha: 0
        });
        this.log = [];
        $('canvas').remove();
        this.init();
    },

    recapQuestion: function(n) {
        log('recap ' + n);
        $('.outro .textCol .id').html(Number(n) + 1);
        var b = $('.outro .body');
        b.empty();
        var q = this.log[n];
        log(q);
        b.append(this.makeFeedbackBlock('They said:', q.question));
        b.append(this.makeFeedbackBlock('You said:', q.you));
        b.append(this.makeFeedbackBlock('Their response:', q.response));
        b.append(this.makeFeedbackBlock('Coach Says:', q.coach));
        TweenMax.fromTo('.outro .textCol', 0.3, {
            autoAlpha: 0
        }, {
            autoAlpha: 1
        });
    },

    makeFeedbackBlock: function(title, txt) {
        var div = $('<div class="block"></div>');
        div.append('<div class="title">' + title + '</div>')
            .append(txt);
        return div;
    }
};

_Convo = new Convo();