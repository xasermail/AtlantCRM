"use strict";

var scopeKontStatReportCtrl;

// контроллер
myApp.controller("kontStatReportCtrl", function kontStatReportCtrl($scope, $http) {

  scopeKontStatReportCtrl = $scope;

  // данные фильтра
  $scope.filter = {};
  // данные отчёта
  $scope.report = {};

  // при открытии страницы
  $scope.$on("global.selectedKontSubMenuItemChanged", function selectedKontSunMenuItemChanged(event, newValue) {
   
    // срабатывает, только если открыта вкладка Контакты
    if (newValue == "4" && $scope.global.selectedMenuItem === "menuItemKont") {
      // проставляю значения фильтра по умолчанию
      if ($scope.filter.S_USER_ID == null) {
        $scope.filter.S_USER_ID = $scope.global.userContext.ID;
      }
      if ($scope.filter.periodS == null) {
        $scope.filter.periodS = new Date($scope.global.function.newDateNoTime().setDate(1));
      }
      if ($scope.filter.periodPo == null) {
        $scope.filter.periodPo = $scope.global.function.newDateNoTime();
      }
    }

  });


  // обновление данных
  $scope.refreshKontStatReport = function refreshKontStatReport() {


    /* Пример возвращаемого набора данных
    $scope.report = {
      "UserName": "Валера",
      "zvonok": 34,
      "kontakt": 54,
      "comment": 43,
      "status": [
        { "name": "Отказ", "kolvo": 35 },
        { "name": "...", "kolvo": 68 },
        { "name": "...", "kolvo": 34 },
        { "name": "...", "kolvo": 65 }],
      "istochnik": [
        { "name": "Знакомые", "kolvo": 45 },
        { "name": "...", "kolvo": 34 }, 
        { "name": "...", "kolvo": 76 }, 
        { "name": "...", "kolvo": 68 },
        { "name": "...", "kolvo": 95 }]
    };
    */

    $scope.global.showWaitingForm("Формирование отчёта..");
    $http({
      url: "/Home/GetKontStatReport",
      method: "GET",
      params: $scope.filter
    }).then((data) => {
      $scope.report = data.data;
      $scope.global.hideWaitingForm();
    });


  };


  // нажатие по кнопки Сформировать
  $scope.btnPrimClick = function btnPrimClick() {

    if ($scope.filter.S_USER_ID == null) {
      $scope.global.showErrorAlert("Необходимо указать сотрудника");
      return;
    }

    $scope.refreshKontStatReport();

  };


});