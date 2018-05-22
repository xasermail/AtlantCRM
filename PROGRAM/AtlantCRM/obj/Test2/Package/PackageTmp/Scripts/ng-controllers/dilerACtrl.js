"use strict";

// контроллер
dilerACtrl = myApp.controller("dilerACtrl", function dilerACtrl($scope, $http) {

  $scope.saloni = [];

  var isNumeric = $scope.global.function.isNumeric;

  // сегодняшний день
  $scope.toDate = $scope.global.function.newDateNoTime();

  $scope.toDateChangeHandler = function toDateChangeHandler() {
    $scope.refreshSaloni();
  };

  // обновить информацию о салонах
  $scope.refreshSaloni = function refreshSalon() {

      $scope.global.showWaitingForm("Получение информации о салоне..");

      $http({
        method: "GET",
        url: "/Home/GetSaloni",
        params: {
          M_ORG_ID: $scope.global.userContext.M_ORG_ID,
          toDate: $scope.toDate
        }
      }).then((data) => {
        $scope.saloni = data.data;
        $scope.global.hideWaitingForm();
      }, (err) => {
        $scope.global.showErrorAlert(err.data);
        $scope.global.hideWaitingForm();
      });

  };

  // событие при открытии вкладки
  $scope.$on("global.selectedMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue === "menuItemDilerA") {
      $scope.refreshSaloni();
    }

  });


  // посчитать итого в saloni по заданному свойству prop
  $scope.getSum = function getSum(prop) {
    return $scope.saloni.reduce(function getSumReduce(p, c) {
      return p + +(isNumeric(c[prop]) ? c[prop] : 0);
    }, 0);
  };

});