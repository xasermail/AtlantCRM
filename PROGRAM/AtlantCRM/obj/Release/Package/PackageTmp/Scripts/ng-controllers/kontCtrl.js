"use strict";

var scopeKontCtrl;

// контроллер
kontCtrl = myApp.controller("kontCtrl", function kontCtrl($scope, $http) {

  scopeKontCtrl = $scope;

  //значение смещения вверх для появляющихся окошек
  $scope.offsetInTop = -80;

  // маска телефона
  $("#kont .kont-edit input[ng-model='kont.PHONE']").mask("+7(999) 999-99-99");

  // текущий редактируемый контакт
  $scope.kont = {};
  $scope.kont.show = false;
  // действие с контактом: "add" - добавление нового, "edit" - редактирование существующего
  $scope.kont.currentMode = "add";

  // текущий редактируемый сеанс
  $scope.kontSeans = {};
  $scope.kontSeans.show = false;


  // поиск контакта по телефону через autocomplete
  $(".kont-container div.kont-search input").autocomplete({
    source: "/Home/GetKontSearchList",
    minLength: 2,
    select: function (event, ui) {
      // console.log("Selected: " + ui.item.value + " aka " + ui.item.id);
      // $scope.$apply("newAnk.FIO_INFO_ID = " + ui.item.id);
      console.log(ui.item);

      // выбран человек из Контактов
      if (ui.item.KontOrRek === "KONT") {

        // переключаемся на вкладку Запись
        $scope.global.selectedKontSubMenuItem = 0;

        // идентификатор выбранного контакта
        $scope.global.searchO_KONT_ANK_ID = ui.item.id;
        $scope.yearMonthDay = ui.item.date;
        $scope.setYearMonthDay(new Date($scope.yearMonthDay));
        $scope.getData($scope.yearMonthDay);

        // выбран человек из Рекомендованных
      } else if (ui.item.KontOrRek === "REK") {

        // идентификатор выбранного рекомендованного
        $scope.global.searchO_REK_ANK_ID = ui.item.id;

        // переключаемся на вкладку Рекомендованных
        $scope.global.selectedKontSubMenuItem = 3;
        // на первую страницу
        scopeKontListByModeCtrl.pageForRecomend = 1;
        scopeKontListByModeCtrl.getDataNotCame();

        // ошибка, не знаю, что за тип
      } else {
        $scope.global.showErrorAlert("Неизвестный тип поиска: " + ui.item.KontOrRek);
      }

      // очищаю поле поиска
      window.setTimeout(function clearKontSearchTimeout() {
        $(".kont-container div.kont-search input").val("");
      }, 1000);
      
    }
  }).attr("placeholder", "Телефон");


  // реакция на открытие подвкладки (реагируем именнно так потому что авжно что ыб происходило
  // перезаполение при переходе между внутренними вкладками)
  $scope.$on("global.selectedKontSubMenuItemChanged", function selectedKontSunMenuItemChanged(event, newValue) {
   
    // срабатывает, только если открыта вкладка Контакты
    if (newValue == "0" && $scope.global.selectedMenuItem === "menuItemKont") {
      $scope.refreshKont();
    }

  });


  // событие при открытии вкладки Контакты
  $scope.$on("global.selectedMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    // если открыто подменю Запись
    if (newValue === "menuItemKont" && $scope.global.selectedKontSubMenuItem == "0") {
      $scope.refreshKont();
    }

  });

  // обновление данных вкладки Запись
  $scope.refreshKont = function refreshKont() {

    // проверка, что заполнены справочники
    if (!($scope.global.function.checkManualsFull())) {
      $scope.global.selectedMenuItem = "";
      return false;
    }

    //если дата еще не задана задаем
    if (typeof $scope.yearMonthDay == "undefined") {
      $scope.yearMonthDay = "";
      $scope.kont.show = false;
      initDateTime(1);
    }

    ////приводим вкладку к начальному виду (могли быть открыты окна)
    //$scope.kontEditClose();
    //перезапрашиваем данные на выбранный день
    $scope.getData($scope.yearMonthDay);


  };

  // выбор данных на день
  $scope.getDataClick = function getDataClick(x) {
    $scope.kontEditClose();
    // на завтра
    if (x === 0) {
      $scope.yearMonthDay = "";
      initDateTime(1);
      $scope.tomorrowClick = 0;
    } else {
      initDateTime(x);
    }
    if (x < 0) {
      $scope.backClick = 0;
    } else if (x === 1) {
      $scope.nextClick = 0;
    }
    $scope.getData($scope.yearMonthDay);
  }

  //запрос данных
  $scope.getData = function getData(date) {

    $scope.o_seans_header = [];
    //формирование заголовока таблицы
    if (typeof $scope.global.manual.M_SEANS_TIME !== "undefined") {
      for (var i = 0; i < $scope.global.manual.M_SEANS_TIME.length; i++) {
        $scope.o_seans_header.push({
          id: $scope.global.manual.M_SEANS_TIME[i]["ID"],
          time: $scope.global.manual.M_SEANS_TIME[i]["MIN_TIME"]
        });
      }
    }

    //получение остальных данных
    var d = Date.parse(date);
    if (isNaN(d)) {
      d = null;
    } else {
      d = new Date(date);
    }


    $scope.global.showWaitingForm("Сохранение..");
    $scope.getKontacksByDay(d).then((data) => {
      $scope.dataForTable = data.data;
      $scope.global.hideWaitingForm();
    });


    // отвечают за блокировку кнопок, возможно стоит просто убрать отсюда и из разметки
    $scope.nextClick = 1;
    $scope.backClick = 1;
    $scope.tomorrowClick = 1;
  }

  // дата сеанса
  function initDateTime(x) {
    var d = new Date();
    if (x !== 0) {
      if ($scope.yearMonthDay === "") {
        d = new Date();
      } else {
        d = new Date($scope.yearMonthDay);
      }
    }

    d.setDate(d.getDate() + x);
    // пропускаем выходные
    var curr_day = d.getDay();
    var exists = 0;
    var work_count = 0;

    while (exists === 0) {
      work_count = 0;
      if (typeof $scope.global.manual.M_WORK_DAY !== "undefined") {
        for (var i = 0; i < $scope.global.manual.M_WORK_DAY.length; i++) {
          var w = $scope.global.manual.M_WORK_DAY[i]["DAY_ID"];
          if (curr_day === w) {
            exists = 1;
          }
          work_count++;
        }
      }

      // если день не найден в календаре, добавляем/отнимаем день (нажали вперед/назад), пока не найдем
      if (exists === 0) {
        if (x !== 0) {
          d.setDate(d.getDate() + x);
        } else {
          d.setDate(d.getDate() + 1); // при загрузке движемся вперед, к ближайшему дню
        }
        curr_day = d.getDay();
      }
    }

    $scope.setYearMonthDay(d);
  }


  // отобразить дату, переданную в качестве параметра
  $scope.setYearMonthDay = function setYearMonthDay(dt) {
    var day = dt.getDate();
    var month = dt.getMonth() + 1;
    var year = dt.getFullYear();

    if (day <= 9) day = "0" + day;
    if (month <= 9) month = "0" + month;

    $scope.day = day;
    $scope.month = month;
    $scope.year = year;
    $scope.weekday = days[dt.getDay()];
    $scope.monthName = months[dt.getMonth()];
    $scope.usingDate = dt;
    $scope.yearMonthDay = $scope.year + "-" + $scope.month + "-" + $scope.day;
    // день недели, число, месяц текущей даты
    $scope.dayWeekDate = $scope.weekday + " " + dt.getDate() + " " + $scope.monthName;
  };

  // --== Добавление контакта ==--
  // нажатие на пустую ячейку таблицы
  $scope.tdAddKontClickHandler = function tdAddKontClickHandler(e) {
    $scope.kontEditClose();
    $scope.kont.currentMode = "add";
    // права на запись
    if ($scope.global.function.noHavePravoWrite(7,24)) return false;

    var elem = e.currentTarget;
    var m_seans_time_id = parseInt(elem.attributes[1].value);

    // на прошлую дату не записываем
    var now = new Date();
    var d = new Date($scope.yearMonthDay);
    if (d.setHours(0, 0, 0, 0) < now.setHours(0, 0, 0, 0)) {
      $scope.kont.show = false;
      return false;
    }

    $scope.kont.show = true;
    $scope.kont.M_SEANS_TIME_ID = m_seans_time_id;
    $scope.kont.M_KONT_STATUS_ID = $scope.global.const.M_KONT_STATUS_ID_VIBERITE_STATUS;
    $scope.kont.M_KONT_IST_ID = $scope.global.const.M_KONT_IST_ID_VIBERITE_STATUS;

    surnameFocus();
  }

  // нажатие на пустую ячейку таблицы
  $scope.tdChangeKontClickHandler = function tdChangeKontClickHandler(kontSeansAndAnk) {

    $scope.kontEditClose();

    // права на запись
    if ($scope.global.function.noHavePravoWrite(7, 24)) return false;

    $scope.kont = {};
    $scope.kont.currentMode = "edit";
    $scope.kont.show = true;
    $scope.kont.SURNAME = kontSeansAndAnk.SURNAME;
    $scope.kont.NAME = kontSeansAndAnk.NAME;
    $scope.kont.SECNAME = kontSeansAndAnk.SECNAME;
    $scope.kont.PHONE = kontSeansAndAnk.Phone;
    $scope.kont.COMMENT = kontSeansAndAnk.Comment;
    $scope.kont.ID = kontSeansAndAnk.KontId;
    $scope.kont.M_KONT_STATUS_ID = kontSeansAndAnk.M_KONT_STATUS_ID;
    $scope.kont.M_KONT_IST_ID = kontSeansAndAnk.M_KONT_IST_ID;
    surnameFocus();

  };

  // Кнопка "Х" в окошке нового контакта
  $scope.kontEditClose = function kontEditClose() {

    // закрывает все окна и преведит окно в стандартный вид
    $scope.kont = {};
    $scope.kont.show = false;

    var d = $scope.global.function.newDateNoTime();
    // запись всегда завтра и позднее
    d.setDate(d.getDate() + 1);
    $scope.kontSeans.SEANS_DATE = d;
    $scope.kontSeans.show = false;
    $scope.kontSeans.COMMENT = "";
    $scope.kontSeans.error = "";

  };

  // кнопка "Сохранить" в окошке нового контакта
  $scope.kontEditSave = function kontEditSave() {
    $scope.doKontEditSave($scope);
  };

  // сохранение нового или отредактированного контакта
  // может вызываться из разных контроллеров (например Записи),
  // поэтому scope передаётся как параметр
  $scope.doKontEditSave = function doKontEditSave(scope) {

    scope.global.showWaitingForm("Сохранение..");

    // востанавливаем корректный вид окошка
    scope.kont.error = "";

    // если не введен телефон добавляем текст ошибки
    if (scope.kont.PHONE === "") {
      scope.kont.error = "Не заполнен телефон. ";
    }

    // если не введено не обного значения из ФИО, добавляем текст ошибки
    if (scope.kont.SURNAME === ""
        && scope.kont.NAME === ""
        && scope.kont.SECNAME === "") {
      scope.kont.error = scope.kont.error + "Не заполнено ФИО.";
    }

    // если текст ошибки не пуст, выводим его и останавливаем сохранение
    if (scope.kont.error != "") {
      scope.global.hideWaitingForm();
      return;
    }

    var doKont;
    if (scope.kont.currentMode === "edit") {

      doKont = $http({
        "method": "POST",
        "url": "/Home/ChangeKont",
        params: {
          surname: scope.kont.SURNAME,
          name: scope.kont.NAME,
          secname: scope.kont.SECNAME,
          phone: scope.kont.PHONE,
          commentForSave: scope.kont.COMMENT,
          kontID: scope.kont.ID,
          M_KONT_STATUS_ID: scope.kont.M_KONT_STATUS_ID,
          M_KONT_IST_ID: scope.kont.M_KONT_IST_ID
        }
      });

    } else if (scope.kont.currentMode === "add") {

      doKont = $http({
        "method": "POST",
        "url": "/Home/CreateNewKont",
        params: {
          surname: scope.kont.SURNAME,
          name: scope.kont.NAME,
          secname: scope.kont.SECNAME,
          phone: scope.kont.PHONE,
          time_id: scope.kont.M_SEANS_TIME_ID,
          date: new Date(scope.yearMonthDay),
          commentForSave: scope.kont.COMMENT,
          M_KONT_STATUS_ID: scope.kont.M_KONT_STATUS_ID,
          M_KONT_IST_ID: scope.kont.M_KONT_IST_ID
        }
      })

    } else {

      throw "Не удалось определить scope.kont.currentMode -> kontCtrl.js -> kontEditSave)";

    }

    doKont.then((data) => {

      if (data.data.success === "true") {

        scope.kontEditClose();
        scope.getData(scope.yearMonthDay);

      } else if (data.data.success === "exists") {

        scope.kont.error = "Тел. уже есть в Контактах, " + data.data.dateExist;

      } else if (data.data.success === "exists ank") {

        scope.kont.error = "Тел. уже есть в Анкете";

      }

      scope.global.hideWaitingForm();

    });
  };

  // --== Изменение сеанса ==--
  // нажатие на кнопке изменения сеанса (черный квадратик)
  $scope.btnChangeSeansClick = function btnChangeSeansClick(e) {

    $scope.kontEditClose();

    // права на запись
    if ($scope.global.function.noHavePravoWrite(7, 24)) {
      return false;
    }

    var elem = e.currentTarget;
    // сохраняем идентификатор записи на сеанс для дальнейшего использования
    $scope.kontSeans.ID = parseInt(elem.attributes[0].value);
    // сохраняем все параметры, т.к. предполагается редактирование записи
    $scope.kontSeans.M_SEANS_TIME_ID = parseInt(elem.attributes[1].value);
    $scope.kontSeans.COMMENT = elem.attributes[2].value;
    $scope.kontSeans.SEANS_DATE = $scope.usingDate;

    // делаем видимым окошко
    $scope.kontSeans.show = true;

  };



  // нажатие на кнопку "Отмена" в окошке изменения сеанса
  $scope.kontEditSeansCancel = function kontEditSeansCancel() {
    $scope.kontEditClose();
  };

  // сохранение отредактированного сеанса
  $scope.kontEditSeansSave = function kontEditSeansSave() {
    $scope.doKontEditSeansSave($scope);
  };

  // нажатие на кнопку "Сохранить" в окошке изменения сеанса
  // может вызываться из разных контроллеров (например Записи),
  // поэтому scope передаётся как параметр
  $scope.doKontEditSeansSave = function doKontEditSeansSave(scope) {

    scope.global.showWaitingForm("Сохранение..");

    // блок привеедния оконка к стандартному виду
    scope.kontSeans.error = "";

    //если дата не выбрана
    if (scope.kontSeans.SEANS_DATE == null) {   //дополняем текст ошибки
      scope.kontSeans.error = "Не выбрана дата. ";
    }
    else {
      //если дата проставлена

      var n1 = new Date();
      var testData = new Date(n1.setDate(n1.getDate() - 1));
      //проверяем не выбрана ли дата меньше текущей
      if (scope.kontSeans.SEANS_DATE < testData) {
        scope.kontSeans.error = "Нельзя выбирать старые даты. ";
      }
      else {
        //проверям является ли выбранный день рабочим
        var curr_day = scope.kontSeans.SEANS_DATE.getDay();
        var exists = 0;
        if (typeof scope.global.manual.M_WORK_DAY !== "undefined") {
          for (var i = 0; i < scope.global.manual.M_WORK_DAY.length; i++) {
            var w = scope.global.manual.M_WORK_DAY[i]["DAY_ID"];
            if (curr_day === w) {
              exists = 1;
            }
          }
        }
        if (exists === 0) {
          scope.kontSeans.error = "Выбран не рабочий день. ";
        }
      }
    }
    //если не выбран сеанс
    if (typeof scope.kontSeans.M_SEANS_TIME_ID === "undefined") {
      scope.kontSeans.error = scope.kontSeans.error + "Не выбран сеанс.";
    }

    if (scope.kontSeans.error !== "") {
      scope.global.hideWaitingForm();
      return;
    }


    scope.global.showWaitingForm("Сохранение..");

    $http({
      "method": "POST",
      "url": "/Home/ChangeKontSeans",
      params: {
        kontSeansID: scope.kontSeans.ID,
        date: scope.kontSeans.SEANS_DATE,
        time_id: scope.kontSeans.M_SEANS_TIME_ID,
        commentForSave: scope.kontSeans.COMMENT,
        neprish: 0
      }
    }).success(function (data) {
      scope.getData(scope.yearMonthDay);
      scope.global.hideWaitingForm();
    });

    scope.kontEditClose();

    scope.global.hideWaitingForm();

  };
  // --== /изменение сеанса ==-- 




  // запросить контакты, записанные на указанную дату
  // в качестве d передаётся обычная дата типа Date
  // skrIzRecord - true, если надо скрыть из результатов Контакты,
  //               которые скрыты из режима Запись, O_KONT_ANK.SKR_IZ_RECORD = 1
  $scope.getKontacksByDay = (d, skrIzRecord) => {
    if (skrIzRecord !== true) {
      skrIzRecord = false;
    }
    return $http({
      method: "GET",
      url: "/Home/GetKontacksByDay",
      params: {
        date: d,
        skrIzRecord: skrIzRecord
      }
    });
  };

  // установить фокус на поле ввода фамилии
  function surnameFocus() {
    window.setTimeout(function () { $("#kont .kont-edit input[ng-model='kont.SURNAME']").focus(); });
  }


  // при нажатии кнопки очистки рядом с поиском по Контактам
  $(".kont-container div.kont-search button.clear").click(function bntKontSearchClearClick() {

    $scope.global.searchO_KONT_ANK_ID = null;
    $scope.global.searchO_REK_ANK_ID = null;
    $(".kont-container div.kont-search input").val(null);

  });


});