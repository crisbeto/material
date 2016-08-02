angular
  .module('progressCircularDemo1', ['ngMaterial'])
  .controller('AppCtrl', ['$interval', '$scope', '$mdDialog',
    function($interval, $scope, $mdDialog) {
      $scope.people = [];
          for (i = 0; i < 500; i++) {
            $scope.people.push(i);
          }

          $scope.goToPerson = function(person, event) {
            $mdDialog.show(
              $mdDialog.alert()
              .title('Navigating')
              .textContent('Inspect ' + person)
              .ariaLabel('Person inspect demo')
              .ok('Neat!')
              .targetEvent(event)
            );
          };
    }
  ]);
