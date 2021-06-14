function Tracking(type, callback) {
    this.lesson_status   = null;
    this.lesson_score    = null;
    this.elapsed_time    = null;
    this.suspend_data    = null;
    this.lesson_location = null;
    this.bookmarkSection = null;
    this.bookmarkPage    = null;
    this.currentSection  = null;
    this.courseSections  = [];

    var _me = this;

    this.LMS = new LMS(type, function() {
        _me.activate();
        callback();
    });

}
Tracking.prototype.addCourseSection = function(id) {
    this.courseSections.push({
        'id': id,
        'status': 'N'
    });
}
Tracking.prototype.activate = function() {
    this.retrieveData();
    this.parseInitials();
}
Tracking.prototype.retrieveData = function() {
    this.lesson_status   = this.LMS.getValue('lesson_status');
    this.lesson_score    = this.LMS.getValue('lesson_score');
    this.elapsed_time    = this.LMS.getValue('elapsed_time');
    this.suspend_data    = this.LMS.getValue('suspend_data');
    this.lesson_location = this.LMS.getValue('lesson_location');
    this.selectedState = '';
    this.selectedManagedStates = [];
    this.selectedNewYork = false;
    this.selectedIllinois = false;

    // console.log('initial suspend_data', this.suspend_data)
}
Tracking.prototype.parseInitials = function() {
    if (this.suspend_data != '' &&
        this.suspend_data != null &&
        this.suspend_data != 'null' &&
        this.suspend_data !== undefined
    ) {
        this.courseSections = [];
        try{
            var _t = this, parsed = $.parseJSON(this.suspend_data);
            $.each(parsed.courses, function(idx, section) {
                // console.log('Section', section);
                _t.courseSections.push(section);
            });

            // var parse = this.suspend_data.split('_');
            // for (var i = 0; i < parse.length; i++) {
            //     var tmp = parse[i].split('-');
            //     this.courseSections.push({
            //         'id': tmp[0],
            //         'status': tmp[1]
            //     });
            // }

            var bm = this.lesson_location.split('--');
            this.bookmarkSection = bm[0];
            this.bookmarkPage = bm[1];

            this.selectedState = parsed.state;
            this.selectedManagedStates = parsed.statesManaged;
            this.selectedNewYork = parsed.newyork;
            this.selectedIllinois = parsed.illinois;
        }catch(e){
            console.warn('ERROR: corrupt suspend data, progress reset.');
            this.suspend_data = '';
        }
    }
    this.checkLessonComplete();
    this.saveLocation();
}
Tracking.prototype.setTrackingSection = function(id) {
    this.currentSection = this.getTrackingIndexById(id);
    this.bookmarkSection = id;
    this.bookmarkPage = '';
    this.saveBookmark();
}
Tracking.prototype.getTrackingIndexById = function(id) {
    for (var i = 0; i < this.courseSections.length; i++) {
        if (this.courseSections[i].id == id) {
            return i;
        }
    }
    return -1;
}
Tracking.prototype.startSection = function() {
    if (this.courseSections[this.currentSection].status != 'C') {
        this.setSectionStatus('I');
    }
}
Tracking.prototype.getStatusByID = function(id) {
    var section = this.courseSections[this.getTrackingIndexById(id)];
    return section.status;
}
Tracking.prototype.finishSection = function() {
    this.setSectionStatus('C');
    this.checkLessonComplete();
}

Tracking.prototype.finishSectionById = function(id) {
    this.setTrackingSection(id);
    this.setSectionStatus('C');
    this.checkLessonComplete();
}
Tracking.prototype.setSectionStatus = function(val) {
    try {
        this.courseSections[this.currentSection].status = val;
    } catch (e) {
        // not tracked
    }
    this.saveLocation();
}
Tracking.prototype.saveLocation = function() {
    var currentSuspendData = this.LMS.getValue('suspend_data') || this.suspend_data;
    var merged = { courses: [] };
    // console.log('currentSuspendData', currentSuspendData);
    $.each(this.courseSections, function(idx, section) {
        merged.courses.push(section);
    });
    if (currentSuspendData == '' || currentSuspendData == null || currentSuspendData === undefined) {
        this.LMS.setValue('suspend_data', JSON.stringify(merged));
    } else {
        var p = $.parseJSON(currentSuspendData);
        var n = $.extend(p, merged);
        this.LMS.setValue('suspend_data', JSON.stringify(n));
    }
    // console.log('p', p);
    // console.log('merged', merged);
    // this.LMS.setValue('suspend_data', this.exportProgressString());
}

Tracking.prototype.exportProgressString = function() {
    var tracks = [];
    for (var i = 0; i < this.courseSections.length; i++) {
        tracks.push(this.courseSections[i].id + '-' + this.courseSections[i].status);
    }
    return tracks.join('_');
}

Tracking.prototype.saveToSuspendData = function(obj) {
    if (this.LMS.lms_type !== 'none') {
        var current = this.LMS.getValue('suspend_data') || this.suspend_data, str;
        // if (current == null || current == undefined) {
        //     this.LMS.setValue('suspend_data', JSON.stringify(obj));
        // }
        if (current == null && current === undefined) {
            var suspend = $.parseJSON(current);
            str = JSON.stringify(suspend);
        } else {
            var suspend = $.parseJSON(current);
            var n = $.extend(suspend, obj);
            str = JSON.stringify(n);
        }

        this.LMS.setValue('suspend_data', str);
    } else {
        // // console.log('NO LMS...Not saving to anything.');
    }

}
Tracking.prototype.getSuspendData = function() {
    var current = this.LMS.getValue('suspend_data') || this.suspend_data;
    return (current != null && current !== undefined && current !== '') ? $.parseJSON(current) : {};

}
Tracking.prototype.setLessonStatus = function(val) {
    console.log('setLessonStatus', val);
    this.LMS.setValue('lesson_status', val);
}
Tracking.prototype.saveBookmark = function() {
    this.LMS.setValue('lesson_location', this.bookmarkSection + '--' + this.bookmarkPage);
}
Tracking.prototype.manualSaveToLMS = function() {
    // console.log('Tracking.manualSaveToLMS()');
    this.LMS.commit();
}
Tracking.prototype.checkLessonComplete = function() {
    var done = true;
    for (var i = 0; i < this.courseSections.length; i++) {
        if (this.courseSections[i].status != 'C') {
            done = false;
        }
    }
    if (done) {
        this.setLessonStatus('C');
        _shell.markObjectivesComplete();
    } else {
        this.setLessonStatus('I');
    }
}

Tracking.prototype.completeAll = function() {
    for (var i = 0; i < this.courseSections.length; i++) {
        this.courseSections[i].status = 'C';
        this.checkLessonComplete();
        this.saveLocation();
    }

   console.log("Completed All");
}