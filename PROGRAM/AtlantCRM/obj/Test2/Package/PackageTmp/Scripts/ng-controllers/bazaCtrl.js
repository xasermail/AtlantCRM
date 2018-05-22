"use strict";

// контроллер
bazaCtrl = myApp.controller("bazaCtrl", function bazaCtrl($scope, $http, $timeout) {

  // список анкет для таблицы
  $scope.bazaList = {};
  // номера страниц, сколько их будет
  $scope.pageNums = [];
  // текущая страница
  $scope.page = 1;
  // всего найдено
  $scope.vsego = 0;

  // переменные поля Период
  $scope.period = {};
  // локальный справочник Ходит, Не ходит
  $scope.period.hoditNeHodit = [{ ID: 2, NAME: "Не ходит" }, { ID: 1, NAME: "Ходит" }];
  // по умолчанию Не ходит
  $scope.period.hodit = 2;
  // по умолчанию 1 день
  $scope.period.dn = 1;
  // окно сначала скрыто
  $scope.period.shown = false;
  // ошибка во введенном дне
  $scope.period.dnError = false;
  // признак, что фильтр выбран
  $scope.period.applied = false;
  //
  // переменные поля Заболевания
  $scope.zabol = {};
  // окно сначала скрыто
  $scope.zabol.shown = false;
  // ошибка во введенном дне
  $scope.zabol.dnError = false;
  // признак, что фильтр выбран
  $scope.zabol.applied = false;
  // для поиска заболевания из списка
  $scope.zabol.searchStr = "";
  // выбранное заболевание, его идентификатор
  $scope.zabol.id = null;
  //
  // переменные поля Посещения
  $scope.pos = {};
  // окно сначала скрыто
  $scope.pos.shown = false;
  // признак, что фильтр выбран
  $scope.pos.applied = false;
  // дата посещения с
  $scope.pos.s = $scope.global.function.newDateNoTime();
  // дата посещения по
  $scope.pos.po = $scope.global.function.newDateNoTime();


  // обновление грида
  $scope.refreshGrid = function refreshGrid() {
    // прячем настройки
    $scope.global.pravoNaSpravRej = 0;
    $scope.global.selectedMenuItem = "menuItemBaza";

    let fio = null;
    if ($scope.fio != null && $scope.fio.trim().length > 0) {
      fio = $scope.fio.trim();
    }

    let periodHodit = null;
    let periodDn = null;
    if ($scope.period.applied === true) {
      periodHodit = $scope.period.hodit;
      periodDn = $scope.period.dn;
    }

    let zabolId = null;
    if ($scope.zabol.applied === true) {
      zabolId = $scope.zabol.id;
    }

    let posS = null;
    let posPo = null;
    if ($scope.pos.applied === true) {

      posS = $scope.pos.s;
      posPo = $scope.pos.po;

      if (posPo == null) {
        posPo = $scope.global.function.newDateNoTime();
      }

      if (posS == null) {
        posS = posPo;
      }

    }

    $http({
      method: "GET",
      params: {
        page: $scope.page, fio: fio, periodHodit: periodHodit, periodDn: periodDn, zabolId: zabolId,
        posS: posS, posPo: posPo
      },
      url: "/Home/getBazaList/"
    }).then(
        function getBazaListSuccess(data) {
          $scope.bazaList = data.data.rows;
          if (data.data.rows.length > 0) {
            $scope.vsego = data.data.rows[0].cnt;
          } else {
            $scope.vsego = 0;
          }
          $scope.pageNums = [];
          var i;
          for (i = 1; i <= data.data.totalPageCount; i += 1) {
            $scope.pageNums.push(i);
          }
        }, function getBazaListError(msg) {
          $scope.global.showErrorAlert(msg.data);
        });
  };

  // обновляю грид
  $scope.refreshGrid();

  // при выборе другой страницы
  $scope.pageNumClickHandler = function pageNumClickHandler(pageNum) {
    $scope.page = pageNum;
    $scope.refreshGrid();
  };


  // при нажатии enter после ввода ФИО
  $scope.fioKeyPress = function fioKeyPress(evt) {

    if (evt.keyCode === 13) {
      $scope.page = 1;
      $scope.refreshGrid();
    }

  };

  // перейти в режим Звонки
  $scope.openDialogRej = function openDialogRej(id) {
    $scope.global.openAnk(id);
    $scope.global.openAnkDone = () => {
      $timeout(() => {
        $scope.global.selectedMenuItem = "menuItemNew";
        $scope.global.selectedSubMenuItem = 6;
      }, 10);
    };
  };


  $scope.periodDropDownClick = function periodDropDownClick() {
    $scope.period.shown = !$scope.period.shown;
    $scope.period.dnError = false;
  }

  $scope.periodOkClick = function periodOkClick() {

    if (!(angular.isNumber($scope.period.dn)) || !($scope.period.dn > 0)) {
      $scope.period.dnError = true;
      return;
    }

    $scope.period.dnError = false;
    $scope.period.shown = false;
    $scope.period.applied = true;
    $scope.page = 1;

    $scope.refreshGrid();

  }

  $scope.periodCloseClick = function periodCloseClick() {
    $scope.period.applied = false;
    $scope.refreshGrid();
  }

  $scope.pageNext = () => {

    if ($scope.pageNums.length === 0) {
      return;
    }

    $scope.page = ((($scope.page - 1) > 0) ? ($scope.page - 1) : 1);
    $scope.refreshGrid();

  };

  $scope.pagePrev = () => {

    if ($scope.pageNums.length === 0) {
      return;
    }

    $scope.page = ((($scope.page + 1) > $scope.pageNums.length) ? $scope.pageNums.length : ($scope.page + 1));
    $scope.refreshGrid();

  };



  $scope.zabolDropDownClick = function zabolDropDownClick() {
    $scope.zabol.shown = !$scope.zabol.shown;
  };

  $scope.zabolCloseClick = function zabolCloseClick() {
    $scope.zabol.applied = false;
    $scope.refreshGrid();
  };

  $scope.zabolOkClick = function zabolOkClick() {

    $scope.zabol.shown = false;
    $scope.zabol.applied = true;
    $scope.page = 1;

    $scope.refreshGrid();
    
  };






  $scope.posDropDownClick = function posDropDownClick() {
    $scope.pos.shown = !$scope.pos.shown;
  };

  $scope.posCloseClick = function posCloseClick() {
    $scope.pos.applied = false;
    $scope.refreshGrid();
  };

  $scope.posOkClick = function posOkClick() {

    $scope.pos.shown = false;
    $scope.pos.applied = true;
    $scope.page = 1;

    $scope.refreshGrid();

  };

  $scope.posTodayClick = function posTodayClick() {

    $scope.pos.s = $scope.global.function.newDateNoTime();
    $scope.pos.po = $scope.global.function.newDateNoTime();
    $scope.posOkClick();

  };
  

});