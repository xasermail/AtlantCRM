"use strict";

// контроллер
dilerDCtrl = myApp.controller("dilerDCtrl", function dilerDCtrl($scope, $http) {

  $scope.year = (new Date()).getFullYear();
  $scope.month = (new Date()).getMonth() + 1;


  // событие при открытии вкладки
  $scope.$on("global.selectedMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue === "menuItemDilerD") {
      $scope.refreshDilerD();
    }

  });

  // обновить всю информацию (инициализация)
  $scope.refreshDilerD = function refreshDilerD() {
    
    $scope.months = [{ id: 1, name: "Январь" }, { id: 2, name: "Февраль" }, { id: 3, name: "Март" }, { id: 4, name: "Апрель" }, { id: 5, name: "Май" }, { id: 6, name: "Июнь" }, { id: 7, name: "Июль" }, { id: 8, name: "Август" }, { id: 9, name: "Сентябрь" }, { id: 10, name: "Октябрь" }, { id: 11, name: "Ноябрь" }, { id: 12, name: "Декабрь" }];

    // показатели деятельности салона
    $scope.deyat = {};

    // показатели деятельности
    $http({
      method: "GET",
      url: "/Home/GetDeyat",
      params: { M_ORG_ID: $scope.global.userContext.M_ORG_ID, year: $scope.year, month: $scope.month }
    }).then((data) => {

      $scope.deyat = data.data;

    }, (err) => {
      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
    });


    // работа салона
    $http({
      method: "GET",
      url: "/Home/GetRabota",
      params: { M_ORG_ID: $scope.global.userContext.M_ORG_ID, year: $scope.year, month: $scope.month }
    }).then((data) => {

      $scope.rabota = data.data;

    }, (err) => {
      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
    });



  };


  $scope.yearChangeHandler = function yearChangeHandler() {
    $scope.refreshDilerD();
  };

  $scope.monthChangeHandler = function monthChangeHandler() {
    $scope.refreshDilerD();
  };

});