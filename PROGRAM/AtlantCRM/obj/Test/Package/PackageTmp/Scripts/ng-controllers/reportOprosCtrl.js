"use strict";

// контроллер
myApp.controller("reportOprosCtrl", function reportOprosCtrl($scope, $http) {

  $scope.toDate = new Date();
  //дата (начало текущего месяца)  
  $scope.date0 = new Date($scope.toDate.getFullYear(), $scope.toDate.getMonth(), 1);
  //дата (текущий день)
  $scope.date1 = new Date();
  var i = 0;

  // событие при открытии вкладки
  $scope.$on("global.selectedReportSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {
    if (newValue === 8) {
      if (typeof $scope.global.manual.M_VOPROS_TAB !== "undefined") {
        if ($scope.global.manual.M_VOPROS_TAB.length > 0) {
          $scope.M_VOPROS_TAB_ID = $scope.global.manual.M_VOPROS_TAB[0]["ID"];
        }
      }
      $scope.prim();
    }
  });

  $scope.prim = function prim () {
    $scope.global.showWaitingForm("Загрузка данных отчета...");
    $scope.opros = [];
    $scope.opros_header = {};
    $http({
      method: "GET",
      url: "/Home/GetReportOpros",
      params: {
        date0: $scope.date0,
        date1: $scope.date1
      }
    }).then(function GetReportOprosSuccess(data) {
      if (typeof data.data.error !== "undefined") {
        $scope.global.showErrorAlert(data.data.error);
        return false;
      }

      if (typeof data.data !== "undefined") {
        if (data.data.length !== 0) {
          $scope.opros_header = data.data[0];
          $scope.opros = data.data;
          $scope.opros.splice(0, 1);
        }
      }
    }).catch(function GetReportOprosError(err) {
      $scope.global.showErrorAlert(err.data);
    }).finally(function GetReportOprosFinally() {
      $scope.global.hideWaitingForm();
    });
  }


});