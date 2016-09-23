/**
 * @ngdoc module
 * @name material.components.bottomSheet
 * @description
 * BottomSheet
 */
angular
  .module('material.components.bottomSheet', [
    'material.core',
    'material.components.panel'
  ])
  .directive('mdBottomSheet', MdBottomSheetDirective)
  .service('$mdBottomSheet', MdBottomSheetService);


function MdBottomSheetDirective() {
  return {
    restrict: 'E',
    compile: function(tElement) {
      tElement.addClass('_md');     // private md component indicator for styling
    }
  };
}


/**
 * @ngdoc service
 * @name $mdBottomSheet
 * @module material.components.bottomSheet
 *
 * @description
 * `$mdBottomSheet` opens a bottom sheet over the app and provides a simple promise API.
 *
 * ## Restrictions
 *
 * - The bottom sheet's template must have an outer `<md-bottom-sheet>` element.
 * - Add the `md-grid` class to the bottom sheet for a grid layout.
 * - Add the `md-list` class to the bottom sheet for a list layout.
 *
 * @usage
 * <hljs lang="html">
 * <div ng-controller="MyController">
 *   <md-button ng-click="openBottomSheet()">
 *     Open a Bottom Sheet!
 *   </md-button>
 * </div>
 * </hljs>
 * <hljs lang="js">
 * var app = angular.module('app', ['ngMaterial']);
 * app.controller('MyController', function($scope, $mdBottomSheet) {
 *   $scope.openBottomSheet = function() {
 *     $mdBottomSheet.show({
 *       template: '<md-bottom-sheet>Hello!</md-bottom-sheet>'
 *     });
 *   };
 * });
 * </hljs>
 */

 /**
 * @ngdoc method
 * @name $mdBottomSheet#show
 *
 * @description
 * Show a bottom sheet with the specified options.
 *
 * @param {object} options An options object, with the following properties:
 *
 *   - `templateUrl` - `{string=}`: The url of an html template file that will
 *   be used as the content of the bottom sheet. Restrictions: the template must
 *   have an outer `md-bottom-sheet` element.
 *   - `template` - `{string=}`: Same as templateUrl, except this is an actual
 *   template string.
 *   - `scope` - `{object=}`: the scope to link the template / controller to. If none is specified, it will create a new child scope.
 *     This scope will be destroyed when the bottom sheet is removed unless `preserveScope` is set to true.
 *   - `preserveScope` - `{boolean=}`: whether to preserve the scope when the element is removed. Default is false
 *   - `controller` - `{string=}`: The controller to associate with this bottom sheet.
 *   - `locals` - `{string=}`: An object containing key/value pairs. The keys will
 *   be used as names of values to inject into the controller. For example,
 *   `locals: {three: 3}` would inject `three` into the controller with the value
 *   of 3.
 *   - `clickOutsideToClose` - `{boolean=}`: Whether the user can click outside the bottom sheet to
 *     close it. Default true.
 *   - `disableBackdrop` - `{boolean=}`: When set to true, the bottomsheet will not show a backdrop.
 *   - `escapeToClose` - `{boolean=}`: Whether the user can press escape to close the bottom sheet.
 *     Default true.
 *   - `resolve` - `{object=}`: Similar to locals, except it takes promises as values
 *   and the bottom sheet will not open until the promises resolve.
 *   - `controllerAs` - `{string=}`: An alias to assign the controller to on the scope.
 *   - `parent` - `{element=}`: The element to append the bottom sheet to. The `parent` may be a `function`, `string`,
 *   `object`, or null. Defaults to appending to the body of the root element (or the root element) of the application.
 *   e.g. angular.element(document.getElementById('content')) or "#content"
 *   - `disableParentScroll` - `{boolean=}`: Whether to disable scrolling while the bottom sheet is open.
 *     Default true.
 *
 * @returns {promise} A promise that can be resolved with `$mdBottomSheet.hide()` or
 * rejected with `$mdBottomSheet.cancel()`.
 */

/**
 * @ngdoc method
 * @name $mdBottomSheet#hide
 *
 * @description
 * Hide the existing bottom sheet and resolve the promise returned from
 * `$mdBottomSheet.show()`. This call will close the most recently opened/current bottomsheet (if any).
 *
 * @param {*=} response An argument for the resolved promise.
 *
 */

/**
 * @ngdoc method
 * @name $mdBottomSheet#cancel
 *
 * @description
 * Hide the existing bottom sheet and reject the promise returned from
 * `$mdBottomSheet.show()`.
 *
 * @param {*=} response An argument for the rejected promise.
 *
 */


// TODO:
// - grid example pushes content up for some reason
// - exit animation doesn't work when swiping up and releasing over the backdrop -
// can be fixed by adding pointer-events: none to the wrapper, but that breaks the old behavior
function MdBottomSheetService($mdPanel, $mdUtil, $q, $log, $mdGesture,
  $mdConstant, $mdTheming) {
  // how fast we need to flick down to close the sheet, pixels/ms
  var CLOSING_VELOCITY = 0.5;
  var PADDING = 80; // same as css
  var currentPanel = null; // current open bottom sheet

  var service = {
    show: show,
    hide: closeFunctionFactory(true),
    cancel: closeFunctionFactory(),
    destroy: destroy
  };

  var DEFAULTS = {
    escapeToClose: true,
    clickOutsideToClose: true,
    disableParentScroll: true,
    focusOnOpen: true
  };

  var panelOptions = {
    onDomAdded: onShow,
    onDomRemoved: service.cancel,
    position: $mdPanel.newPanelPosition().absolute().bottom(0).left(0),
    animation: $mdPanel.newPanelAnimation().withAnimation({
      open: 'md-bottom-sheet-animate-open',
      close: 'md-bottom-sheet-animate-close'
    })
  };

  return service;

  function show(userConfig) {
    var options = angular.extend({}, DEFAULTS, userConfig, panelOptions);

    // Map the old interimElement options to their mdPanel equivalents
    // in order to keep backwards compatibility.
    options.hasBackdrop = !userConfig.disableBackdrop;
    if (userConfig.parent) options.attachTo = userConfig.parent;

    destroy();
    currentPanel = $mdPanel.create(options);
    currentPanel.open();
    currentPanel.bottomSheetDeferred = $q.defer();

    return currentPanel.bottomSheetDeferred.promise;
  }

  function closeFunctionFactory(shouldResolve) {
    return function(response) {
      if (currentPanel) {
        currentPanel.close().then(function(panelRef) {
          panelRef.bottomSheetDeferred[shouldResolve ? 'resolve' : 'reject'](response);
          destroy();
        });
      }
    };
  }

  function destroy() {
    if (currentPanel) {
      if (!currentPanel.config.preserveScope) {
        currentPanel.destroy();
      }

      currentPanel.cleanupGestures();
      currentPanel.detach();
      currentPanel = null;
    }
  }

  function onShow() {
    var element = angular.element(currentPanel.panelEl[0].querySelector('md-bottom-sheet'));

    currentPanel.panelEl.addClass('md-bottom-sheet-wrapper');

    // prevent tab focus or click focus on the bottom-sheet container
    element.attr('tabindex', '-1');

    $mdTheming.inherit(element, angular.element(currentPanel.config.attachTo));
    currentPanel.cleanupGestures = addGestures(currentPanel.panelEl, currentPanel.panelContainer);
  }

  /**
   * Applies gestures to the bottom sheet element.
   */
  function addGestures(element, wrapper) {
    var deregister = $mdGesture.register(wrapper, 'drag', { horizontal: false });
    wrapper.on('$md.dragstart', onDragStart)
      .on('$md.drag', onDrag)
      .on('$md.dragend', onDragEnd);

    return function cleanupGestures() {
      deregister();
      wrapper.off('$md.dragstart', onDragStart);
      wrapper.off('$md.drag', onDrag);
      wrapper.off('$md.dragend', onDragEnd);
    };

    function onDragStart(ev) {
      // Disable transitions on transform so that it feels fast
      element.css($mdConstant.CSS.TRANSITION_DURATION, '0ms');
    }

    function onDrag(ev) {
      var transform = ev.pointer.distanceY;
      if (transform < 5) {
        // Slow down drag when trying to drag up, and stop after PADDING
        transform = Math.max(-PADDING, transform / 2);
      }
      element.css($mdConstant.CSS.TRANSFORM, 'translateY(' + (PADDING + transform) + 'px)');
    }

    function onDragEnd(ev) {
      if (ev.pointer.distanceY > 0 &&
          (ev.pointer.distanceY > 20 || Math.abs(ev.pointer.velocityY) > CLOSING_VELOCITY)) {
        var distanceRemaining = element.prop('offsetHeight') - ev.pointer.distanceY;
        var transitionDuration = Math.min(distanceRemaining / ev.pointer.velocityY * 0.75, 500);

        element.css($mdConstant.CSS.TRANSITION_DURATION, transitionDuration + 'ms');
        $mdUtil.nextTick(service.cancel, true);
      } else {
        element.css($mdConstant.CSS.TRANSITION_DURATION, '');
        element.css($mdConstant.CSS.TRANSFORM, '');
      }
    }
  }
}
