"use strict";

//контроллер
jurItogCtrl = myApp.controller("jurItogCtrl", function jurItogCtrl($scope, $http) {

  //в качестве последней даты ставим текущий день
  $scope.toDate = new Date();
  //в качестве первой начало текущего месяца
  $scope.fromDate = new Date($scope.toDate.getFullYear(), $scope.toDate.getMonth(), 1);


  $scope.$on("global.selectedJurSubMenuItemChanged", function selectedJurSubMenuItemChanged(event, newValue) {

    if (newValue === 2) {
      $scope.btnRefresReportClick();
    }

  });

  //обновить (перестроить отчет)
  $scope.btnRefresReportClick = function btnRefresReportClick() {
    $scope.global.showWaitingForm("Формирование отчета ...");

    $http({
      method: "GET",
      url: "/Home/GetReportItog",
      params: {
        fromDate: $scope.fromDate,
        toDate: $scope.toDate
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