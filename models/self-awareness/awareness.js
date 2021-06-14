/**
 * Self Awareness
 * (Was called Bias)
 */

var Awareness = (function() {
	this.data;
	this.root;
	this.ticker;
	this.selections;
    this.matches; //rob
    this.defies; //rob
	this.scenarioIndex;
	this.poll = this.pollForContent();
});

Awareness.prototype = {
    pollForContent: function() {
        return setInterval(this.pollCheck, 500);
    },

    pollCheck: function() {
        if (typeof _shell !== 'undefined' && _shell !== undefined) {
            clearInterval(_awareness.poll);
            if (typeof _loadedData !== 'undefined' && _loadedData !== undefined) {
                // console.log('| _loadedData is set');
                _awareness.config(_loadedData);
            } else {
                // console.log('| Trying again...');
                _shell.tryGetData(function(data) {
                    _awareness.config(data);
                });
            }
        }
    },

    config: function(data) {
        _shell.hideLoader();
        this.data = $(data);
        this.root = this.data.find('contentRoot').text();
        TweenMax.set('.scenario, .grid', {
            autoAlpha: 0
        });
        // $('.transcript')
        //     .html(this.data.find('buttons transcript').text())
        //     .click(function(){
        //         _shell.popup(_awareness.data.find("caption").text(),"close")
        // });

        this.introVideo();
        // this.introPager();
    },

    introVideo: function() {
        var theater = new Theater(this.data.find('introvideo'), function() {
            _awareness.introPager();
        });
    },

    introPager: function() {
        _shell.jiraLocation('intro');
        this.pager = new Pager(this.data.find('intropager'), this.root);
        this.pager.attach($('.mainColumn'));
        this.pager.setButtonText(this.data.find('buttons next').text());
        this.pager.addEventListener('Complete', function() {
            TweenMax.to(_awareness.pager, 0.3, {
                autoAlpha: 0,
                onComplete: function() {
                    _awareness.pager.remove();
                    _awareness.pager = null;
                    // _awareness.startInteraction();
                    // _awareness.showReflection();
                    _awareness.buildExamples();
                }
            });
        })
    },

    startInteraction: function() {
        _shell.jiraLocation('Interaction');
        this.scenarios = [];
        this.missedscenarios = [];
        this.toberemoved = [];
        this.data.find('chooser choice').each(function() {
            _awareness.scenarios.push(this);
            _awareness.missedscenarios.push(this);
        });
        this.scenarioIndex = -1;
        this.lengthtogo = this.scenarios.length;
        this.selections = [];
        this.nextScenario();
        TweenMax.to('.scenario', 0.3, { autoAlpha: 1 });
    },

    startInteraction2: function(leftover,selectthese) {
        _shell.jiraLocation('Interaction');
        this.scenarios = [];
        this.missedscenarios = [];
        this.toberemoved = [];
        for(var i in leftover){
            _awareness.scenarios[i] = leftover[i];
            _awareness.missedscenarios[i] = leftover[i];
        }
        this.scenarioIndex = -1;
        this.selections = [];

        for(var i in selectthese){
            _awareness.selections[i] = selectthese[i];
        }

        this.lengthtogo = this.scenarios.length;
        this.nextScenario();
        TweenMax.to('.scenario', 0.3, { autoAlpha: 1 });
    },

    nextScenario: function() {
        this.scenarioIndex++;

        // console.log("ScenarioIndex:" + this.scenarioIndex + " | Scenarios Length: " + this.scenarios.length + " | Selections Length: " + this.selections.length + " | Scenarios MY Length: " + this.lengthtogo);
        // console.log("One:" + this.scenarios);
        // console.log("Two:" + this.missedscenarios);
        if (this.scenarioIndex == this.lengthtogo) {
            if (this.selections.length != this.lengthtogo) {

                for(var i in this.toberemoved){
                    if (this.toberemoved[(this.toberemoved.length - i)-1] > -1) {
                      this.missedscenarios.splice(this.toberemoved[(this.toberemoved.length - i)-1], 1);
                    }
                }

                if( this.missedscenarios.length==0){

                    this.showFeedback();
                    TweenMax.to('.timer', 0.3, { y: 20, alpha: 0 });
                }else{
                    _awareness.startInteraction2(this.missedscenarios,this.selections);
                }
                
                // _shell.popup('<p>' + this.data.find('whoops head').text() + '</p>' + this.data.find('whoops body').text(), this.data.find('buttons tryagain').text(), function() {
                //     _awareness.startInteraction();
                // });


            } else {
                this.showFeedback();
                TweenMax.to('.timer', 0.3, { y: 20, alpha: 0 });
            }
        } else {
            _shell.jiraItem('Scenario ' + (this.scenarioIndex + 1));
            this.scenData = $(this.scenarios[this.scenarioIndex]);
            $('.scenario .label').html(this.scenData.find('question').text());
            $('.scenario .pre-inst').html(this.data.find('chooser preinst').text());
			$('.scenario .pre-inst').css('top', 268);
            $('.scenario .inst').html(this.data.find('chooser inst').text());
            this.scenData.find('person').each(function(i) {
                var rawimagename = $(this).text();
                var personImg = $('<img class="person" src="' + _awareness.root + 'img/' + $(this).text() + '" />');
                personImg.attr('index', i)
                    .click(function() {
                        _awareness.pickImage(this,rawimagename);
                    });
                $('.scenario .people').append(personImg);

            });
            this.scenTimer = Number(this.data.find('chooser timer').text());
            this.updateTimer();
            _awareness.timerStarted = false;
            $('.scenario .start').html(this.data.find('buttons start').text())
                .unbind().click(function() {
                    // console.log('start click');
                    if(!_awareness.timerStarted){
                        // console.log('timer start ok');
                        _awareness.timerStarted = true;
                        TweenMax.to(this, 0.3, { y: -30, autoAlpha: 0 });
                        TweenMax.to('.scenario .label', 0.3, { 'margin-top': 0 });
                        TweenMax.to('.scenario .pre-inst', 0.3, { y: -25, autoAlpha: 0 });
                        TweenMax.fromTo('.scenario .inst', 0.3,
                            { y: 0, autoAlpha: 0 },
                            { y: -100, autoAlpha: 1 }
                        );

                        $('.scenario .person').each(function(i) {
                            TweenMax.fromTo(this, 0.3,
                                { y: 30, autoAlpha: 0 },
                                { y: 0, autoAlpha: 1, delay: 0.1 * (i + 1) }
                            );
                        });

                        _awareness.startTimer();
                    }
                });

            TweenMax.set('.scenario .inst, .scenario .person', { autoAlpha: 0 });
            TweenMax.fromTo('.scenario .pre-inst', 0.6,
                { y: 60, autoAlpha: 0 },
                { y: 0, autoAlpha: 1 }
            );
            TweenMax.fromTo('.scenario .label', 0.6,
                { y: 60, alpha: 0 },
                { y: 0, alpha: 1 }
            );
            TweenMax.fromTo('.scenario .start', 0.5,
                { y: 60, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, delay: 0.2 }
            );
        }
    },

    startTimer: function() {
        // console.log('startTimer');
        clearInterval(this.ticker);
        this.ticker = setInterval(function() {
            _awareness.scenTimer--;
            _awareness.updateTimer();
        }, 1000);
    },

    updateTimer: function() {
        TweenMax.to('.scenario .timer', 0.1, {
            y: 30,
            alpha: 0,
            onComplete: function() {
                var display = String(_awareness.scenTimer);
                if (display.length == 1) {
                    display = "0" + display;
                }
                display = ':' + display;
                $('.scenario .timer').html(display);
                TweenMax.fromTo('.scenario .timer', 0.1,
                    { y: -30, alpha: 0 },
                    { y: 0, alpha: 0.15 }
                );
                if (_awareness.scenTimer == 0) {
                    if (_awareness.scenarioIndex < 2) {
                        _awareness.scenarios.push(_awareness.scenData);
                    }
                    _awareness.endScenario();
                }
            }
        });
    },

    pickImage: function(img,imgname) {
        var mapthis = "";
        var matches = this.scenData.find('matches').text(); //rob
        //var selected = imgname; //rob
        var selectedletter = imgname.charAt(imgname.length-5); //rob
        if(selectedletter == matches){
            mapthis = "model"; //rob
        }else{
            mapthis = "struggling"; //rob
        }
        this.toberemoved.push(this.scenarioIndex)

        
        this.selections.push({
            'label': this.scenData.find('label').text(),
            'choice': $(img).attr('src'),
            'mapping': mapthis
        });
        $('.scenario .person').unbind();
        this.endScenario();
    },

    endScenario: function() {
        clearInterval(this.ticker);
        TweenMax.to('.scenario .label', 0.2, { y: -30, alpha: 0 });
        TweenMax.to('.scenario .inst', 0.2, { y: -130, alpha: 0, delay: 0.05 });
        TweenMax.to('.scenario .person', 0.2, { y: -30, alpha: 0, delay: 0.1,
            onComplete: function() {
                $('.scenario .person').remove();
                TweenMax.set('.scenario .label', { 'margin-top': 60 });
                _awareness.nextScenario();
            }
        });
    },

    showFeedback: function() {
        if(this.feedbackSeen == undefined){
            this.feedbackSeen = true;
            _shell.jiraLocation('Transition');
            this.pager = new Pager(this.data.find('feedback'), this.data.find('contentRoot').text());
            this.pager.attach($('.mainColumn'));
            this.pager.setButtonText(this.data.find('buttons next').text());
            this.pager.addEventListener('Complete', function() {
                TweenMax.to(_awareness.pager, 0.3, {
                    autoAlpha: 0,
                    onComplete: function() {
                        _awareness.pager.remove();
                        _awareness.pager = null;
                        _awareness.feedbackGrid();
                    }
                });
            })
        }
    },

    feedbackGrid: function() {
        _shell.jiraLocation('Grid');
        TweenMax.set('.btn.next', { autoAlpha: 0 });
        TweenMax.set('.personLabel', { autoAlpha: 0 });
        TweenMax.to('.grid', 0.3, { autoAlpha: 1 });
        $('.grid .title').html(this.data.find('grid title').text());
        $('.grid .prompt').html(this.data.find('grid prompt').text());
        $('.grid .model .label').html(this.data.find('grid model').text());
        $('.grid .struggling .label').html(this.data.find('grid struggling').text());
        $('.grid .btn.labels').html(this.data.find('buttons showLabels').text())
            .click(function() {
                _awareness.showLabels();
            });
        $('.grid .btn.next').html(this.data.find('buttons next').text())
            .click(function() {
                _awareness.endGrid();
            })
        $('.grid .slot').addClass('empty');

        for (var i = 0; i < this.selections.length; i++) {

            var availSlots = $('.grid .column.' + this.selections[i].mapping + ' .empty');
            var tgt = availSlots[Math.floor(Math.random() * availSlots.length)];
            $(tgt).css({
                    'background-image': "url('" + this.selections[i].choice + "')",
                    'background-position': 'center -11px',
                    'background-size': '115px auto'
                })
                .removeClass('empty')
                .append('<div class="personLabel">' + this.selections[i].label + '</div>');
            /*
            TweenMax.from(tgt, 0.5, {rotation:Math.random()*20-10, alpha:0, scale:1.3, delay:i*0.15});
            */
        }
        TweenMax.set('.personLabel', { autoAlpha: 0 });
    },

    showLabels: function() {
        TweenMax.to('.grid .prompt', 0.3, {
            autoAlpha: 0
        });
        _shell.jiraItem('Labels');

        TweenMax.set('.personLabel', { autoAlpha: 1 });
        $('.grid .personLabel').each(function() {
            TweenMax.to(this, 0.3, {
                'bottom': 0,
                delay: Math.random() * 0.2
            });
        })
        TweenMax.to('.btn.labels', 0.3, {
            autoAlpha: 0
        });
        TweenMax.to('.btn.next', 0.3, {
            autoAlpha: 1
        });
    },

    endGrid: function() {
        TweenMax.to('.grid', 0.3, {
            autoAlpha: 0
        });
        this.buildExamples();
    },
    buildExamples: function () {
        document.getElementById("workplace_stereotypes").hidden = false;
        document.getElementsByClassName("grid").hidden = true;
        console.log("building examples");
        var examples = new ClickReveal(this.data.find('examples'));
        examples.attach($('.examples-container'));
        examples.init();
        // console.log("building examples initialized");
        examples.addEventListener('Complete', function() {
            TweenMax.to('.examples-container, .examples-feedback', 0.3, {
                autoAlpha: 0,
                onComplete: function() {
                    console.log("Clicked NEXT");
                    _awareness.showReflection();
                }
            });
        });
    },

    showReflection: function() {
        TweenMax.to('.workplace_stereotypes', 0.3, {
            autoAlpha: 0
        });
        _shell.jiraLocation('Reflection');
        this.pager = new Pager(this.data.find('reflections'), this.data.find('contentRoot').text());
        this.pager.attach($('.mainColumn'));
        this.pager.setButtonText(this.data.find('buttons next').text());
        this.pager.addEventListener('Complete', function() {
            _shell.sectionComplete();
            _shell.nextSection();
        });
    }
};

_awareness = new Awareness();

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
