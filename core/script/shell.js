function Shell() {
    this.appData = null;
    this.courses = [];
    this.menu; // Menu
    this.layers = {};
    this.getConfig();
    this.currentModel; // window
    this.currentSection; // object
    this.audio; // audioPlayer
    this.bookmark = null;
    this.events = {};
    this.menuSeen = false;
    this.courseCompleteTimeLimit = 7200;
    this.currentTime;
    this.quizComplete = 0;
    this.counter = 0;


    this.userSelection = {
        newyork: false,
        illinois: false,
        stateLivedIn: '',
        statesManaged: []
    };
}
Shell.prototype.addEventListener = function(evt, fn) {
    this.events[evt] = fn;
}
Shell.prototype.dispatchEvent = function(evt) {
    // console.log('dispatching ' + evt);
    this.events[evt]();
}

Shell.prototype.getConfig = function() {
    $.get('app.xml', function(data) {
        _shell.configureApp(data);
    });
}
Shell.prototype.configureApp = function(data) {
    this.appData = data;
    this.audio = new AudioPlayer();
    //this.setJira($(data).find('jira'));
    this.setTracking($(data).find('tracking'));
    this.setCourses($(data).find('courses'));
    this.setLayout($(data).find('layout'));

    if ($(data).find('preload').length > 0) {
        $(document).ready(function() {
            var _assetLoader = new AssetLoader($(data).find('preload').text());
        });
    }

    window.addEventListener('keydown', function(e) {
        if (e.altKey && e.key == 'q') {
            $('body').addClass('qa-status');
            var __QA = new QA();
            __QA.init();
        }
    })

    this.maximizeWindow();
}
Shell.prototype.markObjectivesComplete = function() {
    var objectiveCount = _shell.tracking.LMS.getValue('cmi.objectives._count');
    for (var i = 0; i < objectiveCount; i++) {
        _shell.tracking.LMS.setValue('cmi.objectives.'+ i +'.status', 'completed')
    }
}
Shell.prototype.showLoader = function() {
    $('.cssload-container').show();
}
Shell.prototype.hideLoader = function() {
    $('.cssload-container').hide();
}
Shell.prototype.setJira = function(data) {
    if (queryParams.qa == 'true') {
        $.getScript($(data).find('script').text(), function() {
            // setTimeout(function() {
            //     setJiraSCO($(data).find('scolabel').text());
            // }, 10);
        });
    }
}

function timeup() {
    console.log( _shell.courseCompleteTimeLimit, 'timeup')
    
    _shell.counter++;
    if(_shell.counter == 5)
    {
        _shell.currentTime = _shell.currentTime + 1800;
        var m = moment.duration(_shell.currentTime, 'seconds');
        $('.global-timer').html(leadZero(m._data.hours) +':'+ leadZero(m._data.minutes) +':'+ leadZero(m._data.seconds));

        
         _shell.tracking.saveToSuspendData({
             course_time: _shell.currentTime
         });

        if (_shell.currentTime >= _shell.courseCompleteTimeLimit) {
            TweenMax.to('.global-timer', 0.5, { backgroundColor: 'rgba(140,198,63,0.9)' });
            // _shell.tracking.lesson_score = 100;

            _shell.tracking.checkLessonComplete();
            LMS.prototype.scormComplete();
            // alert("Hooray 2 min are up!!!!. Check if it worked!");
        }
        _shell.counter = 0;
    }


}

Shell.prototype.setSectionData = function(str){
    for(var i=0; i < this.tracking.courseSections.length; i++){
        if(this.tracking.courseSections[i].id == this.currentSection.id){
            this.tracking.courseSections[i].data = str;
        }
    }
    _shell.tracking.saveToSuspendData({
        courses: this.tracking.courseSections
    });
}
Shell.prototype.getSectionData = function(){
    for(var i=0; i < this.tracking.courseSections.length; i++){
        if(this.tracking.courseSections[i].id == this.currentSection.id){
            if(this.tracking.courseSections[i].data != undefined){
                return this.tracking.courseSections[i].data;
            }else{
                return false;
            }
        }
    }
}

Shell.prototype.setTracking = function(data) {
    this.tracking = new Tracking(data.find('type').text(), function() {
        // if (isIpad()) {
        //     var getter = '../common/models/ipadPrompt/prompt.html';
        //     if ($(_shell.appData).find('hasAudio').text() == 'false') {
        //         getter = '../common/models/ipadPrompt/prompt-noaudio.html';
        //     }
        //     $.get(getter, function(data) {
        //         $('#container').append(data);
        //         $('.ipadAudioPrompt .next').click(function() {
        //             $('.ipadAudioPrompt').remove();
        //             _shell.audio.resume();
        //         })
        //     });
        // }

        var suspendData = _shell.tracking.getSuspendData();
          _shell.currentTime = 0;
        var timer = 0;

        if (suspendData != null && suspendData !== undefined) {
            if (suspendData.course_time != null)  _shell.currentTime = suspendData.course_time;
        }

        console.log('In SET TRACKING...');
        console.log('Selected State: ', _shell.tracking.selectedState, _shell.userSelection.stateLivedIn);
        console.log('Selected State: ', _shell.tracking.selectedManagedStates, _shell.userSelection.statesManaged);
        console.log('Selected State: ', _shell.tracking.selectedNewYork, _shell.userSelection.newyork);
        console.log('Selected State: ', _shell.tracking.selectedIllinois, _shell.userSelection.illinois);

        if (_shell.tracking.selectedState !== '' && _shell.tracking.selectedState !== undefined) {
            _shell.userSelection.stateLivedIn = (_shell.tracking.selectedState.indexOf('show-') > -1) ? _shell.tracking.selectedState : 'show-'+ _shell.tracking.selectedState;
        }

        if (_shell.tracking.selectedManagedStates != null && _shell.tracking.selectedManagedStates !== undefined && _shell.tracking.selectedManagedStates.length > 0) {
            _shell.userSelection.statesManaged = _shell.tracking.selectedManagedStates;
        }

        if (_shell.tracking.selectedNewYork !== undefined) {
            _shell.userSelection.newyork = _shell.tracking.selectedNewYork;
        }

        if (_shell.tracking.selectedIllinois !== undefined) {
            _shell.userSelection.illinois = _shell.tracking.selectedIllinois;
        }

        setInterval(function() {
            _shell.currentTime++;
            var m = moment.duration(_shell.currentTime, 'seconds');
            $('.global-timer').html(leadZero(m._data.hours) +':'+ leadZero(m._data.minutes) +':'+ leadZero(m._data.seconds));

            _shell.tracking.saveToSuspendData({
                course_time: _shell.currentTime
            });


            if (_shell.currentTime >= _shell.courseCompleteTimeLimit) {
                TweenMax.to('.global-timer', 0.5, { backgroundColor: 'rgba(140,198,63,0.9)' });
                //_shell.tracking.lesson_score = 100;
                _shell.tracking.checkLessonComplete();
                // _shell.markObjectivesComplete();
                LMS.prototype.scormComplete();
                //alert("Hooray 2 min are up!!!!. Check if it worked!");
            }


        }, 1000);
        _shell.initialize();

    });
}
Shell.prototype.setCourses = function(data) {
    var courses = data.children();
    for (var i = 0; i < courses.length; i++) {
        var obj = {};
        obj.id = $(courses[i]).attr('id');
        obj.sco = $(courses[i]).find('scolabel').text();
        obj.hideMenu = makeBool($(courses[i]).attr('hideMenu'));
        obj.menu = makeBool($(courses[i]).attr('menu'));
        obj.tracked = makeBool($(courses[i]).attr('tracked'));
        obj.autoload = makeBool($(courses[i]).attr('autoload'));
        obj.label = $(courses[i]).find('label').text();
        obj.template = $(courses[i]).find('template').text();
        obj.data = $(courses[i]).find('data').text();
        this.courses.push(obj);
        if (obj.tracked) {
            this.tracking.addCourseSection(obj.id);
        }
    }
}
Shell.prototype.setLayout = function(data) {
    $('#container').css('width', $(data).attr('appWidth')).css('height', $(data).attr('appHeight'));
    var kids = data.children();
    for (var i = 0; i < kids.length; i++) {
        var layer = null;
        if (kids[i].tagName == 'content') {
            layer = $('<iframe id="shell_content" frameborder="0" allowTransparency="true" name="content" scrolling="no" width="' + $(data).attr('appWidth') + '" height="' + $(data).attr('appHeight') + '" src="about:blank"></iframe>');
            layer.on('load', this.modelLoaded);
        } else if (kids[i].tagName == 'menu') {
            layer = $('<div id="shell_menu"></div>')
            $('head').append('<script language="javascript" src="' + $(kids[i]).find('code').text() + '"></script>');
            /*
            var menuStyles = $(kids[i]).find('css').text();
            if(menuStyles != '' || menuStyles != undefined){
            //	$('head').append('<link href="' + menuStyles + '" rel="stylesheet" type="text/css"></link>');
            }*/
        } else {
            layer = new ShellLayer(kids[i]);
        }
        this.layers[kids[i].tagName] = layer;
        layer.addClass('shell_layer');
        layer.css('left', $(kids[i]).attr('x') + 'px').css('top', $(kids[i]).attr('y') + 'px');
        $('#container').append(layer);
    }
}
Shell.prototype.initialize = function() {
    this.menu = new Menu(this.courses, $(this.appData).find('menu'));

    // for (var i = 0; i < this.courses.length; i++) {
    //     if (getQueryVariable('courseId')) {
    //         if (getQueryVariable('courseId') === this.courses[i].id) {
    //             this.gotoSection(this.courses[i].id, false);
    //         }
    //     } else {
    //         if (this.tracking.bookmarkSection == this.courses[i].id) {
    //             this.bookmark = this.tracking.bookmarkPage;
    //             this.gotoSection(this.courses[i].id, false);
    //         } else if (this.tracking.bookmarkPage == null && this.courses[i].autoload) {
    //             this.gotoSection(this.courses[i].id, false);
    //         }
    //     }
    // }
    for (var i = 0; i < this.courses.length; i++) {
        if (getQueryVariable('courseId')) {
            if (getQueryVariable('courseId') === this.courses[i].id) {
                this.gotoSection(this.courses[i].id, false);
            }
        } else {
            if (this.tracking.bookmarkSection == this.courses[i].id) {
                this.bookmark = this.tracking.bookmarkPage;
                this.gotoSection(this.courses[i].id, false);
            } else if (this.tracking.bookmarkPage == null && this.courses[i].autoload) {
                if (this.tracking.selectedState) {
                    this.gotoSection(0, false);
                } else {
                    this.gotoSection(this.courses[i].id, false);
                }
            }

        }
    }
}
Shell.prototype.toggleMenuLogo = function() {
    //this.menu.toggleLogo();
}
Shell.prototype.loadContent = function(course, backingUp) {
    $('#shell_content').attr('src', 'about:blank');
    var template = course.template;
    if (backingUp) {
        if (template.indexOf('?') == -1) {
            template += '?backwards=true';
        } else {
            template += '&backwards=true';
        }
    }

    $.get(course.data, function(data) {
        $('#shell_content').attr('src', template);
        _shell.tempCourseData = data;
    });
    this.currentSection = course;

    if (this.currentSection.id == 0) {
        $('.logo').fadeOut();
        $('.shell_layer .itemContainer').fadeOut();
    } else {
        $('.logo').fadeIn();
        $('.shell_layer .itemContainer').fadeIn();
    }

    try {
        setJiraFile(course.data);
    } catch (e) {
    }
}
Shell.prototype.tryGetData = function(callback) {
    $.get(this.currentSection.data, function(data) {
        // console.log('|  Retrieved Data:', data);
        if (_shell.currentModel !== undefined) {
            _shell.currentModel._loadedData = data;
            callback(data);
        } else {
            // console.log('|  Current Model is not defined by the shell.');
        }
    })
}
Shell.prototype.modelLoaded = function() {
    _shell.currentModel = window.content;
    if ($('#shell_content').attr('src') != 'about:blank') {
        _shell.currentModel._shell = _shell;
        _shell.currentModel._loadedData = _shell.tempCourseData;
        _shell.currentModel._bookmark = _shell.bookmark;
        _shell.bookmark = null;

        setJiraSCO(_shell.currentSection.sco);

        if (_shell.getQP().stateTest == 'true') {
            _shell.userSelection.stateLivedIn = 'CA';
            _shell.userSelection.statesManaged = ['CA', 'CT', "DE", "IL", "ME", 'NY', "Other"];
        }
        // Frame body
        _shell.addUserSelectionClasses();

    }
}

// ---------------------------------
// USER SELECTION - STATES WORKED IN
// ---------------------------------
Shell.prototype.addUserSelectionClasses = function() {
  // Check if the selection has been set
  if (_shell.userSelection.stateLivedIn !== '') {
      // Get the iframe body tag
      var fbody = $('#shell_content')[0].contentWindow.document.querySelector('body');

      // Add the state the user works/lives in
      fbody.classList.add(_shell.userSelection.stateLivedIn);

      // Add the states they manage
      $.each(_shell.userSelection.statesManaged, function(i,state) {
          fbody.classList.add('show-'+ state);
      })

      // Add New York if they work there some of the time
      if (_shell.userSelection.newyork) fbody.classList.add('show-NY');

      // Add Illinois if they work there some of the time
      if (_shell.userSelection.illinois) fbody.classList.add('show-IL');
  }
}
// --------------------------------

Shell.prototype.gotoSection = function(id, backingUp) {
    _shell.showLoader();

    var course = this.getSectionById(id);
    this.audio.pause();
    this.closePopup();
    this.loadContent(course, backingUp);
    this.menu.setStatus(id);
    this.tracking.setTrackingSection(id);

    if (course.hideMenu) {
        $('#shell_menu').css('display', 'none');
    } else {
        $('#shell_menu').css('display', 'block');
    }

    setJiraSCO(this.courses[this.getIndexById(id)].sco);
}
Shell.prototype.getSectionById = function(id) {
    for (var i = 0; i < this.courses.length; i++) {
        if (this.courses[i].id == id) {
            return this.courses[i];
        }
    }
}
Shell.prototype.getIndexById = function(id) {
    for (var i = 0; i < this.courses.length; i++) {
        if (this.courses[i].id == id) {
            return i;
        }
    }
}
Shell.prototype.isFirstModule = function() {
    if (this.getIndexById(this.currentSection.id) == 0) {
        return true;
    }
    return false;
}
Shell.prototype.isSectionComplete = function(id) {
    var status = this.tracking.getStatusByID(id);
    if (status == 'C') {
        return true;
    } else {
        return false;
    }
}
Shell.prototype.setBookmarkPage = function(txt) {
    this.tracking.bookmarkPage = txt;
    this.tracking.saveBookmark();
}
Shell.prototype.sectionComplete = function() {
    this.activityComplete(); // catch legacy code
}
Shell.prototype.activityComplete = function() {
    // console.log('Shell.activityComplete()', this.currentSection.id);
    this.tracking.finishSection();
    this.tracking.manualSaveToLMS();

    if(this.currentSection.id == 101){
        this.gotoSection(1);
    }else if(this.currentSection.id == 1){
        this.gotoSection(100);
    }else if (this.currentSection.id == 100 && !this.viewedIntro) {
        this.gotoSection(0, false);
    } else if(this.currentSection.id[0] == 'C'){
        this.gotoSection(7, false);
    } else if(this.currentSection.id[0] == 'A'){
        this.gotoSection(10, false);
    }else{
        this.gotoSection(0, false);
    }
}
Shell.prototype.sectionCompleteById = function(id) {
    this.tracking.finishSectionById(id);
}
Shell.prototype.nextSection = function() {
    if (this.currentSection.id == 101) {
        this.gotoSection(102, false);
    } else {
        this.gotoSection(0);
    }
}
Shell.prototype.prevSection = function() {
    var idx = this.getIndexById(this.currentSection.id);
    if (idx > 0) {
        this.gotoSection(this.courses[idx - 1].id, true);
    }
}
Shell.prototype.jiraFile = function(txt) {
    try {
        setJiraFile(txt);
    } catch (e) {
        // no jira
    }
}
Shell.prototype.jiraLocation = function(txt) {
    try {
        setJiraLocation(txt);
    } catch (e) {
        // no jira
    }
}
Shell.prototype.jiraItem = function(txt) {
    try {
        setJiraItem(txt);
    } catch (e) {
        // no jira
    }
}
Shell.prototype.popup = function(txt, btn, callback, param) {
    _shell.closePopup();
    var p = $('<div id="popup"></div>');
    p.append('<div class="overlay"></div>');
    var textBox = $('<div class="textbox"></div>');
    textBox.append('<div class="scroll">'+txt+'</div>');
    var button = $('<div class="btn close">' + btn + '</div>');
    textBox.append(button);
    textBox.append('<div style="clear:both"></div>');
    p.append(textBox);
    $('body').append(p);
    textBox.css('top', (600 - textBox.height()) / 2);
    button.click(function() {
        _shell.closePopup();
        if (callback) {
            callback(param)
        };
    });

    TweenMax.to(p, 0.5, {
        'alpha': 1
    });

    return textBox;
}
Shell.prototype.popupStyled = function(txt, callback, param) {
    _shell.closePopup();

    var p = $('<div id="popup"></div>');
    p.append('<div class="overlay"></div>');
    var textBox = $('<div class="urltextbox" style="max-width: 350px; min-width: 350px;"></div>');
    textBox.append('<span style="color:#222">' + txt + '</span>');
    var xCloser = $('<div class="x-closer">X</div>');
    p.append(textBox);
    textBox.append(xCloser);
    $('body').append(p);
    textBox.css('top', (600 - textBox.height()) / 2);
    xCloser.click(function() {
        _shell.closePopup();
        if (callback) {
            callback(param)
        };
    });

    TweenMax.to(p, 0.5, {
        'alpha': 1
    });

    return textBox;
}

Shell.prototype.popupStyledCustom = function (txt, callback, params) {
    _shell.closePopup();

    var p = $('<div id="popup" class="custom-popup" />'),
    textBox = $('<div class="urltextbox" />'),
    xCloser = $('<div class="x-closer">X</div>');

    if (params.styles) {
        textBox.attr('style', params.styles);
    }
    textBox.append('<span>'+ txt +'</span>');
    textBox.append(xCloser);

    p.append('<div class="overlay" />');
    p.append(textBox);

    $('.main').append(p);

    xCloser.on('click', function(e) {
        _shell.closePopup();
        if (callback) callback();
    });

    TweenMax.fromTo(p, 1, { autoAlpha: 0 }, { autoAlpha: 1, ease: Cubic.easeOut });
    return textBox;
}


Shell.prototype.closePopup = function() {
    $('#popup').empty();
    $('#popup').remove();
}
Shell.prototype.imgpopup = function(txt, btn, img, callback, param) {
    _shell.closePopup();
    var p = $('<div id="popup"></div>');
    p.append('<div class="overlay"></div>');
    var contain = $('<div class="imgpopup"></div>');
    contain.append('<div class="popupimg"><img src="' + img + '" /></div>')
    var textBox = $('<div class="imgtextbox"></div>');
    textBox.append(txt);
    var button = $('<div class="btn-wrapper incorrect-close"><div class="btn">' + btn + '</div></div>');
    textBox.append(button);
    textBox.append('<div style="clear:both"></div>');
    contain.append(textBox);
    p.append(contain);
    $('body').append(p);
    button.click(function() {
        _shell.closePopup();
        if (callback) {
            callback(param)
        };
    });

    TweenMax.from(p, 0.5, {
        'alpha': 0
    });

    return textBox;
}

Shell.prototype.popupURL = function(url, callback, param) {
    _shell.closePopup();
    $.get(url, function(html) {
        var p = $('<div id="popup"></div>');
        p.append('<div class="overlay"></div>');
        var textBox = $('<div class="urltextbox"></div>');
        textBox.append(html);
        var xCloser = $('<div class="x-closer">X</div>')

        p.append(textBox);
        textBox.append(xCloser);
        $('body').append(p);
        textBox.css('top', (600 - textBox.height()) / 2);
        xCloser.click(function() {
            _shell.closePopup();
        });

        TweenMax.to(p, 0.5, {
            'alpha': 1
        });

        return textBox;
    })
}
Shell.prototype.maximizeWindow = function() {
    try {
        window.moveTo(0, 0);
        window.resizeTo(screen.availWidth, screen.availHeight);
    } catch (e) {
        debug('Maximize error:' + e);
    }
}

Shell.prototype.getQP = function() {
    return queryParams;
};

Shell.prototype.valign = function(str) {
    var html = '<div class="valign"><div class="middle">'+ str +'</div></div>';
    return html;
};

Shell.prototype.setMenuViewed = function(bool) {
    this.menuSeen = bool;
};

Shell.prototype.getMenuViewedStatus = function() {
    return this.menuSeen;
}

Shell.prototype.getCurrentTime = function () {
    return this.currentTime;
}

function ShellLayer(data) {
    var layer = $('<div id="shell_' + data.tagName + '"></div>');
    if ($(data).attr('type') == 'image') {
        layer.append('<img src="' + $(data).text() + '" />');
    } else {
        $.get($(data).text(), function(data) {
            layer.append(data);
        });
    }
    return layer;
}
_shell = new Shell();
