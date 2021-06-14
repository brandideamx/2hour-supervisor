/**
 * Issue Sorting Model
 * Mod 02
 */

var Unlawful = function() {
    this.poll = this.pollForContent();
    this.xml;
};

Unlawful.prototype = {

    pollForContent: function() {
        return setInterval(this.pollCheck, 500);
    },

    pollCheck: function() {
        if (typeof _shell !== 'undefined' && _shell !== undefined) {
            clearInterval(_template.poll);
            if (typeof _loadedData !== 'undefined' && _loadedData !== undefined) {
                // console.log('| _loadedData is set');
                _template.config(_loadedData);
            } else {
                // console.log('| Trying again...');
                _shell.tryGetData(function(data) {
                    _template.config(data);
                });
            }
        }
    },

    config: function(data) {
        _shell.hideLoader();
        this.xml = $(data);

        this.round = 0;
        this.currentXMLDATA;
        this.answers = [];
        this.correctAnswers = [];
        this.incorrectAnswers = [];
        this.issueLength = this.xml.find('issue').length;
        this.assetPath = this.xml.find('assetpath').text();

        // this.introPopup();
        this.introVideo();
        //this.showFinalConclusion();
    },

    introVideo: function() {
        var theater = new Theater(this.xml.find('introvideo'), function() {
            _template.introPopup();
        });
    },

    introPopup: function() {
        _shell.jiraLocation('Intro Pager');
        this.intro = new Pager(this.xml.find('intro'), this.assetPath);
        this.intro.attach($('body'));
        this.intro.setButtonText(this.xml.find('buttons next').text());
        this.intro.addEventListener('Complete', function() {
            _template.intro.remove();
            _template.buildExamples();
        });
    },

    buildExamples: function() {
        //log('Bullying::Examples');
        //window.parent.setJiraLocation('Bullying::Interaction');
        document.getElementById("bullying").hidden = false;
        // console.log("building examples");
        var examples = new ClickReveal(this.xml.find('examples'));
        examples.attach($('.examples-container'));
        examples.init();
        // console.log("building examples initialized");
        examples.addEventListener('Complete', function() {
            TweenMax.to('.examples-container, .examples-feedback', 0.3, {
                autoAlpha: 0,
                onComplete: function() {
                    _template.intro11Popup();
                }
            });
        });
    },

    intro11Popup: function() {
        _shell.jiraLocation('Intro11 Pager');
        this.intro2 = new Pager(this.xml.find('intro11'), this.assetPath);
        this.intro2.attach($('body'));
        this.intro2.setButtonText(this.xml.find('buttons next').text());
        this.intro2.addEventListener('Complete', function(){
            //// console.log('done?');
            _template.intro2.remove();
            _template.buildExamples2();
        });
    },

    buildExamples2: function() {
        //log('Bullying::Examples');
        //window.parent.setJiraLocation('Bullying::Interaction');
        document.getElementById("bullying").hidden = false;
        // console.log("building examples");
        var examples = new ClickReveal(this.xml.find('examples2'));
        examples.attach($('.examples-container'));
        examples.init();
        // console.log("building examples initialized");
        examples.addEventListener('Complete', function() {
            TweenMax.to('.examples-container, .examples-feedback', 0.3, {
                autoAlpha: 0,
                onComplete: function() {
                    _template.intro2Popup();
                }
            });
        });
    },

    intro2Popup: function() {
        _shell.jiraLocation('Intro2 Pager');
        this.intro2 = new Pager(this.xml.find('intro2'), this.assetPath);
        this.intro2.attach($('body'));
        this.intro2.setButtonText(this.xml.find('buttons next').text());
        this.intro2.addEventListener('Complete', function(){
            //// console.log('done?');
            _template.intro2.remove();
            _template.build();
        });
    },

    build: function() {
        _shell.jiraLocation('Scenarios');
        _shell.jiraItem('Round 1');
        var issues = this.xml.find('issue');
        $.each(issues, function(i, e) {
            var issueContent = _template.issueType($(e));
            var issueElement = $('<div class="single-image" />');
            var props = {
                opacity: 0,
                visiblity: 'hidden',
                background: 'url(' + _template.assetPath + $(e).attr('src') + ') no-repeat center'
            };
            issueElement.css(props);
            issueElement.attr('id', $(e).attr('id'));
            issueElement.attr('data-answer', $(e).attr('answer'));

            issueElement.append(issueContent);
            $('.image-container').append(issueElement);

            if (i == 0) {
                issueElement.addClass('current');
                //TweenMax.to(issueElement, 0.5, { autoAlpha: 1 });
            }

            issueElement.css('left', 1000 * i);
        });

        this.introAnimation();
    },

    issueType: function(issue) {
        var content;

        if (issue.attr('type') == 'image') {
            var pieces = [];
            for (var i = 0; i < issue.find('text').length; i++) {
                var textData = $(issue.find('text')[i]);
                var text = $('<p class="quote-text" />');
                text.attr('style', 'text-align: ' + textData.attr('align') + '; top: ' + textData.attr("y") + 'px; left: ' + textData.attr("x") + 'px');
                text.html(textData.text());
                pieces.push(text);
            }

            content = $('<div />');
            for (var j = 0; j < pieces.length; j++) {
                content.append(pieces[j]);
            }
        } else if (issue.attr('type') == 'email') {
            content = $('<div class="email-content" />');
            var to = '<p>' + issue.find('to').text() + '</p>';
            var subject = '<p>' + issue.find('subject').text() + '</p>';
            var copy = '<p>' + issue.find('text').text() + '</p>';

            content.html(to + subject + copy);
        } else if (issue.attr('type') == 'sms') {
            content = $('<div class="text-message" />');
            content.html(issue.find('text').text());
        }

        return content;
    },

    introAnimation: function() {
        _template.initSelection();
        TweenMax.to('.ui-choice-container', 0.75, {
            bottom: 0,
            ease: Cubic.easeOut
        });
    },

    initSelection: function() {
        this.animateCaptionBar(function() {
            TweenMax.to('.single-image.current', 0.5, {
                autoAlpha: 1
            });
        });

        var ui = $('.ui-choice-container');
        ui.find('.question').html(_template.xml.find('question').text());

        var btns = ui.find('.btn');
        btns.each(function(i, e) {
            $(e).bind('click', _template.makeChoice);
        });
    },

    animateCaptionBar: function(callback) {
        var currentIssue = $('.single-image.current');

        var currentData = $(_template.xml.find('issue#' + currentIssue.attr('id')));
        var caption = $('.image-caption-container .caption');
        caption.html(currentData.find('caption').text());

        if ($('.image-caption-container').is(':animated')) // console.log('ANIMATING');
        callback = (callback == undefined) ? function() {} : callback;
        TweenMax.set('.image-caption-container', {
            left: -1000,
            top: 200
        });
        TweenMax.to('.image-caption-container', 0.75, {
            left: 0,
            ease: Cubic.easeOut
        });
        TweenMax.to('.image-caption-container', 0.5, {
            delay: 3,
            top: 414,
            ease: Cubic.easeInOut,
            onComplete: callback
        });
    },

  makeChoice: function(e) {



        if (_template.round == _template.issueLength - 1) {
            var ui = $('.ui-choice-container');
            ui.find('.question').html(_template.xml.find('question').text());

            var btns = ui.find('.btn');
            btns.each(function(i,e) {
                $(e).unbind('click', _template.makeChoice);
            });

            var choice = $(e.currentTarget).attr('id');
            var currentIssue = $('.single-image.current');
            var a = {
                id: currentIssue.attr('id'),
                selected: choice,
                youGotIt: (choice == currentIssue.attr('data-answer')) ? 'right' : 'wrong'
            };
            _template.answers.push(a);
            var incorrect = [];
            $.each(_template.answers, function(i,e) {
                if (e.id == 2 && e.youGotIt == 'wrong') {
                    incorrect.push(e);
                } else if (e.id == 4 && e.youGotIt == 'wrong') {
                    incorrect.push(e);
                } else if (e.id == 5 && e.youGotIt == 'wrong') {
                    incorrect.push(e);
                }
            });

            TweenMax.to('.image-container', 0.5, { autoAlpha: 0 });
            TweenMax.to('.ui-choice-container', 1, { delay: 0.15, bottom: -228, ease: Cubic.easeIn });
            TweenMax.to('.image-caption-container', 1, { top: 702, ease: Cubic.easeIn, overwrite: 'all' });
            /*
            if (incorrect.length > 0) {
                _template.cid = incorrect[incorrect.length-1].id;
                _template.showTimeLapse();
            } else {
                */
                _shell.jiraItem('Round ' + (_template.round+1));
                // console.log("EQUALS --- " + _template.round + " out of " + (_template.issueLength - 1));
                _template.showConclusion();
            //}
        } else {
            var choice = $(e.currentTarget).attr('id');
            var currentIssue = $('.single-image.current');
            var a = {
                id: currentIssue.attr('id'),
                selected: choice,
                youGotIt: (choice == currentIssue.attr('data-answer')) ? 'right' : 'wrong'
            };
            _template.answers.push(a);
            _shell.jiraItem('Round ' + (_template.round+1));
                // console.log("NEXT --- " + _template.round + " out of " + (_template.issueLength - 1));
            _template.nextRound();
        }

        TweenMax.to('.single-image', 0.25, { autoAlpha: 0 });
    },

    nextRound: function() {
        var currentIssue = $('.single-image.current');
        TweenMax.to(currentIssue, 0.75, {
            left: -1000,
            ease: Cubic.easeInOut
        });
        TweenMax.to(currentIssue.next(), 0.75, {
            autoAlpha: 1,
            left: 0,
            ease: Cubic.easeInOut
        });

        var currentData = $(_template.xml.find('issue#' + currentIssue.next().attr('id')));
        var caption = $('.image-caption-container .caption');
        caption.html(currentData.find('caption').text());

        this.round++;
        currentIssue.removeClass('current');
        currentIssue.next().addClass('current');

        this.animateCaptionBar(function() {
            TweenMax.to('.single-image.current', 0.5, {
                autoAlpha: 1
            });
        });
        _shell.jiraItem('Round ' + (_template.round + 1));
    },

    showTimeLapse: function() {
        TweenMax.to('.time-lapse', 0.5, {
            autoAlpha: 1
        });

        $('.time-lapse .copy p').html(_template.xml.find('timelapse').text());

        setTimeout(function() {
            $('.calendar-page-new').each(function(i, e) {
                var me = $(e);
                TweenMax.to(me, 2, {
                    rotation: 15,
                    top: 650,
                    ease: Cubic.easeIn,
                    delay: 0.5 * i,
                    onComplete: function(e) {
                        if (me.hasClass('last')) {
                            setTimeout(function() {
                                //_template.showPreConclusion();
                                _template.showConclusion();
                            }, 1000);
                        }
                    }
                });
            });
        }, 1000);
    },

    showPreConclusion: function() {
        _shell.jiraLocation('Pre Conclusion');
        TweenMax.to('.time-lapse', 0.5, {
            autoAlpha: 0
        });
        TweenMax.to('.pre-conclusion', 0.5, {
            autoAlpha: 1
        });

        TweenMax.set('.feedback', {
            autoAlpha: 0
        });


        var consequence = _template.xml.find('consequence#scenario' + this.cid);
        var container = $('.conclusion-image-container');
        container.css({
            background: 'url(' + _template.assetPath + consequence.attr('src') + ') no-repeat left top'
        });
        $('.pre-conclusion .blurb').html($(consequence).find('blurb').text());
        $('.pre-conclusion .conclusion-text').html($(consequence).find('copy').text());

        var continueBtn = $('.btn#continue');
        continueBtn.bind('click', _template.showConclusion);
        TweenMax.set(continueBtn, {
            left: 680,
            top: 450
        });
    },

    showConclusion: function() {
        $('.feedback .close').click(_template.hideFeedback);
        _shell.jiraLocation('Conclusion');
        $('.infoTab').html(_template.xml.find('buttons policy').text())
            .off('click')
            .on('click', function() {
                _shell.popupURL(_template.xml.find('definitionPopup').text());
            });
        TweenMax.to('.btn#continue', 0.75, {
            top: 720,
            ease: Cubic.easeIn
        });
        TweenMax.to('.pre-conclusion', 0.5, {
            delay: 0.5,
            autoAlpha: 0
        });

        var yGroup = [],
            nGroup = [];
        $.each(_template.answers, function(i, e) {
            // Split into yes/no groups
            if (e.selected == 'yes') {
                e.selector = '#esc';
                yGroup.push(e);
            } else {
                e.selector = '#noesc';
                nGroup.push(e);
            }
        });

        _template.getThumbs(yGroup);
        _template.getThumbs(nGroup);

        var title = $('.conclusion .title'),
            summary = $('.conclusion .summary p'),
            instructions = $('.conclusion .instructions'),
            escalateHeader = $('.conclusion .escalated .header'),
            nonescalateHeader = $('.conclusion .not-escalated .header');

        title.html(_template.xml.find('conclusion title').text());
        summary.html(_template.xml.find('conclusion summary').text());
        instructions.html(_template.xml.find('conclusion instructions').text());
        escalateHeader.html(_template.xml.find('conclusion escalated').text());
        nonescalateHeader.html(_template.xml.find('conclusion nonescalated').text());

        TweenMax.to('.conclusion', 0.5, {
            delay: 1,
            autoAlpha: 1
        });
        TweenMax.to(summary.parent(), 0.5, {
            delay: 2,
            top: 120,
            autoAlpha: 1,
            ease: Cubic.easeOut
        });

        if ($('.required').length == 0) {
            _template.showConclusionNextBtn();
        }
    },

    getThumbs: function(group) {
        var issue, thumb;
        $.each(group, function(i, e) {
            issue = $(_template.xml.find('issue#' + e.id));
            thumb = $(e.selector + (i + 1));
            thumb.attr('data-id', e.id);

            var img = $('<div class="thumbImg"></div>');
            img.css('background-image', "url('" + _template.assetPath + issue.attr('thumb') + "')");
            thumb.html(img);

            var gotIt;
            if (e.youGotIt == 'wrong') {
                gotIt = 'incorrect';
                thumb.addClass('required');
                thumb.append('<div class="xed red-x" />');
            } else {
                gotIt = 'correct';
                thumb.addClass('required');
                thumb.append('<div class="xed green-x" />');
            }
            thumb.removeClass('empty');

            thumb.bind('click', {
                gotIt: gotIt
            }, _template.showFeedback);
        });
    },

    showFeedback: function(e) {
        var me = $(e.currentTarget);
        var gotIt = e.data.gotIt;
        var scenData = _template.xml.find('issue#' + me.attr('data-id'));
        var feedbackData = scenData.find('feedback ' + gotIt);
        $('.feedback .blurb').html(scenData.find('blurb').text());
        $('.feedback .title').html(feedbackData.find('title').text());
        $('.feedback .body').html(feedbackData.find('copy').text());
        $('.feedback .mainImg').remove();
        var img = $('<img class="mainImg" src="' + _template.assetPath + scenData.attr('fb') + '" />');
        $('.feedback').append(img);
        TweenMax.to('.feedback', 0.5, {
            autoAlpha: 1
        });

        me.removeClass('required');
        me.find('.xed').remove();
    },

    showConclusionNextBtn: function() {
        $('#conclusion-next')
            .html(_template.xml.find('buttons next').text())
            .bind('click', function() {
                _template.showFinalConclusion();
            });
        TweenMax.to('#conclusion-next', 0.5, {
            bottom: 10,
            ease: Cubic.easeOut
        });
    },

    hideFeedback: function(e) {
        TweenMax.to('.feedback', 0.5, {
            autoAlpha: 0
        });
        if ($('.xed').length == 0) {
            _template.showConclusionNextBtn();
        }
    },

    showFinalConclusion: function() {
        TweenMax.to('.conclusion', 0.5, {
            autoAlpha: 0
        });
        var outro = new Pager(this.xml.find('outro'), this.assetPath);
        outro.attach($('body'));
        outro.setButtonText(this.xml.find('buttons next').text());
        outro.addEventListener('Complete', function() {
            _shell.activityComplete();
            _shell.nextSection();
        });
    },
};

// Instantiate
_template = new Unlawful();


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
