"use strict";

//контроллер
reportBirthdayCtrl = myApp.controller("reportBirthdayCtrl", function reportBirthdayCtrl($scope, $http, $timeout) {

  //в качестве последней даты ставим текущий день
  $scope.toDate = new Date();
  //в качестве первой начало текущего месяца
  //$scope.fromDate = new Date($scope.toDate.getFullYear(), $scope.toDate.getMonth(), 1);
  $scope.fromDate = new Date();

  //обновить (перестроить отчет)
  $scope.btnReportUpdateClick = function btnReportUpdateClick(e) {
    $scope.refreshReport();
  };

  $scope.btnMarkAnkClick = function btnMarkAnkClick(ank_id) {
    $http({
      method: "POST",
      url: "/Home/MarkAnkCallBirthday",
      data: { ank_id: ank_id }
    }).then((data) => {
      //если пришел положительный ответ, значит обновление состоялось и можем спокойно подменить данные
      for (var i = 0; i < $scope.report.length; i++) {
        if ($scope.report[i].ANK_ID == ank_id) {  //проводим поиск по идентификатору
          $scope.report[i].CALL = true; //делаем отметку о выполненном звонке
        }
      }

      // $scope.refreshReport();

      $scope.btnCallNoMarkClick(ank_id);
      //$scope.global.openAnk(ank_id);
      //$scope.global.openAnkDone = () => {
      //  $timeout(() => {
      //    $scope.global.selectedMenuItem = "menuItemNew";
      //    $scope.global.selectedSubMenuItem = 6;
      //  }, 10);
      //};
    });
  };

  $scope.btnCallNoMarkClick = function btnCallNoMarkClick(ank_id) {
    $scope.global.openAnk(ank_id);
    $scope.global.openAnkDone = () => {
      $timeout(() => {
        $scope.global.selectedMenuItem = "menuItemNew";
        $scope.global.selectedSubMenuItem = 6;
      }, 10);
    };
  };

  $scope.refreshReport = function refreshReport() {
    $scope.global.showWaitingForm("Формирование отчета ...");

    $http({
      method: "GET",
      url: "/Home/GetReportBirthday",
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