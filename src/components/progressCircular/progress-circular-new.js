angular.module('material.components.progressCircularNew', ['material.core'])
.directive('mdProgressCircularNew', MdProgressCircularNewDirective);

function MdProgressCircularNewDirective($window) {
  var DEFAULT_PROGRESS_SIZE = 100;
  var DEFAULT_STROKE_WIDTH = 10;
  var DEFAULT_ANIMATION_DURATION = 100;
  var TAU = $window.Math.PI * 2;

  return {
    restrict: 'E',
    scope: {
      value: '@',
      mdDiameter: '@'
    },
    template: function(element, attrs) {
      return '<svg xmlns="http://www.w3.org/2000/svg">' +
        '<'+ (attrs.hasOwnProperty('strokeDasharray') ? 'circle' : 'path') +
        ' fill="none" stroke-width="'+ DEFAULT_STROKE_WIDTH +'"/>' +
      '</svg>';
    },
    compile: function(element, attrs) {
      if(attrs.hasOwnProperty('strokeDasharray')){
        return dashArrayLink;
      }

      return arcLink;
    }
  };

  function dashArrayLink(scope, element) {
   var svg = angular.element(element[0].querySelector('svg'));
   var circle = angular.element(element[0].querySelector('circle'));

   scope.$watchGroup(['value', 'mdDiameter'], function(newValue){
     var diameter = newValue[1] || DEFAULT_PROGRESS_SIZE;
     var circleRadius = (diameter - DEFAULT_STROKE_WIDTH)/2;
     var circumference = TAU * circleRadius;
     var value = clamp(newValue[0])/100;

     // technically this should also be the radius, but it shouldn't
     // take the stroke width into account
     var position = diameter/2;

     svg.css({
       width: diameter + 'px',
       height: diameter + 'px'
     });

     svg[0].setAttribute('viewBox', '0 0 ' + diameter + ' ' + diameter);

     circle.css({
      // note that IE doesn't seem to transition this one.
      // Edge only works if the units are included.
      'stroke-dashoffset': (1 - value) * circumference + 'px',
      'stroke-dasharray': circumference + 'px'
     }).attr({
      r: circleRadius,
      cx: position,
      cy: position,

      // this is more conveniently done in the CSS, however
      // rotating it with CSS doesn't appear to work in IE and Edge
      transform: 'rotate(-90, '+ position +', '+ position +')'
     });
   });
  }

  function arcLink(scope, element) {
    var svg = angular.element(element[0].querySelector('svg'));
    var path = angular.element(element[0].querySelector('path'));
    var lastAnimationId = 0;

    scope.$watchGroup(['value', 'mdDiameter'], function(newValue, oldValue){
      var animateFrom = clamp(oldValue[0]);
      var changeInValue = clamp(newValue[0]) - animateFrom;
      var animationDuration = DEFAULT_ANIMATION_DURATION;
      var startTime = new $window.Date();
      var diameter = newValue[1] || DEFAULT_PROGRESS_SIZE;

      svg.css({
        width: diameter + 'px',
        height: diameter + 'px'
      });

      svg[0].setAttribute('viewBox', '0 0 ' + diameter + ' ' + diameter);

      (function animation(){
        var currentTime = $window.Math.min(new Date() - startTime, animationDuration);
        var id = ++lastAnimationId;

        path.attr('d', getSvgArc(
          linearEase(currentTime, animateFrom, changeInValue, animationDuration),
          diameter - DEFAULT_STROKE_WIDTH,
          diameter
        ));

        if(id === lastAnimationId && currentTime < animationDuration){
          $window.requestAnimationFrame(animation);
        }
      })();
    });
  }

  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  function getSvgArc(current, pathDiameter, diameter) {
    var currentInDegrees = (current/100)*359.9999;
    var radius = diameter/2;
    var pathRadius = pathDiameter/2;
    var start = polarToCartesian(radius, radius, pathRadius, currentInDegrees);
    var end = polarToCartesian(radius, radius, pathRadius, 0);
    var arcSweep = (currentInDegrees <= 180 ? "0" : "1");

    return 'M ' + start.x + ' ' + start.y +
           'A ' + pathRadius + ' ' + pathRadius +
           ' ' + 0 + ' ' + arcSweep + ' ' + 0 + ' ' + end.x + ' ' + end.y;
  }

  function easeOutCubic(t, b, c, d) {
    return c*((t=t/d-1)*t*t + 1) + b;
  }

  function linearEase(t, b, c, d) {
    return c * t / d + b;
  }

  function clamp(value) {
    return Math.max(0, Math.min(value || 0, 100));
  }
}
