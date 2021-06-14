function Sexual() {
    this.poll = this.pollForContent();
    this.data; // xml
    this.scenarios = [];
    this.score = 4;
    this.feedback = '';
    this.advisors = [];
    this.tutIndex = -1;
    this.scenarioCounter = 0;
    this.hasFeedbackAppended = false;
}
Sexual.prototype.pollForContent = function() {
    return setInterval(this.pollCheck, 500);
}
Sexual.prototype.pollCheck = function() {
    if (typeof _shell !== 'undefined' && _shell !== undefined) {
        clearInterval(_sexual.poll);
        if (typeof _loadedData !== 'undefined' && _loadedData !== undefined) {
            // console.log('| _loadedData is set');
            _sexual.config(_loadedData);
        } else {
            // console.log('| Trying again...');
            _shell.tryGetData(function(data) {
                _sexual.config(data);
            });
        }
    }
}
Sexual.prototype.config = function(data) {
    _shell.hideLoader();
    this.data = $(data);

    $('#tryagain').html(this.data.find('buttons tryagain').text()).click(_sexual.tryagain);
    //$('#policybtn').html(this.data.find('buttons policy').text()).click(_sexual.showPolicy);

    $('#nextbtn2').html(this.data.find('buttons next').text()).click(function() {
        /*
        _shell.activityComplete();
        _shell.nextSection();
        */
        _sexual.outro();
    });
    $('#persistent-instructions').html(this.data.find('instructions persistent').text());
    $('#question-counter').html('<span id="currq"></span> ' + _sexual.data.find('global of').text() + ' ' + _sexual.data.find('scenario').length)

    $('#advisor-choices .header').html(this.data.find('theadvisors').text()).css({
        'visibility': 'hidden',
        'opacity': 0
    });
    for (i = 0; i < this.data.find('scenario').length; i++) {
        _sexual.scenarios.push(this.data.find('scenario')[i]);
    }
    this.data.find('meter level').each(function(i) {
        $($('#performance-meter .label')[i]).html($(this).text());
    });
    $('#performance-meter .title').html(this.data.find('meter title').text());
    _sexual.meterUpdate(true);
    TweenMax.set('#question', {
        autoAlpha: 0
    });

    //TO SKIP TO FEEDBACK
    //UNCOMMENT THESE AND COMMENT SHOWINTRO()
    //this.score = 9;
    //_sexual.wrapup();

    // this.showIntro();
    this.introVideo();
}

Sexual.prototype.introVideo = function() {
        var theater = new Theater(this.data.find('introvideo'), function() {
            _sexual.showIntro();
        });
}


Sexual.prototype.showIntro = function() {

    this.introPager = new Pager(this.data.find('intro'), this.data.find('contentRoot').text());
    this.introPager.attach($('body'));
    this.introPager.setButtonText(this.data.find('buttons next').text());
    //this.introPager.setTryAgainText(this.data.find('buttons tryagain').text());
    this.introPager.addEventListener('Complete', function() {
        $('#nextbtn').html(_sexual.data.find('buttons next').text())
        TweenMax.to('#stripe', 0.3, {
            autoAlpha: 1
        });
        _sexual.introPager.remove();
        _sexual.buildExamples();
    })
}
Sexual.prototype.buildExamples = function () {
    document.getElementById("bullying").hidden = false;
    document.getElementById("activity").hidden = true;
    // console.log("building examples");
    var examples = new ClickReveal(this.data.find('examples'));
    examples.attach($('.examples-container'));
    examples.init();
    // console.log("building examples initialized");
    examples.addEventListener('Complete', function() {
        TweenMax.to('.examples-container, .examples-feedback', 0.3, {
            autoAlpha: 0,
            onComplete: function() {
                _sexual.showIntro2();
            }
        });
    });
};

Sexual.prototype.showIntro2 = function () {
    this.intro2Pager = new Pager(this.data.find('intro2'), this.data.find('contentRoot').text());
    this.intro2Pager.attach($('body'));
    this.intro2Pager.setButtonText(this.data.find('buttons next').text());
    this.intro2Pager.addEventListener('Complete', function () {
        $('#nextbtn').html(_sexual.data.find('buttons next').text());
        TweenMax.to('#stripe', 0.3, {
            autoAlpha: 1
        });
        _sexual.intro2Pager.remove();
        _sexual.tutorial();
                document.getElementById("activity").hidden = false;
    });
};
Sexual.prototype.showPolicy = function() {
    _shell.popupURL('content/sexual/definition_popup.html')
}
Sexual.prototype.tutorial = function() {
    this.tutIndex++;
    if (this.tutIndex == this.data.find('instructions slide').length) {
        TweenMax.to('#stripe', 0.4, {
            top: 343,
            'height': 277,
            width: 1000
        });
        $('#stripe #nextbtn').unbind('click').fadeOut();
        $('#stripe .title, #stripe .bodycopy').hide();

        $('.mainColumn').css({
            marginLeft: 0
        });

        TweenMax.to('#question-counter', 0.3, {
            autoAlpha: 1,
            delay: 2
        });
        TweenMax.to('#question', 0.3, {
            autoAlpha: 1
        });
        TweenMax.fromTo('#advisor-choices .header', 0.5, {
            x: -50,
            autoAlpha: 0
        }, {
            x: 0,
            autoAlpha: 1,
            delay: 2.5
        });
        _sexual.setQuestion();
    } else {
        $('#stripe .bodycopy').html($(this.data.find('instructions slide')[this.tutIndex]).text());
        TweenMax.fromTo('#stripe .bodycopy', 0.4, {
            autoAlpha: 0
        }, {
            autoAlpha: 1
        });
        if (this.tutIndex == 0) {
            TweenMax.to('#stripe', 0.3, {
                top: 210,
                height: 256,
                delay: 0.2
            });
        } else if (this.tutIndex == 1) {
            TweenMax.to('#stripe', 0.3, {
                top: 146,
                delay: 0.2,
                onComplete: function() {
                    var advisors = _sexual.data.find('advisors advisor');
                    for (i = 0; i < advisors.length; i++) {
                        var curradvisor = $(_sexual.data.find('advisors advisor')[i]);
                        var advisor = $('<div class="advisor" advisor="' + curradvisor.attr('id') + '"><img src="../../content/sexual/img/' + curradvisor.text() + '" /></div>');
                        _sexual.advisors.push(advisor);
                        $('#advisor-choices').append(advisor);
                    }
                    TweenMax.to('#advisor-choices .advisor', 0.3, {
                        opacity: 1,
                        'y': -60
                    });
                }
            });
        } else if (this.tutIndex == 2) {
            TweenMax.to('#stripe', 0.3, {
                width: 664,
                height: 249,
                top: 94,
                delay: 0.2
            });
            $('.mainColumn .bodycopy').css({
                marginLeft: 28
            });
            $('#stripe #nextbtn').css({
                right: 372
            });
            $('#persistent-instructions, #performance-meter, #question-counter').fadeIn();
        }
        $('#stripe #nextbtn').unbind().click(function() {
            _sexual.tutorial();
        });
    }
}
Sexual.prototype.setQuestion = function() {
    TweenMax.to('#advisor-choices .advisor', 0.2, {
        autoAlpha: 1
    });
    $('#currq').html($(_sexual.scenarios[0]).attr('id'));
    $('#question .header').html(this.data.find('situation').text() + $(_sexual.scenarios[0]).attr('id'));
    TweenMax.fromTo('#question', 0.3, {
        autoAlpha: 0
    }, {
        autoAlpha: 1
    });
    $('#question .text').html($(_sexual.scenarios[0]).find('background').text());
    TweenMax.from('#question .header', 0.3, {
        x: 40,
        alpha: 0,
        delay: 0.8
    });
    TweenMax.from('#question .text', 0.4, {
        x: 40,
        alpha: 0,
        delay: 1.8
    });
    TweenMax.to('#persistent-instructions', 0.3, {
        alpha: 1,
        delay: 3.5
    });
    var potScore = this.score + 2;
   
    _sexual.bindAdvisors();
    TweenMax.to('.bars .potential', 0.5, {
        'height': potScore * 100/14 + '%',
        delay: 0
    });
}
Sexual.prototype.advisorPopup = function(advisor) {
    var selectednum = $(advisor).attr('advisor');
    var advicetext = $(_sexual.scenarios[0]).find('advisor[id="' + selectednum + '"] advice').text() + '<br><br>' + this.data.find('advisorPrompt').text();
    var agreebtn = $('<div class="btn" id="agreebtn">' + _sexual.data.find('buttons agree').text() + '</div>');
    var ignorebtn = $('<div class="btn" id="ignorebtn">' + _sexual.data.find('buttons ignore').text() + '</div>');

    var position = $('#speech-bubble').position().left - ($(advisor).position().left - 75);
    TweenMax.to($(advisor), 0.001, {
        'z-index': 2
    });
    TweenMax.to($(advisor).children('img'), 0.5, {
        y: 80,
        'left': position + 'px'
    });

    $('#speech-bubble').html(advicetext).append(agreebtn).append(ignorebtn);
    TweenMax.to('#speech-bubble', 0.4, {
        'height': 501,
        'autoAlpha': 1
    });
    agreebtn.click(function() {
        TweenMax.to($(advisor).children('img'), 0.3, {
            y: 0,
            'left': 0,
            onComplete: function() {
                $(advisor).css('z-index', '0');
            }
        });
        _sexual.selectAnswer(selectednum);
    })
    ignorebtn.click(function() {
        _sexual.bindAdvisors();
        TweenMax.to($(advisor).children('img'), 0.3, {
            y: 0,
            'left': 0,
            onComplete: function() {
                $(advisor).css('z-index', '0');
            }
        });
        TweenMax.to('#speech-bubble', 0.4, {
            'height': 0,
            'autoAlpha': 0,
            onComplete: function() {
                $(this).empty()
            }
        });
    })
}
Sexual.prototype.bindAdvisors = function() {
    $('#advisor-choices .advisor').css({
        'cursor': 'pointer',
        'pointer-events': 'auto'
    }).bind('click', function() {
        $('#advisor-choices .advisor').unbind().css({
            'cursor': 'auto',
            'pointer-events': 'none'
        });
        _sexual.advisorPopup(this)
    })

}
Sexual.prototype.selectAnswer = function(selectednum) {
    _sexual.scenarioCounter++;
    TweenMax.to('#persistent-instructions', 0.3, {
        alpha: 0
    });
    TweenMax.to('#speech-bubble', 0.4, {
        'autoAlpha': 0,
        onComplete: function() {
            $(this).empty()
        }
    });
    //$('#question').fadeOut(function(){
    $('#agreebtn, #ignorebtn, #advisor-choices .advisor').unbind();
    var advisor = $(_sexual.scenarios[0]).find('advisor[id="' + selectednum + '"]');
    if (advisor.find('hint').text() != '' && advisor.find('hint').text() != undefined) {
        _sexual.feedback = (_sexual.feedback + '<li>' + advisor.find('hint').text() + '</li>');
    }

    var newpoints = Number($(_sexual.scenarios[0]).find('advisor[id="' + selectednum + '"]').attr('points'))
    _sexual.score += newpoints;
    var score = $('<div class="points"><div class="num"></div></div>');
    var num = score.find('.num');
    if (newpoints > 0) {
        num.html('+' + newpoints);
    } else {
        num.html(newpoints);
    }
    $('#advisor-choices').append(score);
    var box = $('#speech-bubble');
    var numH = (num.height() + 80)
    var numW = (num.width() + 80);
    score.css({
        left: box.position().left,
        top: box.position().top,
        width: box.width() + 70,
        height: box.height() + 210
    });

    num.css({
        'top': (score.height() - numH) / 2 + 'px',
        'left': (score.width() - numW) / 2 + 'px'
    });
    TweenMax.from(num, 0.7, {
        y: 30,
        alpha: 0
    });
    var boxPos = score.position();
    TweenMax.to(score, 0.4, {
        left: boxPos.left + num.position().left,
        top: boxPos.top + num.position().top,
        height: numH,
        width: numW,
        delay: 1
    });
    TweenMax.to(num, 0.4, {
        left: 0,
        top: 0,
        delay: 1,
        onComplete: function() {
            TweenMax.to('#advisor-choices .advisor', 0.2, {
                autoAlpha: 0,
                onComplete: function() {
                    $('#advisor-choices .advisor').remove();
                    if (_sexual.scenarioCounter == 1) {
                        _sexual.advisors = [_sexual.advisors[2], _sexual.advisors[1], _sexual.advisors[3], _sexual.advisors[0]];
                    } else if (_sexual.scenarioCounter == 2) {
                        _sexual.advisors = [_sexual.advisors[2], _sexual.advisors[3], _sexual.advisors[0], _sexual.advisors[1]];
                    } else if (_sexual.scenarioCounter == 3) {
                        _sexual.advisors = [_sexual.advisors[1], _sexual.advisors[0], _sexual.advisors[2], _sexual.advisors[3]];
                    } else if (_sexual.scenarioCounter == 4) {
                        _sexual.advisors = [_sexual.advisors[3], _sexual.advisors[1], _sexual.advisors[0], _sexual.advisors[2]];
                    }

                    for (var i = 0; i < _sexual.advisors.length; i++) {
                        $('#advisor-choices').append(_sexual.advisors[i]);
                    }
                }
            });
        }
    });
    TweenMax.to(score, 1, {
        left: 740,
        top: -270,
        scale: 0.4,
        ease: 'Quad.easeInOut',
        delay: 2,
        onComplete: function() {
            _sexual.meterUpdate();
            TweenMax.to(score, 0.3, {
                alpha: 0,
                onComplete: function() {
                    score.remove();
                    setTimeout(function() {
                        _sexual.scenarios.shift();
                        if (_sexual.scenarios.length >= 1) {
                            _sexual.setQuestion();
                        } else {
                            _sexual.wrapup();
                        }
                    }, 500)
                }
            })
        }
    });


}
Sexual.prototype.wrapup = function() {
    TweenMax.to('#stripe, #question, #advisor-choices', 0.4, {
        x: -500,
        autoAlpha: 0
    });
    var pageData = this.data.find('feedback');
    var passed = false;
    var almostPassed = false;
    if (this.score < 7) {
        // var feedbacktitle = _sexual.data.find('feedback lowtitle');
        var feedbackbody = _sexual.data.find('feedback low');
    } else if (this.score >= 7 && this.score <= 9) {
        almostPassed = true;
        // var feedbacktitle = _sexual.data.find('feedback mediumtitle');
        var feedbackbody = _sexual.data.find('feedback medium');
    } else {
        // var feedbacktitle = _sexual.data.find('feedback hightitle');
        var feedbackbody = _sexual.data.find('feedback high');
        var passed = true;
    }

    //pageData.find('header').text(feedbacktitle);
    pageData.find('page header').each(function(i) {
        $(this).text(feedbackbody.find('title' + (i + 1)).text());
    });
    pageData.find('page body').each(function(i) {
        var fbBody = feedbackbody.find('page' + (i + 1)).text();
        // console.log(fbBody);
        // console.log(fbBody.indexOf('[INJECT]'));
        if (fbBody.indexOf('[INJECT]') > -1) {
            var tmp = fbBody.split('[INJECT]');
            var count = (_sexual.feedback.match(/<li>/g) || []).length;

            fbBody = tmp[0] + '<ul>' + _sexual.feedback + '</ul>' + tmp[1];

             if (count >= 3) {
                fbBody = '<span style="font-size:14px;line-height:17px">' + fbBody + '</span>';
            }
        }
        if (!passed) {
            var style = 'left: -150px';
            if (!almostPassed) {
                style = 'left: 0px';
                $(this).parent().attr('nextX', -1000);
            } else {
                $(this).parent().attr('nextX', 255);
            }
            fbBody += '<div class="btn tryagain" style="' + style + '">' + _sexual.data.find('buttons tryagain').text() + '</div>';
        } else if (passed) {
            $(this).parent().attr('nextX', 255);
        }
        $(this).text(fbBody);
    });

    if (passed || almostPassed) {
        if (!_sexual.hasFeedbackAppended) {
            var clone = _sexual.data.find('outro page')[0].cloneNode(true);
            pageData.append(clone);
            _sexual.hasFeedbackAppended = true;
        } else {
            pageData.children().each(function(idx, node) {
                if (node.nodeName == 'page') {
                    if ($(node).find('header').text() == '') {
                        pageData[0].removeChild(node);
                            var clone = _sexual.data.find('outro page')[0].cloneNode(true);
                            pageData.append(clone);
                    }
                }
            });
        }
        var advance = function() {
            // _shell.activityComplete();
            // _shell.nextSection();
            _sexual.showOutro1();
            // TweenMax.to('.activity', 0.5, { autoAlpha: 0, onComplete: function() {
            //     _sexual.startScenarios();
            // }})
        }
    }

    this.feedbackPager = new Pager(pageData, this.data.find('contentRoot').text());
    this.feedbackPager.attach($('body'));
    this.feedbackPager.setButtonText(this.data.find('buttons next').text());
    this.feedbackPager.addEventListener('TryAgain', function() {
        _sexual.feedbackPager.remove();
        _sexual.tryagain();
    });
    this.feedbackPager.addEventListener('Complete', function() {
        _sexual.feedbackPager.remove();
        advance();
    })
}
Sexual.prototype.meterUpdate = function(snap) {
    if (_sexual.score < 0) {
        _sexual.score = 0;
    }
    var percent = _sexual.score * 100/14; // start at 4, can earn 10 more
    //if (percent > 100) percent = 100;
    if (snap) {
        $('.bars .bar').css('height', percent + '%');
    } else {
        TweenMax.to('.bars .actual', 0.5, {
            height: percent + '%'
        });
    }
    if (_sexual.score < 7) {
        TweenMax.to('.label.needs', 0.3, {
            alpha: 1
        });
        TweenMax.to('.label.meets, .label.exceeds', 0.3, {
            alpha: 0.3
        });
    } else if (_sexual.score < 10) {
        TweenMax.to('.label.meets', 0.3, {
            alpha: 1
        });
        TweenMax.to('.label.needs, .label.exceeds', 0.3, {
            alpha: 0.3
        });
    } else {
        TweenMax.to('.label.exceeds', 0.3, {
            alpha: 1
        });
        TweenMax.to('.label.needs, .label.meets', 0.3, {
            alpha: 0.3
        });
    }
}
Sexual.prototype.tryagain = function() {
        _sexual.scenarios = [];
        _sexual.score = 4;
        _sexual.feedback = '';
        for (i = 0; i < _sexual.data.find('scenario').length; i++) {
            _sexual.scenarios.push(_sexual.data.find('scenario')[i]);
        }
        TweenMax.to('#feedback', 0.4, {
            x: 500,
            autoAlpha: 0,
            onComplete: function() {
                _sexual.meterUpdate();
                _sexual.setQuestion();
                $('#feedback-body').empty();
                TweenMax.to('#stripe, #question, #advisor-choices', 0.4, {
                    x: 0,
                    autoAlpha: 1
                });
            }
        });
    }


/**
 * SCENARIOS ------------------------------------- /
 */
Sexual.prototype.startScenarios = function () {
    // console.log('Scenarios...');

    var scenarios = new Scenarios();
    scenarios.addEventListener('Complete', function () {
        // _unconscious.showConclusion();
        _sexual.showOutro2();
        // console.log("Showing outro2");
        document.getElementById("unconscious").hidden = true;
        $('#container .scenario-template').remove();
    });
};
/** --------------------------------------------- */
Sexual.prototype.showOutro2 = function () {
    this.outro2Pager = new Pager(this.data.find('outro2'), this.data.find('contentRoot').text());
    this.outro2Pager.attach($('body'));
    this.outro2Pager.setButtonText(this.data.find('buttons next').text());
    this.outro2Pager.addEventListener('Complete', function () {
        _shell.activityComplete();
        _shell.gotoSection(0);
    });
};

Sexual.prototype.showOutro1 = function () {
    this.outro1Pager = new Pager(this.data.find('outro1'), this.data.find('contentRoot').text());
    this.outro1Pager.attach($('body'));
    this.outro1Pager.setButtonText(this.data.find('buttons next').text());
    this.outro1Pager.addEventListener('Complete', function () {
        TweenMax.to('.activity', 0.5, { autoAlpha: 0, onComplete: function() {
                // _sexual.startScenarios();
                _sexual.showOutro2();
                _sexual.outro1Pager.remove();
            }})
    });
};


/**
 * Scenarios
 * v.0.2
 */
var Scenarios = (function () {
    _self = this;

    this.xml;
    this.scenarios;
    this.currentScenario;
    this.events = [];

    $.get('../../content/sexual/scenarios.xml', this.config);
    $(".activity").find('.mainColumn').hide();
});
Scenarios.prototype = {
    config: function (xml) {
        // console.log('Scenario XML', xml);
        _self.xml = $(xml);
        _self.scenarios = _self.xml.find('scenario').length;

        _self.beginScenario(1);
    },

    beginScenario: function (id) {
        $('.unconscious .container').removeClass('autoAlphaOff');
        $('.scenario-lbl').html(_shell.valign('Scenario ' + id));
        this.currentScenario = this.xml.find('scenario#' + id);
        this.board = new Scene(this.currentScenario, this);
    },

    nextScenario: function () {
        var id = Number(this.currentScenario.attr('id'));
        var nextId = id + 1;
        if (nextId <= this.scenarios) this.destroyScenario(nextId);
        else this.dispatchEvent('Complete');
    },

    destroyScenario: function (id) {
        $('.container').empty();
        this.beginScenario(id);
    },

    addEventListener: function (evt, fn) {
        this.events[evt] = fn;
    },

    dispatchEvent: function (evt) {
        if (this.events[evt] != undefined) {
            this.events[evt]();
        }
    }
};

/**
 * Scene
 */
var Scene = (function (xml, parent) {
    _scene = this;

    this.parent = parent;
    this.events = [];
    this.div = this.getTemplate();
    this.div.removeClass('keep-quiet');

    this.xml = xml;
    this.position = 0;
    this.roundLength = this.xml.find('round').length;
    this.root = '../../content/sexual/';

    this.config();
});


Scene.prototype = {
    config: function () {
        this.div.find('.img-bg').css({
            'background-image': 'url(' + this.root + this.xml.attr('img') + ')'
        });
        this.div.find('.scenario-desc').html(this.xml.find('caption').text());
        this.buildBoards();
        this.attach('.container');
        this.step(0);
    },

    buildBoards: function () {
        var rounds = this.xml.find('round');
        $.each(rounds, function (i, e) {
            var board = new Board(i, e, _scene);
            board.attach(_scene.div.find('.board-container'), i, rounds.length);
        });
        var w = (1000 * (rounds.length - 1)) - 170;
        $(_scene.div.find('.board-container')).append('<div class="green-line" style="width:' + w + 'px"></div>');
    },

    step: function (idx) {
        TweenMax.to('.board-container', 0.35, {
            top: 55
        });
        if (idx == 0) { // First screen
            $('.img-bg').removeClass('blur');
            $('.btn.prev').addClass('disabled');
            $('.btn.next').removeClass('disabled');

            TweenMax.to('.board-container', 0.65, {
                left: 1000
            });
            TweenMax.to('.scenario-desc', 0.35, {
                delay: 0.3,
                top: 100,
                autoAlpha: 1,
                ease: Quad.easeOut,
                onComplete: function () {
                    $('.btn.next').off('click').on('click', function (e) {
                        $('.img-bg').addClass('blur');
                        TweenMax.set('.board-container', {
                            autoAlpha: 1
                        });
                        setTimeout(function () {
                            _scene.step(1)
                        }, 200);
                    });
                }
            });
        } else if (idx == this.xml.find('round').length) { // Final screen
            TweenMax.to('.btn.next, .btn.prev', 0.001, {
                autoAlpha: 0
            });

            TweenMax.to('.board-container', 0.65, {
                left: -(1000 * (idx - 1)),
                ease: Quad.easeOut,
                onComplete: function () {
                    $('.btn.next').off('click');
                    $('.btn.prev').off('click');
                    $('.btn.conclusion-back').on('click', function (e) {
                        TweenMax.to('.btn.next, .btn.prev', 0.001, {
                            autoAlpha: 1
                        });
                        _scene.step(idx - 1)
                    });
                    $('.btn.transform').on('click', function (e) {
                        TweenMax.to('.scenario-desc', 0.35, {
                            // delay: 0.3,
                            top: 60,
                            autoAlpha: 0,
                            ease: Quad.easeIn,
                            onComplete: function () {
                                _scene.div.find('.scenario-desc').html(_scene.xml.find('caption').text());
                                 $(".scenario-template").find('.scenario-desc').show();
                                _scene.showFinal();
                            }
                        });

                    });
                }
            });
        } else { // Other screens
            if ($('.board#board-' + idx).find('.selected').length == 0)
                $('.btn.next').addClass('disabled');
            else
                $('.btn.next').removeClass('disabled');

            if (idx == 1) {
                $('.btn.prev').addClass('disabled');
                _scene.checkCapSize();
            } else if (idx > 1) {
                $('.btn.prev').removeClass('disabled');
            } else if (idx == this.xml.find('round').length - 1) {
                TweenMax.to('.scenario-desc', 0.35, {
                    delay: 0.3,
                    top: 100,
                    autoAlpha: 1,
                    ease: Quad.easeOut
                });

            }
            _scene.parallaxImage(idx);
            _scene.moveBoard(idx);
        }
    },

    checkCapSize: function () {
        if (!this.xml.find('caption').attr('class')) this.div.find('.scenario-desc').removeClass('small');
        else{
            this.div.find('.scenario-desc').addClass(this.xml.find('caption').attr('class'));
            this.div.find('.scenario-desc').hide();
            $(".board-container").find('#board-1').css({ top: '75px' });
            $(".board-container").find('#board-1').css({ left: '130px' });
            $(".board-container").find('#board-2').css({ top: '75px' });
            $(".board-container").find('#board-2').css({ left: '1116px' });
            $(".board-container").find('#board-3').css({ top: '75px' });
            $(".board-container").find('#board-3').css({ left: '2118px' });
            $(".board-container").find('#board-4').css({ top: '75px' });
            $(".board-container").find('#board-4').css({ left: '3118px' });
            $(".board-container").find('#board-5').css({ top: '75px' });
            $(".board-container").find('#board-5').css({ left: '4113px' });
            $(".board-container").find('.green-line').css({ top: '288px' });

            $(".board-container").find('#c0.circle.cright').css({ top: '280px' });
            $(".board-container").find('#c0.circle.cright').css({ left: '874px' });
            $(".board-container").find('#c1.circle.cright').css({ top: '280px' });
            $(".board-container").find('#c1.circle.cright').css({ left: '1860px' });
            $(".board-container").find('#c1.circle.cleft').css({ top: '280px' });
            $(".board-container").find('#c1.circle.cleft').css({ left: '1105px' });
            $(".board-container").find('#c2.circle.cright').css({ top: '280px' });
            $(".board-container").find('#c2.circle.cright').css({ left: '2862px' });
            $(".board-container").find('#c2.circle.cleft').css({ top: '280px' });
            $(".board-container").find('#c2.circle.cleft').css({ left: '2107px' });
            $(".board-container").find('#c3.circle.cright').css({ top: '280px' });
            $(".board-container").find('#c3.circle.cright').css({ left: '3862px' });
            $(".board-container").find('#c3.circle.cleft').css({ top: '280px' });
            $(".board-container").find('#c3.circle.cleft').css({ left: '3107px' });
            $(".board-container").find('#c4.circle.cleft').css({ top: '280px' });
            $(".board-container").find('#c4.circle.cleft').css({ left: '4101px' });

            $("#board-2").find('.header').css({ padding: '0px 40px 40px 40px' });
            $("#board-3").find('.header').css({ padding: '0px 40px 40px 40px' });

            // $(".board-container").find('#c2').hide();
            // $(".board-container").find('#c3').hide();
            // $(".board-container").find('#c4').hide();
            // $(".board-container").find('#c5').hide();

$("#country.save")

        }
    },

    moveBoard: function (idx) {
        TweenMax.to('.board-container', 0.65, {
            left: -(1000 * (idx - 1)),
            ease: Quad.easeOut,
            onComplete: function () {
                _scene.setNextPrev(idx);
            }
        });
    },

    enableNext: function () {
        this.div.find('.next').removeClass('disabled');
    },

    parallaxImage: function (idx) {
        var img = $('.img-bg'),
            indices = [1, 2, 3, 4];
        img.addClass('pos' + indices[idx - 1]);

        var idxOfIndices = indices.indexOf(idx);
        indices.splice(idxOfIndices, 1);
        $.each(indices, function (i, e) {
            img.removeClass('pos' + e);
        });
    },

    setNextPrev: function (idx) {
        $('.btn.next').off('click').on('click', function (e) {
            if (!$(this).hasClass('disabled')) {
                _scene.step(idx + 1);
            }
        });
        $('.btn.prev').off('click').on('click', function (e) {
            _scene.step(idx - 1)
        });
    },

    showFinal: function () {
        var caption = this.xml.find('caption-changed');
        var img = this.xml.attr('img-changed');
        this.div.find('.scenario-desc').removeClass('small').removeClass('medium');
        // this.div.find('.scenario-desc').removeClass('small');

        TweenMax.to('.btn.next', 0.5, {
            autoAlpha: 0
        });

        TweenMax.to('.board-container', 0.65, {
            left: -5000,
            ease: Quad.easeOut,
            onComplete: function () {
                TweenMax.set('.board-container', {
                    autoAlpha: 0
                });

                var currentImg = _scene.div.find('.img-bg');
                var newBackground = _scene.div.find('.img-bg').clone();

                currentImg.removeClass('blur');
                newBackground
                    .addClass('final-bg')
                    .removeClass('blur')
                    .css('background-image', 'url(../../content/sexual/' + img + ')');

                _scene.div.append(newBackground);

                TweenMax.to(currentImg, 1, {
                    // delay: 0.75,
                    left: -1000,
                    ease: Quad.easeOut
                });
                TweenMax.to(newBackground, 1, {
                    // delay: 0.75,
                    left: 0,
                    ease: Quad.easeOut,
                    onComplete: function () {
                        _scene.div.find('.scenario-desc').html(caption.text());
                        TweenMax.to('.scenario-desc', 0.85, {
                            top: 100,
                            autoAlpha: 1,
                            ease: Quad.easeOut,
                            onComplete: function () {
                                if (_scene.xml.attr('id') == 1) // NEEDS TO BE EQUAL TO LAST SCENE ID
                                    _scene.div.find('.final-next-popup p').html('Click NEXT to move ahead with the training.');

                                TweenMax.to('.final-next-popup', 1.25, {
                                    delay: 2,
                                    marginTop: 30,
                                    autoAlpha: 1,
                                    ease: Quad.easeOut
                                });
                                _scene.div.find('.final-next').off('click').on('click', function (e) {
                                    TweenMax.set('.final-next-popup', {
                                        autoAlpha: 0,
                                        marginTop: 0
                                    });
                                    TweenMax.set('.next, .prev', {
                                        autoAlpha: 1
                                    });
                                    _scene.parent.nextScenario();
                                });
                            }
                        });
                    }
                });

                //$('.btn.next').removeClass('disabled').off('click').on('click', function(e) { _scene.parent.nextScenario(); });
                $('.btn.prev').off('click').on('click', function (e) {
                    TweenMax.to('.final-next-popup', 0.75, {
                        marginTop: 0,
                        autoAlpha: 0
                    });
                    _scene.div.find('.final-next').off('click');

                    TweenMax.set('.board-container', {
                        autoAlpha: 1
                    });
                    _scene.step(_scene.roundLength);
                });
            }
        });
    },

    getTemplate: function () {
        return $('.scenario-template').clone();
    },

    attach: function (target) {
        $(target).append(this.div);
    },

    addEventListener: function (evt, fn) {
        this.events[evt] = fn;
    },

    dispatchEvent: function (evt) {
        if (this.events[evt] != undefined) {
            this.events[evt]();
        }
    }
};

/**
 * Board
 */
var Board = (function (i, e, parent) {
    this.xml = $(e);
    this.parent = parent;
    this.div = $('<div class="board" id="board-' + this.xml.attr('id') + '" />');
    //188
    this.div.css('left', (58 + (1000 * i)));
    //if (i == this.parent.xml.find('round').length-1) this.div.css('left', 80 + (1000*i));
    if (i == this.parent.xml.find('round').length - 1) this.div.css('left', 100 + (1000 * i));

    this.currentStupidIdx = i;

    this.config();
});
Board.prototype = {
    config: function () {
        if (!this.xml.attr('end')) {
            this.div.html(this.getTemplate());
            this.createOptions();
        } else {
            this.div.addClass('end');
            this.div.html(this.getEndTemplate());
        }
    },

    createOptions: function () {
        var _board = this;
        $.each(this.xml.find('option'), function (i, e) {
            var opt = $(e);
            var li = $('<li class="opt" id="opt-' + opt.attr('id') + '">');
            var inner = [
                '<div class="valign">',
                '   <div class="middle">' + opt.find('label').text(),
                '       <div class="feedback">' + opt.find('feedback').text() + '</div>',
                '   </div>',
                '</div>'
            ];

            li.html(inner.join('')).on('click', function (e) {
                _board.optClick(e);
            });

            _board.div.find('ul').append(li);
        });

        if (this.xml.find('option').length == 2) _board.div.find('ul').addClass('just-two');
    },

    optClick: function (e) {
        var clicked = $(e.currentTarget),
            others = this.div.find('li');

        // Add specific class to clicked to check against
        clicked.addClass('no-fade selected');

        // Loop through others and fade them out/remove click event
        $.each(others, function (i, e) {
            var li = $(e);
            li.off('click');
            if (!li.hasClass('no-fade')) TweenMax.to(li, 0.15, {
                autoAlpha: 0
            });
        });

        // Animate the clicked box
        var _this = this;
        setTimeout(function () {
            _this.boxReveal(clicked)
        }, 100);

        // Enable next
        this.parent.enableNext();
        // console.log(this);
    },

    boxReveal: function (clicked) {
        // Get current position
        var offset = {
            top: clicked.offset().top - clicked.parent().offset().top,
            left: clicked.offset().left - clicked.parent().offset().left
        };

        // Set clicked position to current
        clicked.css({
            position: 'absolute',
            top: offset.top,
            left: offset.left
        }).addClass('remove-extra').addClass('green-header');

        // Fade out inner text
        TweenMax.to(clicked.find('.middle'), 0.15, {
            autoAlpha: 0,
            onComplete: function () {
                TweenMax.set(clicked.find('.feedback'), {
                    autoAlpha: 1
                });
            }
        });

        // Animate box
        var animParams = {
            top: 0,
            left: 0,
            width: 695,
            // width: 565,
            height: 216,
            backgroundColor: 'white',
            transformOrigin: 'center center center',
            ease: Quad.easeInOut,
            onComplete: function () {
                TweenMax.to(clicked.find('.middle'), 0.3, {
                    autoAlpha: 1
                });
            }
        };
        TweenMax.to(clicked, 0.25, animParams);
    },

    getTemplate: function () {
        var head = this.xml.find('header').text();
        var length = head.split(' ').length;
        var size = (length < 30) ?
            'font-size:24px;line-height:28px' :
            (length < 50) ?
            'font-size:20px;line-height:22px' :
            (length < 70) ?
            'font-size:16px;line-height:18px' :
            '';
        var html = [
            '<div class="inner">',
            '   <div class="header" style="' + size + '">' + head + '</div>',
            '   <div class="options-container">',
            '       <ul class="option-list"></ul>',
            '   </div>',
            '</div>'
        ];

        return html.join('');
    },

    getEndTemplate: function () {
        var head = this.xml.find('header').text();
        var html = [
            '<div class="inner">',
            '   <div class="header">' + head + '</div>',
            '   <div class="end-feedback-container">',
            '       <div class="dynamic-size">' + this.xml.find('body').text() + '</div>',
            // '       <a class="btn conclusion-back" href="javascript:void(0)">BACK</a>',
            '       <a class="btn transform" href="javascript:void(0)">NEXT</a>',
            '   </div>',
            '</div>'
        ];

        return html.join('');
    },

    attach: function (target, idx, length) {
        $(target).append(this.div);
        if (idx == 0) {
            $(target).append('<div class="circle cright" id="c' + idx + '" style="left:' + (800 + (1000 * idx)) + 'px"></div>');
        } else if (idx == length - 1) {
            $(target).append('<div class="circle cleft" id="c' + idx + '" style="left:' + (88 + (1000 * idx)) + 'px"></div>'); /*4070*/
        } else {
            $(target).append('<div class="circle cright" id="c' + idx + '" style="left:' + (800 + (1000 * idx)) + 'px"></div>');
            //179
            $(target).append('<div class="circle cleft" id="c' + idx + '" style="left:' + (49 + (1000 * idx)) + 'px"></div>');
        }
    }
};
    /*
    Sexual.prototype.outro = function(){
        this.outroPager = new Pager(this.data.find('outro'), this.data.find('contentRoot').text());
        this.outroPager.attach($('body'));
        this.outroPager.setButtonText(this.data.find('buttons next').text());
        this.outroPager.addEventListener('Complete', function(){
            _shell.activityComplete();
            _shell.nextSection();
        })
    }
    */
_sexual = new Sexual();


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
