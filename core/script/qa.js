/**
 * This module is for QAing the completion
 * status for the objectives of this course
 * which are based on the user's selected states
 *
 */

var QA = (function() {

  var app;
  var Module = function() {
    app = this;
    app.$el = $('.qa-status-box');
    app.$content = app.$el.find('.content');
  };

  Module.prototype = {
    constructor: Module,

    init: function() {
      // console.log('QA initializing...');
      app.$content.html('<h3>LMS Testing</h3>');
      app.$content.append(app.getObjectives());

      var btn = $('<button class="moc-btn" />');
      btn.on('click', function(e) {
          app.markObjectivesComplete();
      }).html('Mark Complete');


      app.$content.append(btn);
      app.$el.on('click', '.toggle', function(e) {
        if (app.$el.hasClass('open')) {
          app.$el.removeClass('open');
          $(this).html('Expand (+)');
        } else {
          app.$el.addClass('open');
          $(this).html('Collapse (-)');
        }
      });
    },
    markObjectivesComplete: function() {
      var objectiveCount = app.get('cmi.objectives._count');
      for (var i = 0; i < objectiveCount; i++) {
        app.set('cmi.objectives.'+ i +'.status', 'completed')
      }
    },
    get: function(str) {
      return _shell.tracking.LMS.getValue(str);
    },
    set: function(key, val) {
      _shell.tracking.LMS.setValue(key, val);
      // console.log('Error:');
      // console.log('   Code: '+ _shell.tracking.LMS.getLastError().errorCode);

      if (_shell.tracking.LMS.getLastError().errorCode == '0') {
          return true;
      }
      return false;
    },
    getObjectives: function() {
      var count = this.get('cmi.objectives._count');
      var returnMarkup = '<p>There are '+ count +' objectives recorded.</p>';


      for (var i = 0; i < count; i++) {
        var objectiveId = this.get('cmi.objectives.'+ i +'.id'),
        objectiveStatus = this.get('cmi.objectives.'+ i +'.status');
        returnMarkup += '<h4>Objective '+ i +'</h4>';
        returnMarkup += '<ul>';
        returnMarkup += '<li><b>ID</b>: '+ objectiveId +'</li>';
        returnMarkup += '<li><b>Status</b>: '+ objectiveStatus +'</li>';
        returnMarkup += '</ul><br>';
      }

      return returnMarkup;
    }
  };

  return Module;

})();