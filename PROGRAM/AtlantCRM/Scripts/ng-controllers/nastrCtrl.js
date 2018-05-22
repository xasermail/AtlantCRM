"use strict";

// контроллер
myApp.controller("nastrCtrl", function nastrCtrl($scope, $http, $timeout) {

  $scope.KOLVO = 100; // по умолчанию резервируем 100 штрих кодов
  $scope.showBarcodeDiv = false;
  $scope.barcode = [];
  $scope.o_ank_ids = [];
  $scope.vneshVidRegList = [{ID: "SO_SPISKOM_MEST", NAME: "Со списком мест (вариант 1)"}, {ID: "SO_SPISKOM_FIO", NAME: "Со списком ФИО (вариант 2)"}];


  refreshData();

  function refreshData() {
    $scope.nastr = {};
    $scope.global.showWaitingForm("Получение настроек...");

    $http({
      "method": "GET",
      "url": "/Home/GetNastrData"
    }).then(function nastrSuccess(data) {

      $scope.nastr = data.data;
      $scope.global.hideWaitingForm();

    }, function nastrFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

  $scope.save = function save() {

    $scope.global.showWaitingForm("Сохранение настроек...");

    $http({
      "method": "POST",
      "url": "/Home/SaveNastrData",
      data: { n: $scope.nastr }
    }).then(function saveNastrSuccess(data) {
      $scope.global.refreshManual("O_NASTR").then(function refreshManualComplete() {
        refreshData();
        $scope.global.hideWaitingForm();
      });

    }, function saveNastrFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

  // маска телефона
  $("#nastrPhoneMobile").mask("+7(999) 999-99-99");

  $scope.formFile = function formFile() {

    if ($scope.KOLVO != null) {
      if ($scope.KOLVO > 400) {
        $scope.global.showErrorAlert("Количество штрих-кодов для резервирования не должно превышать 400 за один раз");
        return false;
      }

      $scope.showBarcodeDiv = true;
      $scope.barcode = [];
      $scope.o_ank_ids = [];

      for (var i = 0; i < $scope.KOLVO; i++) {
        $scope.barcode.push({
          id: "barcode" + i
        });
      }

      $http({
        "method": "GET",
        "url": "/Home/GetOAnkIds",
        params: { kolvo: $scope.KOLVO },
        data: "JSON",
        async: false
      }).then(function getOAnkIdsSuccess(data) {

        $scope.o_ank_ids = data.data;
        $timeout(() => {
          for (var i = 0; i < $scope.KOLVO; i++) {
            // штрих-код
            $("#barcode" + i).JsBarcode(
              // надо дополнять ID нулями до 12 символов
              ("000000000000" + $scope.o_ank_ids[i]).substr(($scope.o_ank_ids[i] + "").length),
              { width: 3, height: 60, format: "EAN13" }
            );
          }
        }, 2000);

      }, function getOAnkIdsFailed(err) {

        $scope.global.showErrorAlert(err.data);
      });
    } else {
      $scope.global.showErrorAlert("Укажите количество штрих-кодов для резервирования");
    }
  }

  $scope.hideBarcodeDiv = function hideBarcodeDiv() {
    $scope.showBarcodeDiv = false;
    $scope.barcode = [];
    $scope.o_ank_ids = [];
  }

  $scope.saveFile = function saveFile() {
    for (var i = 0; i < $scope.KOLVO; i++) {
      var img = $("#barcode" + i).attr('src');
      $scope.barcode[i].img = img.substring(img.indexOf(",") + 1);
    }

    $scope.global.showWaitingForm("Выгрузка файла...");

    $http({
      "method": "POST",
      "url": "/Home/GetBarcodeFile",
      data: { d: $scope.barcode }
    }).then(function getBarcodeFileSuccess(data) {

      $scope.global.hideWaitingForm();

      window.location.href = data.data.file;
      $scope.showBarcodeDiv = false;
      $scope.barcode = [];
      $scope.o_ank_ids = [];

    }, function getBarcodeFileFailed(err) {

      $scope.global.hideWaitingForm();
      $scope.global.showErrorAlert(err.data);
    });
  };



  // предупреждаю, что надо обновить страницу, если настройка
  // внешнего вида режима Регистрация изменилась
  $scope.nastrVneshVidRegChange = function nastrVneshVidRegChange() {
    $scope.global.showInfoAlert("Чтобы изменения вступили в силу после сохранения обновите страницу браузера (F5)");
  };


});