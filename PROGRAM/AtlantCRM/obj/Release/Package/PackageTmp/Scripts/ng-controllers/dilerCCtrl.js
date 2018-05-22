"use strict";

// контроллер
myApp.controller("dilerCCtrl", function dilerCCtrl($scope, $http, $timeout) {

  $scope.saloni = [];
  // сегодняшний день
  $scope.toDate = $scope.global.function.newDateNoTime();


  // событие при открытии вкладки
  $scope.$on("global.selectedMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue === "menuItemDilerC") {
      $scope.refreshSaloni();
    }

  });


  // обновить информацию о салонах
  $scope.refreshSaloni = function refreshSaloni() {

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

      // склад дилера C
      $scope.refreshSklad();

      $scope.global.hideWaitingForm();

    }, (err) => {
      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
    });


  };

  $scope.toDateChangeHandler = function toDateChangeHandler() {
    $scope.refreshSaloni();
  };



  // получить данные склада
  $scope.refreshSklad = function refreshSklad() {

    $scope.global.showWaitingForm("Получение данных склада..");

    $http({
      method: "GET",
      url: "/Home/GetO_DILER_C_SKLAD"
    }).then(function refeshSkladSuccess(data) {

      $scope.sklad = data.data;
      $scope.global.hideWaitingForm();

    }, function refeshSkladFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });

  };


  // сохранить данные склада
  $scope.skladSave = function skladSave() {

    $scope.global.showWaitingForm("Сохранение данных склада..");

    $http({
      "method": "POST",
      "url": "/Home/O_DILER_C_SKLADSave",
      data: {
        o_sklad: $scope.sklad
      }
    }).then(function skladSaveSuccess(data) {

      // перечитать данные склада
      $scope.refreshSklad();

    }, function skladSaveFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });

  };



  // кнопка "Перейти в магазин"
  // item - у какой организации была нажата эта кнопка
  $scope.btnGoOrgClick = function btnGoOrgClick(item) {

    // проверяю, что есть доступ
    if (!($scope.global.userContext.IS_DILER_C === 1 && item.dilerCAccess === 1)) {

      $scope.global.showErrorAlert("Дилер Д должен разрешить Вам доступ к его магазину");

    } else {

      $scope.global.currentUserChangeMOrgId(item.m_org_id);

    }

  };



  // найти в салоне количество остатков на складе по определенному товару
  $scope.getSaloniSkladKolvo = function getSaloniSkladKolvo(salon, product) {
    var p = salon.sklad.find(function (x) { return x.ID === product.ID; });
    if (p != null) {
      return p.KOLVO;
    } else {
      return 0;
    }

  };


});