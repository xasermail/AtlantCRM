"use strict";

//контроллер
myApp.controller("uchetReportsSaleSpecialistCtrl", function uchetReportsSaleSpecialistCtrl($scope, $http){

  $scope.cars = [{ id: 1, name: 'Audi' }, { id: 2, name: 'BMW' }, { id: 1, name: 'Honda' }];
  $scope.selectedCar = [];

  // событие при открытии вкладки
  $scope.$on("global.selectedUchetReportsSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == 2) {
      if (typeof $scope.fromDate === "undefined") $scope.fromDate = new Date();
      if (typeof $scope.toDate === "undefined") $scope.toDate = new Date();


      $scope.btnRefreshReportClick();
    };

    

  });


  $scope.btnRefreshReportClick = function btnRefreshReportClick() {

  };
});