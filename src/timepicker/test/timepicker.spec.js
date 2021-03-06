describe('timepicker directive', function() {
  var $rootScope, $compile, $templateCache, element;

  beforeEach(module('ui.bootstrap.timepicker'));
  beforeEach(module('template/timepicker/timepicker.html'));
  beforeEach(inject(function(_$compile_, _$rootScope_, _$templateCache_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $rootScope.time = newTime(14, 40);
    $templateCache = _$templateCache_;

    element = $compile('<uib-timepicker ng-model="time"></uib-timepicker>')($rootScope);
    $rootScope.$digest();
  }));

  function newTime(hours, minutes) {
    var time = new Date();
    time.setHours(hours, minutes, 0, 0);
    return time;
  }

  function getTimeState(withoutMeridian) {
    var inputs = element.find('input');

    var state = [];
    for (var i = 0; i < 2; i ++) {
      state.push(inputs.eq(i).val());
    }
    if (withoutMeridian !== true) {
      state.push(getMeridianButton().text());
    }
    return state;
  }

  function getModelState() {
    return [ $rootScope.time.getHours(), $rootScope.time.getMinutes() ];
  }

  function getArrow(isUp, tdIndex) {
    return element.find('tr').eq(isUp ? 0 : 2).find('td').eq(tdIndex).find('a').eq(0);
  }

  function getHoursButton(isUp) {
    return getArrow(isUp, 0);
  }

  function getMinutesButton(isUp) {
    return getArrow(isUp, 2);
  }

  function getMeridianButton() {
    return element.find('button').eq(0);
  }

  function doClick(button, n) {
    for (var i = 0, max = n || 1; i < max; i++) {
      button.click();
      $rootScope.$digest();
    }
  }

  function wheelThatMouse(delta) {
    var e = $.Event('mousewheel');
    e.wheelDelta = delta;
    return e;
  }

  function wheelThatOtherMouse(delta) {
    var e = $.Event('wheel');
    e.deltaY = delta;
    return e;
  }

  function keydown(key) {
    var e = $.Event('keydown');
    switch(key) {
      case 'left':
        e.which = 37;
        break;
      case 'up':
        e.which = 38;
        break;
      case 'right':
        e.which = 39;
        break;
      case 'down':
        e.which = 40;
        break;
    }
    return e;
  }

  it('contains three row & three input elements', function() {
    expect(element.find('tr').length).toBe(3);
    expect(element.find('input').length).toBe(2);
    expect(element.find('button').length).toBe(1);
  });

  it('has initially the correct time & meridian', function() {
    expect(getTimeState()).toEqual(['02', '40', 'PM']);
    expect(getModelState()).toEqual([14, 40]);
  });

  it('should be pristine', function() {
    expect(element.controller('ngModel').$pristine).toBe(true);
  });

  it('has `selected` current time when model is initially cleared', function() {
    $rootScope.time = null;
    element = $compile('<uib-timepicker ng-model="time"></uib-timepicker>')($rootScope);
    $rootScope.$digest();

    expect($rootScope.time).toBe(null);
    expect(getTimeState()).not.toEqual(['', '', '']);
  });

  it('changes inputs when model changes value', function() {
    $rootScope.time = newTime(11, 50);
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['11', '50', 'AM']);
    expect(getModelState()).toEqual([11, 50]);

    $rootScope.time = newTime(16, 40);
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '40', 'PM']);
    expect(getModelState()).toEqual([16, 40]);
  });

  it('increases / decreases hours when arrows are clicked', function() {
    var up = getHoursButton(true);
    var down = getHoursButton(false);

    doClick(up);
    expect(getTimeState()).toEqual(['03', '40', 'PM']);
    expect(getModelState()).toEqual([15, 40]);

    doClick(down);
    expect(getTimeState()).toEqual(['02', '40', 'PM']);
    expect(getModelState()).toEqual([14, 40]);

    doClick(down);
    expect(getTimeState()).toEqual(['01', '40', 'PM']);
    expect(getModelState()).toEqual([13, 40]);
  });

  it('increase / decreases minutes by default step when arrows are clicked', function() {
    var up = getMinutesButton(true);
    var down = getMinutesButton(false);

    doClick(up);
    expect(getTimeState()).toEqual(['02', '41', 'PM']);
    expect(getModelState()).toEqual([14, 41]);

    doClick(down);
    expect(getTimeState()).toEqual(['02', '40', 'PM']);
    expect(getModelState()).toEqual([14, 40]);

    doClick(down);
    expect(getTimeState()).toEqual(['02', '39', 'PM']);
    expect(getModelState()).toEqual([14, 39]);
  });

  it('meridian button has correct type', function() {
    var button = getMeridianButton();
    expect(button.attr('type')).toBe('button');
  });

  it('toggles meridian when button is clicked', function() {
    var button = getMeridianButton();

    doClick(button);
    expect(getTimeState()).toEqual(['02', '40', 'AM']);
    expect(getModelState()).toEqual([2, 40]);

    doClick(button);
    expect(getTimeState()).toEqual(['02', '40', 'PM']);
    expect(getModelState()).toEqual([14, 40]);

    doClick(button);
    expect(getTimeState()).toEqual(['02', '40', 'AM']);
    expect(getModelState()).toEqual([2, 40]);
  });

  it('has minutes "connected" to hours', function() {
    var up = getMinutesButton(true);
    var down = getMinutesButton(false);

    doClick(up, 10);
    expect(getTimeState()).toEqual(['02', '50', 'PM']);
    expect(getModelState()).toEqual([14, 50]);

    doClick(up, 10);
    expect(getTimeState()).toEqual(['03', '00', 'PM']);
    expect(getModelState()).toEqual([15, 0]);

    doClick(up, 10);
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['03', '10', 'PM']);
    expect(getModelState()).toEqual([15, 10]);

    doClick(down, 10);
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['03', '00', 'PM']);
    expect(getModelState()).toEqual([15, 0]);

    doClick(down, 10);
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['02', '50', 'PM']);
    expect(getModelState()).toEqual([14, 50]);
  });

  it('has hours "connected" to meridian', function() {
    var up = getHoursButton(true);
    var down = getHoursButton(false);

    // AM -> PM
    $rootScope.time = newTime(11, 0);
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['11', '00', 'AM']);
    expect(getModelState()).toEqual([11, 0]);

    doClick(up);
    expect(getTimeState()).toEqual(['12', '00', 'PM']);
    expect(getModelState()).toEqual([12, 0]);

    doClick(up);
    expect(getTimeState()).toEqual(['01', '00', 'PM']);
    expect(getModelState()).toEqual([13, 0]);

    doClick(down);
    expect(getTimeState()).toEqual(['12', '00', 'PM']);
    expect(getModelState()).toEqual([12, 0]);

    doClick(down);
    expect(getTimeState()).toEqual(['11', '00', 'AM']);
    expect(getModelState()).toEqual([11, 0]);

    // PM -> AM
    $rootScope.time = newTime(23, 0);
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['11', '00', 'PM']);
    expect(getModelState()).toEqual([23, 0]);

    doClick(up);
    expect(getTimeState()).toEqual(['12', '00', 'AM']);
    expect(getModelState()).toEqual([0, 0]);

    doClick(up);
    expect(getTimeState()).toEqual(['01', '00', 'AM']);
    expect(getModelState()).toEqual([01, 0]);

    doClick(down);
    expect(getTimeState()).toEqual(['12', '00', 'AM']);
    expect(getModelState()).toEqual([0, 0]);

    doClick(down);
    expect(getTimeState()).toEqual(['11', '00', 'PM']);
    expect(getModelState()).toEqual([23, 0]);
  });

  it('changes only the time part when hours change', function() {
    $rootScope.time = newTime(23, 50);
    $rootScope.$digest();

    var date =  $rootScope.time.getDate();
    var up = getHoursButton(true);
    doClick(up);

    expect(getTimeState()).toEqual(['12', '50', 'AM']);
    expect(getModelState()).toEqual([0, 50]);
    expect(date).toEqual($rootScope.time.getDate());
  });

  it('changes only the time part when minutes change', function() {
    element = $compile('<uib-timepicker ng-model="time" minute-step="15"></uib-timepicker>')($rootScope);
    $rootScope.time = newTime(0, 0);
    $rootScope.$digest();

    var date =  $rootScope.time.getDate();
    var up = getMinutesButton(true);
    doClick(up, 2);
    expect(getTimeState()).toEqual(['12', '30', 'AM']);
    expect(getModelState()).toEqual([0, 30]);
    expect(date).toEqual($rootScope.time.getDate());

    var down = getMinutesButton(false);
    doClick(down, 2);
    expect(getTimeState()).toEqual(['12', '00', 'AM']);
    expect(getModelState()).toEqual([0, 0]);
    expect(date).toEqual($rootScope.time.getDate());

    doClick(down, 2);
    expect(getTimeState()).toEqual(['11', '30', 'PM']);
    expect(getModelState()).toEqual([23, 30]);
    expect(date).toEqual($rootScope.time.getDate());
  });

  it('responds properly on "mousewheel" events', function() {
    var inputs = element.find('input');
    var hoursEl = inputs.eq(0), minutesEl = inputs.eq(1);
    var upMouseWheelEvent = wheelThatMouse(1);
    var downMouseWheelEvent = wheelThatMouse(-1);

    expect(getTimeState()).toEqual(['02', '40', 'PM']);
    expect(getModelState()).toEqual([14, 40]);

    // UP
    hoursEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['03', '40', 'PM']);
    expect(getModelState()).toEqual([15, 40]);

    hoursEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '40', 'PM']);
    expect(getModelState()).toEqual([16, 40]);

    minutesEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '41', 'PM']);
    expect(getModelState()).toEqual([16, 41]);

    minutesEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '42', 'PM']);
    expect(getModelState()).toEqual([16, 42]);

    // DOWN
    minutesEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '41', 'PM']);
    expect(getModelState()).toEqual([16, 41]);

    minutesEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '40', 'PM']);
    expect(getModelState()).toEqual([16, 40]);

    hoursEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['03', '40', 'PM']);
    expect(getModelState()).toEqual([15, 40]);

    hoursEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['02', '40', 'PM']);
    expect(getModelState()).toEqual([14, 40]);
  });

  it('responds properly on "wheel" events', function() {
    var inputs = element.find('input');
    var hoursEl = inputs.eq(0), minutesEl = inputs.eq(1);
    var upMouseWheelEvent = wheelThatOtherMouse(-1);
    var downMouseWheelEvent = wheelThatOtherMouse(1);

    expect(getTimeState()).toEqual(['02', '40', 'PM']);
    expect(getModelState()).toEqual([14, 40]);

    // UP
    hoursEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['03', '40', 'PM']);
    expect(getModelState()).toEqual([15, 40]);

    hoursEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '40', 'PM']);
    expect(getModelState()).toEqual([16, 40]);

    minutesEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '41', 'PM']);
    expect(getModelState()).toEqual([16, 41]);

    minutesEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '42', 'PM']);
    expect(getModelState()).toEqual([16, 42]);

    // DOWN
    minutesEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '41', 'PM']);
    expect(getModelState()).toEqual([16, 41]);

    minutesEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '40', 'PM']);
    expect(getModelState()).toEqual([16, 40]);

    hoursEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['03', '40', 'PM']);
    expect(getModelState()).toEqual([15, 40]);

    hoursEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['02', '40', 'PM']);
    expect(getModelState()).toEqual([14, 40]);
  });

  it('responds properly on "keydown" events', function() {
    var inputs = element.find('input');
    var hoursEl = inputs.eq(0), minutesEl = inputs.eq(1);
    var upKeydownEvent = keydown('up');
    var downKeydownEvent = keydown('down');
    var leftKeydownEvent = keydown('left');

    expect(getTimeState()).toEqual(['02', '40', 'PM']);
    expect(getModelState()).toEqual([14, 40]);

    // UP
    hoursEl.trigger( upKeydownEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['03', '40', 'PM']);
    expect(getModelState()).toEqual([15, 40]);

    hoursEl.trigger( upKeydownEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '40', 'PM']);
    expect(getModelState()).toEqual([16, 40]);

    minutesEl.trigger( upKeydownEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '41', 'PM']);
    expect(getModelState()).toEqual([16, 41]);

    minutesEl.trigger( upKeydownEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '42', 'PM']);
    expect(getModelState()).toEqual([16, 42]);

    // DOWN
    minutesEl.trigger( downKeydownEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '41', 'PM']);
    expect(getModelState()).toEqual([16, 41]);

    minutesEl.trigger( downKeydownEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '40', 'PM']);
    expect(getModelState()).toEqual([16, 40]);

    hoursEl.trigger( downKeydownEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['03', '40', 'PM']);
    expect(getModelState()).toEqual([15, 40]);

    hoursEl.trigger( downKeydownEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['02', '40', 'PM']);
    expect(getModelState()).toEqual([14, 40]);

    // Other keydown
    hoursEl.trigger( leftKeydownEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['02', '40', 'PM']);
    expect(getModelState()).toEqual([14, 40]);

    minutesEl.trigger( leftKeydownEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['02', '40', 'PM']);
    expect(getModelState()).toEqual([14, 40]);
  });

  describe('attributes', function() {
    beforeEach(function() {
      $rootScope.hstep = 2;
      $rootScope.mstep = 30;
      $rootScope.time = newTime(14, 0);
      element = $compile('<uib-timepicker ng-model="time" hour-step="hstep" minute-step="mstep"></uib-timepicker>')($rootScope);
      $rootScope.$digest();
    });

    it('increases / decreases hours by configurable step', function() {
      var up = getHoursButton(true);
      var down = getHoursButton(false);

      expect(getTimeState()).toEqual(['02', '00', 'PM']);
      expect(getModelState()).toEqual([14, 0]);

      doClick(up);
      expect(getTimeState()).toEqual(['04', '00', 'PM']);
      expect(getModelState()).toEqual([16, 0]);

      doClick(down);
      expect(getTimeState()).toEqual(['02', '00', 'PM']);
      expect(getModelState()).toEqual([14, 0]);

      doClick(down);
      expect(getTimeState()).toEqual(['12', '00', 'PM']);
      expect(getModelState()).toEqual([12, 0]);

      // Change step
      $rootScope.hstep = 3;
      $rootScope.$digest();

      doClick(up);
      expect(getTimeState()).toEqual(['03', '00', 'PM']);
      expect(getModelState()).toEqual([15, 0]);

      doClick(down);
      expect(getTimeState()).toEqual(['12', '00', 'PM']);
      expect(getModelState()).toEqual([12, 0]);
    });

    it('increases / decreases minutes by configurable step', function() {
      var up = getMinutesButton(true);
      var down = getMinutesButton(false);

      doClick(up);
      expect(getTimeState()).toEqual(['02', '30', 'PM']);
      expect(getModelState()).toEqual([14, 30]);

      doClick(up);
      expect(getTimeState()).toEqual(['03', '00', 'PM']);
      expect(getModelState()).toEqual([15, 0]);

      doClick(down);
      expect(getTimeState()).toEqual(['02', '30', 'PM']);
      expect(getModelState()).toEqual([14, 30]);

      doClick(down);
      expect(getTimeState()).toEqual(['02', '00', 'PM']);
      expect(getModelState()).toEqual([14, 0]);

      // Change step
      $rootScope.mstep = 15;
      $rootScope.$digest();

      doClick(up);
      expect(getTimeState()).toEqual(['02', '15', 'PM']);
      expect(getModelState()).toEqual([14, 15]);

      doClick(down);
      expect(getTimeState()).toEqual(['02', '00', 'PM']);
      expect(getModelState()).toEqual([14, 0]);

      doClick(down);
      expect(getTimeState()).toEqual(['01', '45', 'PM']);
      expect(getModelState()).toEqual([13, 45]);
    });

    it('responds properly on "mousewheel" events with configurable steps', function() {
      var inputs = element.find('input');
      var hoursEl = inputs.eq(0), minutesEl = inputs.eq(1);
      var upMouseWheelEvent = wheelThatMouse(1);
      var downMouseWheelEvent = wheelThatMouse(-1);

      expect(getTimeState()).toEqual(['02', '00', 'PM']);
      expect(getModelState()).toEqual([14, 0]);

      // UP
      hoursEl.trigger( upMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['04', '00', 'PM']);
      expect(getModelState()).toEqual([16, 0]);

      minutesEl.trigger( upMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['04', '30', 'PM']);
      expect(getModelState()).toEqual([16, 30]);

      // DOWN
      minutesEl.trigger( downMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['04', '00', 'PM']);
      expect(getModelState()).toEqual([16, 0]);

      hoursEl.trigger( downMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['02', '00', 'PM']);
      expect(getModelState()).toEqual([14, 0]);
    });

    it('responds properly on "wheel" events with configurable steps', function() {
      var inputs = element.find('input');
      var hoursEl = inputs.eq(0), minutesEl = inputs.eq(1);
      var upMouseWheelEvent = wheelThatOtherMouse(-1);
      var downMouseWheelEvent = wheelThatOtherMouse(1);

      expect(getTimeState()).toEqual(['02', '00', 'PM']);
      expect(getModelState()).toEqual([14, 0]);

      // UP
      hoursEl.trigger( upMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['04', '00', 'PM']);
      expect(getModelState()).toEqual([16, 0]);

      minutesEl.trigger( upMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['04', '30', 'PM']);
      expect(getModelState()).toEqual([16, 30]);

      // DOWN
      minutesEl.trigger( downMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['04', '00', 'PM']);
      expect(getModelState()).toEqual([16, 0]);

      hoursEl.trigger( downMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['02', '00', 'PM']);
      expect(getModelState()).toEqual([14, 0]);
    });

    it('can handle strings as steps', function() {
      var upHours = getHoursButton(true);
      var upMinutes = getMinutesButton(true);

      expect(getTimeState()).toEqual(['02', '00', 'PM']);
      expect(getModelState()).toEqual([14, 0]);

      $rootScope.hstep = '4';
      $rootScope.mstep = '20';
      $rootScope.$digest();

      doClick(upHours);
      expect(getTimeState()).toEqual(['06', '00', 'PM']);
      expect(getModelState()).toEqual([18, 0]);

      doClick(upMinutes);
      expect(getTimeState()).toEqual(['06', '20', 'PM']);
      expect(getModelState()).toEqual([18, 20]);
    });

  });

  describe('12 / 24 hour mode', function() {
    beforeEach(function() {
      $rootScope.meridian = false;
      $rootScope.time = newTime(14, 10);
      element = $compile('<uib-timepicker ng-model="time" show-meridian="meridian"></uib-timepicker>')($rootScope);
      $rootScope.$digest();
    });

    function getMeridianTd() {
      return element.find('tr').eq(1).find('td').eq(3);
    }

    it('initially displays correct time when `show-meridian` is false', function() {
      expect(getTimeState(true)).toEqual(['14', '10']);
      expect(getModelState()).toEqual([14, 10]);
      expect(getMeridianTd()).toBeHidden();
    });

    it('toggles correctly between different modes', function() {
      expect(getTimeState(true)).toEqual(['14', '10']);

      $rootScope.meridian = true;
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['02', '10', 'PM']);
      expect(getModelState()).toEqual([14, 10]);
      expect(getMeridianTd()).not.toBeHidden();

      $rootScope.meridian = false;
      $rootScope.$digest();
      expect(getTimeState(true)).toEqual(['14', '10']);
      expect(getModelState()).toEqual([14, 10]);
      expect(getMeridianTd()).toBeHidden();
    });

    it('handles correctly initially empty model on parent element', function() {
      $rootScope.time = null;
      element = $compile('<span ng-model="time"><uib-timepicker show-meridian="meridian"></uib-timepicker></span>')($rootScope);
      $rootScope.$digest();

      expect($rootScope.time).toBe(null);
    });
  });

  describe('`meridians` attribute', function() {
    beforeEach(inject(function() {
      $rootScope.meridiansArray = ['am', 'pm'];
      element = $compile('<uib-timepicker ng-model="time" meridians="meridiansArray"></uib-timepicker>')($rootScope);
      $rootScope.$digest();
    }));

    it('displays correctly', function() {
      expect(getTimeState()[2]).toBe('pm');
    });

    it('toggles correctly', function() {
      $rootScope.time = newTime(2, 40);
      $rootScope.$digest();
      expect(getTimeState()[2]).toBe('am');
    });
  });

  describe('`readonly-input` attribute', function() {
    beforeEach(inject(function() {
      $rootScope.meridiansArray = ['am', 'pm'];
      element = $compile('<uib-timepicker ng-model="time" readonly-input="true"></uib-timepicker>')($rootScope);
      $rootScope.$digest();
    }));

    it('should make inputs readonly', function() {
      var inputs = element.find('input');
      expect(inputs.eq(0).attr('readonly')).toBe('readonly');
      expect(inputs.eq(1).attr('readonly')).toBe('readonly');
    });
  });

  describe('setting timepickerConfig steps', function() {
    var originalConfig = {};
    beforeEach(inject(function(_$compile_, _$rootScope_, uibTimepickerConfig) {
      angular.extend(originalConfig, uibTimepickerConfig);
      uibTimepickerConfig.hourStep = 2;
      uibTimepickerConfig.minuteStep = 10;
      uibTimepickerConfig.showMeridian = false;
      element = $compile('<uib-timepicker ng-model="time"></uib-timepicker>')($rootScope);
      $rootScope.$digest();
    }));
    afterEach(inject(function(uibTimepickerConfig) {
      // return it to the original state
      angular.extend(uibTimepickerConfig, originalConfig);
    }));

    it('does not affect the initial value', function() {
      expect(getTimeState(true)).toEqual(['14', '40']);
      expect(getModelState()).toEqual([14, 40]);
    });

    it('increases / decreases hours with configured step', function() {
      var up = getHoursButton(true);
      var down = getHoursButton(false);

      doClick(up, 2);
      expect(getTimeState(true)).toEqual(['18', '40']);
      expect(getModelState()).toEqual([18, 40]);

      doClick(down, 3);
      expect(getTimeState(true)).toEqual(['12', '40']);
      expect(getModelState()).toEqual([12, 40]);
    });

    it('increases / decreases minutes with configured step', function() {
      var up = getMinutesButton(true);
      var down = getMinutesButton(false);

      doClick(up);
      expect(getTimeState(true)).toEqual(['14', '50']);
      expect(getModelState()).toEqual([14, 50]);

      doClick(down, 3);
      expect(getTimeState(true)).toEqual(['14', '20']);
      expect(getModelState()).toEqual([14, 20]);
    });
  });

  describe('setting timepickerConfig meridian labels', function() {
    var originalConfig = {};
    beforeEach(inject(function(_$compile_, _$rootScope_, uibTimepickerConfig) {
      angular.extend(originalConfig, uibTimepickerConfig);
      uibTimepickerConfig.meridians = ['??.??.', '??.??.'];
      uibTimepickerConfig.showMeridian = true;
      element = $compile('<uib-timepicker ng-model="time"></uib-timepicker>')($rootScope);
      $rootScope.$digest();
    }));
    afterEach(inject(function(uibTimepickerConfig) {
      // return it to the original state
      angular.extend(uibTimepickerConfig, originalConfig);
    }));

    it('displays correctly', function() {
      expect(getTimeState()).toEqual(['02', '40', '??.??.']);
      expect(getModelState()).toEqual([14, 40]);
    });

    it('toggles correctly', function() {
      $rootScope.time = newTime(2, 40);
      $rootScope.$digest();

      expect(getTimeState()).toEqual(['02', '40', '??.??.']);
      expect(getModelState()).toEqual([2, 40]);
    });
  });

  describe('$formatter', function() {
    var ngModel,
      date;

    beforeEach(function() {
      ngModel = element.controller('ngModel');
      date = new Date('Mon Mar 23 2015 14:40:11 GMT-0700 (PDT)');
    });

    it('should have one formatter', function() {
      expect(ngModel.$formatters.length).toBe(1);
    });

    it('should convert a date to a new reference representing the same date', function() {
      expect(ngModel.$formatters[0](date)).toEqual(date);
    });

    it('should convert a valid date string to a date object', function() {
      expect(ngModel.$formatters[0]('Mon Mar 23 2015 14:40:11 GMT-0700 (PDT)')).toEqual(date);
    });

    it('should set falsy values as null', function() {
      expect(ngModel.$formatters[0](undefined)).toBe(null);
      expect(ngModel.$formatters[0](null)).toBe(null);
      expect(ngModel.$formatters[0]('')).toBe(null);
      expect(ngModel.$formatters[0](0)).toBe(null);
      expect(ngModel.$formatters[0](NaN)).toBe(null);
    });
  });

  describe('user input validation', function() {
    var changeInputValueTo;

    beforeEach(inject(function($sniffer) {
      changeInputValueTo = function(inputEl, value) {
        inputEl.val(value);
        inputEl.trigger($sniffer.hasEvent('input') ? 'input' : 'change');
        $rootScope.$digest();
      };
    }));

    function getHoursInputEl() {
      return element.find('input').eq(0);
    }

    function getMinutesInputEl() {
      return element.find('input').eq(1);
    }

    it('has initially the correct time & meridian', function() {
      expect(getTimeState()).toEqual(['02', '40', 'PM']);
      expect(getModelState()).toEqual([14, 40]);
    });

    it('updates hours & pads on input change & pads on blur', function() {
      var el = getHoursInputEl();

      changeInputValueTo(el, 5);
      expect(getTimeState()).toEqual(['5', '40', 'PM']);
      expect(getModelState()).toEqual([17, 40]);

      el.blur();
      expect(getTimeState()).toEqual(['05', '40', 'PM']);
      expect(getModelState()).toEqual([17, 40]);
    });

    it('updates minutes & pads on input change & pads on blur', function() {
      var el = getMinutesInputEl();

      changeInputValueTo(el, 9);
      expect(getTimeState()).toEqual(['02', '9', 'PM']);
      expect(getModelState()).toEqual([14, 9]);

      el.blur();
      expect(getTimeState()).toEqual(['02', '09', 'PM']);
      expect(getModelState()).toEqual([14, 9]);
    });

    it('clears model when input hours is invalid & alerts the UI', function() {
      var el = getHoursInputEl();

      changeInputValueTo(el, 'pizza');
      expect($rootScope.time).toBe(null);
      expect(el.parent().hasClass('has-error')).toBe(true);
      expect(element.hasClass('ng-invalid-time')).toBe(true);

      changeInputValueTo(el, 8);
      el.blur();
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['08', '40', 'PM']);
      expect(getModelState()).toEqual([20, 40]);
      expect(el.parent().hasClass('has-error')).toBe(false);
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });

    it('clears model when input minutes is invalid & alerts the UI', function() {
      var el = getMinutesInputEl();

      changeInputValueTo(el, 'pizza');
      expect($rootScope.time).toBe(null);
      expect(el.parent().hasClass('has-error')).toBe(true);
      expect(element.hasClass('ng-invalid-time')).toBe(true);

      changeInputValueTo(el, 22);
      expect(getTimeState()).toEqual(['02', '22', 'PM']);
      expect(getModelState()).toEqual([14, 22]);
      expect(el.parent().hasClass('has-error')).toBe(false);
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });

    it('leaves view alone when hours are invalid and minutes are updated', function() {
      var hoursEl = getHoursInputEl(),
        minutesEl = getMinutesInputEl();

      changeInputValueTo(hoursEl, '25');
      hoursEl.blur();
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['25', '40', 'PM']);

      changeInputValueTo(minutesEl, '2');
      minutesEl.blur();
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['25', '2', 'PM']);
    });

    it('leaves view alone when minutes are invalid and hours are updated', function() {
      var hoursEl = getHoursInputEl(),
        minutesEl = getMinutesInputEl();

      changeInputValueTo(minutesEl, '61');
      minutesEl.blur();
      $rootScope.$digest();
      expect($rootScope.time).toBe(null);
      expect(getTimeState()).toEqual(['02', '61', 'PM']);

      changeInputValueTo(hoursEl, '2');
      hoursEl.blur();
      $rootScope.$digest();
      expect($rootScope.time).toBe(null);
      expect(getTimeState()).toEqual(['2', '61', 'PM']);
    });

    it('handles 12/24H mode change', function() {
      $rootScope.meridian = true;
      element = $compile('<uib-timepicker ng-model="time" show-meridian="meridian"></uib-timepicker>')($rootScope);
      $rootScope.$digest();

      var el = getHoursInputEl();

      changeInputValueTo(el, '16');
      expect($rootScope.time).toBe(null);
      expect(el.parent().hasClass('has-error')).toBe(true);
      expect(element.hasClass('ng-invalid-time')).toBe(true);

      $rootScope.meridian = false;
      $rootScope.$digest();
      expect(getTimeState(true)).toEqual(['16', '40']);
      expect(getModelState()).toEqual([16, 40]);
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });

    it('should have a default tabindex of 0', function() {
      element = $compile('<uib-timepicker ng-model="time"></uib-timepicker>')($rootScope);
      $rootScope.$digest();

      expect(element.isolateScope().tabindex).toBe(0);
    });

    it('should have the correct tabindex', function() {
      element = $compile('<uib-timepicker ng-model="time" tabindex="5"></uib-timepicker>')($rootScope);
      $rootScope.$digest();

      expect(element.attr('tabindex')).toBe(undefined);
      expect(element.isolateScope().tabindex).toBe('5');
    });
  });

  describe('when model is not a Date', function() {
    beforeEach(inject(function() {
      element = $compile('<uib-timepicker ng-model="time"></uib-timepicker>')($rootScope);
    }));

    it('should not be invalid when the model is null', function() {
      $rootScope.time = null;
      $rootScope.$digest();
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });

    it('should not be invalid when the model is undefined', function() {
      $rootScope.time = undefined;
      $rootScope.$digest();
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });

    it('should not be invalid when the model is a valid string date representation', function() {
      $rootScope.time = 'September 30, 2010 15:30:00';
      $rootScope.$digest();
      expect(element.hasClass('ng-invalid-time')).toBe(false);
      expect(getTimeState()).toEqual(['03', '30', 'PM']);
    });

    it('should be invalid when the model is not a valid string date representation', function() {
      $rootScope.time = 'pizza';
      $rootScope.$digest();
      expect(element.hasClass('ng-invalid-time')).toBe(true);
    });

    it('should return valid when the model becomes valid', function() {
      $rootScope.time = 'pizza';
      $rootScope.$digest();
      expect(element.hasClass('ng-invalid-time')).toBe(true);

      $rootScope.time = new Date();
      $rootScope.$digest();
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });

    it('should return valid when the model is cleared', function() {
      $rootScope.time = 'pizza';
      $rootScope.$digest();
      expect(element.hasClass('ng-invalid-time')).toBe(true);

      $rootScope.time = null;
      $rootScope.$digest();
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });
  });

  describe('use with `ng-required` directive', function() {
    beforeEach(inject(function() {
      $rootScope.time = null;
      element = $compile('<uib-timepicker ng-model="time" ng-required="true"></uib-timepicker>')($rootScope);
      $rootScope.$digest();
    }));

    it('should be invalid initially', function() {
      expect(element.hasClass('ng-invalid')).toBe(true);
    });

    it('should be valid if model has been specified', function() {
      $rootScope.time = new Date();
      $rootScope.$digest();
      expect(element.hasClass('ng-invalid')).toBe(false);
    });
  });

  describe('use with `ng-change` directive', function() {
    beforeEach(inject(function() {
      $rootScope.changeHandler = jasmine.createSpy('changeHandler');
      $rootScope.time = new Date();
      element = $compile('<uib-timepicker ng-model="time" ng-change="changeHandler()"></uib-timepicker>')($rootScope);
      $rootScope.$digest();
    }));

    it('should not be called initially', function() {
      expect($rootScope.changeHandler).not.toHaveBeenCalled();
    });

    it('should be called when hours / minutes buttons clicked', function() {
      var btn1 = getHoursButton(true);
      var btn2 = getMinutesButton(false);

      doClick(btn1, 2);
      doClick(btn2, 3);
      $rootScope.$digest();
      expect($rootScope.changeHandler.calls.count()).toBe(5);
    });

    it('should not be called when model changes programatically', function() {
      $rootScope.time = new Date();
      $rootScope.$digest();
      expect($rootScope.changeHandler).not.toHaveBeenCalled();
    });
  });

  describe('when used with min', function() {
    var changeInputValueTo;
    beforeEach(inject(function($sniffer) {
      element = $compile('<uib-timepicker ng-model="time" min="min"></uib-timepicker>')($rootScope);
      $rootScope.$digest();
      changeInputValueTo = function(inputEl, value) {
        inputEl.val(value);
        inputEl.trigger($sniffer.hasEvent('input') ? 'input' : 'change');
        $rootScope.$digest();
      };
    }));

    it('should not decrease hours when it would result in a time earlier than min', function() {
      var down = getHoursButton(false);
      var inputs = element.find('input');
      var hoursEl = inputs.eq(0);
      var downMouseWheelEvent = wheelThatMouse(-1);
      var downKeydownEvent = keydown('down');

      $rootScope.min = newTime(13, 41);
      $rootScope.$digest();

      expect(down.hasClass('disabled')).toBe(true);

      doClick(down);
      expect(getTimeState()).toEqual(['02', '40', 'PM']);
      expect(getModelState()).toEqual([14, 40]);

      hoursEl.trigger( downMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['02', '40', 'PM']);
      expect(getModelState()).toEqual([14, 40]);

      hoursEl.trigger( downKeydownEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['02', '40', 'PM']);
      expect(getModelState()).toEqual([14, 40]);
    });

    it('should decrease hours when it would not result in a time earlier than min', function() {
      var down = getHoursButton(false);
      var inputs = element.find('input');
      var hoursEl = inputs.eq(0);
      var downMouseWheelEvent = wheelThatMouse(-1);
      var downKeydownEvent = keydown('down');

      $rootScope.min = newTime(0, 0);
      $rootScope.$digest();

      expect(down.hasClass('disabled')).toBe(false);

      doClick(down);
      expect(getTimeState()).toEqual(['01', '40', 'PM']);
      expect(getModelState()).toEqual([13, 40]);

      hoursEl.trigger(downMouseWheelEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['12', '40', 'PM']);
      expect(getModelState()).toEqual([12, 40]);

      hoursEl.trigger(downKeydownEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['11', '40', 'AM']);
      expect(getModelState()).toEqual([11, 40]);
    });

    it('should not decrease minutes when it would result in a time ealier than min', function() {
      var down = getMinutesButton(false);
      var inputs = element.find('input');
      var minutesEl = inputs.eq(1);
      var downMouseWheelEvent = wheelThatMouse(-1);
      var downKeydownEvent = keydown('down');

      $rootScope.min = newTime(14, 40);
      $rootScope.$digest();

      expect(down.hasClass('disabled')).toBe(true);

      doClick(down);
      expect(getTimeState()).toEqual(['02', '40', 'PM']);
      expect(getModelState()).toEqual([14, 40]);

      minutesEl.trigger(downMouseWheelEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['02', '40', 'PM']);
      expect(getModelState()).toEqual([14, 40]);

      minutesEl.trigger(downKeydownEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['02', '40', 'PM']);
      expect(getModelState()).toEqual([14, 40]);
    });

    it('should decrease minutes when it would not result in a time ealier than min', function() {
      var down = getMinutesButton(false);
      var inputs = element.find('input');
      var minutesEl = inputs.eq(1);
      var downMouseWheelEvent = wheelThatMouse(-1);
      var downKeydownEvent = keydown('down');

      $rootScope.min = newTime(0, 0);
      $rootScope.$digest();

      expect(down.hasClass('disabled')).toBe(false);

      doClick(down);
      expect(getTimeState()).toEqual(['02', '39', 'PM']);
      expect(getModelState()).toEqual([14, 39]);

      minutesEl.trigger(downMouseWheelEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['02', '38', 'PM']);
      expect(getModelState()).toEqual([14, 38]);

      minutesEl.trigger(downKeydownEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['02', '37', 'PM']);
      expect(getModelState()).toEqual([14, 37]);
    });

    it('should not increase hours when time would rollover to a time earlier than min', function() {
      var up = getHoursButton(true);
      var inputs = element.find('input');
      var hoursEl = inputs.eq(0);
      var upMouseWheelEvent = wheelThatMouse(1);
      var upKeydownEvent = keydown('up');

      $rootScope.time = newTime(23, 59);
      $rootScope.min = newTime(13, 40);
      $rootScope.$digest();

      expect(up.hasClass('disabled')).toBe(true);

      doClick(up);
      expect(getTimeState()).toEqual(['11', '59', 'PM']);
      expect(getModelState()).toEqual([23, 59]);

      hoursEl.trigger(upMouseWheelEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['11', '59', 'PM']);
      expect(getModelState()).toEqual([23, 59]);

      hoursEl.trigger(upKeydownEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['11', '59', 'PM']);
      expect(getModelState()).toEqual([23, 59]);
    });

    it('should increase hours when time would rollover to a time not earlier than min', function() {
      var up = getHoursButton(true);
      var inputs = element.find('input');
      var hoursEl = inputs.eq(0);
      var upMouseWheelEvent = wheelThatMouse(1);
      var upKeydownEvent = keydown('up');

      $rootScope.min = newTime(0, 0);

      $rootScope.time = newTime(23, 59);
      $rootScope.$digest();

      expect(up.hasClass('disabled')).toBe(false);

      doClick(up);
      expect(getTimeState()).toEqual(['12', '59', 'AM']);
      expect(getModelState()).toEqual([0, 59]);

      $rootScope.time = newTime(23, 59);
      $rootScope.$digest();

      hoursEl.trigger(upMouseWheelEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['12', '59', 'AM']);
      expect(getModelState()).toEqual([0, 59]);

      $rootScope.time = newTime(23, 59);
      $rootScope.$digest();

      hoursEl.trigger(upKeydownEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['12', '59', 'AM']);
      expect(getModelState()).toEqual([0, 59]);
    });


    it('should not increase minutes when time would rollover to a time earlier than min', function() {
      var up = getMinutesButton(true);
      var inputs = element.find('input');
      var minutesEl = inputs.eq(1);
      var upMouseWheelEvent = wheelThatMouse(1);
      var upKeydownEvent = keydown('up');

      $rootScope.time = newTime(23, 59);
      $rootScope.min = newTime(13, 40);
      $rootScope.$digest();

      expect(up.hasClass('disabled')).toBe(true);

      doClick(up);
      expect(getTimeState()).toEqual(['11', '59', 'PM']);
      expect(getModelState()).toEqual([23, 59]);

      minutesEl.trigger(upMouseWheelEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['11', '59', 'PM']);
      expect(getModelState()).toEqual([23, 59]);

      minutesEl.trigger(upKeydownEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['11', '59', 'PM']);
      expect(getModelState()).toEqual([23, 59]);
    });

    it('should increase minutes when time would rollover to a time not earlier than min', function() {
      var up = getMinutesButton(true);
      var inputs = element.find('input');
      var minutesEl = inputs.eq(1);
      var upMouseWheelEvent = wheelThatMouse(1);
      var upKeydownEvent = keydown('up');

      $rootScope.min = newTime(0, 0);

      $rootScope.time = newTime(23, 59);
      $rootScope.$digest();

      expect(up.hasClass('disabled')).toBe(false);

      doClick(up);
      expect(getTimeState()).toEqual(['12', '00', 'AM']);
      expect(getModelState()).toEqual([0, 0]);

      $rootScope.time = newTime(23, 59);
      $rootScope.$digest();

      minutesEl.trigger(upMouseWheelEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['12', '00', 'AM']);
      expect(getModelState()).toEqual([0, 0]);

      $rootScope.time = newTime(23, 59);
      $rootScope.$digest();

      minutesEl.trigger(upKeydownEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['12', '00', 'AM']);
      expect(getModelState()).toEqual([0, 0]);
    });

    it('should not change meridian when it would result a in time earlier than min', function() {
      var button = getMeridianButton();

      $rootScope.min = newTime(2, 41);
      $rootScope.$digest();

      expect(button.hasClass('disabled')).toBe(true);

      doClick(button);
      expect(getTimeState()).toEqual(['02', '40', 'PM']);
      expect(getModelState()).toEqual([14, 40]);
    });

    it('should change meridian when it would not result in a time earlier than min', function() {
      var button = getMeridianButton();

      $rootScope.min = newTime(2, 39);
      $rootScope.$digest();

      expect(button.hasClass('disabled')).toBe(false);

      doClick(button);
      expect(getTimeState()).toEqual(['02', '40', 'AM']);
      expect(getModelState()).toEqual([2, 40]);
    });

    it('should return invalid when the hours are changes such that the time is earlier than min', function() {
      var inputs = element.find('input');
      var hoursEl = inputs.eq(0);

      $rootScope.min = newTime(14, 0);
      $rootScope.$digest();

      changeInputValueTo(hoursEl, 1);
      expect($rootScope.time).toBe(null);
      expect(hoursEl.parent().hasClass('has-error')).toBe(true);
      expect(element.hasClass('ng-invalid-time')).toBe(true);
    });

    it('should return valid when the hours are changes such that the time is not earlier than min', function() {
      var inputs = element.find('input');
      var hoursEl = inputs.eq(0);

      $rootScope.min = newTime(14, 41);
      $rootScope.$digest();

      changeInputValueTo(hoursEl, 3);
      expect(getTimeState()).toEqual(['3', '40', 'PM']);
      expect(getModelState()).toEqual([15, 40]);
      expect(hoursEl.parent().hasClass('has-error')).toBe(false);
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });

    it('should return invalid when the minutes are changes such that the time is earlier than min', function() {
      var inputs = element.find('input');
      var minutesEl = inputs.eq(1);

      $rootScope.min = newTime(14, 30);
      $rootScope.$digest();

      changeInputValueTo(minutesEl, 1);
      expect($rootScope.time).toBe(null);
      expect(minutesEl.parent().hasClass('has-error')).toBe(true);
      expect(element.hasClass('ng-invalid-time')).toBe(true);
    });

    it('should return valid when the minutes are changes such that the time is not earlier than min', function() {
      var inputs = element.find('input');
      var minutesEl = inputs.eq(1);

      $rootScope.min = newTime(14, 41);
      $rootScope.$digest();

      changeInputValueTo(minutesEl, 42);
      expect(getTimeState()).toEqual(['02', '42', 'PM']);
      expect(getModelState()).toEqual([14, 42]);
      expect(minutesEl.parent().hasClass('has-error')).toBe(false);
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });
  });

  describe('when used with max', function() {
    var changeInputValueTo;
    beforeEach(inject(function($sniffer) {
      element = $compile('<timepicker ng-model="time" max="max"></timepicker>')($rootScope);
      $rootScope.$digest();
      changeInputValueTo = function (inputEl, value) {
        inputEl.val(value);
        inputEl.trigger($sniffer.hasEvent('input') ? 'input' : 'change');
        $rootScope.$digest();
      };
    }));

    it('should not increase hours when it would result in a time later than max', function() {
      var up = getHoursButton(true);
      var inputs = element.find('input');
      var hoursEl = inputs.eq(0);
      var upMouseWheelEvent = wheelThatMouse(1);
      var upKeydownEvent = keydown('up');

      $rootScope.max = newTime(15, 39);
      $rootScope.$digest();

      expect(up.hasClass('disabled')).toBe(true);

      doClick(up);
      expect(getTimeState()).toEqual(['02', '40', 'PM']);
      expect(getModelState()).toEqual([14, 40]);

      hoursEl.trigger(upMouseWheelEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['02', '40', 'PM']);
      expect(getModelState()).toEqual([14, 40]);

      hoursEl.trigger(upKeydownEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['02', '40', 'PM']);
      expect(getModelState()).toEqual([14, 40]);
    });

    it('should increase hours when it would not result in a time later than max', function() {
      var up = getHoursButton(true);
      var inputs = element.find('input');
      var hoursEl = inputs.eq(0);
      var upMouseWheelEvent = wheelThatMouse(1);
      var upKeydownEvent = keydown('up');

      $rootScope.max = newTime(23, 59);
      $rootScope.$digest();

      expect(up.hasClass('disabled')).toBe(false);

      doClick(up);
      expect(getTimeState()).toEqual(['03', '40', 'PM']);
      expect(getModelState()).toEqual([15, 40]);

      hoursEl.trigger(upMouseWheelEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['04', '40', 'PM']);
      expect(getModelState()).toEqual([16, 40]);

      hoursEl.trigger(upKeydownEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['05', '40', 'PM']);
      expect(getModelState()).toEqual([17, 40]);
    });

    it('should not increase minutes when it would result in a time later than max', function() {
      var up = getMinutesButton(true);
      var inputs = element.find('input');
      var minutesEl = inputs.eq(1);
      var upMouseWheelEvent = wheelThatMouse(1);
      var upKeydownEvent = keydown('up');

      $rootScope.max = newTime(14, 40);
      $rootScope.$digest();

      expect(up.hasClass('disabled')).toBe(true);

      doClick(up);
      expect(getTimeState()).toEqual(['02', '40', 'PM']);
      expect(getModelState()).toEqual([14, 40]);

      minutesEl.trigger(upMouseWheelEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['02', '40', 'PM']);
      expect(getModelState()).toEqual([14, 40]);

      minutesEl.trigger(upKeydownEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['02', '40', 'PM']);
      expect(getModelState()).toEqual([14, 40]);
    });

    it('should increase minutes when it would not result in a time later than max', function() {
      var up = getMinutesButton(true);
      var inputs = element.find('input');
      var minutesEl = inputs.eq(1);
      var upMouseWheelEvent = wheelThatMouse(1);
      var upKeydownEvent = keydown('up');

      $rootScope.max = newTime(23, 59);
      $rootScope.$digest();

      expect(up.hasClass('disabled')).toBe(false);

      doClick(up);
      expect(getTimeState()).toEqual(['02', '41', 'PM']);
      expect(getModelState()).toEqual([14, 41]);

      minutesEl.trigger(upMouseWheelEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['02', '42', 'PM']);
      expect(getModelState()).toEqual([14, 42]);

      minutesEl.trigger(upKeydownEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['02', '43', 'PM']);
      expect(getModelState()).toEqual([14, 43]);
    });

    it('should not decrease hours when time would rollover to a time later than max', function() {
      var down = getHoursButton(false);
      var inputs = element.find('input');
      var hoursEl = inputs.eq(0);
      var downMouseWheelEvent = wheelThatMouse(-1);
      var downKeydownEvent = keydown('down');

      $rootScope.time = newTime(0, 0);
      $rootScope.max = newTime(13, 40);
      $rootScope.$digest();

      expect(down.hasClass('disabled')).toBe(true);

      doClick(down);
      expect(getTimeState()).toEqual(['12', '00', 'AM']);
      expect(getModelState()).toEqual([0, 0]);

      hoursEl.trigger(downMouseWheelEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['12', '00', 'AM']);
      expect(getModelState()).toEqual([0, 0]);

      hoursEl.trigger(downKeydownEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['12', '00', 'AM']);
      expect(getModelState()).toEqual([0, 0]);
    });

    it('should decrease hours when time would rollover to a time not later than max', function() {
      var down = getHoursButton(false);
      var inputs = element.find('input');
      var hoursEl = inputs.eq(0);
      var downMouseWheelEvent = wheelThatMouse(-1);
      var downKeydownEvent = keydown('down');

      $rootScope.max = newTime(23, 59);

      $rootScope.time = newTime(0, 0);
      $rootScope.$digest();

      expect(down.hasClass('disabled')).toBe(false);

      doClick(down);
      expect(getTimeState()).toEqual(['11', '00', 'PM']);
      expect(getModelState()).toEqual([23, 0]);

      $rootScope.time = newTime(0, 0);
      $rootScope.$digest();

      hoursEl.trigger(downMouseWheelEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['11', '00', 'PM']);
      expect(getModelState()).toEqual([23, 0]);

      $rootScope.time = newTime(0, 0);
      $rootScope.$digest();

      hoursEl.trigger(downKeydownEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['11', '00', 'PM']);
      expect(getModelState()).toEqual([23, 0]);
    });

    it('should not decrease minutes when time would rollover to a time later than max', function() {
      var down = getMinutesButton(false);
      var inputs = element.find('input');
      var minutesEl = inputs.eq(1);
      var downMouseWheelEvent = wheelThatMouse(-1);
      var downKeydownEvent = keydown('down');

      $rootScope.time = newTime(0, 0);
      $rootScope.max = newTime(13, 40);
      $rootScope.$digest();

      expect(down.hasClass('disabled')).toBe(true);

      doClick(down);
      expect(getTimeState()).toEqual(['12', '00', 'AM']);
      expect(getModelState()).toEqual([0, 0]);

      minutesEl.trigger(downMouseWheelEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['12', '00', 'AM']);
      expect(getModelState()).toEqual([0, 0]);

      minutesEl.trigger(downKeydownEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['12', '00', 'AM']);
      expect(getModelState()).toEqual([0, 0]);
    });

    it('should decrease minutes when time would rollover to a time not later than max', function() {
      var down = getMinutesButton(false);
      var inputs = element.find('input');
      var minutesEl = inputs.eq(1);
      var downMouseWheelEvent = wheelThatMouse(-1);
      var downKeydownEvent = keydown('down');

      $rootScope.max = newTime(23, 59);

      $rootScope.time = newTime(0, 0);
      $rootScope.$digest();

      expect(down.hasClass('disabled')).toBe(false);

      doClick(down);
      expect(getTimeState()).toEqual(['11', '59', 'PM']);
      expect(getModelState()).toEqual([23, 59]);

      $rootScope.time = newTime(0, 0);
      $rootScope.$digest();

      minutesEl.trigger(downMouseWheelEvent);
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['11', '59', 'PM']);
      expect(getModelState()).toEqual([23, 59]);

      $rootScope.time = newTime(0, 0);
      $rootScope.$digest();

      minutesEl.trigger( downKeydownEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['11', '59', 'PM']);
      expect(getModelState()).toEqual([23, 59]);
    });

    it('should not change meridian when it would result a in time later than max', function() {
      var button = getMeridianButton();

      $rootScope.time = newTime(2, 40);
      $rootScope.max = newTime(14, 39);
      $rootScope.$digest();

      expect(button.hasClass('disabled')).toBe(true);

      doClick(button);
      expect(getTimeState()).toEqual(['02', '40', 'AM']);
      expect(getModelState()).toEqual([2, 40]);
    });

    it('should change meridian when it would not result in a time later than max', function() {
      var button = getMeridianButton();

      $rootScope.time = newTime(2, 40);
      $rootScope.max = newTime(14, 41);
      $rootScope.$digest();

      expect(button.hasClass('disabled')).toBe(false);

      doClick(button);
      expect(getTimeState()).toEqual(['02', '40', 'PM']);
      expect(getModelState()).toEqual([14, 40]);
    });

    it('should return invalid when the hours are changes such that the time is later than max', function() {
      var inputs = element.find('input');
      var hoursEl = inputs.eq(0);

      $rootScope.max = newTime(14, 0);
      $rootScope.$digest();

      changeInputValueTo(hoursEl, 3);
      expect($rootScope.time).toBe(null);
      expect(hoursEl.parent().hasClass('has-error')).toBe(true);
      expect(element.hasClass('ng-invalid-time')).toBe(true);
    });

    it('should return valid when the hours are changes such that the time is not later than max', function() {
      var inputs = element.find('input');
      var hoursEl = inputs.eq(0);

      $rootScope.max = newTime(15, 41);
      $rootScope.$digest();

      changeInputValueTo(hoursEl, 3);
      expect(getTimeState()).toEqual(['3', '40', 'PM']);
      expect(getModelState()).toEqual([15, 40]);
      expect(hoursEl.parent().hasClass('has-error')).toBe(false);
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });

    it('should return invalid when the minutes are changes such that the time is later than max', function() {
      var inputs = element.find('input');
      var minutesEl = inputs.eq(1);

      $rootScope.max = newTime(14, 50);
      $rootScope.$digest();

      changeInputValueTo(minutesEl, 51);
      expect($rootScope.time).toBe(null);
      expect(minutesEl.parent().hasClass('has-error')).toBe(true);
      expect(element.hasClass('ng-invalid-time')).toBe(true);
    });

    it('should return valid when the minutes are changes such that the time is not later than max', function() {
      var inputs = element.find('input');
      var minutesEl = inputs.eq(1);

      $rootScope.max = newTime(14, 42);
      $rootScope.$digest();

      changeInputValueTo(minutesEl, 41);
      expect(getTimeState()).toEqual(['02', '41', 'PM']);
      expect(getModelState()).toEqual([14, 41]);
      expect(minutesEl.parent().hasClass('has-error')).toBe(false);
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });
  });

  describe('custom template and controllerAs', function() {
    it('should allow custom templates', function() {
      $templateCache.put('foo/bar.html', '<div>baz</div>');

      element = $compile('<uib-timepicker ng-model="time" template-url="foo/bar.html"></uib-timepicker>')($rootScope);
      $rootScope.$digest();
      expect(element[0].tagName.toLowerCase()).toBe('div');
      expect(element.html()).toBe('baz');
    });

    it('should expose the controller on the view', function() {
      $templateCache.put('template/timepicker/timepicker.html', '<div><div>{{timepicker.text}}</div></div>');

      element = $compile('<uib-timepicker ng-model="time"></uib-timepicker>')($rootScope);
      $rootScope.$digest();

      var ctrl = element.controller('uibTimepicker');
      expect(ctrl).toBeDefined();

      ctrl.text = 'foo';
      $rootScope.$digest();

      expect(element.html()).toBe('<div class="ng-binding">foo</div>');
    });
  });
});

/* Deprecation tests below */

describe('timepicker deprecation', function() {
  beforeEach(module('ui.bootstrap.timepicker'));
  beforeEach(module('ngAnimateMock'));
  beforeEach(module('template/timepicker/timepicker.html'));

  it('should suppress warning', function() {
    module(function($provide) {
      $provide.value('$timepickerSuppressWarning', true);
    });

    inject(function($compile, $log, $rootScope) {
      spyOn($log, 'warn');

      $rootScope.time = new Date().setHours(14, 40, 0, 0);
      var element = '<timepicker ng-model="time"></timepicker>';
      element = $compile(element)($rootScope);
      $rootScope.$digest();
      expect($log.warn.calls.count()).toBe(0);
    });
  });

  it('should give warning by default', inject(function($compile, $log, $rootScope) {
    spyOn($log, 'warn');

      $rootScope.time = new Date().setHours(14, 40, 0, 0);
    var element = '<timepicker ng-model="time"></timepicker>';
    element = $compile(element)($rootScope);
    $rootScope.$digest();

    expect($log.warn.calls.count()).toBe(2);
    expect($log.warn.calls.argsFor(0)).toEqual(['TimepickerController is now deprecated. Use UibTimepickerController instead.']);
    expect($log.warn.calls.argsFor(1)).toEqual(['timepicker is now deprecated. Use uib-timepicker instead.']);
  }));
});
