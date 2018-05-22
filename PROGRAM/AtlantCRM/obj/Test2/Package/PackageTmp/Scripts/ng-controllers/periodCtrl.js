"use strict";

// контроллер
periodCtrl = myApp.controller("periodCtrl", function periodCtrl($scope, $http) {


  // событие при открытии вкладки
  $scope.$on("global.selectedSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == "1") {
      $scope.refreshReg();
    }

  });


  $scope.refreshReg = function refreshReg() {

    // штрих-код
    $scope.barcode = "";
    $scope.contact = "1 день";
    $scope.cycle = "0";
    $scope.all_visits = "0 раз";
    $scope.nepreryv = "";

    $http({
      method: "GET",
      url: "/Home/GetAnkData",
      params: { ID: $scope.global.ank.ID },
      data: "JSON",
      async: false
    }).success(function (data) {
      var v = data.all_visits;

      if ((typeof v !== "undefined") && (v !== null)) {
        if (v === "0") {
          $scope.all_visits = "0 раз";
        } else {
          var a = declOfNum(v, ['раз', 'раза']);
          $scope.all_visits = v + " " + a;
        }
        $scope.fio = data.contact_fio;
        $scope.contact = data.contact;
        $scope.cycle = data.cycle;
      }

      // штрих-код
      $("#period .shtrih-kod").JsBarcode(
        // надо дополнять ID нулями до 12 символов
        ("000000000000" + $scope.global.ank.ID).substr(($scope.global.ank.ID + "").length),
        { width: 3, height: 60, format: "EAN13" }
      );

    });

    if ($scope.global.ank.ID === 0) {
      $scope.fio = "";
    }
  };


  function declOfNum(number, titles) {
    var cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 0 : cases[(number % 10 < 5) ? number % 10 : 5]];
  }

});