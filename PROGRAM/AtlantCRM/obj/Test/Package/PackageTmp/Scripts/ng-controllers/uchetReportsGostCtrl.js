"use strict";

// контроллер
myApp.controller("uchetReportsGostCtrl", function uchetReportsGostCtrl($scope, $http) {
  
  // событие при открытии вкладки
  $scope.$on("global.selectedUchetReportsSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == 6) {
      if (typeof $scope.DT_FROM === "undefined") $scope.DT_FROM = new Date();
      if (typeof $scope.DT_TO === "undefined") $scope.DT_TO = new Date();

      $scope.previewPrint = 0;
      $scope.refreshGost();
    }

  });

  $scope.refreshGost = function refreshGost() {
    $scope.data = [];
    $scope.global.showWaitingForm("Получение данных посетителей из других салонов...");

    $http({
      "method": "POST",
      "url": "/Home/UchetReportsGostData",
      params: {
        date0: $scope.DT_FROM,
        date1: $scope.DT_TO
      }
    }).then(function uchetGostSuccess(data) {

      $scope.data = [];
      $scope.data = data.data;
      $scope.global.hideWaitingForm();

    }, function uchetGostFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

  $scope.print = function print() {
    var w = window.open("/Home/PrintGost");
    w.printData = {};
    w.printData.REPORT_NAME = "Гость";
    w.printData.DT_FROM = $scope.DT_FROM;
    w.printData.DT_TO = $scope.DT_TO;
    w.printData.data = $scope.data;
  }
});