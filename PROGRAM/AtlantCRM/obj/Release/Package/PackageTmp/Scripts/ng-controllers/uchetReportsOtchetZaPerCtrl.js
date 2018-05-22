"use strict";

// контроллер
myApp.controller("uchetReportsOtchetZaPerCtrl", function uchetReportsOtchetZaPerCtrl($scope, $http) {
  
  $scope.years = [2015, 2018, 2019];



  // событие при открытии вкладки
  $scope.$on("global.selectedUchetReportsSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == 4) {

      $scope.global.showWaitingForm("Получение отчёта за период..");

      // получаю доступные года
      $http({
        "method": "GET",
        "url": "/Home/GetUchetReportsOtchetZaPerYears"
      }).then(function getUchetReportsOtchetZaPerYearsSuccess(data) {

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

        // запрашиваю данные
        $scope.refresh();

        $scope.global.hideWaitingForm();

      }, function getUchetReportsOtchetZaPerYearsFailed(err) {

        $scope.global.showErrorAlert(err.data);
        $scope.global.hideWaitingForm();

      });


    }

  });

  $scope.refresh = function refresh() {

    $scope.global.showWaitingForm("Получение отчёта за период..");

    $http({
      "method": "GET",
      "url": "/Home/GetUchetReportsOtchetZaPer",
      params: {
        year: $scope.year
      }
    }).then(function getUchetReportsOtchetZaPerSuccess(data) {

      $scope.report = data.data;

      // расчёт всего
      $scope.agg = {};
      for (var item in $scope.report[0]) {
        $scope.agg[item] = $scope.report.reduce((p, c) => { return p + c[item]; }, 0);
      }

      // среднее при загрузке по нулям
      $scope.sr = {};
      for (var item in $scope.report[0]) {
        $scope.sr[item] = 0;
      }

      $scope.global.hideWaitingForm();

    }, function getUchetReportsOtchetZaPerFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });

  };


  // расчет среднего при выборе строки
  $scope.checkboxClick = function checkboxClick() {

    // элементы с проставленной галочкой
    var selectedAr = $scope.report.filter(x => x.checked === 1);
    
    // сколько выбрано позиций
    var cnt = selectedAr.length;

    // расчёт Среднее
    for (var item in $scope.report[0]) {
      if (cnt > 0) {
        $scope.sr[item] = (selectedAr.reduce((p, c) => { return p + c[item]; }, 0) / cnt).toFixed(2);
      } else {
        $scope.sr[item] = 0;
      }
    }

  };


  // при изменении года
  $scope.yearChanged = function yearChanged() {

    $scope.refresh();

  };


});