"use strict";

var scopeOpovCtrl;

// контроллер
myApp.controller("opovCtrl", function opovCtrl($scope, $http, $parse) {

  scopeOpovCtrl = $scope;

  // список оповещений
  $scope.opovList = [];

 

  // событие при открытии вкладки
  $scope.$on("global.selectedDilerSubMenuItemChanged", function selectedDilerASubMenuItemChanged(event, newValue) {

    if (newValue == "1") {

      $scope.refresh();

    }

  });


  $scope.refresh = function refresh() {

    $scope.global.showWaitingForm("Получение оповещений...");

    $http({
      "method": "GET",
      "url": "/Home/GetOpovList",
      params: {

      }
    }).then((data) => {

      $scope.opovList = data.data;

      $scope.global.hideWaitingForm();

    });



  };


});