"use strict";

var scopeZadachiCtrl;

// контроллер
myApp.controller("zadachiCtrl", function zadachiCtrl($scope, $http, $parse) {

  scopeZadachiCtrl = $scope;

  // текущая выбранная вкладка внутри режима
  // допустимые значения novie, vPr, vip, neVip
  $scope.selectedVkladka = "vPr";

  // список организаций для отображения
  $scope.m_org = [];

  // текущая выбранная организация, для которой добавляется задача
  $scope.selectedOrgId = null;

  // поля для новой задачи
  $scope.new = {};

  // список задач по разным вкладкам
  $scope.zadachi = {};

  // список имён вкладок
  $scope.CONST_VKLADKI = ["vPr", "vip", "neVip"];
  

  // событие при открытии вкладки
  $scope.$on("global.selectedDilerSubMenuItemChanged", function selectedDilerASubMenuItemChanged(event, newValue) {

    if (newValue == "2") {

      // для Дилера A открываю вкладку Новые
      if ($scope.global.userContext.M_ORG_TYPE_ID === $scope.global.const.M_ORG_TYPE_ID_DILER_A) {
        $scope.selectedVkladka = "novie";
      }

      $scope.refresh();

    }

  });


  $scope.refresh = function refresh() {

    $scope.global.showWaitingForm("Получение задач...");

    $scope.m_org =
      $scope.global.manual.M_ORG
        .filter(x => x.M_ORG_TYPE_ID === $scope.global.const.M_ORG_TYPE_ID_DILER_C ||
                     x.M_ORG_TYPE_ID === $scope.global.const.M_ORG_TYPE_ID_DILER_D);

    $http({
      "method": "GET",
      "url": "/Home/GetZadachi",
      params: {
        
      }
    }).then((data) => {

      $scope.zadachi = data.data;

      $scope.global.hideWaitingForm();

    });

    
  };


  // выбрать текущую организацию
  $scope.selectOrg = (item) => {
    $scope.selectedOrgId = item.ID;
    $scope.new = {};
    $scope.new.M_ORG_ID_ZADACHA = item.ID;
  };


  // сохранить задачу
  $scope.save = () => {

    $scope.global.showWaitingForm("Сохранение задачи..");

    $http({
      "method": "POST",
      "url": "/Home/O_ZADACHASave",
      data: {
        zadacha: $scope.new
      }
    }).then((data) => {

      $scope.new = {};
      $scope.refresh();
      $scope.global.hideWaitingForm();

    });

  };


  // выполнить задачу
  $scope.vip = (zadacha) => {
    
    $scope.global.showWaitingForm("Выполнение задачи..");

    $http({
      "method": "POST",
      "url": "/Home/O_ZADACHAVip",
      data: {
        zadacha: zadacha
      }
    }).then((data) => {

      $scope.refresh();
      $scope.global.hideWaitingForm();

    });

  };


  // выбрать вкладку
  $scope.selectVkladka = (name) => {
    $scope.selectedVkladka = name;
    $scope.refresh();
  };


});