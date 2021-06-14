
var Gender = (function(params) {

  var app;
  var Constructor = function(params) {
    // this.poll = this.pollForContent();
    app = this;
    app.data = params.xml; // xml
    app.currentScenario;
    app.completedScenarios = [];
    app.onComplete = params.onComplete;

    app.initializePage(app.data);
  }


  Constructor.prototype = {
    // pollForContent() {
    //     return setInterval(this.pollCheck, 500);
    // },

    // pollCheck() {
    //     if (_shell != undefined) {
    //         clearInterval(app.poll);
    //         app.initializePage(_loadedData);
    //     }
    // },

    config: function(data) {
        this.data = $(data);
        this.root = this.data.find('gender_contentRoot').text();
        $('.mainLabel').html(this.data.find('mainLabel').text());
        $('.title').html(this.data.find('title').text());
        $('.copy').html(this.data.find('copy').text());
    },

    initializePage: function(data) {
        app.config(data);
        app.buildPage();

        // check for section data
        var myData = _shell.getSectionData();
        if(myData && myData.length > 0){
            for(var i=0; i < myData.length; i++){
                if(myData[i].complete == 'Y'){
                    app.completedScenarios.push(myData[i].id);
                }
            }
        }
    },

    buildPage: function() {
        app.buildIntroPopup(this.data.find('introPopup'));
    },

    buildIntroPopup: function(introData) {
      this.introPager = new Pager(this.data.find('intro'), this.data.find('gender_contentRoot').text());
      this.introPager.attach($('body'));
      this.introPager.setButtonText(this.data.find('buttons next').text());
      //this.introPager.setTryAgainText(this.data.find('buttons tryagain').text());
      this.introPager.addEventListener('Complete', function(){
          $('#nextbtn').html(app.data.find('buttons next').text())
          TweenMax.to('#stripe', 0.3, {autoAlpha:1});
          app.buildMenu(app.data.find('menu'));
          // _harassment.introPager.remove();
      })
    },

    buildMenu: function(menuData) {
        app.sectionData = [];
        $('.people').empty();
        menuData.find('person').each(function(i){
            var p = $('<div class="person"></div>');
            p.append('<div class="check"></div>');
           /* if (_shell.isSectionComplete($(this).find('sectionID').text())) {
                p.addClass('complete');
            }*/
            var sectionID = $(this).find('sectionID').text()
            p.attr('id', sectionID)
                .append('<img src="' + app.root + $(this).find('thumb').text() +  '" />')
                .append('<div class="label">' + $(this).find('label').text() + '</div>')
                .click(function(){
                    app.hideMenu();
                    app.currentScenario = sectionID;
                    app.buildScenario(app.data.find(sectionID)) // pass person's ID to buildScenario function
                });
            for (var scenario in app.completedScenarios) {
                if (app.completedScenarios[scenario] == sectionID) {
                    p.addClass('complete');
                    app.sectionData.push({'id':sectionID, 'complete':'Y'});
                }
            }
            if(app.completedScenarios.indexOf(sectionID) < 0){
                app.sectionData.push({'id':sectionID, 'complete':'N'});
            }

            // track completion of the videos
            // if(_shell.getSectionData()){
            //     var mydata = _shell.getSectionData();
            //     if(mydata[i].complete == 'Y'){
            //         p.addClass('complete');
            //     }
            // }else{
            //     app.sectionData.push({'id':sectionID, 'complete':'N'});
            // }
            // if(app.completedScenarios.length < 1){
            //     app.sectionData.push({'id':sectionID, 'complete':'N'});
            // }

            $('.people').append(p);
        });
        _shell.setSectionData(app.sectionData);

        if ($('.person.complete').length == $('.person').length) {
            $('.next').removeClass('disabled');
        }
        $('#menu').removeClass('hideMe');
        $('.next').html(this.data.find('buttons next')
            .text())
            .removeClass('hidden')
            .click(function(){
                if(!$(this).hasClass('disabled')){
                    $('.next').unbind('click').bind('click', function() {
                        // _shell.activityComplete();
                        // _shell.nextSection();
                        app.onComplete();
                    });
                }
            })
    },

    hideMenu: function() {
        $('#menu').addClass('hideMe');
    },

    buildScenario: function(scenarioData) {
        var app =  this;
        var currentScene = 'scene1'
        var currentSceneIndex = 1;
        var currentVideo = '1A';
        var disabledAnswers = []; // array of IDs
        $('#scenario').addClass('scenario'+scenarioData.find('index').text());
        //$('.phase').append('<div class="gender-overlay"></div>');

        var toggleTranscriptBtn = function(show) {
            if (show) {
                TweenMax.fromTo('.infoTab.transcript', 1, { x: -200, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: Cubic.easeOut });
            } else {
                TweenMax.fromTo('.infoTab.transcript', 1, { x: 0, autoAlpha: 1 }, { x: -200, autoAlpha: 0, ease: Cubic.easeIn });
            }
        }

        var showVideo = function(callback) {
            $('.videoContainer').removeClass('offScreen');
            $('#scenario').removeClass('scenario'+scenarioData.find('index').text());
            $('.gender-overlay').remove();
            var player = new VideoPlayer(app.root+'/vid/'+app.currentScenario+'/'+currentVideo+'.mp4', 700, 400);
            player.attach('.videoContainer');
            player.volume(this.convoVolume);
            // console.log(app.currentScenario)
            // console.log(currentSceneIndex)
            if (callback != undefined && (currentSceneIndex != 4 && !(currentSceneIndex == 3 && app.currentScenario == 'scenario3'))) {
                player.onEnd = callback;
            } else if (currentSceneIndex == 4 || (currentSceneIndex == 3 && app.currentScenario == 'scenario3')) {
                player.onEnd = showFinalPopup;
            }

            $('.infoTab.transcript').on('click', function(e) {
                // _shell.popupStyled(scenarioData.find('transcript').text());
                var params = {
                    styles: ''
                };
                _shell.popupStyledCustom(scenarioData.find('transcript scene'+ currentVideo).text(), function() {}, params);
            })
            toggleTranscriptBtn(true);
        }

        var hideVideo = function() {
            $('.videoContainer').addClass('offScreen');
             $('.video').remove();
             $('#scenario').addClass('scenario'+scenarioData.find('index').text());
             $('.phase').append('<div class="gender-overlay"></div>');
             toggleTranscriptBtn(false);
        }

        var showMultipleChoice = function() {
            // console.log(currentScene)
            var sceneData = scenarioData.find('multichoice ' + currentScene);
            $.each(sceneData.find('option'), function(i, el) {
                var choice = $(el);
                var opt = $('<div class="option" />')
                opt
                    .attr('index', i)
                    .html(choice.find('text').text())
                    .mouseover(function() { opt.addClass('hover') })
                    .mouseout(function() { opt.removeClass('hover') })
                    .on('click', function() {
                        selectOption(el, choice);
                    });
                $('.options').append(opt);
                for (var int in disabledAnswers) {
                    if (disabledAnswers[int] == i) {
                        opt.addClass('disabled');
                    }
                }
            });

            var coachContainer = $('.coachContainer');
            coachContainer.attr('id', 'coach'+scenarioData.find('index').text());
            // var coach = $('<img src="'+app.root+'img/'+sceneData.find('coach').text()+'" class="coach" />');
            var coach = new VideoPlayer(app.root+'/vid/'+app.currentScenario+'/loop.mp4', 460);
            coach.setParams([{
                name: 'loop',
                value: true
            }, {
                name: 'controls',
                value: false
            }])
            coach.attach(coachContainer);
            coach.play();
            var speechBubble = $('<div class="speechBubble"></div>');
            speechBubble.append($('<p class="speechText">'+sceneData.find('speechBubble').text()+'</p>'));
            speechBubble.append($('<img src="'+app.root+'img/speechBubble.png" class="bubbleImg" />'));
            coachContainer.append(coach);
            coachContainer.append(speechBubble);

            $('.instructions')
                .html(scenarioData.find('instructions').text())
                .removeClass('offScreen');

            coachContainer.removeClass('offScreen');
            $('.options').removeClass('offScreen');
        }

        var hideMultipleChoice = function() {
            $('.options').addClass('offScreen');
            $('.coachContainer')
                .addClass('offScreen')
                .empty();

                $('.instructions').addClass('offScreen');
        }

        var selectOption = function(option, el) {
            if (option.getAttribute('correct') == 'true') {
                currentSceneIndex++;
                currentScene = 'scene' + currentSceneIndex;
                currentVideo = option.getAttribute('goTo');
                hideMultipleChoice();
                $('.options').empty();
                disabledAnswers = [];
                showVideo(
                    function() {
                        hideVideo();
                        showMultipleChoice();
                    }
                );
            } else {
                disabledAnswers.push(option.getAttribute('id'));
                currentVideo = option.getAttribute('goTo');
                hideMultipleChoice();
                $('.options').empty();
                showVideo(
                    function() {
                        showIncorrectFeedback(option, el);
                    }
                );
            }
        }
        var showIncorrectFeedback = function(option, el) {
            // _shell.popup(
            //     el.find('feedback').text(),
            //     app.data.find('buttons next').text(),
            //     function() {
            //         hideVideo();
            //         showMultipleChoice();
            //     }
            // );
            var feedbackContainer = $('<div class="feedback-container" />');
            feedbackContainer.html([
                '<div class="fc-content">',
                '   '+ el.find('feedback').text(),
                '   <div class="fc-btns">',
                '       <button class="btn next">'+ app.data.find('buttons next').text() +'</button>',
                '   </div>',
                '</div>'
            ].join(''));
            $('#scenario').append(feedbackContainer);

            var tl = new TimelineMax();
            tl.to('.videoContainer, .video, video', 1, { width: 510, height: 287, ease: Cubic.easeInOut })
                .to('.videoContainer', 0.5, { left: 230, top: 30, ease: Cubic.easeOut }, '-=0.5')
                .fromTo('.feedback-container', 1, { y: 1000, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: Cubic.easeOut }, '-=0.5');

            $('.fc-btns .next').off('click').on('click', function(e)  {
                hideVideo();
                TweenMax.set('.videoContainer, .video, video', { width: 700, height: 400 })
                TweenMax.set('.videoContainer', { left: 150, top: 150 })

                TweenMax.to('.feedback-container', 1, { y: 1000, autoAlpha: 0, onComplete: function() {
                    $('.feedback-container').remove();
                    showMultipleChoice();
                }})
            });


        }
        var showFinalPopup = function() {
            // _shell.popup(
            //     scenarioData.find('finalPopupText').text(),
            //     app.data.find('buttons done').text(),
            //     function() {
            //         $('.videoContainer').addClass('offScreen');
            //         $('.video').remove();
            //         app.completedScenarios.push(app.currentScenario)
            //         app.hideScenario();
            //         app.buildMenu(app.data.find('menu'));
            //     }

            // )

            var feedbackContainer = $('<div class="feedback-container" />');
            feedbackContainer.html([
                '<div class="fc-content">',
                '   '+ scenarioData.find('finalPopupText').text(),
                '   <div class="fc-btns">',
                '       <button class="btn next">'+ app.data.find('buttons done').text() +'</button>',
                '   </div>',
                '</div>'
            ].join(''));
            $('#scenario').append(feedbackContainer);

            var tl = new TimelineMax();
            tl.to('.videoContainer, .video, video', 1, { width: 510, height: 287, ease: Cubic.easeInOut })
                .to('.videoContainer', 0.5, { left: 230, top: 30, ease: Cubic.easeOut }, '-=0.5')
                .fromTo('.feedback-container', 1, { y: 1000, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: Cubic.easeOut }, '-=0.5');

            $('.fc-btns .next').off('click').on('click', function(e)  {
                hideVideo();
                TweenMax.set('.videoContainer, .video, video', { width: 700, height: 400 })
                TweenMax.set('.videoContainer', { left: 150, top: 150 })

                TweenMax.to('.feedback-container', 1, { y: 1000, autoAlpha: 0, onComplete: function() {
                    $('.feedback-container').remove();
                    $('.videoContainer').addClass('offScreen');
                    $('.video').remove();
                    app.completedScenarios.push(app.currentScenario)
                    app.hideScenario();
                    app.buildMenu(app.data.find('menu'));
                }})
            });
        }

        _shell.closePopup();
        var p = $('<div id="popup"></div>');
        p.append('<div class="overlay"></div>');

        var textBox = $('<div class="textbox"></div>');
        textBox.append(scenarioData.find('initialPopup').text());

        var button = $('<div class="btn close">' + this.data.find('buttons next').text() + '</div>');
        textBox.append(button);
        textBox.append('<div style="clear:both"></div>');
        p.append(textBox);
        $('.phase').append(p);
        textBox.css('top', (600-textBox.height())/2);
        button.click(function(){
            $('#popup').empty();
            $('#popup').remove();
            $('.coachContainer').empty();
            $('.coachContainer').addClass('offScreen').removeClass('intro-coach');
            showVideo(function() {
                hideVideo();
                showMultipleChoice();
            });
        });

        TweenMax.to(p, 0.5, {'alpha':1});

        var coachContainer = $('.coachContainer');
        coachContainer.attr('id', 'coach'+scenarioData.find('index').text());

        var coach = $('<img src="'+app.root+'img/'+this.data.find(this.currentScenario + ' coach-img').text()+'" class="coach" />');
        // var coach = new VideoPlayer(app.root+'/vid/'+app.currentScenario+'/loop.mp4', 460);
        // coach.setParams([{
        //     name: 'loop',
        //     value: true
        // }, {
        //     name: 'controls',
        //     value: false
        // }])
        // coach.attach(coachContainer);
        // coach.play();
        var speechBubble = $('<div class="speechBubble"></div>');
        speechBubble.append($('<p class="speechText">'+this.data.find(this.currentScenario + ' coachIntro').text()+'</p>'));
        // console.log(this.currentScenario)
        speechBubble.append($('<img src="'+app.root+'img/speechBubble.png" class="bubbleImg" />'));
        coachContainer.append(coach);
        coachContainer.append(speechBubble);
        coachContainer.addClass('intro-coach')
        coachContainer.removeClass('offScreen');

        TweenMax.to(coachContainer, 0.5, {'alpha':1});

        //$('.options').removeClass('offScreen');
        $('#scenario').removeClass('hideMe');

    },
    hideScenario: function() {
        $('#scenario').addClass('hideMe');
        $('.gender-overlay').remove();
        //$('#scenario').removeClass('scenario'+scenarioData.find('index').text());
    }
  }

  return Constructor;
})();

