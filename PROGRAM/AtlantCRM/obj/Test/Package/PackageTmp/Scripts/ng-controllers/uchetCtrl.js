"use strict";

// контроллер
myApp.controller("uchetCtrl", function uchetCtrl($scope, $http) {
  var i = 0;

  // событие при открытии вкладки
  $scope.$on("global.selectedMenuItemChanged", function selectedMenuItemChanged(event, newValue) {
    if (newValue === "menuItemUchet") {

    }
  });

});