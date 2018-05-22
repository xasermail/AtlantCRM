"use strict";

//контроллер
myApp.controller("reportUvedomlCtrl", function reportUvedomlCtrl($scope, $http) {

  //в качестве последней даты ставим текущий день
  $scope.toDate = new Date();
  //в качестве первой начало текущего месяца
  $scope.fromDate = new Date($scope.toDate.getFullYear(), $scope.toDate.getMonth(), 1);

  $scope.$on("global.selectedReportSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == 12) {
      $scope.btnUpdateReportClick();
    }

  });

  //обновить (перестроить отчет)
  $scope.btnUpdateReportClick = function btnUpdateReportClick(e) {
    $scope.global.showWaitingForm("Формирование отчета ...");

    $http({
      method: "GET",
      url: "/Home/GetReportUvedoml",
      params: {
        date0: $scope.fromDate,
        date1: $scope.toDate
      }
    }).then((data) => {
      $scope.report = data.data;
      $scope.global.hideWaitingForm();
    }, (err) => {
      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
    });
  };

});