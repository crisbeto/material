(function () {
  'use strict';

    angular
      .module('virtualRepeatInfiniteScrollDemo', ['ngMaterial'])
      .controller('AppCtrl', function($timeout) {
        var vm = this;

        vm.items = [];

        for(var i = 1; i <= 100; i++) {
          vm.items.push({ value: i });
        }

        vm.infiniteItems = {
          getItemAtIndex: function(i) {
            return vm.items[i];
          },
          getLength: function() {
            return vm.items.length;
          }
        };
      });

})();
