"use strict";

// контроллер
myApp.controller("nastrCtrl", function nastrCtrl($scope, $http, $timeout) {

  $scope.KOLVO = 100; // по умолчанию резервируем 100 штрих кодов
  $scope.showBarcodeDiv = false;
  $scope.barcode = [];
  $scope.o_ank_ids = [];
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

      refreshData();
      $scope.global.hideWaitingForm();

    }, function saveNastrFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

  // маска телефона
  $("#nastrPhoneMobile").mask("+7(999) 999-99-99");

  $scope.formFile = function formFile() {

    if ($scope.KOLVO != null) {
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

    $http({
      "method": "POST",
      "url": "/Home/GetBarcodeFile",
      data: { d: $scope.barcode }
    }).success(function (data) {
      window.location.href = data.file;
      $scope.showBarcodeDiv = false;
      $scope.barcode = [];
      $scope.o_ank_ids = [];
    });
  }
});