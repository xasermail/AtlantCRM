"use strict";

//контроллер
reportServiceCtrl = myApp.controller("reportServiceCtrl", function reportServiceCtrl($scope, $http) {

  $scope.$on("global.selectedReportSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == 9) {
      $scope.global.showWaitingForm("Формирование отчета ...");

      $http({
        method: "GET",
        url: "/Home/GetReportService",
        params: {
        }
      }).then((data) => {
        $scope.report = data.data;
        $scope.global.hideWaitingForm();
      }, (err) => {
        $scope.global.showErrorAlert(err.data);
        $scope.global.hideWaitingForm();
      });
    }
  });

});