"use strict";

// контроллер
myApp.controller("uchetSkladPrCtrl", function uchetSkladPrCtrl($scope, $http) {

  var FIRST_PAGE = 1;

  // событие при открытии вкладки
  $scope.$on("global.selectedUchetSubMenuItemChanged", function selectedSubMenuItemChanged(event, newValue) {

    if (newValue == "0") {

      // перезапрашиваю данные Прихода на склад
      // отображаю первую страницу
      $scope.refresh(FIRST_PAGE).then(() => {

        // если ещё не было ниодного прихода, то сразу создаю новый
        if ($scope.pageNums.length === 0) {
          $scope.btnZapisClick();
        }

      }).catch(() => {
        // ничего не делаю, всё обработается в refresh()
      });

    }

  });


  // обновить режим, перезапросив данные
  // page - какую страницу отобразить
  $scope.refresh = function refresh(page) {

    // сбросить все значения компонентов на умолчания
    $scope.initPage();

    // массив страниц
    $scope.pageNums = [];

    // текущая активная страница
    $scope.page = page;

    $scope.global.showWaitingForm("Загрузка прихода на склад...");

    return $http({
      "method": "GET",
      "url": "/Home/GetUchetSkladPr",
      params: { page: page }
    }).then(function getUchetSkladPrSuccess(data) {

      $scope.o_sklad_pr = data.data.o_sklad_pr;
      $scope.o_sklad_pr_product = data.data.o_sklad_pr_product;
      $scope.pageNums = data.data.pageNums;

      $scope.global.hideWaitingForm();

      return new Promise(function (resolve, reject) { resolve(1); });

    }, function getUchetSkladPrFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

      return new Promise(function (resolve, reject) { reject(0); });

    });

  };


  // для всех компонентов ввода проставить значения по умолчанию
  $scope.initPage = function initPage() {


    // приход
    $scope.o_sklad_pr = {};

    // дата счета
    $scope.o_sklad_pr.D_SCHET = new Date();

    // номер счета
    $scope.o_sklad_pr.N_SCHET = null;

    // массив добавленной продукции
    $scope.o_sklad_pr_product = [];

    // очищаю строку для добавления нового элемента
    $scope.initNewItem();

    // ошибка при добавлении строки
    $scope.showNullProductError = false;

  };


  // добавить новую строку с продукцией
  $scope.btnAddClick = function btnAddClick() {

    // если в текущей строке не заполнено наименование продукции
    // то не разрешаю добавлять новую
    if ($scope.new.M_PRODUCT_ID == null) {
      $scope.showNullProductError = true
      return;
    } else {
      $scope.showNullProductError = false;
    }


    // текущая строка уходит в основной массив
    $scope.o_sklad_pr_product.push($scope.new);

    // очищаю строку для добавления новой
    $scope.initNewItem();




  };


  // очистить строку для добавления нового элемента
  $scope.initNewItem = function initNewItem() {

    // строка для добавения новой продукции
    $scope.new = {};
    $scope.new.M_PRODUCT_ID = null;
    $scope.new.KOLVO = null;
    $scope.new.COST = null;

  };


  // следующая страница
  $scope.pageNext = function pageNext() {

    if ($scope.pageNums.length === 0) {
      return;
    }

    $scope.page = ((($scope.page - 1) > 0) ? ($scope.page - 1) : 1);
    $scope.refresh($scope.page);

  };


  // предыдущая страница
  $scope.pagePrev = function pagePrev() {

    if ($scope.pageNums.length === 0) {
      return;
    }

    $scope.page = ((($scope.page + 1) > $scope.pageNums.length) ? $scope.pageNums.length : ($scope.page + 1));
    $scope.refresh($scope.page);
    
  };


  // перейти на страницу с номером
  $scope.pageNumClick = function pageNumClick(num) {

    $scope.refresh(num);

  };


  // сохранить
  $scope.btnSaveClick = function btnSaveClick() {

    $scope.global.showWaitingForm("Сохранение прихода на склад...");

    // если есть в таблице продукции новая строка (последняя),
    // с введенным оборудованием, то надо добавить его в общий массив
    // до выполнения сохранения
    if ($scope.new.M_PRODUCT_ID != null) {
      $scope.btnAddClick();
    }

    $http({
      "method": "POST",
      "url": "/Home/UchetSkladPrSave",
      data: {
        o_sklad_pr: $scope.o_sklad_pr,
        o_sklad_pr_product: $scope.o_sklad_pr_product
      }
    }).then(function uchetSkladPrSaveSuccess(data) {

      $scope.refresh(FIRST_PAGE);

      $scope.global.hideWaitingForm();

    }, function uchetSkladPrSaveFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
      
    });

  };


  // новая запись
  $scope.btnZapisClick = function btnZapisClick() {

    // значения по умолчанию везде
    $scope.initPage();

    // текущая страница - никакая
    $scope.page = 0;

    // ставлю максимальный номер счёта + 1
    $http({
      "method": "GET",
      "url": "/Home/GetUchetSkladPrNSchetNext"
    }).then(function getUchetSkladPrNSchetNextSuccess(data) {

      $scope.o_sklad_pr.N_SCHET = data.data.N_SCHET;

      $scope.global.hideWaitingForm();

    }, function getUchetSkladPrNSchetNextFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });


  };

});