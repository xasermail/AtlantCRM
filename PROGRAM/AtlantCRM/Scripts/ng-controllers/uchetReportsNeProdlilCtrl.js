"use strict";

// контроллер
myApp.controller("uchetReportsNeProdlilCtrl", function uchetReportsNeProdlilCtrl($scope, $http) {
  
  var i = 0;
  var j = 0;
  var k = 0;
  var l = 0;

  // событие при открытии вкладки
  $scope.$on("global.selectedUchetReportsSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == 5) {
      if (typeof $scope.DT_FROM === "undefined") $scope.DT_FROM = new Date();
      if (typeof $scope.DT_TO === "undefined") $scope.DT_TO = new Date();

      $scope.previewPrint = 0;
      $scope.refreshNeProdlil();
    }

  });

  $scope.refreshNeProdlil = function refreshNeProdlil() {
    $scope.data = [];
    $scope.global.showWaitingForm("Получение данных не продленных абонементов...");

    $http({
      "method": "POST",
      "url": "/Home/UchetReportsNeProdlilData",
      params: {
        date0: $scope.DT_FROM,
        date1: $scope.DT_TO
      }
    }).then(function uchetNeProdlilSuccess(data) {

      $scope.data = data.data;
      $scope.global.hideWaitingForm();

    }, function uchetNeProdlilFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

  $scope.openAnkRej = function (o_ank_id) {
    if ((o_ank_id === "null") || (o_ank_id === null) || (typeof o_ank_id === "undefined")) return false;
    $scope.global.openAnk(o_ank_id);
  };

  $scope.print = function print() {
    var w = window.open("/Home/PrintNeprodlil");
    w.printData = {};
    w.printData.REPORT_NAME = "Не продленные абонементы";
    w.printData.DT_FROM = $scope.DT_FROM;
    w.printData.DT_TO = $scope.DT_TO;
    w.printData.data = $scope.data;
  }
});