"use strict";

var scopeUchetReportsNeHodyatCtrl;

// контроллер
myApp.controller("uchetReportsNeHodyatCtrl", function uchetReportsNeHodyatCtrl($scope, $http) {

  var i = 0;
  var j = 0;
  scopeUchetReportsNeHodyatCtrl = $scope;
  // массив страниц
  $scope.pageNums = [];
  // текущая активная страница
  $scope.page = 1;
  // количество записей на странице
  $scope.rows_per_page = 50;
  
  // событие при открытии вкладки
  $scope.$on("global.selectedUchetReportsSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == 7) {
      $scope.refreshNeHodyat($scope.page);
    }

  });

  $scope.refreshNeHodyat = function refreshNeHodyat(page) {

    $scope.pageNums = [];

    $scope.data = [];
    $scope.global.showWaitingForm("Получение данных списка не посещающих салон...");

    $scope.page = page;
    if ($scope.page == null) {
      $scope.page = 1;
    }

    $http({
      "method": "GET",
      "url": "/Home/UchetReportsNeHodyatData",
      params: {
        page: $scope.page,
        rows_per_page: $scope.rows_per_page
      }
    }).then(function uchetNeHodyatSuccess(data) {

      $scope.data = data.data.spisok;
      $scope.pageNums = data.data.pageNums;
      $scope.global.hideWaitingForm();

    }, function uchetNeHodyatFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

  $scope.print = function print() {
    var w = window.open("/Home/PrintNeHodyat");
    w.printData = {};
    w.printData.data = $scope.data;
  }

  $scope.openAnkRej = function (o_ank_id) {
    if (o_ank_id == null) return false;
    $scope.global.openAnk(o_ank_id);
  };

  $scope.hideAnk = function hideAnk(ID) {
    $scope.global.function.showYesNoDialog("Скрыть анкету из отчета на " + $scope.global.const.UCHET_REPORT_NE_HODYAT_SKR_DAYS + " дней?", () => {
      $http({
        "method": "POST",
        "url": "/Home/HideAnk",
        params: {
          ID: ID,
          DAYS: $scope.global.const.UCHET_REPORT_NE_HODYAT_SKR_DAYS
        }
      }).then(function hideAbonSuccess(data) {
        $scope.refreshNeHodyat($scope.page);
      }, function hideAbonFailed(err) {
        $scope.global.showErrorAlert(err.data);
        $scope.global.hideWaitingForm();
      });
    });
  }

});