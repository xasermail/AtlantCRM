"use strict";

// контроллер
myApp.controller("uchetSkladRasDocCtrl", function uchetSkladPrCtrl($scope, $http) {

  var FIRST_PAGE = 1;

  // событие при открытии вкладки
  $scope.$on("global.selectedUchetSubMenuItemChanged", function selectedSubMenuItemChanged(event, newValue) {
    if (newValue == "3") {
      $scope.openRej();
    }
  });

  // открытие режима
  $scope.openRej = function openRej() {
    // перезапрашиваю данные Расхода со склада
    // отображаю первую страницу
    $scope.refresh(FIRST_PAGE).then(() => {

      // если ещё не было ниодного расхода, то сразу создаю новый
      if ($scope.pageNums.length === 0) {
        $scope.btnZapisClick();
      }

      // если есть событие, которое нужно выполнить после открытия режима,
      // то выполняю его, используется для открытия режима из другого режима
      if ($scope.afterOpenRejHandler != null) {
        $scope.afterOpenRejHandler();
        $scope.afterOpenRejHandler = null;
      }
    }).catch(() => {
    });
  };

  // обновить режим, перезапросив данные
  // page - какую страницу отобразить
  $scope.refresh = function refresh(page, ID) {

    // сбросить все значения компонентов на умолчания
    $scope.initPage();

    // массив страниц
    $scope.pageNums = [];

    // текущая активная страница
    $scope.page = page;

    $scope.global.showWaitingForm("Загрузка расходных документов...");

    return $http({
      "method": "GET",
      "url": "/Home/GetUchetSkladRasDoc",
      params: { page: page, id: ID }
    }).then(function getUchetRasDocSuccess(data) {

      $scope.o_ras_doc = data.data.o_ras_doc;
      $scope.pageNums = data.data.pageNums;

      $scope.global.hideWaitingForm();

      return new Promise(function (resolve, reject) { resolve(1); });

    }, function getUchetRasDocFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

      return new Promise(function (resolve, reject) { reject(0); });

    });

    $scope.global.hideWaitingForm();

  };


  // для всех компонентов ввода проставить значения по умолчанию
  $scope.initPage = function initPage() {
    // расходный документ
    $scope.o_ras_doc = {};
    // дата счета
    $scope.o_ras_doc.D_SCHET = new Date();
    // номер счета
    $scope.o_ras_doc.N_SCHET = null;
    // поставщик
    $scope.o_ras_doc.POSTAV_NAME = null;
    // реквизиты
    $scope.o_ras_doc.REK = null;
    // цена
    $scope.o_ras_doc.COST = null;
    // количество
    $scope.o_ras_doc.KOLVO = null;
    // сумма
    $scope.o_ras_doc.SUMMA_RASH = null;
    // пользователь, которому была выдана сумма
    $scope.o_ras_doc.S_USER_ID = null;
    // мотив
    $scope.o_ras_doc.MOTIV = null;
    // выданная сумма
    $scope.o_ras_doc.SUMMA_VID = null;
    // возврат
    $scope.o_ras_doc.VOZVR = null;
    // израсходовано
    $scope.o_ras_doc.RASHOD = null;
    // массив для сохранения
    $scope.data = [];
  };

  // добавить новую строку с продукцией
  $scope.btnAddClick = function btnAddClick() {
    // текущая строка уходит в основной массив
    $scope.data.push($scope.o_ras_doc);
    // очищаю строку для добавления новой
    $scope.initNewItem();
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

  // новая запись
  $scope.btnZapisClick = function btnZapisClick() {

    // значения по умолчанию везде
    $scope.initPage();
    // текущая страница - никакая
    $scope.page = 0;
    // ставлю максимальный номер счёта + 1
    $http({
      "method": "GET",
      "url": "/Home/GetUchetRasDocNSchetNext"
    }).then(function getUchetRasDocNSchetNextSuccess(data) {

      $scope.o_ras_doc.N_SCHET = data.data.N_SCHET;
      $scope.global.hideWaitingForm();

    }, function getUchetRasDocNSchetNextFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  };

  // сохранить
  $scope.btnSaveClick = function btnSaveClick() {

    $scope.global.showWaitingForm("Сохранение расходного документа...");

    $http({
      "method": "POST",
      "url": "/Home/UchetRasDocSave",
      data: {
        r: $scope.o_ras_doc
      }
    }).then(function uchetRasDocSaveSuccess(data) {

      $scope.refresh(FIRST_PAGE);
      $scope.global.hideWaitingForm();

    }, function uchetRasDocSaveFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  };

  $scope.reCalcSumma = function reCalcSumma() {
    try {
      var cost = parseFloat($scope.o_ras_doc.COST);
      var kolvo = parseFloat($scope.o_ras_doc.KOLVO);
      $scope.o_ras_doc.SUMMA_RASH = Math.round((cost * kolvo) * 100) / 100;
      $scope.o_ras_doc.RASHOD = $scope.o_ras_doc.SUMMA_RASH;

      var summa = parseFloat($scope.o_ras_doc.SUMMA_VID);
      var rashod = parseFloat($scope.o_ras_doc.SUMMA_RASH);
      $scope.o_ras_doc.VOZVR = Math.round((summa - rashod) * 100) / 100;
    } catch (e) {
    }
  };

  $scope.reCalcRashod = function reCalcRashod() {
    try {
      var summa = parseFloat($scope.o_ras_doc.SUMMA_VID);
      var vozvr = parseFloat($scope.o_ras_doc.VOZVR);
      $scope.o_ras_doc.RASHOD = Math.round((summa - vozvr) * 100) / 100;
    } catch (e) {
    }
  };

  // открыть режим для добавления расхода на переданный O_SKLAD_RAS_ID
  $scope.$on("openUchetSkladRasDoc", function openUchetSkladRasProductHandler(event, ID) {

    $scope.global.showWaitingForm("Загрузка расходных документов...");

    // задаю, что после того, как режим откроется,
    // надо отобразить информацию по выбранному расходу
    $scope.afterOpenRejHandler = function afterOpenRejHandler() {
      $scope.refresh(null, ID);
    };

    // вызываю открытие режима
    $scope.global.selectedMenuItem = "menuItemUchet";
    // вот это присвоение ниже приведёт к вызову initPage(), вся обработка
    // открытия анкеты происходит там.
    // initPage() не происходит, если итак selectedUchetSubMenuItem === 2, тогда
    // вызываю initPage() принудительно
    if ($scope.global.selectedUchetSubMenuItem != 3) {
      $scope.global.selectedUchetSubMenuItem = 3;
    } else {
      $scope.openRej();
    }




  });

});