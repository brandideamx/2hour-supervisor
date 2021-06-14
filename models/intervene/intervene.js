/**
 * Intervene
 */

var Intervene = (function() {
    this.data;
    this.pager;
    this.root;
    this.outcome;
    this.scenarios;
    this.timelineID;

    this.currentIdx = -1;
    this.currentScenario;

    this.timeline = [];
    this.buckets = [];
    this.undoTarget = null;
    this.quizScore;

    this.poll = this.pollForContent();
});

Intervene.prototype = {

    pollForContent: function() {
        return setInterval(this.pollCheck, 500);
    },

    pollCheck: function() {
        _shell.hideLoader();
        if (typeof _shell !== 'undefined' && _shell !== undefined) {
            clearInterval(_Intervene.poll);
            if (typeof _loadedData !== 'undefined' && _loadedData !== undefined) {
                // console.log('| _loadedData is set');
                _Intervene.config(_loadedData);
            } else {
                // console.log('| Trying again...');//////////////////////////////////////
                _shell.tryGetData(function(data) {
                    _Intervene.config(data);
                });
            }
        }
    },

    config: function(data) {
        this.data = $(data);
        this.root = this.data.find('contentRoot').text();
        this.scenarios = this.data.find('scenario').length;

        this.showIntro();
        //this.buildQuiz();
    },

    showIntro: function() {
        // console.log('showIntro()');
        TweenMax.to('.blueBox', 1, {
            left: 0,
            ease: Quad.easeOut,
            onComplete: function() {
                TweenMax.to('.blueBox img', 0.3, {
                    autoAlpha: 1,
                    onComplete: function() {
                        TweenMax.to('.intro .next', 0.3, { autoAlpha: 1 });
                    }
                });
            }
        });
        $('.landing .header').html(this.data.find('landing title').text());
        $('.landing .body').html(this.data.find('landing copy').text());
        $('.landing img').attr('src', this.data.find('landing image').text());
        $('.intro .next').html(this.data.find('buttons next').text())
            .on('click', function() {
                _Intervene.next();
            });
    },
    cleanUp:function(){
        $('.bucket').remove();
        this.buckets = [];
    },
    next: function() {
        this.currentIdx++;

        if (this.currentIdx == this.scenarios) {
            this.showOutro();
            //_shell.activityComplete();
            //_shell.nextSection();
        } else {
            // console.log(_Intervene.data.find('scenario').eq(_Intervene.currentIdx).text());
            $.get(this.root + _Intervene.data.find('scenario').eq(_Intervene.currentIdx).text(), function(xml){

                TweenMax.to('#stripe', 0.3, {
                    y: 30,
                    autoAlpha: 0,
                    onComplete: function() {
                        _Intervene.currentScenario = $(xml);
                        _Intervene.restart();
                        _Intervene.showPreTimeline();
                    }
                });
            });
            /*

            */
        }
    },

    showOutro: function() {
        // console.log('showOutro()');
        TweenMax.to('#stripe', 0.3, {
            y: 30,
            autoAlpha: 1,
            onComplete: function() {
               //
            }
        });
        $('#stripe .textColumn .title').html(this.data.find('outro title').text());
        $('#stripe .textColumn .bodycopy').html(this.data.find('outro copy').text());
        $('#stripe .textColumn .tryagain').remove();
        $('#stripe .textColumn .next').html(this.data.find('buttons next').text())
            .off('click')
            .on('click', function() {
                //_shell.activityComplete();
               // _shell.nextSection();
                _Intervene.showQuizIntro();
            });
    },
    showQuizIntro: function() {
        // console.log('showOutro()');
        TweenMax.to('.headline', 0.3,{
            autoAlpha: 0
        })
        $('.textColumn').css({
                position: 'absolute',
                left: '133px',
                top: '49px',
                width: '760px',
                height: '381px'
        })
        $('#stripe .textColumn .title').html(this.data.find('quizintropager header').text());
        $('#stripe .textColumn .bodycopy').html(this.data.find('quizintropager body').text());
        $('#stripe .textColumn .tryagain').remove();
        $('#stripe .textColumn .next').html(this.data.find('buttons next').text())
            .on('click', function() {
                //_shell.activityComplete();
               // _shell.nextSection();
                _Intervene.buildQuiz();
            });
    },

    showPreTimeline: function() {
        log('ShowPreTimeline()');
        $('.intro .news').prepend($('img.defaultOutcome'));
        TweenMax.set('img.defaultOutcome', {left:0, top:0, scale:1});
        TweenMax.to('.intro', 0.3, { autoAlpha: 1 });
        TweenMax.to('.timeline', 0.3, { autoAlpha: 0 });
        TweenMax.to('.blueBox', 0.7, {
            autoAlpha: 1,
            width: 1000,
            height: 476,
            top: 119,
            ease: 'Quad.easeInOut',
            delay: 0.3
        });
        TweenMax.to('.intro .next', 0.7, {
            left: 796,
            top: 422,
            ease: 'Quad.easeInOut',
            delay: 0.3
        });
        TweenMax.to('.news', 0.3, {
            autoAlpha: 1,
            delay: 1
        });
        TweenMax.to('.landing img, .landing .header, .landing .body', 0.3, { autoAlpha: 0 });
        $('.intro .next').unbind().click(function() {
            $('.timeline .line').append($('img.defaultOutcome'));
            TweenMax.to('.intro', 0.3, {
                autoAlpha: 0
            });
            TweenMax.to('.defaultOutcome', 1, {
                'left': $('.outcome').position().left,
                'top': $('.outcome').position().top,
                'scale': $('.outcome').width() / $('.defaultOutcome').width() + 0.1,
                'alpha': 1,
                'transformOrigin': '0 0',
                'ease': 'Quad.easeInOut',
                'onComplete': function() {
                    _Intervene.startTimeline();
                    TweenMax.to('.timeline', 0.3, { autoAlpha: 1 });
                }
            });
        });

        $('.news img').attr('src', this.currentScenario.find('news image').text());
        $('.news .text').html(this.currentScenario.find('news text').text());
    },

    startTimeline: function() {
        // console.log('startTimeline()');
        TweenMax.to('.inst', 0.3, {
            autoAlpha: 1
        });
        $('.timeline .title').html(this.currentScenario.find('timeline title').text());
        $('.timeline .inst').html(this.currentScenario.find('timeline inst').text());

        for (var i = 0; i < 7; i++) {
            var bucket = new TimeBucket(i);
            $('.line').append(bucket.div);
            if (i == 6) {
                this.outcome = bucket;
            }
            this.buckets.push(bucket);
        }
        this.initialStateID = $(this.currentScenario.find('timeline state')[0]).attr('id');

        this.changeState(this.initialStateID, 0);
        TweenMax.set($('.timeline .done'), {
            autoAlpha: 1
        });
        $('.timeline .done')
            .addClass('disabled')
            .html(this.data.find('buttons done').text())
            .click(function() {
                if ($(this).hasClass('disabled')) {
                    var overlay = $('<div class="overlay" />');
                    var modal = $('<div class="modal" />');

                    modal.html(_Intervene.currentScenario.find('popup').text());
                    modal.append('<div class="close-btn">X</div>');
                    $('.mainColumn').append(overlay).append(modal);
                    $('.close-btn').bind('click', function() {
                        TweenMax.to(modal, 0.3, {
                            autoAlpha: 0
                        });
                        TweenMax.to(overlay, 0.3, {
                            delay: 0.15,
                            autoAlpha: 0,
                            onComplete: function() {
                                overlay.remove();
                                modal.remove();
                            }
                        });
                    });
                } else {
                    $('.undo').remove();
                    $('.outro .title').html(_Intervene.currentScenario.find('outcomes title').text());
                    var outData = _Intervene.currentScenario.find('outcomes ' + _Intervene.timelineID);
                    $('.outro .headline').html(outData.find('headline').text());
                    $('.outro .bodycopy').html(outData.find('copy').text());
                    $('.outro .next').html(_Intervene.data.find('buttons next').text())
                        .unbind().click(function() {
                            _Intervene.cleanUp();
                            _Intervene.next();
                        });
                    if (outData.attr('advance') == 'true') {
                        $('.outro .next').css('display', 'block');
                    } else {
                        $('.outro .next').css('display', 'none');
                    }
                    $('.outro .tryagain').html(_Intervene.data.find('buttons tryagain').text())
                        .unbind().click(function() {
                            _Intervene.restart();
                        });
                    TweenMax.to('.timeline', 0.3, {
                        autoAlpha: 0
                    });
                    TweenMax.fromTo('#stripe', 0.5, {
                        y: 30,
                        autoAlpha: 0
                    }, {
                        y: 0,
                        autoAlpha: 1
                    });
                }
            });
    },

    restart: function() {
        this.changeState($(this.currentScenario.find('timeline state')[0]).attr('id'), 0);

       // $('.timeline .done').addClass('disabled')
        TweenMax.to('#stripe', 0.3, {
            y: 30,
            autoAlpha: 0
        });
        TweenMax.to('.timeline', 0.5, {
            autoAlpha: 1
        });
    },

    changeState: function(id, changeIndex) {
        // console.log('Change State ', id, changeIndex);
        if(id == this.initialStateID){
            $('.timeline .done').addClass('disabled');
        }
        var clickables = false;
        TweenMax.to('.inst, .done', 0.3, {
            autoAlpha: 1
        });
        TweenMax.to('.lines', 0.3, {
            alpha: 1
        });
        if (id != '') {
            _shell.jiraLocation('Timeline ' + id);
            this.timelineID = id;
            this.timeline = this.currentScenario.find('timeline state[id="' + id + '"] event');
            // console.log(this.timeline);
            // console.log('changing', this.buckets.length);
            for (var i = 0 /*changeIndex*/ ; i < this.buckets.length; i++) {
                // console.log(i);
                if(i < this.timeline.length){
                    // console.log('new bucket');
                    try {
                        this.event = new TimeEvent(this.timeline[i])
                        this.buckets[i].addEvent(this.timeline[i], i);
                        if (this.event.clickable) {
                            clickables = true;
                        }
                    } catch (e) {
                        //
                    }
                }else{
                    // console.log('clear after bucket');
                    this.buckets[i].clean();
                }
            }

        }
        if (this.currentScenario.find('timeline state[id="' + id + '"]').attr('outcome') == 'default') {
            // show default newspaper
            TweenMax.to('.defaultOutcome', 0.5, {
                autoAlpha: 1,
                delay: i * 0.05
            });
            TweenMax.set('.outcome', {
                alpha: 0
            });
        } else {
            TweenMax.set('.defaultOutcome', {
                alpha: 0
            });
            TweenMax.fromTo('.outcome', 0.5, {
                autoAlpha: 0
            }, {
                autoAlpha: 1,
                delay: i * 0.05
            });
        }
        if (clickables == false) {
            $('.timeline .inst').html(this.currentScenario.find('timeline noclickinst').text());
        } else {
            $('.timeline .inst').html(this.currentScenario.find('timeline inst').text());
        }
    },

    setUndo: function(index) {
        $('.undo').remove();
        this.undoTarget = this.timelineID;
        var bkt = this.buckets[index].div;
        bkt.addClass('disable-no-change');
        var tip = $('<div class="tooltip" />');
        tip.html('<div class="txt">' + this.data.find('tooltip').text() + '</div><div class="tail"></div>');
        this.undo = $('<div class="undo"></div>');
        this.undo.html(tip);
        this.undo.bind('mouseover', function() {
            TweenMax.to(tip, 0.3, {
                autoAlpha: 1
            });
        });
        this.undo.bind('mouseout', function() {
            TweenMax.to(tip, 0.3, {
                autoAlpha: 0
            });
        });
        var topMargin = bkt.css('margin-top').split('px');
        this.undo.css({
                'left': bkt.position().left + 70,
                'top': bkt.position().top + Number(topMargin[0])
            })
            .click(function() {
                _Intervene.undoChange();
            });

        $('.timeline').append(this.undo);
    },

    undoChange: function() {
        $('.undo').remove();
        //$('.timeline .done').addClass('disabled');
        this.changeState(this.undoTarget, 0);
    },

    promptChange: function(obj) {
        TweenMax.to('.inst, .done', 0.3, {
            autoAlpha: 0
        });
        for (var i = 0; i < this.buckets.length; i++) {
            if (obj == this.buckets[i]) {
                TweenMax.to(this.buckets[i].div, 0.3, {
                    alpha: 1
                });
            } else {
                TweenMax.to(this.buckets[i].div, 0.3, {
                    alpha: 0.5
                });
            }
        }
        $('.event').removeClass('selected');
        obj.event.div.addClass('selected');
        $('.changebox .question').html(obj.event.data.find('question').text());
        $('.changebox .options').empty();
        obj.event.data.find('option').each(function() {
            var opt = $('<div class="option"></div>');
            opt.attr('target', $(this).attr('target'))
                .attr('index', obj.index)
                .html($(this).text())
                .click(function() {
                    TweenMax.to('.changebox', 0.3, {
                        autoAlpha: 0,
                        y: 20
                    });
                    if ($(this).attr('target') == _Intervene.timelineID) {
                        for (var i = 0; i < _Intervene.buckets.length; i++) {
                            TweenMax.to(_Intervene.buckets[i].div, 0.3, {
                                alpha: 1
                            });
                        }
                        TweenMax.to('.inst, .done', 0.3, {
                            autoAlpha: 1
                        });
                        $('.event').removeClass('selected');
                    } else {
                        _Intervene.setUndo(obj.index);
                        _Intervene.changeState($(this).attr('target'), obj.index);
                        if (_Intervene.timelineID != 'A1') {
                            TweenMax.to('.timeline .done', 0.3, {
                                autoAlpha: 1
                            });
                            $('.timeline .done').removeClass('disabled');
                        }
                    }
                })
            $('.changebox .options').append(opt);
        });
        $('.changebox .arrow').css('left', $(obj.div).offset().left - $('.changebox').offset().left + 25);
        TweenMax.fromTo('.changebox .arrow', 0.5, {y: -200}, {y:0});
        TweenMax.fromTo('.changebox', 0.5, {
            autoAlpha: 0,
            y: 20
        }, {
            autoAlpha: 1,
            y: 0
        });
    },

    buildQuiz: function(){
        $('#stripe').hide();
        $('.mainColumn').css('display', 'none')
        $(".mainColumn").hide();
        log('Intervene::Quiz');
        //_shell.setJiraLocation('Intervene::Quiz');
        $('.contentBlock').attr('style', 'top: 158px; left: 0px;')
        var quiz = new Quiz(this.data.find('quiz'));
        quiz.attach($('.quiz-container'));
        quiz.init();
        quiz.addEventListener('Complete', function(score) {
            _Intervene.quizScore = null;
            TweenMax.to('.quiz-container', 0.3, {
                autoAlpha: 0,
                onComplete: function() {
                    _Intervene.outro();
                    /*// console.log('Quiz Score:', _Intervene.quizScore);
                    if (_Intervene.quizScore >= 80) {
                        _Intervene.outro();
                    } else {
                        _Intervene.failFeedback();
                        $('.quiz-container').empty();
                        $('.quiz-container').html([
                            '<div class="contentBlock">',
                                '<div class="question"></div>',
                                '<div class="feedback alpha-off"></div>',
                            '</div>',
                            '<div class="answers"></div>'
                        ].join(''));
                    }*/
                }
            });
        });
    },
    failFeedback: function() {
        log('Intervene::failFeedback');
        window.parent.setJiraLocation('Intervene::failFeedback');
        this.pager = new Pager(this.data.find('failfeedback'), this.root);
        this.pager.attach($('#intervene'));
        this.pager.setButtonText(this.data.find('failfeedback next').text());

        TweenMax.to('.quiz-container', 0.3, { autoAlpha: 0 });
        // $('.conclusion .title').html(this.xml.find('conclusion title').text());
        // $('.conclusion .copy').html(this.xml.find('conclusion copy').text());
        this.pager.addEventListener('Complete', function() {
            TweenMax.to(_Intervene.pager, 0.3, {
                autoAlpha: 0,
                onComplete: function() {
                    TweenMax.to('.pagerWidget', 0.3, { autoAlpha: 0, onComplete: function() {
                        TweenMax.to('.quiz-container', 0.3, { autoAlpha: 1 });
                        _Intervene.buildQuiz();
                    }});

                    // _shell.tracking.LMS.setValue('lesson_score', _bullying.quizScore);
                    // _shell.activityComplete();
                    // // _shell.gotoSection(0);
                    // TweenMax.to('.conclusion', 0.3, { delay: 0.5, autoAlpha: 1 });
                }
            });
        });
    },
    outro: function() {
        // console.log('showOutro()');
        $('.conclusion .title').html(this.data.find('conclusion title').text());
        $('.conclusion .copy').html(this.data.find('conclusion copy').text());
        _shell.tracking.LMS.setValue('lesson_score', _Intervene.quizScore);
        _shell.activityComplete();
                TweenMax.to('.conclusion', 0.3, { delay: 0.5, autoAlpha: 1 });
    },
};

var _Intervene = new Intervene();

/**
 * TimeBucket
 */
var TimeBucket = (function(idx) {
    this.div = $('<div class="bucket bucket' + idx + '" />');
    if (idx == 0 || idx == 2 || idx == 4 || idx == 6) {
        this.div.addClass('bottom');
    } else {
        this.div.addClass('top');
    }

    this.index = idx;
    this.event = null;
});

TimeBucket.prototype = {

    clean: function() {
        this.div.find('.event').remove();
        this.event = null;
        this.div.unbind();
    },

    addEvent: function(data, delay) {
        this.clean();
        if ($(data).children().length > 0) {
            this.event = new TimeEvent(data);
            this.div.append(this.event.div);
            TweenMax.fromTo(this.div, 0.3, {
                alpha: 0
            }, {
                alpha: 1,
                delay: delay * 0.05
            });
            TweenMax.from(this.div.find('.text'), 0.3, {
                alpha: 0,
                y: 20,
                delay: delay * 0.05
            });
            var _me = this;
            if (this.event.clickable) {
                this.div.css('cursor', 'pointer')
                this.event.div.append('<div class="rollover action"></div>');
                this.div.click(function() {
                    _Intervene.promptChange(_me);
                });
            } else {
                this.event.div.append('<div class="rollover noaction">' + _Intervene.currentScenario.find('timeline noaction').text() + '</div>');
                this.div.css('cursor', 'auto');
            }
            this.div.mouseover(function() {
                if (!_me.event.div.parent().hasClass('disable-no-change'))
                    _me.event.div.addClass('hover');
            }).mouseout(function() {
                _me.event.div.removeClass('hover');
            })
        } else {
            this.div.css('cursor', 'auto');
        }
    }

};

/**
 * TimeEvent
 */
var TimeEvent = (function(data) {
    this.clickable = false;
    this.data = $(data);
    this.id = this.data.attr('id');
    this.div = $('<div class="event"></div>');
    this.div.css('background-image', "url('" + _Intervene.root + 'img/' + this.data.find('icon').text() + "')")
        .append('<div class="text">' + this.data.find('label').text() + '</div>');

    if (this.data.find('option').length > 0) {
        this.clickable = true;
    }
});