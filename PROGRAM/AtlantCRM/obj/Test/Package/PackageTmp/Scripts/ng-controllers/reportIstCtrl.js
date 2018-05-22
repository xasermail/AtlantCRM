"use strict";

//контроллер
reportIstCtrl = myApp.controller("reportIstCtrl", function reportIstCtrl($scope, $http) {

  //в качестве последней даты ставим текущий день
  $scope.toDate = new Date();
  //в качестве первой начало текущего месяца
  $scope.fromDate = new Date($scope.toDate.getFullYear(), $scope.toDate.getMonth(), 1);

  //обновить (перестроить отчет)
  $scope.btnUpdateReportClick = function btnUpdateReportClick(e) {
    $scope.global.showWaitingForm("Формирование отчета ...");

    $http({
      method: "GET",
      url: "/Home/GetReportIst",
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