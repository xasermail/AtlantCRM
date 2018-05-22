"use strict";

// контроллер
myApp.controller("uchetReportsDebetZadolCtrl", function uchetReportsDebetZadolCtrl($scope, $http) {
  
  var i = 0;
  var j = 0;
  var k = 0;
  var l = 0;

  // событие при открытии вкладки
  $scope.$on("global.selectedUchetReportsSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == 1) {
      if (typeof $scope.DT_FROM === "undefined") $scope.DT_FROM = new Date();
      if (typeof $scope.DT_TO === "undefined") $scope.DT_TO = new Date();

      $scope.previewPrint = 0;
      $scope.refreshDebetZadol();
    }

  });

  $scope.refreshDebetZadol = function refreshDebetZadol() {
    $scope.data = [];
    $scope.global.showWaitingForm("Получение данных дебиторской задолженности...");

    $http({
      "method": "POST",
      "url": "/Home/UchetReportsDebetZadolData",
      params: {
        date0: $scope.DT_FROM,
        date1: $scope.DT_TO
      }
    }).then(function uchetDebetZadolSuccess(data) {

      $scope.data = [];
      var itogo = 0;
      var itogo_all = 0;
      // 
      for (var k = 0; k < data.data.length; k++) {
        if (data.data[k]["RN"] === 1) {
          var name = "";

          name = $scope.global.manual.M_PRODUCT.find(x => x.ID === data.data[k]["M_PRODUCT_ID"]).NAME;
          itogo_all = itogo_all + data.data[k]["SUMMA"];

          $scope.data.push({
            FIO: data.data[k]["FIO"],
            D_OPL: new Date(data.data[k]["D_OPL"]),
            PHONE: data.data[k]["PHONE"],
            SUMMA: data.data[k]["SUMMA"],
            O_SKLAD_RAS_ID: data.data[k]["O_SKLAD_RAS_ID"],
            D_NEXT_OPL: data.data[k]["D_NEXT_OPL"],
            NAME: name
          });
        }
      }

      if (itogo_all !== 0) {
        $scope.data.push({
          NAME: "Итого:",
          SUMMA: Math.round(parseFloat(itogo_all) * 100) / 100,
          BR: 1
        });
      }

      // пройдем по списку товаров
      if (typeof $scope.global.manual.M_PRODUCT !== "undefined") {
        for (var i = 0; i < $scope.global.manual.M_PRODUCT.length; i++) {

          // считаем подытоги
          itogo = 0;
          l = 0;
          for (var k = 0; k < data.data.length; k++) {
            if ($scope.global.manual.M_PRODUCT[i]["ID"] === data.data[k]["M_PRODUCT_ID"] && data.data[k]["RN"] !== 1) {
              
              if (l === 0) {
                $scope.data.push({
                  NAME: $scope.global.manual.M_PRODUCT[i]["NAME"]
                });
                l++;
              }

              itogo = itogo + data.data[k]["SUMMA"];

              $scope.data.push({
                FIO: data.data[k]["FIO"],
                D_OPL: new Date(data.data[k]["D_OPL"]),
                PHONE: data.data[k]["PHONE"],
                SUMMA: data.data[k]["SUMMA"],
                O_SKLAD_RAS_ID: data.data[k]["O_SKLAD_RAS_ID"],
                D_NEXT_OPL: data.data[k]["D_NEXT_OPL"]
              });
            }
          }

          // выводим подытоги
          if (itogo !== 0) {
            $scope.data.push({
              NAME: "Итого:",
              SUMMA: Math.round(parseFloat(itogo) * 100) / 100,
              BR: 1
            });

            itogo_all = itogo_all + itogo;
          }
        }

        if (itogo_all !== 0) {
          $scope.data.push({
            NAME: "Итого:",
            SUMMA: Math.round(parseFloat(itogo_all) * 100) / 100,
            BR: 1
          });
        }
      }

      if (typeof data.data !== "undefined") {
        if (data.data.length === 0) {
          $scope.data.push({
            NAME: ""
          });
        }
      }

      $scope.global.hideWaitingForm();

    }, function uchetDebetZadolFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

  $scope.print = function print() {
    var w = window.open("/Home/PrintDebetZadol");
    w.printData = {};
    w.printData.REPORT_NAME = "Дебиторская задолженность";
    w.printData.DT_FROM = $scope.DT_FROM;
    w.printData.DT_TO = $scope.DT_TO;
    w.printData.data = $scope.data;
  }
});