"use strict";

// контроллер
myApp.controller("uchetReportsSpisPokupCtrl", function uchetReportsSpisPokupCtrl($scope, $http) {
  
  var i = 0;
  var k = 0;
  // событие при открытии вкладки
  $scope.$on("global.selectedUchetReportsSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == 0) {
      if (typeof $scope.DT_FROM === "undefined") $scope.DT_FROM = new Date();
      if (typeof $scope.DT_TO === "undefined") $scope.DT_TO = new Date();

      
      $scope.previewPrint = 0;
      $scope.refreshSpisPokup();      
    }

  });

  $scope.refreshSpisPokup = function refreshSpisPokup() {
    $scope.data = [];
    $scope.global.showWaitingForm("Получение данных списка покупателей...");

    $http({
      "method": "POST",
      "url": "/Home/UchetReportsSpisPokupData",
      params: {
        date0: $scope.DT_FROM,
        date1: $scope.DT_TO
      }
    }).then(function uchetSpisPokupSuccess(data) {

      $scope.data = [];
      var itogo = 0;
      var itogo_kolvo = 0;

      // пройдем по списку товаров
      if (typeof $scope.global.manual.M_PRODUCT !== "undefined") {
        for (var i = 0; i < $scope.global.manual.M_PRODUCT.length; i++) {

          var j = 1;
          var kolvo = 0;
          var summa = 0;

          // считаем подытоги
          for (var k = 0; k < data.data.length; k++) {
            if ($scope.global.manual.M_PRODUCT[i]["ID"] === data.data[k]["M_PRODUCT_ID"]) {
              if (j === data.data[k]["RN"]) { // берем i-ю строчку

                kolvo = kolvo + data.data[k]["KOLVO"];
                summa = summa + data.data[k]["SUMMA"];

                itogo_kolvo = itogo_kolvo + data.data[k]["KOLVO"];
                itogo = itogo + data.data[k]["SUMMA"];
                j++;

                $scope.data.push({
                  FIO: data.data[k]["FIO"],
                  D_VID: new Date(data.data[k]["D_VID"]),
                  PHONE: data.data[k]["PHONE"],
                  NAME: data.data[k]["NAME"],
                  VID: data.data[k]["VID"],
                  SUMMA: data.data[k]["SUMMA"],
                  O_ANK_ID: data.data[k]["O_ANK_ID"]
                });

              }
            }
          }

          // выводим подытог
          if ((j !== 1) && (kolvo > 0)) {
            $scope.data.push({
              FIO: "Итого по " + $scope.global.manual.M_PRODUCT[i]["NAME"] + ", кол-во: " + kolvo,
              SUMMA: Math.round(parseFloat(summa) * 100) / 100,
              O_ANK_ID: null
            });
          }
        }
      }

      if (itogo !== 0) {
        $scope.data.push({
          FIO: "Итого кол-во: " + itogo_kolvo,
          SUMMA: Math.round(parseFloat(itogo) * 100) / 100,
          O_ANK_ID: null
        });
      }

      if (typeof data.data !== "undefined") {
        if (data.data.length === 0) {
          $scope.data.push({
            NAME: ""
          });
        }
      }

      $scope.global.hideWaitingForm();

    }, function uchetSpisPokupFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }


  $scope.print = function print() {
    var w = window.open("/Home/PrintSpisPokup");
    w.printData = {};
    w.printData.DT_FROM = $scope.DT_FROM;
    w.printData.DT_TO = $scope.DT_TO;
    w.printData.data = $scope.data;
  }

  $scope.openAnkRej = function (o_ank_id) {
    if ((o_ank_id === "null") || (o_ank_id === null) || (typeof o_ank_id === "undefined")) return false;
    $scope.global.openAnk(o_ank_id);
  }

});