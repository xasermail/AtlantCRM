"use strict";

// контроллер
myApp.controller("dilerAMarketingKalendCtrl", function dilerAMarketingKalendCtrl($scope, $http) {

  // событие при открытии вкладки
  $scope.$on("global.selectedDilerSubMenuItemChanged", function selectedDilerSubMenuItemChanged(event, newValue) {

    if (newValue == 3) {

      $scope.global.showWaitingForm("Получение отчета..");

      // получаю доступные года
      $http({
        "method": "GET",
        "url": "/Home/GetDilerAMarketingKalendYears"
      }).then(function getReportMarketingYearsSuccess(data) {

        $scope.years = data.data;

        // если какая-нибудь новая организация и данных ещё вообще
        // нет, то годов не будет и соответсвенно данных тоже
        if ($scope.years.length === 0) {
          $scope.global.hideWaitingForm();
          return;
        }

        // проставляю год по умолчанию
        if ($scope.years.find(x => x === (new Date()).getFullYear())) {
          $scope.year = (new Date()).getFullYear();
        } else {
          $scope.year = $scope.years[$scope.years.length - 1];
        }

        $scope.fromDate = new Date($scope.year, 0, 1, 0, 0, 0, 0);
        $scope.toDate = new Date($scope.year, 11, 31, 23, 59, 59, 999);

        // запрашиваю данные
        $scope.refresh();
        $scope.global.hideWaitingForm();

      }, function getReportMarketingYearsFailed(err) {

        $scope.global.showErrorAlert(err.data);
        $scope.global.hideWaitingForm();

      });


    }

  });

  $scope.refresh = function refresh() {

    $scope.global.showWaitingForm("Получение отчёта..");
    $scope.report = null;

    $http({
      method: "GET",
      url: "/Home/GetSaloni",
      params: {
        M_ORG_ID: $scope.global.userContext.M_ORG_ID,
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

  }

  // при изменении года
  $scope.yearChanged = function yearChanged() {
    $scope.fromDate = new Date($scope.year, 0, 1, 0, 0, 0, 0);
    $scope.toDate = new Date($scope.year, 11, 31, 23, 59, 59, 999);
    $scope.refresh();
  }

  // посчитать итого в report по заданному свойству prop
  $scope.getSum = function getSum(prop) {
    if ($scope.report == null) {
      return 0;
    } else {
      return $scope.report.reduce(function getSumReduce(p, c) {
        return p + +($scope.global.function.isNumeric(c[prop]) ? c[prop] : 0);
      }, 0);
    }
  }

});