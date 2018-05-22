"use strict";

// контроллер
recordCtrl = myApp.controller("recordCtrl", function recordCtrl($scope, $http, $timeout) { //$sce) {

  // событие при открытии вкладки
  $scope.$on("global.selectedMenuItemChanged", function selectedMenuItemChanged(event, newValue, oldValue) {
    if (newValue === "menuItemZapis") {
      // загрузка режима
      $scope.refreshRecord();
    }
  });


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

    // ширина ячеек
    $scope.infoTdWidth1 = 0;
    $scope.infoTdWidth2 = 0;
    $scope.infoTdWidth3 = 0;
    $scope.infoTdWidth4 = 0;
    $scope.infoTdWidth5 = 0;
    $scope.infoTdWidth6 = 0;

    // выбор времени для списка на презентации
    $scope.presentTime = 0;

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
    getData($scope.yearMonthDay);

  };


  // выбор данных на день
  $scope.getDataClick = function getDataClick(x) {
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
    getData($scope.yearMonthDay);
  }

  // выбор данных на день
  function getData(date) {
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
          time: $scope.global.manual.M_SEANS_TIME[i]["MIN_TIME"]
        });
      }
    }

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
    }).error(function (err) {
      $scope.global.showErrorAlert(err);
      $scope.global.hideWaitingForm();
    });
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
      }
    }

    return result;
  }

  // записать - нажатие на черный квадратик
  $scope.btnZapisatNaSeansClickHandler = function btnZapisatNaSeansClickHandler(e) {
    // права на запись
    if ($scope.global.recordPravoWrite === 0) return false;
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
    if ($scope.global.recordPravoWrite === 0) return false;

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
        getData($scope.yearMonthDay);
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
    if ($scope.global.recordPravoWrite === 0) return false;
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
    $scope.newAnkNaSeansTop = $(elem).offset().top + elem.offsetHeight - 80;
    $scope.newAnkNaSeans = 1;
    $scope.existsSeansHeight = 1;
    $scope.newAnkHeight = 175;

    $scope.newAnkErrorHeight = 0;
    $scope.newAnkError = "";
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
        getData($scope.yearMonthDay);
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
      for (var i = 0; i < data.length; i++) {

        if (x < 5) {
          $scope.infoTdWidth1 = 616;
          $scope.infoTdWidth2 = 389;
          $scope.previewFirstTypeInfo = 1;
          $scope.previewSecondTypeInfo = 0;
          $scope.previewThirdTypeInfo = 0;

          if ($scope.o_info.length === 0) $scope.o_info.push({ info1: "ФИО", info2: "Телефон" });
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

            // новенькие
            if (x === 4) {
              if (data[i]["date_reg"] === $scope.yearMonthDay) {
                $scope.o_info.push({ info1: data[i]["fio_full"], info2: data[i]["phone"] });
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
          getData($scope.yearMonthDay);
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
});

//myApp.filter('html', function ($sce) {
//  return function (val) {
//    return $sce.trustAsHtml(val);
//  };
//});