"use strict";

// контроллер
dilerACtrl = myApp.controller("dilerACtrl", function dilerACtrl($scope, $http, $timeout) {

  $scope.saloni = [];
  $scope.kp = {};
  $scope.kp.GOD = (new Date()).getFullYear();
  $scope.kp.MES = (new Date()).getMonth() + 1;

  var isNumeric = $scope.global.function.isNumeric;

  $("#dilerA #datepickerDilerA").datepicker({
    numberOfMonths: 2,
    beforeShowDay: function (date) {

      if (date >= $scope.kp.D_NAPOLN_S && date <= $scope.kp.D_NAPOLN_PO) {
        return [true, 'napolnyaem'];
      } else if (date >= $scope.kp.D_VLYUB_S && date <= $scope.kp.D_VLYUB_PO) {
        return [true, 'vlyublyaem'];
      } else if (date >= $scope.kp.D_PROD_S && date <= $scope.kp.D_PROD_PO) {
        return [true, 'prodayom'];
      } else {
        return [true, ''];
      }

    }
  });
  // первый день недели - понедельник
  $("#dilerA #datepickerDilerA").datepicker("option", "firstDay", 1);
  // русские названия месяцев
  translateDays();

  //в качестве первой и последней даты ставим текущий день
  $scope.toDate = $scope.global.function.newDateNoTime();
  $scope.fromDate = $scope.global.function.newDateNoTime();


  // перевожу английский названия месяцев
  function translateDays() {    
    $("#dilerA #datepickerDilerA").find("[title='Monday']").text("Пн");
    $("#dilerA #datepickerDilerA").find("[title='Tuesday']").text("Вт");
    $("#dilerA #datepickerDilerA").find("[title='Wednesday']").text("Ср");
    $("#dilerA #datepickerDilerA").find("[title='Thursday']").text("Чт");
    $("#dilerA #datepickerDilerA").find("[title='Friday']").text("Пт");
    $("#dilerA #datepickerDilerA").find("[title='Saturday']").text("Сб");
    $("#dilerA #datepickerDilerA").find("[title='Sunday']").text("Вс");
  };

  $scope.btnApplyHandler = function btnApplyHandler() {
    $scope.refreshSaloni();
  };

  // обновить информацию о салонах
  $scope.refreshSaloni = function refreshSaloni() {

    $scope.global.showWaitingForm("Получение информации о салоне..");


    $http({
      method: "GET",
      url: "/Home/GetSaloni",
      params: {
        M_ORG_ID: $scope.global.userContext.M_ORG_ID,
        fromDate: $scope.fromDate,
        toDate: $scope.toDate
      }
    }).then((data) => {

      $scope.saloni = data.data;
      
      // склад дилера A
      $scope.refreshSklad();

      // прайс дилера A
      $scope.refreshPrice();

      // календарь продаж
      $scope.refreshKalenProd();

      $scope.global.hideWaitingForm();

    }, (err) => {
      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
    });


  };



  // получить Календарь продаж
  $scope.refreshKalenProd = function refreshKalenProd() {

    $scope.global.showWaitingForm("Получение календаря продаж..");

    $http({
      method: "GET",
      url: "/Home/GetKalenProd",
      params: {
        god: $scope.kp.GOD,
        mes: $scope.kp.MES
      }
    }).then((data) => {
      $scope.kp = data.data.kp;
      $scope.kp.years = data.data.years;
      $("#dilerA #datepickerDilerA").datepicker("refresh");
      $("#dilerA #datepickerDilerA").datepicker("setDate", new Date($scope.kp.GOD, $scope.kp.MES - 1, 1))
      translateDays();
      $scope.global.hideWaitingForm();
    }, (err) => {
      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
    });

  };


  // сохранить Календарь продаж
  $scope.btnSaveKalenProdClick = function btnSaveKalenProdClick() {

    $scope.global.showWaitingForm("Сохранение календаря продаж..");

    $http({
      "method": "POST",
      "url": "/Home/KalenProdSave",
      data: {
        kp: $scope.kp
      }
    }).then(function uchetSkladRasSaveSuccess(data) {

      $scope.refreshKalenProd();

      $scope.global.hideWaitingForm();

    }, function uchetSkladRasSaveFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });

  };


  // при выборе месяца в Календаре продаж
  $scope.monthClick = function monthClick(mes) {

    $scope.kp.MES = mes;
    $scope.refreshKalenProd();

  };



  // событие при открытии вкладки
  $scope.$on("global.selectedMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue === "menuItemDilerA") {
      $scope.refreshSaloni();
    }

  });


  // посчитать итого в saloni по заданному свойству prop
  $scope.getSum = function getSum(prop) {
    return $scope.saloni.reduce(function getSumReduce(p, c) {
      return p + +(isNumeric(c[prop]) ? c[prop] : 0);
    }, 0);
  };


  $scope.kpDateChanged = function kpDateChanged() {
    $("#dilerA #datepickerDilerA").datepicker("refresh");
    translateDays();
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


  // получить данные склада
  $scope.refreshSklad = function refreshSklad() {

    $scope.global.showWaitingForm("Получение данных склада..");

    $http({
      method: "GET",
      url: "/Home/GetO_DILER_A_SKLAD"
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
      "url": "/Home/O_DILER_A_SKLADSave",
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

    $scope.global.currentUserChangeMOrgId(item.m_org_id);

  };


  // получить данные прайса
  $scope.refreshPrice = function refreshPrice() {

    $scope.global.showWaitingForm("Получение данных прайса..");

    $http({
      method: "GET",
      url: "/Home/GetDilerAPrice"
    }).then(function refreshPriceSuccess(data) {

      $scope.price = data.data;
      $scope.global.hideWaitingForm();

    }, function refreshPriceFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });

  };


  // сохранить данные прайса
  $scope.priceSave = function priceSave() {

    $scope.global.showWaitingForm("Сохранение данных прайса..");

    $http({
      "method": "POST",
      "url": "/Home/O_DILER_A_PRICESave",
      data: {
        price: $scope.price
      }
    }).then(function priceSaveSuccess(data) {

      // перечитать данные склада
      $scope.refreshPrice();

    }, function priceSaveFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });

  };


});