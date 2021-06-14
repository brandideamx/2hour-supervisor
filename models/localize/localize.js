
var Localize = (function() {
  this.xml;
  this.poll = this.pollForContent();
});

Localize.prototype = {
  pollForContent: function() {
    return setInterval(this.pollCheck, 500);
  },

  pollCheck: function() {
    if (typeof _shell !== 'undefined' && _shell !== undefined) {
      clearInterval(_local.poll);
      if (typeof _loadedData !== 'undefined' && _loadedData !== undefined) {
          // // console.log('| _loadedData is set');
          _local.config(_loadedData);
      } else {
          // // console.log('| Trying again...');
          _shell.tryGetData(function(data) {
              _local.config(data);
          });
      }
    }
  },

  config: function(xml) {
    _shell.hideLoader();
    this.xml = $(xml);

    var formData = {
      state: '',
      statesManaged: [],
      newyork: false,
      illinois: false
    },

    required = [{
      selector: '.state',
      fulfilled: false
    }, {
      selector: 'input[type="radio" name="newyork"]',
      fulfilled: false
    }, {
      selector: 'input[type="radio" name="illinois"]',
      fulfilled: false
    }],

    // Submit
    submitBtn = $('input[type="submit"]'),

    // Select
    stateSelect = $('select[name="state"]'),

    // Checkboxes
    checkboxes = $('input.managed[type="checkbox"]');
    checkboxSpans = $('input[type="checkbox"] + span');

    // New York
    newYork = $('input[name="newyork"]');
    // Illinois
    illinois = $('input[name="illinois"]');

    if (_shell.tracking.selectedState != null && _shell.tracking.selectedState != '') {
      formData.state = _shell.tracking.selectedState;
      stateSelect.val(formData.state);
    }

    if (typeof _shell.tracking.selectedManagedStates === 'object' && _shell.tracking.selectedManagedStates.length > 0) {
      formData.statesManaged = _shell.tracking.selectedManagedStates;
      $.each(_shell.tracking.selectedManagedStates, function(idx, val) {
        $('input[value="'+ val +'"]').prop('checked', true);
      })
    }

    var checkRequired = function() {
      var allDone = true;
      $.each(required, function() {
        if (!this.fulfilled) allDone = false;
      });

      if (allDone) submitBtn.removeClass('disabled');
    }

    // Add event listener
    stateSelect.on('change', function(e) {
      formData.state = e.target.value;
      required[0].fulfilled = true;
      checkRequired();
      // submitBtn.removeClass('disabled');
    })

    // Add event listeners
    checkboxes.on('change', function(e) {
      var v = e.target.value;
      if ($(this).is(':checked')) {
        var inArray = (formData.statesManaged.indexOf(v) > -1 ? true : false);
        if (!inArray) {
          formData.statesManaged.push(v);
        }
      } else {
        var idx = formData.statesManaged.indexOf(v);
        formData.statesManaged.splice(idx, 1);
      }
    })

    checkboxSpans.on('click', function(e) {
      var v = $(this).prev().val();
      if ($(this).prev().is(':checked')) {
        var idx = formData.statesManaged.indexOf(v);
        formData.statesManaged.splice(idx, 1);
        $(this).prev().prop('checked', false);
      }
    })

    newYork.on('change', function(e) {
      var v = e.target.value;
      if ($(this).is(':checked')) {
        if (Number(v) === 1) {
          formData.newyork = true;
        }
        required[1].fulfilled = true;
        checkRequired();
      }
    })
    illinois.on('change', function(e) {
      var v = e.target.value;
      if ($(this).is(':checked')) {
        if (Number(v) === 1) {
          formData.illinois = true;
        }
        required[2].fulfilled = true;
        checkRequired();
      }
    })

    submitBtn.on('click', function(e) {
      e.preventDefault();
      if (!$(e.currentTarget).hasClass('disabled')) {
        // Going to use this to add classes
        _shell.userSelection.stateLivedIn = 'show-'+ formData.state;
        _shell.userSelection.statesManaged = formData.statesManaged;
        _shell.userSelection.newyork = formData.newyork;
        _shell.userSelection.illinois = formData.illinois;

        _shell.tracking.selectedState = formData.state;
        _shell.tracking.selectedManagedStates = formData.statesManaged;
        _shell.tracking.selectedNewYork = formData.newyork;
        _shell.tracking.selectedIllinois = formData.illinois;

        if (_shell.tracking.LMS.lms_type !== 'none') {
          var susdata = _shell.tracking.LMS.getValue('suspend_data')
          parsed = JSON.parse(susdata);

          $.extend(parsed, formData);
          _shell.tracking.suspend_data = JSON.stringify(parsed);
          _shell.tracking.LMS.setValue('suspend_data', JSON.stringify(parsed));

          // --------------------------
          // Create Objectives based on states...
          // --------------------------
          function getFullStateName(abbr) {
            return defList[abbr];
          }

          function createPropForObjective(idx, prop, val) {
            _shell.tracking.LMS.setValue('cmi.objectives.'+ idx +'.'+ prop, val);
          }

          var defList = {
            "CA": "California",
            "CT": "Connecticut",
            "DE": "Delaware",
            "IL": "Illinois",
            "ME": "Maine",
            "NY": "NewYork"
          };

          var fullStateList = [];
          fullStateList.push(getFullStateName(_shell.tracking.selectedState));
          $.each(_shell.tracking.selectedManagedStates, function(i,e) {
            fullStateList.push(getFullStateName(e));
          });
          if (_shell.tracking.selectedNewYork) {
            fullStateList.push(getFullStateName('NY'));
          }
          if (_shell.tracking.selectedIllinois) {
            fullStateList.push(getFullStateName('IL'));
          }
          
          $.each(fullStateList, function(i, e) {
            createPropForObjective(i, 'id', e);
            createPropForObjective(i, 'status', 'incomplete');
          });
        }

        // Finish
        _shell.activityComplete();
        // _shell.addUserSelectionClasses();
      }
    })
  }
};

var _local = new Localize();
