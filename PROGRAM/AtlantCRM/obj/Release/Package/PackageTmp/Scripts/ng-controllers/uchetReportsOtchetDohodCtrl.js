"use strict";

// контроллер
myApp.controller("uchetReportsOtchetDohodCtrl", function uchetReportsOtchetDohodCtrl($scope, $http) {
  
  var i = 0;
  // событие при открытии вкладки
  $scope.$on("global.selectedUchetReportsSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == 0) {
      if (typeof $scope.DT_FROM === "undefined") $scope.DT_FROM = new Date();
      if (typeof $scope.DT_TO === "undefined") $scope.DT_TO = new Date();

      $scope.previewPrint = 0;
      $scope.refreshOtchetDohod();
    }

  });

  $scope.refreshOtchetDohod = function refreshOtchetDohod() {
    $scope.buh = [];
    $scope.data = [];
    $scope.global.showWaitingForm("Получение данных отчета о доходах...");

    $http({
      "method": "POST",
      "url": "/Home/UchetReportsDohodData",
      params: {
        date0: $scope.DT_FROM,
        date1: $scope.DT_TO
      }
    }).then(function uchetOtchetDohodSuccess(data) {

      $scope.buh = data.data;

      if (typeof data.data !== "undefined") {
        if (data.data.length === 0) {
          $scope.buh.push({
            NAME: ""
          });
        }
      }

      $scope.global.hideWaitingForm();

    }, function uchetOtchetDohodFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });

    $http({
      "method": "POST",
      "url": "/Home/UchetReportsDohodDetRashodData",
      params: {
        date0: $scope.DT_FROM,
        date1: $scope.DT_TO
      }
    }).then(function uchetOtchetDohodSuccess(data) {

      $scope.data = data.data;

      var itogo = 0;
      if (typeof data.data !== "undefined") {
        for (var i = 0; i < data.data.length; i++) {
          itogo = itogo + data.data[i]["SUMMA"];
        }
      }

      if (typeof data.data !== "undefined") {
        if (data.data.length === 0) {
          $scope.data.push({
            KTO: ""
          });
        }
      }

      if (itogo !== 0) {
        $scope.data.push({
          D_SCHET: "Итого:",
          SUMMA: Math.round(parseFloat(itogo) * 100) / 100,
          BR: 1
        });
      }

      $scope.global.hideWaitingForm();

    }, function uchetOtchetDohodFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });

  }

  $scope.print = function print() {
    var w = window.open("/Home/PrintOtchetDohod");
    w.printData = {};
    w.printData.DT_FROM = $scope.DT_FROM;
    w.printData.DT_TO = $scope.DT_TO;
    w.printData.data = $scope.data;
  }


  // перейти в режим Расходные документы
  $scope.openRasDocRej = function openRasDocRej(Id) {
    $scope.global.openUchetSkladRasDoc(Id);
  };

});