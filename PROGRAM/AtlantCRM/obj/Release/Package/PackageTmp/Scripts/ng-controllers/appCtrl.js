"use strict";

var appCtrl;
var newAnkCtrl;
var dialogCtrl;
var newZvonokCtrl;
var bazaCtrl;
var laneCtrl;
var serviceCtrl;
var statCtrl;
var regCtrl;
var periodCtrl;
var recordCtrl;
var admCtrl;
var manualCtrl;
var dilerACtrl;
var dilerDCtrl;
var reportDayCtrl;
var reportStatisticCtrl;
var reportSpecialistsCtrl;
var reportZabolCtrl;
var reportIstCtrl;
var reportBirthdayCtrl;
var kontCtrl;
var kontListByModeCtrl;
var jurUvedomlCtrl;
var reportServiceCtrl;
var jurItogCtrl;


var months = new Array("января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря");
var days = new Array("Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота");

// контроллер
appCtrl = myApp.controller("appCtrl", function appCtrl($scope, $http, $timeout, $interval) {

  scopeAppCtrl = $scope;
  angular.scopeAppCtrl = $scope;

  var i = 0;
  var j = 0;
  // объект, доступный из других контроллеров
  $scope.global = {};
  // выбранные элементы
  // меню
  $scope.global.selectedMenuItem = "menuItemNew";
  // подменю
  $scope.global.selectedSubMenuItem = -1; // при загрузке отображается окно анкеты, если 0, а так ОК
  // подменю режима Контакты
  $scope.global.selectedKontSubMenuItem = 0;
  // поменю Отчетов
  $scope.global.selectedReportSubMenuItem = 0;
  // подменю режима Учет
  $scope.global.selectedUchetSubMenuItem = 0;
  // подменю режима Учет - отчеты
  $scope.global.selectedUchetReportsSubMenuItem = 0;
  // подменю режима Приложения
  $scope.global.selectedAppSubMenuItem = 0;
  // подменю режима Настройки
  $scope.global.selectedNastrSubMenuItem = 0;
  // подменю режима журнал
  $scope.global.selectedJurSubMenuItem = 0;
  // подменю режима дилер A
  $scope.global.selectedDilerSubMenuItem = 0;
  // здесь будем хранить все справочники
  $scope.global.manual = {};
  // режим печати анкеты
  $scope.global.newAnkPrintPreviewMode = false;
  // текущая анкета
  $scope.global.ank = {};
  $scope.global.ank_agg = {};
  // контекстные переменные текущего пользователя
  $scope.global.userContext = {};

  // здесь будем хранить все общие функции
  $scope.global.function = {};

  // true, если надо отобразить фон модального окна для общего использования
  $scope.global.commonModalBackgroundShown = false;

  // true, если надо отобразить фон модального окна для общего использования, поверх первого
  $scope.global.commonModalBackground2Shown = false;

  //// константы
  // типы организаций
  $scope.global.const = {};
  $scope.global.const.M_ORG_TYPE_ID_ADMINISTRATSIYA = 1;
  $scope.global.const.M_ORG_TYPE_ID_DILER_A = 2;
  $scope.global.const.M_ORG_TYPE_ID_DILER_C = 3;
  $scope.global.const.M_ORG_TYPE_ID_DILER_D = 4;
  $scope.global.const.M_ORG_TYPE_ID_TEH_OTDEL = 5;
  // организация администрация
  $scope.global.const.M_ORG_ID_ADMINISTRATSIYA = 1;
  // должности
  $scope.global.const.S_USER_ROLE_ID_DIREKTOR = 5;
  // ряды
  $scope.global.const.M_RYAD_ID_1 = 1;
  $scope.global.const.M_RYAD_ID_2 = 2;
  // вид сервиса, для тех отдела
  $scope.global.const.M_SERVICE_TYPE_ID_NA_REMONT = 2;
  $scope.global.const.M_SERVICE_TYPE_ID_GARANTIYA = 3;
  $scope.global.const.M_SERVICE_TYPE_ID_SDELAL = 4;
  // источник информации в анкете
  // "Сотрудник"
  $scope.global.const.M_IST_INFO_SOTRUDNIK = 1;
  // "Посетитель"
  $scope.global.const.M_IST_INFO_POSET = 4;
  // статус контакта "<выберите статус>"
  $scope.global.const.M_KONT_STATUS_ID_VIBERITE_STATUS = 1;
  // статус контакта "Срочно"
  $scope.global.const.M_KONT_STATUS_ID_SROCHNO = 2;
  // источник контакта "<выберите статус>"
  $scope.global.const.M_KONT_IST_ID_VIBERITE_STATUS = 1;
  //
  // Переход на 10 страниц в режимах
  $scope.global.const.NEXT_PREV_PAGE_COUNT = 10;

  // печать анкеты
  $scope.global.newAnkPrintPreview = {};
  // переменные режима Общение, например seans_id
  $scope.global.dialog = {};
  // переменные режима Звонки, например seans_id
  $scope.global.zvonok = {};
  // переменные для отображения меню выход и настройки
  $scope.global.setting = {};
  // массив прав пользователя
  $scope.global.prava = [];

  // идентификатор Контакта при поиске
  $scope.global.searchO_KONT_ANK_ID = null;

  // идентификатор Рекомендованного при поиске
  $scope.global.searchO_REK_ANK_ID = null;


  // текущее время, полученное с сервера, ТОЛЬКО для отображения в интерфейсе
  $http({
    "method": "GET",
    "url": "/Home/GetCurrentDateTime"
  }).then(function getCurrentDateTimeSuccess(data) {

    $scope.currentDateTime = data.data.currentDateTime;
    $interval(function () { $scope.currentDateTime.setSeconds($scope.currentDateTime.getSeconds() + 1); }, 1000);

  }).catch(function getCurrentDateTimeFailed(err) {
    $scope.global.showErrorAlert(err.toString() + " " + err.data);
    $scope.global.hideWaitingForm();
  });

  $scope.global.loadUserRights = function loadUserRights() {

    $scope.global.function.initPravo();

    return $http({
      method: "GET",
      url: "/Home/GetUserRightsViewEdit"
    }).then(function getUserRightsViewEditSuccess(data) {

      // права на режим
      $scope.global.prava = data.data.pravaRej;
      // права на группу
      $scope.global.pravaGr = data.data.pravaGr;
        
      // если прав нет, то надо инициализировать массив нулевыми значениями
      if (typeof data !== "undefined") {
        if (data.length === 0) {
          $scope.global.function.initPravo();
        }
      }

      return new Promise(function (resolve) { resolve(1); });

    }).catch(function getUserRightsViewEditFailed(err) {
     
      return new Promise(function (resolve, reject) { reject(0); });

    });

  };

  // при нажатии на элемент меню
  $scope.topMenuClickHandler = function topMenuClickHandler(e) {
    var target = e.target;
    var menuItemArray = $(target).closest("div.menu-item");
    if (menuItemArray.length === 1) {
      $scope.global.selectedMenuItem = menuItemArray[0].getAttribute("id");
    }
  };

  // при нажатии на элемент подменю Новый
  $scope.subMenuClickHandler = function subMenuClickHandler(e) {
    var target = e.target;
    var subMenuItemArray = $(target).closest("[data-index]");
    if (subMenuItemArray.length === 1) {
      $scope.global.selectedSubMenuItem = +subMenuItemArray[0].getAttribute("data-index");
    }
  };

    // при нажатии на элемент подменю режима Контакты
  $scope.subMenuKontClickHandler = function subMenuKontClickHandler(e) {
      var target = e.target;
      var subMenuItemArray = $(target).closest("[data-index]");
      if (subMenuItemArray.length === 1) {
          $scope.global.selectedKontSubMenuItem = +subMenuItemArray[0].getAttribute("data-index");
      }
  };

  // при нажатии на элемент подменю Отчетов
  $scope.subMenuReportClickHandler = function subMenuReportClickHandler(e) {
      var target = e.target;
      var subMenuItemArray = $(target).closest("[data-index]");
      if (subMenuItemArray.length === 1) {
          $scope.global.selectedReportSubMenuItem = +subMenuItemArray[0].getAttribute("data-index");
      }
  };

  // при нажатии на элемент подменю Учет
  $scope.subMenuUchetClickHandler = function subMenuUchetClickHandler(e) {
    var target = e.target;
    var subMenuItemArray = $(target).closest("[data-index]");
    if (subMenuItemArray.length === 1) {
      $scope.global.selectedUchetSubMenuItem = +subMenuItemArray[0].getAttribute("data-index");
    }
  };

  // при нажатии на элемент подменю Учет - Отчеты
  $scope.subMenuUchetReportsClickHandler = function subMenuUchetReportsClickHandler(e) {
    var target = e.target;
    var subMenuItemArray = $(target).closest("[data-index]");
    if (subMenuItemArray.length === 1) {
      $scope.global.selectedUchetReportsSubMenuItem = +subMenuItemArray[0].getAttribute("data-index");
    }
  };

  // при нажатии на элемент подменю Приложения
  $scope.subMenuAppClickHandler = function subMenuAppClickHandler(e) {
    var target = e.target;
    var subMenuItemArray = $(target).closest("[data-index]");
    if (subMenuItemArray.length === 1) {
      $scope.global.selectedAppSubMenuItem = +subMenuItemArray[0].getAttribute("data-index");
    }
  };

  // при нажатии на кнопку Настройки
  $scope.subMenuNastrClickHandler = function subMenuNastrClickHandler(e) {
    var target = e.target;
    var subMenuItemArray = $(target).closest("[data-index]");
    if (subMenuItemArray.length === 1) {
      $scope.global.selectedNastrSubMenuItem = +subMenuItemArray[0].getAttribute("data-index");
    }
  };

  // при нажатии на элемент подменю Журнал
  $scope.subMenuJurClickHandler = function subMenuJurClickHandler(e) {
    var target = e.target;
    var subMenuItemArray = $(target).closest("[data-index]");
    if (subMenuItemArray.length === 1) {
      $scope.global.selectedJurSubMenuItem = +subMenuItemArray[0].getAttribute("data-index");
    }
  };

  // при нажатии на элемент подменю Дилер A
  $scope.subMenuDilerClickHandler = function subMenuDilerClickHandler(e) {
    var target = e.target;
    var subMenuItemArray = $(target).closest("[data-index]");
    if (subMenuItemArray.length === 1) {
      $scope.global.selectedDilerSubMenuItem = +subMenuItemArray[0].getAttribute("data-index");
    }
  };



  // Форма ожидания
  // отобразить форму ожидания
  $scope.waitingFormShown = true;
  $scope.waitingFormCallCnt = 1;
  $scope.waitingFormMsg = "Загрузка...";
  $scope.global.showWaitingForm = function showWaitingForm(msg) {
    // меньше нуля может быть, только если какая-то ошибка произошла
    // или кто-то в коде сделал вызовов закрытия окна больше, чем
    // вызовов открытия, проверяю, чтобы сделать работу стабильнее
    if ($scope.waitingFormCallCnt < 0) {
      $scope.waitingFormCallCnt = 0;
    }
    $scope.waitingFormCallCnt += 1;
    if (msg != null) {
      $scope.waitingFormMsg = msg;
    }
    $scope.waitingFormShown = true;
  };
  //
  // скрыть форму ожидания
  $scope.global.hideWaitingForm = function hideWaitingForm() {
    $scope.waitingFormCallCnt -= 1;
    if ($scope.waitingFormCallCnt === 0 || $scope.waitingFormCallCnt < 0) {
      $scope.waitingFormShown = false;
    }
    // Promise возвращается сейчас без цели, хотел сделать небольшой
    // timeout перед закрытием, чтобы окно ожидания не моргало, но
    // потом передумал
    return new Promise(function promiseHideWaitingForm(resolve, reject) {
      resolve(1);
    });
  };
  // /форма ожидания





  // Сообщение об ошибке alert
  // показать
  $scope.errorAlertShown = false;
  $scope.global.showErrorAlert = function showErrorAlert(msg) {
    $scope.errorAlertMsg = msg;
    $scope.errorAlertShown = true;
    // если было открыто окно ожидания, его надо закрыть
    $scope.waitingFormCallCnt = 0;
    $scope.global.hideWaitingForm();
  };
  //
  // скрыть
  $scope.global.hideErrorAlert = function hideErrorAlert() {
    $scope.errorAlertShown = false;
  };
  // /сообщение об ошибке alert





  // открыть анкету по ID
  //
  // функция, которая ввыполнится после того, как анкета будет
  // полностью открыта, функцию следует задавать после вызова
  // $scope.global.openAnk(), и скорее всего в функции нужно
  // использовать $timeout с небольшой задержкой, например 10
  $scope.global.openAnkDone = null;
  //
  $scope.global.openAnk = function openAnk(ID, prs) {

    $scope.global.openAnkDone = null;
    // посылаю намерение открыть анкету, чтобы само открытие произошло
    // в newAnkCtrl
    $scope.$broadcast("openAnk", ID);
  };



  // открыть режим Учет - Расход со склада для переданного O_ANK_ID
  $scope.global.openUchetSkladRas = function openUchetSkladRas(O_ANK_ID) {
    // посылаю намерение открыть режим Учёт - Расход со склада, чтобы 
    // само открытие произошло в uchetSkladRasCtrl
    $scope.$broadcast("openUchetSkladRas", O_ANK_ID);
  };

  
  // открыть режим Учет - Расход со склада для переданного O_SKLAD_RAS_ID
  $scope.global.openUchetSkladRasProduct = function openUchetSkladRasProduct(O_SKLAD_RAS_ID) {
    // посылаю намерение открыть режим Учёт - Расход со склада, чтобы 
    // само открытие произошло в uchetSkladRasCtrl
    $scope.$broadcast("openUchetSkladRasProduct", O_SKLAD_RAS_ID);
  }

  



  // создать новую анкету
  // в качестве параметра можно передать объект с заполненными свойствами,
  // которые будут перенесены в новую анкету, например SURNAME, NAME, SECNAME
  $scope.global.createAnk = function createAnk(prop) {
    // посылаю намерение открыть анкету, чтобы само открытие произошло
    // в newAnkCtrl
    $scope.$broadcast("createAnk", prop);
  };





  // загрузка всех справочников находится здесь
  // все справочники должны называться большими буквами
  // после загрузки обращение к справочникам должно идти через $scope.global.manual, 
  // например $scope.global.manual.M_PRICH_ISKL
  //
  // чтобы добавить новый справочник, надо пописать его имя в массиве manualAllName:
  //    manualAllName.push("M_NOVIY_SPRAVOCHNIK");
  // и в HomeController надо создать новый метод получения справочника, который должен
  // называться Get + имя справочника, например:
  //    GetM_NOVIY_SPRAVOCHNIK()
  // параметр manualName - если задан, будет загружен один единственный справочник manualName
  $scope.loadManuals = function loadManuals(manualName) {

    // имена всех загружаемых справочников
    var manualAllName = [];
    if (manualName == null) {
      manualAllName.push("M_ZABOL");
      manualAllName.push("M_ZABOL_GROUP");
      manualAllName.push("M_SEX");
      manualAllName.push("M_IST_INF");    // источник информации
      manualAllName.push("M_PRICH_ISKL"); // Звонки - исключить из отчетов
      manualAllName.push("M_MANUAL");
      manualAllName.push("M_ORG");
      manualAllName.push("M_ORG_TYPE");
      manualAllName.push("M_PRAVO_GR");
      manualAllName.push("M_PRAVO_REJ");
      manualAllName.push("S_USER");         // пользователи
      manualAllName.push("S_USER_ROLE");    // специалисты или роли пользователя
      manualAllName.push("M_SERVICE_TYPE"); // Сервис - виды сервиса
      manualAllName.push("M_PRODUCT");      // тип оборудования
      manualAllName.push("M_RYAD");         // группы оборудования
      manualAllName.push("M_METOD_OPL");    // метод оплаты
      manualAllName.push("M_STATUS");       // статусы
      manualAllName.push("M_RASHOD_STAT");  // статьи расхода

      manualAllName.push("M_SEANS_TIME");  // расписание сеансов
      manualAllName.push("M_WORK_DAY");    // справочник рабочих дней
      manualAllName.push("M_SEANS_PLACE"); // места для сеансов
      manualAllName.push("M_DEISTV");      // журнал - действия
      manualAllName.push("M_YES_NO");      // да, нет
      manualAllName.push("M_VID_SOB");     // Вид уведомления
      manualAllName.push("M_VOPROS");      // Справочник вопросов
      manualAllName.push("M_VOPROS_TAB");  // Справочник вкладок Анкета - Вопросы

      manualAllName.push("M_KONT_STATUS"); // Статус контакта
      manualAllName.push("M_KONT_IST");    // Источник контакта

      manualAllName.push("S_USER_FIO");    // пользователи - ID, NAME - фиктивный справочник, нет в БД

      manualAllName.push("M_SOPR_FORM_OPL"); // Сопровождение - форма оплаты
      manualAllName.push("M_SOPR_PRODUCT"); // Сопровождение - продукт
      manualAllName.push("M_SOPR_STATUS"); // Сопровождение - статусы
      manualAllName.push("M_SOPR_DOP"); // Сопровождение - доп. услуги
    } else {
      manualAllName.push(manualName);
    }

    var manualQuery = [];
    var manualName = [];
    var i;

    // для каждого справочника создаю Promise запрос
    manualAllName.forEach(function forEachManualAllName(item) {
      manualQuery.push(
        $http({
          method: "GET",
          url: "/Home/Get" + item + "/"
        })
      );
      manualName.push(item);
    });

    // выполняю все запросы для получения справочников
    return Promise.all(

      manualQuery

    ).then(values => {
      for (i = 0; i < values.length; i++) {

        // если справочник уже есть, то очищаю его при заполнении,
        // иначе создаю пустым. Не создаю пустым каждый раз, потому что
        // в программе уже есть ссылки именно на эту область памяти и если
        // создать новый, то ссылки будут указывать на неправильную область
        if ($scope.global.manual[manualName[i]] != null) {
          $scope.global.manual[manualName[i]].length = 0;
        } else {
          $scope.global.manual[manualName[i]] = [];
        }
        values[i].data.forEach(item => {
          // дата возвращается в виде строки, преобразую её в дату
          let r = new RegExp('[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}$', 'g');
          for (var prop in item) {
            if ((item[prop] != null) && (typeof item[prop] === "string") && (item[prop].match(r))) {
              item[prop] = $scope.global.function.stringToDate(item[prop]);
            }
          }
          $scope.global.manual[manualName[i]].push(item);
        });
      }

      return new Promise(function (resolve) { resolve(values); });

    // обработка ошибок
    }).catch(function loadResourcesError(err) {

      $scope.global.showErrorAlert("loadResourcesError(): " + err.toString());

      return new Promise(function (resolve, reject) { reject(err); });

    });

  };


  // при нажатии кнопки назад/вперёд у браузера
  window.onpopstate = (e) => {

    // ниже выполянется установка странцы просмотра (вкладки) для каждого режима
    // значение берётся из состояния
    // в состоянии хранится массив для всех вкладок (см. pushHistory())
    // по факту здесь будет выполнено, например $scope["global"]["selectedMenuItem"] = "menuItemNew"
    // и так дальше для каждой вкладки
    var v;
    var sp;

    // если изменение истории произошло обычным способом, не через pushState(),
    // то такую ситуацию не обрабатываю
    if (!angular.isArray(e.state)) {
      return;
    }


    // в нулевом элементе массива ещё хранится
    // userContext на момент совершения действия,
    // которое попадает в историю
    //
    // если поменялся кабинет, то надо "перезайти"
    if (e.state[0].userContext.M_ORG_ID != $scope.global.userContext.M_ORG_ID) {
      // alert('a');
      $scope.global.currentUserChangeMOrgId(e.state[0].userContext.M_ORG_ID);
      return;
    }

    for (var i = 0; i < e.state.length; i += 1) {
      v = $scope;
      sp = e.state[i].prop.split(".");
      for (var j = 0; j < sp.length - 1; j += 1) {
        v = v[sp[j]];
      }
      v[sp[sp.length - 1]] = e.state[i].val;
    }

  };


  // реальная реализация ниже, здесь заглушка, чтобы не было ошибки
  $scope.pushHistory = function () { };


  // и сразу её вызываю
  $scope.loadManuals()
  // получить контекст пользователя
  .then(function loadManualsSuccess(data) {
    
    $scope.global.showWaitingForm("Получение информации о пользователе..");
    return $http({
      method: "GET",
      url: "/Home/GetUserContextRequest"
    });

  }).then(function getUserContextSucess(data) {

    $scope.global.userContext = data.data;

    // получение данных только при входе техотдела
    if ($scope.global.userContext.M_ORG_TYPE_ID === $scope.global.const.M_ORG_TYPE_ID_TEH_OTDEL) {
      $scope.$broadcast("global.userContextLoaded");
    }

    return new Promise(function (resolve) { resolve(1); });

  // запросим права
  }).then(function loadUserRights(data) {

    return $scope.global.loadUserRights();

  // при изменении вкладки отсылаю событие всем заинтересованным
  // контроллерам для обновления их состояния
  }).then(function selectedMenuItemChangedSuccess() {

    $scope.$watch("global.selectedMenuItem", (newValue, oldValue) => {
      $scope.$broadcast("global.selectedMenuItemChanged", newValue, oldValue);
      $scope.pushHistory();
    });

    return new Promise(function (resolve) { resolve(1); });


  // при изменении подвкладки в меню Новый отсылаю событие всем заинтересованным
  // контроллерам для обновления их состояния
  }).then(function selectedSubMenuItemChangedSuccess() {

    $scope.$watch("global.selectedSubMenuItem", (newValue) => {
      $scope.$broadcast("global.selectedSubMenuItemChanged", newValue);
      $scope.pushHistory();
    });

    return new Promise(function (resolve) { resolve(1); });


  // при изменении подвкладки в меню Контакты отсылаю событие всем заинтересованным
  // контроллерам для обновления их состояния
  }).then(function selectedKontSubMenuItemChangedSuccess() {

    $scope.$watch("global.selectedKontSubMenuItem", (newValue) => {
      $scope.$broadcast("global.selectedKontSubMenuItemChanged", newValue);
      $scope.pushHistory();
    });

    return new Promise(function (resolve) { resolve(1); });


  // при изменении подвкладки в меню Отчеты отсылаю событие всем заинтересованным
  // контроллерам для обновления их состояния
  }).then(function selectedReportSubMenuItemChangedSuccess() {

    $scope.$watch("global.selectedReportSubMenuItem", (newValue) => {
      $scope.$broadcast("global.selectedReportSubMenuItemChanged", newValue);
      $scope.pushHistory();
    });

    return new Promise(function (resolve) { resolve(1); });


  // при изменении подвкладки в меню Учет отсылаю событие всем заинтересованным
  // контроллерам для обновления их состояния
  }).then(function selectedUchetSubMenuItemChangedSuccess() {

    $scope.$watch("global.selectedUchetSubMenuItem", (newValue) => {
      $scope.$broadcast("global.selectedUchetSubMenuItemChanged", newValue);
      $scope.pushHistory();
    });

    return new Promise(function (resolve) { resolve(1); });



  // при изменении подвкладки в меню Учет - отчеты отсылаю событие всем заинтересованным
  // контроллерам для обновления их состояния
  }).then(function selectedUchetReportsSubMenuItemChangedSuccess() {

    $scope.$watch("global.selectedUchetReportsSubMenuItem", (newValue) => {
      $scope.$broadcast("global.selectedUchetReportsSubMenuItemChanged", newValue);
      $scope.pushHistory();
    });

    return new Promise(function (resolve) { resolve(1); });

  // при изменении подвкладки в меню Приложения отсылаю событие всем заинтересованным
  // контроллерам для обновления их состояния
  }).then(function selectedAppSubMenuItemChangedSuccess() {

    $scope.$watch("global.selectedAppSubMenuItem", (newValue) => {
      $scope.$broadcast("global.selectedAppSubMenuItemChanged", newValue);
      $scope.pushHistory();
    });

    return new Promise(function (resolve) { resolve(1); });

    // при изменении подвкладки в меню Журнал отсылаю событие всем заинтересованным
    // контроллерам для обновления их состояния
  }).then(function selectedJurSubMenuItemChangedSuccess() {

    $scope.$watch("global.selectedJurSubMenuItem", (newValue) => {
      $scope.$broadcast("global.selectedJurSubMenuItemChanged", newValue);
      $scope.pushHistory();
    });

    return new Promise(function (resolve) { resolve(1); });

  // при изменении подвкладки в меню Дилер A отсылаю событие всем заинтересованным
  // контроллерам для обновления их состояния
  }).then(function selectedDilerSubMenuItemChangedSuccess() {

    $scope.$watch("global.selectedDilerSubMenuItem", (newValue) => {
      $scope.$broadcast("global.selectedDilerSubMenuItemChanged", newValue);
      $scope.pushHistory();
    });

    return new Promise(function (resolve) { resolve(1); });

    // отмечаю дату входа пользователя в систему
  }).then(function saveUserDSign() {

    return $http({
      "method": "POST",
      "url": "/Home/SaveUserDSign"
    });


  // считаю, что вся программа загрузилась
  }).then(function selectedMenuItemChangedSuccess() {

    $scope.$broadcast("global.appCtrlLoaded");

    // вычисляю начальную вкладку
    $scope.setStartPage();

    // вставка данных в навигационную историю браузера (кнопки назад/вперёд)
    // вставляю только если что-то изменилось, иначе можно одно и то же
    // несколько раз добавить
    // массив надо будет расширять, если будут новые вкладки
    $scope.pushHistory = function pushHistory() {

      if (
        history.state == null ||
        history.state[0].val != $scope.global.selectedMenuItem ||
        history.state[1].val != $scope.global.selectedSubMenuItem ||
        history.state[2].val != $scope.global.selectedKontSubMenuItem ||
        history.state[3].val != $scope.global.selectedReportSubMenuItem ||
        history.state[4].val != $scope.global.selectedUchetSubMenuItem ||
        history.state[5].val != $scope.global.selectedUchetReportsSubMenuItem ||
        history.state[6].val != $scope.global.selectedAppSubMenuItem ||
        history.state[7].val != $scope.global.selectedJurSubMenuItem ||
        history.state[8].val != $scope.global.selectedDilerSubMenuItem
      ) {
        history.pushState(
          [
            { prop: "global.selectedMenuItem", val: $scope.global.selectedMenuItem, userContext: $scope.global.userContext },
            { prop: "global.selectedSubMenuItem", val: $scope.global.selectedSubMenuItem },
            { prop: "global.selectedKontSubMenuItem", val: $scope.global.selectedKontSubMenuItem },
            { prop: "global.selectedReportSubMenuItem", val: $scope.global.selectedReportSubMenuItem },
            { prop: "global.selectedUchetSubMenuItem", val: $scope.global.selectedUchetSubMenuItem },
            { prop: "global.selectedUchetReportsSubMenuItem", val: $scope.global.selectedUchetReportsSubMenuItem },
            { prop: "global.selectedAppSubMenuItem", val: $scope.global.selectedAppSubMenuItem },
            { prop: "global.selectedJurSubMenuItem", val: $scope.global.selectedJurSubMenuItem },
            { prop: "global.selectedDilerSubMenuItem", val: $scope.global.selectedDilerASubMenuItem },
          ],
          null, "#"
        );
      }

    };


    // обновляю количество уведомлений в "колокольчике"
    $scope.global.function.updateCountCurrentUvedoml();

    // перезапрашиваем каждые 5 минут
    // #381
    $interval(() => {
      var a = 1;
      $scope.global.function.updateCountCurrentUvedoml();
    }, 5 * 60 * 1000);


    $scope.global.hideWaitingForm();

    // TODO: после дебага убрать
    //$scope.global.selectedMenuItem = "menuItemNew";

  }).catch(function initLoadError(err) {
    $scope.global.showErrorAlert("getUserContextError(): " + JSON.stringify(err));
    $scope.global.hideWaitingForm();
  });

  // определить начальную страницу после загрузки приложения
  $scope.setStartPage = function setStartPage() {

    if ($scope.global.userContext.M_ORG_TYPE_ID === $scope.global.const.M_ORG_TYPE_ID_ADMINISTRATSIYA) {
      $scope.global.selectedMenuItem = "menuItemAdm";

    } else if ($scope.global.userContext.M_ORG_TYPE_ID === $scope.global.const.M_ORG_TYPE_ID_DILER_A) {
      $scope.global.selectedMenuItem = "menuItemDilerA";

    } else if ($scope.global.userContext.M_ORG_TYPE_ID === $scope.global.const.M_ORG_TYPE_ID_DILER_C) {

      if ($scope.global.userContext.S_USER_ROLE_ID === $scope.global.const.S_USER_ROLE_ID_DIREKTOR) {
        $scope.global.selectedMenuItem = "menuItemDilerC";
      } else {
        $scope.global.selectedMenuItem = "menuItemBaza";
      }

    } else if ($scope.global.userContext.M_ORG_TYPE_ID === $scope.global.const.M_ORG_TYPE_ID_DILER_D) {

      if ($scope.global.userContext.S_USER_ROLE_ID === $scope.global.const.S_USER_ROLE_ID_DIREKTOR) {
        $scope.global.selectedMenuItem = "menuItemDilerD";
      } else {
        $scope.global.selectedMenuItem = "menuItemBaza";
      }

    }

  };


  // загрузить заново один справочник manualName
  // возвращает Promise
  $scope.global.refreshManual = function refreshManual(manualName) {
    return $scope.loadManuals(manualName);
  };


  // проверка, что переменная является числом
  $scope.global.function.isNumeric = function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };


  // преобразование строки вида 2016-12-17T20:54:00 в дату со временем
  $scope.global.function.stringToDate = function stringToDate(s) {
    var d = new Date(s);
    var nowUtc = new Date(d.getUTCFullYear(), d.getUTCMonth(),
                           d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
    return nowUtc;
  };


  // Показать диалоговое окно с кнопками Да и Нет, и если пользователь
  // нажмёт Да, то выполнить функцию fn
  $scope.global.function.showYesNoDialogResult = false;
  $scope.global.function.showYesNoDialogText = "Put simple question here";
  $scope.global.function.showYesNoDialogShown = false;
  //
  $scope.global.function.showYesNoDialog = function showYesNoDialog(text, fn) {
    $scope.global.function.showYesNoDialogText = text;
    $scope.global.function.showYesNoDialogShown = true;
    var unreg1 = $scope.$watch("global.function.showYesNoDialogResult", (newValue) => {
      if (newValue) {
        fn();
        $scope.global.function.showYesNoDialogShown = false;
        $scope.global.function.showYesNoDialogResult = false;
        $scope.global.function.showYesNoDialogText = "Put simple question here";
        unreg1();
      };
    });
  };
  // /показать диалоговое окно с кнопками Да и Нет


  // при нажатии на меню Новый
  $scope.menuItemNewClick = function menuItemNewClick() {
    $scope.$broadcast("menuItemNewClick");
  };


  // при нажатии на меню Учёт - Расход со склада
  $scope.menuItemUchetSkladRasClick = function menuItemUchetSkladRasClick() {
    $scope.$broadcast("menuItemUchetSkladRasClick");
  };
  



  // выполнить проверку, что необходимые справочники заполнены
  $scope.global.function.checkManualsFull = function checkManualsFull() {

    if ($scope.global.manual.M_SEANS_PLACE.length === 0) {
      $scope.global.showErrorAlert("Режим недоступен: не заполнен справочник 'Список оборудования'");
      return false;
    }

    if ($scope.global.manual.M_SEANS_TIME.length === 0) {
      $scope.global.showErrorAlert("Режим недоступен: не заполнен справочник 'Расписание сеансов'");
      return false;
    }
    if ($scope.global.manual.M_WORK_DAY.length === 0) {
      $scope.global.showErrorAlert("Режим недоступен: не заполнен справочник 'График работы'");
      return false;
    }

    return true;

  };


  // создаёт новую дату
  $scope.global.function.createDate = function createDate(d) {

    if (d == null) {
      d = new Date();
    }

    return new Date(d);

  };


  // на основании createDate создает текущую дату без времени
  $scope.global.function.newDateNoTime = function newDateNoTime() {

    return new Date(new Date().setHours(0, 0, 0, 0));

  };


  // возвращает новую дату с добавленным количеством дней
  //    sourceDate - дата, от которой считать
  //    daysCount - количество дней, которое надо добавить
  $scope.global.function.addDays = (sourceDate, daysCount) => {

    var d = new Date(sourceDate);
    d.setDate(d.getDate() + daysCount);

    return d;

  };


  // проверяем, что выбранный день записи/переноса записи/регистрации является выходным
  $scope.global.function.isWeekEndDay = function IsWeekEndDay(d) {
    var d = new Date(d);
    var curr_day = d.getDay();
    var result = true;

    if (typeof $scope.global.manual.M_WORK_DAY !== "undefined") {
      for (var i = 0; i < $scope.global.manual.M_WORK_DAY.length; i++) {
        var w = $scope.global.manual.M_WORK_DAY[i]["DAY_ID"];
        if (curr_day === w) {
          result = false;
        }
      }
    }

    return result;
  }

  // отображает/прячет меню при клике на пользователя
  $scope.global.function.showMenu = function showMenu() {
    if ($scope.global.setting.show === 1) {
      $scope.global.setting.show = 0;
    } else {
      $scope.global.setting.show = 1;
    }
  }

  // переходит в справочники при клике по пункту меню "Настройки"
  $scope.global.function.goToManuals = function goToManuals() {
    // скрыыаем меню
    $scope.global.setting.show = 0;
    // открываем режим
    // $scope.global.pravoNaSpravRej = 1;
    // переходим в режим
    $scope.global.selectedMenuItem = "menuItemManual";
  }

  // выходим из системы
  $scope.global.function.logOut = function logOut() {
    // возвращаем админа в Администрацию
    if ($scope.global.userContext.IS_ADM === 1) {
      $http({
        "method": "POST",
        "url": "/Home/CurrentUserChangeM_ORG_ID",
        data: { NEW_M_ORG_ID: $scope.global.const.M_ORG_ID_ADMINISTRATSIYA }
      }).then(function currentUserChangeOrgSuccess(data) {

        var form = document.getElementById("logoutForm");
        form.submit();

      }, function currentUserChangeOrgError(err) {

        $scope.global.showErrorAlert(err.toString() + " " + err.data);
        $scope.global.hideWaitingForm();

      });
    // иначе просто выходим
    } else {
      var form = document.getElementById("logoutForm");
      form.submit();
    }
  };

  // выводит div на печать в новом окне
  // main_div - Ид partialView, в котором находится div, ввыодимый на печать
  // пример вызова - global.function.printDiv('record','print-content-one')
  $scope.global.function.printDiv = function infoPrint(main_div, print_div) {
    var prtContent = document.getElementById(main_div).querySelector("#" + print_div);
    var prtCSS = "";
    var WinPrint = window.open('', '', 'left=100,top=50,width=800,height=640,toolbar=0,scrollbars=1,status=0');

    var print = document.createElement("div");
    print.className = "contentpane";
    print.setAttribute("id", "print");
    print.appendChild(prtContent.cloneNode(true));
    WinPrint.document.body.appendChild(print);
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  }

  // поменять текущему пользователю организацию (перезайти под другой организацией)
  $scope.global.currentUserChangeMOrgId = function currentUserChangeMOrgId(newMOrgId) {

    $scope.global.showWaitingForm("Переход в магазин...");

    $http({
      "method": "POST",
      "url": "/Home/CurrentUserChangeM_ORG_ID",
      data: { NEW_M_ORG_ID: newMOrgId }
    }).then(function currentUserChangeOrgSuccess(data) {

      // после изменения обновляю страницу
      location.reload();

    }, function currentUserChangeOrgError(err) {

      $scope.global.showErrorAlert(err.toString() + " " + err.data);
      $scope.global.hideWaitingForm();

    });

  };

  // открыть режим Учет - Расходные документы по переданному ID
  $scope.global.openUchetSkladRasDoc = function openUchetSkladRas(ID) {
    // посылаю намерение открыть режим Учёт - Расходные документы, чтобы 
    // само открытие произошло в uchetSkladRasDocCtrl
    $scope.$broadcast("openUchetSkladRasDoc", ID);
  };

  // инициалирует массив прав нулевыми значениями
  $scope.global.function.initPravo = function initPravo() {
    $scope.global.prava = [];

    if (typeof $scope.global.manual.M_PRAVO_GR !== "undefined") {

      for (var i = 0; i < $scope.global.manual.M_PRAVO_GR.length; i++) {
        if (typeof $scope.global.manual.M_PRAVO_REJ !== "undefined") {

          for (var j = 0; j < $scope.global.manual.M_PRAVO_REJ.length; j++) {
            if ($scope.global.manual.M_PRAVO_REJ[j]["M_PRAVO_GR_ID"] === $scope.global.manual.M_PRAVO_GR[i]["ID"]) {

              $scope.global.prava.push({
                GR_ID: $scope.global.manual.M_PRAVO_GR[i]["ID"],
                GR_NAME: $scope.global.manual.M_PRAVO_GR[i]["NAME"],
                REJ_ID: $scope.global.manual.M_PRAVO_REJ[j]["ID"],
                REJ_NAME: $scope.global.manual.M_PRAVO_REJ[j]["NAME"],
                READ: 0,
                WRITE: 0
              });
            }
          }
        }
      }
    }
  };

  // проверяет отсутствие права на чтение, для сокрытия страниц
  // некоторые права: например, для "База", "Новый", "Отчеты", "Регистрация" и т.д. проверяются только по группе прав
  // если нет ни одной записи на чтение, скрывается режим полностью
  $scope.global.function.noHavePravoRead = function noHavePravoRead(gr_id, rej_id) {
    var result = false;
    var a = {};
    var b = [29, 30, 31, 32, 33]; // учет - отчеты - ид прав
    var c = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 44, 45, 53]; //отчеты - ид прав

    if (typeof rej_id === "undefined") {
      // есть хоть одно право на чтение
      a = $scope.global.prava.find(x => x.GR_ID === gr_id && x.READ === 1);
    } else {
      a = $scope.global.prava.find(x => x.GR_ID === gr_id && x.REJ_ID === rej_id && x.READ === 1);

      // особенность для учет - отчеты
      if ((gr_id === 8) && (rej_id === -1)) {
        a = $scope.global.prava.find(x => x.GR_ID === gr_id && b.indexOf(x.REJ_ID) > -1 && x.READ === 1);
      }

      // особенность для отчеты
      if ((gr_id === 4) && (rej_id === -1)) {
        a = $scope.global.prava.find(x => x.GR_ID === gr_id && c.indexOf(x.REJ_ID) > -1 && x.READ === 1);
      }
    }

    if (typeof a === "undefined") result = true;
    return result;
  };

  // проверяет наличие права на чтение
  $scope.global.function.havePravoRead = function havePravoRead(gr_id, rej_id) {
    var result = false;
    if (typeof rej_id === "undefined") {
      // есть хоть одно право на чтение, для главного меню
      if ($scope.global.prava.find(x => x.GR_ID === gr_id && x.READ === 1)) result = true;
    } else {
      if ($scope.global.prava.find(x => x.GR_ID === gr_id && x.REJ_ID === rej_id && x.READ === 1)) result = true;
    }
    return result;
  };

  // проверяет отсутствие права на запись
  $scope.global.function.noHavePravoWrite = function noHavePravoWrite(gr_id, rej_id) {
    var result = false;
    var a = {};
    if (typeof rej_id === "undefined") {
      // есть хоть одно право на запись
      a = $scope.global.prava.find(x => x.GR_ID === gr_id && x.WRITE === 1);
    } else {
      a = $scope.global.prava.find(x => x.GR_ID === gr_id && x.REJ_ID === rej_id && x.WRITE === 1);
    }
    if (typeof a === "undefined") result = true;
    return result;
  };

  // проверяет наличие права на запись
  $scope.global.function.havePravoWrite = function havePravoWrite(gr_id, rej_id) {
    var result = false;
    if (typeof rej_id === "undefined") {
      // есть хоть одно право на запись
      if ($scope.global.prava.find(x => x.GR_ID === gr_id && x.WRITE === 1)) result = true;
    } else {
      if ($scope.global.prava.find(x => x.GR_ID === gr_id && x.REJ_ID === rej_id && x.WRITE === 1)) result = true;
    }
    return result;
  };

  // склонение числительных, например день, дня, дней
  // вызов getNumEnding(11, ['день','дня','дней']) вернет '11 дней'
  $scope.global.function.getNumEnding = function getNumEnding(iNumber, aEndings) {
    if (iNumber === null) {
      return "";
    }

    if (typeof iNumber === "undefined") {
      return "";
    } else {
      var sEnding, i;
      iNumber = iNumber % 100;
      if (iNumber >= 11 && iNumber <= 19) {
        sEnding = aEndings[2];
      } else {
        i = iNumber % 10;
        switch (i) {
          case (1): sEnding = aEndings[0]; break;
          case (2):
          case (3):
          case (4): sEnding = aEndings[1]; break;
          default: sEnding = aEndings[2];
        }
      }
      return iNumber + " " + sEnding;
    }
  }

  // печать анкеты
  //   ID передаётся, если вызов из Базы
  //   ank передаётся, если вызов из Новый
  //   newWindow передаётся при вызове из Новый при нажатии на кнопку Печать и сохранить, чтобы
  //             обойти запрет на создание всплывающих окон во вспомогательных функциях (непосредственно
  //             в click кнопки - можно), поэтому окно создаю при click, а запоняю его уже здесь
  $scope.global.function.printAnk = function printAnk(ID, ank, newWindow) {

    // эта ветка выполняется при печати анкеты из Новый
    if (ank != null) {

      if (newWindow == null) {
        $scope.global.showErrorAlert("При вызове $scope.global.function.printAnk из Анкеты" +
                                     " необходимо передавать параметр newWindow"
        );
      }
      var w = newWindow;

      w.printData = {};
      w.printData.ID = ank.ID;
      w.printData.SURNAME = ank.SURNAME;
      w.printData.NAME = ank.NAME;
      w.printData.SECNAME = ank.SECNAME;
      w.printData.PHONE_MOBILE = ank.PHONE_MOBILE;
      w.printData.PHONE_HOME = ank.PHONE_HOME;
      w.printData.M_ORG_ADRES = $scope.global.userContext.M_ORG_ADRES;
      w.printData.M_ORG_PHONE = $scope.global.userContext.M_ORG_PHONE;
      w.printData.ZABOL = ank.ZABOL;

      //#387
      w.printData.upperSURNAME = ank.SURNAME.toUpperCase();
      w.printData.ANK_PHOTO = ank.ANK_PHOTO;


    // эта ветка выполняется при печати анкеты из Базы
    } else {

      var w = window.open("/Home/PrintAnk");

      $http({
        method: "GET",
        url: "/Home/GetAnkData",
        params: { ID: ID },
        data: "JSON",
        async: false
      }).success(function (data) {

        w.printData = {};
        w.printData.ID = ID;
        w.printData.SURNAME = data.surname;
        w.printData.NAME = data.name;
        w.printData.SECNAME = data.secname;
        w.printData.PHONE_MOBILE = data.phone;
        w.printData.M_ORG_ADRES = $scope.global.userContext.M_ORG_ADRES;
        w.printData.M_ORG_PHONE = $scope.global.userContext.M_ORG_PHONE;
        w.printData.ZABOL = data.zabol;
      }).error(function (err) {

        // если была ошибка, то закрываю окно печати
        w.close();
        $scope.global.showErrorAlert(err);

      });

    }
  }


  // переменная для отображени количества уведомлений
  $scope.global.countUvedomlCurrentDay = 0;

  // открывает уведомления
  $scope.global.function.openCurrentUvedoml = function openCurrentUvedoml() {
    $scope.$broadcast("openUvedolm");
  };

  // обновляет количество уведомлений
  $scope.global.function.updateCountCurrentUvedoml = function updateCountCurrentUvedoml() {
      $http({
        "method": "GET",
        "url": "/Home/GetCountCurrentUvedoml"
      }).then(function getCurrentDateTimeSuccess(data) {
        $scope.global.countUvedomlCurrentDay = data.data;
      });
  };

  // реакция на нажатие по номеру
  $scope.global.function.phoneClick = function phoneClick(phone, item) {
    if (phone == null) {
      item.showProcessACall = false;
      return false;
    }
    
    item.showProcessACall = true;
    // при вызове из записи
    item.call = phone;

    $timeout(() => {
      item.showProcessACall = false;
      item.call = "";
    }, 2000);
    $http({
      "method": "POST",
      "url": "/Home/MakeACall",
      data: {
        phone: phone
      }
    }).then(function sendSuccess(data) {
      if (data.data.success === false) {
        $scope.global.showErrorAlert(data.data.message);
      } else {
        // даже если запрос прошёл, ответ может содержать ошибку
        if ((data.data.res.indexOf("success") === -1) || (data.data.res.indexOf("error") > -1)) {
          $scope.global.showErrorAlert("При совершении вызова произошла ошибка. Проверьте 'Ключ API для звонков' и 'Секретный ключ API' в Настройках, а так же 'Логин для звонков' в профиле пользователя");
        }
      }
    }, function sendFailed(err) {
      $scope.global.showErrorAlert(err.data);
    });
  }

});