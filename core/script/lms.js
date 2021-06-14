function LMS(type, callback) {
    this.isset = false;
    this.lms_type; //
    this.initCallback = callback;
    this.setType(type); //
    this.translate;
}
LMS.prototype.setType = function(id) {
    var _me = this;
    if (id == 'scorm12') {
        this.translate = this.scorm12translate;
        $.getScript('core/script/lms/scorm12.js', function() {
            setTimeout(function() {
                _me.scorm12loaded();
            }, 100);
        });
    } else if (id == 'scorm2004') {
        this.translate = this.scorm2004translate;
        $.getScript('core/script/lms/scorm2004.js', function() {
            setTimeout(function() {
                _me.scorm2004loaded();
            }, 100);
        });
    } else if (id == 'none') {
        _me.lms_type = 'none';
        this.translate = this.cookieTranslate;
        setTimeout(function() {
            _me.loadedCallback();
        }, 10);
    } else {
        //  // console.log('Invalid LMS type, using browser cookie. Currently accepted values are "scorm12" or "none"');
        this.translate = this.cookieTranslate;
        _me.lms_type = 'none';
        setTimeout(function() {
            _me.loadedCallback();
        }, 10);
    }
}
LMS.prototype.scorm12loaded = function() {
    LMSInitialize();
    this.lms_type = 'scorm12';
    var _me = this;
    $(window).unload(function() {
        _me.scormComplete()
    });
    this.loadedCallback();
}
LMS.prototype.scorm2004loaded = function() {
    pipwerks.SCORM.init();
    this.lms_type = 'scorm2004';
    var _me = this;
    $(window).unload(function() {
        _me.scormComplete()
    });
    this.loadedCallback();
}
LMS.prototype.scormComplete = function() {
    if (this.lms_type == 'scorm12') {
        LMSCommit();
        LMSFinish();
    } else if (this.lms_type == 'scorm2004') {
        pipwerks.SCORM.save();
        pipwerks.SCORM.quit();
    }
}
LMS.prototype.loadedCallback = function() {
    this.initCallback();
}
LMS.prototype.getLastError = function() {
    return {
        errorCode: LMSGetLastError(),
        errorMessage: LMSGetErrorString()
    };
}
LMS.prototype.getValue = function(key) {
    key = this.translate(key);
    var rturn;
    if (this.lms_type == 'scorm12') {
        rturn = LMSGetValue(key);
    } else if (this.lms_type == 'scorm2004') {
        if (key == 'cmi.session_time') {
            return 0;
        }
        rturn = pipwerks.SCORM.get(key);
    } else {
        rturn = $.cookie(key);
    }
    return rturn;
}
LMS.prototype.setValue = function(key, val) {

    var key = this.translate(key);
    var val = this.translate(val);
    if (this.lms_type == 'scorm12') {
        if(key.indexOf('objectives')!== -1) console.log("debug: scorm1.2 setting LMS value: key, val, LMS setter function", key, val, typeof LMSSetValue)
        LMSSetValue(key, val);
    } else if (this.lms_type == 'scorm2004') {
        pipwerks.SCORM.set(key, val);
        if(key.indexOf('objectives')!== -1) console.log("debug: scorm2004 setting LMS value: key, val, LMS setter function", key, val, typeof pipwerks.SCORM)

        if (key == 'cmi.completion_status' && val == 'incomplete') {
            pipwerks.SCORM.set('cmi.success_status', 'unknown');
        } else if (key == 'cmi.completion_status' && val == 'completed') {
            pipwerks.SCORM.set('cmi.success_status', 'passed');
        }
    }
}
LMS.prototype.commit = function() {
    if (this.lms_type == 'scorm12') {
        LMSCommit();
    } else if (this.lms_type == 'scorm2004') {
        pipwerks.SCORM.save();
    }
}
LMS.prototype.scorm12translate = function(key) {
    var rturn = key;
    switch (key) {
        case 'lesson_status':
            rturn = 'cmi.core.lesson_status';
            break;
        case 'lesson_score':
            rturn = 'cmi.core.score.raw';
            break;
        case 'lesson_location':
            rturn = 'cmi.core.lesson_location';
            break;
        case 'suspend_data':
            rturn = 'cmi.suspend_data';
            break;
        case 'session_time':
            rturn = 'cmi.core.session_time';
            break;
        case 'launch_data':
            rturn = 'cmi.launch_data';
            break;
        case 'elapsed_time':
            rturn = 'cmi.core.total_time';
            break;
        case 'N':
            rturn = 'not attempted';
            break;
        case 'I':
            rturn = 'incomplete';
            break;
        case 'C':
            if (_shell.getCurrentTime() >= 7200 && _shell.viewedAcknowledge) {
                rturn = 'passed';
            }
            else {
                rturn = 'unknown';
            }
            break;
        default:
            break;
    }
    console.log(key);
    return rturn;
}
LMS.prototype.scorm2004translate = function(key) {
    var rturn = key;

    switch (key) {
        case 'lesson_status':
            rturn = 'cmi.completion_status';
            break;
        case 'lesson_score':
            rturn = 'cmi.score.raw';
            break;
        case 'suspend_data':
            rturn = 'cmi.location';
            break;
        case 'elapsed_time':
            rturn = 'cmi.session_time';
            break;
        case 'N':
            rturn = 'not attempted';
            break;
        case 'I':
            rturn = 'incomplete';
            break;
        case 'C':
            rturn = 'completed';
            break;
        default:
            break;
    }
    return rturn;
}
LMS.prototype.cookieTranslate = function(key) {
    return key;
}
