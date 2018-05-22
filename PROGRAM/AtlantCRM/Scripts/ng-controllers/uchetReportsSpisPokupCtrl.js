"use strict";

var scopeUchetReportsSpisPokupCtrl;

// контроллер
myApp.controller("uchetReportsSpisPokupCtrl", function uchetReportsSpisPokupCtrl($scope, $http) {

  scopeUchetReportsSpisPokupCtrl = $scope;

  // массив страниц
  $scope.pageNums = [];

  // текущая активная страница
  $scope.page = null;

  $scope.vipList = [{ ID: 1, NAME: "VIP" }, { ID: 0, NAME: "Не VIP" }];

  // кол-во строк на странице
  $scope.rows_per_page = 10;
  

  // событие при открытии вкладки
  $scope.$on("global.selectedUchetReportsSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == 0) {

      $scope.dt_from = null;
      $scope.dt_to = null;

      $scope.refreshSpisPokup();
    }

  });

  $scope.refreshSpisPokup = function refreshSpisPokup(page) {

    $scope.pageNums = [];
    $scope.page = page;

    $scope.data = [];
    $scope.global.showWaitingForm("Получение данных списка покупателей...");
    
    return $http({
      "method": "GET",
      "url": "/Home/UchetReportsSpisPokupData",
      params: {
        date0: $scope.dt_from,
        date1: $scope.dt_to,
        page: page,
        ostalos_dn_abon_ot: $scope.ostalos_dn_abon_ot,
        ostalos_dn_abon_do: $scope.ostalos_dn_abon_do,
        m_method_opl_id: $scope.m_method_opl_id,
        vip: $scope.vip,
        rows_per_page: $scope.rows_per_page
      }
    }).then(function uchetSpisPokupSuccess(data) {

      $scope.data = [];
      var itogo = 0;
      var itogo_kolvo = 0;
      var spisok = data.data.spisok;
      $scope.pageNums = data.data.pageNums;

      // пройдем по списку товаров
      if (typeof $scope.global.manual.M_PRODUCT !== "undefined") {
        for (var i = 0; i < $scope.global.manual.M_PRODUCT.length; i++) {

          var j = 1;
          var kolvo = 0;
          var summa = 0;

          // считаем подытоги
          for (var k = 0; k < spisok.length; k++) {
            if ($scope.global.manual.M_PRODUCT[i]["ID"] === spisok[k]["M_PRODUCT_ID"]) {
              if (j === spisok[k]["RN"]) { // берем i-ю строчку

                kolvo = kolvo + spisok[k]["KOLVO"];
                summa = summa + spisok[k]["SUMMA"];

                itogo_kolvo = itogo_kolvo + spisok[k]["KOLVO"];
                itogo = itogo + spisok[k]["SUMMA"];
                j++;

                $scope.data.push({
                  VIP: spisok[k]["VIP"],
                  FIO: spisok[k]["FIO"],
                  D_VID: new Date(spisok[k]["D_VID"]),
                  PHONE: spisok[k]["PHONE"],
                  NAME: spisok[k]["NAME"],
                  VID: spisok[k]["VID"],
                  SUMMA: spisok[k]["SUMMA"],
                  O_ANK_ID: spisok[k]["O_ANK_ID"],
                  OSTALOS_DN_ABON: spisok[k]["OSTALOS_DN_ABON"],
                  SEANS_CNT: spisok[k]["SEANS_CNT"],
                  O_SKLAD_RAS_ID: spisok[k]["O_SKLAD_RAS_ID"]
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

      if (typeof spisok !== "undefined") {
        if (spisok.length === 0) {
          $scope.data.push({
            NAME: ""
          });
        }
      }

      $scope.global.hideWaitingForm();
      return Promise.resolve(data);

    }, function uchetSpisPokupFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }


  $scope.print = function print() {
    $scope.rows_per_page = 100000;
    $scope.page_save = $scope.page;
    var w = window.open("/Home/PrintSpisPokup");

    $scope.refreshSpisPokup(1).then(function loadDataComplete() {
      w.printData = {};
      w.printData.dt_from = $scope.dt_from;
      w.printData.dt_to = $scope.dt_to;
      w.printData.ostalos_dn_abon_ot = $scope.ostalos_dn_abon_ot;
      w.printData.ostalos_dn_abon_do = $scope.ostalos_dn_abon_do;
      if ($scope.m_method_opl_id != null) {
        w.printData.m_method_opl_id_name = $scope.global.manual.M_METOD_OPL.find(x => x.ID === $scope.m_method_opl_id).NAME;
      } else {
        w.printData.m_method_opl_id_name = null;
      }
      w.printData.data = $scope.data;

      $scope.rows_per_page = 10;
      $scope.page = $scope.page_save;
      $scope.refreshSpisPokup();
    });
  }

  $scope.openAnkRej = function (o_ank_id) {
    if ((o_ank_id === "null") || (o_ank_id === null) || (typeof o_ank_id === "undefined")) return false;
    $scope.global.openAnk(o_ank_id);
  };


  $scope.clearFilter = function clearFilter() {

    $scope.dt_from = null;
    $scope.dt_to = null;
    $scope.page = 1;
    $scope.ostalos_dn_abon_ot = null;
    $scope.ostalos_dn_abon_do = null;
    $scope.m_method_opl_id = null;
    $scope.vip = null;

    $scope.refreshSpisPokup();

  };


});