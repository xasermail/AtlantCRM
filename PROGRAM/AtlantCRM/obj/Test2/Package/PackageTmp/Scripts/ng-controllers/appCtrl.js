"use strict";
var myApp;
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
//var kontNoCameCtrl;
var kontListByModeCtrl;


myApp = angular.module("myApp", ['ui.multiselect']);
var months = new Array("января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря");
var days = new Array("Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота");


// обработка всех неотловленных ошибок
myApp.config(function ($provide) {
  $provide.decorator("$exceptionHandler", ['$delegate', function ($delegate) {
    return function (exception, cause) {
      $delegate(exception, cause);
      alert("Произошла ошибка: " + exception.message);
    };
  }]);
});


// контроллер
appCtrl = myApp.controller("appCtrl", function appCtrl($scope, $http, $timeout, $interval) {
  var i = 0;
  // объект, доступный из других контроллеров
  $scope.global = {};
  // выбранные элементы
  // меню
  $scope.global.selectedMenuItem = "menuItemNew";
  // подменю
  $scope.global.selectedSubMenuItem = 0;
  // подменю режима Контакты
  $scope.global.selectedKontSubMenuItem = 0;
  // поменю Отчетов
  $scope.global.selectedReportSubMenuItem = 0;
  // подменю режима Учет
  $scope.global.selectedUchetSubMenuItem = 0;
  // подменю режима Учет - отчеты
  $scope.global.selectedUchetReportsSubMenuItem = 0;
  // здесь будем хранить все справочники
  $scope.global.manual = {};
  // режим печати анкеты
  $scope.global.newAnkPrintPreviewMode = false;
  // текущая анкета
  $scope.global.ank = {};
  $scope.global.ank.agg = {};

  // здесь будем хранить все общие функции
  $scope.global.function = {};

  // текущий пользователь
  $scope.global.currentContext = {};

  // true, если надо отобразить фон модального окна для общего использования
  $scope.global.commonModalBackgroundShown = false;

  // true, если надо отобразить фон модального окна для общего использования, поверх первого
  $scope.global.commonModalBackground2Shown = false;

  //// константы
  // организации
  $scope.global.const = {};
  $scope.global.const.M_ORG_TYPE_ID_ADMINISTRATSIYA = 1;
  $scope.global.const.M_ORG_TYPE_ID_DILER_A = 2;
  $scope.global.const.M_ORG_TYPE_ID_DILER_C = 3;
  $scope.global.const.M_ORG_TYPE_ID_DILER_D = 4;
  // должности
  $scope.global.const.S_USER_ROLE_ID_DIREKTOR = 5;
  // ряды
  $scope.global.const.M_RYAD_ID_1 = 1;
  $scope.global.const.M_RYAD_ID_2 = 2;
  // печать анкеты
  $scope.global.newAnkPrintPreview = {};
  // переменные режима Общение, например seans_id
  $scope.global.dialog = {};
  // переменные режима Звонки, например seans_id
  $scope.global.zvonok = {};
  // переменные для отображения меню выход и настройки
  $scope.global.setting = {};

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
    $http({
      method: "GET",
      url: "/Home/GetCurrentUserInfo",
      data: "JSON"
    }).success(function (data) {
      $scope.global.currentContext = data;

      // получаем права пользователя на режимы
      // сначала все отключаем
      $scope.global.pravoNaNewRej = 0;
      $scope.global.pravoNaBazaRej = 0;
      $scope.global.pravoNaRegRej = 0;
      $scope.global.pravoNaOtchRej = 0;
      $scope.global.pravoNaRyadRej = 0;
      $scope.global.pravoNaZapisRej = 0;
      $scope.global.pravoNaKontRej = 0;
      $scope.global.pravoNaUchetRej = 0;
      $scope.global.pravoNaPrilojRej = 0; // нет содержимого вкладки
      $scope.global.pravoNaJurRej = 0;  // нет содержимого вкладки
      $scope.global.pravoNaSpravRej = 0;

      // доступ к контролам, по режимам

      // анкета
      $scope.global.ankAnketaPravoWrite = 0;
      $scope.global.ankPeriodPravoWrite = 0;
      $scope.global.ankDialogPravoWrite = 0;
      $scope.global.ankStatPravoWrite = 0;
      $scope.global.ankVoprosPravoWrite = 0;
      $scope.global.ankVypiskiPravoWrite = 0;
      $scope.global.ankFrendsPravoWrite = 0;
      $scope.global.ankZvonokPravoWrite = 0;
      $scope.global.ankServicePravoWrite = 0;

      $scope.global.ankAnketaPravoRead = 0;
      $scope.global.ankPeriodPravoRead = 0;
      $scope.global.ankDialogPravoRead = 0;
      $scope.global.ankStatPravoRead = 0;
      $scope.global.ankVoprosPravoRead = 0;
      $scope.global.ankVypiskiPravoRead = 0;
      $scope.global.ankFrendsPravoRead = 0;
      $scope.global.ankZvonokPravoRead = 0;
      $scope.global.ankServicePravoRead = 0;

      // справочники
      $scope.global.manualPravoWrite = 0;
      $scope.global.manualPravoRead = 0;

      // регистрация
      $scope.global.regPravoWrite = 0;
      $scope.global.regPravoRead = 0;

      // отчеты
      $scope.global.reportPravoWrite = 0;
      $scope.global.reportPravoRead = 0;

      // ряды
      $scope.global.lanePravoWrite = 0;
      $scope.global.lanePravoRead = 0;

      // запись
      $scope.global.recordPravoWrite = 0;
      $scope.global.recordPravoRead = 0;

      // контакты
      $scope.global.contactPravoWrite = 0;
      $scope.global.contactPravoRead = 0;

      // учет
      $scope.global.uchetPravoWrite = 0;
      $scope.global.uchetPravoRead = 0;

      $http({
        method: "GET",
        url: "/Home/GetUserRightsViewEdit",
        params: { S_USER_ID: $scope.global.currentContext.ID },
        data: "JSON",
        async: false
      }).success(function (data) {
        if (typeof data !== "undefined") {
          for (var i = 0; i < data.length; i++) {
            // 1	Личная карта
            if (data[i]["GR_ID"] === 1) {
              if (data[i]["READ1"] === 1) {
                if (data[i]["REJ_ID"] === 1) {  //Анкета
                  $scope.global.ankAnketaPravoRead = 1;
                  $scope.global.ankAnketaPravoWrite = 0;
                  $scope.global.pravoNaNewRej = 1;
                  $scope.global.pravoNaBazaRej = 1;
                }
                if (data[i]["REJ_ID"] === 2) {  //Период
                  $scope.global.ankPeriodPravoRead = 1;
                  $scope.global.ankPeriodPravoWrite = 0;
                }
                if (data[i]["REJ_ID"] === 3) {  //Общение
                  $scope.global.ankDialogPravoRead = 1;
                  $scope.global.ankDialogPravoWrite = 0;
                }
                if (data[i]["REJ_ID"] === 4) {  //Статистика
                  $scope.global.ankStatPravoRead = 1;
                  $scope.global.ankStatPravoWrite = 0;
                }
                if (data[i]["REJ_ID"] === 5) {  //Вопросы
                  $scope.global.ankVoprosPravoRead = 1;
                  $scope.global.ankVoprosPravoWrite = 0;
                }
                if (data[i]["REJ_ID"] === 6) {  //Выписки
                  $scope.global.ankVypiskiPravoRead = 1;
                  $scope.global.ankVypiskiPravoWrite = 0;
                }
                if (data[i]["REJ_ID"] === 7) {  //Друзья
                  $scope.global.ankFrendsPravoRead = 1;
                  $scope.global.ankFrendsPravoWrite = 0;
                }
                if (data[i]["REJ_ID"] === 8) {  //Звонки
                  $scope.global.ankZvonokPravoRead = 1;
                  $scope.global.ankZvonokPravoWrite = 0;
                }
                if (data[i]["REJ_ID"] === 9) {  //Сервис
                  $scope.global.ankServicePravoRead = 1;
                  $scope.global.ankServicePravoWrite = 0;
                }
              }

              if (data[i]["WRITE1"] === 1) {
                if (data[i]["REJ_ID"] === 1) {
                  $scope.global.ankAnketaPravoRead = 1;
                  $scope.global.ankAnketaPravoWrite = 1;
                  $scope.global.pravoNaNewRej = 1;
                  $scope.global.pravoNaBazaRej = 1;
                }
                if (data[i]["REJ_ID"] === 2) {
                  $scope.global.ankPeriodPravoRead = 1;
                  $scope.global.ankPeriodPravoWrite = 1;
                }
                if (data[i]["REJ_ID"] === 3) {
                  $scope.global.ankDialogPravoRead = 1;
                  $scope.global.ankDialogPravoWrite = 1;
                }
                if (data[i]["REJ_ID"] === 4) {
                  $scope.global.ankStatPravoRead = 1;
                  $scope.global.ankStatPravoWrite = 1;
                }
                if (data[i]["REJ_ID"] === 5) {
                  $scope.global.ankVoprosPravoRead = 1;
                  $scope.global.ankVoprosPravoWrite = 1;
                }
                if (data[i]["REJ_ID"] === 6) {
                  $scope.global.ankVypiskiPravoRead = 1;
                  $scope.global.ankVypiskiPravoWrite = 1;
                }
                if (data[i]["REJ_ID"] === 7) {
                  $scope.global.ankFrendsPravoRead = 1;
                  $scope.global.ankFrendsPravoWrite = 1;
                }
                if (data[i]["REJ_ID"] === 8) {
                  $scope.global.ankZvonokPravoRead = 1;
                  $scope.global.ankZvonokPravoWrite = 1;
                }
                if (data[i]["REJ_ID"] === 9) {
                  $scope.global.ankServicePravoRead = 1;
                  $scope.global.ankServicePravoWrite = 1;
                }
              }
            }
            // 2	Справочники
            if (data[i]["GR_ID"] === 2) {
              if (data[i]["READ1"] === 1) {
                $scope.global.manualPravoWrite = 0;
                $scope.global.manualPravoRead = 1;
                $scope.global.pravoNaSpravRej = 1;
              }
              if (data[i]["WRITE1"] === 1) {
                $scope.global.manualPravoWrite = 1;
                $scope.global.manualPravoRead = 1;
                $scope.global.pravoNaSpravRej = 1;
              }
            }
            // 3	Регистрация
            if (data[i]["GR_ID"] === 3) {
              if (data[i]["READ1"] === 1) {
                $scope.global.regPravoWrite = 0;
                $scope.global.regPravoRead = 1;
                $scope.global.pravoNaRegRej = 1;
              }
              if (data[i]["WRITE1"] === 1) {
                $scope.global.regPravoWrite = 1;
                $scope.global.regPravoRead = 1;
                $scope.global.pravoNaRegRej = 1;
              }
            }
            // 4	Отчеты
            if (data[i]["GR_ID"] === 4) {
              if (data[i]["READ1"] === 1) {
                $scope.global.pravoNaOtchRej = 1;
                $scope.global.reportPravoWrite = 1;
                $scope.global.reportPravoRead = 1;
              }
              if (data[i]["WRITE1"] === 1) {
                $scope.global.pravoNaOtchRej = 1;
                $scope.global.reportPravoWrite = 1;
                $scope.global.reportPravoRead = 1;
              }
            }
            // 5	Ряды
            if (data[i]["GR_ID"] === 5) {
              if (data[i]["READ1"] === 1) {
                $scope.global.pravoNaRyadRej = 1;
                $scope.global.lanePravoWrite = 0;
                $scope.global.lanePravoRead = 1;
              }
              if (data[i]["WRITE1"] === 1) {
                $scope.global.pravoNaRyadRej = 1;
                $scope.global.lanePravoWrite = 1;
                $scope.global.lanePravoRead = 1;
              }
            }
            // 6	Запись
            if (data[i]["GR_ID"] === 6) {
              if (data[i]["READ1"] === 1) {
                $scope.global.recordPravoWrite = 0;
                $scope.global.recordPravoRead = 1;
                $scope.global.pravoNaZapisRej = 1;
              }
              if (data[i]["WRITE1"] === 1) {
                $scope.global.recordPravoWrite = 1;
                $scope.global.recordPravoRead = 1;
                $scope.global.pravoNaZapisRej = 1;
              }
            }
            // 7	Контакты
            if (data[i]["GR_ID"] === 7) {
              if (data[i]["READ1"] === 1) {
                $scope.global.contactPravoWrite = 0;
                $scope.global.contactPravoRead = 1;
                $scope.global.pravoNaKontRej = 1;
              }
              if (data[i]["WRITE1"] === 1) {
                $scope.global.contactPravoWrite = 1;
                $scope.global.contactPravoRead = 1;
                $scope.global.pravoNaKontRej = 1;
              }
            }
            // 8	Учет
            if (data[i]["GR_ID"] === 8) {
              if (data[i]["READ1"] === 1) {
                $scope.global.uchetPravoWrite = 0;
                $scope.global.uchetPravoRead = 1;
                $scope.global.pravoNaUchetRej = 1;
              }
              if (data[i]["WRITE1"] === 1) {
                $scope.global.uchetPravoWrite = 1;
                $scope.global.uchetPravoRead = 1;
                $scope.global.pravoNaUchetRej = 1;
              }
            }
          }
        }
      });
    });
  }

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


  // Форма ожидания
  // отобразить форму ожидания
  $scope.waitingFormShown = true;
  $scope.waitingFormMsg = "Загрузка...";
  $scope.waitingFormShowTime = new Date();
  $scope.global.showWaitingForm = function showWaitingForm(msg) {
    $scope.waitingFormShowTime = new Date();
    if (msg != null) {
      $scope.waitingFormMsg = msg;
    }
    $scope.waitingFormShown = true;
  };
  //
  // скрыть форму ожидания, возвращает Promise, можно использовать
  $scope.global.hideWaitingForm = function hideWaitingForm() {

    // смотрю что с момента отображения формы хотя бы 2 секунды прошло,
    // чтобы не было эффекта, что окно только отобразилось и сразу скрылось
    // т.е. непонятное моргание
    return new Promise(function promiseHideWaitingForm(resolve, reject) {
      var fn1 = function fn1() {
        var d = new Date();
        if (d - $scope.waitingFormShowTime > 2000) {
          $scope.waitingFormShown = false;
          resolve(d);
        } else {
          $timeout(fn1, 2000);
        }
      };
      fn1();
    });

  };
  // /форма ожидания




  // Сообщение об ошибке alert
  // показать
  $scope.errorAlertShown = false;
  $scope.global.showErrorAlert = function showErrorAlert(msg) {
    $scope.errorAlertMsg = msg;
    $scope.errorAlertShown = true;
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
      manualAllName.push("M_SEANS_PLACE");  // места для сеансов
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

    return new Promise(function (resolve) { resolve(1);});

  // при изменении вкладки отсылаю событие всем заинтересованным
  // контроллерам для обновления их состояния
  }).then(function selectedMenuItemChangedSuccess() {

    $scope.$watch("global.selectedMenuItem", (newValue, oldValue) => {
      $scope.$broadcast("global.selectedMenuItemChanged", newValue, oldValue);
    });

    return new Promise(function (resolve) { resolve(1); });


  // при изменении подвкладки в меню Новый отсылаю событие всем заинтересованным
  // контроллерам для обновления их состояния
  }).then(function selectedSubMenuItemChangedSuccess() {

    $scope.$watch("global.selectedSubMenuItem", (newValue) => {
      $scope.$broadcast("global.selectedSubMenuItemChanged", newValue);
    });

    return new Promise(function (resolve) { resolve(1); });


  // при изменении подвкладки в меню Контакты отсылаю событие всем заинтересованным
  // контроллерам для обновления их состояния
  }).then(function selectedKontSubMenuItemChangedSuccess() {

    $scope.$watch("global.selectedKontSubMenuItem", (newValue) => {
        $scope.$broadcast("global.selectedKontSubMenuItemChanged", newValue);
    });

    return new Promise(function (resolve) { resolve(1); });


  // при изменении подвкладки в меню Отчеты отсылаю событие всем заинтересованным
  // контроллерам для обновления их состояния
  }).then(function selectedReportSubMenuItemChangedSuccess() {

    $scope.$watch("global.selectedReportSubMenuItem", (newValue) => {
        $scope.$broadcast("global.selectedReportSubMenuItemChanged", newValue);
    });

    return new Promise(function (resolve) { resolve(1); });


  // при изменении подвкладки в меню Учет отсылаю событие всем заинтересованным
  // контроллерам для обновления их состояния
  }).then(function selectedUchetSubMenuItemChangedSuccess() {

    $scope.$watch("global.selectedUchetSubMenuItem", (newValue) => {
      $scope.$broadcast("global.selectedUchetSubMenuItemChanged", newValue);
    });

    return new Promise(function (resolve) { resolve(1); });



  // при изменении подвкладки в меню Учет - отчеты отсылаю событие всем заинтересованным
  // контроллерам для обновления их состояния
  }).then(function selectedUchetReportsSubMenuItemChangedSuccess() {

    $scope.$watch("global.selectedUchetReportsSubMenuItem", (newValue) => {
      $scope.$broadcast("global.selectedUchetReportsSubMenuItemChanged", newValue);
    });

    return new Promise(function (resolve) { resolve(1); });


  // считаю, что вся программа загрузилась
  }).then(function selectedMenuItemChangedSuccess() {

    $scope.$broadcast("global.appCtrlLoaded");


    // вычисляю начальную вкладку
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

    // запросим права
    $scope.global.loadUserRights();

    $scope.global.hideWaitingForm();

    // TODO: после дебага убрать
    //$scope.global.selectedMenuItem = "menuItemNew";

  }).catch(function initLoadError(err) {
    $scope.global.showErrorAlert("getUserContextError(): " + err);
    $scope.global.hideWaitingForm();
  });


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


  // показать диалоговое окно с кнопками Да и Нет, и если пользователь
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
    var form = document.getElementById("logoutForm");
    form.submit();
  }

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

});