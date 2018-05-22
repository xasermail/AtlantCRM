"use strict";

// контроллер
myApp.controller("dilerDMotivCtrl", function dilerDMotivCtrl($scope, $http) {

  $scope.motiv = {};

  // событие при открытии вкладки
  $scope.$on("global.selectedDilerDSubMenuItemChanged", function selectedDilerDSubMenuItemChanged(event, newValue) {
    if (newValue === 1) {
       $scope.refreshData();
    }
  });

  // запрос основных данных
  $scope.refreshData = function refreshData() {
    $scope.global.showWaitingForm("Получение данных...");

    $http({
      method: "GET",
      url: "/Home/GetMotiv"
    }).then(function motivGetDataSuccess(data) {

      $scope.motiv = data.data;
      if ($scope.motiv == null) {
        $scope.motiv = {};
        $scope.motiv.D_BEG = null;
        $scope.motiv.D_END = null;
        $scope.motiv.SUMMA = null;
      }

      $scope.global.hideWaitingForm();

    }, function motivGetDataFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

  $scope.saveData = function saveData() {
    $scope.global.showWaitingForm("Сохранение данных...");
    $http({
      "method": "POST",
      "url": "/Home/SaveMotiv",
      data: $scope.motiv
    }).then(function prodlSaveDataSuccess(data) {

      $scope.global.hideWaitingForm();

      // пересчитаем плановые показатели
      $scope.global.function.updatePlan();

    }, function prodlSaveDataFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

});