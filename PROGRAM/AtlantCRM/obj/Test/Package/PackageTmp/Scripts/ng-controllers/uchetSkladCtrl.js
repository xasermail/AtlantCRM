"use strict";

// контроллер
myApp.controller("uchetSkladCtrl", function uchetSkladCtrl($scope, $http) {
  var i = 0;

  // событие при открытии вкладки
  $scope.$on("global.selectedUchetSubMenuItemChanged", function selectedSubMenuItemChanged(event, newValue) {
    if (newValue === 1) {
      $scope.sklad_pr = {};
      $scope.sklad_pr.DT_FROM = new Date();
      $scope.sklad_pr.DT_TO = new Date();
      refreshSklad();
    }
  });

  function refreshSklad() {
    $scope.sklad = [];
    $scope.global.showWaitingForm("Получение данных склада...");

    $http({
      "method": "GET",
      "url": "/Home/GetSkladDataRequest"
    }).then(function uchetSkladSuccess(data) {
      var kolvo = 0;
      var summa = 0;

      var d = data.data;
      for (var i = 0; i < d.length; i++) {

        kolvo = kolvo + d[i]["KOLVO"];
        summa = summa + d[i]["COST"];

        $scope.sklad.push({
          name: d[i]["NAME"],
          kolvo: d[i]["KOLVO"],
          cost: d[i]["COST"]
        });
      }

      if (typeof data.data !== "undefined") {
        if (data.data.length === 0) {
          $scope.sklad.push({
            NAME: ""
          });
        } else {
          $scope.sklad.push({
            name: "Итого:",
            kolvo: kolvo,
            cost: summa
          });
        }
      }

      $scope.global.hideWaitingForm();

    }, function uchetSkladFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

  $scope.printPr = function printPr() {   
    $scope.global.showWaitingForm("Получение данных о приходах...");
    var w = window.open("/Home/PrintPrihod");

    $http({
      "method": "POST",
      "url": "/Home/GetPrihodData",
      params: {
        dtFrom: $scope.sklad_pr.DT_FROM,
        dtTo: $scope.sklad_pr.DT_TO
      }
    }).then(function uchetPrihodSuccess(data) {
      var printData = {};

      printData.dtfrom = $scope.sklad_pr.DT_FROM;
      printData.dtto = $scope.sklad_pr.DT_TO;

      printData.data = [];
      var sum = 0;

      for (var i = 0; i < data.data.length; i++) {
        printData.data.push({
          N_SCHET: data.data[i]["N_SCHET"],
          D_SCHET: data.data[i]["D_SCHET"],
          NAME: data.data[i]["NAME"],
          KOLVO: data.data[i]["KOLVO"]
        });

        sum += parseInt(data.data[i]["KOLVO"]);
      }

      printData.data.push({
        N_SCHET: "Итого",
        KOLVO: sum
      });

      $scope.global.hideWaitingForm();

      w.printData = printData;

    }, function uchetPrihodFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

});