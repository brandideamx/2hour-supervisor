
var Menu = (function() {
    this.xml;
    this.menuIndex = 0;
    this.unlocked = false;
    this.unlockNext = false;
    this.courseComplete = true;
    this.requiredTime = 7200;
    this.poll = this.pollForContent();
});

Menu.prototype = {
    pollForContent: function() {
        return setInterval(this.pollCheck, 500);
    },
    pollCheck: function() {
        if (typeof _shell !== 'undefined' && _shell !== undefined) {
            clearInterval(_Menu.poll);
            if (typeof _loadedData !== 'undefined' && _loadedData !== undefined) {
                console.log('| _loadedData is set');
                _Menu.config(_loadedData);
            } else {
                console.log('| Trying again...');
                _shell.tryGetData(function(data) {
                    _Menu.config(data);
                });
            }
        }
    },
    evalTime: function(rollover){
        if(_Menu.requiredTime >  _shell.currentTime){
            return false;
        }
        if(rollover){

        }
          
    },
    config: function(xml) {
        _shell.hideLoader();
        this.requiredTime = (checkUrlParam('noTimeLimit') == 'true') ? 0 : _shell.courseCompleteTimeLimit
        this.xml = $(xml);
        this.div = $('.menuList');

        // Testing data
        if (checkUrlParam('setLimit')) {
            _shell.courseCompleteTimeLimit = getQueryVariable('setLimit');
        }
        //

        // Fill content from XML
        this.fillContent(function() {

            // Close event for initial popup
            $('.initial-popup').find('.nextpop').on('click', function(ev) {
                _shell.setMenuViewed(true);
                TweenMax.to('.initial-popup', 0.75, { autoAlpha: 0, ease: Quad.easeIn });
                TweenMax.to('.dark-overlay', 1.25, { autoAlpha: 0 });

                // This should just be for testing
                if (checkUrlParam('showFinalPopup')) {
                    // console.log('Testing...showFinalPopup');
                    if (getQueryVariable('showFinalPopup') == 'true') {
                        _Menu.div.find('.item').each(function(i,e) {
                            $(e).addClass('complete');
                        });
                        _Menu.checkCompletionStatus();
                    }
                }
            });
        });

        // Check if initial popup should be seen
        if (!_shell.getMenuViewedStatus()) {
            TweenMax.to('.initial-popup', 0.75, { autoAlpha: 1 });
            TweenMax.to('.dark-overlay', 0.75, { autoAlpha: 1 });
        }

        // Loop through course nodes and build the nav
        this.loopThroughMenuItems(this.xml.find('courses course'));

        // Check to see if instructions need to change
        if (_Menu.div.find('.item.complete').length > 0)
            $('.inst').html(this.xml.find('menu instructions modified').text());

        // Unlock next course
        var completed = $('.item.complete'),
        lastComplete = $(completed[completed.length-1]);
        lastComplete.next().addClass('unlocked');

        _Menu.checkCompletionStatus();
    },
    checkCompletionStatus: function() {
        if (_Menu.div.find('.item.complete').length === _Menu.div.find('.item').length) {
            // Check the time limit
            console.log('Required TIME: ' +  _Menu.requiredTime + " | " + _shell.currentTime);
            if (_shell.currentTime >= _Menu.requiredTime) {
             
                _Menu.showFinalContent(true, _shell.viewedAcknowledge, function() {
                    
                    TweenMax.to('.conclusion', 0.3, { autoAlpha: 1 });
                });
            } else {
               
                _Menu.showFinalContent(false, _shell.viewedAcknowledge, function() {});
            }
        }
    },
    showFinalContent: function(fullTime, acknowledgementViewed, callback) {
        callback = callback || function() {};
        if (acknowledgementViewed) {
            _Menu.finalContentTimeWarningCheck(fullTime, callback);
            if (_shell.currentTime >= _Menu.requiredTime) {
                TweenMax.to('.conclusion', 0.3, { autoAlpha: 1 });
            }
        } else {
            _Menu.showAcknowledgePager(function() {
                _Menu.finalContentTimeWarningCheck(fullTime, callback);
            });
        }
    },
    finalContentTimeWarningCheck: function(fullTime, callback) {
        if (!_shell.viewedTimeWarning) {
            var txt = (fullTime) 
                ? _Menu.xml.find('menu preconclusion pop1').text() 
                : _Menu.xml.find('menu preconclusion pop2').text();
            
            _shell.popup(txt, _Menu.xml.find('preconclusion button').text(), callback);
            _shell.viewedTimeWarning = true;

            // if (fullTime) _shell.markObjectivesComplete();
        }
    },
    showAcknowledgePager: function(callback) {
        callback = callback || function() {};
        _shell.jiraLocation('Acknowledgement Pager');
        var pgr = new Pager(_Menu.xml.find('acknowledgement'), '../../content/pagers/img/');
        pgr.attach($('body'));
        pgr.setButtonText('NEXT');
        pgr.addEventListener('Complete', function() {
            _shell.viewedAcknowledge = true;
            _shell.markObjectivesComplete();
            pgr.remove();
            callback();
        });
    },
    fillContent: function(callback) {
        $('.headline').html(this.xml.find('menu header').text());
        $('.subhead').html(this.xml.find('menu sub_header').text());
        $('.inst').html(this.xml.find('menu instructions initial').text());

        $('.initial-popup p').html(this.xml.find('menu popup copy').text());
        $('.conclusion .title').html(this.xml.find('conclusion title').text());
        $('.conclusion .copy').html(this.xml.find('conclusion copy').text());

        var menuBtn = $('<div class="btn return" />');
        menuBtn.html(this.xml.find('conclusion button').text())
            // Add action
            .on('click', function(e) {
                TweenMax.to('.conclusion', 0.3, { delay: 0.5, autoAlpha: 0 });
            });
        $('.conclusion .copy').after(menuBtn);

        callback();
    },
    loopThroughMenuItems: function(courses) {
        $.each(courses, function(idx, node) {
            node = $(node);

            if (checkUrlParam('completeAll')) {
                if (getQueryVariable('completeAll') == 'true')
                    _shell.sectionCompleteById(node.attr('id'));
            }

            // Check to see if course should be visible in the menu
            if (node.attr('menu') == 'true') {

                // Update the menu index (this is different than
                // the idx that passes through the $.each because
                // it only needs to update if the node is visible)
                _Menu.menuIndex++;

                // Check for the spacer course; this will force the next
                // course element to a new row
                if (node.attr('spacer') == 'true')
                {
                    var link = $('<div class="item locked" style="margin-left: 113px;"/>');
                }else{
                    var link = $('<div class="item locked" />');
                }
                //     _Menu.div.append('<div class="menu_spacer"></div>');

                // Create the new element
                //var link = $('<div class="item locked" />');
                link
                    // Set ID to node ID
                    .attr('id', node.attr('id'))

                    // Add unlocked on first course always
                    .addClass(function() {
                        if (node.attr('id') == 1) return 'unlocked';
                    })

                    // Check if course is already complete
                    .addClass(function() {
                        var newClass;
                        if (_shell.isSectionComplete(node.attr('id'))) {
                            _Menu.courseComplete = true;
                            _Menu.unlockNext = true;
                            newClass = 'complete';
                        } else {
                            _Menu.courseComplete = false;
                            _Menu.unlockNext = false;
                            newClass = '';
                        }
                        return newClass;
                    })

                    // When clicked it should load that course
                    .on('click', function(ev) {
                        if (link.hasClass('unlocked'))
                            _shell.gotoSection(link.attr('id'));
                    })

                    // Add the inner HTML
                    .html([
                        '<div class="circle">',
                        '   <div class="num">'+ _Menu.menuIndex +'</div>',
                        '</div>',
                        '<div class="text">'+ node.find('label').text() +'</text>'
                    ].join(''));

                // Append to the main div
                _Menu.div.append(link);

                // Extras
                // Check if the course should be unlocked
                var MANUAL_UNLOCK = makeBool(_Menu.xml.find('unlocked').text());
                if (_Menu.courseComplete || MANUAL_UNLOCK)
                    link.addClass('unlocked');

                // This seems redundant
                if (_Menu.unlocked) link.addClass('unlocked').removeClass('locked');
            }
        });
    }
};

var _Menu = new Menu();
