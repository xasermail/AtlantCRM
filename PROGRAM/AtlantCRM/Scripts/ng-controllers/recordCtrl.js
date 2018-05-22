"use strict";

var scopeRecordCtrl;

// контроллер
recordCtrl = myApp.controller("recordCtrl", function recordCtrl($scope, $http, $timeout) { //$sce) {

  scopeRecordCtrl = $scope;

  // записанные из Контактов
  $scope.o_seans_kont = [];

  // максимальный номер строки, на которой
  // расположилась запись анкет
  $scope.maxRecordAnkId = 0;

  // событие при открытии вкладки
  $scope.$on("global.selectedMenuItemChanged", function selectedMenuItemChanged(event, newValue, oldValue) {
    if (newValue === "menuItemZapis") {
      // загрузка режима
      $scope.refreshRecord();
    }
  });

  

  // текущий редактируемый контакт
  $scope.kont = {};
  // окно редактирования контакта
  $scope.kont.show = false;
  // действие с контактом: "add" - добавление нового, "edit" - редактирование существующего
  $scope.kont.currentMode = "edit";

  // текущий редактируемый сеанс
  $scope.kontSeans = {};
  $scope.kontSeans.show = false;

  // выбор записи на дату
  $scope.date = new Date();


  $scope.refreshRecord = function refreshRecord() {
    var i = 0;
    var j = 0;
    $scope.day = "";
    $scope.month = "";
    $scope.year = "";
    $scope.weekday = "";
    $scope.monthName = "";
    $scope.dayWeekDate = "";
    $scope.yearMonthDay = "";
    $scope.birth = "/Content/img/cake.png";
    $scope.tableWidth = "width: 100%";

    // блок кнопки от повторного нажатия
    $scope.backClick = 1;
    $scope.nextClick = 1;
    $scope.tomorrowClick = 1;

    $scope.o_seans_header = [];
    $scope.o_seans = [];
    $scope.data = [];
    $scope.O_SEANS = [];
    $scope.O_SEANS_ANK = [];
    $scope.O_RECORD = {};

    $scope.notValidDate = "";
    $scope.existsSeans = "";

    $scope.record = 0;
    $scope.kont_cnt = 0;
    $scope.kont_regist_cnt = 0;
    $scope.regist = 0;
    $scope.notGo = 0;
    $scope.new = 0;
    $scope.notRecord = 0;
    $scope.notRegist = 0;
    $scope.onPresent = 0;

    // запись на новый сеанс
    $scope.zapisatNaSeansLeft = 0;
    $scope.zapisatNaSeansTop = 0;
    $scope.zapisatNaSeans = 0;
    $scope.zapisatNaSeansHeight = 140;
    $scope.notValidDateHeight = 1;

    // создать анкету и записать на сеанс
    $scope.newAnkNaSeansLeft = 0;
    $scope.newAnkNaSeansTop = 0;
    $scope.newAnkNaSeans = 0;
    $scope.newAnkHeight = 175;
    $scope.existsSeansHeight = 1;

    // таблица подробного просмотра
    $scope.previewInfoShow = 0;
    // таблица, 2 столбца
    $scope.previewFirstTypeInfo = 0;
    // таблица, 5 столбцов
    $scope.previewSecondTypeInfo = 0;
    // таблица, 6 столбцов
    $scope.previewThirdTypeInfo = 0;
    // ПФ Новенькие, 3 столбца
    $scope.previewNewInfo = false;

    // ширина ячеек
    $scope.infoTdWidth1 = 0;
    $scope.infoTdWidth2 = 0;
    $scope.infoTdWidth3 = 0;
    $scope.infoTdWidth4 = 0;
    $scope.infoTdWidth5 = 0;
    $scope.infoTdWidth6 = 0;

    // выбор времени для списка на презентации
    $scope.presentTime = 0;

    // фото из анкеты
    $scope.ankSmallPhoto = "";
    // переменные для div с фото
    $scope.showSmallPhotoLeft = 0;
    $scope.showSmallPhotoTop = 0;
    $scope.showSmallPhoto = 0;
    $scope.showSmallPhotoHeightConst = 84;
    $scope.showSmallPhotoWidthConst = 84;
    $scope.showSmallPhotoHeight = $scope.showSmallPhotoHeightConst;
    $scope.showSmallPhotoWidth = $scope.showSmallPhotoWidthConst;
    $scope.showTableAnkProduct = 0;

    // проверка, что заполнены справочники
    if (!($scope.global.function.checkManualsFull())) {
      $scope.global.selectedMenuItem = "";
      return false;
    }
    

    // кол-во мест
    $scope.placeCount = 0;
    if (typeof $scope.global.manual.M_SEANS_PLACE !== "undefined") {
      $scope.placeCount = $scope.global.manual.M_SEANS_PLACE.length;
    }

    initDateTime(0); // текущая дата + 0, т.е. сегодня
    $scope.getData($scope.yearMonthDay);

  };


  // выбор данных на день
  $scope.getDataClick = function getDataClick(x) {
    // на дату
    if (x === -2) {
      $scope.yearMonthDay = "";
      var curr_day = $scope.date.getDay();
      var exists = 0;

      if (typeof $scope.global.manual.M_WORK_DAY !== "undefined") {
        for (var i = 0; i < $scope.global.manual.M_WORK_DAY.length; i++) {
          var w = $scope.global.manual.M_WORK_DAY[i]["DAY_ID"];
          if (curr_day === w) {
            exists = 1;
          }
        }
      }

      if (exists === 0) {
        $scope.global.showErrorAlert("Выбран выходной день");
        return false;
      }

      var day = $scope.date.getDate();
      var month = $scope.date.getMonth() + 1;
      var year = $scope.date.getFullYear();

      if (day <= 9) day = "0" + day;
      if (month <= 9) month = "0" + month;

      $scope.yearMonthDay = year + "-" + month + "-" + day;
    }

    // на завтра
    if (x === 0) {
      $scope.yearMonthDay = "";
      initDateTime(1);
      $scope.tomorrowClick = 0;
    } else {
      if (x < -1) {
        initDateTime(0);
      } else {
        initDateTime(x);
      }
    }

    if (x < 0) {
      $scope.backClick = 0;
    } else if (x === 1) {
      $scope.nextClick = 0;
    }

    $scope.getData($scope.yearMonthDay);
  }

  // выбор данных на день
  $scope.getData = function getData(date) {
    $scope.o_seans = [];
    $scope.o_seans_header = [];
    $scope.data = [];
    $scope.o_info = [];

    $scope.record = 0;
    $scope.regist = 0;
    $scope.notGo = 0;
    $scope.new = 0;
    $scope.notRecord = 0;
    $scope.notRegist = 0;
    $scope.onPresent = 0;

    // заголовок таблицы
    if (typeof $scope.global.manual.M_SEANS_TIME !== "undefined") {
      for (var i = 0; i < $scope.global.manual.M_SEANS_TIME.length; i++) {
        if (i === 0) $scope.presentTime = $scope.global.manual.M_SEANS_TIME[i]["ID"];

        $scope.o_seans_header.push({
          id: $scope.global.manual.M_SEANS_TIME[i]["ID"],
          time: $scope.global.manual.M_SEANS_TIME[i]["MIN_TIME"],
          DifferentForTommorrow: 0,
          DifferentForYesterday: 0
        });
      }
    }

    // записавшиеся с Анкетой
    $scope.global.showWaitingForm("Получение данных..");
    $http({
      method: "GET",
      url: "/Home/GetRecordData",
      params: { DATE: date },
      data: "JSON"
    }).success(function (data) {
      if (data.length !== 0) {
        $scope.data = data;

        for (var i = 0; i < data.length; i++) {
          // записалось - только те, кто был записан
          if (data[i]["bez_reg"] === 0) {
            if (data[i]["seans_date"] !== "") $scope.record++;

            if (($scope.presentTime === data[i]["m_seans_time_id"]) && (data[i]["seans_state"] === 1)) $scope.onPresent++;

            // пришли (прошли регистрацию)
            if (data[i]["seans_state"] === 1) $scope.regist++;

            // не пришли
            if (data[i]["seans_state"] === 0) $scope.notGo++;

            // новенькие
            if (data[i]["date_reg"] === $scope.yearMonthDay) $scope.new++;

            // ушли и не записались
            if (data[i]["new_seans"] === 0 && data[i]["seans_state"] === 1) $scope.notRecord++;
          }
          // не зарегистрировано
          if (data[i]["bez_reg"] === 1) $scope.notRegist++;
        }

        // кол-во строк для таблицы (максимальное кол-во строк какого-то столбца)
        var n = 0;
        var m = 0;
        for (var i = 0; i < $scope.o_seans_header.length; i++) {
          m = 0;
          for (var j = 0; j < data.length; j++) {
            if (data[j]["m_seans_time_id"] === $scope.o_seans_header[i].id) m++;
          }
          if (n < m) n = m;
        }

        // + 1 строка для записи
        for (var i = 1; i < n + 2; i++) {
          if (i < n + 1) $scope.o_seans.push({ id: i, nRow: i });
          else $scope.o_seans.push({ id: "" });
        }
      } else {
        // нет данных, надо отобразить одну строку для записи
        $scope.o_seans.push({ id: "" });
        $scope.tableWidth = "width: 100%";
      }

      $scope.nextClick = 1;
      $scope.backClick = 1;
      $scope.tomorrowClick = 1;

      $scope.global.hideWaitingForm();

      return new Promise((resolve, reject) => {
        return resolve(1);
      });

    }).then(() => {

      // записавшиеся Контакты
      // если настройка отключена, не загружаем
      var SHOW_KONT = 1;
      if ($scope.global.manual.O_NASTR != null) {
        var a = $scope.global.manual.O_NASTR.find(x => x.SHOW_KONT === 0);
        if (a != null) {
          SHOW_KONT = 0;
          $scope.o_seans_kont = [];
        }
      }

      if (SHOW_KONT == 1) {
        appendKontList();
      }

      $scope.global.showWaitingForm("Получение данных..");

      $http({
        method: "GET",
        url: "/Home/GetReportDay",
        params: {
          M_ORG_ID: $scope.global.userContext.M_ORG_ID,
          dayOfFormation: new Date(date)
        }
      }).then((data) => {

        $scope.report = data.data.Data;
        $scope.DifferentForTommorow = data.data.DifferentForTommorow;
        $scope.DifferentForYesterday = data.data.DifferentForYesterday;

        // заголовок таблицы
        if (typeof $scope.global.manual.M_SEANS_TIME !== "undefined") {
          for (var i = 0; i < $scope.o_seans_header.length; i++) {
            for (var j = 0; j < $scope.report.length; j++) {
              if ($scope.o_seans_header[i]["id"] === $scope.report[j]["Id"]) {
                $scope.o_seans_header[i]["DifferentForYesterday"] = $scope.report[j]["DifferentForYesterday"];
                $scope.o_seans_header[i]["DifferentForTommorrow"] = $scope.report[j]["DifferentForTommorrow"];
              }
            }
          }
        }

        $scope.global.hideWaitingForm();

      }, (err) => {
        $scope.global.showErrorAlert(err.data);
        $scope.global.hideWaitingForm();
      });

    });

  };

  // дата сеанса
  function initDateTime(x) {
    var d = new Date();

    if ($scope.yearMonthDay !== "") {
      d = new Date($scope.yearMonthDay);
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

    var day = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();

    if (day <= 9) day = "0" + day;
    if (month <= 9) month = "0" + month;

    $scope.day = day;
    $scope.month = month;
    $scope.year = year;
    $scope.weekday = days[d.getDay()];
    $scope.monthName = months[d.getMonth()];
    $scope.yearMonthDay = $scope.year + "-" + $scope.month + "-" + $scope.day;
    // день недели, число, месяц текущей даты
    $scope.dayWeekDate = $scope.weekday + " " + d.getDate() + " " + $scope.monthName;
  }

  $scope.getTdData = function getTdData(nRow, nCol, tagName) {
    if (typeof $scope.data === "undefined") return false;
    var result = "";
    var data = $scope.data.find(x => x["nrow"] === nRow && x["ncol"] === nCol && x["bez_reg"] === 0);

    if (typeof data !== "undefined") {

      // если у клиента был зарегистрирован, закрашиваем ячейку в желтый цвет
      if (tagName === "tdColor") {
        if (data["seans_state"] === 1) result = "#fcff68";

      } else if (tagName === "birthClass") {
        if (data["birth"] === 1) result = "record-image";

      } else if (tagName === "birth") {
        // если у клиента день рождения сегодня, показываем тортик
        if (data["birth"] === 1) result = $scope.birth;

      } else if (tagName === "textColor") {
        // если клиент пришел сегодня, цвет текста - зеленый
        // посещений от 2 до 20 - синий
        // от 20 - фиолетовый
        if (data["date_reg"] === $scope.yearMonthDay) result = "#00CC00";
        else if (data["visits"] >= 2 && data["visits"] < 20) result = "#0066FF";
        else if (data["visits"] >= 20) result = "#9900FF";
        else result = "";

      } else if (tagName === "fio") {
        result = data["fio"];
      } else if (tagName === "visits") {
        result = data["visits"];
        // если в ячейке нет фио, не показываем черную кнопку
      } else if (tagName === "btn") {
        if (data["fio"] === "") result = "''"
        else result = "'a'";
      } else if (tagName === "o_ank_id") {
        result = data["o_ank_id"];
      } else if (tagName === "id") {
        result = data["id"];
      } else if (tagName === "state") {
        result = data["seans_state"];
      // те, кто записался на новый сеанс, т.е. завтра, послезавтра и т.д., помечаем звездочкой
      } else if (tagName === "newrec") {
        if (data["new_seans"] !== 0) result = "*";
      } else if (tagName === "vip") {
        result = data["vip"];
      } else if (tagName === "ostalos_dn_abon") {
        result = data["ostalos_dn_abon"];
      } else if (tagName === "data") {
        result = data;
      } else {
        throw "Неизвестное значение tagName = " + tagName;
      }
    }

    return result;
  }

  // записать - нажатие на черный квадратик
  $scope.btnZapisatNaSeansClickHandler = function btnZapisatNaSeansClickHandler(e) {
    // права на запись
    if ($scope.global.function.noHavePravoWrite(6,23)) return false;
    $scope.workDayError = "";

    // если показана форма по пустой ячейке, скрываем
    if ($scope.newAnkNaSeans === 1) {
      $scope.newAnkNaSeans = 0;
    }

    var elem = e.currentTarget;
    $scope.O_SEANS = [];
    var d = new Date();
    d.setDate(d.getDate() + 1);
    // запись всегда завтра и позднее на ближайший рабочий день, пропускаем выходные
    var curr_day = d.getDay();
    var exists = 0;
    var work_count = 0;
    var x = 1;

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

      // если день не найден в календаре, добавляем день, пока не найдем
      if (exists === 0) {
        d.setDate(d.getDate() + 1); // при загрузке движемся вперед, к ближайшему дню
        curr_day = d.getDay();
      }
    }

    // если сеанс состоялся, то при нажатии на квадратик - записываем на будущую дату
    // если человек не пришел - переносим дату
    var o_ank_id = parseInt(elem.attributes[1].value);
    var m_seans_time_id = parseInt(elem.attributes[2].value);
    var id = parseInt(elem.attributes[3].value);

    $scope.O_SEANS.push({
      o_ank_id: o_ank_id,
      m_seans_time_id: m_seans_time_id,
      seans_date: d
    });

    if (typeof $scope.data === "undefined") return false;
    var data = $scope.data.find(x => x["o_ank_id"] === o_ank_id && x["m_seans_time_id"] === m_seans_time_id);
    if (typeof data !== "undefined") {
      if (data["seans_state"] === 1) {
        $scope.O_SEANS[0]["id"] = 0;
        $scope.recordHeader = "Новая запись";
      } 
      if (data["seans_state"] === 0) {
        $scope.O_SEANS[0]["id"] = id;
        $scope.recordHeader = "Перенос записи";
      }
    }

    $scope.zapisatNaSeansLeft = $(elem).offset().left;
    var w = document.body.clientWidth;

    //если выходим за пределы экрана
    if ($scope.zapisatNaSeansLeft > w) {
      $scope.zapisatNaSeansLeft = $scope.zapisatNaSeansLeft - ($scope.zapisatNaSeansLeft - w) - 10;
    }

    $scope.zapisatNaSeansTop = $(elem).offset().top - 80;
    $scope.zapisatNaSeansHeight = 140;
    $scope.notValidDateHeight = 1;
    $scope.zapisatNaSeans = 1;
  };

  // скрываем форму записи
  $scope.btnOtmenitZapis = function btnOtmenitZapis(x) {
    $scope.zapisatNaSeansHeight = 140;
    $scope.notValidDateHeight = 1;
    $scope.notValidDate = "";
    $scope.O_SEANS = [];
    $scope.zapisatNaSeans = x;
  }

  // сохранение записи
  $scope.btnZapisatNaSeans = function btnZapisatNaSeans(x) {
    // права на запись
    if ($scope.global.function.noHavePravoWrite(6,23)) return false;

    var now = new Date();
    var d = new Date($scope.O_SEANS[0].seans_date);

    if (d <= now) {
      $scope.zapisatNaSeansHeight = 160;
      $scope.notValidDateHeight = 20;
      $scope.notValidDate = "На дату запись невозможна";
      return false;
    } else {
      $scope.zapisatNaSeansHeight = 140;
      $scope.notValidDateHeight = 1;
      $scope.notValidDate = "";
    }

    // проверяем день записи, что он является рабочим
    if ($scope.global.function.isWeekEndDay(d)) {
      $scope.zapisatNaSeansHeight = 160;
      $scope.notValidDateHeight = 20;
      $scope.notValidDate = "Выбран выходной день";
      return false;
    } else {
      $scope.zapisatNaSeansHeight = 140;
      $scope.notValidDateHeight = 1;
      $scope.notValidDate = "";
    }

    var a = {
      id: $scope.O_SEANS[0]["id"],
      o_ank_id: $scope.O_SEANS[0]["o_ank_id"],
      m_seans_time_id: $scope.O_SEANS[0]["m_seans_time_id"],
      seans_date: $scope.O_SEANS[0]["seans_date"]
    };

    $scope.global.showWaitingForm("Сохранение данных...");
    $http({
      "method": "POST",
      "url": "/Home/RecordSave",
      data: a
    }).success(function (data) {
      $scope.global.hideWaitingForm();
      if (data["success"] === "true") {
        $scope.notValidDate === "";
        $scope.zapisatNaSeansHeight = 140;
        $scope.notValidDateHeight = 1;
        $scope.zapisatNaSeans = x;
        $scope.O_SEANS = [];
        $scope.getData($scope.yearMonthDay);
      } else if (data["success"] === "exists") {
        $scope.zapisatNaSeansHeight = 160;
        $scope.notValidDateHeight = 20;
        $scope.notValidDate = "Уже есть запись на " + data["time"];
      }
    }).error(function (err) {
      $scope.global.hideWaitingForm();
      $scope.global.showErrorAlert(err);
    });
  }

  // записать - нажатие на пустую ячейку таблицы
  $scope.tdZapisatNaSeansClickHandler = function tdZapisatNaSeansClickHandler(e) {

    // права на запись
    if ($scope.global.function.noHavePravoWrite(6, 23)) return false;
    $scope.workDayError = "";

    // если див уже показан, скрываем и выходим
    if ($scope.newAnkNaSeans === 1) {
      $scope.newAnkNaSeans = 0;
      $scope.newAnkHeight = 175;
      $scope.existsSeansHeight = 1;
      $scope.existsSeans = "";
      return false;
    }

    // если есть черная кнопка, выходим
    var elem = e.currentTarget;
    var m_seans_time_id = parseInt(elem.attributes[2].value);
    var fio = elem.attributes[3].value;
    if (fio.length !== 0) {
      return false;
    }

    // на сегодняшнюю или прошлую дату не записываем
    var now = new Date();
    // уточнение - на будущий сеанс
    var p = $scope.global.manual.M_SEANS_TIME.find(x => x["ID"] === m_seans_time_id);
    if (typeof p !== "undefined") {
      var a = new Date($scope.yearMonthDay + " " + p["MIN_TIME"] + ":00");
      var b = new Date();
      if (a <= b) {
        $scope.newAnkNaSeans = 0;
        return false;
      }
    }

    // если показана форма по черной кнопке, скрываем
    if ($scope.zapisatNaSeans === 1) {
      $scope.zapisatNaSeans = 0;
    }

    $scope.O_SEANS = [];
    $scope.O_SEANS.push({
      m_seans_time_id: m_seans_time_id,
      seans_date: new Date($scope.yearMonthDay)
    });

    $scope.O_SEANS_ANK = [];
    $scope.O_SEANS_ANK.push({
      fio_reg: ""
    });

    $scope.newAnkNaSeansLeft = $(elem).offset().left;
    var w = document.body.clientWidth;

    //если выходим за пределы экрана
    if ($scope.newAnkNaSeansLeft > w) {
      $scope.newAnkNaSeansLeft = $scope.newAnkNaSeansLeft - ($scope.newAnkNaSeansLeft - w) - 10;
    }

    $scope.newAnkNaSeansTop = $(elem).offset().top + elem.offsetHeight - 80;
    $scope.newAnkNaSeans = 1;
    $scope.existsSeansHeight = 1;
    $scope.newAnkHeight = 175;

    $scope.newAnkErrorHeight = 0;
    $scope.newAnkError = "";

    // фокус в поле Фамилия
    window.setTimeout(function () { $("#newRecSurname").focus(); });
  }

  // скрываем форму записи на пустой строке таблицы
  $scope.btnNewdAnk = function btnNewdAnk() {
    var surname = $scope.O_SEANS_ANK[0].surname;
    var name = $scope.O_SEANS_ANK[0].name;
    var secname = $scope.O_SEANS_ANK[0].secname;
    var phone_mobile = $scope.O_SEANS_ANK[0].phone_mobile;

    $scope.newAnkNaSeans = 0;
    $scope.O_SEANS = [];
    $scope.O_SEANS_ANK = [];

    $scope.newAnkErrorHeight = 0;
    $scope.newAnkError = "";

    $scope.global.createAnk({ SURNAME: surname, NAME: name, SECNAME: secname, PHONE_MOBILE: phone_mobile });
  }

  $scope.btnSozdatAnk = function btnSozdatAnk() {
    
    var phone = $scope.O_SEANS_ANK[0].phone_mobile;
    var surname = $scope.O_SEANS_ANK[0].surname;
    var name = $scope.O_SEANS_ANK[0].name;
    var secname = $scope.O_SEANS_ANK[0].secname;

    if (typeof phone === "undefined") {
      $scope.newAnkHeight = 195;
      $scope.newAnkErrorHeight = 20;
      $scope.newAnkError = "Не указан телефон";
      return false;
    } else {
      $scope.newAnkHeight = 175;
      $scope.newAnkErrorHeight = 1;
      $scope.newAnkError = "";
    }

    $scope.O_RECORD.O_ANK = {
      SURNAME: surname,
      NAME: name,
      SECNAME: secname,
      PHONE_MOBILE: phone
    };

    $scope.O_RECORD.O_SEANS = {
      M_SEANS_TIME_ID: $scope.O_SEANS[0].m_seans_time_id,
      SEANS_DATE: $scope.O_SEANS[0].seans_date
    };

    $scope.global.showWaitingForm("Сохранение данных...");
    $http({
      "method": "POST",
      "url": "/Home/NewAnkAndSignUpSeans",
      data: $scope.O_RECORD
    }).success(function (data) {
      $scope.global.hideWaitingForm();
      if (data["success"] === "true") {
        $scope.existsSeans === "";
        $scope.newAnkError = "";
        $scope.newAnkHeight = 175;
        $scope.existsSeansHeight = 1;
        $scope.newAnkErrorHeight = 1;
        $scope.newAnkNaSeans = 0;
        $scope.O_SEANS = [];
        $scope.O_SEANS_ANK = [];
        $scope.getData($scope.yearMonthDay);
      } else if (data["success"] === "exists") {
        $scope.global.hideWaitingForm();
        $scope.newAnkHeight = 195;
        $scope.existsSeansHeight = 20;
        $scope.existsSeans = "Уже есть запись на " + data["time"];
        $scope.newAnkNaSeans = 1;
      } else if (data["success"] === "fio") {
        $scope.global.hideWaitingForm();
        $scope.newAnkHeight = 195;
        $scope.newAnkErrorHeight = 20;
        $scope.newAnkError = "Для создания анкеты укажите ФИО";
        $scope.newAnkNaSeans = 1;
      }  else if (data["success"] === "dubli") {
        $scope.global.hideWaitingForm();
        $scope.newAnkHeight = 195;
        $scope.newAnkErrorHeight = 20;
        $scope.newAnkError = "Телефон указан в анкетах " + data["time"];
        $scope.newAnkNaSeans = 1;
      }
    }).error(function (err) {
      $scope.global.showErrorAlert(err);
      $scope.global.hideWaitingForm();
    });
  }

  $scope.previewInfo = function previewInfo(x) {
    if (typeof $scope.data === "undefined") return false;
    if ($scope.data.length !== 0) {
      $scope.o_info = [];
      var data = $scope.data;
      var border = "1px black solid";
      var display = "none";

      if ($scope.o_info.length === 0) {
        $scope.o_info.push({ info1: "ФИО", info2: "Телефон" });
      }

      // новенькие #382
      if (x === 4) {
        $scope.previewNewInfo = true;
        $scope.o_info[0]["info3"] = "Источник информации";
      }

      for (var i = 0; i < data.length; i++) {

        if (x < 5) {
          $scope.infoTdWidth1 = 616;
          $scope.infoTdWidth2 = 389;
          $scope.infoTdWidth3 = 389;

          $scope.previewFirstTypeInfo = 1;
          $scope.previewSecondTypeInfo = 0;
          $scope.previewThirdTypeInfo = 0;

          if (data[i]["bez_reg"] === 0) {
            // записалось
            // только записавшиеся
            if (data[i]["seans_date"] !== "") {
              if (x === 1) {
                $scope.o_info.push({ info1: data[i]["fio_full"], info2: data[i]["phone"] });
              }
            }

            // пришли (прошли регистрацию)
            if (x === 2) {
              if (data[i]["seans_state"] === 1) {
                $scope.o_info.push({ info1: data[i]["fio_full"], info2: data[i]["phone"] });
              }
            }

            // не пришли
            if (x === 3) {
              if (data[i]["seans_state"] === 0) {
                $scope.o_info.push({ info1: data[i]["fio_full"], info2: data[i]["phone"] });
              }
            }

            // новенькие #382
            if (x === 4) {
              $scope.previewNewInfo = true;
              if (data[i]["date_reg"] === $scope.yearMonthDay) {
                $scope.o_info.push({ info1: data[i]["fio_full"], info2: data[i]["phone"], info3: data[i]["ist_info"] });
              }
            }
          }
        }

        // ушли и не записались
        if (x === 5) {
          $scope.previewFirstTypeInfo = 0;
          $scope.previewSecondTypeInfo = 0;
          $scope.previewThirdTypeInfo = 1;

          $scope.infoTdWidth1 = 320;
          $scope.infoTdWidth2 = 200;
          $scope.infoTdWidth3 = 138;
          $scope.infoTdWidth4 = 172;
          $scope.infoTdWidth5 = 229;
          $scope.infoTdWidth6 = 213;

          if ($scope.o_info.length === 0) {
            $scope.o_info.push({
              info1: "ФИО", info2: "Телефон", info3: "Время регистрации", info4: "Время на рядах",
              info5: "Кто общался на первом ряду", info6: "Кто общался на втором ряду"
            });
          }

          if (data[i]["new_seans"] === 0 && data[i]["seans_state"] === 1) {
            $scope.o_info.push({
              info1: data[i]["fio_full"], info2: data[i]["phone"], info3: data[i]["reg_time"],
              info4: data[i]["lane_time"], info5: data[i]["user_ryad_1"], info6: data[i]["user_ryad_2"]
            });
          }
        }

        // не зарегистрировано
        if (x === 6) {
          $scope.previewFirstTypeInfo = 0;
          $scope.previewSecondTypeInfo = 1;
          $scope.previewThirdTypeInfo = 0;

          $scope.infoTdWidth1 = 292;
          $scope.infoTdWidth2 = 182;
          $scope.infoTdWidth3 = 313;
          $scope.infoTdWidth4 = 237;
          $scope.infoTdWidth5 = 256;

          if ($scope.o_info.length === 0) {
            $scope.o_info.push({
              info1: "ФИО", info2: "Телефон", info3: "Регистрация", info4: "1 ряд", info5: "2 ряд"
            });
          }

          if (data[i]["bez_reg"] === 1) {
            $scope.o_info.push({
              info1: data[i]["fio_full"], info2: data[i]["phone"], info3: data[i]["bez_reg_user"],
              info4: data[i]["user_ryad_1"], info5: data[i]["user_ryad_2"]
            });
          }
        }

        if (x === 7) {
          $scope.previewFirstTypeInfo = 0;
          $scope.previewSecondTypeInfo = 0;
          $scope.previewThirdTypeInfo = 1;

          $scope.infoTdWidth1 = 317;
          $scope.infoTdWidth2 = 198;
          $scope.infoTdWidth3 = 137;
          $scope.infoTdWidth4 = 171;
          $scope.infoTdWidth5 = 226;
          $scope.infoTdWidth5 = 231;

          if ($scope.o_info.length === 0) {
            $scope.o_info.push({
              info1: "ФИО", info2: "Телефон", info3: "Кол-во посещений", info4: "Что купил",
              info5: "Заболевания", info6: "Улучшения"
            });
          }

          // зарегистрированные
          if ($scope.presentTime === data[i]["m_seans_time_id"]) {
            $scope.o_info.push({
              info1: data[i]["fio_full"], info2: data[i]["phone"], info3: data[i]["visits"],
              info4: "Нет данных", info5: data[i]["zabol"], info6: "Нет данных"
            });
          }
        }

        $scope.previewInfoShow = 1;
      }
    }
  }

  $scope.goBack = function goBack() {
    $scope.previewInfoShow = 0;
    $scope.previewFirstTypeInfo = 0;
    $scope.previewSecondTypeInfo = 0;
    $scope.previewThirdTypeInfo = 0;
  }

  // не удалять, пример
  //$scope.getHtml = function (html) {
  //  return $sce.trustAsHtml(html);
  //}

  // маска телефона
  $("#recordPhoneMobile").mask("+7(999) 999-99-99");
  $("#record .kont-edit .phone-mobile").mask("+7(999) 999-99-99");

  $scope.btnUdalitSeansClickHandler = function (nRow, nCol) {
    $scope.global.function.showYesNoDialog("Вы уверены, что хотите удалить запись?", () => {
      var data = $scope.data.find(x => x["nrow"] === nRow && x["ncol"] === nCol);
      if (typeof data !== "undefined") {
        var seans_id = data["id"];

        $http({
          method: "POST",
          url: "/Home/RemoveSeans",
          params: {
            ID: seans_id
          }
        }).then(function (data) {
          $scope.getData($scope.yearMonthDay);
        }).catch((err) => {
          $scope.global.showErrorAlert("Ошибка: " + JSON.stringify(err.data));
        });
      }
    });
  }

  $scope.changePresent = function () {
    var data = $scope.data;
    $scope.onPresent = 0;
    for (var i = 0; i < data.length; i++) {
      // записалось - только те, кто был записан
      if ((data[i]["bez_reg"] === 0) && (data[i]["seans_state"] === 1)) {
        if ($scope.presentTime === data[i]["m_seans_time_id"]) {
          $scope.onPresent++;
        }
      }
    }
  }

  // перейти в режим Звонки
  $scope.openDialogRej = function openDialogRej(e) {
    var elem = e.currentTarget;
    var o_ank_id = parseInt(elem.attributes[1].value);
    var o_seand_id = parseInt(elem.attributes[2].value);
    var seans_state = 0;

    var data = $scope.data.find(x => x["id"] === o_seand_id);
    if (typeof data !== "undefined") {
      seans_state = data["seans_state"];
      if (seans_state === 0) {
        $scope.global.zvonok.o_seans_id = o_seand_id;
      }
    }

    $scope.global.openAnk(o_ank_id);
    $scope.global.openAnkDone = () => {
      $timeout(() => {
        $scope.global.selectedMenuItem = "menuItemNew";
        $scope.global.selectedSubMenuItem = 6;
      }, 10);
    };
  };

  // при наведении на ФИО отображаем фото из анкеты
  $scope.showSmallAnkPhoto = function showSmallAnkPhoto(e) {
    var elem = e.currentTarget;
    var o_ank_id = parseInt(elem.attributes[1].value);
    var o_seand_id = parseInt(elem.attributes[2].value);

    $scope.showSmallPhotoLeft = $(elem).offset().left;
    var w = document.body.clientWidth;

    //если выходим за пределы экрана
    if ($scope.showSmallPhotoLeft > w) {
      $scope.showSmallPhotoLeft = $scope.showSmallPhotoLeft - ($scope.showSmallPhotoLeft - w) - 10;
    }

    $scope.showSmallPhotoTop = $(elem).offset().top + elem.offsetHeight - 80;
    $scope.ankSmallPhoto = "/Home/GetAnkPhoto/" + o_ank_id;

    $scope.recordAnkProduct = [];

    $http({
      "method": "GET",
      "url": "/Home/GetRecordProductList",
      params: {
        O_ANK_ID: o_ank_id
      }
    }).then(function getRecordProductListSuccess(data) {

      $scope.recordAnkProduct = data.data;
      $scope.showSmallPhotoWidth = $scope.showSmallPhotoWidthConst;
      $scope.showSmallPhotoHeight = $scope.showSmallPhotoHeightConst;

      if ($scope.recordAnkProduct.length !== 0) {
        $scope.showTableAnkProduct = 1;
        $scope.showSmallPhotoWidth += 166;
        $scope.showSmallPhotoHeight += ($scope.recordAnkProduct.length * 23) + 23 + 6;
      } else {
        $scope.showTableAnkProduct = 0;
      }

      $scope.showSmallPhoto = 1;

    }, function getRecordProductListFailed(err) {

      $scope.showSmallPhoto = 1;

    });
  }

  // при отводе курсора прячем фото
  $scope.hideSmallAnkPhoto = function hideSmallAnkPhoto() {
    $scope.showSmallPhoto = 0;
  };


  // ко списку записавшихся анкет добавить список
  // записавшихся контактов на выбранную дату
  function appendKontList() {

    // максимальный номер строки, который занимает запись анкет
    $scope.maxRecordAnkId = $scope.o_seans.reduce((p, c) => p > c.id ? p : c.id, 0);
    if ($scope.maxRecordAnkId === "") {
      $scope.maxRecordAnkId = 0;
    }

    // получаю записанные на дату контакты
    var d = new Date($scope.yearMonthDay);
    //
    scopeKontCtrl.getKontacksByDay(d, true).then((data) => {

      $scope.o_seans_kont = data.data;

      // графа с количеством контактов
      $scope.kont_cnt = 0;
      if (data.data != null) {
        for (var i = 0; i < $scope.o_seans_kont.length; i++) {
          var elem = $scope.o_seans_kont[i];
          for (var j = 0; j < elem.length; j++) {
            if (elem[j]["KontId"] != 0) {
              $scope.kont_cnt++;
            }
          }
        }

        // в графу Записалось должны попадать и записанные контакты
        $scope.record = $scope.record + $scope.kont_cnt;

      } else {
        $scope.kont_cnt = 0;
      }
      //
      // туда ещё попадают записи, которые были созданы после того, как контакт стал
      // обычной анкетой, считается, что контакт в таком случае пришёл на сеанс
      var i = 0;
      $scope.data.forEach((x) => {
        if (x.is_first_kont_seans === 1) {
          i = i + 1;
        }
      });
      //
      $scope.kont_cnt = $scope.kont_cnt + i;

      // количество зарегистрированных "пришедших" контактов
      $scope.kont_regist_cnt = i;


    });

  };


  // найти в строке записанных контактов такой,
  // который записался на определённое время
  $scope.getSeansKont = (o_seans_kont_row, m_seans_time_id) => {

    // ищу записавшегося на это время
    var o_seans_kont_item = o_seans_kont_row.find((x) => x.SeansTimeID === m_seans_time_id);

    // Иванов А.А.
    var fio;
    // Иванов Александр Анатольевич
    var fullname;
    // +7(927) 268-92-25
    var phone;
    // O_KONT_ANK.ID
    var id;

    // нет записавшегося на это время
    if (o_seans_kont_item.KontId === 0) {

      fio = "";
      fullname = "";
      phone = "";
      id = null;

    // есть записавшийся на это время
    } else {
      
      phone = o_seans_kont_item.Phone || "";
      id = o_seans_kont_item.KontId;
      var name = o_seans_kont_item.NAME || "";
      var secname = o_seans_kont_item.SECNAME || "";
      var surname = (o_seans_kont_item.SURNAME || "").trim();
      // у него есть фамилия
      if (surname.length > 0) {

        fio = surname + " ";
        if (name.length > 0) {
          fio = fio + name.substr(0, 1) + ".";
        }
        if (secname.length > 0) {
          fio = fio + secname.substr(0, 1) + ".";
        }
        fullname = surname + " " + name + " " + secname;

      // у него нет фамилии
      } else {

        fio = name + " " + secname;
        fullname = fio;

      }

    }

    return { id: id, fio: fio, fullname: fullname, phone: phone };

  };



  // запись нового контакта
  $scope.btnNewKontClick = () => {

    $scope.global.showWaitingForm("Запись..");

    $http({
      "method": "POST",
      "url": "/Home/CreateNewKont",
      params: {
        surname: $scope.O_SEANS_ANK[0].surname,
        name: $scope.O_SEANS_ANK[0].name,
        secname: $scope.O_SEANS_ANK[0].secname,
        phone: $scope.O_SEANS_ANK[0].phone_mobile,
        time_id: $scope.O_SEANS[0].m_seans_time_id,
        date: new Date($scope.yearMonthDay),
        commentForSave: null,
        M_KONT_STATUS_ID: $scope.global.const.M_KONT_STATUS_ID_VIBERITE_STATUS,
        M_KONT_IST_ID: $scope.global.const.M_KONT_IST_ID_VIBERITE_STATUS,
        SOZD_NEPR: 0
      }
    }).then((data) => {

      if (data.data.success === "true") {

        // скрываю форму ввода контакта
        $scope.newAnkNaSeans = 0;

        // обновляю данные таблицы записей
        $scope.getData($scope.yearMonthDay);

      } else if (data.data.success === "exists") {

        $scope.newAnkHeight = 195;
        $scope.newAnkErrorHeight = 20;
        $scope.newAnkError = "Номер уже существует, " + data.data.dateExist;

      } else if (data.data.success === "exists ank") {

        $scope.newAnkHeight = 195;
        $scope.newAnkErrorHeight = 20;
        $scope.newAnkError = "Тел. уже есть в Анкете";

      }

      $scope.global.hideWaitingForm();


    });

  };


  // показать окно редактирования контакта
  $scope.showKontEdit = (o_seans_kont_row, m_seans_time_id) => {

    // ищу записавшегося на это время
    var o_seans_kont_item = o_seans_kont_row.find((x) => x.SeansTimeID === m_seans_time_id);

    $scope.kont = {};
    $scope.kont.show = true;
    $scope.kont.currentMode = "edit";
    $scope.kont.SURNAME = o_seans_kont_item.SURNAME;
    $scope.kont.NAME = o_seans_kont_item.NAME;
    $scope.kont.SECNAME = o_seans_kont_item.SECNAME;
    $scope.kont.PHONE = o_seans_kont_item.Phone;
    $scope.kont.COMMENT = "";
    $scope.kont.ID = o_seans_kont_item.KontId;
    $scope.kont.M_KONT_STATUS_ID = o_seans_kont_item.M_KONT_STATUS_ID;
    $scope.kont.M_KONT_IST_ID = o_seans_kont_item.M_KONT_IST_ID;
    $scope.kont.O_KONT_SEANS_COMMENTList = o_seans_kont_item.O_KONT_SEANS_COMMENTList;
    $scope.kont.yearMonthDay = $scope.yearMonthDay;

  };


  // закрыть окно редактирования контакта
  $scope.kontEditClose = () => {

    $scope.kont = {};
    $scope.kont.show = false;

    $scope.kontSeans = {};
    $scope.kontSeans.show = false;

  };


  // сохранить изменённые данные контакта
  $scope.kontEditSave = () => {
    scopeKontCtrl.doKontEditSave($scope);
  };


    
  // показать окно редактирования времени сеанса контакта
  $scope.kontEditSeansShow = (o_seans_kont_row, m_seans_time_id) => {

    // права на запись
    if ($scope.global.function.noHavePravoWrite(7, 24)) {
      $scope.global.showErrorAlert("Недостаточно прав");
      return false;
    }

    // ищу записавшегося на это время
    var o_seans_kont_item = o_seans_kont_row.find((x) => x.SeansTimeID === m_seans_time_id);

    $scope.kontSeans.ID = o_seans_kont_item.KontSeansID;
    // сохраняем все параметры, т.к. предполагается редактирование записи
    $scope.kontSeans.M_SEANS_TIME_ID = o_seans_kont_item.SeansTimeID;
    $scope.kontSeans.COMMENT = "";
    $scope.kontSeans.SEANS_DATE = new Date($scope.yearMonthDay);
    $scope.kontSeans.O_KONT_SEANS_COMMENTList = o_seans_kont_item.O_KONT_SEANS_COMMENTList;

    // делаем видимым окошко
    $scope.kontSeans.show = true;
    
  };


  // отмена редактирования сеанса контакта
  $scope.kontEditSeansCancel = () => {
    $scope.kontSeans = {};
    $scope.kontSeans.show = false;
  };

  // сохранение отредактированного сеанса контакта
  $scope.kontEditSeansSave = () => {
    scopeKontCtrl.doKontEditSeansSave($scope);
  };


  // скрыть контакт из Записи
  $scope.kontEditRemoveSeans = (o_seans_kont_row, m_seans_time_id) => {

    // права на запись
    if ($scope.global.function.noHavePravoWrite(7, 41)) {
      $scope.global.showErrorAlert("Недостаточно прав");
      return false;
    }

    
    $scope.global.function.showYesNoDialog("Вы уверены, что хотите скрыть Контакт?", function skrIzRecod() { 

      // ищу записавшегося на это время
      var o_seans_kont_item = o_seans_kont_row.find((x) => x.SeansTimeID === m_seans_time_id);

      // скрыть контакт нужно только из общего режима Запись,
      // в режиме Контакты -> Запись всё должно остаться, как было
      $scope.global.showWaitingForm("Скрытие контакта..");
      $http({
        method: "POST",
        url: "/Home/RemoveKontFromRecord",
        data: { O_KONT_ANK_ID: o_seans_kont_item.KontId }
      }).then((data) => {

        $scope.global.hideWaitingForm();
        // обновляю данные таблицы записей
        $scope.getData($scope.yearMonthDay);

      });

    });

  };


});
