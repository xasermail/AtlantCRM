"use strict";

/*
  Структура данных
      
      
  $scope: {
      o_sklad_ras,
      productList: [
        {
          o_sklad_ras_product,
          o_sklad_ras_product_opl: [],
          o_abon_priost
        }
      ]
    }

*/

var scopeUchetSkladRasCtrl;

// контроллер
myApp.controller("uchetSkladRasCtrl", function uchetSkladRasCtrl($scope, $http, $timeout) {

  scopeUchetSkladRasCtrl = $scope;

  var FIRST_PAGE = 1;
  var LAST_PAGE = -1;

  // событие при открытии вкладки
  $scope.$on("global.selectedUchetSubMenuItemChanged", function selectedSubMenuItemChanged(event, newValue) {

    if (newValue == "2") {

      $scope.openRej();

    }

  });



  // событие, когда в режим зашли через выбор элемента в меню, а не через Общение
  $scope.$on("menuItemUchetSkladRasClick", () => {

    // сбрасываю идентификатор выбранной анкеты
    if ($scope.o_sklad_ras != null) {
      $scope.o_sklad_ras.O_ANK_ID = null;
    }

  });



  // открытие режима
  $scope.openRej = function openRej() {
    // перезапрашиваю данные Расхода со склада
    // отображаю первую страницу
    $scope.refresh(LAST_PAGE).then(() => {

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
      // ничего не делаю, всё обработается в refresh()
    });

  };



  // обновить режим, перезапросив данные
  // page - какую страницу отобразить
  // O_SKLAD_RAS_ID - какой расход отобразить
  //                  можно задавать либо страницу, либо расход
  $scope.refresh = function refresh(page, O_SKLAD_RAS_ID) {

    // сбросить все значения компонентов на умолчания
    $scope.initPage();

    // массив страниц
    $scope.pageNums = [];

    // текущая активная страница
    $scope.page = page;

    // текущий расход, если открытие было по расходу
    $scope.O_SKLAD_RAS_ID = O_SKLAD_RAS_ID;

    $scope.global.showWaitingForm("Загрузка расхода со склада...");

    return $http({
      "method": "GET",
      "url": "/Home/GetUchetSkladRas",
      params: { page: page, O_SKLAD_RAS_ID: O_SKLAD_RAS_ID }
    }).then(function getUchetSkladRasSuccess(data) {

      $scope.o_sklad_ras = data.data.o_sklad_ras;
      $scope.productList = data.data.productList;
      $scope.pageNums = data.data.pageNums;
      $scope.uvedoml = data.data.uvedoml;

      //#385 если нет уведомлений
      if ($scope.uvedoml == null) {
        $scope.uvedoml = {};
        $scope.uvedoml.d_sob = null;
        $scope.uvedoml.m_vid_sob_id = null;
        $scope.uvedoml.comment = null;
        $scope.uvedoml.isUved1Created = null;

        $scope.uvedoml.d_sob1 = null;
        $scope.uvedoml.d_sob2 = null;
        $scope.uvedoml.d_sob3 = null;
        $scope.uvedoml.d_sob4 = null;
        $scope.uvedoml.d_sob5 = null;
      }

      // если уведомление уже сохранено, то менять его нельзя
      if ($scope.uvedoml.d_sob2 != null) {
        $scope.uvedoml2Disabled = true;
      }
      if ($scope.uvedoml.d_sob3 != null) {
        $scope.uvedoml3Disabled = true;
      }
      if ($scope.uvedoml.d_sob4 != null) {
        $scope.uvedoml4Disabled = true;
      }
      if ($scope.uvedoml.d_sob5 != null) {
        $scope.uvedoml5Disabled = true;
      }




      if (page === LAST_PAGE) {
        if ($scope.pageNums.length > 0) {
          $scope.page = $scope.pageNums[0];
        }
      }

      if ($scope.pageNums.length === 0) {
        $scope.pagesCountAfterLoad = 0;
      } else {
        $scope.pagesCountAfterLoad = $scope.pageNums[0];
      }

      if (
        // $scope.o_sklad_ras == null, если ещё нет ниодной страницы,
        // она создастся после выхода из этой процедуры автоматически 
        $scope.o_sklad_ras != null &&
        $scope.o_sklad_ras.O_ANK_ID !== null
      ) {
        return $http({
          method: "GET",
          url: "/Home/GetAnkData",
          params: { ID: $scope.o_sklad_ras.O_ANK_ID },
          data: "JSON",
          async: false
        }).success(function (data) {
          $scope.o_sklad_ras.HODIT = data.all_visits;
          $scope.global.hideWaitingForm();
          return new Promise(function (resolve, reject) {
            $scope.global.hideWaitingForm();
            resolve(1);
          });
        });
      } else {
        $scope.global.hideWaitingForm();
        return new Promise(function (resolve, reject) {
          $scope.global.hideWaitingForm();
          resolve(1);
        });
      }

    }, function getUchetSkladRasFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

      return new Promise(function (resolve, reject) {
        $scope.global.hideWaitingForm();
        reject(0);
      });

    });

  };


  // для всех компонентов ввода проставить значения по умолчанию
  $scope.initPage = function initPage() {


    // расход
    $scope.o_sklad_ras = {};

    // дата счета
    $scope.o_sklad_ras.D_SCHET = $scope.global.function.newDateNoTime();

    // номер счета
    $scope.o_sklad_ras.N_SCHET = null;

    // массив добавленной продукции
    $scope.productList = [];

    // ошибка при добавлении строки
    $scope.showNullProductError = false;

    // проплаты за период с
    $scope.reportPropl = {};
    $scope.reportPropl.dateBeg = $scope.global.function.newDateNoTime();
    $scope.reportPropl.dateBeg.setDate(1);

    // проплаты за период по
    $scope.reportPropl.dateEnd = $scope.global.function.newDateNoTime();

    // уведомления
    $scope.uvedoml = {};

    // блокировка изменений уведомлений
    $scope.uvedoml2Disabled = false;
    $scope.uvedoml3Disabled = false;
    $scope.uvedoml4Disabled = false;
    $scope.uvedoml5Disabled = false;

  };


  // добавить новую строку с продукцией
  $scope.btnAddClick = function btnAddClick() {

    // если в текущей строке не заполнено наименование продукции
    // то не разрешаю добавлять новую
    if ($scope.productList.length > 0
       && $scope.productList[$scope.productList.length - 1].o_sklad_ras_product.M_PRODUCT_ID == null)
    {
      $scope.showNullProductError = true
      return;
    } else {
      $scope.showNullProductError = false;
    }


    // добавляю элемент в массив продукции
    $scope.productList.push($scope.initNewItem());


  };


  // новый элемент продукции вместе с оплатой
  $scope.initNewItem = function initNewItem() {

    // строка для добавения новой продукции
    var newItem = {};
    // массив частичной оплаты за продукцию
    newItem.o_sklad_ras_product = {};
    newItem.o_sklad_ras_product.KOLVO = 1;
    newItem.o_sklad_ras_product_opl = [];
    newItem.o_sklad_ras_product_opl.push($scope.initNewOplItem());

    return newItem;

  };


  // следующая страница
  $scope.pageNext = function pageNext() {

    if ($scope.pageNums.length === 0) {
      return;
    }

    $scope.page = ((($scope.page + 1) > $scope.pageNums.length) ? $scope.pageNums.length : ($scope.page + 1));
    $scope.refresh($scope.page);

  };


  // предыдущая страница
  $scope.pagePrev = function pagePrev() {

    if ($scope.pageNums.length === 0) {
      return;
    }

    $scope.page = ((($scope.page - 1) > 0) ? ($scope.page - 1) : 1);
    $scope.refresh($scope.page);
    
  };

  // следующие 10 страниц
  $scope.pageNext10 = function pageNext10() {

    if ($scope.pageNums.length === 0) {
      return;
    }

    var currFirstPage = $scope.pageNums[0];

    if ($scope.pageNums[0] >= $scope.pagesCountAfterLoad) {
      return;
    } else {
      currFirstPage = $scope.pageNums[0] + 10;
    }

    if (currFirstPage > $scope.pagesCountAfterLoad) {
      currFirstPage = $scope.pagesCountAfterLoad;
    }

    $scope.pageNums = [];
    for (var i = currFirstPage, j = 1; j <= 10; i -= 1, j += 1) {
      $scope.pageNums.push(i);
    }

  };


  // предыдущие 10 страниц
  $scope.pagePrev10 = function pagePrev10() {

    if ($scope.pageNums.length === 0) {
      return;
    }

    var currFirstPage = $scope.pageNums[0];

    if (currFirstPage <= 10) {
      return;
    }

    currFirstPage = $scope.pageNums[0] - 10;

    if (currFirstPage < 10) {
      currFirstPage = 10;
    }

    $scope.pageNums = [];
    for (var i = currFirstPage, j = 1; j <= 10; i -= 1, j += 1) {
      $scope.pageNums.push(i);
    }

  };


  // перейти на страницу с номером
  $scope.pageNumClick = function pageNumClick(num) {

    $scope.refresh(num);

  };


  // сохранить
  $scope.btnSaveClick = function btnSaveClick() {

    $scope.global.showWaitingForm("Сохранение расхода со склада...");

    // вид события "Доплата"
    var M_VID_SOB_ID_DOPLATA = 5;

    // перед сохранением пробегаюсь по всем позициям и пересчитываю
    // стоимость, оплачено и остаточную стоимость
    var i;
    for (i = 0; i < $scope.productList.length; i += 1) {
      // при пересчёте стоимости автоматически вызывается пересчёт
      // оплачено и остаточной стоимости
      $scope.costChanged($scope.productList[i]);
    }

    // если сохранение выполняется для заданной анкеты, то
    // анкетные данные сохранять не буду, только ссылку
    if ($scope.o_sklad_ras.O_ANK_ID != null) {
      $scope.o_sklad_ras.SURNAME = null;
      $scope.o_sklad_ras.NAME = null;
      $scope.o_sklad_ras.SECNAME = null;
      $scope.o_sklad_ras.STREET = null;
      $scope.o_sklad_ras.POST_INDEX = null;
      $scope.o_sklad_ras.PHONE_MOBILE = null;
    }


    // для пользовательского уведомления надо либо не заполнять ничего, либо заполнять и 
    // вид уведомления и дату уведомления
    if (
      $scope.uvedoml.m_vid_sob_id != null && $scope.uvedoml.d_sob == null ||
      $scope.uvedoml.m_vid_sob_id == null && $scope.uvedoml.d_sob != null
    )
    {
      $scope.global.showErrorAlert("Для создания уведомления (блок \"Добавить звонок\"), необходимо проставить и тип уведомления и дату уведомления");
      return;
    }
        



    // если оплата не полная, тогда обязательно нужно создавать уведомление номер 1
    var isUved1Created = false;
    if (
      // уведомление 1 ещё не создано
      $scope.uvedoml.d_sob1 == null &&
      // и есть товары, за которые не полностью введена оплата
      $scope.productList.find((x) => { return x.o_sklad_ras_product.OPL_OST > 0 }) != null
    )
    {
      isUved1Created = true;

      if (
        ($scope.uvedoml.m_vid_sob_id !== M_VID_SOB_ID_DOPLATA) ||
        ($scope.uvedoml.d_sob == null)
      )
      {
        $scope.global.showErrorAlert("При неполной оплате товара необходимо в блоке \"Добавить звонок\" проставить и тип уведомления \"Доплата\" и дату уведомления");
        return;
      }
      
    }

    // если было создано уведомление номер 1 его надо сохранить
    if (isUved1Created === true) {
      $scope.uvedoml.isUved1Created = true;
    }


    // если это не абонемент, то не может быть даты приостановки абонемента
    $scope.productList.forEach((x) => {
      if (x.IS_ABON !== 1) {
        x.D_PRIOST_ABON_S = null;
        x.D_PRIOST_ABON_PO = null;
      }
    });


    $http({
      "method": "POST",
      "url": "/Home/UchetSkladRasSave",
      data: {
        o_sklad_ras: $scope.o_sklad_ras,
        productList: $scope.productList,
        uvedoml: $scope.uvedoml
      }
    }).then(function uchetSkladRasSaveSuccess(data) {

      $scope.refresh(null, data.data.O_SKLAD_RAS_ID);

      $scope.global.hideWaitingForm();

    }, function uchetSkladRasSaveFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
      
    });

  };


  // новая запись
  // возвращает promise
  $scope.btnZapisClick = function btnZapisClick() {

    // значения по умолчанию везде
    $scope.initPage();

    // текущая страница - никакая
    $scope.page = 0;

    // добавляю одну продукцию
    $scope.btnAddClick();

    // ставлю максимальный номер счёта + 1
    return $http({
      "method": "GET",
      "url": "/Home/GetUchetSkladRasNSchetNext"
    }).then(function getUchetSkladRasNSchetNextSuccess(data) {

      $scope.o_sklad_ras.N_SCHET = data.data.N_SCHET;

      $scope.global.hideWaitingForm();

      return new Promise((resolve) => resolve(1));

    }, function getUchetSkladRasNSchetNextFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

      return new Promise((resolve, reject) => reject(0));

    });


  };


  // печать кассового ордера
  $scope.btnKassOrderClick = function () {

    // печатать буду пока только первый продукт из списка,
    // потому что это кажется логичным, на следующий продукт
    // они могут создать новый расход

    $scope.global.showWaitingForm("Подготовка данных для печати...");

    var w = window.open("/Home/PrintKassOrder");

    $http({
      "method": "GET",
      "url": "/Home/GetKassOrder",
      params: { id: $scope.o_sklad_ras.ID }
    }).then(function getKassOrderSuccess(data) {

      w.printData = data.data;
      $scope.global.hideWaitingForm();


    }, function getKassOrderFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();


    });

    

  };



  // открыть окно с таблицой частичной оплаты по продукту,
  // item - продукт из productList, по которому открывается окно оплаты
  $scope.btnChastOplatClick = function btnChastOplatClick(item) {

    item.showTableChastOpl = !item.showTableChastOpl;

  };



  // добавить новую оплату по продукту,
  // item - продукт из productList, в который добаляется оплата
  $scope.btnAddOplClick = function btnAddOplClick(item) {

    // добавляю элемент в массив продукции
    item.o_sklad_ras_product_opl.push($scope.initNewOplItem());

  };


  // новый элемент оплаты продукции
  $scope.initNewOplItem = function initNewOplItem() {

    // строка для добавения новой продукции
    var newItemOpl = {};
    newItemOpl.O_SKLAD_RAS_PRODUCT_ID = null;
    newItemOpl.OPL = null;
    newItemOpl.D_OPL = null;
    newItemOpl.M_METOD_OPL = null;
    newItemOpl.SERIAL = null;

    return newItemOpl;

  };


  // событие, когда меняется оплата в таблице частичной оплаты
  // item - элемент из productList
  $scope.chastOplChanged = function chastOplChanged(item) {

    // оплачено
    var opl_vsego;
    opl_vsego = item.o_sklad_ras_product_opl.reduce(
      (prev, curr) => { return ((prev || 0) + (curr.OPL || 0)); }, 0);

    // из-за особенностей математических операций в js сложение может дать
    // небольшую погрешность, округляю до 2х знаков
    opl_vsego = +opl_vsego.toFixed(2);

    item.o_sklad_ras_product.OPL_VSEGO = opl_vsego;


    // остат. стоимость
    var opl_ost;
    opl_ost = item.o_sklad_ras_product.COST - opl_vsego;

    // из-за особенностей математических операций в js сложение может дать
    // небольшую погрешность, округляю до 2х знаков
    opl_ost = +opl_ost.toFixed(2);

    item.o_sklad_ras_product.OPL_OST = opl_ost;


  };


  // событие, когда НАДО пересчитать стоимость позиции продукции
  // item - элемент из productList
  $scope.costChanged = function costChanged(item) {

    var kolvo = item.o_sklad_ras_product.KOLVO || 0;
    var tsena = item.o_sklad_ras_product.TSENA || 0;
    var skidka = item.o_sklad_ras_product.SKIDKA || 0;
    
    var cost = kolvo * tsena * ((100 - skidka) / 100);
    // округляю до 2х знаков
    cost = +cost.toFixed(2);

    item.o_sklad_ras_product.COST = cost;

    // пересчёт остаточной стоимости
    $scope.chastOplChanged(item);

  };



  // открыть режим для добавления расхода на переданный O_ANK_ID по ID
  $scope.$on("openUchetSkladRas", function openUchetSkladRasHandler(event, O_ANK_ID) {

    $scope.global.showWaitingForm("Загрузка расхода со склада...");

    // задаю, что после того, как режим откроется,
    // надо отобразить информацию по выбранной анкете
    $scope.afterOpenRejHandler = function afterOpenRejHandler() {

      $scope.btnZapisClick().then(() => {

        // заполняю поля для выбранного покупателя по анкете
        $scope.o_sklad_ras.O_ANK_ID = O_ANK_ID;
        $scope.o_sklad_ras.SURNAME = $scope.global.ank.SURNAME;
        $scope.o_sklad_ras.NAME = $scope.global.ank.NAME;
        $scope.o_sklad_ras.SECNAME = $scope.global.ank.SECNAME;
        $scope.o_sklad_ras.STREET =
          ($scope.global.ank.STREET || "") + " " +
          ($scope.global.ank.HOUSE || "") + " " +
          ($scope.global.ank.CORPUS || "") +
          ($scope.global.ank.FLAT == null ? "" : ("-" + $scope.global.ank.FLAT))
        ;
        $scope.o_sklad_ras.HOUSE = $scope.global.ank.HOUSE;
        $scope.o_sklad_ras.CORPUS = $scope.global.ank.CORPUS;
        $scope.o_sklad_ras.FLAT = $scope.global.ank.FLAT;

        $scope.o_sklad_ras.POST_INDEX = $scope.global.ank.POST_INDEX;
        $scope.o_sklad_ras.PHONE_MOBILE = $scope.global.ank.PHONE_MOBILE;
        $scope.o_sklad_ras.HODIT = $scope.global.ank_agg.all_visits;

        $scope.global.hideWaitingForm();

      }).catch(() => {

        $scope.global.hideWaitingForm();
        // больше ничего не делаю, потому что ошибка обработается в btnZapisClick()

      });

    };


    // вызываю открытие режима
    $scope.global.selectedMenuItem = "menuItemUchet";
    // вот это присвоение ниже приведёт к вызову openRej(), вся обработка
    // открытия анкеты происходит там.
    // openRej() не происходит, если итак selectedUchetSubMenuItem === 2, тогда
    // вызываю openRej() принудительно
    if ($scope.global.selectedUchetSubMenuItem != 2) {
      $scope.global.selectedUchetSubMenuItem = 2;
    } else {
      $scope.openRej();
    }
    
    


  });





  // открыть режим для добавления расхода на переданный O_SKLAD_RAS_ID
  $scope.$on("openUchetSkladRasProduct", function openUchetSkladRasProductHandler(event, O_SKLAD_RAS_ID) {

    $scope.global.showWaitingForm("Загрузка расхода со склада...");

    // задаю, что после того, как режим откроется,
    // надо отобразить информацию по выбранному расходу
    $scope.afterOpenRejHandler = function afterOpenRejHandler() {

      $scope.refresh(null, O_SKLAD_RAS_ID);

    };


    // вызываю открытие режима
    $scope.global.selectedMenuItem = "menuItemUchet";
    // вот это присвоение ниже приведёт к вызову openRej(), вся обработка
    // открытия анкеты происходит там.
    // openRej() не происходит, если итак selectedUchetSubMenuItem === 2, тогда
    // вызываю openRej() принудительно
    if ($scope.global.selectedUchetSubMenuItem != 2) {
      $scope.global.selectedUchetSubMenuItem = 2;
    } else {
      $scope.openRej();
    }

    $scope.global.hideWaitingForm();

  });



  // проплаты за период
  $scope.btnProplZaPerClick = function btnProplZaPerClick() {

    $scope.global.showWaitingForm("Подготовка данных для печати...");

    var w = window.open("/Home/PrintProplZaPer");

    $http({
      "method": "GET",
      "url": "/Home/GetProplZaPer",
      params: {
        dateBeg: $scope.reportPropl.dateBeg,
        dateEnd: $scope.reportPropl.dateEnd
      }
    }).then(function getProplZaPerSuccess(data) {

      var printData = {};
      printData.dateBeg = $scope.reportPropl.dateBeg;
      printData.dateEnd = $scope.reportPropl.dateEnd;
      printData.data = data.data;
      printData.itogo = data.data.reduce((p, c) => { return p + c.opl; }, 0);
      // округление до 2х знаков
      printData.itogo = +printData.itogo.toFixed(2);

      w.printData = printData;
      $scope.global.hideWaitingForm();


    }, function getProplZaPerFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();


    });


  };



  // нажатие на Фактические остатки на складе
  $scope.btnFaktOstSkladClick = function btnFaktOstSkladClick() {

    // перейти в Продажа
    $scope.global.selectedUchetSubMenuItem = 1;

  };

  // маска телефона
  $("#uchetSkladRas .phone-mobile input").mask("+7(999) 999-99-99");

  $scope.btnUdalitClick = function btnUdalitClick(ID) {
    $scope.global.function.showYesNoDialog("Удалить расход со склада?", () => {

      $http({
        "method": "POST",
        "url": "/Home/DeleteSkladRas",
        data: { ID: ID }
      }).then(function delSuccess(data) {

        $scope.openRej();

      }, function delFailed(err) {

        $scope.global.showErrorAlert(err.data);

      });
    });
  };


  // возвращает true, если для всех продуктов (не подарков) проставлен
  // признак "Выдано"
  function productListIsVid() {
    return $scope.productList.find(x => (x.o_sklad_ras_product.COST > 0 && x.o_sklad_ras_product.IS_VID !== 1)) == null;
  }

  // поменялась галочка "Выдано"
  $scope.chkIS_VIDChange = () => {
    
    // проставление значений в дату события 2, 3, 4, 5
    // только если есть право
    if ($scope.global.function.havePravoWrite(8, 62)) {
      $scope.setD_sob_2_3_4_5();
    }

  };

  // перейти в режим Вопросы
  $scope.openVoprosRej = function openVoprosRej() {
    $scope.global.openAnk($scope.o_sklad_ras.O_ANK_ID);
    $scope.global.openAnkDone = () => {
      $timeout(() => {
        $scope.global.selectedMenuItem = "menuItemNew";
        $scope.global.selectedSubMenuItem = 3;
      }, 10);
    };
  };



  // возвращает true, если M_PRODUCT_ID является абонементом
  $scope.isProductAbon = function isProductAbon(M_PRODUCT_ID) {
    var pr = $scope.global.manual.M_PRODUCT.find(function (x1) { return x1.ID === M_PRODUCT_ID });
    if (pr != null && pr.IS_ABON === 1) {
      return true;
    } else {
      return false;
    }
  };



  // проставление значений в даты уведомления 2, 3, 4, 5
  $scope.setD_sob_2_3_4_5 = function setD_sob_2_3_4_5() {

    // проверяю, что для всех товаров (не подарков) проставлена
    // галочка "Выдано" и уведомления из группы "Дата" не заполнены,
    // тогда надо их автоматически заполнить
    if (
      (
        $scope.uvedoml.d_sob2 == null &&
        $scope.uvedoml.d_sob3 == null &&
        $scope.uvedoml.d_sob4 == null &&
        $scope.uvedoml.d_sob5 == null
      )
      &&
      productListIsVid() === true
    ) {

      // добавить дней к дате
      var addDays = $scope.global.function.addDays;

      // увеличить дату до ближайшего понедельника
      var fnToMon = (d) => {
        // getDay() возвращает 0 для воскресенья,
        // 1 для понедельника и так далее
        if (d.getDay() === 6) {
          return addDays(d, 2);
        } else if (d.getDay() === 0) {
          return addDays(d, 1);
        } else {
          return d;
        }
      };

      var now = $scope.global.function.newDateNoTime();

      // дата через неделю
      $scope.uvedoml.d_sob2 = fnToMon(addDays(now, 7));
      // дата через месяц
      $scope.uvedoml.d_sob3 = fnToMon(addDays(now, 30));
      // дата через 3 месяца
      $scope.uvedoml.d_sob4 = fnToMon(addDays(now, 90));
      // дата через полгода
      $scope.uvedoml.d_sob5 = fnToMon(addDays(now, 180));

    }

  }


});