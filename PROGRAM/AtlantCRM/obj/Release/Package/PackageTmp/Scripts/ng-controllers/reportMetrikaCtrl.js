"use strict";

//контроллер
myApp.controller("reportMetrikaCtrl", function reportMetrikaCtrl($scope, $http) {

  $scope.$on("global.selectedReportSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == 11) {
      $scope.global.showWaitingForm("Формирование отчета ...");

      $http({
        method: "GET",
        url: "/Home/GetReportMetrika"
      }).then((data) => {

        $scope.metrika = data.data;
        $scope.global.hideWaitingForm();

      }, (err) => {

        $scope.global.showErrorAlert(err.data);
        $scope.global.hideWaitingForm();

      });
    }

  });

});