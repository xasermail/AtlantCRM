"use strict";

// контроллер
myApp.controller("telephonyCtrl", function telephonyCtrl($scope, $http) {
  var i = 0;

  // событие при открытии вкладки
  $scope.$on("global.selectedAppSubMenuItem", function selectedSubMenuItemChanged(event, newValue) {

    if (newValue == "0") {

      $scope.openRej();

    }

  });

});