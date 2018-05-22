"use strict";

// контроллер
myApp.controller("reportProdajiCtrl", function reportProdajiCtrl($scope, $http) {

  $scope.toDate = new Date();

  //дата (начало текущего месяца)  
  $scope.date0 = new Date($scope.toDate.getFullYear(), $scope.toDate.getMonth(), 1);
  //дата (текущий день)
  $scope.date1 = new Date();

  $scope.prim = function () {
    $scope.global.showWaitingForm("Загрузка портрета...");
    $http({
      method: "GET",
      url: "/Home/GetReportProdaji",
      params: {
        date0: $scope.date0,
        date1: $scope.date1
      }
    }).then(function GetReportProdajiSuccess(data) {

      if (typeof data.data.error !== "undefined") {
        $scope.global.showErrorAlert(data.data.error);
        return false;
      }

      $scope.portret = data.data[0];
      $scope.portret.kakdolgo = $scope.global.function.getNumEnding($scope.portret.kakdolgo, ['день', 'дня', 'дней']);
      //console.log($scope.portret);
    }).catch(function GetReportProdajiError(err) {

      $scope.global.showErrorAlert(err.data);

    }).finally(function GetReportProdajiFinally() {

      $scope.global.hideWaitingForm();

    });
  }


});